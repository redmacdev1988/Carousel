
console.log('loading script.js');



var CircularQueue = (function() {

    class Node {
        constructor(newName='', newNext=null, newPrev=null, newData) {
            this.name = newName;
            this.next = newNext;
            this.prev = newPrev;
            this.data = newData;
        }
    
        print() { console.log(`-- ${this.name}, with data: ${this.data} --`); }
    
        delete() {
            this.name = null;
            this.next = null;
            this.prev = null;
            this.data = null;
    
            delete this.name;
            delete this.next;
            delete this.prev;
            delete this.data;
        }
    }

    let privateProps = new WeakMap();

    class CircularQueue {

        constructor(nameOfQueue) {
            console.log(`creating Queue ${nameOfQueue}`);
            privateProps.set(this, {
                head: null,
                tail: null,
                cur: null,
            }); // this is private

            this.name = nameOfQueue;
            this.numOfItems = 0;
        }
    
        // prototype functions
        insertData(data, name) {
            console.log(`inserting data [${data}] into Queue ${this.name}`);
            let pvt = privateProps.get(this);
            if (pvt.head === null) {
                pvt.head = new Node(name, null, null, data);
                pvt.head.prev = pvt.head.next = pvt.cur = pvt.tail = pvt.head;
            } else {
                pvt.tail = new Node(name, pvt.head, pvt.tail, data);
                pvt.tail.prev.next = pvt.tail;
                pvt.head.prev = pvt.tail;
            }
            this.numOfItems++;
        }

        removeData(data) {
            let node = this.getData(data);
            if (node) {
                let pvt = privateProps.get(this);
                node.prev.next = node.next;
                node.next.prev = node.prev;

                if (node == pvt.head) {
                    pvt.head = node.next;
                } else if (node == pvt.tail) {
                    pvt.tail = node.next
                } else if (node == pvt.cur) {
                    pvt.cur = node.next;
                }

                node.delete();
                console.log(`removed data ${data}`);
                this.numOfItems--;
            } else {
                console.log(`${data} not found in Queue ${this.name}`);
            }
        }

        getData(data) {
            if (this.numOfItems > 0) {
                let pvt = privateProps.get(this);
                let temp = pvt.head;
                while (temp != pvt.tail) {
                    if (temp.data === data) { return temp; }
                    temp = temp.next;
                }
                return (temp.data === data) ? temp : null;
            }
            return null;
        }

        getCur() {
            let pvt = privateProps.get(this);
            return pvt.cur;
        }

        setCur(name) {
            if (this.numOfItems > 0) {
                let pvt = privateProps.get(this);
                let temp = pvt.head;
                while (temp != pvt.tail) {
                    if (temp.name === name) { 
                        pvt.cur = temp;
                        return temp; 
                    }
                    temp = temp.next;
                }
                if (temp.name === name) {
                    pvt.cur = temp;
                    return temp; 
                }
                return null;
            }
            return null;
        }

        moveNext(callback) {
            let pvt = privateProps.get(this);
            let from = pvt.cur;
            let to = pvt.cur.next;
            pvt.cur = pvt.cur.next;
            callback(from, to);
        }

        movePrev(callback) {
            let pvt = privateProps.get(this);
            let from = pvt.cur;
            let to = pvt.cur.prev;
            pvt.cur = pvt.cur.prev;
            callback(from, to);
        }

        print() {
            console.log(`There are ${this.numOfItems} items in Queue ${this.name}`);
            if (this.numOfItems > 0) {
                let pvt = privateProps.get(this);
                let temp = pvt.head;
                while (temp != pvt.tail) {
                    temp.print();
                    temp = temp.next;
                }
                temp.print();
            }
        }

        iterate(callback) {
            let index = 0;
            if (this.numOfItems > 0) {
                let pvt = privateProps.get(this);
                let temp = pvt.head;
                while (temp != pvt.tail) {
                    callback(temp, index++); // give data
                    temp = temp.next; // move next
                }
                callback(temp, index++);
            }
        }
    }
    return CircularQueue;
})();

let circularQueue = new CircularQueue('slideshow');

