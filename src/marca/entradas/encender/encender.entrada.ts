/**
 * Z-07 · Encender una pieza (síntesis §4.4; 03 M9; 02 §5.6).
 *
 * El «hover» de las tarjetas de disciplina de Proyectos, disparado por paso:
 * la pieza está en gris al 65 % de brillo mientras no se nombra y se enciende
 * al llegar a su paso. Anima las partes que pinta <Encender> (Encender.tsx):
 *
 *   medio  filter grayscale(1) brightness(.65) → grayscale(0) brightness(1)   600 ms ease
 *          transform scale(1) → scale(1.055)                                  900 ms (0.22, 1, 0.36, 1)
 *   texto  translateY(1.7rem = 27,2 px) → 0                                    450 ms ease
 *
 * Fuentes: zhonyas-web/components/project-gallery.css:31-32 (gris y las dos
 * transiciones del medio), :43 (encendida), :48 y :52 (el texto). Medido en
 * vivo (03 M9; medidas-resto.json): filtro 626 ms, escala 759 ms (umbral),
 * texto 459 ms.
 *
 * Con `hasta`, al pasar de su paso se apaga «lo mismo al revés», como al salir
 * el puntero en la web: las mismas duraciones y curvas, porque las transiciones
 * CSS (project-gallery.css:32 y :48) valen en los dos sentidos (03 M9: «portada
 * otra vez gris a ~700 ms»).
 *
 * Menos movimiento: el color cambia igual (es un fundido); la escala y el
 * texto se quedan quietos en su sitio final (MOTOR §4.5).
 */
import { registrarEntrada, type ContextoEntrada } from '../../../motor/entradas';
import { terminarSinParpadeo } from '../salidaSinParpadeo';

declare module '../../../motor/entradas' {
  interface EntradasRegistradas {
    encender: true;
  }
}

/** project-gallery.css:31 (apagada) → :43 (encendida). */
const APAGADA = 'grayscale(1) brightness(0.65)';
const ENCENDIDA = 'grayscale(0) brightness(1)';
/** project-gallery.css:43: la portada crece dentro de su marco (el tile tiene overflow: hidden, :12). */
const SIN_ZOOM = 'scale(1)';
const ZOOM = 'scale(1.055)';
/** project-gallery.css:48 (translateY(1.7rem) = 27,2 px a 16 px) → :52 (translateY(0)). */
const TEXTO_ABAJO = 'translateY(27.2px)';
const TEXTO_EN_SU_SITIO = 'translateY(0px)';

function animar(el: HTMLElement, { reducido }: ContextoEntrada, encender: boolean): Animation[] {
  const fill: FillMode = encender ? 'backwards' : 'forwards';
  const animaciones: Animation[] = [];
  const medio = el.querySelector<HTMLElement>('.zh-encender__medio');
  const texto = el.querySelector<HTMLElement>('.zh-encender__texto');
  if (medio) {
    animaciones.push(
      medio.animate([{ filter: encender ? APAGADA : ENCENDIDA }, { filter: encender ? ENCENDIDA : APAGADA }], {
        duration: 600, // project-gallery.css:32: filter 600ms
        easing: 'ease', // project-gallery.css:32
        fill,
      }),
    );
    if (!reducido)
      animaciones.push(
        medio.animate([{ transform: encender ? SIN_ZOOM : ZOOM }, { transform: encender ? ZOOM : SIN_ZOOM }], {
          duration: 900, // project-gallery.css:32: transform 900ms
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // project-gallery.css:32
          fill,
        }),
      );
  }
  if (texto && !reducido)
    animaciones.push(
      texto.animate(
        [{ transform: encender ? TEXTO_ABAJO : TEXTO_EN_SU_SITIO }, { transform: encender ? TEXTO_EN_SU_SITIO : TEXTO_ABAJO }],
        {
          duration: 450, // project-gallery.css:48: transform 450ms
          easing: 'ease', // project-gallery.css:48
          fill,
        },
      ),
    );
  return animaciones;
}

registrarEntrada({
  nombre: 'encender',
  movimiento: 'Z-07',
  fuente: 'zhonyas-web/components/project-gallery.css:31-32, 43, 48 y 52 (03 M9)',
  aparecer: (el, ctx) => animar(el, ctx, true),
  // Al revés, con las mismas transiciones. Sin parpadeo al terminar (salidaSinParpadeo.ts).
  desaparecer: (el, ctx) => terminarSinParpadeo(el, animar(el, ctx, false)),
});
