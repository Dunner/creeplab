
function randomWeights(creep){

  var layers = creep.data.network.layers;
  var weights = creep.data.network.weights;

  var layerIndex = 1;
  var neuronIndex = 0;
  for (var layerName in (layers)) {
    var layer = (layers)[layerName];

    for (var fromNeuronName in layer) {
      var neuron = layer[fromNeuronName];
      var fromNeuron = [layerName, fromNeuronName];

      if (Object.keys(layers)[layerIndex]) {
        var step1 = layers[Object.keys(layers)[layerIndex]];
        for (var test in step1) {
          var toNeuron = [Object.keys(layers)[layerIndex],test];
          weights.push({
            layer:layerName,
            fromNeuron: fromNeuron,
            toNeuron: toNeuron,
            weight: Math.random() * ( 1 - (-1) ) + -1
          });
        }

      }
      neuronIndex++;
    }
    layerIndex++;
    neuronIndex = 0;
  }
}


function crossOver() {
  if (creeps.length < 2) {return false;}
  var poolLimit = matingPool.length;
  if (matingPool.length > 10) {poolLimit = 10;}
  var creep1n = (Math.floor(Math.random() * poolLimit) + 1)-1;
  var creep2n = creep1n;
  while (creep1n == creep2n) {
    creep2n = (Math.floor(Math.random() * poolLimit) + 1)-1;
  }
  var creep1weights = matingPool[creep1n].network.weights;
  var creep2weights = matingPool[creep2n].network.weights;
  if (creep1weights.length < 1 || creep2weights.length < 1) {return false;}
  return crossTwo(creep1weights,creep2weights);

}
function crossTwo(creep1Weights, creep2Weights) {
  var weights = [];
  for (var i = 0; i < creep1Weights.length; i++) {
    var randomParentWeight = Math.random() < 0.5 ? creep1Weights[i] : creep2Weights[i];
    weights[i] = randomParentWeight;
  }
  return weights;
}

function brainGo(creep) {
  creep.data.network.layers.input.speed.value = creep.speed;
  // creep.data.network.layers.input.angle.value = creep.angle;
  creep.data.network.layers.input.energy.value = creep.data.energy;
  creep.data.network.layers.input.foodClosestAngle.value = creep.data.angleToFood;
  creep.data.network.layers.input.foodClosestDist.value = creep.data.distToFood;

  var layers = creep.data.network.layers;
  var weights = creep.data.network.weights;

  var neuronName;
  var input = layers.input;
  for (neuronName in input) {
    var ineuron = input[neuronName];
    var iinputTotal = 0;
    ineuron.value = Utils.normalize(ineuron.value, ineuron.min, ineuron.max);
  }

  var hidden = layers.hidden;
  for (neuronName in hidden) {
    var neuron = hidden[neuronName];
    var inputTotal = 0;
    if (neuron.inputWeights) {
      if (neuron.type == 'sum') {
        for (var n = 0; n < neuron.inputWeights.length; n++) {
          var inputWeight = neuron.inputWeights[n];
          inputTotal += inputWeight.multiplied;
        }
        inputTotal = Utils.sigmoid(inputTotal);
        neuron.value = Math.round(inputTotal * 100) / 100;
      }
      if (neuron.type == 'constant') {
        neuron.value = 1;
      }
    }
  }

  var output = layers.output;
  for (neuronName in output) {
    var tneuron = output[neuronName];
    var tinputTotal = 0;
    if (tneuron.inputWeights) {
      for (var no = 0; no < tneuron.inputWeights.length; no++) {
        var tinputWeight = tneuron.inputWeights[no];
        tinputTotal += tinputWeight.multiplied;
      }
      tinputTotal = Utils.sigmoid(tinputTotal);
      tneuron.value = Math.round(tinputTotal * 100) / 100;
    }
  }
  
  weights.forEach(function(weight){
    layers[weight.toNeuron[0]][weight.toNeuron[1]].inputWeights = [];
  });
  weights.forEach(function(weight){

    var fromWeight = layers[weight.fromNeuron[0]][weight.fromNeuron[1]];
    var fromValue = fromWeight.value;
    var weightValue = weight.weight;

    var toObject = layers[weight.toNeuron[0]][weight.toNeuron[1]].inputWeights;
    toObject.push({input:fromValue, weight: weightValue, multiplied: fromValue*weightValue});
  });



}