var Carousel = (function(DOM, WINDOW, queue) {

    let screenWidth;
    let screenHeight;

    WINDOW.onresize = () => {
        console.log('window resize!');
        screenHeight = WINDOW.innerHeight;
        screenWidth = WINDOW.innerWidth;
    }

    _createSlideWithImage = (bShowingSlideTwo, img1, img2) => {
        let slide = DOM.createElement("div");
        if (!bShowingSlideTwo) {
            slide.id = "slide2";
            slide.style.backgroundImage = `url('${img2.src}')`;
        } else {
            slide.id = "slide1";
            slide.style.backgroundImage = `url('${img1.src}')`;
        }
        slide.style.left = screenWidth + 'px';
        slide.className = 'slide';
        console.log(`Created Slide ${slide.id} where left is ${slide.style.left}`)
        return slide;
    }
 
    _createSlideContent = (bShowingSlideTwo, title1, title2) => {
        let slideContent = DOM.createElement("div");
        slideContent.className = 'slide-content';
        let spanText = DOM.createElement('span');
        spanText.innerHTML = (!bShowingSlideTwo) ? title1 : title2;
        slideContent.appendChild(spanText);
        return slideContent;
    }

    _insertSlideIntoSlider = (bShowingSlideTwo, img1, img2, slideTwoText, slideOneText, sliderID) => {
        let newSlide = _createSlideWithImage(bShowingSlideTwo, img1, img2);
        let slideContent = _createSlideContent(bShowingSlideTwo, slideTwoText, slideOneText);
        newSlide.appendChild(slideContent);
        let slider = DOM.getElementById(sliderID);
        slider.appendChild(newSlide);
        return slider;
    }

   _removeSlideFromSlider = (bShowingSlideTwo) => {
        let slider = DOM.getElementById('slider');
        var slideTwo = DOM.querySelector('#slide2');
        var slideOne = DOM.querySelector('#slide1');

        if (bShowingSlideTwo) {
            slider.removeChild(slideOne);
            slideTwo.style.left = '0px';
        } else {
            slider.removeChild(slideTwo);
            slideOne.style.left = '0px';
        }
   }

    let _testId = null;

    function _testFrame() {
  
        if (!this._bShowingSlideTwo && (this._posOne <= -1 * screenWidth || this._posTwo < 0)) {
            console.log(`successfully animated slide 2 into view, and slide 1 away`)
            clearInterval(_testId);
            this._bShowingSlideTwo = true;
            _removeSlideFromSlider(this._bShowingSlideTwo);

            console.log('insert slide 1 and set up position');
            this._slider = _insertSlideIntoSlider(this._bShowingSlideTwo, this._img1, this._img2, 'ImageTwo', 'Image One', 'slider');
            this._slideTwo = DOM.querySelector('#slide2');
            this._slideOne = DOM.querySelector('#slide1');
            this._posOne = _getPosition(this._slideOne);
            this._posTwo = _getPosition(this._slideTwo);
            this._animateTime = 0;
            this._animateInterval = 0;
            console.log(`After inserting slide 1, posOne: ${this._posOne} posTwo: ${this._posTwo}`);
        }
        
        else if (this._bShowingSlideTwo && (this._posTwo < -1 * screenWidth || this._posOne < 0)) {
            console.log(`successfully animated slide 1 into view, and slide 2 away`)
            clearInterval(_testId);
            this._bShowingSlideTwo = false;
            _removeSlideFromSlider(this._bShowingSlideOne);

            console.log('insert slide 2 and set up position');
            this._slider = _insertSlideIntoSlider(this._bShowingSlideTwo, this._img1, this._img2, 'ImageTwo', 'Image One', 'slider');
            this._slideTwo = DOM.querySelector('#slide2');
            this._slideOne = DOM.querySelector('#slide1');
            this._posOne = _getPosition(this._slideOne);
            this._posTwo = _getPosition(this._slideTwo);
            this._animateTime = 0;
            this._animateInterval = 0;
            console.log(`After inserting slide 2, posOne: ${this._posOne} posTwo: ${this._posTwo}`);

        }
        else {
            this._animateTime = this._animateTime + 0.005;
            this._animateIncrement = 1/this._animateTime;
            this._posOne = this._posOne - this._animateIncrement; 
            this._posTwo = this._posTwo - this._animateIncrement;
            this._slideOne.style.left = `${this._posOne}px`; 
            this._slideTwo.style.left = `${this._posTwo}px`; 
            console.log(`pos one: ${this._posOne}, pos two: ${this._posTwo}`); 
             
        }
    }

    function addRightArrowEventHandler(screenWidth, screenHeight) {
        let arrowRight = DOM.querySelector('#arrow-right');
        if (arrowRight) {
            arrowRight.addEventListener('click', () => { //arrow function gives parent this
                let bound = _testFrame.bind(this, screenWidth, screenHeight);
                _testId = setInterval(bound, 0);
            });
        } else { console.log('arrowRight not found'); }
    }
    _getPosition = slider => {
        if (!slider) {
            console.log("script.js - _getPosition, slider is null");
            return null;
        }
        let leftPos = slider.style.left;
        return leftPos.substring(0, leftPos.indexOf('px'));
    }

    class Carousel {
        constructor() {
            console.log(`-- constructing a Carousel --`);
            screenWidth = WINDOW.innerWidth;
            screenHeight = WINDOW.innerHeight;

            console.log(`width - ${screenWidth}, height - ${screenHeight}`);
            console.log('Carousel this', this);

            this.counter = 0;

            // move all private variables here

            var _bShowingSlideTwo = false;
            var _img1 = new Image();
            _img1.src='http://127.0.0.1:5500/images/chang-an.jpg';    
            var _img2 = new Image();
            _img2.src='http://127.0.0.1:5500/images/palace_wall.jpg';

            // to do look here how it is set up, and do similar
            var _slider = _insertSlideIntoSlider(_bShowingSlideTwo, _img1, _img2, 'ImageTwo', 'Image One', 'slider');
            var _slideTwo = DOM.querySelector('#slide2');
            var _slideOne = DOM.querySelector('#slide1');
            var _posOne = _getPosition(_slideOne);
            var _posTwo = _getPosition(_slideTwo);

            var _animateTime = 0;
            var _animateInterval = 0;


            addRightArrowEventHandler.call({
                _bShowingSlideTwo,
                _img1,
                _img2,
                _posOne,
                _posTwo,
                _slideOne,
                _slideTwo,
                _posOne,
                _posTwo,
                _slider,
                _animateTime,
                _animateInterval,
            }, screenWidth, screenHeight);
            // add event listener
            //addRightArrowEventHandler(screenWidth, screenHeight, this);
        }
    }

    return Carousel;

})(document, window, circularQueue);


