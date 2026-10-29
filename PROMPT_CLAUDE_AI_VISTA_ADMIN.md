# Prompt para Claude AI - Vista de Administrador con CRUD

---

## Instrucciones para Claude AI

Este prompt está diseñado para que crees una **vista de administrador completa** con sistema CRUD para gestionar todos los módulos del proyecto Ferretería Los Arcos, sin romper la vista cliente existente.

---

## Contexto del Proyecto Actual

**Stack Tecnológico:**
- HTML5 + JavaScript ES6+ (módulos nativos)
- Tailwind CSS v4 por CDN
- Sin frameworks ni herramientas de compilación
- Sitio estático (sin backend)

**Módulos Existentes:**
1. `public/js/data.js` - Datos del negocio (configuración, horario, pago, marcas)
2. `public/js/catalogo.js` - Catálogo (departamentos, subcategorías, productos)
3. `public/js/carrito.js` - Carrito de compras
4. `public/js/pago.js` - Sistema de pago (demo)
5. `public/js/tienda.js` - Vista del catálogo
6. `public/js/horario.js` - Horario dinámico
7. `public/js/valoracion.js` - Valoraciones
8. `public/js/almacen.js` - Abstracción localStorage/sessionStorage

**Vista Cliente Actual:**
- Rutas: `#inicio`, `#productos`, `#contacto`
- Sistema de navegación por hash
- Carrito funcional con pago por WhatsApp y tarjeta
- Catálogo con filtros

---

## REQUISITO PRINCIPAL

Crea una **vista de administrador completa** (`#admin`) con CRUD para gestionar todos los módulos del proyecto. La vista debe:

1. **Ser completamente separada de la vista cliente** (no romper nada existente)
2. **Tener una interfaz sencilla e intuitiva** (mobile-first, accesible)
3. **Incluir sistema de configuración avanzada** (omitir campos, límites, validaciones)
4. **Validar imágenes** (solo webp, png, jpg)
5. **Usar localStorage para persistencia** (datos del admin, no del cliente)
6. **Ser accesible y responsive**

---

## PASOS DETALLADOS DE IMPLEMENTACIÓN

### Paso 1: Análisis de la Arquitectura Existente

**ANTES de escribir cualquier código:**

1. Lee completamente los archivos:
   - `public/js/data.js` - Entiende la estructura de datos del negocio
   - `public/js/catalogo.js` - Entiende departamentos, subcategorías, productos
   - `public/js/almacen.js` - Entiende el patrón de almacenamiento
   - `public/js/main.js` - Entiende cómo se renderizan las vistas

2. Identifica:
   - Qué datos son editables (productos, configuración, horario, etc.)
   - Qué datos son de solo lectura (año de fundación, etc.)
   - Cómo se estructuran los arrays (departamentos, productos, etc.)
   - Dónde se podrían agregar validaciones

3. **DOCUMENTA tu análisis en un comentario al inicio del nuevo módulo.**

---

### Paso 2: Diseño de la Vista de Administrador

**Crea un nuevo archivo: `public/js/admin.js`**

Este módulo debe:

**Responsabilidades:**
- Gestionar la vista de administrador (`#admin`)
- Proporcionar CRUD para cada módulo
- Manejar configuración avanzada
- Validar imágenes y campos
- Persistir configuración del admin en localStorage

**Interfaz del módulo:**
```javascript
// exportar estas funciones
export function iniciarAdmin(contenedor)
export function mostrarAdmin()
export function ocultarAdmin()
export function esModoAdmin() // true si la URL es #admin
```

**Estructura de la vista admin:**
1. **Dashboard** - Resumen (total productos, pedidos, valoraciones)
2. **Catálogo** - CRUD de productos, departamentos, subcategorías
3. **Configuración** - Datos del negocio, horario, pago, marcas
4. **Pedidos** - Historial de pedidos (leer de localStorage del cliente)
5. **Ajustes** - Configuración de la vista admin (omitir campos, límites, etc.)

---

### Paso 3: Protección Básica de la Vista Admin

