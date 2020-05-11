const CASES_BY_COUNTRY_URL = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php';
const X_RAPIDAPI_HOST = "coronavirus-monitor.p.rapidapi.com";
const X_RAPIDAPI_KEY = "bceb3c6713msh7b978618cfc7a1fp146facjsn41317387a72a";
const FLAGTABLE_CSS_ID = 'flagTable';
const NUM_OF_COUNTRIES_TO_DISPLAY = 25;

var CoronaCases = (function() {

    // private variablsed used by scope
    let privateProps = new WeakMap(); 
    let coronaStatsAppearFunc = Symbol('coronaStatsAppear func');
    let coronaStatsDisappearFunc = Symbol('coronaStatsDisappear func');
    let updateCoronaUIFunc = Symbol('updateCoronaUI func');
    let animateCoronaUIFunc = Symbol('animateCoronaUI func');

    function getCountrySVGIconURL(countryName) {
        return 'http://127.0.0.1:5500/images/countryflags/' + countryName + '.svg';
    }

    class CoronaCases {       
        constructor(casesURL, rapidApiHost, rapidApiKey) {  
            let decreasingFunc = (currentItem, nextItem, property) => {
                let next = nextItem[property].replace(/,/g, '');
                let cur = currentItem[property].replace(/,/g, '')
                let nextInt = parseInt(next);
                let curInt = parseInt(cur);
                return nextInt - curInt;
            }
            
            privateProps.set(this, {
                host: rapidApiHost,
                key: rapidApiKey,
                flagSize: '20',
                numOfCountriesToDisplay: NUM_OF_COUNTRIES_TO_DISPLAY,
                decreasing: decreasingFunc,
            }); // this is private
            
            this.url = casesURL;
            this.data;
            this.table = document.getElementById(FLAGTABLE_CSS_ID);

            this[coronaStatsAppearFunc] = (done) => {
                let timeStep = 20; 
                let timeFrame = 0;

                for (let opacity = 0; opacity < 1.1; opacity = opacity + 0.1) {           
                    timeFrame = timeFrame + timeStep + 2 * (opacity * opacity); 
                    ((op, time) => {
                    setTimeout(() => {
                        this.table.style.opacity = op;
                        if (op >= 1.1-0.1) { 
                            if (done && (typeof done === 'function')) done(); 
                        }
                    }, time);
                    })(opacity, timeFrame);
                } 
            } // CoronaStatsAppear
            

            let imgFlag = (flagName='China') => {
                let flagSize = privateProps.get(this).flagSize
                let imgEle = document.createElement('img');
                imgEle.setAttribute('height',flagSize);
                imgEle.setAttribute('width', flagSize);
                imgEle.setAttribute('src', getCountrySVGIconURL(flagName));
                return imgEle;
            }

            this[animateCoronaUIFunc] = (prevData, callback) => {

                let heightOfEachRow = 26+2; // height + border-spacing;
                // 1
                let country = this.data[1];
                let countryName = country.country_name;
                console.log(countryName);

                // 2)
                let countryToMove = document.querySelector('#' + countryName);
                console.log(countryToMove);
                let boundRect = countryToMove.getBoundingClientRect();
                console.log('boundRect', boundRect);
                countryToMove.classList.add('transition');

                console.log(prevData);
                
                // calculate 3
                const countryMovePath = { x: 0, y: -heightOfEachRow * 3}; 
                countryToMove.style.transform = `translate(${countryMovePath.x}px, ${countryMovePath.y}px)`;

        /*

        
        // let childAClientRect = countryA.getBoundingClientRect()
        // let childBClientRect = countryB.getBoundingClientRect();
        countryAPath.x = countryA.getBoundingClientRect().left - countryB.getBoundingClientRect().left;
        countryAPath.y = countryB.getBoundingClientRect().top - countryA.getBoundingClientRect().top;                        
        countryBPath.x = countryB.getBoundingClientRect().left - countryA.getBoundingClientRect().left;
        countryBPath.y = countryA.getBoundingClientRect().top - countryB.getBoundingClientRect().top;
                */

            }

            this[updateCoronaUIFunc] = callback => {
                if (!!this.table) {  // previous table exists, let's clear out its data
                    this.table.innerHTML = '';       
                } else { // previous table does not exist, let's create one
                    this.table = document.createElement('table');
                    this.table.setAttribute('id', FLAGTABLE_CSS_ID);
                }
                this.table.style.opacity = 0;
                var header = this.table.createTHead();
                var row = header.insertRow(0);
                var flagHeader = row.insertCell(0);
                flagHeader.innerHTML = '';

                var countryHeader = row.insertCell(1);
                countryHeader.innerHTML = 'Country';

                var casesHeader = row.insertCell(2);
                casesHeader.innerHTML = 'Cases';

                var deathsHeader = row.insertCell(3);
                deathsHeader.innerHTML = 'Deaths';

                var fatalityRateHeader = row.insertCell(4);
                fatalityRateHeader.innerHTML = 'Rate';

                let numOfCountriesToDisplay = privateProps.get(this).numOfCountriesToDisplay;
                for (var i = 0; i < numOfCountriesToDisplay; i++) {
                    let countryName = this.data[i].country_name;
                    let deaths = this.data[i].deaths;
                    let cases = this.data[i].cases;

                    let intDeaths = parseFloat(deaths.replace(/,/g, ''));
                    let intCases = parseFloat(cases.replace(/,/g, ''));
                    let deathPercentage = (intDeaths / intCases) * 100;

                    var tableRow = document.createElement('tr');
                    tableRow.setAttribute('id', countryName);

                    var imgData = document.createElement('td');
                    var aFlag = imgFlag(countryName);
                    imgData.appendChild(aFlag);
                    tableRow.appendChild(imgData); // row add data

                    var countryData = document.createElement("td"); 
                    countryData.setAttribute('class', 'country-name' );
                    var countrySpanContents = document.createTextNode(countryName);
                    countryData.appendChild(countrySpanContents);  // row add data
                    tableRow.appendChild(countryData);

                    var casesData = document.createElement("td"); 
                    casesData.setAttribute('class', 'cases');
                    var casesSpanContents = document.createTextNode(cases);
                    casesData.appendChild(casesSpanContents); 
                    tableRow.appendChild(casesData);

                    var deathData = document.createElement("td"); 
                    deathData.setAttribute('class', 'death');
                    var deathSpanContents = document.createTextNode(deaths);
                    deathData.appendChild(deathSpanContents); 
                    tableRow.appendChild(deathData);

                    var percentageData = document.createElement("td"); 
                    percentageData.setAttribute('class', 'percentage');
                    var percentageSpanContents = document.createTextNode(deathPercentage.toFixed(2) + ' %');
                    percentageData.appendChild(percentageSpanContents); 
                    tableRow.appendChild(percentageData);
                    this.table.appendChild(tableRow); // finally we add the row full of data
                }
                document.getElementById('CoronaVirusStats').appendChild(this.table);
                this[coronaStatsAppearFunc](callback); 
            }
            

            this[coronaStatsDisappearFunc] = (animate=true, done) => {
                if (animate) { 
                    if (!this.table) done(null);
                    let timeStep = 20; 
                    let timeFrame = 0;
                    for (let opacity = 1.1; opacity >= -0.1; opacity = opacity - 0.1) {           
                            timeFrame = timeFrame + timeStep + 2 * (opacity * opacity); 
                            ((op, time) => {
                                setTimeout(() => {
                                    if (this.table) {
                                        this.table.style.opacity = op;
                                        if (op < 0.0) {done();}
                                    } 
                                }, time);
                            })(opacity, timeFrame);
                    }  

                } else { done(); }
            } // coronaStatsDisappear 
        } // constructor

        
        //prototype function
        fetchData = () => {
            return fetch(this.url, {
                "method": "GET",
                "headers": {
                "x-rapidapi-host": privateProps.get(this).host,
                "x-rapidapi-key": privateProps.get(this).key
                }
            });               
        }
    
        // prototype function
        updateData = (animateTable=true, byDeaths=false, cbFinish) => {     
            this[coronaStatsDisappearFunc](animateTable?false:true, () => {  
                /*
                let loader = document.getElementById('CoronaLoader');
                loader.style.display = 'block';
                loader.style.position = 'relative';
                loader.style.right = '-360px';
                loader.style.top = '60px';

                if (this.table) this.table.innerHTML = loader;
                */

                this.fetchData()
                .then(response => response.json())
                .then(data => {
                    console.log('updateData', data);
                    let prevData = this.data;
                    //loader.style.display = 'none';
                    this.data = data.countries_stat;

                    console.log(prevData);
                    console.log(this.data);
                    if (byDeaths) {
                        this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'deaths'));
                    } else {
                        this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'cases'));
                    }

                    if (animateTable) {
                        this[animateCoronaUIFunc](prevData, cbFinish);
                    } else this[updateCoronaUIFunc](cbFinish);

                }).catch(err => { console.log(err);});
            });
        } // updateData          
    } // class
    return CoronaCases;
})();
    
