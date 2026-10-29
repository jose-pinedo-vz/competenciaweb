import { enlaceWhatsApp } from './data.js';
import {
  catalogoDemostracion,
  departamentos,
  departamentoPorId,
  productos,
  productosDe,
  subcategoriaDe,
  descuento,
  precioMXN,
} from './catalogo.js';
import { agregar } from './carrito.js';

/*
 * Catálogo: vista de productos con filtros (marca, precio, disponibilidad, ofertas),
 * búsqueda, orden y paginación, más el mega-menú de departamentos del encabezado.
 *
 * Departamento y subcategoría forman parte de la URL (#productos/herramientas/electricas)
 * para que se puedan compartir; el resto de filtros vive en memoria.
 */

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];
const enlaceExterno = 'target="_blank" rel="noopener noreferrer"';

const POR_PAGINA = 12;
const RANGOS_PRECIO = [
  { etiqueta: 'Hasta $200', min: null, max: 200 },
  { etiqueta: '$200 – $1,000', min: 200, max: 1000 },
  { etiqueta: '$1,000 – $3,000', min: 1000, max: 3000 },
  { etiqueta: 'Más de $3,000', min: 3000, max: null },
];
const ORDENES = [
  { id: 'relevancia', etiqueta: 'Relevancia' },
  { id: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { id: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { id: 'descuento', etiqueta: 'Mayor descuento' },
  { id: 'nombre', etiqueta: 'Nombre (A–Z)' },
];

const filtros = {
  dep: null,
  sub: null,
  marcas: new Set(),
  min: null,
  max: null,
  soloDisponibles: false,
  soloOfertas: false,
  busqueda: '',
  orden: 'relevancia',
  visibles: POR_PAGINA,
};

const rutaCatalogo = (dep, sub) => ['#productos', dep, sub].filter(Boolean).join('/');
const normalizar = (texto) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const debounce = (fn, ms) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

/* ---------- Filtrado ---------- */

function cumple(p, { ignorarMarcas = false } = {}) {
  if (!ignorarMarcas && filtros.marcas.size && !filtros.marcas.has(p.marca)) return false;
  if (filtros.min != null && p.precio < filtros.min) return false;
  if (filtros.max != null && p.precio > filtros.max) return false;
  if (filtros.soloDisponibles && p.stock === 0) return false;
  if (filtros.soloOfertas && !p.antes) return false;
  if (filtros.busqueda) {
    const texto = normalizar(`${p.nombre} ${p.marca} ${p.sku}`);
    if (!normalizar(filtros.busqueda).split(/\s+/).every((palabra) => texto.includes(palabra))) return false;
  }
  return true;
}

const comparadores = {
  relevancia: (a, b) => (b.stock > 0) - (a.stock > 0) || !!b.nuevo - !!a.nuevo || descuento(b) - descuento(a),
  'precio-asc': (a, b) => a.precio - b.precio,
  'precio-desc': (a, b) => b.precio - a.precio,
  descuento: (a, b) => descuento(b) - descuento(a),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
};

function resultados() {
  const base = productosDe(filtros.dep, filtros.sub);
  const lista = base.filter((p) => cumple(p)).sort(comparadores[filtros.orden]);
  const conteoMarcas = new Map();
  base
    .filter((p) => cumple(p, { ignorarMarcas: true }))
    .forEach((p) => conteoMarcas.set(p.marca, (conteoMarcas.get(p.marca) ?? 0) + 1));
  filtros.marcas.forEach((m) => conteoMarcas.has(m) || conteoMarcas.set(m, 0));
  return { lista, conteoMarcas };
}

const filtrosActivos = () =>
  filtros.marcas.size + (filtros.min != null || filtros.max != null) + filtros.soloDisponibles + filtros.soloOfertas + !!filtros.busqueda;

/* ---------- Tarjeta de producto ---------- */

function tarjetaProducto(p) {
  const sub = subcategoriaDe(p);
  const pct = descuento(p);
  const agotado = p.stock === 0;
  const mensaje = `¡Hola, Los Arcos! Quisiera cotizar: ${p.nombre} (${p.marca}, SKU ${p.sku}). ¿Tienen disponibilidad?`;

  const insignias = [
    p.nuevo && '<span class="rounded-md bg-primario px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">Nuevo</span>',
    pct && `<span class="rounded-md bg-acento px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white shadow-sm">Oferta −${pct}%</span>`,
  ]
    .filter(Boolean)
    .join('');

  const estadoStock = agotado
    ? '<span class="size-1.5 rounded-full bg-acento"></span>Agotado'
    : `<span class="size-1.5 rounded-full bg-emerald-500"></span>Disponible${p.stock <= 3 ? ` · quedan ${p.stock}` : ''}`;

  return `
    <article class="group flex flex-col overflow-hidden rounded-2xl border border-borde bg-superficie transition duration-300 hover:-translate-y-0.5 hover:border-primario/40 hover:shadow-xl hover:shadow-black/5">
      <div class="relative aspect-[4/3] overflow-hidden bg-linear-to-br from-primario-suave to-superficie-alt sm:aspect-square">
        ${
          p.imagen
            ? `<img src="${p.imagen}" alt="${p.nombre}" loading="lazy" class="size-full object-contain p-4 ${agotado ? 'opacity-50 grayscale' : ''}" />`
            : `<span class="absolute inset-0 flex items-center justify-center text-5xl text-primario-texto/55 transition-transform duration-500 group-hover:scale-110 sm:text-6xl ${agotado ? 'opacity-40 grayscale' : ''}" aria-hidden="true">
                 <i class="${sub?.icono ?? 'fa-solid fa-box'}"></i>
               </span>`
        }
        ${insignias ? `<div class="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">${insignias}</div>` : ''}
      </div>

      <div class="flex flex-1 flex-col p-3 sm:p-4">
        <p class="text-[0.68rem] font-bold uppercase tracking-wider text-texto-tenue">${p.marca}</p>
        <h3 class="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-texto">${p.nombre}</h3>
        <p class="mt-1 text-[0.68rem] tabular-nums text-texto-tenue">SKU ${p.sku}</p>

        <div class="mt-3">
          ${
            pct
              ? `<p class="text-xs text-texto-tenue"><span class="line-through">${precioMXN(p.antes)}</span>
                   <span class="ml-1 font-bold text-acento-texto">Ahorra ${precioMXN(p.antes - p.precio)}</span></p>`
              : ''
          }
          <p class="text-lg font-extrabold tabular-nums sm:text-xl ${pct ? 'text-acento-texto' : 'text-texto'}">${precioMXN(p.precio)}</p>
          <p class="text-[0.65rem] text-texto-tenue">IVA incluido</p>
        </div>

        <p class="mt-2 flex items-center gap-1.5 text-xs font-semibold ${agotado ? 'text-acento-texto' : 'text-emerald-700 oscuro:text-emerald-300'}">${estadoStock}</p>

        <div class="mt-auto space-y-2 pt-3">
          <button type="button" data-agregar="${p.sku}" ${agotado ? 'disabled' : ''}
                  class="flex w-full items-center justify-center gap-2 rounded-xl bg-acento px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-acento-hover disabled:cursor-not-allowed disabled:bg-superficie-alt disabled:text-texto-tenue">
            <i class="fa-solid fa-cart-plus" aria-hidden="true"></i>
            <span>${agotado ? 'Agotado' : 'Agregar<span class="hidden sm:inline"> al carrito</span>'}</span>
          </button>
          <a href="${enlaceWhatsApp(mensaje)}" ${enlaceExterno}
             class="flex w-full items-center justify-center gap-1.5 rounded-xl border border-borde px-3 py-2 text-xs font-bold text-texto-suave transition-colors hover:border-whatsapp hover:text-texto">
            <i class="fa-brands fa-whatsapp text-sm text-whatsapp" aria-hidden="true"></i>
            <span>${agotado ? 'Preguntar<span class="hidden sm:inline"> disponibilidad</span>' : 'Cotizar<span class="hidden sm:inline"> por WhatsApp</span>'}</span>
          </a>
        </div>
      </div>
    </article>`;
}

/* ---------- Vista del catálogo ---------- */

const claseCasilla =
  'size-4 shrink-0 rounded border-borde accent-[var(--p-primario)] focus-visible:outline-2 focus-visible:outline-offset-2';

export function renderCatalogo(contenedor) {
  contenedor.innerHTML = `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <nav id="cat-migas" aria-label="Ruta de navegación" class="text-sm"></nav>

      <div class="mt-3">
        <h1 id="titulo-productos" tabindex="-1" class="text-3xl font-extrabold tracking-tight text-balance text-texto focus:outline-none sm:text-4xl"></h1>
        <p id="cat-descripcion" class="mt-2 max-w-2xl text-texto-suave"></p>
      </div>

      ${
        catalogoDemostracion
          ? `<p class="mt-5 flex items-start gap-2.5 rounded-xl border border-destaque/50 bg-destaque/10 px-4 py-3 text-xs leading-relaxed text-texto sm:text-sm">
               <i class="fa-solid fa-circle-info mt-0.5 text-destaque-texto oscuro:text-destaque" aria-hidden="true"></i>
               <span><strong>Catálogo de demostración.</strong> Productos, precios y existencias son ilustrativos; confirma por WhatsApp antes de tu compra.</span>
             </p>`
          : ''
      }

      <div id="cat-chips" class="lg:hidden"></div>

      <div class="mt-6 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
        <div id="panel-filtros" class="fixed inset-0 z-[60] hidden lg:static lg:z-auto lg:block">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] lg:hidden" data-cerrar-filtros aria-hidden="true"></div>
          <aside aria-labelledby="filtros-titulo"
                 class="panel-izquierdo absolute inset-y-0 left-0 flex w-[min(22rem,100%)] flex-col bg-superficie shadow-2xl lg:sticky lg:top-24 lg:bottom-auto lg:max-h-[calc(100dvh-7rem)] lg:w-auto lg:bg-transparent lg:shadow-none">
            <div class="flex items-center justify-between border-b border-borde px-5 py-4 lg:hidden">
              <h2 id="filtros-titulo" class="text-lg font-extrabold text-texto">Filtros</h2>
              <button type="button" data-cerrar-filtros aria-label="Cerrar filtros"
                      class="flex size-10 items-center justify-center rounded-lg text-texto-suave hover:bg-superficie-alt hover:text-texto">
                <i class="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <div class="flex-1 space-y-7 overflow-y-auto p-5 lg:p-0 lg:pr-2">
              <section aria-labelledby="f-dep" class="hidden lg:block">
                <h3 id="f-dep" class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Departamentos</h3>
                <ul id="filtro-deps" class="mt-3 space-y-0.5 text-sm"></ul>
              </section>

              <section aria-labelledby="f-marca">
                <h3 id="f-marca" class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Marca</h3>
                <ul id="filtro-marcas" class="mt-3 max-h-64 space-y-1 overflow-y-auto pr-1 text-sm"></ul>
              </section>

              <section aria-labelledby="f-precio">
                <h3 id="f-precio" class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Precio (MXN)</h3>
                <div class="mt-3 flex items-center gap-2">
                  <label class="sr-only" for="precio-min">Precio mínimo</label>
                  <input id="precio-min" type="number" inputmode="numeric" min="0" step="1" placeholder="Mín"
                         class="w-full min-w-0 rounded-lg border border-borde bg-superficie px-3 py-2 text-sm text-texto placeholder:text-texto-tenue" />
                  <span class="text-texto-tenue" aria-hidden="true">–</span>
                  <label class="sr-only" for="precio-max">Precio máximo</label>
                  <input id="precio-max" type="number" inputmode="numeric" min="0" step="1" placeholder="Máx"
                         class="w-full min-w-0 rounded-lg border border-borde bg-superficie px-3 py-2 text-sm text-texto placeholder:text-texto-tenue" />
                </div>
                <div id="filtro-rangos" class="mt-3 flex flex-wrap gap-1.5">
                  ${RANGOS_PRECIO.map(
                    (r, i) => `<button type="button" data-rango="${i}" aria-pressed="false"
                                class="rounded-lg border border-borde bg-superficie px-2.5 py-1.5 text-xs font-semibold text-texto-suave transition-colors hover:border-primario/50 aria-pressed:border-primario aria-pressed:bg-primario-suave aria-pressed:text-primario-texto">${r.etiqueta}</button>`
                  ).join('')}
                </div>
              </section>

              <section aria-labelledby="f-disp">
                <h3 id="f-disp" class="text-xs font-bold uppercase tracking-wider text-texto-tenue">Disponibilidad</h3>
                <div class="mt-3 space-y-2 text-sm text-texto">
                  <label class="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" id="solo-disponibles" class="${claseCasilla}" /> Solo disponibles
                  </label>
                  <label class="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" id="solo-ofertas" class="${claseCasilla}" /> Solo ofertas
                  </label>
                </div>
              </section>
            </div>

            <div class="flex gap-3 border-t border-borde p-4 lg:hidden">
              <button type="button" data-limpiar class="flex-1 rounded-xl border border-borde px-4 py-3 text-sm font-bold text-texto">Limpiar</button>
              <button type="button" data-cerrar-filtros id="ver-resultados" class="flex-[2] rounded-xl bg-primario px-4 py-3 text-sm font-bold text-white">Ver resultados</button>
            </div>
          </aside>
        </div>

        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <label class="relative min-w-0 flex-1 basis-full sm:basis-auto">
              <span class="sr-only">Buscar en el catálogo</span>
              <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-texto-tenue" aria-hidden="true"></i>
              <input id="cat-busqueda" type="search" placeholder="Buscar por producto, marca o SKU" autocomplete="off"
                     class="w-full rounded-xl border border-borde bg-superficie py-2.5 pl-10 pr-3 text-sm text-texto placeholder:text-texto-tenue" />
            </label>
            <button type="button" id="abrir-filtros"
                    class="inline-flex h-11 items-center gap-2 rounded-xl border border-borde bg-superficie px-4 text-sm font-bold text-texto lg:hidden">
              <i class="fa-solid fa-sliders" aria-hidden="true"></i> Filtros
              <span data-contador-filtros class="hidden min-w-5 rounded-full bg-primario px-1.5 text-center text-xs text-white"></span>
            </button>
            <label class="ml-auto flex items-center gap-2 text-sm text-texto-suave">
              <span class="hidden sm:inline">Ordenar por</span>
              <span class="sr-only sm:hidden">Ordenar por</span>
              <select id="cat-orden" class="h-11 rounded-xl border border-borde bg-superficie px-3 text-sm font-semibold text-texto">
                ${ORDENES.map((o) => `<option value="${o.id}">${o.etiqueta}</option>`).join('')}
              </select>
            </label>
          </div>

          <div id="cat-activos" class="mt-4 flex flex-wrap items-center gap-2 empty:hidden"></div>
          <p id="cat-resumen" class="mt-4 text-sm text-texto-tenue" aria-live="polite"></p>
          <div id="cat-grid" class="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4"></div>
          <div id="cat-mas" class="mt-8 text-center"></div>
        </div>
      </div>
    </div>`;
}

function renderMigas() {
  const dep = departamentoPorId(filtros.dep);
  const sub = dep?.subcategorias.find((s) => s.id === filtros.sub);
  const pasos = [
    { texto: 'Inicio', href: '#inicio' },
    { texto: 'Catálogo', href: rutaCatalogo() },
    dep && { texto: dep.nombre, href: rutaCatalogo(dep.id) },
    sub && { texto: sub.nombre, href: rutaCatalogo(dep.id, sub.id) },
  ].filter(Boolean);

  $('#cat-migas').innerHTML = `
    <ol class="flex flex-wrap items-center gap-1.5 text-texto-tenue">
      ${pasos
        .map((paso, i) =>
          i === pasos.length - 1
            ? `<li class="font-semibold text-texto" aria-current="page">${paso.texto}</li>`
            : `<li><a href="${paso.href}" class="transition-colors hover:text-primario-texto">${paso.texto}</a></li>
               <li aria-hidden="true"><i class="fa-solid fa-chevron-right text-[0.6rem]"></i></li>`
        )
        .join('')}
    </ol>`;

  $('#titulo-productos').textContent = sub?.nombre ?? dep?.nombre ?? 'Catálogo de productos';
  $('#cat-descripcion').textContent = sub
    ? `${sub.nombre} del departamento de ${dep.nombre}. ¿No ves lo que buscas? Pregúntanos por WhatsApp.`
    : (dep?.descripcion ?? 'Herramientas, ferretería, plomería, cerrajería y todo lo que necesitas para tu casa, obra o taller.');
}

function renderDepartamentos() {
  const enlaceDep = (activo) =>
    `flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition-colors ${activo ? 'bg-primario-suave font-bold text-primario-texto' : 'text-texto-suave hover:bg-superficie-alt hover:text-texto'}`;

  $('#filtro-deps').innerHTML = `
    <li><a href="${rutaCatalogo()}" class="${enlaceDep(!filtros.dep)}">Todo el catálogo <span class="text-xs text-texto-tenue">${productos.length}</span></a></li>
    ${departamentos
      .map((d) => {
        const activo = d.id === filtros.dep;
        return `
        <li>
          <a href="${rutaCatalogo(d.id)}" class="${enlaceDep(activo && !filtros.sub)} ${d.esOutlet && !activo ? 'text-acento-texto!' : ''}" ${activo && !filtros.sub ? 'aria-current="page"' : ''}>
            <span class="flex min-w-0 items-center gap-2.5"><i class="${d.icono} w-4 text-center text-xs" aria-hidden="true"></i><span class="truncate">${d.nombre}</span></span>
            <span class="text-xs text-texto-tenue">${productosDe(d.id).length}</span>
          </a>
          ${
            activo
              ? `<ul class="my-1 ml-5 space-y-0.5 border-l border-borde pl-2">
                  ${d.subcategorias
                    .map(
                      (s) => `
                    <li><a href="${rutaCatalogo(d.id, s.id)}" class="${enlaceDep(s.id === filtros.sub)} py-1.5! text-[0.8rem]" ${s.id === filtros.sub ? 'aria-current="page"' : ''}>
                      <span class="truncate">${s.nombre}</span><span class="text-xs text-texto-tenue">${productosDe(d.id, s.id).length}</span>
                    </a></li>`
                    )
                    .join('')}
                </ul>`
              : ''
          }
        </li>`;
      })
      .join('')}`;

  // Chips de departamento y subcategoría (móvil y tableta).
  const chip = (href, texto, activo, icono = '') => `
    <a href="${href}" ${activo ? 'aria-current="page"' : ''}
       class="inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors ${activo ? 'border-primario bg-primario text-white' : 'border-borde bg-superficie text-texto-suave hover:text-texto'}">
      ${icono ? `<i class="${icono} text-xs" aria-hidden="true"></i>` : ''}${texto}
    </a>`;
  const dep = departamentoPorId(filtros.dep);

  $('#cat-chips').innerHTML = `
    <nav aria-label="Departamentos" class="carril -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      ${chip(rutaCatalogo(), 'Todo', !filtros.dep)}
      ${departamentos.map((d) => chip(rutaCatalogo(d.id), d.nombre, d.id === filtros.dep, d.icono)).join('')}
    </nav>
    ${
      dep
        ? `<nav aria-label="Subcategorías de ${dep.nombre}" class="carril -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            ${chip(rutaCatalogo(dep.id), `Todo ${dep.nombre.split(/[ ,]/)[0].toLowerCase()}`, !filtros.sub)}
            ${dep.subcategorias.map((s) => chip(rutaCatalogo(dep.id, s.id), s.nombre, s.id === filtros.sub)).join('')}
          </nav>`
        : ''
    }`;

  // Lleva el chip activo a la vista dentro de cada carril (tras mostrarse la vista).
  requestAnimationFrame(() =>
    $$('#cat-chips .carril').forEach((carril) => {
      const activo = $('[aria-current]', carril);
      if (activo) carril.scrollLeft += activo.getBoundingClientRect().left - carril.getBoundingClientRect().left - 16;
    })
  );
}

function renderMarcas(conteoMarcas) {
  const marcas = [...conteoMarcas].sort((a, b) => a[0].localeCompare(b[0], 'es'));
  $('#filtro-marcas').innerHTML = marcas.length
    ? marcas
        .map(
          ([marca, n]) => `
          <li>
            <label class="flex cursor-pointer items-center gap-2.5 rounded-md py-1 text-texto ${n === 0 && !filtros.marcas.has(marca) ? 'opacity-50' : ''}">
              <input type="checkbox" data-marca="${marca}" ${filtros.marcas.has(marca) ? 'checked' : ''} class="${claseCasilla}" />
              <span class="flex-1">${marca}</span>
              <span class="text-xs text-texto-tenue">${n}</span>
            </label>
          </li>`
        )
        .join('')
    : '<li class="text-texto-tenue">Sin marcas para estos filtros.</li>';
}

function renderActivos() {
  const chips = [
    ...[...filtros.marcas].map((m) => ({ texto: m, quitar: `marca:${m}` })),
    (filtros.min != null || filtros.max != null) && {
      texto:
        filtros.min != null && filtros.max != null
          ? `${precioMXN(filtros.min)} – ${precioMXN(filtros.max)}`
          : filtros.min != null
            ? `Desde ${precioMXN(filtros.min)}`
            : `Hasta ${precioMXN(filtros.max)}`,
      quitar: 'precio',
    },
    filtros.soloDisponibles && { texto: 'Solo disponibles', quitar: 'disponibles' },
    filtros.soloOfertas && { texto: 'Solo ofertas', quitar: 'ofertas' },
    filtros.busqueda && { texto: `“${filtros.busqueda}”`, quitar: 'busqueda' },
  ].filter(Boolean);

  $('#cat-activos').innerHTML = chips.length
    ? chips
        .map(
          ({ texto, quitar }) => `
          <button type="button" data-quitar="${quitar}" aria-label="Quitar filtro ${texto}"
                  class="inline-flex items-center gap-1.5 rounded-full bg-primario-suave px-3 py-1.5 text-xs font-bold text-primario-texto transition-colors hover:bg-primario hover:text-white">
            ${texto} <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>`
        )
        .join('') +
      '<button type="button" data-limpiar class="px-2 py-1.5 text-xs font-bold text-texto-tenue underline-offset-2 hover:text-acento-texto hover:underline">Limpiar todo</button>'
    : '';

  const n = filtrosActivos();
  const contador = $('[data-contador-filtros]');
  contador.textContent = n;
  contador.classList.toggle('hidden', !n);

  $$('[data-rango]').forEach((boton) => {
    const r = RANGOS_PRECIO[boton.dataset.rango];
    boton.setAttribute('aria-pressed', String(r.min === filtros.min && r.max === filtros.max));
  });
}

function actualizar() {
  const { lista, conteoMarcas } = resultados();

  renderMigas();
  renderDepartamentos();
  renderMarcas(conteoMarcas);
  renderActivos();

  const visibles = lista.slice(0, filtros.visibles);
  $('#cat-resumen').textContent = lista.length
    ? `Mostrando ${visibles.length} de ${lista.length} ${lista.length === 1 ? 'producto' : 'productos'}`
    : '';
  $('#ver-resultados').textContent = `Ver ${lista.length} ${lista.length === 1 ? 'resultado' : 'resultados'}`;

  $('#cat-grid').innerHTML = lista.length
    ? visibles.map(tarjetaProducto).join('')
    : `<div class="col-span-full rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
         <span class="mx-auto flex size-14 items-center justify-center rounded-full bg-superficie-alt text-xl text-texto-tenue">
           <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
         </span>
         <p class="mt-4 font-bold text-texto">No encontramos productos con esos filtros</p>
         <p class="mt-1 text-sm text-texto-suave">Prueba con otros filtros o pregúntanos: seguro lo tenemos en tienda.</p>
         <div class="mt-5 flex flex-wrap justify-center gap-3">
           <button type="button" data-limpiar class="rounded-xl border border-borde px-4 py-2.5 text-sm font-bold text-texto">Limpiar filtros</button>
           <a href="${enlaceWhatsApp('¡Hola, Los Arcos! Busco este producto:\n\n')}" ${enlaceExterno}
              class="inline-flex items-center gap-2 rounded-xl bg-whatsapp px-4 py-2.5 text-sm font-bold text-white">
             <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Preguntar por WhatsApp
           </a>
         </div>
       </div>`;

  $('#cat-mas').innerHTML =
    lista.length > filtros.visibles
      ? `<button type="button" data-mas
                 class="inline-flex items-center gap-2 rounded-xl border border-borde bg-superficie px-6 py-3 text-sm font-bold text-texto transition-colors hover:border-primario/50 hover:text-primario-texto">
           Ver más productos <span class="font-normal text-texto-tenue">(${lista.length - filtros.visibles} restantes)</span>
         </button>`
      : '';
}

/* ---------- Interacción ---------- */

function reiniciarPaginacion() {
  filtros.visibles = POR_PAGINA;
}

function sincronizarControles() {
  $('#precio-min').value = filtros.min ?? '';
  $('#precio-max').value = filtros.max ?? '';
  $('#solo-disponibles').checked = filtros.soloDisponibles;
  $('#solo-ofertas').checked = filtros.soloOfertas;
  $('#cat-busqueda').value = filtros.busqueda;
  $('#cat-orden').value = filtros.orden;
}

function limpiar() {
  Object.assign(filtros, { marcas: new Set(), min: null, max: null, soloDisponibles: false, soloOfertas: false, busqueda: '' });
  reiniciarPaginacion();
  sincronizarControles();
  actualizar();
}

const panelFiltros = () => $('#panel-filtros');

function abrirFiltros() {
  panelFiltros().classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  $('#panel-filtros button[data-cerrar-filtros]').focus();
}

function cerrarFiltros() {
  if (matchMedia('(min-width: 64rem)').matches || panelFiltros().classList.contains('hidden')) return;
  panelFiltros().classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  $('#abrir-filtros').focus();
}

/** Aplica departamento/subcategoría desde la URL (#productos/dep/sub). */
export function navegarCatalogo([depId, subId] = []) {
  const dep = departamentoPorId(depId);
  const sub = dep?.subcategorias.find((s) => s.id === subId);
  const nuevoDep = dep?.id ?? null;
  if (nuevoDep !== filtros.dep) filtros.marcas.clear();
  filtros.dep = nuevoDep;
  filtros.sub = sub?.id ?? null;
  reiniciarPaginacion();
  actualizar();
}

export function iniciarCatalogo(contenedor) {
  contenedor.addEventListener('click', (e) => {
    const boton = e.target.closest('button');
    if (!boton) return;

    if (boton.dataset.agregar) {
      agregar(boton.dataset.agregar);
    } else if (boton.matches('[data-mas]')) {
      filtros.visibles += POR_PAGINA;
      actualizar();
      $(`#cat-grid > :nth-child(${filtros.visibles - POR_PAGINA + 1}) button`)?.focus();
    } else if (boton.matches('[data-limpiar]')) {
      limpiar();
    } else if (boton.dataset.quitar) {
      const [tipo, valor] = boton.dataset.quitar.split(/:(.*)/);
      if (tipo === 'marca') filtros.marcas.delete(valor);
      if (tipo === 'precio') Object.assign(filtros, { min: null, max: null });
      if (tipo === 'disponibles') filtros.soloDisponibles = false;
      if (tipo === 'ofertas') filtros.soloOfertas = false;
      if (tipo === 'busqueda') filtros.busqueda = '';
      reiniciarPaginacion();
      sincronizarControles();
      actualizar();
    } else if (boton.dataset.rango) {
      const r = RANGOS_PRECIO[boton.dataset.rango];
      const yaActivo = r.min === filtros.min && r.max === filtros.max;
      Object.assign(filtros, yaActivo ? { min: null, max: null } : { min: r.min, max: r.max });
      reiniciarPaginacion();
      sincronizarControles();
      actualizar();
    } else if (boton.id === 'abrir-filtros') {
      abrirFiltros();
    } else if (boton.matches('[data-cerrar-filtros]')) {
      cerrarFiltros();
    }
  });

  contenedor.addEventListener('click', (e) => {
    if (e.target.matches('div[data-cerrar-filtros]')) cerrarFiltros();
    // Al elegir un departamento desde el panel móvil, se cierra el panel.
    if (e.target.closest('#panel-filtros a')) cerrarFiltros();
  });

  contenedor.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.marca) {
      el.checked ? filtros.marcas.add(el.dataset.marca) : filtros.marcas.delete(el.dataset.marca);
    } else if (el.id === 'solo-disponibles') {
      filtros.soloDisponibles = el.checked;
    } else if (el.id === 'solo-ofertas') {
      filtros.soloOfertas = el.checked;
    } else if (el.id === 'cat-orden') {
      filtros.orden = el.value;
    } else return;
    reiniciarPaginacion();
    actualizar();
    if (el.dataset.marca) $(`#filtro-marcas input[data-marca="${CSS.escape(el.dataset.marca)}"]`)?.focus();
  });

  const alEscribirPrecio = debounce(() => {
    const leer = (id) => {
      const valor = $(id).value.trim();
      return valor === '' || Number.isNaN(Number(valor)) ? null : Math.max(0, Number(valor));
    };
    Object.assign(filtros, { min: leer('#precio-min'), max: leer('#precio-max') });
    reiniciarPaginacion();
    actualizar();
  }, 300);
  $('#precio-min').addEventListener('input', alEscribirPrecio);
  $('#precio-max').addEventListener('input', alEscribirPrecio);

  $('#cat-busqueda').addEventListener(
    'input',
    debounce((e) => {
      filtros.busqueda = e.target.value.trim();
      reiniciarPaginacion();
      actualizar();
    }, 200)
  );

  document.addEventListener('keydown', (e) => e.key === 'Escape' && cerrarFiltros());
  matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
    if (e.matches) document.body.classList.remove('overflow-hidden');
    panelFiltros().classList.add('hidden');
  });

  actualizar();
}