**AGREGA en `public/js/data.js`:**

```javascript
export const negocio = {
  // ... configuración existente ...
  
  admin: {
    habilitado: true, // false oculta completamente la vista admin
    pin: '', // PIN para acceder (opcional, vacío = sin protección)
    sessionTimeout: 30, // minutos de inactividad antes de cerrar sesión
  },
};
```

**IMPLEMENTA en `admin.js`:**
- Si hay PIN configurado, pedirlo antes de mostrar la vista
- Guardar sesión en sessionStorage
- Cerrar sesión automáticamente después del timeout
- Logout manual

---

### Paso 4: Estructura de la Vista Admin

**En `public/js/admin.js`, implementa:**

```javascript
const vistasAdmin = [
  { id: 'dashboard', etiqueta: 'Dashboard', icono: 'fa-solid fa-chart-line' },
  { id: 'catalogo', etiqueta: 'Catálogo', icono: 'fa-solid fa-boxes-stacked' },
  { id: 'configuracion', etiqueta: 'Configuración', icono: 'fa-solid fa-gear' },
  { id: 'pedidos', etiqueta: 'Pedidos', icono: 'fa-solid fa-receipt' },
  { id: 'ajustes', etiqueta: 'Ajustes', icono: 'fa-solid fa-sliders' },
];
```

**Layout:**
- Barra lateral de navegación (escritorio) / barra inferior (móvil)
- Contenido principal dinámico según la vista seleccionada
- Breadcrumb de navegación
- Búsqueda global (opcional)

---

### Paso 5: CRUD de Productos

**IMPLEMENTA en `admin.js`:**

**Listado de productos:**
- Tabla con: SKU, nombre, marca, precio, stock, departamento, subcategoría, destacado, verificado
- Filtros: por departamento, subcategoría, marca, destacado, verificado
- Búsqueda por nombre, SKU, marca
- Paginación (20 por página)
- Ordenamiento por: nombre, precio, stock, SKU

**Crear producto:**
- Formulario con todos los campos de `catalogo.js`:
  - SKU (auto-generado opcionalmente)
  - Nombre (requerido, máx 100 caracteres)
  - Marca (requerido, máx 50 caracteres)
  - Departamento (dropdown desde `departamentos`)
  - Subcategoría (dropdown según departamento)
  - Precio (requerido, número, ≥ 0)
  - Stock (requerido, número entero, ≥ 0)
  - Precio anterior (opcional, para descuento)
  - Promo (dropdown: 'remate', 'temporada', ninguno)
  - Descripción (opcional, máx 200 caracteres)
  - Imagen (file input, solo webp/png/jpg, máx 2MB)
  - Destacado (checkbox)
  - Verificado (checkbox)
  - Nuevo (checkbox)

**Editar producto:**
- Mismo formulario que crear, pre-llenado con datos actuales
- Opción de eliminar imagen existente

**Eliminar producto:**
- Confirmación con mensaje
- Verificar que no esté en ningún carrito activo (opcional)

**Validaciones:**
- SKU único
- Nombre no vacío
- Precio ≥ 0
- Stock ≥ 0 (entero)
- Imagen: solo webp, png, jpg, máx 2MB
- Campo descripción: máx 200 caracteres
- Campo nombre: máx 100 caracteres
- Campo marca: máx 50 caracteres

---

### Paso 6: CRUD de Departamentos y Subcategorías

**IMPLEMENTA en `admin.js`:**

**Departamentos:**
- Listado: id, nombre, icono, descripción, cantidad de subcategorías
- Crear: nombre, icono (dropdown de FontAwesome), descripción
- Editar: mismo formulario
- Eliminar: confirmar y eliminar también todas las subcategorías y productos

**Subcategorías:**
- Listado por departamento: id, nombre, icono, cantidad de productos
- Crear: seleccionar departamento, nombre, icono
- Editar: mismo formulario
- Eliminar: confirmar y eliminar también todos los productos

---

### Paso 7: Configuración del Negocio

**IMPLEMENTA en `admin.js`:**

