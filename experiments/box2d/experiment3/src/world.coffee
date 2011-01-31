window.onload = ->
  canvas = document.getElementById("canvas")
  b2dWorld = new b2World(new b2Vec2(0, 10), true)
  world = new World(b2dWorld, canvas)
  skateboard = new SkateBoard(b2dWorld, canvas)
  line = null
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
    if line
      line.setEnd(e)
      line.render()
      line.create()
      world.addActor(line)
      line = null
  canvas.onmousemove = (e) =>
    if line
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

class SkateBoard
  constructor: (@world, @canvas) ->
    @ctx = @canvas.getContext("2d")
    @wheelRadius = 0.05
    @boardThickness = 0.02
    @boardLength = 0.82
    @truckOffset = 0.18
    @lengthPxls = worldToScreen(@boardLength)
    @thicknessPxls = worldToScreen(@boardThickness)
    @board
    @fronwheel
    @backwheel

  create: ->
    bodyDef = new b2BodyDef()
    fixDef = createFixture(1.0, 0.9, 0.1)
    fixDef.shape = new b2CircleShape(@wheelRadius)

    # Back wheel
    bodyDef.type = b2DynamicBody
    bodyDef.position.Set(@wheelRadius, @wheelRadius)
    @backwheel = @world.CreateBody(bodyDef)
    @backwheel.CreateFixture(fixDef)

    # Front wheel
    bodyDef.position.Set(@boardLength-@wheelRadius, @wheelRadius)
    @frontwheel = @world.CreateBody(bodyDef)
    @frontwheel.CreateFixture(fixDef)

    # Deck
    fixDef.shape = new b2PolygonShape()
    fixDef.shape.SetAsBox(@boardLength / 2, @boardThickness / 2)
    bodyDef.position.Set(@boardLength/2, @boardThickness /2)
    @board = @world.CreateBody(bodyDef)
    @board.CreateFixture(fixDef)

    # Trucks		
    b2JointDef = new b2RevoluteJointDef()
    b2JointDef.bodyA = @backwheel
    b2JointDef.bodyB = @board
    b2JointDef.localAnchorA = new b2Vec2(0, 0)
    b2JointDef.localAnchorB = new b2Vec2(
      -@boardLength/2 + @truckOffset, @wheelRadius)
    joint = @world.CreateJoint(b2JointDef)

    b2JointDef.bodyA = @frontwheel
    b2JointDef.bodyB = @board
    b2JointDef.localAnchorA = new b2Vec2(0, 0)
    b2JointDef.localAnchorB = new b2Vec2(@boardLength/2 - @truckOffset, @wheelRadius)
    joint = @world.CreateJoint(b2JointDef)

    @board.SetPosition(new b2Vec2(0.8, 1.5))

  step: (timeSinceLastStep) ->
    worldPosition = @board.GetPosition()
    screenPosition = worldPositionToScreenPosition(worldPosition)
    @ctx.save()
    @ctx.translate(screenPosition.x, screenPosition.y)
    @ctx.rotate(@board.GetAngle())
    @render(timeSinceLastStep)
    @ctx.restore()
    @renderWheel(@backwheel)
    @renderWheel(@frontwheel)

  render: ->
    @ctx.fillStyle = "#00ff00"
    @ctx.fillRect(-@lengthPxls/2, -@thicknessPxls/2, @lengthPxls, @thicknessPxls)

  renderWheel: (wheel) ->
    worldPosition = wheel.GetPosition()
    screenPosition = worldPositionToScreenPosition(worldPosition)
    @ctx.fillStyle = "#ff0000"
    @ctx.beginPath()
    @ctx.arc(
      screenPosition.x,
      screenPosition.y,
      worldToScreen(@wheelRadius),
      0,
      Math.PI * 2,
    false)
    @ctx.closePath()
    @ctx.fill()

  ollie: (x,y) ->
    localCenter = @board.GetLocalCenter().Copy()
    #find the back of the deck
    localCenter.x -= @boardLength/2.0
    @board.ApplyImpulse(new b2Vec2(x, y), localCenter)
    #gently push down the front leg
    #localCenter.x += @boardLength/2.0
    #@board.ApplyImpulse(new b2Vec2(x, -y/2.0),localCenter)
  
class Line
  constructor:(@world, @canvas) ->
    @start = {}
    @end = {}
    @canvasPosition = @getElementPosition(canvas)
    @ctx = @canvas.getContext("2d")
    @ctx.strokeStyle = "rgb(0,0,0)"
    @mouseIsDown

  setStart: (e) ->
    @start.x = e.clientX - @canvasPosition.x
    @start.y = e.clientY - @canvasPosition.y

  setEnd: (e) ->
    @end.x = e.clientX - @canvasPosition.x
    @end.y = e.clientY - @canvasPosition.y

  step: ->
    @render()

  render: ->
    @ctx.beginPath()
    @ctx.moveTo(@start.x, @start.y)
    @ctx.lineTo(@end.x, @end.y)
    @ctx.stroke()
    @ctx.closePath()

  create: ->
    return unless @start and @end
    start = screenToWorld(@start)
    end = screenToWorld(@end)

    bodyDef = new b2BodyDef()
    bodyDef.position.Set(0.0, 0.0)
    fixDef = createFixture(1.0, 0.5, 0.2)
    fixDef.shape = new b2PolygonShape()
    vertices = [
      new Box2D.Common.Math.b2Vec2(start.x, start.y),
        new Box2D.Common.Math.b2Vec2(end.x, end.y),
        new Box2D.Common.Math.b2Vec2(end.x, (end.y + 0.01)),
        new Box2D.Common.Math.b2Vec2(start.x, (start.y + 0.01))
    ]
    fixDef.shape.SetAsArray(vertices, vertices.length)
    @world.CreateBody(bodyDef).CreateFixture(fixDef)

  getElementPosition: (element) ->
    elem=element
    tagname=""
    x=0
    y=0

    while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined"))
      y += elem.offsetTop
      x += elem.offsetLeft
      tagname = elem.tagName.toUpperCase()

      if(tagname == "BODY")
        elem=0

      if(typeof(elem) == "object")
        if(typeof(elem.offsetParent) == "object")
          elem = elem.offsetParent
    return {x: x, y: y}

