import { negocio, enlaceWhatsApp } from './data.js';
import { almacen } from './almacen.js';
import { precioMXN } from './catalogo.js';

/*
 * Pago con tarjeta (MODO DEMOSTRACIÓN).
 *
 * Análisis de integración con el carrito existente:
 * - carrito.js guarda sku → cantidad en localStorage ('arcos-carrito'), valida existencias al agregar o
 *   cambiar cantidades y calcula el total con los precios de catalogo.js (que ya incluyen IVA).
 * - El punto de integración es el pie del panel del carrito (renderPanel): ahí el visitante elige
 *   "WhatsApp" o "Tarjeta". Con "Tarjeta", carrito.js cierra su panel y llama a
 *   mostrarFormularioPago(resumenCarrito()). Este módulo no conoce el estado interno del carrito:
 *   solo recibe el resumen y avisa el resultado por los callbacks de iniciarPago().
 * - Al aprobarse el pago se llama onPagoExitoso(pedido) (main.js vacía el carrito);
 *   al cancelar, onPagoCancelado() (main.js reabre el carrito).
 *
 * Seguridad: no hay procesador real. Los datos de tarjeta nunca se guardan ni salen del navegador;
 * del pedido solo se conservan la marca y los últimos 4 dígitos. El CVV no se almacena en ningún caso.
 */

const CLAVE_HISTORIAL = 'arcos-pedidos';
const { pago: config } = negocio;

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];
const redondear = (valor) => Math.round(valor * 100) / 100;

/** 'oculto' | 'visible' | 'procesando' | 'exitoso' | 'error' */
let estado = 'oculto';
let resumen = null;
let callbacks = { exito: () => {}, cancelado: () => {} };
let opener = null;

export const estadoFormularioPago = () => estado;

/* ---------- Tarjeta: marca, formato y validación ---------- */

const MARCAS = [
  { id: 'amex', nombre: 'American Express', icono: 'fa-brands fa-cc-amex', patron: /^3[47]/, longitudes: [15], cvv: 4, grupos: [4, 6, 5] },
  { id: 'visa', nombre: 'Visa', icono: 'fa-brands fa-cc-visa', patron: /^4/, longitudes: [13, 16, 19], cvv: 3, grupos: [4, 4, 4, 4, 3] },
  { id: 'mastercard', nombre: 'Mastercard', icono: 'fa-brands fa-cc-mastercard', patron: /^(5[1-5]|2[2-7])/, longitudes: [16], cvv: 3, grupos: [4, 4, 4, 4] },
];
const MARCA_GENERICA = { id: 'tarjeta', nombre: 'Tarjeta', icono: 'fa-solid fa-credit-card', longitudes: [16], cvv: 3, grupos: [4, 4, 4, 4, 3] };

const soloDigitos = (texto) => texto.replace(/\D/g, '');
const detectarMarca = (digitos) => MARCAS.find((m) => m.patron.test(digitos)) ?? MARCA_GENERICA;
const longitudMaxima = (marca) => Math.max(...marca.longitudes);

/** Algoritmo de Luhn: detecta errores de captura en el número de tarjeta. */
function pasaLuhn(digitos) {
  let suma = 0;
  [...digitos].reverse().forEach((d, i) => {
    let n = Number(d);
    if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    suma += n;
  });
  return digitos.length > 0 && suma % 10 === 0;
}

function formatearNumero(digitos, marca) {
  const partes = [];
  let i = 0;
  for (const tam of marca.grupos) {
    if (i >= digitos.length) break;
    partes.push(digitos.slice(i, i + tam));
    i += tam;
  }
  return partes.join(' ');
}

