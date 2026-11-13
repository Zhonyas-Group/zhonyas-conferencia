/**
 * Contexto que el motor da a cada diapositiva y a sus piezas internas
 * (Entrada, Video, LienzoOGL…), para no pasar props de mano en mano.
 */
import { createContext, useContext, useMemo } from 'react';
import { esRevision, useMenosMovimiento } from './entorno';
import type { Direccion, ModoVista, RolCapa } from './tipos';

export interface DatosDiapositiva {
  id: string;
  indice: number;
  paso: number;
  pasos: number;
  activa: boolean;
  direccion: Direccion;
  modo: ModoVista;
  rol: RolCapa;
  /** Silenciar audio (la copia en vivo del presentador nunca suena). */
  silencio: boolean;
  /**
   * La diapositiva está en pantalla pero nadie la ve: la sala está en negro o
   * la cuadrícula la tapa. Lo que se mueve (video, WebGL, una animación en
   * bucle) se para y sigue desde el mismo punto al volver. A diferencia de
   * `activa`, no cambia al tapar y destapar: lo que se anima al entrar no se repite.
   */
  pausada: boolean;
}

export const ContextoDiapositiva = createContext<DatosDiapositiva>({
  id: '',
  indice: 0,
  paso: 0,
  pasos: 0,
  activa: false,
  direccion: 0,
  modo: 'vista',
  rol: 'fija',
  silencio: true,
  pausada: false,
});

/** Datos de la diapositiva que contiene al componente. */
export function useDiapositiva(): DatosDiapositiva {
  return useContext(ContextoDiapositiva);
}

/** Atajo: el paso actual de la diapositiva que contiene al componente. */
export function usePaso(): number {
  return useContext(ContextoDiapositiva).paso;
}

/**
 * Cuánto movimiento se permite ahora.
 * - `revision`: modo de capturas, todo debe quedar en su estado final al instante.
 * - `reducido`: el sistema pide menos movimiento; se permiten fundidos, no desplazamientos.
 * - `duracion(ms)`: la duración a usar en una animación propia (0 en revisión).
 */
export function useMovimiento() {
  const reducido = useMenosMovimiento();
  const { modo } = useContext(ContextoDiapositiva);
  const instantaneo = esRevision || modo === 'miniatura';
  // Memorizado: se puede poner en las dependencias de un efecto sin que se repita en cada render.
  return useMemo(
    () => ({
      revision: esRevision,
      reducido,
      instantaneo,
      duracion: (ms: number) => (instantaneo ? 0 : ms),
    }),
    [reducido, instantaneo],
  );
}
