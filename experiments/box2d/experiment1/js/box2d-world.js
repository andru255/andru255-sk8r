/**
 * 
 */
var world;
var pixelsPerMeter = 40;
var worldWidthInMeter = 16; // 640/pixelsPerMeter ;
var worldHeightInMeter = 12; // 480/pixelsPerMeter ;
var groundHalfWidth = 0.5;
var trailcircle;
var trailcircleBody;
var crateBody;
var halfCrateWidthInMeters = 0.1;
var halfCrateHeightInMeters = 1.0;
var halfCrateWidthInPixels = (halfCrateWidthInMeters * pixelsPerMeter);
var halfCrateHeightInPixels = (halfCrateHeightInMeters * pixelsPerMeter);
var ctx;

function init() {
	// Name alias
	var b2Vec2 = Box2D.Common.Math.b2Vec2, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

	world = new b2World(new b2Vec2(0, 10) // gravity
	, true // allow sleep
	);

	var fixDef = new b2FixtureDef;
	fixDef.density = 1.0;
	fixDef.friction = 0.5;
	fixDef.restitution = 0.2;

	var bodyDef = new b2BodyDef;

	// create ground
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = worldWidthInMeter / 2; // center
	bodyDef.position.y = worldHeightInMeter + groundHalfWidth; // bottom
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(worldWidthInMeter / 2, groundHalfWidth);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	// Left wall
	bodyDef.position.x = -groundHalfWidth;
	bodyDef.position.y = worldHeightInMeter / 2;
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(groundHalfWidth, worldHeightInMeter / 2);
	world.CreateBody(bodyDef).CreateFixture(fixDef);
	// Right wall
	bodyDef.position.x = worldWidthInMeter + groundHalfWidth; // center
	bodyDef.position.y = worldHeightInMeter / 2; // bottom
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(groundHalfWidth, worldHeightInMeter / 2);
	world.CreateBody(bodyDef).CreateFixture(fixDef);

	// create some objects
	bodyDef.type = b2Body.b2_dynamicBody;
	for ( var i = 0; i < 8; ++i) {
		if (Math.random() > 0.5) {
			fixDef.shape = new b2PolygonShape;
			fixDef.shape.SetAsBox(Math.random() + 0.1 // half width
			, Math.random() + 0.1 // half height
			);
		} else {
			fixDef.shape = new b2CircleShape(Math.random() + 0.1 // radius
			);
		}
		bodyDef.position.x = Math.random() * (worldWidthInMeter - 3) + 1.5;
		bodyDef.position.y = Math.random() * 3;
		world.CreateBody(bodyDef).CreateFixture(fixDef);
	}
	// 0.5 meter circle
	var trailcircleRadiusInMeters = 0.2;
	bodyDef.position.x = worldWidthInMeter / 2;
	bodyDef.position.y = 0;
	fixDef.shape = new b2CircleShape(trailcircleRadiusInMeters);
	fixDef.restitution = 0.6;
	trailcircleBody = world.CreateBody(bodyDef);
	trailcircleBody.CreateFixture(fixDef);

	bodyDef.position.x = 5;
	bodyDef.position.y = 0;
	crateBody = world.CreateBody(bodyDef);
	fixDef.shape = new b2PolygonShape;
	fixDef.shape.SetAsBox(halfCrateWidthInMeters, halfCrateHeightInMeters);
	fixDef.restitution = 0.2;
	crateBody.CreateFixture(fixDef);

	ctx = document.getElementById("canvas").getContext("2d");

	trailcircle = new TrailCircle(ctx, {
		radius : trailcircleRadiusInMeters * pixelsPerMeter,
		position : {
			x : 320,
			y : 0
		},
		color : {
			red : 8,
			green : 255,
			blue : 255
		}
	});

	// setup debug draw
	var debugDraw = new b2DebugDraw();
	debugDraw.SetSprite(ctx);
	debugDraw.SetDrawScale(pixelsPerMeter);
	debugDraw.SetFillAlpha(0.6);
	debugDraw.SetLineThickness(1.0);
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
	world.SetDebugDraw(debugDraw);

	window.setInterval(update, 1000 / 30);
};

function update() {
	world.Step(1 / 30 // frame-rate
	, 10 // velocity iterations
	, 10 // position iterations
	);
	world.DrawDebugData();
	var position = trailcircleBody.GetPosition();
	var screencoords = worldToScreenCoordinates(position);
	trailcircle.setPosition(screencoords.x, screencoords.y);
	trailcircle.draw();
	var crateScreenPosition = worldToScreenCoordinates(crateBody.GetPosition());
	ctx.save();
	ctx.translate(crateScreenPosition.x, crateScreenPosition.y);
	ctx.rotate(crateBody.GetAngle());
	ctx.fillStyle = "#00ff00";
	ctx.fillRect(-halfCrateWidthInPixels, -halfCrateHeightInPixels,
			halfCrateWidthInPixels * 2, halfCrateHeightInPixels * 2);
	ctx.restore();
	world.ClearForces();
};

function worldToScreenCoordinates(worldPosition) {
	var screenPosition = {
		x : Math.floor(worldPosition.x * pixelsPerMeter),
		y : Math.floor(worldPosition.y * pixelsPerMeter)
	};
	return screenPosition;
}