**Secciones de configuración:**

1. **Información básica:**
   - Nombre (requerido, máx 100 caracteres)
   - Nombre corto (requerido, máx 50 caracteres)
   - Eslogan (opcional, máx 150 caracteres)
   - Año de fundación (requerido, número, 4 dígitos)
   - Logo (file input, solo webp/png/jpg, máx 5MB)

2. **Contacto:**
   - Dirección completa (calle, colonia, localidad, CP, ciudad, estado, país)
   - Teléfono (formato validado)
   - WhatsApp (formato validado)
   - Facebook (URL, validada)

3. **Horario:**
   - Zona horaria (dropdown: America/Mexico_City, etc.)
   - Bloques de horario (L-V, Sábado, Domingo)
   - Hora apertura y cierre (formato HH:MM)
   - Agregar/eliminar bloques

4. **Marcas:**
   - Marcas destacadas (Coflex, Fleximatic, Presto)
   - Líneas de producto
   - Agregar/eliminar marcas

5. **Pago:**
   - Habilitar/deshabilitar pago con tarjeta
   - Procesador (dropdown: demo, stripe, mercadopago, clip)
   - Clave pública (opcional)
   - Moneda (MXN, USD, etc.)
   - Impuesto (porcentaje, ej: 0.16)
   - Envío: habilitar/deshabilitar, costo base, gratis desde, zonas

6. **Valoración:**
   - Título, texto, etiquetas
   - Retraso en ms
   - Habilitar/deshabilitar

7. **Mensajes WhatsApp:**
   - Mensaje general
   - Mensaje de cotización

---

### Paso 8: Configuración Avanzada de la Vista Admin

**IMPLEMENTA en `admin.js`:**

**Ajustes del sistema admin:**

```javascript
const configAdmin = {
  // Campos a omitir en formularios
  camposOmitidos: {
    productos: ['campo_opcional_1', 'campo_opcional_2'],
    configuracion: ['campo_opcional_3'],
  },
  
  // Límites de caracteres
  limitesCaracteres: {
    nombreProducto: 100,
    descripcionProducto: 200,
    marca: 50,
    nombreNegocio: 100,
    eslogan: 150,
  },
  
  // Validaciones de imagen
  imagenes: {
    extensionesPermitidas: ['webp', 'png', 'jpg', 'jpeg'],
    tamanoMaximoMB: 2, // para productos
    tamanoMaximoLogoMB: 5, // para logo
    dimensionesMinimas: { ancho: 300, alto: 300 }, // px
    dimensionesMaximas: { ancho: 2000, alto: 2000 }, // px
  },
  
  // Paginación
  paginacion: {
    productosPorPagina: 20,
    pedidosPorPagina: 25,
  },
};
```

**Interfaz de ajustes:**
- Checkbox para cada campo que se puede omitir
- Inputs numéricos para límites de caracteres
- Selectores para extensiones de imagen
- Inputs para tamaños máximos
- Guardar en localStorage (`arcos-admin-config`)

---

### Paso 9: Historial de Pedidos

**IMPLEMENTA en `admin.js`:**

**Leer historial del cliente:**
- Usar `obtenerHistorial()` de `pago.js`
- Mostrar en tabla: referencia, fecha, total, método de pago, estado, entrega
- Filtros: por fecha, método de pago, estado
- Búsqueda por referencia
- Ver detalles del pedido (productos, cliente, dirección)

**Nota:** Como el sitio es estático, los pedidos solo se guardan en localStorage del cliente. Para una implementación real, necesitarías un backend.

---

### Paso 10: Modificación de `data.js`

**AGREGA configuración de admin:**

```javascript
export const negocio = {
  // ... configuración existente ...
  
  admin: {
    habilitado: true,
    pin: '', // PIN opcional
    sessionTimeout: 30, // minutos
  },
};
```

**NO modifies los datos existentes del negocio.** Solo agrega la configuración de admin.

---

### Paso 11: Modificación de `main.js`

**AGREGA soporte para vista admin:**

