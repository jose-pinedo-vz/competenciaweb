import { negocio } from './data.js';
import { departamentos, productos } from './catalogo.js';
import { almacen } from './almacen.js';

/*
 * Capa de datos del panel de administración.
 *
 * Análisis de la arquitectura (paso 1 del prompt de la vista admin):
 * - data.js exporta `negocio` (información, contacto, horario, marcas, pago, valoración, mensajes)
 *   y catalogo.js exporta `departamentos` y `productos`. Son objetos y arreglos en memoria.
 * - Varios módulos leen esos datos AL CARGAR (horario.js, pago.js, carrito.js, tienda.js,
 *   valoracion.js, galeria.js). Por eso este módulo debe ser el PRIMER import de main.js:
 *   aplica los cambios del admin antes de que esos módulos se evalúen.
 * - Los cambios se aplican "en sitio" (se mutan los mismos objetos y arreglos, nunca se
 *   reemplazan) para que todas las referencias existentes vean los datos actualizados.
 * - Datos de solo lectura: paletas, vistas, historia, galería, líneas del catálogo y el
 *   departamento Outlet (sus subcategorías dependen del campo `promo`).
 *
 * Capas (de menor a mayor prioridad):
 *   1. data.js / catalogo.js (valores de fábrica)
 *   2. Archivo publicado opcional `negocio.admin.datosPublicados` (JSON exportado desde el admin;
 *      así los cambios llegan a todos los visitantes al publicar el sitio)
 *   3. Cambios locales del admin en localStorage (`arcos-admin-datos`): solo en ese navegador.
 */

export const CLAVE_DATOS = 'arcos-admin-datos';
export const CLAVE_CONFIG = 'arcos-admin-config';
export const VERSION_DATOS = 1;

/** Secciones de `negocio` que el admin puede editar. */
export const SECCIONES_NEGOCIO = [
  'nombre', 'nombreCorto', 'eslogan', 'anioFundacion', 'logo',
  'contacto', 'horario', 'marcas', 'pago', 'valoracion', 'mensajesWhatsApp',
];

/** Configuración del propio panel (paso 8 del prompt). */
export const CONFIG_POR_DEFECTO = {
  camposOmitidos: { productos: [], configuracion: [] },
  limitesCaracteres: { nombreProducto: 100, descripcionProducto: 200, marca: 50, nombreNegocio: 100, eslogan: 150 },
  imagenes: {
    extensionesPermitidas: ['webp', 'png', 'jpg', 'jpeg'],
    tamanoMaximoMB: 2,
    tamanoMaximoLogoMB: 5,
    dimensionesMinimas: { ancho: 300, alto: 300 },
    dimensionesMaximas: { ancho: 2000, alto: 2000 },
  },
  paginacion: { productosPorPagina: 20, pedidosPorPagina: 25 },
  sesion: { timeoutMinutos: negocio.admin?.sessionTimeout ?? 30 },
};

const clonar = (valor) => structuredClone(valor);
const esObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/* ---------- Validación (datos guardados, importados o publicados) ---------- */

const TEXTO_PELIGROSO = /[<>]/;
const RUTA_IMAGEN_SEGURA = /^(data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+|[\w\-./ áéíóúñÁÉÍÓÚÑ()]+\.(png|jpe?g|webp))$/i;

/** Revisa recursivamente que ningún texto lleve < o > (se insertan como HTML en el sitio). */
function textosSeguros(valor, ruta, errores) {
  if (typeof valor === 'string') {
    if (!valor.startsWith('data:image/') && TEXTO_PELIGROSO.test(valor)) errores.push(`${ruta}: no se permiten los caracteres < >`);
  } else if (Array.isArray(valor)) valor.forEach((v, i) => textosSeguros(v, `${ruta}[${i}]`, errores));
  else if (esObjeto(valor)) Object.entries(valor).forEach(([k, v]) => textosSeguros(v, `${ruta}.${k}`, errores));
}

