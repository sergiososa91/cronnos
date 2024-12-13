const STORAGE_KEY = "busquedasRecientes";

const searchInput = document.getElementById('search-input');
const searchResultsContainer = document.getElementById('search-results');

const todasLasPeliculas = [
    ...Object.values(cortometrajes).flat(),
    ...Object.values(peliculasMedias).flat(),
    ...Object.values(peliculasLargas).flat(),
    ...Object.values(peliculasExtensas).flat()
];

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