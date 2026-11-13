/**
 * Modo revisión (?revision=1): sin animaciones (CSS, Web Animations, GSAP y
 * motion), para que cada captura muestre el estado final del paso. Lo usan la
 * presentación y el laboratorio. Nunca se activa en la charla: solo con el
 * parámetro en la URL.
 */
import { gsap } from 'gsap';
import { MotionGlobalConfig } from 'motion/react';
import { esRevision } from './entorno';

export function aplicarModoRevision() {
  if (!esRevision) return;
  document.documentElement.classList.add('revision');
  MotionGlobalConfig.skipAnimations = true;
  // Cualquier tween de GSAP termina en el siguiente tic.
  gsap.globalTimeline.timeScale(1e4);
}
