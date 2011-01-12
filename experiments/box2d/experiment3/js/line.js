function Point(x,y) {
  this.x = x;
  this.y = y;
}

function Line (ctx) {
  this.ctx = ctx;
}

Line.prototype = {
  draw: function(from, to) {
    //not implemented
  }
};
