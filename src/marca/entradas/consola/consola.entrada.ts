/**
 * Z-06 · Consola (síntesis §4.4; 03 M8; 02 §5.5).
 *
 * La consola de Servicios de zhonyas.com, que se escribe sola. La entrada
 * anima las partes que pinta <Consola> (Consola.tsx), con los tiempos exactos
 * de la web:
 *
 *   comando   clip-path inset(0 100% 0 0) → inset(0), 1 s, steps(24, end)
 *   línea i   a 1,1 + 0,4·i s: 250 ms ease-out, opacidad 0 → 1 y sube 4 px
 *   resultado a 1,3 + 0,4·n s (n = número de líneas), igual que una línea
 *   cursor    a 1,7 + 0,4·n s, igual que una línea
 *
 * Fuentes: zhonyas-web/components/service-terminal.tsx:31-41 (retrasos) y
 * components/capabilities-section.css:70-74 (animaciones y fotogramas).
 * Medido en vivo (03 M8; investigacion/movimiento/medidas-servicios.json):
 * el tecleo da 25 valores distintos y cada línea dura 250 ms; lo medido va
 * ~120 ms por detrás del código porque React vuelve a montar la consola.
 *
 * Menos movimiento: la web no anima nada (capabilities-section.css:83-85 y
 * data-motion de service-terminal.tsx:22). Aquí, igual: aparece entera.
 */
import { registrarEntrada } from '../../../motor/entradas';

declare module '../../../motor/entradas' {
  interface EntradasRegistradas {
    consola: true;
  }
}

/** @keyframes terminal-type (capabilities-section.css:73). */
const TECLEO: Keyframe[] = [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }];

/** @keyframes terminal-line (capabilities-section.css:74): de opacidad 0 y 4 px más abajo a su sitio. */
const LINEA: Keyframe[] = [
  { opacity: 0, transform: 'translateY(4px)' },
  { opacity: 1, transform: 'none' },
];

/** Retraso de cada parte, en ms. Redondeado: 1,1 + 0,4·i en coma flotante da 1500,0000000000002. */
const ms = (segundos: number) => Math.round(segundos * 1000);

registrarEntrada({
  nombre: 'consola',
  movimiento: 'Z-06',
  fuente: 'zhonyas-web/components/service-terminal.tsx:31-41 y components/capabilities-section.css:70-74 (03 M8)',
  aparecer: (el, { reducido }) => {
    // La web no anima la consola con menos movimiento (capabilities-section.css:83-85).
    if (reducido) return;
    const animaciones: Animation[] = [];
    const tecleo = el.querySelector<HTMLElement>('.zh-consola__tecleo');
    if (tecleo)
      animaciones.push(
        tecleo.animate(TECLEO, {
          duration: 1000, // capabilities-section.css:70: terminal-type 1s
          easing: 'steps(24, end)', // capabilities-section.css:70
          fill: 'backwards', // la web usa `both`; el estado final lo pone el CSS (contrato de entradas.ts)
        }),
      );
    const lineas = el.querySelectorAll<HTMLElement>('.zh-consola__lineas > .zh-consola__linea');
    const n = lineas.length;
    const linea = (parte: HTMLElement, retraso: number) =>
      animaciones.push(
        parte.animate(LINEA, {
          duration: 250, // capabilities-section.css:71: terminal-line 250ms
          easing: 'ease-out', // capabilities-section.css:71
          delay: retraso, // --line-delay: 1,1 + 0,4·i · 1,3 + 0,4·n · 1,7 + 0,4·n s (service-terminal.tsx:32, 37, 41; capabilities-section.css:71)
          fill: 'backwards', // invisible hasta su turno, como `both` en la web: el hueco ya está reservado
        }),
      );
    lineas.forEach((parte, i) => linea(parte, ms(1.1 + i * 0.4))); // service-terminal.tsx:32: `${1.1 + index * 0.4}s`
    const resultado = el.querySelector<HTMLElement>('.zh-consola__resultado');
    if (resultado) linea(resultado, ms(1.3 + n * 0.4)); // service-terminal.tsx:37: `${1.3 + steps.length * 0.4}s`
    const cursor = el.querySelector<HTMLElement>('.zh-consola__prompt');
    if (cursor) linea(cursor, ms(1.7 + n * 0.4)); // service-terminal.tsx:41: `${1.7 + steps.length * 0.4}s`
    return animaciones;
  },
});
