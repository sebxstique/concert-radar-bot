const { PrismaClient } = require('@prisma/client');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = new PrismaClient();

async function notificarEventosNuevos(client) {
  const suscripciones = await prisma.artistSubscription.findMany({
    include: { guild: true },
  });

  const { buscarEventos } = require('./ticketmaster.service');

  for (const sub of suscripciones) {
    const eventos = await buscarEventos(
      sub.artistName,
      sub.guild.countryFilter,
      sub.ticketmasterAttractionId
    );

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

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle(`🎤 ${sub.artistName} anunció show!`)
          .setDescription(evento.name)
          .addFields(
            { name: '📅 Fecha', value: evento.date || 'Por confirmar', inline: true },
            { name: '📍 Venue', value: evento.venue, inline: true }
          )
          .setFooter({ text: 'Concert Radar Bot' })
          .setTimestamp();

        if (evento.image) embed.setImage(evento.image);
        if (evento.url) embed.setURL(evento.url);

        const botones = [
          new ButtonBuilder()
            .setCustomId(`recordar_${evento.id}_${evento.name.slice(0, 50)}_${evento.date}`)
            .setLabel('🔔 Recuérdamelo')
            .setStyle(ButtonStyle.Primary),
        ];

        if (evento.url) {
          botones.push(
            new ButtonBuilder()
              .setLabel('🎟️ Comprar boletos')
              .setStyle(ButtonStyle.Link)
              .setURL(evento.url)
          );
        }

        const fila = new ActionRowBuilder().addComponents(botones);

        const mencionRol = sub.guild.notificationRoleId
          ? `<@&${sub.guild.notificationRoleId}>`
          : '';

        await canal.send({ content: mencionRol, embeds: [embed], components: [fila] });

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