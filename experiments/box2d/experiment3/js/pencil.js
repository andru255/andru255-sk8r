//from http://ejohn.org/apps/learn/#85
Function.prototype.bind = function(object){ 
  var fn = this; 
  return function(){ 
    return fn.apply(object, arguments); 
  }; 
}; 

function World(options) {
  this.settings = {
    pixelsPerMeter: 40,
    worldWidthInMeter: 16,
    worldHeightInMeter: 12,
    groundHalfWidth: 0.5,
    wheelRadius: 0.05,
    boardThickness: 0.02,
    boardLength: 0.82,
    truckOffset: 0.18
  };
  for (property in options) {
    this.settings[property] = options[property];
  }
  this.world = new Box2D.Dynamics.b2World(
    new Box2D.Common.Math.b2Vec2(0, 10), true);
  this.ctx = this.settings.canvas.getContext("2d");
  this.setUpGround();
  this.setUpBoard();
  //this.setUpDebugDraw();
}

World.prototype = {
  setUpGround: function() {
    var fixDef = this.createFixture(1.0, 0.5, 0.2);

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;

    // create ground
    bodyDef.position.x = this.settings.worldWidthInMeter / 2;
    bodyDef.position.y = this.settings.worldHeightInMeter + this.settings.groundHalfWidth;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.settings.worldWidthInMeter / 2, this.settings.groundHalfWidth);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);

    // Left wall
    bodyDef.position.x = -this.settings.groundHalfWidth;
    bodyDef.position.y = this.settings.worldHeightInMeter / 2;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.settings.groundHalfWidth, this.settings.worldHeightInMeter / 2);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    // Right wall
    bodyDef.position.x = this.settings.worldWidthInMeter + this.settings.groundHalfWidth; // center
    bodyDef.position.y = this.settings.worldHeightInMeter / 2; // bottom
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(this.settings.groundHalfWidth, this.settings.worldHeightInMeter / 2);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  },

  setUpBoard: function() {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		var fixDef = this.createFixture(1.0, 0.9, 0.1); 
		fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.settings.wheelRadius);
		Actors.clear() ;

		// Back wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.settings.wheelRadius;
		bodyDef.position.y = this.settings.wheelRadius;
		var backwheel = this.world.CreateBody(bodyDef);
		backwheel.CreateFixture(fixDef);
		//this.bodies.push(backwheel) ;
		Actors.addActor(new Wheel(this.ctx, backwheel, this.settings.wheelRadius)) ;

		// Front wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.settings.boardLength-this.settings.wheelRadius;
		bodyDef.position.y = this.settings.wheelRadius;
		var frontwheel = this.world.CreateBody(bodyDef);
		frontwheel.CreateFixture(fixDef);
		//this.bodies.push(frontwheel) ;
		Actors.addActor(new Wheel(this.ctx, frontwheel, this.settings.wheelRadius)) ;
		
		// Deck
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox( this.settings.boardLength / 2, this.settings.boardThickness / 2);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.settings.boardLength / 2;
		bodyDef.position.y = this.settings.boardThickness / 2;
		var board = this.world.CreateBody(bodyDef);
		board.CreateFixture(fixDef);
		//this.bodies.push(this.board) ;
		var boardRenderer = new Board(this.ctx, board, this.settings.boardLength, this.settings.boardThickness) ;
		Actors.addActor(new Rotated(this.ctx, board, boardRenderer)) ;

		// Trucks		
		var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		b2JointDef.bodyA = backwheel;
		b2JointDef.bodyB = board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = new Box2D.Common.Math.b2Vec2(-this.settings.boardLength/2 + this.settings.truckOffset, this.settings.wheelRadius);
		var joint = this.world.CreateJoint(b2JointDef);
		//this.joints.push(joint);
		
		b2JointDef.bodyA = frontwheel;
		b2JointDef.bodyB = board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = new Box2D.Common.Math.b2Vec2(this.settings.boardLength/2 - this.settings.truckOffset, this.settings.wheelRadius);
		joint = this.world.CreateJoint(b2JointDef);
		//this.joints.push(joint);
		
		board.SetPosition(new Box2D.Common.Math.b2Vec2(0.8, 1.5));
  },

  setUpDebugDraw: function() {
    var debugDraw = new Box2D.Dynamics.b2DebugDraw();
    debugDraw.SetSprite(this.ctx);
    debugDraw.SetDrawScale(this.settings.pixelsPerMeter);
    debugDraw.SetFillAlpha(0.9);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
    this.world.SetDebugDraw(debugDraw);
  },

  update : function() {
    this.world.Step(1 / 30, 10, 10);
    //this.world.DrawDebugData();
    Actors.step(0);
    this.world.ClearForces();
  },

  createPolygon: function(line) {
    var start = this.screenToWorldCoordinates(line.start);
    var end = this.screenToWorldCoordinates(line.end);

    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.position.Set(0.0, 0.0);
    var fixDef = this.createFixture(1.0, 0.5, 0.2);
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    var vertices = [
        new Box2D.Common.Math.b2Vec2(start.x, start.y),
        new Box2D.Common.Math.b2Vec2(end.x, end.y)
    ];
    if (MathUtil.slope(start, end) > 0) {
      vertices.push(
        new Box2D.Common.Math.b2Vec2(end.x, (end.y + 0.01)),
        new Box2D.Common.Math.b2Vec2(start.x, (start.y + 0.01)));
    } else {
      vertices.push(
        new Box2D.Common.Math.b2Vec2(end.x, (end.y - 0.01)),
        new Box2D.Common.Math.b2Vec2(start.x, (start.y - 0.01)));
    }
    console.log(vertices);
    fixDef.shape.SetAsArray(vertices, vertices.length);
    this.world.CreateBody(bodyDef).CreateFixture(fixDef);
  },

  dropBalls: function() {
    var fixDef = this.createFixture(1.0, 0.5, 0.2);
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    // create some objects
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    for ( var i = 0; i < 8; ++i) {
      fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(Math.random() + 0.1);
      bodyDef.position.x = Math.random() * (this.settings.worldWidthInMeter - 3) + 1.5;
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
  },

  screenToWorldCoordinates: function(screenPosition) {
    var worldPosition = {
      x : Math.floor(screenPosition.x / this.settings.pixelsPerMeter),
      y : Math.floor(screenPosition.y / this.settings.pixelsPerMeter)
    };
    return worldPosition;
  }
};

