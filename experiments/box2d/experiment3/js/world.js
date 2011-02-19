(function() {
  var SkateBoard, World, b2Body, b2BodyDef, b2CircleShape, b2DebugDraw, b2DynamicBody, b2Fixture, b2FixtureDef, b2MassData, b2PolygonShape, b2RevoluteJointDef, b2StaticBody, b2Vec2, b2World, createFixture, screenToWorld, worldPositionToScreenPosition, worldToScreen;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.onload = function() {
    var Line, b2dWorld, canvas, line, skateboard, world;
    Line = window.Line;
    console.log(Line);
    canvas = document.getElementById("canvas");
    b2dWorld = new b2World(new b2Vec2(0, 10), true);
    world = new World(b2dWorld, canvas);
    skateboard = new SkateBoard(b2dWorld, canvas);
    line = null;
    window.ollie = function() {
      return skateboard.ollie(document.getElementById("x").value, document.getElementById("y").value);
    };
    window.update = __bind(function() {
      world.setDebug(document.getElementById("debug").value);
      return world.update();
    }, this);
    canvas.onmousedown = __bind(function(e) {
      line = new Line(b2dWorld, canvas);
      return line.setStart(e);
    }, this);
    canvas.onmouseup = __bind(function(e) {
      if (line != null) {
        line.setEnd(e);
        line.render();
        line.create();
        world.addActor(line);
        return line = null;
      }
    }, this);
    canvas.onmousemove = __bind(function(e) {
      if (line != null) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        line.setEnd(e);
        return line.render();
      }
    }, this);
    window.play = function() {
      skateboard.create();
      return world.addActor(skateboard);
    };
    return setInterval(window.update, 1000 / 30);
  };
  b2Vec2 = Box2D.Common.Math.b2Vec2;
  b2BodyDef = Box2D.Dynamics.b2BodyDef;
  b2Body = Box2D.Dynamics.b2Body;
  b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
  b2Fixture = Box2D.Dynamics.b2Fixture;
  b2World = Box2D.Dynamics.b2World;
  b2MassData = Box2D.Collision.Shapes.b2MassData;
  b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
  b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
  b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
  b2StaticBody = Box2D.Dynamics.b2Body.b2_staticBody;
  b2DynamicBody = Box2D.Dynamics.b2Body.b2_dynamicBody;
  b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
  createFixture = function(density, friction, restitution) {
    var fixDef;
    fixDef = new b2FixtureDef();
    fixDef.density = density;
    fixDef.friction = friction;
    fixDef.restitution = restitution;
    return fixDef;
  };
  worldPositionToScreenPosition = function(wp) {
    return {
      x: Math.round(wp.x * 40),
      y: Math.round(wp.y * 40)
    };
  };
  screenToWorld = function(sp) {
    return {
      x: parseFloat(sp.x / 40.0),
      y: parseFloat(sp.y / 40.0)
    };
  };
  worldToScreen = function(length) {
    return Math.max(1, Math.round(length * 40));
  };
  World = (function() {
    function World(world, canvas) {
      this.world = world;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.pixelsPerMeter = 40;
      this.worldWidthInMeter = 16;
      this.worldHeightInMeter = 12;
      this.groundHalfWidth = 0.5;
      this.actors = [];
      this.debug = false;
      this.setUpDebugDraw();
      this.create();
    }
    World.prototype.create = function() {
      var bodyDef, fixDef;
      fixDef = createFixture(1.0, 0.5, 0.2);
      fixDef.shape = new b2PolygonShape();
      fixDef.shape.SetAsBox(this.worldWidthInMeter / 2, this.groundHalfWidth);
      bodyDef = new b2BodyDef();
      bodyDef.type = b2StaticBody;
      bodyDef.position.Set(this.worldWidthInMeter / 2, this.worldHeightInMeter + this.groundHalfWidth);
      this.world.CreateBody(bodyDef).CreateFixture(fixDef);
      bodyDef.position.Set(-this.groundHalfWidth, this.worldHeightInMeter / 2);
      fixDef.shape.SetAsBox(this.groundHalfWidth, this.worldHeightInMeter / 2);
      this.world.CreateBody(bodyDef).CreateFixture(fixDef);
      bodyDef.position.Set(this.worldWidthInMeter + this.groundHalfWidth, this.worldHeightInMeter / 2);
      fixDef.shape.SetAsBox(this.groundHalfWidth, this.worldHeightInMeter / 2);
      return this.world.CreateBody(bodyDef).CreateFixture(fixDef);
    };
    World.prototype.setDebug = function(debug) {
      if (debug) {
        return this.debug = true;
      } else {
        return this.debug = false;
      }
    };
    World.prototype.setUpDebugDraw = function() {
      var debugDraw;
      debugDraw = new b2DebugDraw();
      debugDraw.SetSprite(this.ctx);
      debugDraw.SetDrawScale(this.pixelsPerMeter);
      debugDraw.SetFillAlpha(0.9);
      debugDraw.SetLineThickness(1.0);
      debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
      return this.world.SetDebugDraw(debugDraw);
    };
    World.prototype.addActor = function(actor) {
      return this.actors.push(actor);
    };
    World.prototype.update = function() {
      var actor, _i, _len, _ref;
      this.world.Step(1 / 30, 10, 10);
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      _ref = this.actors;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        actor = _ref[_i];
        actor.step(0);
      }
      if (this.debug) {
        this.world.DrawDebugData();
      }
      return this.world.ClearForces();
    };
    return World;
  })();
  SkateBoard = (function() {
    function SkateBoard(world, canvas) {
      this.world = world;
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.wheelRadius = 0.05;
      this.boardThickness = 0.02;
      this.boardLength = 0.82;
      this.truckOffset = 0.18;
      this.lengthPxls = worldToScreen(this.boardLength);
      this.thicknessPxls = worldToScreen(this.boardThickness);
      this.board;
      this.fronwheel;
      this.backwheel;
    }
    SkateBoard.prototype.create = function() {
      var b2JointDef, bodyDef, fixDef, joint;
      bodyDef = new b2BodyDef();
      fixDef = createFixture(1.0, 0.9, 0.1);
      fixDef.shape = new b2CircleShape(this.wheelRadius);
      bodyDef.type = b2DynamicBody;
      bodyDef.position.Set(this.wheelRadius, this.wheelRadius);
      this.backwheel = this.world.CreateBody(bodyDef);
      this.backwheel.CreateFixture(fixDef);
      bodyDef.position.Set(this.boardLength - this.wheelRadius, this.wheelRadius);
      this.frontwheel = this.world.CreateBody(bodyDef);
      this.frontwheel.CreateFixture(fixDef);
      fixDef.shape = new b2PolygonShape();
      fixDef.shape.SetAsBox(this.boardLength / 2, this.boardThickness / 2);
      bodyDef.position.Set(this.boardLength / 2, this.boardThickness / 2);
      this.board = this.world.CreateBody(bodyDef);
      this.board.CreateFixture(fixDef);
      b2JointDef = new b2RevoluteJointDef();
      b2JointDef.bodyA = this.backwheel;
      b2JointDef.bodyB = this.board;
      b2JointDef.localAnchorA = new b2Vec2(0, 0);
      b2JointDef.localAnchorB = new b2Vec2(-this.boardLength / 2 + this.truckOffset, this.wheelRadius);
      joint = this.world.CreateJoint(b2JointDef);
      b2JointDef.bodyA = this.frontwheel;
      b2JointDef.bodyB = this.board;
      b2JointDef.localAnchorA = new b2Vec2(0, 0);
      b2JointDef.localAnchorB = new b2Vec2(this.boardLength / 2 - this.truckOffset, this.wheelRadius);
      joint = this.world.CreateJoint(b2JointDef);
      return this.board.SetPosition(new b2Vec2(0.8, 1.5));
    };
    SkateBoard.prototype.step = function(timeSinceLastStep) {
      var screenPosition, worldPosition;
      worldPosition = this.board.GetPosition();
      screenPosition = worldPositionToScreenPosition(worldPosition);
      this.ctx.save();
      this.ctx.translate(screenPosition.x, screenPosition.y);
      this.ctx.rotate(this.board.GetAngle());
      this.render(timeSinceLastStep);
      this.ctx.restore();
      this.renderWheel(this.backwheel);
      return this.renderWheel(this.frontwheel);
    };
    SkateBoard.prototype.render = function() {
      this.ctx.fillStyle = "#00ff00";
      return this.ctx.fillRect(-this.lengthPxls / 2, -this.thicknessPxls / 2, this.lengthPxls, this.thicknessPxls);
    };
    SkateBoard.prototype.renderWheel = function(wheel) {
      var screenPosition, worldPosition;
      worldPosition = wheel.GetPosition();
      screenPosition = worldPositionToScreenPosition(worldPosition);
      this.ctx.fillStyle = "#ff0000";
      this.ctx.beginPath();
      this.ctx.arc(screenPosition.x, screenPosition.y, worldToScreen(this.wheelRadius), 0, Math.PI * 2, false);
      this.ctx.closePath();
      return this.ctx.fill();
    };
    SkateBoard.prototype.ollie = function(x, y) {
      var localCenter;
      localCenter = this.board.GetLocalCenter().Copy();
      localCenter.x -= this.boardLength / 2.0;
      return this.board.ApplyImpulse(new b2Vec2(x, y), localCenter);
    };
    return SkateBoard;
  })();
}).call(this);
