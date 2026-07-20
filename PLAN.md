# Rediseño total — La Providencia (one-page animada con GSAP)

> Prompt/plan completo usado para generar este proyecto (enviado a Ultraplan). Se conserva aquí como referencia de las decisiones de diseño, contenido y stack técnico.

## Contexto

El sitio actual (`C:\Users\PC\Documents\sitio-web-la-providencia`) es una one-page clásica en crema/oxblood con switcher de dos tiendas. El usuario quiere un **rediseño totalmente diferente**, cargado de animación de todo tipo (scroll, SVG, UI, texto), exprimiendo GSAP. Se reutiliza **solo el contenido**: textos, imágenes, videos y datos. El proyecto nuevo se construye desde cero en `C:\Users\PC\Documents\pagina_web_reediseño` (carpeta vacía).

**Decisiones aprobadas por el usuario:**
- Dirección visual: **"Carnicería nocturna"** — dark premium estilo awwwards (fondo carbón, rojo carne encendido, dorado, tipografía display gigante, grano/papel estraza).
- Estructura: **one-page narrativa** (una sola historia de scroll, ambas sucursales como secciones — sin switcher).

## Inventario de contenido a reutilizar (extraído del sitio viejo)

**Marca y datos** (de `index.html` viejo):
- La Providencia I — solo carne, dentro del Mercado Santa Cruz, Av. Felipe Villanueva 339, Tecámac Centro, 55740.
- La Providencia II — carne + abarrotes + frutas y verduras + semillas + chiles secos, Centenario Manzana 012, Santa María Ajoloapan, 55750.
- WhatsApp +52 55 4575 1281 · Lun–Dom 7:00–18:00 · tienda online `/ordena/` · laprovi.reportes@gmail.com.
- Copys clave: "Cortes exactos, carne sin rodeos", "Carne y mandado, todo en una vuelta", "Entras por carne, sales con el corte exacto", "Una parada para resolver comida y mandado", frases del ticker, los 4 pasos de pedido, "Dos formas de pedir" (WhatsApp vs Tienda en Línea), 3 reseñas 5★ (Luis Manuel López, Marcelino Q., Elizabeth G.).
- Listas de cortes por categoría (atributos `data-cuts`): Res (12), Cerdo (11), Embutidos (6), Vísceras (6) + **precios reales** en `carniceriasubcategoria.csv` (48 productos con precio/kg).
- SEO: title, meta description, OG y JSON-LD `ButcherShop` ×2 — se conservan adaptados.

**Assets a copiar** (de `img/` viejo → `public/` nuevo):
- Logos nav (`logo_laprovi1_nav.webp`, `logo_laprovi2_nav.webp`), favicon.
- Fotos categorías: `res_lp1/cerdo_lp1/emb_lp1/visceras/res/puerco/embutidos/abarrotes/verdura.webp`.
- Galería LP1: `img_laprovi1/*.webp` (7 fotos + thumb video) · Galería LP2: `img_laprovi2/*.webp`.
- Videos: `video/hero_laprovi1(.mp4/_movil)`, `hero_laprovi2(...)`, `galeria_laprovi1.mp4`, poster `hero_laprovi1_poster.webp`, `local.jpg`.

> Estado: estos assets ya están copiados y commiteados en este repo (`public/img/**`, `public/video/**` y `carniceriasubcategoria.csv` en la raíz — commit `c428104`).

## Dirección de diseño

**Paleta (tokens CSS, contraste AA verificado sobre fondo oscuro):**
- `--smoke #0F0D0C` (fondo) · `--char #1A1614` (superficies) · `--bone #F5ECE0` (texto — hilo de continuidad con la marca)
- `--blood #E63B2E` (acento vivo) · `--oxblood #6E1620` (profundo) · `--gold #D9A441` (detalle)
- `--sage #7BA05B` (identidad LP II / mercado) · `--wa #25D366` (CTA WhatsApp)

**Tipografía** (self-hosted vía @fontsource, `font-display: swap`):
- Display: **Anton** — condensada ultra-bold en mayúsculas, vibra de cartel de carnicería, para headlines gigantes.
- Énfasis editorial: **Instrument Serif** *italic* para palabras destacadas dentro de los headlines.
- Body/UI: **Space Grotesk** (números tabulares para precios).

**Texturas y detalles:** grano de película como **overlay estático** (PNG/CSS — el agente confirmó que `feTurbulence` animada y filtros SVG grandes destruyen el rendimiento; solo se permite gooey en elementos pequeños como el cursor), etiquetas de precio estilo papel estraza con borde punteado, numeración grande estilo "01/02", iconos Lucide (stroke 2px consistente).

## Arquitectura de la página (secciones + animaciones)

