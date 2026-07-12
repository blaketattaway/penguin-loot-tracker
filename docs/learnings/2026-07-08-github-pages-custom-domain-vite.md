# Custom domain en GitHub Pages con Vite (los dos `base` y persistir el CNAME)

**Fecha:** 2026-07-08
**Proyecto:** penguin-loot-tracker

## Contexto

Se movió el frontend (React 19 + Vite, `viteSingleFile`, `HashRouter`, deploy con `gh-pages`) de la URL de proyecto `usuario.github.io/penguin-loot-tracker/` a un dominio propio `penguinloottracker.com`. Al servir desde la raíz de un dominio propio (en vez de un subpath), hubo que corregir todas las rutas base.

## Descubrimiento: hay DOS lugares con el base path, no uno

El subpath `/penguin-loot-tracker/` estaba fijado en **dos** sitios independientes:

1. `vite.config.ts` → `base: "/penguin-loot-tracker"` — el conocido.
2. `index.html` → `<base href="/penguin-loot-tracker/">` — **el gotcha oculto**. Es una etiqueta HTML `<base>` hardcodeada que NO la controla la config de Vite. Si solo cambias el `base` de Vite y dejas este, el navegador sigue resolviendo todo contra el subpath viejo → 404s.

Ambos deben ir a `/` para servir desde la raíz. Un `grep "penguin-loot-tracker/" dist/index.html` post-build debe dar **0** para confirmar que no quedó ninguno.

Nota: con `HashRouter` (rutas `#/...`) + `viteSingleFile` (todo inlineado en un `index.html`) el cambio es de bajo riesgo — no hay routing del lado servidor ni assets externos —, pero el `<base href>` igual rompe si se olvida.

## Descubrimiento: el CNAME hay que persistirlo en `public/`

`gh-pages` reescribe la branch `gh-pages` completa en cada `npm run deploy`, así que el archivo `CNAME` que GitHub necesita se **borra** en el siguiente deploy si solo se agregó por la UI. Solución: crear **`public/CNAME`** con una línea (`penguinloottracker.com`); Vite copia `public/` a `dist/` en cada build, así el CNAME viaja siempre y el dominio no "se cae".

## Descubrimiento: DNS del apex + "no seguro" es solo HTTP

En Porkbun (u otro registrar): borrar los registros de parking (ALIAS y wildcard CNAME) y agregar **4 registros A** del apex a las IPs de GitHub Pages (`185.199.108–111.153`) + un **CNAME `www`** → `usuario.github.io`. GitHub emite el cert de Let's Encrypt automáticamente cuando el DNS resuelve a sus IPs. El aviso **"no seguro"** justo tras el deploy suele significar solo que estás en la versión `http://`: el `https://` ya sirve con cert válido; marcar **Enforce HTTPS** en Settings → Pages fuerza el redirect.

## Aplicación

Para cualquier SPA de Vite deployada a GitHub Pages que migre de subpath a dominio propio: cambiar `base` en `vite.config.ts` **y** el `<base href>` en `index.html`, persistir el `CNAME` vía `public/`, y verificar con `grep` que el build no conserve el subpath viejo. El cert es automático; "no seguro" temprano casi siempre es solo HTTP, no un problema de certificado.
