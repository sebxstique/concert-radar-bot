# ADR 0002: Ticketmaster Discovery API sobre Bandsintown

## Estado
Aceptado

## Contexto
Se necesita una fuente de datos de eventos/conciertos con acceso
programático confiable.

## Decisión
Se usa Ticketmaster Discovery API.

## Justificación
- Registro self-service, sin necesitar aprobación manual de la empresa
- Free tier con 5,000 calls/día y 5 req/seg — suficiente para el polling
  planeado
- Bandsintown requiere consentimiento escrito previo y su ToS prohíbe
  cachear los datos, lo cual choca directamente con la necesidad de
  guardar eventos en DB para deduplicación

## Consecuencias
- Cobertura de artistas latinos/urbanos debe validarse en fase de research
  (riesgo pendiente) — confirmado en pruebas: no todos los artistas tienen
  eventos registrados para todos los países
- Si se necesita escalar, hay que solicitar aumento de rate limit
  justificando cumplimiento de ToS y guía de marca