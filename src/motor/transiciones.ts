/**
 * Transiciones entre diapositivas.
 *
 * El motor solo trae una base sobria: la diapositiva que entra aparece con un
 * fundido corto encima de la que sale (fundido cruzado, sin bajón a negro).
 * Cada diapositiva puede declarar la suya en `transicion`; la regla es:
 *   - al avanzar de A a B se usa la de B,
 *   - al retroceder de B a A se usa también la de B, con `direccion = -1`,
 * es decir, la transición vive en el «borde» entre A y B y se reproduce al revés al volver.
 */
import type { ContextoTransicion, ResultadoTransicion, Transicion } from './tipos';

export const DURACION_FUNDIDO = 420;
export const CURVA_SALIDA = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Fundido base. Con prefers-reduced-motion, más corto (sigue sin desplazar nada). */
export const fundido: Transicion = {
  entrar: (capa, ctx) =>
    capa.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: ctx.reducido ? 200 : DURACION_FUNDIDO,
      easing: CURVA_SALIDA,
      fill: 'both',
    }),
};

/** Controlador uniforme sobre lo que devuelva una transición. */
export interface Controlador {
  terminado: Promise<void>;
  /** Lleva la animación a su final (cuando el orador avanza a mitad de camino). */
  finalizar: () => void;
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

export function controlar(resultado: ResultadoTransicion): Controlador {
  if (!resultado) return { terminado: Promise.resolve(), finalizar: () => {} };
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
          /* ya cancelada */
        }
      },
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
