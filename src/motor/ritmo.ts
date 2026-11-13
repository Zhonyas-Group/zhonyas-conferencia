/**
 * Cálculos del presentador: ritmo, siguiente vista y cambios de orador.
 */
import { diapositivas } from '../diapositivas/indice';
import type { ClaveOrador } from '../configuracion';
import { transcurrido, type EstadoCronometro } from './cronometro';
import { pasosDe, total, type EstadoNavegacion } from './estado';

/** Suma de las duraciones sugeridas, en segundos. */
export const duracionPlanificada = diapositivas.reduce((s, d) => s + d.duracion, 0);

/** Segundos planificados antes de empezar la diapositiva `indice`. */
export function inicioPlanificado(indice: number): number {
  let suma = 0;
  for (let i = 0; i < indice; i++) suma += diapositivas[i].duracion;
  return suma;
}

/**
 * Segundos que llevas en la diapositiva actual, medidos con el cronómetro de
 * la charla (no con el reloj): no cuenta la espera antes del primer avance ni
 * las pausas. Si el cronómetro se reinició estando en esta diapositiva, cuenta
 * desde ese momento.
 */
export function tiempoEnDiapositiva(nav: EstadoNavegacion, cron: EstadoCronometro, ahora: number): number {
  const total = transcurrido(cron, ahora);
  const marca = nav.epocaCrono === cron.epoca ? nav.cronoAlEntrar : 0;
  return Math.max(0, total - marca) / 1000;
}

/**
 * Desvío respecto a las duraciones sugeridas, en segundos.
 * Positivo = vas atrasado; negativo = vas adelantado; null = el cronómetro no ha empezado.
 *
 * Lo esperado ahora es: lo planificado hasta esta diapositiva + el tiempo que
 * llevas en ella (sin pasar de su duración sugerida). Quedarte de más en una
 * diapositiva te atrasa; pasar rápido te adelanta. Todo se mide con el
 * cronómetro, así que en pausa el ritmo queda congelado.
 */
export function desvio(nav: EstadoNavegacion, cron: EstadoCronometro, ahora: number): number | null {
  const total = transcurrido(cron, ahora) / 1000;
  if (total <= 0) return null;
  const enDiapositiva = Math.min(tiempoEnDiapositiva(nav, cron, ahora), total);
  const esperado = inicioPlanificado(nav.indice) + Math.min(enDiapositiva, diapositivas[nav.indice].duracion);
  return total - esperado;
}

export type Siguiente =
  | { tipo: 'encender'; indice: number; paso: number }
  | { tipo: 'cerrar-prueba'; indice: number; paso: number }
  | { tipo: 'paso'; indice: number; paso: number }
  | { tipo: 'diapositiva'; indice: number; paso: 0 }
  | { tipo: 'fin' };

/**
 * Qué se verá al pulsar «avanzar». Con la pantalla en negro, avanzar solo la
 * enciende: vuelve la diapositiva actual tal como estaba (y no hay relevo de
 * orador hasta el avance siguiente).
 */
export function siguienteVista(nav: EstadoNavegacion): Siguiente {
  if (nav.negro) return { tipo: 'encender', indice: nav.indice, paso: nav.paso };
  if (nav.prueba) return { tipo: 'cerrar-prueba', indice: nav.indice, paso: nav.paso };
  if (nav.paso < pasosDe(nav.indice)) return { tipo: 'paso', indice: nav.indice, paso: nav.paso + 1 };
  if (nav.indice < total - 1) return { tipo: 'diapositiva', indice: nav.indice + 1, paso: 0 };
  return { tipo: 'fin' };
}

/** Próxima diapositiva en la que cambia el orador (o null si nadie más habla). */
export function proximoCambioDeOrador(indice: number): { indice: number; orador: ClaveOrador } | null {
  const actual = diapositivas[indice]?.orador;
  for (let i = indice + 1; i < total; i++) {
    if (diapositivas[i].orador !== actual) return { indice: i, orador: diapositivas[i].orador };
  }
  return null;
}
