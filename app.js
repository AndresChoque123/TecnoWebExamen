//Andres Choque Herrera
//Tecno Web
const API_KEY = 'b0364d47e9285d14c03746261cb4a809';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();
//punto uno
const obtenerSeries = async () => {
    const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=es-ES`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    return datos.results;
};
//punto dos
const crearTarjeta = (serie) => {
    const { id, name, first_air_date, vote_average, poster_path } = serie;
    const año = first_air_date ? first_air_date.split('-')[0] : 'N/A';
    const imagen = poster_path ? `${IMAGE_URL}${poster_path}` : '';
    const rating = vote_average ? vote_average.toFixed(1) : 'N/A';
    return `
        <article class="serie-card" data-id="${id}">
            <div class="serie-card__poster">
                <img class="serie-card__image" src="${imagen}" alt="${name}">
                <span class="serie-card__rating">⭐ ${rating}</span>
            </div>
            <div class="serie-card__content">
                <h3 class="serie-card__title">${name}</h3>
                <p class="serie-card__year">📅${año}</p>
            </div>
        </article>`;
};

const iniciar = async () => {
    console.log('Cargando series populares...');
    mostrarLoading();
    try {
        const series = await obtenerSeries();
        console.log(`${series.length} series obtenidas`);
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjeta).join('');
        console.log('Series renderizadas correctamente');
    } catch (error) {
        console.log('Error:', error);
        let mensaje = 'No se pudieron cargar las series';
        if (error.message.includes('401')) {
            mensaje = 'API Key inválida, verifica tu clave';
        }else if (error.message.includes('fetch')) {
            mensaje = 'Error de conexion. Verifica tu conexión';
        }
        mostrarError(mensaje);
    }
};

iniciar();
//tercer punto
const buscarSeries = async (texto) => {
    const busqueda = texto.trim();
    if (busqueda === '') {
        iniciar();
        return;
    }
    mostrarLoading();
    try {
        const url = `${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(busqueda)}`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        const series = datos.results;
        ocultarLoading();
        seriesGrid.innerHTML = series.map(crearTarjeta).join('');
    } catch (error) {
        console.log('Error en búsqueda:', error);
        let mensaje = 'Error al realizar la búsqueda';
        if (error.message.includes('401')) {
            mensaje = 'API Key inválida, verifica tu clave';
        } else if (error.message.includes('fetch')) {
            mensaje = 'Error de conexion. Verificar tu conexión';
        }
        mostrarError(mensaje);
    }
};
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        buscarSeries(e.target.value);
    });
}
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        iniciar();
    });
}