1. **Agrega vista admin a `negocio.vistas`:**
```javascript
vistas: [
  { id: 'inicio', etiqueta: 'Inicio', icono: 'fa-solid fa-house', titulo: 'Inicio' },
  { id: 'productos', etiqueta: 'Productos', icono: 'fa-solid fa-boxes-stacked', titulo: 'Productos y catálogo' },
  { id: 'contacto', etiqueta: 'Contacto', icono: 'fa-solid fa-location-dot', titulo: 'Ubicación y contacto' },
  // Solo visible si negocio.admin.habilitado === true
  ...(negocio.admin.habilitado ? [{ id: 'admin', etiqueta: 'Admin', icono: 'fa-solid fa-lock', titulo: 'Panel de administración' }] : []),
],
```

2. **En la función `iniciar()`:**
```javascript
import { iniciarAdmin } from './admin.js';

if (negocio.admin.habilitado) {
  iniciarAdmin($('#admin-contenedor'));
}
```

3. **En la navegación por hash:**
```javascript
if (vistaDesdeHash() === 'admin' && negocio.admin.habilitado) {
  // mostrar vista admin
}
```

---

### Paso 12: Modificación de `index.html`

**AGREGA contenedor para la vista admin:**

```html
<!-- Agrega esto antes de cerrar </body> -->
<div id="admin-contenedor"></div>
```

---

### Paso 13: Persistencia de Datos del Admin

**IMPLEMENTA en `admin.js`:**

**Guardar cambios:**
- Los cambios en productos, configuración, etc. deben guardarse en localStorage
- Clave: `arcos-admin-datos`
- Estructura:
```javascript
{
  productos: [...], // productos modificados
  departamentos: [...], // departamentos modificados
  configuracion: {...}, // configuración modificada
  ultimaModificacion: timestamp,
}
```

**Sincronización con cliente:**
- Al guardar cambios en admin, actualizar los módulos correspondientes
- Opción de "Exportar configuración" (JSON)
- Opción de "Importar configuración" (JSON)
- Opción de "Restaurar valores por defecto"

---

### Paso 14: Validaciones de Imagen

**IMPLEMENTA en `admin.js`:**

```javascript
function validarImagen(archivo, config) {
  const extension = archivo.name.split('.').pop().toLowerCase();
  const tamanobytes = archivo.size;
  const tamanomb = tamanobytes / (1024 * 1024);
  
  // Validar extensión
  if (!config.imagenes.extensionesPermitidas.includes(extension)) {
    return { valido: false, error: `Solo se permiten: ${config.imagenes.extensionesPermitidas.join(', ')}` };
  }
  
  // Validar tamaño
  if (tamanomb > config.imagenes.tamanoMaximoMB) {
    return { valido: false, error: `Máximo ${config.imagenes.tamanoMaximoMB}MB` };
  }
  
  // Validar dimensiones (requiere leer el archivo)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { ancho, alto } = config.imagenes.dimensionesMinimas;
      const { ancho: maxAncho, alto: maxAlto } = config.imagenes.dimensionesMaximas;
      
      if (img.width < ancho || img.height < alto) {
        resolve({ valido: false, error: `Mínimo ${ancho}x${alto}px` });
      } else if (img.width > maxAncho || img.height > maxAlto) {
        resolve({ valido: false, error: `Máximo ${maxAncho}x${maxAlto}px` });
      } else {
        resolve({ valido: true });
      }
    };
    img.onerror = () => resolve({ valido: false, error: 'No se pudo leer la imagen' });
    img.src = URL.createObjectURL(archivo);
  });
}
```

---

### Paso 15: Modificación de `styles.css`

**AGREGA estilos para la vista admin:**

```css
/* Vista de administrador */
@layer components {
  .admin-layout {
    /* Layout de la vista admin */
  }
  
  .admin-sidebar {
    /* Barra lateral de navegación */
  }
  
  .admin-table {
    /* Tablas de listados */
  }
  
  .admin-form {
    /* Formularios de edición/creación */
  }
  
  .admin-card {
    /* Tarjetas de dashboard */
  }
  
  .file-input-preview {
    /* Vista previa de imagen */
  }
  
  .campo-omitido {
    /* Estilo para campos omitidos */
    display: none;
  }
}
```

