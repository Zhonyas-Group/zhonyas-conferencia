/**
 * Composición 1 · A sangre (síntesis §4.3).
 *
 * La evidencia (una captura, una foto, un video) ocupa los 1920 × 1080 y el
 * titular va encima, en la zona del margen: x = 115, y = 115. Así trabajan las
 * keynotes medidas (05 §11.2). La fuente o el crédito, si va en pantalla, abajo
 * a la izquierda, también en el margen (115 px del borde: fuera del 10 % de
 * abajo que tapan las cabezas, A-30).
 *
 *   <ASangre
 *     titular="Una oración con verbo, de dos líneas como mucho"
 *     evidencia={<img src={medio('medios/cantus/acceso.webp')} alt="" />}
 *     fuente="Captura de Cantus, 12-nov-2026"
 *   />
 *
 * Contraste (A-36; crítica C-19): no hay degradado ni velo detrás del texto
 * (A-38 a A-42), así que la imagen tiene que ser oscura donde va el texto.
 * `posicion` (object-position) mueve la imagen y `anchoTitular` estrecha el
 * titular para lograrlo. En desarrollo,
 * si la evidencia es una <img>, se mide la imagen bajo cada línea del titular
 * y de la fuente y se avisa por debajo de 7:1 (revisar.ts).
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { revisarContraste } from './revisar';
import { Titular } from './Titular';
import './composiciones.css';

export interface PropsASangre {
  titular?: ReactNode;
  /** Segunda línea entera del titular, en lila. */
  segundaLinea?: ReactNode;
  /** La evidencia a pantalla completa: <img>, <video>, un <LienzoOGL>, una <Entrada>… */
  evidencia: ReactNode;
  /** Fuente o crédito a 32 px, abajo a la izquierda. */
  fuente?: ReactNode;
  /** object-fit de una <img> o <video>: «cover» (por defecto) llena la pantalla; «contain» la deja entera. */
  ajuste?: 'cover' | 'contain';
  /** object-position («50% 0%», «left top»…): qué parte de la imagen queda a la vista. */
  posicion?: string;
  /**
   * Ancho máximo del titular en px (por defecto, los 1690 del área útil). Para que
   * quede entero sobre la parte oscura de la captura: el titular se parte en dos
   * líneas equilibradas (text-wrap: balance) en vez de cruzar la imagen.
   */
  anchoTitular?: number;
  /** Más contenido encima (un <Detalle>, por ejemplo). */
  children?: ReactNode;
}

export function ASangre({ titular, segundaLinea, evidencia, fuente, ajuste = 'cover', posicion, anchoTitular, children }: PropsASangre) {
  const raiz = useRef<HTMLDivElement>(null);
  const { id, modo, rol, activa } = useDiapositiva();

  useEffect(() => {
    const el = raiz.current;
    if (!import.meta.env.DEV || modo !== 'escenario' || rol !== 'actual' || !activa || !el) return;
    const img = el.querySelector<HTMLImageElement>(':scope > .zh-comp-evidencia img');
    if (!img) return;
    const textos: [string, HTMLElement][] = [];
    const t = el.querySelector<HTMLElement>(':scope > .zh-titular');
    const f = el.querySelector<HTMLElement>(':scope > .zh-comp-fuente');
    if (t) textos.push(['titular', t]);
    if (f) textos.push(['fuente', f]);
    if (textos.length) void revisarContraste(img, textos, id);
  }, [id, modo, rol, activa, ajuste, posicion, anchoTitular]);

  const estilo = {
    '--zh-comp-ajuste': ajuste,
    ...(posicion ? { '--zh-comp-posicion': posicion } : {}),
  } as CSSProperties;

  return (
    <div ref={raiz} className="zh-a-sangre zh-comp-a-sangre" style={estilo}>
      <div className="zh-comp-evidencia">{evidencia}</div>
      {titular ? (
        <Titular segundaLinea={segundaLinea} style={anchoTitular ? { maxWidth: anchoTitular } : undefined}>
          {titular}
        </Titular>
      ) : null}
      {fuente ? <p className="zh-fuente zh-comp-fuente">{fuente}</p> : null}
      {children}
    </div>
  );
}
