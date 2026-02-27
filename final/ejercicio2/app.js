// app.js — ejercicio 2: app del clima
// api: openweathermap.org/data/2.5/weather
// técnica: fetch + async/await + try/catch

const apiKey    = '2c81fd19b10b427dbccef1634b448d1d';
const apiURL    = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

const cityInput  = document.getElementById('cityInput');
const searchBtn  = document.getElementById('searchBtn');
const errorMsg   = document.getElementById('errorMsg');
const errorText  = document.getElementById('errorText');
const weatherBox = document.getElementById('weatherBox');
const cityChips  = document.querySelectorAll('.cityChip');

const weatherIcons = {
  Clear: 'images-clima/images/clear.png',
  Clouds: 'images-clima/images/clouds.png',
  Rain: 'images-clima/images/rain.png',
  Drizzle: 'images-clima/images/drizzle.png',
  Snow: 'images-clima/images/snow.png',
  Mist: 'images-clima/images/mist.png',
};

const checkWeather = async (city) => {
  try {
    const res  = await fetch(apiURL(city));
    if (!res.ok) throw new Error('ciudad no encontrada');
    const data = await res.json();
    updateUI(data);
  } catch (err) {
    weatherBox.style.display = 'none';
    errorText.textContent    = err.message;
    errorMsg.style.display   = 'block';
  }
};

const updateUI = (data) => {
  document.getElementById('temp').innerHTML    = `${Math.round(data.main.temp)}&deg;C`;
  document.getElementById('cityName').textContent = data.name;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('wind').textContent     = `${Math.round(data.wind.speed * 3.6)} km/h`;
  document.getElementById('weatherIcon').src      = weatherIcons[data.weather[0].main] || 'images-clima/images/rain.png';

  errorMsg.style.display   = 'none';
  weatherBox.style.display = 'block';
};

searchBtn.addEventListener('click', () => checkWeather(cityInput.value.trim()));
cityInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkWeather(cityInput.value.trim()); });
cityChips.forEach(c => c.addEventListener('click', () => {
  cityInput.value = c.dataset.city;
  checkWeather(c.dataset.city);
}));
