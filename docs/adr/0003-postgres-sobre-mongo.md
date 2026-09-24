# ADR 0003: PostgreSQL sobre MongoDB

## Estado
Aceptado

## Contexto
El modelo de datos tiene relaciones claras (guilds → subscriptions →
notified_events) y necesita constraints de unicidad para evitar
notificaciones duplicadas.

## Decisión
Se usa PostgreSQL.

## Justificación
- Relaciones tabulares bien definidas, no hay necesidad de esquema flexible
- Unique constraints compuestos (guild_id + event_id) son triviales en SQL,
  incómodos de garantizar en Mongo sin trabajo extra
- Facilita queries de agregación simples (ej. "artistas más seguidos")

## Consecuencias
- Requiere migraciones formales (se usa Prisma como ORM)