/*
 * Componentes compartidos del panel de administración: avisos (toasts), ventanas modales,
 * confirmaciones, campos de formulario accesibles y utilidades de imágenes.
 * Todo usa los colores semánticos de la paleta (bg-superficie, text-texto…), así que respeta
 * el cambio de paleta y el modo claro/oscuro.
 */

export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

/** Escapa texto antes de insertarlo como HTML. */
export const escapar = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** "Plomería y Grifería" → "plomeria-y-griferia" */
export const aSlug = (texto) =>
  String(texto)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

/** Caracteres que no se aceptan en textos (el sitio los inserta como HTML). */
export const TEXTO_PROHIBIDO = /[<>]/;

let contadorIds = 0;
const nuevoId = (base) => `adm-${base}-${++contadorIds}`;

/** Íconos de FontAwesome disponibles para departamentos, subcategorías y marcas. */
export const ICONOS = [
  'screwdriver-wrench', 'trowel-bricks', 'faucet-drip', 'key', 'house', 'helmet-safety', 'tags', 'bolt', 'hammer',
  'ruler-combined', 'wind', 'gears', 'plug', 'compact-disc', 'flask', 'gear', 'umbrella', 'paint-roller', 'water',
  'grip-lines', 'link', 'faucet', 'door-closed', 'fingerprint', 'lock', 'vault', 'couch', 'fan', 'seedling', 'bug',
  'spray-can-sparkles', 'triangle-exclamation', 'fire', 'calendar-days', 'toolbox', 'box', 'truck', 'lightbulb',
  'fire-extinguisher', 'broom', 'shower', 'sink', 'toilet', 'store',
].map((nombre) => `fa-solid fa-${nombre}`);

/* ---------- Foco ---------- */

const SELECTOR_ENFOCABLE =
  'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';

/** Mantiene Tab / Shift+Tab dentro de `raiz`. */
export function atraparFoco(raiz, e) {
  if (e.key !== 'Tab') return;
  const enfocables = $$(SELECTOR_ENFOCABLE, raiz).filter((el) => el.offsetParent !== null || el === document.activeElement);
  if (!enfocables.length) return;
  const [primero, ultimo] = [enfocables[0], enfocables.at(-1)];
  if (e.shiftKey && document.activeElement === primero) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && document.activeElement === ultimo) {
    e.preventDefault();
    primero.focus();
  }
}

/* ---------- Avisos ---------- */

const ICONOS_AVISO = { ok: 'fa-circle-check text-emerald-400', error: 'fa-circle-xmark text-red-300', info: 'fa-circle-info text-sky-300' };

export function avisar(mensaje, tipo = 'ok') {
  const zona = $('#admin-avisos');
  if (!zona) return;
  const aviso = document.createElement('div');
  aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  aviso.className =
    'admin-aviso pointer-events-auto flex w-full items-start gap-3 rounded-xl bg-texto px-4 py-3 text-sm font-medium text-fondo shadow-2xl sm:w-96';
  aviso.innerHTML = `<i class="fa-solid ${ICONOS_AVISO[tipo] ?? ICONOS_AVISO.info} mt-0.5" aria-hidden="true"></i><span class="flex-1">${escapar(mensaje)}</span>`;
  zona.append(aviso);
  setTimeout(() => aviso.remove(), tipo === 'error' ? 6000 : 4000);
}

/* ---------- Ventanas modales (pila: la de arriba recibe Esc y Tab) ---------- */

const pila = [];

document.addEventListener(
  'keydown',
  (e) => {
    const arriba = pila.at(-1);
    if (!arriba) return;
    if (e.key === 'Escape') {
      e.stopPropagation(); // que no lo reciban los atajos del sitio (carrito, pago…)
      arriba.cerrar();
    } else atraparFoco(arriba.capa, e);
  },
  true
);

/**
 * Abre una ventana modal. `alAbrir(capa, cerrar)` conecta los eventos del contenido;
 * `alCerrar()` se llama al cerrarse por cualquier vía.
 */
