import { negocio } from './data.js';
import { productos, departamentos, precioMXN } from './catalogo.js';
import { almacen, almacenSesion } from './almacen.js';
import { obtenerHistorial } from './pago.js';
import {
  estadoCarga, guardarDatos, instantanea, validarDatos, reemplazarDatosLocales, borrarDatosLocales,
  ultimaModificacion, espacioUsadoKB, leerConfigAdmin, guardarConfigAdmin, restaurarConfigAdmin, CONFIG_POR_DEFECTO,
} from './admin-datos.js';
import {
  $, $$, escapar, avisar, abrirModal, confirmar, campo, casilla, mostrarErrores, descargarJSON,
} from './admin-ui.js';
import { renderAdminCatalogo, CAMPOS_PRODUCTO_OMITIBLES } from './admin-catalogo.js';
import { renderAdminConfig, CAMPOS_CONFIG_OMITIBLES } from './admin-config.js';
import { renderAdminGaleria } from './admin-galeria.js';

/*
 * Vista de administrador (#admin): dashboard, catálogo, configuración, galería, pedidos y ajustes.
 *
 * - Es una capa a pantalla completa, separada de la vista cliente: no modifica su HTML y,
 *   al salir, el sitio se recarga si hubo cambios para mostrarlos.
 * - Acceso con PIN: se guarda solo su huella SHA-256 (nunca el PIN). Si data.js no trae
 *   `admin.pinHash`, el primer acceso pide crear uno (queda en este navegador).
 * - Sesión en sessionStorage con cierre automático por inactividad.
 * - ⚠ Todo ocurre en el navegador: es una protección básica, no apta como seguridad real.
 *   Los cambios se guardan en localStorage de ESTE navegador; para publicarlos a todos los
 *   visitantes se exportan a JSON (Ajustes › Datos) y se configura `admin.datosPublicados`.
 */

const CLAVE_PIN = 'arcos-admin-pin';
const CLAVE_SESION = 'arcos-admin-sesion';
const CLAVE_INTENTOS = 'arcos-admin-intentos';
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60_000;

export const vistasAdmin = [
  { id: 'dashboard', etiqueta: 'Dashboard', corta: 'Resumen', icono: 'fa-solid fa-chart-line' },
  { id: 'catalogo', etiqueta: 'Catálogo', corta: 'Catálogo', icono: 'fa-solid fa-boxes-stacked' },
  { id: 'configuracion', etiqueta: 'Configuración', corta: 'Negocio', icono: 'fa-solid fa-gear' },
  { id: 'galeria', etiqueta: 'Galería', corta: 'Galería', icono: 'fa-solid fa-images' },
  { id: 'pedidos', etiqueta: 'Pedidos', corta: 'Pedidos', icono: 'fa-solid fa-receipt' },
  { id: 'ajustes', etiqueta: 'Ajustes', corta: 'Ajustes', icono: 'fa-solid fa-sliders' },
];

let raiz = null;
let principal = null;
let visible = false;
let autenticado = false;
let config = leerConfigAdmin();
let ruta = { seccion: 'dashboard', sub: '' };
let ultimoToque = 0;

const ctx = {
  get config() {
    return config;
  },
  /** Persiste el estado actual del catálogo y del negocio. */
  guardar(mensaje = 'Cambios guardados.') {
    const ok = guardarDatos();
    if (ok) avisar(mensaje);
    else avisar('El navegador no tiene espacio para guardar. Quita imágenes grandes o exporta y restaura los datos.', 'error');
    return ok;
  },
};

const boton = {
  primario: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primario px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover disabled:opacity-60',
  secundario: 'inline-flex items-center justify-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-2.5 text-sm font-bold text-texto transition-colors hover:bg-superficie-alt',
  peligro: 'inline-flex items-center justify-center gap-2 rounded-xl bg-acento px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-acento-hover',
};

export const esModoAdmin = () => location.hash.startsWith('#admin');

/* ================= PIN y sesión ================= */

const criptoDisponible = () => !!globalThis.crypto?.subtle;

