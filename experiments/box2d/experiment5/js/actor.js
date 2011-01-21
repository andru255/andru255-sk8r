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

function Board(ctx, body, length, thickness) {
	this.body = body ;
	this.ctx = ctx ;
	this.lengthPxls = MathUtil.worldLengthToScreen(length) ;
	this.thicknessPxls = MathUtil.worldLengthToScreen(thickness) ;
}

Board.prototype.render = function()  {
	this.ctx.fillStyle = "#00ff00";
	this.ctx.fillRect(-this.lengthPxls/2, -this.thicknessPxls/2,
			this.lengthPxls, this.thicknessPxls);
}