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
        lowerBound : new Box2D.Common.Math.b2Vec2(0, 0),
        upperBound : new Box2D.Common.Math.b2Vec2(16, 12)
    } ;
    var cameraWorldViewport = {
        lowerBound : new Box2D.Common.Math.b2Vec2(cameraDefaultWorldViewport.lowerBound.x, cameraDefaultWorldViewport.lowerBound.y),
        upperBound : new Box2D.Common.Math.b2Vec2(cameraDefaultWorldViewport.upperBound.x, cameraDefaultWorldViewport.upperBound.y)
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
    
    self.getViewportAABB = function() {
        return cameraWorldViewport ;
    }
    
    self.setupDebugDraw = function(world) {
        var dd = new Box2D.Dynamics.b2DebugDraw();
        dd.SetSprite(ctx);
        dd.SetDrawScale(pixelsPerMeter);
        dd.SetFillAlpha(0.6);
        dd.SetLineThickness(1.0);
        dd.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit
            | Box2D.Dynamics.b2DebugDraw.e_jointBit);
        world.SetDebugDraw(dd);
    }
		
    return self ;
}()) ;

