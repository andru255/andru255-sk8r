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
function Person(name) {
	this.name = name;
}
function Employee(name, salary) {
	Person.call(this, name);
	this.salary = salary;
}
Employee.prototype = delegate(Person.prototype);
Employee.prototype.constructor = Employee;
*/
var SK8RDelegate = (function() {
    function F() {}
    return (function(obj) {
        F.prototype = obj;
        return new F();
    });
})();

function SK8RBindCall(obj, fn) {
    return function() {
        return fn.call(obj) ;
    };
}

function SK8RBindApply(obj, fn) {
    return function() {
        return fn.apply(obj, arguments) ;
    };
}
