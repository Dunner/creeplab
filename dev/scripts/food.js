
var FoodHandler = {
  food: []
};

var Food = function(data){
  this.id = Utils.randomId('Food');
  this.object = Game.add.sprite(data.x,data.y, Utils.createBlock(10, 10,'green'));
  this.object.anchor.setTo(0.5, 0.5);
};

FoodHandler.init = function(data) {
  this.minimumFood = data.minimumFood;
};

FoodHandler.update = function() {
  if (this.food.length < this.minimumFood) {
    var missingFood = this.minimumFood - this.food.length;
    for (var b = 0; b < missingFood; b++) {
      this.createFood(Utils.randomSpawn(100,100,2800,2800));
    }
  }
};

FoodHandler.createFood = function(data) {
  var food = new Food(data);
  this.food.push(food);
  return food;
};

FoodHandler.removeFood = function(food) {
  this.food.splice(this.food.indexOf(food),1);
};

Food.prototype.kill = function() {
  FoodHandler.removeFood(this);
  this.object.destroy();
};