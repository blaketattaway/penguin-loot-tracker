# Gotchas de recharts + Mantine v7 (AppShell y colores de theme)

**Fecha:** 2026-07-04
**Proyecto:** penguin-loot-tracker

## Contexto

Durante un rediseño completo de diseño y usabilidad del frontend
(React 19 + Mantine v7 + recharts) aparecieron tres problemas que no dan
error de compilación ni de runtime, pero rompen la UI de forma silenciosa.
Todos costaron tiempo de diagnóstico porque "el código se ve correcto".

## Descubrimiento 1 — recharts NO resuelve `fill="var(--css-var)"` en las barras

Al pasar un color como CSS custom property al `fill` de un `<Bar>`, las barras
quedan **invisibles**, aunque no haya ningún error:

```tsx
// ❌ No se ven las barras: recharts pinta <rect fill="var(...)"> y el navegador
//    no resuelve la variable en ese atributo de presentación SVG.
<Bar dataKey="lootedCount" fill="var(--mantine-color-gold-6)" />
```

Lo confuso: en el MISMO chart, `var(...)` **sí** funciona para `stroke`
(líneas de `CartesianGrid`) y para `fill` de texto (ticks de ejes). Solo falla
en el `fill` de los `<rect>` de las barras.

**Solución:** resolver el color a un hex concreto en JS con `useMantineTheme()`:

```tsx
import { useMantineTheme } from "@mantine/core";

const theme = useMantineTheme();
// ...
<Bar
  dataKey="lootedCount"
  fill={theme.colors.gold[6]}          // "#ffb300", no var()
  activeBar={{ fill: theme.colors.gold[4] }}
/>
<CartesianGrid stroke={theme.colors.dark[4]} />
```

Regla práctica: en recharts, **cualquier color debe ser un valor concreto
resuelto en JS**, no una CSS variable. Aplica a `fill`, `stroke`, `cursor`, etc.

## Descubrimiento 2 — `AppShell.header.collapsed` es booleano (no objeto)

En Mantine v7, `navbar.collapsed` acepta un objeto `{ mobile, desktop }`,
pero `header.collapsed` acepta **solo un booleano**. Pasarle un objeto da
error de tipos (`TS2322: Type '{ desktop; mobile }' is not assignable to
type 'boolean | undefined'`).

Para un header que exista solo en móvil, se calcula el booleano con media query:

```tsx
import { useMediaQuery } from "@mantine/hooks";

const isDesktop = useMediaQuery("(min-width: 48em)", false, {
  getInitialValueInEffect: false, // evalúa sync en SPA client-only, evita flash
});

<AppShell header={{ height: 60, collapsed: isDesktop }} /* ... */ />
```

## Descubrimiento 3 — navbar `collapsed: { mobile: true }` sin Burger = móvil sin navegación

Un `AppShell` con `navbar={{ collapsed: { mobile: true } }}` **oculta la barra
en móvil pero no genera ningún control para reabrirla**. Si no se monta un
`Burger` + `AppShell.Header` + `useDisclosure`, en celular no hay forma de
navegar ni de hacer login (bug de usabilidad crítico, invisible en desktop).

Patrón mínimo correcto:

```tsx
const [opened, { toggle, close }] = useDisclosure(false);

<AppShell navbar={{ width: 288, breakpoint: "sm", collapsed: { mobile: !opened } }}>
  <AppShell.Header hiddenFrom="sm">
    <Burger opened={opened} onClick={toggle} />
  </AppShell.Header>
  <AppShell.Navbar>{/* pasar `close` al onClick de los links */}</AppShell.Navbar>
</AppShell>
```
Además conviene cerrar el navbar (`close`) al navegar, para que no quede
abierto tras cambiar de ruta en móvil.

## Aplicación

- Cualquier proyecto que combine **recharts con tokens de Mantine**: no pasar
  `var(--mantine-color-*)` a colores de gráficos; usar `useMantineTheme()`.
- Cualquier layout con **Mantine `AppShell`**: recordar que `header.collapsed`
  es booleano y que ocultar el navbar en móvil obliga a montar el Burger.
- Son bugs "silenciosos" (compilan y no lanzan excepción). Verificar siempre
  el resultado en el navegador real y en viewport móvil, no solo el build.

> **Nota para el equipo:** Los descubrimientos 2 y 3 (Mantine AppShell) son
> transversales a cualquier frontend con Mantine, no solo a este proyecto.
> Podrían ser útiles a nivel de ATLAS. Consultar con Jorge Bossa o Kevin Guerra.