async function huellaPin(pin) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`arcos-admin:${pin}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const pinConfigurado = () => negocio.admin.pinHash || almacen.leer(CLAVE_PIN) || '';

function sesionVigente() {
  try {
    const sesion = JSON.parse(almacenSesion.leer(CLAVE_SESION) ?? 'null');
    return !!sesion && Date.now() - sesion.ultimaActividad < config.sesion.timeoutMinutos * 60_000;
  } catch {
    return false;
  }
}

function tocarSesion() {
  ultimoToque = Date.now();
  almacenSesion.guardar(CLAVE_SESION, JSON.stringify({ ultimaActividad: ultimoToque }));
}

function cerrarSesion(motivo = '') {
  autenticado = false;
  almacenSesion.quitar(CLAVE_SESION);
  if (visible) renderAcceso(motivo);
}

function leerIntentos() {
  try {
    return JSON.parse(almacenSesion.leer(CLAVE_INTENTOS) ?? 'null') ?? { n: 0, hasta: 0 };
  } catch {
    return { n: 0, hasta: 0 };
  }
}

/* ================= Armazón ================= */

function renderArmazon(contenedor) {
  contenedor.innerHTML = `
    <div id="admin" hidden class="admin-layout fixed inset-0 z-[90] flex bg-fondo text-texto-suave" aria-label="Panel de administración">
      <aside class="admin-sidebar hidden w-64 shrink-0 flex-col border-r border-borde bg-superficie lg:flex" data-solo-sesion>
        <div class="flex items-center gap-3 border-b border-borde px-5 py-4">
          <span class="rounded-lg bg-white p-1 ring-1 ring-borde"><img src="${escapar(negocio.logo.src)}" alt="" class="h-8 w-auto" /></span>
          <span class="leading-tight"><span class="block text-sm font-extrabold text-texto">Administración</span><span class="block text-xs text-texto-tenue">${escapar(negocio.nombreCorto)}</span></span>
        </div>
        <nav aria-label="Secciones de administración" class="flex-1 space-y-1 p-3" data-nav></nav>
        <div class="space-y-1 border-t border-borde p-3">
          <a href="#inicio" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto"><i class="fa-solid fa-arrow-up-right-from-square w-5 text-center" aria-hidden="true"></i> Ver sitio</a>
          <button type="button" data-cerrar-sesion class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-texto-suave transition-colors hover:bg-acento/10 hover:text-acento-texto"><i class="fa-solid fa-right-from-bracket w-5 text-center" aria-hidden="true"></i> Cerrar sesión</button>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="flex items-center justify-between gap-3 border-b border-borde bg-superficie px-4 py-3 sm:px-6">
          <nav aria-label="Ruta" data-migas class="min-w-0 text-sm"></nav>
          <div class="flex shrink-0 items-center gap-1">
            <button type="button" data-modo-admin class="flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto"><i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i></button>
            <a href="#inicio" aria-label="Ver sitio" class="flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto lg:hidden"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>
            <button type="button" data-cerrar-sesion data-solo-sesion aria-label="Cerrar sesión" class="flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-acento/10 hover:text-acento-texto lg:hidden"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i></button>
          </div>
        </header>
        <main id="admin-principal" class="min-h-0 flex-1 overflow-y-auto px-4 pt-6 sm:px-6 lg:px-8"></main>
      </div>

      <nav aria-label="Secciones de administración" class="admin-nav-movil pestanas-seguras fixed inset-x-0 bottom-0 z-10 grid grid-cols-6 border-t border-borde bg-superficie/95 backdrop-blur-md lg:hidden" data-nav-movil data-solo-sesion></nav>
      <div id="admin-avisos" class="pointer-events-none fixed inset-x-4 bottom-20 z-[100] flex flex-col items-end gap-2 sm:left-auto lg:bottom-6"></div>
    </div>`;

  raiz = $('#admin', contenedor);
  principal = $('#admin-principal', raiz);

  raiz.addEventListener('click', (e) => {
    if (e.target.closest('[data-cerrar-sesion]')) {
      cerrarSesion('Cerraste la sesión.');
      return;
    }
    if (e.target.closest('[data-modo-admin]')) {
      document.getElementById('boton-modo')?.click(); // reutiliza el interruptor del sitio
      actualizarBotonModo();
    }
  });

  // Actividad: mantiene viva la sesión (como máximo una escritura cada 10 s).
  const actividad = () => autenticado && Date.now() - ultimoToque > 10_000 && tocarSesion();
  raiz.addEventListener('pointerdown', actividad);
  raiz.addEventListener('keydown', actividad);
  setInterval(() => {
    if (autenticado && !sesionVigente()) cerrarSesion(`La sesión se cerró tras ${config.sesion.timeoutMinutos} minutos sin actividad.`);
  }, 20_000);
}

function actualizarBotonModo() {
  const oscuro = document.documentElement.dataset.modo === 'oscuro';
  const b = $('[data-modo-admin]', raiz);
  b.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
  b.innerHTML = `<i class="fa-solid ${oscuro ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
}