/** Devuelve una lista de errores; vacía si los datos se pueden aplicar. */
export function validarDatos(datos) {
  const errores = [];
  if (!esObjeto(datos)) return ['El archivo no contiene un objeto de datos.'];

  if ('productos' in datos) {
    if (!Array.isArray(datos.productos)) errores.push('productos debe ser una lista.');
    else {
      const skus = new Set();
      datos.productos.forEach((p, i) => {
        const donde = `productos[${i}]`;
        if (!esObjeto(p)) return errores.push(`${donde}: no es un producto.`);
        if (typeof p.sku !== 'string' || !p.sku) errores.push(`${donde}: falta el SKU.`);
        else if (skus.has(p.sku)) errores.push(`${donde}: SKU repetido (${p.sku}).`);
        skus.add(p.sku);
        if (typeof p.nombre !== 'string' || !p.nombre.trim()) errores.push(`${donde}: falta el nombre.`);
        if (typeof p.marca !== 'string') errores.push(`${donde}: falta la marca.`);
        if (typeof p.dep !== 'string' || typeof p.sub !== 'string') errores.push(`${donde}: falta departamento o subcategoría.`);
        if (typeof p.precio !== 'number' || !(p.precio >= 0)) errores.push(`${donde}: precio inválido.`);
        if (!Number.isInteger(p.stock) || p.stock < 0) errores.push(`${donde}: existencias inválidas.`);
        if (p.imagen != null && (typeof p.imagen !== 'string' || !RUTA_IMAGEN_SEGURA.test(p.imagen))) errores.push(`${donde}: imagen no válida.`);
      });
    }
  }

  if ('departamentos' in datos) {
    if (!Array.isArray(datos.departamentos)) errores.push('departamentos debe ser una lista.');
    else
      datos.departamentos.forEach((d, i) => {
        if (!esObjeto(d) || typeof d.id !== 'string' || typeof d.nombre !== 'string' || !Array.isArray(d.subcategorias))
          errores.push(`departamentos[${i}]: estructura incompleta.`);
      });
  }

  if ('negocio' in datos) {
    if (!esObjeto(datos.negocio)) errores.push('negocio debe ser un objeto.');
    else {
      const ajenas = Object.keys(datos.negocio).filter((k) => !SECCIONES_NEGOCIO.includes(k));
      if (ajenas.length) errores.push(`negocio: secciones no editables (${ajenas.join(', ')}).`);
      const logo = datos.negocio.logo?.src;
      if (logo != null && (typeof logo !== 'string' || !RUTA_IMAGEN_SEGURA.test(logo))) errores.push('negocio.logo: imagen no válida.');
    }
  }

  textosSeguros(datos, 'datos', errores);
  return errores.slice(0, 20);
}

/* ---------- Aplicación en sitio ---------- */

function reemplazarArreglo(destino, origen) {
  destino.splice(0, destino.length, ...clonar(origen));
}

function fusionar(destino, origen) {
  for (const [clave, valor] of Object.entries(origen)) {
    if (Array.isArray(valor)) {
      if (Array.isArray(destino[clave])) reemplazarArreglo(destino[clave], valor);
      else destino[clave] = clonar(valor);
    } else if (esObjeto(valor)) {
      if (!esObjeto(destino[clave])) destino[clave] = {};
      fusionar(destino[clave], valor);
    } else {
      destino[clave] = valor;
    }
  }
}

function aplicar(datos) {
  if (Array.isArray(datos.productos)) reemplazarArreglo(productos, datos.productos);
  if (Array.isArray(datos.departamentos)) reemplazarArreglo(departamentos, datos.departamentos);
  if (esObjeto(datos.negocio)) {
    const permitidas = Object.fromEntries(Object.entries(datos.negocio).filter(([k]) => SECCIONES_NEGOCIO.includes(k)));
    fusionar(negocio, permitidas);
  }
}

/** Aplica un bloque de negocio editado desde el formulario (mismas reglas que al cargar). */
export const aplicarNegocio = (parcial) => fusionar(negocio, parcial);

