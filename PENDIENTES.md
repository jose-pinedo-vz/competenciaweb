# Pendientes

Elementos opcionales para futuras versiones del sitio.

## Contenido

- [ ] Misión y visión formales de la empresa.
- [ ] **Coordenadas exactas del local** en `negocio.contacto.coordenadas` (y `verificadas: true`) para mostrar el marcador en el mapa. OpenStreetMap no ubica el número 148 de Vicente Guerrero en El Pitillal Centro.
- [ ] Confirmar qué número es fijo y cuál es WhatsApp: el sitio muestra el 322 224 5833 para llamadas y el +52 1 33 3010 5206 para WhatsApp.
- [ ] Horarios en días festivos.
- [ ] Fotografías reales de la fachada, el mostrador y la familia Navarro (guardar en `public/img/`).
- [ ] Elegir la paleta definitiva (o conservar el selector) y fijarla como predeterminada en `data.js`.
- [ ] Unificar el eslogan: el logotipo dice *"El que no conoce los Arcos no conoce el Pitillal"* y el sitio usa *"Si no conoces los Arcos no conoces el Pitillal"*.
- [ ] Versión del logotipo en SVG o PNG con fondo transparente (el JPEG actual tiene fondo blanco y se muestra sobre una placa blanca).
- [ ] Favicon a partir del logotipo oficial.
- [ ] Mes de fundación, para calcular los años exactos de trayectoria en lugar de "más de 40".
- [ ] Imagen para redes sociales en 1200×630 px (hoy `og:image` usa el logotipo).
- [ ] **Sustituir el catálogo de demostración** (`public/js/catalogo.js`) por el inventario real: productos, SKU, precios con IVA y existencias. Después, `catalogoDemostracion = false`.
- [ ] Fotografías del resto de los productos (en `public/img_productos/`, como los 6 reales ya cargados) y campo `imagen` en cada uno.
- [ ] Renombrar `img_productos/Sin título.jpg` a un nombre sin espacios ni acentos (p. ej. `llave-monomando-glm300.jpg`). Hoy funciona porque la ruta se codifica con `encodeURI`, pero un nombre limpio es más seguro al publicar.
- [ ] Contraste de la paleta corporativa: el texto blanco sobre el rojo #E63946 (4.2:1) y, en modo oscuro, sobre #3B82F6 (3.7:1) y #EF4444 (3.8:1) queda por debajo de AA (4.5:1). Alternativas cercanas que sí cumplen: #D62839, #2563EB y #DC2626.
- [ ] Confirmar con el negocio si es **distribuidor autorizado** de Coflex, Fleximatic o Presto, o si cuenta con alguna certificación o política de garantía. Hasta entonces el sitio dice "Marcas que manejamos" y "Tradición familiar", sin prometer certificación ni garantía.
- [ ] Nombres de las marcas de impermeabilizantes, pintura y material eléctrico que se manejan realmente, para mostrarlas en la franja de marcas (hoy aparecen como "Línea · Marcas líderes del mercado").
- [ ] Testimonios de clientes y anécdotas de los más de 40 años de historia.
- [ ] Formas de pago aceptadas y si hay servicio a domicilio.

## Técnico

- [ ] Dominio propio y hosting (GitHub Pages, Netlify o Vercel).
- [ ] Datos estructurados `LocalBusiness` (JSON-LD) para SEO local.
- [ ] Perfil de Google Business vinculado al sitio.
- [ ] Generar el CSS de Tailwind con el CLI para producción (el CDN se recomienda solo para desarrollo).
- [ ] `robots.txt`, `sitemap.xml` y URL canónica.
- [ ] Aviso de privacidad.
- [ ] Inventario en línea (hoja de cálculo o API) para que existencias y precios se actualicen sin editar código.
- [ ] **Pago con tarjeta real:** hoy `negocio.pago.procesador = 'demo'` solo simula el cobro. Para cobrar de verdad:
  1. Crear una cuenta en un procesador (Stripe, Mercado Pago o Clip).
  2. Usar su SDK o formulario oficial, que captura la tarjeta en sus servidores; nunca enviar el número de tarjeta a un servidor propio.
  3. Montar un backend mínimo (función serverless) que cree el cobro con la clave secreta.
  4. Publicar con HTTPS.
  Mientras siga en demo, se puede ocultar con `pago.habilitado = false`.
