/**
 * Problemas detectados en tiempo de ejecución (una diapositiva que falla, un
 * medio que no se copió al USB, una definición incorrecta). El presentador los
 * muestra para que se vean ANTES de empezar la charla.
 */
import { useSyncExternalStore } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { configuracion } from '../configuracion';

let problemas: readonly string[] = [];
const oyentes = new Set<() => void>();

export function registrarProblema(texto: string) {
  if (problemas.includes(texto)) return;
  problemas = [...problemas, texto];
  console.warn(`[motor] ${texto}`);
  for (const oyente of oyentes) oyente();
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

/** Revisa las definiciones de las diapositivas (ids repetidos, pasos raros, oradores que no existen). */
export function validarDiapositivas() {
  if (diapositivas.length === 0) registrarProblema('No hay diapositivas registradas en src/diapositivas/indice.ts.');
  const ids = new Set<string>();
  diapositivas.forEach((d, i) => {
    const donde = `Diapositiva ${i + 1} («${d.id || 'sin id'}»)`;
    if (!d.id) registrarProblema(`${donde}: falta el id.`);
    else if (ids.has(d.id)) registrarProblema(`${donde}: el id está repetido.`);
    ids.add(d.id);
    if (!Number.isInteger(d.pasos) || d.pasos < 0) registrarProblema(`${donde}: «pasos» debe ser un entero ≥ 0.`);
    if (!(d.duracion > 0)) registrarProblema(`${donde}: «duracion» debe ser mayor que 0 segundos.`);
    if (!(d.orador in configuracion.oradores)) registrarProblema(`${donde}: el orador «${d.orador}» no está en configuracion.ts.`);
    if (typeof d.Componente !== 'function' && typeof d.Componente !== 'object')
      registrarProblema(`${donde}: falta el componente.`);
  });
}
