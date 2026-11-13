import type { ComponentType } from 'react';
import type { ClaveOrador } from '../configuracion';

/** 1 = hacia delante, -1 = hacia atrás, 0 = salto directo o carga inicial. */
export type Direccion = 1 | -1 | 0;

/** Lo que recibe el componente de cada diapositiva. */
export interface PropsDiapositiva {
  /** Paso visible, de 0 (estado inicial) a `pasos` (todo mostrado). */
  paso: number;
  /** true solo en la diapositiva que está en pantalla (no en vistas previas ni miniaturas). */
  activa: boolean;
  /** Sentido del último movimiento. Sirve para animar la entrada o la vuelta atrás. */
  direccion: Direccion;
}

/** Contexto que recibe una transición entre diapositivas. */
export interface ContextoTransicion {
  /** 1 si se avanza, -1 si se retrocede. */
  direccion: 1 | -1;
  /** El sistema pide menos movimiento (prefers-reduced-motion). */
  reducido: boolean;
}

/**
 * Lo que puede devolver una transición (o una entrada con nombre) para que el
 * motor sepa cuándo termina y pueda cortarla si el orador avanza otra vez a
 * mitad de camino:
 * - una animación de la Web Animations API (`elemento.animate(...)`) o una lista de ellas,
 * - una línea de tiempo o tween de GSAP (tiene `progress()` y `then()`),
 * - una promesa (no se puede cortar; el motor la espera como mucho 3 s),
 * - nada (instantánea).
 */
export type ResultadoTransicion =
  | Animation
  | readonly Animation[]
  | { progress: (valor: number) => unknown; then: (fn: () => void) => unknown }
  | Promise<unknown>
  | void;

/**
 * Una transición actúa sobre las dos capas (la que entra y la que sale).
 * La capa que entra está encima. Al terminar, el motor borra los estilos en
 * línea que la transición haya dejado en las capas.
 */
export interface Transicion {
  entrar?: (capa: HTMLElement, ctx: ContextoTransicion) => ResultadoTransicion;
  salir?: (capa: HTMLElement, ctx: ContextoTransicion) => ResultadoTransicion;
}

/**
 * Nota del presentador para un paso (05 §8.1; 01 P1-16). Se ve la del paso en
 * el que está la sala.
 */
export interface NotaPaso {
  /** La frase de entrada completa: lo primero que se dice al llegar a este paso. */
  decir: string;
  /** 3–4 palabras para no perderse («GEM · 47 países · récord»). */
  claves: string;
  /** Qué hacer si falla (demos, video, WebGL): se ve aparte, en otro color. */
  siFalla?: string;
}

/** Definición completa de una diapositiva (lo que exporta cada archivo de src/diapositivas). */
export interface Diapositiva {
  /** Identificador único y estable (aparece en capturas y depuración). */
  id: string;
  /** Título interno: solo lo ven el presentador y la cuadrícula. */
  titulo: string;
  /** Número de sub-pasos («builds»). 0 = la diapositiva se muestra completa de una vez. */
  pasos: number;
  /** Quién la presenta (clave de `configuracion.oradores`). */
  orador: ClaveOrador;
  /**
   * Notas para el presentador.
   * - **Por paso** (lo normal): una lista con una nota por paso, de 0 a `pasos`
   *   (`pasos + 1` notas): `{ decir, claves, siFalla? }`.
   * - Texto libre (una sola nota para toda la diapositiva): una línea en blanco
   *   separa párrafos, «- » hace viñetas y **así** se marca en negrita.
   */
  notas: string | readonly NotaPaso[];
  /**
   * Fuentes de lo que se afirma (créditos de fotos, citas…). Van en el panel
   * «Fuentes» del presentador, aparte de las notas. Las de las cifras salen
   * solas del registro de datos (src/datos.ts) por cada <Dato> de la diapositiva.
   */
  fuentes?: readonly string[];
  /** Duración sugerida en segundos (sirve para el ritmo y para la alerta del +20 %). */
  duracion: number;
  /** El componente React que dibuja la diapositiva en el escenario de 1920×1080. */
  Componente: ComponentType<PropsDiapositiva>;
  /**
   * Transición para llegar a esta diapositiva desde la anterior (y, al
   * retroceder, para volver de ella a la anterior). Si no se indica, corte
   * seco (Z-00). Solo para las escenas medidas Z-02 y Z-10.
   */
  transicion?: Transicion;
  /** Medios que hay que precargar (rutas relativas a public/, p. ej. 'medios/equipo.webp'). */
  medios?: readonly string[];
  /** Color de fondo de la diapositiva y de las bandas laterales. Por defecto, var(--fondo). */
  fondo?: string;
  /**
   * Diapositiva pesada (WebGL, filtros SVG, el agujero negro): en el
   * presentador («En pantalla» y «Siguiente») y en las miniaturas se ve su
   * `poster` quieto, no la escena en vivo. La sala la pinta siempre en vivo.
   * Así la laptop no pinta lo más caro dos o tres veces a la vez (C-02).
   */
  pesada?: boolean;
  /** Imagen de la diapositiva entera, 1920×1080 (ruta relativa a public/). Obligatoria si es pesada. */
  poster?: string;
  /**
   * La diapositiva usa más de un momento animado a propósito (A-54 pide uno).
   * El motivo silencia el aviso de desarrollo y queda escrito en el código.
   */
  excepcionA54?: string;
  /**
   * Ids de src/datos.ts que aparecen en el archivo de la diapositiva. Lo
   * rellena la compilación (vite.config.ts): no hace falta escribirlo.
   */
  datosDetectados?: readonly string[];
}

/** Ayuda de tipos: valida la definición y la devuelve tal cual. */
export function definirDiapositiva(definicion: Diapositiva): Diapositiva {
  return definicion;
}

/** Cómo se está pintando una diapositiva. */
export type ModoVista =
  /** En el escenario: la sala, o la vista «en vivo» del presentador. */
  | 'escenario'
  /** Vista previa fija (la siguiente en el presentador). */
  | 'vista'
  /** Miniatura de la cuadrícula: sin WebGL ni video. */
  | 'miniatura';

/** Papel de cada capa dentro de la secuencia. */
export type RolCapa = 'actual' | 'saliente' | 'oculta' | 'fija';
