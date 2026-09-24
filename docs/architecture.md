# Arquitectura — Concert Radar Bot

\`\`\`mermaid
flowchart TB
    subgraph Discord["Discord"]
        U[Usuario en server]
        CH[Canal configurado]
    end

    subgraph Bot["Bot Process (Node.js)"]
        SC[Slash Commands Handler]
        SCH[Scheduler - node-cron]
        NOT[Notification Service]
    end

    subgraph DB["PostgreSQL"]
        T1[(guilds)]
        T2[(artist_subscriptions)]
        T3[(notified_events)]
    end

    subgraph External["API Externa"]
        TM[Ticketmaster Discovery API]
    end

    U -- "/seguir artista" --> SC
    SC --> DB
    SCH -- "cada hora" --> TM
    TM -- "eventos" --> SCH
    SCH -- "dedup por fecha+venue" --> NOT
    NOT -- "postea mensaje" --> CH
    NOT --> DB
\`\`\`

## Componentes

| Componente | Función |
|---|---|
| Slash Commands Handler | Recibe `/seguir`, `/dejar`, `/artistas`, `/config` |
| Scheduler | Job periódico que consulta Ticketmaster por artista suscrito |
| Notification Service | Deduplica y postea eventos nuevos |

## Nota sobre el filtro de países

Cada guild puede configurar opcionalmente un filtro de países (`country_filter` en la tabla `guilds`). Sin configurar, el bot busca eventos globalmente. Se agregó tras detectar en pruebas reales que limitar a un solo país excluía artistas con baja cobertura de eventos ahí.

## Nota sobre deduplicación

Ticketmaster devuelve múltiples entradas por el mismo show (una por tipo de boleto). El bot deduplica agrupando por combinación fecha + venue antes de notificar.