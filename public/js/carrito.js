import { negocio, enlaceWhatsApp } from './data.js';
import { almacen } from './almacen.js';
import { productoPorSku, subcategoriaDe, precioMXN } from './catalogo.js';
import { mostrarFormularioPago } from './pago.js';

/*
 * Carrito de compras. El pedido se cierra por WhatsApp (pago en tienda o contra entrega)
 * o con tarjeta mediante pago.js, que por ahora funciona en modo demostración.
 */

const CLAVE = 'arcos-carrito';
const $ = (selector, raiz = document) => raiz.querySelector(selector);

/** sku → cantidad */
const lineas = new Map();
const suscriptores = new Set();
let opener = null;

/** Método de pago elegido en el panel: 'whatsapp' | 'tarjeta'. */
const pagoConTarjeta = negocio.pago.habilitado && negocio.pago.metodos.includes('tarjeta');
let metodoPago = 'whatsapp';

function cargar() {
  try {
    const guardado = JSON.parse(almacen.leer(CLAVE) ?? '[]');
    guardado.forEach(([sku, cantidad]) => {
      const producto = productoPorSku(sku);
      if (producto && producto.stock > 0) lineas.set(sku, Math.min(cantidad, producto.stock));
    });
  } catch {
    /* Carrito guardado ilegible: se empieza vacío. */
  }
}

function guardarYAvisar() {
  almacen.guardar(CLAVE, JSON.stringify([...lineas]));
  suscriptores.forEach((fn) => fn(totalPiezas()));
  renderPanel();
}

export const totalPiezas = () => [...lineas.values()].reduce((a, b) => a + b, 0);
const totalImporte = () => Math.round([...lineas].reduce((suma, [sku, n]) => suma + productoPorSku(sku).precio * n, 0) * 100) / 100;
export const alCambiar = (fn) => (suscriptores.add(fn), fn(totalPiezas()));

export function agregar(sku) {
  const producto = productoPorSku(sku);
  if (!producto || producto.stock === 0) return false;
  const actual = lineas.get(sku) ?? 0;
  if (actual >= producto.stock) {
    mostrarAviso(`Solo hay ${producto.stock} en existencia de este producto.`, 'fa-solid fa-circle-info');
    return false;
  }
  lineas.set(sku, actual + 1);
  guardarYAvisar();
  mostrarAviso(`${producto.nombre} se agregó al carrito.`, 'fa-solid fa-cart-shopping', true);
  return true;
}

/** Resumen del pedido para el módulo de pago (sin exponer el estado interno del carrito). */
export const resumenCarrito = () => ({
  piezas: totalPiezas(),
  subtotal: totalImporte(),
  lineas: [...lineas].map(([sku, cantidad]) => {
    const p = productoPorSku(sku);
    return { sku, nombre: p.nombre, marca: p.marca, cantidad, precio: p.precio, importe: Math.round(p.precio * cantidad * 100) / 100 };
  }),
});

/** Vacía el carrito (se usa al aprobarse un pago con tarjeta). */
export function vaciarCarrito() {
  lineas.clear();
  metodoPago = 'whatsapp';
  guardarYAvisar();
}

function cambiar(sku, delta) {
  const producto = productoPorSku(sku);
  const nueva = (lineas.get(sku) ?? 0) + delta;
  if (nueva <= 0) lineas.delete(sku);
  else lineas.set(sku, Math.min(nueva, producto.stock));
  guardarYAvisar();
}

function mensajePedido() {
  const renglones = [...lineas].map(([sku, n]) => {
    const p = productoPorSku(sku);
    return `• ${n} × ${p.nombre} (SKU ${p.sku}) — ${precioMXN(p.precio * n)}`;
  });
  return [
    '¡Hola, Los Arcos! Quisiera hacer este pedido:',
    '',
    ...renglones,
    '',
    `Total aproximado: ${precioMXN(totalImporte())} (IVA incluido)`,
    'Forma de pago: en tienda o contra entrega.',
    '¿Me confirman disponibilidad y precio final? Gracias.',
  ].join('\n');
}

/* ---------- Aviso flotante ---------- */

let temporizadorAviso;
function mostrarAviso(texto, icono, conAccion = false) {
  const aviso = $('#aviso-carrito');
  aviso.innerHTML = `
    <i class="${icono} text-destaque" aria-hidden="true"></i>
    <span class="min-w-0 flex-1 truncate">${texto}</span>
    ${conAccion ? '<button type="button" data-abrir-carrito class="shrink-0 font-bold text-destaque underline-offset-2 hover:underline">Ver carrito</button>' : ''}`;
  aviso.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => (aviso.hidden = true), 3500);
}

