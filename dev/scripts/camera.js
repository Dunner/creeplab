var cameraObject,
    mouseCamera,
    zoomLevel = 1;

var Camera = {};

Camera.init = function() {
  Camera.zoomTo(0.3, 100);

  setTimeout(function(){
    Game.camera.x = Game.camera.view.x = -250;
    Game.camera.y = Game.camera.view.y = 0;
  }, 100);

  cameraObject = Game.add.sprite(0,0, Utils.createBlock(0, 0,'red'));
  cameraObject.anchor.setTo(0.5, 0.5);
};


Camera.update = function() {
  Game.camera.bounds = 1;

  if (creepSelected && creepSelected.object.alive) {
    selectObject.alpha = 1;
    selectObject.position = creepSelected.object.position;
    //Camera
    if (cameraObject.x < creepSelected.object.x) {
      cameraObject.x += ( Math.abs(cameraObject.x - creepSelected.object.x)/10 ) * delta;
    }
    if (cameraObject.x > creepSelected.object.x) {
      cameraObject.x -= ( Math.abs(cameraObject.x - creepSelected.object.x)/10 ) * delta;
    }
    
    if (cameraObject.y < creepSelected.object.y) {
      cameraObject.y += ( Math.abs(cameraObject.y - creepSelected.object.y)/10 ) * delta;
    }
    if (cameraObject.y > creepSelected.object.y) {
      cameraObject.y -= ( Math.abs(cameraObject.y - creepSelected.object.y)/10 ) * delta;
    }
  } else {
    selectObject.alpha = 0;
  }

  if (Game.camera.target === null) {
    cameraObject.x = Game.camera.x / Game.camera.scale.scale+ (Game.camera.view.halfWidth/Game.camera.scale.scale);
    cameraObject.y = Game.camera.y / Game.camera.scale.scale+ (Game.camera.view.halfHeight/Game.camera.scale.scale);
  }
};


//no use atm
Camera.panTo =  function(position) {
  var helper;
  helper = Math.max(Game.camera.width, Game.camera.height) / 8;
  Game.camera.deadzone = new Phaser.Rectangle((Game.camera.width - helper) / 2, (Game.camera.height - helper) / 2, helper, helper);
  Game.camera.view.x = position.x - Game.camera.view.halfWidth;
  Game.camera.view.y = position.y - Game.camera.view.halfHeight;
  Camera.zoomTo(1,300);
};

Camera.zoomTo =  function(scale, duration) {
  var mouseOffset = Camera.mouseFromCenter(),
      cview = Game.camera.view;
    if (scale > zoomLevel) {
      Game.add.tween(cview).to({
        x : cview.x + (cview.width*scale - cview.width*zoomLevel) + mouseOffset.x*scale,
        y : cview.y + (cview.height*scale - cview.height*zoomLevel) + mouseOffset.y*scale,
      }, duration).start();
    }
    if (scale < zoomLevel) {
      Game.add.tween(cview).to({
        x : cview.x - (cview.width*zoomLevel - cview.width*scale),
        y : cview.y - (cview.height*zoomLevel - cview.height*scale),
      }, duration).start();
    }
  Game.add.tween(Game.camera.scale).to({
    x: scale, y: scale, scale:scale
  }, duration).start();
  // Game.camera.follow(cameraObject);
  // setTimeout(function(){
  //   Game.camera.unfollow();
  // },duration)
  zoomLevel = scale;
};

Camera.drag =  function(pointer) {
  if (!pointer.timeDown) { return; }
  if (pointer.isDown) {
    Game.camera.unfollow();
    if (mouseCamera) {
      Game.camera.x += mouseCamera.x - pointer.position.x;
      Game.camera.y += mouseCamera.y - pointer.position.y;
    }
    mouseCamera = pointer.position.clone();
  }
  if (pointer.isUp) { mouseCamera = null; }
};

Camera.mouseFromCenter = function() {
  var xOffset, yOffset;
  var cameraX = Game.camera.view.width/2;
  var cameraY = Game.camera.view.height/2;
  var mouseX = Game.input.mousePointer.x;
  var mouseY = Game.input.mousePointer.y;

  xOffset = mouseX - cameraX;
  yOffset = mouseY - cameraY;
  return {x: xOffset, y: yOffset};
};