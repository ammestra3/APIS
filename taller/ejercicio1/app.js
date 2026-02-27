// ============================================================
// app.js — Ejercicio 1: Galería de Imágenes
// API: https://jsonplaceholder.typicode.com/photos
// Técnica: fetch + async/await + manejo de errores con try/catch
// Nota: JSONPlaceholder provee los datos (id, título, albumId).
//       Las imágenes reales se cargan via picsum.photos usando el
//       id del foto como semilla para imágenes consistentes.
// ============================================================

// === ELEMENTOS DEL DOM ===
const gallery     = document.getElementById('gallery');
const loader      = document.getElementById('loader');
const errorMsg    = document.getElementById('errorMsg');
const loadBtn     = document.getElementById('loadBtn');
const limitSelect = document.getElementById('limitSelect');
const photoModal  = document.getElementById('photoModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose  = document.getElementById('modalClose');
const modalImg    = document.getElementById('modalImg');
const modalMeta   = document.getElementById('modalMeta');
const modalTitle  = document.getElementById('modalTitle');

// === OBTENER URL DE IMAGEN REAL ===
// JSONPlaceholder usa lorempixel (offline). Usamos picsum.photos
// con el id como semilla para que cada foto tenga imagen única y consistente.
const obtenerUrlImagen = (id, tamaño = 300) => {
  return `https://picsum.photos/seed/${id}/${tamaño}/${tamaño}`;
};

// === FETCH FOTOS CON async/await ===
const fetchFotos = async (limit) => {
  const url = `https://jsonplaceholder.typicode.com/photos?_limit=${limit}`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`Error en la petición: ${respuesta.status} ${respuesta.statusText}`);
  }

  // .json() también retorna una Promesa → await la resuelve
  const fotos = await respuesta.json();
  return fotos;
};

// === CREAR TARJETA DE FOTO ===
const crearTarjeta = (foto, indice) => {
  const card = document.createElement('div');
  card.className = 'photoCard';
  card.style.animationDelay = `${indice * 0.04}s`;

  const imgUrl = obtenerUrlImagen(foto.id);

  card.innerHTML = `
    <div class="photoThumb">
      <img
        src="${imgUrl}"
        alt="${foto.title}"
        loading="lazy"
        onerror="this.parentElement.classList.add('imgError'); this.style.display='none'; this.parentElement.innerHTML += '<span class=\\'imgPlaceholder\\'>📷</span>'"
      />
    </div>
    <div class="photoInfo">
      <div class="photoMeta">Foto #${foto.id} · Álbum ${foto.albumId}</div>
      <p class="photoTitle">${foto.title}</p>
    </div>
  `;

  // Clic → abrir modal con imagen de mayor resolución
  card.addEventListener('click', () => {
    abrirModal(foto);
  });

  return card;
};

// === MODAL ===
const abrirModal = (foto) => {
  modalImg.src = obtenerUrlImagen(foto.id, 600);
  modalImg.alt = foto.title;
  modalMeta.textContent = `Foto #${foto.id} · Álbum ${foto.albumId}`;
  modalTitle.textContent = foto.title;
  photoModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

const cerrarModal = () => {
  photoModal.style.display = 'none';
  document.body.style.overflow = '';
  modalImg.src = '';
};

modalClose.addEventListener('click', cerrarModal);
modalOverlay.addEventListener('click', cerrarModal);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarModal();
});

// === MOSTRAR / OCULTAR LOADER ===
const mostrarLoader = (visible) => {
  loader.style.display  = visible ? 'flex' : 'none';
  errorMsg.style.display = 'none';
  if (visible) gallery.innerHTML = '';
};

// === CARGAR GALERÍA (función principal) ===
const cargarGaleria = async () => {
  const limit = parseInt(limitSelect.value);

  mostrarLoader(true);
  loadBtn.disabled = true;

  try {
    // await espera a que la promesa de fetchFotos se resuelva
    const fotos = await fetchFotos(limit);

    loader.style.display = 'none';
    gallery.innerHTML = '';

    fotos.forEach((foto, i) => {
      const card = crearTarjeta(foto, i);
      gallery.appendChild(card);
    });

  } catch (error) {
    loader.style.display  = 'none';
    errorMsg.style.display = 'block';
    errorMsg.textContent  = `❌ No se pudo cargar la galería: ${error.message}`;
  } finally {
    // finally siempre se ejecuta, haya error o no
    loadBtn.disabled = false;
  }
};

// === EVENTOS ===
loadBtn.addEventListener('click', cargarGaleria);

// Recargar al cambiar el selector de cantidad
limitSelect.addEventListener('change', cargarGaleria);

// === CARGA AUTOMÁTICA AL INICIAR ===
cargarGaleria();
