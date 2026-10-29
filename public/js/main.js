import { negocio, paletas, trayectoria, direccionCompleta, enlaceWhatsApp } from './data.js';
import { almacen } from './almacen.js';
import { estadoNegocio, rangoHorario } from './horario.js';
import { iniciarValoracion } from './valoracion.js';
import { departamentos, productosDe } from './catalogo.js';
import { renderCatalogo, iniciarCatalogo, navegarCatalogo, renderMegaMenu, iniciarMegaMenu } from './tienda.js';
import { iniciarCarrito, alCambiar } from './carrito.js';

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const raiz = document.documentElement;
const anioActual = new Date().getFullYear();
const { decadas } = trayectoria();

const { lat, lon, verificadas } = negocio.contacto.coordenadas;
const urlMapaEmbed =
  `https://www.openstreetmap.org/export/embed.html?layer=mapnik&bbox=${lon - 0.006},${lat - 0.0045},${lon + 0.006},${lat + 0.0045}` +
  (verificadas ? `&marker=${lat},${lon}` : '');
const urlMapaGrande = verificadas
  ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`
  : `https://www.openstreetmap.org/search?query=${encodeURIComponent(direccionCompleta())}`;
const urlComoLlegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta())}`;

const enlaceExterno = 'target="_blank" rel="noopener noreferrer"';
const tituloBase = document.title;

/* ---------- Preferencias guardadas ---------- */

const CLAVE_PALETA = 'arcos-paleta';
const CLAVE_MODO = 'arcos-modo';

const estado = {
  paleta: paletas.some((p) => p.id === raiz.dataset.paleta) ? raiz.dataset.paleta : paletas[0].id,
  modo: raiz.dataset.modo === 'oscuro' ? 'oscuro' : 'claro',
};

/* ---------- Componentes reutilizables ---------- */

const logotipo = (clases) => `
  <img src="${negocio.logo.src}" alt="${negocio.logo.alt}" width="${negocio.logo.ancho}" height="${negocio.logo.alto}"
       class="${clases} block h-auto" decoding="async" />`;

const encabezadoVista = ({ id, etiqueta, titulo, subtitulo }) => `
  <div class="mx-auto max-w-2xl text-center">
    <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-acento-texto">
      <span class="h-px w-6 bg-current"></span>${etiqueta}<span class="h-px w-6 bg-current"></span>
    </p>
    <h1 id="${id}" tabindex="-1" class="mt-3 text-3xl font-extrabold tracking-tight text-balance text-texto focus:outline-none sm:text-4xl">${titulo}</h1>
    <p class="mt-4 text-base leading-relaxed text-pretty text-texto-suave sm:text-lg">${subtitulo}</p>
  </div>`;

const marcarActual = (enlace, activo) =>
  activo ? enlace.setAttribute('aria-current', 'page') : enlace.removeAttribute('aria-current');

/* ---------- Encabezado, pestañas y controles de tema ---------- */

const CLASES_PESTANA_ACTIVA = ['bg-superficie', 'text-primario-texto', 'shadow-sm'];
const CLASES_PESTANA_INACTIVA = ['text-texto-suave', 'hover:text-texto'];

function renderEncabezado() {
  const pestanas = negocio.vistas
    .map(({ id, etiqueta }) => {
      const enlace = `
        <a href="#${id}" data-pestana="${id}"
           class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors">${etiqueta}</a>`;
      if (id !== 'productos') return enlace;
      return `
        <div class="flex items-center" data-disparador-mega>
          ${enlace}
          <button id="boton-mega" type="button" aria-expanded="false" aria-controls="mega-menu" aria-label="Ver departamentos"
                  class="group -ml-1 flex size-8 items-center justify-center rounded-lg text-xs text-texto-tenue transition-colors hover:bg-superficie hover:text-texto aria-expanded:text-primario-texto">
            <span class="transition-transform duration-200 group-aria-expanded:rotate-180" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
          </button>
        </div>`;
    })
    .join('');

  const opcionesPaleta = paletas
    .map(
      ({ id, nombre, descripcion, claro }) => `
        <button type="button" data-opcion-paleta="${id}" aria-pressed="false"
                class="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-superficie-alt aria-pressed:bg-primario-suave">
          <span class="flex shrink-0 -space-x-1.5" aria-hidden="true">
            ${[claro.primario, claro.acento, claro.destaque]
              .map((color) => `<span class="size-6 rounded-full ring-2 ring-superficie" style="background:${color}"></span>`)
              .join('')}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-bold text-texto">${nombre}</span>
            <span class="block text-xs text-texto-tenue">${descripcion}</span>
          </span>
          <i class="fa-solid fa-check text-sm text-primario-texto" data-marca aria-hidden="true"></i>
        </button>`
    )
    .join('');

  $('#encabezado').innerHTML = `
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
      <a href="#inicio" class="group flex shrink-0 items-center gap-3" aria-label="${negocio.nombre}, ir al inicio">
        <span class="logo-insignia rounded-xl bg-white px-1.5 py-1 shadow-sm ring-2 ring-primario/70 ring-offset-2 ring-offset-superficie transition group-hover:ring-primario">
          ${logotipo('w-22 sm:w-26 lg:w-28')}
        </span>
        <span class="hidden border-l border-borde pl-3 leading-tight xl:block" aria-hidden="true">
          <span class="flex items-center gap-1 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-acento-texto">
            <i class="fa-solid fa-award"></i> Desde ${negocio.anioFundacion}
          </span>
          <span class="mt-0.5 block text-xs font-semibold text-texto-tenue">El Pitillal, Pto. Vallarta</span>
        </span>
      </a>

      <nav class="hidden items-center gap-1 rounded-xl bg-superficie-alt p-1 lg:flex" aria-label="Secciones">${pestanas}</nav>

      <div class="flex items-center gap-1.5 sm:gap-2">
        <div class="relative" id="selector-paleta">
          <button id="boton-paleta" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="menu-paletas"
                  class="inline-flex h-11 items-center gap-2 rounded-xl border border-borde bg-superficie px-3 text-sm font-semibold text-texto transition-colors hover:bg-superficie-alt">
            <i class="fa-solid fa-palette text-base text-primario-texto" aria-hidden="true"></i>
            <span class="hidden xl:inline" data-nombre-paleta></span>
            <span class="sr-only xl:hidden">Cambiar paleta de colores</span>
            <span class="hidden text-[0.65rem] text-texto-tenue sm:inline" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
          </button>
          <div id="menu-paletas" hidden
               class="menu-paletas absolute right-0 top-full z-10 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-borde bg-superficie p-2 shadow-2xl">
            <p class="px-3 pb-2 pt-1.5 text-xs font-bold uppercase tracking-wider text-texto-tenue">Paleta de colores</p>
            <div class="space-y-1">${opcionesPaleta}</div>
            <p class="mt-1 border-t border-borde px-3 pb-1 pt-2.5 text-[0.7rem] text-texto-tenue">Tu elección se guarda en este navegador.</p>
          </div>
        </div>

        <button id="boton-modo" type="button" aria-pressed="false"
                class="inline-flex size-11 items-center justify-center rounded-xl border border-borde bg-superficie text-texto transition-colors hover:bg-superficie-alt">
          <i class="fa-solid fa-moon text-base" aria-hidden="true"></i>
        </button>

        <button type="button" data-abrir-carrito aria-label="Abrir carrito"
                class="relative inline-flex size-11 items-center justify-center rounded-xl border border-borde bg-superficie text-texto transition-colors hover:bg-superficie-alt">
          <i class="fa-solid fa-cart-shopping text-base" aria-hidden="true"></i>
          <span data-contador-carrito
                class="absolute -right-1.5 -top-1.5 hidden min-w-5 rounded-full bg-acento px-1 text-center text-[0.68rem] font-bold leading-5 text-white ring-2 ring-superficie"></span>
        </button>

        <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
           class="hidden h-11 items-center gap-2 rounded-xl bg-acento px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-acento-hover md:inline-flex">
          <i class="fa-brands fa-whatsapp text-base" aria-hidden="true"></i> Cotizar
        </a>
      </div>
    </div>
    <div class="franja-marca h-1" aria-hidden="true"></div>
    ${renderMegaMenu()}
    <p id="anuncio-tema" class="sr-only" aria-live="polite"></p>`;
}

