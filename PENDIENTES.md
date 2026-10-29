# Pendientes

Elementos opcionales para futuras versiones del sitio.

## Contenido

- [ ] Misión y visión formales de la empresa.
- [ ] **Coordenadas exactas del local** en `negocio.contacto.coordenadas` (y `verificadas: true`) para mostrar el marcador en el mapa. OpenStreetMap no ubica el número 148 de Vicente Guerrero en El Pitillal Centro.
- [x] Número oficial único para llamadas y WhatsApp: 322 224 5833 (`wa.me/523222245833`). Confirmado por el usuario el 2026-10-29.
- [ ] Horarios en días festivos.
- [ ] Fotografías reales de la fachada, el mostrador y la familia que atiende el negocio (guardar en `public/img/`).
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
- [ ] Confirmar con el negocio si prepara pintura al color (máquina igualadora o colorantes) y con qué marcas. Si sí, se puede agregar al aviso de "Crea tu color". Hoy el sitio solo pregunta "¿Pueden preparar o igualar este tono?".
- [ ] `PROMPT_CLAUDE_AI_VISUALIZADOR_COLOR.md` proponía además un campo `colorHex` en los productos de pintura. Por decisión del usuario se implementó un apartado independiente del catálogo. Si después se quiere el color por producto, se puede reutilizar `creador-color.js`.
- [ ] Más fotos oficiales para la galería (fachada, mostrador, la familia que atiende) en `public/galeria/` y su entrada en `negocio.galeria.fotos` (`data.js`). Hoy las leyendas no identifican a nadie.
- [ ] Si el negocio confirma los nombres de sus fundadores o de la familia, se pueden agregar en `negocio.historia` (`data.js`). Hoy el sitio no menciona a ninguna persona.
- [ ] Las fotos que el administrador sube a la galería se guardan como data URL en `arcos-admin-datos` (localStorage, ~5 MB). Para publicarlas a todos se exportan con el JSON (`admin.datosPublicados`). Con muchas fotos conviene subirlas a `public/galeria/` como archivos y agregarlas en `data.js`.
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
- [ ] **Panel de administración con backend real:**
  - Hoy el PIN, la sesión y los cambios viven en el navegador. Cualquiera con acceso a ese equipo y a las herramientas de desarrollo puede saltarse el PIN.
  - Para producción: autenticación en servidor (por ejemplo Firebase Auth o Supabase), base de datos para productos y configuración, y validación en el servidor.
- [ ] Si el equipo va a administrar desde varios equipos, definir `admin.pinHash` en `data.js` y publicar los cambios con `admin.datosPublicados`.
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

### 2026-10-29 — Galería interactiva (portada)

**Cambios**

1. **Nueva sección "La tienda en imágenes"** en Inicio, entre *Quiénes somos* y la llamada a la acción final.
   - Cuadrícula de 2 columnas en móvil y 4 en escritorio, con las 4 fotos de `public/galeria/`.
   - Cada foto tiene título y descripción. Las leyendas describen lo que se ve (estacionamiento para clientes, módulo Coflex, nueva línea de grifería, válvulas Coflex) sin identificar a las personas. La familia Navarro se menciona en la introducción.
2. **Visor ampliado** a pantalla completa:
   - Navegación con anterior/siguiente (con vuelta al inicio), flechas del teclado y deslizamiento con el dedo en móvil.
   - Contador "2 / 4".
   - Se cierra con la X, con Esc o con clic en el fondo.
   - Atrapa el foco, bloquea el desplazamiento del fondo y devuelve el foco a la foto al cerrar.
   - Precarga las fotos vecinas.
