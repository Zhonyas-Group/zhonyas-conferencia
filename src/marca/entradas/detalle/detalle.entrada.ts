/**
 * Z-08 · Abrir y cerrar un detalle (síntesis §4.4; 03 M10; 02 §5.6).
 *
 * El diálogo de cada disciplina de zhonyas.com (la galería de Proyectos):
 *
 *   abrir   opacidad 0 → 1 y scale(0.985) → scale(1)   520 ms  cubic-bezier(0.22, 1, 0.36, 1)
 *   cerrar  al revés                                    420 ms  cubic-bezier(0.76, 0, 0.24, 1)
 *
 * Fuentes: zhonyas-web/app/globals.css:1387 (animación de entrada), :1390-1399
 * (@keyframes service-experience-in), :1403 (de salida) y :1406-1415
 * (@keyframes service-experience-out). Medido en vivo (03 M10;
 * medidas-resto.json): opacidad 1 a los 552 ms al abrir; ≤ 0,02 a los 372 ms al cerrar.
 *
 * Se usa con <Detalle> (Detalle.tsx, a pantalla completa como el diálogo de la
 * web) o con cualquier elemento: <Entrada desde={1} hasta={2} efecto="detalle">.
 *
 * Menos movimiento: la web no lo quita, pero el motor pide «fundidos sí,
 * desplazamientos no» (MOTOR §4.5): solo la opacidad, sin la escala.
 */
import { registrarEntrada, type ContextoEntrada } from '../../../motor/entradas';
import { terminarSinParpadeo } from '../salidaSinParpadeo';

declare module '../../../motor/entradas' {
  interface EntradasRegistradas {
    detalle: true;
  }
}

/** @keyframes service-experience-in (globals.css:1390-1399). */
const ABRIR: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.985)' },
  { opacity: 1, transform: 'scale(1)' },
];
/** @keyframes service-experience-out (globals.css:1406-1415). */
const CERRAR: Keyframe[] = [
  { opacity: 1, transform: 'scale(1)' },
  { opacity: 0, transform: 'scale(0.985)' },
];

/** Con menos movimiento, sin la escala. */
const soloOpacidad = (fotogramas: Keyframe[], { reducido }: ContextoEntrada): Keyframe[] =>
  reducido ? fotogramas.map(({ opacity }) => ({ opacity })) : fotogramas;

registrarEntrada({
  nombre: 'detalle',
  movimiento: 'Z-08',
  fuente: 'zhonyas-web/app/globals.css:1387-1415 (service-experience-in y -out; 03 M10)',
  aparecer: (el, ctx) =>
    el.animate(soloOpacidad(ABRIR, ctx), {
      duration: 520, // globals.css:1387: service-experience-in 520ms
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // globals.css:1387
      fill: 'backwards', // la web usa `both`; el estado final lo pone el CSS (contrato de entradas.ts)
    }),
  desaparecer: (el, ctx) =>
    terminarSinParpadeo(el, [
      el.animate(soloOpacidad(CERRAR, ctx), {
        duration: 420, // globals.css:1403: service-experience-out 420ms
        easing: 'cubic-bezier(0.76, 0, 0.24, 1)', // globals.css:1403
        fill: 'forwards', // se queda cerrado hasta que el motor pone el estado oculto (salidaSinParpadeo.ts)
      }),
    ]),
});
