import { negocio, paletas, trayectoria, direccionCompleta, enlaceWhatsApp } from './data.js';

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const raiz = document.documentElement;
const anioActual = new Date().getFullYear();
const { decadas } = trayectoria();

const urlMapaEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(direccionCompleta())}&z=17&output=embed`;
const urlComoLlegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta())}`;

const enlaceExterno = 'target="_blank" rel="noopener noreferrer"';
const tituloBase = document.title;

/* ---------- Preferencias guardadas ---------- */

const CLAVE_PALETA = 'arcos-paleta';
const CLAVE_MODO = 'arcos-modo';

const almacen = {
  leer(clave) {
    try {
      return localStorage.getItem(clave);
    } catch {
      return null;
    }
  },
  guardar(clave, valor) {
    try {
      localStorage.setItem(clave, valor);
    } catch {
      /* Sin almacenamiento (modo privado): la preferencia dura solo esta visita. */
    }
  },
};

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
    .map(
      ({ id, etiqueta }) => `
        <a href="#${id}" data-pestana="${id}"
           class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors">${etiqueta}</a>`
    )
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
      <a href="#inicio" class="shrink-0 rounded-lg bg-white px-2 py-1 ring-1 ring-borde" aria-label="${negocio.nombre}, ir al inicio">
        ${logotipo('w-24 sm:w-28 lg:w-32')}
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

        <a href="${enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion)}" ${enlaceExterno}
           class="hidden h-11 items-center gap-2 rounded-xl bg-acento px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-acento-hover sm:inline-flex">
          <i class="fa-brands fa-whatsapp text-base" aria-hidden="true"></i> Cotizar
        </a>
      </div>
    </div>
    <div class="franja-marca h-1" aria-hidden="true"></div>
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

function renderInicio() {
  const { historia } = negocio;
  const datos = [
    { valor: `+${decadas}`, texto: 'años de trayectoria', icono: 'fa-solid fa-award' },
    { valor: negocio.anioFundacion, texto: 'año de fundación', icono: 'fa-solid fa-calendar-check' },
    { valor: negocio.categorias.length, texto: 'líneas de producto', icono: 'fa-solid fa-boxes-stacked' },
  ];

  $('#vista-inicio').innerHTML = `
    <div class="relative overflow-hidden bg-hero-fondo">
      <div class="patron-industrial absolute inset-0" aria-hidden="true"></div>

      <div class="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-20">
        <div class="lg:col-span-7">
          <p class="inline-flex items-center gap-2 rounded-full border border-destaque/30 bg-destaque/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destaque">
            <i class="fa-solid fa-award" aria-hidden="true"></i> Desde ${negocio.anioFundacion} en El Pitillal
          </p>

          <h1 id="titulo-inicio" tabindex="-1" class="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-hero-texto focus:outline-none sm:text-5xl lg:text-6xl">
            “Si no conoces <span class="text-destaque">los Arcos</span> no conoces el Pitillal”
          </h1>

          <p class="mt-5 max-w-xl text-base leading-relaxed text-pretty text-hero-suave sm:text-lg">
            Plomería, adhesivos, impermeabilizantes, tornillería, material eléctrico y pintura,
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

        <div class="order-first mx-auto w-full max-w-xs sm:max-w-sm lg:order-none lg:col-span-5 lg:max-w-none">
          <div class="rounded-3xl bg-white p-4 shadow-2xl shadow-black/30 ring-1 ring-black/5 sm:p-6">
            ${logotipo('w-full')}
          </div>
        </div>
      </div>
      <div class="franja-marca h-1.5" aria-hidden="true"></div>
    </div>

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

/* ---------- Vista: Productos ---------- */

function renderProductos() {
  const tarjetas = negocio.categorias
    .map(
      ({ icono, nombre, descripcion, marcas, productos }) => `
      <article class="group flex flex-col rounded-2xl border border-borde bg-superficie p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primario/40 hover:shadow-xl hover:shadow-black/5">
        <div class="flex size-14 items-center justify-center rounded-xl bg-primario-suave text-2xl text-primario-texto transition duration-300 group-hover:bg-primario group-hover:text-white">
          <i class="${icono}" aria-hidden="true"></i>
        </div>

        <h2 class="mt-5 text-lg font-bold text-texto">${nombre}</h2>
        <p class="mt-2 text-sm leading-relaxed text-texto-suave">${descripcion}</p>

        ${
          marcas.length
            ? `<ul class="mt-4 flex flex-wrap gap-2" aria-label="Marcas">
                ${marcas.map((m) => `<li class="rounded-md bg-destaque/15 px-2.5 py-1 text-xs font-bold text-texto ring-1 ring-destaque/40">${m}</li>`).join('')}
              </ul>`
            : ''
        }

        <ul class="mt-5 space-y-2 border-t border-borde pt-5 text-sm text-texto-suave">
          ${productos
            .map((p) => `<li class="flex items-start gap-2.5"><i class="fa-solid fa-check mt-1 text-xs text-acento-texto" aria-hidden="true"></i>${p}</li>`)
            .join('')}
        </ul>

        <a href="${enlaceWhatsApp(`¡Hola, Los Arcos! Quisiera cotizar productos de ${nombre.toLowerCase()}:\n\n- `)}" ${enlaceExterno}
           class="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-primario-texto transition-colors hover:text-acento-texto">
          Cotizar esta línea
          <i class="fa-solid fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true"></i>
        </a>
      </article>`
    )
    .join('');

  $('#vista-productos').innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      ${encabezadoVista({
        id: 'titulo-productos',
        etiqueta: 'Catálogo',
        titulo: 'Todo lo que tu obra y tu hogar necesitan',
        subtitulo: 'Trabajamos con marcas de confianza y te ayudamos a elegir la pieza correcta a la primera.',
      })}

      <div class="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">${tarjetas}</div>

      <div class="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-dashed border-borde bg-superficie p-6 text-center sm:flex-row sm:p-8 sm:text-left">
        <div>
          <p class="text-lg font-bold text-texto">¿No encuentras lo que buscas?</p>
          <p class="mt-1 text-sm text-texto-suave">Tenemos mucho más en tienda. Mándanos una foto o el nombre de la pieza y te decimos si la tenemos.</p>
        </div>
        <a href="${enlaceWhatsApp('¡Hola, Los Arcos! ¿Tienen disponible este producto?\n\n')}" ${enlaceExterno}
           class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primario px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primario-hover">
          <i class="fa-brands fa-whatsapp text-base" aria-hidden="true"></i> Preguntar disponibilidad
        </a>
      </div>
    </div>`;
}

