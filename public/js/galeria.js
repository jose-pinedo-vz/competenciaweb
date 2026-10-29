import { negocio } from './data.js';
import { almacenSesion } from './almacen.js';

/*
 * Galería de la portada: cuadrícula de fotos, visor ampliado (lightbox) y opción de
 * agregar fotos desde el dispositivo del visitante.
 *
 * Las fotos agregadas se leen con FileReader, se reducen (máx. 1600 px, JPEG) para no llenar
 * el almacenamiento y se guardan en sessionStorage: solo las ve quien las subió, en ese
 * navegador, y desaparecen al cerrar la pestaña. No se envían a ningún servidor.
 */

const CLAVE = 'arcos-galeria';
const LADO_MAXIMO = 1600;
const CALIDAD_JPEG = 0.85;
const TAMANO_MAXIMO = 15 * 1024 * 1024; // 15 MB por archivo original

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const fotosBase = negocio.galeria.fotos.map((f) => ({ ...f, propia: false }));
let fotosPropias = [];
let contenedor = null;
let indiceActual = 0;
let opener = null;

const todas = () => [...fotosBase, ...fotosPropias];

/** Escapa texto que viene del visitante (nombres de archivo) antes de insertarlo como HTML. */
const escapar = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ---------- Persistencia de la sesión ---------- */

function cargarPropias() {
  try {
    const guardadas = JSON.parse(almacenSesion.leer(CLAVE) ?? '[]');
    fotosPropias = guardadas.filter((f) => typeof f.src === 'string' && f.src.startsWith('data:image/'));
  } catch {
    fotosPropias = [];
  }
}

/** Devuelve false si el navegador ya no tiene espacio: las fotos siguen visibles hasta recargar. */
const guardarPropias = () =>
  fotosPropias.length ? almacenSesion.guardar(CLAVE, JSON.stringify(fotosPropias)) : (almacenSesion.quitar(CLAVE), true);

/* ---------- Lectura y reducción de imágenes ---------- */

const leerComoDataURL = (archivo) =>
  new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = () => rechazar(lector.error);
    lector.readAsDataURL(archivo);
  });

const cargarImagen = (src) =>
  new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => rechazar(new Error('Imagen ilegible'));
    img.src = src;
  });

