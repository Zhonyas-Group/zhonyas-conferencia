/**
 * Z-05 · La entrada «relevo»: el perfil del equipo de zhonyas.com que se abre
 * (components/team-profile.tsx:91-112; 03 M5). La usa <Relevo> (Relevo.tsx);
 * una diapositiva no la escribe a mano.
 *
 * Son cuatro animaciones que arrancan a la vez, en el mismo instante en que la
 * web registra el clic, y cuentan como UN momento animado (relevo@paso, A-54).
 * La web las hace con motion (React); aquí van con la Web Animations API con
 * los mismos valores, para que el motor las pueda llevar a su final si el
 * orador avanza a mitad, y el laboratorio colocarlas cuadro a cuadro:
 *
 *   qué           de → a                                   ms    retraso  curva
 *   retrato       caja de la tarjeta → 153,6 · 230 · 440×620  700   0        (0.22, 1, 0.36, 1)
 *                 scale 1 → .94, rotateY 0 → 12°, rotateZ 0 → −3°
 *   fondo         opacidad 0 → 1                            500   0        easeOut de motion
 *   texto         opacidad 0 → 1, x +60 px → 0              450   180      easeOut de motion
 *   avatar        opacidad 0 → 1, y +10 px → 0              400   500      easeOut de motion
 *
 * El saludo del personaje (wave) no es de aquí: es la animación CSS de
 * personaje.css, que empieza cuando el perfil aparece.
 *
 * Menos movimiento: la web pone todas las duraciones a 0 (team-profile.tsx:91,
 * 92, 101, 105, 110) y el perfil aparece de golpe. Aquí igual.
 */
import { registrarEntrada } from '../../motor/entradas';
import {
  CURVA_MARCA,
  CURVA_MOTION_POR_DEFECTO,
  RETRATO,
  RETRATO_GIRO_FINAL,
  RETRATO_GIRO_INICIAL,
  TIEMPOS,
  type Caja,
} from './geometria';

declare module '../../motor/entradas' {
  interface EntradasRegistradas {
    relevo: true;
  }
}

const px = (n: number) => `${n}px`;

function cajaDe(texto: string | undefined): Caja | null {
  const n = (texto ?? '').split(',').map(Number);
  if (n.length !== 4 || !n.every(Number.isFinite)) return null;
  return { left: n[0], top: n[1], width: n[2], height: n[3] };
}

registrarEntrada({
  nombre: 'relevo',
  movimiento: 'Z-05',
  fuente:
    'zhonyas-web/components/team-profile.tsx:91-112 (retrato 700 ms [0.22, 1, 0.36, 1]; fondo 500 ms; ' +
    'texto 450 ms a los 180 ms; avatar 400 ms a los 500 ms; easeOut de motion 12.43.0 = cubic-bezier(0, 0, 0.58, 1)), ' +
    'team-contact.css:30-47, sprite-character.css; medido en 03 M5',
  aparecer: (el, { reducido }) => {
    if (reducido) return; // team-profile.tsx:91-110: con reduceMotion, duración 0
    const animaciones: Animation[] = [];
    const parte = (nombre: string) => el.querySelector<HTMLElement>(`[data-relevo="${nombre}"]`);
    // Relevo automático (Relevo.tsx, `automatico`): todo empieza estos ms después de llegar.
    const retraso = Number(el.querySelector<HTMLElement>('[data-retraso]')?.dataset.retraso ?? 0) || 0;

    // El retrato vuela de la tarjeta a su sitio (team-profile.tsx:98-101).
    const retrato = parte('retrato');
    const origen = cajaDe(retrato?.dataset.origen);
    if (retrato && origen)
      animaciones.push(
        retrato.animate(
          [
            {
              left: px(origen.left),
              top: px(origen.top),
              width: px(origen.width),
              height: px(origen.height),
              transform: RETRATO_GIRO_INICIAL, // team-profile.tsx:98: rotateY 0, rotateZ 0 (scale 1)
            },
            {
              left: px(RETRATO.left),
              top: px(RETRATO.top),
              width: px(RETRATO.width),
              height: px(RETRATO.height),
              transform: RETRATO_GIRO_FINAL, // team-profile.tsx:99
            },
          ],
          {
            duration: TIEMPOS.retrato, // 700 ms: team-profile.tsx:101 (duration 0.7)
            delay: retraso,
            easing: CURVA_MARCA, // team-profile.tsx:101 (ease [0.22, 1, 0.36, 1])
            fill: 'backwards',
          },
        ),
      );

    // El fondo tapa las tarjetas (team-profile.tsx:92).
    const fondo = parte('fondo');
    if (fondo)
      animaciones.push(
        fondo.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: TIEMPOS.fondo, // 500 ms: team-profile.tsx:92 (duration 0.5)
          delay: retraso,
          easing: CURVA_MOTION_POR_DEFECTO, // sin ease en team-profile.tsx:92 → easeOut de motion (geometria.ts)
          fill: 'backwards',
        }),
      );

    // El nombre, el cargo y quién es entran desde la derecha (team-profile.tsx:105).
    const texto = parte('texto');
    if (texto)
      animaciones.push(
        texto.animate(
          [
            { opacity: 0, transform: `translateX(${TIEMPOS.textoDesdeX}px)` }, // team-profile.tsx:105: initial x 60
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: TIEMPOS.texto, // 450 ms: team-profile.tsx:105 (duration 0.45)
            delay: retraso + TIEMPOS.textoRetraso, // 180 ms: team-profile.tsx:105 (delay 0.18)
            easing: CURVA_MOTION_POR_DEFECTO, // sin ease en team-profile.tsx:105 → easeOut de motion
            fill: 'backwards',
          },
        ),
      );

    // El personaje sube 10 px y aparece (team-profile.tsx:109-110).
    const avatar = parte('avatar');
    if (avatar)
      animaciones.push(
        avatar.animate(
          [
            { opacity: 0, transform: `translateY(${TIEMPOS.avatarDesdeY}px)` }, // team-profile.tsx:109: initial y 10
            { opacity: 1, transform: 'none' },
          ],
          {
            duration: TIEMPOS.avatar, // 400 ms: team-profile.tsx:110 (duration 0.4)
            delay: retraso + TIEMPOS.avatarRetraso, // 500 ms: team-profile.tsx:110 (delay 0.5)
            easing: CURVA_MOTION_POR_DEFECTO, // sin ease en team-profile.tsx:110 → easeOut de motion
            fill: 'backwards',
          },
        ),
      );

    return animaciones;
  },
});