/** Dibuja el menú lateral y la barra inferior con la sección activa, y la ruta de navegación. */
function marcarNavegacion() {
  const enlace = (v, movil) => {
    const activo = v.id === ruta.seccion;
    const clase = movil
      ? `flex flex-col items-center gap-1 pb-2.5 pt-3 text-[0.68rem] font-semibold transition-colors ${activo ? 'text-primario-texto' : 'text-texto-tenue'}`
      : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${activo ? 'bg-primario-suave text-primario-texto' : 'text-texto-suave hover:bg-superficie-alt hover:text-texto'}`;
    return `<a href="#admin/${v.id}" class="${clase}" ${activo ? 'aria-current="page"' : ''}>
      <i class="${v.icono} ${movil ? 'text-lg' : 'w-5 text-center'}" aria-hidden="true"></i> ${movil ? v.corta : v.etiqueta}</a>`;
  };
  $('[data-nav]', raiz).innerHTML = vistasAdmin.map((v) => enlace(v, false)).join('');
  $('[data-nav-movil]', raiz).innerHTML = vistasAdmin.map((v) => enlace(v, true)).join('');

  const vista = vistasAdmin.find((v) => v.id === ruta.seccion);
  const pasos = ['Administración', vista?.etiqueta, ruta.sub && ruta.sub[0].toUpperCase() + ruta.sub.slice(1)].filter(Boolean);
  $('[data-migas]', raiz).innerHTML = `<ol class="flex items-center gap-1.5 truncate text-texto-tenue">${pasos
    .map((p, i) => (i === pasos.length - 1 ? `<li class="truncate font-semibold text-texto" aria-current="page">${escapar(p)}</li>` : `<li>${escapar(p)}</li><li aria-hidden="true"><i class="fa-solid fa-chevron-right text-[0.6rem]"></i></li>`))
    .join('')}</ol>`;
}

const alternarNavSesion = (mostrar) => $$('[data-solo-sesion]', raiz).forEach((el) => (el.hidden = !mostrar));

/* ================= Acceso ================= */

function renderAcceso(mensaje = '') {
  alternarNavSesion(false);
  $('[data-migas]', raiz).innerHTML = '<span class="font-semibold text-texto">Administración · Acceso</span>';
  const crear = !pinConfigurado();
  const intentos = leerIntentos();
  const bloqueado = intentos.hasta > Date.now();

  principal.innerHTML = `
    <div class="mx-auto mt-6 max-w-sm sm:mt-16">
      <div class="rounded-3xl border border-borde bg-superficie p-6 shadow-xl shadow-black/5 sm:p-8">
        <span class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primario-suave text-2xl text-primario-texto"><i class="fa-solid fa-lock" aria-hidden="true"></i></span>
        <h1 id="admin-titulo" tabindex="-1" class="mt-4 text-center text-xl font-extrabold text-texto focus:outline-none">${crear ? 'Crea tu PIN de administración' : 'Panel de administración'}</h1>
        <p class="mt-1 text-center text-sm text-texto-suave">${crear ? 'Es el primer acceso en este navegador. Elige un PIN de 4 a 8 dígitos.' : 'Escribe tu PIN para continuar.'}</p>
        ${mensaje ? `<p class="mt-4 rounded-xl bg-superficie-alt px-3 py-2 text-center text-sm text-texto" role="status">${escapar(mensaje)}</p>` : ''}
        ${
          !criptoDisponible()
            ? '<p class="mt-4 rounded-xl bg-acento/10 p-3 text-sm text-acento-texto" role="alert">El panel necesita abrirse desde https o desde localhost (el navegador bloquea el cifrado en otras direcciones).</p>'
            : `<form class="mt-5 space-y-4" novalidate>
                ${campo({ nombre: 'pin', etiqueta: 'PIN', tipo: 'password', requerido: true, atributos: `inputmode="numeric" autocomplete="${crear ? 'new-password' : 'current-password'}" maxlength="8" data-autofoco ${bloqueado ? 'disabled' : ''}` })}
                ${crear ? campo({ nombre: 'confirmacion', etiqueta: 'Confirma el PIN', tipo: 'password', requerido: true, atributos: 'inputmode="numeric" autocomplete="new-password" maxlength="8"' }) : ''}
                <p class="text-xs text-acento-texto" data-bloqueo role="alert">${bloqueado ? `Demasiados intentos. Espera ${Math.ceil((intentos.hasta - Date.now()) / 1000)} s.` : ''}</p>
                <button type="submit" class="${boton.primario} w-full py-3" ${bloqueado ? 'disabled' : ''}>${crear ? 'Crear PIN y entrar' : 'Entrar'}</button>
              </form>
              <p class="mt-4 text-center text-xs text-texto-tenue">${crear ? 'Se guarda cifrado (SHA-256) solo en este navegador.' : `La sesión se cierra tras ${config.sesion.timeoutMinutos} minutos sin actividad.`}</p>`
        }
      </div>
      <p class="mt-4 text-center"><a href="#inicio" class="text-sm font-semibold text-primario-texto hover:underline">← Volver al sitio</a></p>
    </div>`;

  const form = $('form', principal);
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pin = form.elements.pin.value.trim();
      const errores = {};
      if (!/^\d{4,8}$/.test(pin)) errores.pin = 'El PIN tiene de 4 a 8 dígitos.';
      if (crear && !errores.pin && pin !== form.elements.confirmacion.value.trim()) errores.confirmacion = 'Los PIN no coinciden.';
      if (!mostrarErrores(form, errores, crear ? ['pin', 'confirmacion'] : ['pin'])) return;

      const huella = await huellaPin(pin);
      if (crear) {
        almacen.guardar(CLAVE_PIN, huella);
        avisar('PIN creado. Guárdalo en un lugar seguro.');
      } else if (huella !== pinConfigurado()) {
        const n = leerIntentos().n + 1;
        const nuevo = n >= MAX_INTENTOS ? { n: 0, hasta: Date.now() + BLOQUEO_MS } : { n, hasta: 0 };
        almacenSesion.guardar(CLAVE_INTENTOS, JSON.stringify(nuevo));
        form.elements.pin.value = '';
        if (nuevo.hasta) return renderAcceso('Demasiados intentos fallidos. Espera un minuto.');
        mostrarErrores(form, { pin: `PIN incorrecto. Te quedan ${MAX_INTENTOS - n} intentos.` }, ['pin']);
        return;
      }
      almacenSesion.quitar(CLAVE_INTENTOS);
      autenticado = true;
      tocarSesion();
      renderSeccion();
    });
  }
  if (bloqueado) setTimeout(() => visible && !autenticado && renderAcceso(), intentos.hasta - Date.now() + 100);
  $('#admin-titulo', principal).focus({ preventScroll: true });
  ($('[data-autofoco]', principal) ?? null)?.focus();
}

/* ================= Dashboard ================= */

function renderDashboard() {
  const historial = obtenerHistorial();
  const calificacion = Number(almacen.leer('arcos-valoracion')) || 0;
  const agotados = productos.filter((p) => p.stock === 0);
  const bajos = productos.filter((p) => p.stock > 0 && p.stock <= 3).sort((a, b) => a.stock - b.stock);
  const modificado = ultimaModificacion();
  const tarjetas = [
    { icono: 'fa-boxes-stacked', etiqueta: 'Productos', valor: productos.length, detalle: `${departamentos.length} departamentos`, enlace: '#admin/catalogo/productos' },
    { icono: 'fa-circle-check', etiqueta: 'Disponibles', valor: productos.length - agotados.length, detalle: `${bajos.length} con existencia baja`, enlace: '#admin/catalogo/productos' },
    { icono: 'fa-ban', etiqueta: 'Agotados', valor: agotados.length, detalle: 'Sin existencias', enlace: '#admin/catalogo/productos', alerta: agotados.length > 0 },
    { icono: 'fa-tags', etiqueta: 'En oferta', valor: productos.filter((p) => p.antes).length, detalle: `${productos.filter((p) => p.destacado).length} destacados`, enlace: '#admin/catalogo/productos' },
    { icono: 'fa-receipt', etiqueta: 'Pedidos (demo)', valor: historial.length, detalle: precioMXN(historial.reduce((s, p) => s + p.total, 0)), enlace: '#admin/pedidos' },
    { icono: 'fa-star', etiqueta: 'Valoración', valor: calificacion ? `${calificacion}/5` : '—', detalle: 'En este navegador', enlace: '#admin/configuracion/valoracion' },
  ];

  principal.innerHTML = `
    <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Dashboard</h1>
    <p class="mt-1 text-sm text-texto-suave">Resumen de ${escapar(negocio.nombre)}.</p>

    <ul class="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
      ${tarjetas
        .map(
          (t) => `
        <li>
          <a href="${t.enlace}" class="admin-card group flex h-full flex-col rounded-2xl border border-borde bg-superficie p-4 transition duration-300 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-lg hover:shadow-black/5">
            <span class="flex size-10 items-center justify-center rounded-xl ${t.alerta ? 'bg-acento/10 text-acento-texto' : 'bg-primario-suave text-primario-texto'}"><i class="fa-solid ${t.icono}" aria-hidden="true"></i></span>
            <span class="mt-3 text-2xl font-extrabold tabular-nums text-texto">${t.valor}</span>
            <span class="text-sm font-semibold text-texto">${t.etiqueta}</span>
            <span class="mt-0.5 text-xs text-texto-tenue">${escapar(t.detalle)}</span>
          </a>
        </li>`
        )
        .join('')}
    </ul>

    <div class="mt-6 grid gap-4 lg:grid-cols-2">
      <section class="admin-card rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-stock">
        <h2 id="titulo-stock" class="font-extrabold text-texto">Existencias por revisar</h2>
        ${
          agotados.length + bajos.length
            ? `<ul class="mt-3 divide-y divide-borde text-sm">
                ${[...agotados, ...bajos]
                  .slice(0, 8)
                  .map(
                    (p) => `<li class="flex items-center justify-between gap-3 py-2"><span class="min-w-0 truncate text-texto">${escapar(p.nombre)} <span class="text-xs text-texto-tenue">${escapar(p.sku)}</span></span>
                      <span class="shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${p.stock ? 'bg-destaque/20 text-texto' : 'bg-acento/10 text-acento-texto'}">${p.stock ? `${p.stock} pzas.` : 'Agotado'}</span></li>`
                  )
                  .join('')}
              </ul>
              <a href="#admin/catalogo/productos" class="mt-3 inline-flex text-sm font-bold text-primario-texto hover:underline">Ir al catálogo</a>`
            : '<p class="mt-3 text-sm text-texto-suave">Todos los productos tienen existencias suficientes.</p>'
        }
      </section>

      <section class="admin-card rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-datos">
        <h2 id="titulo-datos" class="font-extrabold text-texto">¿Dónde se guardan los cambios?</h2>
        <p class="mt-2 text-sm text-texto-suave">En <strong class="text-texto">este navegador</strong>. Para que los vean todos los visitantes, expórtalos desde <a href="#admin/ajustes" class="font-semibold text-primario-texto hover:underline">Ajustes › Datos</a> y publícalos con el sitio.</p>
        <dl class="mt-4 space-y-1.5 text-sm">
          <div class="flex justify-between gap-3"><dt class="text-texto-tenue">Última modificación</dt><dd class="text-texto">${modificado ? escapar(new Date(modificado).toLocaleString('es-MX')) : 'Sin cambios (datos de fábrica)'}</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-texto-tenue">Espacio usado</dt><dd class="tabular-nums text-texto">${espacioUsadoKB()} KB de ~5,000 KB</dd></div>
          <div class="flex justify-between gap-3"><dt class="text-texto-tenue">Archivo publicado</dt><dd class="text-texto">${negocio.admin.datosPublicados ? (estadoCarga.publicados ? 'Aplicado' : 'Configurado, no se pudo cargar') : 'No configurado'}</dd></div>
        </dl>
        ${estadoCarga.errores.length ? `<p class="mt-3 rounded-xl bg-acento/10 p-3 text-xs text-acento-texto" role="alert">Se ignoraron datos guardados con errores: ${escapar(estadoCarga.errores.slice(0, 3).join(' · '))}</p>` : ''}
      </section>
    </div>`;
}

/* ================= Pedidos ================= */

const filtrosPedidos = { q: '', desde: '', hasta: '', metodo: '', estado: '', pagina: 1 };
const fechaTienda = (iso) => new Intl.DateTimeFormat('en-CA', { timeZone: negocio.horario.zonaHoraria }).format(new Date(iso));
const metodoPedido = (p) => (p.procesador === 'demo' ? 'Tarjeta (demo)' : 'Tarjeta');
const estadoPedido = (p) => (p.procesador === 'demo' ? 'Pagado (simulación)' : 'Pagado');
const entregaPedido = (p) => (p.entrega?.metodo === 'domicilio' ? `Envío · ${p.entrega.zona}` : 'Recoger en tienda');

function renderPedidos() {
  const historial = obtenerHistorial();
  const opciones = (lista) => [{ valor: '', texto: 'Todos' }, ...[...new Set(historial.map(lista))].map((v) => ({ valor: v, texto: v }))];

  principal.innerHTML = `
    <div data-seccion>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Pedidos</h1>
          <p class="mt-1 text-sm text-texto-suave">Pagos con tarjeta (demo) hechos <strong class="text-texto">en este navegador</strong>. Los pedidos por WhatsApp llegan directo al chat de la tienda.</p>
        </div>
        ${historial.length ? `<button type="button" data-borrar-historial class="${boton.secundario}"><i class="fa-solid fa-trash-can" aria-hidden="true"></i> Borrar historial</button>` : ''}
      </div>
      ${
        !historial.length
          ? '<div class="mt-6 rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center"><p class="font-bold text-texto">Aún no hay pedidos.</p><p class="mt-1 text-sm text-texto-suave">Aparecerán cuando se complete un pago con tarjeta de prueba en el carrito.</p></div>'
          : `
        <div class="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-borde bg-superficie p-4 lg:grid-cols-5">
          <div class="col-span-2 lg:col-span-1">${campo({ nombre: 'q', etiqueta: 'Referencia', valor: filtrosPedidos.q, tipo: 'search', atributos: 'data-filtro="q" placeholder="LA-…"' })}</div>
          ${campo({ nombre: 'desde', etiqueta: 'Desde', valor: filtrosPedidos.desde, tipo: 'date', atributos: 'data-filtro="desde"' })}
          ${campo({ nombre: 'hasta', etiqueta: 'Hasta', valor: filtrosPedidos.hasta, tipo: 'date', atributos: 'data-filtro="hasta"' })}
          ${campo({ nombre: 'metodo', etiqueta: 'Método de pago', valor: filtrosPedidos.metodo, opciones: opciones(metodoPedido), atributos: 'data-filtro="metodo"' })}
          ${campo({ nombre: 'estado', etiqueta: 'Estado', valor: filtrosPedidos.estado, opciones: opciones(estadoPedido), atributos: 'data-filtro="estado"' })}
        </div>
        <div data-resultados class="mt-5"></div>`
      }
    </div>`;

  const seccion = $('[data-seccion]', principal);
  const pintar = () => {
    const f = filtrosPedidos;
    const lista = historial.filter(
      (p) =>
        (!f.q || p.referencia.toLowerCase().includes(f.q.toLowerCase())) &&
        (!f.desde || fechaTienda(p.fecha) >= f.desde) &&
        (!f.hasta || fechaTienda(p.fecha) <= f.hasta) &&
        (!f.metodo || metodoPedido(p) === f.metodo) &&
        (!f.estado || estadoPedido(p) === f.estado)
    );
    const porPagina = config.paginacion.pedidosPorPagina;
    const paginas = Math.max(1, Math.ceil(lista.length / porPagina));
    f.pagina = Math.min(f.pagina, paginas);
    const pagina = lista.slice((f.pagina - 1) * porPagina, f.pagina * porPagina);
    const fecha = (iso) => new Date(iso).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: negocio.horario.zonaHoraria });

    $('[data-resultados]', seccion).innerHTML = !lista.length
      ? '<p class="rounded-2xl border border-dashed border-borde bg-superficie p-8 text-center text-sm text-texto-suave">Ningún pedido coincide con los filtros.</p>'
      : `
        <p class="mb-3 text-sm text-texto-tenue" aria-live="polite">${lista.length} ${lista.length === 1 ? 'pedido' : 'pedidos'}</p>
        <div class="admin-table overflow-x-auto rounded-2xl border border-borde bg-superficie">
          <table class="w-full min-w-[40rem] text-left text-sm">
            <caption class="sr-only">Historial de pedidos</caption>
            <thead class="bg-superficie-alt text-xs uppercase tracking-wider text-texto-tenue">
              <tr><th scope="col" class="px-4 py-3">Referencia</th><th scope="col" class="px-4 py-3">Fecha</th><th scope="col" class="px-4 py-3 text-right">Total</th><th scope="col" class="px-4 py-3">Método</th><th scope="col" class="px-4 py-3">Estado</th><th scope="col" class="px-4 py-3">Entrega</th><th scope="col" class="px-4 py-3"><span class="sr-only">Detalle</span></th></tr>
            </thead>
            <tbody class="divide-y divide-borde">
              ${pagina
                .map(
                  (p) => `
                <tr>
                  <td class="px-4 py-3 font-mono text-xs font-bold text-texto">${escapar(p.referencia)}</td>
                  <td class="px-4 py-3 text-texto-suave">${escapar(fecha(p.fecha))}</td>
                  <td class="px-4 py-3 text-right font-bold tabular-nums text-texto">${precioMXN(p.total)}</td>
                  <td class="px-4 py-3 text-texto-suave">${metodoPedido(p)}</td>
                  <td class="px-4 py-3"><span class="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/30 oscuro:text-emerald-300">${estadoPedido(p)}</span></td>
                  <td class="px-4 py-3 text-texto-suave">${escapar(entregaPedido(p))}</td>
                  <td class="px-4 py-3 text-right"><button type="button" data-ver="${escapar(p.referencia)}" class="${boton.secundario} px-3 py-1.5 text-xs">Ver</button></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
        ${
          paginas > 1
            ? `<nav aria-label="Paginación" class="mt-4 flex items-center justify-center gap-2">
                 <button type="button" data-pagina="${f.pagina - 1}" ${f.pagina === 1 ? 'disabled' : ''} class="${boton.secundario} disabled:opacity-40">Anterior</button>
                 <span class="text-sm tabular-nums">${f.pagina} / ${paginas}</span>
                 <button type="button" data-pagina="${f.pagina + 1}" ${f.pagina === paginas ? 'disabled' : ''} class="${boton.secundario} disabled:opacity-40">Siguiente</button>
               </nav>`
            : ''
        }`;
  };
  if (historial.length) pintar();

  seccion.addEventListener('input', (e) => {
    const filtro = e.target.dataset?.filtro;
    if (!filtro) return;
    filtrosPedidos[filtro] = e.target.value;
    filtrosPedidos.pagina = 1;
    pintar();
  });
  seccion.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.pagina) {
      filtrosPedidos.pagina = Number(b.dataset.pagina);
      pintar();
    } else if (b.dataset.ver) verPedido(historial.find((p) => p.referencia === b.dataset.ver));
    else if (b.matches('[data-borrar-historial]')) {
      const ok = await confirmar({ titulo: 'Borrar historial', mensaje: `<p>¿Borrar los ${historial.length} pedidos guardados en este navegador? No se puede deshacer.</p>` });
      if (ok) {
        almacen.quitar('arcos-pedidos');
        avisar('Historial borrado.');
        renderPedidos();
      }
    }
  });
}

