# Prompt para Claude AI - Módulo de Pago con Tarjeta

---

## Instrucciones para Claude AI

Este prompt está diseñado para que integres un módulo completo de pago con tarjeta al sistema de carrito de compras existente del proyecto Ferretería Los Arcos.

---

## Contexto del Proyecto

**Stack Tecnológico:**
- HTML5 + JavaScript ES6+ (módulos nativos)
- Tailwind CSS v4 por CDN
- Sin frameworks ni herramientas de compilación
- Sitio estático (sin backend propio actual)

**Arquitectura Actual:**
- `public/js/carrito.js` - Sistema de carrito con persistencia en localStorage
- `public/js/data.js` - Datos del negocio (fuente única de verdad)
- `public/js/catalogo.js` - Catálogo de productos
- `public/js/tienda.js` - Vista del catálogo
- `public/js/almacen.js` - Abstracción localStorage/sessionStorage

**Sistema de Carrito Actual:**
- Agregar/quitar productos con validación de stock
- Panel lateral con lista de items
- Cálculo de total con IVA
- Envío del pedido por WhatsApp (único método de pago actual)
- Persistencia en localStorage (clave: `arcos-carrito`)

---

## REQUISITO PRINCIPAL

Debes **INTEGRAR** (no copiar/pegar) un módulo completo de pago con tarjeta al sistema de carrito existente. La integración debe:

1. **Respetar la arquitectura modular existente**
2. **Mantener compatibilidad con el sistema actual**
3. **Seguir las convenciones de código del proyecto**
4. **No romper funcionalidades existentes**
5. **Ser accesible y mobile-first**

---

## PASOS DETALLADOS DE IMPLEMENTACIÓN

### Paso 1: Análisis de la Arquitectura Existente

**ANTES de escribir cualquier código:**

1. Lee completamente el archivo `public/js/carrito.js` para entender:
   - Cómo funciona el sistema de carrito actual
   - Cómo se calcula el total
   - Cómo se maneja la persistencia
   - Cómo se genera el mensaje de WhatsApp

2. Lee el archivo `public/js/data.js` para entender:
   - La estructura de datos del negocio
   - Dónde se configura la información de contacto
   - El formato de los mensajes de WhatsApp

3. Lee el archivo `public/js/almacen.js` para entender:
   - Cómo se maneja localStorage/sessionStorage
   - El patrón de abstracción usado

4. Identifica los puntos de integración:
   - Dónde se muestra el botón "Enviar pedido por WhatsApp"
   - Dónde se calcula el total
   - Dónde se valida el stock
   - Dónde se renderiza el panel del carrito

**DOCUMENTA tu análisis en un comentario en el código antes de implementar.**

---

### Paso 2: Diseño del Módulo de Pago

**Crea un nuevo archivo: `public/js/pago.js`**

Este módulo debe:

**Responsabilidades:**
- Gestionar el formulario de pago con tarjeta
- Validar datos de tarjeta (básico, no procesar real)
- Simular procesamiento de pago
- Integrarse con el panel del carrito existente
- Guardar historial de pedidos (opcional)

**Interfaz del módulo:**
```javascript
// exportar estas funciones
export function iniciarPago(contenedor, onPagoExitoso, onPagoCancelado)
export function mostrarFormularioPago()
export function ocultarFormularioPago()
export function estadoFormularioPago() // 'oculto', 'visible', 'procesando', 'exitoso', 'error'
```

**Datos del formulario de pago:**
- Nombre del titular
- Número de tarjeta (formato básico)
- Fecha de expiración (MM/AA)
- CVV (3 dígitos)
- Dirección de envío (si aplica)
- Método de envío (recoger en tienda / envío a domicilio)

---

### Paso 3: Integración con `carrito.js`

**MODIFICA el archivo `public/js/carrito.js` existente:**

1. **Agrega import del módulo de pago:**
```javascript
import { iniciarPago, mostrarFormularioPago } from './pago.js';
```

