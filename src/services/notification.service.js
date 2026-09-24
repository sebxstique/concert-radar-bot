const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function notificarEventosNuevos(client) {
  const suscripciones = await prisma.artistSubscription.findMany({
    include: { guild: true },
  });

  const { buscarEventos } = require('./ticketmaster.service');

  for (const sub of suscripciones) {
    const eventos = await buscarEventos(sub.artistName);

    for (const evento of eventos) {
      const yaNotificado = await prisma.notifiedEvent.findUnique({
        where: {
          guildId_ticketmasterEventId: {
            guildId: sub.guildId,
            ticketmasterEventId: evento.id,
          },
        },
      });

      if (yaNotificado) continue;

      const canalId = sub.guild.notificationChannelId;
      if (!canalId) continue;

      try {
        const canal = await client.channels.fetch(canalId.toString());
        await canal.send(
          `🎤 **${sub.artistName}** anunció show!\n**${evento.name}**\n📅 ${evento.date}\n📍 ${evento.venue}`
        );

        await prisma.notifiedEvent.create({
          data: {
            guildId: sub.guildId,
            subscriptionId: sub.id,
            ticketmasterEventId: evento.id,
            eventName: evento.name,
            eventDate: new Date(evento.date),
            venueName: evento.venue,
          },
        });

        console.log(`Notificado: ${evento.name} en guild ${sub.guildId}`);
      } catch (error) {
        console.error(`Error notificando en canal ${canalId}:`, error.message);
      }
    }
  }
}

module.exports = { notificarEventosNuevos };