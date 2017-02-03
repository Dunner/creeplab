var mouse,
    upKey,
    downKey,
    leftKey,
    rightKey,
    leftClick;

var Controls = {};

Controls.init = function() {
  upKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  downKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
  leftKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
  rightKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
  leftClick = game.input.activePointer.leftButton;
  game.input.mouse.mouseWheelCallback = mouseWheel;
};


Controls.update = function() {

};