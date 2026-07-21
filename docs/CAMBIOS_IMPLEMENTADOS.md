# Cambios implementados — La Providencia

Fecha de consolidación: 20 de julio de 2026

## Alcance

Este documento registra los cambios realizados en los dos proyectos que forman
la experiencia digital de La Providencia:

- `pagina_web_reediseño`: página institucional de La Providencia I y II.
- `sistema_pedidos`: tienda en línea de La Providencia I.

El objetivo general fue que ambos sitios se percibieran como partes de una
misma marca, optimizar los recursos visuales y dejar preparada la tienda para
recibir fotografías de producto sin tener que modificar las plantillas.

## 1. Página institucional

### Video principal del hero

Se sustituyó el video anterior del hero por:

- `public/video/video_principal.mp4`
- `public/img/video_principal_poster.webp`

También se actualizó el preload y el fondo de respaldo del hero.

**Por qué:** el poster evita que se vea un espacio vacío mientras carga el
video y conserva una primera impresión nítida. El formato optimizado reduce el
peso y mantiene una calidad adecuada para pantalla completa.

### Logo conjunto en el encabezado

El encabezado ahora utiliza:

- `public/img/logo_conjunto.webp`

Se añadieron dimensiones y estilos específicos para escritorio y móvil.

**Por qué:** comunica desde el primer momento que la página representa a las
dos sucursales y evita deformaciones o saltos de diseño durante la carga.

### Identidad de La Providencia I y II

Los logotipos individuales se incorporaron a la sección “Las dos casas”:

- `public/img/logo_laprovi1_nav.webp`
- `public/img/logo_laprovi2_nav.webp`

**Por qué:** cada sucursal conserva personalidad propia sin romper la identidad
general. Los números I y II siguen funcionando como elemento editorial.

### Imagen del llamado final

El fondo de “¿Listo para tu pedido?” se reemplazó por:

- `public/img/carnicero_fileteando.webp`

**Por qué:** muestra el oficio y el producto real, refuerza la confianza y
conecta mejor el llamado a comprar con la experiencia de carnicería.

### Ajuste responsive del mostrador

Se corrigió la posición del gráfico de cortes en anchos intermedios de
escritorio.

**Por qué:** el texto “Precios por kilo actualizados…” podía cruzarse con los
subtítulos ubicados bajo el SVG al reducir parcialmente la ventana.

### Etiquetas del gráfico

Las etiquetas se simplificaron a:

- Embutidos
- Vísceras
- Abarrotes
- Frutas y Verduras

**Por qué:** los nombres breves son más fáciles de escanear y reducen el riesgo
de colisiones dentro de la ilustración animada.

## 2. Tienda en línea de La Providencia I

### Identidad visual compartida

Se trasladaron a la tienda los principales elementos del lenguaje de marca:

- Fondo carbón, superficies cálidas, rojo carne, oxblood, hueso y dorado.
- Anton para títulos de impacto.
- Instrument Serif para énfasis editorial.
- Space Grotesk para navegación, precios y contenido.
- Logo oficial de La Providencia I.

Las fuentes se sirven localmente desde `static/fonts/`.

**Por qué:** el cliente debe sentir que pasó de la página institucional a la
tienda oficial, no a un sitio ajeno. Servir las fuentes localmente evita
dependencias de Google Fonts y mejora privacidad, estabilidad y velocidad.

### Encabezado y pie

Se rediseñaron el encabezado y el footer para usar el logo correcto, una
jerarquía más clara y accesos prioritarios al carrito y WhatsApp.

En móvil, el carrito tiene prioridad dentro del encabezado.

**Por qué:** la navegación de compra debe ser directa y mantener visible la
acción principal sin saturar una pantalla pequeña.

### Inicio, catálogo y estados de compra

Se unificó el acabado visual de:

- Portada de la tienda.
- Catálogo.
- Checkout.
- Seguimiento.
- Estado “próximamente”.
- Carrito y modales.

Los emojis estructurales se sustituyeron por SVG consistentes.

**Por qué:** los SVG mantienen el mismo trazo en todos los dispositivos y se
ven nítidos a cualquier resolución.

### Fotografías preparadas para carga posterior

Todos los productos apuntan a imágenes WebP mediante
`pedidos/imagenes.py`. Cuando una foto todavía no existe, la tarjeta muestra
un placeholder de marca con “Foto próximamente”; al cargar el archivo correcto,
el placeholder desaparece automáticamente.

La guía y los nombres exactos están en:

- `static/productos/README.md`

**Por qué:** se puede publicar la tienda antes de realizar la sesión
fotográfica y después incorporar las imágenes sin editar HTML, CSS o
JavaScript. WebP reduce peso manteniendo buena calidad.

