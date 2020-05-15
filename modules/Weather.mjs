const WEATHER_LOCATION_STRING = 'Shenzhen,China';
const WEATHER_API =  'https://api.openweathermap.org/data/2.5/weather?q=';
const OPEN_WEATHER_MAP_KEY = '8fa0a05a6027cc756610f184b1677e8a';
 
let _privateProps = new WeakMap(); 

class Weather {
    constructor(weatherURL, place='Shenzhen,China', apiKey) {   

        _privateProps.set(this, {
            key: apiKey,
            updateWeatherUI: data => {
                this.degreeInCelcius = Math.round(parseFloat(data.main.temp)-273.15);
                this.degreeInFahrenheit = Math.round(((parseFloat(data.main.temp)-273.15)*1.8)+32); 
                this.weatherDescription = data.weather[0].description;
                this.iconURL = 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png';
                this.cityName = data.name;
                var img = document.createElement('img'); 
                img.src =  this.iconURL;
                img.style = 'vertical-align: middle';
                document.getElementById('weather').appendChild(img); 
                document.getElementById('description').innerHTML = this.weatherDescription;
                document.getElementById('temp').innerHTML = this.degreeInCelcius + '&deg;';
                document.getElementById('location').innerHTML = this.cityName;
            }
        });

        // public properties
        this.url = weatherURL; 
        this.place = place;
        this.fetchURL = this.url + this.place + '&appid=' + _privateProps.get(this).key;
        this.iconURL='';
        this.weatherDescription='';
        this.degreeInCelcius = '';
        this.degreeInFahrenheit = '';
        this.cityName = '';
    } // constructor

    // prototype functions
    fetchWeatherData = () => {
      fetch(this.fetchURL)  
      .then(resp => resp.json())
      .then(data => _privateProps.get(this).updateWeatherUI(data))
      .catch(function() {}); 
    }
}  
          
let w = new Weather(WEATHER_API, WEATHER_LOCATION_STRING, OPEN_WEATHER_MAP_KEY);
w.fetchWeatherData();
console.log(`Created Weather instance √`);
export default w;