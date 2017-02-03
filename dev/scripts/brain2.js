// var input1 = 140
// var input2 = 1

// console.log('Inputs:', input1, input2)

// var target = 1

// console.log('Target:', target)

// // normalization
// var normInput1 = 140/200
// var normInput2 = 1/1

// console.log('Norm inputs:', normInput1, normInput2)

// function Synapse(input, weight) {
//   this.input = input
//   this.weight = weight || Math.random()
  
//   this.calc = function() {
//     return this.input * this.weight
//   }
// }

// function Neuron(synapsesArr) {
//   this.synapsesArr = synapsesArr
  
//   this.activate = function(t) {
//     return 1/(1 + Math.pow(Math.E, -t))
//   }
  
//   this.calc = function() {
//     var synapsesOutputsSum = 0
//     synapsesArr.forEach((synapse) => {
//       synapsesOutputsSum += synapse.calc()
//     })
//     return this.activate(synapsesOutputsSum)
//   }
// }

// var neuron1 = new Neuron([new Synapse(normInput1), new Synapse(normInput2)])
// var neuron2 = new Neuron([new Synapse(normInput1), new Synapse(normInput2)])
// var neuron3 = new Neuron([new Synapse(normInput1), new Synapse(normInput2)])

// var neuron1Output = neuron1.calc()
// var neuron2Output = neuron2.calc()
// var neuron3Output = neuron3.calc()

// console.log('Neurons outputs:', neuron1Output, neuron2Output, neuron3Output)

// var finalNeuron = new Neuron([new Synapse(neuron1Output), new Synapse(neuron2Output), new Synapse(neuron3Output)])

// var output = finalNeuron.calc()

// console.log('Output:', output)

// var delta = target - output

// console.log('Delta:', delta)