0. **Preloader** — contador 0→100%, logo, cortina clip-path que se abre; solo primera visita (sessionStorage).
1. **Header fijo** — se oculta al bajar / reaparece al subir (ScrollTrigger); menú móvil fullscreen con stagger; CTAs WhatsApp + Ordenar.
2. **Hero cine** — video de fondo con reveal de máscara (clip-path + scale), headline gigante con SplitText (chars), lead por líneas enmascaradas, botones magnéticos, indicador de scroll animado; parallax del video con scrub al scrollear.
3. **Ticker marquee** — frases del sitio viejo en loop infinito (`horizontalLoop` helper), velocidad y skew reactivos a la velocidad de scroll.
4. **Manifiesto** — "Entras por carne, sales con el corte exacto." en texto gigante, revelado palabra-por-palabra con scrub (opacidad progresiva tipo lectura).
5. **Las dos casas** — sección pinned split-screen LP I (rojo) ↔ LP II (verde): al scrollear la pantalla se desliza de una casa a la otra; contadores animados; tags de categorías con stagger.
6. **Los cortes** — sección pinned con **scroll horizontal** de paneles (Res, Cerdo, Embutidos, Vísceras + "Solo en tienda": Despensa y Fruta/Verdura); tarjetas con parallax interno de imagen y hover tilt; **SVG de despiece** (diagrama de vaca con líneas de corte) dibujado con DrawSVG y **morph a cerdo** (MorphSVG) según panel activo; clic abre modal con lista de cortes y **precios del CSV** con contador animado.
7. **Cómo pedir** — timeline pinned de 4 pasos: número gigante que cambia, línea SVG de progreso dibujándose; después "Dos formas de pedir" (cards WhatsApp vs Tienda en Línea).
8. **Galería** — grid editorial mixto (LP1 + LP2) con reveals `ScrollTrigger.batch`, parallax por profundidad, lightbox con transición Flip, soporte de videos.
9. **Ubicaciones** — dos cards con mapa embebido lazy, horario, link Google Maps; pin SVG line-draw al entrar.
10. **Reseñas** — marquee de cards con estrellas que se dibujan (DrawSVG) + stagger.
11. **CTA final** — "¿Listo para tu pedido?" gigante con SplitText + botones magnéticos grandes, fondo grain.
12. **Footer** — logotipo gigante en outline (text-stroke) que se rellena, datos, créditos.

**Transversales:** cursor personalizado (solo `pointer: fine`) con `gsap.quickTo` y estados contextuales (ver/arrastrar/play); botón WhatsApp flotante en móvil; transiciones de color de fondo entre secciones (ScrollTrigger).

## Stack técnico (verificado por el agente de investigación — julio 2026)

- **Vite + vanilla JS + CSS moderno** (custom properties, nesting). Sin framework de UI: página estática donde GSAP domina; evita peso e hidratación innecesarios.
- **`gsap@3.15.0`** (npm público; el registro privado de GreenSock está deprecado). Licencia verificada: **100 % gratuito incluidos los plugins ex-premium** desde 3.13 (adquisición Webflow). Plugins a registrar explícitamente (evita tree-shaking en Vite): **ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, Observer**.
- **`lenis@1.3.25`** para smooth scroll (el paquete `@studio-freight/lenis` está deprecado). Elegido sobre ScrollSmoother: scroll nativo interpolado (mantiene sticky, anclas y a11y), ~4 kB, sin estructura DOM impuesta. Integración canónica: `anchors: true`, `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t*1000))` + `lagSmoothing(0)`; **no** requiere `scrollerProxy`.
- **SplitText** (reescrito en 3.13) en vez de SplitType (abandonado desde 2023): `mask: "lines"` nativo, `autoSplit: true` (re-split al cargar fuentes/resize, devolviendo el tween en `onSplit`), accesibilidad integrada (aria-label/aria-hidden automáticos).
- **DrawSVG** para line-drawing (no `stroke-dashoffset` manual) y **MorphSVG** con opción `smooth` (3.14) para el morph res↔cerdo. Flubber descartado (sin mantenimiento desde 2018).
- **Ninguna librería adicional** (three.js, Motion, anime.js, barba — descartadas por el agente: no aportan sobre este stack). CSS scroll-driven animations solo como progressive enhancement puntual bajo `@supports`.
- Datos de cortes/precios: `src/data/cortes.js` generado desde `carniceriasubcategoria.csv`.

