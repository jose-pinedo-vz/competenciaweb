/**
 * Catálogo de productos: departamentos (nivel 1), subcategorías (nivel 2) y productos (nivel 3).
 *
 * ⚠ DEMOSTRACIÓN: los productos, SKU, precios y existencias de este archivo son ilustrativos
 * para mostrar el diseño. Sustitúyelos por el inventario real antes de publicar.
 *
 * - Los precios están en MXN con IVA incluido.
 * - `antes`: precio anterior (si existe, el producto se muestra con descuento).
 * - `promo`: 'remate' o 'temporada' → el producto aparece también en Outlet.
 * - `imagen` (opcional): ruta relativa a public/ (p. ej. 'img_productos/coladera.jpg');
 *   si no hay, se muestra el ícono de la subcategoría.
 * - `descripcion` (opcional): texto corto que se muestra en la tarjeta.
 * - `destacado`: aparece primero en el orden "Relevancia" y lleva la insignia "Destacado".
 * - `verificado`: producto real confirmado por el negocio (nombre, precio y existencias);
 *   el resto del catálogo sigue siendo de demostración.
 */

export const catalogoDemostracion = true;

export const departamentos = [
  {
    id: 'herramientas',
    nombre: 'Herramientas',
    icono: 'fa-solid fa-screwdriver-wrench',
    descripcion: 'Eléctricas, manuales, de medición, neumáticas y estacionarias para casa, obra y taller.',
    subcategorias: [
      { id: 'electricas', nombre: 'Eléctricas', icono: 'fa-solid fa-bolt' },
      { id: 'manuales', nombre: 'Manuales', icono: 'fa-solid fa-hammer' },
      { id: 'medicion', nombre: 'Medición', icono: 'fa-solid fa-ruler-combined' },
      { id: 'neumaticas', nombre: 'Neumáticas', icono: 'fa-solid fa-wind' },
      { id: 'estacionarias', nombre: 'Estacionarias', icono: 'fa-solid fa-gears' },
    ],
  },
  {
    id: 'construccion',
    nombre: 'Construcción y Ferretería',
    icono: 'fa-solid fa-trowel-bricks',
    descripcion: 'Material eléctrico, abrasivos, adhesivos, tornillería, pintura e impermeabilizantes.',
    subcategorias: [
      { id: 'electrico', nombre: 'Material eléctrico', icono: 'fa-solid fa-plug' },
      { id: 'abrasivos', nombre: 'Abrasivos', icono: 'fa-solid fa-compact-disc' },
      { id: 'adhesivos', nombre: 'Adhesivos y selladores', icono: 'fa-solid fa-flask' },
      { id: 'tornilleria', nombre: 'Tornillería y fijación', icono: 'fa-solid fa-gear' },
      { id: 'impermeabilizantes', nombre: 'Impermeabilizantes', icono: 'fa-solid fa-umbrella' },
      { id: 'pintura', nombre: 'Pintura y accesorios', icono: 'fa-solid fa-paint-roller' },
    ],
  },
  {
    id: 'plomeria',
    nombre: 'Plomería y Grifería',
    icono: 'fa-solid fa-faucet-drip',
    descripcion: 'Bombas de agua, tuberías, conexiones, llaves y grifería.',
    subcategorias: [
      { id: 'bombas', nombre: 'Bombas de agua', icono: 'fa-solid fa-water' },
      { id: 'tuberias', nombre: 'Tuberías', icono: 'fa-solid fa-grip-lines' },
      { id: 'conexiones', nombre: 'Conexiones y mangueras', icono: 'fa-solid fa-link' },
      { id: 'llaves', nombre: 'Llaves y grifería', icono: 'fa-solid fa-faucet' },
    ],
  },
  {
    id: 'cerrajeria',
    nombre: 'Cerrajería',
    icono: 'fa-solid fa-key',
    descripcion: 'Cerraduras residenciales y digitales, candados y cajas fuertes.',
    subcategorias: [
      { id: 'residenciales', nombre: 'Cerraduras residenciales', icono: 'fa-solid fa-door-closed' },
      { id: 'digitales', nombre: 'Cerraduras digitales', icono: 'fa-solid fa-fingerprint' },
      { id: 'candados', nombre: 'Candados', icono: 'fa-solid fa-lock' },
      { id: 'cajas', nombre: 'Cajas fuertes', icono: 'fa-solid fa-vault' },
    ],
  },
  {
    id: 'hogar',
    nombre: 'Hogar, Jardín y Limpieza',
    icono: 'fa-solid fa-house',
    descripcion: 'Herrajes para muebles, ventilación, jardín, insecticidas e hidrolavadoras.',
    subcategorias: [
      { id: 'herrajes', nombre: 'Herrajes para muebles', icono: 'fa-solid fa-couch' },
      { id: 'ventilacion', nombre: 'Ventilación', icono: 'fa-solid fa-fan' },
      { id: 'jardin', nombre: 'Jardín', icono: 'fa-solid fa-seedling' },
      { id: 'insecticidas', nombre: 'Insecticidas', icono: 'fa-solid fa-bug' },
      { id: 'hidrolavadoras', nombre: 'Hidrolavadoras', icono: 'fa-solid fa-spray-can-sparkles' },
    ],
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad Industrial',
    icono: 'fa-solid fa-helmet-safety',
    descripcion: 'Equipo de protección personal y señalización.',
    subcategorias: [
      { id: 'epp', nombre: 'Equipo de protección personal', icono: 'fa-solid fa-helmet-safety' },
      { id: 'senalizacion', nombre: 'Señalización', icono: 'fa-solid fa-triangle-exclamation' },
    ],
  },
  {
    id: 'outlet',
    nombre: 'Outlet y Ofertas',
    icono: 'fa-solid fa-tags',
    descripcion: 'Zona de remate y ofertas de temporada, hasta agotar existencias.',
    esOutlet: true,
    subcategorias: [
      { id: 'remate', nombre: 'Zona de remate', icono: 'fa-solid fa-fire' },
      { id: 'temporada', nombre: 'Ofertas de temporada', icono: 'fa-solid fa-calendar-days' },
    ],
  },
];

