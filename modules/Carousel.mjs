import CircularQueue from '../modules/CircularQueue.mjs';

let _circularQueue = new CircularQueue('slideshow');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/chang-an.jpg', 'chang-an');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/flower-garden.jpg', 'flower-garden');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/flower-garden2.jpg', 'flower-garden2');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/palace_wall.jpg', 'palace-wall');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/beijing-grounds.jpg', 'beijing-grounds');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/wujiang-concert.jpg', 'wujiang-concert');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/wujiang-park.jpg', 'wujiang-park');
_circularQueue.insertData( 'http://127.0.0.1:5500/images/Zhou-Zhuang-Boat.jpg', 'Zhou-Zhuang-Boat');


console.log(`Created CircularQueue with Images √`);

let _screenWidth;

function _createSlideWithImage(imageURL, id, startingX) {
    let slide = document.createElement("div");
    slide.id = id;
    slide.style.backgroundImage = `url('${imageURL}')`;
    slide.style.left = startingX + 'px';
    slide.className = 'slide';
    return slide;
}

function _createSlideContent(slideText) {
    let slideContent = document.createElement("div");
    slideContent.className = 'slide-content';
    let spanText = document.createElement('span');
    spanText.innerHTML = slideText || '';
    slideContent.appendChild(spanText);
    return slideContent;
}

function _insertSlideIntoSlider(queue, sliderID, startingX, slideText) {
    let image = queue.getCur();
    let newSlide = _createSlideWithImage(image.data, sliderID, startingX);
    let slideContent = _createSlideContent(slideText);
    newSlide.appendChild(slideContent);
    let main = document.querySelector(this.mainID);
    main.appendChild(newSlide);
    return main;
}


function _addRightArrowEventHandler() {

    let arrowRight = document.querySelector('#arrow-right');
    if (arrowRight) {
        let animating = false;
        arrowRight.addEventListener('click', evt => {
            var _slides = document.getElementsByClassName('slide');  
            if (!animating) {
                gsap.to(_slides, { // config obj
                    duration: 1.0,
                    x: -1 * _screenWidth,
                    y: 0,
                    ease:'power4', // bounce, back,
                    clearProps:"transform", // clears out translate 3d,
                    onStart: function() {
                        if (!animating) { animating = true; } 
                    },
                    onComplete: function() {
                        if (animating) {
                            for (let i = 0; i < _slides.length; i++) {
                                let slide = _slides[i].style.left;
                                let indexOfPx = slide.indexOf('px');
                                let numeric = slide.substring(0, indexOfPx);
                                let nowX = numeric - _screenWidth;
                                _slides[i].style.left = nowX + 'px';
                                if (nowX < 0) {
                                    _slides[i].style.left = _screenWidth * (_slides.length-1) + 'px';
                                }
                            }
                            animating = false;
                        } 
                    },

                });
            }
        });
    } else { console.log('arrowRight not found'); }
}


class Carousel {
    constructor(mainID) {
        _screenWidth = window.innerWidth;
        this.mainID = mainID;

        _circularQueue.setCur('chang-an'); // initial image
        for (let i = 0; i < _circularQueue.numOfItems; i++ ) {

            let startingX = _screenWidth * i;
            let current =  _circularQueue.getCur();

            _insertSlideIntoSlider.call(
                this, 
                _circularQueue, 
                current.name, 
                startingX,
                ''
            );

            _circularQueue.moveNext(function(from, to){
                console.log(`${from} --> ${to}`)
            });
        }
        window.onresize = () => { _screenWidth = window.innerWidth;}
        _addRightArrowEventHandler.call(this);
    }
}

let carouselInstance = new Carousel("#slider");

console.log(`Created Carousel instance √`);
export default carouselInstance;



//https://www.npmjs.com/package/exif-js