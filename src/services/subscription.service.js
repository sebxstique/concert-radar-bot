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

module.exports = { seguirArtista, dejarArtista, listarArtistas };