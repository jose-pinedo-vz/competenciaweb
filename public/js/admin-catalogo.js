import { departamentos, productos, departamentoPorId, precioMXN } from './catalogo.js';
import { almacen } from './almacen.js';
import {
  $, $$, escapar, aSlug, TEXTO_PROHIBIDO, ICONOS, abrirModal, confirmar, avisar, campo, casilla,
  mostrarError, mostrarErrores, conectarContadores, validarImagen, comprimirImagen, claseControl,
} from './admin-ui.js';

/*
 * CRUD del catálogo en el panel de administración: productos, departamentos y subcategorías.
 * Edita en sitio los arreglos de catalogo.js y persiste con ctx.guardar() (ver admin-datos.js).
 * Si el guardado falla por falta de espacio, el cambio se revierte en memoria.
 */

/** Campos opcionales del producto que se pueden ocultar desde Ajustes. */
export const CAMPOS_PRODUCTO_OMITIBLES = [
  { id: 'antes', etiqueta: 'Precio anterior (descuento)' },
  { id: 'promo', etiqueta: 'Promoción (Outlet)' },
  { id: 'descripcion', etiqueta: 'Descripción' },
  { id: 'imagen', etiqueta: 'Imagen' },
  { id: 'destacado', etiqueta: 'Destacado' },
  { id: 'verificado', etiqueta: 'Verificado' },
  { id: 'nuevo', etiqueta: 'Nuevo' },
];

const PROMOS = [
  { valor: '', texto: 'Ninguna' },
  { valor: 'remate', texto: 'Zona de remate' },
  { valor: 'temporada', texto: 'Oferta de temporada' },
];

const ORDENES = [
  { valor: 'nombre', texto: 'Nombre (A–Z)' },
  { valor: 'precio-asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio-desc', texto: 'Precio: mayor a menor' },
  { valor: 'stock-asc', texto: 'Existencias: menor a mayor' },
  { valor: 'sku', texto: 'SKU' },
];

const estado = { q: '', dep: '', sub: '', marca: '', destacado: '', verificado: '', orden: 'nombre', pagina: 1 };

const depsConProductos = () => departamentos.filter((d) => !d.esOutlet);
const marcasExistentes = () => [...new Set(productos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'es'));
const srcImagen = (ruta) => (ruta.startsWith('data:') ? ruta : encodeURI(ruta));
const normalizar = (t) => String(t).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const nombreSub = (p) => departamentoPorId(p.dep)?.subcategorias.find((s) => s.id === p.sub)?.nombre ?? p.sub;

function enCarritoLocal(sku) {
  try {
    return JSON.parse(almacen.leer('arcos-carrito') ?? '[]').some(([s]) => s === sku);
  } catch {
    return false;
  }
}

/** Ejecuta un cambio en memoria y lo guarda; si no hay espacio, lo revierte. */
function cambiarYGuardar(ctx, cambio, mensaje) {
  const respaldoProductos = structuredClone(productos);
  const respaldoDeps = structuredClone(departamentos);
  cambio();
  if (ctx.guardar(mensaje)) return true;
  productos.splice(0, productos.length, ...respaldoProductos);
  departamentos.splice(0, departamentos.length, ...respaldoDeps);
  return false;
}

const boton = {
  primario: 'inline-flex items-center justify-center gap-2 rounded-xl bg-primario px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primario-hover',
  secundario: 'inline-flex items-center justify-center gap-2 rounded-xl border border-borde bg-superficie px-4 py-2.5 text-sm font-bold text-texto transition-colors hover:bg-superficie-alt',
  icono: 'flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-superficie-alt hover:text-texto',
  peligro: 'flex size-10 items-center justify-center rounded-lg text-texto-suave transition-colors hover:bg-acento/10 hover:text-acento-texto',
};

/* ================= Vista principal ================= */

