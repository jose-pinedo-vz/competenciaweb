# Prompt para Claude AI - Visualizador de Colores para Pinturas

---

## Instrucciones para Claude AI

Este prompt está diseñado para que agregues una **funcionalidad de visualización de colores** para productos de pintura y objetos del hogar, tanto en la vista cliente como en la vista administradora.

---

## Contexto del Proyecto Actual

**Stack Tecnológico:**
- HTML5 + JavaScript ES6+ (módulos nativos)
- Tailwind CSS v4 por CDN
- Sin frameworks ni herramientas de compilación
- Sitio estático con vista de administrador

**Módulos Existentes:**
- `public/js/catalogo.js` - Catálogo de productos (departamentos, subcategorías, productos)
- `public/js/tienda.js` - Vista del catálogo cliente
- `public/js/admin.js` - Vista de administrador principal
- `public/js/admin-catalogo.js` - CRUD de productos en admin
- `public/js/admin-ui.js` - Componentes UI de admin

**Departamentos relevantes:**
- `construccion` → `pintura` - Pintura y accesorios
- `hogar` - Hogar, Jardín y Limpieza (objetos del hogar)

---

## REQUISITO PRINCIPAL

Agrega un **visualizador de colores interactivo** para productos de pintura y objetos del hogar que:

1. **En la vista cliente:** Muestra una representación gráfica de una habitación con el color del producto
2. **En la vista admin:** Permite agregar/editar el campo `colorHex` para productos de pintura/objeto del hogar
3. **Aplica solo a subcategorías específicas:** Pintura y ciertos objetos del hogar
4. **Es intuitivo y accesible:** Mobile-first, con opción de alternar habitaciones
5. **No rompe funcionalidades existentes:** Debe integrarse suavemente

---

## PASOS DETALLADOS DE IMPLEMENTACIÓN

### Paso 1: Análisis de la Arquitectura Existente

**ANTES de escribir cualquier código:**

1. Lee completamente los archivos:
   - `public/js/catalogo.js` - Entiende la estructura de productos
   - `public/js/tienda.js` - Entiende cómo se renderizan las tarjetas de productos
   - `public/js/admin-catalogo.js` - Entiende cómo se editan productos en admin
   - `public/js/admin-ui.js` - Entiende los componentes UI disponibles

2. Identifica:
   - Qué subcategorías aplican (pintura, herrajes, ventilación, etc.)
   - Cómo se renderiza actualmente la tarjeta de producto
   - Dónde agregar el campo `colorHex` en el formulario de admin
   - Cómo validar el formato hexadecimal del color

3. **DOCUMENTA tu análisis en un comentario al inicio del nuevo módulo.**

---

### Paso 2: Diseño del Visualizador de Colores

**Crea un nuevo archivo: `public/js/visualizador-color.js`**

Este módulo debe:

**Responsabilidades:**
- Renderizar una habitación 2D simplificada con el color del producto
- Permitir alternar entre diferentes tipos de habitación (sala, cocina, dormitorio, baño)
- Aplicar el color a diferentes superficies (paredes, techo, accesorios)
- Ser responsive y accesible

**Interfaz del módulo:**
```javascript
// exportar estas funciones
export function renderVisualizadorColor(contenedor, colorHex, opciones = {})
export function actualizarColor(colorHex)
export function cambiarHabitacion(tipoHabitacion)
export function toggleVisualizador() // mostrar/ocultar
```

**Tipos de habitación:**
- `sala` - Sala de estar (paredes principales)
- `cocina` - Cocina (paredes y gabinetes)
- `dormitorio` - Dormitorio (paredes y techo)
- `bano` - Baño (paredes y accesorios)

**Superficies a pintar:**
- Paredes (principal)
- Techo (opcional)
- Accesorios (marcos, puertas, etc. - para objetos del hogar)

---

### Paso 3: Modificación de `catalogo.js`

**AGREGA campo `colorHex` a los productos:**

En la documentación de `catalogo.js`, agrega:

```javascript
/**
 * - `colorHex` (opcional): código hexadecimal del color (ej: '#FF5733').
 *   Aplicable solo a productos de pintura y ciertos objetos del hogar.
 *   Si existe, activa el visualizador de colores en la tarjeta del producto.
 */
```

**NO agregues el campo a todos los productos existentes.** Solo se agregará vía admin cuando sea relevante.

---

### Paso 4: Modificación de `admin-catalogo.js`

**AGREGA campo `colorHex` al formulario de producto:**

