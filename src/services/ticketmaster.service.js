const axios = require('axios');

const EVENTS_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const ATTRACTIONS_URL = 'https://app.ticketmaster.com/discovery/v2/attractions.json';
const MAX_RETRIES = 3;

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function consultarConReintentos(url, params, intento = 1) {
  try {
    const response = await axios.get(url, { params, timeout: 10000 });
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if ((status === 429 || status >= 500) && intento <= MAX_RETRIES) {
      const delay = 1000 * Math.pow(2, intento);
      console.warn(`Rate limit o error de servidor (${status}). Reintento ${intento}/${MAX_RETRIES} en ${delay}ms...`);
      await esperar(delay);
      return consultarConReintentos(url, params, intento + 1);
    }

    if (status === 401 || status === 403) {
      console.error('API key de Ticketmaster inválida o sin permisos.');
      throw error;
    }

    throw error;
  }
}

function deduplicarEventos(eventos) {
  const vistos = new Set();
  return eventos.filter(e => {
    const clave = `${e.date}-${e.venue}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

// Busca artistas reales para el autocomplete de /seguir
async function buscarArtistas(query) {
  if (!query || query.length < 2) return [];

  try {
    const data = await consultarConReintentos(ATTRACTIONS_URL, {
      apikey: process.env.TICKETMASTER_API_KEY,
      keyword: query,
      size: 10,
    });

    const attractions = data._embedded?.attractions || [];

    return attractions.map(a => ({
      id: a.id,
      name: a.name,
    }));
  } catch (error) {
    console.error(`Error buscando artistas para "${query}":`, error.message);
    return [];
  }
}

function extraerMejorImagen(images) {
  if (!images || images.length === 0) return null;
  // Prioriza imágenes horizontales grandes (mejor para embeds)
  const ordenadas = [...images].sort((a, b) => (b.width || 0) - (a.width || 0));
  return ordenadas[0]?.url || null;
}

function mapearEvento(event) {
  return {
    id: event.id,
    name: event.name,
    date: event.dates?.start?.localDate,
    venue: event._embedded?.venues?.[0]?.name || 'Venue desconocido',
    url: event.url,
    image: extraerMejorImagen(event.images),
  };
}

// Busca eventos por ID de artista (preciso) o por nombre (fallback)
async function buscarEventos(artistName, countryFilter = null, attractionId = null) {
  const eventosTotales = [];
  const paises = countryFilter ? countryFilter.split(',').map(p => p.trim()) : [null];

  for (const pais of paises) {
    const params = {
      apikey: process.env.TICKETMASTER_API_KEY,
    };

    if (attractionId) {
      params.attractionId = attractionId;
    } else {
      params.keyword = artistName;
    }

    if (pais) params.countryCode = pais;

    try {
      const data = await consultarConReintentos(EVENTS_URL, params);
      const events = data._embedded?.events || [];
      eventosTotales.push(...events.map(mapearEvento));
    } catch (error) {
      console.error(`Error consultando Ticketmaster para "${artistName}" (país: ${pais || 'global'}):`, error.message);
    }
  }

  return deduplicarEventos(eventosTotales);
}

module.exports = { buscarEventos, buscarArtistas, deduplicarEventos };