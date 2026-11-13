/**
 * Composición 3 · Una cifra (síntesis §4.3).
 *
 * La cifra a 240 px (330 con `maxima`), alineada a la izquierda, y su fuente a
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
 * La fuente se escribe «fuente, fecha» con los campos del registro.
 *
 * Como mucho tres tamaños por diapositiva (A-49): titular, cifra y fuente, o
 * cifra, etiqueta y fuente. Con titular Y etiqueta serían cuatro: en
 * desarrollo sale un aviso.
 */
import { useLayoutEffect, type ReactNode } from 'react';
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
}

export function UnaCifra({ dato, desde, titular, segundaLinea, etiqueta, maxima }: PropsUnaCifra) {
  const { id } = useDiapositiva();
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
      <p className={maxima ? 'zh-cifra zh-cifra--maxima' : 'zh-cifra'}>
        <Dato id={dato} />
      </p>
      {etiqueta ? <p className="zh-lectura zh-comp-etiqueta">{etiqueta}</p> : null}
    </>
  );
  const fuente = (
    <p className="zh-fuente">
      <Dato id={dato} campo="fuente" />, <Dato id={dato} campo="fecha" />
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
