import { negocio, enlaceWhatsApp } from './data.js';
import { almacen } from './almacen.js';

/*
 * Creador de color (#color): el visitante crea un tono propio, lo ve aplicado en una
 * habitación (SVG) y pregunta por él por WhatsApp. Es independiente del catálogo: no
 * depende de ningún producto ni promete que la tienda tenga o pueda preparar ese tono.
 *
 * - Herramientas: selector nativo, código HEX, deslizadores de tono/saturación/luminosidad,
 *   variaciones más claras y más oscuras, paleta de inicio y "Mis colores" (localStorage).
 * - La dirección #color/RRGGBB permite compartir el tono.
 */

const CLAVE_GUARDADOS = 'arcos-colores';
const config = negocio.creadorColor;

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

let raiz = null;
const estado = { hex: config.colorInicial, h: 0, s: 0, l: 0, habitacion: config.habitaciones[0].id };

/* ================= Conversión de color ================= */

/** '#abc', 'ABC123', ' #a1b2c3 ' → '#A1B2C3'; null si no es válido. */
export function normalizarHex(texto) {
  let t = String(texto ?? '').trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(t)) t = [...t].map((c) => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(t) ? `#${t.toUpperCase()}` : null;
}

const hexARgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbAHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase()}`;

export function rgbAHsl([r, g, b]) {
  [r, g, b] = [r / 255, g / 255, b / 255];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(h * 60) % 360, Math.round(s * 100), Math.round(l * 100)];
}

export function hslARgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => v * 255);
}

/** Luminancia relativa (WCAG) para elegir texto claro u oscuro sobre el color. */
function luminancia(hex) {
  const [r, g, b] = hexARgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Color de texto con mejor contraste sobre `hex`. */
export const textoSobre = (hex) => {
  const lum = luminancia(hex);
  return (lum + 0.05) / 0.05 >= 1.05 / (lum + 0.05) ? '#111827' : '#FFFFFF';
};

/** Nombre descriptivo aproximado: "Azul claro", "Verde grisáceo oscuro", "Gris perla"… */
export function nombreDescriptivo(h, s, l) {
  if (l >= 95) return 'Blanco';
  if (l <= 8) return 'Negro';
  if (s <= 10) return l >= 75 ? 'Gris claro' : l >= 45 ? 'Gris medio' : 'Gris oscuro';
  // Casi blancos con un poco de color: cálidos (cremas, hueso) o fríos.
  if (l >= 88 && s < 60) return h >= 20 && h < 75 ? 'Blanco cálido' : h >= 170 && h < 270 ? 'Blanco frío' : 'Blanco rosado';
  let base;
  if (h >= 15 && h < 45 && l < 45) base = 'Café';
  else if (h >= 10 && h < 30 && s >= 35 && s <= 70 && l >= 35 && l <= 55) base = 'Terracota';
  else if (h >= 25 && h < 55 && s < 45 && l >= 60) base = 'Beige';
  else if ((h < 15 || h >= 345) && l >= 70) base = 'Rosa';
  else if (h < 15 || h >= 345) base = 'Rojo';
  else if (h < 40) base = 'Naranja';
  else if (h < 65) base = 'Amarillo';
  else if (h < 80) base = 'Verde amarillento';
  else if (h < 165) base = 'Verde';
  else if (h < 195) base = 'Turquesa';
  else if (h < 250) base = 'Azul';
  else if (h < 290) base = 'Morado';
  else base = 'Rosa';
  const grisaceo = s < 35 ? ' grisáceo' : '';
  const claridad = l >= 80 ? ' muy claro' : l >= 62 ? ' claro' : l >= 38 ? '' : l >= 22 ? ' oscuro' : ' muy oscuro';
  return `${base}${grisaceo}${claridad}`;
}

/* ================= Habitación (SVG) ================= */

/*
 * Perspectiva sencilla: techo, pared de fondo, paredes laterales (con sombra) y piso.
 * Las paredes usan fill: var(--tono), así que el color cambia sin volver a dibujar.
 */
const MUEBLES = {
  sala: `
    <rect x="112" y="68" width="78" height="58" rx="2" fill="#dbeafe" stroke="#f8fafc" stroke-width="4" />
    <line x1="151" y1="68" x2="151" y2="126" stroke="#f8fafc" stroke-width="3" />
    <rect x="222" y="74" width="62" height="42" rx="2" fill="#f8fafc" opacity=".9" />
    <rect x="228" y="80" width="50" height="30" fill="#94a3b8" />
    <rect x="128" y="150" width="144" height="22" rx="7" fill="#475569" />
    <rect x="120" y="166" width="160" height="26" rx="8" fill="#334155" />
    <rect x="120" y="160" width="16" height="32" rx="6" fill="#1e293b" />
    <rect x="264" y="160" width="16" height="32" rx="6" fill="#1e293b" />
    <rect x="292" y="176" width="18" height="22" rx="3" fill="#a16207" />
    <circle cx="301" cy="166" r="14" fill="#15803d" />`,
  cocina: `
    <rect x="92" y="62" width="216" height="36" rx="3" fill="#f8fafc" stroke="#cbd5e1" />
    <line x1="146" y1="62" x2="146" y2="98" stroke="#cbd5e1" /><line x1="200" y1="62" x2="200" y2="98" stroke="#cbd5e1" /><line x1="254" y1="62" x2="254" y2="98" stroke="#cbd5e1" />
    <rect x="176" y="110" width="48" height="26" rx="3" fill="#94a3b8" />
    <rect x="88" y="148" width="224" height="7" fill="#57534e" />
    <rect x="92" y="155" width="216" height="43" fill="#f8fafc" stroke="#cbd5e1" />
    <line x1="146" y1="155" x2="146" y2="198" stroke="#cbd5e1" /><line x1="254" y1="155" x2="254" y2="198" stroke="#cbd5e1" />
    <rect x="166" y="160" width="68" height="34" fill="#1f2937" />
    <circle cx="186" cy="152" r="4" fill="#111827" /><circle cx="214" cy="152" r="4" fill="#111827" />`,
  dormitorio: `
    <rect x="232" y="70" width="62" height="52" rx="2" fill="#dbeafe" stroke="#f8fafc" stroke-width="4" />
    <rect x="128" y="120" width="124" height="40" rx="6" fill="#92400e" />
    <rect x="116" y="156" width="148" height="36" rx="6" fill="#f8fafc" />
    <rect x="116" y="170" width="148" height="22" rx="5" fill="#93c5fd" />
    <rect x="130" y="148" width="40" height="14" rx="6" fill="#e2e8f0" /><rect x="210" y="148" width="40" height="14" rx="6" fill="#e2e8f0" />
    <rect x="94" y="166" width="20" height="26" rx="2" fill="#a16207" />
    <path d="M98 150 h12 l-3 -12 h-6 z" fill="#fde68a" /><rect x="103" y="150" width="2" height="16" fill="#78350f" />`,
  bano: `
    <rect x="176" y="66" width="48" height="62" rx="24" fill="#e0f2fe" stroke="#f8fafc" stroke-width="4" />
    <rect x="164" y="146" width="72" height="8" rx="3" fill="#f8fafc" />
    <rect x="170" y="154" width="60" height="40" rx="3" fill="#78716c" />
    <rect x="196" y="136" width="8" height="12" rx="2" fill="#cbd5e1" />
    <rect x="94" y="160" width="62" height="34" rx="10" fill="#f8fafc" stroke="#cbd5e1" />
    <rect x="250" y="150" width="38" height="44" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
    <rect x="256" y="136" width="26" height="16" rx="4" fill="#f8fafc" stroke="#cbd5e1" />`,
};

function svgHabitacion(tipo) {
  return `
    <title data-svg-titulo></title>
    <polygon points="0,0 400,0 320,52 80,52" fill="#f5f5f4" />
    <rect class="habitacion-pared" x="80" y="52" width="240" height="148" style="fill: var(--tono)" />
    <polygon class="habitacion-pared" points="0,0 80,52 80,200 0,262" style="fill: var(--tono)" />
    <polygon points="0,0 80,52 80,200 0,262" fill="#000" opacity=".10" />
    <polygon class="habitacion-pared" points="400,0 320,52 320,200 400,262" style="fill: var(--tono)" />
    <polygon points="400,0 320,52 320,200 400,262" fill="#000" opacity=".18" />
    <polygon points="0,262 80,200 320,200 400,262" fill="#c8a27a" />
    <polygon points="0,262 80,200 320,200 400,262" fill="url(#vetas)" opacity=".35" />
    <line x1="80" y1="200" x2="320" y2="200" stroke="#000" stroke-opacity=".12" />
    ${MUEBLES[tipo] ?? ''}`;
}

/* ================= Vista ================= */

const claseControl =
  'w-full rounded-xl border border-borde bg-superficie px-3.5 py-2.5 text-base text-texto placeholder:text-texto-tenue aria-invalid:border-acento aria-invalid:ring-1 aria-invalid:ring-acento sm:text-sm';

export function renderCreadorColor(contenedor) {
  raiz = contenedor;
  const [h, s, l] = rgbAHsl(hexARgb(estado.hex));
  Object.assign(estado, { h, s, l });

  const deslizador = (clave, etiqueta, max) => `
    <div>
      <div class="mb-1.5 flex items-center justify-between text-sm">
        <label for="color-${clave}" class="font-semibold text-texto">${etiqueta}</label>
        <span class="tabular-nums text-texto-tenue" data-valor="${clave}"></span>
      </div>
      <input id="color-${clave}" type="range" min="0" max="${max}" step="1" data-hsl="${clave}" class="deslizador-color w-full" />
    </div>`;

  contenedor.innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div class="max-w-3xl">
        <p class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-acento-texto">
          <i class="fa-solid fa-palette" aria-hidden="true"></i> Crea tu color
        </p>
        <h1 id="titulo-color" tabindex="-1" class="mt-3 text-3xl font-extrabold tracking-tight text-balance text-texto focus:outline-none sm:text-4xl">Diseña el tono para tu pared</h1>
        <p class="mt-3 text-base leading-relaxed text-texto-suave sm:text-lg">Mezcla tu propio color, míralo en una habitación y pregúntanos por él por WhatsApp.</p>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-12">
        <!-- Vista previa -->
        <section class="visualizador-color lg:col-span-7" aria-labelledby="titulo-previa">
          <h2 id="titulo-previa" class="sr-only">Vista previa en una habitación</h2>
          <div class="overflow-hidden rounded-3xl border border-borde bg-superficie">
            <div role="group" aria-label="Tipo de habitación" class="selector-habitacion grid grid-cols-4 gap-1 border-b border-borde p-2">
              ${config.habitaciones
                .map(
                  (hab) => `
                <button type="button" data-habitacion="${hab.id}" aria-pressed="false"
                        class="flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto aria-pressed:bg-primario-suave aria-pressed:text-primario-texto sm:flex-row sm:gap-2 sm:text-sm">
                  <i class="${hab.icono}" aria-hidden="true"></i> ${hab.nombre}
                </button>`
                )
                .join('')}
            </div>
            <svg class="habitacion-svg block w-full" viewBox="0 0 400 262" role="img" aria-labelledby="color-svg-desc" data-svg>
              <defs>
                <pattern id="vetas" width="40" height="8" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="4" x2="40" y2="4" stroke="#7c4a1e" stroke-width="1" />
                </pattern>
              </defs>
              <g data-escena></g>
            </svg>
            <p id="color-svg-desc" class="sr-only" data-descripcion-svg></p>
            <div class="color-swatch flex flex-wrap items-center justify-between gap-3 px-5 py-4" data-franja>
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider opacity-80">Tu color</p>
                <p class="text-xl font-extrabold" data-nombre></p>
              </div>
              <div class="flex items-center gap-2">
                <code class="rounded-lg bg-black/10 px-2.5 py-1 text-sm font-bold" data-hex-mostrado></code>
                <button type="button" data-copiar aria-label="Copiar código del color"
                        class="flex size-10 items-center justify-center rounded-lg bg-black/10 transition-colors hover:bg-black/20">
                  <i class="fa-regular fa-copy" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
          <dl class="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div class="rounded-xl border border-borde bg-superficie p-2"><dt class="text-texto-tenue">HEX</dt><dd class="font-bold tabular-nums text-texto" data-codigo="hex"></dd></div>
            <div class="rounded-xl border border-borde bg-superficie p-2"><dt class="text-texto-tenue">RGB</dt><dd class="font-bold tabular-nums text-texto" data-codigo="rgb"></dd></div>
            <div class="rounded-xl border border-borde bg-superficie p-2"><dt class="text-texto-tenue">HSL</dt><dd class="font-bold tabular-nums text-texto" data-codigo="hsl"></dd></div>
          </dl>
          <p class="mt-3 flex items-start gap-2 rounded-xl border border-destaque/50 bg-destaque/10 px-4 py-3 text-xs leading-relaxed text-texto sm:text-sm">
            <i class="fa-solid fa-circle-info mt-0.5 text-destaque-texto oscuro:text-destaque" aria-hidden="true"></i>
            <span>El color en pantalla es <strong>aproximado</strong>: cambia según el monitor, la luz y el acabado. Escríbenos y te confirmamos si podemos prepararlo o igualarlo.</span>
          </p>
          <p class="sr-only" aria-live="polite" data-anuncio></p>
        </section>

        <!-- Herramientas -->
        <div class="space-y-6 lg:col-span-5">
          <section class="rounded-3xl border border-borde bg-superficie p-5" aria-labelledby="titulo-mezcla">
            <h2 id="titulo-mezcla" class="font-extrabold text-texto">1. Mezcla tu tono</h2>
            <div class="mt-4 flex items-end gap-3">
              <label class="relative block size-14 shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-1 ring-borde" title="Abrir selector de color">
                <span class="sr-only">Selector de color</span>
                <input type="color" data-selector class="absolute -inset-2 size-[calc(100%+1rem)] cursor-pointer border-0 p-0" />
              </label>
              <div class="min-w-0 flex-1">
                <label for="color-hex" class="mb-1.5 block text-sm font-semibold text-texto">Código HEX</label>
                <input id="color-hex" data-hex inputmode="text" autocomplete="off" spellcheck="false" maxlength="7" placeholder="#9CAF88"
                       aria-describedby="color-hex-error" class="${claseControl} font-mono uppercase" />
              </div>
            </div>
            <p id="color-hex-error" class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error-hex role="alert">Usa el formato #RRGGBB (por ejemplo #3A7BD5).</p>
            <div class="mt-5 space-y-4">
              ${deslizador('h', 'Tono', 360)}
              ${deslizador('s', 'Saturación (intensidad)', 100)}
              ${deslizador('l', 'Luminosidad (claro u oscuro)', 100)}
            </div>
            <p class="mb-2 mt-5 text-sm font-semibold text-texto">Variaciones</p>
            <div class="grid grid-cols-7 gap-1.5" data-variaciones></div>
          </section>

          <section class="rounded-3xl border border-borde bg-superficie p-5" aria-labelledby="titulo-paleta">
            <h2 id="titulo-paleta" class="font-extrabold text-texto">¿No sabes por dónde empezar?</h2>
            <p class="mt-1 text-xs text-texto-tenue">Elige un color base y ajústalo a tu gusto. Son nombres de referencia, no de una marca.</p>
            <div class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6">
              ${config.paleta
                .map(
                  (c) => `
                <button type="button" data-usar="${c.hex}" title="${c.nombre}" aria-label="Usar ${c.nombre} (${c.hex})"
                        class="group flex flex-col items-center gap-1 rounded-xl p-1 text-[0.65rem] text-texto-suave transition-colors hover:bg-superficie-alt">
                  <span class="block aspect-square w-full rounded-lg ring-1 ring-black/10" style="background:${c.hex}"></span>
                  <span class="w-full truncate text-center">${c.nombre}</span>
                </button>`
                )
                .join('')}
            </div>
            <div class="mt-4 border-t border-borde pt-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-texto">Mis colores</p>
                <button type="button" data-guardar class="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-borde px-3 text-xs font-bold text-texto transition-colors hover:bg-superficie-alt">
                  <i class="fa-regular fa-bookmark" aria-hidden="true"></i> Guardar este color
                </button>
              </div>
              <ul class="mt-3 flex flex-wrap gap-2" data-guardados aria-label="Colores guardados"></ul>
            </div>
          </section>

          <form class="rounded-3xl border border-borde bg-superficie p-5" aria-labelledby="titulo-preguntar" data-form-color novalidate>
            <h2 id="titulo-preguntar" class="font-extrabold text-texto">2. Pregunta por tu color</h2>
            <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div>
                <label for="color-acabado" class="mb-1.5 block text-sm font-semibold text-texto">Acabado</label>
                <select id="color-acabado" name="acabado" class="${claseControl}">${config.acabados.map((a) => `<option>${a}</option>`).join('')}</select>
              </div>
              <fieldset>
                <legend class="mb-1.5 text-sm font-semibold text-texto">Uso</legend>
                <div class="flex gap-2">
                  ${config.usos
                    .map(
                      (u, i) => `
                    <label class="flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-borde px-3 text-sm text-texto has-checked:border-primario has-checked:bg-primario-suave">
                      <input type="radio" name="uso" value="${u}" ${i === 0 ? 'checked' : ''} class="size-4 accent-[var(--p-primario)]" /> ${u}
                    </label>`
                    )
                    .join('')}
                </div>
              </fieldset>
              <div>
                <label for="color-m2" class="mb-1.5 block text-sm font-semibold text-texto">Superficie aproximada (m²)</label>
                <input id="color-m2" name="m2" type="number" min="1" max="10000" step="1" inputmode="numeric" placeholder="Opcional" class="${claseControl}" />
              </div>
              <div class="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                <label for="color-comentario" class="mb-1.5 block text-sm font-semibold text-texto">Comentario</label>
                <textarea id="color-comentario" name="comentario" rows="2" maxlength="200" placeholder="Ej.: es para la recámara de los niños" class="${claseControl} resize-none"></textarea>
              </div>
            </div>
            <a data-whatsapp target="_blank" rel="noopener noreferrer"
               class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3.5 font-bold text-white transition-colors hover:bg-whatsapp-hover">
              <i class="fa-brands fa-whatsapp text-lg" aria-hidden="true"></i> Preguntar por este color
            </a>
            <p class="mt-2 text-center text-xs text-texto-tenue">Se abrirá WhatsApp con el código de tu color y estos datos.</p>
          </form>
        </div>
      </div>
    </div>`;

  pintarHabitacion();
  actualizar();
  pintarGuardados();
}