- [ ] Confirmar con el negocio si hay **envío a domicilio** y sus costos reales. Los valores actuales de `negocio.pago.envio` (zonas, $100/$200, gratis desde $1,000) vienen del prompt de pago y son de ejemplo.
- [ ] Guardar las valoraciones en un servicio real (formulario, Google Business o Facebook) en lugar de solo en el navegador.

---

## Registro de cambios para el Agente Auditor

### 2026-10-29 — Logotipo premium, franja de marcas y líneas principales del catálogo

**Cambios**

1. **Logotipo (encabezado y portada).**
   - Encabezado: el logo va sobre una placa blanca con un aro del color primario de la paleta activa. En pantallas `xl` o más anchas lo acompaña el texto "Desde 1984 · El Pitillal".
   - Portada: el logo es una tarjeta con aro primario, una etiqueta "Tradición familiar", el pie "Negocio local · Familia Navarro" y un sello circular "Desde 1984 · +40 años". Al pasar el cursor, un destello recorre la tarjeta y el sello flota levemente; ambas animaciones se desactivan con movimiento reducido.
   - No se usan "Certificado" ni "Garantía" porque no hay certificación ni garantía que lo respalde (ver Contenido).
2. **Franja de marcas** (portada, debajo del hero).
   - Tarjetas de Coflex, Fleximatic y Presto (etiqueta "Marca") y de impermeabilizantes, pintura y material eléctrico (etiqueta "Línea").
   - Cada tarjeta lleva al filtro correspondiente del catálogo. En móvil la franja se desliza de lado; en escritorio es una cuadrícula de 6 columnas.
3. **Catálogo.**
   - 27 productos nuevos (86 en total, todos de demostración) en las 4 líneas principales: plomería (Coflex y Fleximatic), adhesivos y químicos (Presto), impermeabilizantes y tlapalería general.
   - "Pintura e impermeabilizantes" se separó en dos subcategorías.
   - **Líneas principales** como filtros rápidos en la parte superior del catálogo (`#productos/linea/<id>`). Pulsar la línea activa regresa al catálogo completo.
   - En móvil, la lista de departamentos pasó al panel "Departamentos y filtros", para no apilar tres filas de botones.
   - Cada tarjeta de producto muestra una insignia de marca; Coflex, Fleximatic y Presto se resaltan con una estrella.
   - "Cotizar por WhatsApp" manda: *"Hola Ferretería Los Arcos, me interesa cotizar: [producto] (marca [marca], SKU [sku])."*
4. **Textos.** El texto sobre el titular de la portada ahora dice "Ferretería y tlapalería · El Pitillal", para no repetir "1984" cuatro veces en la misma pantalla.

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/data.js` | Nuevo bloque `negocio.marcas` (`destacadas` y `lineas`) para la franja de marcas. |
| `public/js/catalogo.js` | 27 productos nuevos, subcategoría `impermeabilizantes`, `lineas`, `lineaPorId()` y `productosDeLinea()`. Los productos están aquí, no en `data.js`, porque desde la versión anterior el catálogo tiene su propio módulo. |
| `public/js/tienda.js` | Filtros rápidos por línea, ruta `#productos/linea/<id>`, insignia de marca, nuevo mensaje de WhatsApp y departamentos dentro del panel móvil. |
| `public/js/main.js` | Insignia del logo en el encabezado, tarjeta con sello en la portada, `renderFranjaMarcas()` y texto sobre el titular. |
| `public/css/styles.css` | `.sello-logo` (destello) y `.sello-anio` (flotación), incluidas en el bloque de movimiento reducido. |
| `PENDIENTES.md` | Este registro y dos pendientes nuevos en Contenido. |

**Verificación**

