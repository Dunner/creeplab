

var uiElement = $('#ui'),
    gameInfoElement = $('#game-info'),
    creepInfoElement = $('#creep-info');

function clear() {
  creepInfoElement.empty();
}

function updateGameInfo(creepData) {
  gameInfoElement.empty();
  gameInfoElement.append('<p>Ticks: '+info.ticks+'</p>');
  gameInfoElement.append('<p>Creeps alive: '+info.creepsAlive+'</p>');
  gameInfoElement.append('<p>Best all-time creep: '+info.bestAllTime+' ticks</p>');
  gameInfoElement.append('<br>');
  gameInfoElement.append('<p>Best current creep: '+info.bestCreep.lived+' ticks</p>');
}

function updateCreepUI(creepData) {
  if (!creepData) {return;}
  $('#creep-info-data').empty();
  $('#creep-info-data').append('<p>creepID: '+creepData.id+'</p>');
  $('#creep-info-data').append('<p>Lived: '+creepData.lived+'</p>');
  $('#creep-info-data').append('<p>Food: '+(Math.round(creepData.food * 1) / 1)+'</p>');
  $('#creep-info-data').append('<p>Foodtimer: '+(Math.round(creepData.foodTimer * 1) / 1)+'</p>');
  $('#creep-info-data').append('<p>test: '+(Math.round((creepData.foodTimer+creepData.lived/10) * 1) / 1)+'</p>');
  var layers = creepData.network.layers;
  for (var layerName in (layers)) {
    if ((layers).hasOwnProperty(layerName)) {
      var layer = (layers)[layerName];

      for (var neuronName in layer) {
        if (layer.hasOwnProperty(neuronName)) {
          var neuron = layer[neuronName];
          $('#'+layerName+'-'+neuronName).html(Math.round(neuron.value * 100) / 100);
        }
      }

    }
  }
}

function initCreepUI(creep) {
  clear();
  $('#creep-info').append('<div id="creep-info-data"></div>');
  $('#creep-info').append('<div id="creep-info-network"></div>');

  if(!creep) return;
  $('#creep-info-network')
    .append('<svg id="svg-lines"></svg>');

  var network = {
    inputs: [5,7],
    gates: [0,0,0],
    outputs: [0,0]
  };

  var layers = creep.data.network.layers;
  var weights = creep.data.network.weights;
  drawLayers(layers);
  drawWeights(layers, weights);
}

function drawWeights(layers, weights) {
    for (var w = 0; w < weights.length; w++) {
      var weight = weights[w];

      var strokeWidth = weight.weight;

      $(document.createElementNS('http://www.w3.org/2000/svg','line')).attr({
          id:"line"+w,
          x1:0,
          y1:0,
          x2:300,
          y2:300,
          'stroke-width':strokeWidth*4,
          stroke: 'lightblue'
        }).appendTo("#svg-lines");


      var line = $('#line'+w);
      var pos1 = $('#'+weights[w].fromNeuron[0]+'-'+weights[w].fromNeuron[1]).position();
      var pos2 = $('#'+weights[w].toNeuron[0]+'-'+weights[w].toNeuron[1]).position();
      line.attr('x1',pos1.left+15).attr('y1',pos1.top+15).attr('x2',pos2.left+15).attr('y2',pos2.top+15);

    }
}

function updateWeights(weights) {
  for (var w = 0; w < weights.length; w++) {
    var weight = weights[w];
    var line = $('#line'+w);
    var pos1 = $('#'+weights[w].fromNeuron[0]+'-'+weights[w].fromNeuron[1]).position();
    var pos2 = $('#'+weights[w].toNeuron[0]+'-'+weights[w].toNeuron[1]).position();
    line.attr('x1',pos1.left+15).attr('y1',pos1.top+15).attr('x2',pos2.left+15).attr('y2',pos2.top+15);
  }
}


function drawLayers(layers) {
  var layerIndex = 0;
  var neuronIndex = 0;
  for (var layerName in (layers)) {
    if ((layers).hasOwnProperty(layerName)) {
      var layer = (layers)[layerName];

      for (var neuronName in layer) {
        if (layer.hasOwnProperty(neuronName)) {
          var neuron = layer[neuronName];

          var neuronEl =  $('<div class="neuron '+layerName+'" id="'+layerName+'-'+neuronName+'">'+neuron.value+'</div>');
          neuronEl.css({
            'left': 10+80*layerIndex+'px',
            'top': 10+40*neuronIndex+'px'
          });
          // neuronEl.drags();
          $('#creep-info-network').append(neuronEl);
        }
        neuronIndex++;
      }

    }
    layerIndex++;
    neuronIndex = 0;
  }
}

$( "#button-selectbest" ).click(function() {
  creepSelected = creepFind(info.bestCreep.id);
  game.camera.follow(cameraObject);
  initCreepUI(creepSelected);
});

$( "#button-selectrandom" ).click(function() {
  creepSelected = creeps[(Math.floor(Math.random() * creeps.length) + 1)-1];
  game.camera.follow(cameraObject);
  initCreepUI(creepSelected);
});

// //Dragging
// (function($) {
//   $.fn.drags = function(opt) {
//     var $el;
//     opt = $.extend({handle:"",cursor:"move"}, opt);

//     if(opt.handle === "") {
//       $el = this;
//     } else {
//       $el = this.find(opt.handle);
//     }

//     return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
//       var $drag;
//       if(opt.handle === "") {
//         $drag = $(this).addClass('draggable');
//       } else {
//         $drag = $(this).addClass('active-handle').parent().addClass('draggable');
//       }
//       var z_idx = $drag.css('z-index'),
//           drg_h = $drag.outerHeight(),
//           drg_w = $drag.outerWidth(),
//           pos_y = $drag.offset().top + drg_h - e.pageY,
//           pos_x = $drag.offset().left + drg_w - e.pageX;
//       $drag.css('z-index', 1000).parents().on("mousemove", function(e) {

//         updateWeights(creepSelected.data.network.weights);

//         $('.draggable').offset({
//           top:e.pageY + pos_y - drg_h,
//           left:e.pageX + pos_x - drg_w
//         }).on("mouseup", function() {
//           $(this).removeClass('draggable').css('z-index', z_idx);
//         });
//       });
//       e.preventDefault(); // disable selection
//     }).on("mouseup", function() {
//       if(opt.handle === "") {
//         $(this).removeClass('draggable');
//       } else {
//         $(this).removeClass('active-handle').parent().removeClass('draggable');
//       }
//     });

//   };
// })(jQuery);