let c = new Carousel(document, window, circularQueue);


/*

let imageSlider = document.getElementById('slider');
let bShowingSlideTwo = false;
let arrowRight = document.querySelector('#arrow-right');

if (arrowRight) {
    arrowRight.addEventListener('click', function() {
        console.log('arrow right clicked');

        // insert slide
        let slide = document.createElement("div");
        if (!bShowingSlideTwo) {
            slide.id = "slide2";
            slide.style.backgroundImage = `url('${img1.src}')`;
        } else {
            slide.id = "slide1";
            slide.style.backgroundImage = `url('${img2.src}')`;
        }

        slide.style.left = '1130px';
        slide.className = 'slide';
        
        let slideContent = document.createElement("div");
        slideContent.className = 'slide-content';
        
        let spanText = document.createElement('span');
        spanText.innerHTML = (!bShowingSlideTwo) ? 'Image Two' : 'Image One';
        
        slideContent.appendChild(spanText);
        slide.appendChild(slideContent);
        
        let slider = document.getElementById("slider");
        slider.appendChild(slide);

        // animate both slides to the left
        let slide1 = document.querySelector('#slide1');
        let slide2 = document.querySelector('#slide2');
  
        let leftOne = slide1.style.left;
        let posOne = leftOne.substring(0, leftOne.indexOf('px'));
        let leftTwo = slide2.style.left;
        let posTwo = leftTwo.substring(0, leftTwo.indexOf('px'));


        var id = setInterval(frame, 5);
        let increment = 10;

        function frame() {
            if (!bShowingSlideTwo && (posOne <= -1130 || posTwo == 0)) {
                clearInterval(id);
                slider.removeChild(slide1);
                bShowingSlideTwo = true;
            }
            else if (bShowingSlideTwo && (posTwo <= -1130 || posOne == 0)) {
                clearInterval(id);
                slider.removeChild(slide2);
                bShowingSlideTwo = false;
            } 
            else {
                posOne = posOne - increment; 
                posTwo = posTwo - increment;
                slide1.style.left = `${posOne}px`; 
                slide2.style.left = `${posTwo}px`; 
            }
        }

    });
} else {
    console.log('arrowRight not found');
}

*/


