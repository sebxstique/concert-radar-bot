const axios = require('axios');

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

async function buscarEventos(artistName) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        apikey: process.env.TICKETMASTER_API_KEY,
        keyword: artistName,
      },
    });

    const events = response.data._embedded?.events || [];

    const mapeados = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.dates?.start?.localDate,
      venue: event._embedded?.venues?.[0]?.name || 'Venue desconocido',
    }));

    // Deduplicar por fecha + venue (mismo show, distintos tipos de boleto)
    const vistos = new Set();
    const unicos = mapeados.filter(e => {
      const clave = `${e.date}-${e.venue}`;
      if (vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    });

    return unicos;
  } catch (error) {
    console.error(`Error consultando Ticketmaster para "${artistName}":`, error.message);
    return [];
  }
}

module.exports = { buscarEventos };