/*
Copyright 2011 Johan Maasing

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

var gameWorld;
window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	gameWorld = new World(ctx);
	gameWorld.init();
}

function reset() {
	gameWorld.reset();
}

// Global constants
var pixelsPerMeter = 40;
var worldWidthInMeter = 16; // 640/pixelsPerMeter ;
var worldHeightInMeter = 12; // 480/pixelsPerMeter ;
// According to http://defekt.se/2010/04/den-standardiserade-skateboarden/
var wheelRadius = 0.05;
var boardThickness = 0.02 ;
var boardLength = 0.82 ;
var truckOffset = 0.18 ;

var wheelRadiusInPixels = wheelRadius * pixelsPerMeter ;
var halfBoardThicknessInPixels = Math.max(1,Math.round(boardThickness/2 * pixelsPerMeter)) ;
var halfBoardLengthInPixels = Math.max(1,Math.round(boardLength/2 * pixelsPerMeter)) ;

function World(ctx) {
	this.bodies = new Array();
	this.joints = new Array();
	this.world = new Box2D.Dynamics.b2World(
			new Box2D.Common.Math.b2Vec2(0, 10), true);
	this.ctx = ctx;
	this.backwheel;
	this.frontwheel;
	this.board;
}

function bind(obj, fn) {
	return function() {
			fn.call(obj) ;
	};
}

World.prototype = {
	init : function() {
		
		this.initRamp() ;
		this.initBodies();

		// setup debug draw
		var debugDraw = new Box2D.Dynamics.b2DebugDraw();
		debugDraw.SetSprite(this.ctx);
		debugDraw.SetDrawScale(pixelsPerMeter);
		debugDraw.SetFillAlpha(0.6);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit
				| Box2D.Dynamics.b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(debugDraw);
		
		var callback = bind(this, this.update) ;
		this.timerId = window.setInterval(callback, 1000 / 30);
	},
	reset : function() {
		// Destroy the existing joints
		for ( var n = 0; n < this.joints.length; n++) {
			this.world.DestroyJoint(this.joints[n]);
		}
		// Destroy the existing bodies
		for ( var n = 0; n < this.bodies.length; n++) {
			this.world.DestroyBody(this.bodies[n]);
		}
		this.bodies = new Array();

		this.initBodies();
	},
	initRamp : function() {
		var fixDef = new Box2D.Dynamics.b2FixtureDef();
		fixDef.density = 1.0;
		fixDef.friction = 0.9;
		fixDef.restitution = 0.01;
		
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 0),
			new Box2D.Common.Math.b2Vec2(1,1),
			new Box2D.Common.Math.b2Vec2(2, 3),
			new Box2D.Common.Math.b2Vec2(2, 11),
			new Box2D.Common.Math.b2Vec2(0, 11)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 0 ;
		bodyDef.position.y = 1 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 0),
			new Box2D.Common.Math.b2Vec2(2, 4),
			new Box2D.Common.Math.b2Vec2(2, 6),
			new Box2D.Common.Math.b2Vec2(0, 6)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 2 ;
		bodyDef.position.y = 6 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 0),
			new Box2D.Common.Math.b2Vec2(1, 1),
			new Box2D.Common.Math.b2Vec2(1, 2),
			new Box2D.Common.Math.b2Vec2(0, 2)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 4 ;
		bodyDef.position.y = 10 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 0),
			new Box2D.Common.Math.b2Vec2(2, 1),
			new Box2D.Common.Math.b2Vec2(0, 1)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 5 ;
		bodyDef.position.y = 11 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 0),
			new Box2D.Common.Math.b2Vec2(2, 0),
			new Box2D.Common.Math.b2Vec2(2, 1),
			new Box2D.Common.Math.b2Vec2(0, 1)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 7 ;
		bodyDef.position.y = 12 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 1),
			new Box2D.Common.Math.b2Vec2(2, 0),
			new Box2D.Common.Math.b2Vec2(2, 1)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 9 ;
		bodyDef.position.y = 11 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 1),
			new Box2D.Common.Math.b2Vec2(1, 0),
			new Box2D.Common.Math.b2Vec2(1, 2),
			new Box2D.Common.Math.b2Vec2(0, 2)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 11 ;
		bodyDef.position.y = 10 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 4),
			new Box2D.Common.Math.b2Vec2(2, 0),
			new Box2D.Common.Math.b2Vec2(2, 6),
			new Box2D.Common.Math.b2Vec2(0, 6)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 12;
		bodyDef.position.y = 6 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
		
		var vertices = [
			new Box2D.Common.Math.b2Vec2(0, 3),
			new Box2D.Common.Math.b2Vec2(1, 1),
			new Box2D.Common.Math.b2Vec2(2, 0),
			new Box2D.Common.Math.b2Vec2(2, 12),
			new Box2D.Common.Math.b2Vec2(0, 12)
		] ;
		fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
		bodyDef.position.x = 14 ;
		bodyDef.position.y = 1 ;
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
	},
	initBodies : function() {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		var fixDef = new Box2D.Dynamics.b2FixtureDef();
		
		fixDef.density = 1.0;
		fixDef.friction = 0.9;
		fixDef.restitution = 0.1;
		fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(wheelRadius);

		// Back wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = wheelRadius;
		bodyDef.position.y = wheelRadius;
		this.backwheel = this.world.CreateBody(bodyDef);
		this.backwheel.CreateFixture(fixDef);
		this.bodies.push(this.backwheel) ;

		// Front wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = boardLength-wheelRadius;
		bodyDef.position.y = wheelRadius;
		this.frontwheel = this.world.CreateBody(bodyDef);
		this.frontwheel.CreateFixture(fixDef);
		this.bodies.push(this.frontwheel) ;
		
		// Deck
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(boardLength / 2, boardThickness / 2);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = boardLength / 2;
		bodyDef.position.y = boardThickness / 2;
		this.board = this.world.CreateBody(bodyDef);
		this.board.CreateFixture(fixDef);
		this.bodies.push(this.board) ;

		// Trucks		
		var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		b2JointDef.bodyA = this.backwheel;
		b2JointDef.bodyB = this.board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = new Box2D.Common.Math.b2Vec2(-boardLength/2 + truckOffset, wheelRadius);
		var joint = this.world.CreateJoint(b2JointDef);
		this.joints.push(joint);
		
		b2JointDef.bodyA = this.frontwheel;
		b2JointDef.bodyB = this.board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = new Box2D.Common.Math.b2Vec2(boardLength/2 - truckOffset, wheelRadius);
		joint = this.world.CreateJoint(b2JointDef);
		this.joints.push(joint);
		
		this.board.SetPosition(new Box2D.Common.Math.b2Vec2(0.8, 1.5));
	},
	drawBoard : function() {
		this.ctx.fillStyle = "#ff0000";
		var worldPosition = this.frontwheel.GetPosition() ;
		var x = Math.round(worldPosition.x * pixelsPerMeter) ;
		var y = Math.round(worldPosition.y * pixelsPerMeter) ;
		this.ctx.beginPath();
		this.ctx.arc(x, y, wheelRadiusInPixels, 0, Math.PI * 2, false);
		this.ctx.closePath();
		this.ctx.fill();
		
		worldPosition = this.backwheel.GetPosition() ;
		x = Math.round(worldPosition.x * pixelsPerMeter) ;
		y = Math.round(worldPosition.y * pixelsPerMeter) ;
		this.ctx.beginPath();
		this.ctx.arc(x, y, wheelRadiusInPixels, 0, Math.PI * 2, false);
		this.ctx.closePath();
		this.ctx.fill();
		
		worldPosition = this.board.GetPosition() ;
		x = Math.round(worldPosition.x * pixelsPerMeter) ;
		y = Math.round(worldPosition.y * pixelsPerMeter) ;
		this.ctx.fillStyle = "#0000ff";
		this.ctx.fillRect(
			x-halfBoardLengthInPixels,
			y-halfBoardThicknessInPixels,
			halfBoardLengthInPixels*2,
			halfBoardThicknessInPixels*2);
	},
	update : function() {
		this.world.Step(1 / 30 // frame-rate
		, 10 // velocity iterations
		, 10 // position iterations
		);
		this.world.DrawDebugData();
		//this.ctx.clearRect(0, 0, 640, 480);
		//this.drawBoard();
		this.world.ClearForces();
	}
};
