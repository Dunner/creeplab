var Layers=[{name:"inputs",neurons:[{name:"speed",value:0,min:0,max:5},{name:"energy",value:50,min:0,max:1e3},{name:"foodAngle",value:0,min:-180,max:180},{name:"foodDist",value:0,min:0,max:5e3}]},{name:"hidden1",neurons:[{name:0,value:0,type:"sum"},{name:1,value:0,type:"sum"},{name:2,value:0,type:"sum"},{name:3,value:0,type:"sum"},{name:4,value:1,type:"const"}]},{name:"output",neurons:[{name:"speed",value:0},{name:"angle",value:0}]}],Brain=function(){this.id=Math.random().toString(36).substr(2,9),this.layers=[],this.neurons=[],this.synapses=[]},Layer=function(n){this.name=n,this.neurons=[]},Neuron=function(n,e){var t=this;Object.keys(e).forEach(function(n){t[n]=e[n]}),this.layer=n,this.synapsesIn=[],this.synapsesOut=[],this.calc=function(){var n=0;t.synapsesIn.forEach(function(e){n+=e.calc()}),"inputs"!==t.layer.name&&"const"!==t.type&&(this.value=Math.round(100*Utils.sigmoid(n))/100)}},Synapse=function(n,e,t){var a=this;this.neuronFrom=n,this.neuronTo=e,this.input=n.value,this.weight=t||2*Math.random()+-1,this.calc=function(){return a.input=n.value,Math.round(a.input*a.weight*100)/100}};Brain.prototype.populate=function(n){var e=this;n.forEach(function(n){e.createLayer(n.name,n.neurons)}),e.layers.forEach(function(n,t){var a=n.neurons;e.layers[t+1]&&e.layers[t+1].neurons.length>0&&a.forEach(function(n){e.layers[t+1].neurons.forEach(function(t){var a=new Synapse(n,t,null);n.attachSynapse(a,"out"),t.attachSynapse(a,"in"),e.synapses.push(a)})})})},Brain.prototype.crossGenes=function(n,e){this.populate(Layers);for(var t=0;t<n.synapses.length;t++)this.synapses[t].weight=Math.random()<.5?n.synapses[t].weight:e.synapses[t].weight;return this.mutate(1),this},Brain.prototype.mutate=function(n){for(var e=0;e<n;e++){var t=Math.floor(Math.random()*this.synapses.length)+1,a=Math.random()<.5?-.05:.05;this.synapses[t-1].weight+=a}},Brain.prototype.think=function(){this.neurons.forEach(function(n){n.calc()})},Brain.prototype.findInput=function(n){for(var e=0;e<this.layers[0].neurons.length;e++){var t=this.layers[0].neurons[e];if(t.name===n)return t}},Brain.prototype.findOutput=function(n){for(var e=0;e<this.layers[2].neurons.length;e++){var t=this.layers[2].neurons[e];if(t.name===n)return t}},Brain.prototype.createLayer=function(n,e){var t=this,a=new Layer(n);return this.layers.push(a),e.forEach(function(n){t.createNeuron(a,n)}),a},Brain.prototype.createNeuron=function(n,e){return e=new Neuron(n,e),this.neurons.push(e),n.neurons.push(e),e},Neuron.prototype.setValue=function(n){this.value=Math.round(100*Utils.normalize(n,this.min,this.max))/100},Neuron.prototype.attachSynapse=function(n,e){"in"===e&&this.synapsesIn.push(n),"out"===e&&this.synapsesOut.push(n)},Neuron.prototype.detachSynapse=function(n,e){"in"===e&&this.synapsesIn.push(n),"out"===e&&this.synapsesOut.push(n)},Synapse.prototype.changeWeight=function(n){},Synapse.prototype.randomizeWeight=function(){},Synapse.prototype.mutate=function(){};
var cameraObject,mouseCamera,zoomLevel=1,Camera={};Camera.init=function(){Camera.zoomTo(.3,100),setTimeout(function(){Game.camera.x=Game.camera.view.x=-250,Game.camera.y=Game.camera.view.y=0},100),cameraObject=Game.add.sprite(0,0,Utils.createBlock(0,0,"red")),cameraObject.anchor.setTo(.5,.5)},Camera.update=function(){Game.camera.bounds=1,creepSelected&&creepSelected.object.alive?(selectObject.alpha=1,selectObject.position=creepSelected.object.position,cameraObject.x<creepSelected.object.x&&(cameraObject.x+=Math.abs(cameraObject.x-creepSelected.object.x)/10*delta),cameraObject.x>creepSelected.object.x&&(cameraObject.x-=Math.abs(cameraObject.x-creepSelected.object.x)/10*delta),cameraObject.y<creepSelected.object.y&&(cameraObject.y+=Math.abs(cameraObject.y-creepSelected.object.y)/10*delta),cameraObject.y>creepSelected.object.y&&(cameraObject.y-=Math.abs(cameraObject.y-creepSelected.object.y)/10*delta)):selectObject.alpha=0,null===Game.camera.target&&(cameraObject.x=Game.camera.x/Game.camera.scale.scale+Game.camera.view.halfWidth/Game.camera.scale.scale,cameraObject.y=Game.camera.y/Game.camera.scale.scale+Game.camera.view.halfHeight/Game.camera.scale.scale)},Camera.panTo=function(e){var a;a=Math.max(Game.camera.width,Game.camera.height)/8,Game.camera.deadzone=new Phaser.Rectangle((Game.camera.width-a)/2,(Game.camera.height-a)/2,a,a),Game.camera.view.x=e.x-Game.camera.view.halfWidth,Game.camera.view.y=e.y-Game.camera.view.halfHeight,Camera.zoomTo(1,300)},Camera.zoomTo=function(e,a){var m=Camera.mouseFromCenter(),c=Game.camera.view;e>zoomLevel&&Game.add.tween(c).to({x:c.x+(c.width*e-c.width*zoomLevel)+m.x*e,y:c.y+(c.height*e-c.height*zoomLevel)+m.y*e},a).start(),e<zoomLevel&&Game.add.tween(c).to({x:c.x-(c.width*zoomLevel-c.width*e),y:c.y-(c.height*zoomLevel-c.height*e)},a).start(),Game.add.tween(Game.camera.scale).to({x:e,y:e,scale:e},a).start(),zoomLevel=e},Camera.drag=function(e){e.timeDown&&(e.isDown&&(Game.camera.unfollow(),mouseCamera&&(Game.camera.x+=mouseCamera.x-e.position.x,Game.camera.y+=mouseCamera.y-e.position.y),mouseCamera=e.position.clone()),e.isUp&&(mouseCamera=null))},Camera.mouseFromCenter=function(){var e,a,m=Game.camera.view.width/2,c=Game.camera.view.height/2,t=Game.input.mousePointer.x,r=Game.input.mousePointer.y;return e=t-m,a=r-c,{x:e,y:a}};
var mouse,upKey,downKey,leftKey,rightKey,leftClick,Controls={};Controls.init=function(){upKey=Game.input.keyboard.addKey(Phaser.Keyboard.W),downKey=Game.input.keyboard.addKey(Phaser.Keyboard.S),leftKey=Game.input.keyboard.addKey(Phaser.Keyboard.A),rightKey=Game.input.keyboard.addKey(Phaser.Keyboard.D),leftClick=Game.input.activePointer.leftButton,Game.input.mouse.mouseWheelCallback=function(e){var o;Game.input.mouse.wheelDelta<0&&zoomLevel>.42&&(o=zoomLevel-.2),Game.input.mouse.wheelDelta>0&&zoomLevel<2&&(o=zoomLevel+.2),o&&Camera.zoomTo(o,225)}},Controls.update=function(){};
var CreepHandler={creeps:[]},Creep=function(e){Object.assign(this,{id:Utils.randomId("Creep"),energy:50,fitness:0,lived:0,foodAngle:0,foodDist:0,timesBetweenFood:[],avgTimeBetweenFood:999,timeSinceLastFood:0,brain:{},traits:{color:Math.random()}}),e.brain?this.brain=e.brain:(this.brain=new Brain,this.brain.populate(Layers)),this.object=Game.add.image(e.x,e.y,Utils.createBlock(20,20,"white")),this.object.anchor.setTo(.5),this.object.inputEnabled=!0,this.object.speed=0,this.object.angle=0;var t=this;this.object.events.onInputDown.add(function(){initCreepUI(t),creepSelected=t})};CreepHandler.init=function(e){this.minimumCreeps=e.minimumCreeps},CreepHandler.update=function(){for(var e=0;e<this.creeps.length;e++)this.creeps[e].update();if(this.creeps.length<this.minimumCreeps)for(var t=this.minimumCreeps-this.creeps.length,i=0;i<t;i++)this.createCreep(Utils.randomSpawn(100,100,2800,2800))},CreepHandler.createCreep=function(e){var t=new Creep(e);return this.creeps.push(t),t},CreepHandler.removeCreep=function(e){this.creeps.splice(this.creeps.indexOf(e),1)},CreepHandler.findCreep=function(e){for(var t=0;t<this.creeps.length;t++)if(this.creeps[t].id===e)return this.creeps[t];return!1},Creep.prototype.kill=function(){this.object.destroy(),this.object.events.destroy(),CreepHandler.removeCreep(this)},Creep.prototype.update=function(){if(this.lived+=1*delta,this.energy-=.03*delta,this.timeSinceLastFood+=.1*delta,this.object.scale.setTo(this.energy/100,this.energy/100),this.energy<=0&&this.kill(),this.object.speed){var e=Utils.lengthDir(this.object.speed*delta,Utils.angle360(this.object.angle)*Math.PI/180);this.object.x+=e.x,this.object.y+=e.y}if(this.findFood(),this.giveBirth(),creepSelected&&this.id===creepSelected.id&&updateCreepUI(this),controlSelected&&creepSelected&&this.id===creepSelected.id)this.control();else{var t=this.brain.findOutput("speed").value;this.object.speed=2.5*t*delta,this.energy-=this.object.speed/15;var i=this.brain.findOutput("angle").value,r=i<.5?-1:1;this.object.angle+=r*i*6*delta,this.object.tint=16777215*this.traits.color,this.lived%(15/delta)===0&&this.think()}},Creep.prototype.think=function(){this.brain.findInput("speed").setValue(this.object.speed/delta),this.brain.findInput("energy").setValue(this.energy),this.brain.findInput("foodAngle").setValue(this.foodAngle),this.brain.findInput("foodDist").setValue(this.foodDist),this.brain.think()},Creep.prototype.giveBirth=function(){var e=this;if(e.lived%(15/delta)===0)for(var t=0;t<CreepHandler.creeps.length;t++)if(e!==CreepHandler.creeps[t]&&e.object.alive&&CreepHandler.creeps[t].object.alive&&e.energy>190){var i=Utils.pointDistance(e.object.position,CreepHandler.creeps[t].object.position);if(i<30){e.energy-=100,Game.add.tween(e.object.scale).to({x:e.energy/100,y:e.energy/100},1e3).start();var r=new Brain;r.crossGenes(e.brain,CreepHandler.creeps[t].brain);var n=CreepHandler.createCreep({x:e.object.x,y:e.object.y,brain:r});n.traits.color=(e.traits.color+CreepHandler.creeps[t].traits.color)/2,n.energy=100}}},Creep.prototype.findFood=function(){var e,t=this,i=999;if(t.lived%(15/delta)===0)for(var r=0;r<FoodHandler.food.length;r++){var n=FoodHandler.food[r];if(n.object.alive&&t.object.alive){var o=Utils.pointDistance(t.object.position,n.object.position);o<i&&(i=o,e=n),o<30&&(t.eat(n),n.kill(n.id))}}if(e){t.foodDist=i;var s=Utils.angle360(t.object.angle),a=Utils.angle360(Utils.pointDirection(t.object.position,e.object.position)),d=(s-a+360)%360;d>180&&(d=-360+d),d=Math.round(d),t.foodAngle=d}},Creep.prototype.eat=function(){var e=this;if(e.energy+50<250&&(e.energy+=50,Game.add.tween(e.object.scale).to({x:e.energy/100,y:e.energy/100},1e3).start()),e.timesBetweenFood.push(e.timeSinceLastFood),e.timeSinceLastFood=0,e.timesBetweenFood.length>10){e.sustainable||(e.sustainable=!0),e.avgTimeBetweenFood=0,e.timesBetweenFood.slice(0,1);for(var t=0;t<e.timesBetweenFood.length;t++)e.avgTimeBetweenFood+=e.timesBetweenFood[t];e.avgTimeBetweenFood=Math.round(e.avgTimeBetweenFood/e.timesBetweenFood.length)}},Creep.prototype.control=function(){creepSelected.energy=50,upKey.isDown&&creepSelected.object.speed<3?creepSelected.object.speed+=.1:creepSelected.object.speed>.05&&(creepSelected.object.speed-=.05),rightKey.isDown&&(creepSelected.angle.angle+=3),leftKey.isDown&&(creepSelected.angle.angle-=3)};
var FoodHandler={food:[]},Food=function(o){this.id=Utils.randomId("Food"),this.object=Game.add.sprite(o.x,o.y,Utils.createBlock(10,10,"green")),this.object.anchor.setTo(.5,.5)};FoodHandler.init=function(o){this.minimumFood=o.minimumFood},FoodHandler.update=function(){if(this.food.length<this.minimumFood)for(var o=this.minimumFood-this.food.length,d=0;d<o;d++)this.createFood(Utils.randomSpawn(100,100,2800,2800))},FoodHandler.createFood=function(o){var d=new Food(o);return this.food.push(d),d},FoodHandler.removeFood=function(o){this.food.splice(this.food.indexOf(o),1)},Food.prototype.kill=function(){FoodHandler.removeFood(this),this.object.destroy()};
var Game={},ticks=0,mutations=0,creeps=[],food=[],creepSelected,controlSelected=!1,textureRegistry={},bestWeights={lived:0,weights:{}},info={},minimumCreeps=300,minimumFood=300,delta=1;$(function(){function e(){Game.stage.disableVisibilityChange=!0,Game.time.advancedTiming=!0}function t(){Game.stage.backgroundColor="#222",Game.world.setBounds(0,0,3e3,3e3),Controls.init(),Camera.init(),FoodHandler.init({minimumFood:minimumFood}),CreepHandler.init({minimumCreeps:minimumCreeps}),selectObject=Game.add.sprite(0,0,Utils.createBlock(50,50,"lightblue")),selectObject.anchor.setTo(.5,.5)}function i(){ticks+=1*delta,Camera.drag(Game.input.mousePointer),Camera.drag(Game.input.pointer1),Camera.update(),Controls.update(),FoodHandler.update(),CreepHandler.update(),Game.debug.text(Game.time.fps||"--",2,14,"#00ff00"),ticks%50===0&&creeps.sort(Utils.dynamicSort(!1,"avgTimeBetweenFood")),info={mutations:mutations,creepsAlive:CreepHandler.creeps.length,bestCreep:{lived:CreepHandler.creeps[0].lived,id:CreepHandler.creeps[0].id},bestAllTime:bestWeights.lived,ticks:ticks},updateGameInfo()}var a=$("#spetsad-canvas");Game=new Phaser.Game(a[0].offsetWidth,a[0].offsetHeight,Phaser.AUTO,a[0].id,{preload:e,create:t,update:i})});
function clear(){creepInfoElement.empty()}function updateGameInfo(){gameInfoElement.empty(),gameInfoElement.append("<p>Ticks: "+info.ticks+"</p>"),gameInfoElement.append("<p>Creeps alive: "+info.creepsAlive+"</p>"),gameInfoElement.append("<p>Best all-time creep: "+info.bestAllTime+" ticks</p>"),gameInfoElement.append("<br>"),gameInfoElement.append("<p>Best current creep: "+info.bestCreep.lived+" ticks</p>")}function updateCreepUI(e){if(e){$("#creep-info-data").empty(),$("#creep-info-data").append("<p>creepID: "+e.id+"</p>"),$("#creep-info-data").append("<p>Lived: "+e.lived+"</p>"),$("#creep-info-data").append("<p>Energy: "+Math.round(1*e.energy)/1+"</p>"),$("#creep-info-data").append("<p>Time between food: "+e.avgTimeBetweenFood+"</p>");var n=e.brain.neurons;n.forEach(function(e){var n=$("#"+e.layer.name+"-"+e.name);n.css({"border-bottom":Math.round(n.outerHeight()*e.value)+"px solid lightblue"}),n.html(Math.round(100*e.value)/100)})}}function initCreepUI(e){if(clear(),controlSelected=!1,creepInfoElement.append('<div id="creep-info-data"></div>'),creepInfoElement.append('<div id="creep-info-network"></div>'),$("#creep-info").append('<div id="creep-control-wrapper">Control this creep: </div>'),$("<input />",{type:"checkbox",id:"creepControl"}).appendTo($("#creep-control-wrapper")),e){$("#creep-info-network").append('<svg id="svg-lines"></svg>');var n=e.brain.layers,r=e.brain.synapses;drawLayers(n),drawSynapses(r)}}function drawSynapses(e){for(var n=0;n<e.length;n++){var r=e[n],t=r.weight;$(document.createElementNS("http://www.w3.org/2000/svg","line")).attr({id:"line"+n,x1:0,y1:0,x2:300,y2:300,"stroke-width":4*t,stroke:"lightblue"}).appendTo("#svg-lines");var a=$("#line"+n),o=$("#"+r.neuronFrom.layer.name+"-"+r.neuronFrom.name).position(),p=$("#"+r.neuronTo.layer.name+"-"+r.neuronTo.name).position();a.attr("stroke-width",4*t).attr("x1",o.left+15).attr("y1",o.top+15).attr("x2",p.left+15).attr("y2",p.top+15)}}function updateSynapses(e){for(var n=0;n<e.length;n++){var r=e[n],t=r.weight,a=$("#line"+n),o=$("#"+r.neuronFrom.layer.name+"-"+r.neuronFrom.name).position(),p=$("#"+r.neuronTo.layer.name+"-"+r.neuronTo.name).position();a.attr("x1",o.left+15).attr("y1",o.top+15).attr("x2",p.left+15).attr("y2",p.top+15).attr("stroke-width",4*t)}}function drawLayers(e){e.forEach(function(e,n){var r=e.name;e.neurons.forEach(function(e,t){var a=e.name,o=$('<div desc="'+a+'" class="neuron '+r+'" id="'+r+"-"+a+'">'+e.value+"</div>");o.css({left:10+80*n+"px",top:10+40*t+"px"}),$("#creep-info-network").append(o)})})}var uiElement=$("#ui"),gameInfoElement=$("#game-info"),creepInfoElement=$("#creep-info");$("#button-selectbest").click(function(){creepSelected=CreepHandler.creeps[0],Game.camera.follow(cameraObject),initCreepUI(creepSelected)}),$("#button-selectrandom").click(function(){creepSelected=CreepHandler.creeps[Math.floor(Math.random()*CreepHandler.creeps.length)+1-1],Game.camera.follow(cameraObject),initCreepUI(creepSelected)}),$("body").click(function(e){"creepControl"===e.target.id&&(controlSelected=$("#creepControl").prop("checked"))});var slider=$("#slider"),sliderBox=$("#slider-box");slider.change(function(){delta=$(this).val()/2,sliderBox.empty(),sliderBox.append("<B>Game-speed: "+$(this).val()/2+"</B>")});
var Utils={};Utils.compare=function(t,n){return n<t?1:n>t?-1:0},Utils.dynamicSort=function(t,n,r){var i=1;return t&&(i=-1),function(t,a){var e;return e=r?t[n][r]<a[n][r]?-1:t[n][r]>a[n][r]?1:0:t[n]<a[n]?-1:t[n]>a[n]?1:0,e*i}},Utils.randomId=function(t){return t+Math.random().toString(36).substr(2,9)},Utils.randomSpawn=function(t,n,r,i){return{x:t+(Math.floor(Math.random()*r)+1),y:n+(Math.floor(Math.random()*i)+1)}},Utils.createBlock=function(t,n,r){var i=t+"_"+r;if(textureRegistry[i])return textureRegistry[i];var a=Game.add.bitmapData(t,n);return a.ctx.fillStyle=r,a.ctx.fillRect(0,0,t,n),textureRegistry[i]=a,a},Utils.angle360=function(t){var n=t;return t<0&&(n=Math.abs(t+360)),n},Utils.checkOverlap=function(t,n){var r=t.getBounds(),i=n.getBounds();return Phaser.Rectangle.intersects(r,i)},Utils.pointDirection=function(t,n){return 180*Math.atan2(n.y-t.y,n.x-t.x)/Math.PI},Utils.pointDistance=function(t,n){return Math.sqrt(Math.pow(t.x-n.x,2)+Math.pow(t.y-n.y,2))},Utils.lengthDir=function(t,n){return n<0&&(n+=360),{x:t*Math.cos(n),y:t*Math.sin(n)}},Utils.sigmoid=function(t){return 1/(1+Math.pow(Math.E,-t))},Utils.normalize=function(t,n,r){var i=(t-n)/(r-n);return i},Utils.denormalize=function(t,n,r){var i=(t-n)/(r-n);return i},Utils.RGBtoHEX=function(t,n,r){return t<<16|n<<8|r};