import CircularQueue from '../modules/CircularQueue.mjs';

let circularQueue = new CircularQueue('slideshow');
circularQueue.insertData( 'http://127.0.0.1:5500/images/chang-an.jpg', 'chang-an');
circularQueue.insertData( 'http://127.0.0.1:5500/images/flower-garden.jpg', 'flower-garden');
circularQueue.insertData( 'http://127.0.0.1:5500/images/flower-garden2.jpg', 'flower-garden2');
circularQueue.insertData( 'http://127.0.0.1:5500/images/palace_wall.jpg', 'palace_wall');
console.log(`Created CircularQueue with Images √`);

var Carousel = (function(DOM, WINDOW, QUEUE) {

    let screenWidth;
    let screenHeight;

    function _createSlideWithImage(bShowingSlideTwo, imageURL) {
        let slide = DOM.createElement("div");
        slide.id = !bShowingSlideTwo ? "slide2" : "slide1";
        slide.style.backgroundImage = `url('${imageURL}')`;
        slide.style.left = screenWidth + 'px';
        slide.className = 'slide';
        console.log(`Created Slide ${slide.id} where left is ${slide.style.left}`)
        return slide;
    }
 
    function _createSlideContent(bShowingSlideTwo, title1, title2) {
        let slideContent = DOM.createElement("div");
        slideContent.className = 'slide-content';
        let spanText = DOM.createElement('span');
        //spanText.innerHTML = (!bShowingSlideTwo) ? title1 : title2;
        slideContent.appendChild(spanText);
        return slideContent;
    }

    function _insertSlideIntoSlider(bShowingSlideTwo, queue, slideTwoText, slideOneText, sliderID) {
        let imageURL;
        queue.moveNext(function(from, to){
            console.log(`${from.data} to ${to.data}`);
            imageURL = to.data;
        });
        let newSlide = _createSlideWithImage(bShowingSlideTwo, imageURL);
        let slideContent = _createSlideContent(bShowingSlideTwo, slideTwoText, slideOneText);
        newSlide.appendChild(slideContent);
        let slider = DOM.getElementById(sliderID);
        slider.appendChild(newSlide);
        return slider;
    }

   function _removeSlideFromSlider(bShowingSlideTwo) {
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

    let _animationIntervalID = null;

    function _animationFrame(callback) {
        if (!this._bShowingSlideTwo && (this._posTwo <= 50)) {
            this._bShowingSlideTwo = true;
            callback();
        } else if (this._bShowingSlideTwo && (this._posOne <= 50)) {
            this._bShowingSlideTwo = false;
            callback();
        } else {
            this._animateTime = this._animateTime + 0.002;
            this._animateIncrement = 1/this._animateTime;
            this._posOne = this._posOne - this._animateIncrement; 
            this._posTwo = this._posTwo - this._animateIncrement;
            this._slideOne.style.left = `${this._posOne}px`; 
            this._slideTwo.style.left = `${this._posTwo}px`; 
        }  
    }

    function _addRightArrowEventHandler() {
        let arrowRight = DOM.querySelector('#arrow-right');
        if (arrowRight) {
            arrowRight.addEventListener('click', () => {
                let bound = _animationFrame.bind(this, () => {
                    clearInterval(_animationIntervalID);
                    _removeSlideFromSlider(this._bShowingSlideTwo);
                    this._slider = _insertSlideIntoSlider(this._bShowingSlideTwo, this._circularQueue, '', '', 'slider');
                    this._slideTwo = DOM.querySelector('#slide2');
                    this._slideOne = DOM.querySelector('#slide1');
                    this._posOne = _getPosition(this._slideOne);
                    this._posTwo = _getPosition(this._slideTwo);
                    this._animateTime = 0;
                    this._animateInterval = 0;
                });
                _animationIntervalID = setInterval(bound, 0);
            });
        } else { console.log('arrowRight not found'); }
    }

    function _getPosition(slider) {
        if (!slider) {
            console.log("script.js - _getPosition, slider is null");
            return null;
        }
        let leftPos = slider.style.left;
        return leftPos.substring(0, leftPos.indexOf('px'));
    }

    class Carousel {
        constructor() {
            screenWidth = WINDOW.innerWidth;
            screenHeight = WINDOW.innerHeight;

            // move all private variables here
            var _circularQueue = QUEUE;
            _circularQueue.setCur('chang-an');
            let image = circularQueue.getCur();
            var _bShowingSlideTwo = false;

            // initiate slide 1
            var _slideOne = DOM.querySelector('#slide1');
            _slideOne.style.left = '0px';
            _slideOne.style.backgroundImage = `url('${image.data}')`;

            // to do look here how it is set up, and do similar
            var _slider = _insertSlideIntoSlider(_bShowingSlideTwo, _circularQueue, '', '', 'slider');
            var _slideTwo = DOM.querySelector('#slide2');
            var _posOne = _getPosition(_slideOne);
            var _posTwo = _getPosition(_slideTwo);
            var _animateTime = 0;
            var _animateInterval = 0;
            let data = {
                _bShowingSlideTwo,
                _posOne,
                _posTwo,
                _slideOne,
                _slideTwo,
                _posOne,
                _posTwo,
                _slider,
                _animateTime,
                _animateInterval,
                _circularQueue,
            }

            // private function
            WINDOW.onresize = () => {
                screenHeight = WINDOW.innerHeight;
                screenWidth = WINDOW.innerWidth;
                if (data._bShowingSlideTwo) {
                    data._slideTwo.style.left = '0px';
                    data._slideOne.style.left = screenWidth+'px';
                } else {
                    data._slideTwo.style.left = screenWidth+'px';
                    data._slideOne.style.left = '0px';
                }
                data._posOne = _getPosition(data._slideOne);
                data._posTwo = _getPosition(data._slideTwo);
            }
            _addRightArrowEventHandler.call(data, screenWidth, screenHeight);
        }
    }
    return Carousel;
})(document, window, circularQueue);

new Carousel(document, window, circularQueue);
console.log(`Created Carousel instance √`);

export default Carousel;

