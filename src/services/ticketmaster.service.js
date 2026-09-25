const axios = require('axios');

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';
const MAX_RETRIES = 3;

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function consultarConReintentos(params, intento = 1) {
  try {
    const response = await axios.get(BASE_URL, { params, timeout: 10000 });
    return response.data;
  } catch (error) {
    const status = error.response?.status;

    if ((status === 429 || status >= 500) && intento <= MAX_RETRIES) {
      const delay = 1000 * Math.pow(2, intento);
      console.warn(`Rate limit o error de servidor (${status}). Reintento ${intento}/${MAX_RETRIES} en ${delay}ms...`);
      await esperar(delay);
      return consultarConReintentos(params, intento + 1);
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

async function buscarEventos(artistName, countryFilter = null) {
  const eventosTotales = [];
  const paises = countryFilter ? countryFilter.split(',').map(p => p.trim()) : [null];

  for (const pais of paises) {
    const params = {
      apikey: process.env.TICKETMASTER_API_KEY,
      keyword: artistName,
    };
    if (pais) params.countryCode = pais;

    try {
      const data = await consultarConReintentos(params);
      const events = data._embedded?.events || [];

      eventosTotales.push(...events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.dates?.start?.localDate,
        venue: event._embedded?.venues?.[0]?.name || 'Venue desconocido',
      })));
    } catch (error) {
      console.error(`Error consultando Ticketmaster para "${artistName}" (país: ${pais || 'global'}):`, error.message);
    }
  }

  return deduplicarEventos(eventosTotales);
}

module.exports = { buscarEventos, deduplicarEventos };