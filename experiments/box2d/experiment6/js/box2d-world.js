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
    var debugDraw = true ;
    var self = {} ;
    var bodies ;
    var joints ;
    var world ;
    var actors ;
    var timerID ;
    var lastFrameTime ;

    function initFixtures(progressMeter) {
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 0.9;
        fixDef.restitution = 0.01;
			
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
			
        var vertices = [
        new Box2D.Common.Math.b2Vec2(0, 11),
        new Box2D.Common.Math.b2Vec2(14, 12),
        new Box2D.Common.Math.b2Vec2(0, 12)
        ] ;
        fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
        bodyDef.position.x = 0 ;
        bodyDef.position.y = 0 ;
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        if (progressMeter) {
            progressMeter.progress(0.35) ;
        }
        vertices = [
        new Box2D.Common.Math.b2Vec2(14, 12),
        new Box2D.Common.Math.b2Vec2(16, 11),
        new Box2D.Common.Math.b2Vec2(16, 12)
        ] ;
        fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
        bodyDef.position.x = 0 ;
        bodyDef.position.y = 0 ;
        world.CreateBody(bodyDef).CreateFixture(fixDef);
        if (progressMeter) {
            progressMeter.progress(0.4) ;
        }
    }
		
    function initBodies(progressMeter) {
        var sk8board = new Sk8board({
            wheelRadius:0.1
        }) ;
        sk8board.init({
            x:1,
            y:10.5
        }) ;
        if (progressMeter) {
            progressMeter.progress(0.5) ;
        }
    }
		
    function step() {
        world.Step(1 / 30 // frame-rate
            , 10 // velocity iterations
            , 10 // position iterations
            );
        if (debugDraw) {
            world.DrawDebugData();
        } else {
            SK8RCanvas.clear();
        }
        var now = new Date().getTime() ;
        var timeSinceLastFrame = now - lastFrameTime ;
        lastFrameTime = now ;
        for (var n=0; n<actors.length; n++) {
            actors[n].step(timeSinceLastFrame) ;
        }
        world.ClearForces();
    }
		
    function start() {
        lastFrameTime = new Date().getTime() ;
        var callback = SK8RBindCall(self, step) ;
        timerID = window.setInterval(callback, 1000 / 30);
    }
		
    self.onLoad = function() {
        var progressBar = new ProgressBar(SK8RCanvas.getContext()) ;
        var progressMeter = 
        new ProgressMeter("Initializing", 
            [
            SK8RBindApply(progressBar, progressBar.progress),
            function(taskname, progressFraction) {
                console.log("Progress [" + taskname + "]="+progressFraction*100 + "%") ;
            }
            ]) ;
        // Iniitalize globals
        bodies = new Array();
        joints = new Array();
        actors = new Array();
        world = new Box2D.Dynamics.b2World(
            new Box2D.Common.Math.b2Vec2(0, 10), true);
        // setup debug draw
        if (debugDraw) {
            var dd = new Box2D.Dynamics.b2DebugDraw();
            dd.SetSprite(SK8RCanvas.getContext());
            dd.SetDrawScale(40);
            dd.SetFillAlpha(0.6);
            dd.SetLineThickness(1.0);
            dd.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit
                | Box2D.Dynamics.b2DebugDraw.e_jointBit);
            world.SetDebugDraw(dd);
        }
        progressMeter.progress(0.1) ;
			
        // Setup game world
        initFixtures(progressMeter) ;
        initBodies(progressMeter) ;
			
        progressMeter.progress(1.0) ;
        SK8RCanvas.clear() ;
			
        start() ;
    };
		
    self.reset = function() {
        window.clearInterval(timerID) ;
        // Destroy the existing joints
        for ( var n = 0; n < joints.length; n++) {
            world.DestroyJoint(joints[n]);
        }
        joints = new Array() ;
        // Destroy the existing bodies
        for ( var n = 0; n < bodies.length; n++) {
            world.DestroyBody(bodies[n]);
        }
        bodies = new Array();
			
        // Setup game world
        initFixtures() ;
        initBodies() ;
        start();
    };
		
    self.createBody = function(bodyDef, fixtureDef) {
        var fixtureDefinitions = new Array() ;
        fixtureDefinitions = fixtureDefinitions.concat(fixtureDef) ;
        var body = world.CreateBody(bodyDef) ;
        bodies.push(body) ;
        for (var n=0; n<fixtureDefinitions.length; n++) {
            body.CreateFixture(fixtureDefinitions[n]) ;
        }
        return body ;
    };
		
    self.createJoint = function(jointDef) {
        var joint = world.CreateJoint(jointDef);
        joints.push(joint);
    };			
		
    self.addActor = function(actor) {
        if (actor) {
            actors.push(actor) ;
        }
    };
		
    self.removeActor = function(actor) {
        actors = actors.filter(function(curValue, curIndex, curArray) 
        {
            return (element != actor) ;
        }
        );
    };
		
    return self ;
}()) ;

window.onload = function() {
    SK8RCanvas.onLoad() ;
    SK8RGameWorld.onLoad() ;
};
