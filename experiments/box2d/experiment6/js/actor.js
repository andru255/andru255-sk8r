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

function Wheel(body, radius) {
    this.body = body ;
    this.radius = radius ;
    this.body.SetUserData(this) ;
}

    Wheel.prototype.render = function() {
        var worldPosition = this.body.GetPosition() ;
        var screenPosition = SK8RCanvas.worldToScreen(worldPosition) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(
            screenPosition.x, 
            screenPosition.y, 
            SK8RCanvas.worldLengthToScreen(this.radius), 
            0, 
            Math.PI * 2, 
            false);
        ctx.closePath();
        ctx.fill();
    }


function Rotated(body) {
    this.body = body ;
    this.body.SetUserData(this) ;
}

    Rotated.prototype.render = function() {
        var worldPosition = this.body.GetPosition() ;
        var screenPosition = SK8RCanvas.worldToScreen(worldPosition) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.save();
        ctx.translate(screenPosition.x, screenPosition.y);
        ctx.rotate(this.body.GetAngle());
        this.renderRotated() ;	
        ctx.restore() ;
    }
    Rotated.prototype.renderRotated = function() {
        if (console) {
            console.log("Forgot to override renderRotated") ;
        }
    }

function Deck(body, length, thickness) {
    Rotated.call(this, body) ;
    this.length = length ;
    this.thickness = thickness ;
}

Deck.prototype = SK8RDelegate(Rotated.prototype) ;
    Deck.prototype.constructor = Deck;
    Deck.prototype.renderRotated = function()  {
        var lengthPxls = SK8RCanvas.worldLengthToScreen(this.length) ;
        var thicknessPxls = SK8RCanvas.worldLengthToScreen(this.thickness) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(-lengthPxls/2, -thicknessPxls/2,
            lengthPxls, thicknessPxls);
    }

function Sk8board(sizes) {
    sizes = sizes || {} ;
    this.sizes = {} ;
    // According to http://defekt.se/2010/04/den-standardiserade-skateboarden/
    this.sizes.wheelRadius = sizes.wheelRadius || 0.05 ;
    this.sizes.boardThickness = sizes.boardThickness || 0.02 ;
    this.sizes.boardLength = sizes.boardLength || 0.82 ;
    this.sizes.truckOffset = sizes.truckOffset || 0.18 ;
}

    Sk8board.prototype.init = function(offset) {
        offset = offset || {} ;
        offset.x = offset.x || 0 ;
        offset.y = offset.y || 0 ;
        var bodyDef = new Box2D.Dynamics.b2BodyDef();
        var fixDef = new Box2D.Dynamics.b2FixtureDef();
	
        fixDef.density = 1.0;
        fixDef.friction = 0.9;
        fixDef.restitution = 0.1;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.sizes.wheelRadius);

        // Back wheel
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = this.sizes.wheelRadius + offset.x;
        bodyDef.position.y = this.sizes.wheelRadius + offset.y;
        var backwheel = SK8RGameWorld.createBody(bodyDef,fixDef);
        new Wheel(backwheel, this.sizes.wheelRadius) ;

        // Front wheel
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = this.sizes.boardLength-this.sizes.wheelRadius + offset.x;
        bodyDef.position.y = this.sizes.wheelRadius + offset.y;
        var frontwheel = SK8RGameWorld.createBody(bodyDef,fixDef);
        new Wheel(frontwheel, this.sizes.wheelRadius);
	
        // Deck
        fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixDef.shape.SetAsBox(this.sizes.boardLength / 2, this.sizes.boardThickness / 2);
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = this.sizes.boardLength / 2 + offset.x;
        bodyDef.position.y = this.sizes.boardThickness / 2 + offset.y;
        var board = SK8RGameWorld.createBody(bodyDef, fixDef);
        new Deck(board, this.sizes.boardLength, this.sizes.boardThickness) ;

        // Trucks		
        var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
        b2JointDef.bodyA = backwheel;
        b2JointDef.bodyB = board;
        b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
        b2JointDef.localAnchorB = 
        new Box2D.Common.Math.b2Vec2(-this.sizes.boardLength/2 + this.sizes.truckOffset, this.sizes.wheelRadius);
        SK8RGameWorld.createJoint(b2JointDef);
	
        b2JointDef.bodyA = frontwheel;
        b2JointDef.bodyB = board;
        b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
        b2JointDef.localAnchorB = 
        new Box2D.Common.Math.b2Vec2(this.sizes.boardLength/2 - this.sizes.truckOffset, this.sizes.wheelRadius);
        SK8RGameWorld.createJoint(b2JointDef);
    }