- `node --check` sin errores en los 9 módulos de `public/js/`.
- 42 de 42 pruebas automáticas en Firefox headless: navegación, mega-menú, filtros, líneas, franja de marcas, insignias, mensajes de WhatsApp, carrito y modo oscuro. 0 errores y 0 avisos en consola.
- Capturas revisadas en escritorio (1440 px) y móvil (390 px) con las paletas Corporativa (claro), Tradición (oscuro) y Moderno (claro).

### 2026-10-29 — Primeros 6 productos reales (Plomería · Coflex y Fleximatic)

**Cambios**

- Se agregaron 6 productos reales con foto, descripción, precio con IVA y existencias, marcados `destacado: true` y `verificado: true`:
  - **Coflex:** LA-CFX-300 (llave monomando GLM300), LA-CFX-102 (coladera PC-102) y LA-CFX-402 (regadera de cascada PR-C402).
  - **Fleximatic:** LA-FLX-2249 (coladera Push, en oferta), LA-FLX-2605 (coladera Zero Olores, en oferta) y LA-FLX-2291 (céspol para fregadero).
- Las 2 ofertas (2249 y 2605) también aparecen en *Outlet › Ofertas de temporada* (`promo: 'temporada'`).
- **Orden "Relevancia":** disponibles → destacados → nuevos → mayor descuento.
- **Tarjeta:**
  - Insignia "Destacado".
  - Foto sobre fondo blanco, con un zoom suave al pasar el cursor. La ruta se codifica con `encodeURI` y el texto alternativo está oculto a la vista, pero no para lectores de pantalla.
  - Descripción breve (2 líneas en móvil, 3 en escritorio).
  - La búsqueda también busca en la descripción.
- **Carrito:** muestra la miniatura de la foto cuando existe.
- **Aviso del catálogo:** ahora distingue los productos *destacados con fotografía* (reales) del resto (demostración).

**Archivos modificados:** `public/js/catalogo.js` (productos y documentación de campos), `public/js/tienda.js` (orden, insignia, foto, descripción, búsqueda y aviso), `public/js/carrito.js` (miniatura) y `PENDIENTES.md`.

**Verificación:**

- `node --check` sin errores en todos los módulos.
- Las 6 imágenes existen y cargan (incluida `Sin título.jpg`); cada foto corresponde a su producto.
- 15 de 15 pruebas en Firefox: destacados primero, filtros de marca Coflex/Fleximatic, rango de precio, subcategoría Llaves, Outlet, búsqueda por descripción, carrito y pedido por WhatsApp. 0 errores en consola y ningún 404.

### 2026-10-29 — Módulo de pago con tarjeta (modo demostración)

Implementado según `PROMPT_CLAUDE_AI_PAGO_TARJETA.md`. Antes se revisó el `git pull`: solo trajo el prompt y `.gitignore` (ignora `.andromity/`), sin conflictos con el trabajo previo. El merge lo cerró el usuario con el commit `91a3e60`.

**Cambios**

1. **Nuevo módulo `public/js/pago.js`.**
   - Exporta `iniciarPago(contenedor, onPagoExitoso, onPagoCancelado)`, `mostrarFormularioPago(resumen)`, `ocultarFormularioPago()`, `estadoFormularioPago()` y `obtenerHistorial()`.
   - Ventana modal: hoja inferior en móvil, cuadro centrado en escritorio. Atrapa el foco, se cierra con Esc (salvo mientras procesa) y bloquea el desplazamiento del fondo.
   - **Entrega:** recoger en tienda o envío a domicilio, con zona y dirección obligatoria y costo de envío calculado (gratis desde el mínimo).
   - **Tarjeta:**
     - Formateo automático (grupos de 4; Amex 4-6-5) y fecha MM/AA.
     - Detecta Visa, Mastercard y Amex y ajusta el CVV a 3 o 4 dígitos.
     - Valida con Luhn, vencimiento y nombre; los errores se muestran en tiempo real con `aria-invalid` y `aria-describedby`.
     - Vista previa de la tarjeta con los colores de la paleta activa.
   - **Resumen:** subtotal, envío, total y desglose del IVA incluido (16%).
   - **Simulación:** spinner de 2.2 s con `aria-busy` y anuncio en vivo.
     - 4242 4242 4242 4242 se aprueba y 4000 0000 0000 0002 se rechaza.
     - El botón "Usar tarjeta de prueba" autocompleta los datos.
   - **Al aprobarse:**
     - Se genera la referencia `LA-AAAAMMDD-XXXXX` y un ID de transacción `demo_…`.
     - El pedido se guarda en `arcos-pedidos`: máximo 50, solo marca y últimos 4 dígitos.
     - Se muestra la confirmación y la opción de enviar el resumen por WhatsApp, que aclara que el pago fue de demostración.
   - **Al rechazarse:** se muestra el error, se borra el CVV, el carrito queda intacto y se puede volver al carrito para pedir por WhatsApp.
