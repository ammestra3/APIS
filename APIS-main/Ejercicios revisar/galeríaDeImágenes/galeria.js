// variable global para el contenedor
let galeria = document.getElementById("galeria");

// función para obtener las fotos de la API
async function obtenerFotos() {
    try {
        let url = "https://api.pexels.com/v1/curated?per_page=16";

        let respuesta = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "ayAXn3VVKGHMusirx1tyKepe1zcoZ1jvYgnOZZiQ0NRL6QSQZkdiErHK"
            }
        });

        let datos = await respuesta.json();

        datos.photos.forEach((foto) => {
            galeria.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card">
                        <img src="${foto.src.medium}" class="card-img-top" alt="${foto.alt}">
                        <div class="card-body">
                            <h5 class="card-title">${foto.alt}</h5>
                            <p class="card-text">Foto por: ${foto.photographer}</p>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.log("Error al obtener las fotos:", error);
    }
}

// llamamos la función al cargar la página
obtenerFotos();