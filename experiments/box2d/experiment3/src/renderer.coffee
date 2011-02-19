class BaseRenderer
  constructor:(@world, @canvas) ->
    @ctx = @canvas.getContext("2d")
    @canvasPosition = @getElementPosition(canvas)

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

class SkateBoard extends BaseRenderer
  constructor: (@b2dWorld, @canvas) ->
    super(@b2dWorld, @canvas)
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
    @backwheel = @b2dWorld.CreateBody(bodyDef)
    @backwheel.CreateFixture(fixDef)

    # Front wheel
    bodyDef.position.Set(@boardLength-@wheelRadius, @wheelRadius)
    @frontwheel = @b2dWorld.CreateBody(bodyDef)
    @frontwheel.CreateFixture(fixDef)

    # Deck
    fixDef.shape = new b2PolygonShape()
    fixDef.shape.SetAsBox(@boardLength / 2, @boardThickness / 2)
    bodyDef.position.Set(@boardLength/2, @boardThickness /2)
    @board = @b2dWorld.CreateBody(bodyDef)
    @board.CreateFixture(fixDef)

    # Trucks		
    b2JointDef = new b2RevoluteJointDef()
    b2JointDef.bodyA = @backwheel
    b2JointDef.bodyB = @board
    b2JointDef.localAnchorA = new b2Vec2(0, 0)
    b2JointDef.localAnchorB = new b2Vec2(
      -@boardLength/2 + @truckOffset, @wheelRadius)
    joint = @b2dWorld.CreateJoint(b2JointDef)

    b2JointDef.bodyA = @frontwheel
    b2JointDef.bodyB = @board
    b2JointDef.localAnchorA = new b2Vec2(0, 0)
    b2JointDef.localAnchorB = new b2Vec2(@boardLength/2 - @truckOffset, @wheelRadius)
    joint = @b2dWorld.CreateJoint(b2JointDef)

    @board.SetPosition(new b2Vec2(0.8, 1.5))

  step: (timeSinceLastStep) ->
    worldPosition = @board.GetPosition()
    screenPosition = worldPositionToScreenPosition(worldPosition)
    console.log(@ctx)
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

class Line extends BaseRenderer
  constructor: (@b2dWorld, canvas) ->
    super(@b2dWorld, canvas)
    @start = {}
    @end = {}
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
    @ctx.strokeStyle = "#000"
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
    @b2dWorld.CreateBody(bodyDef).CreateFixture(fixDef)


