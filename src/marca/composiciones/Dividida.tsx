/**
 * Composición 2 · Dividida 1,2 : 0,8 (síntesis §4.3).
 *
 * Texto a la izquierda y evidencia a la derecha, en las proporciones de la
 * tarjeta de Servicios de zhonyas.com (.capability-card y .capabilities-intro:
 * grid-template-columns 1.2fr 0.8fr, capabilities-section.css:5 y :12) con su
 * hueco de 3rem = 48 px (capabilities-section.css:5). En los 1690 px útiles:
 * 985 px de texto y 657 de evidencia.
 *
 *   <Dividida
 *     titular="Una oración con verbo, de dos líneas como mucho"
 *     evidencia={<Consola desde={1} comando="…" lineas={[…]} />}
 *   >
 *     <p className="zh-lectura">Texto de lectura, si hace falta</p>
 *   </Dividida>
 *
 * El titular arriba (x = 115, y = 115) y lo demás de la columna abajo, alineado
 * con el pie de la evidencia, como el resumen de .capabilities-intro
 * (align-items: end, capabilities-section.css:5). La evidencia, centrada en su
 * columna, como .capability-visual (display: grid; place-items: center,
 * capabilities-section.css:29).
 *
 * Ojo con A-24 (el protagonista ocupa ≥ 40 % del área útil, 574 600 px²): la
 * columna de la evidencia mide 657 × 850 = 558 450 px², el 38,9 %. Si la
 * evidencia es el protagonista, esta composición se queda corta; ver el informe.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Titular } from './Titular';
import './composiciones.css';

export interface PropsDividida {
  titular?: ReactNode;
  /** Segunda línea entera del titular, en lila. */
  segundaLinea?: ReactNode;
  /** La columna de 0,8: una captura, una <Consola>, una foto… */
  evidencia: ReactNode;
  /** object-fit de una <img> o <video> en la columna: «contain» (por defecto) o «cover». */
  ajuste?: 'cover' | 'contain';
  /** object-position de la <img> o el <video>. */
  posicion?: string;
  /** Lo que va en la columna del texto, debajo del titular (abajo del todo). */
  children?: ReactNode;
}

export function Dividida({ titular, segundaLinea, evidencia, ajuste = 'contain', posicion, children }: PropsDividida) {
  const estilo = {
    '--zh-comp-ajuste': ajuste,
    ...(posicion ? { '--zh-comp-posicion': posicion } : {}),
  } as CSSProperties;
  return (
    <div className="zh-reticula zh-dividida zh-comp-dividida" style={estilo}>
      <div className="zh-comp-dividida__texto">
        {titular ? <Titular segundaLinea={segundaLinea}>{titular}</Titular> : <span />}
        {children ? <div className="zh-comp-dividida__pie">{children}</div> : null}
      </div>
      <div className="zh-comp-dividida__evidencia">{evidencia}</div>
    </div>
  );
}
