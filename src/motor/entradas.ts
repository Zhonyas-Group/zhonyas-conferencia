/**
 * Entradas con nombre.
 *
 * El motor no trae ninguna animación de entrada propia: un <Entrada> sin
 * `efecto` aparece de golpe en su paso (corte, como el cambio de diapositiva).
 * Cada movimiento de la marca (Z-01 cifra, Z-03 título que se llena, Z-07
 * encender…) es una pieza de src/marca/ que se registra aquí con su nombre,
 * sus valores copiados de zhonyas.com y su fuente, y se usa así:
 *
 *   <Entrada desde={1} efecto="cifra">…</Entrada>
 *
 * Registrar una (en src/marca/<pieza>/<pieza>.entrada.ts, que el motor carga solo):
 *
 *   import { registrarEntrada } from '../../motor/entradas';
 *   import './cifra.css';
 *
 *   declare module '../../motor/entradas' {
 *     interface EntradasRegistradas { cifra: true }
 *   }
 *
 *   registrarEntrada({
 *     nombre: 'cifra',
 *     movimiento: 'Z-01',
 *     fuente: 'Vercel Ship 2025, «140B» (05 §11.3)',
 *     aparecer: (el) =>
 *       el.animate([{ opacity: 0 }, { opacity: 1 }], {
 *         duration: 300, // Z-01: de invisible a estable en 0,27–0,30 s (05 §11.3)
 *         easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // curva de la marca (02 §5.12), C-14
 *         fill: 'backwards',
 *       }),
 *   });
 *
 * Contrato:
 *   - `aparecer` solo se llama al AVANZAR hasta el paso de la entrada, en la
 *     diapositiva que está en pantalla (sala o «En pantalla» del presentador).
 *     Al retroceder, al saltar, en las vistas previas, en las miniaturas y en
 *     modo revisión la entrada queda en su estado final al instante.
 *   - El estado final de `aparecer` es el estado visible del CSS: al terminar,
 *     el motor cancela las animaciones que devolvió. Con WAAPI, `fill: 'backwards'`.
 *     Con GSAP, que la línea de tiempo termine con `clearProps`.
 *   - Si el orador avanza a mitad, el motor la lleva a su final.
 *   - El estado oculto por defecto es `visibility: hidden` (conserva el hueco).
 *     Un efecto que no oculta sino que «apaga» (Z-07) lo cambia en su CSS:
 *     `.entrada[data-efecto='encender'][data-oculto] { visibility: visible; … }`.
 *   - `desaparecer` (opcional) anima la salida al avanzar más allá de `hasta`
 *     (Z-08, cerrar un detalle); al terminar se aplica el estado oculto.
 */
import { registrarProblema } from './diagnostico';
import type { ResultadoTransicion } from './tipos';

/**
 * Nombres de las entradas registradas. Cada pieza añade el suyo con
 * `declare module` (ver arriba): así un nombre mal escrito en una diapositiva
 * falla al comprobar los tipos (npm run tipos).
 */
export interface EntradasRegistradas {}

export type NombreEntrada = Extract<keyof EntradasRegistradas, string>;

export interface ContextoEntrada {
  /** El sistema pide menos movimiento (prefers-reduced-motion): fundidos sí, desplazamientos no. */
  reducido: boolean;
  /** Paso de la diapositiva al que se acaba de llegar. */
  paso: number;
  /** Id de la diapositiva (para avisos). */
  diapositiva: string;
}

export interface DefinicionEntrada {
  nombre: NombreEntrada;
  /** Id del catálogo de la síntesis §4.4 («Z-01»…). */
  movimiento: string;
  /** De dónde salen duraciones y curvas (archivo:línea o M-id). Cada valor lleva además su comentario en el código. */
  fuente: string;
  /** Anima la aparición al avanzar. */
  aparecer?: (el: HTMLElement, ctx: ContextoEntrada) => ResultadoTransicion;
  /** Anima la salida al avanzar más allá de `hasta`. */
  desaparecer?: (el: HTMLElement, ctx: ContextoEntrada) => ResultadoTransicion;
}

const registro = new Map<string, DefinicionEntrada>();

export function registrarEntrada(definicion: DefinicionEntrada) {
  const previa = registro.get(definicion.nombre);
  // En desarrollo, recargar el módulo (HMR) la vuelve a registrar: eso no es un choque.
  if (previa && previa.movimiento !== definicion.movimiento && !import.meta.env.DEV)
    registrarProblema(`La entrada «${definicion.nombre}» está registrada dos veces (${previa.movimiento} y ${definicion.movimiento}).`);
  registro.set(definicion.nombre, definicion);
}

export function obtenerEntrada(nombre: string): DefinicionEntrada | undefined {
  return registro.get(nombre);
}

/** Todas las entradas registradas (para el laboratorio y los avisos). */
export function entradasRegistradas(): readonly DefinicionEntrada[] {
  return [...registro.values()];
}
