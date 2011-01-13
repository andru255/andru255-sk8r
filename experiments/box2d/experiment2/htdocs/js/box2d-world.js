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
var groundHalfWidth = 0.5;
var numberOfLinks = 16;
var linkRadius = 0.2;

function World(ctx) {
	this.bodies = new Array();
	this.joints = new Array();
	this.world = new Box2D.Dynamics.b2World(
			new Box2D.Common.Math.b2Vec2(0, 10), true);
	this.ctx = ctx;
}

World.prototype = {
	init : function() {
		var fixDef = new Box2D.Dynamics.b2FixtureDef();
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;

		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
		
		// create ground
		bodyDef.position.x = worldWidthInMeter / 2;
		bodyDef.position.y = worldHeightInMeter + groundHalfWidth;
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(worldWidthInMeter / 2, groundHalfWidth);
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		// Left wall
		bodyDef.position.x = -groundHalfWidth;
		bodyDef.position.y = worldHeightInMeter / 2;
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(groundHalfWidth, worldHeightInMeter / 2);
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		// Right wall
		bodyDef.position.x = worldWidthInMeter + groundHalfWidth; // center
		bodyDef.position.y = worldHeightInMeter / 2; // bottom
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(groundHalfWidth, worldHeightInMeter / 2);
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		// Pyramid
		bodyDef.position.x = worldWidthInMeter / 2 + 0.3;
		bodyDef.position.y = worldHeightInMeter - groundHalfWidth*4;
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(worldWidthInMeter / 8, groundHalfWidth*3);
		this.world.CreateBody(bodyDef).CreateFixture(fixDef);

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

		window.setInterval(gameWorld.update, 1000 / 30);
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
	initBodies : function() {
		var fixDef = new Box2D.Dynamics.b2FixtureDef();
		fixDef.density = 1.0;
		fixDef.friction = 0.5;
		fixDef.restitution = 0.2;
		// 0.1 meter radius
		fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(linkRadius);

		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

		// Create chain
		var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(linkRadius, 0);
		b2JointDef.localAnchorB = new Box2D.Common.Math.b2Vec2(-linkRadius, 0);

		var linkOffsetX = worldWidthInMeter / 2 - linkRadius * numberOfLinks;
		var previousLink;
		for ( var n = 0; n < numberOfLinks; n++) {
			bodyDef.position.x = linkOffsetX + linkRadius * 2 * n;
			bodyDef.position.y = 0.1;
			var link = this.world.CreateBody(bodyDef);
			link.CreateFixture(fixDef);
			this.bodies.push(link);

			if (previousLink) {
				b2JointDef.bodyA = previousLink;
				b2JointDef.bodyB = link;
				var joint = this.world.CreateJoint(b2JointDef);
				this.joints.push(joint);
			}
			previousLink = link;
		}
	},
	update : function() {
		gameWorld.world.Step(1 / 30 // frame-rate
		, 10 // velocity iterations
		, 10 // position iterations
		);
		gameWorld.world.DrawDebugData();
		gameWorld.world.ClearForces();
	}
};
