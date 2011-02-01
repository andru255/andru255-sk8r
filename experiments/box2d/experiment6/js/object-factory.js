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
    
    return board ;
}

function createDemoGround() {
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
    var staticBody = SK8RGameWorld.createUntrackedBody(bodyDef, fixDef) ; 
    staticBody.SetUserData(new GroundRenderer(staticBody, vertices)) ;    

    vertices = [
    new Box2D.Common.Math.b2Vec2(14, 12),
    new Box2D.Common.Math.b2Vec2(16, 11.5),
    new Box2D.Common.Math.b2Vec2(16, 12)
    ] ;
    fixDef.shape = Box2D.Collision.Shapes.b2PolygonShape.AsArray(vertices, vertices.length) ;
    bodyDef.position.x = 0 ;
    bodyDef.position.y = 0 ;
    staticBody = SK8RGameWorld.createUntrackedBody(bodyDef, fixDef) ; 
    staticBody.SetUserData(new GroundRenderer(staticBody, vertices)) ;    
}

function createRobot(sizes) {
    sizes = sizes || {} ;
    sizes.scale = sizes.scale || 1 ;
    sizes.offsetx = sizes.offsetx || 0.7*sizes.scale ;
    sizes.offsety = sizes.offsety || -1.7*sizes.scale ;
	
    var bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
	
    var fixDef = new Box2D.Dynamics.b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.9;
    fixDef.restitution = 0.1;
    fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    
    var limbHalfWidth = 0.25*sizes.scale ;
    var limbHalfHeight = 0.5*sizes.scale ;
	
    // right leg
    bodyDef.position.x = sizes.offsetx + (0.75*sizes.scale);
    bodyDef.position.y = sizes.offsety + (3*sizes.scale);
    fixDef.shape.SetAsBox(limbHalfWidth, limbHalfHeight);
    var rightLeg = SK8RGameWorld.createBody(bodyDef, fixDef) ; 
    rightLeg.SetUserData(new ArmRenderer(rightLeg, limbHalfWidth*2, limbHalfHeight*2)) ;
	
    // Left leg
    bodyDef.position.x = sizes.offsetx + (1.75*sizes.scale);
    bodyDef.position.y = sizes.offsety + (3*sizes.scale);
    fixDef.shape.SetAsBox(limbHalfWidth, limbHalfHeight);
    var leftLeg = SK8RGameWorld.createBody(bodyDef, fixDef) ; 
    leftLeg.SetUserData(new ArmRenderer(leftLeg, limbHalfWidth*2, limbHalfHeight*2)) ;
	
    // Right arm
    bodyDef.position.x = sizes.offsetx + (2.25*sizes.scale);
    bodyDef.position.y = sizes.offsety + (1.5*sizes.scale);
    fixDef.shape.SetAsBox(limbHalfWidth, limbHalfHeight);
    var rightArm = SK8RGameWorld.createBody(bodyDef, fixDef) ; 
    rightArm.SetUserData(new ArmRenderer(rightArm, limbHalfWidth*2, limbHalfHeight*2)) ;
	
    // Left arm
    bodyDef.position.x = sizes.offsetx + (0.25*sizes.scale);
    bodyDef.position.y = sizes.offsety + (1.5*sizes.scale);
    fixDef.shape.SetAsBox(limbHalfWidth, limbHalfHeight);
    var leftArm = SK8RGameWorld.createBody(bodyDef, fixDef) ; 
    leftArm.SetUserData(new ArmRenderer(leftArm, limbHalfWidth*2, limbHalfHeight*2)) ;
	
    // Body
    bodyDef.position.x = sizes.offsetx + (1.25*sizes.scale);
    bodyDef.position.y = sizes.offsety + (1.25*sizes.scale);
    var bodyVertices = [
    new Box2D.Common.Math.b2Vec2(-0.75 * sizes.scale, -0.75 * sizes.scale),
    new Box2D.Common.Math.b2Vec2(-0.25 * sizes.scale, -1.25 * sizes.scale),
    new Box2D.Common.Math.b2Vec2(0.25 * sizes.scale, -1.25 * sizes.scale),
    new Box2D.Common.Math.b2Vec2(0.75 * sizes.scale, -0.75 * sizes.scale),
    new Box2D.Common.Math.b2Vec2(0.75 * sizes.scale, 1.25 * sizes.scale),
    new Box2D.Common.Math.b2Vec2(-0.75 * sizes.scale, 1.25 * sizes.scale)
    ] ;
    fixDef.shape.SetAsArray(bodyVertices);
    var body = SK8RGameWorld.createBody(bodyDef, fixDef) ; 
    body.SetUserData(new BodyRenderer(body, bodyVertices)) ;

    // Arm joints
    var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
    b2JointDef.bodyA = body;
    var joint ;
    // Right arm
    b2JointDef.bodyB = rightArm;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0.75*sizes.scale, -0.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(-limbHalfWidth, -limbHalfHeight);
    b2JointDef.lowerAngle = -Math.PI ;
    b2JointDef.upperAngle = 0.5 ;
    b2JointDef.enableLimit = true ;
    SK8RGameWorld.createJoint(b2JointDef) ; 

    // Left arm
    b2JointDef.bodyB = leftArm;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(-0.75*sizes.scale, -0.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(limbHalfWidth, -limbHalfHeight);
    b2JointDef.lowerAngle = -0.5 ;
    b2JointDef.upperAngle = Math.PI;
    b2JointDef.enableLimit = true ;
    SK8RGameWorld.createJoint(b2JointDef) ; 
	
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
    new Box2D.Common.Math.b2Vec2(0*sizes.scale, -limbHalfHeight);
    SK8RGameWorld.createJoint(b2JointDef) ; 
	
    // Left leg
    b2JointDef.bodyB = leftLeg;
    b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(-0.5*sizes.scale, 1.25*sizes.scale);
    b2JointDef.localAnchorB = 
    new Box2D.Common.Math.b2Vec2(0*sizes.scale, -limbHalfHeight);
    SK8RGameWorld.createJoint(b2JointDef) ; 
}

function createSK8RRobot(sizes) {
    sizes = sizes || {} ;
    sizes.scale = sizes.scale || 1 ;
    sizes.offsetx = sizes.offsetx || 0*sizes.scale ;
    sizes.offsety = sizes.offsety || 0*sizes.scale ;
    
    //// Head
    // Position: 1.25, 0.5
    // Radius: 0.5
    
    //// Body
    // Position 1.25, 1.75
    // halfwidth = halfheight = 0.75
    
    //// Right arm
    // Position: 0.25, 1.75
    // Halfwidth: 0.25 Halfheight: 0.75
    
    //// Left arm
    // Position: 2.25, 1.75
    // Halfwidth: 0.25 Halfheight: 0.75
    
    //// Right leg
    // Position: 0.75, 3.0
    // Halfwidth: 0.25 Halfheight: 0.5
    
    //// Left leg
    // Position: 1.75, 3
    // Halfwidth: 0.25 Halfheight: 0.5

    //// Right foot
    // Position: 0.75, 3.75
    // Halfwidth = Halfheight: 0.5
    
    //// Left foot
    // Position: 1.75, 3.75
    // Halfwidth = Halfheight: 0.25
    
    //// Right arm-body revolution joint
    // BodyA = body
    // BodyB = right arm
    // BodyA-pos: -0.75, -0.75
    // BodyB-pos: 0.25, -0.75
    
    //// Left arm-body revolution joint
    // BodyA = body
    // BodyB = left arm
    // BodyA-pos: 0.75, -0.75
    // BodyB-pos: -0.25, -0.75
    
    //// Right leg-body revolution joint
    // BodyA = body
    // BodyB = right leg
    // BodyA-pos: -0.5, 0.75
    // BodyB-pos: 0, -0.5
    
    //// Left leg-body revolution joint
    // BodyA = body
    // BodyB = left leg
    // BodyA-pos: 0.5, 0.75
    // BodyB-pos: 0, -0.5
    
    //// Right leg-Right foot prismatic joint
    // BodyA = right leg
    // BodyB = right foot
    // BodyA-pos: 0, 0.5
    // BodyB-pos: 0, -0.25
    
    //// Left leg-Left foot prismatic joint
    // BodyA = left leg
    // BodyB = left foot
    // BodyA-pos: 0, 0.5
    // BodyB-pos: 0, -0.25
}