/* ================= Actualización ================= */

let temporizadorAnuncio;
let temporizadorUrl;

function pintarHabitacion() {
  $('[data-escena]', raiz).innerHTML = svgHabitacion(estado.habitacion);
  $$('[data-habitacion]', raiz).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.habitacion === estado.habitacion)));
  describir();
}

function describir() {
  const hab = config.habitaciones.find((x) => x.id === estado.habitacion)?.nombre ?? '';
  const texto = `${hab} con paredes color ${nombreDescriptivo(estado.h, estado.s, estado.l)} (${estado.hex}).`;
  $('[data-descripcion-svg]', raiz).textContent = texto;
  $('[data-svg-titulo]', raiz).textContent = texto;
}

/** Aplica el estado a todos los controles salvo `origen` (el que el usuario está moviendo). */
function actualizar(origen = null) {
  const { hex, h, s, l } = estado;
  const [r, g, b] = hexARgb(hex);
  const nombre = nombreDescriptivo(h, s, l);

  $('[data-svg]', raiz).style.setProperty('--tono', hex);
  const franja = $('[data-franja]', raiz);
  franja.style.background = hex;
  franja.style.color = textoSobre(hex);
  $('[data-nombre]', raiz).textContent = nombre;
  $('[data-hex-mostrado]', raiz).textContent = hex;
  $('[data-codigo="hex"]', raiz).textContent = hex;
  $('[data-codigo="rgb"]', raiz).textContent = `${r}, ${g}, ${b}`;
  $('[data-codigo="hsl"]', raiz).textContent = `${h}°, ${s}%, ${l}%`;

  if (origen !== 'selector') $('[data-selector]', raiz).value = hex.toLowerCase();
  if (origen !== 'hex') {
    $('[data-hex]', raiz).value = hex;
    $('[data-hex]', raiz).removeAttribute('aria-invalid');
    $('[data-error-hex]', raiz).classList.add('hidden');
  }

  // Deslizadores: valor, texto accesible y pista con el degradado del color actual.
  const pistas = {
    h: 'linear-gradient(90deg, hsl(0 85% 50%), hsl(60 85% 50%), hsl(120 85% 50%), hsl(180 85% 50%), hsl(240 85% 50%), hsl(300 85% 50%), hsl(360 85% 50%))',
    s: `linear-gradient(90deg, hsl(${h} 0% ${l}%), hsl(${h} 100% ${l}%))`,
    l: `linear-gradient(90deg, hsl(${h} ${s}% 0%), hsl(${h} ${s}% 50%), hsl(${h} ${s}% 100%))`,
  };
  const textos = { h: `${h}°`, s: `${s}%`, l: `${l}%` };
  ['h', 's', 'l'].forEach((k) => {
    const control = $(`[data-hsl="${k}"]`, raiz);
    if (origen !== k) control.value = estado[k];
    control.style.setProperty('--pista', pistas[k]);
    control.setAttribute('aria-valuetext', textos[k]);
    $(`[data-valor="${k}"]`, raiz).textContent = textos[k];
  });

  // Variaciones: de más claro a más oscuro, con el actual en el centro.
  $('[data-variaciones]', raiz).innerHTML = [30, 20, 10, 0, -10, -20, -30]
    .map((d) => {
      const lv = Math.min(97, Math.max(3, l + d));
      const v = rgbAHex(hslARgb(h, s, lv));
      const actual = d === 0;
      return `<button type="button" data-usar="${v}" aria-label="${actual ? 'Color actual' : d > 0 ? 'Más claro' : 'Más oscuro'}: ${v}" ${actual ? 'aria-current="true"' : ''}
                      class="aspect-square rounded-lg ring-1 ring-black/10 transition-transform hover:scale-110 ${actual ? 'ring-2 ring-texto ring-offset-2 ring-offset-superficie' : ''}" style="background:${v}"></button>`;
    })
    .join('');

  $$('[data-usar]', $('[data-guardados]', raiz)?.closest('section') ?? raiz).forEach((b) => {
    if (b.closest('[data-variaciones]')) return;
    b.setAttribute('aria-pressed', String(b.dataset.usar === hex));
  });

  describir();
  actualizarEnlace();

  clearTimeout(temporizadorAnuncio);
  temporizadorAnuncio = setTimeout(() => ($('[data-anuncio]', raiz).textContent = `Color: ${nombre}, ${hex}`), 600);

  // Mantiene la dirección compartible (#color/RRGGBB) sin crear entradas en el historial.
  clearTimeout(temporizadorUrl);
  temporizadorUrl = setTimeout(() => {
    if (location.hash.startsWith('#color')) history.replaceState(null, '', `#color/${hex.slice(1)}`);
  }, 300);
}

