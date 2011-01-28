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
var SK8RCanvas = (function() {
    var self = {} ;
    var width = 640 ;
    var height = 480 ;
    var pixelsPerMeter = 40 ;
    var cameraWorldPosition = {
        x : 8, 
        y : 6
    } ;
    var cameraDefaultWorldViewport = {
        x : -8, 
        y : -6, 
        width : 16, 
        height : 12
    } ;
    var cameraWorldViewport = {
        x : -8, 
        y : -6, 
        width : 16, 
        height : 12
    } ;
    var cameraZoom = 1 ;
    var ctx ;
		
    self.onLoad = function() {
        var canvas = document.getElementById('canvas');
        ctx = canvas.getContext('2d');
    };
		
    self.getContext = function() {
        return ctx ;
    };
		
    self.clear = function() {
        ctx.clearRect(0,0,width,height);
    };
		
    self.worldToScreen = function(wp) {
        var sp = {} ;
        sp.x = Math.round(wp.x * pixelsPerMeter) ;
        sp.y = Math.round(wp.y * pixelsPerMeter) ;
        return sp ;
    }
		
    self.worldLengthToScreen = function(length) {
        return Math.max(1, Math.round(length * pixelsPerMeter)) ;
    }
		
    return self ;
}()) ;

