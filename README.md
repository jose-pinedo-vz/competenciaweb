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
├── js/data.js       # Toda la información del negocio (fuente única de verdad)
├── js/main.js       # Renderiza las vistas a partir de data.js y maneja la interacción
├── js/catalogo.js   # Departamentos, subcategorías y productos (datos de demostración)
├── js/tienda.js     # Vista de catálogo (filtros, búsqueda, orden) y mega-menú
├── js/carrito.js    # Carrito con envío del pedido por WhatsApp
├── js/admin*.js     # Panel de administración (admin, admin-datos, admin-ui, admin-catalogo, admin-config)
├── js/horario.js    # Cálculo de "Abierto ahora / Cerrado" con la hora de Puerto Vallarta
├── js/valoracion.js # Tarjeta flotante de valoración con estrellas
├── js/almacen.js    # Acceso seguro a localStorage / sessionStorage
└── img/            # Imágenes y favicon
```

Para cambiar textos, teléfono, dirección o productos, edita únicamente `public/js/data.js`.

## Vistas y temas

- **Pestañas:** el sitio tiene tres vistas independientes (`#inicio`, `#productos`, `#contacto`). En escritorio aparecen como pestañas en el encabezado y en móvil como barra inferior. Cada vista tiene su propia URL, así que se puede compartir el enlace directo y usar el botón *Atrás* del navegador.
- **Paletas de color:** el botón con el ícono de paleta cambia entre *Corporativa Los Arcos* (predeterminada), *Confiabilidad Industrial*, *Tradición y Herramienta* y *Moderno y Dinámico*. Los colores viven en `paletas` dentro de `data.js`; cada clave se publica como variable CSS `--p-*` y Tailwind la expone como color semántico (`bg-primario`, `text-texto-suave`, `border-borde`…).
- **Modo claro / oscuro:** el botón de luna o sol alterna el modo. Si el visitante no ha elegido uno, se sigue la preferencia del sistema.
- La paleta y el modo se guardan en `localStorage` (`arcos-paleta`, `arcos-modo`). Para volver a los valores de fábrica, borra esas claves desde las herramientas de desarrollo.

## Catálogo y carrito

- **Estructura:** 7 departamentos (nivel 1) → subcategorías (nivel 2) → productos (nivel 3), definidos en `public/js/catalogo.js`. *Outlet y Ofertas* agrupa automáticamente los productos con `promo`.
- **Rutas:** `#productos`, `#productos/herramientas`, `#productos/herramientas/electricas`… Se pueden compartir y funcionan con *Atrás*.
- **Mega-menú (escritorio):** se abre al pasar el cursor sobre *Productos* o con la flecha junto a la pestaña; se cierra con Esc o al hacer clic fuera.
- **Filtros:** marca, rango de precio, solo disponibles, solo ofertas, búsqueda por nombre/marca/SKU y orden. En móvil se abren en un panel lateral con el botón *Filtros*.
- **Carrito:** se guarda en `localStorage` (`arcos-carrito`). Se puede cerrar el pedido de dos formas:
  - **WhatsApp:** envía la lista y el total; se paga en tienda o contra entrega.
  - **Tarjeta (modo demostración):** abre `public/js/pago.js` con entrega, datos de la tarjeta y resumen. **No se realiza ningún cargo.** Tarjeta de prueba aprobada: `4242 4242 4242 4242`; rechazada: `4000 0000 0000 0002` (cualquier fecha futura y CVV). Los pedidos simulados se guardan en `arcos-pedidos` solo con la marca y los últimos 4 dígitos. Para desactivarlo: `negocio.pago.habilitado = false` en `data.js`.
- ⚠ **Los productos, precios y existencias son de demostración** (`catalogoDemostracion = true` muestra un aviso en el catálogo). Sustitúyelos por el inventario real y pon `catalogoDemostracion` en `false`.
- **Imágenes:** agrega `imagen: 'img/productos/<archivo>'` a cada producto; mientras no exista, se muestra el ícono de la subcategoría.

## Panel de administración (`#admin`)

- **Cómo entrar:** abre `…/#admin` o el enlace discreto "Administración" del pie de página. La primera vez pide **crear un PIN** de 4 a 8 dígitos; se guarda como huella SHA-256 en este navegador, nunca en texto. La sesión se cierra tras 30 minutos sin actividad (se puede cambiar en Ajustes).
- **Secciones:**
  - **Dashboard:** resumen.
  - **Catálogo:** CRUD de productos, departamentos y subcategorías, con validación de imágenes.
  - **Configuración:** negocio, contacto, horario, marcas, pago, valoración y WhatsApp.
  - **Pedidos:** pagos demo de este navegador.
  - **Ajustes:** campos omitidos, límites, imágenes, paginación, sesión, PIN y respaldo.
- **Dónde se guardan los cambios:** en `localStorage` de **ese navegador** (`arcos-admin-datos`, `arcos-admin-config`). Al volver al sitio, la página se recarga y muestra los cambios.
- **Publicar los cambios para todos:**
  1. Ve a Ajustes › Datos y pulsa *Exportar configuración*.
  2. Guarda el archivo como `public/datos/arcos-admin.json`.
  3. En `data.js` escribe `admin.datosPublicados: 'datos/arcos-admin.json'`.
  4. Publica el sitio.
- **PIN fijo para todo el equipo:** pon la huella en `admin.pinHash` (`data.js`). Para calcularla, en la consola del navegador:
  `crypto.subtle.digest('SHA-256', new TextEncoder().encode('arcos-admin:TU_PIN')).then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')))`
- **Para desactivar el panel:** `admin.habilitado = false`.
- ⚠ Es una protección del lado del cliente, suficiente para una demostración pero **no es seguridad real**. Para producción hace falta un backend con autenticación.

## Horario y valoración

- **Horario:** se edita en `negocio.horario` (`data.js`). El estado *Abierto ahora / Cierra pronto / Cerrado* se calcula con la zona horaria `America/Mexico_City` (la de Puerto Vallarta), así que es correcto aunque el visitante esté en otro país. Se actualiza cada minuto.
- **Valoración:** la tarjeta aparece a los 4 s (`negocio.valoracion.retrasoMs`). Si se cierra con la X, no vuelve a salir durante esa visita (`sessionStorage`). Una vez calificado, no vuelve a salir en ese navegador (`localStorage` → `arcos-valoracion`). Para verla de nuevo, borra esas claves.
- La calificación **no se envía a ningún servidor** (el sitio es estático). El agradecimiento ofrece mandarla al negocio por WhatsApp.

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
