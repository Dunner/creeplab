var mouse,
    upKey,
    downKey,
    leftKey,
    rightKey,
    leftClick;

var Controls = {};

Controls.init = function() {
  upKey = Game.input.keyboard.addKey(Phaser.Keyboard.W);
  downKey = Game.input.keyboard.addKey(Phaser.Keyboard.S);
  leftKey = Game.input.keyboard.addKey(Phaser.Keyboard.A);
  rightKey = Game.input.keyboard.addKey(Phaser.Keyboard.D);
  leftClick = Game.input.activePointer.leftButton;

  Game.input.mouse.mouseWheelCallback = function(event) {
    var scale;
    if (Game.input.mouse.wheelDelta < 0) {
      if (zoomLevel > 0.42) { scale = zoomLevel - 0.2; }}
    if (Game.input.mouse.wheelDelta > 0) {
      if (zoomLevel < 2) { scale = zoomLevel + 0.2; }}
    if (scale) { Camera.zoomTo(scale,225); }
  };
};


Controls.update = function() {};

