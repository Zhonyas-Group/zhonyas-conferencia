/**
 * La cinta suelta, quieta, bajo un titular (síntesis §4.3; A-41): la forma en
 * que termina Z-02, dibujada como la pinta la web al final de la escena.
 *
 *   <p className="zh-titular">…</p>
 *   <Cinta />                 630 px de ancho (síntesis §4.3), unos 74 px de alto
 *
 * - La forma es buildRibbonGeometry(1) (ribbonGeometry.ts, tal cual), recortada
 *   con un solo trazado y con los dos trazos del filo: el arreglo del PR #1
 *   (escena.ts, trazadoCintaTerminada).
 * - El relleno es el del logo: degradado firma y brillo (page.tsx:815-840), en
 *   las coordenadas del lienzo, así que la dirección del degradado no cambia
 *   (02 §4.5). Sin sombra ni veta: la web los quita mientras hay cinta
 *   (responsive.css:16-19).
 * - Proporción real: 8,55 : 1 con el filo (medidas.ts), no 7,45 : 1. A 630 px
 *   ocupa unos 630 × 74 = 46 600 px², el 2,2 % de 1920 × 1080 (A-41 pide ≤ 3 %).
 * - Nunca lleva texto encima (síntesis §4.1).
 */
import { useId, type CSSProperties } from 'react';
import { trazadoCintaTerminada } from './escena';
import { CAJA_CINTA_UNIDADES, FILO } from './medidas';
import { buildRibbonGeometry } from './ribbonGeometry';
import './cinta.css';

const TRAZADO = trazadoCintaTerminada(buildRibbonGeometry(1)) ?? '';
const VISTA = {
  x: CAJA_CINTA_UNIDADES.x - FILO,
  y: CAJA_CINTA_UNIDADES.y - FILO,
  ancho: CAJA_CINTA_UNIDADES.ancho + 2 * FILO,
  alto: CAJA_CINTA_UNIDADES.alto + 2 * FILO,
};

/** Alto que tiene la cinta a un ancho dado (con su proporción real). */
export function altoDeCinta(ancho: number): number {
  return (ancho * VISTA.alto) / VISTA.ancho;
}

export interface PropsCinta {
  /** Ancho en px del escenario. 630 por defecto (síntesis §4.3). */
  ancho?: number;
  className?: string;
  style?: CSSProperties;
}

export function Cinta({ ancho = 630, className, style }: PropsCinta) {
  const s = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const gradiente = `cinta-gradient-${s}`;
  const brillo = `cinta-shine-${s}`;
  const recorte = `cinta-clip-${s}`;
  return (
    <svg
      className={className ? `zh-cinta ${className}` : 'zh-cinta'}
      style={style}
      width={ancho}
      height={altoDeCinta(ancho)}
      viewBox={`${VISTA.x} ${VISTA.y} ${VISTA.ancho} ${VISTA.alto}`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* page.tsx:815-827 */}
        <linearGradient id={gradiente} x1="386" y1="700" x2="858" y2="398" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ef0bb4" />
          <stop offset="0.43" stopColor="#db33dc" />
          <stop offset="0.76" stopColor="#bc59ef" />
          <stop offset="1" stopColor="#a975ff" />
        </linearGradient>
        {/* page.tsx:829-840 */}
        <linearGradient id={brillo} x1="421" y1="420" x2="819" y2="699" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff79ec" stopOpacity="0.18" />
          <stop offset="0.48" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#7b48ff" stopOpacity="0.12" />
        </linearGradient>
        <clipPath id={recorte} clipPathUnits="userSpaceOnUse">
          <path d={TRAZADO} />
        </clipPath>
      </defs>
      {/* El filo de 2 unidades del trazo de la máscara (page.tsx:943-945), debajo del relleno (PR #1). */}
      <g fill="none" strokeWidth="2" strokeLinejoin="round">
        <path d={TRAZADO} stroke={`url(#${gradiente})`} />
        <path d={TRAZADO} stroke={`url(#${brillo})`} />
      </g>
      <g clipPath={`url(#${recorte})`}>
        <rect width="1254" height="1254" fill={`url(#${gradiente})`} />
        <rect width="1254" height="1254" fill={`url(#${brillo})`} />
      </g>
    </svg>
  );
}
