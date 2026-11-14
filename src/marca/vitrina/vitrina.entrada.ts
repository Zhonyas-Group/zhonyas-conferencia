/**
 * La entrada «vitrina» (rama diseno-wow): las ventanas y teléfonos de un
 * producto vuelan desde la derecha y se asientan con el giro del perfil del
 * equipo (team-profile.tsx:98-101, el mismo vuelo del relevo), una detrás de
 * otra; los nombres caen debajo cuando su pieza ya llegó.
 *
 *   qué        de → a                                            ms    retraso            curva
 *   pieza      x +220 px, rotateY −26°, scale .9, opacidad 0 → reposo  900   200 + 140 × orden   (0.22, 1, 0.36, 1)
 *   nombre     y +24 px, opacidad 0 → reposo                     450   700 + 140 × orden   easeOut de motion
 *
 * Cada pieza solo trae el fotograma de partida, con `offset: 0`: el de llegada
 * es el de su CSS (el giro en reposo de --giro), así la animación nunca pisa
 * la composición. Sin el `offset: 0`, un fotograma suelto es el de LLEGADA
 * (Web Animations): las piezas salían ya puestas, se iban y volvían de golpe.
 */
import { registrarEntrada } from '../../motor/entradas';

declare module '../../motor/entradas' {
  interface EntradasRegistradas {
    vitrina: true;
  }
}

/** La salida de la marca (globals.css:1387): project-gallery.css:32 mueve sus tarjetas con ella en 900 ms. */
const CURVA_MARCA = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** easeOut de motion 12.43.0 (relevo/geometria.ts). */
const CURVA_MOTION = 'cubic-bezier(0, 0, 0.58, 1)';

registrarEntrada({
  nombre: 'vitrina',
  movimiento: 'Z-05',
  fuente:
    'project-gallery.css:32 (transform 900 ms cubic-bezier(0.22, 1, 0.36, 1)); team-profile.tsx:98-101 (el giro rotateY del retrato); ' +
    'team-profile.tsx:105 (texto 450 ms desde +60 px, easeOut de motion)',
  aparecer: (el, { reducido }) => {
    const piezas = [...el.querySelectorAll<HTMLElement>('[data-vitrina-pieza]')];
    const nombres = [...el.querySelectorAll<HTMLElement>('[data-vitrina-nombre]')];
    if (reducido) {
      // Menos movimiento: un fundido de 200 ms con ease (MOTOR §4.5; 03 M13).
      return [el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease', fill: 'backwards' })]; // 03 M13
    }
    const orden = (p: HTMLElement) => Number(getComputedStyle(p).getPropertyValue('--orden')) || 0;
    return [
      ...piezas.map((p) =>
        p.animate(
          [{ opacity: 0, transform: 'translateX(220px) rotateY(-26deg) scale(0.9)', offset: 0 }], // team-profile.tsx:98-99: el retrato gira en Y al volar
          {
            duration: 900, // project-gallery.css:32 (transform 900 ms)
            delay: 200 + 140 * orden(p), // 140 ms entre piezas: el escalonado de las letras de capabilities-heading.css:11 (--letter-delay)
            easing: CURVA_MARCA, // project-gallery.css:32
            fill: 'backwards',
          },
        ),
      ),
      ...nombres.map((n) =>
        n.animate([{ opacity: 0, transform: 'translateY(24px)', offset: 0 }], {
          duration: 450, // team-profile.tsx:105 (duration 0.45)
          delay: 700 + 140 * orden(n), // cuando su pieza ya está casi en su sitio
          easing: CURVA_MOTION, // team-profile.tsx:105 sin ease → easeOut de motion
          fill: 'backwards',
        }),
      ),
    ];
  },
});
