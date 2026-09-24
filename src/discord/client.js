const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const { seguirArtista, dejarArtista, listarArtistas, configurarCanal } = require('../services/subscription.service');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, guildId, guild, user } = interaction;

  try {
    if (commandName === 'seguir') {
      const artista = interaction.options.getString('artista');
      await seguirArtista(guildId, guild.name, artista, user.id);
      await interaction.reply(`Listo, ahora sigues a **${artista}** 🎤`);
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
      await configurarCanal(guildId, guild.name, canal.id);
      await interaction.reply(`Canal de notificaciones configurado en ${canal} ✅`);
    }
  } catch (error) {
    console.error('Error manejando comando:', error);
    await interaction.reply('Ups, algo falló. Revisa la consola.');
  }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;