/**
 * «Un solo momento animado por diapositiva» (A-54).
 *
 * Cada cosa que se anima en una diapositiva se anota aquí con una clave:
 *   - una <Entrada efecto="x" desde={n}>  →  «x@n» (y «x-sale@m» si tiene salida animada);
 *   - la transición propia de la diapositiva (Z-02, Z-10)  →  «transición»;
 *   - una animación propia (GSAP, rAF) que la pieza declare con useMomento('nombre', paso).
 * Varias piezas con el mismo efecto en el mismo paso (las letras de un
 * titular, las líneas de una consola) son UN momento. El mismo efecto en tres
 * pasos son tres momentos.
 *
 * En desarrollo, si una diapositiva pasa de uno, sale un aviso en la sala y en
 * el presentador. `excepcionA54: 'motivo'` en la diapositiva lo silencia (el
 * motivo queda en el código y en la consola). Contar por diapositiva o por
 * paso es una decisión pendiente (crítica C-09): hoy se cuenta por diapositiva.
 */
import { useLayoutEffect } from 'react';
import { useDiapositiva } from './contexto';
import { fijarProblema } from './diagnostico';

/** Rama diseno-wow: José anuló «un solo momento animado por diapositiva». */
const A54_ACTIVA = false;

const porDiapositiva = new Map<string, Set<string>>();
const excepciones = new Map<string, string>();
const oyentes = new Set<() => void>();

function revisar(id: string) {
  const claves = porDiapositiva.get(id);
  if (!claves) return;
  for (const oyente of oyentes) oyente();
  if (!import.meta.env.DEV) return;
  const lista = [...claves].sort();
  const excepcion = excepciones.get(id);
  if (lista.length <= 1) {
    fijarProblema(`momentos:${id}`, null);
    return;
  }
  if (excepcion) {
    fijarProblema(`momentos:${id}`, null);
    console.info(`[motor] «${id}» tiene ${lista.length} momentos animados (${lista.join(', ')}); excepción A-54: ${excepcion}`);
    return;
  }
  // Rama diseno-wow: la regla de un solo momento animado por diapositiva (A-54) queda anulada.
  if (!A54_ACTIVA) return;
  fijarProblema(
    `momentos:${id}`,
    `«${id}» tiene ${lista.length} momentos animados (${lista.join(', ')}). A-54 pide uno por diapositiva; si es a propósito, escribe el motivo en «excepcionA54».`,
  );
}

/** Anota un momento animado de una diapositiva. */
export function anotarMomento(idDiapositiva: string, clave: string) {
  if (!idDiapositiva) return;
  let claves = porDiapositiva.get(idDiapositiva);
  if (!claves) porDiapositiva.set(idDiapositiva, (claves = new Set()));
  if (claves.has(clave)) return;
  claves.add(clave);
  revisar(idDiapositiva);
}

/**
 * La diapositiva declara su excepción a A-54. La capa la llama al pintarse,
 * antes que los efectos de sus entradas: así el aviso no llega a salir. No
 * avisa a nadie en ese momento (se está pintando); si ya había momentos
 * anotados, la revisión va justo después.
 */
export function declararExcepcionA54(idDiapositiva: string, motivo: string | undefined) {
  if (!motivo || excepciones.get(idDiapositiva) === motivo) return;
  excepciones.set(idDiapositiva, motivo);
  if (porDiapositiva.has(idDiapositiva)) queueMicrotask(() => revisar(idDiapositiva));
}

/** Momentos anotados de una diapositiva (el laboratorio los enseña). */
export function momentosDe(idDiapositiva: string): string[] {
  return [...(porDiapositiva.get(idDiapositiva) ?? [])].sort();
}

export function suscribirMomentos(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/**
 * Para una animación propia que no es una <Entrada> (un tween de GSAP, un
 * requestAnimationFrame): la cuenta como momento de su diapositiva.
 */
export function useMomento(nombre: string, paso: number) {
  const { id } = useDiapositiva();
  useLayoutEffect(() => anotarMomento(id, `${nombre}@${paso}`), [id, nombre, paso]);
}
