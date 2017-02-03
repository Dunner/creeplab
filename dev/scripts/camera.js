var cameraObject,
    o_mcamera,
    zoomLevel = 1;

var Camera = {};

Camera.init = function() {
  Camera.zoomTo(0.3, 100);

  setTimeout(function(){
    game.camera.x = game.camera.view.x = -250;
    game.camera.y = game.camera.view.y = 0;
  }, 100);

  cameraObject = game.add.sprite(0,0, Utils.createBlock(0, 0,'red'));
  cameraObject.anchor.setTo(0.5, 0.5);
};


Camera.update = function() {
  game.camera.bounds = 1;

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
};


//no use atm
Camera.panTo =  function(position) {
  var helper;
  helper = Math.max(game.camera.width, game.camera.height) / 8;
  game.camera.deadzone = new Phaser.Rectangle((game.camera.width - helper) / 2, (game.camera.height - helper) / 2, helper, helper);
  game.camera.view.x = position.x - game.camera.view.halfWidth;
  game.camera.view.y = position.y - game.camera.view.halfHeight;
  Camera.zoomTo(1,300);
};

Camera.zoomTo =  function(scale, duration) {
  var mouseOffset = Camera.mouseFromCenter(),
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
};

Camera.drag =  function(o_pointer) {
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
};

Camera.mouseFromCenter = function() {
  var xOffset, yOffset;
  var cameraX = game.camera.view.width/2;
  var cameraY = game.camera.view.height/2;
  var mouseX = game.input.mousePointer.x;
  var mouseY = game.input.mousePointer.y;

  xOffset = mouseX - cameraX;
  yOffset = mouseY - cameraY;
  return {x: xOffset, y: yOffset};
};