function verPedido(p) {
  if (!p) return;
  abrirModal({
    titulo: `Pedido ${escapar(p.referencia)}`,
    html: `
      <div class="space-y-5 p-5 text-sm">
        <div class="admin-table overflow-x-auto rounded-xl border border-borde">
          <table class="w-full text-left">
            <caption class="sr-only">Productos del pedido</caption>
            <thead class="bg-superficie-alt text-xs uppercase tracking-wider text-texto-tenue"><tr><th scope="col" class="px-3 py-2">Producto</th><th scope="col" class="px-3 py-2 text-right">Cant.</th><th scope="col" class="px-3 py-2 text-right">Importe</th></tr></thead>
            <tbody class="divide-y divide-borde">${p.lineas
              .map((l) => `<tr><td class="px-3 py-2 text-texto">${escapar(l.nombre)}<span class="block text-xs text-texto-tenue">${escapar(l.sku)}</span></td><td class="px-3 py-2 text-right tabular-nums">${l.cantidad}</td><td class="px-3 py-2 text-right tabular-nums">${precioMXN(l.importe)}</td></tr>`)
              .join('')}</tbody>
          </table>
        </div>
        <dl class="space-y-1.5">
          <div class="flex justify-between"><dt class="text-texto-tenue">Subtotal</dt><dd class="tabular-nums">${precioMXN(p.subtotal)}</dd></div>
          <div class="flex justify-between"><dt class="text-texto-tenue">Envío</dt><dd class="tabular-nums">${p.envio ? precioMXN(p.envio) : 'Sin costo'}</dd></div>
          <div class="flex justify-between border-t border-borde pt-2 font-bold text-texto"><dt>Total</dt><dd class="tabular-nums">${precioMXN(p.total)}</dd></div>
        </dl>
        <dl class="grid gap-3 rounded-xl bg-superficie-alt/60 p-4 sm:grid-cols-2">
          <div><dt class="text-xs text-texto-tenue">Entrega</dt><dd class="text-texto">${escapar(entregaPedido(p))}</dd></div>
          <div><dt class="text-xs text-texto-tenue">Dirección</dt><dd class="text-texto">${escapar(p.entrega?.direccion ?? 'En tienda')}</dd></div>
          <div><dt class="text-xs text-texto-tenue">Pago</dt><dd class="text-texto">${escapar(p.tarjeta?.marca ?? '')} •••• ${escapar(p.tarjeta?.ultimos4 ?? '')}</dd></div>
          <div><dt class="text-xs text-texto-tenue">Transacción</dt><dd class="font-mono text-xs text-texto">${escapar(p.transaccion)}</dd></div>
          <div class="sm:col-span-2"><dt class="text-xs text-texto-tenue">Cliente</dt><dd class="text-texto-suave">No se registra (el pago de demostración no guarda datos personales).</dd></div>
        </dl>
      </div>`,
  });
}

