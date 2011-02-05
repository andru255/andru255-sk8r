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

var ZIndices = {
    Space : 0,
    FarBackground : 1,
    Background : 2,
    Ground : 3,
    Far : 4,
    Normal : 5,
    Near : 6,
    FarOverlay : 7,
    Overlay : 8,
    NearOverlay : 9
}

function FilledCircleRenderer(body, zindex, fillStyle, radius) {
    this.body = body ;
    this.radius = radius ;
    this.fillStyle = fillStyle ;
    this.zindex = zindex || ZIndices.Normal ;
}

    FilledCircleRenderer.prototype.render = function() {
        var worldPosition = this.body.GetPosition() ;
        var screenPosition = SK8RCanvas.worldToScreen(worldPosition) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = this.fillStyle;
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
    FilledCircleRenderer.prototype.getZIndex = function() {
        return this.zindex ;
    }


function GroundRenderer(body, vertices) {
    this.body = body ;
    this.vertices = vertices ;
}

    GroundRenderer.prototype.render = function() {
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#c0c0c0";
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
    GroundRenderer.prototype.getZIndex = function() {
        return ZIndices.Ground ;
    }

function Rotated(body, zindex) {
    this.body = body ;
    this.zindex = zindex ;
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
    Rotated.prototype.getZIndex = function() {
        return this.zindex ;
    }
    
function DeckRenderer(body, length, thickness) {
    Rotated.call(this, body, ZIndices.Normal) ;
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

function ArmRenderer(body, width, height) {
    Rotated.call(this, body, ZIndices.Near) ;
    this.width = width ;
    this.height = height ;
}

ArmRenderer.prototype = SK8RDelegate(Rotated.prototype) ;
    ArmRenderer.prototype.constructor = ArmRenderer;
    ArmRenderer.prototype.renderRotated = function()  {
        var widthPxls = SK8RCanvas.worldLengthToScreen(this.width) ;
        var heightPxls = SK8RCanvas.worldLengthToScreen(this.height) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#456789";
        ctx.fillRect(-widthPxls/2, -heightPxls/2,
            widthPxls, heightPxls);
    }


function BodyRenderer(body, vertices) {
    Rotated.call(this, body, ZIndices.Normal) ;
    this.vertices = vertices ;
}

BodyRenderer.prototype = SK8RDelegate(Rotated.prototype) ;
    BodyRenderer.prototype.constructor = BodyRenderer;
    BodyRenderer.prototype.renderRotated = function()  {
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = "#789abc";
        ctx.beginPath();
        var screenCoords = SK8RCanvas.worldToScreenOrigo(this.vertices[0]);
        ctx.moveTo(screenCoords.x, screenCoords.y);
        for (var n=1; n<this.vertices.length; n++) {
            screenCoords = SK8RCanvas.worldToScreenOrigo(this.vertices[n]);
            ctx.lineTo(screenCoords.x, screenCoords.y);
        }
        ctx.closePath();
        ctx.fill();
    }


function SK8RBotBoxRenderer(body, zindex, fillStyle, width, height) {
    Rotated.call(this, body, zindex) ;
    this.width = width ;
    this.height = height ;
    this.fillStyle = fillStyle;
}

SK8RBotBoxRenderer.prototype = SK8RDelegate(Rotated.prototype) ;
    SK8RBotBoxRenderer.prototype.constructor = SK8RBotBoxRenderer;
    SK8RBotBoxRenderer.prototype.renderRotated = function()  {
        var widthPxls = SK8RCanvas.worldLengthToScreen(this.width) ;
        var heightPxls = SK8RCanvas.worldLengthToScreen(this.height) ;
        var ctx = SK8RCanvas.getContext() ;	
        ctx.fillStyle = this.fillStyle;
        ctx.fillRect(-widthPxls/2, -heightPxls/2,
            widthPxls, heightPxls);
    }

function SK8RBotActorStateRenderer(actor) {
    this.actor = actor ;
}
    SK8RBotActorStateRenderer.prototype.render = function() {
        var canvasSize = SK8RCanvas.getCanvasSize() ;
        var ctx = SK8RCanvas.getContext() ;
        var text = "Left Desired [Arm Angle: " + 
            (this.actor.leftArmDesiredAngle * (180/Math.PI)).toFixed(1) + 
            " foot translation: " + 
            this.actor.leftFootDesiredTranslation.toFixed(1) + 
            "]";
        ctx.textBaseline="top";
        ctx.font = "14px sans" ;
        var metrics = ctx.measureText(text) ;
        var textx = canvasSize.width/2 - metrics.width/2 ;
        ctx.clearRect(20, 0, canvasSize.width-40, 24);
        ctx.fillStyle="rgba(128, 128, 128, 0.5)" ;
        ctx.fillRect(20, 0, canvasSize.width-40, 24);
        ctx.fillStyle="rgba(255, 255, 255, 0.8)" ;
        ctx.fillText(text, textx, 1, canvasSize.width) ;

    }
    
    SK8RBotActorStateRenderer.prototype.getZIndex = function() {
        return ZIndices.Overlay ;
    }
