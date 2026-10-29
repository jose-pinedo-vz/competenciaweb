import { negocio } from './data.js';

const { zonaHoraria, bloques } = negocio.horario;

const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIA_POR_ABREVIATURA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Minutos antes del cierre a partir de los cuales se avisa "Cierra pronto". */
const MINUTOS_AVISO_CIERRE = 30;

const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** '19:30' → '7:30 p. m.' (con espacios no separables para que no se parta en dos líneas) */
export const formatoHora = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}\u00a0${h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.'}`;
};

/** '13:30' → 'a la 1:30 p. m.'; '19:30' → 'a las 7:30 p. m.' */
const aLaHora = (hhmm) => `${Number(hhmm.split(':')[0]) % 12 === 1 ? 'a la' : 'a las'} ${formatoHora(hhmm)}`;

export const rangoHorario = ({ abre, cierra }) => `${formatoHora(abre)} – ${formatoHora(cierra)}`;

export const bloqueDelDia = (dia) => bloques.find((b) => b.dias.includes(dia));

/** Día de la semana y minuto del día en la zona horaria del negocio. */
function ahoraEnTienda(fecha) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  return { dia: DIA_POR_ABREVIATURA[valor('weekday')], minutos: Number(valor('hour')) * 60 + Number(valor('minute')) };
}

/**
 * Estado del negocio en un momento dado.
 * @returns {{ abierto: boolean, cierraPronto: boolean, dia: number, detalle: string }}
 */
export function estadoNegocio(fecha = new Date()) {
  const { dia, minutos } = ahoraEnTienda(fecha);
  const hoy = bloqueDelDia(dia);

  if (hoy && minutos >= aMinutos(hoy.abre) && minutos < aMinutos(hoy.cierra)) {
    const cierraPronto = aMinutos(hoy.cierra) - minutos <= MINUTOS_AVISO_CIERRE;
    return { abierto: true, cierraPronto, dia, detalle: `Cierra hoy ${aLaHora(hoy.cierra)}` };
  }

  if (hoy && minutos < aMinutos(hoy.abre)) {
    return { abierto: false, cierraPronto: false, dia, detalle: `Abre hoy ${aLaHora(hoy.abre)}` };
  }

  for (let salto = 1; salto <= 7; salto++) {
    const siguiente = (dia + salto) % 7;
    const bloque = bloqueDelDia(siguiente);
    if (bloque) {
      const cuando = salto === 1 ? 'mañana' : `el ${NOMBRES_DIA[siguiente]}`;
      return { abierto: false, cierraPronto: false, dia, detalle: `Abre ${cuando} ${aLaHora(bloque.abre)}` };
    }
  }

  return { abierto: false, cierraPronto: false, dia, detalle: '' };
}
