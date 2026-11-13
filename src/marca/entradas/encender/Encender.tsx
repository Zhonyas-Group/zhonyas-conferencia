/**
 * <Encender>: una pieza (captura, portada, foto) que está apagada, en gris al
 * 65 % de brillo, hasta que el orador la nombra; entonces se enciende con el
 * efecto de las tarjetas de Proyectos de zhonyas.com (Z-07, encender.entrada.ts).
 *
 *   <Encender desde={1} hasta={1} texto="Lendex">
 *     <img src={medio('medios/lendex/portada.webp')} alt="Portada de Lendex" />
 *   </Encender>
 *
 * Para señalar una de varias, cada una con su paso: desde={1} hasta={1},
 * desde={2} hasta={2}… Con `hasta`, al pasar de su paso se vuelve a apagar,
 * al revés y con los mismos tiempos (como al salir el puntero en la web).
 * Cada encendido y cada apagado cuenta como un momento animado (A-54): la
 * diapositiva que los encadena lo declara en `excepcionA54`.
 *
 * Diferencia con la web: allí el texto va encima de la portada, sobre un
 * degradado oscuro (project-gallery.css:42). En la charla no hay degradado
 * detrás del texto (A-38 a A-42; reglas de la charla), así que el texto va
 * debajo del marco, a 40 px: la distancia del texto al borde del tile en la web
 * (clamp(1.25rem, 2.5vw, 2.5rem) a 1920 px, project-gallery.css:48).
 * Sin la flecha ↗ ni el rótulo «0N proyectos · Explorar» (A-61, A-31).
 */
import type { CSSProperties, ReactNode } from 'react';
import { Entrada } from '../../../motor/Entrada';
import './encender.css';

export interface PropsEncender {
  /** Paso en el que se enciende. */
  desde: number;
  /** Último paso encendida (opcional): después se apaga, animada. */
  hasta?: number;
  /** El medio: una <img>, un <video> o lo que sea. Se ajusta al marco (object-fit: cover). */
  children: ReactNode;
  /** Texto debajo del marco (por ejemplo, el nombre del producto). Sube 27,2 px al encenderse. */
  texto?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Encender({ desde, hasta, children, texto, className, style }: PropsEncender) {
  return (
    <Entrada
      desde={desde}
      hasta={hasta}
      efecto="encender"
      className={className ? `zh-encender ${className}` : 'zh-encender'}
      style={style}
    >
      <div className="zh-encender__marco">
        <div className="zh-encender__medio">{children}</div>
      </div>
      {texto ? <div className="zh-encender__texto">{texto}</div> : null}
    </Entrada>
  );
}