function createRobot(bodies, joints, ctx, world, sizes) {
    sizes = sizes || {} ;
    sizes.scale = sizes.scale || 1 ;
    sizes.createoffsetx = sizes.createoffsetx || 0.7*sizes.scale ;
    sizes.createoffsety = sizes.createoffsety || -1.7*sizes.scale ;
	
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.9;
    fixDef.restitution = 0.1;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
	
    // right leg
    bodyDef.position.x = sizes.createoffsetx + (0.5*sizes.scale);
    bodyDef.position.y = sizes.createoffsety + (3*sizes.scale);
    fixDef.shape.SetAsBox(0.25*sizes.scale, 0.5*sizes.scale);
    var rightLeg = world.CreateBody(bodyDef);
    rightLeg.CreateFixture(fixDef) ;
    bodies.push(rightLeg) ;
	
    // Left leg
    bodyDef.position.x = sizes.createoffsetx + (-0.5*sizes.scale);
    bodyDef.position.y = sizes.createoffsety + (3*sizes.scale);
    fixDef.shape.SetAsBox(0.25*sizes.scale, 0.5*sizes.scale);
    var leftLeg = world.CreateBody(bodyDef);
    leftLeg.CreateFixture(fixDef) ;
    bodies.push(leftLeg) ;
	
    // Right arm
    bodyDef.position.x = sizes.createoffsetx + (2.25*sizes.scale);
    bodyDef.position.y = sizes.createoffsety + (1.5*sizes.scale);
    fixDef.shape.SetAsBox(0.25*sizes.scale, 0.5*sizes.scale);
    var rightArm = world.CreateBody(bodyDef);
    rightArm.CreateFixture(fixDef) ;
    bodies.push(rightArm) ;
	
    // Left arm
    bodyDef.position.x = sizes.createoffsetx + (0.5*sizes.scale);
    bodyDef.position.y = sizes.createoffsety + (1.5*sizes.scale);
    fixDef.shape.SetAsBox(0.25*sizes.scale, 0.5*sizes.scale);
    var leftArm = world.CreateBody(bodyDef);
    leftArm.CreateFixture(fixDef) ;
    bodies.push(leftArm) ;
	
    // Body
    bodyDef.position.x = sizes.createoffsetx + (1.25*sizes.scale);
    bodyDef.position.y = sizes.createoffsety + (1.25*sizes.scale);
    fixDef.shape.SetAsArray([
        new Box2D.Common.Math.b2Vec2(-0.75 * sizes.scale, -0.75 * sizes.scale),
        new Box2D.Common.Math.b2Vec2(-0.25 * sizes.scale, -1.25 * sizes.scale),
        new Box2D.Common.Math.b2Vec2(0.25 * sizes.scale, -1.25 * sizes.scale),
        new Box2D.Common.Math.b2Vec2(0.75 * sizes.scale, -0.75 * sizes.scale),
        new Box2D.Common.Math.b2Vec2(0.75 * sizes.scale, 1.25 * sizes.scale),
        new Box2D.Common.Math.b2Vec2(-0.75 * sizes.scale, 1.25 * sizes.scale)
        ]);
    var body = world.CreateBody(bodyDef) ;
    body.CreateFixture(fixDef) ;
    bodies.push(body) ;
	
    // Arm joints
    var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    b2JointDef.bodyA = body;
    var joint ;
    // Right arm
    b2JointDef.bodyB = rightArm;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0.75*sizes.scale, -0.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(-0.25*sizes.scale, -0.5*sizes.scale);
    b2JointDef.lowerAngle = -Math.PI ;
    b2JointDef.upperAngle = 0.5 ;
    b2JointDef.enableLimit = true ;
    joint = world.CreateJoint(b2JointDef);
    joints.push(joint);
    // Left arm
    b2JointDef.bodyB = leftArm;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(-0.75*sizes.scale, -0.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(0.25*sizes.scale, -0.5*sizes.scale);
    b2JointDef.lowerAngle = -0.5 ;
    b2JointDef.upperAngle = Math.PI;
    b2JointDef.enableLimit = true ;
    joint = world.CreateJoint(b2JointDef);
    joints.push(joint);
	
    // Leg joints
    b2JointDef = new Box2D.Dynamics.Joints.b2PrismaticJointDef();
    b2JointDef.bodyA = body;
    b2JointDef.localAxisA =  new Box2D.Common.Math.b2Vec2(0,1);
    b2JointDef.lowerTranslation = -0.5*sizes.scale ;
    b2JointDef.upperTranslation = 0.5*sizes.scale ;
    b2JointDef.enableLimit = true ;
    // Right leg
    b2JointDef.bodyB = rightLeg;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0.5*sizes.scale, 1.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(0*sizes.scale, -0.5*sizes.scale);
    joint = world.CreateJoint(b2JointDef);
    joints.push(joint);
	
    // Left leg
    b2JointDef.bodyB = leftLeg;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(-0.5*sizes.scale, 1.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(0*sizes.scale, -0.5*sizes.scale);
    joint = world.CreateJoint(b2JointDef);
    joints.push(joint);
}