3. **"Agregar foto"**: tarjeta con "+" al final de la cuadrícula, que abre un `<input type="file" accept="image/*" multiple>` oculto. También acepta arrastrar y soltar.
   - Los archivos se leen con **FileReader** y se reducen con canvas (máx. 1600 px, JPEG al 85%).
   - Se agregan al instante a la cuadrícula y al visor, y se guardan en **sessionStorage** (`arcos-galeria`): persisten al recargar y desaparecen al cerrar la pestaña.
   - Llevan la insignia "Tu foto" y un botón para quitarlas.
   - Se ignoran los archivos que no son imagen o pesan más de 15 MB, con un mensaje de estado (`role="status"`).
   - Si el navegador se queda sin espacio, se avisa y las fotos siguen visibles hasta recargar.
   - Los nombres de archivo se escapan antes de mostrarse (protección contra inyección de HTML).

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/galeria.js` | Nuevo: cuadrícula, visor y carga de fotos |
| `public/js/data.js` | Nuevo bloque `negocio.galeria` (título, introducción y las 4 fotos con leyendas) |
| `public/js/main.js` | Sección de galería en `renderInicio()` e `iniciarGaleria()` en el arranque |
| `public/js/almacen.js` | `guardar()` ahora devuelve `true`/`false` (para detectar falta de espacio) y se agregó `quitar()`. Compatible con el código existente |
| `public/css/styles.css` | `.visor-galeria` (entrada y `touch-action`), incluida en el bloque de movimiento reducido |
| `PENDIENTES.md` | Este registro y dos pendientes nuevos |

**Verificación**

- `node --check` sin errores en los 10 módulos de `public/js/`.
- 23 de 23 pruebas de la galería en Firefox headless:
  - 4 columnas en escritorio, las 4 fotos cargan, leyendas.
  - Visor: abrir, →, ←, vuelta completa, Esc con devolución del foco.
  - Subida simulada de 3 archivos: 2 imágenes, una de 3200×2000 reducida a 1600×1000 (41 KB), y un `.txt` rechazado.
  - Nombre de archivo malicioso escapado, persistencia tras recargar, quitar foto, modo oscuro.
- Pruebas anteriores sin cambios: pago 33 de 33, catálogo 15 de 15, contacto y valoración 17 de 17. 0 errores en consola.
- Capturas revisadas: escritorio (Corporativa claro), móvil (Tradición oscuro, 2 columnas) y visor en escritorio y móvil.

### 2026-10-29 — Nueva redacción del aviso del catálogo

**Cambio:** el aviso amarillo de la vista Productos ahora dice, textualmente:

> **Catálogo de demostración.** Las fichas técnicas e imágenes de los productos destacados fueron obtenidas de páginas y proveedores oficiales de las marcas; confirma existencias, precios vigentes y compatibilidad directamente por WhatsApp antes de tu compra.

Sustituye las dos versiones anteriores ("Catálogo en construcción…" y "Catálogo de demostración. Productos, precios y existencias son ilustrativos…"). El texto ya no depende de los productos marcados como `verificado`. Ese campo se conserva en `catalogo.js` como dato, pero la interfaz ya no lo usa.

**Archivos modificados:** `public/js/tienda.js` (solo el texto del aviso en `renderCatalogo()`) y `PENDIENTES.md`.

**Verificación:**

- `node --check` sin errores en los 10 módulos.
- En Firefox headless, a 1440 px y a 390 px: el aviso está presente en `#productos` con el texto exacto, es visible y se mantiene al filtrar por línea. 0 errores en consola.

### 2026-10-29 — Vista de administrador con CRUD

Implementada según `PROMPT_CLAUDE_AI_VISTA_ADMIN.md` (commit `e3aba10`).

**Cambios**

1. **Nuevo `public/js/admin-datos.js` (capa de datos; primer import de `main.js`).**
   - Aplica los cambios del admin **antes** de que se evalúen los módulos que leen los datos al cargar (horario, pago, carrito, tienda, valoración, galería). Los muta en sitio, sin reemplazar objetos, para que todas las referencias los vean.
   - Tres capas: datos de fábrica → JSON publicado opcional (`admin.datosPublicados`) → cambios locales (`arcos-admin-datos`).
   - `validarDatos()` revisa la estructura, los SKU únicos, los tipos, que las imágenes sean data URL o rutas relativas y que **ningún texto lleve `<` o `>`** (el sitio inserta los datos como HTML).
   - Funciones de instantánea, guardado, importación y restauración, y configuración del panel (`arcos-admin-config`) con valores por defecto.