2. **Modifica la función `renderPanel()` para agregar opción de pago:**
   - Agrega botón "Pagar con tarjeta" además de "Enviar por WhatsApp"
   - Muestra el total calculado
   - Permite alternar entre métodos de pago

3. **Modifica el mensaje de WhatsApp para incluir:**
   - Opción de pagar en tienda vs pagar en línea
   - Referencia del pedido (si se pagó en línea)

4. **Agrega callback para pago exitoso:**
   - Al completar el pago con tarjeta, vaciar el carrito
   - Mostrar confirmación
   - (Opcional) Guardar historial en localStorage

**NO reescribas todo el archivo. Solo MODIFICA las partes necesarias.**

---

### Paso 4: Modificación de `data.js`

**AGREGA configuración de pago en `public/js/data.js`:**

```javascript
export const negocio = {
  // ... configuración existente ...

  pago: {
    habilitado: true, // para activar/desactivar pago en línea
    metodos: ['whatsapp', 'tarjeta'], // métodos disponibles
    procesador: 'demo', // 'demo' para simulación, 'stripe', 'mercadopago', etc.
    configuracion: {
      // Claves de API (si applicable)
      public_key: '', // para Stripe, Mercado Pago, etc.
      moneda: 'MXN',
      impuesto: 0.16, // 16% IVA
    },
    envio: {
      disponible: true,
      costo: 150, // costo base de envío
      gratisMinimo: 1000, // envío gratis si el pedido supera este monto
      zonas: [
        { nombre: 'El Pitillal', costo: 0 }, // envío gratis en zona local
        { nombre: 'Puerto Vallarta', costo: 100 },
        { nombre: 'Zona turística', costo: 200 },
      ],
    },
  },
};
```

---

### Paso 5: Modificación de `styles.css`

**AGREGA estilos para el formulario de pago:**

```css
/* Formulario de pago */
@layer components {
  .formulario-pago {
    /* Estilos para campos de tarjeta */
  }

  .tarjeta-preview {
    /* Vista previa de la tarjeta */
  }

  .metodo-pago-activo {
    /* Indicador visual del método seleccionado */
  }

  .spinner-pago {
    /* Spinner de carga durante procesamiento */
  }
}
```

---

### Paso 6: Implementación del Formulario de Pago

**En `public/js/pago.js`:**

1. **Validación básica de tarjeta:**
   - Formato de número (Luhn algorithm opcional)
   - Fecha de expiración válida
   - CVV de 3-4 dígitos
   - Campos obligatorios

2. **Simulación de procesamiento:**
   - Mostrar spinner durante 2-3 segundos
   - Simular éxito/fallo (90% éxito)
   - Generar ID de transacción

3. **UX del formulario:**
   - Validación en tiempo real
   - Formateo automático de número de tarjeta (grupos de 4)
   - Formateo de fecha (MM/AA)
   - Mensajes de error claros
   - Accesibilidad (ARIA labels, navegación por teclado)

4. **Integración con carrito:**
   - Leer el total del carrito
   - Calcular costo de envío
   - Mostrar resumen antes de pagar
   - Al pagar exitosamente, llamar callback

---

### Paso 7: Modificación de `index.html`

**AGREGA contenedor para el formulario de pago:**

```html
<!-- Agrega esto antes de cerrar </body> -->
<div id="pago-contenedor"></div>
```

**MODIFICA `main.js` para inicializar el módulo de pago:**

```javascript
import { iniciarPago } from './pago.js';

// En la función iniciar():
iniciarPago($('#pago-contenedor'), () => {
  // callback pago exitoso
  lineas.clear();
  guardarYAvisar();
  mostrarConfirmacionPago();
});
```

---

### Paso 8: Modificación de la Vista del Carrito

**En `public/js/carrito.js`, modifica `renderPanel()`:**

