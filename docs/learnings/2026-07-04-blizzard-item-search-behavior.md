# La búsqueda de ítems de Blizzard no afina por nombre completo y requiere query codificada

**Fecha:** 2026-07-04
**Proyecto:** penguin-loot-tracker

## Contexto

El Loot Assigner busca ítems contra la API de datos de Blizzard (`https://us.api.blizzard.com/data/wow/search/item?name.en_US=...`, en `src/hooks/endpoints.ts`) para asignárselos a jugadores. Un usuario reportó que al buscar un ítem exacto (ej. "Deathbringer's Will") no aparecía. Se diagnosticó consultando la API real con las credenciales de la app.

## Descubrimiento

Dos comportamientos verificados de la API (probados el 2026-07-04):

1. **`name.en_US` matchea el token principal e ignora el resto.** Buscar `Deathbringer's Will` devuelve exactamente los **mismos 43 resultados** que buscar `Deathbringer` (todo lo que contiene "Deathbringer"). La API **no puede** reducir la búsqueda a un nombre de ítem específico. El ítem exacto (`Deathbringer's Will`, de hecho ×2: Normal y Heroico) sí viene dentro de ese set amplio, pero no se puede aislar vía el parámetro de búsqueda.

2. **La query debe ir URL-encoded (`encodeURIComponent`).** Si se manda cruda, los espacios y apóstrofos rompen la petición: la API devuelve vacío / no-JSON y la búsqueda falla silenciosamente. Con una sola palabra sin caracteres especiales "funciona de casualidad".

Detalle adicional: `_pageSize` máximo es **100**. Una búsqueda con más de 100 coincidencias perdería el excedente.

## Aplicación

La única forma de fijar un ítem exacto es un **filtro del lado cliente sobre el set completo**, no la búsqueda de la API. El patrón correcto en este proyecto:

- Traer el resultado completo en una sola llamada (`_pageSize=100`, `_page=1`).
- Paginar y filtrar del lado cliente (substring, insensible a mayúsculas) sobre *todos* los resultados.
- Siempre `encodeURIComponent(querySearch)` al armar la URL.

UX resultante: el usuario busca un término amplio ("Deathbringer") y luego escribe en el filtro ("will") para llegar al ítem exacto. No intentar que la API devuelva el ítem exacto pasándole el nombre completo — no lo hará.

> **Nota para el equipo:** Este learning es específico de `penguin-loot-tracker` y su integración con la API de Blizzard, no transversal a ATLAS.
