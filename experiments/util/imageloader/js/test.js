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

function bind(obj, fn) {
	return function() {
			fn.apply(obj, arguments) ;
	};
}
window.onload = function() {
	reset();
}
 
var tasknames = ["Loading images"] ;
var ctx ;
function reset() {
	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	
	var bar = new ProgressBar(ctx, {x: 30, y:220, width: 580, height:40});
	var listeners = [ bind(bar, bar.progress) ] ;
	var progressMeter = new ProgressMeter(tasknames, listeners) ;
	
	var loader = new ImageLoader(progressMeter) ;
	googleImage = loader.createImage("http://www.google.se/images/nav_logo29.png");
	
	loader.addListener(function() { console.log("Done processing images");}) ;
	loader.addListener(imagesLoaded) ;
	loader.start() ;
}

var googleImage ;
function imagesLoaded() {
	ctx.drawImage(googleImage, 10, 10) ;
}


