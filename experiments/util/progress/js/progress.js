/*
Package: progress

Utility classes to track and draw progress (for loading.... messages).
*/

/*
Class: ProgressMeter

A class that keeps two counters. A counter of the number of tasks left to be done
and a counter of how far the current task has progressed. Execution of the tasks
are outside of ProgressMeter but when progress is made on a task the executor
calls ProgressMeter.progress. This class then issues callbacks to listeners to
inform them of the progress being made. The listeners, typicaly GUI elements,
can inform the user of the progress.

Constructor: 
  tasknames - An Array of (String) names for the tasks to be performed. Used in 
              the callbacks to inform the listeners of the current task name.
  listeners - An array of functions that are to be called on progress. The first
              parameter on the callback is the (String) taskname. The second
              parameters on the callback is the progress as a number between 0
              and 1. The progress indicates overall total progress, not the 
              progress for a single task.
*/
function ProgressMeter(tasknames, listeners) {
	this.tasknames = new Array() ;
	this.tasknames = this.tasknames.concat(tasknames) ;
	this.listeners = new Array() ;
	this.listeners = this.listeners.concat(listeners) ;
	
	this.activeTaskIndex = 0 ;
	this.activeTaskProgress = 0 ;
	this.progressPerTask = 1/this.tasknames.length ;
	this.totalTaskProgress = 0 ;
}

ProgressMeter.prototype = {
	/*
	Function: progress
	
	Used to inform the ProgressMeter that a task has progressed. Issues 
	callbacks to the registered listeners to inform of the progress. The callback
	informs of the overall progress and which task is the current active one.
	
	Parameters:
		fractionComplete - A number between 0 and 1 indicating the progress for
			the current task. When progress is >= 1.0 the ProgressMeter switches 
			the active task to the next. 
	*/
	progress : function(fractionComplete) {
		if (fractionComplete > 1.0) {
			fractionComplete = 1.0 ;
		}
		if (fractionComplete < 0) {
			fractionComplete = 0 ;
		}
		this.activeTaskProgress = fractionComplete ;
		this.totalTaskProgress = this.activeTaskIndex*this.progressPerTask + (this.activeTaskProgress * this.progressPerTask) ;
		this.fireProgress();
		if (this.activeTaskProgress > 0.99) {
			this.activeTaskIndex++ ;
		}
	}, 
	/*
	Function: fireProgress
	
	Internal function, do not call. Issues callbacks to the registered listener
	functions to indicate progress.
	*/
	fireProgress : function() {
		for (var n=0; n<this.listeners.length; n++) {
			this.listeners[n](this.tasknames[this.activeTaskIndex], this.totalTaskProgress); 
		}
	}
};

/*
Class: ProgressBar

Draws a progress bar on the given canvas. Register an instance of this class on
a progress meter and watch the blinken bars.

Constructor:
	ctx - The canvas 2D context to draw on.
	appearance - Optional object defining the appearance of the progress bar.
	
appearance:
	x - The left edge of the progress bar in the canvas. Defaults to 10.
	y - The top edge of the progress bar in the canvas. Defaults to 10.
	width - The width of the progress bar in the canvas. Defaults to 620.
	height - The height of the progress bar in the canvas. Defaults to 40.
*/
function ProgressBar(ctx, appearance) {
	this.ctx = ctx ;
	this.x = 10 ;
	this.y = 10 ;
	this.width = 620 ;
	this.height = 40 ;
	if (appearance) {
		if (appearance.x) {
			this.x = appearance.x ;
		}
		if (appearance.y) {
			this.y = appearance.y ;
		}
		if (appearance.width) {
			this.width = appearance.width ;
		}
		if (appearance.height) {
			this.height = appearance.height ;
		}
	}
	this.gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
	this.gradient.addColorStop(0, "#0000ff");
	this.gradient.addColorStop(1, "#00ff00");
	var fontHeight = (this.height/2)-4 ;
	fontHeight = Math.min(fontHeight, 30);
	this.font = fontHeight + "px sans" ;
}

ProgressBar.prototype = {
	/*
	callback: progress
		
	Callback from a <ProgressMeter> to update the progress bar GUI.
	*/
	progress : function(taskname, progressFraction) {
		this.ctx.fillStyle="#000000" ;
		this.ctx.fillRect(this.x, this.y, this.width, this.height) ;
		this.ctx.fillStyle=this.gradient;
		this.ctx.fillRect(this.x, this.y, this.width * progressFraction, this.height) ;
		
		this.ctx.lineWidth = 2.0 ;
		this.ctx.strokeStyle="#f0f0f0" ;
		this.ctx.strokeRect(this.x, this.y, this.width, this.height) ;
		
		this.ctx.font=this.font ;
		this.ctx.textBaseline="middle";
		var metrics = this.ctx.measureText(taskname) ;
		var textx = this.width/2 - metrics.width/2 + this.x;
		this.ctx.fillStyle="#f0f0f0" ;
		this.ctx.fillText(taskname, textx, this.y+this.height/2, this.width) ;
	}
};
