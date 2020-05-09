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
    let decreasingFunc = Symbol('decreasing func');
    let updateCoronaUIFunc = Symbol('updateCoronaUI func');

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
                let slowDown = 0;

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

            this[updateCoronaUIFunc] = callback => {
                if (!!this.table) { 
                    this.table.innerHTML = '';       
                } else {
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
                    var imgData = document.createElement('td');
                    var aFlag = imgFlag(countryName);
                    imgData.appendChild(aFlag);
                    tableRow.appendChild(imgData); // row add data

                    var countryData = document.createElement("td"); 
                    countryData.setAttribute('class', countryName );
                    var countrySpanContents = document.createTextNode(countryName);
                    countryData.appendChild(countrySpanContents);  // row add data
                    tableRow.appendChild(countryData);


                    var casesData = document.createElement("td"); 
                    var casesSpanContents = document.createTextNode(cases);
                    casesData.appendChild(casesSpanContents); 
                    tableRow.appendChild(casesData);

                    var deathData = document.createElement("td"); 
                    var deathSpanContents = document.createTextNode(deaths);
                    deathData.appendChild(deathSpanContents); 
                    tableRow.appendChild(deathData);


                    var percentageData = document.createElement("td"); 
                    var percentageSpanContents = document.createTextNode(deathPercentage.toFixed(2) + ' %');
                    percentageData.appendChild(percentageSpanContents); 
                    tableRow.appendChild(percentageData);
                    this.table.appendChild(tableRow); // finally we add the row full of data

                }
                document.getElementById('CoronaVirusStats').appendChild(this.table);
                this[coronaStatsAppearFunc](callback); 
            }
            

            this[coronaStatsDisappearFunc] = done => {
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
        updateData = (byDeaths=false, cbFinish) => {     
            this[coronaStatsDisappearFunc](() => {  
                let loader = document.getElementById('CoronaLoader');
                loader.style.display = 'block';
                loader.style.position = 'relative';
                loader.style.right = '-360px';
                loader.style.top = '60px';

                if (this.table) this.table.innerHTML = loader;

                this.fetchData()
                .then(response => response.json())
                .then(data => {
                    console.log('data', data);
                    loader.style.display = 'none';
                    if (this.table) this.table.innerHTML = '';
                    this.data = data.countries_stat;
                    if (byDeaths) {
                        this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'deaths'));
                    } else {
                        this.data.sort((a,b) => privateProps.get(this).decreasing(a, b, 'cases'));
                    }

                    this[updateCoronaUIFunc](cbFinish);
                }).catch(err => { console.log(err);});
            });
        } // updateData          
    } // class
    return CoronaCases;
})();
    
var coronaInstance = new CoronaCases(CASES_BY_COUNTRY_URL, X_RAPIDAPI_HOST, X_RAPIDAPI_KEY);
coronaInstance.updateData(false); 

function deaths() {
    console.log('hahahah');
    coronaInstance.updateData(true, function() {
        var rows = document.getElementById(FLAGTABLE_CSS_ID).getElementsByTagName('tr');
        for (let i = 1; i <= NUM_OF_COUNTRIES_TO_DISPLAY; i++) {
          var tds = rows[i].getElementsByTagName('td');
          tds[3].style.color = 'red';
        }
    }); 
}

function cases() {
    coronaInstance.updateData(false, function() {
        var rows = document.getElementById(FLAGTABLE_CSS_ID).getElementsByTagName('tr');
        for (let i = 1; i <= NUM_OF_COUNTRIES_TO_DISPLAY; i++) {
          var tds = rows[i].getElementsByTagName('td');
          tds[2].style.color = 'orange';
        }
    }); 
}

// click handlers
document.querySelector('#deaths').addEventListener("click", deaths);
document.querySelector('#cases').addEventListener("click", cases);


function styleTriggerBtn() {
    let coronaBtn = document.querySelector('#coronaBtn');
    coronaBtn.style.position ='absolute';
    coronaBtn.style.top ='50%';

    let coronaVirusStatBckgnd = document.querySelector('#CoronaVirusStats');
    console.log(coronaVirusStatBckgnd.offsetWidth);

    coronaBtn.style.left = coronaVirusStatBckgnd.offsetWidth + (coronaBtn.offsetWidth/3) + 'px';
    coronaBtn.style.backgroundImage = `url('http://127.0.0.1:5500/images/countryflags/virus.png')`;
}

let opened = true;

function createEventHandlerForTriggerBtn() {
    
    let coronaBtn = document.querySelector('#coronaBtn');
    let coronaVirusStatBckgnd = document.querySelector('#CoronaVirusStats');

    coronaBtn.addEventListener('click', function() {
        console.log('you clicked on the corona virus button');

        if (!opened) {
            for (let i = 0; i < 61; i++) {
                setTimeout( function() {
                    coronaBtn.style.transform = 'rotate( ' + i*3 + 'deg)';
                    coronaBtn.style.left = (i * 7) + 'px';
                    coronaVirusStatBckgnd.style.left =  (-422 + i * 7) + 'px';
                    if (i==60) {
                        coronaVirusStatBckgnd.style.left = '0px';
                        coronaBtn.style.left = '422px';
                    }
                }, 4 * i);
            }
            opened = true;
        } else {
            for (let i = 0; i < 61; i++) {
                setTimeout( function() {
                    coronaBtn.style.transform = 'rotate( ' + (180-i*3) + 'deg)';
                    coronaBtn.style.left = (422 - (i * 7)) + 'px';
                    coronaVirusStatBckgnd.style.left =  (i * -7) + 'px';
                    
                    if (i==60) {
                        coronaBtn.style.left = '10px';
                    }
                }, 4 * i);
            }
            opened = false;
        } 
    });
}


styleTriggerBtn();
createEventHandlerForTriggerBtn();


export default coronaInstance;

console.log(`Created CoronaCases instance √`); 