export function abrirModal({ titulo, html, ancho = 'sm:max-w-lg', rol = 'dialog', alAbrir, alCerrar }) {
  const opener = document.activeElement;
  const idTitulo = nuevoId('modal');
  const capa = document.createElement('div');
  capa.className = 'admin-modal fixed inset-0 z-[95] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4';
  capa.innerHTML = `
    <section role="${rol}" aria-modal="true" aria-labelledby="${idTitulo}"
             class="admin-modal-ventana flex max-h-[100dvh] w-full ${ancho} flex-col overflow-hidden rounded-t-3xl bg-superficie shadow-2xl sm:max-h-[90dvh] sm:rounded-3xl">
      <header class="flex items-center justify-between gap-3 border-b border-borde px-5 py-4">
        <h2 id="${idTitulo}" class="text-lg font-extrabold text-texto">${titulo}</h2>
        <button type="button" data-cerrar-modal aria-label="Cerrar"
                class="flex size-10 shrink-0 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto">
          <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
        </button>
      </header>
      <div class="min-h-0 flex-1 overflow-y-auto" data-cuerpo-modal>${html}</div>
    </section>`;
  document.body.append(capa);

  const registro = { capa, cerrar: () => {} };
  registro.cerrar = () => {
    if (!capa.isConnected) return;
    capa.remove();
    pila.splice(pila.indexOf(registro), 1);
    opener?.focus?.();
    alCerrar?.();
  };
  pila.push(registro);

  capa.addEventListener('click', (e) => {
    if (e.target === capa || e.target.closest('[data-cerrar-modal]')) registro.cerrar();
  });
  alAbrir?.(capa, registro.cerrar);
  ($('[data-autofoco]', capa) ?? $('[data-cerrar-modal]', capa)).focus();
  return registro;
}

/** Confirmación accesible. Resuelve true si el usuario acepta. */
export const confirmar = ({ titulo, mensaje, accion = 'Eliminar', peligro = true }) =>
  new Promise((resolver) => {
    let aceptado = false;
    abrirModal({
      titulo,
      rol: 'alertdialog',
      ancho: 'sm:max-w-md',
      html: `
        <div class="p-5">
          <div class="text-sm leading-relaxed text-texto-suave">${mensaje}</div>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" data-cerrar-modal data-autofoco
                    class="rounded-xl border border-borde px-5 py-3 text-sm font-bold text-texto transition-colors hover:bg-superficie-alt">Cancelar</button>
            <button type="button" data-confirmar
                    class="rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors ${peligro ? 'bg-acento hover:bg-acento-hover' : 'bg-primario hover:bg-primario-hover'}">${accion}</button>
          </div>
        </div>`,
      alAbrir: (capa, cerrar) =>
        $('[data-confirmar]', capa).addEventListener('click', () => {
          aceptado = true;
          cerrar();
        }),
      alCerrar: () => resolver(aceptado),
    });
  });

/* ---------- Campos de formulario ---------- */

export const claseControl =
  'w-full rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-base text-texto placeholder:text-texto-tenue transition-colors aria-invalid:border-acento aria-invalid:ring-1 aria-invalid:ring-acento disabled:opacity-60 sm:text-sm';

/**
 * Campo con etiqueta, ayuda, contador de caracteres y mensaje de error.
 * `opciones` ([{valor, texto}]) lo convierte en <select>; `area` en <textarea>.
 */