/* ---------- Mega-menú de departamentos (escritorio) ---------- */

export function renderMegaMenu() {
  const enOferta = productos.filter((p) => p.promo).length;

  return `
    <div id="mega-menu" hidden
         class="mega-entrada absolute inset-x-0 top-full border-b border-borde bg-superficie shadow-2xl shadow-black/10 max-lg:hidden!">
      <div class="mx-auto grid max-w-7xl grid-cols-12 gap-6 px-8 py-6">
        <ul class="col-span-4 space-y-0.5 border-r border-borde pr-5 xl:col-span-3" aria-label="Departamentos">
          ${departamentos
            .map(
              (d) => `
            <li>
              <a href="${rutaCatalogo(d.id)}" data-mega-dep="${d.id}"
                 class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${d.esOutlet ? 'text-acento-texto' : 'text-texto-suave'} hover:bg-superficie-alt">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-lg ${d.esOutlet ? 'bg-acento/10' : 'bg-superficie-alt'} text-xs">
                  <i class="${d.icono}" aria-hidden="true"></i>
                </span>
                <span class="flex-1">${d.nombre}</span>
                <span class="text-[0.6rem] text-texto-tenue" aria-hidden="true"><i class="fa-solid fa-chevron-right"></i></span>
              </a>
            </li>`
            )
            .join('')}
        </ul>

        <div class="col-span-8 xl:col-span-6">
          ${departamentos
            .map(
              (d, i) => `
            <div data-mega-panel="${d.id}" ${i ? 'hidden' : ''}>
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-lg font-extrabold text-texto">${d.nombre}</p>
                  <p class="mt-1 text-sm text-texto-suave">${d.descripcion}</p>
                </div>
                <a href="${rutaCatalogo(d.id)}" class="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-primario-texto hover:text-acento-texto">
                  Ver todo <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
                </a>
              </div>
              <ul class="mt-5 grid grid-cols-2 gap-2">
                ${d.subcategorias
                  .map(
                    (s) => `
                  <li>
                    <a href="${rutaCatalogo(d.id, s.id)}"
                       class="group/sub flex items-center gap-3 rounded-xl border border-borde p-3 transition-colors hover:border-primario/40 hover:bg-primario-suave">
                      <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primario-suave text-primario-texto transition-colors group-hover/sub:bg-primario group-hover/sub:text-white">
                        <i class="${s.icono}" aria-hidden="true"></i>
                      </span>
                      <span class="min-w-0">
                        <span class="block truncate text-sm font-bold text-texto">${s.nombre}</span>
                        <span class="block text-xs text-texto-tenue">${productosDe(d.id, s.id).length} productos</span>
                      </span>
                    </a>
                  </li>`
                  )
                  .join('')}
              </ul>
            </div>`
            )
            .join('')}
        </div>

        <a href="${rutaCatalogo('outlet')}"
           class="relative col-span-3 hidden overflow-hidden rounded-2xl bg-acento p-6 text-white transition hover:brightness-105 xl:block">
          <div class="patron-industrial absolute inset-0 opacity-50" aria-hidden="true"></div>
          <div class="relative flex h-full flex-col">
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Outlet</p>
            <p class="mt-2 text-2xl font-extrabold leading-tight">Zona de remate y ofertas</p>
            <p class="mt-2 text-sm text-white/85">${enOferta} productos con descuento, hasta agotar existencias.</p>
            <span class="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold">
              Ver ofertas <i class="fa-solid fa-arrow-right text-xs" aria-hidden="true"></i>
            </span>
          </div>
        </a>
      </div>
    </div>`;
}

