/**
 * Acceso seguro a localStorage / sessionStorage: en modo privado o con el
 * almacenamiento bloqueado, las preferencias duran solo esta visita.
 */
const crearAlmacen = (obtener) => ({
  leer(clave) {
    try {
      return obtener().getItem(clave);
    } catch {
      return null;
    }
  },
  /** Devuelve false si no se pudo guardar (almacenamiento bloqueado o lleno). */
  guardar(clave, valor) {
    try {
      obtener().setItem(clave, valor);
      return true;
    } catch {
      return false;
    }
  },
  quitar(clave) {
    try {
      obtener().removeItem(clave);
    } catch {
      /* Sin almacenamiento disponible. */
    }
  },
});

export const almacen = crearAlmacen(() => localStorage);
export const almacenSesion = crearAlmacen(() => sessionStorage);
