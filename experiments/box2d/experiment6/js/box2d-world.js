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
var SK8RGameWorld = (function() {
		var self = {} ;
		var ctx ;
		var bodies ;
		var joints ;
		var world ;
		
		function initFixtures(progressMeter) {
			var fixDef = new Box2D.Dynamics.b2FixtureDef();
			fixDef.density = 1.0;
			fixDef.friction = 0.9;
			fixDef.restitution = 0.01;
			
			var bodyDef = new Box2D.Dynamics.b2BodyDef();
			bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
			
			var vertices = [
				new Box2D.Common.Math.b2Vec2(0, 11),
				new Box2D.Common.Math.b2Vec2(16,11),
				new Box2D.Common.Math.b2Vec2(16, 12),
				new Box2D.Common.Math.b2Vec2(0, 12)
			] ;
			fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
			bodyDef.position.x = 0 ;
			bodyDef.position.y = 1 ;
			world.CreateBody(bodyDef).CreateFixture(fixDef);
			progressMeter.progress(0.4) ;
		};
		
		function initBodies(progressMeter) {
			progressMeter.progress(0.5) ;
		};
		
		self.onLoad = function() {
			var canvas = document.getElementById('canvas');
			ctx = canvas.getContext('2d');
			var progressBar = new ProgressBar(ctx) ;
			var progressMeter = 
				new ProgressMeter("Initializing", 
					[
						SK8RBindApply(progressBar, progressBar.progress),
						function(taskname, progressFraction) {
							console.log("Progress [" + taskname + "]="+progressFraction*100 + "%") ;
						}
					]) ;
			bodies = new Array();
			progressMeter.progress(0.1) ;
			joints = new Array();
			progressMeter.progress(0.2) ;
			world = new Box2D.Dynamics.b2World(
					new Box2D.Common.Math.b2Vec2(0, 10), true);
			progressMeter.progress(0.3) ;
			initFixtures(progressMeter) ;
			initBodies(progressMeter) ;
			
			progressMeter.progress(1.0) ;
			ctx.clearRect(0,0,640,480) ;
		};
		
		self.reset = function() {
			// Destroy the existing joints
			for ( var n = 0; n < this.joints.length; n++) {
				world.DestroyJoint(this.joints[n]);
			}
			joints = new Array() ;
			// Destroy the existing bodies
			for ( var n = 0; n < this.bodies.length; n++) {
				world.DestroyBody(this.bodies[n]);
			}
			bodies = new Array();
		};
		
		self.createBody = function(bodyDef, fixtureDef) {
			var fixtureDefinitions = new Array() ;
			fixtureDefinitions = fixtureDefinitions.concat(tasknames) ;
			var body = world.CreateBody(bodyDef) ;
			bodies.push(body) ;
			for (var n=0; n<fixtureDefinitions.length; n++) {
				body.CreateFixture(fixtureDefinitions[n]) ;
			}
			return body ;
		};
		
		self.createJoint = function(jointDef) {
			var joint = this.world.CreateJoint(b2JointDef);
			this.joints.push(joint);
		};			
		
		return self ;
}()) ;

window.onload = function() {
	SK8RGameWorld.onLoad() ;
};