2. **Nuevo `public/js/admin.js` (armazón, acceso y secciones).**
   - Capa a pantalla completa, separada de la vista cliente.
   - Menú lateral en escritorio y barra inferior en móvil, ruta de navegación e interruptor claro/oscuro (reutiliza el del sitio).
   - **PIN** guardado como huella SHA-256 (`arcos-admin:` + PIN). Si `data.js` no trae `pinHash`, el primer acceso pide crearlo.
   - Bloqueo de 60 s tras 5 intentos fallidos, sesión en `sessionStorage` con cierre por inactividad y cierre de sesión manual.
   - **Dashboard:** productos, disponibles, agotados, en oferta, pedidos demo, valoración, lista de existencias por revisar y estado del almacenamiento.
   - **Pedidos:** lee `obtenerHistorial()` de `pago.js`. Filtros por referencia, fechas, método y estado; paginación de 25; detalle en modal; botón "Borrar historial".
   - **Ajustes:**
     - Campos omitidos (productos y configuración), límites de caracteres, reglas de imagen (formatos, MB, dimensiones), paginación y tiempo de sesión.
     - Cambio de PIN.
     - Exportar e importar JSON (con validación y confirmación) y restaurar los valores de fábrica.
3. **Nuevo `public/js/admin-catalogo.js`.**
   - **Productos:** tabla en escritorio y tarjetas en móvil. Búsqueda; filtros por departamento, subcategoría, marca, destacado y verificado; orden por nombre, precio, existencias o SKU; 20 por página.
   - **Crear y editar productos:**
     - SKU generable y único (solo lectura al editar).
     - Nombre, marca y descripción con límites y contador de caracteres.
     - Subcategoría que depende del departamento, precio (≥ 0, 2 decimales) y existencias (entero ≥ 0).
     - Precio anterior (debe ser mayor que el precio) y promoción (exige precio anterior).
     - Imagen validada (formato, tipo real, MB, mínimo y máximo de píxeles) y reducida a 800 px, con opción de quitarla.
     - Destacado, verificado y nuevo.
   - **Eliminar** con confirmación. Avisa si el producto está en el carrito de este navegador.
   - **Departamentos y subcategorías:** CRUD con identificador automático (de solo lectura al editar), ícono con vista previa y **eliminación en cascada** que indica cuántos productos se borran. *Outlet* está protegido porque sus subcategorías dependen de `promo`.
   - Si el guardado falla por falta de espacio, el cambio se revierte en memoria.
4. **Nuevo `public/js/admin-config.js`.** Siete secciones con validación y "Descartar cambios":
   - **Negocio:** nombre, nombre corto, eslogan, año y logotipo con validación y texto alternativo.
   - **Contacto:** dirección, CP de 5 dígitos, teléfono de 10 dígitos, WhatsApp en dígitos, Facebook con https y **coordenadas verificadas para activar el marcador del mapa**.
   - **Horario:** zona horaria y bloques editables (sin días repetidos y con apertura antes del cierre).
   - **Marcas:** destacadas y líneas, con enlaces elegidos de una lista de rutas válidas.
   - **Pago y envío:** rechaza claves secretas `sk_`, explica que solo la demo está implementada y edita las zonas.
   - **Valoración:** nuevo interruptor `habilitado`, textos, etiquetas y retraso.
   - **Mensajes de WhatsApp.**
