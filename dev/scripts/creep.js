
var CreepHandler = {
  creeps: []
};

var Creep = function(data){
  Object.assign(this, {
    id: Utils.randomId('Creep'),
    energy: 50,
    fitness: 0,
    lived: 0,
    foodAngle: 0,
    foodDist: 0,
    timesBetweenFood: [],
    avgTimeBetweenFood: 999,
    timeSinceLastFood: 0,
    brain : {},
    traits: {
      color: Math.random()
    }
  });

  if (!data.brain) {
    this.brain = new Brain();
    this.brain.populate(Layers);
  } else {
    this.brain = data.brain;
  }

  this.object = Game.add.image(data.x,data.y, Utils.createBlock(20, 20,'white'));
  this.object.anchor.setTo(0.5);
  this.object.inputEnabled = true;
  this.object.speed = 0;
  this.object.angle = 0;
  var creep = this;
  this.object.events.onInputDown.add(function() {
    initCreepUI(creep);
    creepSelected = creep;
  });
};

CreepHandler.init = function(data) {
  this.minimumCreeps = data.minimumCreeps;
};

CreepHandler.update = function() {
  for (var i = 0; i < this.creeps.length; i++) {
    this.creeps[i].update();
  }

  //Spawn creeps if too few
  if (this.creeps.length < this.minimumCreeps) {
    var missingCreeps = this.minimumCreeps - this.creeps.length;
    for (var e = 0; e < missingCreeps; e++) {
      this.createCreep(Utils.randomSpawn(100,100,2800,2800));
    }
  }
};

CreepHandler.createCreep = function(data) {
  var creep = new Creep(data);
  this.creeps.push(creep);
  return creep;
};

CreepHandler.removeCreep = function(creep) {
  this.creeps.splice(this.creeps.indexOf(creep),1);
};

CreepHandler.findCreep = function(id) {
  for (var i = 0; i < this.creeps.length; i++) {
    if (this.creeps[i].id === id) {
      return this.creeps[i];
    }
  }
  return false;
};

Creep.prototype.kill = function() {
  this.object.destroy();
  this.object.events.destroy();
  CreepHandler.removeCreep(this);
};

Creep.prototype.update = function() {
  this.lived+=1*delta;
  this.energy -= 0.03*delta;
  this.timeSinceLastFood+=0.1*delta;
  this.object.scale.setTo(this.energy/100, this.energy/100);

  if (this.energy <= 0) {
    this.kill();
  }
  if (this.object.speed) {
    var moveVector = Utils.lengthDir(this.object.speed*delta, Utils.angle360(this.object.angle) * Math.PI / 180);
    this.object.x += moveVector.x;
    this.object.y += moveVector.y;
  }

  this.findFood();
  this.giveBirth();

  if (creepSelected && this.id === creepSelected.id) {
    updateCreepUI(this);
  }

  if (controlSelected && creepSelected && this.id === creepSelected.id) {
    //Control creep
    this.control();
  } else {
    //Creep controls itself
    var speedOutput = this.brain.findOutput('speed').value;
    this.object.speed = (speedOutput*2.5)*delta;
    this.energy -= this.object.speed/15;
    var angleOutput = this.brain.findOutput('angle').value;
    var relativeChange = angleOutput < 0.5 ? -1 : 1;
    this.object.angle += (relativeChange * angleOutput*6)*delta;
    this.object.tint = this.traits.color * 0xffffff;

    if (this.lived % (15/delta) === 0) {
      this.think();
    }
  }

};

Creep.prototype.think = function () {
  this.brain.findInput('speed').setValue(this.object.speed/delta);
  this.brain.findInput('energy').setValue(this.energy);
  this.brain.findInput('foodAngle').setValue(this.foodAngle);
  this.brain.findInput('foodDist').setValue(this.foodDist);
  this.brain.think();
};

Creep.prototype.giveBirth = function() {
  var creep = this;
  if (creep.lived % (15/delta) === 0) {
    for(var c=0;c<CreepHandler.creeps.length;c++){
      if (creep !== CreepHandler.creeps[c]) {
        if (creep.object.alive && CreepHandler.creeps[c].object.alive && creep.energy > 190) {
          var distToCreep = Utils.pointDistance(creep.object.position, CreepHandler.creeps[c].object.position);
          if (distToCreep < 30) {
            creep.energy-=100;
            Game.add.tween(creep.object.scale).to({ x: creep.energy/100, y: creep.energy/100}, 1000).start();
            var newBrain = new Brain();
            newBrain.crossGenes(creep.brain, CreepHandler.creeps[c].brain);
            var newCreep = CreepHandler.createCreep({
              x:creep.object.x,
              y:creep.object.y,
              brain: newBrain
            });
            //find between color
            newCreep.traits.color = (creep.traits.color+CreepHandler.creeps[c].traits.color)/2;
            newCreep.energy = 100;
          }

        }
      }
    }
  }
};

Creep.prototype.findFood = function() {
  var creep = this;
  var distToClosestFood = 999,
      closestFood,
      foodAngle = 0;

  if (creep.lived % (15/delta) === 0) {
    for(var x=0;x<FoodHandler.food.length;x++){
      var food = FoodHandler.food[x];
      if (food.object.alive && creep.object.alive) {

        var foodDist = Utils.pointDistance(creep.object.position, food.object.position);
        if (foodDist < distToClosestFood) {
          distToClosestFood = foodDist;
          closestFood = food;
        }

        if (foodDist < 30) {
          creep.eat(food);
          food.kill(food.id);
        }
      }
    }
  }

  if (closestFood) {
    creep.foodDist = distToClosestFood;

    //calculate relative angle difference between creep and food
    var cAngle = Utils.angle360(creep.object.angle);
    var fAngle = Utils.angle360(Utils.pointDirection(creep.object.position, closestFood.object.position));

    var angleDiff = (cAngle - fAngle + 360) % 360;
    if (angleDiff > 180) {angleDiff = -360 + angleDiff;}
    angleDiff = Math.round(angleDiff);

    creep.foodAngle = angleDiff;
  }
};


Creep.prototype.eat = function() {
  var creep = this;
  if (creep.energy+50 < 250) {
    creep.energy += 50;
    Game.add.tween(creep.object.scale).to({ x: creep.energy/100, y: creep.energy/100}, 1000).start();
  } 

  creep.timesBetweenFood.push(creep.timeSinceLastFood);
  creep.timeSinceLastFood = 0;
  if (creep.timesBetweenFood.length > 10) {
    if (!creep.sustainable) {
      creep.sustainable = true;
    }
    creep.avgTimeBetweenFood = 0;
    creep.timesBetweenFood.slice(0,1);
    for (var f = 0; f < creep.timesBetweenFood.length; f++) {
      creep.avgTimeBetweenFood+=creep.timesBetweenFood[f];
    }
    creep.avgTimeBetweenFood= Math.round(creep.avgTimeBetweenFood/creep.timesBetweenFood.length);
  }
};


Creep.prototype.control = function() {
  creepSelected.energy = 50;
  if(upKey.isDown && creepSelected.object.speed < 3) {
    creepSelected.object.speed += 0.1;
  } else if(creepSelected.object.speed > 0.05) {
    creepSelected.object.speed -= 0.05;
  }

  if(rightKey.isDown) {
    creepSelected.angle.angle += 3;
  }
   if(leftKey.isDown) {
    creepSelected.angle.angle -= 3;
  } 
};