var coronaInstance = new CoronaCases(CASES_BY_COUNTRY_URL, X_RAPIDAPI_HOST, X_RAPIDAPI_KEY);
coronaInstance.updateData(false, false, function() {
    styleTriggerBtn();
    //animateItemToItem('USA', 'Spain');
}); 


// create handlers for clicking on btns:
// 1) deaths
// 2) cases

function deaths() {
    console.log('clicked deaths button')
    coronaInstance.updateData(true, true, function() {
        /*
        var rows = document.getElementById(FLAGTABLE_CSS_ID).getElementsByTagName('tr');
        for (let i = 1; i <= NUM_OF_COUNTRIES_TO_DISPLAY; i++) {
          var tds = rows[i].getElementsByTagName('td');
          tds[3].style.color = 'red';
        }
        */
    }); 
}

function cases() {
    coronaInstance.updateData(true, false, function() {
        /*
        var rows = document.getElementById(FLAGTABLE_CSS_ID).getElementsByTagName('tr');
        for (let i = 1; i <= NUM_OF_COUNTRIES_TO_DISPLAY; i++) {
          var tds = rows[i].getElementsByTagName('td');
          tds[2].style.color = 'orange';
        }
        */

    }); 
}

document.querySelector('#deaths').addEventListener("click", deaths);
document.querySelector('#cases').addEventListener("click", cases);