export function renderAdminCatalogo(contenedor, ctx, subvista) {
  const vista = subvista === 'departamentos' ? 'departamentos' : 'productos';
  const pestana = (id, texto) => `
    <a href="#admin/catalogo/${id}" ${vista === id ? 'aria-current="page"' : ''}
       class="rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${vista === id ? 'bg-superficie text-primario-texto shadow-sm' : 'text-texto-suave hover:text-texto'}">${texto}</a>`;

  contenedor.innerHTML = `
    <div data-seccion>
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id="admin-titulo" tabindex="-1" class="text-2xl font-extrabold tracking-tight text-texto focus:outline-none sm:text-3xl">Catálogo</h1>
          <p class="mt-1 text-sm text-texto-suave">Productos, departamentos y subcategorías que se muestran en la tienda.</p>
        </div>
        ${
          vista === 'productos'
            ? `<button type="button" data-nuevo-producto class="${boton.primario}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Nuevo producto</button>`
            : `<button type="button" data-nuevo-departamento class="${boton.primario}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Nuevo departamento</button>`
        }
      </div>
      <nav aria-label="Secciones del catálogo" class="mt-5 inline-flex gap-1 rounded-xl bg-superficie-alt p-1">
        ${pestana('productos', `Productos (${productos.length})`)}
        ${pestana('departamentos', `Departamentos (${departamentos.length})`)}
      </nav>
      <div data-zona class="mt-6"></div>
    </div>`;

  const seccion = $('[data-seccion]', contenedor);
  const zona = $('[data-zona]', seccion);
  if (vista === 'productos') iniciarProductos(seccion, zona, ctx);
  else iniciarDepartamentos(seccion, zona, ctx);
}

/* ================= Productos: listado ================= */

function filtrar() {
  const q = normalizar(estado.q.trim());
  const lista = productos.filter((p) => {
    if (q && !normalizar(`${p.nombre} ${p.sku} ${p.marca}`).includes(q)) return false;
    if (estado.dep && p.dep !== estado.dep) return false;
    if (estado.sub && p.sub !== estado.sub) return false;
    if (estado.marca && p.marca !== estado.marca) return false;
    if (estado.destacado && String(!!p.destacado) !== estado.destacado) return false;
    if (estado.verificado && String(!!p.verificado) !== estado.verificado) return false;
    return true;
  });
  const orden = {
    nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
    'precio-asc': (a, b) => a.precio - b.precio,
    'precio-desc': (a, b) => b.precio - a.precio,
    'stock-asc': (a, b) => a.stock - b.stock,
    sku: (a, b) => a.sku.localeCompare(b.sku),
  }[estado.orden];
  return lista.sort(orden);
}

function insigniaStock(stock) {
  const [clase, texto] =
    stock === 0
      ? ['bg-acento/10 text-acento-texto ring-acento/30', 'Agotado']
      : stock <= 3
        ? ['bg-destaque/20 text-texto ring-destaque/50', `${stock} (bajo)`]
        : ['bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 oscuro:text-emerald-300', String(stock)];
  return `<span class="inline-flex rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ring-1 ${clase}">${texto}</span>`;
}

const marcas = (p) =>
  [
    p.destacado && '<span title="Destacado"><i class="fa-solid fa-star text-destaque-texto oscuro:text-destaque" aria-hidden="true"></i><span class="sr-only">Destacado</span></span>',
    p.verificado && '<span title="Verificado"><i class="fa-solid fa-circle-check text-emerald-600 oscuro:text-emerald-300" aria-hidden="true"></i><span class="sr-only">Verificado</span></span>',
    p.nuevo && '<span title="Nuevo"><i class="fa-solid fa-certificate text-primario-texto" aria-hidden="true"></i><span class="sr-only">Nuevo</span></span>',
    p.promo && `<span title="Outlet: ${p.promo}"><i class="fa-solid fa-tags text-acento-texto" aria-hidden="true"></i><span class="sr-only">Outlet</span></span>`,
  ]
    .filter(Boolean)
    .join(' ') || '<span class="text-texto-tenue" aria-hidden="true">—</span>';

const miniatura = (p, tam = 'size-12') =>
  p.imagen
    ? `<img src="${srcImagen(p.imagen)}" alt="" loading="lazy" class="${tam} shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-borde" />`
    : `<span class="flex ${tam} shrink-0 items-center justify-center rounded-lg bg-superficie-alt text-texto-tenue" aria-hidden="true"><i class="fa-solid fa-image"></i></span>`;

const precio = (p) =>
  `<span class="font-bold tabular-nums text-texto">${precioMXN(p.precio)}</span>${p.antes ? `<span class="block text-xs tabular-nums text-texto-tenue line-through">${precioMXN(p.antes)}</span>` : ''}`;

const acciones = (p) => `
  <div class="flex justify-end gap-1">
    <button type="button" data-editar="${escapar(p.sku)}" aria-label="Editar ${escapar(p.nombre)}" class="${boton.icono}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
    <button type="button" data-eliminar="${escapar(p.sku)}" aria-label="Eliminar ${escapar(p.nombre)}" class="${boton.peligro}"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>
  </div>`;

function renderResultados(zona, ctx) {
  const lista = filtrar();
  const porPagina = ctx.config.paginacion.productosPorPagina;
  const paginas = Math.max(1, Math.ceil(lista.length / porPagina));
  estado.pagina = Math.min(estado.pagina, paginas);
  const pagina = lista.slice((estado.pagina - 1) * porPagina, estado.pagina * porPagina);

  $('[data-resultados]', zona).innerHTML = !lista.length
    ? `<div class="rounded-2xl border border-dashed border-borde bg-superficie p-10 text-center">
         <p class="font-bold text-texto">No hay productos con esos filtros.</p>
         <button type="button" data-limpiar class="${boton.secundario} mt-4">Limpiar filtros</button>
       </div>`
    : `
      <p class="mb-3 text-sm text-texto-tenue" aria-live="polite">${lista.length} ${lista.length === 1 ? 'producto' : 'productos'} · página ${estado.pagina} de ${paginas}</p>

      <div class="admin-table hidden overflow-x-auto rounded-2xl border border-borde bg-superficie md:block">
        <table class="w-full text-left text-sm">
          <caption class="sr-only">Productos del catálogo</caption>
          <thead class="bg-superficie-alt text-xs uppercase tracking-wider text-texto-tenue">
            <tr>
              <th scope="col" class="px-4 py-3">Producto</th>
              <th scope="col" class="px-4 py-3">Marca</th>
              <th scope="col" class="px-4 py-3">Ubicación</th>
              <th scope="col" class="px-4 py-3 text-right">Precio</th>
              <th scope="col" class="px-4 py-3">Stock</th>
              <th scope="col" class="px-4 py-3">Marcas</th>
              <th scope="col" class="px-4 py-3"><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-borde">
            ${pagina
              .map(
                (p) => `
              <tr class="transition-colors hover:bg-superficie-alt/50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">${miniatura(p, 'size-11')}
                    <div class="min-w-0"><p class="line-clamp-2 font-semibold text-texto">${escapar(p.nombre)}</p><p class="text-xs tabular-nums text-texto-tenue">${escapar(p.sku)}</p></div>
                  </div>
                </td>
                <td class="px-4 py-3 text-texto-suave">${escapar(p.marca)}</td>
                <td class="px-4 py-3 text-xs text-texto-suave">${escapar(departamentoPorId(p.dep)?.nombre ?? p.dep)}<span class="block text-texto-tenue">${escapar(nombreSub(p))}</span></td>
                <td class="px-4 py-3 text-right">${precio(p)}</td>
                <td class="px-4 py-3">${insigniaStock(p.stock)}</td>
                <td class="whitespace-nowrap px-4 py-3">${marcas(p)}</td>
                <td class="px-4 py-3">${acciones(p)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>

      <ul class="space-y-3 md:hidden" aria-label="Productos del catálogo">
        ${pagina
          .map(
            (p) => `
          <li class="admin-card rounded-2xl border border-borde bg-superficie p-4">
            <div class="flex gap-3">${miniatura(p, 'size-14')}
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 text-sm font-semibold text-texto">${escapar(p.nombre)}</p>
                <p class="text-xs tabular-nums text-texto-tenue">${escapar(p.sku)} · ${escapar(p.marca)}</p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">${precio(p)} ${insigniaStock(p.stock)} <span class="text-xs">${marcas(p)}</span></div>
              </div>
            </div>
            <div class="mt-2 border-t border-borde pt-2">${acciones(p)}</div>
          </li>`
          )
          .join('')}
      </ul>

      ${
        paginas > 1
          ? `<nav aria-label="Paginación" class="mt-5 flex items-center justify-center gap-2">
               <button type="button" data-pagina="${estado.pagina - 1}" ${estado.pagina === 1 ? 'disabled' : ''} class="${boton.secundario} disabled:opacity-40"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i> Anterior</button>
               <span class="px-2 text-sm tabular-nums text-texto-suave">${estado.pagina} / ${paginas}</span>
               <button type="button" data-pagina="${estado.pagina + 1}" ${estado.pagina === paginas ? 'disabled' : ''} class="${boton.secundario} disabled:opacity-40">Siguiente <i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
             </nav>`
          : ''
      }`;
}

function opcionesSub(depId) {
  const dep = departamentoPorId(depId);
  return [{ valor: '', texto: 'Todas' }, ...(dep?.subcategorias ?? []).map((s) => ({ valor: s.id, texto: s.nombre }))];
}

function iniciarProductos(seccion, zona, ctx) {
  const select = (nombre, etiqueta, opciones) => `
    <label class="min-w-0">
      <span class="mb-1 block text-xs font-semibold text-texto-tenue">${etiqueta}</span>
      <select data-filtro="${nombre}" class="${claseControl}">
        ${opciones.map((o) => `<option value="${escapar(o.valor)}" ${String(estado[nombre]) === String(o.valor) ? 'selected' : ''}>${escapar(o.texto)}</option>`).join('')}
      </select>
    </label>`;
  const siNo = [{ valor: '', texto: 'Todos' }, { valor: 'true', texto: 'Sí' }, { valor: 'false', texto: 'No' }];

  zona.innerHTML = `
    <div class="rounded-2xl border border-borde bg-superficie p-4">
      <label class="relative block">
        <span class="sr-only">Buscar productos</span>
        <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-texto-tenue" aria-hidden="true"></i>
        <input type="search" data-filtro="q" value="${escapar(estado.q)}" placeholder="Buscar por nombre, SKU o marca" class="${claseControl} pl-10" />
      </label>
      <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        ${select('dep', 'Departamento', [{ valor: '', texto: 'Todos' }, ...depsConProductos().map((d) => ({ valor: d.id, texto: d.nombre }))])}
        <div data-filtro-sub>${select('sub', 'Subcategoría', opcionesSub(estado.dep))}</div>
        ${select('marca', 'Marca', [{ valor: '', texto: 'Todas' }, ...marcasExistentes().map((m) => ({ valor: m, texto: m }))])}
        ${select('destacado', 'Destacado', siNo)}
        ${select('verificado', 'Verificado', siNo)}
        ${select('orden', 'Ordenar por', ORDENES)}
      </div>
    </div>
    <div data-resultados class="mt-5"></div>`;

  renderResultados(zona, ctx);

  let temporizador;
  seccion.addEventListener('input', (e) => {
    const filtro = e.target.dataset?.filtro;
    if (!filtro) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(
      () => {
        estado[filtro] = e.target.value;
        estado.pagina = 1;
        if (filtro === 'dep') {
          estado.sub = '';
          $('[data-filtro-sub]', zona).innerHTML = select('sub', 'Subcategoría', opcionesSub(estado.dep));
        }
        renderResultados(zona, ctx);
      },
      filtro === 'q' ? 200 : 0
    );
  });

  seccion.addEventListener('click', async (e) => {
    const objetivo = e.target.closest('button');
    if (!objetivo) return;
    if (objetivo.matches('[data-nuevo-producto]')) return abrirFormularioProducto(ctx, null, () => renderResultados(zona, ctx));
    if (objetivo.dataset.editar) {
      const p = productos.find((x) => x.sku === objetivo.dataset.editar);
      return p && abrirFormularioProducto(ctx, p, () => renderResultados(zona, ctx));
    }
    if (objetivo.dataset.eliminar) return eliminarProducto(ctx, objetivo.dataset.eliminar, () => renderResultados(zona, ctx));
    if (objetivo.dataset.pagina) {
      estado.pagina = Number(objetivo.dataset.pagina);
      renderResultados(zona, ctx);
      $('[data-resultados]', zona).scrollIntoView({ block: 'start' });
      return;
    }
    if (objetivo.matches('[data-limpiar]')) {
      Object.assign(estado, { q: '', dep: '', sub: '', marca: '', destacado: '', verificado: '', pagina: 1 });
      iniciarProductosOtraVez(seccion, zona, ctx);
    }
  });
}

/** Vuelve a dibujar la barra de filtros con los valores actuales (sin duplicar eventos). */
function iniciarProductosOtraVez(seccion, zona, ctx) {
  const nueva = seccion.cloneNode(true);
  seccion.replaceWith(nueva);
  iniciarProductos(nueva, $('[data-zona]', nueva), ctx);
}

async function eliminarProducto(ctx, sku, alTerminar) {
  const p = productos.find((x) => x.sku === sku);
  if (!p) return;
  const aviso = enCarritoLocal(sku) ? '<p class="mt-2 font-semibold text-acento-texto">Este producto está en un carrito abierto en este navegador; se quitará de él.</p>' : '';
  const ok = await confirmar({
    titulo: 'Eliminar producto',
    mensaje: `<p>¿Eliminar <strong class="text-texto">${escapar(p.nombre)}</strong> (${escapar(p.sku)})? Esta acción no se puede deshacer.</p>${aviso}`,
  });
  if (!ok) return;
  if (cambiarYGuardar(ctx, () => productos.splice(productos.indexOf(p), 1), 'Producto eliminado.')) alTerminar();
}

/* ================= Productos: formulario ================= */

function generarSku(dep) {
  const prefijo = `LA-${(dep || 'xx').slice(0, 2).toUpperCase()}-`;
  for (let n = 9001; n < 99999; n++) {
    const sku = `${prefijo}${n}`;
    if (!productos.some((p) => p.sku === sku)) return sku;
  }
  return `${prefijo}${Date.now()}`;
}

function validarProducto(form, ctx, original, imagen) {
  const lim = ctx.config.limitesCaracteres;
  const omitidos = new Set(ctx.config.camposOmitidos.productos);
  const v = (n) => (form.elements[n]?.value ?? '').trim();
  const errores = {};

  const sku = original ? original.sku : v('sku').toUpperCase();
  if (!original) {
    if (!sku) errores.sku = 'Escribe un SKU o genera uno.';
    else if (!/^[A-Z0-9][A-Z0-9-]{2,19}$/.test(sku)) errores.sku = 'Usa de 3 a 20 letras, números o guiones (p. ej. LA-PG-0101).';
    else if (productos.some((p) => p.sku === sku)) errores.sku = 'Ya existe un producto con ese SKU.';
  }

  const nombre = v('nombre');
  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length > lim.nombreProducto) errores.nombre = `Máximo ${lim.nombreProducto} caracteres.`;
  else if (TEXTO_PROHIBIDO.test(nombre)) errores.nombre = 'No se permiten los caracteres < >.';

  const marca = v('marca');
  if (!marca) errores.marca = 'La marca es obligatoria.';
  else if (marca.length > lim.marca) errores.marca = `Máximo ${lim.marca} caracteres.`;
  else if (TEXTO_PROHIBIDO.test(marca)) errores.marca = 'No se permiten los caracteres < >.';

  const dep = v('dep');
  const depObj = departamentoPorId(dep);
  if (!depObj || depObj.esOutlet) errores.dep = 'Elige un departamento.';
  const sub = v('sub');
  if (depObj && !depObj.subcategorias.some((s) => s.id === sub)) errores.sub = 'Elige una subcategoría del departamento.';

  const precio = Number(v('precio'));
  if (v('precio') === '' || !Number.isFinite(precio) || precio < 0) errores.precio = 'Escribe un precio mayor o igual a 0.';
  else if (Math.round(precio * 100) !== precio * 100 && Math.abs(Math.round(precio * 100) - precio * 100) > 1e-6) errores.precio = 'Máximo 2 decimales.';
  else if (precio > 1_000_000) errores.precio = 'Revisa el precio.';

  const stock = Number(v('stock'));
  if (v('stock') === '' || !Number.isInteger(stock) || stock < 0) errores.stock = 'Escribe un número entero mayor o igual a 0.';

  const datos = { sku, nombre, marca, dep, sub, precio: Math.round(precio * 100) / 100, stock };

  if (!omitidos.has('antes') && v('antes') !== '') {
    const antes = Number(v('antes'));
    if (!Number.isFinite(antes) || antes <= precio) errores.antes = 'Debe ser mayor que el precio actual.';
    else datos.antes = Math.round(antes * 100) / 100;
  }
  if (!omitidos.has('promo') && v('promo')) {
    if (!('antes' in datos) && !(omitidos.has('antes') && original?.antes)) errores.promo = 'Para aparecer en Outlet necesita precio anterior.';
    datos.promo = v('promo');
  }
  if (!omitidos.has('descripcion') && v('descripcion')) {
    const descripcion = v('descripcion');
    if (descripcion.length > lim.descripcionProducto) errores.descripcion = `Máximo ${lim.descripcionProducto} caracteres.`;
    else if (TEXTO_PROHIBIDO.test(descripcion)) errores.descripcion = 'No se permiten los caracteres < >.';
    datos.descripcion = descripcion;
  }
  if (!omitidos.has('imagen') && imagen.src) datos.imagen = imagen.src;
  ['destacado', 'verificado', 'nuevo'].forEach((n) => {
    if (!omitidos.has(n) && form.elements[n]?.checked) datos[n] = true;
  });

  // Los campos ocultos conservan el valor que ya tenía el producto.
  if (original) CAMPOS_PRODUCTO_OMITIBLES.forEach(({ id }) => omitidos.has(id) && id in original && (datos[id] = original[id]));

  return { errores, datos };
}

