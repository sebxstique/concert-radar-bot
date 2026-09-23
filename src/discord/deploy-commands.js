const { REST, Routes } = require('discord.js');
require('dotenv').config();
const commands = require('../commands/definitions');

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registrando ${commands.length} comandos...`);

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands.map(cmd => cmd.toJSON()) }
    );

    console.log('Comandos registrados correctamente.');
  } catch (error) {
    console.error('Error registrando comandos:', error);
  }
})();