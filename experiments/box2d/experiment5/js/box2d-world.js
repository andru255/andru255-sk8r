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

function World(ctx) {
	this.bodies = new Array();
	this.joints = new Array();
	this.world = new Box2D.Dynamics.b2World(
			new Box2D.Common.Math.b2Vec2(0, 10), true);
	this.ctx = ctx;
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
		this.joints = new Array() ;
		// Destroy the existing bodies
		for ( var n = 0; n < this.bodies.length; n++) {
			this.world.DestroyBody(this.bodies[n]);
		}
		this.bodies = new Array();
		
		Actors.clear() ;
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
		Actors.clear() ;
		var sk8board = new Sk8board(this.world, this.ctx) ;
		sk8board.init(this.bodies, this.joints) ;
		createRobot(this.bodies, this.joints, this.ctx, this.world, {scale: 0.4});
	},
	update : function() {
		this.world.Step(1 / 30 // frame-rate
		, 10 // velocity iterations
		, 10 // position iterations
		);
		this.world.DrawDebugData();
		//this.ctx.clearRect(0, 0, 640, 480);
		Actors.step(0) ;
		this.world.ClearForces();
	}
};
