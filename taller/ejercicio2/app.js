// ============================================================
// app.js — Ejercicio 2: App del Clima
// API: https://api.openweathermap.org/data/2.5/weather
// Técnica: fetch + async/await + promesas + try/catch
// IMPORTANTE: No hay búsqueda automática al cargar la página.
//             El clima se consulta SOLO cuando el usuario busca.
// ============================================================

// === CONFIGURACIÓN ===
const apiKey  = '2c81fd19b10b427dbccef1634b448d1d';
const baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

// === ELEMENTOS DEL DOM ===
const cityInput    = document.getElementById('cityInput');
const searchBtn    = document.getElementById('searchBtn');
const searchBtnText = document.getElementById('searchBtnText');
const searchSpinner = document.getElementById('searchSpinner');
const errorBanner  = document.getElementById('errorBanner');
const errorText    = document.getElementById('errorText');
const weatherCard  = document.getElementById('weatherCard');
const emptyState   = document.getElementById('emptyState');

// Chips de ciudades rápidas
const cityChips = document.querySelectorAll('.cityChip');

// === MAPA DE CONDICIONES → EMOJIS ===
const weatherEmojis = {
  clear:        '☀️',
  clouds:       '☁️',
  rain:         '🌧️',
  drizzle:      '🌦️',
  thunderstorm: '⛈️',
  snow:         '❄️',
  mist:         '🌫️',
  fog:          '🌫️',
  haze:         '🌫️',
  smoke:        '🌫️',
  dust:         '💨',
};

// === PETICIÓN A LA API con fetch + async/await ===
const fetchClima = async (ciudad) => {
  // Construimos la URL con el nombre de ciudad y parámetros:
  // units=metric → temperatura en °C
  // lang=es      → descripción en español
  const url = `${baseUrl}?q=${encodeURIComponent(ciudad)}&appid=${apiKey}&units=metric&lang=es`;

  // fetch retorna una Promesa → await espera que se resuelva
  const respuesta = await fetch(url);

  // Manejo de errores HTTP específicos
  if (respuesta.status === 401) {
    throw new Error('API Key inválida o sin activar. Verifica tu clave.');
  }
  if (respuesta.status === 404) {
    throw new Error(`Ciudad "${ciudad}" no encontrada. Verifica el nombre e intenta de nuevo.`);
  }
  if (!respuesta.ok) {
    throw new Error(`Error del servidor: ${respuesta.status}`);
  }

  // .json() también retorna una Promesa → await la resuelve
  const datos = await respuesta.json();
  return datos;
};

// === RENDERIZAR TARJETA DE CLIMA ===
const renderClima = (datos) => {
  const condicion = datos.weather[0].main.toLowerCase();
  const emoji     = weatherEmojis[condicion] || '🌡️';

  document.getElementById('cityName').textContent    = datos.name;
  document.getElementById('countryInfo').textContent = `${datos.sys.country} · ${datos.weather[0].main}`;
  document.getElementById('weatherDesc').textContent = datos.weather[0].description;
  document.getElementById('weatherEmoji').textContent = emoji;
  document.getElementById('temperature').textContent = `${Math.round(datos.main.temp)}°C`;
  document.getElementById('feelsLike').textContent   = `${Math.round(datos.main.feels_like)}°C`;
  document.getElementById('humidity').textContent    = `${datos.main.humidity}%`;
  document.getElementById('wind').textContent        = `${Math.round(datos.wind.speed * 3.6)} km/h`;
  document.getElementById('visibility').textContent  = datos.visibility
    ? `${(datos.visibility / 1000).toFixed(1)} km`
    : 'N/D';
  document.getElementById('minMax').textContent =
    `${Math.round(datos.main.temp_min)}° / ${Math.round(datos.main.temp_max)}°`;
  document.getElementById('pressure').textContent = `${datos.main.pressure} hPa`;
};

// === CONTROLAR ESTADO DE CARGA ===
const setLoading = (cargando) => {
  searchBtn.disabled     = cargando;
  searchBtnText.style.display  = cargando ? 'none'  : 'inline';
  searchSpinner.style.display  = cargando ? 'block' : 'none';
};

// === MOSTRAR / OCULTAR ERROR ===
const mostrarError = (mensaje) => {
  errorText.textContent     = mensaje;
  errorBanner.style.display = 'flex';
};

const ocultarError = () => {
  errorBanner.style.display = 'none';
};

// === FUNCIÓN PRINCIPAL con async/await ===
const buscarClima = async () => {
  const ciudad = cityInput.value.trim();

  if (!ciudad) {
    mostrarError('Escribe el nombre de una ciudad antes de buscar.');
    return;
  }

  ocultarError();
  setLoading(true);

  // Ocultamos la tarjeta anterior mientras carga
  weatherCard.style.display = 'none';

  try {
    // Esperamos la promesa que retorna fetchClima
    const datos = await fetchClima(ciudad);

    // Llenamos la tarjeta con los datos
    renderClima(datos);

    // ✅ Ocultamos el estado vacío y mostramos la tarjeta
    emptyState.style.display  = 'none';
    weatherCard.style.display = 'block';

  } catch (error) {
    mostrarError(error.message);
    // Si hay error, volvemos a mostrar el estado vacío
    emptyState.style.display  = 'flex';
    weatherCard.style.display = 'none';
  } finally {
    // finally siempre se ejecuta, haya error o no
    setLoading(false);
  }
};

// === EVENTOS ===
searchBtn.addEventListener('click', buscarClima);

// Buscar al presionar Enter
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarClima();
});

// Chips de ciudades rápidas
cityChips.forEach(chip => {
  chip.addEventListener('click', () => {
    cityInput.value = chip.dataset.city;
    buscarClima();
  });
});

// ❌ NO hay llamada automática al cargar la página.
//    La página inicia con el emptyState visible y espera la acción del usuario.
