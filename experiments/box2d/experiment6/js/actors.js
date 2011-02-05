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


function SK8RBotActor(box2dentities) {
    if (!box2dentities) {
        throw "SK8RBotActor must have Box2D entities" ;
    }
    this.box2dentities = box2dentities ;

    this.neutralArmAngle = 1 ; // 57 degrees
    this.neutralFootDistance = box2dentities.rightFootJoint.GetLowerLimit() + 
    (box2dentities.rightFootJoint.GetUpperLimit() - box2dentities.rightFootJoint.GetLowerLimit()) / 2 ;
    this.rightArmDesiredAngle = this.neutralArmAngle ;
    this.leftArmDesiredAngle = this.neutralArmAngle ;
    this.leftFootDesiredTranslation = this.neutralFootDistance ;
    this.rightFootDesiredTranslation = this.neutralFootDistance ;
    this.renderer = new SK8RBotActorStateRenderer(this);
}

    SK8RBotActor.prototype.step = function(timeSinceLastStep) {
        var raj = this.box2dentities.rightArmBodyJoint;
        var rajAngleError = raj.GetJointAngle() - this.rightArmDesiredAngle;
        raj.SetMotorSpeed(-4 * rajAngleError) ;
        var laj = this.box2dentities.leftArmBodyJoint;
        var lajAngleError = laj.GetJointAngle() + this.leftArmDesiredAngle;
        laj.SetMotorSpeed(-4 * lajAngleError) ;
        
        var lfj = this.box2dentities.leftFootJoint ;
        var lfjTranslationError = lfj.GetJointTranslation() - this.leftFootDesiredTranslation ;
        lfj.SetMotorSpeed(-1 * lfjTranslationError) ;
        var rfj = this.box2dentities.rightFootJoint ;
        var rfjTranslationError = rfj.GetJointTranslation() - this.rightFootDesiredTranslation ;
        rfj.SetMotorSpeed(-1 * rfjTranslationError) ;
        SK8RGameWorld.queueRenderer(this.renderer) ;
    }
    
        
    SK8RBotActor.prototype.onkeydown = function(event) {
        if (event) {
            switch (event.keyIdentifier) {
                case "Right" :
                    this.leftFootDesiredTranslation += 0.1 ;
                    this.rightFootDesiredTranslation -= 0.1 ;
                    this.rightArmDesiredAngle -= 0.1 ;
                    this.leftArmDesiredAngle += 0.1 ;
                    break ;
                case "Left" :
                    this.leftFootDesiredTranslation -= 0.1 ;
                    this.rightFootDesiredTranslation += 0.1 ;
                    this.rightArmDesiredAngle += 0.1 ;
                    this.leftArmDesiredAngle -= 0.1 ;
                    break ;
                case "Down" :
                case "Up" :
                    console.log(event.keyIdentifier);
                    break ;
                case "Enter" :
                    SK8RGameWorld.reset() ;
                    break ;
            }
        }
        return true ;
    }