/* ---------- Panel lateral ---------- */

function renderPanel() {
  const cuerpo = $('#carrito-cuerpo');
  if (!cuerpo) return;
  const n = totalPiezas();
  $('#carrito-titulo').textContent = n ? `Tu carrito (${n})` : 'Tu carrito';

  if (!n) {
    cuerpo.innerHTML = `
      <div class="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <span class="flex size-16 items-center justify-center rounded-full bg-superficie-alt text-2xl text-texto-tenue">
          <i class="fa-solid fa-cart-shopping" aria-hidden="true"></i>
        </span>
        <p class="font-bold text-texto">Tu carrito está vacío</p>
        <p class="text-sm text-texto-suave">Explora el catálogo y agrega lo que necesitas para tu proyecto.</p>
        <a href="#productos" data-cerrar-carrito
           class="rounded-xl bg-primario px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover">Ver catálogo</a>
      </div>`;
    return;
  }

  cuerpo.innerHTML = `
    <ul class="flex-1 divide-y divide-borde overflow-y-auto px-5">
      ${[...lineas]
        .map(([sku, cantidad]) => {
          const p = productoPorSku(sku);
          return `
          <li class="flex gap-3 py-4">
            ${
              p.imagen
                ? `<img src="${encodeURI(p.imagen)}" alt="" class="size-16 shrink-0 rounded-xl bg-white object-contain p-1.5 ring-1 ring-borde" />`
                : `<span class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-superficie-alt text-2xl text-primario-texto/70">
                     <i class="${subcategoriaDe(p)?.icono ?? 'fa-solid fa-box'}" aria-hidden="true"></i>
                   </span>`
            }
            <div class="min-w-0 flex-1">
              <p class="line-clamp-2 text-sm font-semibold text-texto">${p.nombre}</p>
              <p class="mt-0.5 text-xs text-texto-tenue">SKU ${p.sku} · ${precioMXN(p.precio)} c/u</p>
              <div class="mt-2 flex items-center justify-between gap-2">
                <div class="inline-flex items-center rounded-lg border border-borde">
                  <button type="button" data-cantidad="-1" data-sku="${sku}" aria-label="Quitar una pieza de ${p.nombre}"
                          class="flex size-8 items-center justify-center text-texto-suave transition-colors hover:text-texto">
                    <i class="fa-solid ${cantidad === 1 ? 'fa-trash-can' : 'fa-minus'} text-xs" aria-hidden="true"></i>
                  </button>
                  <span class="min-w-8 text-center text-sm font-bold tabular-nums text-texto" aria-label="Cantidad">${cantidad}</span>
                  <button type="button" data-cantidad="1" data-sku="${sku}" aria-label="Agregar una pieza de ${p.nombre}"
                          ${cantidad >= p.stock ? 'disabled' : ''}
                          class="flex size-8 items-center justify-center text-texto-suave transition-colors hover:text-texto disabled:opacity-30">
                    <i class="fa-solid fa-plus text-xs" aria-hidden="true"></i>
                  </button>
                </div>
                <span class="text-sm font-extrabold tabular-nums text-texto">${precioMXN(p.precio * cantidad)}</span>
              </div>
            </div>
          </li>`;
        })
        .join('')}
    </ul>
    <div class="space-y-3 border-t border-borde bg-superficie-alt/60 p-5">
      <div class="flex items-baseline justify-between">
        <span class="font-semibold text-texto">Total</span>
        <span class="text-xl font-extrabold tabular-nums text-texto">${precioMXN(totalImporte())}</span>
      </div>
      ${pagoConTarjeta ? selectorMetodoPago() : ''}
      ${
        metodoPago === 'tarjeta'
          ? `<p class="text-xs text-texto-tenue">Precios con IVA incluido. Elige la entrega y paga en el siguiente paso.</p>
             <button type="button" data-pagar-tarjeta
                     class="flex w-full items-center justify-center gap-2 rounded-xl bg-primario px-5 py-3.5 font-bold text-white transition-colors hover:bg-primario-hover">
               <i class="fa-solid fa-lock" aria-hidden="true"></i> Continuar al pago
             </button>`
          : `<p class="text-xs text-texto-tenue">Precios con IVA incluido. Pagas en tienda o contra entrega; la tienda confirma existencias y precio final por WhatsApp.</p>
             <a href="${enlaceWhatsApp(mensajePedido())}" target="_blank" rel="noopener noreferrer"
                class="flex w-full items-center justify-center gap-2 rounded-xl bg-whatsapp px-5 py-3.5 font-bold text-white transition-colors hover:bg-whatsapp-hover">
               <i class="fa-brands fa-whatsapp text-lg" aria-hidden="true"></i> Enviar pedido por WhatsApp
             </a>`
      }
      <button type="button" data-vaciar class="w-full py-1 text-xs font-semibold text-texto-tenue transition-colors hover:text-acento-texto">
        Vaciar carrito
      </button>
    </div>`;
}

