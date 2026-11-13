/**
 * Estado de la interfaz propio de cada ventana (no se sincroniza):
 * cuadrícula abierta, número que se está tecleando y ayuda. Lo que la sala
 * tiene abierto encima de la diapositiva sí se le cuenta al presentador
 * (capasSala.ts), porque lo ve el público.
 */
import { useSyncExternalStore } from 'react';

export interface EstadoInterfaz {
  cuadricula: boolean;
  /** Índice resaltado en la cuadrícula. */
  seleccion: number;
  /** Dígitos tecleados para saltar («12» + Intro). */
  numero: string;
  ayuda: boolean;
}

let interfaz: EstadoInterfaz = { cuadricula: false, seleccion: 0, numero: '', ayuda: false };
const oyentes = new Set<() => void>();

export function obtenerInterfaz() {
  return interfaz;
}

export function cambiarInterfaz(parcial: Partial<EstadoInterfaz>) {
  interfaz = { ...interfaz, ...parcial };
  for (const oyente of oyentes) oyente();
}

export function suscribirInterfaz(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useInterfaz(): EstadoInterfaz {
  return useSyncExternalStore(suscribirInterfaz, () => interfaz);
}
