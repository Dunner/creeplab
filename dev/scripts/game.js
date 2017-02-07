/*globals Phaser:false */

var Game = {},
    ticks = 0,
    mutations = 0,
    creeps = [],
    food = [],
    creepSelected,
    controlSelected = false,
    textureRegistry = {},
    bestWeights = {
      lived: 0,
      weights: {}
    },
    info = {},
    
    minimumCreeps = 300,
    minimumFood = 300,
    delta = 1;


$(function() {
    

  var canvasElement = $('#spetsad-canvas');

  function preload() {
    Game.stage.disableVisibilityChange = true;
    Game.time.advancedTiming = true;
  }

  function create() {
    // Game.add.tileSprite(0, 0, canvasElement[0].offsetWidth, canvasElement[0].offsetHeight, 'background');
    Game.stage.backgroundColor = '#222';
    Game.world.setBounds(0, 0, 3000, 3000);

    Controls.init();
    Camera.init();
    FoodHandler.init({minimumFood: minimumFood});
    CreepHandler.init({minimumCreeps: minimumCreeps});

    selectObject = Game.add.sprite(0,0, Utils.createBlock(50, 50,'lightblue'));
    selectObject.anchor.setTo(0.5, 0.5);

  }

  function update() {
    ticks+=1*delta;

    Camera.drag(Game.input.mousePointer);
    Camera.drag(Game.input.pointer1);
    Camera.update();
    Controls.update();
    FoodHandler.update();
    CreepHandler.update();
    //CreepUpdate


    Game.debug.text(Game.time.fps || '--', 2, 14, '#00ff00');
    //sort creeps by lived longest

    if (ticks % 50 === 0) {
      creeps.sort(Utils.dynamicSort(false, 'avgTimeBetweenFood'));
    }

    info = {
      mutations: mutations,
      creepsAlive: CreepHandler.creeps.length,
      bestCreep: {
        lived: CreepHandler.creeps[0].lived,
        id: CreepHandler.creeps[0].id
      },
      bestAllTime: bestWeights.lived,
      ticks: ticks
    };
    updateGameInfo();
  }

  Game = new Phaser.Game(
    canvasElement[0].offsetWidth,
    canvasElement[0].offsetHeight,
    Phaser.AUTO, canvasElement[0].id, {
      preload: preload, create: create, update: update
    }
  );

  
});