function renderPestanasMovil() {
  $('#pestanas-movil').innerHTML = `
    <div class="pestanas-seguras grid grid-cols-3">
      ${negocio.vistas
        .map(
          ({ id, etiqueta, icono }) => `
          <a href="#${id}" data-pestana-movil="${id}"
             class="relative flex flex-col items-center gap-1 pb-2.5 pt-3 text-[0.7rem] font-semibold transition-colors">
            <span data-indicador class="absolute inset-x-0 top-0 mx-auto h-0.5 w-10 rounded-full bg-primario transition-opacity"></span>
            <i class="${icono} text-lg" aria-hidden="true"></i>
            ${etiqueta}
          </a>`
        )
        .join('')}
    </div>`;
}

/* ---------- Vista: Inicio ---------- */

/** Franja de marcas y líneas que maneja la tienda (debajo del hero). */
function renderFranjaMarcas() {
  const { destacadas, lineas } = negocio.marcas;
  const tarjeta = ({ ruta, icono, etiqueta, nombre, detalle, destacada }) => `
    <li class="w-44 shrink-0 lg:w-auto">
      <a href="${ruta}"
         class="group flex h-full flex-col gap-3 rounded-2xl border border-borde bg-fondo p-4 transition duration-300 hover:-translate-y-1 hover:border-primario/50 hover:bg-superficie hover:shadow-lg hover:shadow-black/5">
        <span class="flex items-center justify-between gap-2">
          <span class="flex size-9 items-center justify-center rounded-lg transition-colors ${
            destacada ? 'bg-primario text-white' : 'bg-primario-suave text-primario-texto group-hover:bg-primario group-hover:text-white'
          }">
            <i class="${icono}" aria-hidden="true"></i>
          </span>
          <span class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider ring-1 ${
            destacada ? 'bg-destaque/20 text-texto ring-destaque/60' : 'bg-superficie-alt text-texto-tenue ring-borde'
          }">${etiqueta}</span>
        </span>
        <span class="${destacada ? 'text-xl' : 'text-sm leading-tight'} font-extrabold tracking-tight text-texto">${nombre}</span>
        <span class="-mt-2 text-xs leading-snug text-texto-tenue">${detalle}</span>
      </a>
    </li>`;

  return `
    <section aria-labelledby="titulo-marcas" class="border-b border-borde bg-superficie">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:flex lg:items-center lg:gap-10 lg:px-8">
        <div class="lg:w-56 lg:shrink-0">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-acento-texto">Marcas que manejamos</p>
          <h2 id="titulo-marcas" class="mt-1.5 text-lg font-extrabold leading-snug text-balance text-texto">Calidad que ya conoces, en tu tlapalería de siempre</h2>
        </div>
        <ul class="carril -mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-0 lg:grid lg:flex-1 lg:grid-cols-6 lg:overflow-visible lg:p-0">
          ${destacadas.map((m) => tarjeta({ ...m, etiqueta: 'Marca', detalle: m.linea, destacada: true })).join('')}
          ${lineas.map((l) => tarjeta({ ...l, etiqueta: 'Línea', detalle: 'Marcas líderes del mercado', destacada: false })).join('')}
        </ul>
      </div>
    </section>`;
}

