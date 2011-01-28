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
var Fixtures = (function() {
    var self = {} ;
    var fixtures = new Array() ;
		
    self.step = function(timeSinceLastFrame) {
        for (var n=0; n<actors.length; n++) {
            actors[n].step(timeSinceLastFrame) ;
        }
    };
		
    return self ;
}()) ;