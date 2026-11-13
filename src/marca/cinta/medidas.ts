/**
 * Medidas de la cinta terminada, sacadas de su propia geometría
 * (buildRibbonGeometry(1), ribbonGeometry.ts) en vez de escritas a mano.
 *
 * Ojo: la cinta terminada mide 654,5 × 74,8 unidades (8,75 : 1). El «551 × 74
 * (7,45 : 1)» de la síntesis §4.3 y de 02 §5.2 es la constante de page.tsx:460,
 * que la web usa solo para calcular cuánto crece la cinta al expandirse; no es
 * el tamaño de lo que se dibuja. Lo medido en vivo (03 M2: «564×64 px» a 1080)
 * coincide con 654,5 × 74,8 unidades × 1080/1254.
 */
import { ANCHO_PANTALLA, ESCALA_LOGO, IZQUIERDA_LOGO } from './escena';
import { buildRibbonGeometry } from './ribbonGeometry';

export interface Caja {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

/** Caja de un trazado SVG de M, L, H, V, C y Z en coordenadas absolutas (las curvas se muestrean). */
export function cajaDeTrazado(d: string): Caja {
  const t = d.match(/[MLHVCZ]|-?\d+(?:\.\d+)?/g) ?? [];
  let i = 0;
  let x = 0;
  let y = 0;
  let inicioX = 0;
  let inicioY = 0;
  let orden = '';
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  const anotar = (px: number, py: number) => {
    minX = Math.min(minX, px);
    maxX = Math.max(maxX, px);
    minY = Math.min(minY, py);
    maxY = Math.max(maxY, py);
  };
  const n = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[A-Z]/.test(t[i])) orden = t[i++];
    if (orden === 'Z') {
      x = inicioX;
      y = inicioY;
      continue;
    }
    if (orden === 'M') {
      x = n();
      y = n();
      inicioX = x;
      inicioY = y;
      anotar(x, y);
      orden = 'L';
    } else if (orden === 'L') {
      x = n();
      y = n();
      anotar(x, y);
    } else if (orden === 'H') {
      x = n();
      anotar(x, y);
    } else if (orden === 'V') {
      y = n();
      anotar(x, y);
    } else if (orden === 'C') {
      const x1 = n(), y1 = n(), x2 = n(), y2 = n(), x3 = n(), y3 = n();
      for (let k = 0; k <= 64; k++) {
        const s = k / 64;
        const u = 1 - s;
        anotar(
          u * u * u * x + 3 * u * u * s * x1 + 3 * u * s * s * x2 + s * s * s * x3,
          u * u * u * y + 3 * u * u * s * y1 + 3 * u * s * s * y2 + s * s * s * y3,
        );
      }
      x = x3;
      y = y3;
    } else {
      i++; // orden desconocida: no debería pasar con los trazados de ribbonGeometry.ts
    }
  }
  return { x: minX, y: minY, ancho: maxX - minX, alto: maxY - minY };
}

const terminada = buildRibbonGeometry(1);
const base = cajaDeTrazado(terminada.basePath);
const punta = cajaDeTrazado(terminada.tipPath);

/** La cinta terminada en unidades del lienzo de 1254 (sin el filo de 1 unidad del trazo de la máscara). */
export const CAJA_CINTA_UNIDADES: Caja = (() => {
  const x = Math.min(base.x, punta.x);
  const y = Math.min(base.y, punta.y);
  return {
    x,
    y,
    ancho: Math.max(base.x + base.ancho, punta.x + punta.ancho) - x,
    alto: Math.max(base.y + base.alto, punta.y + punta.alto) - y,
  };
})();

/** El trazo blanco de 2 unidades de la máscara (page.tsx:943-945) añade 1 unidad por fuera. */
export const FILO = 1;

/**
 * Dónde queda la cinta al terminar Z-02, en píxeles del escenario de 1920 × 1080:
 * el lienzo de 1080 px centrado (x = 420) y corrido +17 vw = +326,4 px
 * (page.tsx:453). Sirve para colocar el texto alrededor (GUION, diapositiva 20:
 * «zhonyas.com» encima, alineado con su borde derecho). Unos 1093–1657 × 571–636.
 */
export const CAJA_CINTA_FINAL: Caja = {
  x: IZQUIERDA_LOGO + ANCHO_PANTALLA * 0.17 + (CAJA_CINTA_UNIDADES.x - FILO) * ESCALA_LOGO,
  y: (CAJA_CINTA_UNIDADES.y - FILO) * ESCALA_LOGO,
  ancho: (CAJA_CINTA_UNIDADES.ancho + 2 * FILO) * ESCALA_LOGO,
  alto: (CAJA_CINTA_UNIDADES.alto + 2 * FILO) * ESCALA_LOGO,
};
