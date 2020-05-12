const CASES_BY_COUNTRY_URL = 'https://coronavirus-monitor.p.rapidapi.com/coronavirus/cases_by_country.php';
const X_RAPIDAPI_HOST = "coronavirus-monitor.p.rapidapi.com";
const X_RAPIDAPI_KEY = "bceb3c6713msh7b978618cfc7a1fp146facjsn41317387a72a";
const FLAGTABLE_CSS_ID = 'flagTable';
const NUM_OF_COUNTRIES_TO_DISPLAY = 45;

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
                    let prevCountryName = prevData[i].country_name;

                    let indexOfCur = -1;
                    this.data.map( function(currentCountry, index) {
                        //console.log('currentCountry.country_name', currentCountry.country_name)
                        //console.log('prevCountryName', prevCountryName);
                        if (currentCountry.country_name == prevCountryName) { indexOfCur = index; }
                    });

                    let hypened = prevCountryName.replace(/\s+/g, '-');

                    let countryToMove = document.querySelector('#' + hypened);
                    if (!countryToMove) { console.log('Uh oh problem with ' + hypened); }
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
                        // clear the usage of using CSS 'transform ease-in 0.3s' for the animation
                        countryToMove.classList.remove('transition');
                        countryToMove.removeAttribute('style');

                        let newData = this.data[i];
                        let hypened = newData.country_name.replace(/\s+/g, '-');
                        rows[i+1].id = hypened;
                        let cells = rows[i+1].getElementsByTagName('td');
                        let deaths = newData.deaths;
                        let cases = newData.cases;
                        let intDeaths = parseFloat(deaths.replace(/,/g, ''));
                        let intCases = parseFloat(cases.replace(/,/g, ''));
                        let deathPercentage = (intDeaths / intCases) * 100;

                        var imgData = document.createElement('td');
                        var aFlag = imgFlag(hypened);
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
                    }, 860);
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
                    let hypened = countryName.replace(/\s+/g, '-');
                    
                    let deaths = this.data[i].deaths;
                    let cases = this.data[i].cases;

                    let intDeaths = parseFloat(deaths.replace(/,/g, ''));
                    let intCases = parseFloat(cases.replace(/,/g, ''));
                    let deathPercentage = (intDeaths / intCases) * 100;

                    var tableRow = document.createElement('tr');
                    tableRow.setAttribute('id', hypened);

                    var imgData = document.createElement('td');
                    var aFlag = imgFlag(hypened);
                    imgData.appendChild(aFlag);
                    tableRow.appendChild(imgData); // row add data

                    var countryData = document.createElement("td"); 
                    countryData.setAttribute('class', 'country-name' );
                    var countrySpanContents = document.createTextNode(hypened);
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
}); 

function deaths() {
    console.log('clicked deaths button')
    coronaInstance.updateData(true, function() {}); 
}

function cases() {
    coronaInstance.updateData(false, function() {}); 
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
    coronaBtn.style.backgroundImage = `url('http://127.0.0.1:5500/images/virus.png')`;
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

export default coronaInstance;
console.log(`Created CoronaCases instance √`); 