const CAMPOS_FORMULARIO = ['sku', 'nombre', 'marca', 'dep', 'sub', 'precio', 'stock', 'antes', 'promo', 'descripcion', 'imagen'];

function abrirFormularioProducto(ctx, original, alGuardar) {
  const lim = ctx.config.limitesCaracteres;
  const omitidos = new Set(ctx.config.camposOmitidos.productos);
  const reglasImagen = ctx.config.imagenes;
  const p = original ?? { dep: depsConProductos()[0]?.id, stock: 0 };
  const imagen = { src: p.imagen ?? '' };
  const opcionesDep = depsConProductos().map((d) => ({ valor: d.id, texto: d.nombre }));
  const opcionesSubDe = (dep) => (departamentoPorId(dep)?.subcategorias ?? []).map((s) => ({ valor: s.id, texto: s.nombre }));
  const aceptar = reglasImagen.extensionesPermitidas.map((e) => `.${e}`).join(',');

  const html = `
    <form class="admin-form" novalidate>
      <datalist id="adm-marcas">${marcasExistentes().map((m) => `<option value="${escapar(m)}"></option>`).join('')}</datalist>
      <div class="grid gap-4 p-5 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <div class="flex items-end gap-2">
            <div class="min-w-0 flex-1">${campo({
              nombre: 'sku', etiqueta: 'SKU', valor: p.sku ?? '', requerido: true, max: 20,
              atributos: `${original ? 'readonly' : 'data-autofoco'} autocomplete="off" spellcheck="false"`,
              ayuda: original ? 'No se puede cambiar: lo usan los carritos y pedidos.' : 'Letras, números y guiones.',
            })}</div>
            ${original ? '' : `<button type="button" data-generar-sku class="${boton.secundario} mb-[1.35rem] shrink-0">Generar</button>`}
          </div>
        </div>
        ${campo({ nombre: 'nombre', etiqueta: 'Nombre', valor: p.nombre ?? '', requerido: true, max: lim.nombreProducto, ancho: 'sm:col-span-2', atributos: original ? 'data-autofoco' : '' })}
        ${campo({ nombre: 'marca', etiqueta: 'Marca', valor: p.marca ?? '', requerido: true, max: lim.marca, atributos: 'list="adm-marcas" autocomplete="off"' })}
        ${campo({ nombre: 'dep', etiqueta: 'Departamento', valor: p.dep, requerido: true, opciones: opcionesDep })}
        <div data-contenedor-sub class="sm:col-span-2">${campo({ nombre: 'sub', etiqueta: 'Subcategoría', valor: p.sub ?? '', requerido: true, opciones: opcionesSubDe(p.dep) })}</div>
        ${campo({ nombre: 'precio', etiqueta: 'Precio con IVA (MXN)', valor: p.precio ?? '', tipo: 'number', requerido: true, atributos: 'min="0" step="0.01" inputmode="decimal"' })}
        ${campo({ nombre: 'stock', etiqueta: 'Existencias', valor: p.stock ?? 0, tipo: 'number', requerido: true, atributos: 'min="0" step="1" inputmode="numeric"' })}
        ${campo({ nombre: 'antes', etiqueta: 'Precio anterior', valor: p.antes ?? '', tipo: 'number', omitido: omitidos.has('antes'), ayuda: 'Opcional. Si es mayor que el precio, se muestra como oferta.', atributos: 'min="0" step="0.01" inputmode="decimal"' })}
        ${campo({ nombre: 'promo', etiqueta: 'Promoción (Outlet)', valor: p.promo ?? '', opciones: PROMOS, omitido: omitidos.has('promo') })}
        ${campo({ nombre: 'descripcion', etiqueta: 'Descripción', valor: p.descripcion ?? '', area: true, max: lim.descripcionProducto, ancho: 'sm:col-span-2', omitido: omitidos.has('descripcion') })}

        <div class="${omitidos.has('imagen') ? 'campo-omitido' : ''} sm:col-span-2" data-campo="imagen">
          <p class="mb-1.5 text-sm font-semibold text-texto" id="adm-imagen-etiqueta">Imagen</p>
          <div class="flex flex-wrap items-center gap-4">
            <div class="file-input-preview" data-vista-imagen aria-hidden="true"></div>
            <div class="flex flex-col gap-2">
              <label class="${boton.secundario} cursor-pointer">
                <i class="fa-solid fa-upload" aria-hidden="true"></i> Elegir imagen
                <input type="file" name="archivo" accept="${aceptar}" class="sr-only" aria-labelledby="adm-imagen-etiqueta" aria-describedby="adm-imagen-ayuda adm-imagen-error" />
              </label>
              <button type="button" data-quitar-imagen class="text-left text-xs font-bold text-acento-texto hover:underline">Quitar imagen</button>
            </div>
          </div>
          <p id="adm-imagen-ayuda" class="mt-2 text-xs text-texto-tenue">
            ${reglasImagen.extensionesPermitidas.join(', ')} · máx. ${reglasImagen.tamanoMaximoMB} MB ·
            de ${reglasImagen.dimensionesMinimas.ancho}×${reglasImagen.dimensionesMinimas.alto} a ${reglasImagen.dimensionesMaximas.ancho}×${reglasImagen.dimensionesMaximas.alto} px.
            Se reduce a 800 px para guardarla.
          </p>
          <p id="adm-imagen-error" class="mt-1 hidden text-xs font-semibold text-acento-texto" data-error="imagen" role="alert"></p>
        </div>

        <div class="grid gap-2 sm:col-span-2 sm:grid-cols-3">
          ${casilla({ nombre: 'destacado', etiqueta: 'Destacado', ayuda: 'Aparece primero.', marcado: !!p.destacado, omitido: omitidos.has('destacado') })}
          ${casilla({ nombre: 'verificado', etiqueta: 'Verificado', ayuda: 'Datos confirmados.', marcado: !!p.verificado, omitido: omitidos.has('verificado') })}
          ${casilla({ nombre: 'nuevo', etiqueta: 'Nuevo', ayuda: 'Insignia "Nuevo".', marcado: !!p.nuevo, omitido: omitidos.has('nuevo') })}
        </div>
      </div>
      <div class="sticky bottom-0 flex justify-end gap-2 border-t border-borde bg-superficie px-5 py-4">
        <button type="button" data-cerrar-modal class="${boton.secundario}">Cancelar</button>
        <button type="submit" class="${boton.primario}"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar</button>
      </div>
    </form>`;

  abrirModal({
    titulo: original ? 'Editar producto' : 'Nuevo producto',
    ancho: 'sm:max-w-2xl',
    html,
    alAbrir: (capa, cerrar) => {
      const form = $('form', capa);
      const tocados = new Set();
      conectarContadores(form);

      const pintarImagen = () => {
        $('[data-vista-imagen]', form).innerHTML = imagen.src
          ? `<img src="${srcImagen(imagen.src)}" alt="" class="size-24 rounded-xl bg-white object-contain p-1 ring-1 ring-borde" />`
          : '<span class="flex size-24 items-center justify-center rounded-xl border-2 border-dashed border-borde text-2xl text-texto-tenue"><i class="fa-solid fa-image"></i></span>';
        $('[data-quitar-imagen]', form).hidden = !imagen.src;
      };
      pintarImagen();

      const revisar = (soloCampo) => {
        const { errores } = validarProducto(form, ctx, original, imagen);
        (soloCampo ? [soloCampo] : CAMPOS_FORMULARIO).forEach((c) => c !== 'imagen' && mostrarError(form, c, errores[c]));
        return errores;
      };

      form.addEventListener('focusout', (e) => {
        if (!e.target.name || e.target.name === 'archivo') return;
        tocados.add(e.target.name);
        revisar(e.target.name);
      });
      form.addEventListener('input', (e) => tocados.has(e.target.name) && revisar(e.target.name));

      form.elements.dep.addEventListener('change', () => {
        $('[data-contenedor-sub]', form).innerHTML = campo({ nombre: 'sub', etiqueta: 'Subcategoría', requerido: true, opciones: opcionesSubDe(form.elements.dep.value) });
      });

      $('[data-generar-sku]', form)?.addEventListener('click', () => {
        form.elements.sku.value = generarSku(form.elements.dep.value);
        mostrarError(form, 'sku', '');
      });

      $('[data-quitar-imagen]', form).addEventListener('click', () => {
        imagen.src = '';
        pintarImagen();
        form.elements.archivo.focus();
      });

      form.elements.archivo.addEventListener('change', async () => {
        const archivo = form.elements.archivo.files[0];
        form.elements.archivo.value = '';
        if (!archivo) return;
        mostrarError(form, 'imagen', '');
        const resultado = await validarImagen(archivo, reglasImagen, reglasImagen.tamanoMaximoMB);
        if (!resultado.valido) return mostrarError(form, 'imagen', resultado.error);
        imagen.src = comprimirImagen(resultado.img, 800, resultado.tipo === 'image/png' ? 'image/png' : resultado.tipo).src;
        pintarImagen();
        avisar('Imagen lista. Guarda el producto para conservarla.', 'info');
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { errores, datos } = validarProducto(form, ctx, original, imagen);
        if (!mostrarErrores(form, errores, CAMPOS_FORMULARIO.filter((c) => c !== 'imagen'))) return;
        const guardado = cambiarYGuardar(
          ctx,
          () => {
            if (original) {
              CAMPOS_PRODUCTO_OMITIBLES.forEach(({ id }) => delete original[id]);
              Object.assign(original, datos);
            } else productos.unshift(datos);
          },
          original ? 'Producto actualizado.' : 'Producto creado.'
        );
        if (guardado) {
          cerrar();
          alGuardar();
        }
      });
    },
  });
}

