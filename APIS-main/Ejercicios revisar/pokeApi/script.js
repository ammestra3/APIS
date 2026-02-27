// =============================================
// POKÉDEX - Consumo de PokeAPI
// Objetivo: Usar fetch + .then() (promesas) para
// obtener y mostrar los 151 pokémon originales
// También incluye buscador con async/await
// =============================================

// Seleccionamos los elementos del HTML
const listaPokemon = document.querySelector("#listaPokemon");
const botonesHeader = document.querySelectorAll(".btn-header");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");

// URL base de la PokeAPI
let URL = "https://pokeapi.co/api/v2/pokemon/";

// Ciclo que hace una petición por cada uno de los 151 pokémon originales
// Usamos .then() (promesas encadenadas) para manejar la respuesta
for (let i = 1; i <= 151; i++) {
    fetch(URL + i)
        .then((response) => response.json())  // convertimos la respuesta a JSON
        .then(data => mostrarPokemon(data))   // pasamos los datos a la función que crea la tarjeta
}

// Función que recibe los datos de un pokémon y crea su tarjeta en la lista general
function mostrarPokemon(poke) {

    // Mapeamos los tipos del pokémon a etiquetas HTML con su clase de color
    let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`);
    tipos = tipos.join('');

    // Formateamos el ID con ceros a la izquierda (ej: 1 → 001)
    let pokeId = poke.id.toString();
    if (pokeId.length === 1) pokeId = "00" + pokeId;
    else if (pokeId.length === 2) pokeId = "0" + pokeId;

    const div = document.createElement("div");
    div.classList.add("pokemon");
    div.innerHTML = `
        <p class="pokemon-id-back">#${pokeId}</p>
        <div class="pokemon-imagen">
            <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
        </div>
        <div class="pokemon-info">
            <div class="nombre-contenedor">
                <p class="pokemon-id">#${pokeId}</p>
                <h2 class="pokemon-nombre">${poke.name}</h2>
            </div>
            <div class="pokemon-tipos">
                ${tipos}
            </div>
            <div class="pokemon-stats">
                <p class="stat">${poke.height}m</p>
                <p class="stat">${poke.weight}kg</p>
            </div>
        </div>
    `;
    listaPokemon.append(div);
}

// =============================================
// FUNCIÓN DE BÚSQUEDA con async/await
// Busca un pokémon por nombre o número y
// muestra una tarjeta detallada con su info
// =============================================
async function buscarPokemon() {
    // Obtenemos el valor del input en minúsculas para que la API lo entienda
    const query = searchInput.value.trim().toLowerCase();

    // Si el campo está vacío, no hacemos nada
    if (!query) return;

    try {
        // fetch a la API con el nombre o número del pokémon buscado
        // await espera la respuesta antes de continuar
        const response = await fetch(URL + query);

        // Si la respuesta no es exitosa (pokémon no encontrado), lanzamos error
        if (!response.ok) throw new Error("Pokémon no encontrado");

        // Convertimos la respuesta a JSON con await
        const poke = await response.json();

        // Formateamos el ID
        let pokeId = poke.id.toString();
        if (pokeId.length === 1) pokeId = "00" + pokeId;
        else if (pokeId.length === 2) pokeId = "0" + pokeId;

        // Mapeamos los tipos
        let tipos = poke.types.map((type) => `<p class="${type.type.name} tipo">${type.type.name}</p>`).join('');

        // Mapeamos las habilidades del pokémon
        let habilidades = poke.abilities.map((a) => `<span class="habilidad">${a.ability.name}</span>`).join('');

        // Mapeamos las estadísticas base (HP, ataque, defensa, etc.)
        let stats = poke.stats.map((s) => `
            <div class="stat-bar">
                <span class="stat-name">${s.stat.name}</span>
                <div class="stat-track">
                    <div class="stat-fill" style="width: ${Math.min(s.base_stat, 100)}%"></div>
                </div>
                <span class="stat-val">${s.base_stat}</span>
            </div>
        `).join('');

        // Mostramos la tarjeta de resultado
        searchResult.style.display = "flex";
        searchResult.innerHTML = `
            <div class="result-card">
                <div class="result-left">
                    <p class="pokemon-id-back">#${pokeId}</p>
                    <img src="${poke.sprites.other["official-artwork"].front_default}" alt="${poke.name}">
                    <div class="nombre-contenedor">
                        <p class="pokemon-id">#${pokeId}</p>
                        <h2 class="pokemon-nombre">${poke.name}</h2>
                    </div>
                    <div class="pokemon-tipos">${tipos}</div>
                    <div class="pokemon-stats">
                        <p class="stat">${poke.height / 10}m</p>
                        <p class="stat">${poke.weight / 10}kg</p>
                    </div>
                </div>
                <div class="result-right">
                    <div class="result-section">
                        <h3 class="result-title">⚡ HABILIDADES</h3>
                        <div class="habilidades-list">${habilidades}</div>
                    </div>
                    <div class="result-section">
                        <h3 class="result-title">📊 ESTADÍSTICAS</h3>
                        <div class="stats-list">${stats}</div>
                    </div>
                </div>
                <button class="close-btn" id="closeResult">✕</button>
            </div>
        `;

        // Evento para cerrar la tarjeta de búsqueda
        document.getElementById("closeResult").addEventListener("click", () => {
            searchResult.style.display = "none";
            searchInput.value = "";
        });

    } catch (error) {
        // Si el pokémon no existe, mostramos un mensaje de error
        searchResult.style.display = "flex";
        searchResult.innerHTML = `
            <div class="result-card error-card">
                <p class="error-msg">❌ Pokémon no encontrado.<br>Intenta con otro nombre o número.</p>
                <button class="close-btn" id="closeResult">✕</button>
            </div>
        `;
        document.getElementById("closeResult").addEventListener("click", () => {
            searchResult.style.display = "none";
            searchInput.value = "";
        });
    }
}

// Evento del botón buscar
searchBtn.addEventListener("click", buscarPokemon);

// También busca al presionar Enter
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarPokemon();
});

// =============================================
// FILTROS POR TIPO
// =============================================
botonesHeader.forEach(boton => boton.addEventListener("click", (event) => {
    const botonId = event.currentTarget.id;

    // Ocultamos el resultado de búsqueda al cambiar de filtro
    searchResult.style.display = "none";
    listaPokemon.innerHTML = "";

    for (let i = 1; i <= 151; i++) {
        fetch(URL + i)
            .then((response) => response.json())
            .then(data => {
                if(botonId === "ver-todos") {
                    mostrarPokemon(data);
                } else {
                    const tipos = data.types.map(type => type.type.name);
                    if (tipos.some(tipo => tipo.includes(botonId))) {
                        mostrarPokemon(data);
                    }
                }
            })
    }
}));