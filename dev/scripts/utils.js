var Utils = {};


Utils.compare = function(a,b) {
  if (b < a)
    {return 1;}
  if (b > a)
    {return -1;}
  return 0;
};

//reverse? property1, property2. nested search property1[proprty2]
Utils.dynamicSort = function(reverse, property, property2) {
  var sortOrder = 1;
  if(reverse) { sortOrder = -1;}
  return function (a,b) {
    var result;
    if (property2) {
      result = (a[property][property2] < b[property][property2]) ? -1 : (a[property][property2] > b[property][property2]) ? 1 : 0;
    } else {
      result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    }
    return result * sortOrder;
  };

};

Utils.randomId = function(prepend) {
  return prepend + Math.random().toString(36).substr(2, 9);
};

Utils.randomSpawn = function(x1,y1,width,height) {
  
  return {
    x: x1 + (Math.floor(Math.random() * width) + 1),
    y: y1 + (Math.floor(Math.random() * height) + 1)
  };
  
};

Utils.createBlock = function(x, y, color) {
  var name = x + '_' + color;
  if(textureRegistry[name]) {
    return textureRegistry[name];
  }

  var bmd = Game.add.bitmapData(x, y);
  bmd.ctx.fillStyle = color;
  bmd.ctx.fillRect(0,0, x, y);
  textureRegistry[name] = bmd;
  return bmd;
};

Utils.angle360 = function(angle) {
  var angle360 = angle;
  if(angle < 0) {
    angle360 = Math.abs(angle + 360);
  }
  return angle360;
};

Utils.checkOverlap = function(spriteA, spriteB) {
  var boundsA = spriteA.getBounds();
  var boundsB = spriteB.getBounds();
  return Phaser.Rectangle.intersects(boundsA, boundsB);
};

Utils.pointDirection = function(object1, object2) {
  // Returns angle between two vectors
  return Math.atan2(object2.y - object1.y, object2.x - object1.x) * 180 / Math.PI;
};

Utils.pointDistance = function(pointA, pointB) {
  //Returns Distance between two points
  //pythagoras squareRoot(a*a + b*b = c*c) = c
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)); 
};

Utils.lengthDir = function(length, direction) { //vector, magnitude
  if (direction < 0) {direction += 360;}

  return {
    x: length*Math.cos(direction),
    y: length*Math.sin(direction)
  };
};

Utils.sigmoid = function(t) {
  return 1/(1+Math.pow(Math.E, -t));
};

Utils.normalize = function(value, min, max) {
  var normalized = (value - min) / (max - min);
  return normalized;
};

Utils.denormalize = function(normalized, min, max) {
  var denormalized = (normalized - min) / (max - min);
  return denormalized;
};

Utils.RGBtoHEX = function(r, g, b) {
  return (r << 16 | g << 8 | b);
};