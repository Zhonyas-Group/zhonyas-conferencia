/**
 * Z-11 · El personaje de píxeles de una persona del equipo.
 *
 * Copia de zhonyas-web/components/sprite-character.tsx: las mismas variables
 * CSS por fila del atlas (sprite-atlas.json, copiado sin cambios de
 * lib/sprite-atlas.json) y el mismo CSS (personaje.css). Lo único distinto es
 * de dónde sale la imagen: una ruta relativa de public/medios/equipo/ (con
 * medio(), para que funcione desde el USB), no «/sprites/atlas/…».
 *
 *   <Personaje atlas="gregory" animacion="wave" />            // a escala 1 (1 px del atlas = 1 px)
 *   <Personaje atlas="angel" animacion="walk" escala={0.64} />
 *
 * Como en la web, el componente se coloca con position: absolute dentro de una
 * caja con position: relative: su punto de apoyo (ax, ay) queda en el centro
 * del borde de abajo de esa caja (sprite-character.css:4).
 *
 * Para el motor:
 *   - mientras su <Entrada> está oculta no anima: el ciclo empieza cuando
 *     aparece (la web lo monta al abrir el perfil; medido en 03 M5, s2: el
 *     primer cambio de cuadro cae a los 167 ms del clic);
 *   - en vistas previas y miniaturas (activa = false) y con «menos
 *     movimiento» se queda en su primer cuadro (sprite-character.css:23-24);
 *   - con la sala en negro o algo encima (pausada) se congela y sigue desde ahí;
 *   - en modo revisión el motor apaga las animaciones CSS: primer cuadro;
 *   - con `vueltas` y `luego`, al terminar las vueltas pasa a la pose `luego` y
 *     se queda quieta, sin el respiro de las poses de un cuadro. Es lo que pide
 *     el guion para el relevo (docs/GUION.md, 03: «Saluda una vez con wave […]
 *     y se queda quieto en idle, sin el respiro de 1 px (C-11)»; «Lo que
 *     necesita el motor», 4). En revisión, miniaturas, vistas previas, con menos
 *     movimiento y al volver a la diapositiva ya completa (←) se ve ya en esa
 *     pose: es su estado final.
 */
import { useEffect, useState, type AnimationEvent, type CSSProperties } from 'react';
import { useDiapositiva, useMovimiento } from '../../motor/contexto';
import { useVisibleEnEntrada } from '../../motor/Entrada';
import { medio } from '../../motor/medios';
import atlas from './sprite-atlas.json';
import './personaje.css';

/** Las 16 filas de cada atlas (zhonyas-web/lib/sprite-atlas.ts:3-5). */
export type AnimacionPersonaje =
  | 'idle' | 'front' | 'walk' | 'run' | 'wave' | 'type' | 'draw' | 'vr' | 'grabbed'
  | 'nervous' | 'fall' | 'think' | 'laugh' | 'phone' | 'celebrate' | 'leave';

/** Una fila del atlas: cuadros de w×h de izquierda a derecha desde y (sprite-atlas.ts:7-8). */
interface FilaAtlas {
  y: number;
  w: number;
  h: number;
  frames: number;
  fps: number;
  loop: boolean;
  ax: number;
  ay: number;
}

interface HojaAtlas {
  src: string;
  width: number;
  height: number;
  animations: Record<AnimacionPersonaje, FilaAtlas>;
}

/** Personas con atlas en public/medios/equipo/: los tres oradores y, desde la vitrina (13-nov), los otros tres del equipo. */
export type IdAtlas = 'jose-leonardo' | 'gregory' | 'angel' | 'cristopher' | 'jose-carlos' | 'steven';

const HOJAS = atlas as unknown as Record<IdAtlas, HojaAtlas>;

/** El atlas de una persona, relativo a index.html. */
export function rutaAtlas(id: IdAtlas): string {
  return `medios/equipo/${id}/personaje.webp`;
}