/*
let c = new CircularQueue('slideshow');
c.insertData('image1.jpg', 'hil');
c.insertData( 'image2.jpg', 'shadow');
c.insertData( 'image3.jpg', 'sun');
c.insertData( 'image4.jpg', 'moon');
c.insertData('image5.jpg', 'sky');
c.insertData( 'image6.jpg', 'rain');

//let result = c.getData('image88.jpg');
c.removeData('image8.jpg');
c.removeData('image3.jpg');
c.removeData('image4.jpg');
c.removeData('image1.jpg');
c.print();

let res = c.setCur('rain');
console.log('res', res)

c.moveNext(function(from, to){
    console.log(`${from.data} to ${to.data}`);
});

c.moveNext(function(from, to){
    console.log(`${from.data} to ${to.data}`);
});

c.moveNext(function(from, to){
    console.log(`${from.data} to ${to.data}`);
});

c.moveNext(function(from, to){
    console.log(`${from.data} to ${to.data}`);
});
*/

/*
var obj = {
    // function reference 'bar'
    bar: function() {
      console.log("--- obj calling function bar --- ")
      console.log("√ bar's 'this' is: ", this) // references the outer literal object 'obj'
     
      var x = () => {
        console.log(" --- in arrow function --- ")
        console.log(this) // references the outer literal object 'obj'
      };
      // returns a reference to a function
      return x;
    }
  }; // object literal

let x = obj.bar();
x();
*/

/*
function isFullAge5() {

    // arguments is an object
    var argsArr = Array.prototype.slice.call(arguments);
 
    console.log(argsArr); // now argsArr is an array of the paramters you have passed in
 
    argsArr.forEach(function(cur) {
        console.log((2019 - cur) >= 18);
    });
}

function isFullAge6(limit, ...years) {
    console.log('arguments', arguments)
    console.log('years', years) // the spread operator will collect all parameters and insert them into array 'years'
    // this is the same as using let years = Array.prototype.slice.call(arguments)
    
    years.forEach(cur => console.log( (2019 - cur) >= limit));
}


const obj1 = { foo: 'bar', x: 42 };
const obj2 = { foo: 'baz', y: 13 };

const clonedObj = { ...obj1, ...obj2 };
// Object { foo: "bar", x: 42 }

clonedObj.x = 66;

console.log('obj1', obj1)
console.log('clonedObj', clonedObj);

const mergedObj = { ...obj1, ...obj2 };
// foo gets assigned 'bar', then 'baz'
// Object { foo: "baz", x: 42, y: 13 }
console.log('mergedObj', mergedObj)

// spread operator takes objects as param1, param2,... param n.
function merge(...objs) { 

    // The properties of obj map onto function's parameters
    // take note that parameters is an object. And thus this step converts to array:

    // obj = Array.prototype.slice.call(obj)
    // now obj is an array

    let a = {...objs}
    console.log('a', a)
    // { '0': { foo: 'bar', x: 42 }, '1': { foo: 'baz', y: 13 } }

    let clonedObj;
    objs.forEach( (obj, index) => {
        console.log(`-- at index ${index} --`, obj)
        
        // spread operator spreads the existing properties of the object onto this literal object.
        // the more spread op applied to object, the more properties of those objects will be appended
        // this literal object
        clonedObj = { ...clonedObj, ...obj }
        console.log('clonedObj', clonedObj)
    })
}

merge(obj1, obj2)
*/

/*
var obj = {

    hoho: function() {
        console.log('ho ho ho');
        //console.log(this); // obj

        function hehe() {
            console.log('hehehe');
            //console.log(this); // global 
            
            function haha() {
                console.log('hahah');
                //console.log(this); // global

                setTimeout( function() {
                    console.log(`Turtle has crossed the finished line! :D`);
                    console.log(this);
                }, 2000);
            }
            haha();
        }
        hehe();
    }
}

obj.hoho();
*/

/*
var person = {
    firstName: 'Default',
    lastName: "Default",
    greet: function() {
        return 'hello ' + this.firstName;
    }
}
*/


