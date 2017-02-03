

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

function updateCreepUI(creep) {
  if (!creep.data) {return;}
  $('#creep-info-data').empty();
  $('#creep-info-data').append('<p>creepID: '+creep.data.id+'</p>');
  $('#creep-info-data').append('<p>Lived: '+creep.data.lived+'</p>');
  $('#creep-info-data').append('<p>Energy: '+(Math.round(creep.data.energy * 1) / 1)+'</p>');
  $('#creep-info-data').append('<p>Time between food: '+creep.data.avgTimeBetweenFood+'</p>');
  var neurons = creep.brain.neurons;
  neurons.forEach(function(neuron) {
    $('#'+neuron.layer.name+'-'+neuron.name).html(Math.round(neuron.value * 100) / 100);
  });
}

function initCreepUI(creep) {
  clear();
  controlSelected = false;

  creepInfoElement.append('<div id="creep-info-data"></div>');
  creepInfoElement.append('<div id="creep-info-network"></div>');
  $('#creep-info').append('<div id="creep-control-wrapper">Control this creep: </div>');
  $('<input />', { type: 'checkbox', id: 'creepControl'}).appendTo($('#creep-control-wrapper'));
  if(!creep) return;
  $('#creep-info-network')
    .append('<svg id="svg-lines"></svg>');

  var layers = creep.brain.layers;
  var synapses = creep.brain.synapses;
  drawLayers(layers);
  drawSynapses(synapses);
}

function drawSynapses(synapses) {
  for (var s = 0; s < synapses.length; s++) {
    var synapse = synapses[s];

    var strokeWidth = synapse.weight;

    $(document.createElementNS('http://www.w3.org/2000/svg','line')).attr({
      id:'line'+s,
      x1:0,
      y1:0,
      x2:300,
      y2:300,
      'stroke-width':strokeWidth*4,
      stroke: 'lightblue'
    }).appendTo("#svg-lines");

    var line = $('#line'+s);
    var pos1 = $('#'+synapse.neuronFrom.layer.name+'-'+synapse.neuronFrom.name).position();
    var pos2 = $('#'+synapse.neuronTo.layer.name+'-'+synapse.neuronTo.name).position();
    line
      .attr('stroke-width', strokeWidth*4)
      .attr('x1',pos1.left+15)
      .attr('y1',pos1.top+15)
      .attr('x2',pos2.left+15)
      .attr('y2',pos2.top+15);
  }
}

function updateSynapses(synapses) {
  for (var s = 0; s < synapses.length; s++) {
    var synapse = synapses[s];
    var strokeWidth = synapse.weight;
    var line = $('#line'+s);
    var pos1 = $('#'+synapse.neuronFrom.layer.name+'-'+synapse.neuronFrom.name).position();
    var pos2 = $('#'+synapse.neuronTo.layer.name+'-'+synapse.neuronTo.name).position();
    line
      .attr('x1',pos1.left+15)
      .attr('y1',pos1.top+15)
      .attr('x2',pos2.left+15)
      .attr('y2',pos2.top+15)
      .attr('stroke-width', strokeWidth*4);
  }
}


function drawLayers(layers) {
  for (var layerIndex in (layers)) {
    var layer = (layers)[layerIndex];
    var layerName = layer.name;
    for (var neuronIndex in layer.neurons) {
      var neuron = layer.neurons[neuronIndex];
      var neuronName = neuron.name;

      var neuronEl =  $('<div class="neuron '+layerName+'" id="'+layerName+'-'+neuronName+'">'+neuron.value+'</div>');
      neuronEl.css({
        'left': 10+80*layerIndex+'px',
        'top': 10+40*neuronIndex+'px'
      });
      // neuronEl.drags();
      $('#creep-info-network').append(neuronEl);
    }

  }
}

$( "#button-selectbest" ).click(function() {
  creepSelected = Creep.find(info.bestCreep.id).creep;
  game.camera.follow(cameraObject);
  initCreepUI(creepSelected);
});

$( "#button-selectrandom" ).click(function() {
  creepSelected = creeps[(Math.floor(Math.random() * creeps.length) + 1)-1];
  game.camera.follow(cameraObject);
  initCreepUI(creepSelected);
});

$( "body" ).click(function( event ) {
  if(event.target.id == 'creepControl') {
    controlSelected = $('#creepControl').prop('checked');
  }
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

//         drawSynapses(creepSelected.data.network.weights);

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