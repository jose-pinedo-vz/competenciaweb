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
    telefono: '+52 1 33 3010 5206',
    telefonoHref: 'tel:+5213330105206',
    whatsapp: '5213330105206',
    facebook: 'https://www.facebook.com/losarcostlapaleria?locale=es_LA',
  },

  mensajesWhatsApp: {
    general: '¡Hola, Los Arcos! Me gustaría recibir información.',
    cotizacion:
      '¡Hola, Los Arcos! Quisiera cotizar el siguiente material:\n\n- \n\n¿Me pueden apoyar con precio y disponibilidad? Gracias.',
  },

  /** Vistas (pestañas) del sitio. El id es también el hash de la URL: #inicio, #productos, #contacto. */
  vistas: [
    { id: 'inicio', etiqueta: 'Inicio', icono: 'fa-solid fa-house', titulo: 'Inicio' },
    { id: 'productos', etiqueta: 'Productos', icono: 'fa-solid fa-boxes-stacked', titulo: 'Productos y catálogo' },
    { id: 'contacto', etiqueta: 'Contacto', icono: 'fa-solid fa-location-dot', titulo: 'Ubicación y contacto' },
  ],

  categorias: [
    {
      id: 'plomeria',
      icono: 'fa-solid fa-faucet-drip',
      nombre: 'Plomería y conexiones',
      descripcion:
        'Todo para instalaciones hidráulicas y reparaciones en casa: mangueras, llaves y conexiones de las marcas que ya conoces.',
      marcas: ['Coflex', 'Fleximatic'],
      productos: ['Mangueras flexibles', 'Llaves y válvulas', 'Conexiones PVC y cobre', 'Accesorios para baño'],
    },
    {
      id: 'adhesivos',
      icono: 'fa-solid fa-flask',
      nombre: 'Adhesivos, selladores y químicos',
      descripcion:
        'Pegamentos, selladores y productos químicos para reparar, unir y sellar con resultados duraderos.',
      marcas: ['Presto'],
      productos: ['Pegamentos de contacto', 'Silicones y selladores', 'Cementos para PVC', 'Solventes y limpiadores'],
    },
    {
      id: 'mantenimiento',
      icono: 'fa-solid fa-shield-halved',
      nombre: 'Mantenimiento y protección',
      descripcion:
        'Protege techos, muros y superficies de la lluvia y el sol de la costa con impermeabilizantes y recubrimientos.',
      marcas: [],
      productos: ['Impermeabilizantes', 'Recubrimientos', 'Selladores para techo', 'Primarios y membranas'],
    },
    {
      id: 'tlapaleria',
      icono: 'fa-solid fa-screwdriver-wrench',
      nombre: 'Tlapalería general',
      descripcion:
        'Lo de todos los días para la obra, el taller y el hogar: tornillería, material eléctrico y pintura.',
      marcas: [],
      productos: ['Tornillería y fijación', 'Material eléctrico', 'Pintura y brochas', 'Herramienta básica'],
    },
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
