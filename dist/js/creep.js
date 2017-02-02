function creepSpawn(data) {
  var newCreep = game.add.sprite(data.x,data.y, createBlock(20, 20,'white'));
  newCreep.anchor.setTo(0.5, 0.5);
  newCreep.inputEnabled = true;
  newCreep.speed = 0;
  newCreep.angle = 0;
  newCreep.data = {
    id: randomId('creep'),
    food: 50,
    fitness: 0,
    lived: 0,
    angleToFood: 0,
    foodTimer: 0,
    network: {
      layers: {
        input: {
          speed: {value:0},
          angle: {value:0},
          food: {value:50},
          foodClosestAngle: {value:0},
        },
        hidden: {
          0: {value:0},
          1: {value:0},
          2: {value:0},
          3: {value:0},
          4: {value:0},
        },
        output: {
          speed: {value:0},
          angle: {value:0},
          color: {value:0.1}
        }
      },
      weights: []
    }
  };

  if (data.weights) {
    newCreep.data.network.weights = data.weights;
    mutateWeights(newCreep,1);
  } else if (bestWeights.lived > crossOverValue) {
    // newCreep.data.network.weights = bestWeights.weights;
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
}

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

function creepUpdate(creep, i) {
  creep.data.lived++;
  creep.data.foodTimer-=0.4;
  if (creep.data.foodTimer < creep.data.lived/10) { creep.data.foodTimer = creep.data.lived/10;}

  creep.speed = Math.round(creep.speed * 100) / 100;
  creep.angle = Math.round(creep.angle * 100) / 100;

  if (creepSelected && creep.data.id == creepSelected.data.id) {
    controlCreep(creep);
  }

  var angle360 = creep.angle;
  if(creep.angle < 0) {
    angle360 = Math.abs(creep.angle + 360);
  }
  if (creep.speed) {
    var moveVector = lengthDir(creep.speed, angle360 * Math.PI / 180);
    creep.x += moveVector.x;
    creep.y += moveVector.y;
  }
  creep.data.food -= 0.1;
  if (creep.data.food <= 0) {
    creepKill(creep, i);
  }

  var distToClosestFood = 999,
      closestFoodObject,
      angleToFood = 0;
      
  if (creep.data.lived % 2 === 0) {
    for(var x=0;x<food.length;x++){

      if (food[x].alive && creep.alive) {

        var distToFood = pointDistance(creep.position, food[x].position);
        if (distToFood < distToClosestFood) {
          distToClosestFood = distToFood;
          closestFoodObject = food[x];
        }

        if (checkOverlap(creep, food[x])) {
          food[x].destroy();
          food.splice(x,1);
          creep.data.foodTimer += 50;
          if (creep.data.food+50 < 250) {
            creep.data.food += 50;
          } else {
            // creep.data.food = 100;
            // creepSpawn({
            //   x:creep.x,
            //   y:creep.y,
            //   weights: creep.data.network.weights
            // });
          }
        }
      }
    }

  }

  if (closestFoodObject) {
    creep.data.angleToFood = pointDirection(creep.position, closestFoodObject.position);
  }

  brainGo(creep);

  var speedOutput = creep.data.network.layers.output.speed.value;
  creep.speed = speedOutput*2.5;

  var angleOutput = creep.data.network.layers.output.angle.value;
  var relativeChange = angleOutput < 0.5 ? -1 : 1;
  creep.angle += relativeChange * angleOutput*6;
  
  creep.tint = creep.data.network.layers.output.color.value * 0xffffff;
}

function crossOver() {
  if (creeps.length < 2) {return false;}
  var weights = [];
  var poolLimit = creeps.length;
  if (creeps.length > 10) {poolLimit = 10;}
  var creep1n = (Math.floor(Math.random() * poolLimit) + 1)-1;
  var creep2n = creep1n;
  while (creep1n == creep2n) {
    creep2n = (Math.floor(Math.random() * poolLimit) + 1)-1;
  }
  var creep1weights = creeps[creep1n].data.network.weights;
  var creep2weights = creeps[creep2n].data.network.weights;
  if (creep1weights.length < 1 || creep2weights.length < 1) {return false;}

  for (var i = 0; i < creep1weights.length; i++) {
    var randomWeight = Math.random() < 0.5 ? creep1weights : creep2weights;
    weights[i] = randomWeight[i];
  }
  return weights;
}

function brainGo(creep) {
  creep.data.network.layers.input.speed.value = creep.speed;
  creep.data.network.layers.input.angle.value = creep.angle;
  creep.data.network.layers.input.food.value = creep.data.food;
  creep.data.network.layers.input.foodClosestAngle.value = creep.data.angleToFood;

  var layers = creep.data.network.layers;
  var weights = creep.data.network.weights;

  weights.forEach(function(weight){
    layers[weight.toNeuron[0]][weight.toNeuron[1]].inputWeights = [];
  });
  weights.forEach(function(weight){

    var fromValue = layers[weight.fromNeuron[0]][weight.fromNeuron[1]].value;
    var weightValue = weight.weight;

    var toObject = layers[weight.toNeuron[0]][weight.toNeuron[1]].inputWeights;
    toObject.push({input:fromValue, weight: weightValue, multiplied: fromValue*weightValue});
  });

  
  var hidden = layers.hidden;
  for (var neuronName in hidden) {
    var neuron = hidden[neuronName];
    var inputTotal = 0;
    if (neuron.inputWeights) {
      for (var n = 0; n < neuron.inputWeights.length; n++) {
        var inputWeight = neuron.inputWeights[n];
        inputTotal += inputWeight.multiplied;
      }
      inputTotal = sigmoid(inputTotal);
      neuron.value = Math.round(inputTotal * 100) / 100;
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
      tinputTotal = sigmoid(tinputTotal);
      tneuron.value = Math.round(tinputTotal * 100) / 100;
    }

  }
  
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

function creepKill(creep, i) {
  if (creep.data.lived > bestWeights.lived) {
    console.log('new record!', creep.data.lived);
    bestWeights.lived = creep.data.lived;
    bestWeights.weights = creep.data.network.weights;
  }
  creep.destroy();
  creeps.splice(i,1);
}


function controlCreep(creep) {
  if(!creepSelected.speed) {creepSelected.speed = 0;}
  if(!creepSelected.angle) {creepSelected.angle = 0;}

  // if (creepSelected) {
  //   creepSelected.angle = ((pointDirection(creepSelected, mouse) % 360) + 360) % 360;
  // }

  if(upKey.isDown && creepSelected.speed < 3) {
    creepSelected.speed += 0.1;
  }

  var newAngle = 0;
  if(rightKey.isDown) {
    creepSelected.angle += 3;
  }
   if(leftKey.isDown) {
    creepSelected.angle -= 3;
  } 

  updateCreepUI(creep.data);
}  
  