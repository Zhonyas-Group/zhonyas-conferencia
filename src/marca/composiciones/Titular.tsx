/**
 * <Titular>: el titular-oración de una diapositiva (síntesis §4.2 y §4.3).
 *
 * Arial 700 a 96 px, interletrado −0,065 em, interlínea 1 y `text-wrap:
 * balance` (la clase .zh-titular de marca.css). Lo coloca la composición:
 * siempre empieza en x = 115, y = 115, alineado a la izquierda.
 *
 *   <Titular>Una oración con verbo, de dos líneas como mucho</Titular>
 *   <Titular segundaLinea="la segunda línea, entera">La primera línea</Titular>
 *
 * `segundaLinea` va en --zh-lila, la línea entera (A-47: nunca una palabra
 * suelta resaltada). En desarrollo avisa si pasa de 2 líneas (A-04) o si no
 * empieza en 115, 115 (revisar.ts).
 */
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { revisarTitular } from './revisar';

export interface PropsTitular {
  children: ReactNode;
  /** Segunda línea entera, en lila (síntesis §4.1). */
  segundaLinea?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Titular({ children, segundaLinea, className, style }: PropsTitular) {
  const ref = useRef<HTMLHeadingElement>(null);
  const { id, modo, rol, activa } = useDiapositiva();
  useLayoutEffect(() => {
    if (!import.meta.env.DEV || modo !== 'escenario' || rol !== 'actual' || !activa || !ref.current) return;
    revisarTitular(ref.current, id);
  });
  return (
    <h1 ref={ref} className={className ? `zh-titular zh-comp-titular ${className}` : 'zh-titular zh-comp-titular'} style={style}>
      {children}
      {segundaLinea ? <span className="zh-segunda-linea zh-comp-segunda-linea">{segundaLinea}</span> : null}
    </h1>
  );
}
