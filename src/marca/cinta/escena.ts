/**
 * La escena del logo de zhonyas.com (Z-02): las funciones de
 * zhonyas-web/app/page.tsx copiadas tal cual, con una sola diferencia: el
 * «progreso de la línea de tiempo» (timelineProgress) no sale del scroll,
 * sale de un reloj (reloj.ts), como hace el menú de la web al pulsar
 * «Nosotros» (navbar.tsx:41-52; 03 M2, opción A).
 *
 * Lo que no se porta de updateFromScroll (page.tsx:209-591), porque en la
 * charla no existe: el bloqueo de Nosotros (264-293; el menú también lo salta,
 * navbar.tsx:31), el carrusel del teléfono (221-251, 549-556), las opacidades
 * de «Nosotros» (384, 387-423) y del equipo (493-547), y la elevación de la
 * cinta en teléfonos verticales (466-468, siempre 0 en escritorio).
 *
 * Las medidas que la web toma del navegador (measureScene, page.tsx:132-195)
 * son constantes: el escenario mide siempre 1920 × 1080 (MOTOR §4.3).
 */
import { buildRibbonGeometry, type RibbonGeometry } from './ribbonGeometry';

// page.tsx:22-23
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

// ——— Fases de la escena, en fracción del recorrido (page.tsx:26-30) ———
export const TOTAL_SCROLL_DISTANCE = 660.385; // page.tsx:26 (svh)
export const FADE_PHASE_END = 45 / TOTAL_SCROLL_DISTANCE; // page.tsx:27
export const RIBBON_PHASE_END = 190.385 / TOTAL_SCROLL_DISTANCE; // page.tsx:28
export const ABOUT_PHASE_END = 290.385 / TOTAL_SCROLL_DISTANCE; // page.tsx:29
export const TEAM_PHASE_START = 460.385 / TOTAL_SCROLL_DISTANCE; // page.tsx:30

/**
 * ABOUT_SCROLL_RATIO de navbar.tsx:19. Ojo: el menú lo aplica a `#equipo`
 * (navbar.tsx:43-46), que es .team-entry-anchor (page.tsx:798-802) a
 * --team-entry-offset = 504,385 svh (globals.css:112), no al recorrido de la
 * escena (660,385 svh). Ver DESTINO_MENU_WEB.
 */
export const ABOUT_SCROLL_RATIO = 0.42;

/**
 * Adonde lleva de verdad el menú «Nosotros», en progreso de la escena:
 * 0,42 × 504,385 / 660,385 = 0,3208 (2288 px de scroll a 1080 de alto). Ahí la
 * cinta se queda a medio camino, en --logo-x = +181 px, no en +17 vw. Medido en
 * zhonyas.com el 13-nov (verificacion/fidelidad/cinta-menu.png): y final 2288,
 * --logo-x 181,179 px. La diapositiva no lo usa como destino (reloj.ts, ritmo «menu»).
 */
export const DESTINO_MENU_WEB = (ABOUT_SCROLL_RATIO * 504.385) / TOTAL_SCROLL_DISTANCE;

/**
 * Donde la cinta termina de correrse a la derecha: barReveal = aboutLinear / 0.4
 * llega a 1 (page.tsx:377). A 1080 de alto son 2488 px de scroll, el fin medido
 * de «la cinta va a la derecha» (03 M2). De aquí a 0,42 ya no cambia nada de lo
 * que pinta esta pieza.
 */
export const FIN_CINTA_A_LA_DERECHA = RIBBON_PHASE_END + (ABOUT_PHASE_END - RIBBON_PHASE_END) * 0.4;

// ——— Medidas de measureScene (page.tsx:132-195), fijas en el escenario ———
/** window.innerWidth en el escenario (page.tsx:173). */
export const ANCHO_PANTALLA = 1920;
/** window.innerHeight en el escenario (page.tsx:174). */
export const ALTO_PANTALLA = 1080;
/** El lienzo del logo: viewBox «0 0 1254 1254» (page.tsx:809). */
export const LIENZO = 1254;
/**
 * logo.clientWidth (page.tsx:167): .zhonyas-logo mide min(100vw, 100svh, 1254px)
 * (globals.css:179); a 1920 × 1080, 1080 px.
 */
export const ANCHO_LOGO = Math.min(ANCHO_PANTALLA, ALTO_PANTALLA, LIENZO);
/** logoBounds.left − stageBounds.left (page.tsx:168): .logo-stage centra el SVG (globals.css:149-158). */
export const IZQUIERDA_LOGO = (ANCHO_PANTALLA - ANCHO_LOGO) / 2;
/** Píxeles del escenario por unidad del lienzo. */
export const ESCALA_LOGO = ANCHO_LOGO / LIENZO;

/** Valores iniciales de la web antes de medir la cinta terminada (page.tsx:129-130). */
export const CENTRO_CINTA_INICIAL = 0.6224;
export const MEDIO_ANCHO_CINTA_INICIAL = 0.2608;

/** Lo que la escena pinta en un instante. */
export interface EstadoEscena {
  /** El mismo valor que la web escribe en --fade-opacity (page.tsx:299-300). */
  fadeOpacity: string;
  /** data-logo-morphing (page.tsx:252): con él, fuera la sombra y la veta (responsive.css:16-19). */
  morphing: boolean;
  /** Progreso de la Z → cinta, ya con la quíntica (page.tsx:310-312). */
  ribbonProgress: number;
  /** Desplazamiento a la derecha, ya con smoothstep (page.tsx:385-386). */
  barProgress: number;
  /** Vuelta al centro (page.tsx:434-436). En 0–0,42 vale 0. */
  recenter: number;
  /** Expansión de la cinta (page.tsx:440-443). En 0–0,42 vale 0. */
  expansion: number;
}

