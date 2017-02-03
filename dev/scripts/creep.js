
var Creep = {};

Creep.create = function(data) {
  var collisionBounds = game.add.sprite(data.x,data.y, Utils.createBlock(40, 40,'black'));
  collisionBounds.anchor.setTo(0.5);
  var newCreep = game.add.sprite(data.x,data.y, Utils.createBlock(20, 20,'white'));
  newCreep.anchor.setTo(0.5);
  newCreep.collisionBounds = collisionBounds;
  newCreep.inputEnabled = true;
  newCreep.speed = 0;
  newCreep.angle = 0;
  newCreep.data = {
    id: Utils.randomId('creep'),
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
      color: 0
    }
  };
  if (!data.brain) {
    newCreep.brain = new Brain();
    newCreep.brain.populate(Layers);
  } else {
    newCreep.brain = data.brain;
  }

  var style = { font: "32px Arial", fill: "white",align: "center", };
  newCreep.text = game.add.text(0, 0, "1", style);
  newCreep.text.anchor.set(0.5, 0);
  newCreep.data.color = Math.random();

  newCreep.events.onInputDown.add(function() {
    initCreepUI(newCreep);
    creepSelected = newCreep;
  });
  creeps.push(newCreep);
  return newCreep;
};

Creep.update = function(creep) {
  creep.scale.setTo(creep.data.energy/100, creep.data.energy/100);

  creep.collisionBounds.position = creep.position;
  creep.collisionBounds.alpha = 0.1;
  creep.collisionBounds.angle = creep.angle;
  creep.collisionBounds.scale.setTo(creep.scale.x, creep.scale.y);

  creep.data.timeSinceLastFood+=0.1;
  creep.data.lived++;

  creep.speed = Math.round(creep.speed * 100) / 100;
  creep.angle = Math.round(creep.angle * 100) / 100;

  creep.text.position = creep.position;
  creep.text.alpha = 0;

  if (creep.speed) {
    var moveVector = Utils.lengthDir(creep.speed, Utils.angle360(creep.angle) * Math.PI / 180);
    creep.x += moveVector.x;
    creep.y += moveVector.y;
  }
  creep.data.energy -= 0.01;
  if (creep.data.energy <= 0) {
    Creep.kill(creep.data.id);
  }

  if (creep.data.lived % 15 === 0) {
    for(var c=0;c<creeps.length;c++){
      if (creep !== creeps[c]) {
        if (creep.alive && creeps[c].alive && Utils.checkOverlap(creep, creeps[c]) && creep.data.energy > 190) {
          creep.data.energy-=100;
          game.add.tween(creep.scale).to({ x: creep.data.energy/100, y: creep.data.energy/100}, 1000).start();
          var newBrain = new Brain();
          newBrain.crossGenes(creep.brain, creeps[c].brain);
          var newCreep = Creep.create({
            x:creep.x,
            y:creep.y,
            brain: newBrain
          });
          //find between color
          newCreep.data.color = (creep.data.color+creeps[c].data.color)/2;
          newCreep.data.energy = 100;
        }
      }
    }
  }

  var distToClosestFood = 999,
      closestFoodObject,
      foodAngle = 0;
  if (creep.data.lived % 15 === 0) {
    for(var x=0;x<food.length;x++){

      if (food[x].alive && creep.alive) {

        var foodDist = Utils.pointDistance(creep.position, food[x].position);
        if (foodDist < distToClosestFood) {
          distToClosestFood = foodDist;
          closestFoodObject = food[x];
        }

        if (Utils.checkOverlap(creep, food[x])) {
          food[x].destroy();
          food.splice(x,1);

          if (creep.data.energy+50 < 250) {
            creep.data.energy += 50;
            game.add.tween(creep.scale).to({ x: creep.data.energy/100, y: creep.data.energy/100}, 1000).start();
          } else {

          }

          creep.data.timesBetweenFood.push(creep.data.timeSinceLastFood);
          creep.data.timeSinceLastFood = 0;
          if (creep.data.timesBetweenFood.length > 10) {
            if (!creep.data.sustainable) {
              creep.data.sustainable = true;
              matingPool.push(creep.data);
              console.log(matingPool.length);
            }
            creep.data.avgTimeBetweenFood = 0;
            creep.data.timesBetweenFood.slice(0,1);
            for (var f = 0; f < creep.data.timesBetweenFood.length; f++) {
              creep.data.avgTimeBetweenFood+=creep.data.timesBetweenFood[f];
            }
            creep.data.avgTimeBetweenFood= Math.round(creep.data.avgTimeBetweenFood/creep.data.timesBetweenFood.length);
          }

        }
      }
    }

  }

  if (closestFoodObject) {
    creep.data.foodDist = distToClosestFood;

    //calculate relative angle difference between creep and food
    var cAngle = Utils.angle360(creep.angle);
    var fAngle = Utils.angle360(Utils.pointDirection(creep.position, closestFoodObject.position));

    var angleDiff = (cAngle - fAngle + 360) % 360;
    if (angleDiff > 180) angleDiff = -360 + angleDiff;
    angleDiff = Math.round(angleDiff);

    creep.data.foodAngle = angleDiff;
    creep.text.setText(angleDiff);
  }

  brainGo(creep);
  if (creepSelected && creep.data.id == creepSelected.data.id) {
    updateCreepUI(creep);
  }

  if (controlSelected && creepSelected && creep.data.id == creepSelected.data.id) {
    //Control creep
    Creep.control(creep);
  } else {
    //Creep controls itself
    var speedOutput = creep.brain.findOutput('speed').value;
    creep.speed = speedOutput*2.5;
    creep.data.energy -= creep.speed/10;
    var angleOutput = creep.brain.findOutput('angle').value;
    var relativeChange = angleOutput < 0.5 ? -1 : 1;
    creep.angle += relativeChange * angleOutput*6;
    
    creep.tint = creep.data.color * 0xffffff;
  }

};

function brainGo(creep) {
  creep.brain.findInput('speed').setValue(creep.speed);
  creep.brain.findInput('energy').setValue(creep.data.energy);
  creep.brain.findInput('foodAngle').setValue(creep.data.foodAngle);
  creep.brain.findInput('foodDist').setValue(creep.data.foodDist);
  creep.brain.think();
}



Creep.kill = function(id) {
  var creep = Creep.find(id);
  var creepIndex = creep.creepIndex;
  creep = creep.creep;
  creep.text.destroy();
  creep.collisionBounds.destroy();
  creep.events.destroy();
  creep.destroy();
  creeps.splice(creepIndex,1);
};

Creep.find = function(id) {
  for (var i = 0; i < creeps.length; i++) {
    if (creeps[i].data.id === id) {
      return {creep:creeps[i], creepIndex:i};
    }
  }
  return false;
};

Creep.control = function(creep) {
  creepSelected.data.energy = 50;
  if(upKey.isDown && creepSelected.speed < 3) {
    creepSelected.speed += 0.1;
  } else if(creepSelected.speed > 0.05) {
    creepSelected.speed -= 0.05;
  }

  if(rightKey.isDown) {
    creepSelected.angle += 3;
  }
   if(leftKey.isDown) {
    creepSelected.angle -= 3;
  } 
};