function Pencil (world) {
  this.world = world;
  this.canvas = world.settings.canvas;
  this.canvasPosition = this.getElementPosition(this.canvas);
  console.log("canvas position");
  console.log(this.canvasPosition);
  this.ctx = world.ctx; 
  this.ctx.strokeStyle = "rgb(255,0,0)";
  this.lines = [];
  this.currentLine = {};
  this.lastPush = new Date().getTime();
  this.isMouseDown = false;
  this.canvas.onmousedown = this.mousedown.bind(this);
  this.canvas.onmouseup = this.mouseup.bind(this); 
  this.canvas.onmousemove = this.mousemove.bind(this);
}

Pencil.prototype = {
  mousedown: function(e) {
    this.isMouseDown = true;
    console.log(e);
    var mousePosition = {x: e.clientX - this.canvasPosition.x,
                           y: e.clientY - this.canvasPosition.y};
    console.log("mousedown, mouseposition");
    console.log(mousePosition);
    this.currentLine.start = mousePosition;
  },

  mouseup: function(e) {
    this.isMouseDown = false;
    if (!this.currentLine.end) {
      this.currentLine.end = this.currentLine.start;
    }
    this.lines.push(this.currentLine);
    this.world.createPolygon(this.currentLine);
    this.currentLine = {};
    this.drawAllLines();
    this.lastPush = new Date().getTime();
  },

  mousemove: function(e) {
    if (this.isMouseDown && new Date().getTime() - this.lastPush > 100) {
      this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
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
