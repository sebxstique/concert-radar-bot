const { deduplicarEventos } = require('../ticketmaster.service');

describe('deduplicarEventos', () => {
  test('elimina eventos duplicados por fecha+venue (mismo show, distinto tipo de boleto)', () => {
    const eventos = [
      { id: '1', name: 'Individual', date: '2026-10-25', venue: 'Coliseo GNP' },
      { id: '2', name: 'Abono VIP', date: '2026-10-25', venue: 'Coliseo GNP' },
      { id: '3', name: 'Comfort Pass', date: '2026-10-25', venue: 'Coliseo GNP' },
    ];

    const resultado = deduplicarEventos(eventos);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe('1'); // se queda con el primero
  });

  test('conserva eventos distintos (fecha o venue diferente)', () => {
    const eventos = [
      { id: '1', name: 'Show día 1', date: '2026-10-25', venue: 'Coliseo GNP' },
      { id: '2', name: 'Show día 2', date: '2026-10-26', venue: 'Coliseo GNP' },
      { id: '3', name: 'Show otra ciudad', date: '2026-10-25', venue: 'Foro Sol' },
    ];

    const resultado = deduplicarEventos(eventos);

    expect(resultado).toHaveLength(3);
  });

  test('devuelve array vacío si no hay eventos', () => {
    expect(deduplicarEventos([])).toEqual([]);
  });
});