//// for animating corona button /////////
let opened = true;
let coronaVirusBckgndWidth = 0;

function styleTriggerBtn() {
    let coronaBtn = document.querySelector('#coronaBtn');
    coronaBtn.style.position ='absolute';
    coronaBtn.style.top ='50%';
    let coronaVirusStatBckgnd = document.querySelector('#CoronaVirusStats');
    coronaVirusBckgndWidth = coronaVirusStatBckgnd.offsetWidth;
    coronaBtn.style.left = coronaVirusStatBckgnd.offsetWidth + (coronaBtn.offsetWidth/3) + 'px';
    coronaBtn.style.backgroundImage = `url('http://127.0.0.1:5500/images/countryflags/virus.png')`;
}

function createEventHandlerForTriggerBtn() {
    let coronaBtn = document.querySelector('#coronaBtn');
    let coronaVirusStatBckgnd = document.querySelector('#CoronaVirusStats');
    coronaBtn.addEventListener('click', function() {
        console.log('you clicked on the corona virus button');
        if (!opened) { // open it
            let increment = (coronaVirusBckgndWidth/60);
            for (let i = 0; i < 61; i++) {
                setTimeout( function() {
                    coronaBtn.style.transform = 'rotate( ' + i*3 + 'deg)';
                    coronaBtn.style.left = (i * increment) + 10 + 'px';
                    coronaVirusStatBckgnd.style.left =  (-1 * coronaVirusBckgndWidth + i * increment) + 'px';
                    if (i==60) {
                        coronaVirusStatBckgnd.style.left = '0px';
                        coronaBtn.style.left = coronaVirusBckgndWidth + 10 + 'px';
                    }
                }, 4 * i);
            }
            opened = true;
        } else { // close it
            let increment = (coronaVirusBckgndWidth/60);
            for (let i = 0; i < 61; i++) {
                setTimeout( function() {
                    coronaBtn.style.transform = 'rotate( ' + (180-i*3) + 'deg)';
                    coronaBtn.style.left = (coronaVirusBckgndWidth - (i * increment)) + 10 + 'px';
                    coronaVirusStatBckgnd.style.left =  (i * -increment) + 'px';
                    if (i==60) {
                        coronaBtn.style.left = '10px';
                        coronaBtn.style.left = -1*coronaVirusBckgndWidth;
                    }
                }, 4 * i);
            }
            opened = false;
        } 
    });
}

