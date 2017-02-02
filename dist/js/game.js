/*globals Phaser:false */

var game,
    ticks = 0,
    mutations = 0,
    creeps = [],
    food = [],
    creepSelected,
    mouse,
    upKey,
    downKey,
    leftKey,
    rightKey,
    textureRegistry = {},
    leftClick,
    bestWeights = {
      lived: 0,
      weights: {}
    },
    info = {},

    o_mcamera,
    zoomLevel = 1,
    
    crossOverValue = 2300,
    minimumCreeps = 50,
    minimumFood = 100,
    delta = 0.5,
    cameraObject;



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
    
    upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
    leftClick = game.input.activePointer.leftButton;

    game.input.mouse.mouseWheelCallback = mouseWheel;
    // zoomTo(0.6,100);


    zoomTo(0.3, 100);

    setTimeout(function(){
      game.camera.x = game.camera.view.x = -250;
      game.camera.y = game.camera.view.y = 0;
    }, 100);

    cameraObject = game.add.sprite(0,0, createBlock(0, 0,'red'));
    cameraObject.anchor.setTo(0.5, 0.5);

    selectObject = game.add.sprite(0,0, createBlock(50, 50,'lightblue'));
    selectObject.anchor.setTo(0.5, 0.5);
  }

  function update() {
    ticks++;

    move_camera_by_pointer(game.input.mousePointer);
    move_camera_by_pointer(game.input.pointer1);
    
    //CreepUpdate
    for (var i = 0; i < creeps.length; i++) {
      var creep = creeps[i];
      creep.tint = 1 * 0xffffff;
      creepUpdate(creep, i);
    }

    if (creepSelected && creepSelected.alive) {
      selectObject.alpha = 1;
      selectObject.position = creepSelected.position;
      //Camera
      if (cameraObject.x < creepSelected.x) {
        cameraObject.x += ( Math.abs(cameraObject.x - creepSelected.x)/10 ) * delta;
      }
      if (cameraObject.x > creepSelected.x) {
        cameraObject.x -= ( Math.abs(cameraObject.x - creepSelected.x)/10 ) * delta;
      }
      
      if (cameraObject.y < creepSelected.y) {
        cameraObject.y += ( Math.abs(cameraObject.y - creepSelected.y)/10 ) * delta;
      }
      if (cameraObject.y > creepSelected.y) {
        cameraObject.y -= ( Math.abs(cameraObject.y - creepSelected.y)/10 ) * delta;
      }
    } else {
      selectObject.alpha = 0;
    }

    if (game.camera.target === null) {
      cameraObject.x = game.camera.x / game.camera.scale.scale+ (game.camera.view.halfWidth/game.camera.scale.scale);
      cameraObject.y = game.camera.y / game.camera.scale.scale+ (game.camera.view.halfHeight/game.camera.scale.scale);
    }

    //Spawn creeps if too few
    if (creeps.length < minimumCreeps) {
      var missingCreeps = minimumCreeps - creeps.length;
      for (var e = 0; e < missingCreeps; e++) {
        creepSpawn(randomSpawn(100,100,2800,2800));
      }
    }

    if (food.length < minimumFood) {
      var missingFood = minimumFood - food.length;
      for (var b = 0; b < missingFood; b++) {
        spawnFood(randomSpawn(100,100,2800,2800));
      }
    }


    function compare(a,b) {
      if (a.data.foodTimer < b.data.foodTimer)
        return 1;
      if (a.data.foodTimer > b.data.foodTimer)
        return -1;
      return 0;
    }

    game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");
    game.camera.bounds = 1;
    // creeps[0].tint = 0xff0000;
    // creeps[1].tint = 0x00ff00;
    // creeps[2].tint = 0x0000ff;

    //sort creeps by lived longest
    creeps.sort(compare);

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

function cameraGoTo(position) {
  var helper;
  helper = Math.max(game.camera.width, game.camera.height) / 8;
  game.camera.deadzone = new Phaser.Rectangle((game.camera.width - helper) / 2, (game.camera.height - helper) / 2, helper, helper);
  game.camera.view.x = position.x - game.camera.view.halfWidth;
  game.camera.view.y = position.y - game.camera.view.halfHeight;
  zoomTo(1,300);
}

function zoomTo(scale, duration) {
  var mouseOffset = mouseFromCenter(),
      cview = game.camera.view;
    if (scale > zoomLevel) {
      game.add.tween(cview).to({
        x : cview.x + (cview.width*scale - cview.width*zoomLevel) + mouseOffset.x*scale,
        y : cview.y + (cview.height*scale - cview.height*zoomLevel) + mouseOffset.y*scale,
      }, duration).start();
    }
    if (scale < zoomLevel) {
      game.add.tween(cview).to({
        x : cview.x - (cview.width*zoomLevel - cview.width*scale),
        y : cview.y - (cview.height*zoomLevel - cview.height*scale),
      }, duration).start();
    }
  game.add.tween(game.camera.scale).to({
    x: scale, y: scale, scale:scale
  }, duration).start();
  // game.camera.follow(cameraObject);
  // setTimeout(function(){
  //   game.camera.unfollow();
  // },duration)
  zoomLevel = scale;
}

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
    zoomTo(scale,225);
  }
  
}