/** Botones para alternar el método de pago (grupo de opciones accesible). */
function selectorMetodoPago() {
  const opcion = (id, icono, texto) => `
    <button type="button" data-metodo="${id}" aria-pressed="${metodoPago === id}"
            class="metodo-pago-boton flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              metodoPago === id ? 'metodo-pago-activo bg-superficie text-texto shadow-sm' : 'text-texto-suave hover:text-texto'
            }">
      <i class="${icono}" aria-hidden="true"></i> ${texto}
    </button>`;
  return `
    <div role="group" aria-label="Método de pago" class="flex gap-1 rounded-xl bg-superficie-alt p-1 ring-1 ring-borde">
      ${opcion('whatsapp', 'fa-brands fa-whatsapp', 'WhatsApp')}
      ${opcion('tarjeta', 'fa-solid fa-credit-card', 'Tarjeta')}
    </div>`;
}

export function abrirCarrito() {
  opener = document.activeElement;
  $('#carrito').hidden = false;
  document.body.classList.add('overflow-hidden');
  $('#carrito button[data-cerrar-carrito]').focus();
}

function cerrarCarrito({ devolverFoco = true } = {}) {
  if ($('#carrito').hidden) return;
  $('#carrito').hidden = true;
  document.body.classList.remove('overflow-hidden');
  if (devolverFoco) opener?.focus?.();
}

export function iniciarCarrito(contenedor) {
  cargar();

  contenedor.innerHTML = `
    <div id="carrito" hidden class="fixed inset-0 z-[70]">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" data-cerrar-carrito aria-hidden="true"></div>
      <section role="dialog" aria-modal="true" aria-labelledby="carrito-titulo"
               class="panel-lateral absolute inset-y-0 right-0 flex w-[min(26rem,100%)] flex-col bg-superficie shadow-2xl">
        <header class="flex items-center justify-between border-b border-borde px-5 py-4">
          <h2 id="carrito-titulo" class="text-lg font-extrabold text-texto">Tu carrito</h2>
          <button type="button" data-cerrar-carrito aria-label="Cerrar carrito"
                  class="flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto">
            <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
          </button>
        </header>
        <div id="carrito-cuerpo" class="flex min-h-0 flex-1 flex-col"></div>
      </section>
    </div>
    <div id="aviso-carrito" hidden role="status"
         class="aviso-entrada fixed bottom-24 left-1/2 z-[65] flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-3 rounded-xl bg-texto px-4 py-3 text-sm text-fondo shadow-2xl lg:bottom-8"></div>`;

  renderPanel();

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-abrir-carrito]')) return abrirCarrito();
    if (e.target.closest('[data-cerrar-carrito]')) return cerrarCarrito();
    const botonCantidad = e.target.closest('[data-cantidad]');
    if (botonCantidad) {
      const { sku, cantidad } = botonCantidad.dataset;
      cambiar(sku, Number(cantidad));
      // El panel se vuelve a dibujar: se devuelve el foco al mismo botón (o al de cerrar si la línea desapareció).
      ($(`#carrito button[data-sku="${sku}"][data-cantidad="${cantidad}"]:not(:disabled)`) ?? $('#carrito button[data-cerrar-carrito]')).focus();
      return;
    }
    const botonMetodo = e.target.closest('[data-metodo]');
    if (botonMetodo) {
      metodoPago = botonMetodo.dataset.metodo;
      renderPanel();
      $(`#carrito [data-metodo="${metodoPago}"]`).focus();
      return;
    }
    if (e.target.closest('[data-pagar-tarjeta]')) {
      cerrarCarrito({ devolverFoco: false });
      mostrarFormularioPago(resumenCarrito());
      return;
    }
    if (e.target.closest('[data-vaciar]')) {
      lineas.clear();
      guardarYAvisar();
    }
  });

  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrarCarrito());
}
