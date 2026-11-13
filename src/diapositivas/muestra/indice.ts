/**
 * Muestra de la dirección nueva (rama diseno-wow): ocho diapositivas, en el
 * orden de la charla, para enseñarle a José el fondo vivo, las transiciones y
 * la coreografía antes de rehacer las otras doce. Van los tres relevos
 * (Gregory, Angel y José): José pidió ver presentados a los tres.
 *
 * Se compila con `vite build --mode muestra` (npm run compilar:muestra, en
 * dist-muestra/, un solo HTML que se abre por file://): en ese modo
 * vite.config.ts cambia src/diapositivas/indice.ts por este archivo.
 *
 *   01 portada        el logo 3D se arma; «Zhonyas» letra a letra; los tres en píxeles
 *   02 su-calle       inmersión en el logo; José levanta la mano; titular palabra a palabra
 *   03 relevo-gregory la cortina del cambio de orador con Gregory corriendo encima
 *   04 sin-rnc        la cifra cuenta y 852 de 1000 puntos se encienden en cascada
 *   06 libreta        la libreta que se escribe sola
 *   09 relevo-angel   la cortina con Angel corriendo; su foto vuela sola
 *   11 tres-arreglos  la raya se dibuja y Angel camina de fecha en fecha
 *   14 relevo-jose    la cortina con José corriendo; su foto vuela sola
 *   fin               «Hasta aquí la muestra.» (sin ella, la 11 parecía trabada)
 */
import type { Diapositiva } from '../../motor/tipos';
import portada from '../01-portada';
import suCalle from '../02-su-calle';
import relevoGregory from '../03-relevo-gregory';
import sinRnc from '../04-sin-rnc';
import libreta from '../06-libreta';
import relevoAngel from '../09-relevo-angel';
import tresArreglos from '../11-tres-arreglos';
import relevoJose from '../14-relevo-jose';
import finMuestra from './fin-muestra';

export const diapositivas: readonly Diapositiva[] = [
  portada,
  suCalle,
  relevoGregory,
  sinRnc,
  libreta,
  relevoAngel,
  tresArreglos,
  relevoJose,
  finMuestra,
];
