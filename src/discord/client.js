const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'seguir') {
    const artista = interaction.options.getString('artista');
    await interaction.reply(`Por ahora esto es un placeholder: seguirías a **${artista}** 🎤`);
  }

  if (commandName === 'dejar') {
    const artista = interaction.options.getString('artista');
    await interaction.reply(`Placeholder: dejarías de seguir a **${artista}**`);
  }

  if (commandName === 'artistas') {
    await interaction.reply('Placeholder: aquí iría la lista de artistas seguidos');
  }

  if (commandName === 'config') {
    const canal = interaction.options.getChannel('canal');
    await interaction.reply(`Placeholder: canal configurado como ${canal}`);
  }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;