1. **Agrega sección de métodos de pago:**
```html
<div class="metodos-pago">
  <button data-metodo="whatsapp" class="metodo-pago-boton activo">
    <i class="fa-brands fa-whatsapp"></i> Pagar por WhatsApp
  </button>
  <button data-metodo="tarjeta" class="metodo-pago-boton">
    <i class="fa-solid fa-credit-card"></i> Pagar con tarjeta
  </button>
</div>
```

2. **Al seleccionar "tarjeta", mostrar formulario:**
   - Ocultar botón de WhatsApp
   - Mostrar formulario de pago
   - Mantener total visible

3. **Al completar pago con tarjeta:**
   - Generar ID de pedido
   - Mostrar confirmación
   - Vaciar carrito
   - (Opcional) Enviar WhatsApp con confirmación

---

### Paso 9: Historial de Pedidos (Opcional)

**AGREGA funcionalidad para guardar historial:**

```javascript
// En un nuevo archivo o en pago.js
const CLAVE_HISTORIAL = 'arcos-pedidos';

function guardarPedido(pedido) {
  const historial = JSON.parse(almacen.leer(CLAVE_HISTORIAL) ?? '[]');
  historial.unshift(pedido);
  almacen.guardar(CLAVE_HISTORIAL, JSON.stringify(historial.slice(0, 50))); // Máximo 50
}

export function obtenerHistorial() {
  return JSON.parse(almacen.leer(CLAVE_HISTORIAL) ?? '[]');
}
```

---

### Paso 10: Pruebas y Verificación

**Después de implementar:**

1. **Verifica sintaxis:**
```bash
node --check public/js/pago.js
node --check public/js/carrito.js
node --check public/js/data.js
node --check public/js/main.js
```

2. **Prueba funcional:**
   - Agregar productos al carrito
   - Abrir carrito
   - Seleccionar "Pagar con tarjeta"
   - Llenar formulario
   - Completar pago
   - Verificar que el carrito se vacíe
   - Verificar que aparezca confirmación

3. **Prueba accesibilidad:**
   - Navegación por teclado
   - Screen reader
   - Contrastes
   - Áreas táctiles en móvil

4. **Prueba edge cases:**
   - Carrito vacío
   - Carrito con stock 0
   - Cancelar pago a mitad
   - Error en procesamiento
   - Recargar página después de pago

---

## REGLAS CRÍTICAS

### ✅ LO QUE DEBES HACER

1. **INTEGRAR, no copiar/pegar:** Modifica los archivos existentes apropiadamente, no reescribas todo.
2. **Respetar el estilo de código:** Usa las mismas convenciones (comentarios en español, formato, etc.).
3. **Mantener modularidad:** Cada función debe tener una responsabilidad clara.
4. **Accesibilidad:** Asegura contrastes AA, ARIA labels, navegación por teclado.
5. **Mobile-first:** El formulario debe funcionar perfectamente en móvil.
6. **Persistencia:** Usa el módulo `almacen.js` para localStorage/sessionStorage.
7. **Manejo de errores:** Usa try/catch apropiadamente.
8. **Comentarios:** Documenta tu código en español.

### ❌ LO QUE NO DEBES HACER

1. **NO reescribas archivos enteros:** Solo modifica las partes necesarias.
2. **NO copies código de otros proyectos sin adaptarlo:** Debe integrarse con la arquitectura existente.
3. **NO rompas funcionalidades existentes:** El pago por WhatsApp debe seguir funcionando.
4. **NO uses frameworks:** Solo Vanilla JS ES6+.
5. **NO agregues dependencias externas:** Sin npm, sin bundlers.
6. **NO proceses pagos reales:** Simula el procesamiento (modo demo).
7. **NO ignore la accesibilidad:** Debe ser accesible.
8. **NO omitas pruebas:** Verifica que todo funcione antes de terminar.

---

## CONSIDERACIONES DE SEGURIDAD

