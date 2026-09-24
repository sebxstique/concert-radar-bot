const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seguirArtista(guildId, guildName, artistName, userId) {
  await prisma.guild.upsert({
    where: { id: BigInt(guildId) },
    update: {},
    create: { id: BigInt(guildId), name: guildName },
  });

  return prisma.artistSubscription.create({
    data: {
      guildId: BigInt(guildId),
      artistName,
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

async function configurarCanal(guildId, guildName, channelId) {
  return prisma.guild.upsert({
    where: { id: BigInt(guildId) },
    update: { notificationChannelId: BigInt(channelId) },
    create: {
      id: BigInt(guildId),
      name: guildName,
      notificationChannelId: BigInt(channelId),
    },
  });
}

module.exports = { seguirArtista, dejarArtista, listarArtistas, configurarCanal };