export function campo({ nombre, etiqueta, valor = '', tipo = 'text', requerido = false, max, ayuda = '', atributos = '', omitido = false, area = false, opciones = null, ancho = '' }) {
  const id = nuevoId(nombre);
  const describe = [`${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(' ');
  const comunes = `id="${id}" name="${nombre}" aria-describedby="${describe}" ${requerido ? 'aria-required="true"' : ''} ${max ? `maxlength="${max}" data-max="${max}"` : ''} ${atributos}`;
  const control = opciones
    ? `<select ${comunes} class="${claseControl}">${opciones
        .map((o) => `<option value="${escapar(o.valor)}" ${String(o.valor) === String(valor) ? 'selected' : ''}>${escapar(o.texto)}</option>`)
        .join('')}</select>`
    : area
      ? `<textarea ${comunes} rows="3" class="${claseControl} resize-y">${escapar(valor)}</textarea>`
      : `<input ${comunes} type="${tipo}" value="${escapar(valor)}" class="${claseControl}" />`;

  return `
    <div class="${omitido ? 'campo-omitido' : ''} ${ancho}" data-campo="${nombre}">
      <label for="${id}" class="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold text-texto">
        <span>${etiqueta}${requerido ? ' <span class="text-acento-texto" aria-hidden="true">*</span>' : ''}</span>
        ${max ? `<span class="text-xs font-normal tabular-nums text-texto-tenue" data-contador aria-hidden="true"></span>` : ''}
      </label>
      ${control}
      ${ayuda ? `<p id="${id}-ayuda" class="mt-1 text-xs text-texto-tenue">${ayuda}</p>` : ''}
      <p id="${id}-error" class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="${nombre}"></p>
    </div>`;
}

export function casilla({ nombre, etiqueta, marcado = false, ayuda = '', omitido = false, valor = 'si' }) {
  const id = nuevoId(nombre);
  return `
    <label for="${id}" class="${omitido ? 'campo-omitido' : ''} flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-borde p-3 transition-colors has-checked:border-primario has-checked:bg-primario-suave" data-campo="${nombre}">
      <input id="${id}" type="checkbox" name="${nombre}" value="${escapar(valor)}" ${marcado ? 'checked' : ''} class="mt-0.5 size-4 shrink-0 accent-[var(--p-primario)]" />
      <span><span class="block text-sm font-semibold text-texto">${etiqueta}</span>${ayuda ? `<span class="block text-xs text-texto-tenue">${ayuda}</span>` : ''}</span>
    </label>`;
}

export function mostrarError(formulario, nombre, mensaje) {
  const error = $(`[data-error="${nombre}"]`, formulario);
  const control = formulario.elements[nombre];
  if (!error) return;
  error.textContent = mensaje ?? '';
  error.classList.toggle('hidden', !mensaje);
  const controles = control instanceof RadioNodeList ? [...control] : control ? [control] : [];
  controles.forEach((c) => c.setAttribute?.('aria-invalid', String(!!mensaje)));
}

/** Muestra todos los errores ({campo: mensaje}) y enfoca el primero. Devuelve true si no hay errores. */
export function mostrarErrores(formulario, errores, campos) {
  campos.forEach((c) => mostrarError(formulario, c, errores[c]));
  const primero = campos.find((c) => errores[c]);
  if (primero) {
    const control = formulario.elements[primero];
    (control instanceof RadioNodeList ? control[0] : control)?.focus();
  }
  return !primero;
}

/** Contadores "12/100" de los campos con data-max. */
export function conectarContadores(formulario) {
  const actualizar = (control) => {
    const contador = control.closest('[data-campo]')?.querySelector('[data-contador]');
    if (contador) contador.textContent = `${control.value.length}/${control.dataset.max}`;
  };
  $$('[data-max]', formulario).forEach(actualizar);
  formulario.addEventListener('input', (e) => e.target.dataset?.max && actualizar(e.target));
}

/* ---------- Imágenes ---------- */

const TIPOS_POR_EXTENSION = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

const cargarImagen = (src) =>
  new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = () => rechazar(new Error('ilegible'));
    img.src = src;
  });

/**
 * Valida extensión, tipo real, peso y dimensiones (paso 14 del prompt).
 * Resuelve { valido, error } y, si es válida, la imagen ya decodificada.
 */
export async function validarImagen(archivo, reglas, tamanoMaximoMB) {
  const extension = archivo.name.includes('.') ? archivo.name.split('.').pop().toLowerCase() : '';
  if (!reglas.extensionesPermitidas.includes(extension))
    return { valido: false, error: `Formato no permitido. Usa: ${reglas.extensionesPermitidas.join(', ')}.` };
  if (archivo.type && archivo.type !== TIPOS_POR_EXTENSION[extension])
    return { valido: false, error: 'El contenido del archivo no coincide con su extensión.' };
  if (archivo.size > tamanoMaximoMB * 1024 * 1024)
    return { valido: false, error: `La imagen pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB; el máximo es ${tamanoMaximoMB} MB.` };

  const url = URL.createObjectURL(archivo);
  try {
    const img = await cargarImagen(url);
    const { naturalWidth: ancho, naturalHeight: alto } = img;
    const min = reglas.dimensionesMinimas;
    const max = reglas.dimensionesMaximas;
    if (ancho < min.ancho || alto < min.alto) return { valido: false, error: `Mínimo ${min.ancho}×${min.alto} px (la imagen mide ${ancho}×${alto}).` };
    if (ancho > max.ancho || alto > max.alto) return { valido: false, error: `Máximo ${max.ancho}×${max.alto} px (la imagen mide ${ancho}×${alto}).` };
    return { valido: true, img, ancho, alto, tipo: TIPOS_POR_EXTENSION[extension] };
  } catch {
    return { valido: false, error: 'No se pudo leer la imagen.' };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Reduce la imagen para guardarla en localStorage (data URL). Conserva PNG/WebP; JPEG al 82%. */
export function comprimirImagen(img, ladoMaximo, tipo) {
  const escala = Math.min(1, ladoMaximo / Math.max(img.naturalWidth, img.naturalHeight));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(img.naturalWidth * escala);
  lienzo.height = Math.round(img.naturalHeight * escala);
  const ctx = lienzo.getContext('2d');
  if (tipo === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  }
  ctx.drawImage(img, 0, 0, lienzo.width, lienzo.height);
  return { src: lienzo.toDataURL(tipo, 0.82), ancho: lienzo.width, alto: lienzo.height };
}

/** Descarga un objeto como archivo JSON. */
export function descargarJSON(nombreArchivo, datos) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }));
  const enlace = Object.assign(document.createElement('a'), { href: url, download: nombreArchivo });
  document.body.append(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