/* ================= Departamentos y subcategorías ================= */

function iniciarDepartamentos(seccion, zona, ctx) {
  const contar = (dep, sub) => productos.filter((p) => p.dep === dep && (!sub || p.sub === sub)).length;
  const pintar = () => {
    zona.innerHTML = `
      <ul class="space-y-4">
        ${departamentos
          .map(
            (d) => `
          <li class="admin-card rounded-2xl border border-borde bg-superficie p-4 sm:p-5">
            <div class="flex flex-wrap items-start gap-3">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario-texto"><i class="${escapar(d.icono)}" aria-hidden="true"></i></span>
              <div class="min-w-0 flex-1">
                <h2 class="flex flex-wrap items-center gap-2 font-extrabold text-texto">${escapar(d.nombre)}
                  ${d.esOutlet ? '<span class="rounded-md bg-superficie-alt px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-texto-tenue ring-1 ring-borde">Sistema</span>' : ''}
                </h2>
                <p class="text-xs text-texto-tenue"><code>${escapar(d.id)}</code> · ${d.subcategorias.length} subcategorías · ${d.esOutlet ? 'agrupa productos con promoción' : `${contar(d.id)} productos`}</p>
                <p class="mt-1 text-sm text-texto-suave">${escapar(d.descripcion ?? '')}</p>
              </div>
              <div class="flex gap-1">
                <button type="button" data-editar-dep="${escapar(d.id)}" aria-label="Editar ${escapar(d.nombre)}" class="${boton.icono}"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
                ${d.esOutlet ? '' : `<button type="button" data-eliminar-dep="${escapar(d.id)}" aria-label="Eliminar ${escapar(d.nombre)}" class="${boton.peligro}"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>`}
              </div>
            </div>
            <ul class="mt-4 divide-y divide-borde rounded-xl border border-borde">
              ${d.subcategorias
                .map(
                  (s) => `
                <li class="flex items-center gap-3 px-3 py-2">
                  <i class="${escapar(s.icono)} w-5 text-center text-sm text-primario-texto" aria-hidden="true"></i>
                  <span class="min-w-0 flex-1 text-sm"><span class="font-semibold text-texto">${escapar(s.nombre)}</span> <code class="text-xs text-texto-tenue">${escapar(s.id)}</code></span>
                  <span class="text-xs tabular-nums text-texto-tenue">${d.esOutlet ? '' : `${contar(d.id, s.id)} prod.`}</span>
                  ${
                    d.esOutlet
                      ? ''
                      : `<button type="button" data-editar-sub="${escapar(d.id)}|${escapar(s.id)}" aria-label="Editar subcategoría ${escapar(s.nombre)}" class="${boton.icono} size-9"><i class="fa-solid fa-pen text-xs" aria-hidden="true"></i></button>
                         <button type="button" data-eliminar-sub="${escapar(d.id)}|${escapar(s.id)}" aria-label="Eliminar subcategoría ${escapar(s.nombre)}" class="${boton.peligro} size-9"><i class="fa-solid fa-trash-can text-xs" aria-hidden="true"></i></button>`
                  }
                </li>`
                )
                .join('')}
            </ul>
            ${d.esOutlet ? '<p class="mt-2 text-xs text-texto-tenue">Sus subcategorías dependen del campo "Promoción" de cada producto.</p>' : `<button type="button" data-nueva-sub="${escapar(d.id)}" class="${boton.secundario} mt-3 text-xs"><i class="fa-solid fa-plus" aria-hidden="true"></i> Agregar subcategoría</button>`}
          </li>`
          )
          .join('')}
      </ul>`;
  };
  pintar();

  seccion.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const ds = b.dataset;
    if (b.matches('[data-nuevo-departamento]')) return abrirFormularioDepartamento(ctx, null, pintar);
    if (ds.editarDep) return abrirFormularioDepartamento(ctx, departamentoPorId(ds.editarDep), pintar);
    if (ds.nuevaSub) return abrirFormularioSub(ctx, departamentoPorId(ds.nuevaSub), null, pintar);
    if (ds.editarSub) {
      const [dep, sub] = ds.editarSub.split('|');
      const d = departamentoPorId(dep);
      return abrirFormularioSub(ctx, d, d.subcategorias.find((s) => s.id === sub), pintar);
    }
    if (ds.eliminarDep) {
      const d = departamentoPorId(ds.eliminarDep);
      const n = contar(d.id);
      const ok = await confirmar({
        titulo: 'Eliminar departamento',
        mensaje: `<p>¿Eliminar <strong class="text-texto">${escapar(d.nombre)}</strong>?</p>
                  <p class="mt-2">También se eliminarán sus <strong class="text-texto">${d.subcategorias.length} subcategorías</strong> y <strong class="text-texto">${n} productos</strong>. No se puede deshacer.</p>`,
      });
      if (ok && cambiarYGuardar(ctx, () => {
        departamentos.splice(departamentos.indexOf(d), 1);
        for (let i = productos.length - 1; i >= 0; i--) if (productos[i].dep === d.id) productos.splice(i, 1);
      }, 'Departamento eliminado.')) pintar();
    }
    if (ds.eliminarSub) {
      const [dep, subId] = ds.eliminarSub.split('|');
      const d = departamentoPorId(dep);
      const s = d.subcategorias.find((x) => x.id === subId);
      const n = contar(dep, subId);
      const ok = await confirmar({
        titulo: 'Eliminar subcategoría',
        mensaje: `<p>¿Eliminar <strong class="text-texto">${escapar(s.nombre)}</strong> de ${escapar(d.nombre)}?</p>
                  <p class="mt-2">También se eliminarán sus <strong class="text-texto">${n} productos</strong>. No se puede deshacer.</p>`,
      });
      if (ok && cambiarYGuardar(ctx, () => {
        d.subcategorias.splice(d.subcategorias.indexOf(s), 1);
        for (let i = productos.length - 1; i >= 0; i--) if (productos[i].dep === dep && productos[i].sub === subId) productos.splice(i, 1);
      }, 'Subcategoría eliminada.')) pintar();
    }
  });
}

