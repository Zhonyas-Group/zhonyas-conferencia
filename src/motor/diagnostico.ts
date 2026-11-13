/**
 * Problemas detectados en tiempo de ejecución (una diapositiva que falla, un
 * medio que no se copió al USB, una definición incorrecta). El presentador los
 * muestra para que se vean ANTES de empezar la charla.
 *
 * No importa la lista de diapositivas (eso está en validacion.ts): así el
 * laboratorio y las piezas de marca pueden avisar sin arrastrar el índice.
 */
import { useSyncExternalStore } from 'react';

/** Problemas por clave: un aviso que cambia (p. ej. «3 momentos» → «4 momentos») no se duplica. */
const porClave = new Map<string, string>();
let problemas: readonly string[] = [];
const oyentes = new Set<() => void>();

function publicar() {
  problemas = [...porClave.values()];
  for (const oyente of oyentes) oyente();
}

export function registrarProblema(texto: string) {
  fijarProblema(texto, texto);
}

/** Pone (o cambia) el aviso de una clave; con `null` lo quita. */
export function fijarProblema(clave: string, texto: string | null) {
  const anterior = porClave.get(clave);
  if (texto === null) {
    if (anterior === undefined) return;
    porClave.delete(clave);
  } else {
    if (anterior === texto) return;
    porClave.set(clave, texto);
    console.warn(`[motor] ${texto}`);
  }
  publicar();
}

export function obtenerProblemas(): readonly string[] {
  return problemas;
}

export function useProblemas(): readonly string[] {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => problemas,
  );
}