/** Medidas de una fila (para colocar el personaje a mano). */
export function filaPersonaje(id: IdAtlas, animacion: AnimacionPersonaje): FilaAtlas {
  return HOJAS[id].animations[animacion];
}

interface PropsPersonaje {
  atlas: IdAtlas;
  animacion: AnimacionPersonaje;
  /**
   * Píxeles de pantalla por píxel del atlas (--s de sprite-character.css:3).
   * Dentro del relevo no se usa: allí manda el 1em / 200 del h2 de la web,
   * 108,8 / 200 = 0,544 (team-contact.css:40 y :46; relevo.css).
   */
  escala?: number;
  /**
   * Cuántas pasadas da el ciclo antes de quedarse en su primer cuadro. Sin
   * él, como en la web: sin fin (sprite-character.css:10). En `wave` cada
   * pasada es un saludo entero, con los cuadros 1-2-3-2-1 (5 cuadros a 6 fps,
   * 0,83 s; personaje.css, zh-sprite-saludo): 1 = un saludo (docs/GUION.md, 03).
   */
  vueltas?: number;
  /** Con `vueltas`: la pose en la que se queda al terminarlas, quieta (relevo: «idle»). */
  luego?: AnimacionPersonaje;
  className?: string;
}

export function Personaje({ atlas: id, animacion, escala = 1, vueltas, luego, className }: PropsPersonaje) {
  const { activa, pausada, direccion } = useDiapositiva();
  const { reducido, instantaneo } = useMovimiento();
  const visible = useVisibleEnEntrada();
  const hoja = HOJAS[id];
  const detenido = !visible || !activa || reducido;
  // ¿Ya dio sus vueltas? Se rearma cada vez que se detiene (sale de la pantalla, vuelve al paso anterior).
  const [acabo, setAcabo] = useState(false);
  useEffect(() => {
    if (detenido) setAcabo(false);
  }, [detenido]);
  const conFinal = !!luego && vueltas !== undefined;
  const final = conFinal && (acabo || instantaneo || reducido || !activa || direccion < 0);
  const pose = final && luego ? luego : animacion;
  const fila = hoja.animations[pose];
  // wave con vueltas: un saludo de ida y vuelta por pasada, sin repetir el último cuadro (personaje.css).
  const saludo = pose === 'wave' && vueltas !== undefined;
  const cuadros = saludo ? 2 * fila.frames - 1 : fila.frames;
  const alTerminar =
    conFinal && !final
      ? (e: AnimationEvent<HTMLSpanElement>) => {
          if (e.target !== e.currentTarget) return;
          if (e.animationName === 'zh-sprite-ciclo' || e.animationName === 'zh-sprite-saludo') setAcabo(true);
        }
      : undefined;
  return (
    <span
      className={className ? `zh-sprite ${className}` : 'zh-sprite'}
      data-animation={pose}
      data-loop={String(fila.loop)}
      data-quieto={final ? '' : undefined}
      onAnimationEnd={alTerminar}
      data-detenido={detenido ? '' : undefined}
      data-pausado={pausada ? '' : undefined}
      data-vueltas={vueltas !== undefined ? '' : undefined}
      data-saludo={saludo ? '' : undefined}
      aria-hidden="true"
      style={
        {
          // sprite-character.tsx:9-13, con la ruta relativa de la copia
          '--sprite': `url("${medio(rutaAtlas(id))}")`,
          '--atlas-w': hoja.width,
          '--y': fila.y,
          '--w': fila.w,
          '--h': fila.h,
          '--ax': fila.ax,
          '--ay': fila.ay,
          '--frames': fila.frames,
          '--duration': `${cuadros / fila.fps}s`, // sprite-character.tsx:12; el saludo, 5 cuadros: 0,83 s
          '--s': escala,
          '--vueltas': vueltas,
        } as CSSProperties
      }
    />
  );
}
