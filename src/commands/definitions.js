const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configura automáticamente el canal y rol para notificaciones de conciertos')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder()
    .setName('seguir')
    .setDescription('Suscribe un artista para recibir notificaciones de conciertos')
    .addStringOption(option =>
      option.setName('artista')
        .setDescription('Escribe el nombre y elige de la lista')
        .setRequired(true)
        .setAutocomplete(true)
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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option =>
      option.setName('canal')
        .setDescription('Canal donde se postearán las notificaciones')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('paises')
        .setDescription('Códigos de país separados por coma (ej: CO,MX,US). Vacío = todos')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Muestra estadísticas de este server'),

  new SlashCommandBuilder()
    .setName('artistas-populares')
    .setDescription('Muestra los artistas más seguidos entre todos los servers'),

  new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra todos los comandos disponibles'),
];

module.exports = commands;