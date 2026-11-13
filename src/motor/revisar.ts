/**
 * Revisión de UNA definición de diapositiva (sin importar el índice, para que
 * el laboratorio la use también). La de toda la presentación está en validacion.ts.
 */
import { configuracion } from '../configuracion';
import type { Diapositiva, NotaPaso } from './tipos';

/** Palabras de un texto (una cifra como «41,9 %» cuenta como una). */
export function contarPalabras(texto: string): number {
  return texto.split(/\s+/).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

/** Límites de las notas por paso (05 §8.1; síntesis §1.3, fila 16). Solo avisan en desarrollo. */
const MAX_PALABRAS_DECIR = 40;
const MAX_PALABRAS_CLAVES = 4;

/**
 * Cuántos apoyos tienen las claves. El «Apoyo» del guion (docs/GUION.md,
 * Convenciones) son 3 o 4 apoyos separados por « · »; cada uno puede tener
 * varias palabras («diseño de producto · proyecto final · el problema, con
 * datos»). Sin «·», cuenta palabras.
 */
export function contarClaves(texto: string): number {
  if (!texto.includes('·')) return contarPalabras(texto);
  return texto.split('·').filter((trozo) => /[\p{L}\p{N}]/u.test(trozo)).length;
}

/** Comprueba una diapositiva y devuelve los avisos (sin registrarlos). */
export function revisarDiapositiva(d: Diapositiva, donde: string): string[] {
  const avisos: string[] = [];
  if (!Number.isInteger(d.pasos) || d.pasos < 0) avisos.push(`${donde}: «pasos» debe ser un entero ≥ 0.`);
  if (!(d.duracion > 0)) avisos.push(`${donde}: «duracion» debe ser mayor que 0 segundos.`);
  if (!(d.orador in configuracion.oradores)) avisos.push(`${donde}: el orador «${d.orador}» no está en configuracion.ts.`);
  if (typeof d.Componente !== 'function' && typeof d.Componente !== 'object') avisos.push(`${donde}: falta el componente.`);
  if (d.pesada && !d.poster)
    avisos.push(`${donde}: está marcada como pesada y no tiene «poster»; el presentador enseña un rótulo en su lugar.`);
  if (Array.isArray(d.notas)) {
    const notas = d.notas as readonly Partial<NotaPaso>[];
    const esperadas = Math.max(0, Math.floor(d.pasos)) + 1;
    if (notas.length !== esperadas)
      avisos.push(`${donde}: tiene ${notas.length} notas por paso y le tocan ${esperadas} (una por paso, del 0 al ${esperadas - 1}).`);
    notas.forEach((nota, i) => {
      if (!nota?.decir?.trim()) avisos.push(`${donde}, paso ${i}: la nota no tiene «decir».`);
      if (!nota?.claves?.trim()) avisos.push(`${donde}, paso ${i}: la nota no tiene «claves».`);
      if (import.meta.env.DEV) {
        const decir = contarPalabras(nota?.decir ?? '');
        const claves = contarClaves(nota?.claves ?? '');
        if (decir > MAX_PALABRAS_DECIR)
          avisos.push(`${donde}, paso ${i}: «decir» tiene ${decir} palabras (máximo ${MAX_PALABRAS_DECIR}).`);
        if (claves > MAX_PALABRAS_CLAVES)
          avisos.push(
            `${donde}, paso ${i}: «claves» tiene ${claves} ${nota?.claves?.includes('·') ? 'apoyos' : 'palabras'} (son 3 o 4).`,
          );
      }
    });
  }
  return avisos;
}