/* ================= Ajustes ================= */

function renderAjustes() {
  const c = config;
  const n = (nombre, etiqueta, valor, min, max, paso = 1, ayuda = '') =>
    campo({ nombre, etiqueta, valor, tipo: 'number', ayuda, atributos: `min="${min}" max="${max}" step="${paso}" inputmode="decimal"` });
  const pinFijo = !!negocio.admin.pinHash;

  principal.innerHTML = `
    <div data-seccion class="space-y-6">
      <div>
        <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Ajustes</h1>
        <p class="mt-1 text-sm text-texto-suave">Cómo se comporta este panel: campos, límites, imágenes, sesión y respaldo de datos.</p>
      </div>

      <form data-form-ajustes class="admin-form rounded-2xl border border-borde bg-superficie" novalidate>
        <div class="space-y-6 p-5">
          <fieldset>
            <legend class="text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Campos omitidos</legend>
            <p class="mt-1 text-xs text-texto-tenue">Los campos marcados se ocultan en los formularios; los valores que ya existen se conservan.</p>
            <p class="mb-2 mt-3 text-sm font-semibold text-texto">Productos</p>
            <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">${CAMPOS_PRODUCTO_OMITIBLES.map((f) => casilla({ nombre: 'omitProductos', valor: f.id, etiqueta: f.etiqueta, marcado: c.camposOmitidos.productos.includes(f.id) })).join('')}</div>
            <p class="mb-2 mt-4 text-sm font-semibold text-texto">Configuración</p>
            <div class="grid gap-2 sm:grid-cols-3">${CAMPOS_CONFIG_OMITIBLES.map((f) => casilla({ nombre: 'omitConfig', valor: f.id, etiqueta: f.etiqueta, marcado: c.camposOmitidos.configuracion.includes(f.id) })).join('')}</div>
          </fieldset>

          <fieldset>
            <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Límites de caracteres</legend>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-5">
              ${n('nombreProducto', 'Nombre de producto', c.limitesCaracteres.nombreProducto, 10, 300)}
              ${n('descripcionProducto', 'Descripción', c.limitesCaracteres.descripcionProducto, 20, 1000)}
              ${n('marca', 'Marca', c.limitesCaracteres.marca, 5, 100)}
              ${n('nombreNegocio', 'Nombre del negocio', c.limitesCaracteres.nombreNegocio, 10, 200)}
              ${n('eslogan', 'Eslogan', c.limitesCaracteres.eslogan, 10, 300)}
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Imágenes</legend>
            <p class="mb-2 text-sm font-semibold text-texto" id="adm-ext">Formatos permitidos</p>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby="adm-ext">${['webp', 'png', 'jpg', 'jpeg'].map((e) => casilla({ nombre: 'extensiones', valor: e, etiqueta: e.toUpperCase(), marcado: c.imagenes.extensionesPermitidas.includes(e) })).join('')}</div>
            <p class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="extensiones"></p>
            <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              ${n('tamanoMaximoMB', 'Peso máx. producto (MB)', c.imagenes.tamanoMaximoMB, 0.1, 20, 0.1)}
              ${n('tamanoMaximoLogoMB', 'Peso máx. logotipo (MB)', c.imagenes.tamanoMaximoLogoMB, 0.1, 20, 0.1)}
              <span class="hidden lg:block"></span>
              ${n('minAncho', 'Ancho mínimo (px)', c.imagenes.dimensionesMinimas.ancho, 1, 4000)}
              ${n('minAlto', 'Alto mínimo (px)', c.imagenes.dimensionesMinimas.alto, 1, 4000)}
              <span class="hidden lg:block"></span>
              ${n('maxAncho', 'Ancho máximo (px)', c.imagenes.dimensionesMaximas.ancho, 1, 8000)}
              ${n('maxAlto', 'Alto máximo (px)', c.imagenes.dimensionesMaximas.alto, 1, 8000)}
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-3 text-sm font-extrabold uppercase tracking-wider text-texto-tenue">Paginación y sesión</legend>
            <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
              ${n('productosPorPagina', 'Productos por página', c.paginacion.productosPorPagina, 5, 100)}
              ${n('pedidosPorPagina', 'Pedidos por página', c.paginacion.pedidosPorPagina, 5, 100)}
              ${n('timeoutMinutos', 'Cerrar sesión tras (min)', c.sesion.timeoutMinutos, 5, 240, 1, 'Minutos sin actividad.')}
            </div>
          </fieldset>
        </div>
        <div class="flex flex-wrap justify-end gap-2 border-t border-borde px-5 py-4">
          <button type="button" data-restaurar-ajustes class="${boton.secundario}">Valores por defecto</button>
          <button type="submit" class="${boton.primario}"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar ajustes</button>
        </div>
      </form>

      <form data-form-pin class="admin-form rounded-2xl border border-borde bg-superficie p-5" novalidate>
        <h2 class="font-extrabold text-texto">Cambiar PIN</h2>
        ${
          pinFijo
            ? '<p class="mt-2 text-sm text-texto-suave">El PIN está definido en <code>data.js</code> (<code>admin.pinHash</code>); cámbialo ahí.</p>'
            : `<div class="mt-4 grid gap-3 sm:grid-cols-3">
                ${campo({ nombre: 'pinActual', etiqueta: 'PIN actual', tipo: 'password', requerido: true, atributos: 'inputmode="numeric" autocomplete="current-password" maxlength="8"' })}
                ${campo({ nombre: 'pinNuevo', etiqueta: 'PIN nuevo', tipo: 'password', requerido: true, atributos: 'inputmode="numeric" autocomplete="new-password" maxlength="8"' })}
                ${campo({ nombre: 'pinConfirmacion', etiqueta: 'Confirma el PIN nuevo', tipo: 'password', requerido: true, atributos: 'inputmode="numeric" autocomplete="new-password" maxlength="8"' })}
              </div>
              <div class="mt-4 flex justify-end"><button type="submit" class="${boton.primario}">Cambiar PIN</button></div>`
        }
      </form>

      <section class="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby="titulo-respaldo">
        <h2 id="titulo-respaldo" class="font-extrabold text-texto">Datos y respaldo</h2>
        <p class="mt-1 text-sm text-texto-suave">Espacio usado: <strong class="tabular-nums text-texto">${espacioUsadoKB()} KB</strong> de ~5,000 KB. Última modificación: <strong class="text-texto">${ultimaModificacion() ? escapar(new Date(ultimaModificacion()).toLocaleString('es-MX')) : 'ninguna'}</strong>.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" data-exportar class="${boton.primario}"><i class="fa-solid fa-file-export" aria-hidden="true"></i> Exportar configuración (JSON)</button>
          <label class="${boton.secundario} cursor-pointer">
            <i class="fa-solid fa-file-import" aria-hidden="true"></i> Importar configuración
            <input type="file" accept=".json,application/json" data-importar class="sr-only" />
          </label>
          <button type="button" data-restaurar-datos class="${boton.peligro}"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Restaurar valores de fábrica</button>
        </div>
        <details class="mt-5 rounded-xl bg-superficie-alt/60 p-4 text-sm text-texto-suave">
          <summary class="cursor-pointer font-semibold text-texto">¿Cómo publico los cambios para todos los visitantes?</summary>
          <ol class="mt-3 list-decimal space-y-1 pl-5">
            <li>Exporta la configuración (descarga un archivo <code>.json</code>).</li>
            <li>Guárdalo en el proyecto como <code>public/datos/arcos-admin.json</code>.</li>
            <li>En <code>public/js/data.js</code> escribe <code>admin.datosPublicados: 'datos/arcos-admin.json'</code>.</li>
            <li>Publica el sitio: todos los visitantes verán esos datos.</li>
          </ol>
        </details>
      </section>
    </div>`;

  const seccion = $('[data-seccion]', principal);
  conectarAjustes(seccion);
}

