
var Layers = [
  {
    name: 'inputs',
    neurons: [
      {name: 'speed', value:0, min:0, max:5},
      {name: 'energy', value:50, min:0, max:1000},
      {name: 'foodAngle', value:0, min:-180, max:180},
      {name: 'foodDist', value:0, min:0, max:5000},
    ]
  },
  {
    name: 'hidden1',
    neurons: [
      {name: 0, value:0, type: 'sum'},
      {name: 1, value:0, type: 'sum'},
      {name: 2, value:0, type: 'sum'},
      {name: 3, value:0, type: 'sum'},
      {name: 4, value:1, type: 'const'}
    ]
  },
  {
    name: 'output',
    neurons: [
      {name: 'speed', value:0},
      {name: 'angle', value:0}
    ]
  }
];

var Brain = function() {
  this.id = Math.random().toString(36).substr(2, 9);
  this.layers = [];
  this.neurons = [];
  this.synapses = [];
};

var Layer = function(name) {
  this.name = name;
  this.neurons = [];
};

var Neuron = function(layer, neuronData) {
  var neuron = this;
  Object.keys(neuronData).forEach(function(key) {
    neuron[key] = neuronData[key];
  });
  this.layer = layer;
  this.synapsesIn = [];
  this.synapsesOut = [];
  
  this.calc = function() {
    var synapsesInSum = 0;
    neuron.synapsesIn.forEach(function(synapse) {
      synapsesInSum += synapse.calc();
    });
    if (neuron.layer.name !== 'inputs' && neuron.type !== 'const') {
      this.value = Math.round(Utils.sigmoid(synapsesInSum) * 100)/100;
    }
  };
};

var Synapse = function(neuronFrom, neuronTo, weight) {
  var synapse = this;
  this.neuronFrom = neuronFrom;
  this.neuronTo = neuronTo;
  this.input = neuronFrom.value;
  this.weight = weight || Math.random() * ( 1 - (-1) ) + -1;
  
  this.calc = function() {
    synapse.input = neuronFrom.value;
    return Math.round((synapse.input * synapse.weight) * 100)/100;
  };
};

Brain.prototype.populate = function(layers) {
  var brain = this;
  layers.forEach(function(layer){
    brain.createLayer(layer.name, layer.neurons);
  });
  (brain.layers).forEach(function(layer, i){
    var neurons = layer.neurons;
    if(brain.layers[i+1] && brain.layers[i+1].neurons.length > 0) {
      neurons.forEach(function(neuronFrom){
        brain.layers[i+1].neurons.forEach(function(neuronTo){
          var synapse = new Synapse(neuronFrom, neuronTo, null); //creates random weight
          neuronFrom.attachSynapse(synapse, 'out');
          neuronTo.attachSynapse(synapse, 'in');
          brain.synapses.push(synapse);
        });
      });
    }
  });
};

Brain.prototype.crossGenes = function(brain1, brain2) {
  this.populate(Layers);
  for (var i = 0; i < brain1.synapses.length; i++) {
    this.synapses[i].weight = Math.random() < 0.5 ? brain1.synapses[i].weight : brain2.synapses[i].weight;
  }
  this.mutate(1);
  return this;
};

Brain.prototype.mutate = function(nmutations) {
  for (var i = 0; i < nmutations; i++) {
    var randomSynapse = Math.floor(Math.random() * this.synapses.length) + 1;
    var relativeChange = Math.random() < 0.5 ? -0.05 : 0.05;
    this.synapses[randomSynapse-1].weight += relativeChange;
  }
};

Brain.prototype.think = function() {
  this.neurons.forEach(function(neuron){
    neuron.calc();
  });
};

Brain.prototype.findInput = function(name) {
  for (var i = 0; i < this.layers[0].neurons.length; i++) {
    var neuron = this.layers[0].neurons[i];
    if (neuron.name === name) {
      return neuron;
    }
  }
};

Brain.prototype.findOutput = function(name) {
  for (var i = 0; i < this.layers[2].neurons.length; i++) {
    var neuron = this.layers[2].neurons[i];
    if (neuron.name === name) {
      return neuron;
    }
  }
};

Brain.prototype.createLayer = function(name, neurons) {
  var brain = this;
  var layer = new Layer(name);
  this.layers.push(layer);
  neurons.forEach(function(neuron) {
    brain.createNeuron(layer, neuron);
  });
  return layer;
};

Brain.prototype.createNeuron = function(layer, neuron) {
  neuron = new Neuron(layer, neuron);
  this.neurons.push(neuron);
  layer.neurons.push(neuron);
  return neuron;
};

Neuron.prototype.setValue = function(value){
  this.value = Math.round(Utils.normalize(value, this.min, this.max) * 100)/100;
};

Neuron.prototype.attachSynapse = function(synapse, direction){
  if (direction === 'in') {this.synapsesIn.push(synapse);}
  if (direction === 'out') {this.synapsesOut.push(synapse);}
};

Neuron.prototype.detachSynapse = function(synapse, direction){
  if (direction === 'in') {this.synapsesIn.push(synapse);}
  if (direction === 'out') {this.synapsesOut.push(synapse);}
};



Synapse.prototype.changeWeight = function(input){
  //TODO
};

Synapse.prototype.randomizeWeight = function(){
  //TODO
};

Synapse.prototype.mutate = function(){
  //TODO

};

