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
    worldHeightInMeter: 12
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
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

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

  drawLine: function(points) {
    console.log(points);
    if (!points || points.length === 0) {
      return;
    }
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.position.Set(
                      points[0].x / this.defaults.pixelsPerMeter,
                      points[0].y / this.defaults.pixelsPerMeter);
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    var vertices = [];
    for(var i = 0, length = points.length; i < length; i++) {
      vertices.push(new Box2D.Common.Math.b2Vec2(
        points[i].x / this.defaults.pixelsPerMeter, 
        points[i].y / this.defaults.pixelsPerMeter));
    }
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
  }
};

function Pencil (world) {
  this.world = world;
  this.canvas = world.canvas;
  this.ctx = world.ctx; 
  this.ctx.strokeStyle = "rgb(255,0,0)";
  this.last = {};
  this.points = [];
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
    this.last['x'] = e.clientX;
    this.last['y'] = e.clientY;
    this.ctx.beginPath();
  },

  mouseup: function() {
    this.isMouseDown = false;
    this.world.drawLine(this.points);
    this.last = {};
    this.points = [];
    this.lastPush = new Date().getTime();
  },

  mousemove: function(e) {
    if (this.isMouseDown && new Date().getTime() - this.lastPush > 500) {
      this.draw({x: e.clientX, y: e.clientY});
      this.points.push({x: e.clientX, y: e.clientY});
      this.lastPush = new Date().getTime();
    }
  },

  draw: function(current) {
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(current.x, current.y);
    this.ctx.stroke();
    this.last = current;
  }
};
