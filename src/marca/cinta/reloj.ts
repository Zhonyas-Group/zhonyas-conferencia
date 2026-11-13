/**
 * El reloj que mueve la escena del logo (Z-02) en lugar del scroll.
 *
 * En la web, el menú lleva la escena de un punto a otro con
 * `lenis.scrollTo(destino, { duration })`, y Lenis interpola así (Animate.advance):
 *   lineal = clamp(0, t / duración, 1)
 *   valor  = desde + (hasta − desde) · (lineal ≥ 1 ? 1 : easeOutExpo(lineal))
 * con la curva de components/smooth-scroll.tsx:6-7. Medido en vivo: el salto
 * del menú va al 42 % a +83 ms y al 76 % a +216 ms, como da la fórmula (03 M14).
 *
 * Aquí el «scroll» es directamente el progreso de la escena (0 = arriba,
 * FIN_CINTA_A_LA_DERECHA = la cinta en +17 vw, como en «Nosotros»), que es lo
 * que page.tsx calcula del scroll (page.tsx:216-217).
 */
import {
  FADE_PHASE_END,
  FIN_CINTA_A_LA_DERECHA,
  RIBBON_PHASE_END,
  TOTAL_SCROLL_DISTANCE,
} from './escena';

/** components/smooth-scroll.tsx:6-7 (la curva de Lenis en la web). */
export const easeOutExpo = (progress: number) =>
  Math.min(1, 1.001 - 2 ** (-10 * progress));

/**
 * - `logo-a-cinta`: del monograma a la cinta a la derecha (portada → «Nosotros»).
 * - `cinta-a-logo`: el camino de vuelta (la cinta se vuelve a enrollar en la Z
 *   y vuelven la H y el nombre).
 */
export type Sentido = 'logo-a-cinta' | 'cinta-a-logo';

/**
 * - `menu` (por defecto, la del guion): el salto del menú de la web, con su
 *   duración y su curva, hasta donde la cinta termina de correrse.
 *   Ida: «Nosotros», 1,2 s con easeOutExpo (navbar.tsx:49; smooth-scroll.tsx:6-7).
 *   Vuelta: «Inicio» (#top), 1,05 s con easeOutExpo (navbar.tsx:9, 76-81; 03 M14).
 *
 *   El destino NO es el del menú. En la web, «Nosotros» lleva a 0,42 × `#equipo`
 *   = 2288 px (escena.ts, DESTINO_MENU_WEB) y la cinta se queda en +181 px; el
 *   guion (20) pide la cinta en +17 vw, como «Nosotros» al bajar con la rueda
 *   (03-nosotros.png). Por eso el destino es FIN_CINTA_A_LA_DERECHA (2488 px).
 *   Revisión de fidelidad (13-nov, verificacion/fidelidad/cinta-menu.png): con el
 *   destino anterior (0,42 de la escena, 2995 px) todo lo visible acababa a los
 *   306 ms y la cinta se quedaba quieta 0,9 s; en la web en vivo la cinta sigue
 *   corriéndose hasta ~1,15 s. Con 2488 px, el fundido acaba a ~33 ms (web: 36),
 *   la Z empieza a ~52 ms (web: 58), termina a ~241 ms (web: 295) y la cinta se
 *   corre de ~302 ms (web: 395) a 1200 ms.
 * - `lento`: lo que ve quien baja con la rueda a ritmo fijo (03 M2, opción B):
 *   2488 px de scroll en 5957 ms (pasada 2), hasta donde la cinta termina de
 *   correrse, pasando por los ms medidos de cada fase (NUDOS_LENTO). Pendiente
 *   de que José elija (03 §6, pregunta 2).
 */
export type Ritmo = 'menu' | 'lento';

/**
 * ≈ 2488 px de scroll a 1080 de alto (1 svh = 10,8 px): el fin medido de «la
 * cinta va a la derecha» (03 M2) y el que dan page.tsx:28-29 y 377. Lo
 * comprueba la prueba de la pieza.
 */
export const PX_FIN_LENTO = FIN_CINTA_A_LA_DERECHA * TOTAL_SCROLL_DISTANCE * 10.8;

