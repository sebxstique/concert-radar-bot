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

    // Rate limit (429) o error de servidor (5xx) → reintenta con backoff
    if ((status === 429 || status >= 500) && intento <= MAX_RETRIES) {
      const delay = 1000 * Math.pow(2, intento); // 2s, 4s, 8s
      console.warn(`Rate limit o error de servidor (${status}). Reintento ${intento}/${MAX_RETRIES} en ${delay}ms...`);
      await esperar(delay);
      return consultarConReintentos(params, intento + 1);
    }

    // Error de autenticación (401/403) → no tiene sentido reintentar
    if (status === 401 || status === 403) {
      console.error('API key de Ticketmaster inválida o sin permisos.');
      throw error;
    }

    throw error;
  }
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
      // Continúa con el siguiente país en vez de abortar todo
    }
  }

  const vistos = new Set();
  return eventosTotales.filter(e => {
    const clave = `${e.date}-${e.venue}`;
    if (vistos.has(clave)) return false;
    vistos.add(clave);
    return true;
  });
}

module.exports = { buscarEventos };