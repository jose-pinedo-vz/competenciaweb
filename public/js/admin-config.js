import { negocio } from './data.js';
import { departamentos, lineas } from './catalogo.js';
import { aplicarNegocio } from './admin-datos.js';
import {
  $, $$, escapar, TEXTO_PROHIBIDO, ICONOS, avisar, campo, casilla, mostrarError, mostrarErrores,
  conectarContadores, validarImagen, comprimirImagen, claseControl,
} from './admin-ui.js';

/*
 * Configuración del negocio en el panel de administración (paso 7 del prompt):
 * información básica, contacto, horario, marcas, pago, valoración y mensajes de WhatsApp.
 * Cada sección valida su formulario, aplica los cambios en sitio sobre `negocio`
 * (aplicarNegocio) y persiste con ctx.guardar(); si no hay espacio, se revierte.
 */

/** Campos opcionales de la configuración que se pueden ocultar desde Ajustes. */
export const CAMPOS_CONFIG_OMITIBLES = [
  { id: 'eslogan', etiqueta: 'Eslogan' },
  { id: 'facebook', etiqueta: 'Facebook' },
  { id: 'coordenadas', etiqueta: 'Coordenadas del mapa' },
];

const SECCIONES = [
  { id: 'negocio', etiqueta: 'Negocio', icono: 'fa-solid fa-store' },
  { id: 'contacto', etiqueta: 'Contacto', icono: 'fa-solid fa-address-book' },
  { id: 'horario', etiqueta: 'Horario', icono: 'fa-regular fa-clock' },
  { id: 'marcas', etiqueta: 'Marcas', icono: 'fa-solid fa-tags' },
  { id: 'pago', etiqueta: 'Pago y envío', icono: 'fa-solid fa-credit-card' },
  { id: 'valoracion', etiqueta: 'Valoración', icono: 'fa-solid fa-star' },
  { id: 'whatsapp', etiqueta: 'WhatsApp', icono: 'fa-brands fa-whatsapp' },
];

const ZONAS_HORARIAS = [
  { valor: 'America/Mexico_City', texto: 'Centro (CDMX, Jalisco, Puerto Vallarta)' },
  { valor: 'America/Cancun', texto: 'Sureste (Quintana Roo)' },
  { valor: 'America/Mazatlan', texto: 'Pacífico (Sinaloa, Nayarit, BCS)' },
  { valor: 'America/Hermosillo', texto: 'Sonora' },
  { valor: 'America/Tijuana', texto: 'Noroeste (Baja California)' },
];

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const boton = {
  primario: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primario px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover',
  secundario: 'inline-flex items-center justify-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-2.5 text-sm font-bold text-texto transition-colors hover:bg-superficie-alt',
  quitar: 'flex size-10 shrink-0 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-acento/10 hover:text-acento-texto',
};

/** Rutas del catálogo disponibles para los enlaces de marcas y líneas. */
function rutasCatalogo() {
  return [
    { valor: '#productos', texto: 'Catálogo completo' },
    ...lineas.map((l) => ({ valor: `#productos/linea/${l.id}`, texto: `Línea · ${l.nombre.replace(/­/g, '')}` })),
    ...departamentos.flatMap((d) => [
      { valor: `#productos/${d.id}`, texto: d.nombre },
      ...d.subcategorias.map((s) => ({ valor: `#productos/${d.id}/${s.id}`, texto: `${d.nombre} › ${s.nombre}` })),
    ]),
  ];
}

const opcionesIconos = [...ICONOS, 'fa-brands fa-whatsapp'].map((i) => ({ valor: i, texto: i.replace(/fa-(solid|brands) fa-/, '') }));

/* ---------- Listas editables (bloques de horario, marcas, zonas de envío) ---------- */

/**
 * Filas con columnas definidas por `columnas` ({campo, etiqueta, tipo, opciones, max}).
 * Los controles se llaman `<lista>-<i>-<campo>` para poder leerlos de vuelta.
 */