function move_camera_by_pointer(o_pointer) {
    if (!o_pointer.timeDown) { return; }
    if (o_pointer.isDown) {
      game.camera.unfollow();
      if (o_mcamera) {
        game.camera.x += o_mcamera.x - o_pointer.position.x;
        game.camera.y += o_mcamera.y - o_pointer.position.y;
      }
      o_mcamera = o_pointer.position.clone();
    }
    if (o_pointer.isUp) { o_mcamera = null; }
}



function spawnFood(data) {
  var newFood = game.add.sprite(data.x,data.y, createBlock(10, 10,'green'));
  newFood.anchor.setTo(0.5, 0.5);
  food.push(newFood);
}

function randomId(prepend) {
  return prepend + Math.random().toString(36).substr(2, 9);
}

function randomSpawn(x1,y1,width,height) {
  
  return {
    x: x1 + (Math.floor(Math.random() * width) + 1),
    y: y1 + (Math.floor(Math.random() * height) + 1)
  };
  // return {
  //   x: 960 + (Math.floor(Math.random() * 300) + 1),
  //   y: 320 + (Math.floor(Math.random() * 320) + 1)
  // };
}



function createBlock(x, y, color) {
  var name = x + '_' + color;
  if(textureRegistry[name]) {
    return textureRegistry[name];
  }

  var bmd = game.add.bitmapData(x, y);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0,0, x, y);
  textureRegistry[name] = bmd;
  return bmd;
}

function checkOverlap(spriteA, spriteB) {
  var boundsA = spriteA.getBounds();
  var boundsB = spriteB.getBounds();
  return Phaser.Rectangle.intersects(boundsA, boundsB);
}

function pointDirection(object1, object2) {
  // Returns angle between two vectors
  return Math.atan2(object2.y - object1.y, object2.x - object1.x) * 180 / Math.PI;
}

function pointDistance(pointA, pointB) {
  //Returns Distance between two points
  //pythagoras squareRoot(a*a + b*b = c*c) = c
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)); 
}

function lengthDir(length, direction) { //vector, magnitude
  if (direction < 0) direction += 360;

  return {
    x: length*Math.cos(direction),
    y: length*Math.sin(direction)
  };
}

function sigmoid(t) {
    return 1/(1+Math.pow(Math.E, -t));
}

function RGBtoHEX(r, g, b) {
  return r << 16 | g << 8 | b;
}

function mouseFromCenter() {
  var xOffset, yOffset;
  var cameraX = game.camera.view.width/2;
  var cameraY = game.camera.view.height/2;
  var mouseX = game.input.mousePointer.x;
  var mouseY = game.input.mousePointer.y;

  xOffset = mouseX - cameraX;
  yOffset = mouseY - cameraY;
  return {x: xOffset, y: yOffset};
}