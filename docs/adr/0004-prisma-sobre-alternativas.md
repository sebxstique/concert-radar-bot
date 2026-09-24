# ADR 0004: Prisma como ORM

## Estado
Aceptado

## Contexto
Se necesita una capa de acceso a datos para PostgreSQL que facilite
migraciones y mantenga consistencia con el ERD diseñado.

## Decisión
Se usa Prisma como ORM.

## Justificación
- Schema declarativo que mapea 1:1 con el ERD documentado en el ADR previo
- Migraciones automáticas a partir de cambios en el schema
- Cliente tipado en TypeScript/JS, reduce errores en tiempo de desarrollo
- Estándar actual del ecosistema Node/TS, buen valor para portafolio

## Consecuencias
- Añade una capa de abstracción sobre SQL puro (trade-off aceptable dado
  el tamaño del proyecto)
- Requiere generar el cliente (`prisma generate`) como paso de build
- Se evitó la versión RC (8.0.0) por inestabilidad de comandos CLI;
  se fijó en v6 estable