/**
 * Z-01 · Cifra o frase que entra (síntesis §4.4).
 *
 * Un dato o una frase por clic: fundido EN SU SITIO, sin desplazamiento ni
 * escala. Lo que va dentro de la <Entrada> (la cifra y, si la hay, su
 * etiqueta) se funde a la vez, como «140B» y «Weekly requests» en Vercel.
 *
 *   <Entrada desde={1} efecto="cifra">
 *     <p className="zh-cifra"><Dato id="mipymes-efectivo" /></p>
 *   </Entrada>
 *
 * De dónde sale cada valor:
 *   - La DURACIÓN, de Vercel Ship 2025 («140B» y «1T», medidos cuadro a cuadro):
 *     de invisible a estable en 0,27–0,30 s (05-oficio-conferencias.md:387).
 *     Se usa el extremo de 300 ms, el instante que la síntesis pide comparar.
 *   - La CURVA, de la marca: cubic-bezier(0.22, 1, 0.36, 1), la salida de
 *     zhonyas.com (globals.css:1387; 16 usos en CSS, 00-SINTESIS.md:34; 02 §5.12).
 *
 * Por qué la curva de la marca y no la de Vercel (comparación cuadro a cuadro,
 * 12-nov-2026, script curva-z01.mjs de la pieza; tabla en el informe):
 *   - Contra la luminancia medida de «140B» y «1T» (05-oficio-conferencias.md:364-383),
 *     la de la marca a 300 ms da un error cuadrático medio de 0,094: va por
 *     delante (al 99 % a los 196 ms; Vercel llega a los ~250 ms). La que mejor
 *     ajusta es `ease` a 270 ms (0,040).
 *   - Pero esa medida sale de una cámara que filma una pared de LED, subida a
 *     YouTube: la duración es fiable y la curva no (crítica C-14,
 *     00-SINTESIS.md:856-861). Ajustar una curva a una luminancia deformada
 *     sería «aproximar».
 *   - C-14 propone justo esto: la curva de la web con la duración de Vercel.
 *     Así Z-01 sale de la marca, como los demás movimientos.
 *
 * Menos movimiento (prefers-reduced-motion): es un fundido, se queda igual
 * (MOTOR §4.5: «fundidos sí, desplazamientos no»).
 */
import { registrarEntrada } from '../../../motor/entradas';

declare module '../../../motor/entradas' {
  interface EntradasRegistradas {
    cifra: true;
  }
}

/** Z-01: de invisible a visible, en su sitio (05-oficio-conferencias.md:386: «ni sube, ni crece, ni rebota»). */
const FUNDIDO: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

registrarEntrada({
  nombre: 'cifra',
  movimiento: 'Z-01',
  fuente:
    'Duración: Vercel Ship 2025, 0,27–0,30 s (05-oficio-conferencias.md:387). Curva: la de la marca, ' +
    'cubic-bezier(0.22, 1, 0.36, 1) (globals.css:1387), como propone C-14 (00-SINTESIS.md:861).',
  aparecer: (el) =>
    el.animate(FUNDIDO, {
      duration: 300, // Z-01: de invisible a estable en 0,27–0,30 s (05-oficio-conferencias.md:387); el extremo, 300 ms (síntesis §4.4)
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // la salida de la marca: globals.css:1387 (03 §1 regla 1); elegida por C-14
      fill: 'backwards', // contrato del motor: el primer cuadro ya sale invisible (entradas.ts)
    }),
});