2. **`public/js/carrito.js` (ediciones puntuales).**
   - Selector *WhatsApp / Tarjeta* en el pie del panel (`aria-pressed`). Con "Tarjeta", el botón "Continuar al pago" abre `pago.js`.
   - Nuevos exports `resumenCarrito()` y `vaciarCarrito()`. El total se redondea a centavos.
   - El mensaje de WhatsApp ahora incluye "Forma de pago: en tienda o contra entrega".
3. **`public/js/data.js`.** Nuevo `negocio.pago`: `habilitado`, `metodos`, `procesador: 'demo'`, `configuracion`, `simulacion` (tarjetas de prueba) y `envio`.
4. **`public/css/styles.css`.** `.ventana-pago`, `.tarjeta-preview`, `.metodo-pago-activo`, `.spinner-pago` y `.formulario-pago`. La animación de entrada se desactiva con movimiento reducido.
5. **`public/js/main.js`.** `iniciarPago(...)`: al aprobarse vacía el carrito y al cancelar reabre el carrito.
6. **`public/index.html`.** Contenedor `#pago-contenedor`.

**Diferencias con el prompt, y por qué**

- **Resultado fijo en lugar de "90% de éxito al azar":** con tarjetas de prueba, la demostración ante el jurado nunca falla por casualidad y el rechazo se puede probar a voluntad.
- **Ventana propia en lugar de un formulario dentro del panel del carrito:** el panel lateral es angosto en móvil. Al cancelar se regresa al carrito, así que la experiencia es la misma.
- **Inicialización:** el ejemplo de `main.js` del prompt usaba `lineas` y `guardarYAvisar()`, que son internos de `carrito.js`. Se resolvió con el export `vaciarCarrito()`.
- **Avisos visibles de "Modo demostración / No uses una tarjeta real"** en el formulario, en la confirmación y en el mensaje de WhatsApp. Así un cliente real no cree que pagó.

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/pago.js` | Nuevo: módulo de pago (demo) |
| `public/js/carrito.js` | Selector de método, `resumenCarrito()`, `vaciarCarrito()` y forma de pago en WhatsApp |
| `public/js/data.js` | Configuración `negocio.pago` |
| `public/css/styles.css` | Estilos de la ventana, vista previa, método activo y spinner |
| `public/js/main.js` | Inicialización con callbacks |
| `public/index.html` | Contenedor `#pago-contenedor` |
| `README.md`, `PENDIENTES.md` | Documentación |

**Verificación**

- `node --check` sin errores en los 9 módulos.
- 33 de 33 pruebas del flujo de pago en Firefox headless, a 1440 px y a 390 px:
  - Carrito vacío, cambio de método, validaciones (Luhn, vencida, CVV, Amex) y envío por zonas.
  - Rechazo, cancelación, Esc durante el proceso, aprobación, carrito vaciado e historial.
  - Que ningún número completo ni CVV quede en el almacenamiento, y WhatsApp con referencia.
- Pruebas anteriores sin cambios: catálogo con productos reales 15 de 15; contacto y valoración 17 de 17. 0 errores en consola.
- Capturas revisadas: carrito con selector (móvil), ventana de pago (escritorio claro y móvil oscuro). En móvil se corrigió un desbordamiento horizontal (`min-w-0` en la cuadrícula y en los `fieldset`).
