const inputBox = document.querySelector(`.search-bar input`);
const searchBtn = document.querySelector(`.search-bar button`);
const weatherIcon = document.querySelector(`.weather-icon `);
const weather = document.querySelector(`.weather`);
const errorMessage = document.querySelector(`.error`);

async function checkWeather (city){

    try {

    const apiKey = `1874179cd6051d1e6c8fb92bf7cfe4c7`;
    const apiURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiURL);

    if (!response.ok){
        throw new Error(`Ciudad no encontrada`);

    }

    const data = await response.json();
    console.log(data);
    updateWeatherUI(data);
    
    } catch (error) {
        console.error(error.message);
        weather.computedStyleMap.display = `none`;
        errorMessage.style.display= `block`
        
    }
}

function updateWeatherUI(data){
    document.querySelector(`.temp`).innerHTML = `${Math.round(data.main.temp)}&deg;C`;
    document.querySelector(`.city`).innerHTML = data.name;
    document.querySelector(`.humidity`).innerHTML = `${data.main.humidity}%`;
    document.querySelector(`.wind`).innerHTML = `${data.wind.speed}km/h`;

    const weatherIcons = {
        Clear: `images/clear.png`,
        Snow: `images/snow.png`,
        Rain: `images/rain.png`,
        Clouds: `images/clouds.png`
    }

    weather.src = weatherIcons[data.weather[0].main] || `images/rain.png`;

    weather.style.display = `block`;
    errorMessage.style.display = `none`
}

searchBtn.addEventListener(`click`, () =>{
    checkWeather(inputBox.value);
})