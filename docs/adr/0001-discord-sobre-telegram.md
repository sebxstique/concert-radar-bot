# ADR 0001: Discord sobre Telegram como plataforma del bot

## Estado
Aceptado

## Contexto
El proyecto necesita una plataforma de mensajería para notificar eventos
de conciertos a una comunidad, no a usuarios individuales.

## Decisión
Se usa Discord en lugar de Telegram.

## Justificación
- El caso de uso es grupal (servidor de fans), no 1-a-1
- Discord permite mención de roles (@Feid-fan) para notificaciones dirigidas
- Slash commands + gateway events son un estándar más robusto y moderno
  que la API de bots de Telegram
- Multi-tenancy (un bot en varios servers) es first-class en Discord

## Consecuencias
- Requiere manejar conexión WebSocket persistente (gateway), más complejo
  que el long-polling/webhooks de Telegram
- Necesita hosting que soporte procesos long-running 24/7