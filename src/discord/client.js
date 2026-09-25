const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { seguirArtista, dejarArtista, listarArtistas, configurarCanal } = require('../services/subscription.service');
const { iniciarScheduler } = require('../scheduler/check-events.job');
const { MessageFlags } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  iniciarScheduler(client);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, guild, user } = interaction;

  try {
    if (commandName === 'seguir') {
      const artista = interaction.options.getString('artista').trim();

      if (artista.length < 2) {
        await interaction.reply({ content: 'El nombre del artista es muy corto.', flags: MessageFlags.Ephemeral });
        return;
      }

      try {
        await seguirArtista(guildId, guild.name, artista, user.id);
        await interaction.reply(`Listo, ahora sigues a **${artista}** 🎤`);
      } catch (error) {
        if (error.code === 'P2002') { // Prisma: violación de unique constraint
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
  } catch (error) {
    console.error('Error manejando comando:', error);
    await interaction.reply('Ups, algo falló. Revisa la consola.');
  }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;