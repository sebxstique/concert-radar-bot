const { SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('seguir')
    .setDescription('Suscribe un artista para recibir notificaciones de conciertos')
    .addStringOption(option =>
      option.setName('artista')
        .setDescription('Nombre del artista')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('dejar')
    .setDescription('Deja de seguir un artista')
    .addStringOption(option =>
      option.setName('artista')
        .setDescription('Nombre del artista')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('artistas')
    .setDescription('Lista los artistas que este server está siguiendo'),

  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configura el canal de notificaciones')
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde se postearán las notificaciones')
        .setRequired(true)
    ),
];

module.exports = commands;