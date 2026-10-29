/**
 * Información oficial de Ferretería y Tlapalería Los Arcos.
 * Fuente única de verdad para todo el contenido del sitio:
 * cualquier cambio de datos se hace aquí, no en el HTML.
 */

export const negocio = {
  nombre: 'Ferretería y Tlapalería Los Arcos',
  nombreCorto: 'Los Arcos',
  eslogan: 'Si no conoces los Arcos no conoces el Pitillal',
  anioFundacion: 1984,

  logo: {
    src: 'img/logo-arcos.jpeg',
    alt: 'Logotipo de Tlapalería Los Arcos',
    ancho: 946,
    alto: 410,
  },

  historia: {
    fundadores: ['José Navarro', 'Teresa Ocampo'],
    familia: 'familia Navarro',
    resumen:
      'Fundada en 1984 por José Navarro y Teresa Ocampo, Los Arcos es atendida hasta hoy por la familia Navarro en El Pitillal, Puerto Vallarta.',
    parrafos: [
      'En 1984, José Navarro y Teresa Ocampo abrieron las puertas de un pequeño negocio en el corazón de El Pitillal con una idea sencilla: que los vecinos encontraran cerca de casa el material que necesitaban, con precios justos y un trato de confianza.',
      'Más de cuatro décadas después, la familia Navarro sigue detrás del mostrador. Conocemos a nuestros clientes por su nombre, sabemos qué pieza necesitan aunque no recuerden cómo se llama y seguimos aconsejando con la misma honestidad del primer día.',
    ],
    valores: [
      {
        icono: 'fa-solid fa-people-roof',
        titulo: 'Negocio familiar',
        texto: 'Atendido por la familia Navarro desde su fundación.',
      },
      {
        icono: 'fa-solid fa-handshake',
        titulo: 'Trato de confianza',
        texto: 'Asesoría honesta para que compres solo lo que necesitas.',
      },
      {
        icono: 'fa-solid fa-location-dot',
        titulo: 'Arraigo local',
        texto: 'Parte de la vida diaria de El Pitillal desde 1984.',
      },
    ],
  },

  /**
   * Franja de marcas de la portada. Solo se nombran las marcas que el negocio confirmó
   * (Coflex, Fleximatic, Presto); el resto se presenta como línea de producto.
   * `ruta` lleva al filtro correspondiente del catálogo.
   */
  marcas: {
    destacadas: [
      { nombre: 'Coflex', linea: 'Plomería y conexiones', icono: 'fa-solid fa-faucet-drip', ruta: '#productos/linea/plomeria' },
      { nombre: 'Fleximatic', linea: 'Mangueras y conectores', icono: 'fa-solid fa-link', ruta: '#productos/linea/plomeria' },
      { nombre: 'Presto', linea: 'Adhesivos, selladores y químicos', icono: 'fa-solid fa-flask', ruta: '#productos/linea/adhesivos' },
    ],
    lineas: [
      { nombre: 'Impermea\u00adbilizantes', icono: 'fa-solid fa-umbrella', ruta: '#productos/linea/impermeabilizantes' },
      { nombre: 'Pintura', icono: 'fa-solid fa-paint-roller', ruta: '#productos/construccion/pintura' },
      { nombre: 'Material eléctrico', icono: 'fa-solid fa-plug', ruta: '#productos/construccion/electrico' },
    ],
  },

  contacto: {
    direccion: {
      calle: 'Vicente Guerrero 148',
      colonia: 'Centro',
      localidad: 'El Pitillal',
      cp: '48290',
      ciudad: 'Puerto Vallarta',
      estado: 'Jalisco',
      pais: 'México',
    },
    telefono: '322 224 5833',
    telefonoHref: 'tel:+523222245833',
    whatsapp: '5213330105206',
    whatsappTexto: '+52 1 33 3010 5206',
    facebook: 'https://www.facebook.com/losarcostlapaleria?locale=es_LA',
    /**
     * Coordenadas del local para el marcador del mapa (OpenStreetMap).
     * Pendiente: las búsquedas de OSM no ubican el número 148 de Vicente Guerrero en El Pitillal Centro,
     * así que mientras `verificadas` sea false el mapa muestra la zona sin marcador.
     * Para obtenerlas: en openstreetmap.org, clic derecho sobre el local → "Mostrar dirección".
     */
    coordenadas: { lat: 20.651, lon: -105.216, verificadas: false },
  },

  /**
   * Horario de atención. `dias` usa la numeración de JavaScript (0 = domingo … 6 = sábado)
   * y las horas van en formato 24 h. El estado "Abierto ahora" se calcula con la hora
   * de Puerto Vallarta (zonaHoraria), sin importar desde dónde se visite el sitio.
   */
  horario: {
    zonaHoraria: 'America/Mexico_City',
    bloques: [
      { etiqueta: 'Lunes a viernes', dias: [1, 2, 3, 4, 5], abre: '08:00', cierra: '19:30' },
      { etiqueta: 'Sábado', dias: [6], abre: '08:00', cierra: '17:30' },
      { etiqueta: 'Domingo', dias: [0], abre: '09:00', cierra: '13:30' },
    ],
  },

  valoracion: {
    titulo: '¿Qué te parece nuestro negocio?',
    texto: 'Ayúdanos a mejorar, déjanos tu valoración.',
    etiquetas: ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'],
    agradecimiento: '¡Gracias por tu valoración!',
    retrasoMs: 4000,
  },

  mensajesWhatsApp: {
    general: '¡Hola, Los Arcos! Me gustaría recibir información.',
    cotizacion:
      '¡Hola, Los Arcos! Quisiera cotizar el siguiente material:\n\n- \n\n¿Me pueden apoyar con precio y disponibilidad? Gracias.',
  },

  /**
   * Pago en línea (public/js/pago.js).
   * ⚠ `procesador: 'demo'` SIMULA el cobro: no se hace ningún cargo y el pedido no llega a la tienda.
   * Para cobrar de verdad hay que integrar un procesador (Stripe, Mercado Pago, Clip) con su SDK oficial.
   * Los costos y zonas de envío son de ejemplo: confírmalos con el negocio antes de publicar.
   */
  pago: {
    habilitado: true, // false oculta el pago con tarjeta y deja solo WhatsApp
    metodos: ['whatsapp', 'tarjeta'],
    procesador: 'demo',
    configuracion: {
      public_key: '', // clave pública del procesador real (nunca la secreta)
      moneda: 'MXN',
      impuesto: 0.16, // IVA: los precios del catálogo ya lo incluyen; se usa para mostrar el desglose
    },
    // Tarjetas de prueba del modo demo (mismo criterio que Stripe): cualquier otra tarjeta válida se aprueba.
    simulacion: {
      tarjetaAprobada: '4242424242424242',
      tarjetaRechazada: '4000000000000002',
      demoraMs: 2200,
    },
    envio: {
      disponible: true,
      costo: 150, // costo base (zonas no listadas)
      gratisMinimo: 1000, // envío gratis si el pedido supera este monto
      zonas: [
        { nombre: 'El Pitillal', costo: 0 },
        { nombre: 'Puerto Vallarta', costo: 100 },
        { nombre: 'Zona turística', costo: 200 },
      ],
    },
  },

  /** Vistas (pestañas) del sitio. El id es también el hash de la URL: #inicio, #productos, #contacto. */
  vistas: [
    { id: 'inicio', etiqueta: 'Inicio', icono: 'fa-solid fa-house', titulo: 'Inicio' },
    { id: 'productos', etiqueta: 'Productos', icono: 'fa-solid fa-boxes-stacked', titulo: 'Productos y catálogo' },
    { id: 'contacto', etiqueta: 'Contacto', icono: 'fa-solid fa-location-dot', titulo: 'Ubicación y contacto' },
  ],
};