function filas(lista, datos, columnas, { minimo = 0, textoAgregar }) {
  return `
    <div data-lista="${lista}" class="space-y-3">
      ${datos
        .map(
          (fila, i) => `
        <fieldset class="rounded-xl border border-borde p-3" data-fila="${i}">
          <legend class="sr-only">Elemento ${i + 1}</legend>
          <div class="flex items-start gap-2">
            <div class="grid min-w-0 flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-${Math.min(columnas.length, 4)}">
              ${columnas
                .map((c) => {
                  const nombre = `${lista}-${i}-${c.campo}`;
                  if (c.tipo === 'dias')
                    return `
                    <div class="sm:col-span-2 lg:col-span-${Math.min(columnas.length, 4)}" data-campo="${nombre}">
                      <p class="mb-1.5 text-sm font-semibold text-texto">${c.etiqueta}</p>
                      <div class="flex flex-wrap gap-1.5">
                        ${DIAS.map(
                          (d, n) => `
                          <label class="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-borde px-2.5 text-sm text-texto has-checked:border-primario has-checked:bg-primario-suave">
                            <input type="checkbox" name="${nombre}" value="${n}" ${fila[c.campo]?.includes(n) ? 'checked' : ''} class="size-4 accent-[var(--p-primario)]" /> ${d}
                          </label>`
                        ).join('')}
                      </div>
                      <p class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="${nombre}"></p>
                    </div>`;
                  return campo({
                    nombre, etiqueta: c.etiqueta, valor: fila[c.campo] ?? '', tipo: c.tipo ?? 'text', max: c.max,
                    opciones: c.opciones ?? null, atributos: c.atributos ?? '',
                  });
                })
                .join('')}
            </div>
            <button type="button" data-quitar-fila="${lista}|${i}" ${datos.length <= minimo ? 'disabled' : ''}
                    aria-label="Quitar elemento ${i + 1}" class="${boton.quitar} mt-6 disabled:opacity-30"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
          </div>
        </fieldset>`
        )
        .join('')}
      <button type="button" data-agregar-fila="${lista}" class="${boton.secundario} text-xs"><i class="fa-solid fa-plus" aria-hidden="true"></i> ${textoAgregar}</button>
    </div>`;
}

function leerFilas(form, lista, columnas) {
  return $$(`[data-lista="${lista}"] [data-fila]`, form).map((fs) => {
    const i = fs.dataset.fila;
    return Object.fromEntries(
      columnas.map((c) => {
        const nombre = `${lista}-${i}-${c.campo}`;
        if (c.tipo === 'dias') return [c.campo, $$(`[name="${nombre}"]:checked`, form).map((x) => Number(x.value))];
        const valor = form.elements[nombre]?.value.trim() ?? '';
        return [c.campo, c.tipo === 'number' ? (valor === '' ? NaN : Number(valor)) : valor];
      })
    );
  });
}

/* ---------- Definición de cada sección ---------- */

const texto = (v, { requerido = true, max, etiqueta = 'Este campo' } = {}) => {
  if (!v) return requerido ? `${etiqueta} es obligatorio.` : '';
  if (max && v.length > max) return `Máximo ${max} caracteres.`;
  if (TEXTO_PROHIBIDO.test(v)) return 'No se permiten los caracteres < >.';
  return '';
};

const COL_BLOQUES = [
  { campo: 'etiqueta', etiqueta: 'Nombre del bloque', max: 30 },
  { campo: 'abre', etiqueta: 'Abre', tipo: 'time' },
  { campo: 'cierra', etiqueta: 'Cierra', tipo: 'time' },
  { campo: 'dias', etiqueta: 'Días', tipo: 'dias' },
];
const colMarcas = () => [
  { campo: 'nombre', etiqueta: 'Marca', max: 40 },
  { campo: 'linea', etiqueta: 'Línea que representa', max: 60 },
  { campo: 'icono', etiqueta: 'Ícono', opciones: opcionesIconos },
  { campo: 'ruta', etiqueta: 'Enlace al catálogo', opciones: rutasCatalogo() },
];
const colLineas = () => [
  { campo: 'nombre', etiqueta: 'Línea', max: 40 },
  { campo: 'icono', etiqueta: 'Ícono', opciones: opcionesIconos },
  { campo: 'ruta', etiqueta: 'Enlace al catálogo', opciones: rutasCatalogo() },
];
const COL_ZONAS = [
  { campo: 'nombre', etiqueta: 'Zona', max: 40 },
  { campo: 'costo', etiqueta: 'Costo (MXN)', tipo: 'number', atributos: 'min="0" step="1"' },
];

/** Valores de trabajo de las listas (se reconstruyen al abrir cada sección). */
const trabajo = {};