1. **En la lista de campos omitibles (`CAMPOS_PRODUCTO_OMITIBLES`):**
```javascript
{ id: 'colorHex', etiqueta: 'Color hexadecimal (visualizador)' },
```

2. **En el formulario de crear/editar producto:**
   - Agregar campo de entrada para `colorHex`
   - Solo mostrar si el producto pertene a subcategorías aplicables
   - Incluir selector de color visual (input type="color")
   - Validar formato hexadecimal (#RRGGBB)

**Validación del campo:**
```javascript
function validarColorHex(valor) {
  if (!valor) return ''; // opcional
  if (!/^#[0-9A-Fa-f]{6}$/.test(valor)) {
    return 'Formato inválido. Usa #RRGGBB (ej: #FF5733).';
  }
  return '';
}
```

**Lógica para mostrar el campo:**
```javascript
const subcategoriasConColor = ['pintura', 'herrajes', 'ventilacion', 'jardin']; // configurable
const productoTieneColor = (sub) => subcategoriasConColor.includes(sub);
```

---

### Paso 5: Modificación de `tienda.js`

**AGREGA visualizador a la tarjeta de producto:**

1. **En la función que renderiza las tarjetas de producto:**
   - Verificar si el producto tiene `colorHex`
   - Si tiene, agregar botón/indicador "Ver color"
   - Al hacer clic, abrir el visualizador

2. **Integración con el visualizador:**
```javascript
import { renderVisualizadorColor } from './visualizador-color.js';

// En la tarjeta de producto:
if (p.colorHex) {
  // Agregar botón para ver el color
}
```

---

### Paso 6: Implementación del Visualizador de Colores

**En `public/js/visualizador-color.js`:**

**Estructura de la habitación 2D:**
- SVG o Canvas simple que representa una habitación
- Paredes como rectángulos rellenables
- Ventanas, puertas y accesorios como elementos decorativos
- Responsive: escala según el tamaño del contenedor

**Plantilla de habitación (SVG):**
```javascript
function plantillaHabitacion(tipo, colorHex) {
  // Diferentes layouts según tipo:
  // - sala: paredes principales, sofá, ventana
  // - cocina: paredes, gabinetes, estufa
  // - dormitorio: paredes, techo, cama
  // - baño: paredes, accesorios
}
```

**Actualización de color:**
```javascript
function aplicarColor(colorHex, tipoHabitacion) {
  // Actualizar fill de los elementos SVG correspondientes
  // Transición suave de color
}
```

**Controles del visualizador:**
- Selector de tipo de habitación (dropdown o botones)
- Indicador del color actual (swatch con código hex)
- Botón cerrar
- Opción de alternar entre modo pared/techo (si aplica)

---

### Paso 7: Modificación de `styles.css`

**AGREGA estilos para el visualizador:**

```css
/* Visualizador de colores */
@layer components {
  .visualizador-color {
    /* Contenedor principal */
  }
  
  .habitacion-svg {
    /* SVG de la habitación */
  }
  
  .habitacion-pared {
    /* Paredes de la habitación */
    transition: fill 0.3s ease;
  }
  
  .color-swatch {
    /* Indicador del color actual */
  }
  
  .selector-habitacion {
    /* Botones para cambiar tipo de habitación */
  }
}
```

---

### Paso 8: Integración en Vista Cliente

**En `public/js/tienda.js`:**

1. **Importar el visualizador:**
```javascript
import { renderVisualizadorColor } from './visualizador-color.js';
```

2. **Agregar contenedor en el modal de producto:**
   - Cuando se abre el modal de producto (si existe)
   - Agregar sección "Ver cómo se ve"
   - Mostrar el visualizador si el producto tiene `colorHex`

3. **Opción: Agregar botón en la tarjeta:**
   - Botón pequeño "🎨 Ver color" junto al precio
   - Al hacer clic, abrir modal con visualizador

---

### Paso 9: UX del Visualizador

**Características UX:**

1. **Indicador claro:**
   - Icono de paleta 🎨 en productos con color
   - Swatch del color en la tarjeta
   - Código hexadecimal visible

2. **Interacción intuitiva:**
   - Botones grandes para cambiar habitación (mobile-friendly)
   - Transiciones suaves de color
   - Cerrar con botón X o Escape

3. **Accesibilidad:**
   - ARIA labels para todos los controles
   - Navegación por teclado
   - Descripción del color para screen readers
   - Movimiento reducido: desactivar transiciones

4. **Responsive:**
   - SVG escala según contenedor
   - Botones reorganizados en móvil
   - Tamaños táctiles apropiados (44px+)

---

### Paso 10: Configuración en `data.js`

**AGREGA configuración del visualizador:**

```javascript
export const negocio = {
  // ... configuración existente ...
  
  visualizadorColor: {
    habilitado: true,
    subcategoriasAplicables: ['pintura', 'herrajes', 'ventilacion', 'jardin'],
    habitaciones: [
      { id: 'sala', nombre: 'Sala de estar', icono: 'fa-solid fa-couch' },
      { id: 'cocina', nombre: 'Cocina', icono: 'fa-solid fa-kitchen-set' },
      { id: 'dormitorio', nombre: 'Dormitorio', icono: 'fa-solid fa-bed' },
      { id: 'bano', nombre: 'Baño', icono: 'fa-solid fa-bath' },
    ],
    // Color por defecto si no se especifica
    colorPorDefecto: '#FFFFFF',
  },
};
```

---

### Paso 11: Modificación de `index.html`

**AGREGA contenedor para el visualizador:**

```html
<!-- Agrega esto antes de cerrar </body> -->
<div id="visualizador-color-contenedor"></div>
```

---

### Paso 12: Inicialización en `main.js`

**AGREGA inicialización del visualizador:**

```javascript
import { renderVisualizadorColor } from './visualizador-color.js';

// En la función iniciar():
if (negocio.visualizadorColor.habilitado) {
  renderVisualizadorColor($('#visualizador-color-contenedor'));
}
```

---

### Paso 13: Ejemplo de Implementación

**En `visualizador-color.js`:**

```javascript
export function renderVisualizadorColor(contenedor, colorHex, opciones = {}) {
  const { tipoHabitacion = 'sala' } = opciones;
  
  contenedor.innerHTML = `
    <div class="visualizador-color">
      <div class="selector-habitacion">
        ${negocio.visualizadorColor.habitaciones.map(h => `
          <button data-habitacion="${h.id}" 
                  class="${tipoHabitacion === h.id ? 'activo' : ''}">
            <i class="${h.icono}"></i> ${h.nombre}
          </button>
        `).join('')}
      </div>
      
      <div class="habitacion-container">
        <svg class="habitacion-svg" viewBox="0 0 400 300">
          <!-- Paredes -->
          <rect class="habitacion-pared" data-superficie="pared-izquierda" 
                x="0" y="0" width="20" height="300" fill="${colorHex}" />
          <rect class="habitacion-pared" data-superficie="pared-derecha" 
                x="380" y="0" width="20" height="300" fill="${colorHex}" />
          <rect class="habitacion-pared" data-superficie="pared-fondo" 
                x="0" y="0" width="400" height="20" fill="${colorHex}" />
          <!-- Accesorios según tipo de habitación -->
        </svg>
      </div>
      
      <div class="color-info">
        <div class="color-swatch" style="background: ${colorHex}"></div>
        <span class="color-hex">${colorHex}</span>
      </div>
      
      <button type="button" data-cerrar>Cerrar</button>
    </div>
  `;
  
  // Event listeners para cambiar habitación, cerrar, etc.
}
```

---

### Paso 14: Validaciones y Edge Cases

**Casos a considerar:**

1. **Producto sin color:**
   - No mostrar botón de visualizador
   - Si se intenta abrir, mostrar aviso

2. **Color inválido:**
   - Validar formato en admin
   - Si el color es inválido, usar color por defecto

3. **Contraste del color:**
   - Si el color es muy oscuro, el texto debe ser claro
   - Si el color es muy claro, el texto debe ser oscuro
   - Calcular contraste automáticamente

4. **Subcategorías no aplicables:**
   - Ocultar campo `colorHex` en admin
   - No mostrar visualizador en cliente

---

### Paso 15: Pruebas y Verificación

**Después de implementar:**

1. **Verifica sintaxis:**
```bash
node --check public/js/visualizador-color.js
node --check public/js/tienda.js
node --check public/js/admin-catalogo.js
```

2. **Prueba en vista admin:**
   - Crear producto de pintura con color hex
   - Editar producto existente agregando color
   - Verificar validación del formato hex
   - Cambiar tipo de habitación en visualizador

3. **Prueba en vista cliente:**
   - Ver producto con color en catálogo
   - Abrir visualizador
   - Cambiar entre tipos de habitación
   - Verificar que el color se aplique correctamente

4. **Prueba responsive:**
   - Visualizador en móvil
   - Visualizador en escritorio
   - Tamaños táctiles apropiados

5. **Prueba accesibilidad:**
   - Navegación por teclado
   - Screen reader
   - Contrastes

6. **Prueba que no rompa nada:**
   - Productos sin color siguen funcionando normal
   - Vista admin intacta
   - Carrito funcional

---

## REGLAS CRÍTICAS

### ✅ LO QUE DEBES HACER

1. **INTEGRAR, no reescribir:** Modifica archivos existentes apropiadamente
2. **Solo aplicar a subcategorías relevantes:** Pintura, herrajes, ventilación, jardín
3. **Respetar el estilo de código:** Comentarios en español, mismo formato
4. **Mobile-first:** Visualizador debe funcionar perfectamente en móvil
5. **Accesibilidad:** ARIA labels, navegación por teclado, contrastes
6. **Validar formato hex:** #RRGGBB, 6 caracteres hexadecimales
7. **UX intuitiva:** Fácil de entender y usar
8. **SVG/Canvas simple:** No usar librerías externas complejas
9. **Transiciones suaves:** Cambio de color con animación
10. **Comentarios:** Documenta tu código en español

### ❌ LO QUE NO DEBES HACER

1. **NO reescribas archivos enteros:** Solo modifica las partes necesarias
2. **NO agregues el campo a todos los productos:** Solo a los relevantes
3. **NO uses frameworks o librerías externas:** Solo Vanilla JS + SVG/Canvas nativo
4. **NO hagas el visualizador obligatorio:** El color es opcional
5. **NO ignores accesibilidad:** Debe ser accesible
6. **NO uses imágenes generadas:** Usa SVG/Canvas para la habitación
7. **NO guardes imágenes del visualizador:** Es dinámico, no persistente
8. **NO rompa funcionalidades existentes:** Vista cliente y admin intactas
9. **NO omitas validaciones:** El color debe ser válido
10. **NO hagas el SVG demasiado complejo:** Manténlo simple y escalable

---

## ESPECIFICACIONES ADICIONALES

### Departamentos y Subcategorías Aplicables

**Construcción → Pintura:**
- Pintura interior
- Pintura exterior
- Esmaltes
- Recubrimientos
- Barnices

**Hogar:**
- Herrajes para muebles (pueden tener color: negro, dorado, etc.)
- Ventilación (accesorios pueden tener color)
- Jardín (objetos decorativos pueden tener color)

**NO aplicar a:**
- Herramientas
- Plomería
- Cerrajería
- Seguridad
- Material eléctrico
- Adhesivos
- Impermeabilizantes (generalmente transparentes)

### Validación de Color Hex

**Formato aceptado:**
- #RRGGBB (6 caracteres hexadecimales)
- Ejemplos válidos: #FF5733, #00FF00, #FFFFFF
- Ejemplos inválidos: #F573, #GG5733, FF5733 (sin #)

**Validación en admin:**
```javascript
function validarColorHex(valor) {
  if (!valor) return ''; // opcional
  if (!/^#[0-9A-Fa-f]{6}$/.test(valor)) {
    return 'Usa el formato #RRGGBB (ej: #FF5733).';
  }
  return '';
}
```

### Tipos de Habitación

**Sala de estar:**
- Paredes principales
- Una ventana
- Marco de puerta

**Cocina:**
- Paredes
- Gabinetes (color opcional, diferenciado)
- Encimera

**Dormitorio:**
- Paredes
- Techo (color diferenciado opcional)
- Marco de ventana

**Baño:**
- Paredes
- Accesorios (marcos, espejos)

### Contraste Automático

**Calcular contraste del color:**
```javascript
function obtenerContrasteTexto(colorHex) {
  // Convertir hex a RGB
  const r = parseInt(colorHex.slice(1, 3), 16);
  const g = parseInt(colorHex.slice(3, 5), 16);
  const b = parseInt(colorHex.slice(5, 7), 16);
  
  // Calcular luminancia
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar 'texto-claro' o 'texto-oscuro'
  return luminancia > 0.5 ? 'texto-oscuro' : 'texto-claro';
}
```

---

## ENTREGABLES ESPERADOS

1. **Archivo nuevo:** `public/js/visualizador-color.js` (módulo del visualizador)
2. **Modificación:** `public/js/catalogo.js` (documentación del campo colorHex)
3. **Modificación:** `public/js/admin-catalogo.js` (campo colorHex en formulario)
4. **Modificación:** `public/js/tienda.js` (integración en tarjeta de producto)
5. **Modificación:** `public/js/data.js` (configuración del visualizador)
6. **Modificación:** `public/css/styles.css` (estilos del visualizador)
7. **Modificación:** `public/js/main.js` (inicialización)
8. **Modificación:** `public/index.html` (contenedor del visualizador)

---

## VERIFICACIÓN FINAL

Antes de terminar, verifica:

- [ ] Todos los módulos pasan `node --check`
- [ ] Campo `colorHex` se muestra solo en subcategorías aplicables
- [ ] Validación de formato hex funciona en admin
- [ ] Visualizador se abre en vista cliente
- [ ] Cambio de habitación funciona
- [ ] Color se aplica correctamente a la habitación
- [ ] Contraste de texto es apropiado
- [ ] Funciona en móvil y escritorio
- [ ] Accesible (teclado, screen reader)
- [ ] Productos sin color siguen funcionando normal
- [ ] Vista admin intacta
- [ ] Código comentado en español
- [ ] Integración respeta arquitectura existente

---

## DOCUMENTACIÓN

Al finalizar, agrega un comentario en `PENDIENTES.md`:

```markdown
### 2026-10-29 — Visualizador de colores para pinturas y objetos del hogar

**Cambios**

1. **Nuevo módulo `public/js/visualizador-color.js`:**
   - Renderizado de habitación 2D (SVG) con el color del producto
   - 4 tipos de habitación: sala, cocina, dormitorio, baño
   - Aplicación de color a paredes, techo y accesorios
   - Transiciones suaves de color
   - Contraste automático de texto
   - Responsive y accesible

2. **Modificación `public/js/catalogo.js`:**
   - Documentación del campo `colorHex` (opcional)
   - Aplicable solo a subcategorías de pintura y objetos del hogar

3. **Modificación `public/js/admin-catalogo.js`:**
   - Campo `colorHex` agregado a `CAMPOS_PRODUCTO_OMITIBLES`
   - Input de color (type="color") + input de texto hex
   - Validación de formato #RRGGBB
   - Solo visible para subcategorías aplicables

4. **Modificación `public/js/tienda.js`:**
   - Integración del visualizador en tarjeta de producto
   - Botón "🎨 Ver color" para productos con colorHex
   - Modal con visualizador al hacer clic

5. **Modificación `public/js/data.js`:**
   - Configuración `negocio.visualizadorColor`
   - Subcategorías aplicables
   - Tipos de habitación disponibles

6. **Modificación `public/css/styles.css`:**
   - Estilos para visualizador, habitación SVG, color swatch
   - Transiciones de color
   - Responsive layout

7. **Modificación `public/js/main.js`:**
   - Inicialización del visualizador

8. **Modificación `public/index.html`:**
   - Contenedor `#visualizador-color-contenedor`

**Archivos modificados**

| Archivo | Cambio |
|---|---|
| `public/js/visualizador-color.js` | Nuevo: módulo visualizador |
| `public/js/catalogo.js` | Documentación colorHex |
| `public/js/admin-catalogo.js` | Campo colorHex en formulario |
| `public/js/tienda.js` | Integración en tarjeta |
| `public/js/data.js` | Configuración visualizador |
| `public/css/styles.css` | Estilos visualizador |
| `public/js/main.js` | Inicialización |
| `public/index.html` | Contenedor visualizador |

**Verificación**

- `node --check` sin errores en todos los módulos
- Validación de color hex probada
- Visualizador funciona en sala, cocina, dormitorio, baño
- Responsive en móvil y escritorio
- Accesibilidad verificada
- Productos sin color intactos
```

---

## NOTA FINAL

Este es un proyecto de código abierto. Tu implementación debe:

1. Ser clara y mantenible
2. Seguir las convenciones del proyecto
3. Estar bien documentada
4. Ser accesible y mobile-first
5. No romper funcionalidades existentes
6. Ser intuitiva para el usuario final

**El visualizador es una herramienta de ayuda para el cliente:** no debe ser obligatorio ni intrusivo. Los productos sin color deben funcionar exactamente igual que antes.

Para mejoras futuras, considera:
- Más tipos de habitación
- Aplicar texturas a las paredes
- Comparar múltiples colores lado a lado
- Guardar preferencias de habitación del usuario

---

**Fin del prompt para Claude AI**