function mutateWeights(creep, nmutations) {
  mutations++;
  for (var i = 0; i < nmutations; i++) {
    weights = creep.data.network.weights;
    var randomWeight = Math.floor(Math.random() * weights.length) + 1;
    var relativeChange = Math.random() < 0.5 ? -0.05 : 0.05;
    weights[randomWeight-1].weight += relativeChange;
  }

}

function creepFind(id) {
  for (var i = 0; i < creeps.length; i++) {
    if (creeps[i].data.id === id) {
      return creeps[i];
    }
  }
  return false;
}

function creepKill(id) {
  if (creep.data.lived > bestWeights.lived) {
    bestWeights.lived = creep.data.lived;
    bestWeights.weights = creep.data.network.weights;
  }
  creep.text.destroy();
  creep.destroy();
  creeps.splice(i,1);
}


function controlCreep(creep) {

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

}  



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
    angleToFood: 0,
    distToFood: 0,
    timesBetweenFood: [],
    avgTimeBetweenFood: 999,
    timeSinceLastFood: 0,
    network: {
      layers: {
        input: {
          speed: {value:0, min:0, max:5},
          // angle: {value:0},
          energy: {value:50, min:0, max: 1000},
          foodClosestAngle: {value:0, min:-180, max:180},
          foodClosestDist: {value:0, min:0, max:5000},
        },
        hidden: {
          0: {value:0, type: 'sum'},
          1: {value:0, type: 'sum'},
          2: {value:0, type: 'sum'},
          3: {value:0, type: 'sum'},
          4: {value:0, type: 'sum'},
          5: {value:1, type:'const'},
        },
        output: {
          speed: {value:0},
          angle: {value:0},
          color: {value:0.1}
        }
      },
      weights: []
    },
    traits: {
      color: 0
    }
  };
  var style = { font: "32px Arial", fill: "white",align: "center", };
  newCreep.text = game.add.text(0, 0, "1", style);
  newCreep.text.anchor.set(0.5, 0);
  newCreep.data.color = Math.random();

  if (data.weights) {
    newCreep.data.network.weights = data.weights;
    mutateWeights(newCreep,1);

  } else if (matingPool.length > 5) {
    newCreep.data.network.weights = crossOver();
    if (!newCreep.data.network.weights) {
      console.log('random');
      randomWeights(newCreep);
    } else {
      console.log('cross');
      mutateWeights(newCreep,1);
    }
  } else {
    randomWeights(newCreep);
  }

  
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
          var weights = crossTwo(creep.data.network.weights,creeps[c].data.network.weights);
          var newCreep = Creep.create({
            x:creep.x,
            y:creep.y,
            weights: weights
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
      angleToFood = 0;
  if (creep.data.lived % 15 === 0) {
    for(var x=0;x<food.length;x++){

      if (food[x].alive && creep.alive) {

        var distToFood = Utils.pointDistance(creep.position, food[x].position);
        if (distToFood < distToClosestFood) {
          distToClosestFood = distToFood;
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
    creep.data.distToFood = distToClosestFood;

    //calculate relative angle difference between creep and food
    var cAngle = Utils.angle360(creep.angle);
    var fAngle = Utils.angle360(Utils.pointDirection(creep.position, closestFoodObject.position));

    var angleDiff = (cAngle - fAngle + 360) % 360;
    if (angleDiff > 180) angleDiff = -360 + angleDiff;
    angleDiff = Math.round(angleDiff);

    creep.data.angleToFood = angleDiff;
    creep.text.setText(angleDiff);
  }

  brainGo(creep);
  if (creepSelected && creep.data.id == creepSelected.data.id) {
    updateCreepUI(creep.data);
  }

  if (controlSelected && creepSelected && creep.data.id == creepSelected.data.id) {
    //Control creep
    controlCreep(creep);
  } else {
    //Creep controls itself
    var speedOutput = creep.data.network.layers.output.speed.value;
    creep.speed = speedOutput*2.5;
    creep.data.energy -= creep.speed/10;

    var angleOutput = creep.data.network.layers.output.angle.value;
    var relativeChange = angleOutput < 0.5 ? -1 : 1;
    creep.angle += relativeChange * angleOutput*6;
    
    creep.tint = creep.data.color * 0xffffff;
  }

};

Creep.kill = function(id) {
  var creep = Creep.find(id);
  var creepIndex = creep.creepIndex;
  creep = creep.creep;
  creep.text.destroy();
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