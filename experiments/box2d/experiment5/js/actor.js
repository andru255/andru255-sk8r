var Actors = (function() {
		var self = {} ;
		var actors = new Array() ;
		
		self.step = function(timeSinceLastFrame) {
			for (var n=0; n<actors.length; n++) {
				actors[n].step(timeSinceLastFrame) ;
			}
		};
		
		self.addActor = function(actor) {
			if (actor) {
				actors.push(actor) ;
			}
		};
		
		self.removeActor = function(actor) {
			actors = actors.filter(function(curValue, curIndex, curArray) 
				{ return (element != actor) ; }
			);
		};
		
		self.clear = function() {
			actors = new Array() ;
		};
		
		return self ;
}()) ;

var MathUtil = (function() {
		var self = {} ;
		
		self.worldToScreen = function(wp) {
			var sp = {} ;
			sp.x = Math.round(wp.x * 40) ;
			sp.y = Math.round(wp.y * 40) ;
			return sp ;
		}
		
		self.worldLengthToScreen = function(length) {
			return Math.max(1, Math.round(length * 40)) ;
		}
		
		return self ;
}());

function Wheel(ctx, body, radius) {
	this.ctx = ctx ;
	this.body = body ;
	this.radius = radius ;
}

Wheel.prototype.step = function(timeSinceLastFrame) {
	var worldPosition = this.body.GetPosition() ;
	var screenPosition = MathUtil.worldToScreen(worldPosition) ;
	
	this.ctx.fillStyle = "#ff0000";
	this.ctx.beginPath();
	this.ctx.arc(
		screenPosition.x, 
		screenPosition.y, 
		MathUtil.worldLengthToScreen(this.radius), 
		0, 
		Math.PI * 2, 
		false);
	this.ctx.closePath();
	this.ctx.fill();
};


function Rotated(ctx, body, delegate) {
	this.body = body ;
	this.delegate = delegate;
	this.ctx = ctx ;
}

Rotated.prototype.step = function(timeSinceLastFrame) {
	var worldPosition = this.body.GetPosition() ;
	var screenPosition = MathUtil.worldToScreen(worldPosition) ;
	this.ctx.save();
	this.ctx.translate(screenPosition.x, screenPosition.y);
	this.ctx.rotate(this.body.GetAngle());
	this.delegate.render(timeSinceLastFrame) ;	
	this.ctx.restore() ;
};

function Deck(ctx, length, thickness) {
	this.ctx = ctx ;
	this.lengthPxls = MathUtil.worldLengthToScreen(length) ;
	this.thicknessPxls = MathUtil.worldLengthToScreen(thickness) ;
}

Deck.prototype.render = function()  {
	this.ctx.fillStyle = "#00ff00";
	this.ctx.fillRect(-this.lengthPxls/2, -this.thicknessPxls/2,
			this.lengthPxls, this.thicknessPxls);
}

function Sk8board(world, ctx, sizes) {
	this.world = world ;
	this.ctx = ctx ;
	sizes = sizes || {} ;
	this.sizes = {} ;
// According to http://defekt.se/2010/04/den-standardiserade-skateboarden/
	this.sizes.wheelRadius = sizes.wheelRadius || 0.05 ;
	this.sizes.boardThickness = sizes.boardThickness || 0.02 ;
	this.sizes.boardLength = sizes.boardLength || 0.82 ;
	this.sizes.truckOffset = sizes.truckOffset || 0.18 ;
}

Sk8board.prototype.init = function(bodies, joints) {
		var bodyDef = new Box2D.Dynamics.b2BodyDef();
		var fixDef = new Box2D.Dynamics.b2FixtureDef();
		
		fixDef.density = 1.0;
		fixDef.friction = 0.9;
		fixDef.restitution = 0.1;
		fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(this.sizes.wheelRadius);

		// Back wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.sizes.wheelRadius;
		bodyDef.position.y = this.sizes.wheelRadius;
		var backwheel = this.world.CreateBody(bodyDef);
		backwheel.CreateFixture(fixDef);
		bodies.push(backwheel) ;
		Actors.addActor(new Wheel(this.ctx, backwheel, this.sizes.wheelRadius)) ;

		// Front wheel
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.sizes.boardLength-this.sizes.wheelRadius;
		bodyDef.position.y = this.sizes.wheelRadius;
		var frontwheel = this.world.CreateBody(bodyDef);
		frontwheel.CreateFixture(fixDef);
		bodies.push(frontwheel) ;
		Actors.addActor(new Wheel(this.ctx, frontwheel, this.sizes.wheelRadius)) ;
		
		// Deck
		fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
		fixDef.shape.SetAsBox(this.sizes.boardLength / 2, this.sizes.boardThickness / 2);
		bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
		bodyDef.position.x = this.sizes.boardLength / 2;
		bodyDef.position.y = this.sizes.boardThickness / 2;
		var board = this.world.CreateBody(bodyDef);
		board.CreateFixture(fixDef);
		bodies.push(board) ;
		var boardRenderer = new Deck(this.ctx, this.sizes.boardLength, this.sizes.boardThickness) ;
		Actors.addActor(new Rotated(this.ctx, board, boardRenderer)) ;

		// Trucks		
		var b2JointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef();
		b2JointDef.bodyA = backwheel;
		b2JointDef.bodyB = board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = 
			new Box2D.Common.Math.b2Vec2(-this.sizes.boardLength/2 + this.sizes.truckOffset, this.sizes.wheelRadius);
		var joint = this.world.CreateJoint(b2JointDef);
		joints.push(joint);
		
		b2JointDef.bodyA = frontwheel;
		b2JointDef.bodyB = board;
		b2JointDef.localAnchorA = new Box2D.Common.Math.b2Vec2(0, 0);
		b2JointDef.localAnchorB = 
			new Box2D.Common.Math.b2Vec2(this.sizes.boardLength/2 - this.sizes.truckOffset, this.sizes.wheelRadius);
		joint = this.world.CreateJoint(b2JointDef);
		joints.push(joint);
		
		board.SetPosition(new Box2D.Common.Math.b2Vec2(0.4, 1.5));	
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