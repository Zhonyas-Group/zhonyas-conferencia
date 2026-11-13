/**
 * Transiciones entre diapositivas.
 *
 * Por defecto, CORTE SECO (Z-00): la diapositiva nueva sustituye a la otra en
 * el mismo cuadro, sin fundido. Solo las escenas de marca medidas (Z-02, la Z
 * que se vuelve cinta, y Z-10, el agujero negro) declaran la suya en
 * `transicion`, con sus valores copiados de zhonyas.com. La regla:
 *   - al avanzar de A a B se usa la de B,
 *   - al retroceder de B a A se usa también la de B, con `direccion = -1`,
 * es decir, la transición vive en el «borde» entre A y B y se reproduce al revés al volver.
 */
import type { ContextoTransicion, ResultadoTransicion, Transicion } from './tipos';

/**
 * Z-00 · Corte. Cambio total en ≤ 2 cuadros (≤ 0,07 s), sin fundido: así
 * cambia Figma Config 2025 de una función a otra, medido cuadro a cuadro
 * (05-oficio-conferencias.md:394; síntesis §4.4) y lo que pide A-53.
 * No anima nada: el motor enseña la capa nueva y quita la vieja.
 */
export const corte: Transicion = {};

/** Controlador uniforme sobre lo que devuelva una transición o una entrada. */
export interface Controlador {
  terminado: Promise<void>;
  /** Lleva la animación a su final (cuando el orador avanza a mitad de camino). */
  finalizar: () => void;
  /** Quita sus efectos (las animaciones vuelven al estado del CSS). */
  cancelar: () => void;
}

function esAnimacionWeb(x: unknown): x is Animation {
  return typeof Animation !== 'undefined' && x instanceof Animation;
}

function esLineaGsap(x: unknown): x is { progress: (v: number) => unknown; then: (fn: () => void) => unknown } {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as { progress?: unknown }).progress === 'function' &&
    typeof (x as { then?: unknown }).then === 'function'
  );
}

const NADA: Controlador = { terminado: Promise.resolve(), finalizar: () => {}, cancelar: () => {} };

export function controlar(resultado: ResultadoTransicion): Controlador {
  if (!resultado) return NADA;
  if (Array.isArray(resultado)) {
    const partes = resultado.map((r) => controlar(r));
    return {
      terminado: Promise.all(partes.map((p) => p.terminado)).then(() => undefined),
      finalizar: () => partes.forEach((p) => p.finalizar()),
      cancelar: () => partes.forEach((p) => p.cancelar()),
    };
  }
  if (esAnimacionWeb(resultado)) {
    return {
      terminado: resultado.finished.then(
        () => undefined,
        () => undefined,
      ),
      finalizar: () => {
        try {
          resultado.finish();
        } catch {
          /* ya cancelada o con duración infinita */
        }
      },
      cancelar: () => resultado.cancel(),
    };
  }
  if (esLineaGsap(resultado)) {
    return {
      terminado: new Promise<void>((resolver) => {
        resultado.then(() => resolver());
      }),
      finalizar: () => {
        resultado.progress(1);
      },
      cancelar: () => {
        (resultado as { kill?: () => void }).kill?.();
      },
    };
  }
  const promesa = resultado as Promise<unknown>;
  return {
    terminado: Promise.race([
      promesa.then(
        () => undefined,
        () => undefined,
      ),
      new Promise<void>((resolver) => window.setTimeout(resolver, 3000)),
    ]),
    finalizar: () => {},
    cancelar: () => {},
  };
}

/** Quita lo que una transición haya dejado en la capa (animaciones con fill y estilos en línea). */
export function limpiarCapa(capa: HTMLElement | null | undefined) {
  if (!capa) return;
  for (const animacion of capa.getAnimations()) animacion.cancel();
  capa.removeAttribute('style');
}

export function ejecutarTransicion(
  transicion: Transicion,
  entra: HTMLElement | null,
  sale: HTMLElement | null,
  ctx: ContextoTransicion,
): Controlador[] {
  const controladores: Controlador[] = [];
  try {
    if (entra && transicion.entrar) controladores.push(controlar(transicion.entrar(entra, ctx)));
    if (sale && transicion.salir) controladores.push(controlar(transicion.salir(sale, ctx)));
  } catch (error) {
    console.error('[motor] La transición falló; se salta.', error);
  }
  return controladores;
}