const SECCION = {
  negocio: {
    titulo: 'Información del negocio',
    render: (ctx) => {
      const lim = ctx.config.limitesCaracteres;
      const omit = new Set(ctx.config.camposOmitidos.configuracion);
      const reglas = ctx.config.imagenes;
      return `
        <div class="grid gap-4 sm:grid-cols-2">
          ${campo({ nombre: 'nombre', etiqueta: 'Nombre', valor: negocio.nombre, requerido: true, max: lim.nombreNegocio, ancho: 'sm:col-span-2' })}
          ${campo({ nombre: 'nombreCorto', etiqueta: 'Nombre corto', valor: negocio.nombreCorto, requerido: true, max: 50 })}
          ${campo({ nombre: 'anioFundacion', etiqueta: 'Año de fundación', valor: negocio.anioFundacion, tipo: 'number', requerido: true, atributos: 'min="1800" step="1" inputmode="numeric"', ayuda: 'Se usa para calcular los años de trayectoria.' })}
          ${campo({ nombre: 'eslogan', etiqueta: 'Eslogan', valor: negocio.eslogan, max: lim.eslogan, ancho: 'sm:col-span-2', omitido: omit.has('eslogan') })}
        </div>
        <div class="mt-5 rounded-xl border border-borde p-4">
          <p class="text-sm font-semibold text-texto" id="adm-logo-etiqueta">Logotipo</p>
          <div class="mt-3 flex flex-wrap items-center gap-4">
            <div class="file-input-preview rounded-xl bg-white p-2 ring-1 ring-borde"><img data-vista-logo src="${escapar(negocio.logo.src)}" alt="" class="h-16 w-auto max-w-56 object-contain" /></div>
            <label class="${boton.secundario} cursor-pointer">
              <i class="fa-solid fa-upload" aria-hidden="true"></i> Cambiar logotipo
              <input type="file" name="archivoLogo" accept="${reglas.extensionesPermitidas.map((e) => `.${e}`).join(',')}" class="sr-only" aria-labelledby="adm-logo-etiqueta" aria-describedby="adm-logo-ayuda" />
            </label>
          </div>
          <p id="adm-logo-ayuda" class="mt-2 text-xs text-texto-tenue">${reglas.extensionesPermitidas.join(', ')} · máx. ${reglas.tamanoMaximoLogoMB} MB · de ${reglas.dimensionesMinimas.ancho}×${reglas.dimensionesMinimas.alto} a ${reglas.dimensionesMaximas.ancho}×${reglas.dimensionesMaximas.alto} px.</p>
          <p class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="archivoLogo" role="alert"></p>
          <div class="mt-3">${campo({ nombre: 'logoAlt', etiqueta: 'Texto alternativo del logotipo', valor: negocio.logo.alt, requerido: true, max: 100 })}</div>
        </div>`;
    },
    conectar: (form, ctx) => {
      trabajo.logo = null;
      form.elements.archivoLogo.addEventListener('change', async () => {
        const archivo = form.elements.archivoLogo.files[0];
        form.elements.archivoLogo.value = '';
        if (!archivo) return;
        mostrarError(form, 'archivoLogo', '');
        const reglas = ctx.config.imagenes;
        const r = await validarImagen(archivo, reglas, reglas.tamanoMaximoLogoMB);
        if (!r.valido) return mostrarError(form, 'archivoLogo', r.error);
        trabajo.logo = comprimirImagen(r.img, 1000, r.tipo);
        $('[data-vista-logo]', form).src = trabajo.logo.src;
        avisar('Logotipo listo. Guarda los cambios para conservarlo.', 'info');
      });
    },
    leer: (form, ctx) => {
      const lim = ctx.config.limitesCaracteres;
      const v = (n) => form.elements[n].value.trim();
      const anio = Number(v('anioFundacion'));
      const errores = {
        nombre: texto(v('nombre'), { max: lim.nombreNegocio, etiqueta: 'El nombre' }),
        nombreCorto: texto(v('nombreCorto'), { max: 50, etiqueta: 'El nombre corto' }),
        eslogan: texto(v('eslogan'), { requerido: false, max: lim.eslogan }),
        anioFundacion: Number.isInteger(anio) && anio >= 1800 && anio <= new Date().getFullYear() ? '' : `Escribe un año entre 1800 y ${new Date().getFullYear()}.`,
        logoAlt: texto(v('logoAlt'), { max: 100, etiqueta: 'El texto alternativo' }),
      };
      const parcial = { nombre: v('nombre'), nombreCorto: v('nombreCorto'), eslogan: v('eslogan'), anioFundacion: anio, logo: { alt: v('logoAlt') } };
      if (trabajo.logo) Object.assign(parcial.logo, { src: trabajo.logo.src, ancho: trabajo.logo.ancho, alto: trabajo.logo.alto });
      return { errores, parcial };
    },
  },

  contacto: {
    titulo: 'Datos de contacto',
    render: (ctx) => {
      const c = negocio.contacto;
      const d = c.direccion;
      const omit = new Set(ctx.config.camposOmitidos.configuracion);
      return `
        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Dirección</legend>
          ${campo({ nombre: 'calle', etiqueta: 'Calle y número', valor: d.calle, requerido: true, max: 80 })}
          ${campo({ nombre: 'colonia', etiqueta: 'Colonia', valor: d.colonia, requerido: true, max: 60 })}
          ${campo({ nombre: 'localidad', etiqueta: 'Localidad', valor: d.localidad, requerido: true, max: 60 })}
          ${campo({ nombre: 'cp', etiqueta: 'Código postal', valor: d.cp, requerido: true, atributos: 'inputmode="numeric" maxlength="5"' })}
          ${campo({ nombre: 'ciudad', etiqueta: 'Ciudad', valor: d.ciudad, requerido: true, max: 60 })}
          ${campo({ nombre: 'estado', etiqueta: 'Estado', valor: d.estado, requerido: true, max: 60 })}
          ${campo({ nombre: 'pais', etiqueta: 'País', valor: d.pais, requerido: true, max: 60 })}
        </fieldset>
        <fieldset class="mt-6 grid gap-4 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Teléfono y redes</legend>
          ${campo({ nombre: 'telefono', etiqueta: 'Teléfono (llamadas)', valor: c.telefono, requerido: true, tipo: 'tel', ayuda: '10 dígitos, p. ej. 322 224 5833.' })}
          ${campo({ nombre: 'whatsapp', etiqueta: 'WhatsApp (solo dígitos, con lada de país)', valor: c.whatsapp, requerido: true, tipo: 'tel', ayuda: 'Para los enlaces wa.me, p. ej. 5213330105206.' })}
          ${campo({ nombre: 'whatsappTexto', etiqueta: 'WhatsApp como se muestra', valor: c.whatsappTexto, requerido: true, max: 25 })}
          ${campo({ nombre: 'facebook', etiqueta: 'Página de Facebook', valor: c.facebook, tipo: 'url', omitido: omit.has('facebook'), ayuda: 'Dirección completa que empiece con https://' })}
        </fieldset>
        <fieldset class="${omit.has('coordenadas') ? 'campo-omitido' : ''} mt-6 grid gap-4 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Ubicación en el mapa</legend>
          ${campo({ nombre: 'lat', etiqueta: 'Latitud', valor: c.coordenadas.lat, tipo: 'number', atributos: 'step="0.000001" inputmode="decimal"' })}
          ${campo({ nombre: 'lon', etiqueta: 'Longitud', valor: c.coordenadas.lon, tipo: 'number', atributos: 'step="0.000001" inputmode="decimal"' })}
          <div class="sm:col-span-2">${casilla({ nombre: 'verificadas', etiqueta: 'Coordenadas verificadas', ayuda: 'Muestra el marcador del local en el mapa. Actívalo solo si las coordenadas son las exactas.', marcado: c.coordenadas.verificadas })}</div>
        </fieldset>`;
    },
    leer: (form) => {
      const v = (n) => form.elements[n].value.trim();
      const digitos = (t) => t.replace(/\D/g, '');
      const tel = digitos(v('telefono'));
      const wa = digitos(v('whatsapp'));
      const lat = Number(v('lat'));
      const lon = Number(v('lon'));
      const errores = {
        calle: texto(v('calle'), { max: 80, etiqueta: 'La calle' }),
        colonia: texto(v('colonia'), { max: 60, etiqueta: 'La colonia' }),
        localidad: texto(v('localidad'), { max: 60, etiqueta: 'La localidad' }),
        cp: /^\d{5}$/.test(v('cp')) ? '' : 'El código postal tiene 5 dígitos.',
        ciudad: texto(v('ciudad'), { max: 60, etiqueta: 'La ciudad' }),
        estado: texto(v('estado'), { max: 60, etiqueta: 'El estado' }),
        pais: texto(v('pais'), { max: 60, etiqueta: 'El país' }),
        telefono: tel.length === 10 || (tel.length === 12 && tel.startsWith('52')) ? texto(v('telefono'), { max: 25 }) : 'Escribe 10 dígitos (o 12 con el 52).',
        whatsapp: /^\d{10,15}$/.test(v('whatsapp')) ? '' : 'Solo dígitos, de 10 a 15, con la lada de país (p. ej. 521…).',
        whatsappTexto: texto(v('whatsappTexto'), { max: 25, etiqueta: 'El texto de WhatsApp' }),
        facebook: !v('facebook') || /^https:\/\/(www\.|m\.)?facebook\.com\/[^\s<>"]+$/i.test(v('facebook')) ? '' : 'Escribe la dirección completa de Facebook (https://www.facebook.com/…).',
        lat: Number.isFinite(lat) && lat >= -90 && lat <= 90 ? '' : 'Latitud entre -90 y 90.',
        lon: Number.isFinite(lon) && lon >= -180 && lon <= 180 ? '' : 'Longitud entre -180 y 180.',
      };
      const local = tel.slice(-10);
      return {
        errores,
        parcial: {
          contacto: {
            direccion: { calle: v('calle'), colonia: v('colonia'), localidad: v('localidad'), cp: v('cp'), ciudad: v('ciudad'), estado: v('estado'), pais: v('pais') },
            telefono: v('telefono'),
            telefonoHref: `tel:+52${local}`,
            whatsapp: wa,
            whatsappTexto: v('whatsappTexto'),
            facebook: v('facebook'),
            coordenadas: { lat, lon, verificadas: form.elements.verificadas.checked },
          },
        },
      };
    },
  },

  horario: {
    titulo: 'Horario de atención',
    render: () => {
      trabajo.bloques ??= structuredClone(negocio.horario.bloques);
      return `
        ${campo({ nombre: 'zonaHoraria', etiqueta: 'Zona horaria', valor: negocio.horario.zonaHoraria, opciones: ZONAS_HORARIAS, ayuda: 'El estado "Abierto ahora" se calcula con esta zona, aunque el visitante esté en otro país.' })}
        <h3 class="mb-3 mt-6 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Bloques de horario</h3>
        ${filas('bloques', trabajo.bloques, COL_BLOQUES, { minimo: 1, textoAgregar: 'Agregar bloque' })}`;
    },
    nuevaFila: () => ({ etiqueta: '', dias: [], abre: '09:00', cierra: '18:00' }),
    columnas: () => COL_BLOQUES,
    lista: 'bloques',
    leer: (form) => {
      const bloques = leerFilas(form, 'bloques', COL_BLOQUES);
      const errores = {};
      const usados = new Map();
      bloques.forEach((b, i) => {
        const p = `bloques-${i}-`;
        errores[`${p}etiqueta`] = texto(b.etiqueta, { max: 30, etiqueta: 'El nombre' });
        if (!/^\d{2}:\d{2}$/.test(b.abre)) errores[`${p}abre`] = 'Usa el formato HH:MM.';
        if (!/^\d{2}:\d{2}$/.test(b.cierra)) errores[`${p}cierra`] = 'Usa el formato HH:MM.';
        else if (b.abre >= b.cierra) errores[`${p}cierra`] = 'Debe ser después de la apertura.';
        if (!b.dias.length) errores[`${p}dias`] = 'Elige al menos un día.';
        const repetido = b.dias.find((d) => usados.has(d));
        if (repetido !== undefined) errores[`${p}dias`] = `${DIAS[repetido]} ya está en el bloque ${usados.get(repetido) + 1}.`;
        b.dias.forEach((d) => usados.set(d, i));
      });
      return { errores, parcial: { horario: { zonaHoraria: form.elements.zonaHoraria.value, bloques } } };
    },
  },

  marcas: {
    titulo: 'Marcas y líneas de la portada',
    render: () => {
      trabajo.destacadas ??= structuredClone(negocio.marcas.destacadas);
      trabajo.lineasMarca ??= structuredClone(negocio.marcas.lineas); // conserva el guion opcional invisible (U+00AD)
      return `
        <h3 class="mb-1 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Marcas destacadas</h3>
        <p class="mb-3 text-xs text-texto-tenue">Aparecen en la franja de la portada y llevan estrella en las tarjetas del catálogo.</p>
        ${filas('destacadas', trabajo.destacadas, colMarcas(), { textoAgregar: 'Agregar marca' })}
        <h3 class="mb-1 mt-6 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Líneas de producto</h3>
        <p class="mb-3 text-xs text-texto-tenue">Se muestran junto a las marcas como "Línea · Marcas líderes del mercado".</p>
        ${filas('lineasMarca', trabajo.lineasMarca, colLineas(), { textoAgregar: 'Agregar línea' })}`;
    },
    listas: { destacadas: () => ({ nombre: '', linea: '', icono: ICONOS[0], ruta: '#productos' }), lineasMarca: () => ({ nombre: '', icono: ICONOS[0], ruta: '#productos' }) },
    leer: (form) => {
      const destacadas = leerFilas(form, 'destacadas', colMarcas());
      const lineasMarca = leerFilas(form, 'lineasMarca', colLineas());
      const errores = {};
      destacadas.forEach((m, i) => {
        errores[`destacadas-${i}-nombre`] = texto(m.nombre, { max: 40, etiqueta: 'La marca' });
        errores[`destacadas-${i}-linea`] = texto(m.linea, { max: 60, etiqueta: 'La línea' });
      });
      lineasMarca.forEach((l, i) => (errores[`lineasMarca-${i}-nombre`] = texto(l.nombre, { max: 40, etiqueta: 'La línea' })));
      return { errores, parcial: { marcas: { destacadas, lineas: lineasMarca } } };
    },
  },

  pago: {
    titulo: 'Pago en línea y envío',
    render: () => {
      const p = negocio.pago;
      trabajo.zonas ??= structuredClone(p.envio.zonas);
      return `
        <div class="rounded-xl border border-destaque/60 bg-destaque/10 p-4 text-sm text-texto">
          <p class="font-bold"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Solo el modo demostración está implementado</p>
          <p class="mt-1 text-texto-suave">Elegir otro procesador no activa cobros reales: el formulario seguirá simulando hasta integrar el SDK oficial del procesador y un servidor.</p>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">${casilla({ nombre: 'habilitado', etiqueta: 'Pago con tarjeta disponible en el carrito', ayuda: 'Si lo desactivas, el carrito solo ofrece WhatsApp.', marcado: p.habilitado })}</div>
          ${campo({ nombre: 'procesador', etiqueta: 'Procesador', valor: p.procesador, opciones: [
            { valor: 'demo', texto: 'Demostración (simulado)' }, { valor: 'stripe', texto: 'Stripe' },
            { valor: 'mercadopago', texto: 'Mercado Pago' }, { valor: 'clip', texto: 'Clip' },
          ] })}
          ${campo({ nombre: 'public_key', etiqueta: 'Clave pública', valor: p.configuracion.public_key, ayuda: 'Solo la pública (pk_…). Nunca escribas aquí la clave secreta.', atributos: 'autocomplete="off" spellcheck="false"' })}
          ${campo({ nombre: 'moneda', etiqueta: 'Moneda', valor: p.configuracion.moneda, opciones: [{ valor: 'MXN', texto: 'MXN · Peso mexicano' }], ayuda: 'Los precios del catálogo están en pesos; otra moneda requeriría convertirlos.' })}
          ${campo({ nombre: 'impuesto', etiqueta: 'IVA incluido (%)', valor: Math.round(p.configuracion.impuesto * 10000) / 100, tipo: 'number', atributos: 'min="0" max="100" step="0.01"', ayuda: 'Solo para el desglose: los precios ya lo incluyen.' })}
        </div>
        <h3 class="mb-3 mt-6 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Envío a domicilio</h3>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">${casilla({ nombre: 'envioDisponible', etiqueta: 'Ofrecer envío a domicilio', marcado: p.envio.disponible })}</div>
          ${campo({ nombre: 'costoBase', etiqueta: 'Costo base ("Otra zona")', valor: p.envio.costo, tipo: 'number', atributos: 'min="0" step="1"' })}
          ${campo({ nombre: 'gratisMinimo', etiqueta: 'Envío gratis desde (MXN)', valor: p.envio.gratisMinimo, tipo: 'number', atributos: 'min="0" step="1"' })}
        </div>
        <div class="mt-4">${filas('zonas', trabajo.zonas, COL_ZONAS, { textoAgregar: 'Agregar zona' })}</div>`;
    },
    listas: { zonas: () => ({ nombre: '', costo: 0 }) },
    leer: (form) => {
      const v = (n) => form.elements[n].value.trim();
      const zonas = leerFilas(form, 'zonas', COL_ZONAS);
      const impuesto = Number(v('impuesto'));
      const costo = Number(v('costoBase'));
      const gratis = Number(v('gratisMinimo'));
      const errores = {
        public_key: /^sk_/i.test(v('public_key')) ? 'Esa es una clave SECRETA: nunca la pongas en el sitio.' : texto(v('public_key'), { requerido: false, max: 200 }),
        impuesto: Number.isFinite(impuesto) && impuesto >= 0 && impuesto <= 100 ? '' : 'Entre 0 y 100.',
        costoBase: Number.isFinite(costo) && costo >= 0 ? '' : 'Debe ser 0 o más.',
        gratisMinimo: Number.isFinite(gratis) && gratis >= 0 ? '' : 'Debe ser 0 o más.',
      };
      zonas.forEach((z, i) => {
        errores[`zonas-${i}-nombre`] = texto(z.nombre, { max: 40, etiqueta: 'La zona' });
        errores[`zonas-${i}-costo`] = Number.isFinite(z.costo) && z.costo >= 0 ? '' : 'Debe ser 0 o más.';
      });
      return {
        errores,
        parcial: {
          pago: {
            habilitado: form.elements.habilitado.checked,
            procesador: v('procesador'),
            configuracion: { public_key: v('public_key'), moneda: v('moneda'), impuesto: Math.round(impuesto * 100) / 10000 },
            envio: { disponible: form.elements.envioDisponible.checked, costo, gratisMinimo: gratis, zonas },
          },
        },
      };
    },
  },

  valoracion: {
    titulo: 'Tarjeta de valoración',
    render: () => {
      const v = negocio.valoracion;
      return `
        ${casilla({ nombre: 'habilitado', etiqueta: 'Mostrar la tarjeta de valoración', ayuda: 'Aparece en la esquina inferior izquierda del sitio.', marcado: v.habilitado !== false })}
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          ${campo({ nombre: 'titulo', etiqueta: 'Título', valor: v.titulo, requerido: true, max: 80, ancho: 'sm:col-span-2' })}
          ${campo({ nombre: 'texto', etiqueta: 'Texto', valor: v.texto, requerido: true, max: 160, ancho: 'sm:col-span-2' })}
          ${campo({ nombre: 'agradecimiento', etiqueta: 'Mensaje de agradecimiento', valor: v.agradecimiento, requerido: true, max: 80 })}
          ${campo({ nombre: 'retrasoMs', etiqueta: 'Aparece después de (ms)', valor: v.retrasoMs, tipo: 'number', atributos: 'min="0" max="60000" step="500"', ayuda: '4000 = 4 segundos.' })}
        </div>
        <fieldset class="mt-4">
          <legend class="mb-2 text-sm font-semibold text-texto">Etiquetas de las 5 estrellas</legend>
          <div class="grid gap-3 sm:grid-cols-5">
            ${v.etiquetas.map((e, i) => campo({ nombre: `etiqueta${i}`, etiqueta: `${i + 1} ★`, valor: e, requerido: true, max: 20 })).join('')}
          </div>
        </fieldset>`;
    },
    leer: (form) => {
      const v = (n) => form.elements[n].value.trim();
      const retraso = Number(v('retrasoMs'));
      const etiquetas = [0, 1, 2, 3, 4].map((i) => v(`etiqueta${i}`));
      const errores = {
        titulo: texto(v('titulo'), { max: 80, etiqueta: 'El título' }),
        texto: texto(v('texto'), { max: 160, etiqueta: 'El texto' }),
        agradecimiento: texto(v('agradecimiento'), { max: 80, etiqueta: 'El mensaje' }),
        retrasoMs: Number.isInteger(retraso) && retraso >= 0 && retraso <= 60000 ? '' : 'Entre 0 y 60000.',
      };
      etiquetas.forEach((e, i) => (errores[`etiqueta${i}`] = texto(e, { max: 20, etiqueta: 'La etiqueta' })));
      return {
        errores,
        parcial: { valoracion: { habilitado: form.elements.habilitado.checked, titulo: v('titulo'), texto: v('texto'), agradecimiento: v('agradecimiento'), retrasoMs: retraso, etiquetas } },
      };
    },
  },

  whatsapp: {
    titulo: 'Mensajes de WhatsApp',
    render: () => `
      <div class="grid gap-4">
        ${campo({ nombre: 'general', etiqueta: 'Mensaje general', valor: negocio.mensajesWhatsApp.general, area: true, requerido: true, max: 500, ayuda: 'Botón flotante de WhatsApp, pie de página y valoración.' })}
        ${campo({ nombre: 'cotizacion', etiqueta: 'Mensaje de cotización', valor: negocio.mensajesWhatsApp.cotizacion, area: true, requerido: true, max: 500, ayuda: 'Botones "Cotizar" del encabezado y la portada.' })}
      </div>`,
    leer: (form) => {
      const v = (n) => form.elements[n].value.trim();
      return {
        errores: { general: texto(v('general'), { max: 500, etiqueta: 'El mensaje' }), cotizacion: texto(v('cotizacion'), { max: 500, etiqueta: 'El mensaje' }) },
        parcial: { mensajesWhatsApp: { general: v('general'), cotizacion: v('cotizacion') } },
      };
    },
  },
};

/* ---------- Vista ---------- */

export function renderAdminConfig(contenedor, ctx, subvista) {
  const id = SECCION[subvista] ? subvista : 'negocio';
  const seccion = SECCION[id];
  Object.keys(trabajo).forEach((k) => delete trabajo[k]);

  contenedor.innerHTML = `
    <div data-seccion>
      <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Configuración</h1>
      <p class="mt-1 text-sm text-texto-suave">Datos del negocio que se muestran en el sitio.</p>
      <nav aria-label="Secciones de configuración" class="carril -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        ${SECCIONES.map(
          (s) => `
          <a href="#admin/configuracion/${s.id}" ${s.id === id ? 'aria-current="page"' : ''}
             class="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${s.id === id ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie text-texto-suave hover:text-texto'}">
            <i class="${s.icono}" aria-hidden="true"></i> ${s.etiqueta}
          </a>`
        ).join('')}
      </nav>

      <form class="admin-form mt-6 rounded-2xl border border-borde bg-superficie" novalidate>
        <div class="border-b border-borde px-5 py-4"><h2 class="text-lg font-extrabold text-texto">${seccion.titulo}</h2></div>
        <div class="p-5" data-cuerpo>${seccion.render(ctx)}</div>
        <div class="sticky bottom-14 flex flex-wrap justify-end gap-2 rounded-b-2xl border-t border-borde bg-superficie px-5 py-4 lg:bottom-0">
          <button type="button" data-descartar class="${boton.secundario}">Descartar cambios</button>
          <button type="submit" class="${boton.primario}"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar</button>
        </div>
      </form>
    </div>`;

  const form = $('form', contenedor);
  conectarContadores(form);
  seccion.conectar?.(form, ctx);

  const listas = seccion.listas ?? (seccion.lista ? { [seccion.lista]: seccion.nuevaFila } : {});
  const columnasDe = (lista) =>
    ({ bloques: COL_BLOQUES, destacadas: colMarcas(), lineasMarca: colLineas(), zonas: COL_ZONAS })[lista];

  /** Agrega o quita filas conservando lo que ya se escribió. */
  form.addEventListener('click', (e) => {
    const agregar = e.target.closest('[data-agregar-fila]');
    const quitar = e.target.closest('[data-quitar-fila]');
    if (!agregar && !quitar) return;
    const lista = agregar ? agregar.dataset.agregarFila : quitar.dataset.quitarFila.split('|')[0];
    trabajo[lista] = leerFilas(form, lista, columnasDe(lista));
    if (agregar) trabajo[lista].push(listas[lista]());
    else trabajo[lista].splice(Number(quitar.dataset.quitarFila.split('|')[1]), 1);
    $('[data-cuerpo]', form).innerHTML = seccion.render(ctx);
    conectarContadores(form);
    seccion.conectar?.(form, ctx);
    const filasLista = $$(`[data-lista="${lista}"] [data-fila]`, form);
    ((agregar ? filasLista.at(-1) : filasLista[0])?.querySelector('input, select') ?? $(`[data-agregar-fila="${lista}"]`, form))?.focus();
  });

  $('[data-descartar]', form).addEventListener('click', () => {
    renderAdminConfig(contenedor, ctx, id);
    avisar('Cambios descartados.', 'info');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { errores, parcial } = seccion.leer(form, ctx);
    const campos = Object.keys(errores);
    if (!mostrarErrores(form, errores, campos)) return avisar('Revisa los campos marcados.', 'error');
    const respaldo = structuredClone(Object.fromEntries(Object.keys(parcial).map((k) => [k, negocio[k]])));
    aplicarNegocio(parcial);
    if (!ctx.guardar('Configuración guardada. La verás en el sitio al volver a él.')) aplicarNegocio(respaldo);
    else if (trabajo.logo) trabajo.logo = null;
  });
}
