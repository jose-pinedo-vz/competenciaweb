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
- [ ] Fotografías de producto (`public/img/productos/`) y campo `imagen` en cada producto.
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
- [ ] Pago en línea (Mercado Pago, Stripe, Clip…) si se quiere cobrar desde el sitio; hoy el pedido se cierra por WhatsApp.
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
