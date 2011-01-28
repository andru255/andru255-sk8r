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
 
window.onload = function() {
	reset() ;
}
 
var tasknames = ["Loading stuff", "Generating fake stuff"] ;
var progressMeter ;
var currentTask = 0 ;
var currentProgress = 0 ;
var timerId = -1;

function reset() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	var bar = new ProgressBar(ctx, {x: 30, y:220, width: 580, height:40});
	// Draw the bar
	bar.progress(0) ;
	var listeners = [ progress1, bind(bar, bar.progress) ] ;
	// var listeners = [progress1,progress2] ;
	progressMeter = new ProgressMeter(tasknames, listeners) ;
	currentTask = 0 ;
	currentProgress = 0 ;
	timerId = window.setInterval(makeProgress, 200);
}

function makeProgress() {
	if (currentTask < tasknames.length) {
		progressMeter.progress(currentProgress) ;
		currentProgress += 0.1 ;
		if (currentProgress > 1) {
			currentProgress = 0 ;
			currentTask++;
		}
	} else {
		window.clearInterval(timerId) ;
	}
}

function progress1(taskname, fractionProgress) {
	console.log("Progress1: " + taskname + " " + fractionProgress) ;
}

function bind(obj, fn) {
	return function() {
			fn.apply(obj, arguments) ;
	};
}
