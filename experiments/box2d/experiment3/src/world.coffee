window.onload = ->
  canvas = document.getElementById("canvas")
  b2dWorld = new b2World(new b2Vec2(0, 10), true)
  world = new World(b2dWorld, canvas)
  skateboard = new SkateBoard(b2dWorld, canvas)
  line = new Line(b2dWorld, canvas)
  window.ollie =  ->
    skateboard.ollie(document.getElementById("x").value,
      document.getElementById("y").value)
  window.update = =>
    world.setDebug(document.getElementById("debug").value)
    world.update()

  canvas.onmousedown = (e) =>
    line = new Line(b2dWorld, canvas)
    line.setStart(e)
  canvas.onmouseup = (e) =>
    if line?
      line.setEnd(e)
      line.render()
      line.create()
      world.addActor(line)
      line = null
  canvas.onmousemove = (e) =>
    if line?
      canvas.getContext("2d").clearRect(0,0,canvas.width, canvas.height)
      line.setEnd(e)
      line.render()


  window.play = ->
    skateboard.create()
    world.addActor(skateboard)

  setInterval(window.update, 1000/30)

b2Vec2= Box2D.Common.Math.b2Vec2
b2BodyDef= Box2D.Dynamics.b2BodyDef
b2Body= Box2D.Dynamics.b2Body
b2FixtureDef= Box2D.Dynamics.b2FixtureDef
b2Fixture= Box2D.Dynamics.b2Fixture
b2World= Box2D.Dynamics.b2World
b2MassData= Box2D.Collision.Shapes.b2MassData
b2PolygonShape= Box2D.Collision.Shapes.b2PolygonShape
b2CircleShape= Box2D.Collision.Shapes.b2CircleShape
b2DebugDraw= Box2D.Dynamics.b2DebugDraw
b2StaticBody= Box2D.Dynamics.b2Body.b2_staticBody
b2DynamicBody= Box2D.Dynamics.b2Body.b2_dynamicBody
b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef

createFixture = (density, friction, restitution) ->
  fixDef = new b2FixtureDef()
  fixDef.density = density
  fixDef.friction = friction
  fixDef.restitution = restitution
  fixDef

worldPositionToScreenPosition = (wp) ->
  {x: Math.round(wp.x * 40), y: Math.round(wp.y * 40)}

screenToWorld = (sp) ->
  {x: parseFloat(sp.x/40.0), y: parseFloat(sp.y/40.0)}

worldToScreen = (length) ->
  Math.max(1, Math.round(length * 40))

class World
  constructor: (@world, @canvas) ->
    @ctx = @canvas.getContext("2d")
    @pixelsPerMeter = 40
    @worldWidthInMeter = 16
    @worldHeightInMeter = 12
    @groundHalfWidth = 0.5
    @actors = []
    @debug = false
    @setUpDebugDraw()
    @create()

  create: ->
    fixDef = createFixture(1.0, 0.5, 0.2)
    fixDef.shape = new b2PolygonShape()
    fixDef.shape.SetAsBox(@worldWidthInMeter/2, @groundHalfWidth)

    bodyDef = new b2BodyDef()
    bodyDef.type = b2StaticBody
    #ground
    bodyDef.position.Set(
      @worldWidthInMeter/2,
      @worldHeightInMeter + @groundHalfWidth)
    @world.CreateBody(bodyDef).CreateFixture(fixDef)

    #left wall
    bodyDef.position.Set(
      -@groundHalfWidth,
      @worldHeightInMeter/2)
    fixDef.shape.SetAsBox(@groundHalfWidth, @worldHeightInMeter / 2)
    @world.CreateBody(bodyDef).CreateFixture(fixDef)

    #right wall
    bodyDef.position.Set(
      @worldWidthInMeter + @groundHalfWidth,
      @worldHeightInMeter /2)
    fixDef.shape.SetAsBox(@groundHalfWidth, @worldHeightInMeter / 2)
    @world.CreateBody(bodyDef).CreateFixture(fixDef)

  setDebug:(debug) ->
    if debug
      @debug = true
    else
      @debug = false

  setUpDebugDraw: ->
    debugDraw = new b2DebugDraw()
    debugDraw.SetSprite(@ctx)
    debugDraw.SetDrawScale(@pixelsPerMeter)
    debugDraw.SetFillAlpha(0.9)
    debugDraw.SetLineThickness(1.0)
    debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit)
    @world.SetDebugDraw(debugDraw)

  addActor: (actor) ->
    @actors.push(actor)

  update: ->
    @world.Step(1 / 30, 10, 10)
    @ctx.clearRect(0,0,canvas.width, canvas.height)
    actor.step(0) for actor in @actors
    @world.DrawDebugData() if @debug
    @world.ClearForces()

  
