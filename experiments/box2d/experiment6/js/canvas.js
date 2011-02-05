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
    var cameraDefaultWorldViewportValues = {
        halfWidth : 8,
        helfHeight : 6,
        xoffset : 8,
        yoffset : 6
    };
    var cameraDefaultWorldViewport = {
        lowerBound : new Box2D.Common.Math.b2Vec2(
            cameraDefaultWorldViewportValues.xoffset-cameraDefaultWorldViewportValues.halfWidth, 
            cameraDefaultWorldViewportValues.yoffset-cameraDefaultWorldViewportValues.helfHeight),
        upperBound : new Box2D.Common.Math.b2Vec2(
            cameraDefaultWorldViewportValues.xoffset+cameraDefaultWorldViewportValues.halfWidth, 
            cameraDefaultWorldViewportValues.yoffset+cameraDefaultWorldViewportValues.helfHeight)
    } ;
    var cameraWorldViewport = {
        lowerBound : new Box2D.Common.Math.b2Vec2(cameraDefaultWorldViewport.lowerBound.x, cameraDefaultWorldViewport.lowerBound.y),
        upperBound : new Box2D.Common.Math.b2Vec2(cameraDefaultWorldViewport.upperBound.x, cameraDefaultWorldViewport.upperBound.y)
    } ;
    var cameraZoom = 1 ;
    var ctx ;
    var canvas ;

    self.onLoad = function() {
        canvas = document.getElementById('canvas');
        width = canvas.getAttribute("width") ;
        height = canvas.getAttribute("height") ;
        ctx = canvas.getContext('2d');
    };

    self.getContext = function() {
        return ctx ;
    };
    
    self.getCanvas = function() {
        return canvas ;
    };
    
    self.getCanvasSize = function() {
        return {
            width : width, 
            height : height
        } ;
    };
		
    self.clear = function() {
        ctx.clearRect(0,0,width,height);
    };
		
    self.worldToScreen = function(wp) {
        var sp = {} ;
        sp.x = Math.round((wp.x -cameraWorldViewport.lowerBound.x) * pixelsPerMeter) ;
        sp.y = Math.round((wp.y - cameraWorldViewport.lowerBound.y) * pixelsPerMeter) ;
        return sp ;
    }
    
    self.worldToScreenOrigo = function(wp) {
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
    
    self.pan = function(x,y) {
        cameraWorldViewport.lowerBound.x += x ; 
        cameraWorldViewport.lowerBound.y += y ; 
        cameraWorldViewport.upperBound.x += x ; 
        cameraWorldViewport.upperBound.y += y ; 
    }
    
    self.panTo = function(x,y) {
        cameraWorldViewport.lowerBound.x = x - cameraDefaultWorldViewportValues.halfWidth ; 
        cameraWorldViewport.lowerBound.y = y - cameraDefaultWorldViewportValues.helfHeight ; 
        cameraWorldViewport.upperBound.x = x + cameraDefaultWorldViewportValues.halfWidth; 
        cameraWorldViewport.upperBound.y = y + cameraDefaultWorldViewportValues.helfHeight; 
    }
    
    self.resetCamera = function() {
        cameraWorldViewport.lowerBound.x = cameraDefaultWorldViewport.lowerBound.x ; 
        cameraWorldViewport.lowerBound.y = cameraDefaultWorldViewport.lowerBound.y ; 
        cameraWorldViewport.upperBound.x = cameraDefaultWorldViewport.upperBound.x ; 
        cameraWorldViewport.upperBound.y = cameraDefaultWorldViewport.upperBound.y ; 
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

