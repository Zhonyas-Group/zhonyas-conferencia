/**
 * Datos generales de la presentación.
 *
 * Los oradores se declaran aquí una sola vez y cada diapositiva dice quién la
 * presenta con la clave (`orador: 'gregory'`). El presentador usa esto para
 * avisar de los cambios de orador. Reparto y duración: docs/GUION.md, «Encabezado».
 *
 * El mazo de prueba del motor tiene su propia configuración, con las mismas
 * claves (src/diapositivas/prueba/configuracion.ts).
 */
import { camara } from './marca/wow/transiciones';

export const configuracion = {
  /**
   * Fondo vivo y continuo debajo de todas las diapositivas (rama diseno-wow,
   * src/marca/wow/FondoVivo.tsx): nunca negro plano.
   */
  fondoVivo: true,
  /**
   * La transición de los cambios que no declaran la suya (rama diseno-wow):
   * la cámara que avanza (src/marca/wow/transiciones.ts). Ya no hay corte seco.
   */
  transicionPorDefecto: camara,
  /** Título de la ventana del navegador. */
  titulo: 'Zhonyas · Charla en el ITLA',
  /**
   * Duración objetivo de la charla, en minutos: 16 min 35 s, la suma de las 20
   * diapositivas del guion (995 s). Se puede cambiar en la ventana del presentador.
   */
  objetivoMinutos: 16 + 35 / 60,
  oradores: {
    /** 01–02 y 14–20 (480 s). */
    jose: { nombre: 'José Leonardo Reyes', color: '#7cc4ff' },
    /** 03–08 (280 s). */
    gregory: { nombre: 'Gregory Martínez', color: '#ffb86b' },
    /** 09–13 (235 s); además, el teclado en la demo de la 18. */
    angel: { nombre: 'Angel Grullon', color: '#9be28f' },
  },
} as const;

export type ClaveOrador = keyof typeof configuracion.oradores;

export function nombreOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.nombre ?? clave;
}

export function colorOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.color ?? '#ffffff';
}
