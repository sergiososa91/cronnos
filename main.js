document.addEventListener('DOMContentLoaded', () => {
    const horasInput = document.querySelector('.time-section input[aria-label="Horas"]');
    const minutosInput = document.querySelector('.time-section input[aria-label="Minutos"]');
    const startButton = document.querySelector('.start-button');
    const popup = document.getElementById("recommendation-popup");
    const recommendationText = document.getElementById("recommendation-text");
    const errorPopup = document.getElementById("error-popup");
    const errorText = document.getElementById("error-text");
    const closeErrorPopup = document.getElementById("close-error-popup");
    const genreSelect = document.getElementById('genre-select');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    const cortometrajes = {
        terror: ["The Grandmother de David Lynch", "The Black Hole de Philip Sansom", "Lights Out de David Sandberg"],
        comedia: ["Two Cars, One Night de Taika Waititi", "The Neighbors' Window de Marshall Curry"],
        accion: ["Factory Farmed de Gareth Edwards", "Alive in Joburg de Neill Blomkamp"],
        drama: ["Lick the Star de Sofia Coppola", "Small Deaths de Lynne Ramsay"],
        thriller: ["Nimic de Yorgos Lanthimos", "La Jetée de Chris Marker"],
        animacion: ["Vincent de Tim Burton", "Piper de Alan Barillaro"]
    };

    const peliculasMedias = {
        terror: ["Censor de Prano Bailey-Bond", "The Lighthouse de Robert Eggers"],
        comedia: ["Shiva Baby de Emma Seligman", "The Farewell de Lulu Wang"],
        accion: ["Run Lola Run de Tom Tykwer", "Hardcore Henry de Ilya Naishuller"],
        drama: ["Petite Maman de Céline Sciamma", "The Rider de Chloé Zhao"],
        thriller: ["La Mujer Sin Cabeza de Lucrecia Martel", "Burning de Lee Chang-dong"],
        animacion: ["Mi Vecino Totoro de Hayao Miyazaki", "The Red Turtle de Michael Dudok de Wit"]
    };

    const peliculasLargas = {
        terror: ["A Nightmare on Elm Street de Wes Craven", "The Shining de Stanley Kubrick"],
        comedia: ["Silvia Prieto de Martín Rejtman", "Lady Bird de Greta Gerwig"],
        accion: ["Scott Pilgrim vs. The World de Edgar Wright", "Mad Max: Fury Road de George Miller"],
        drama: ["Gravity de Alfonso Cuarón", "Roma de Alfonso Cuarón"],
        thriller: ["American Psycho de Mary Harron", "Se7en de David Fincher"],
        animacion: ["The Mitchells vs. The Machines de Mike Rianda", "Coco de Lee Unkrich"]
    };

    const peliculasExtensas = {
        terror: ["Hereditary de Ari Aster", "It de Andy Muschietti"],
        comedia: ["Everything Everywhere All At Once de Daniel Scheinert y Daniel Kwan", "Intouchables de Olivier Nakache y Éric Toledano"],
        accion: ["Armageddon de Michael Bay", "The Dark Knight de Christopher Nolan"],
        drama: ["A Portrait Of A Lady On Fire de Céline Sciamma", "Schindler's List de Steven Spielberg"],
        thriller: ["Dogville de Lars Von Trier", "Zodiac de David Fincher"],
        animacion: ["La Princesa Mononoke de Hayao Miyazaki", "Spirited Away de Hayao Miyazaki"]
    };

    const todasLasPeliculas = [
        ...Object.values(cortometrajes).flat(),
        ...Object.values(peliculasMedias).flat(),
        ...Object.values(peliculasLargas).flat(),
        ...Object.values(peliculasExtensas).flat()
    ];

    const STORAGE_KEY = "busquedasRecientes";

    function obtenerBusquedasRecientes() {
        const datos = localStorage.getItem(STORAGE_KEY);
        return datos ? JSON.parse(datos) : [];
    }

    function guardarBusqueda(query) {
        let busquedasRecientes = obtenerBusquedasRecientes();
        busquedasRecientes = busquedasRecientes.filter(busqueda => busqueda !== query);
        busquedasRecientes.unshift(query);
        if (busquedasRecientes.length > 10) busquedasRecientes.pop();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(busquedasRecientes));
    }

    function mostrarResultadosBusqueda(query) {
        const peliculasFiltradas = todasLasPeliculas.filter(pelicula =>
            pelicula.toLowerCase().includes(query.toLowerCase())
        );

        const busquedasRecientes = obtenerBusquedasRecientes().filter(busqueda =>
            busqueda.toLowerCase().includes(query.toLowerCase())
        );

        searchResultsContainer.innerHTML = '';

        if (busquedasRecientes.length > 0) {
            const recentTitle = document.createElement('p');
            recentTitle.textContent = "Búsquedas recientes:";
            searchResultsContainer.appendChild(recentTitle);

            busquedasRecientes.forEach(busqueda => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = busqueda;

                resultItem.addEventListener('click', () => {
                    searchInput.value = busqueda;
                    searchResultsContainer.innerHTML = '';
                    searchResultsContainer.style.display = 'none';
                });

                searchResultsContainer.appendChild(resultItem);
            });
        }

        if (peliculasFiltradas.length > 0) {
            peliculasFiltradas.forEach(pelicula => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = pelicula;

                resultItem.addEventListener('click', () => {
                    searchInput.value = pelicula;
                    guardarBusqueda(pelicula);
                    searchResultsContainer.innerHTML = '';
                    searchResultsContainer.style.display = 'none';
                });

                searchResultsContainer.appendChild(resultItem);
            });
            searchResultsContainer.style.display = 'block';
        } else if (busquedasRecientes.length === 0) {
            searchResultsContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            searchResultsContainer.style.display = 'block';
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (query) {
            mostrarResultadosBusqueda(query);
        } else {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
        }
    });

    const searchForm = document.querySelector('.search form');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            guardarBusqueda(query);
            searchInput.value = '';
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
        }
    });

    function obtenerRecomendacion(duracion, genero = "drama") {
        genero = genero.toLowerCase();
        const categorias = { cortometrajes, peliculasMedias, peliculasLargas, peliculasExtensas };

        let opciones;
        if (duracion <= 30) {
            opciones = categorias.cortometrajes[genero] || categorias.cortometrajes["drama"];
        } else if (duracion <= 90) {
            opciones = categorias.peliculasMedias[genero] || categorias.peliculasMedias["drama"];
        } else if (duracion <= 150) {
            opciones = categorias.peliculasLargas[genero] || categorias.peliculasLargas["drama"];
        } else {
            opciones = categorias.peliculasExtensas[genero] || categorias.peliculasExtensas["drama"];
        }

        const indiceAleatorio = Math.floor(Math.random() * opciones.length);
        return opciones[indiceAleatorio];
    }

    function mostrarPopup(mensaje, esError = false) {
        if (esError) {
            errorText.textContent = mensaje;
            errorPopup.style.display = "block";
            closeErrorPopup.onclick = () => errorPopup.style.display = "none";
        } else {
            recommendationText.textContent = mensaje;
            popup.style.display = "block";
            document.getElementById("close-popup").onclick = () => popup.style.display = "none";
        }

        window.onclick = (event) => {
            if (event.target === errorPopup) errorPopup.style.display = "none";
            if (event.target === popup) popup.style.display = "none";
        };
    }

    function iniciarRecomendacion() {
        const horas = parseInt(horasInput.value) || 0;
        const minutos = parseInt(minutosInput.value) || 0;
        const duracionTotal = (horas * 60) + minutos;

        if (duracionTotal < 30 || duracionTotal > 300) {
            mostrarPopup("Duración no válida. Debe ser entre 30 minutos y 5 horas.", true);
            return;
        }

        const genero = genreSelect ? genreSelect.value.toLowerCase() : null;
        const recomendacion = obtenerRecomendacion(duracionTotal, genero);
        mostrarPopup(`Tu recomendación es: ${recomendacion}. ¡Que disfrutes la película!`);
    }

    startButton.addEventListener('click', iniciarRecomendacion);
    horasInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter") iniciarRecomendacion();
    });
    minutosInput.addEventListener('keypress', (e) => {
        if (e.key === "Enter") iniciarRecomendacion();
    });
});
