-- CreateTable
CREATE TABLE "guilds" (
    "id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "notification_channel_id" BIGINT,
    "notification_role_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artist_subscriptions" (
    "id" SERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "artist_name" TEXT NOT NULL,
    "ticketmaster_attraction_id" TEXT,
    "added_by_user_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notified_events" (
    "id" SERIAL NOT NULL,
    "guild_id" BIGINT NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "ticketmaster_event_id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_date" DATE NOT NULL,
    "venue_name" TEXT NOT NULL,
    "notified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notified_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artist_subscriptions_guild_id_artist_name_key" ON "artist_subscriptions"("guild_id", "artist_name");

-- CreateIndex
CREATE UNIQUE INDEX "notified_events_guild_id_ticketmaster_event_id_key" ON "notified_events"("guild_id", "ticketmaster_event_id");

-- AddForeignKey
ALTER TABLE "artist_subscriptions" ADD CONSTRAINT "artist_subscriptions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notified_events" ADD CONSTRAINT "notified_events_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notified_events" ADD CONSTRAINT "notified_events_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "artist_subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