5. **Nuevo `public/js/admin-ui.js`.** Avisos (toasts) y modales apilables con trampa de foco; Esc cierra solo el modal superior y no llega a los atajos del sitio. También confirmaciones (`alertdialog`), campos accesibles (`aria-invalid`, `aria-describedby`, contadores), validación y compresión de imágenes, y descarga de JSON.
6. **`public/js/main.js`.**
   - `admin-datos.js` es el primer import.
   - La ruta `#admin/<sección>/<sub>` abre el panel y, al salir, el sitio se recarga si hubo cambios.
   - Se inicializa el panel y se agrega el enlace "Administración" en el pie.
7. **`public/js/data.js`.** Nuevo `negocio.admin` (`habilitado`, `pinHash`, `sessionTimeout`, `datosPublicados`) y `valoracion.habilitado`.
8. **`public/js/valoracion.js`.** Respeta `valoracion.habilitado`.
9. **`public/index.html`.** Contenedor `#admin-contenedor`.
10. **`public/css/styles.css`.** `.admin-layout`, `.admin-sidebar`, `.admin-table` (encabezado fijo), `.admin-form`, `.admin-card`, `.file-input-preview`, `.campo-omitido`, `.admin-modal-ventana` y `.admin-aviso`, más un espaciador inferior del panel. Las animaciones respetan el movimiento reducido.

**Diferencias con el prompt, y por qué**

- **Sin pestaña "Admin" en el menú público:** el prompt la agregaba a `negocio.vistas`, lo que la habría mostrado a todos los clientes y desacomodado la barra móvil de 3 columnas. Se entra por `#admin` o por el enlace discreto del pie.
- **Protegido desde el inicio:** el prompt proponía `pin: ''` (sin protección) y a la vez prohibía un admin público y los PIN en texto plano. Se usa `pinHash` (huella SHA-256) y, si está vacío, el primer acceso obliga a crear un PIN.
- **Los cambios llegan a todo el sitio:** como varios módulos leen los datos al cargar, se aplican antes de evaluarlos (`admin-datos.js` primero) y el sitio se recarga al salir del panel.
- **Publicación real opcional:** el JSON exportado se puede publicar con `admin.datosPublicados` para que lo vean todos los visitantes, no solo el navegador del administrador.
- **Moneda limitada a MXN:** los precios del catálogo están en pesos; cambiar la etiqueta a USD sin convertir mostraría precios falsos.
- **Ruido evitado en consola:** el JSON publicado solo se pide si está configurado, para no generar un 404.
- **Módulos separados:** el panel se dividió en 5 archivos (`admin*.js`) en lugar de uno solo, para mantenerlo modular y fácil de auditar (`CLAUDE.MD`).
- **Pendiente opcional:** deshacer y autoguardado no se implementaron (el prompt los marca como opcionales). La "vista previa" es el botón "Ver sitio".

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/admin.js` | Nuevo: armazón, acceso con PIN y sesión, dashboard, pedidos y ajustes |
| `public/js/admin-datos.js` | Nuevo: capas de datos, validación, guardado, exportación e importación |
| `public/js/admin-catalogo.js` | Nuevo: CRUD de productos, departamentos y subcategorías |
| `public/js/admin-config.js` | Nuevo: configuración del negocio (7 secciones) |
| `public/js/admin-ui.js` | Nuevo: avisos, modales, campos, imágenes |
| `public/js/data.js` | `negocio.admin` y `valoracion.habilitado` |
| `public/js/main.js` | Import temprano, ruta `#admin`, inicialización y enlace en el pie |
| `public/js/valoracion.js` | Respeta `valoracion.habilitado` |
| `public/css/styles.css` | Estilos del panel |
| `public/index.html` | Contenedor `#admin-contenedor` |
| `README.md`, `PENDIENTES.md` | Documentación |

**Verificación**