/* ---------- Vista: Ubicación y contacto ---------- */

function renderContacto() {
  const { contacto } = negocio;
  const d = contacto.direccion;
  const canales = [
    {
      href: enlaceWhatsApp(negocio.mensajesWhatsApp.cotizacion),
      externo: true,
      icono: 'fa-brands fa-whatsapp',
      fondo: 'bg-whatsapp',
      titulo: 'WhatsApp',
      texto: 'Cotizaciones y disponibilidad al momento.',
      accion: 'Enviar mensaje',
    },
    {
      href: contacto.telefonoHref,
      externo: false,
      icono: 'fa-solid fa-phone',
      fondo: 'bg-acento',
      titulo: 'Llámanos',
      texto: contacto.telefono,
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
  ];

  $('#vista-contacto').innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      ${encabezadoVista({
        id: 'titulo-contacto',
        etiqueta: 'Ubicación y contacto',
        titulo: 'Visítanos o escríbenos',
        subtitulo: 'Te esperamos en el Centro de El Pitillal, sobre la calle Vicente Guerrero.',
      })}

      <div class="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
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

      <div class="mt-5 grid gap-5 lg:grid-cols-5">
        <div class="flex flex-col gap-4 rounded-2xl border border-borde bg-superficie p-6 lg:col-span-2">
          <div class="flex gap-4">
            <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primario text-lg text-white">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
            </span>
            <address class="not-italic">
              <p class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Dirección</p>
              <p class="mt-1 font-bold text-texto">${d.calle}, ${d.colonia}</p>
              <p class="text-texto-suave">${d.localidad}, C.P. ${d.cp}</p>
              <p class="text-texto-suave">${d.ciudad}, ${d.estado}, ${d.pais}</p>
            </address>
          </div>

          <div class="flex gap-4 border-t border-borde pt-4">
            <span class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primario text-lg text-white">
              <i class="fa-solid fa-phone" aria-hidden="true"></i>
            </span>
            <div>
              <p class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Teléfono / WhatsApp</p>
              <a href="${contacto.telefonoHref}" class="mt-1 block font-bold text-texto transition-colors hover:text-acento-texto">${contacto.telefono}</a>
            </div>
          </div>

          <a href="${urlComoLlegar}" ${enlaceExterno}
             class="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-acento px-5 py-3.5 font-bold text-white transition-colors hover:bg-acento-hover">
            <i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i> Cómo llegar
          </a>
        </div>

        <div id="contenedor-mapa" class="relative min-h-72 overflow-hidden rounded-2xl border border-borde bg-superficie-alt lg:col-span-3 lg:min-h-80">
          <div class="patron-claro absolute inset-0" aria-hidden="true"></div>
          <div class="relative flex h-full min-h-72 flex-col items-center justify-center gap-4 p-8 text-center lg:min-h-80">
            <span class="flex size-16 items-center justify-center rounded-full bg-superficie text-2xl text-acento-texto shadow-md">
              <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
            </span>
            <p class="max-w-xs text-sm text-texto-suave">${d.calle}, ${d.localidad}, ${d.ciudad}</p>
            <button id="boton-mapa" type="button"
                    class="rounded-xl border border-borde bg-superficie px-5 py-2.5 text-sm font-bold text-texto shadow-sm transition-colors hover:bg-fondo">
              Mostrar mapa de referencia
            </button>
          </div>
        </div>
      </div>
    </div>`;
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

/** Vista indicada por el hash; null si el hash apunta a otra cosa (p. ej. #contenido). */
function vistaDesdeHash() {
  const id = location.hash.slice(1);
  if (!id) return 'inicio';
  return idsVistas.has(id) ? id : null;
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

function iniciarNavegacion() {
  window.addEventListener('hashchange', () => {
    const id = vistaDesdeHash();
    if (id) mostrarVista(id, { enfocar: true });
  });
  mostrarVista(vistaDesdeHash() ?? 'inicio');
}

function iniciarMapa() {
  $('#boton-mapa').addEventListener(
    'click',
    () => {
      $('#contenedor-mapa').innerHTML = `
        <iframe src="${urlMapaEmbed}" title="Mapa de ubicación de ${negocio.nombre}"
                class="absolute inset-0 size-full border-0" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    },
    { once: true }
  );
}

/* ---------- Arranque ---------- */

function iniciar() {
  renderEncabezado();
  renderPestanasMovil();
  renderInicio();
  renderProductos();
  renderContacto();
  renderPie();
  renderWhatsAppFlotante();

  aplicarTema();
  iniciarSelectorPaleta();
  iniciarModo();
  iniciarNavegacion();
  iniciarMapa();
}

iniciar();
