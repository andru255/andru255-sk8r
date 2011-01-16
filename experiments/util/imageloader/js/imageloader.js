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
 
 /*
 Package: Loader
 
 Utility classes to load resources 
 */

/*
Class: ImageLoader

A class that creates image objects and populate them with remote data. Use this
class by instantiating it. Then create all the image objects that are to be 
loaded. Register callback listeners and finally start the loader. 
After the loader has started it is not possible to add images or listeners.

Constructor: 
  progressMeter - An optional progress meter object that is to be updated with 
                loading progress.
*/
function ImageLoader(progressMeter) {
	this.loading = false ;
	this.images = new Array() ;
	this.listeners = new Array() ;
	this.progressMeter = progressMeter ;
	this.imagesProcessed = 0 ;
	this.numberOfImages = 0  ;
}

ImageLoader.prototype = {
	/*
	Function : createImage
	
	Create an image object that is to be loaded by this loader.
	
	Parameters: 
		src - The image src URL to be used to load the image.
	*/
	createImage : function(src) {
		if (this.loading) {
			throw "Loading started, can not add more images" ;
		}
		if (!src) {
			throw "Must give the image src URL" ;
		}
		this.numberOfImages++;
		var image = new Image() ;
		image.onload = bind(this, this.onLoad) ;
		image.onabort = bind(this, this.onAbort) ;
		image.onerror = bind(this, this.onError) ;
		this.images.push({image: image, src: src}) ;
		return image ;
	},
	/*
	Function : start
	
	Start loading the images. No more images can be registered through <createImage>
	*/
	start : function() {
		if (!this.loading) {
			this.loading = true ;
			for (var n=0; n<this.images.length; n++) {
				this.images[n].image.src=this.images[n].src ;
			}
		}
	},
	/*
	Function: addListener
	
	Add a listener the is informed when all the images have been processed.
	
	Parameters:
		listener - The function to call when all images have been processed.
	*/
	addListener : function(listener) {
		if (listener) {
			this.listeners.push(listener) ;
		}
	},
	/*
	Function: fireProgress
	
	Internal function, do not call. Issues callbacks to the progressMeter
	*/
	fireProgress : function() {
		if (this.progressMeter) {
			this.progressMeter.progress(this.imagesProcessed/this.numberOfImages) ;
		}
		if (this.imagesProcessed == this.numberOfImages) {
			for (var n=0; n<this.listeners.length; n++) {
				this.listeners[n]() ;
			}
		}
	},
	/*
	Callback: onLoad
	
	Internal function, do not call. 
	*/
	onLoad : function(event) {
		this.imagesProcessed++ ;
		this.fireProgress() ;
		if (console) {
			console.log("Loaded : " + this.getSrc(event)) ;
		}
	},
	/*
	Callback: onAbort
	
	Internal function, do not call. 
	*/
	onAbort : function(event) {
		this.imagesProcessed++ ;
		this.fireProgress() ;
		if (console) {
			console.log("Aborted :" + this.getSrc(event)) ;
		}
	},
	/*
	Callback: onError
	
	Internal function, do not call. 
	*/
	onError : function(event) {
		this.imagesProcessed++ ;
		this.fireProgress() ;
		if (console) {
			console.log("Error :" + this.getSrc(event)) ;
		}
	},
	/*
	Function: getSrc
	
	Internal function, do not call
	*/
	getSrc : function(event) {
		if (event) {
			if (event.target) {
				if (event.target.src) {
					return event.target.src ;
				} else {
					return event.target ;
				}
			} else {
				return event ;
			}
		} else {
			return "?" ;
		}
	}
};
