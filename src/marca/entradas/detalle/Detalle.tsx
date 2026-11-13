/**
 * <Detalle>: una capa a pantalla completa que se abre encima de la diapositiva
 * y se cierra al pasar de su último paso, como el diálogo de cada disciplina
 * de zhonyas.com (Z-08, detalle.entrada.ts). Para entrar en una captura o en
 * una demo y volver.
 *
 *   <Detalle desde={1} hasta={1}>
 *     <img className="zh-detalle__medio" src={medio('medios/lendex/calculadora.webp')} alt="" />
 *   </Detalle>
 *
 * Va la última dentro de la diapositiva, para quedar encima de todo.
 * Abrir y cerrar son dos momentos animados (A-54): la diapositiva lo declara
 * en `excepcionA54` («abre y cierra el mismo detalle»).
 *
 * El fondo es --zh-fondo (#010204). La web usa #030305 (globals.css:1386),
 * que no es un token de la charla (A-34).
 */
import type { CSSProperties, ReactNode } from 'react';
import { Entrada } from '../../../motor/Entrada';
import './detalle.css';

export interface PropsDetalle {
  /** Paso en el que se abre. */
  desde: number;
  /** Último paso abierto (opcional): al pasar de él se cierra, animado. */
  hasta?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Detalle({ desde, hasta, children, className, style }: PropsDetalle) {
  return (
    <Entrada
      desde={desde}
      hasta={hasta}
      efecto="detalle"
      className={className ? `zh-detalle ${className}` : 'zh-detalle'}
      style={style}
    >
      {children}
    </Entrada>
  );
}
