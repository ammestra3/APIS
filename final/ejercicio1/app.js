const gallery      = document.getElementById('gallery');
const loader       = document.getElementById('loader');
const errorMsg     = document.getElementById('errorMsg');
const loadBtn      = document.getElementById('loadBtn');
const limitSelect  = document.getElementById('limitSelect');
const photoModal   = document.getElementById('photoModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalImg     = document.getElementById('modalImg');
const modalMeta    = document.getElementById('modalMeta');
const modalTitle   = document.getElementById('modalTitle');

const imgUrl = (id, size = 300) => `https://picsum.photos/seed/${id}/${size}/${size}`;

const fetchFotos = async (limit) => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=${limit}`);
  if (!res.ok) throw new Error(`error ${res.status}: ${res.statusText}`);
  return res.json();
};

const crearTarjeta = (foto, i) => {
  const card = document.createElement('div');
  card.className = 'photoCard';
  card.style.animationDelay = `${i * 0.04}s`;
  card.innerHTML = `
    <div class="photoThumb">
      <img src="${imgUrl(foto.id)}" alt="${foto.title}" loading="lazy"
        onerror="this.parentElement.innerHTML='<span class=\\'imgPlaceholder\\'>📷</span>'"/>
    </div>
    <div class="photoInfo">
      <div class="photoMeta">foto #${foto.id} · álbum ${foto.albumId}</div>
      <p class="photoTitle">${foto.title}</p>
    </div>
  `;
  card.addEventListener('click', () => abrirModal(foto));
  return card;
};

const abrirModal = (foto) => {
  modalImg.src = imgUrl(foto.id, 600);
  modalImg.alt = foto.title;
  modalMeta.textContent  = `foto #${foto.id} · álbum ${foto.albumId}`;
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModal(); });

const cargarGaleria = async () => {
  loader.style.display   = 'flex';
  errorMsg.style.display = 'none';
  gallery.innerHTML      = '';
  loadBtn.disabled       = true;

  try {
    const fotos = await fetchFotos(parseInt(limitSelect.value));
    loader.style.display = 'none';
    fotos.forEach((foto, i) => gallery.appendChild(crearTarjeta(foto, i)));
  } catch (err) {
    loader.style.display   = 'none';
    errorMsg.style.display = 'block';
    errorMsg.textContent   = `❌ no se pudo cargar la galería: ${err.message}`;
  } finally {
    loadBtn.disabled = false;
  }
};

loadBtn.addEventListener('click', cargarGaleria);
limitSelect.addEventListener('change', cargarGaleria);
cargarGaleria();