/**
 * Paletas de color intercambiables. Cada clave de `claro` / `oscuro` se publica
 * como variable CSS (--p-<clave-en-kebab>) y Tailwind la expone como color
 * semántico: bg-fondo, text-primario-texto, border-borde, etc.
 *
 * - primario / acento: fondos de botones y bloques (llevan texto blanco encima).
 * - primarioTexto / acentoTexto: los mismos tonos ajustados para usarse como texto.
 * - destaque: el amarillo; destaqueTexto es el texto que va sobre él.
 * - hero*: la banda oscura de la portada.
 */
export const paletas = [
  {
    id: 'corporativa',
    nombre: 'Corporativa Los Arcos',
    descripcion: 'Azul rey, rojo tlapalería y amarillo ocre.',
    claro: {
      fondo: '#f8f9fa', superficie: '#ffffff', superficieAlt: '#f1f3f6', borde: '#e2e8f0',
      texto: '#1e293b', textoSuave: '#475569', textoTenue: '#64748b',
      primario: '#2544b3', primarioHover: '#1d3690', primarioTexto: '#2544b3', primarioSuave: '#e8edfa',
      acento: '#e63946', acentoHover: '#c92f3b', acentoTexto: '#c42536',
      destaque: '#e9c46a', destaqueTexto: '#3a2a00',
      heroFondo: '#16296e', heroTexto: '#ffffff', heroSuave: '#c9d3f2',
    },
    oscuro: {
      fondo: '#0f172a', superficie: '#1e293b', superficieAlt: '#172033', borde: '#334155',
      texto: '#f1f5f9', textoSuave: '#cbd5e1', textoTenue: '#94a3b8',
      primario: '#3b82f6', primarioHover: '#60a5fa', primarioTexto: '#93c5fd', primarioSuave: '#1e3a5f',
      acento: '#ef4444', acentoHover: '#f87171', acentoTexto: '#fca5a5',
      destaque: '#f59e0b', destaqueTexto: '#1f1300',
      heroFondo: '#0b1224', heroTexto: '#ffffff', heroSuave: '#b6c2d9',
    },
  },
  {
    id: 'industrial',
    nombre: 'Confiabilidad Industrial',
    descripcion: 'Azul corporativo, rojo y amarillo.',
    claro: {
      fondo: '#f4f6fa', superficie: '#ffffff', superficieAlt: '#eaeff6', borde: '#d7dfea',
      texto: '#0d1b33', textoSuave: '#44536b', textoTenue: '#5f6e84',
      primario: '#1a3f8f', primarioHover: '#132f6c', primarioTexto: '#1a3f8f', primarioSuave: '#e3eaf7',
      acento: '#c8102e', acentoHover: '#a10d25', acentoTexto: '#b30e29',
      destaque: '#f5b800', destaqueTexto: '#1f1600',
      heroFondo: '#0e2454', heroTexto: '#ffffff', heroSuave: '#c3d0ea',
    },
    oscuro: {
      fondo: '#0a1120', superficie: '#111a2d', superficieAlt: '#0d1626', borde: '#24314b',
      texto: '#edf1f8', textoSuave: '#b3bfd3', textoTenue: '#8794aa',
      primario: '#2d5fc8', primarioHover: '#3a6fdc', primarioTexto: '#8db0f5', primarioSuave: '#17264a',
      acento: '#d42a3f', acentoHover: '#e23d51', acentoTexto: '#ff8a95',
      destaque: '#f5b800', destaqueTexto: '#1f1600',
      heroFondo: '#0b1a3d', heroTexto: '#ffffff', heroSuave: '#a9bbdf',
    },
  },
  {
    id: 'tradicion',
    nombre: 'Tradición y Herramienta',
    descripcion: 'Rojo tlapalería, azul clásico y ocre madera.',
    claro: {
      fondo: '#f8f4ee', superficie: '#fffdf9', superficieAlt: '#f1e9dd', borde: '#e4d7c4',
      texto: '#2a1a12', textoSuave: '#5c4a3d', textoTenue: '#806c5c',
      primario: '#b3191f', primarioHover: '#8f1318', primarioTexto: '#a3161c', primarioSuave: '#f8e4e2',
      acento: '#1f4e9a', acentoHover: '#183d7a', acentoTexto: '#1f4e9a',
      destaque: '#c8962e', destaqueTexto: '#2a1a05',
      heroFondo: '#5b1a14', heroTexto: '#fff8ef', heroSuave: '#ead2c3',
    },
    oscuro: {
      fondo: '#15100d', superficie: '#1f1814', superficieAlt: '#1a1410', borde: '#3a2d24',
      texto: '#f6eee6', textoSuave: '#cdbcad', textoTenue: '#a08f80',
      primario: '#c0262c', primarioHover: '#d4363c', primarioTexto: '#ff8f86', primarioSuave: '#3a1a17',
      acento: '#2f63b8', acentoHover: '#3d74cc', acentoTexto: '#93b6f0',
      destaque: '#d8a640', destaqueTexto: '#2a1a05',
      heroFondo: '#3a110d', heroTexto: '#fff8ef', heroSuave: '#dcc0b0',
    },
  },
  {
    id: 'moderno',
    nombre: 'Moderno y Dinámico',
    descripcion: 'Azul eléctrico, rojo carmesí y amarillo herramienta.',
    claro: {
      fondo: '#f5f7ff', superficie: '#ffffff', superficieAlt: '#eaeefc', borde: '#d5dcf2',
      texto: '#0a1030', textoSuave: '#434c70', textoTenue: '#6a7396',
      primario: '#0050e6', primarioHover: '#003fb8', primarioTexto: '#0047cc', primarioSuave: '#e2eaff',
      acento: '#d0103a', acentoHover: '#a90c2f', acentoTexto: '#c20f36',
      destaque: '#ffc400', destaqueTexto: '#1a1400',
      heroFondo: '#060c2e', heroTexto: '#ffffff', heroSuave: '#b9c4f0',
    },
    oscuro: {
      fondo: '#05081a', superficie: '#0d1230', superficieAlt: '#090e25', borde: '#1f2850',
      texto: '#eef1ff', textoSuave: '#b4bce0', textoTenue: '#858fba',
      primario: '#1f66ff', primarioHover: '#3b7bff', primarioTexto: '#86abff', primarioSuave: '#121c4a',
      acento: '#e0244c', acentoHover: '#ee3a60', acentoTexto: '#ff8aa3',
      destaque: '#ffc400', destaqueTexto: '#1a1400',
      heroFondo: '#040822', heroTexto: '#ffffff', heroSuave: '#a7b3e8',
    },
  },
];

/**
 * Trayectoria calculada de forma honesta: como no se publica el mes de apertura,
 * solo se garantizan los años completos del año siguiente a la fundación en adelante.
 * En 2026 da 41 años cumplidos con seguridad y se comunica como "más de 40".
 */
export const trayectoria = (hoy = new Date()) => {
  const aniosGarantizados = hoy.getFullYear() - negocio.anioFundacion - 1;
  return {
    anioFundacion: negocio.anioFundacion,
    aniosGarantizados,
    decadas: Math.floor(aniosGarantizados / 10) * 10,
  };
};

/** Dirección en una sola línea, lista para mostrar o buscar en mapas. */
export const direccionCompleta = () => {
  const d = negocio.contacto.direccion;
  return `${d.calle}, ${d.colonia}, ${d.localidad}, C.P. ${d.cp}, ${d.ciudad}, ${d.estado}, ${d.pais}`;
};

/** Construye un enlace de WhatsApp con mensaje prellenado. */
export const enlaceWhatsApp = (mensaje = negocio.mensajesWhatsApp.general) =>
  `https://wa.me/${negocio.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
