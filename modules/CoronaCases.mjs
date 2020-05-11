const CASES_BY_COUNTRY_URL = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php';
const X_RAPIDAPI_HOST = "coronavirus-monitor.p.rapidapi.com";
const X_RAPIDAPI_KEY = "bceb3c6713msh7b978618cfc7a1fp146facjsn41317387a72a";
const FLAGTABLE_CSS_ID = 'flagTable';
const NUM_OF_COUNTRIES_TO_DISPLAY = 20;

var CoronaCases = (function() {

    // private variablsed used by scope
    let privateProps = new WeakMap(); 
    let createCoronaUIFunc = Symbol('createCoronaUI func');
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

            let imgFlag = (flagName='China') => {
                let flagSize = privateProps.get(this).flagSize
                let imgEle = document.createElement('img');
                imgEle.setAttribute('height',flagSize);
                imgEle.setAttribute('width', flagSize);
                imgEle.setAttribute('src', getCountrySVGIconURL(flagName));
                return imgEle;
            }

            
            this[animateCoronaUIFunc] = (prevData, animateDone) => {
                console.log('prevData', prevData);
                console.log('this.data', this.data);
                let BORDER_SPACING = 2;
                let counter = 0;
                let rows = document.querySelectorAll('#flagTable tr');

                for (let i = 0; i < NUM_OF_COUNTRIES_TO_DISPLAY; i++) {
                    //let i = 16;
                    let countryName = prevData[i].country_name;
                    console.log('before countryName', countryName);
                    if (countryName == 'S. Korea') {
                        countryName = 'south korea';
                    }
                   
                    countryName = countryName.replace(/\s+/g, '-');
                    console.log('after countryName', countryName);

                    let indexOfCur = -1;
                    this.data.map( function(currentValue, index) {
                        let currentValueCountr = currentValue.country_name;
                        currentValueCountr = currentValueCountr.replace(/\s+/g, '-');
                        if (currentValueCountr == countryName) {
                            indexOfCur = index;
                        }
                    });

                    let countryToMove = document.querySelector('#' + countryName);
                    if (!countryToMove) {
                        console.log('Uh oh problem with ' + countryName);
                    }

                    let boundRect = countryToMove.getBoundingClientRect();
                    let heightOfRow = boundRect.height + BORDER_SPACING;
                    countryToMove.classList.add('transition');

                    let indexOfPrev = i;
                    let indexesToMove = indexOfPrev - indexOfCur;

                    console.log(`indexOfPrev ${indexOfPrev}, indexOfCur ${indexOfCur}, indexesToMove ${indexesToMove}`);
                    const countryMovePath = { x: 0, y: heightOfRow * -indexesToMove}; 

                    console.log('countryMovePath', countryMovePath);
                    countryToMove.style.transform = `translate(${countryMovePath.x}px, ${countryMovePath.y}px)`;

                    setTimeout(() => {
                        console.log('counter', counter);
                        // we need to do the actual movement of the two li. 
                        // if this is not put here, all we see is animation of b going up and a doing down.
                        // then, it will flash back to a on top, and b on bottom.
                        // By doing this, we finish the animation with the correct placements of these two li.
                        //document.querySelector('#flagTable').insertBefore(countryToMove, countryPivot);

                        // clear the usage of using CSS 'transform ease-in 0.3s' for the animation
                        countryToMove.classList.remove('transition');
                        countryToMove.removeAttribute('style');

                        let newData = this.data[i];
                        let cells = rows[i+1].getElementsByTagName('td');
                        let deaths = newData.deaths;
                        let cases = newData.cases;
                        let intDeaths = parseFloat(deaths.replace(/,/g, ''));
                        let intCases = parseFloat(cases.replace(/,/g, ''));
                        let deathPercentage = (intDeaths / intCases) * 100;

                        var imgData = document.createElement('td');
                        var aFlag = imgFlag(newData.country_name);
                        imgData.appendChild(aFlag);

                        cells[0].innerHTML = imgData.innerHTML;
                        cells[1].textContent = newData.country_name;
                        cells[2].textContent = newData.cases;
                        cells[3].textContent = newData.deaths;
                        cells[4].textContent = deathPercentage.toFixed(2) + ' %';

                        counter = counter + 1;
                        if (counter >= NUM_OF_COUNTRIES_TO_DISPLAY) {
                            console.log('ANIMATE TABLE done!!!!!!');
                            animateDone();
                        }
                    }, 1000);
                } // loop
                console.log('end of function!');
            }


            this[createCoronaUIFunc] = callback => {
                if (!!this.table) {  // previous table exists, let's clear out its data
                    this.table.innerHTML = '';       
                } else { // previous table does not exist, let's create one
                    this.table = document.createElement('table');
                    this.table.setAttribute('id', FLAGTABLE_CSS_ID);
                }
                //this.table.style.opacity = 0;
                this.table.style.opacity = 1.0;

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
                    
                    if (countryName == 'S. Korea') {
                        countryName = 'south korea';
                    }
                    countryName = countryName.replace(/\s+/g, '-');
                    

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
                callback();
            }

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
        updateData = (byDeaths=false, cbFinish) => {     
            
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
                if (byDeaths) {
                    this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'deaths'));
                } else {
                    this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'cases'));
                }

                if (prevData) {
                    this[animateCoronaUIFunc](prevData, () => {
    
                    });
                } else {
                    // change this name to createCoronaUI
                    this[createCoronaUIFunc](cbFinish);
                }
                

            }).catch(err => { console.log(err);});
           
        } // updateData          
    } // class
    return CoronaCases;
})();
    
var coronaInstance = new CoronaCases(CASES_BY_COUNTRY_URL, X_RAPIDAPI_HOST, X_RAPIDAPI_KEY);
coronaInstance.updateData(false, function() {
    styleTriggerBtn();
    //animateItemToItem('USA', 'Spain');
}); 


// create handlers for clicking on btns:
// 1) deaths
// 2) cases

function deaths() {
    console.log('clicked deaths button')
    coronaInstance.updateData(true, function() {
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
    coronaInstance.updateData(false, function() {
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
