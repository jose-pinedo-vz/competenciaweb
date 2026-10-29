import { negocio } from './data.js';
import { almacenSesion } from './almacen.js';

/*
 * Galería de la portada: cuadrícula de fotos y visor ampliado (lightbox). Es pública y de
 * solo lectura: las fotos se agregan y eliminan exclusivamente desde el panel de
 * administración (#admin/galeria), que edita `negocio.galeria.fotos` (ver admin-galeria.js).
 */

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

let contenedor = null;
let indiceActual = 0;
let opener = null;

/** Fotos vigentes (de data.js o editadas desde el admin; admin-datos.js ya las aplicó). */
const todas = () => negocio.galeria.fotos;

/** Las fotos subidas desde el admin son data URL; las de la carpeta, rutas a codificar. */
export const srcFoto = (src) => (src.startsWith('data:') ? src : encodeURI(src));

/** Escapa texto antes de insertarlo como HTML. */
const escapar = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- Cuadrícula ---------- */

function tarjetaFoto(foto, indice) {
  return `
    <li>
      <button type="button" data-abrir-foto="${indice}" aria-label="Ver foto ampliada: ${escapar(foto.titulo)}"
              class="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-superficie-alt ring-1 ring-borde transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 hover:ring-primario/50">
        <img src="${srcFoto(foto.src)}" alt="${escapar(foto.titulo)}" loading="lazy" decoding="async"
             class="size-full object-cover text-[0px] text-transparent transition-transform duration-500 group-hover:scale-105" />
        <span class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 text-left sm:p-4 sm:pt-12">
          <span class="block text-sm font-bold leading-tight text-white sm:text-base">${escapar(foto.titulo)}</span>
          <span class="mt-1 hidden text-xs leading-snug text-white/80 sm:line-clamp-2">${escapar(foto.descripcion)}</span>
        </span>
        <span class="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/45 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <i class="fa-solid fa-expand"></i>
        </span>
      </button>
    </li>`;
}

function renderCuadricula() {
  const fotos = todas();
  $('[data-cuadricula]', contenedor).innerHTML = fotos.length
    ? fotos.map(tarjetaFoto).join('')
    : `<li class="col-span-full rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center text-sm text-texto-suave">
         <i class="fa-regular fa-images mb-2 block text-2xl text-texto-tenue" aria-hidden="true"></i>
         Muy pronto compartiremos fotos de la tienda.
       </li>`;
}

/* ---------- Visor ampliado ---------- */

function mostrarEnVisor(indice) {
  const fotos = todas();
  indiceActual = (indice + fotos.length) % fotos.length;
  const foto = fotos[indiceActual];
  const img = $('[data-visor-img]');
  img.src = srcFoto(foto.src);
  img.alt = foto.titulo;
  $('[data-visor-titulo]').textContent = foto.titulo;
  $('[data-visor-descripcion]').textContent = foto.descripcion ?? '';
  $('[data-visor-contador]').textContent = `${indiceActual + 1} / ${fotos.length}`;
  $$('[data-visor-paso]').forEach((b) => (b.hidden = fotos.length < 2));

  // Precarga las vecinas para que el cambio sea inmediato.
  [indiceActual - 1, indiceActual + 1].forEach((i) => {
    new Image().src = srcFoto(fotos[(i + fotos.length) % fotos.length].src);
  });
}

function abrirVisor(indice) {
  opener = document.activeElement;
  mostrarEnVisor(indice);
  $('#visor-galeria').hidden = false;
  document.body.classList.add('overflow-hidden');
  $('#visor-galeria [data-cerrar-visor]').focus();
}

function cerrarVisor() {
  if ($('#visor-galeria').hidden) return;
  $('#visor-galeria').hidden = true;
  $('[data-visor-img]').removeAttribute('src');
  document.body.classList.remove('overflow-hidden');
  opener?.focus?.();
}

function renderVisor() {
  const boton =
    'flex size-12 shrink-0 items-center justify-center rounded-full bg-black/60 text-lg text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/25 sm:bg-white/10';
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <div id="visor-galeria" hidden role="dialog" aria-modal="true" aria-labelledby="visor-titulo"
         class="visor-galeria fixed inset-0 z-[85] flex flex-col bg-black/95 backdrop-blur-sm">
      <div class="flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6">
        <span data-visor-contador class="text-sm font-semibold tabular-nums text-white/70"></span>
        <button type="button" data-cerrar-visor aria-label="Cerrar visor" class="${boton}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>

      <div class="relative flex min-h-0 flex-1 items-center justify-center gap-2 px-2 sm:gap-4 sm:px-6" data-zona-deslizar>
        <button type="button" data-visor-paso="-1" aria-label="Foto anterior" class="${boton} absolute left-3 z-10 sm:static">
          <i class="fa-solid fa-chevron-left" aria-hidden="true"></i>
        </button>
        <img data-visor-img alt="" class="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl" draggable="false" />
        <button type="button" data-visor-paso="1" aria-label="Foto siguiente" class="${boton} absolute right-3 z-10 sm:static">
          <i class="fa-solid fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>

      <div class="mx-auto w-full max-w-3xl px-5 pb-6 pt-4 text-center sm:pb-8" aria-live="polite">
        <h2 id="visor-titulo" data-visor-titulo class="text-lg font-bold text-white"></h2>
        <p data-visor-descripcion class="mt-1 text-sm text-white/75"></p>
      </div>
    </div>`
  );

  const visor = $('#visor-galeria');
  visor.addEventListener('click', (e) => {
    if (e.target.closest('[data-cerrar-visor]')) return cerrarVisor();
    const paso = e.target.closest('[data-visor-paso]');
    if (paso) return mostrarEnVisor(indiceActual + Number(paso.dataset.visorPaso));
    // Clic en el fondo (fuera de la foto y los controles) cierra el visor.
    if (e.target === visor || e.target.matches('[data-zona-deslizar]')) cerrarVisor();
  });

  // Deslizar con el dedo en móvil.
  let inicioX = null;
  const zona = $('[data-zona-deslizar]', visor);
  zona.addEventListener('pointerdown', (e) => (inicioX = e.clientX));
  zona.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mostrarEnVisor(indiceActual + (dx < 0 ? 1 : -1));
  });

  document.addEventListener('keydown', (e) => {
    if (visor.hidden) return;
    if (e.key === 'Escape') cerrarVisor();
    else if (e.key === 'ArrowRight') mostrarEnVisor(indiceActual + 1);
    else if (e.key === 'ArrowLeft') mostrarEnVisor(indiceActual - 1);
    else if (e.key === 'Tab') {
      // Mantiene el foco dentro del visor.
      const enfocables = $$('button:not([hidden])', visor);
      const [primero, ultimo] = [enfocables[0], enfocables.at(-1)];
      if (e.shiftKey && document.activeElement === primero) (e.preventDefault(), ultimo.focus());
      else if (!e.shiftKey && document.activeElement === ultimo) (e.preventDefault(), primero.focus());
    }
  });
}

/* ---------- Arranque ---------- */

export function iniciarGaleria(elemento) {
  contenedor = elemento;
  // Limpieza: versiones anteriores guardaban fotos de visitantes en esta clave de sesión.
  almacenSesion.quitar('arcos-galeria');

  contenedor.innerHTML = '<ul data-cuadricula class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Fotos de la tienda"></ul>';
  renderCuadricula();
  renderVisor();

  contenedor.addEventListener('click', (e) => {
    const abrir = e.target.closest('[data-abrir-foto]');
    if (abrir) abrirVisor(Number(abrir.dataset.abrirFoto));
  });
}