function renderInicio() {
  const { historia } = negocio;
  const datos = [
    { valor: `+${decadas}`, texto: 'años de trayectoria', icono: 'fa-solid fa-award' },
    { valor: negocio.anioFundacion, texto: 'año de fundación', icono: 'fa-solid fa-calendar-check' },
    { valor: departamentos.filter((d) => !d.esOutlet).length, texto: 'departamentos', icono: 'fa-solid fa-boxes-stacked' },
  ];

  $('#vista-inicio').innerHTML = `
    <div class="relative overflow-hidden bg-hero-fondo">
      <div class="patron-industrial absolute inset-0" aria-hidden="true"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
        <div class="lg:col-span-7">
          <p class="inline-flex items-center gap-2 rounded-full border border-destaque/30 bg-destaque/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destaque">
            <i class="fa-solid fa-store" aria-hidden="true"></i> Ferretería y tlapalería · El Pitillal
          </p>

          <h1 id="titulo-inicio" tabindex="-1" class="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-hero-texto focus:outline-none sm:text-5xl lg:text-6xl">
            “Si no conoces <span class="text-destaque">los Arcos</span> no conoces el Pitillal”
          </h1>

          <p class="mt-5 max-w-xl text-base leading-relaxed text-pretty text-hero-suave sm:text-lg">
            Herramientas, material eléctrico, plomería, cerrajería, pintura y todo para el hogar,
            con la asesoría honesta de la familia Navarro desde ${negocio.anioFundacion}.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
               class="inline-flex items-center justify-center gap-2.5 rounded-xl bg-whatsapp px-6 py-4 text-base font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-whatsapp-hover">
              <i class="fa-brands fa-whatsapp text-xl" aria-hidden="true"></i> Cotizar material por WhatsApp
            </a>
            <a href="#productos"
               class="inline-flex items-center justify-center gap-2 rounded-xl border border-hero-texto/20 bg-hero-texto/5 px-6 py-4 text-base font-semibold text-hero-texto transition hover:border-hero-texto/40 hover:bg-hero-texto/10">
              Ver catálogo <i class="fa-solid fa-arrow-right text-sm" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        <div class="order-first mx-auto w-full max-w-xs pb-4 pt-4 sm:max-w-sm lg:order-none lg:col-span-5 lg:max-w-md lg:py-0">
          <figure class="relative isolate">
            <div class="absolute -inset-6 -z-10 rounded-[3rem] bg-destaque/25 blur-3xl" aria-hidden="true"></div>

            <div class="sello-logo rounded-[2rem] bg-white p-2 shadow-2xl shadow-black/40 ring-4 ring-primario ring-offset-4 ring-offset-hero-fondo">
              <div class="rounded-[1.6rem] border border-slate-200 px-4 pb-4 pt-8 sm:px-6">
                ${logotipo('w-full')}
                <figcaption class="mt-4 flex items-center justify-center gap-2 border-t border-slate-200 pt-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500">
                  <i class="fa-solid fa-store text-primario" aria-hidden="true"></i> Negocio local<span class="hidden sm:inline"> · Familia Navarro</span>
                </figcaption>
              </div>
            </div>

            <span class="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-destaque px-4 py-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-destaque-texto shadow-lg ring-2 ring-white">
              <i class="fa-solid fa-award" aria-hidden="true"></i> Tradición familiar
            </span>

            <span class="sello-anio absolute -bottom-5 -right-2 flex size-[4.5rem] -rotate-12 flex-col items-center justify-center rounded-full bg-primario text-white shadow-xl ring-4 ring-white sm:-right-5 sm:size-24" aria-hidden="true">
              <span class="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/80">Desde</span>
              <span class="text-xl font-extrabold leading-none sm:text-2xl">${negocio.anioFundacion}</span>
              <span class="mt-0.5 text-[0.5rem] font-bold uppercase tracking-[0.18em] text-white/80">+${decadas} años</span>
            </span>
          </figure>
        </div>
      </div>
      <div class="franja-marca h-1.5" aria-hidden="true"></div>
    </div>

    ${renderFranjaMarcas()}

    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <dl class="grid grid-cols-3 gap-3 sm:gap-5">
        ${datos
          .map(
            ({ valor, texto, icono }) => `
            <div class="rounded-2xl border border-borde bg-superficie p-4 text-center sm:flex sm:items-center sm:gap-4 sm:p-6 sm:text-left">
              <span class="mx-auto hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-lg text-primario-texto sm:mx-0 sm:flex">
                <i class="${icono}" aria-hidden="true"></i>
              </span>
              <div class="flex flex-col-reverse">
                <dt class="mt-1 text-xs font-medium leading-snug text-texto-tenue sm:text-sm">${texto}</dt>
                <dd class="text-2xl font-extrabold text-texto sm:text-3xl">${valor}</dd>
              </div>
            </div>`
          )
          .join('')}
      </dl>

      <section class="mt-12 sm:mt-16" aria-labelledby="titulo-departamentos">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-acento-texto">Catálogo</p>
            <h2 id="titulo-departamentos" class="mt-2 text-2xl font-extrabold tracking-tight text-texto sm:text-3xl">Compra por departamento</h2>
          </div>
          <a href="#productos" class="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-primario-texto hover:text-acento-texto sm:inline-flex">
            Ver catálogo <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
          </a>
        </div>
        <ul class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          ${departamentos
            .map(
              (d) => `
              <li>
                <a href="#productos/${d.id}"
                   class="group flex h-full flex-col items-center gap-3 rounded-2xl border p-4 text-center transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 ${d.esOutlet ? 'border-acento/30 bg-acento/5 hover:border-acento/60' : 'border-borde bg-superficie hover:border-primario/40'}">
                  <span class="flex size-12 items-center justify-center rounded-xl text-lg transition-colors ${d.esOutlet ? 'bg-acento text-white' : 'bg-primario-suave text-primario-texto group-hover:bg-primario group-hover:text-white'}">
                    <i class="${d.icono}" aria-hidden="true"></i>
                  </span>
                  <span class="text-sm font-bold leading-tight text-texto">${d.nombre}</span>
                  <span class="text-xs text-texto-tenue">${productosDe(d.id).length} productos</span>
                </a>
              </li>`
            )
            .join('')}
        </ul>
      </section>

      <div class="mt-12 grid items-start gap-8 sm:mt-16 lg:grid-cols-2 lg:gap-14">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-acento-texto">Quiénes somos</p>
          <h2 class="mt-3 text-3xl font-extrabold tracking-tight text-balance text-texto sm:text-4xl">
            Una tradición familiar en el corazón de El Pitillal
          </h2>
          <div class="mt-5 space-y-4 text-base leading-relaxed text-pretty text-texto-suave">
            ${historia.parrafos.map((p) => `<p>${p}</p>`).join('')}
          </div>
        </div>

        <div class="overflow-hidden rounded-3xl border border-borde bg-superficie">
          <div class="border-b border-borde px-6 py-6 sm:px-8">
            <p class="text-sm font-semibold uppercase tracking-wider text-acento-texto">Fundada en ${negocio.anioFundacion}</p>
            <p class="mt-2 text-lg text-texto">
              por <strong class="font-bold">${historia.fundadores.join('</strong> y <strong class="font-bold">')}</strong>
            </p>
          </div>
          <ul class="divide-y divide-borde">
            ${historia.valores
              .map(
                ({ icono, titulo, texto }) => `
                <li class="flex gap-4 px-6 py-5 sm:px-8">
                  <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario-texto">
                    <i class="${icono}" aria-hidden="true"></i>
                  </span>
                  <div>
                    <h3 class="font-bold text-texto">${titulo}</h3>
                    <p class="mt-0.5 text-sm text-texto-suave">${texto}</p>
                  </div>
                </li>`
              )
              .join('')}
          </ul>
        </div>
      </div>

      <div class="relative mt-12 overflow-hidden rounded-3xl bg-primario px-6 py-8 sm:mt-16 sm:px-10 sm:py-10">
        <div class="patron-industrial absolute inset-0 opacity-60" aria-hidden="true"></div>
        <div class="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <h2 class="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">¿Necesitas material para tu obra o tu casa?</h2>
            <p class="mt-2 text-white/80">Mándanos tu lista por WhatsApp y te respondemos con precio y disponibilidad.</p>
          </div>
          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
               class="inline-flex items-center justify-center gap-2 rounded-xl bg-destaque px-6 py-3.5 font-bold text-destaque-texto transition hover:brightness-95">
              <i class="fa-brands fa-whatsapp text-lg" aria-hidden="true"></i> Enviar mi lista
            </a>
            <a href="#contacto"
               class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i> Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------- Vista: Ubicación, horarios y contacto ---------- */

function renderContacto() {
  const { contacto, horario } = negocio;
  const d = contacto.direccion;
  const canales = [
    {
      href: enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion),
      externo: true,
      icono: 'fa-brands fa-whatsapp',
      fondo: 'bg-whatsapp',
      titulo: 'WhatsApp',
      texto: `${contacto.whatsappTexto} · Cotizaciones y disponibilidad.`,
      accion: 'Enviar mensaje',
    },
    {
      href: contacto.telefonoHref,
      externo: false,
      icono: 'fa-solid fa-phone',
      fondo: 'bg-acento',
      titulo: 'Llámanos',
      texto: `${contacto.telefono} · Atención en horario de tienda.`,
      accion: 'Llamar ahora',
    },
    {
      href: contacto.facebook,
      externo: true,
      icono: 'fa-brands fa-facebook-f',
      fondo: 'bg-facebook',
      titulo: 'Facebook',
      texto: 'Novedades, promociones y avisos de la tienda.',
      accion: 'Visitar página',
    },
    {
      href: urlComoLlegar,
      externo: true,
      icono: 'fa-solid fa-diamond-turn-right',
      fondo: 'bg-primario',
      titulo: 'Cómo llegar',
      texto: `${d.calle}, ${d.localidad}.`,
      accion: 'Abrir ruta',
    },
  ];

  const filasHorario = horario.bloques
    .map(
      (bloque) => `
      <li data-dias="${bloque.dias.join(',')}"
          class="fila-horario flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors">
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-texto">
          ${bloque.etiqueta}
          <span data-hoy class="hidden rounded-md bg-primario px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">Hoy</span>
        </span>
        <span class="shrink-0 whitespace-nowrap text-right tabular-nums text-texto-suave">${rangoHorario(bloque)}</span>
      </li>`
    )
    .join('');

  $('#vista-contacto').innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      ${encabezadoVista({
        id: 'titulo-contacto',
        etiqueta: 'Ubicación y contacto',
        titulo: 'Visítanos o escríbenos',
        subtitulo: 'Te esperamos en el Centro de El Pitillal, sobre la calle Vicente Guerrero.',
      })}

      <div class="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-12 lg:items-start lg:gap-8">
        <aside class="overflow-hidden rounded-3xl border border-borde bg-superficie lg:col-span-5" aria-label="Ubicación y horarios">
          <div class="relative h-60 bg-superficie-alt sm:h-72">
            <iframe src="${urlMapaEmbed}" title="Mapa de la zona de ${negocio.nombre} en El Pitillal"
                    class="absolute inset-0 size-full border-0 oscuro:brightness-[.85]" loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"></iframe>
            <a href="${urlMapaGrande}" ${enlaceExterno}
               class="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-superficie/95 px-3 py-1.5 text-xs font-bold text-texto shadow-md ring-1 ring-borde backdrop-blur transition-colors hover:text-primario-texto">
              <i class="fa-solid fa-up-right-from-square text-[0.65rem]" aria-hidden="true"></i> Ver mapa grande
            </a>
          </div>

          <div class="space-y-6 p-6 sm:p-7">
            <blockquote class="border-l-4 border-destaque pl-4 text-base font-semibold italic leading-snug text-texto">
              “${negocio.eslogan}”
            </blockquote>

            <ul class="space-y-4">
              <li class="flex gap-4">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario-texto">
                  <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
                </span>
                <address class="not-italic">
                  <p class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Dirección</p>
                  <p class="mt-0.5 font-bold text-texto">${d.calle}, ${d.colonia}</p>
                  <p class="text-sm text-texto-suave">${d.localidad}, C.P. ${d.cp}, ${d.ciudad}, ${d.estado}</p>
                </address>
              </li>
              <li class="flex gap-4">
                <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario-texto">
                  <i class="fa-solid fa-phone" aria-hidden="true"></i>
                </span>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Teléfono</p>
                  <a href="${contacto.telefonoHref}" class="mt-0.5 block font-bold tabular-nums text-texto transition-colors hover:text-acento-texto">${contacto.telefono}</a>
                </div>
              </li>
            </ul>

            <div class="border-t border-borde pt-6">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h2 class="flex items-center gap-2 font-bold text-texto">
                  <i class="fa-regular fa-clock text-primario-texto" aria-hidden="true"></i> Horario de atención
                </h2>
                <p id="estado-negocio" role="status"
                   class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1"></p>
              </div>
              <p id="estado-detalle" class="mt-2 text-sm text-texto-suave"></p>
              <ul class="mt-4 space-y-1">${filasHorario}</ul>
              <p class="mt-3 text-xs text-texto-tenue">Horario de Puerto Vallarta (tiempo del centro de México).</p>
            </div>
          </div>
        </aside>

        <div class="lg:col-span-7">
          <h2 class="text-xl font-extrabold tracking-tight text-texto">Canales de atención</h2>
          <p class="mt-1 text-sm text-texto-suave">Elige el que te quede más cómodo; te respondemos en horario de tienda.</p>

          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            ${canales
              .map(
                ({ href, externo, icono, fondo, titulo, texto, accion }) => `
                <a href="${href}" ${externo ? enlaceExterno : ''}
                   class="group flex items-center gap-4 rounded-2xl border border-borde bg-superficie p-5 transition duration-300 hover:-translate-y-1 hover:border-primario/40 hover:shadow-lg hover:shadow-black/5 sm:flex-col sm:items-start sm:p-6">
                  <span class="flex size-12 shrink-0 items-center justify-center rounded-xl ${fondo} text-xl text-white shadow-md">
                    <i class="${icono}" aria-hidden="true"></i>
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-lg font-bold text-texto">${titulo}</span>
                    <span class="mt-0.5 block text-sm text-texto-suave">${texto}</span>
                    <span class="mt-3 hidden items-center gap-2 text-sm font-bold text-primario-texto sm:inline-flex">
                      ${accion}
                      <i class="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"></i>
                    </span>
                  </span>
                  <span class="text-sm text-texto-tenue sm:hidden" aria-hidden="true"><i class="fa-solid fa-chevron-right"></i></span>
                </a>`
              )
              .join('')}
          </div>

          <div class="relative mt-6 overflow-hidden rounded-3xl bg-hero-fondo p-6 sm:p-8">
            <div class="patron-industrial absolute inset-0" aria-hidden="true"></div>
            <div class="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-lg font-extrabold text-hero-texto">Cotiza antes de venir</p>
                <p class="mt-1 text-sm text-hero-suave">Mándanos tu lista por WhatsApp y te confirmamos precio y disponibilidad.</p>
              </div>
              <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
                 class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-whatsapp px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-whatsapp-hover">
                <i class="fa-brands fa-whatsapp text-base" aria-hidden="true"></i> Enviar mi lista
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

/* ---------- Estado "Abierto ahora" ---------- */

const CLASES_ESTADO = {
  abierto: ['bg-emerald-500/12', 'text-emerald-700', 'ring-emerald-500/30', 'oscuro:text-emerald-300'],
  pronto: ['bg-destaque/15', 'text-texto', 'ring-destaque/50'],
  cerrado: ['bg-acento/10', 'text-acento-texto', 'ring-acento/30'],
};
const CLASES_PUNTO = { abierto: 'bg-emerald-500', pronto: 'bg-destaque', cerrado: 'bg-acento' };

function actualizarEstadoNegocio() {
  const { abierto, cierraPronto, dia, detalle } = estadoNegocio();
  const clave = abierto ? (cierraPronto ? 'pronto' : 'abierto') : 'cerrado';
  const insignia = $('#estado-negocio');

  Object.values(CLASES_ESTADO).flat().forEach((c) => insignia.classList.remove(c));
  insignia.classList.add(...CLASES_ESTADO[clave]);
  insignia.innerHTML = `
    <span class="size-2 rounded-full ${CLASES_PUNTO[clave]} ${abierto ? 'punto-vivo' : ''}" aria-hidden="true"></span>
    ${abierto ? (cierraPronto ? 'Cierra pronto' : 'Abierto ahora') : 'Cerrado'}`;
  $('#estado-detalle').textContent = detalle;

  $$('.fila-horario').forEach((fila) => {
    const esHoy = fila.dataset.dias.split(',').map(Number).includes(dia);
    fila.classList.toggle('bg-primario-suave', esHoy);
    $('[data-hoy]', fila).classList.toggle('hidden', !esHoy);
    esHoy ? fila.setAttribute('aria-current', 'date') : fila.removeAttribute('aria-current');
  });
}

function iniciarEstadoNegocio() {
  actualizarEstadoNegocio();
  setInterval(actualizarEstadoNegocio, 60_000);
  document.addEventListener('visibilitychange', () => document.hidden || actualizarEstadoNegocio());
}

/* ---------- Pie y botón flotante ---------- */

function renderPie() {
  const { contacto } = negocio;

  $('#pie').innerHTML = `
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <p class="font-extrabold text-texto">${negocio.nombre}</p>
        <p class="mt-1 text-sm italic text-texto-tenue">“${negocio.eslogan}”</p>
      </div>

      <nav aria-label="Enlaces rápidos">
        <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          ${negocio.vistas
            .map(({ id, titulo }) => `<li><a href="#${id}" class="text-texto-suave transition-colors hover:text-primario-texto">${titulo}</a></li>`)
            .join('')}
        </ul>
      </nav>

      <div class="flex items-center gap-3">
        <a href="${enlaceWhatsApp()}" ${enlaceExterno} aria-label="WhatsApp"
           class="flex size-10 items-center justify-center rounded-lg border border-borde text-lg text-texto transition-colors hover:border-whatsapp hover:bg-whatsapp hover:text-white">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        </a>
        <a href="${contacto.facebook}" ${enlaceExterno} aria-label="Facebook"
           class="flex size-10 items-center justify-center rounded-lg border border-borde text-texto transition-colors hover:border-facebook hover:bg-facebook hover:text-white">
          <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
        </a>
      </div>
    </div>
    <p class="mx-auto mt-6 max-w-7xl border-t border-borde px-4 pb-24 pt-4 text-xs text-texto-tenue sm:px-6 lg:px-8 lg:pb-6">
      © ${anioActual} ${negocio.nombre}. Todos los derechos reservados. Orgullosamente de El Pitillal desde ${negocio.anioFundacion}.
    </p>`;
}

function renderWhatsAppFlotante() {
  $('#whatsapp-flotante').innerHTML = `
    <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
       class="wa-flotante group fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-3xl text-white shadow-xl shadow-black/25 transition hover:scale-105 hover:bg-whatsapp-hover lg:bottom-6 lg:right-6 lg:size-16"
       aria-label="Escríbenos por WhatsApp">
      <i class="fa-brands fa-whatsapp relative" aria-hidden="true"></i>
      <span class="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-texto px-3 py-2 text-sm font-semibold text-fondo opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block">
        ¿Necesitas una cotización?
      </span>
    </a>`;
}

/* ---------- Tema: paleta + modo claro/oscuro ---------- */

const aKebab = (texto) => texto.replace(/[A-Z]/g, (letra) => `-${letra.toLowerCase()}`);
let temporizadorTema;

function aplicarTema({ animar = false } = {}) {
  const paleta = paletas.find((p) => p.id === estado.paleta) ?? paletas[0];
  const colores = paleta[estado.modo];

  if (animar) {
    raiz.classList.add('cambiando-tema');
    clearTimeout(temporizadorTema);
    temporizadorTema = setTimeout(() => raiz.classList.remove('cambiando-tema'), 400);
  }

  Object.entries(colores).forEach(([clave, valor]) => raiz.style.setProperty(`--p-${aKebab(clave)}`, valor));
  raiz.dataset.paleta = paleta.id;
  raiz.dataset.modo = estado.modo;
  $('meta[name="theme-color"]').setAttribute('content', colores.superficie);

  $('[data-nombre-paleta]').textContent = paleta.nombre;
  $('#boton-paleta').setAttribute('title', `Paleta: ${paleta.nombre}`);
  $$('[data-opcion-paleta]').forEach((opcion) => {
    const activa = opcion.dataset.opcionPaleta === paleta.id;
    opcion.setAttribute('aria-pressed', String(activa));
    $('[data-marca]', opcion).classList.toggle('invisible', !activa);
  });

  const oscuro = estado.modo === 'oscuro';
  const botonModo = $('#boton-modo');
  botonModo.setAttribute('aria-pressed', String(oscuro));
  botonModo.setAttribute('aria-label', oscuro ? 'Activar modo claro' : 'Activar modo oscuro');
  botonModo.setAttribute('title', oscuro ? 'Modo claro' : 'Modo oscuro');
  $('i', botonModo).className = `fa-solid ${oscuro ? 'fa-sun' : 'fa-moon'} text-base`;
}

const anunciar = (mensaje) => {
  $('#anuncio-tema').textContent = mensaje;
};

function iniciarSelectorPaleta() {
  const contenedor = $('#selector-paleta');
  const boton = $('#boton-paleta');
  const menu = $('#menu-paletas');

  const alternar = (abrir) => {
    menu.hidden = !abrir;
    boton.setAttribute('aria-expanded', String(abrir));
    if (abrir) $('[aria-pressed="true"]', menu)?.focus();
  };

  boton.addEventListener('click', () => alternar(menu.hidden));

  menu.addEventListener('click', (e) => {
    const opcion = e.target.closest('[data-opcion-paleta]');
    if (!opcion) return;
    estado.paleta = opcion.dataset.opcionPaleta;
    almacen.guardar(CLAVE_PALETA, estado.paleta);
    aplicarTema({ animar: true });
    anunciar(`Paleta ${paletas.find((p) => p.id === estado.paleta).nombre} aplicada`);
    alternar(false);
    boton.focus();
  });

  document.addEventListener('click', (e) => {
    if (!menu.hidden && !contenedor.contains(e.target)) alternar(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      alternar(false);
      boton.focus();
    }
  });
}

function iniciarModo() {
  $('#boton-modo').addEventListener('click', () => {
    estado.modo = estado.modo === 'oscuro' ? 'claro' : 'oscuro';
    almacen.guardar(CLAVE_MODO, estado.modo);
    aplicarTema({ animar: true });
    anunciar(`Modo ${estado.modo} activado`);
  });

  // Mientras el visitante no elija un modo, se sigue la preferencia del sistema.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (almacen.leer(CLAVE_MODO)) return;
    estado.modo = e.matches ? 'oscuro' : 'claro';
    aplicarTema({ animar: true });
  });
}

/* ---------- Navegación por vistas ---------- */

const idsVistas = new Set(negocio.vistas.map((v) => v.id));

let vistaActiva = null;

/**
 * Ruta indicada por el hash: { id, resto } (p. ej. #productos/herramientas/electricas);
 * null si el hash apunta a otra cosa (p. ej. #contenido).
 */
function rutaDesdeHash() {
  const [id, ...resto] = decodeURIComponent(location.hash.slice(1)).split('/');
  if (!id) return { id: 'inicio', resto: [] };
  return idsVistas.has(id) ? { id, resto } : null;
}

function marcarPestanas(id) {
  $$('[data-pestana]').forEach((a) => {
    const activa = a.dataset.pestana === id;
    CLASES_PESTANA_ACTIVA.forEach((c) => a.classList.toggle(c, activa));
    CLASES_PESTANA_INACTIVA.forEach((c) => a.classList.toggle(c, !activa));
    marcarActual(a, activa);
  });

  $$('[data-pestana-movil]').forEach((a) => {
    const activa = a.dataset.pestanaMovil === id;
    a.classList.toggle('text-primario-texto', activa);
    a.classList.toggle('text-texto-tenue', !activa);
    $('[data-indicador]', a).classList.toggle('opacity-0', !activa);
    marcarActual(a, activa);
  });
}

function mostrarVista(id, { enfocar = false } = {}) {
  vistaActiva = id;
  $$('[data-vista]').forEach((seccion) => {
    const activa = seccion.dataset.vista === id;
    seccion.hidden = !activa;
    seccion.classList.remove('vista-entrada');
    if (activa) {
      void seccion.offsetWidth; // Reinicia la animación de entrada.
      seccion.classList.add('vista-entrada');
    }
  });

  marcarPestanas(id);

  const vista = negocio.vistas.find((v) => v.id === id);
  document.title = id === 'inicio' ? tituloBase : `${vista.titulo} | ${negocio.nombre}`;

  window.scrollTo({ top: 0, behavior: 'instant' });
  if (enfocar) $(`#titulo-${id}`).focus({ preventScroll: true });
}