- `node --check` sin errores en los 15 módulos. En Node, `validarDatos()` aprueba los datos de fábrica y rechaza HTML inyectado, rutas `javascript:` y secciones no editables.
- **46 de 46 pruebas del panel** en Firefox headless, en tres fases con recarga, a 1440 px y a 390 px:
  - Acceso: crear PIN, huella SHA-256, PIN incorrecto con intentos restantes, cierre e inicio de sesión.
  - Productos: listado de 20 por página, búsqueda y filtro. Crear con errores, validar imagen (.gif, 100×100 y 2400 px rechazadas; 600×600 aceptada), editar y eliminar con confirmación.
  - Departamentos: crear departamento y subcategoría, Outlet protegido, eliminar Seguridad en cascada (6 productos).
  - Configuración: año, teléfono, Facebook, horario con día repetido y clave `sk_` rechazados; eslogan guardado.
  - Ajustes: campo omitido oculto en el formulario; Esc cierra el modal; pedidos vacíos.
  - **Tras salir del panel, la vista cliente refleja los cambios:** eslogan nuevo, mega-menú sin Seguridad y con el departamento nuevo, 86 productos, producto nuevo con imagen y oferta, precio editado.
  - La sesión sobrevive a la recarga, y **restaurar los valores de fábrica** vuelve a 92 productos y al eslogan original.
  - 0 errores en consola en todas las fases.
- Pruebas anteriores sin cambios: pago 33 de 33, galería 23 de 23, contacto 17 de 17. Catálogo 14 de 15: la que falla busca el texto anterior del aviso, que se cambió a petición del usuario.
- Capturas revisadas: dashboard y listado (escritorio, claro); catálogo, formulario de edición, configuración y acceso (móvil, oscuro y claro). Se corrigió la barra "Guardar" fija en móvil.

### 2026-10-29 — "Quiénes somos" sin nombres de personas

**Cambios**

- Se eliminaron los nombres "José Navarro" y "Teresa Ocampo" y el apellido "Navarro" ("familia Navarro"), porque no aparecen en la documentación oficial del negocio.
- Se conserva lo que sí está confirmado: negocio familiar, fundado en 1984, en El Pitillal, con más de 40 años de trayectoria, atención de confianza y arraigo local.
- **`data.js` › `negocio.historia`:**
  - Se quitaron los campos `fundadores` y `familia`.
  - `resumen` y `parrafos` se reescribieron sin nombres ("En 1984 abrimos las puertas de un pequeño negocio familiar…", "Más de cuatro décadas después seguimos detrás del mostrador…").
  - El valor "Negocio familiar" ahora dice "Atendido por la misma familia desde su fundación en 1984".
- **`data.js` › `negocio.galeria.introduccion`:** "…la tlapalería familiar que atiende a El Pitillal desde 1984."
- **`main.js`:**
  - Tarjeta de "Quiénes somos": en lugar de "por José Navarro y Teresa Ocampo" ahora dice "Un negocio familiar con **más de 40 años** en El Pitillal" (calculado con `trayectoria()`).
  - Portada: "con la asesoría honesta de un negocio familiar desde 1984".
  - Tarjeta del logotipo: "Negocio local · Familiar".
- Las entradas anteriores de este registro conservan su texto original como historial. Los pendientes que nombraban a la familia se reescribieron.

**Archivos modificados:** `public/js/data.js`, `public/js/main.js` y `PENDIENTES.md`.

**Verificación:**

- `node --check` sin errores en los 15 módulos.
- `grep` sin coincidencias de "Navarro", "Ocampo", "fundadores" ni `historia.familia` en `public/`.
- En Firefox headless, Inicio, Productos y Contacto sin nombres de personas; "Quiénes somos" conserva 1984, negocio familiar, más de 40 años y arraigo local. 0 errores en consola. Captura revisada.

### 2026-10-29 — Botón de admin visible y galería administrada solo desde el panel

**Cambios**