---

### Paso 16: UX de la Vista Admin

**IMPLEMENTA en `admin.js`:**

**Características UX:**
- **Confirmaciones:** Antes de eliminar, mostrar modal de confirmación
- **Notificaciones:** Toast/snackbar al guardar cambios exitosamente
- **Loading states:** Spinner durante operaciones asíncronas
- **Undo:** Opción de deshacer cambios (opcional, guardando estado anterior)
- **Autoguardado:** Guardar automáticamente cada X minutos (opcional)
- **Validación en tiempo real:** Mostrar errores mientras se escribe
- **Ayuda contextual:** Tooltips explicando cada campo
- **Modo vista previa:** Ver cómo se ve en la vista cliente

---

### Paso 17: Pruebas y Verificación

**Después de implementar:**

1. **Verifica sintaxis:**
```bash
node --check public/js/admin.js
node --check public/js/data.js
node --check public/js/main.js
```

2. **Prueba funcional:**
   - Acceder a `#admin`
   - Navegar entre secciones (dashboard, catálogo, configuración, etc.)
   - Crear un producto nuevo
   - Editar un producto existente
   - Eliminar un producto
   - Cambiar configuración del negocio
   - Validar imagen (formato incorrecto, tamaño excedido)
   - Exportar/importar configuración

3. **Prueba que no rompa la vista cliente:**
   - Navegar a `#inicio`
   - Verificar que todo funciona normal
   - Agregar productos al carrito
   - Hacer un pedido
   - Verificar que los cambios del admin se reflejen

4. **Prueba accesibilidad:**
   - Navegación por teclado
   - Screen reader
   - Contrastes
   - Áreas táctiles en móvil

5. **Prueba persistencia:**
   - Hacer cambios en admin
   - Recargar página
   - Verificar que los cambios se mantengan
   - Limpiar localStorage
   - Verificar que se restaura a valores por defecto

---

## REGLAS CRÍTICAS

### ✅ LO QUE DEBES HACER

1. **NO romper la vista cliente:** La vista admin debe ser completamente separada
2. **INTEGRAR, no reescribir:** Modifica archivos existentes apropiadamente
3. **Respetar el estilo de código:** Usa las mismas convenciones (comentarios en español, formato, etc.)
4. **Mantener modularidad:** Cada función debe tener una responsabilidad clara
5. **Accesibilidad:** Asegura contrastes AA, ARIA labels, navegación por teclado
6. **Mobile-first:** La vista admin debe funcionar perfectamente en móvil
7. **Persistencia:** Usa localStorage para guardar datos del admin
8. **Validaciones:** Valida todos los campos, especialmente imágenes
9. **UX intuitiva:** La interfaz debe ser sencilla y fácil de usar
10. **Comentarios:** Documenta tu código en español

### ❌ LO QUE NO DEBES HACER

1. **NO reescribas archivos enteros:** Solo modifica las partes necesarias
2. **NO rompas funcionalidades existentes:** La vista cliente debe seguir funcionando
3. **NO uses frameworks:** Solo Vanilla JS ES6+
4. **NO agregues dependencias externas:** Sin npm, sin bundlers
5. **NO proceses imágenes en el servidor:** Solo validación en cliente
6. **NO guardes datos sensibles:** No guardes PINs ni contraseñas en texto plano
7. **NO ignore la accesibilidad:** Debe ser accesible
8. **NO omitas pruebas:** Verifica que todo funcione antes de terminar
9. **NO uses la misma localStorage para admin y cliente:** Usa claves diferentes
10. **NO hagas el admin público por defecto:** Debe estar protegido al menos con PIN

---

## CONSIDERACIONES DE SEGURIDAD

