import { negocio } from './data.js';
import { srcFoto } from './galeria.js';
import {
  $, $$, escapar, TEXTO_PROHIBIDO, abrirModal, confirmar, avisar, campo, mostrarErrores, conectarContadores,
  validarImagen, comprimirImagen,
} from './admin-ui.js';

/*
 * Gestión de la galería de la portada en el panel de administración (#admin/galeria).
 * Es el único lugar donde se agregan o eliminan fotos: edita `negocio.galeria.fotos` en sitio
 * y persiste con ctx.guardar() junto con el resto de los datos del admin (arcos-admin-datos),
 * así que también se exporta, importa y restaura. Las fotos subidas se leen con FileReader
 * (vía validarImagen), se reducen a 1400 px y se guardan como data URL.
 */

const LADO_MAXIMO = 1400;
const TAMANO_MAXIMO_MB = 10; // las fotos de celular suelen pesar más que las de producto
const MAX_TITULO = 60;
const MAX_DESCRIPCION = 160;

const boton = {
  primario: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primario px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover',
  secundario: 'inline-flex items-center justify-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-2.5 text-sm font-bold text-texto transition-colors hover:bg-superficie-alt',
};

const fotos = () => negocio.galeria.fotos;
const tituloDesdeArchivo = (nombre) =>
  nombre.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/[<>]/g, '').trim().slice(0, MAX_TITULO) || 'Foto de la tienda';

/** Ejecuta un cambio y lo guarda; si no hay espacio, lo revierte. */
function cambiarYGuardar(ctx, cambio, mensaje) {
  const respaldo = structuredClone(fotos());
  cambio();
  if (ctx.guardar(mensaje)) return true;
  fotos().splice(0, fotos().length, ...respaldo);
  return false;
}

/* ---------- Vista ---------- */

export function renderAdminGaleria(contenedor, ctx) {
  const extensiones = ctx.config.imagenes.extensionesPermitidas;
  contenedor.innerHTML = `
    <div data-seccion>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Galería</h1>
          <p class="mt-1 text-sm text-texto-suave">Fotos de la sección "La tienda en imágenes" de la portada. Los clientes solo pueden verlas.</p>
        </div>
        <label class="${boton.primario} cursor-pointer">
          <i class="fa-solid fa-upload" aria-hidden="true"></i> Subir fotos
          <input type="file" multiple accept="${extensiones.map((e) => `.${e}`).join(',')}" data-subir class="sr-only" />
        </label>
      </div>

      <button type="button" data-zona-carga
              class="zona-carga mt-6 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-borde bg-superficie p-6 text-center transition-colors hover:border-primario hover:bg-primario-suave">
        <span class="flex size-12 items-center justify-center rounded-full bg-primario-suave text-xl text-primario-texto"><i class="fa-solid fa-images" aria-hidden="true"></i></span>
        <span class="text-sm font-bold text-texto">Arrastra fotos aquí o haz clic para elegirlas</span>
        <span class="text-xs text-texto-tenue">${extensiones.join(', ')} · hasta ${TAMANO_MAXIMO_MB} MB · mínimo ${ctx.config.imagenes.dimensionesMinimas.ancho}×${ctx.config.imagenes.dimensionesMinimas.alto} px · se reducen a ${LADO_MAXIMO} px</span>
      </button>

      <p data-resumen class="mt-6 text-sm text-texto-tenue" aria-live="polite"></p>
      <ul data-fotos class="mt-3 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" aria-label="Fotos de la galería"></ul>
    </div>`;

  const seccion = $('[data-seccion]', contenedor);
  const entrada = $('[data-subir]', seccion);
  const pintar = () => pintarFotos(seccion);
  pintar();

  entrada.addEventListener('change', async () => {
    const archivos = [...entrada.files];
    entrada.value = ''; // permite volver a elegir el mismo archivo
    if (archivos.length) await prepararSubida(archivos, ctx, pintar);
  });

  seccion.addEventListener('click', async (e) => {
    if (e.target.closest('[data-zona-carga]')) return entrada.click();
    const eliminar = e.target.closest('[data-eliminar-foto]');
    if (eliminar) await eliminarFoto(Number(eliminar.dataset.eliminarFoto), ctx, seccion, pintar);
  });

  // Arrastrar y soltar sobre la zona de carga.
  const zona = $('[data-zona-carga]', seccion);
  const resaltar = (si) => ['border-primario', 'bg-primario-suave'].forEach((c) => zona.classList.toggle(c, si));
  zona.addEventListener('dragover', (e) => (e.preventDefault(), resaltar(true)));
  zona.addEventListener('dragleave', () => resaltar(false));
  zona.addEventListener('drop', (e) => {
    e.preventDefault();
    resaltar(false);
    const archivos = [...(e.dataTransfer?.files ?? [])];
    if (archivos.length) prepararSubida(archivos, ctx, pintar);
  });
}

