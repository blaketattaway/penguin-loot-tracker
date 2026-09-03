# Leaflet en Mantine: pines animados que no se apilan, y basemap oscuro sin API key

**Fecha:** 2026-09-02
**Proyecto:** penguin-loot-tracker (módulo Penguin Party Tracker)

## Contexto

Se agregó un mapa con `react-leaflet` v5 (React 19) para marcar dónde fue cada fiesta de la
guild, con un pin custom en forma de pingüino y el tema oscuro del resto de la app.

## Descubrimiento 1: animar `transform` en el marker apila todos los pines en el origen

Leaflet **posiciona cada marcador escribiendo `transform: translate3d(x, y, 0)` sobre el
elemento del marker**. Es decir, `transform` en ese elemento no es tuyo: es el mecanismo de
posicionamiento del mapa.

El pin se había escrito siguiendo el vocabulario de movimiento de la app — animación de entrada
más lift en hover — directamente sobre la clase que se pasa a `L.divIcon({ className })`:

```css
.pin {
  animation: pin-drop 520ms var(--ease-out) both;   /* el keyframe termina en transform: none */
  transition: transform 180ms var(--ease-out);
}
```

Resultado: los tres pines aparecían **en la esquina superior izquierda del mapa, uno encima del
otro**. El keyframe pisaba el `translate3d` de Leaflet con `transform: none`, que equivale a
`translate(0, 0)` — el origen del contenedor.

Lo engañoso es el síntoma: los marcadores existen en el DOM, con su SVG, `opacity: 1`,
`display: block` y el tamaño correcto. Nada parece roto salvo la posición. El diagnóstico rápido
es leer el `getBoundingClientRect()` de todos los `.leaflet-marker-icon`: si comparten x/y,
el problema es transform, no z-index ni tamaño del contenedor.

**Solución:** el elemento del marker queda para Leaflet, y toda la animación va a un wrapper
interno dentro del `html` del `divIcon`:

```ts
L.divIcon({
  className,                                  // solo clases de estado, sin transform
  html: `<span class="${innerClassName}">${svg}</span>`,
})
```

```css
.pin { cursor: pointer; }                     /* nada de transform acá */
.pinInner { animation: pin-drop …; transition: transform …; }
.pin:hover .pinInner { transform: translateY(-4px) scale(1.06); }
```

Aplica igual a cualquier librería que posicione elementos por `transform`: hay que animar un hijo.

## Descubrimiento 2: los basemaps oscuros "gratis" ya piden API key

`{s}.basemaps.cartocdn.com/dark_all/...` es el snippet oscuro que aparece en casi todos los
tutoriales de Leaflet. Hoy devuelve tiles con la marca de agua **"API KEY REQUIRED —
carto.com/basemaps/apikey"** estampada en diagonal sobre todo el mapa. Stadia (Alidade Smooth
Dark) tampoco sirve sin key. La captura lo mostró de inmediato; sin verificación visual habría
llegado a producción.

**Solución sin key:** tiles estándar de OpenStreetMap + un filtro CSS aplicado **solo al
`.leaflet-tile-pane`**, para no teñir pines, tooltips ni controles:

```css
.map :global(.leaflet-tile-pane) {
  filter: invert(1) hue-rotate(180deg) brightness(0.7) contrast(1.05) saturate(0.3);
}
```

`invert` pasa de claro a oscuro, `hue-rotate(180deg)` devuelve los colores a su tono original
(sin esto el agua sale naranja), y `brightness`/`saturate` bajos evitan que el mapa compita con
el contenido. El primer intento (`brightness(0.92) saturate(0.75)`) quedó azul y demasiado
brillante para las superficies del tema.

## Descubrimiento 3: dos efectos de encuadre pelean entre sí

`fitBounds` (mostrar todas las ubicaciones) y `flyTo` (ir al año seleccionado) corren ambos en
el mount, y gana el segundo: el mapa arranca con zoom en una sola ciudad y nunca se ve el
conjunto, que era el punto del mapa. Un `useRef(false)` para "ya encuadré" no alcanza — hay que
guardar el **año anterior** y volar solo cuando cambia de verdad:

```ts
const previous = previousYear.current;
previousYear.current = selectedYear;
if (previous === null || previous === selectedYear) return;   // el primero no vuela
```

Esto además sobrevive al doble montaje de `StrictMode`, porque el valor no cambia entre las dos
pasadas.

## Otros detalles del módulo

- **`viteSingleFile` y el peso del pin.** `assets/penguin-icon.png` pesa 202 KB; a 40 px en el
  mapa es desproporcionado y este build inlinea todo en un `index.html`. El pin se dibujó como
  SVG inline dentro del `divIcon`: nítido en retina, cero bytes de asset y coloreable desde la
  paleta. Leaflet inyecta ese html como string, así que los colores van literales (espejan
  `theme/Theme.tsx`) y el `aria-label` tiene que viajar dentro del markup.
- **Fechas sin hora.** `heldOn` se guarda como fecha de calendario a medianoche UTC; formatearla
  con `toLocaleDateString` sin `timeZone: "UTC"` la corre un día para atrás para cualquiera al
  oeste de UTC — o sea, para todos acá. Se veía "13 de marzo" con el dato en 14.
- Leaflet suma ~150 KB al bundle single-file (1.40 MB → 1.55 MB).