function conectarAjustes(seccion) {
  const formAjustes = $('[data-form-ajustes]', seccion);
  formAjustes.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = formAjustes.elements;
    const num = (n) => Number(f[n].value);
    const marcados = (n) => $$(`[name="${n}"]:checked`, formAjustes).map((x) => x.value);
    const rango = (n, min, max, entero = true) => {
      const v = num(n);
      return f[n].value !== '' && Number.isFinite(v) && v >= min && v <= max && (!entero || Number.isInteger(v)) ? '' : `Entre ${min} y ${max}${entero ? ' (entero)' : ''}.`;
    };
    const errores = {
      nombreProducto: rango('nombreProducto', 10, 300), descripcionProducto: rango('descripcionProducto', 20, 1000), marca: rango('marca', 5, 100),
      nombreNegocio: rango('nombreNegocio', 10, 200), eslogan: rango('eslogan', 10, 300),
      tamanoMaximoMB: rango('tamanoMaximoMB', 0.1, 20, false), tamanoMaximoLogoMB: rango('tamanoMaximoLogoMB', 0.1, 20, false),
      minAncho: rango('minAncho', 1, 4000), minAlto: rango('minAlto', 1, 4000), maxAncho: rango('maxAncho', 1, 8000), maxAlto: rango('maxAlto', 1, 8000),
      productosPorPagina: rango('productosPorPagina', 5, 100), pedidosPorPagina: rango('pedidosPorPagina', 5, 100), timeoutMinutos: rango('timeoutMinutos', 5, 240),
      extensiones: marcados('extensiones').length ? '' : 'Elige al menos un formato.',
    };
    if (!errores.maxAncho && num('maxAncho') < num('minAncho')) errores.maxAncho = 'Debe ser mayor o igual al mínimo.';
    if (!errores.maxAlto && num('maxAlto') < num('minAlto')) errores.maxAlto = 'Debe ser mayor o igual al mínimo.';
    if (!mostrarErrores(formAjustes, errores, Object.keys(errores))) return avisar('Revisa los campos marcados.', 'error');

    const nuevo = {
      camposOmitidos: { productos: marcados('omitProductos'), configuracion: marcados('omitConfig') },
      limitesCaracteres: { nombreProducto: num('nombreProducto'), descripcionProducto: num('descripcionProducto'), marca: num('marca'), nombreNegocio: num('nombreNegocio'), eslogan: num('eslogan') },
      imagenes: {
        extensionesPermitidas: marcados('extensiones'),
        tamanoMaximoMB: num('tamanoMaximoMB'),
        tamanoMaximoLogoMB: num('tamanoMaximoLogoMB'),
        dimensionesMinimas: { ancho: num('minAncho'), alto: num('minAlto') },
        dimensionesMaximas: { ancho: num('maxAncho'), alto: num('maxAlto') },
      },
      paginacion: { productosPorPagina: num('productosPorPagina'), pedidosPorPagina: num('pedidosPorPagina') },
      sesion: { timeoutMinutos: num('timeoutMinutos') },
    };
    if (!guardarConfigAdmin(nuevo)) return avisar('No se pudieron guardar los ajustes (almacenamiento lleno o bloqueado).', 'error');
    config = leerConfigAdmin();
    avisar('Ajustes guardados.');
  });

  $('[data-restaurar-ajustes]', seccion).addEventListener('click', async () => {
    if (!(await confirmar({ titulo: 'Valores por defecto', mensaje: '<p>¿Restaurar los ajustes del panel a sus valores por defecto? Tus productos y la configuración del negocio no cambian.</p>', accion: 'Restaurar', peligro: false }))) return;
    restaurarConfigAdmin();
    config = leerConfigAdmin();
    avisar('Ajustes restaurados.');
    renderAjustes();
  });

  const formPin = $('[data-form-pin]', seccion);
  formPin.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!formPin.elements.pinActual) return;
    const v = (n) => formPin.elements[n].value.trim();
    const errores = {};
    if ((await huellaPin(v('pinActual'))) !== pinConfigurado()) errores.pinActual = 'El PIN actual no es correcto.';
    if (!/^\d{4,8}$/.test(v('pinNuevo'))) errores.pinNuevo = 'De 4 a 8 dígitos.';
    else if (v('pinNuevo') !== v('pinConfirmacion')) errores.pinConfirmacion = 'No coincide.';
    if (!mostrarErrores(formPin, errores, ['pinActual', 'pinNuevo', 'pinConfirmacion'])) return;
    almacen.guardar(CLAVE_PIN, await huellaPin(v('pinNuevo')));
    formPin.reset();
    avisar('PIN actualizado.');
  });

  $('[data-exportar]', seccion).addEventListener('click', () => {
    const hoy = new Date().toISOString().slice(0, 10);
    descargarJSON(`arcos-admin-${hoy}.json`, { tipo: 'arcos-admin', version: 1, exportado: new Date().toISOString(), datos: instantanea(), config });
    avisar('Configuración exportada.');
  });

  $('[data-importar]', seccion).addEventListener('change', async (e) => {
    const archivo = e.target.files[0];
    e.target.value = '';
    if (!archivo) return;
    if (archivo.size > 10 * 1024 * 1024) return avisar('El archivo es demasiado grande (máx. 10 MB).', 'error');
    let contenido;
    try {
      contenido = JSON.parse(await archivo.text());
    } catch {
      return avisar('El archivo no es un JSON válido.', 'error');
    }
    const datos = contenido?.tipo === 'arcos-admin' ? contenido.datos : contenido;
    const errores = validarDatos(datos);
    if (errores.length)
      return abrirModal({
        titulo: 'No se puede importar',
        html: `<div class="p-5 text-sm"><p class="text-texto-suave">El archivo tiene ${errores.length} problema(s):</p><ul class="mt-3 list-disc space-y-1 pl-5 text-acento-texto">${errores.map((x) => `<li>${escapar(x)}</li>`).join('')}</ul></div>`,
      });
    const resumen = `${datos.productos?.length ?? 'sin'} productos, ${datos.departamentos?.length ?? 'sin'} departamentos${datos.negocio ? ' y la configuración del negocio' : ''}`;
    if (!(await confirmar({ titulo: 'Importar configuración', mensaje: `<p>Se reemplazarán los datos de este navegador por los del archivo: ${escapar(resumen)}.</p>`, accion: 'Importar', peligro: false }))) return;
    if (!reemplazarDatosLocales(datos)) return avisar('No hay espacio para guardar el archivo importado.', 'error');
    if (contenido?.config) guardarConfigAdmin({ ...CONFIG_POR_DEFECTO, ...contenido.config });
    avisar('Importado. Recargando…');
    setTimeout(() => location.reload(), 600);
  });

  $('[data-restaurar-datos]', seccion).addEventListener('click', async () => {
    const ok = await confirmar({
      titulo: 'Restaurar valores de fábrica',
      mensaje: '<p>Se borrarán <strong class="text-texto">todos los cambios</strong> hechos en este navegador (productos, departamentos y configuración) y se volverá a los datos originales del sitio.</p><p class="mt-2">Te recomendamos exportar antes un respaldo.</p>',
      accion: 'Restaurar',
    });
    if (!ok) return;
    borrarDatosLocales();
    avisar('Datos restaurados. Recargando…');
    setTimeout(() => location.reload(), 600);
  });
}

