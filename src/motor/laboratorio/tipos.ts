/**
 * Contrato de una pieza del laboratorio (archivos src/marca/**\/*.lab.tsx).
 *
 * Una pieza es una o varias escenas de 1920 × 1080 (las mismas definiciones
 * que usa el índice, o solo `{ id, pasos, Componente }`) que el laboratorio
 * monta en el escenario del motor, sin tocar el índice de diapositivas. Con
 * dos escenas se prueba una transición (la de la segunda, como en la charla).
 *
 * El id de la pieza es el nombre del archivo sin «.lab.tsx»:
 * src/marca/cifra/cifra.lab.tsx → lab.html?pieza=cifra.
 */
import type { ComponentType } from 'react';
import type { Diapositiva, PropsDiapositiva, Transicion } from '../tipos';

/** Lo mínimo de una diapositiva para montarla en el laboratorio. */
export interface EscenaLab {
  /** Id de la escena (sale en los avisos y en los momentos animados). */
  id: string;
  pasos: number;
  Componente: ComponentType<PropsDiapositiva>;
  transicion?: Transicion;
  fondo?: string;
  excepcionA54?: string;
}

export interface Pieza {
  /** Título para el índice del laboratorio («Z-01 · Cifra que entra»). */
  titulo: string;
  /** Id del catálogo de movimientos (síntesis §4.4): «Z-01»… */
  movimiento?: string;
  /** Qué mirar al revisarla y contra qué compararla (hoja de investigacion/movimiento/, archivo:línea). */
  notas?: string;
  /** Las escenas, en orden. Para una sola, basta con `pasos` y `Componente`. */
  escenas?: readonly (EscenaLab | Diapositiva)[];
  pasos?: number;
  Componente?: ComponentType<PropsDiapositiva>;
  transicion?: Transicion;
  fondo?: string;
}

/** Una pieza ya resuelta: su id y sus escenas. */
export interface PiezaCargada {
  id: string;
  archivo: string;
  titulo: string;
  movimiento?: string;
  notas?: string;
  escenas: readonly EscenaLab[];
}

/** Ayuda de tipos para el export por defecto de un .lab.tsx. */
export function definirPieza(pieza: Pieza): Pieza {
  return pieza;
}

/** Una posición de la pieza: escena y paso dentro de ella. */
export interface Posicion {
  escena: number;
  paso: number;
}

/** Todas las posiciones de la pieza en orden (los «pasos» del laboratorio). */
export function posicionesDe(pieza: PiezaCargada): Posicion[] {
  const lista: Posicion[] = [];
  pieza.escenas.forEach((e, escena) => {
    for (let paso = 0; paso <= Math.max(0, Math.floor(e.pasos)); paso++) lista.push({ escena, paso });
  });
  return lista;
}
