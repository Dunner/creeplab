/*globals Phaser:false */

var game,
    ticks = 0,
    mutations = 0,
    creeps = [],
    food = [],
    creepSelected,
    controlSelected = false,
    textureRegistry = {},
    matingPool = [],
    bestWeights = {
      lived: 0,
      weights: {}
    },
    info = {},
    
    crossOverValue = 2300,
    minimumCreeps = 100,
    minimumFood = 200,
    delta = 0.5;


$(function() {
    

  var canvasElement = $('#spetsad-canvas');

  function preload() {
    game.stage.disableVisibilityChange = true;
    game.time.advancedTiming = true;
  }

  function create() {
    // game.add.tileSprite(0, 0, canvasElement[0].offsetWidth, canvasElement[0].offsetHeight, 'background');
    game.stage.backgroundColor = '#222';
    game.world.setBounds(0, 0, 3000, 3000);

    Controls.init();
    Camera.init();

    selectObject = game.add.sprite(0,0, Utils.createBlock(50, 50,'lightblue'));
    selectObject.anchor.setTo(0.5, 0.5);

  }

  function update() {
    ticks++;

    Camera.drag(game.input.mousePointer);
    Camera.drag(game.input.pointer1);
    Camera.update();
    Controls.update();

    //CreepUpdate
    for (var i = 0; i < creeps.length; i++) {
      var creep = creeps[i];
      Creep.update(creep);
    }

    //Spawn creeps if too few
    if (creeps.length < minimumCreeps) {
      var missingCreeps = minimumCreeps - creeps.length;
      for (var e = 0; e < missingCreeps; e++) {
        Creep.create(Utils.randomSpawn(100,100,2800,2800));
      }
    }

    if (food.length < minimumFood) {
      var missingFood = minimumFood - food.length;
      for (var b = 0; b < missingFood; b++) {
        Utils.spawnFood(Utils.randomSpawn(100,100,2800,2800));
      }
    }


    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    //sort creeps by lived longest

    if (matingPool.length > 5) {
      matingPool.sort(Utils.dynamicSort(false, 'avgTimeBetweenFood'));
      creeps.sort(Utils.dynamicSort(false, 'data', 'avgTimeBetweenFood'));
    }

    info = {
      mutations: mutations,
      creepsAlive: creeps.length,
      bestCreep: {
        lived: creeps[0].data.lived,
        id: creeps[0].data.id
      },
      bestAllTime: bestWeights.lived,
      ticks: ticks
    };
    updateGameInfo();
  }

  game = new Phaser.Game(canvasElement[0].offsetWidth, canvasElement[0].offsetHeight, Phaser.AUTO, 'spetsad-canvas', {preload: preload, create: create, update: update});

  
});


function mouseWheel(event) {
  var scale;
  if (game.input.mouse.wheelDelta < 0) {
    if (zoomLevel > 0.42) {
      scale = zoomLevel - 0.2;
    }
  }
  if (game.input.mouse.wheelDelta > 0) {
    if (zoomLevel < 2) {
      scale = zoomLevel + 0.2;
    }
  }
  if (scale) {
    Camera.zoomTo(scale,225);
  }
  
}


