/**
 * Z-05 · Medidas y tiempos del relevo, copiados de zhonyas-web y comprobados
 * con lo medido en vivo (03 M5; registro cuadro a cuadro en
 * C:/Users/joser/.claude/jobs/cc7e4a10/tmp/movimiento/s2/datos.json).
 * Todo en px del escenario de 1920 × 1080, que es donde se midió la web.
 */

export interface Caja {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Las tarjetas del equipo, de donde sale la foto (la web la hace volar desde
 * el rectángulo de la tarjeta pulsada, page.tsx:1078-1079; team-profile.tsx:98).
 *   - alto: clamp(22rem, 60vh, 38rem) = 608 (globals.css:311);
 *   - .team-shell de min(100 %, 1480 px) centrado entre los 115,2 px de
 *     .team-stage (globals.css:233 y 250-253): empieza en x = 220;
 *   - tres columnas con gap clamp(1rem, 1,75vw, 1,85rem) = 29,6 (globals.css:293-296):
 *     (1480 − 2 × 29,6) / 3 = 473,6 de ancho; lefts 220 · 723,2 · 1226,4;
 *   - top 310,25: el que midió la web (s2: «310.25px», el origen del vuelo de José).
 */
export const TARJETAS: readonly Caja[] = [
  { left: 220, top: 310.25, width: 473.6, height: 608 },
  { left: 723.2, top: 310.25, width: 473.6, height: 608 },
  { left: 1226.4, top: 310.25, width: 473.6, height: 608 },
];

/**
 * Destino del retrato (team-profile.tsx:34-36, 99):
 *   left = 8 % del ancho = 153,6; ancho = min(30 % del ancho, 440) = 440;
 *   alto = min(66 % del alto, 620) = 620; top = (1080 − 620) / 2 = 230.
 * Medido en la web al final: left 153.6px, top 230px, 440 × 620,
 * «scale(0.94) rotateY(12deg) rotateZ(-3deg)»; caja visible [128, 247, 476, 604].
 */
export const RETRATO: Caja = { left: 153.6, top: 230, width: 440, height: 620 };

/** team-profile.tsx:99: rotateY 12, rotateZ −3, scale .94 (motion los escribe en este orden). */
export const RETRATO_GIRO_FINAL = 'scale(0.94) rotateY(12deg) rotateZ(-3deg)';
/** team-profile.tsx:98: sale de la tarjeta con rotateY 0 y rotateZ 0; scale parte de 1 (no se declara). */
export const RETRATO_GIRO_INICIAL = 'scale(1) rotateY(0deg) rotateZ(0deg)';

/** La curva de la marca: [0.22, 1, 0.36, 1] (team-profile.tsx:101; 02 §5.12). */
export const CURVA_MARCA = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * La curva que motion pone cuando la transición da `duration` y no `ease`
 * (team-profile.tsx:92, 105 y 110): «easeOut» (motion-dom 12.43.0,
 * animation/interfaces/motion-value.mjs:27), que es cubicBezier(0, 0, 0.58, 1)
 * (motion-utils 12.43.0, easing/ease.mjs:4). La web usa la misma versión
 * (zhonyas-web/package-lock.json: motion 12.43.0). Comprobado contra la
 * medida: las opacidades del fondo, del texto y del avatar siguen esta curva
 * con un error cuadrático medio de 0,0003–0,0004 (la curva de la marca da 0,08–0,10).
 */
export const CURVA_MOTION_POR_DEFECTO = 'cubic-bezier(0, 0, 0.58, 1)';

export const TIEMPOS = {
  /** El retrato vuela: 0,7 s (team-profile.tsx:101). Medido: 100 % a los 733 ms del clic. */
  retrato: 700,
  /** El fondo tapa lo de atrás: 0,5 s (team-profile.tsx:92). Medido: 1 a los 533 ms. */
  fondo: 500,
  /** La columna de texto entra: 0,45 s (team-profile.tsx:105). Medido: de 199 a 683 ms. */
  texto: 450,
  /** …con 0,18 s de retraso (team-profile.tsx:105). */
  textoRetraso: 180,
  /** …desde 60 px a la derecha (team-profile.tsx:105: initial x: 60). */
  textoDesdeX: 60,
  /** El personaje aparece: 0,4 s (team-profile.tsx:110). Medido: de 533 a 900 ms. */
  avatar: 400,
  /** …con 0,5 s de retraso (team-profile.tsx:110). */
  avatarRetraso: 500,
  /** …subiendo 10 px (team-profile.tsx:109: initial y: 10). */
  avatarDesdeY: 10,
} as const;
