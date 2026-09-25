const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seguirArtista(guildId, guildName, artistName, userId, attractionId = null) {
  await prisma.guild.upsert({
    where: { id: BigInt(guildId) },
    update: {},
    create: { id: BigInt(guildId), name: guildName },
  });

  return prisma.artistSubscription.create({
    data: {
      guildId: BigInt(guildId),
      artistName,
      ticketmasterAttractionId: attractionId,
      addedByUserId: BigInt(userId),
    },
  });
}

async function dejarArtista(guildId, artistName) {
  return prisma.artistSubscription.deleteMany({
    where: {
      guildId: BigInt(guildId),
      artistName,
    },
  });
}

async function listarArtistas(guildId) {
  return prisma.artistSubscription.findMany({
    where: { guildId: BigInt(guildId) },
  });
}

async function configurarCanal(guildId, guildName, channelId, paises) {
  return prisma.guild.upsert({
    where: { id: BigInt(guildId) },
    update: {
      notificationChannelId: BigInt(channelId),
      countryFilter: paises || null,
    },
    create: {
      id: BigInt(guildId),
      name: guildName,
      notificationChannelId: BigInt(channelId),
      countryFilter: paises || null,
    },
  });
}

async function guardarSetup(guildId, guildName, channelId, roleId) {
  return prisma.guild.upsert({
    where: { id: BigInt(guildId) },
    update: {
      notificationChannelId: BigInt(channelId),
      notificationRoleId: BigInt(roleId),
    },
    create: {
      id: BigInt(guildId),
      name: guildName,
      notificationChannelId: BigInt(channelId),
      notificationRoleId: BigInt(roleId),
    },
  });
}

async function obtenerStats(guildId) {
  const totalArtistas = await prisma.artistSubscription.count({
    where: { guildId: BigInt(guildId) },
  });

  const totalNotificaciones = await prisma.notifiedEvent.count({
    where: { guildId: BigInt(guildId) },
  });

  return { totalArtistas, totalNotificaciones };
}

async function artistasPopulares(limite = 10) {
  const resultado = await prisma.artistSubscription.groupBy({
    by: ['artistName'],
    _count: { artistName: true },
    orderBy: { _count: { artistName: 'desc' } },
    take: limite,
  });

  return resultado.map(r => ({ artista: r.artistName, servers: r._count.artistName }));
}

module.exports = {
  seguirArtista,
  dejarArtista,
  listarArtistas,
  configurarCanal,
  guardarSetup,
  obtenerStats,
  artistasPopulares,
};