/* ---------- Carga inicial (se ejecuta al importar el módulo) ---------- */

export const estadoCarga = { publicados: false, locales: false, errores: [] };

async function cargarPublicados() {
  const ruta = negocio.admin?.datosPublicados;
  if (!ruta) return;
  try {
    const respuesta = await fetch(ruta, { cache: 'no-cache' });
    if (!respuesta.ok) return;
    const archivo = await respuesta.json();
    const datos = archivo?.datos ?? archivo; // acepta el formato de exportación o los datos directos
    const errores = validarDatos(datos);
    if (errores.length) return estadoCarga.errores.push(...errores);
    aplicar(datos);
    estadoCarga.publicados = true;
  } catch {
    /* Archivo publicado ausente o ilegible: se usan los datos de fábrica. */
  }
}

export function leerDatosLocales() {
  try {
    return JSON.parse(almacen.leer(CLAVE_DATOS) ?? 'null');
  } catch {
    return null;
  }
}

await cargarPublicados();
{
  const locales = leerDatosLocales();
  if (locales) {
    const errores = validarDatos(locales);
    if (errores.length) estadoCarga.errores.push(...errores);
    else {
      aplicar(locales);
      estadoCarga.locales = true;
    }
  }
}

/* ---------- Guardado ---------- */

let cambiosSinAplicar = false;

/** true si el admin guardó algo en esta visita: al volver al sitio hay que recargar. */
export const hayCambiosSinAplicar = () => cambiosSinAplicar;

/** Fotografía completa de todo lo editable, tal como está en memoria. */
export function instantanea() {
  return {
    version: VERSION_DATOS,
    ultimaModificacion: new Date().toISOString(),
    negocio: clonar(Object.fromEntries(SECCIONES_NEGOCIO.map((k) => [k, negocio[k]]))),
    departamentos: clonar(departamentos),
    productos: clonar(productos),
  };
}

/** Guarda el estado actual. Devuelve false si el navegador no tiene espacio. */
export function guardarDatos() {
  const ok = almacen.guardar(CLAVE_DATOS, JSON.stringify(instantanea()));
  if (ok) cambiosSinAplicar = true;
  return ok;
}

/** Sustituye los datos locales por otros ya validados (importación). */
export function reemplazarDatosLocales(datos) {
  const ok = almacen.guardar(CLAVE_DATOS, JSON.stringify({ ...datos, version: VERSION_DATOS, ultimaModificacion: new Date().toISOString() }));
  if (ok) cambiosSinAplicar = true;
  return ok;
}

export function borrarDatosLocales() {
  almacen.quitar(CLAVE_DATOS);
  cambiosSinAplicar = true;
}

export const ultimaModificacion = () => leerDatosLocales()?.ultimaModificacion ?? null;

/** Tamaño aproximado (KB) de lo que el admin ocupa en localStorage. */
export const espacioUsadoKB = () =>
  Math.round((((almacen.leer(CLAVE_DATOS) ?? '').length + (almacen.leer(CLAVE_CONFIG) ?? '').length) * 2) / 1024);

/* ---------- Configuración del panel ---------- */

function fusionarConfig(base, guardada) {
  const resultado = clonar(base);
  if (!esObjeto(guardada)) return resultado;
  for (const [k, v] of Object.entries(guardada)) {
    if (!(k in resultado)) continue;
    resultado[k] = esObjeto(resultado[k]) && esObjeto(v) ? fusionarConfig(resultado[k], v) : clonar(v);
  }
  return resultado;
}

export function leerConfigAdmin() {
  try {
    return fusionarConfig(CONFIG_POR_DEFECTO, JSON.parse(almacen.leer(CLAVE_CONFIG) ?? 'null'));
  } catch {
    return clonar(CONFIG_POR_DEFECTO);
  }
}

export const guardarConfigAdmin = (config) => almacen.guardar(CLAVE_CONFIG, JSON.stringify(config));
export const restaurarConfigAdmin = () => almacen.quitar(CLAVE_CONFIG);
