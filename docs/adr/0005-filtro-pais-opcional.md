# ADR 0005: Filtro de país opcional en vez de fijo

## Estado
Aceptado

## Contexto
El diseño inicial no contemplaba filtro de país. En pruebas con datos reales
se detectó que ciertos artistas (ej. Feid) no tenían eventos registrados en
Ticketmaster para Colombia específicamente, mientras que otros (Anuel AA,
Romeo Santos) devolvían múltiples resultados en México.

## Decisión
Se agrega un campo `country_filter` opcional en `Guild`, configurable vía
`/config`. Sin configurar, el bot busca globalmente.

## Justificación
- Limitar a un país fijo excluye shows relevantes para la audiencia
  (fans que viajarían a ver un show cercano)
- Dar la opción, no la obligación, respeta que cada comunidad puede
  tener necesidades distintas

## Consecuencias
- Más llamadas a la API cuando hay múltiples países en el filtro
  (un request por país), impacto menor dado el rate limit de 5000/día