# Concert Radar Bot 🎤📡

Bot de Discord que notifica a comunidades de fans cuando un artista que siguen anuncia un show, usando datos en tiempo real de Ticketmaster.

## El problema

Los fans de un artista suelen enterarse tarde de un anuncio de concierto, o dependen de estar pendientes manualmente de redes sociales. Este bot centraliza esa vigilancia en el servidor de Discord donde ya está la comunidad.

## Cómo funciona

1. Cualquier miembro del server suscribe un artista con `/seguir`
2. Un proceso en background consulta periódicamente la API de Ticketmaster
3. Si hay un evento nuevo, se postea automáticamente en el canal configurado

Ver diagrama completo en [`docs/architecture.md`](docs/architecture.md).

## Stack

- **Bot:** Discord.js v14 (Node.js)
- **Base de datos:** PostgreSQL + Prisma
- **Fuente de datos:** Ticketmaster Discovery API
- **Scheduler:** node-cron

## Decisiones técnicas

Cada decisión relevante está documentada como ADR en [`docs/adr/`](docs/adr/).

## Comandos

| Comando | Descripción |
|---|---|
| `/seguir [artista]` | Suscribe un artista al server |
| `/dejar [artista]` | Cancela la suscripción |
| `/artistas` | Lista artistas seguidos |
| `/config [canal] [paises]` | Define el canal de notificaciones y, opcionalmente, filtra por países (ej: CO,MX,US). Sin filtro = eventos globales |

## Setup local

\`\`\`bash
git clone <repo>
cd concert-radar-bot
npm install
npx prisma migrate dev
node src/discord/deploy-commands.js
node src/index.js
\`\`\`

## Variables de entorno

\`\`\`
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DATABASE_URL=
TICKETMASTER_API_KEY=
\`\`\`

## Roadmap

- [x] Filtro de país configurable por server
- [ ] Manejo de errores más robusto (retries, rate limits)
- [ ] Tests con Jest
- [ ] Deploy en producción