function mensajeWhatsApp() {
  const form = $('[data-form-color]', raiz);
  const [r, g, b] = hexARgb(estado.hex);
  const m2 = Number(form.m2.value);
  const comentario = form.comentario.value.trim();
  return [
    'Hola Ferretería Los Arcos, creé este tono en su sitio web y quisiera información:',
    '',
    `Color: ${nombreDescriptivo(estado.h, estado.s, estado.l)} (${estado.hex})`,
    `RGB: ${r}, ${g}, ${b}`,
    `Acabado: ${form.acabado.value}`,
    `Uso: ${form.uso.value}`,
    m2 >= 1 ? `Superficie aproximada: ${Math.round(m2)} m²` : null,
    comentario ? `Comentario: ${comentario}` : null,
    '',
    '¿Pueden preparar o igualar este tono? ¿Qué presentaciones y precios manejan?',
    `Ver el color: ${location.origin}${location.pathname}#color/${estado.hex.slice(1)}`,
  ]
    .filter((linea) => linea !== null)
    .join('\n');
}

const actualizarEnlace = () => ($('[data-whatsapp]', raiz).href = enlaceWhatsApp(mensajeWhatsApp()));

function establecerHex(hex, origen) {
  estado.hex = hex;
  const [h, s, l] = rgbAHsl(hexARgb(hex));
  Object.assign(estado, { h, s, l });
  actualizar(origen);
}