/*


(function(global){

    // factory function that returns instances
    var Greetr = function(firstName, lastName, language) {
        return new Greetr.Creator(firstName, lastName, language);
    }

    // this is where we put our custom prototype properties and functions

    // we expose functionalities in this prototype object
    // we do so by declaring properties
    Greetr.prototype = { 
        // placeholders to show exposure
        createdBy: 'ricky tsao',
        copyRight: '2019 Home',

        // our public functionality

        // return full name
        fullName: function() {
            return this.firstName + ' ' + this.lastName;
        },

        // this.language by default is 'en'. And will be other language if set.
        // so we be sure that it will have a value
        validate: function() {
            if (supportedLangs.indexOf(this.language) === -1 ) {
                throw "Invalid language";
            } else {
                console.log(`√ valid language`);
            }
        },

        setLang: function(newLanguage) {
            this.language = newLanguage;
            this.validate();
            return this;
        },

        doGreeting: function() {
            console.log(greetings[this.language] + ', ' + this.firstName);
            return this;
        },

        doFullGreeting: function() {
            console.log(formalGreetings[this.language] + ', ' + this.fullName());
            return this;
        }

    }


    // private variable to be used
    var supportedLangs = ['en', 'zh'];
    var greetings = {
        en: 'hello',
        zh: 'ni hao',
    };

    var formalGreetings = {
        en: 'Greetings my friend',
        zh: 'Nin hao wo de peng you',
    };

    Greetr.Creator = function(fName, lName, lang) {
        this.firstName = fName || '';
        this.lastName = lName || '';
        this.language = lang || 'en';
    }

    // when used with 'new', returns an Creator that 
    // points to Greetr.prototype
    Greetr.Creator.prototype = Greetr.prototype;

    // add property 'Greetr' to the global object, then have it point to
    // our factory function Greetr
    global.Greetr = Greetr;

}(global));

let a = global.Greetr('ricky', 'cao');

a.setLang('zh').doGreeting().doFullGreeting();

*/

/*
// given an array or object
const myDeepCopy = inObject => {

    console.log('-- myDeepCopy --', inObject)

    
    // array and objects are both of type "Object"
    // so if the inObject is neither an array nor object, 
    // we exit because we only deep copy objects and arrays
    if (typeof inObject !== "object" || inObject === null) {
        return inObject;
    }

    // Initialization Phase. If incoming object is an array, we initialize to empty array []
    // if its an object, we initialize our source to empty literal object {} 
    let outObject;

    if (Array.isArray(inObject)) {
        console.log('incoming object is an array!')
        outObject = []
    } else {
        console.log('incoming object is an object!')
        outObject = {};
    }

    // if its an array, each key is the element index
    // if its an object, then its key/value as is
    for (key in inObject) {
        console.log('key', key)
        console.log('value', inObject[key])

        let value = inObject[key]
        
        // typically, we'd do this
        //outObject[key] = value 

        // But! there's a problem
        // if value is an object, we're doing a shallow copy here. Which means we're simply just pointing our 
        // outObject[key] to the same object inObject[key] is pointing to. Hence, we dont' have our own copy.
        
        // in order to make our own copy, we use recursion and let our 'Initialization Phase'
        // create the deep initial object first

        // check if value is object, is referencing valid data
        if (typeof value === 'object' && value !== null) {
            outObject[key] = myDeepCopy(value)
        } else {
            outObject[key]= value
        }
    }

    console.log('outObject', outObject)
    return outObject
}
*/

//let arr = ['a', 'b', 'c', 'd', 'e']
/*
let obj = {
    name: 'ricky',
    age: 40,
    luckyNumbers: [6, 8]
}
*/

//let destObj = myDeepCopy(arr)

/*
obj.luckyNumbers[0] = 8
console.log('src object', obj)
console.log('destination obj', destObj)
*/
/*
function User() {

    this.tournament = "The Masters";
    this.data = [{name:"T. Woods", age:37}, {name:"P. Mickelson", age:43}];

    // due to public property assigned to this function, we can access this
    this.clickHandler = function(phrase) {

        var outerFuncNum = 888;
        var outerFuncString = "outer limits";

        console.log(this.tournament); 
        console.log(this.data);       

        // function is standalone
        this.data.forEach (function (person) {

          var ownVarNum = 123;
          var ownVarString = "hehe";

          // It is important to take note that closures cannot access the
          // outer function’s this variable by using the this keyword because
          // the this variable is accessible only by the function itself,
          // not by inner functions.

          // this inside the anonymous function cannot access the outer function’s this,
          // so it is bound to the global window object, when strict mode is not being used.

          console.log("1) own vars");
          console.log(ownVarNum);
          console.log(ownVarString);

          console.log("2) outer function's vars");
          console.log(outerFuncNum);
          console.log(outerFuncString);

          console.log("3) outer function's parameter");
          console.log(phrase);

          console.log ("4) Inside closure: " + this); // global
        })
    }
}

var user = new User();
user.clickHandler("merry xmas!");

*/





