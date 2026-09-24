const axios = require('axios');

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

async function buscarEventos(artistName, countryFilter = null) {
  try {
    const eventosTotales = [];
    const paises = countryFilter ? countryFilter.split(',').map(p => p.trim()) : [null];

    for (const pais of paises) {
      const params = {
        apikey: process.env.TICKETMASTER_API_KEY,
        keyword: artistName,
      };
      if (pais) params.countryCode = pais;

      const response = await axios.get(BASE_URL, { params });
      const events = response.data._embedded?.events || [];

      eventosTotales.push(...events.map(event => ({
        id: event.id,
        name: event.name,
        date: event.dates?.start?.localDate,
        venue: event._embedded?.venues?.[0]?.name || 'Venue desconocido',
      })));
    }

    const vistos = new Set();
    return eventosTotales.filter(e => {
      const clave = `${e.date}-${e.venue}`;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    });
  } catch (error) {
    console.error(`Error consultando Ticketmaster para "${artistName}":`, error.message);
    return [];
  }
}

module.exports = { buscarEventos };