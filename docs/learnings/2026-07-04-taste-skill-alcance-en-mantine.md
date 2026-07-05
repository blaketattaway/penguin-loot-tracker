# Aplicar skills de diseño (taste-skill) sobre penguin-loot-tracker sin romper el design system

**Fecha:** 2026-07-04
**Proyecto:** penguin-loot-tracker

## Contexto

Se pidió "usar la taste-skill" (`design-taste-frontend`, una de las skills locales en
`.claude/skills/`) para mejorar el frontend. penguin-loot-tracker es una SPA React 19 +
**Mantine v7** + Bootstrap + Recharts sobre Vite, con `AppShell`, tablas de loot, estadísticas
y un asignador de loot.

## Descubrimiento

**1. La taste-skill está explícitamente fuera de alcance para este tipo de app.**
Su Sección 13 ("Out of scope") excluye *dashboards / dense product UI / admin panels*, *data
tables* y *multi-step forms*. Eso es justo lo que es el core de esta app. Aplicarla a las tablas,
Statistics o el Loot Assigner es forzarla.

**2. Su stack por defecto choca con el del proyecto.**
La skill asume **Tailwind v4 + Motion (framer) + shadcn/Next RSC**. El proyecto usa **Mantine v7 +
Bootstrap**. La propia regla de la skill "un sistema por proyecto" obliga a NO introducir
Tailwind/shadcn/Motion aquí. Todo debe construirse en Mantine, extrayendo los tokens del tema
existente (`src/theme/Theme.tsx`) y reutilizando las primitivas de `src/theme/global.css`
(`.plt-enter`, `.plt-stagger`, `.plt-card-hover`, easings propios, manejo de `prefers-reduced-motion`).

**3. Dónde SÍ aplica en esta app.**
Solo las superficies tipo landing / gate:
- Pantalla de acceso (`features/app/LoginModal`) — momento único con marca.
- Landing / about (`features/app/Welcome`) — página de presentación.
- Empty / error / loading states.
El resto (tablas, stats, assigner) se pule con la skill `impeccable` o con patrones Mantine, no con
la taste-skill.

**4. La app no era "AI-slop": ya tenía criterio aplicado.**
El tema define una paleta pensada (loot-gold + charcoal "night" + "arcane" púrpura mapeada a rarezas
de WoW), con notas de contraste WCAG AA, curvas de easing propias, dark mode bloqueado y
reduced-motion. Muchas reglas de la skill ya estaban cumplidas vía Mantine.

## Aplicación

Cuando se invoque la taste-skill (o cualquier skill de diseño cuyo stack por defecto sea
Tailwind/shadcn) sobre esta u otra app con un design system ya establecido:

1. **Audita primero** (modo redesign-preserve): extrae tokens de marca del tema y no los sobreescribas.
2. **Quédate en el design system del proyecto** (aquí Mantine). No mezcles sistemas.
3. **Limita el trabajo a superficies dentro del alcance real** (landing, login, empty states); deriva
   el product UI a `impeccable` o a patrones nativos del framework.
4. **Engancha rutas nuevas de forma aditiva**: nueva `Route` + `NavLink`, sin cambiar el destino por
   defecto (`*` → `/statistics`) ni tocar las vistas existentes.
5. Del Pre-Flight de la skill, lo que sí aplica siempre: cero em-dashes en texto visible, un solo
   acento, radios consistentes, hero que cabe en viewport, sin CTAs de intención duplicada, y no
   inventar datos falsos (nº de miembros, servidor, facción).

> **Nota para el equipo:** La lección central ("no mezclar el stack por defecto de una skill de
> diseño con el design system ya existente del proyecto; quedarse en el del proyecto") es transversal
> a cualquier repo que combine skills de diseño con un DS propio. Podría ser útil a nivel de ATLAS.
> Consultar con Jorge Bossa o Kevin Guerra para evaluar su inclusión.