1. **Botón "Admin" en el encabezado** (`main.js`, `renderEncabezado()`): enlace a `#admin` con el ícono `fa-user-shield`, entre el selector de modo y el carrito.
   - Usa los colores de la paleta (`bg-primario-suave`, `text-primario-texto`; se rellena al pasar el cursor), así que funciona en modo claro/oscuro y con todas las paletas.
   - En móvil se muestra solo el ícono, con `aria-label` "Vista de administrador"; desde `sm` muestra el texto "Admin". Mide 44 px de alto, el área táctil mínima.
   - El enlace del pie de página se conserva como acceso secundario.
2. **Galería pública de solo lectura** (`galeria.js`):
   - Se eliminaron la tarjeta "Agregar foto", el `<input type="file">`, arrastrar y soltar, el botón de quitar y el guardado en `sessionStorage`.
   - La cuadrícula y el visor siguen iguales para todos los visitantes y muestran `negocio.galeria.fotos` (carpeta `public/galeria/` más lo agregado desde el admin).
   - Si la galería queda vacía, aparece el aviso "Muy pronto compartiremos fotos de la tienda".
   - Al iniciar se borra la clave antigua `arcos-galeria` de `sessionStorage` (fotos de visitantes de la versión anterior).
3. **Nueva sección "Galería" en el panel** (`admin-galeria.js`, ruta `#admin/galeria`; la barra móvil del admin pasa a 6 columnas):
   - **Subir fotos** con botón, zona clicable o arrastrar y soltar, varias a la vez.
     - Validación: formatos permitidos de Ajustes, tipo real, hasta 10 MB y mínimo de Ajustes. No hay máximo de píxeles porque se reducen a 1400 px en JPEG.
     - Un formulario pide título (obligatorio, máx. 60) y descripción (máx. 160) para cada foto, sin `<` ni `>`.
   - **Eliminar** cualquier foto, de la carpeta o subida, con confirmación. La confirmación explica que el archivo de la carpeta no se borra y se recupera con "Restaurar valores de fábrica".
   - Insignias "Carpeta" / "Subida", posición (1/5…) y conteo.
   - Se guarda con el resto de los datos del admin (`arcos-admin-datos`, localStorage), así que también se exporta, importa, restaura y publica con `admin.datosPublicados`. Si no hay espacio, el cambio se revierte.
