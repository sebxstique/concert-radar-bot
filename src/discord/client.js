const { Client, GatewayIntentBits, MessageFlags, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
  seguirArtista,
  dejarArtista,
  listarArtistas,
  configurarCanal,
  guardarSetup,
  obtenerStats,
  artistasPopulares,
} = require('../services/subscription.service');
const { iniciarScheduler } = require('../scheduler/check-events.job');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  iniciarScheduler(client);
});

// Handler de slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, guild, user } = interaction;

  try {
    if (commandName === 'setup') {
      await interaction.deferReply();

      let canal = interaction.guild.channels.cache.find(c => c.name === 'conciertos');
      if (!canal) {
        canal = await interaction.guild.channels.create({
          name: 'conciertos',
          reason: 'Canal creado por Concert Radar Bot',
        });
      }

      let rol = interaction.guild.roles.cache.find(r => r.name === 'Fan-Conciertos');
      if (!rol) {
        rol = await interaction.guild.roles.create({
          name: 'Fan-Conciertos',
          mentionable: true,
          reason: 'Rol creado por Concert Radar Bot',
        });
      }

      await guardarSetup(guildId, guild.name, canal.id, rol.id);

      await interaction.editReply(
        `Setup completo ✅\nCanal: ${canal}\nRol: ${rol}\n\nUsa \`/seguir\` para empezar a suscribir artistas.`
      );
    }

    if (commandName === 'seguir') {
      const valor = interaction.options.getString('artista').trim();

      // El valor viene del autocomplete como "id::nombre", o como texto libre si el usuario no eligió de la lista
      let attractionId = null;
      let artista = valor;

      if (valor.includes('::')) {
        const [id, nombre] = valor.split('::');
        attractionId = id;
        artista = nombre;
      }

      if (artista.length < 2) {
        await interaction.reply({ content: 'El nombre del artista es muy corto.', flags: MessageFlags.Ephemeral });
        return;
      }

      try {
        await seguirArtista(guildId, guild.name, artista, user.id, attractionId);
        await interaction.reply(`Listo, ahora sigues a **${artista}** 🎤`);
      } catch (error) {
        if (error.code === 'P2002') {
          await interaction.reply({ content: `Ya estás siguiendo a **${artista}** en este server.`, flags: MessageFlags.Ephemeral });
        } else {
          throw error;
        }
      }
    }

    if (commandName === 'dejar') {
      const artista = interaction.options.getString('artista');
      await dejarArtista(guildId, artista);
      await interaction.reply(`Dejaste de seguir a **${artista}**`);
    }

    if (commandName === 'artistas') {
      const artistas = await listarArtistas(guildId);
      if (artistas.length === 0) {
        await interaction.reply('Este server no está siguiendo ningún artista todavía.');
      } else {
        const lista = artistas.map(a => `• ${a.artistName}`).join('\n');
        await interaction.reply(`Artistas seguidos:\n${lista}`);
      }
    }

    if (commandName === 'config') {
      const canal = interaction.options.getChannel('canal');
      const paises = interaction.options.getString('paises');
      await configurarCanal(guildId, guild.name, canal.id, paises);
      const mensajePaises = paises ? ` (filtrado a: ${paises})` : ' (sin filtro de país)';
      await interaction.reply(`Canal de notificaciones configurado en ${canal}${mensajePaises} ✅`);
    }

    if (commandName === 'stats') {
      const { totalArtistas, totalNotificaciones } = await obtenerStats(guildId);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📊 Estadísticas de ${guild.name}`)
        .addFields(
          { name: 'Artistas seguidos', value: `${totalArtistas}`, inline: true },
          { name: 'Notificaciones enviadas', value: `${totalNotificaciones}`, inline: true }
        );

      await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'artistas-populares') {
      const populares = await artistasPopulares(10);

      if (populares.length === 0) {
        await interaction.reply('Todavía no hay suficientes datos.');
      } else {
        const lista = populares
          .map((p, i) => `${i + 1}. **${p.artista}** — ${p.servers} server(s)`)
          .join('\n');

        const embed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('🔥 Artistas más seguidos')
          .setDescription(lista);

        await interaction.reply({ embeds: [embed] });
      }
    }

    if (commandName === 'ayuda') {
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🎤 Concert Radar — Comandos')
        .setDescription('Notifica a tu comunidad cuando sus artistas favoritos anuncian shows.')
        .addFields(
          { name: '/setup', value: 'Crea automáticamente el canal y rol de notificaciones (correr primero)' },
          { name: '/seguir [artista]', value: 'Suscribe un artista' },
          { name: '/dejar [artista]', value: 'Deja de seguir un artista' },
          { name: '/artistas', value: 'Lista los artistas seguidos por este server' },
          { name: '/config [canal] [paises]', value: 'Cambia el canal o filtra por países (ej: CO,MX). Opcional si ya usaste /setup' },
          { name: '/stats', value: 'Estadísticas de este server' },
          { name: '/artistas-populares', value: 'Ranking global de artistas más seguidos' },
        )
        .setFooter({ text: 'Concert Radar Bot' });

      await interaction.reply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Error manejando comando:', error);

    const mensaje = 'Ups, algo falló. Revisa la consola.';

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(mensaje);
      } else {
        await interaction.reply(mensaje);
      }
    } catch (errorSecundario) {
      console.error('Error adicional al intentar responder:', errorSecundario);
    }
  }
});

// Handler de botones (ej. "Recuérdamelo")
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('recordar_')) return;

  const [, eventId, eventName, eventDate] = interaction.customId.split('_');

  try {
    await interaction.user.send(
      `🔔 Recordatorio: **${eventName}** — ${eventDate}. ¡No lo olvides!`
    );
    await interaction.reply({ content: 'Te escribí por DM ✅', flags: MessageFlags.Ephemeral });
  } catch (error) {
    await interaction.reply({ content: 'No pude enviarte DM (revisa tu privacidad de mensajes).', flags: MessageFlags.Ephemeral });
  }
});

// Limpieza cuando remueven el bot de un server
client.on('guildDelete', async (guild) => {
  try {
    await prisma.notifiedEvent.deleteMany({ where: { guildId: BigInt(guild.id) } });
    await prisma.artistSubscription.deleteMany({ where: { guildId: BigInt(guild.id) } });
    await prisma.guild.delete({ where: { id: BigInt(guild.id) } });
    console.log(`Datos limpiados para guild removido: ${guild.name} (${guild.id})`);
  } catch (error) {
    console.error('Error limpiando datos de guild removido:', error.message);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (interaction.commandName !== 'seguir') return;

  const { buscarArtistas } = require('../services/ticketmaster.service');
  const focusedValue = interaction.options.getFocused();

  const resultados = await buscarArtistas(focusedValue);

  const choices = resultados.slice(0, 25).map(a => ({
    name: a.name,
    value: `${a.id}::${a.name}`.slice(0, 100),
  }));

  await interaction.respond(choices);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;