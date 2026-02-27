const pokeInput   = document.getElementById('pokeInput');
const searchBtn   = document.getElementById('searchBtn');
const verTodosBtn = document.getElementById('ver-todos');
const listaPokemon = document.getElementById('listaPokemon');
const singleResult = document.getElementById('singleResult');
const emptyState  = document.getElementById('emptyState');
const loaderWrap  = document.getElementById('loaderWrap');
const errorMsg    = document.getElementById('errorMsg');
const botonestipo = document.querySelectorAll('.btn-header[data-tipo]');

let cache = []; 

const fmtId   = (id)  => `#${String(id).padStart(3, '0')}`;
const statNames = { hp:'hp', attack:'ataque', defense:'defensa', 'special-attack':'sp. atk', 'special-defense':'sp. def', speed:'velocidad' };
const typeColors = {
  fire:'#c0392b', water:'#1a6fa8', grass:'#27714a', electric:'#9a7d0a',
  psychic:'#8e3066', ice:'#1a7a8a', dragon:'#4a2aaa', dark:'#2c3e50',
  normal:'#5a5a5a', fighting:'#a93226', poison:'#6c2a85', ground:'#7b5e3a',
  flying:'#2e6da4', bug:'#4a6b1a', rock:'#6e5042', ghost:'#3d4b8a',
  steel:'#3a5060', fairy:'#8a2a55',
};


const mostrarSolo = (el) => {
  [emptyState, loaderWrap, errorMsg, singleResult, listaPokemon].forEach(e => e.style.display = 'none');
  el.style.display = '';
};

const mostrarError = (msg) => {
  mostrarSolo(errorMsg);
  errorMsg.textContent = `❌ ${msg}`;
};

const fetchPoke = async (query) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query.toLowerCase().trim())}`);
  if (res.status === 404) throw new Error(`"${query}" no encontrado. prueba con otro nombre o número.`);
  if (!res.ok) throw new Error(`error al consultar la api: ${res.status}`);
  return res.json();
};

const renderDetalle = (p) => {
  const tipoMain = p.types[0]?.type.name || 'normal';
  const color    = typeColors[tipoMain] || '#333';

  document.getElementById('pokeHeader').style.setProperty('--headerColor', color);
  document.getElementById('pokeNum').textContent  = fmtId(p.id);
  document.getElementById('pokeName').textContent = p.name;
  document.getElementById('pokeImg').src = p.sprites.other['official-artwork']?.front_default || p.sprites.front_default || '';
  document.getElementById('pokeImg').alt = p.name;
  document.getElementById('pokeTipos').innerHTML  = p.types.map(t => `<span class="tipo ${t.type.name}">${t.type.name}</span>`).join('');
  document.getElementById('pokeAltura').textContent    = `${(p.height / 10).toFixed(1)} m`;
  document.getElementById('pokePeso').textContent      = `${(p.weight / 10).toFixed(1)} kg`;
  document.getElementById('pokeXp').textContent        = p.base_experience ?? '—';
  document.getElementById('pokeAbilCount').textContent = p.abilities.length;

  // estadísticas 
  const statsEl = document.getElementById('pokeStats');
  statsEl.innerHTML = '';
  p.stats.forEach(s => {
    const pct = Math.min(100, Math.round(s.base_stat / 255 * 100));
    const row = document.createElement('div');
    row.className = 'stat-row';
    row.innerHTML = `
      <span class="stat-name">${statNames[s.stat.name] || s.stat.name}</span>
      <span class="stat-val">${s.base_stat}</span>
      <div class="stat-bar-bg"><div class="stat-bar" style="width:0%;background:${color}"></div></div>
    `;
    statsEl.appendChild(row);
    setTimeout(() => row.querySelector('.stat-bar').style.width = `${pct}%`, 80);
  });

  // habilidades
  document.getElementById('pokeAbilities').innerHTML = p.abilities.map(a =>
    `<span class="ability-tag${a.is_hidden ? ' hidden' : ''}">${a.ability.name}${a.is_hidden ? ' ⭐' : ''}</span>`
  ).join('');

  // movimientos 10 seg 
  document.getElementById('pokeMoves').innerHTML = p.moves.slice(0, 10).map(m =>
    `<span class="move-tag">${m.move.name}</span>`
  ).join('');

  mostrarSolo(singleResult);
};

// busca individualmente
const buscar = async () => {
  const q = pokeInput.value.trim();
  if (!q) return;

  // si ya está en cache, renderizar directo
  const cached = cache.find(p => p.name === q.toLowerCase() || String(p.id) === q);
  if (cached) { renderDetalle(cached); return; }

  mostrarSolo(loaderWrap);
  loaderWrap.querySelector('span').textContent = `buscando ${q}...`;
  try {
    const data = await fetchPoke(q);
    renderDetalle(data);
  } catch (err) {
    mostrarError(err.message);
  }
};

const cargarTodos = async () => {
  if (cache.length === 151) {
    renderGrilla(cache);
    return;
  }
  mostrarSolo(loaderWrap);
  loaderWrap.querySelector('span').textContent = 'cargando pokédex completa...';
  try {
    cache = await Promise.all(
      Array.from({ length: 151 }, (_, i) =>
        fetch(`https://pokeapi.co/api/v2/pokemon/${i + 1}`).then(r => r.json())
      )
    );
    renderGrilla(cache);
  } catch (err) {
    mostrarError('no se pudo cargar la pokédex.');
  }
};

// render 
const renderGrilla = (lista) => {
  listaPokemon.innerHTML = '';
  lista.forEach(p => {
    const tipos = p.types.map(t => `<p class="${t.type.name} tipo">${t.type.name}</p>`).join('');
    const div   = document.createElement('div');
    div.className = 'pokemon';
    div.innerHTML = `
      <p class="pokemon-id-back">${fmtId(p.id)}</p>
      <div class="pokemon-imagen"><img src="${p.sprites.other['official-artwork'].front_default}" alt="${p.name}"/></div>
      <div class="pokemon-info">
        <div class="nombre-contenedor">
          <p class="pokemon-id">${fmtId(p.id)}</p>
          <h2 class="pokemon-nombre">${p.name}</h2>
        </div>
        <div class="pokemon-tipos">${tipos}</div>
        <div class="pokemon-stats">
          <p class="stat">${p.height / 10}m</p>
          <p class="stat">${p.weight / 10}kg</p>
        </div>
      </div>
    `;
    // muestra detales al hacer click
    div.addEventListener('click', () => { renderDetalle(p); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    listaPokemon.appendChild(div);
  });
  mostrarSolo(listaPokemon);
};

const filtrarTipo = async (tipo) => {
  if (cache.length < 151) await cargarTodos();
  const filtrados = cache.filter(p => p.types.some(t => t.type.name === tipo));
  renderGrilla(filtrados);
};

// eventos de buscar, cargar todos y filtro por tipo
searchBtn.addEventListener('click', buscar);
pokeInput.addEventListener('keydown', e => { if (e.key === 'Enter') buscar(); });
verTodosBtn.addEventListener('click', cargarTodos);
botonestipo.forEach(btn => btn.addEventListener('click', () => filtrarTipo(btn.dataset.tipo)));