createEventHandlerForTriggerBtn();

//////////////

// 

function animateItemToItem(countryNameA, countryNameB) {
    console.log('animateItemToItem');

    const countryAPath = { x: null, y: null, };
    const countryBPath = { x: null, y: null, };

    document.querySelector('#test').addEventListener('click', () => {
        console.log('test');

        const countryA = document.querySelector('#' + countryNameA);
        const countryB = document.querySelector('#' + countryNameB);

        console.log(countryA);
        console.log(countryB);

        countryA.classList.add('transition');
        countryB.classList.add('transition');

        // let childAClientRect = countryA.getBoundingClientRect()
        // let childBClientRect = countryB.getBoundingClientRect();
        countryAPath.x = countryA.getBoundingClientRect().left - countryB.getBoundingClientRect().left;
        countryAPath.y = countryB.getBoundingClientRect().top - countryA.getBoundingClientRect().top;                        
        countryBPath.x = countryB.getBoundingClientRect().left - countryA.getBoundingClientRect().left;
        countryBPath.y = countryA.getBoundingClientRect().top - countryB.getBoundingClientRect().top;

        console.log(countryAPath);
        console.log(countryBPath);

        // transform A -50 pixel down on the y-axis
        countryA.style.transform = `translate(${countryAPath.x}px, ${countryAPath.y}px)`;

        // transform B 50 pixels up on the y-axis
        countryB.style.transform = `translate(${countryBPath.x}px, ${countryBPath.y}px)`;
    });
}


/*
const childA = document.querySelector('#childA');
                    const childB = document.querySelector('#childB');
                    const finalChildAStyle = { x: null, y: null, };
                    const finalChildBStyle = { x: null, y: null, };

                    let swapDone = false;
                    
                    document.querySelector('#swap').addEventListener('click', () => {
                        console.log('test swap');

                    if (swapDone === false) {
                        // add CSS property 'transition: transform ease-in 0.3s' for the animation
                        // if we do not use this, we simply get a quick switch of data from the two li
                        childA.classList.add('transition');
                        childB.classList.add('transition');

                        let childAClientRect = childA.getBoundingClientRect()
                        let childBClientRect = childB.getBoundingClientRect();
                        
                        finalChildAStyle.x = childA.getBoundingClientRect().left - childB.getBoundingClientRect().left;
                        finalChildAStyle.y = childB.getBoundingClientRect().top - childA.getBoundingClientRect().top;                        
                        finalChildBStyle.x = childB.getBoundingClientRect().left - childA.getBoundingClientRect().left;
                        finalChildBStyle.y = childA.getBoundingClientRect().top - childB.getBoundingClientRect().top;

                        console.log('a', childAClientRect);
                        console.log('b', childBClientRect);

                        console.log(finalChildAStyle);
                        console.log(finalChildBStyle);

                        // transform A -50 pixel down on the y-axis
                        childA.style.transform = `translate(${finalChildAStyle.x}px, ${finalChildAStyle.y}px)`;

                        // transform B 50 pixels up on the y-axis
                        childB.style.transform = `translate(${finalChildBStyle.x}px, ${finalChildBStyle.y}px)`;
                    
                        // done once
                        // if we do not use 
                        setTimeout(() => {

                            // we need to do the actual movement of the two li. 
                            // if this is not put here, all we see is animation of b going up and a doing down.
                            // then, it will flash back to a on top, and b on bottom.
                            // By doing this, we finisht the animation with the correct placements of these two li.
                            document.querySelector('.container').insertBefore(childB, childA);

                            // clear the usage of using CSS 'transform ease-in 0.3s' for the animation
                            childA.classList.remove('transition');
                            childB.classList.remove('transition');

                            // clear the transfrom from style
                            childB.removeAttribute('style');
                            childA.removeAttribute('style');
                        }, 300);
                    }
                    swapDone = true;
                    });
*/


export default coronaInstance;

console.log(`Created CoronaCases instance √`); 