function establecerHsl(origen) {
  estado.hex = rgbAHex(hslARgb(estado.h, estado.s, estado.l));
  actualizar(origen);
}

/* ================= Mis colores ================= */

function leerGuardados() {
  try {
    const lista = JSON.parse(almacen.leer(CLAVE_GUARDADOS) ?? '[]');
    return Array.isArray(lista) ? lista.map(normalizarHex).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function pintarGuardados() {
  const lista = leerGuardados();
  $('[data-guardados]', raiz).innerHTML = lista.length
    ? lista
        .map(
          (hex) => `
        <li class="flex items-center gap-1 rounded-full border border-borde bg-superficie py-1 pl-1 pr-1.5">
          <button type="button" data-usar="${hex}" aria-label="Usar ${hex}" class="flex items-center gap-1.5 rounded-full pr-1 text-xs font-bold tabular-nums text-texto">
            <span class="size-7 rounded-full ring-1 ring-black/10" style="background:${hex}"></span>${hex}
          </button>
          <button type="button" data-quitar-guardado="${hex}" aria-label="Quitar ${hex} de mis colores" class="flex size-7 items-center justify-center rounded-full text-texto-tenue hover:bg-superficie-alt hover:text-acento-texto">
            <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
          </button>
        </li>`
        )
        .join('')
    : '<li class="text-xs text-texto-tenue">Aún no guardas colores. Se quedan solo en este navegador.</li>';
}

function guardarActual() {
  const lista = [estado.hex, ...leerGuardados().filter((h) => h !== estado.hex)].slice(0, config.maxGuardados);
  almacen.guardar(CLAVE_GUARDADOS, JSON.stringify(lista));
  pintarGuardados();
  $('[data-anuncio]', raiz).textContent = `${estado.hex} guardado en tus colores.`;
}

/* ================= Eventos ================= */

export function iniciarCreadorColor(contenedor) {
  renderCreadorColor(contenedor);

  contenedor.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('[data-selector]')) return establecerHex(normalizarHex(el.value), 'selector');
    if (el.dataset.hsl) {
      estado[el.dataset.hsl] = Number(el.value);
      return establecerHsl(el.dataset.hsl);
    }
    if (el.matches('[data-hex]')) {
      const hex = normalizarHex(el.value);
      const valido = !!hex && el.value.replace('#', '').length === 6;
      el.setAttribute('aria-invalid', String(!valido && el.value.length >= 6));
      $('[data-error-hex]', contenedor).classList.toggle('hidden', valido || el.value.length < 6);
      if (valido) establecerHex(hex, 'hex');
      return;
    }
    if (el.closest('[data-form-color]')) actualizarEnlace();
  });

  contenedor.addEventListener('change', (e) => {
    if (e.target.matches('[data-hex]')) {
      // Al salir del campo se aceptan también códigos cortos (#abc).
      const hex = normalizarHex(e.target.value);
      if (hex) establecerHex(hex, null);
      else {
        e.target.setAttribute('aria-invalid', 'true');
        $('[data-error-hex]', contenedor).classList.remove('hidden');
      }
    } else if (e.target.closest('[data-form-color]')) actualizarEnlace();
  });

  contenedor.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.habitacion) {
      estado.habitacion = b.dataset.habitacion;
      pintarHabitacion();
    } else if (b.dataset.usar) establecerHex(b.dataset.usar, null);
    else if (b.dataset.quitarGuardado) {
      almacen.guardar(CLAVE_GUARDADOS, JSON.stringify(leerGuardados().filter((h) => h !== b.dataset.quitarGuardado)));
      pintarGuardados();
      $('[data-guardar]', contenedor).focus();
    } else if (b.matches('[data-guardar]')) guardarActual();
    else if (b.matches('[data-copiar]')) {
      try {
        await navigator.clipboard.writeText(estado.hex);
        $('[data-anuncio]', contenedor).textContent = `${estado.hex} copiado.`;
        b.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
        setTimeout(() => (b.innerHTML = '<i class="fa-regular fa-copy" aria-hidden="true"></i>'), 1500);
      } catch {
        $('[data-anuncio]', contenedor).textContent = `No se pudo copiar. El código es ${estado.hex}.`;
      }
    }
  });
}

/** Aplica la dirección #color/RRGGBB (si trae un color válido). */
export function navegarColor([codigo] = []) {
  const hex = normalizarHex(codigo);
  if (hex && raiz && hex !== estado.hex) establecerHex(hex, null);
}
