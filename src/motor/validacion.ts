/**
 * Revisión de las definiciones de todas las diapositivas al arrancar: ids
 * repetidos, pasos raros, oradores que no existen, notas por paso que no
 * cuadran, diapositivas pesadas sin póster (revisar.ts). Lo que encuentra va
 * a los avisos del presentador (y, en desarrollo, también a la sala).
 */
import { diapositivas } from '../diapositivas/indice';
import { registrarProblema } from './diagnostico';
import { revisarDiapositiva } from './revisar';

export function validarDiapositivas() {
  if (diapositivas.length === 0) registrarProblema('No hay diapositivas registradas en src/diapositivas/indice.ts.');
  const ids = new Set<string>();
  diapositivas.forEach((d, i) => {
    const donde = `Diapositiva ${i + 1} («${d.id || 'sin id'}»)`;
    if (!d.id) registrarProblema(`${donde}: falta el id.`);
    else if (ids.has(d.id)) registrarProblema(`${donde}: el id está repetido.`);
    ids.add(d.id);
    for (const aviso of revisarDiapositiva(d, donde)) registrarProblema(aviso);
  });
}