1. **Nunca guardes datos de tarjeta reales:** Solo simula el procesamiento.
2. **Nunca envíes datos de tarjeta en texto plano:** Para producción, usa un procesador real (Stripe, Mercado Pago).
3. **Valida en cliente y servidor:** Para producción, valida también en backend.
4. **Usa HTTPS obligatorio:** Para producción.
5. **No almacenes CVV:** Ni siquiera en modo demo.

---

## INTEGRACIÓN CON PROCESADORES REALES (FUTURO)

Para una implementación real con Stripe, Mercado Pago, etc.:

1. **Agregar configuración en `data.js`:**
```javascript
pago: {
  procesador: 'stripe', // o 'mercadopago', 'clip'
  configuracion: {
    public_key: 'pk_live_...', // clave pública
  },
}
```

2. **Crear módulo específico:**
```javascript
// public/js/pago-stripe.js
// public/js/pago-mercadopago.js
```

3. **Cargar según configuración:**
```javascript
const procesador = negocio.pago.procesador;
if (procesador === 'stripe') {
  // cargar stripe.js
}
```

**Nota:** Para este prompt, SOLO implementa modo demo/simulación.**

---

## ENTREGABLES ESPERADOS

1. **Archivo nuevo:** `public/js/pago.js` (módulo de pago)
2. **Modificación:** `public/js/carrito.js` (integración con pago)
3. **Modificación:** `public/js/data.js` (configuración de pago)
4. **Modificación:** `public/css/styles.css` (estilos de formulario)
5. **Modificación:** `public/js/main.js` (inicialización)
6. **Modificación:** `public/index.html` (contenedor de pago)

---

## VERIFICACIÓN FINAL

Antes de terminar, verifica:

- [ ] Todos los módulos pasan `node --check`
- [ ] El carrito funciona con ambos métodos (WhatsApp y tarjeta)
- [ ] El formulario de pago es accesible
- [ ] El pago se simula correctamente
- [ ] El carrito se vacía después del pago
- [ ] La confirmación se muestra apropiadamente
- [ ] No hay errores en consola
- [ ] Funciona en móvil y escritorio
- [ ] El código está comentado en español
- [ ] La integración respeta la arquitectura existente

---

## DOCUMENTACIÓN

Al finalizar, agrega un comentario en `PENDIENTES.md`:

```markdown
### 2026-10-29 — Módulo de pago con tarjeta

**Cambios**

1. **Nuevo módulo `public/js/pago.js`:**
   - Formulario de pago con tarjeta (simulación)
   - Validación de datos de tarjeta
   - Simulación de procesamiento
   - Integración con carrito existente

2. **Modificación `public/js/carrito.js`:**
   - Agregada opción de pago con tarjeta
   - Integración con módulo de pago
   - Callback para pago exitoso

3. **Modificación `public/js/data.js`:**
   - Agregada configuración `negocio.pago`
   - Configuración de métodos de pago
   - Configuración de envío

4. **Modificación `public/css/styles.css`:**
   - Estilos para formulario de pago
   - Vista previa de tarjeta
   - Indicadores de método activo

5. **Modificación `public/js/main.js`:**
   - Inicialización del módulo de pago

6. **Modificación `public/index.html`:**
   - Contenedor para formulario de pago

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/pago.js` | Nuevo: módulo de pago |
| `public/js/carrito.js` | Integración con pago |
| `public/js/data.js` | Configuración de pago |
| `public/css/styles.css` | Estilos de formulario |
| `public/js/main.js` | Inicialización |
| `public/index.html` | Contenedor de pago |

**Verificación**

- `node --check` sin errores en todos los módulos
- Pruebas funcionales completas
- Accesibilidad verificada
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

**NO proceses pagos reales. Solo simula el procesamiento.**

Para producción, integra con un procesador real (Stripe, Mercado Pago, Clip) siguiendo la documentación oficial de cada uno.

---

**Fin del prompt para Claude AI**
