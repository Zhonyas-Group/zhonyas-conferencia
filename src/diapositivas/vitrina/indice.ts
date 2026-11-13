/**
 * Muestra de la vitrina (rama diseno-wow, 13-nov). José: «olvídate del guion
 * por ahora; quiero que la diapositiva muestre cosas: Lendex, Pymex y demás».
 * Cuatro diapositivas de producto con las mismas piezas (src/marca/vitrina),
 * entre la portada y una tarjeta de cierre.
 *
 * Se compila con `npm run compilar:vitrina` (vite build --mode vitrina) en
 * dist-vitrina/, con la carpeta medios/ al lado (lleva videos).
 */
import type { Diapositiva } from '../../motor/tipos';
import portada from '../01-portada';
import { crearFin } from '../muestra/fin-muestra';
import construimos from './construimos';
import landings from './landings';
import lendex from './lendex';
import pymex from './pymex';

export const diapositivas: readonly Diapositiva[] = [
  portada,
  construimos,
  pymex,
  lendex,
  landings,
  crearFin('Si te gusta, sigo con Matriz ZH, Cantus y el resto del mazo.', 'jose'),
];
