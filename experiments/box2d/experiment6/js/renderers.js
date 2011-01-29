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

function WheelRenderer(body, radius) {
    this.body = body ;
    this.radius = radius ;
}

    WheelRenderer.prototype.render = function() {
        var worldPosition = this.body.GetPosition() ;
        var screenPosition = SK8RCanvas.worldToScreen(worldPosition) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(
            screenPosition.x, 
            screenPosition.y, 
            SK8RCanvas.worldLengthToScreen(this.radius), 
            0, 
            Math.PI * 2, 
            false);
        ctx.closePath();
        ctx.fill();
    }


function GroundRenderer(body, vertices) {
    this.body = body ;
    this.vertices = vertices ;
}

    GroundRenderer.prototype.render = function() {
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#c0c0e0";
        ctx.beginPath();
        var screenCoords = SK8RCanvas.worldToScreen(this.vertices[0]) ;
        ctx.moveTo(screenCoords.x, screenCoords.y);
        for (var n=1; n<this.vertices.length; n++) {
            screenCoords = SK8RCanvas.worldToScreen(this.vertices[n]) ;
            ctx.lineTo(screenCoords.x, screenCoords.y);
        }
        ctx.closePath();
        ctx.fill();
    }

function Rotated(body) {
    this.body = body ;
}

    Rotated.prototype.render = function() {
        var worldPosition = this.body.GetPosition() ;
        var screenPosition = SK8RCanvas.worldToScreen(worldPosition) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.save();
        ctx.translate(screenPosition.x, screenPosition.y);
        ctx.rotate(this.body.GetAngle());
        this.renderRotated() ;	
        ctx.restore() ;
    }
    Rotated.prototype.renderRotated = function() {
        if (console) {
            console.log("Forgot to override renderRotated") ;
        }
    }

function DeckRenderer(body, length, thickness) {
    Rotated.call(this, body) ;
    this.length = length ;
    this.thickness = thickness ;
}

DeckRenderer.prototype = SK8RDelegate(Rotated.prototype) ;
    DeckRenderer.prototype.constructor = DeckRenderer;
    DeckRenderer.prototype.renderRotated = function()  {
        var lengthPxls = SK8RCanvas.worldLengthToScreen(this.length) ;
        var thicknessPxls = SK8RCanvas.worldLengthToScreen(this.thickness) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(-lengthPxls/2, -thicknessPxls/2,
            lengthPxls, thicknessPxls);
    }
