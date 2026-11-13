/**
 * Composición 3 · Una cifra (síntesis §4.3).
 *
 * La cifra a 300 px (la del guion; 330 con `maxima`), alineada a la izquierda, y su fuente a
 * 32 px abajo. Si hay titular, arriba (x = 115, y = 115) y la cifra en medio.
 * La cifra sale del registro de datos: se pasa su id, que tiene que estar
 * escrito tal cual en el archivo de la diapositiva (MOTOR §10.1).
 *
 *   <UnaCifra dato="mipymes-efectivo" desde={1} titular="…" etiqueta="…" />
 *
 * Con `desde`, la cifra, su etiqueta y su fuente entran juntas con Z-01
 * («cifra»): un solo momento animado, como «140B» y su etiqueta en Vercel,
 * que se funden a la vez (05-oficio-conferencias.md:390). Sin `desde`, todo
 * está desde el principio, sin animación.
 *
 * La fuente se escribe «fuente, fecha» con los campos del registro, o tal
 * cual la pide el guion con `fuente` (docs/GUION.md la da exacta en cada diapositiva).
 *
 * Como mucho tres tamaños por diapositiva (A-49): titular, cifra y fuente, o
 * cifra, etiqueta y fuente. Con titular Y etiqueta serían cuatro: en
 * desarrollo sale un aviso.
 *
 * La tinta de la cifra empieza en el margen, como la de la etiqueta y la fuente
 * (A-29: misma x, ±2 px; síntesis §4.3). A 300 px, el margen lateral del
 * primer glifo de Arial empujaba la tinta a la derecha: el «1» de «15.3 %»
 * empezaba en x 138 con la etiqueta en 117 (revisión del 13-nov). La cifra se
 * corre a la izquierda lo que mide ese margen (useTintaAlMargen).
 */
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from 'react';
import type { IdDato } from '../../datos';
import { useDiapositiva } from '../../motor/contexto';
import { Dato } from '../../motor/Dato';
import { fijarProblema } from '../../motor/diagnostico';
import { Entrada } from '../../motor/Entrada';
import { Titular } from './Titular';
import './composiciones.css';

export interface PropsUnaCifra {
  /** Id del registro de datos (src/datos.ts). */
  dato: IdDato;
  /** Paso en el que entra la cifra (Z-01). Sin él, está desde el principio. */
  desde?: number;
  titular?: ReactNode;
  /** Segunda línea entera del titular, en lila. */
  segundaLinea?: ReactNode;
  /** Texto corto junto a la cifra, a 60 px (lo escribe la diapositiva; el `texto` del registro es largo). */
  etiqueta?: ReactNode;
  /** La cifra a 330 px, el tope de la escala (síntesis §4.2). */
  maxima?: boolean;
  /** La línea de la fuente tal como la pide el guion. Sin ella, «fuente, fecha» del registro. */
  fuente?: ReactNode;
}

let lienzo: HTMLCanvasElement | null = null;
/** Lo que la tinta de la etiqueta (60 px) y de la fuente (32 px) queda dentro del margen de 115 px. */
const TINTA_DE_LA_LETRA = 2;

/**
 * Corre el elemento a la izquierda lo que mide el margen lateral izquierdo de
 * su primer glifo, menos TINTA_DE_LA_LETRA: así la tinta de la cifra empieza
 * donde la de la etiqueta y la fuente, unos 2 px dentro del margen (su propio
 * margen lateral, a 60 y a 32 px). Medido el 13-nov en las capturas: cifras,
 * etiquetas y fuentes de la 04, la 05, la 10, la 15 y la 16, todas en x 116–119.
 * Se mide con canvas (measureText, actualBoundingBoxLeft) con la letra que el
 * navegador le calculó, así vale para cualquier cifra y para Liberation Sans o
 * Arimo si la laptop no tiene Arial (§4.2). Se vuelve a medir cuando terminan
 * de cargar las letras. El interletrado no cambia el primer glifo.
 */
function useTintaAlMargen(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let vigente = true;
    const medir = () => {
      if (!vigente) return;
      const primero = Array.from((el.textContent ?? '').trimStart())[0];
      if (!primero) return;
      lienzo ??= document.createElement('canvas');
      const g = lienzo.getContext('2d');
      if (!g) return;
      const c = getComputedStyle(el);
      g.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize} ${c.fontFamily}`;
      // actualBoundingBoxLeft es positivo si la tinta sale a la izquierda del origen; negativo, si empieza a su derecha.
      const sangria = -g.measureText(primero).actualBoundingBoxLeft;
      const correr = sangria - TINTA_DE_LA_LETRA;
      el.style.marginLeft = correr > 0.5 ? `${(-correr).toFixed(1)}px` : '';
    };
    medir();
    void document.fonts?.ready.then(medir);
    return () => {
      vigente = false;
    };
  });
}

export function UnaCifra({ dato, desde, titular, segundaLinea, etiqueta, maxima, fuente: textoFuente }: PropsUnaCifra) {
  const { id } = useDiapositiva();
  const refCifra = useRef<HTMLParagraphElement>(null);
  useTintaAlMargen(refCifra);
  const cuatroTamanos = !!titular && !!etiqueta;
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    fijarProblema(
      `tamanos:${id}`,
      cuatroTamanos
        ? `«${id}»: titular, cifra, etiqueta y fuente son cuatro tamaños de letra; A-49 permite tres. Quita el titular o la etiqueta.`
        : null,
    );
  }, [id, cuatroTamanos]);
  const cifra = (
    <>
      <p ref={refCifra} className={maxima ? 'zh-cifra zh-cifra--maxima' : 'zh-cifra'}>
        <Dato id={dato} />
      </p>
      {etiqueta ? <p className="zh-lectura zh-comp-etiqueta">{etiqueta}</p> : null}
    </>
  );
  const fuente = (
    <p className="zh-fuente">
      {textoFuente ?? (
        <>
          <Dato id={dato} campo="fuente" />, <Dato id={dato} campo="fecha" />
        </>
      )}
    </p>
  );
  return (
    <div className="zh-reticula zh-una-cifra zh-comp-una-cifra">
      {titular ? <Titular segundaLinea={segundaLinea}>{titular}</Titular> : null}
      {desde === undefined ? (
        <div className="zh-comp-una-cifra__dato">{cifra}</div>
      ) : (
        <Entrada desde={desde} efecto="cifra" className="zh-comp-una-cifra__dato">
          {cifra}
        </Entrada>
      )}
      {desde === undefined ? (
        <div className="zh-comp-una-cifra__fuente">{fuente}</div>
      ) : (
        <Entrada desde={desde} efecto="cifra" className="zh-comp-una-cifra__fuente">
          {fuente}
        </Entrada>
      )}
    </div>
  );
}