/* ================= Navegación interna ================= */

function renderSeccion() {
  alternarNavSesion(true);
  marcarNavegacion();
  const vistas = {
    dashboard: renderDashboard,
    catalogo: () => renderAdminCatalogo(principal, ctx, ruta.sub),
    configuracion: () => renderAdminConfig(principal, ctx, ruta.sub),
    galeria: () => renderAdminGaleria(principal, ctx),
    pedidos: renderPedidos,
    ajustes: renderAjustes,
  };
  vistas[ruta.seccion]();
  principal.scrollTop = 0;
  $('#admin-titulo', principal)?.focus({ preventScroll: true });
}

/* ================= API pública ================= */

export function iniciarAdmin(contenedor) {
  if (!negocio.admin.habilitado) return;
  renderArmazon(contenedor);
  actualizarBotonModo();
}

/** Muestra el panel. `segmentos`: lo que sigue a #admin en la URL (p. ej. ['catalogo', 'productos']). */
export function mostrarAdmin(segmentos = []) {
  if (!raiz) return;
  const [seccion, sub = ''] = segmentos;
  ruta = { seccion: vistasAdmin.some((v) => v.id === seccion) ? seccion : 'dashboard', sub };
  visible = true;
  raiz.hidden = false;
  document.body.classList.add('overflow-hidden');
  document.title = `Administración | ${negocio.nombre}`;
  actualizarBotonModo();
  autenticado = sesionVigente();
  if (autenticado) {
    tocarSesion();
    renderSeccion();
  } else renderAcceso();
}

/** Oculta el panel. Devuelve true si estaba visible. */
export function ocultarAdmin() {
  if (!visible) return false;
  visible = false;
  raiz.hidden = true;
  document.body.classList.remove('overflow-hidden');
  return true;
}
