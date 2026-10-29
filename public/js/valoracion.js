import { negocio, enlaceWhatsApp } from './data.js';
import { almacen, almacenSesion } from './almacen.js';

/*
 * Tarjeta flotante de valoración (esquina inferior izquierda).
 * La calificación se guarda solo en este navegador; para que llegue al negocio,
 * el agradecimiento ofrece enviarla por WhatsApp.
 */

const CLAVE_CALIFICACION = 'arcos-valoracion';
const CLAVE_CERRADA = 'arcos-valoracion-cerrada';

const { titulo, texto, etiquetas, agradecimiento, retrasoMs } = negocio.valoracion;
const TOTAL = etiquetas.length;

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

const plantillaFormulario = () => `
  <div class="flex items-start gap-3">
    <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destaque/15 text-destaque-texto ring-1 ring-destaque/40 oscuro:text-destaque">
      <i class="fa-solid fa-star" aria-hidden="true"></i>
    </span>
    <div class="min-w-0 flex-1 pr-6">
      <h2 id="valoracion-titulo" class="text-sm font-bold text-texto">${titulo}</h2>
      <p class="mt-0.5 text-xs leading-relaxed text-texto-suave">${texto}</p>
    </div>
  </div>

  <div class="mt-3 flex items-center justify-between gap-3">
    <div role="radiogroup" aria-label="Calificación de 1 a ${TOTAL} estrellas" class="flex gap-0.5" data-estrellas>
      ${etiquetas
        .map(
          (etiqueta, i) => `
          <button type="button" role="radio" aria-checked="false" data-valor="${i + 1}"
                  aria-label="${i + 1} ${i === 0 ? 'estrella' : 'estrellas'}: ${etiqueta}"
                  class="estrella flex size-9 items-center justify-center rounded-lg text-xl text-texto-tenue/40 transition hover:scale-110">
            <i class="fa-solid fa-star" aria-hidden="true"></i>
          </button>`
        )
        .join('')}
    </div>
    <span class="text-xs font-semibold text-texto-tenue" data-etiqueta aria-hidden="true"></span>
  </div>

  <p class="mt-1 hidden text-xs font-medium text-acento-texto" data-aviso role="alert">Elige de 1 a ${TOTAL} estrellas.</p>

  <button type="button" data-calificar
          class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primario px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover">
    Calificar ahora
  </button>`;

const plantillaGracias = (calificacion) => {
  const estrellas = '★'.repeat(calificacion) + '☆'.repeat(TOTAL - calificacion);
  const mensaje = `¡Hola, Los Arcos! Les dejo mi valoración: ${estrellas} (${calificacion}/${TOTAL}).`;
  return `
    <div class="flex items-start gap-3 pr-6" role="status">
      <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 oscuro:text-emerald-300">
        <i class="fa-solid fa-check" aria-hidden="true"></i>
      </span>
      <div>
        <h2 id="valoracion-titulo" class="text-sm font-bold text-texto">${agradecimiento}</h2>
        <p class="mt-0.5 text-xs text-texto-suave">
          Nos diste <span class="font-bold text-texto">${calificacion} de ${TOTAL}</span> estrellas. Tu opinión nos ayuda a seguir mejorando.
        </p>
        <a href="${enlaceWhatsApp(mensaje)}" target="_blank" rel="noopener noreferrer"
           class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primario-texto transition-colors hover:text-acento-texto">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Cuéntanos más por WhatsApp
        </a>
      </div>
    </div>`;
};

export function iniciarValoracion(contenedor) {
  if (almacen.leer(CLAVE_CALIFICACION) || almacenSesion.leer(CLAVE_CERRADA)) return;

  contenedor.innerHTML = `
    <aside id="valoracion" aria-labelledby="valoracion-titulo" hidden
           class="widget-entrada fixed bottom-24 left-4 right-[5.25rem] z-40 rounded-2xl border border-borde bg-superficie p-4 shadow-xl shadow-black/10 sm:right-auto sm:w-80 lg:bottom-6 lg:left-6">
      <button type="button" data-cerrar aria-label="Cerrar valoración"
              class="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-lg text-texto-tenue transition-colors hover:bg-superficie-alt hover:text-texto">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
      <div data-cuerpo>${plantillaFormulario()}</div>
    </aside>`;

  const tarjeta = $('#valoracion', contenedor);
  const cuerpo = $('[data-cuerpo]', tarjeta);
  const estrellas = $$('.estrella', tarjeta);
  const etiqueta = $('[data-etiqueta]', tarjeta);
  const aviso = $('[data-aviso]', tarjeta);
  let seleccion = 0;

  const pintar = (hasta) => {
    estrellas.forEach((boton, i) => {
      const activa = i < hasta;
      boton.classList.toggle('text-destaque', activa);
      boton.classList.toggle('text-texto-tenue/40', !activa);
    });
    etiqueta.textContent = hasta ? etiquetas[hasta - 1] : '';
  };

  const seleccionar = (valor, { enfocar = false } = {}) => {
    seleccion = valor;
    estrellas.forEach((boton, i) => {
      boton.setAttribute('aria-checked', String(i + 1 === valor));
      boton.tabIndex = i + 1 === valor || (!valor && i === 0) ? 0 : -1;
    });
    if (enfocar) estrellas[valor - 1].focus();
    aviso.classList.add('hidden');
    pintar(valor);
  };

  const cerrar = () => {
    tarjeta.hidden = true;
    almacenSesion.guardar(CLAVE_CERRADA, '1');
  };

  seleccionar(0);

  estrellas.forEach((boton) => {
    const valor = Number(boton.dataset.valor);
    boton.addEventListener('click', () => seleccionar(valor));
    boton.addEventListener('mouseenter', () => pintar(valor));
    boton.addEventListener('focus', () => pintar(seleccion || 0));
  });
  $('[data-estrellas]', tarjeta).addEventListener('mouseleave', () => pintar(seleccion));

  // Teclado del grupo de radio: flechas para moverse entre estrellas.
  $('[data-estrellas]', tarjeta).addEventListener('keydown', (e) => {
    const paso = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
    if (!paso) return;
    e.preventDefault();
    seleccionar(Math.min(TOTAL, Math.max(1, (seleccion || 0) + paso)), { enfocar: true });
  });

  $('[data-calificar]', tarjeta).addEventListener('click', () => {
    if (!seleccion) {
      aviso.classList.remove('hidden');
      estrellas[0].focus();
      return;
    }
    almacen.guardar(CLAVE_CALIFICACION, String(seleccion));
    cuerpo.innerHTML = plantillaGracias(seleccion);
    setTimeout(() => {
      if (!tarjeta.hidden && !tarjeta.matches(':hover, :focus-within')) tarjeta.hidden = true;
    }, 8000);
  });

  $('[data-cerrar]', tarjeta).addEventListener('click', cerrar);

  setTimeout(() => {
    tarjeta.hidden = false;
  }, retrasoMs);
}