4. **`admin-datos.js`:** `galeria` se agregó a `SECCIONES_NEGOCIO` y `validarDatos()` revisa cada foto (imagen segura y título obligatorio).

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/galeria.js` | Galería pública de solo lectura; exporta `srcFoto()` |
| `public/js/admin-galeria.js` | Nuevo: subir y eliminar fotos desde el panel |
| `public/js/admin.js` | Vista "Galería" en el menú y en la ruta; barra móvil de 6 columnas |
| `public/js/admin-datos.js` | `galeria` editable y validada |
| `public/js/main.js` | Botón "Admin" en el encabezado |
| `public/js/data.js` | Comentario de `negocio.galeria` |
| `README.md`, `PENDIENTES.md` | Documentación |

**Verificación**

- `node --check` sin errores en los 16 módulos.
- **21 de 21 pruebas** en Firefox headless, en 3 fases con recarga, a 1440 px y a 390 px:
  - Botón Admin visible (98×44 px) que abre el panel.
  - Galería pública con 4 fotos, sin "Agregar foto", sin quitar y sin input de archivos; el visor funciona; se limpió la clave antigua.
  - En el panel: rechazo de .gif y 100×100 con avisos; foto de 3000 px aceptada y reducida a 1400×933; título vacío con error; 2 fotos subidas y una de la carpeta eliminada.
  - **El público ve los cambios** (5 fotos, la subida en el visor) **sin controles de edición**, y restaurar devuelve las 4 fotos.
  - 0 errores en consola.
- Pruebas anteriores: admin 46 de 46, pago 33 de 33, contacto 17 de 17, catálogo 14 de 15 (la que falla busca el texto antiguo del aviso, cambiado a petición del usuario). La prueba de galería anterior (`prueba7`) cubría la carga pública que se eliminó a propósito.
- Capturas revisadas: encabezado y galería pública (escritorio claro, móvil Tradición oscuro) y la sección Galería del panel (escritorio claro, móvil Moderno oscuro).

### 2026-10-29 — Apartado "Crea tu color" (independiente del catálogo)

A pedido del usuario, en lugar del visualizador ligado a productos de `PROMPT_CLAUDE_AI_VISUALIZADOR_COLOR.md` (commit `f127ee3`), se creó un apartado propio donde el visitante crea un tono y pregunta por él.

**Cambios**

1. **Nueva vista `#color`** ("Colores" en el menú y en la barra móvil, que pasa a 4 columnas calculadas con `negocio.vistas.length`). Acepta `#color/RRGGBB` para compartir un tono.
2. **Nuevo `public/js/creador-color.js`:**
   - **Mezcla:**
     - `input type="color"`, código HEX validado (`normalizarHex`: acepta 3 o 6 dígitos, con o sin `#`; muestra un error y `aria-invalid` si no es válido).
     - 3 deslizadores HSL con pista de degradado, `aria-valuetext` y área táctil de 44 px.
     - 7 variaciones de luminosidad (±10/20/30).
   - **Vista previa:** habitación SVG en perspectiva (techo, 3 paredes con `fill: var(--tono)` y sombreado lateral, piso) con muebles para sala, cocina, dormitorio y baño. `role="img"` con descripción accesible ("Cocina con paredes color Terracota (#C4693D)").
   - **Información:**
     - Franja con el nombre descriptivo y texto de contraste automático (luminancia WCAG).
     - HEX, RGB, HSL y botón para copiar, con mensaje alterno si el navegador no permite el portapapeles.
     - Anuncio en vivo para lectores de pantalla.
   - **Paleta de inicio** (12 colores con nombres genéricos, no de marcas) y **"Mis colores"** (guardar y quitar, máx. 8, `localStorage` → `arcos-colores`).
   - **Consulta por WhatsApp:** acabado, uso (interior/exterior), m² opcionales y comentario. El mensaje incluye nombre, HEX, RGB, esos datos, la pregunta "¿Pueden preparar o igualar este tono?" y el enlace `#color/RRGGBB`.
   - **Aviso honesto:** "El color en pantalla es aproximado… te confirmamos si podemos prepararlo o igualarlo".
   - La dirección se actualiza con `history.replaceState`, sin llenar el historial.
3. **`data.js`:** nueva vista `color` en `negocio.vistas` y bloque `negocio.creadorColor` (color inicial, paleta, habitaciones, acabados, usos y máximo de guardados).
4. **`main.js`:**
   - Importa e inicializa el módulo, y la ruta `#color/<hex>` llama a `navegarColor()`.
   - La barra móvil usa tantas columnas como vistas.
   - El nombre de la paleta del encabezado solo se muestra desde `2xl` (1536 px) y sin partirse, porque con la 4.ª pestaña se partía en dos líneas a 1440 px.
5. **`index.html`:** sección `#vista-color`.
6. **`styles.css`:** `.habitacion-svg`, `.habitacion-pared` (transición de `fill`), `.color-swatch` y `.deslizador-color` (pista y control en WebKit y Firefox, foco visible). Las transiciones respetan el movimiento reducido.

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/creador-color.js` | Nuevo: creador de color |
| `public/js/data.js` | Vista `color` y `negocio.creadorColor` |
| `public/js/main.js` | Inicialización, ruta `#color/<hex>`, barra móvil y nombre de paleta en `2xl` |
| `public/index.html` | Sección `#vista-color` |
| `public/css/styles.css` | Estilos del visualizador y los deslizadores |
| `README.md`, `PENDIENTES.md` | Documentación |

**Verificación**