// prettier-ignore
export const productos = [
  // Herramientas
  { sku: 'LA-HE-0101', nombre: 'Taladro percutor 1/2" 650 W', marca: 'Truper', dep: 'herramientas', sub: 'electricas', precio: 1189, stock: 8, nuevo: true },
  { sku: 'LA-HE-0102', nombre: 'Rotomartillo SDS Plus 800 W', marca: 'Bosch', dep: 'herramientas', sub: 'electricas', precio: 3299, antes: 3790, stock: 3, promo: 'temporada' },
  { sku: 'LA-HE-0103', nombre: 'Esmeriladora angular 4-1/2" 750 W', marca: 'DeWalt', dep: 'herramientas', sub: 'electricas', precio: 1849, stock: 5 },
  { sku: 'LA-HE-0104', nombre: 'Sierra circular 7-1/4" 1,400 W', marca: 'Makita', dep: 'herramientas', sub: 'electricas', precio: 2890, stock: 0 },
  { sku: 'LA-HE-0105', nombre: 'Atornillador inalámbrico 12 V con 2 baterías', marca: 'Pretul', dep: 'herramientas', sub: 'electricas', precio: 899, antes: 1099, stock: 12, promo: 'temporada' },
  { sku: 'LA-HE-0201', nombre: 'Martillo de uña curva 16 oz, mango de fibra de vidrio', marca: 'Truper', dep: 'herramientas', sub: 'manuales', precio: 189, stock: 25 },
  { sku: 'LA-HE-0202', nombre: 'Juego de desarmadores 6 piezas', marca: 'Stanley', dep: 'herramientas', sub: 'manuales', precio: 249, stock: 18 },
  { sku: 'LA-HE-0203', nombre: 'Pinza de electricista 8"', marca: 'Urrea', dep: 'herramientas', sub: 'manuales', precio: 329, stock: 10, nuevo: true },
  { sku: 'LA-HE-0204', nombre: 'Llave ajustable 10" cromada', marca: 'Pretul', dep: 'herramientas', sub: 'manuales', precio: 159, stock: 0 },
  { sku: 'LA-HE-0301', nombre: 'Flexómetro 5 m contra impacto', marca: 'Truper', dep: 'herramientas', sub: 'medicion', precio: 119, stock: 40 },
  { sku: 'LA-HE-0302', nombre: 'Nivel de aluminio 24" con 3 gotas', marca: 'Stanley', dep: 'herramientas', sub: 'medicion', precio: 289, stock: 7 },
  { sku: 'LA-HE-0303', nombre: 'Medidor láser de distancia 40 m', marca: 'Bosch', dep: 'herramientas', sub: 'medicion', precio: 1299, stock: 2, nuevo: true },
  { sku: 'LA-HE-0401', nombre: 'Compresor de aire 25 L 2.5 HP', marca: 'Truper', dep: 'herramientas', sub: 'neumaticas', precio: 3490, stock: 2 },
  { sku: 'LA-HE-0402', nombre: 'Pistola para pintar HVLP de gravedad', marca: 'Urrea', dep: 'herramientas', sub: 'neumaticas', precio: 799, stock: 4 },
  { sku: 'LA-HE-0501', nombre: 'Esmeril de banco 6" 1/3 HP', marca: 'Truper', dep: 'herramientas', sub: 'estacionarias', precio: 1390, stock: 3 },
  { sku: 'LA-HE-0502', nombre: 'Tornillo de banco giratorio 5"', marca: 'Pretul', dep: 'herramientas', sub: 'estacionarias', precio: 649, antes: 799, stock: 6, promo: 'remate' },

  // Construcción y Ferretería
  { sku: 'LA-CF-0101', nombre: 'Cable THW calibre 12, rollo de 100 m', marca: 'Condumex', dep: 'construccion', sub: 'electrico', precio: 1690, stock: 9 },
  { sku: 'LA-CF-0102', nombre: 'Contacto doble polarizado con placa', marca: 'Volteck', dep: 'construccion', sub: 'electrico', precio: 45, stock: 60 },
  { sku: 'LA-CF-0103', nombre: 'Foco LED 9 W luz blanca', marca: 'Philips', dep: 'construccion', sub: 'electrico', precio: 39, stock: 120 },
  { sku: 'LA-CF-0104', nombre: 'Centro de carga de 2 polos', marca: 'Square D', dep: 'construccion', sub: 'electrico', precio: 389, stock: 0 },
  { sku: 'LA-CF-0105', nombre: 'Cinta de aislar negra 18 m', marca: 'Volteck', dep: 'construccion', sub: 'electrico', precio: 25, stock: 100 },
  { sku: 'LA-CF-0106', nombre: 'Apagador sencillo con placa', marca: 'Volteck', dep: 'construccion', sub: 'electrico', precio: 39, stock: 70 },
  { sku: 'LA-CF-0107', nombre: 'Extensión eléctrica uso rudo 5 m', marca: 'Volteck', dep: 'construccion', sub: 'electrico', precio: 219, stock: 11 },
  { sku: 'LA-CF-0201', nombre: 'Disco de corte para metal 4-1/2" (5 piezas)', marca: 'Austromex', dep: 'construccion', sub: 'abrasivos', precio: 129, stock: 30 },
  { sku: 'LA-CF-0202', nombre: 'Lija de agua grano 220 (10 pliegos)', marca: 'Fandeli', dep: 'construccion', sub: 'abrasivos', precio: 85, stock: 50 },
  { sku: 'LA-CF-0301', nombre: 'Pegamento de contacto 1 L', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 189, stock: 14 },
  { sku: 'LA-CF-0302', nombre: 'Silicón transparente 280 ml', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 79, stock: 35 },
  { sku: 'LA-CF-0303', nombre: 'Cemento para PVC 250 ml', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 95, stock: 20 },
  { sku: 'LA-CF-0304', nombre: 'Pegamento blanco multiusos 1 L', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 119, stock: 25 },
  { sku: 'LA-CF-0305', nombre: 'Sellador acrílico para juntas 300 ml', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 69, stock: 30 },
  { sku: 'LA-CF-0306', nombre: 'Adhesivo epóxico de 2 componentes 25 ml', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 89, stock: 16, nuevo: true },
  { sku: 'LA-CF-0307', nombre: 'Removedor de sarro y óxido 1 L', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 99, stock: 0 },
  { sku: 'LA-CF-0308', nombre: 'Silicón para alta temperatura, rojo, 85 g', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 75, stock: 20 },
  { sku: 'LA-CF-0309', nombre: 'Thinner estándar 1 L', marca: 'Presto', dep: 'construccion', sub: 'adhesivos', precio: 59, stock: 40 },
  { sku: 'LA-CF-0401', nombre: 'Taquete plástico 1/4" (100 piezas)', marca: 'Fiero', dep: 'construccion', sub: 'tornilleria', precio: 49, stock: 80 },
  { sku: 'LA-CF-0402', nombre: 'Pija para tablaroca 1" (100 piezas)', marca: 'Fiero', dep: 'construccion', sub: 'tornilleria', precio: 69, stock: 45 },
  { sku: 'LA-CF-0403', nombre: 'Clavo estándar 2-1/2" (1 kg)', marca: 'Fiero', dep: 'construccion', sub: 'tornilleria', precio: 45, stock: 35 },
  { sku: 'LA-CF-0404', nombre: 'Alambre recocido calibre 16 (1 kg)', marca: 'Fiero', dep: 'construccion', sub: 'tornilleria', precio: 55, stock: 25 },
  { sku: 'LA-CF-0405', nombre: 'Tornillo para madera 1-1/2" (50 piezas)', marca: 'Fiero', dep: 'construccion', sub: 'tornilleria', precio: 59, stock: 0 },
  { sku: 'LA-CF-0501', nombre: 'Impermeabilizante acrílico 5 años, 19 L', marca: 'Fester', dep: 'construccion', sub: 'impermeabilizantes', precio: 1890, antes: 2150, stock: 6, promo: 'temporada' },
  { sku: 'LA-CF-0502', nombre: 'Pintura vinílica blanca, 19 L', marca: 'Comex', dep: 'construccion', sub: 'pintura', precio: 1590, stock: 4 },
  { sku: 'LA-CF-0503', nombre: 'Brocha de cerda natural 3"', marca: 'Truper', dep: 'construccion', sub: 'pintura', precio: 59, stock: 40 },
  { sku: 'LA-CF-0504', nombre: 'Impermeabilizante acrílico 3 años, 19 L', marca: 'Comex', dep: 'construccion', sub: 'impermeabilizantes', precio: 1390, stock: 7 },
  { sku: 'LA-CF-0505', nombre: 'Impermeabilizante elastomérico 10 años, 19 L', marca: 'Fester', dep: 'construccion', sub: 'impermeabilizantes', precio: 2790, stock: 3, nuevo: true },
  { sku: 'LA-CF-0506', nombre: 'Membrana de refuerzo de poliéster 1 × 100 m', marca: 'Fester', dep: 'construccion', sub: 'impermeabilizantes', precio: 1190, stock: 4 },
  { sku: 'LA-CF-0507', nombre: 'Sellador para grietas en techo 1 L', marca: 'Sika', dep: 'construccion', sub: 'impermeabilizantes', precio: 249, stock: 10 },
  { sku: 'LA-CF-0508', nombre: 'Primario para impermeabilizante 4 L', marca: 'Fester', dep: 'construccion', sub: 'impermeabilizantes', precio: 389, antes: 459, stock: 6, promo: 'remate' },
  { sku: 'LA-CF-0509', nombre: 'Rodillo de felpa 9" con charola', marca: 'Truper', dep: 'construccion', sub: 'pintura', precio: 139, stock: 15 },
  { sku: 'LA-CF-0510', nombre: 'Esmalte alquidálico negro brillante 1 L', marca: 'Comex', dep: 'construccion', sub: 'pintura', precio: 229, stock: 8 },
  { sku: 'LA-CF-0511', nombre: 'Cinta masking 1" × 50 m', marca: 'Truper', dep: 'construccion', sub: 'pintura', precio: 39, stock: 60 },

  // Plomería y Grifería · productos reales destacados (datos confirmados por el negocio)
  { sku: 'LA-CFX-300', nombre: 'Llave monomando para lavabo GLM300', marca: 'Coflex', dep: 'plomeria', sub: 'llaves', precio: 820, stock: 5, destacado: true, verificado: true, imagen: 'img_productos/Sin título.jpg',
    descripcion: 'Llave para lavabo de una sola palanca, acabado cromo, con cuerpo de latón y resina. Tiene aireador y flujo máximo de 5.7 L/min.' },
  { sku: 'LA-CFX-102', nombre: 'Coladera universal PC-102', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 104.27, stock: 15, destacado: true, verificado: true, imagen: 'img_productos/coladera.jpg',
    descripcion: 'Coladera universal con rejilla de acero inoxidable y trampa de agua para reducir malos olores e insectos.' },
  { sku: 'LA-CFX-402', nombre: 'Regadera de cascada PR-C402, 20 cm', marca: 'Coflex', dep: 'plomeria', sub: 'llaves', precio: 411.32, stock: 8, destacado: true, verificado: true, imagen: 'img_productos/regadera.jpg',
    descripcion: 'Regadera tipo cascada de 20 cm con cuerpo de ABS cromado, regulador de flujo para ahorro de agua y fácil instalación.' },
  { sku: 'LA-FLX-2249', nombre: 'Coladera Universal Push 2249', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 410, antes: 455, promo: 'temporada', stock: 10, destacado: true, verificado: true, imagen: 'img_productos/coladeraUniversal.jpg',
    descripcion: 'Coladera universal para conexiones de 2, 3 y 4 pulgadas. Tiene bisel y cubierta de acero inoxidable, empaque antiolores de silicón y sistema Push de latón.' },
  { sku: 'LA-FLX-2605', nombre: 'Coladera Universal Rejilla Acero 2605 Zero Olores', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 199, antes: 224, promo: 'temporada', stock: 12, destacado: true, verificado: true, imagen: 'img_productos/ColaderaUniversalAcero.jpg',
    descripcion: 'Coladera universal con rejilla de acero, trampa de agua extra larga y tres barreras antiolores con check antirretorno.' },
  { sku: 'LA-FLX-2291', nombre: 'Céspol para Fregadero Bote Grande FL2291', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 77, stock: 20, destacado: true, verificado: true, imagen: 'img_productos/CespoParaRegadera.jpg',
    descripcion: 'Desagüe para fregadero con bote grande y tubo flexible de hasta 25 cm. Fabricado en polipropileno, PVC flexible y silicón.' },

  // Plomería y Grifería · demostración
  { sku: 'LA-PG-0101', nombre: 'Bomba periférica 1/2 HP', marca: 'Truper', dep: 'plomeria', sub: 'bombas', precio: 1290, stock: 4 },
  { sku: 'LA-PG-0102', nombre: 'Bomba sumergible 1 HP para cisterna', marca: 'Pretul', dep: 'plomeria', sub: 'bombas', precio: 2390, stock: 0 },
  { sku: 'LA-PG-0201', nombre: 'Tubo PPR 1/2", tramo de 4 m', marca: 'Tuboplus', dep: 'plomeria', sub: 'tuberias', precio: 139, stock: 25 },
  { sku: 'LA-PG-0202', nombre: 'Tubo PVC sanitario 4", tramo de 6 m', marca: 'Amanco', dep: 'plomeria', sub: 'tuberias', precio: 389, stock: 10 },
  { sku: 'LA-PG-0301', nombre: 'Manguera flexible para lavabo 40 cm', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 69, stock: 50 },
  { sku: 'LA-PG-0302', nombre: 'Manguera para WC 35 cm', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 59, stock: 38 },
  { sku: 'LA-PG-0303', nombre: 'Codo PVC 90° 1/2" (10 piezas)', marca: 'Amanco', dep: 'plomeria', sub: 'conexiones', precio: 45, stock: 60 },
  { sku: 'LA-PG-0304', nombre: 'Conector flexible para boiler 1/2" × 60 cm', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 119, stock: 22 },
  { sku: 'LA-PG-0305', nombre: 'Conector flexible para gas 1/2" × 1.5 m', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 189, stock: 14, nuevo: true },
  { sku: 'LA-PG-0306', nombre: 'Céspol flexible para lavabo', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 99, stock: 30 },
  { sku: 'LA-PG-0307', nombre: 'Kit de instalación para WC (manguera, cuello de cera y pijas)', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 149, stock: 18, nuevo: true },
  { sku: 'LA-PG-0308', nombre: 'Manguera para regadera de teléfono 1.5 m', marca: 'Fleximatic', dep: 'plomeria', sub: 'conexiones', precio: 139, stock: 0 },
  { sku: 'LA-PG-0309', nombre: 'Conector para tinaco 3/4"', marca: 'Coflex', dep: 'plomeria', sub: 'conexiones', precio: 85, antes: 109, stock: 12, promo: 'temporada' },
  { sku: 'LA-PG-0401', nombre: 'Llave de paso de esfera 1/2"', marca: 'Urrea', dep: 'plomeria', sub: 'llaves', precio: 189, stock: 15 },
  { sku: 'LA-PG-0402', nombre: 'Monomando para lavabo cromado', marca: 'Foset', dep: 'plomeria', sub: 'llaves', precio: 899, antes: 1090, stock: 3, promo: 'remate' },
  { sku: 'LA-PG-0403', nombre: 'Regadera de lluvia 8" con brazo', marca: 'Foset', dep: 'plomeria', sub: 'llaves', precio: 649, stock: 5, nuevo: true },
  { sku: 'LA-PG-0404', nombre: 'Válvula de llenado universal para WC', marca: 'Coflex', dep: 'plomeria', sub: 'llaves', precio: 179, stock: 9 },

  // Cerrajería
  { sku: 'LA-CE-0101', nombre: 'Cerradura de pomo para recámara', marca: 'Phillips', dep: 'cerrajeria', sub: 'residenciales', precio: 349, stock: 12 },
  { sku: 'LA-CE-0102', nombre: 'Cerradura de sobreponer para puerta principal', marca: 'Lock', dep: 'cerrajeria', sub: 'residenciales', precio: 489, stock: 6 },
  { sku: 'LA-CE-0201', nombre: 'Cerradura digital con huella y teclado', marca: 'Yale', dep: 'cerrajeria', sub: 'digitales', precio: 4890, stock: 2, nuevo: true },
  { sku: 'LA-CE-0301', nombre: 'Candado de latón 40 mm', marca: 'Hermex', dep: 'cerrajeria', sub: 'candados', precio: 159, stock: 30 },
  { sku: 'LA-CE-0302', nombre: 'Candado de acero con combinación', marca: 'Truper', dep: 'cerrajeria', sub: 'candados', precio: 199, antes: 249, stock: 9, promo: 'remate' },
  { sku: 'LA-CE-0401', nombre: 'Caja fuerte digital 23 L', marca: 'Truper', dep: 'cerrajeria', sub: 'cajas', precio: 2190, stock: 0 },

  // Hogar, Jardín y Limpieza
  { sku: 'LA-HJ-0101', nombre: 'Bisagra de cierre lento para cocina (par)', marca: 'Hermex', dep: 'hogar', sub: 'herrajes', precio: 129, stock: 24 },
  { sku: 'LA-HJ-0102', nombre: 'Corredera telescópica 45 cm (par)', marca: 'Hermex', dep: 'hogar', sub: 'herrajes', precio: 219, stock: 10 },
  { sku: 'LA-HJ-0201', nombre: 'Extractor de aire para baño 4"', marca: 'Volteck', dep: 'hogar', sub: 'ventilacion', precio: 489, stock: 5 },
  { sku: 'LA-HJ-0301', nombre: 'Manguera para jardín reforzada 15 m', marca: 'Truper', dep: 'hogar', sub: 'jardin', precio: 289, stock: 8 },
  { sku: 'LA-HJ-0302', nombre: 'Tijera para podar 8"', marca: 'Truper', dep: 'hogar', sub: 'jardin', precio: 179, stock: 12 },
  { sku: 'LA-HJ-0401', nombre: 'Insecticida en aerosol 400 ml', marca: 'Raid', dep: 'hogar', sub: 'insecticidas', precio: 89, stock: 30 },
  { sku: 'LA-HJ-0501', nombre: 'Hidrolavadora eléctrica 1,600 PSI', marca: 'Kärcher', dep: 'hogar', sub: 'hidrolavadoras', precio: 3990, antes: 4490, stock: 2, promo: 'temporada' },

  // Seguridad Industrial
  { sku: 'LA-SI-0101', nombre: 'Lentes de seguridad transparentes', marca: 'Truper', dep: 'seguridad', sub: 'epp', precio: 49, stock: 60 },
  { sku: 'LA-SI-0102', nombre: 'Guantes de carnaza (par)', marca: 'Truper', dep: 'seguridad', sub: 'epp', precio: 79, stock: 40 },
  { sku: 'LA-SI-0103', nombre: 'Casco de seguridad con ajuste de matraca', marca: 'Surtek', dep: 'seguridad', sub: 'epp', precio: 189, stock: 15, nuevo: true },
  { sku: 'LA-SI-0104', nombre: 'Respirador de media cara con cartuchos', marca: '3M', dep: 'seguridad', sub: 'epp', precio: 689, stock: 0 },
  { sku: 'LA-SI-0201', nombre: 'Cinta de precaución amarilla 300 m', marca: 'Pretul', dep: 'seguridad', sub: 'senalizacion', precio: 149, stock: 20 },
  { sku: 'LA-SI-0202', nombre: 'Señalamiento "Salida de emergencia" 30 × 20 cm', marca: 'Surtek', dep: 'seguridad', sub: 'senalizacion', precio: 99, stock: 14 },
];

