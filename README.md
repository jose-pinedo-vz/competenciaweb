# Ferretería y Tlapalería Los Arcos — Sitio web

Sitio estático de **Ferretería y Tlapalería Los Arcos**, negocio familiar fundado en 1984 en El Pitillal, Puerto Vallarta.

> *"Si no conoces los Arcos no conoces el Pitillal"*

## Stack

- HTML5 + JavaScript ES6+ con módulos nativos (`type="module"`)
- Tailwind CSS v4 por CDN (`@tailwindcss/browser`)
- FontAwesome 6.4 y Google Fonts (Plus Jakarta Sans)
- Sin frameworks ni herramientas de compilación

## Estructura

```
public/
├── index.html      # Estructura base, metaetiquetas SEO y tema de Tailwind (@theme)
├── css/styles.css  # Patrones, animaciones y ajustes de accesibilidad
├── js/data.js      # Toda la información del negocio (fuente única de verdad)
├── js/main.js      # Renderiza las secciones a partir de data.js y maneja la interacción
└── img/            # Imágenes y favicon
```

Para cambiar textos, teléfono, dirección o productos, edita únicamente `public/js/data.js`.

## Vistas y temas

- **Pestañas:** el sitio tiene tres vistas independientes (`#inicio`, `#productos`, `#contacto`). En escritorio aparecen como pestañas en el encabezado y en móvil como barra inferior. Cada vista tiene su propia URL, así que se puede compartir el enlace directo y usar el botón *Atrás* del navegador.
- **Paletas de color:** el botón con el ícono de paleta cambia entre *Confiabilidad Industrial*, *Tradición y Herramienta* y *Moderno y Dinámico*. Los colores viven en `paletas` dentro de `data.js`; cada clave se publica como variable CSS `--p-*` y Tailwind la expone como color semántico (`bg-primario`, `text-texto-suave`, `border-borde`…).
- **Modo claro / oscuro:** el botón de luna o sol alterna el modo. Si el visitante no ha elegido uno, se sigue la preferencia del sistema.
- La paleta y el modo se guardan en `localStorage` (`arcos-paleta`, `arcos-modo`). Para volver a los valores de fábrica, borra esas claves desde las herramientas de desarrollo.

## Probar en local

Los módulos de JavaScript **no funcionan abriendo `index.html` con doble clic** (`file://`): el navegador los bloquea por CORS. Usa siempre un servidor local.

**Opción 1 — Node.js:**

```bash
npx serve public
```

Abre la URL que aparece en la terminal (normalmente http://localhost:3000).

**Opción 2 — Python:**

```bash
python3 -m http.server 8000 --directory public
```

Abre http://localhost:8000.

**Opción 3 — VS Code:** instala la extensión **Live Server**, abre `public/index.html` y haz clic en *Go Live*.