### Animaciones locales

Se eliminó la dependencia externa de AOS y se implementaron revelados locales
con `IntersectionObserver`.

**Por qué:** reduce solicitudes externas, evita que el contenido quede oculto
si falla una CDN y permite respetar `prefers-reduced-motion`.

### Entrada del catálogo en cada recarga

Las tarjetas del catálogo ahora entran con una animación escalonada:

- Duración: 300 ms.
- Diferencia entre tarjetas: 35 ms.
- Propiedades animadas: opacidad y transformación.
- Retraso máximo: 175 ms.

**Por qué:** crea una entrada limpia y suave sin bloquear clics ni producir
reacomodos de contenido.

### Dos columnas de productos en móvil

Por debajo de 780 px el catálogo utiliza:

```css
grid-template-columns: repeat(2, minmax(0, 1fr));
```

También se adaptaron las etiquetas, nombres, precios y botones. Los botones
móviles conservan una altura táctil de 44 px.

**Por qué:** muestra más productos por pantalla sin obligar a desplazarse tanto.
`minmax(0, 1fr)` impide que el contenido fuerce una columna más ancha que el
viewport.

## 3. Accesibilidad y rendimiento

Se aplicaron estas reglas en ambos proyectos:

- Imágenes con dimensiones reservadas para reducir saltos de layout.
- Carga diferida en recursos bajo el primer viewport.
- Formato WebP para imágenes optimizadas.
- `font-display: swap` para las fuentes locales.
- Foco visible para navegación con teclado.
- Enlace para saltar al contenido.
- Objetivos táctiles de al menos 44 px en controles móviles principales.
- Animaciones basadas en `transform` y `opacity`.
- Desactivación o simplificación con `prefers-reduced-motion`.
- Iconos SVG en lugar de emojis estructurales.

## 4. Cómo subir las fotografías de producto

1. Editar y exportar cada fotografía en WebP.
2. Usar un encuadre cuadrado de al menos 900 × 900 px.
3. Procurar un peso menor de 180 KB.
4. Guardarla en `sistema_pedidos/static/productos/`.
5. Utilizar exactamente el nombre indicado en
   `sistema_pedidos/static/productos/README.md`.

No es necesario modificar código si el producto ya aparece en esa lista.

Los originales sin optimizar deben conservarse en:

- `sistema_pedidos/assets-source/productos/`
- `pagina_web_reediseño/assets-source/`

## 5. Organización de archivos

### Página institucional

```text
pagina_web_reediseño/
├── assets-source/       originales de imágenes
├── docs/                planes y registro de cambios
├── public/              recursos optimizados publicados
├── src/data/            datos fuente del catálogo
├── src/js/              comportamiento
├── src/styles/          estilos
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

### Tienda

```text
sistema_pedidos/
├── assets-source/       fotografías originales sin optimizar
├── data/                CSV de referencia
├── docs/                documentación y guías
├── pedidos/             aplicación de pedidos
├── static/              CSS, JS, fuentes e imágenes publicadas
├── templates/           plantillas Django
├── tienda/              aplicación pública
├── manage.py
├── requirements.txt
└── archivos de despliegue requeridos en raíz
```

`manage.py`, `package.json`, `.env`, `requirements.txt`,
`gunicorn_config.py`, `sistema-pedidos.service` y la plantilla de
Cloudflared permanecen en sus raíces porque las herramientas o las
instrucciones de despliegue dependen de esas ubicaciones.

## 6. Validaciones realizadas

- Compilación de producción de la página institucional.
- Revisión responsive de escritorio y móvil.
- `python manage.py check` sin errores.
- Compilación de las plantillas públicas de Django.
- Validación sintáctica del JavaScript.
- Localización correcta de CSS, fuentes, logo e imágenes mediante Django.
- `git diff --check` sin errores de espacios.
- Revisión del catálogo con dos columnas y sin desbordamiento horizontal.

## 7. Archivos principales modificados

### Página institucional

- `index.html`
- `src/js/main.js`
- `src/styles/main.css`
- `public/video/video_principal.mp4`
- `public/img/video_principal_poster.webp`
- `public/img/logo_conjunto.webp`
- `public/img/carnicero_fileteando.webp`

### Tienda

- `templates/tienda/base.html`
- `templates/tienda/ordena.html`
- `templates/tienda/catalogo.html`
- `templates/tienda/checkout.html`
- `templates/tienda/seguimiento.html`
- `templates/tienda/proximamente.html`
- `templates/tienda/_pie.html`
- `static/css/fuentes.css`
- `static/css/animaciones.css`
- `static/css/catalogo.css`
- `static/js/animaciones.js`
- `pedidos/imagenes.py`
