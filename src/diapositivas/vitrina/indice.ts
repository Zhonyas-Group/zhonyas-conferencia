/**
 * El mazo de la vitrina (rama diseno-wow, 13-nov). José: «olvídate del guion
 * por ahora; quiero que la diapositiva muestre cosas: Lendex, Pymex y demás».
 * Con lo que ya aprobó (la portada, los relevos con un solo clic y las piezas
 * de src/marca/vitrina) y en el orden de los tres oradores:
 *
 *   José     portada · se presenta · somos Zhonyas · lo que construimos
 *   Gregory  relevo · Pymex
 *   Angel    relevo · zhonyas.com · landings
 *   José     relevo · Lendex · Lendex en vivo (Angel al teclado) · cierre
 *
 * Se compila con `npm run compilar:vitrina` (vite build --mode vitrina) en
 * dist-vitrina/, con la carpeta medios/ al lado (lleva videos).
 */
import type { Diapositiva } from '../../motor/tipos';
import portada from '../01-portada';
import relevoGregory from '../03-relevo-gregory';
import relevoAngel from '../09-relevo-angel';
import relevoJose from '../14-relevo-jose';
import demoLendex from '../18-demo-lendex';
import cierre from './cierre';
import construimos from './construimos';
import equipo from './equipo';
import landings from './landings';
import lendex from './lendex';
import pymex from './pymex';
import relevoJoseInicio from './relevo-jose-inicio';
import zhonyasWeb from './zhonyas-web';

export const diapositivas: readonly Diapositiva[] = [
  portada,
  relevoJoseInicio,
  equipo,
  construimos,
  relevoGregory,
  pymex,
  relevoAngel,
  zhonyasWeb,
  landings,
  relevoJose,
  lendex,
  demoLendex,
  cierre,
];
