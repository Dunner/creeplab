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
  Game.input.mouse.mouseWheelCallback = mouseWheel;
};


Controls.update = function() {

};