function pintarFotos(seccion) {
  const lista = fotos();
  $('[data-resumen]', seccion).textContent = lista.length
    ? `${lista.length} ${lista.length === 1 ? 'foto' : 'fotos'} en la galería pública.`
    : 'La galería está vacía: en la portada se muestra un aviso de "Muy pronto".';
  $('[data-fotos]', seccion).innerHTML = lista
    .map((f, i) => {
      const subida = f.src.startsWith('data:');
      return `
      <li class="admin-card flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie">
        <div class="relative aspect-[4/5] bg-superficie-alt">
          <img src="${srcFoto(f.src)}" alt="${escapar(f.titulo)}" loading="lazy" class="size-full object-cover text-[0px] text-transparent" />
          <span class="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide shadow-sm ${subida ? 'bg-destaque text-destaque-texto' : 'bg-superficie/90 text-texto ring-1 ring-borde'}">${subida ? 'Subida' : 'Carpeta'}</span>
          <span class="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[0.65rem] font-bold tabular-nums text-white">${i + 1}/${lista.length}</span>
        </div>
        <div class="flex flex-1 flex-col p-3">
          <p class="line-clamp-2 text-sm font-bold text-texto">${escapar(f.titulo)}</p>
          <p class="mt-0.5 line-clamp-2 text-xs text-texto-tenue">${escapar(f.descripcion ?? '')}</p>
          <button type="button" data-eliminar-foto="${i}" aria-label="Eliminar la foto ${escapar(f.titulo)}"
                  class="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-borde px-3 py-2 pt-2 text-xs font-bold text-acento-texto transition-colors hover:border-acento hover:bg-acento hover:text-white">
            <i class="fa-solid fa-trash-can" aria-hidden="true"></i> Eliminar
          </button>
        </div>
      </li>`;
    })
    .join('');
}

/* ---------- Eliminar ---------- */

async function eliminarFoto(indice, ctx, seccion, pintar) {
  const foto = fotos()[indice];
  if (!foto) return;
  const deCarpeta = !foto.src.startsWith('data:');
  const ok = await confirmar({
    titulo: 'Eliminar foto',
    mensaje: `<p>¿Quitar <strong class="text-texto">${escapar(foto.titulo)}</strong> de la galería pública?</p>
              ${deCarpeta ? '<p class="mt-2">El archivo de la carpeta <code>galeria/</code> no se borra: puedes recuperarla con <em>Ajustes › Restaurar valores de fábrica</em>.</p>' : '<p class="mt-2">Esta foto se subió desde el panel; al eliminarla no se puede recuperar.</p>'}`,
  });
  if (!ok) return;
  if (!cambiarYGuardar(ctx, () => fotos().splice(indice, 1), 'Foto eliminada de la galería.')) return;
  pintar();
  // Enfoca la siguiente foto (o la zona de carga si ya no quedan).
  ($$('[data-eliminar-foto]', seccion)[Math.min(indice, fotos().length - 1)] ?? $('[data-zona-carga]', seccion)).focus();
}