1. **PIN básico:** El PIN es una protección mínima, no segura. Para producción, usa autenticación real.
2. **No guardes datos sensibles:** No guardes PINs ni contraseñas en localStorage en texto plano.
3. **HTTPS obligatorio:** Para producción, usa HTTPS.
4. **Validación en servidor:** Para producción, valida también en backend.
5. **No confíes en localStorage:** Los datos pueden ser manipulados por el usuario. Para producción, usa un backend real.

---

## ENTREGABLES ESPERADOS

1. **Archivo nuevo:** `public/js/admin.js` (módulo de administración)
2. **Modificación:** `public/js/data.js` (configuración de admin)
3. **Modificación:** `public/js/main.js` (soporte para vista admin)
4. **Modificación:** `public/css/styles.css` (estilos de admin)
5. **Modificación:** `public/index.html` (contenedor de admin)

---

## VERIFICACIÓN FINAL

Antes de terminar, verifica:

- [ ] Todos los módulos pasan `node --check`
- [ ] La vista admin es accesible vía `#admin`
- [ ] La vista cliente sigue funcionando normal
- [ ] CRUD de productos funciona
- [ ] CRUD de departamentos/subcategorías funciona
- [ ] Configuración del negocio se puede editar
- [ ] Validaciones de imagen funcionan
- [ ] Configuración avanzada (omitir campos, límites) funciona
- [ ] Persistencia en localStorage funciona
- [ ] No hay errores en consola
- [ ] Funciona en móvil y escritorio
- [ ] El código está comentado en español
- [ ] La integración respeta la arquitectura existente

---

## DOCUMENTACIÓN

Al finalizar, agrega un comentario en `PENDIENTES.md`:

```markdown
### 2026-10-29 — Vista de administrador con CRUD

**Cambios**

1. **Nuevo módulo `public/js/admin.js`:**
   - Vista de administrador (`#admin`) con protección PIN
   - Dashboard con resumen
   - CRUD completo de productos, departamentos, subcategorías
   - Configuración del negocio (información, contacto, horario, marcas, pago, valoración)
   - Historial de pedidos (lectura desde localStorage del cliente)
   - Ajustes avanzados (omitir campos, límites de caracteres, validaciones de imagen)
   - Exportar/importar configuración (JSON)
   - Persistencia en localStorage (`arcos-admin-datos`)

2. **Modificación `public/js/data.js`:**
   - Agregada configuración `negocio.admin` (habilitado, PIN, timeout)

3. **Modificación `public/js/main.js`:**
   - Vista admin agregada a `negocio.vistas` (condicional)
   - Inicialización del módulo admin
   - Soporte para navegación a `#admin`

4. **Modificación `public/css/styles.css`:**
   - Estilos para layout admin, sidebar, tablas, formularios
   - Estilos para vista previa de imagen
   - Estilos para campos omitidos

5. **Modificación `public/index.html`:**
   - Contenedor `#admin-contenedor`

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/admin.js` | Nuevo: módulo de administración |
| `public/js/data.js` | Configuración de admin |
| `public/js/main.js` | Soporte para vista admin |
| `public/css/styles.css` | Estilos de admin |
| `public/index.html` | Contenedor de admin |

**Verificación**

- `node --check` sin errores en todos los módulos
- CRUD de productos probado
- CRUD de departamentos/subcategorías probado
- Configuración del negocio probada
- Validaciones de imagen probadas
- Vista cliente intacta
- Mobile-first verificado
```

---

## NOTA FINAL

Este es un proyecto de código abierto. Tu implementación debe:

1. Ser clara y mantenible
2. Seguir las convenciones del proyecto
3. Estar bien documentada
4. Ser accesible y mobile-first
5. No romper funcionalidades existentes
6. Ser intuitiva y fácil de usar

**La vista admin es para gestión interna, no para clientes.** Debe estar protegida al menos con PIN.

Para producción, considera:
- Autenticación real (JWT, OAuth, etc.)
- Backend real para persistencia de datos
- Validación en servidor
- HTTPS obligatorio
- Logs de auditoría

---

**Fin del prompt para Claude AI**
