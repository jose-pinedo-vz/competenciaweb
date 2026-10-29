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