function irARuta(ruta, { enfocar }) {
  if (ruta.id === 'productos') navegarCatalogo(ruta.resto);
  if (ruta.id !== vistaActiva) return mostrarVista(ruta.id, { enfocar });
  // Misma vista (cambio de departamento): sin animación, solo subir al título.
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (enfocar) $(`#titulo-${ruta.id}`).focus({ preventScroll: true });
}

function iniciarNavegacion() {
  window.addEventListener('hashchange', () => {
    const ruta = rutaDesdeHash();
    if (ruta) irARuta(ruta, { enfocar: true });
  });
  irARuta(rutaDesdeHash() ?? { id: 'inicio', resto: [] }, { enfocar: false });
}

/* ---------- Arranque ---------- */

function iniciar() {
  renderEncabezado();
  renderPestanasMovil();
  renderInicio();
  renderCatalogo($('#vista-productos'));
  renderContacto();
  renderPie();
  renderWhatsAppFlotante();

  aplicarTema();
  iniciarSelectorPaleta();
  iniciarModo();
  iniciarCarrito($('#carrito-contenedor'));
  alCambiar((piezas) => {
    const contador = $('[data-contador-carrito]');
    contador.textContent = piezas > 99 ? '99+' : piezas;
    contador.classList.toggle('hidden', !piezas);
    $('[data-abrir-carrito]').setAttribute('aria-label', piezas ? `Abrir carrito (${piezas} piezas)` : 'Abrir carrito');
  });
  iniciarCatalogo($('#vista-productos'));
  iniciarMegaMenu();
  iniciarNavegacion();
  iniciarEstadoNegocio();
  iniciarValoracion($('#valoracion-flotante'));
}

iniciar();
