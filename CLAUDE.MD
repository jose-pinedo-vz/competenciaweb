# CLAUDE.md - Guía de desarrollo para Ferretería y Tlapalería Los Arcos

## Restricciones Operativas Absolutas
- Trabajar exclusivamente dentro de la carpeta del proyecto y la carpeta `public/`.
- NUNCA ejecutar comandos de despliegue como `firebase init`, `firebase login` ni `firebase deploy`. NUNCA instalar paquetes globales (el usuario se encarga del deploy).
- No añadir dependencias externas pesadas, frameworks (React, Vue) ni herramientas de compilación (Vite, Webpack). Todo es Vanilla JS ES6+ y Tailwind v4 por CDN.
- Hacer cambios pequeños con ediciones puntuales; no reescribir archivos enteros a menos que sea estrictamente necesario.
- Un cambio grande a la vez. Si algo es ambiguo, preguntar antes de construir.

## Normas de Calidad y Código
- Código limpio, modular, comentado en español. Separar datos (`data.js`), lógica/renderizado (`main.js`) y estilos (`styles.css`).
- Asegurar accesibilidad (contrastes AA, atributos alt, HTML semántico, áreas táctiles amplias para móviles) y diseño mobile-first impecable.
- Antes de dar una tarea por terminada: verificar sintaxis (`node --check`), comprobar que todos los enlaces y archivos referenciados existan, e informar al usuario qué cambió y cómo probarlo.