/**
 * Ritmo «lento», ida: en qué ms cruzó la web cada umbral de page.tsx con la
 * rueda a ritmo fijo (03 M2, tabla, pasada 2; medidas-escena.json, cinta.msARitmoFijo,
 * que se calculó con estos mismos umbrales exactos, an-s1.js). Entre dos nudos
 * el scroll avanza recto (ritmo fijo). Cada nudo cae donde lo que se ve está
 * quieto (fin del smoothstep del fundido, la pausa, inicio y fin de la quíntica,
 * inicio del smoothstep de la barra), así que el cambio de ritmo no se ve.
 *
 * Revisión de fidelidad (12-nov): con un solo tramo recto (0 → 2488 px en 5957 ms)
 * el fundido acababa a 1041 ms (web: 1158) y la Z empezaba a 1554 ms (web: 1641):
 * hasta 138 ms antes que la web, porque en la pasada medida el scroll fue más
 * lento mientras la sombra y la veta estaban puestas. Con los nudos, las seis
 * fronteras caen en su ms y lo que queda dentro de cada fase es el vaivén de la
 * propia pasada (≤ 75 ms).
 */
export const NUDOS_LENTO: ReadonlyArray<readonly [ms: number, progreso: number]> = [
  [0, 0],
  [74, FADE_PHASE_END * (2 / 38)], // fadeIni: 26 px (page.tsx:296-297)
  [1158, FADE_PHASE_END * (34 / 38)], // fadeFin: 435 px (page.tsx:296-297)
  [1641, FADE_PHASE_END + (RIBBON_PHASE_END - FADE_PHASE_END) * (8 / 77)], // morphIni: 649 px (page.tsx:303-309)
  [4492, FADE_PHASE_END + (RIBBON_PHASE_END - FADE_PHASE_END) * (68 / 77)], // morphFin: 1873 px (page.tsx:303-309)
  [4896, RIBBON_PHASE_END], // derechaIni: 2056 px (page.tsx:370-377)
  [5957, FIN_CINTA_A_LA_DERECHA], // derechaFin: 2488 px (page.tsx:377)
];

/** Progreso del ritmo «lento» a `ms` del disparo: tramos rectos entre NUDOS_LENTO. */
function progresoLento(ms: number): number {
  for (let i = 1; i < NUDOS_LENTO.length; i++) {
    const [b, pb] = NUDOS_LENTO[i];
    if (ms <= b) {
      const [a, pa] = NUDOS_LENTO[i - 1];
      return pa + ((pb - pa) * Math.max(0, ms - a)) / (b - a);
    }
  }
  return FIN_CINTA_A_LA_DERECHA;
}

export interface Recorrido {
  desde: number;
  hasta: number;
  /** ms */
  duracion: number;
  /** De lineal (0–1) a avance (0–1). */
  curva: (lineal: number) => number;
}

/** Duración, curva y extremos de cada combinación, con su fuente. */
export function recorrido(sentido: Sentido, ritmo: Ritmo): Recorrido {
  if (ritmo === 'lento') {
    // 03 M2, pasada 2: la cinta llega a +17 vw (PX_FIN_LENTO) a los 5957 ms.
    const duracion = 5957; // 03 M2 (ms a ritmo fijo, pasada 2)
    // Ida: por los ms medidos de cada fase (NUDOS_LENTO).
    const medida = (x: number) => progresoLento(x * duracion) / FIN_CINTA_A_LA_DERECHA;
    // Vuelta: la web no se midió subiendo con la rueda; ritmo fijo, un solo tramo recto (03 §0).
    const lineal = (x: number) => x;
    return sentido === 'logo-a-cinta'
      ? { desde: 0, hasta: FIN_CINTA_A_LA_DERECHA, duracion, curva: medida }
      : { desde: FIN_CINTA_A_LA_DERECHA, hasta: 0, duracion, curva: lineal };
  }
  // Lenis: la curva se aplica salvo en el último cuadro, que llega justo al destino.
  const lenis = (x: number) => (x >= 1 ? 1 : easeOutExpo(x));
  return sentido === 'logo-a-cinta'
    ? // navbar.tsx:41-52: lenis.scrollTo(destino, { duration: 1.2 }); destino: ver `Ritmo`
      { desde: 0, hasta: FIN_CINTA_A_LA_DERECHA, duracion: 1200, curva: lenis }
    : // navbar.tsx:76-81: «Inicio» → lenis.scrollTo(#top, { duration: 1.05 }), desde la cinta en +17 vw
      { desde: FIN_CINTA_A_LA_DERECHA, hasta: 0, duracion: 1050, curva: lenis };
}

/** Progreso de la escena a `ms` del disparo. */
export function progresoEn(r: Recorrido, ms: number): number {
  const lineal = Math.min(1, Math.max(0, ms / r.duracion));
  return r.desde + (r.hasta - r.desde) * r.curva(lineal);
}
