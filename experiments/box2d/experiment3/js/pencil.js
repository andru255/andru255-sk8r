//from http://ejohn.org/apps/learn/#85
Function.prototype.bind = function(object){ 
  var fn = this; 
  return function(){ 
    return fn.apply(object, arguments); 
  }; 
}; 

function Pencil (canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.ctx.strokeStyle = "rgb(255,0,0)";
  this.last = {};
  this.isMouseDown = false;
  canvas.onmousedown = this.mousedown.bind(this);
  canvas.onmouseup = this.mouseup.bind(this); 
  canvas.onmousemove = this.mousemove.bind(this);
}

Pencil.prototype = {
  mousedown: function(e) {
    this.isMouseDown = true;
    console.log(e);
    this.last['x'] = e.clientX;
    this.last['y'] = e.clientY;
    this.ctx.beginPath();
  },

  mouseup: function() {
    this.isMouseDown = false;
    this.last = {};
  },

  mousemove: function(e) {
    if (this.isMouseDown) {
      this.draw({x: e.clientX, y: e.clientY});
    }
  },

  draw: function(current) {
    console.log("drawing"); 
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(current.x, current.y);
    this.ctx.stroke();
    this.last = current;
  }
};
