//from http://ejohn.org/apps/learn/#85
Function.prototype.bind = function(object){ 
  var fn = this; 
  return function(){ 
    return fn.apply(object, arguments); 
  }; 
}; 

function World(options) {
  this.defaults = {
    pixelsPerMeter: 40,
    worldWidthInMeter: 16,
    worldHeightInMeter: 12,
    groundHalfWidth: 0.5
  };
  for (property in options) {
    this.defaults[property] = options[property];
  }
  this.world = new Box2D.Dynamics.b2World(
    new Box2D.Common.Math.b2Vec2(0, 10), true);
    this.ctx = this.defaults.canvas.getContext("2d");
    this.setUpGround();
    this.setUpDebugDraw();
    //window.setInterval(this.update.bind(this), 1000 / 30);
}

World.prototype = {
  setUpGround: function() {
    var fixDef = this.createFixture(1.0, 0.5, 0.2);

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;

    // create ground
    bodyDef.position.x = this.defaults.worldWidthInMeter / 2;
    bodyDef.position.y = this.defaults.worldHeightInMeter + this.defaults.groundHalfWidth;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.defaults.worldWidthInMeter / 2, this.defaults.groundHalfWidth);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);

    // Left wall
    bodyDef.position.x = -this.defaults.groundHalfWidth;
    bodyDef.position.y = this.defaults.worldHeightInMeter / 2;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.defaults.groundHalfWidth, this.defaults.worldHeightInMeter / 2);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    // Right wall
    bodyDef.position.x = this.defaults.worldWidthInMeter + this.defaults.groundHalfWidth; // center
    bodyDef.position.y = this.defaults.worldHeightInMeter / 2; // bottom
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.defaults.groundHalfWidth, this.defaults.worldHeightInMeter / 2);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  },

  setUpDebugDraw: function() {
    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite(this.ctx);
    debugDraw.SetDrawScale(this.defaults.pixelsPerMeter);
    debugDraw.SetFillAlpha(0.9);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
  },

  update : function() {
    this.world.Step(1 / 30, 10, 10);
    this.world.DrawDebugData();
    this.world.ClearForces();
  },

  createPolygon: function(line) {
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    console.log(line);
    bodyDef.position.Set(
     line.start.x / this.defaults.pixelsPerMeter, 
     line.start.y / this.defaults.pixelsPerMeter);
    var fixDef = this.createFixture(1.0, 0.5, 0.2);
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    console.log(this.defaults.pixelsPerMeter);
    var vertices = [
      new Box2D.Common.Math.b2Vec2(line.start.x / this.defaults.pixelsPerMeter, 
                                   line.start.y / this.defaults.pixelsPerMeter),
      new Box2D.Common.Math.b2Vec2(line.start.x/this.defaults.pixelsPerMeter, 
                                   (line.start.y + 0.1) / this.defaults.pixelsPerMeter),
      new Box2D.Common.Math.b2Vec2(line.end.x/this.defaults.pixelsPerMeter, 
                                   line.end.y/this.defaults.pixelsPerMeter),
      new Box2D.Common.Math.b2Vec2(line.end.x/this.defaults.pixelsPerMeter, 
                                   (line.end.y + 0.1) / this.defaults.pixelsPerMeter)
    ];
    console.log(vertices);
    fixDef.shape.SetAsArray(vertices, vertices.length);
    console.log(fixDef);
    console.log(bodyDef);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  },

  dropBalls: function() {
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    // create some objects
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    for ( var i = 0; i < 8; ++i) {
      if (Math.random() > 0.5) {
        fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        fixDef.shape.SetAsBox(Math.random() + 0.1, Math.random() + 0.1);
      } else {
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(Math.random() + 0.1);
      }
      bodyDef.position.x = Math.random() * (this.defaults.worldWidthInMeter - 3) + 1.5;
      bodyDef.position.y = Math.random() * 3;
      var body  = this.world.CreateBody(bodyDef) ;
      body.CreateFixture(fixDef);
    }
  },

  createFixture: function(density, friction, restitution) {
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = density;
    fixDef.friction = friction;
    fixDef.restitution = restitution;
    return fixDef;
  }
};

function Pencil (world) {
  this.world = world;
  this.canvas = world.canvas;
  this.canvasPosition = this.getElementPosition(canvas);
  console.log(this.canvasPosition);
  this.ctx = world.ctx; 
  this.ctx.strokeStyle = "rgb(255,0,0)";
  this.lines = [];
  this.currentLine = {};
  this.lastPush = new Date().getTime();
  this.isMouseDown = false;
  canvas.onmousedown = this.mousedown.bind(this);
  canvas.onmouseup = this.mouseup.bind(this); 
  canvas.onmousemove = this.mousemove.bind(this);
}

Pencil.prototype = {
  mousedown: function(e) {
    this.isMouseDown = true;
    console.log(e);
    var mousePosition = {x: e.clientX - this.canvasPosition.x,
                           y: e.clientY - this.canvasPosition.y};
    console.log(mousePosition);
    this.currentLine.start = mousePosition;
  },

  mouseup: function(e) {
    this.isMouseDown = false;
    this.lines.push(this.currentLine);
    this.world.createPolygon(this.currentLine);
    this.currentLine = {};
    this.drawAllLines();
    this.lastPush = new Date().getTime();
  },

  mousemove: function(e) {
    if (this.isMouseDown && new Date().getTime() - this.lastPush > 100) {
      this.ctx.clearRect(0,0, canvas.width, canvas.height);
      var mousePosition = {x: e.clientX - this.canvasPosition.x,
                           y: e.clientY - this.canvasPosition.y};
      this.currentLine.end = mousePosition;
      this.draw(this.currentLine.start, this.currentLine.end);
      this.drawAllLines();
      this.lastPush = new Date().getTime();
    }
  },

  drawAllLines: function() {
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i];
      this.draw(line.start, line.end);
    }
  },

  draw: function(start, end) {
      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
      this.ctx.closePath();
  },

  //http://js-tut.aardon.de/js-tut/tutorial/position.html
  getElementPosition: function (element) {
    var elem=element, tagname="", x=0, y=0;

    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
      y += elem.offsetTop;
      x += elem.offsetLeft;
      tagname = elem.tagName.toUpperCase();

      if(tagname == "BODY")
        elem=0;

      if(typeof(elem) == "object") {
        if(typeof(elem.offsetParent) == "object")
          elem = elem.offsetParent;
        }
    }

    return {x: x, y: y};
  }
};