async function prepararFoto(archivo) {
  const original = await leerComoDataURL(archivo);
  const img = await cargarImagen(original);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(img.naturalWidth * escala);
  lienzo.height = Math.round(img.naturalHeight * escala);
  const ctx = lienzo.getContext('2d');
  ctx.fillStyle = '#ffffff'; // fondo blanco para imágenes con transparencia
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return {
    id: `propia-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    src: lienzo.toDataURL('image/jpeg', CALIDAD_JPEG),
    titulo: archivo.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'Foto agregada',
    descripcion: 'Foto agregada desde tu dispositivo. Solo tú la ves, en este navegador.',
    propia: true,
  };
}

async function agregarArchivos(archivos) {
  const imagenes = [...archivos].filter((a) => a.type.startsWith('image/'));
  const omitidas = archivos.length - imagenes.length;
  const validas = imagenes.filter((a) => a.size <= TAMANO_MAXIMO);
  const pesadas = imagenes.length - validas.length;
  if (!validas.length) {
    anunciar(omitidas || pesadas ? 'No se agregó ninguna foto: elige imágenes de hasta 15 MB.' : '', 'error');
    return;
  }

  anunciar(`Procesando ${validas.length === 1 ? 'la foto' : `${validas.length} fotos`}…`);
  const resultados = await Promise.allSettled(validas.map(prepararFoto));
  const nuevas = resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
  const fallidas = resultados.length - nuevas.length + omitidas + pesadas;

  fotosPropias.push(...nuevas);
  const guardado = guardarPropias();
  renderCuadricula();

  const partes = [];
  if (nuevas.length) partes.push(nuevas.length === 1 ? 'Se agregó 1 foto.' : `Se agregaron ${nuevas.length} fotos.`);
  if (fallidas) partes.push(`${fallidas} ${fallidas === 1 ? 'archivo no se pudo' : 'archivos no se pudieron'} agregar.`);
  if (!guardado) partes.push('El navegador no tiene más espacio: estas fotos se verán hasta que recargues la página.');
  anunciar(partes.join(' '), fallidas || !guardado ? 'aviso' : 'ok');
}

function quitarFoto(id) {
  fotosPropias = fotosPropias.filter((f) => f.id !== id);
  guardarPropias();
  renderCuadricula();
  anunciar('Foto quitada de la galería.');
  $('[data-agregar-foto]', contenedor).focus();
}

/* ---------- Cuadrícula ---------- */

function anunciar(texto, tipo = 'ok') {
  const estado = $('[data-estado-galeria]', contenedor);
  estado.textContent = texto;
  estado.className = `mt-4 min-h-5 text-sm ${tipo === 'error' ? 'text-acento-texto' : tipo === 'aviso' ? 'text-texto' : 'text-texto-tenue'}`;
}

function tarjetaFoto(foto, indice) {
  return `
    <li class="relative">
      <button type="button" data-abrir-foto="${indice}" aria-label="Ver foto ampliada: ${escapar(foto.titulo)}"
              class="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-superficie-alt ring-1 ring-borde transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10 hover:ring-primario/50">
        <img src="${foto.propia ? foto.src : encodeURI(foto.src)}" alt="${escapar(foto.titulo)}" loading="lazy" decoding="async"
             class="size-full object-cover text-[0px] text-transparent transition-transform duration-500 group-hover:scale-105" />
        <span class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-3 pt-10 text-left sm:p-4 sm:pt-12">
          <span class="block text-sm font-bold leading-tight text-white sm:text-base">${escapar(foto.titulo)}</span>
          <span class="mt-1 hidden text-xs leading-snug text-white/80 sm:line-clamp-2">${escapar(foto.descripcion)}</span>
        </span>
        <span class="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/45 text-xs text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <i class="fa-solid fa-expand"></i>
        </span>
        ${
          foto.propia
            ? '<span class="absolute left-2.5 top-2.5 rounded-md bg-destaque px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-destaque-texto shadow-sm">Tu foto</span>'
            : ''
        }
      </button>
      ${
        foto.propia
          ? `<button type="button" data-quitar-foto="${foto.id}" aria-label="Quitar ${escapar(foto.titulo)} de la galería"
                     class="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-superficie text-sm text-texto-suave shadow-md ring-1 ring-borde transition-colors hover:bg-acento hover:text-white">
               <i class="fa-solid fa-xmark" aria-hidden="true"></i>
             </button>`
          : ''
      }
    </li>`;
}

function renderCuadricula() {
  $('[data-cuadricula]', contenedor).innerHTML = `
    ${todas().map(tarjetaFoto).join('')}
    <li>
      <button type="button" data-agregar-foto
              class="zona-carga group flex aspect-[4/5] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-borde bg-superficie p-4 text-center transition-colors hover:border-primario hover:bg-primario-suave">
        <span class="flex size-14 items-center justify-center rounded-full bg-primario-suave text-2xl text-primario-texto transition-colors group-hover:bg-primario group-hover:text-white">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </span>
        <span class="text-sm font-bold text-texto">Agregar foto</span>
        <span class="hidden text-xs text-texto-tenue sm:block">Elige o arrastra imágenes. Solo se ven en este navegador.</span>
      </button>
    </li>`;
}

/* ---------- Visor ampliado ---------- */

function mostrarEnVisor(indice) {
  const fotos = todas();
  indiceActual = (indice + fotos.length) % fotos.length;
  const foto = fotos[indiceActual];
  const img = $('[data-visor-img]');
  img.src = foto.propia ? foto.src : encodeURI(foto.src);
  img.alt = foto.titulo;
  $('[data-visor-titulo]').textContent = foto.titulo;
  $('[data-visor-descripcion]').textContent = foto.descripcion;
  $('[data-visor-contador]').textContent = `${indiceActual + 1} / ${fotos.length}`;
  const variasFotos = fotos.length > 1;
  $$('[data-visor-paso]').forEach((b) => (b.hidden = !variasFotos));

  // Precarga las vecinas para que el cambio sea inmediato.
  [indiceActual - 1, indiceActual + 1].forEach((i) => {
    const vecina = fotos[(i + fotos.length) % fotos.length];
    new Image().src = vecina.propia ? vecina.src : encodeURI(vecina.src);
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
  cargarPropias();

  contenedor.innerHTML = `
    <ul data-cuadricula class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Fotos de la tienda"></ul>
    <input type="file" accept="image/*" multiple hidden data-entrada-fotos aria-hidden="true" tabindex="-1" />
    <p data-estado-galeria class="mt-4 min-h-5 text-sm text-texto-tenue" role="status" aria-live="polite"></p>`;

  renderCuadricula();
  renderVisor();

  const entrada = $('[data-entrada-fotos]', contenedor);

  contenedor.addEventListener('click', (e) => {
    const abrir = e.target.closest('[data-abrir-foto]');
    if (abrir) return abrirVisor(Number(abrir.dataset.abrirFoto));
    const quitar = e.target.closest('[data-quitar-foto]');
    if (quitar) return quitarFoto(quitar.dataset.quitarFoto);
    if (e.target.closest('[data-agregar-foto]')) entrada.click();
  });

  entrada.addEventListener('change', async () => {
    if (entrada.files.length) await agregarArchivos(entrada.files);
    entrada.value = ''; // permite volver a elegir el mismo archivo
  });

  // Arrastrar y soltar sobre la tarjeta "Agregar foto".
  contenedor.addEventListener('dragover', (e) => {
    const zona = e.target.closest('.zona-carga');
    if (!zona) return;
    e.preventDefault();
    zona.classList.add('border-primario', 'bg-primario-suave');
  });
  contenedor.addEventListener('dragleave', (e) => e.target.closest('.zona-carga')?.classList.remove('border-primario', 'bg-primario-suave'));
  contenedor.addEventListener('drop', (e) => {
    const zona = e.target.closest('.zona-carga');
    if (!zona) return;
    e.preventDefault();
    zona.classList.remove('border-primario', 'bg-primario-suave');
    if (e.dataTransfer?.files.length) agregarArchivos(e.dataTransfer.files);
  });
}