const opcionesIconos = ICONOS.map((i) => ({ valor: i, texto: i.replace('fa-solid fa-', '') }));

/** Selector de ícono con vista previa en vivo. */
function conectarVistaIcono(form) {
  const actualizar = () => ($('[data-vista-icono]', form).className = `${form.elements.icono.value} text-xl`);
  form.elements.icono.addEventListener('change', actualizar);
  actualizar();
}

const campoIcono = (valor) => `
  <div class="flex items-end gap-3">
    <div class="min-w-0 flex-1">${campo({ nombre: 'icono', etiqueta: 'Ícono', valor, opciones: opcionesIconos })}</div>
    <span class="mb-[1.35rem] flex size-11 shrink-0 items-center justify-center rounded-xl bg-primario-suave text-primario-texto" aria-hidden="true"><i data-vista-icono></i></span>
  </div>`;

function validarNombreId(form, { existentes, idOriginal, maxNombre }) {
  const errores = {};
  const nombre = form.elements.nombre.value.trim();
  if (!nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (nombre.length > maxNombre) errores.nombre = `Máximo ${maxNombre} caracteres.`;
  else if (TEXTO_PROHIBIDO.test(nombre)) errores.nombre = 'No se permiten los caracteres < >.';
  const id = idOriginal ?? aSlug(form.elements.id.value || nombre);
  if (!idOriginal) {
    if (!id) errores.id = 'Escribe un identificador.';
    else if (existentes.includes(id)) errores.id = 'Ya existe uno con ese identificador.';
  }
  return { errores, nombre, id };
}

function abrirFormularioDepartamento(ctx, original, alGuardar) {
  abrirModal({
    titulo: original ? 'Editar departamento' : 'Nuevo departamento',
    html: `
      <form class="admin-form space-y-4 p-5" novalidate>
        ${campo({ nombre: 'nombre', etiqueta: 'Nombre', valor: original?.nombre ?? '', requerido: true, max: 60, atributos: 'data-autofoco' })}
        ${campo({
          nombre: 'id', etiqueta: 'Identificador (URL)', valor: original?.id ?? '', max: 40,
          atributos: original ? 'readonly' : 'placeholder="Se genera a partir del nombre"',
          ayuda: original ? 'No se puede cambiar: lo usan los productos y las rutas.' : `Aparece en la dirección: #productos/<identificador>.`,
        })}
        ${campoIcono(original?.icono ?? ICONOS[0])}
        ${campo({ nombre: 'descripcion', etiqueta: 'Descripción', valor: original?.descripcion ?? '', area: true, max: 200 })}
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" data-cerrar-modal class="${boton.secundario}">Cancelar</button>
          <button type="submit" class="${boton.primario}"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar</button>
        </div>
      </form>`,
    alAbrir: (capa, cerrar) => {
      const form = $('form', capa);
      conectarContadores(form);
      conectarVistaIcono(form);
      if (!original) form.elements.nombre.addEventListener('input', () => (form.elements.id.placeholder = aSlug(form.elements.nombre.value) || 'Se genera a partir del nombre'));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const { errores, nombre, id } = validarNombreId(form, { existentes: departamentos.map((d) => d.id), idOriginal: original?.id, maxNombre: 60 });
        const descripcion = form.elements.descripcion.value.trim();
        if (TEXTO_PROHIBIDO.test(descripcion)) errores.descripcion = 'No se permiten los caracteres < >.';
        if (!mostrarErrores(form, errores, ['nombre', 'id', 'descripcion'])) return;
        const datos = { nombre, icono: form.elements.icono.value, descripcion };
        const ok = cambiarYGuardar(ctx, () => {
          if (original) Object.assign(original, datos);
          else departamentos.splice(Math.max(0, departamentos.findIndex((d) => d.esOutlet)), 0, { id, ...datos, subcategorias: [] });
        }, original ? 'Departamento actualizado.' : 'Departamento creado. Agrégale subcategorías.');
        if (ok) {
          cerrar();
          alGuardar();
        }
      });
    },
  });
}

function abrirFormularioSub(ctx, departamento, original, alGuardar) {
  abrirModal({
    titulo: original ? 'Editar subcategoría' : `Nueva subcategoría en ${escapar(departamento.nombre)}`,
    html: `
      <form class="admin-form space-y-4 p-5" novalidate>
        ${campo({
          nombre: 'departamento', etiqueta: 'Departamento', valor: departamento.id,
          opciones: depsConProductos().map((d) => ({ valor: d.id, texto: d.nombre })),
          atributos: original ? 'disabled' : '', ayuda: original ? 'Para moverla, crea una nueva en el otro departamento.' : '',
        })}
        ${campo({ nombre: 'nombre', etiqueta: 'Nombre', valor: original?.nombre ?? '', requerido: true, max: 60, atributos: 'data-autofoco' })}
        ${campo({ nombre: 'id', etiqueta: 'Identificador (URL)', valor: original?.id ?? '', max: 40, atributos: original ? 'readonly' : 'placeholder="Se genera a partir del nombre"' })}
        ${campoIcono(original?.icono ?? ICONOS[0])}
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" data-cerrar-modal class="${boton.secundario}">Cancelar</button>
          <button type="submit" class="${boton.primario}"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Guardar</button>
        </div>
      </form>`,
    alAbrir: (capa, cerrar) => {
      const form = $('form', capa);
      conectarContadores(form);
      conectarVistaIcono(form);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const destino = original ? departamento : departamentoPorId(form.elements.departamento.value);
        const { errores, nombre, id } = validarNombreId(form, { existentes: destino.subcategorias.map((s) => s.id), idOriginal: original?.id, maxNombre: 60 });
        if (!mostrarErrores(form, errores, ['nombre', 'id'])) return;
        const ok = cambiarYGuardar(ctx, () => {
          if (original) Object.assign(original, { nombre, icono: form.elements.icono.value });
          else destino.subcategorias.push({ id, nombre, icono: form.elements.icono.value });
        }, original ? 'Subcategoría actualizada.' : 'Subcategoría creada.');
        if (ok) {
          cerrar();
          alGuardar();
        }
      });
    },
  });
}