**Patrones canónicos a usar (traídos verificados de docs oficiales por el agente):**
- `gsap.matchMedia()` con condiciones `isDesktop / isMobile / reduceMotion` como orquestador único de responsive + accesibilidad (revert automático de tweens/ScrollTriggers al cambiar de condición).
- Scrub numérico (`scrub: 1`) + `pin` + `anticipatePin: 1`; `invalidateOnRefresh: true` y `end` dinámico en el scroll horizontal; `snap: 1/(n-1)` entre paneles.
- `ScrollTrigger.batch()` con `once: true` para reveals de grids.
- Cursor y magnetismo con `gsap.quickTo` (un solo tween reutilizado, nunca tweens dentro de `mousemove`); retorno elástico `elastic.out(1, 0.3)` al soltar el botón magnético.
- Marquee con el **helper oficial `horizontalLoop`** (copiado completo de gsap.com a `src/js/utils/horizontalLoop.js`); dirección/velocidad reactivas vía `lenis.on('scroll', e => gsap.to(loop, { timeScale: … }))`.
- Contadores con objeto proxy + `snap: { val: 1 }` + `toLocaleString("es-MX")` (formato de precios).
- Preloader ligado a carga real: `Promise.all([document.fonts.ready, videoListo])` antes de soltar la cortina.
- Splits de texto: `autoSplit: true` o esperar `document.fonts.ready` (fuentes self-hosted → evitar líneas mal partidas por FOUT).

**Estructura de archivos:**
```
pagina_web_reediseño/
  index.html                  # HTML semántico completo (todo el contenido)
  package.json  vite.config.js
  public/img/ …  public/video/ …   # assets copiados del sitio viejo
  src/styles/   tokens.css, base.css, sections/*.css, components/*.css
  src/js/main.js              # registro de plugins, orquestación
  src/js/core/    smooth-scroll.js, preloader.js, cursor.js, nav.js, theme-scroll.js
  src/js/sections/ hero.js, marquee.js, manifesto.js, casas.js, cortes.js,
                   pasos.js, galeria.js, ubicaciones.js, resenas.js, cta.js, footer.js
  src/js/utils/   horizontalLoop.js, magnetic.js, counter.js, split-reveal.js
  src/data/cortes.js
```

## Accesibilidad y rendimiento (reglas de la skill ui-ux-pro-max)

- `prefers-reduced-motion`: **gsap.matchMedia** (condición `reduceMotion`) — variante sin motion: estados finales directos, sin pins ni scroll horizontal, no se instancia Lenis, el video del hero se sustituye por su poster, sin marquee ni cursor custom.
- Animar solo `transform`/`opacity`; `will-change` puntual; duraciones 150–400 ms en micro-interacciones, easing out al entrar.
- Videos lazy (`preload="metadata"/"none"`, fuente móvil separada); imágenes con `width/height` (CLS < 0.1); `loading="lazy"` bajo el fold.
- Fuentes self-hosted con `font-display: swap`; skip-link; focus visible; contraste AA en dark; touch targets ≥ 44 px; `aria-hidden` en duplicados de marquee; teclado completo en lightbox/modal (Esc, flechas, focus trap).
- Móvil (matchMedia): el scroll horizontal de cortes cae a carrusel nativo con scroll-snap; pins pesados desactivados en pantallas pequeñas.

## Verificación

1. `npm run dev` → revisión visual completa en navegador (desktop + 375 px).
2. Probar `prefers-reduced-motion` activado (DevTools) — la página debe ser 100 % usable.
3. Teclado: tab por toda la página, lightbox y modal de cortes.
4. `npm run build && npm run preview` — build limpio, Lighthouse (Performance/A11y/SEO).

## Pasos de implementación

1. **Scaffold**: Vite vanilla, instalar GSAP + Lenis + @fontsource, generar `cortes.js` desde el CSV. *(Los assets ya están copiados y commiteados: `public/img/**`, `public/video/**` y `carniceriasubcategoria.csv` en la raíz — commit `c428104`.)*
2. **HTML completo**: todo el contenido semántico (SEO/OG/JSON-LD incluidos) — la página debe leerse bien sin JS.
3. **CSS**: tokens, base, layout de las 12 secciones en estado estático final.
4. **Core JS**: setup GSAP/plugins, Lenis, preloader, nav, cursor, cambios de tema por sección.
5. **Animaciones por sección** en orden de scroll (hero → footer), incluidos SVGs custom (despiece res/cerdo, línea de pasos, estrellas) con DrawSVG/MorphSVG.
6. **Reduced-motion + responsive** con gsap.matchMedia.
7. **Pulido y verificación** (sección Verificación).

## Notas de implementación adicionales (del informe de investigación)

- Video hero: `preload="metadata"`, poster con `fetchpriority="high"`, fuente móvil separada, pausar/reanudar con IntersectionObserver al salir/entrar del viewport.
- `content-visibility: auto` **solo** en footer/secciones sin ScrollTriggers (descuadra los cálculos de start/end); para el resto, `loading="lazy"` + `decoding="async"`.
- `will-change: transform` solo en elementos con animación sostenida (cursor, parallax, paneles horizontales) — nunca global.
- `autoAlpha` en vez de `opacity` para elementos que aparecen/desaparecen (gestiona `visibility` y evita capturar eventos).