- `node --check` sin errores en los 17 módulos.
- En Node: `normalizarHex` (6 casos), conversión HEX↔HSL y nombres descriptivos de los 12 colores de la paleta.
- **21 de 21 pruebas** en Firefox headless, a 1440 px y a 390 px:
  - Pestaña, vista y foco; vista independiente de productos.
  - HEX válido, inválido y corto; deslizador; variaciones; paleta.
  - Habitaciones y las 3 paredes con el tono; guardar y quitar en "Mis colores".
  - Mensaje de WhatsApp completo, dirección compartible y enlace `#color/1F3A5F`; copiar sin errores; modo oscuro.
  - 0 errores en consola.
- Pruebas anteriores: admin 46 de 46, galería 21 de 21, pago 33 de 33, contacto 17 de 17, catálogo 14 de 15 (la conocida del texto antiguo del aviso).
- Capturas revisadas: escritorio claro, móvil Moderno oscuro (dormitorio) y encabezado a 1024, 1440 y 1600 px.

### 2026-10-29 — Íconos en el menú principal (pestaña "Colores")

**Cambio:** en `public/js/main.js` (`renderEncabezado()`), las pestañas del menú de escritorio muestran el ícono de su vista, el mismo de la barra móvil: Inicio `fa-house`, Productos `fa-boxes-stacked`, **Colores `fa-palette`** y Contacto `fa-location-dot`.
- El ícono de Colores lleva el color de acento de la paleta (`text-acento-texto`) para que destaque; los demás van al 70% de opacidad.
- El relleno horizontal pasa a `px-3` (`px-4` desde `xl`) para compensar el ancho de los íconos.
- En móvil y tableta, "Colores" ya estaba en la barra inferior con su ícono.

**Archivos modificados:** `public/js/main.js` y `PENDIENTES.md`.

**Verificación:** `node --check` sin errores. ⚠ La prueba en navegador a varios anchos (390–1440 px) **no se completó** porque el usuario la interrumpió para priorizar el cambio del teléfono. Queda pendiente confirmar que el menú cabe en una línea a 1024 px con los íconos.

### 2026-10-29 — Número oficial único: 322 224 5833

**Cambios**

- `public/js/data.js` › `negocio.contacto`:
  - `whatsapp`: `5213330105206` → `523222245833`, usado por todos los enlaces `wa.me`.
  - `whatsappTexto`: `+52 1 33 3010 5206` → `322 224 5833`.
  - `telefono` y `telefonoHref` ya eran `322 224 5833` / `tel:+523222245833`.
- Todos los botones y mensajes de WhatsApp arman su enlace con `enlaceWhatsApp()` a partir de `negocio.contacto.whatsapp`, así que se actualizaron solos: botón flotante, encabezado ("Cotizar"), portada, tarjetas del catálogo, carrito, comprobante del pago con tarjeta, creador de color, valoración, contacto y pie de página.
- `public/index.html` (`<noscript>`): un solo número para llamadas y WhatsApp, con enlace a `wa.me/523222245833`.
- `public/js/admin-config.js`: el ejemplo de ayuda del campo WhatsApp ahora es `523222245833`.
- Pendiente de "¿qué número es fijo y cuál es WhatsApp?" marcado como resuelto.

**Archivos modificados:** `public/js/data.js`, `public/index.html`, `public/js/admin-config.js` y `PENDIENTES.md`.

**Verificación**

- `node --check` sin errores en los 17 módulos.
- `grep` sin coincidencias del número anterior (`3330105206`, `33 3010 5206`, `5213330…`) en todo el proyecto, salvo el historial de este registro.
- En Firefox headless: los 21 enlaces de WhatsApp de la página apuntan a `wa.me/523222245833`, incluidos el botón flotante, el carrito y el creador de color. Contacto muestra `322 224 5833` con `tel:+523222245833` y el HTML ya no contiene el número anterior. 0 errores en consola.
- ⚠ Si en algún navegador se editó el contacto desde el panel de administración, ese navegador conserva su copia local (`arcos-admin-datos`) con el número anterior. Se corrige editando el campo en *Configuración › Contacto* o con *Ajustes › Restaurar valores de fábrica*.
