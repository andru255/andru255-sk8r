var numSpeedghosts = 16;
var alphaValues = new Array();
for ( var n = 0; n < numSpeedghosts; n++) {
	alphaValues[n] = (1 - ((1 / numSpeedghosts) * n));
};

function TrailCircle(ctx, appearance) {
	this.ctx = ctx;
	this.xpos = new Array();
	this.ypos = new Array();
	this.colors = new Array();
	this.hidden = false;
	this.radius = 5;
	if ((appearance) && (appearance.radius)) {
		this.radius = appearance.radius;
	}
	this.xpos[0] = -this.radius * 2;
	this.ypos[0] = -this.radius * 2;
	if ((appearance) && (appearance.position)) {
		this.xpos[0] = appearance.position.x;
		this.ypos[0] = appearance.position.y;
	}
	this.colors[0] = {
		red : 255,
		green : 255,
		blue : 255
	};
	if ((appearance) && (appearance.color)) {
		this.colors[0] = {
			red : appearance.color.red,
			green : appearance.color.green,
			blue : appearance.color.blue
		};
	}
};

TrailCircle.prototype = {
	setPosition : function(x, y) {
		this.xpos[0] = x;
		this.ypos[0] = y;
	},
	setRadius : function(radius) {
		this.radius = radius ;
	},
	setColor : function(color) {
		this.colors[0] = {
			red : color.red,
			green : color.green,
			blue : color.blue
		};
	},
	getColor : function() {
		return {
			red : this.colors[0].red,
			green : this.colors[0].green,
			blue : this.colors[0].blue
		};
	},
	draw : function() {
		if (!this.hidden) {
			for ( var n = alphaValues.length - 1; n > -1; n--) {
				if (this.xpos[n]) {
					var colorValue = this.createColorValue(n);
					this.ctx.fillStyle = colorValue;
					var pixelx = Math.round(this.xpos[n]);
					var pixely = Math.round(this.ypos[n]);
					this.drawTrailCircle(pixelx, pixely);
				}

				if (n > 0) {
					this.xpos[n] = this.xpos[n - 1];
					this.ypos[n] = this.ypos[n - 1];
					this.colors[n] = this.colors[n - 1];
				}
			}
		}
	},
	createColorValue : function(index) {
		var color = this.colors[index];
		var colorValue = 'rgba(';
		colorValue += color.red;
		colorValue += ' ,';
		colorValue += color.green;
		colorValue += ' ,';
		colorValue += color.blue;
		colorValue += ' ,';
		colorValue += alphaValues[index];
		colorValue += ')';
		return colorValue;
	},
	drawTrailCircle : function(x, y) {
		this.ctx.beginPath();
		this.ctx.arc(x, y, this.radius, 0, Math.PI * 2, false);
		this.ctx.closePath();
		this.ctx.fill();
	}
};