/* ---------- Subir ---------- */

async function prepararSubida(archivos, ctx, pintar) {
  const reglas = { ...ctx.config.imagenes, dimensionesMaximas: { ancho: Infinity, alto: Infinity } };
  avisar(`Revisando ${archivos.length === 1 ? 'la foto' : `${archivos.length} fotos`}…`, 'info');
  const resultados = await Promise.all(archivos.map(async (archivo) => ({ archivo, r: await validarImagen(archivo, reglas, TAMANO_MAXIMO_MB) })));
  const rechazadas = resultados.filter(({ r }) => !r.valido);
  const validas = resultados
    .filter(({ r }) => r.valido)
    .map(({ archivo, r }) => ({ ...comprimirImagen(r.img, LADO_MAXIMO, 'image/jpeg'), titulo: tituloDesdeArchivo(archivo.name) }));

  rechazadas.forEach(({ archivo, r }) => avisar(`${archivo.name}: ${r.error}`, 'error'));
  if (validas.length) abrirFormularioSubida(validas, ctx, pintar);
}

function abrirFormularioSubida(nuevas, ctx, pintar) {
  abrirModal({
    titulo: nuevas.length === 1 ? 'Agregar foto a la galería' : `Agregar ${nuevas.length} fotos a la galería`,
    ancho: 'sm:max-w-2xl',
    html: `
      <form class="admin-form" novalidate>
        <ul class="divide-y divide-borde">
          ${nuevas
            .map(
              (f, i) => `
            <li class="flex flex-col gap-4 p-5 sm:flex-row">
              <img src="${f.src}" alt="" class="aspect-[4/5] w-full shrink-0 rounded-xl object-cover ring-1 ring-borde sm:w-32" />
              <div class="min-w-0 flex-1 space-y-3">
                ${campo({ nombre: `titulo${i}`, etiqueta: 'Título', valor: f.titulo, requerido: true, max: MAX_TITULO, atributos: i === 0 ? 'data-autofoco' : '' })}
                ${campo({ nombre: `descripcion${i}`, etiqueta: 'Descripción', area: true, max: MAX_DESCRIPCION, ayuda: 'Describe lo que se ve, sin datos que no estén confirmados.' })}
              </div>
            </li>`
            )
            .join('')}
        </ul>
        <div class="sticky bottom-0 flex justify-end gap-2 border-t border-borde bg-superficie px-5 py-4">
          <button type="button" data-cerrar-modal class="${boton.secundario}">Cancelar</button>
          <button type="submit" class="${boton.primario}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Agregar a la galería</button>
        </div>
      </form>`,
    alAbrir: (capa, cerrar) => {
      const form = $('form', capa);
      conectarContadores(form);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const errores = {};
        const datos = nuevas.map((f, i) => {
          const titulo = form.elements[`titulo${i}`].value.trim();
          const descripcion = form.elements[`descripcion${i}`].value.trim();
          if (!titulo) errores[`titulo${i}`] = 'El título es obligatorio.';
          else if (TEXTO_PROHIBIDO.test(titulo)) errores[`titulo${i}`] = 'No se permiten los caracteres < >.';
          if (TEXTO_PROHIBIDO.test(descripcion)) errores[`descripcion${i}`] = 'No se permiten los caracteres < >.';
          return { src: f.src, titulo, descripcion };
        });
        if (!mostrarErrores(form, errores, nuevas.flatMap((_, i) => [`titulo${i}`, `descripcion${i}`]))) return;
        const mensaje = datos.length === 1 ? 'Foto agregada a la galería.' : `${datos.length} fotos agregadas a la galería.`;
        if (!cambiarYGuardar(ctx, () => fotos().push(...datos), mensaje)) return;
        cerrar();
        pintar();
      });
    },
  });
}