/** Las curvas de updateFromScroll aplicadas a un progreso (page.tsx:252, 296-312, 371-386, 425-443). */
export function estadoEscena(timelineProgress: number): EstadoEscena {
  // page.tsx:252 (con el bloqueo saltado, rawTimelineProgress = timelineProgress)
  const morphing = timelineProgress > FADE_PHASE_END;

  // page.tsx:295-299 · Primera fase: desvanecimiento de la H y del nombre (smoothstep).
  const fadeTimeline = clamp(timelineProgress / FADE_PHASE_END, 0, 1);
  const fadeLinear = clamp((fadeTimeline - 2 / 38) / (32 / 38), 0, 1);
  const fadeProgress = fadeLinear * fadeLinear * (3 - 2 * fadeLinear);
  const fadeOpacity = (1 - fadeProgress).toFixed(6);

  // page.tsx:302-312 · La Z se vuelve cinta (quíntica t³(t(6t−15)+10)).
  const ribbonTimeline = clamp(
    (timelineProgress - FADE_PHASE_END) /
      (RIBBON_PHASE_END - FADE_PHASE_END),
    0,
    1,
  );
  const ribbonLinear = clamp((ribbonTimeline - 8 / 77) / (60 / 77), 0, 1);
  const ribbonProgress =
    ribbonLinear ** 3 *
    (ribbonLinear * (ribbonLinear * 6 - 15) + 10);

  // page.tsx:370-377, 385-386 · La cinta va a la derecha (smoothstep).
  const aboutLinear = clamp(
    (timelineProgress - RIBBON_PHASE_END) /
      (ABOUT_PHASE_END - RIBBON_PHASE_END),
    0,
    1,
  );
  const barReveal = clamp(aboutLinear / 0.4, 0, 1);
  const barProgress =
    barReveal * barReveal * (3 - 2 * barReveal);

  // page.tsx:424-443 · Vuelta al centro y expansión (fuera del tramo 0–0,42, se portan por fidelidad).
  const teamTransitionLinear = clamp(
    (timelineProgress - ABOUT_PHASE_END) /
      (TEAM_PHASE_START - ABOUT_PHASE_END),
    0,
    1,
  );
  const recenterLinear = clamp(teamTransitionLinear / 0.26, 0, 1);
  const recenter =
    recenterLinear * recenterLinear * (3 - 2 * recenterLinear);
  const expansionLinear = clamp((teamTransitionLinear - 0.48) / 0.48, 0, 1);
  const expansion =
    expansionLinear ** 3 *
    (expansionLinear * (expansionLinear * 6 - 15) + 10);

  return { fadeOpacity, morphing, ribbonProgress, barProgress, recenter, expansion };
}

/**
 * El atributo transform del grupo del logo (page.tsx:445-492), con las medidas
 * fijas del escenario. `ribbonCenterRatio` es el que mide la web al terminar la
 * cinta (page.tsx:343-367); solo influye cuando la cinta vuelve al centro o se
 * expande, que en 0–0,42 no ocurre.
 */
export function transformLogo(estado: EstadoEscena, ribbonCenterRatio: number): string {
  const { barProgress, recenter, expansion } = estado;
  // page.tsx:445
  const logoWidth = ANCHO_LOGO;
  // page.tsx:449-450
  const ribbonCurrentCenterX = IZQUIERDA_LOGO + ribbonCenterRatio * logoWidth;
  // page.tsx:451-453: en escritorio, el 17 % del ancho de la pantalla (+326,4 px a 1920).
  const rightPosition = ANCHO_PANTALLA * 0.17;
  // page.tsx:456-459
  const centeredPosition = ANCHO_PANTALLA / 2 - ribbonCurrentCenterX;
  const aboutPosition = rightPosition * barProgress;
  const logoPosition = aboutPosition + (centeredPosition - aboutPosition) * recenter;
  // page.tsx:460-463
  const ribbonWidth = logoWidth * (551 / 1254);
  const ribbonHeight = logoWidth * (74 / 1254);
  const targetScaleX = Math.max(1, (ANCHO_PANTALLA / ribbonWidth) * 1.35);
  const targetScaleY = Math.max(1, (ALTO_PANTALLA / ribbonHeight) * 1.42);
  // page.tsx:466-468: ribbonLift solo existe en teléfonos verticales.
  const ribbonLift = 0;
  // page.tsx:488-492
  const originX = ribbonCenterRatio * 1254;
  return `translate(${logoPosition * 1254 / logoWidth} ${ribbonLift * 1254 / logoWidth}) translate(${originX} 700) scale(${1 + (targetScaleX - 1) * expansion} ${1 + (targetScaleY - 1) * expansion}) translate(${-originX} -700)`;
}

/** La geometría de la cinta para un progreso de la Z → cinta (ribbonGeometry.ts, tal cual). */
export function geometria(ribbonProgress: number): RibbonGeometry {
  return buildRibbonGeometry(ribbonProgress);
}

/**
 * Arreglo del PR #1 de zhonyas-web (commit 0cbe819, «Clip the finished ribbon
 * with one path instead of a mask»): cuando la Z termina de volverse cinta, la
 * forma es solo base y punta, sin recortes internos, y se recorta con UN
 * trazado (clip-path) en vez de la máscara, que Safari rasteriza por CPU (~12
 * fps en el iPhone; 08 §2, 25-sep). Mientras la forma cambia, se sigue usando
 * la máscara. Devuelve null si todavía no es la cinta terminada.
 */
export function trazadoCintaTerminada(g: RibbonGeometry): string | null {
  if (g.showOriginal || g.bodyPath || g.clipTip || !g.basePath || !g.tipPath) return null;
  return `${g.basePath} ${g.tipPath}`;
}
