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

function Sk8board(sizes) {
    sizes = sizes || {} ;
    // According to http://defekt.se/2010/04/den-standardiserade-skateboarden/
    sizes.wheelRadius = sizes.wheelRadius || 0.05 ;
    sizes.boardThickness = sizes.boardThickness || 0.02 ;
    sizes.boardLength = sizes.boardLength || 0.82 ;
    sizes.truckOffset = sizes.truckOffset || 0.18 ;
    
    var offset = sizes.offset || {} ;
    offset.x = offset.x || 0 ;
    offset.y = offset.y || 0 ;
    
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
	
    fixDef.density = 1.0;
    fixDef.friction = 0.9;
    fixDef.restitution = 0.1;
    fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(sizes.wheelRadius);

    // Back wheel
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.x = sizes.wheelRadius + offset.x;
    bodyDef.position.y = sizes.wheelRadius + offset.y;
    var backwheel = SK8RGameWorld.createBody(bodyDef,fixDef);
    backwheel.SetUserData(new WheelRenderer(backwheel, sizes.wheelRadius)) ;

    // Front wheel
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.x = sizes.boardLength-sizes.wheelRadius + offset.x;
    bodyDef.position.y = sizes.wheelRadius + offset.y;
    var frontwheel = SK8RGameWorld.createBody(bodyDef,fixDef);
    frontwheel.SetUserData(new WheelRenderer(frontwheel, sizes.wheelRadius));
	
    // Deck
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    fixDef.shape.SetAsBox(sizes.boardLength / 2, sizes.boardThickness / 2);
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.x = sizes.boardLength / 2 + offset.x;
    bodyDef.position.y = sizes.boardThickness / 2 + offset.y;
    var board = SK8RGameWorld.createBody(bodyDef, fixDef);
    board.SetUserData(new DeckRenderer(board, sizes.boardLength, sizes.boardThickness)) ;

    // Trucks		
    var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    b2JointDef.bodyA = backwheel;
    b2JointDef.bodyB = board;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(-sizes.boardLength/2 + sizes.truckOffset, sizes.wheelRadius);
    SK8RGameWorld.createJoint(b2JointDef);
	
    b2JointDef.bodyA = frontwheel;
    b2JointDef.bodyB = board;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(sizes.boardLength/2 - sizes.truckOffset, sizes.wheelRadius);
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