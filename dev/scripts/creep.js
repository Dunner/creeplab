
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
    },
    textStyle: { font: '32px Arial', fill: 'white', align: 'center' }
  });

  if (!data.brain) {
    this.brain = new Brain();
    this.brain.populate(Layers);
  } else {
    this.brain = data.brain;
  }

  this.text = Game.add.text(0, 0, '1', this.textStyle);
  this.text.anchor.set(0.5, 0);

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
  this.text.destroy();
  this.object.events.destroy();
  CreepHandler.removeCreep(this);
};

Creep.prototype.update = function() {
  //TODO
  var creep = this;

  creep.object.scale.setTo(creep.energy/100, creep.energy/100);

  creep.timeSinceLastFood+=0.1;
  creep.lived++;

  creep.object.speed = Math.round(creep.object.speed * 100) / 100;
  creep.object.angle = Math.round(creep.object.angle * 100) / 100;

  creep.text.position = creep.object.position;
  creep.text.alpha = 0;

  if (creep.object.speed) {
    var moveVector = Utils.lengthDir(creep.object.speed, Utils.angle360(creep.object.angle) * Math.PI / 180);
    creep.object.x += moveVector.x;
    creep.object.y += moveVector.y;
  }
  creep.energy -= 0.01;
  if (creep.energy <= 0) {
    this.kill();
  }

  if (creep.lived % 15 === 0) {
    for(var c=0;c<CreepHandler.creeps.length;c++){
      if (creep !== CreepHandler.creeps[c]) {
        if (creep.object.alive && CreepHandler.creeps[c].object.alive && creep.energy > 190) {
          var distToCreep = Utils.pointDistance(creep.object.position, CreepHandler.creeps[c].object.position);
          if (distToCreep < 20) {
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

  var distToClosestFood = 999,
      closestFood,
      foodAngle = 0;
  if (creep.lived % 15 === 0) {
    for(var x=0;x<FoodHandler.food.length;x++){
      var food = FoodHandler.food[x];
      if (food.object.alive && creep.object.alive) {

        var foodDist = Utils.pointDistance(creep.object.position, food.object.position);
        if (foodDist < distToClosestFood) {
          distToClosestFood = foodDist;
          closestFood = food;
        }

        if (foodDist < 20) {
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
    creep.text.setText(angleDiff);
  }

  if (creep.lived % 15 === 0) {
    brainGo(creep);
  }
  
  if (creepSelected && creep.id === creepSelected.id) {
    updateCreepUI(creep);
  }

  if (controlSelected && creepSelected && creep.id === creepSelected.id) {
    //Control creep
    creep.control();
  } else {
    //Creep controls itself
    var speedOutput = creep.brain.findOutput('speed').value;
    creep.object.speed = speedOutput*2.5;
    creep.energy -= creep.object.speed/10;
    var angleOutput = creep.brain.findOutput('angle').value;
    var relativeChange = angleOutput < 0.5 ? -1 : 1;
    creep.object.angle += relativeChange * angleOutput*6;
    
    creep.object.tint = creep.traits.color * 0xffffff;
  }

};

function brainGo(creep) {
  creep.brain.findInput('speed').setValue(creep.object.speed);
  creep.brain.findInput('energy').setValue(creep.energy);
  creep.brain.findInput('foodAngle').setValue(creep.foodAngle);
  creep.brain.findInput('foodDist').setValue(creep.foodDist);
  creep.brain.think();
}



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