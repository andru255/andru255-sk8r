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
    var debugDraw = false ;
    var self = {} ;
    var bodies ;
    var joints ;
    var world ;
    var actors ;
    var timerID ;
    var lastFrameTime ;
    var renderCallback = SK8RBindApply(self, renderFixtures) ;
    var deck ;
    var cameraFollowsDeck = false ;
    var renderers = new Array() ;

    function initFixtures(progressMeter) {
        createDemoGround() ;
        if (progressMeter) {
            progressMeter.progress(0.4) ;
        }
    }
		
    function initBodies(progressMeter) {
        deck = new Sk8board({
            scale : 2,
            offset : {
                x:1.2,
                y:9.8
            }
        }) ;
        if (progressMeter) {
            progressMeter.progress(0.5) ;
        }
        var sk8rbody = createSK8RRobot({
            offsetx : 1,
            offsety : 6.5,
            scale: 0.8
        }) ;
        var sk8rActor = new SK8RBotActor(sk8rbody) ;
        self.addActor(sk8rActor) ;
        window.onkeydown = SK8RBindApply(sk8rActor, sk8rActor.onkeydown) ;
        
        if (progressMeter) {
            progressMeter.progress(0.6) ;
        }
    }
		
    function step() {
        if (!world.IsLocked()) {
            // Advance physics
            world.Step(1 / 30, 10, 10);

            // Let AI-actors advance
            var now = new Date().getTime() ;
            var timeSinceLastFrame = now - lastFrameTime ;
            lastFrameTime = now ;
            for (var n=0; n<actors.length; n++) {
                actors[n].step(timeSinceLastFrame) ;
            }
            
            if (cameraFollowsDeck) {
                var wp = deck.GetPosition() ;
                SK8RCanvas.panTo(wp.x, wp.y);
            }

            // Renderers
            if (debugDraw) {
                world.DrawDebugData();
            } else {
                SK8RCanvas.clear();
                var viewportAABB = SK8RCanvas.getViewportAABB() ;
                world.QueryAABB(renderCallback, viewportAABB) ;
                for (var n=0; n<renderers.length; n++) {
                    var renderer = renderers[n].pop() ;
                    while (renderer) {
                        renderer.render() ;
                        renderer = renderers[n].pop() ;
                    }
                }
            }
            world.ClearForces();
        } else {
            if (console) {
                console.log("World is locked when entering step");
            }
        }
    }
    
    function renderFixtures(b2Fixture) {
        // TODO: bodies with several fixtures will be rendered several times using this. Might be ok
        var userdata = b2Fixture.GetBody().GetUserData() ;
        if (userdata) {
            self.queueRenderer(userdata) ;
        }
        return true ;
    }
		
    function start() {
        lastFrameTime = new Date().getTime() ;
        var callback = SK8RBindCall(self, step) ;
        timerID = window.setInterval(callback, 1000 / 30);
    }
    
    self.queueRenderer = function(renderer) {
        renderers[renderer.getZIndex()].push(renderer) ;
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
            SK8RCanvas.setupDebugDraw(world);
        }
        progressMeter.progress(0.1) ;
			
        // Setup game world
        initFixtures(progressMeter) ;
        initBodies(progressMeter) ;
        
        progressMeter.progress(0.7) ;
        for (var n=0; n<10; n++) {
            renderers[n] = new Array() ;
        }
        progressMeter.progress(1.0) ;
        SK8RCanvas.clear() ;
			
        start() ;
    }
		
    self.reset = function() {
        SK8RCanvas.clear() ;
        var n ;
        window.clearInterval(timerID) ;
        // Destroy the existing joints
        for (n = 0; n < joints.length; n++) {
            world.DestroyJoint(joints[n]);
        }
        joints = new Array() ;
        // Destroy the existing bodies
        for (n = 0; n < bodies.length; n++) {
            world.DestroyBody(bodies[n]);
        }
        bodies = new Array();
        actors = new Array() ;
        // Setup game world
        initBodies() ;
        start();
    };
    
    self.toggleFollow = function() {
        cameraFollowsDeck = !cameraFollowsDeck ;
    }
		
    self.createBody = function(bodyDef, fixtureDef) {
        var body = self.createUntrackedBody(bodyDef, fixtureDef) ;
        bodies.push(body) ;
        return body ;
    };
		
    self.createUntrackedBody = function(bodyDef, fixtureDef) {
        var fixtureDefinitions = new Array() ;
        fixtureDefinitions = fixtureDefinitions.concat(fixtureDef) ;
        var body = world.CreateBody(bodyDef) ;
        for (var n=0; n<fixtureDefinitions.length; n++) {
            body.CreateFixture(fixtureDefinitions[n]) ;
        }
        return body ;
    };

    self.createJoint = function(jointDef) {
        var joint = world.CreateJoint(jointDef);
        joints.push(joint);
        return joint ;
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