/**
 * Líneas principales del negocio: accesos rápidos en la parte superior del catálogo
 * (#productos/linea/<id>). Cada línea agrupa uno o varios [departamento, subcategoría].
 */
export const lineas = [
  {
    id: 'plomeria',
    nombre: 'Plomería y conexiones',
    icono: 'fa-solid fa-faucet-drip',
    resumen: 'Coflex · Fleximatic',
    descripcion: 'Conectores, mangueras, céspoles, llaves y bombas, con las marcas que ya conoces: Coflex y Fleximatic.',
    incluye: [['plomeria']],
  },
  {
    id: 'adhesivos',
    nombre: 'Adhesivos y químicos',
    icono: 'fa-solid fa-flask',
    resumen: 'Presto',
    descripcion: 'Pegamentos, selladores, silicones y químicos de mantenimiento Presto.',
    incluye: [['construccion', 'adhesivos']],
  },
  {
    id: 'impermeabilizantes',
    nombre: 'Impermea\u00adbilizantes', // \u00ad: guion opcional si no cabe en la tarjeta
    icono: 'fa-solid fa-umbrella',
    resumen: 'Techos y muros',
    descripcion: 'Impermeabilizantes, membranas, primarios y selladores para proteger tu casa de las lluvias de la costa.',
    incluye: [['construccion', 'impermeabilizantes']],
  },
  {
    id: 'tlapaleria',
    nombre: 'Tlapalería general',
    icono: 'fa-solid fa-screwdriver-wrench',
    resumen: 'Tornillería · eléctrico · pintura',
    descripcion: 'Lo de todos los días: tornillería, material eléctrico, pintura, abrasivos y herramienta básica.',
    incluye: [
      ['construccion', 'tornilleria'],
      ['construccion', 'electrico'],
      ['construccion', 'pintura'],
      ['construccion', 'abrasivos'],
      ['herramientas', 'manuales'],
      ['herramientas', 'medicion'],
    ],
  },
];

export const lineaPorId = (id) => lineas.find((l) => l.id === id);

export const productosDeLinea = (id) => {
  const linea = lineaPorId(id);
  return linea ? productos.filter((p) => linea.incluye.some(([dep, sub]) => p.dep === dep && (!sub || p.sub === sub))) : [];
};

export const departamentoPorId = (id) => departamentos.find((d) => d.id === id);
export const productoPorSku = (sku) => productos.find((p) => p.sku === sku);

export const subcategoriaDe = (producto) =>
  departamentoPorId(producto.dep)?.subcategorias.find((s) => s.id === producto.sub);

/** Productos que pertenecen a un departamento (Outlet agrupa los que tienen `promo`). */
export const productosDe = (depId, subId) =>
  productos.filter((p) => {
    if (!depId) return true;
    if (depId === 'outlet') return p.promo && (!subId || p.promo === subId);
    return p.dep === depId && (!subId || p.sub === subId);
  });

export const descuento = (p) => (p.antes ? Math.round((1 - p.precio / p.antes) * 100) : 0);

const formatoMXN = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
export const precioMXN = (valor) => formatoMXN.format(valor);