const formatearVencimiento = (digitos) => (digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}` : digitos);

/** Reglas por campo: devuelven el mensaje de error o '' si el valor es válido. */
const VALIDADORES = {
  titular: (v) => (v.trim().length < 3 ? 'Escribe el nombre como aparece en la tarjeta.' : /\d/.test(v) ? 'El nombre no debe llevar números.' : ''),
  numero: (v) => {
    const d = soloDigitos(v);
    const marca = detectarMarca(d);
    if (!d) return 'Escribe el número de la tarjeta.';
    if (!marca.longitudes.includes(d.length)) return `El número de ${marca.nombre} debe tener ${marca.longitudes.join(' o ')} dígitos.`;
    if (!pasaLuhn(d)) return 'El número no es válido. Revisa que lo hayas escrito bien.';
    return '';
  },
  vencimiento: (v) => {
    const d = soloDigitos(v);
    if (d.length !== 4) return 'Usa el formato MM/AA.';
    const mes = Number(d.slice(0, 2));
    const anio = 2000 + Number(d.slice(2));
    if (mes < 1 || mes > 12) return 'El mes debe estar entre 01 y 12.';
    const hoy = new Date();
    const finDeMes = new Date(anio, mes, 0, 23, 59, 59);
    if (finDeMes < hoy) return 'La tarjeta está vencida.';
    if (anio > hoy.getFullYear() + 20) return 'Revisa el año de vencimiento.';
    return '';
  },
  cvv: (v, form) => {
    const esperado = detectarMarca(soloDigitos(form.numero.value)).cvv;
    return soloDigitos(v).length !== esperado ? `El código de seguridad tiene ${esperado} dígitos.` : '';
  },
  direccion: (v, form) =>
    form.entrega.value === 'domicilio' && v.trim().length < 10 ? 'Escribe calle, número y colonia para el envío.' : '',
};

/* ---------- Envío y totales ---------- */

const zonasEnvio = () => [...config.envio.zonas, { nombre: 'Otra zona', costo: config.envio.costo }];

function calcularEnvio(subtotal, entrega, indiceZona) {
  if (entrega !== 'domicilio') return { costo: 0, nota: 'Sin costo' };
  if (subtotal >= config.envio.gratisMinimo) return { costo: 0, nota: `Gratis en compras desde ${precioMXN(config.envio.gratisMinimo)}` };
  const zona = zonasEnvio()[indiceZona] ?? zonasEnvio()[0];
  return { costo: zona.costo, nota: zona.costo ? zona.nombre : `Gratis en ${zona.nombre}` };
}

function totales(form) {
  const envio = calcularEnvio(resumen.subtotal, form.entrega.value, Number(form.zona.value));
  const total = redondear(resumen.subtotal + envio.costo);
  const iva = redondear(total - total / (1 + config.configuracion.impuesto));
  return { envio, total, iva };
}

/* ---------- Historial de pedidos (solo datos no sensibles) ---------- */

function guardarPedido(pedido) {
  try {
    const historial = JSON.parse(almacen.leer(CLAVE_HISTORIAL) ?? '[]');
    historial.unshift(pedido);
    almacen.guardar(CLAVE_HISTORIAL, JSON.stringify(historial.slice(0, 50)));
  } catch {
    /* Historial ilegible: se descarta sin interrumpir la compra. */
  }
}

export function obtenerHistorial() {
  try {
    return JSON.parse(almacen.leer(CLAVE_HISTORIAL) ?? '[]');
  } catch {
    return [];
  }
}

const aleatorio = () => (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, '');

function generarReferencia(fecha) {
  const ymd = fecha.toISOString().slice(0, 10).replace(/-/g, '');
  return `LA-${ymd}-${aleatorio().slice(0, 5).toUpperCase()}`;
}

/* ---------- Plantillas ---------- */

const claseCampo =
  'w-full rounded-xl border border-borde bg-superficie px-3.5 py-3 text-base text-texto placeholder:text-texto-tenue transition-colors aria-invalid:border-acento aria-invalid:ring-1 aria-invalid:ring-acento';

const campo = ({ id, etiqueta, ayuda = '', atributos }) => `
  <div>
    <label for="pago-${id}" class="mb-1.5 block text-sm font-semibold text-texto">${etiqueta}</label>
    <input id="pago-${id}" name="${id}" ${atributos} aria-describedby="pago-${id}-error${ayuda ? ` pago-${id}-ayuda` : ''}" class="${claseCampo}" />
    ${ayuda ? `<p id="pago-${id}-ayuda" class="mt-1 text-xs text-texto-tenue">${ayuda}</p>` : ''}
    <p id="pago-${id}-error" class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="${id}"></p>
  </div>`;

function plantillaFormulario() {
  const { envio } = config;
  const anioPrueba = String((new Date().getFullYear() + 2) % 100).padStart(2, '0');

  return `
    <form id="formulario-pago" class="formulario-pago grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_18rem]" novalidate>
      <div class="min-w-0 space-y-6">
        <div class="rounded-2xl border border-destaque/60 bg-destaque/10 p-4 text-sm text-texto" role="note">
          <p class="flex items-center gap-2 font-bold">
            <i class="fa-solid fa-flask text-destaque-texto oscuro:text-destaque" aria-hidden="true"></i> Modo demostración
          </p>
          <p class="mt-1 text-texto-suave">
            No se realiza ningún cargo y el pedido no se envía a la tienda. <strong class="text-texto">No uses una tarjeta real.</strong>
          </p>
          <button type="button" data-tarjeta-prueba data-vencimiento="12${anioPrueba}"
                  class="mt-3 inline-flex items-center gap-2 rounded-lg border border-destaque/60 bg-superficie px-3 py-2 text-xs font-bold text-texto transition-colors hover:bg-destaque/20">
            <i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Usar tarjeta de prueba
          </button>
          <p class="mt-2 text-xs text-texto-tenue">Aprobada: 4242 4242 4242 4242 · Rechazada: 4000 0000 0000 0002</p>
        </div>

        <fieldset class="min-w-0 space-y-3" data-bloqueable>
          <legend class="mb-3 text-base font-extrabold text-texto">1. Entrega</legend>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="opcion-entrega flex cursor-pointer gap-3 rounded-2xl border border-borde p-4 transition-colors has-checked:border-primario has-checked:bg-primario-suave">
              <input type="radio" name="entrega" value="tienda" checked class="mt-1 size-4 accent-[var(--p-primario)]" />
              <span>
                <span class="block font-bold text-texto">Recoger en tienda</span>
                <span class="block text-xs text-texto-suave">${negocio.contacto.direccion.calle}, ${negocio.contacto.direccion.localidad} · Sin costo</span>
              </span>
            </label>
            ${
              envio.disponible
                ? `<label class="opcion-entrega flex cursor-pointer gap-3 rounded-2xl border border-borde p-4 transition-colors has-checked:border-primario has-checked:bg-primario-suave">
                     <input type="radio" name="entrega" value="domicilio" class="mt-1 size-4 accent-[var(--p-primario)]" />
                     <span>
                       <span class="block font-bold text-texto">Envío a domicilio</span>
                       <span class="block text-xs text-texto-suave">Gratis desde ${precioMXN(envio.gratisMinimo)}</span>
                     </span>
                   </label>`
                : ''
            }
          </div>

          <div data-datos-envio hidden class="space-y-3">
            <div>
              <label for="pago-zona" class="mb-1.5 block text-sm font-semibold text-texto">Zona de envío</label>
              <select id="pago-zona" name="zona" class="${claseCampo}">
                ${zonasEnvio()
                  .map((z, i) => `<option value="${i}">${z.nombre} — ${z.costo ? precioMXN(z.costo) : 'sin costo'}</option>`)
                  .join('')}
              </select>
            </div>
            <div>
              <label for="pago-direccion" class="mb-1.5 block text-sm font-semibold text-texto">Dirección de envío</label>
              <textarea id="pago-direccion" name="direccion" rows="2" autocomplete="street-address"
                        placeholder="Calle, número, colonia y referencias" aria-describedby="pago-direccion-error"
                        class="${claseCampo} resize-none"></textarea>
              <p id="pago-direccion-error" class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="direccion"></p>
            </div>
          </div>
        </fieldset>

        <fieldset class="min-w-0 space-y-4" data-bloqueable>
          <legend class="mb-3 text-base font-extrabold text-texto">2. Datos de la tarjeta</legend>
          ${campo({ id: 'numero', etiqueta: 'Número de tarjeta', atributos: 'inputmode="numeric" autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="23"' })}
          ${campo({ id: 'titular', etiqueta: 'Nombre del titular', atributos: 'autocomplete="cc-name" placeholder="Como aparece en la tarjeta" maxlength="60"' })}
          <div class="grid grid-cols-2 gap-3">
            ${campo({ id: 'vencimiento', etiqueta: 'Vencimiento', atributos: 'inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5"' })}
            ${campo({ id: 'cvv', etiqueta: 'CVV', ayuda: '3 dígitos al reverso (4 al frente en Amex).', atributos: 'inputmode="numeric" autocomplete="cc-csc" placeholder="•••" maxlength="4"' })}
          </div>
        </fieldset>
      </div>

      <aside class="min-w-0 space-y-4 md:sticky md:top-0 md:self-start" aria-label="Resumen del pago">
        <div class="tarjeta-preview" aria-hidden="true">
          <div class="flex items-start justify-between">
            <i class="fa-solid fa-sim-card text-2xl opacity-80"></i>
            <i class="${MARCA_GENERICA.icono} text-3xl" data-preview-marca></i>
          </div>
          <p class="mt-auto whitespace-nowrap font-mono text-base tracking-[0.06em] tabular-nums sm:text-lg" data-preview-numero>•••• •••• •••• ••••</p>
          <div class="mt-3 flex items-end justify-between gap-3 text-xs uppercase">
            <span class="min-w-0">
              <span class="block text-[0.6rem] opacity-70">Titular</span>
              <span class="block truncate font-semibold" data-preview-titular>Nombre Apellido</span>
            </span>
            <span class="shrink-0 text-right">
              <span class="block text-[0.6rem] opacity-70">Vence</span>
              <span class="block font-semibold tabular-nums" data-preview-vencimiento>MM/AA</span>
            </span>
          </div>
        </div>

        <div class="rounded-2xl border border-borde bg-superficie-alt/60 p-4 text-sm">
          <p class="font-bold text-texto">Resumen (${resumen.piezas} ${resumen.piezas === 1 ? 'pieza' : 'piezas'})</p>
          <ul class="mt-2 max-h-32 space-y-1 overflow-y-auto pr-1 text-xs text-texto-suave">
            ${resumen.lineas.map((l) => `<li class="flex justify-between gap-2"><span class="min-w-0 truncate">${l.cantidad} × ${l.nombre}</span><span class="shrink-0 tabular-nums">${precioMXN(l.importe)}</span></li>`).join('')}
          </ul>
          <dl class="mt-3 space-y-1.5 border-t border-borde pt-3">
            <div class="flex justify-between"><dt class="text-texto-suave">Subtotal</dt><dd class="tabular-nums text-texto">${precioMXN(resumen.subtotal)}</dd></div>
            <div class="flex justify-between gap-2"><dt class="text-texto-suave">Envío <span class="block text-[0.7rem] text-texto-tenue" data-nota-envio></span></dt><dd class="tabular-nums text-texto" data-costo-envio></dd></div>
            <div class="flex items-baseline justify-between border-t border-borde pt-2"><dt class="font-bold text-texto">Total</dt><dd class="text-xl font-extrabold tabular-nums text-texto" data-total></dd></div>
            <div class="flex justify-between text-xs text-texto-tenue"><dt>IVA incluido (${config.configuracion.impuesto * 100}%)</dt><dd class="tabular-nums" data-iva></dd></div>
          </dl>
        </div>

        <div id="pago-alerta" hidden role="alert" tabindex="-1"
             class="rounded-xl border border-acento/40 bg-acento/10 p-3 text-sm text-texto focus:outline-none"></div>

        <button type="submit" data-pagar
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-primario px-5 py-4 text-base font-bold text-white transition-colors hover:bg-primario-hover disabled:cursor-wait disabled:opacity-80">
          <i class="fa-solid fa-lock" aria-hidden="true"></i> <span data-texto-pagar>Pagar</span>
        </button>
        <p class="flex items-center justify-center gap-1.5 text-center text-xs text-texto-tenue">
          <i class="fa-solid fa-shield-halved" aria-hidden="true"></i> Los datos de tu tarjeta no se guardan.
        </p>
        <p id="pago-estado" class="sr-only" aria-live="polite"></p>
      </aside>
    </form>`;
}

function mensajeComprobante(pedido) {
  const entrega =
    pedido.entrega.metodo === 'domicilio'
      ? `Envío a domicilio (${pedido.entrega.zona}): ${pedido.entrega.direccion}`
      : `Recoger en tienda (${negocio.contacto.direccion.calle})`;
  return [
    `¡Hola, Los Arcos! Hice un pedido en el sitio. Referencia: ${pedido.referencia}`,
    '',
    ...pedido.lineas.map((l) => `• ${l.cantidad} × ${l.nombre} (SKU ${l.sku}) — ${precioMXN(l.importe)}`),
    '',
    `Envío: ${pedido.envio ? precioMXN(pedido.envio) : 'sin costo'}`,
    `Total: ${precioMXN(pedido.total)} (IVA incluido)`,
    `Entrega: ${entrega}`,
    '',
    'Nota: el pago en línea del sitio está en modo demostración (no se realizó ningún cargo).',
    '¿Me confirman existencias y la forma de pago? Gracias.',
  ].join('\n');
}

function plantillaExito(pedido) {
  const enTienda = pedido.entrega.metodo === 'tienda';
  return `
    <div class="mx-auto max-w-md p-6 text-center sm:p-8">
      <span class="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-700 ring-1 ring-emerald-500/30 oscuro:text-emerald-300">
        <i class="fa-solid fa-check" aria-hidden="true"></i>
      </span>
      <h3 id="pago-resultado" tabindex="-1" class="mt-4 text-2xl font-extrabold text-texto focus:outline-none">¡Pago aprobado!</h3>
      <p class="mt-1 inline-flex items-center gap-1.5 rounded-full bg-destaque/20 px-3 py-1 text-xs font-bold text-texto ring-1 ring-destaque/60">
        <i class="fa-solid fa-flask" aria-hidden="true"></i> Simulación: no se realizó ningún cargo
      </p>

      <dl class="mt-6 space-y-2 rounded-2xl border border-borde bg-superficie-alt/60 p-4 text-left text-sm">
        <div class="flex justify-between gap-3"><dt class="text-texto-suave">Referencia</dt><dd class="font-mono font-bold text-texto">${pedido.referencia}</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-texto-suave">Tarjeta</dt><dd class="text-texto">${pedido.tarjeta.marca} •••• ${pedido.tarjeta.ultimos4}</dd></div>
        <div class="flex justify-between gap-3"><dt class="text-texto-suave">Entrega</dt><dd class="text-right text-texto">${enTienda ? 'Recoger en tienda' : `Envío · ${pedido.entrega.zona}`}</dd></div>
        <div class="flex justify-between gap-3 border-t border-borde pt-2"><dt class="font-bold text-texto">Total</dt><dd class="font-extrabold tabular-nums text-texto">${precioMXN(pedido.total)}</dd></div>
      </dl>

      <p class="mt-4 text-sm text-texto-suave">
        Como es una demostración, la tienda <strong class="text-texto">no recibió este pedido</strong>.
        Si quieres que lo preparen, envíales el resumen por WhatsApp.
      </p>

      <div class="mt-6 flex flex-col gap-3">
        <a href="${enlaceWhatsApp(mensajeComprobante(pedido))}" target="_blank" rel="noopener noreferrer"
           class="flex items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3.5 font-bold text-white transition-colors hover:bg-whatsapp-hover">
          <i class="fa-brands fa-whatsapp text-lg" aria-hidden="true"></i> Enviar resumen por WhatsApp
        </a>
        <button type="button" data-cerrar-pago class="rounded-xl border border-borde px-5 py-3 font-bold text-texto transition-colors hover:bg-superficie-alt">
          Seguir comprando
        </button>
      </div>
    </div>`;
}

/* ---------- Comportamiento del formulario ---------- */

function mostrarError(form, nombre, mensaje) {
  const control = form.elements[nombre];
  const error = $(`[data-error="${nombre}"]`, form);
  if (!control || !error) return;
  control.setAttribute('aria-invalid', String(!!mensaje));
  error.textContent = mensaje;
  error.classList.toggle('hidden', !mensaje);
}

const validarCampo = (form, nombre) => {
  const mensaje = VALIDADORES[nombre](form.elements[nombre].value, form.elements);
  mostrarError(form, nombre, mensaje);
  return !mensaje;
};

function actualizarVista(form) {
  const digitos = soloDigitos(form.numero.value);
  const marca = detectarMarca(digitos);
  // Rellena hasta la longitud válida más cercana (Visa admite 13, 16 o 19 dígitos).
  const objetivo = marca.longitudes.find((l) => l >= digitos.length) ?? longitudMaxima(marca);
  const relleno = '•'.repeat(Math.max(0, objetivo - digitos.length));
  $('[data-preview-numero]').textContent = formatearNumero(digitos + relleno, marca);
  $('[data-preview-marca]').className = `${marca.icono} text-3xl`;
  $('[data-preview-titular]').textContent = form.titular.value.trim() || 'Nombre Apellido';
  $('[data-preview-vencimiento]').textContent = form.vencimiento.value || 'MM/AA';
  form.cvv.placeholder = '•'.repeat(marca.cvv);

  const domicilio = form.entrega.value === 'domicilio';
  $('[data-datos-envio]', form).hidden = !domicilio;
  if (!domicilio) mostrarError(form, 'direccion', '');

  const { envio, total, iva } = totales(form);
  $('[data-costo-envio]').textContent = envio.costo ? precioMXN(envio.costo) : 'Gratis';
  $('[data-nota-envio]').textContent = envio.nota;
  $('[data-total]').textContent = precioMXN(total);
  $('[data-iva]').textContent = precioMXN(iva);
  $('[data-texto-pagar]').textContent = `Pagar ${precioMXN(total)}`;
}

function bloquear(form, procesando) {
  // Al deshabilitar el botón se perdería el foco: se lleva al título y se anuncia el estado.
  if (procesando) $('#pago-titulo').focus();
  $('#pago-estado').textContent = procesando ? 'Procesando pago, espera un momento.' : '';
  $$('[data-bloqueable]', form).forEach((fs) => (fs.disabled = procesando));
  const boton = $('[data-pagar]', form);
  boton.disabled = procesando;
  boton.setAttribute('aria-busy', String(procesando));
  boton.innerHTML = procesando
    ? '<span class="spinner-pago" aria-hidden="true"></span> Procesando pago…'
    : `<i class="fa-solid fa-lock" aria-hidden="true"></i> <span data-texto-pagar>Pagar ${precioMXN(totales(form).total)}</span>`;
}

function mostrarAlerta(html) {
  const alerta = $('#pago-alerta');
  alerta.innerHTML = html;
  alerta.hidden = !html;
  if (html) alerta.focus();
}

/** Simula la respuesta del procesador: rechaza solo la tarjeta de prueba de rechazo. */
const simularCobro = (digitos) =>
  new Promise((resolver) =>
    setTimeout(() => resolver({ aprobado: digitos !== config.simulacion.tarjetaRechazada }), config.simulacion.demoraMs)
  );

async function procesar(form) {
  mostrarAlerta('');
  const campos = ['numero', 'titular', 'vencimiento', 'cvv', 'direccion'];
  const invalidos = campos.filter((nombre) => !validarCampo(form, nombre));
  if (invalidos.length) {
    form.elements[invalidos[0]].focus();
    return;
  }

  const digitos = soloDigitos(form.numero.value);
  const marca = detectarMarca(digitos);
  const { envio, total } = totales(form);

  estado = 'procesando';
  bloquear(form, true);

  let respuesta;
  try {
    respuesta = await simularCobro(digitos);
  } catch {
    respuesta = { aprobado: false };
  }

  if (estado !== 'procesando') return; // la ventana se cerró a mitad del proceso

  if (!respuesta.aprobado) {
    estado = 'error';
    bloquear(form, false);
    form.cvv.value = '';
    mostrarAlerta(`
      <p class="flex items-center gap-2 font-bold text-acento-texto"><i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Tarjeta rechazada</p>
      <p class="mt-1 text-texto-suave">El banco emisor rechazó el cargo (simulación). Prueba con otra tarjeta o envía tu pedido por WhatsApp.</p>
      <button type="button" data-volver-whatsapp class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primario-texto hover:underline">
        <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Volver al carrito y pedir por WhatsApp
      </button>`);
    return;
  }

  const fecha = new Date();
  const zona = zonasEnvio()[Number(form.zona.value)];
  const pedido = {
    referencia: generarReferencia(fecha),
    transaccion: `demo_${aleatorio().slice(0, 14)}`,
    procesador: config.procesador,
    fecha: fecha.toISOString(),
    lineas: resumen.lineas,
    subtotal: resumen.subtotal,
    envio: envio.costo,
    total,
    entrega: {
      metodo: form.entrega.value,
      zona: form.entrega.value === 'domicilio' ? zona.nombre : null,
      direccion: form.entrega.value === 'domicilio' ? form.direccion.value.trim() : null,
    },
    tarjeta: { marca: marca.nombre, ultimos4: digitos.slice(-4) },
  };

  guardarPedido(pedido);
  estado = 'exitoso';
  $('#pago-cuerpo').innerHTML = plantillaExito(pedido);
  $('#pago-resultado').focus();
  callbacks.exito(pedido);
}

function conectarFormulario(form) {
  const tocados = new Set();

  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.name === 'numero') {
      const digitos = soloDigitos(el.value).slice(0, longitudMaxima(detectarMarca(soloDigitos(el.value))));
      el.value = formatearNumero(digitos, detectarMarca(digitos));
    } else if (el.name === 'vencimiento') {
      // Permite borrar la diagonal sin que se vuelva a insertar al instante.
      if (!(e.inputType === 'deleteContentBackward' && el.value.length === 2)) el.value = formatearVencimiento(soloDigitos(el.value).slice(0, 4));
    } else if (el.name === 'cvv') {
      el.value = soloDigitos(el.value).slice(0, 4);
    }
    if (tocados.has(el.name) && VALIDADORES[el.name]) validarCampo(form, el.name);
    if (el.name === 'numero' && tocados.has('cvv')) validarCampo(form, 'cvv');
    actualizarVista(form);
  });

  form.addEventListener('change', () => actualizarVista(form));

  form.addEventListener('focusout', (e) => {
    const nombre = e.target.name;
    if (!VALIDADORES[nombre] || !e.target.value) return;
    tocados.add(nombre);
    validarCampo(form, nombre);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (estado !== 'procesando') procesar(form);
  });

  form.addEventListener('click', (e) => {
    const prueba = e.target.closest('[data-tarjeta-prueba]');
    if (prueba) {
      form.numero.value = formatearNumero(config.simulacion.tarjetaAprobada, detectarMarca(config.simulacion.tarjetaAprobada));
      form.titular.value = 'Cliente Demo';
      form.vencimiento.value = formatearVencimiento(prueba.dataset.vencimiento);
      form.cvv.value = '123';
      ['numero', 'titular', 'vencimiento', 'cvv'].forEach((n) => mostrarError(form, n, ''));
      actualizarVista(form);
      form.numero.focus();
    }
    if (e.target.closest('[data-volver-whatsapp]')) ocultarFormularioPago();
  });

  actualizarVista(form);
}

/* ---------- Ventana ---------- */

export function mostrarFormularioPago(datosCarrito) {
  if (!config.habilitado || !datosCarrito?.piezas) return;
  resumen = datosCarrito;
  opener = document.activeElement;
  estado = 'visible';

  $('#pago-cuerpo').innerHTML = plantillaFormulario();
  conectarFormulario($('#formulario-pago'));
  $('#pago').hidden = false;
  document.body.classList.add('overflow-hidden');
  $('#pago [data-cerrar-pago]:not([aria-hidden])').focus();
}

export function ocultarFormularioPago() {
  if (estado === 'oculto' || estado === 'procesando') return;
  const eraExitoso = estado === 'exitoso';
  estado = 'oculto';
  $('#pago').hidden = true;
  $('#pago-cuerpo').innerHTML = ''; // descarta cualquier dato de tarjeta capturado
  document.body.classList.remove('overflow-hidden');
  if (eraExitoso) opener?.focus?.();
  else callbacks.cancelado();
}

/** Mantiene el foco dentro de la ventana mientras está abierta (diálogo modal). */
function atraparFoco(e) {
  if (e.key !== 'Tab' || estado === 'oculto') return;
  const enfocables = $$('#pago button:not(:disabled), #pago a[href], #pago input:not(:disabled), #pago select:not(:disabled), #pago textarea:not(:disabled), #pago [tabindex="0"]').filter(
    (el) => el.offsetParent !== null
  );
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

export function iniciarPago(contenedor, onPagoExitoso = () => {}, onPagoCancelado = () => {}) {
  callbacks = { exito: onPagoExitoso, cancelado: onPagoCancelado };
  if (!config.habilitado || !config.metodos.includes('tarjeta')) return;

  contenedor.innerHTML = `
    <div id="pago" hidden class="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-[2px]" data-cerrar-pago aria-hidden="true"></div>
      <section role="dialog" aria-modal="true" aria-labelledby="pago-titulo"
               class="ventana-pago relative flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-superficie shadow-2xl sm:max-h-[92dvh] sm:max-w-3xl sm:rounded-3xl">
        <header class="flex items-center justify-between gap-3 border-b border-borde px-5 py-4 sm:px-6">
          <h2 id="pago-titulo" tabindex="-1" class="flex items-center gap-2.5 text-lg font-extrabold text-texto focus:outline-none">
            <i class="fa-solid fa-credit-card text-primario-texto" aria-hidden="true"></i> Pago con tarjeta
            <span class="rounded-md bg-destaque/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-texto ring-1 ring-destaque/60">Demo</span>
          </h2>
          <button type="button" data-cerrar-pago aria-label="Cerrar pago"
                  class="flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto">
            <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
          </button>
        </header>
        <div id="pago-cuerpo" class="min-h-0 flex-1 overflow-y-auto"></div>
      </section>
    </div>`;

  contenedor.addEventListener('click', (e) => e.target.closest('[data-cerrar-pago]') && ocultarFormularioPago());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && estado !== 'oculto') ocultarFormularioPago();
    atraparFoco(e);
  });
}
