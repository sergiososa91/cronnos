import { obtenerBusquedasRecientes, guardarBusqueda, limpiarBusquedasRecientes } from './busquedas.js';

document.addEventListener('DOMContentLoaded', () => {
    // ==== ELEMENTOS DEL DOM ====
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
    const movies = document.querySelectorAll('.movie');
    const movieCard = document.getElementById('movie-card');
    const movieTitle = document.getElementById('movie-title');
    const movieLength = document.getElementById('movie-length');
    const movieDescription = document.getElementById('movie-description');
    const closeCard = document.getElementById('close-card');

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

    // Muestra un popup con un mensaje
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
    }

    // Obtener una recomendación basada en duración y género
    function obtenerRecomendacion(duracion, genero = "drama") {
        const categorias = { cortometrajes, peliculasMedias, peliculasLargas, peliculasExtensas };
        let opciones;

        if (duracion <= 30) opciones = categorias.cortometrajes[genero] || categorias.cortometrajes["drama"];
        else if (duracion <= 90) opciones = categorias.peliculasMedias[genero] || categorias.peliculasMedias["drama"];
        else if (duracion <= 150) opciones = categorias.peliculasLargas[genero] || categorias.peliculasLargas["drama"];
        else opciones = categorias.peliculasExtensas[genero] || categorias.peliculasExtensas["drama"];

        return opciones[Math.floor(Math.random() * opciones.length)];
    }

    // Inicia la recomendación basándose en los inputs del usuario
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

        guardarBusqueda(recomendacion, genero); // Guarda la recomendación como búsqueda reciente
    }

    // ==== INTERACCIÓN CON LOS ELEMENTOS ====
    startButton.addEventListener('click', iniciarRecomendacion);
    horasInput.addEventListener('keypress', (e) => { if (e.key === "Enter") iniciarRecomendacion(); });
    minutosInput.addEventListener('keypress', (e) => { if (e.key === "Enter") iniciarRecomendacion(); });

    // Funcionalidad de búsqueda
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            mostrarResultadosBusqueda(query);
        } else {
            searchResultsContainer.innerHTML = '';
            searchResultsContainer.style.display = 'none';
        }
    });

    // Mostrar tarjeta de película al hacer clic en un elemento
    movies.forEach(movie => {
        movie.addEventListener('click', () => {
            const title = movie.getAttribute('data-title');
            const length = movie.getAttribute('data-length');
            const description = movie.getAttribute('data-description');

            movieTitle.textContent = title;
            movieLength.textContent = length;
            movieDescription.textContent = description;

            movieCard.classList.remove('hidden');
        });
    });

    // Cierra la tarjeta de película
    closeCard.addEventListener('click', () => {
        movieCard.classList.add('hidden');
    });
});