export function iniciarMegaMenu() {
  const encabezado = $('#encabezado');
  const disparador = $('[data-disparador-mega]');
  const boton = $('#boton-mega');
  const menu = $('#mega-menu');
  const esEscritorio = () => matchMedia('(min-width: 64rem)').matches;
  let temporizador;

  const activarDepartamento = (id) => {
    $$('[data-mega-panel]', menu).forEach((panel) => (panel.hidden = panel.dataset.megaPanel !== id));
    $$('[data-mega-dep]', menu).forEach((a) => {
      const activo = a.dataset.megaDep === id;
      a.classList.toggle('bg-primario-suave', activo);
      a.classList.toggle('text-primario-texto!', activo);
    });
  };

  const abrir = () => {
    clearTimeout(temporizador);
    if (!menu.hidden) return;
    activarDepartamento(departamentos[0].id);
    menu.hidden = false;
    boton.setAttribute('aria-expanded', 'true');
  };

  const cerrar = ({ devolverFoco = false } = {}) => {
    clearTimeout(temporizador);
    if (menu.hidden) return;
    menu.hidden = true;
    boton.setAttribute('aria-expanded', 'false');
    if (devolverFoco) boton.focus();
  };

  disparador.addEventListener('mouseenter', () => {
    if (!esEscritorio()) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(abrir, 120);
  });
  encabezado.addEventListener('mouseleave', () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(cerrar, 220);
  });
  menu.addEventListener('mouseenter', () => clearTimeout(temporizador));

  boton.addEventListener('click', () => (menu.hidden ? abrir() : cerrar()));

  menu.addEventListener('mouseover', (e) => {
    const dep = e.target.closest('[data-mega-dep]');
    if (dep) activarDepartamento(dep.dataset.megaDep);
  });
  menu.addEventListener('focusin', (e) => {
    const dep = e.target.closest('[data-mega-dep]');
    if (dep) activarDepartamento(dep.dataset.megaDep);
  });
  menu.addEventListener('click', (e) => e.target.closest('a') && cerrar());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) cerrar({ devolverFoco: menu.contains(document.activeElement) });
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !disparador.contains(e.target)) cerrar();
  });
  window.addEventListener('hashchange', () => cerrar());
}
