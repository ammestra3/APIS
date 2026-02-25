// ============================================================
// app.js — Ejercicio 3: Pokédex
// API: https://pokeapi.co/api/v2/pokemon/{nombre_o_id}
// Técnica: fetch + async/await + try/catch
// No requiere API Key
// ============================================================

// === ELEMENTOS DEL DOM ===
const pokeInput    = document.getElementById('pokeInput');
const searchBtn    = document.getElementById('searchBtn');
const searchBtnText = document.getElementById('searchBtnText');
const searchSpinner = document.getElementById('searchSpinner');
const statusMsg    = document.getElementById('statusMsg');
const pokeCard     = document.getElementById('pokeCard');
const quickBtns    = document.querySelectorAll('.quickBtn');

// === NOMBRES LEGIBLES PARA LAS ESTADÍSTICAS ===
const statLabels = {
  'hp':              'HP',
  'attack':          'Ataque',
  'defense':         'Defensa',
  'special-attack':  'Sp. Ataque',
  'special-defense': 'Sp. Defensa',
  'speed':           'Velocidad',
};

// === COLORES DE FONDO POR TIPO ===
const typeColors = {
  fire:      '#c0392b',
  water:     '#1a6fa8',
  grass:     '#27714a',
  electric:  '#9a7d0a',
  psychic:   '#8e3066',
  ice:       '#1a7a8a',
  dragon:    '#4a2aaa',
  dark:      '#2c3e50',
  normal:    '#5a5a5a',
  fighting:  '#a93226',
  poison:    '#6c2a85',
  ground:    '#7b5e3a',
  flying:    '#2e6da4',
  bug:       '#4a6b1a',
  rock:      '#6e5042',
  ghost:     '#3d4b8a',
  steel:     '#3a5060',
  fairy:     '#8a2a55',
};

// === MOSTRAR MENSAJE DE ESTADO ===
const mostrarMensaje = (texto, tipo = 'loading') => {
  pokeCard.style.display  = 'none';
  statusMsg.style.display = tipo === 'loading' ? 'flex' : 'block';
  statusMsg.className     = `statusMsg ${tipo}`;

  statusMsg.innerHTML = tipo === 'loading'
    ? `<div class="spinner"></div> ${texto}`
    : texto;
};

const ocultarMensaje = () => {
  statusMsg.style.display = 'none';
  statusMsg.className     = 'statusMsg';  // elimina la clase 'loading' que fuerza display:flex
};

// === PETICIÓN A POKÉAPI con fetch + async/await ===
const fetchPokemon = async (nameOrId) => {
  // PokéAPI acepta nombre en minúscula o número de pokédex
  const query = nameOrId.toLowerCase().trim();
  const url   = `https://pokeapi.co/api/v2/pokemon/${query}`;

  // fetch retorna una Promesa → await espera que se resuelva
  const respuesta = await fetch(url);

  if (respuesta.status === 404) {
    throw new Error(`Pokémon "${nameOrId}" no encontrado. Prueba con otro nombre o número.`);
  }
  if (!respuesta.ok) {
    throw new Error(`Error al consultar la API: ${respuesta.status}`);
  }

  // .json() también retorna una Promesa → await la resuelve
  const datos = await respuesta.json();
  return datos;
};

// === CREAR FILA DE ESTADÍSTICA CON BARRA ANIMADA ===
const crearStatRow = (statName, baseValue, typeColor) => {
  const label      = statLabels[statName] || statName;
  const porcentaje = Math.min(100, Math.round((baseValue / 255) * 100));

  const row = document.createElement('div');
  row.className = 'statRow';
  row.innerHTML = `
    <div class="statName">${label}</div>
    <div class="statVal">${baseValue}</div>
    <div class="statBarBg">
      <div class="statBar" style="width:0%; background:${typeColor}"></div>
    </div>
  `;

  // Animamos la barra DESPUÉS de insertar en el DOM (requiere un tick)
  setTimeout(() => {
    const bar = row.querySelector('.statBar');
    bar.style.width = `${porcentaje}%`;
  }, 80);

  return row;
};

