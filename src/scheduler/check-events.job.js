const cron = require('node-cron');
const { notificarEventosNuevos } = require('../services/notification.service');

function iniciarScheduler(client) {
  // Corre cada hora, minuto 0
  cron.schedule('* * * * *', async () => {
    console.log('Revisando eventos nuevos...');
    await notificarEventosNuevos(client);
  });

  console.log('Scheduler iniciado (cada hora)');
}

module.exports = { iniciarScheduler };