// === RENDERIZAR TARJETA DEL POKÉMON ===
const renderPokemon = (datos) => {
  const primerTipo  = datos.types[0]?.type.name || 'normal';
  const colorFondo  = typeColors[primerTipo] || '#333';

  // Header con color dinámico según tipo
  const cardHeader = document.getElementById('pokeCardHeader');
  cardHeader.style.setProperty('--headerColor', colorFondo);

  // Número, nombre
  document.getElementById('pokeNum').textContent  = `#${String(datos.id).padStart(3, '0')}`;
  document.getElementById('pokeName').textContent = datos.name;

  // Imagen oficial (mayor calidad) o sprite como fallback
  const imgUrl = datos.sprites.other['official-artwork']?.front_default
               || datos.sprites.front_default;
  const imgEl  = document.getElementById('pokeImg');
  imgEl.src    = imgUrl || '';
  imgEl.alt    = datos.name;

  // Tipos como badges
  document.getElementById('pokeTypes').innerHTML = datos.types.map(t =>
    `<span class="typeBadge type-${t.type.name}">${t.type.name}</span>`
  ).join('');

  // Info básica
  document.getElementById('pokeHeight').textContent    = `${(datos.height / 10).toFixed(1)} m`;
  document.getElementById('pokeWeight').textContent    = `${(datos.weight / 10).toFixed(1)} kg`;
  document.getElementById('pokeXp').textContent        = datos.base_experience ?? '—';
  document.getElementById('pokeAbilCount').textContent = datos.abilities.length;

  // Estadísticas con barras animadas
  const statsEl = document.getElementById('pokeStats');
  statsEl.innerHTML = '';
  datos.stats.forEach(s => {
    statsEl.appendChild(crearStatRow(s.stat.name, s.base_stat, colorFondo));
  });

  // Habilidades
  document.getElementById('pokeAbilities').innerHTML = datos.abilities.map(a => {
    const esOculta = a.is_hidden;
    const etiqueta = esOculta ? `${a.ability.name} ⭐ (oculta)` : a.ability.name;
    return `<span class="abilityTag${esOculta ? ' hidden' : ''}">${etiqueta}</span>`;
  }).join('');

  // Movimientos (primeros 8)
  document.getElementById('pokeMoves').innerHTML = datos.moves.slice(0, 8).map(m =>
    `<span class="moveTag">${m.move.name}</span>`
  ).join('');

  // Mostramos la tarjeta
  ocultarMensaje();
  pokeCard.style.display = 'block';
};

// === CONTROLAR ESTADO DE CARGA ===
const setLoading = (cargando) => {
  searchBtn.disabled         = cargando;
  searchBtnText.style.display = cargando ? 'none'  : 'inline';
  searchSpinner.style.display = cargando ? 'block' : 'none';
};

// === FUNCIÓN PRINCIPAL con async/await ===
const buscarPokemon = async () => {
  const query = pokeInput.value.trim();

  if (!query) {
    mostrarMensaje('⚠️ Escribe el nombre o número de un pokémon.', 'error');
    return;
  }

  mostrarMensaje('Buscando pokémon...');
  setLoading(true);

  try {
    // Esperamos la promesa que retorna fetchPokemon
    const datos = await fetchPokemon(query);
    renderPokemon(datos);
  } catch (error) {
    mostrarMensaje(`❌ ${error.message}`, 'error');
  } finally {
    // finally siempre se ejecuta, haya error o no
    setLoading(false);
  }
};

// === EVENTOS ===
searchBtn.addEventListener('click', buscarPokemon);

pokeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarPokemon();
});

// Botones rápidos de ejemplo
quickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pokeInput.value = btn.dataset.pokemon;
    buscarPokemon();
  });
});
