/**
 * Orden de la presentación. Para añadir una diapositiva: crea
 * src/diapositivas/NN-nombre.tsx (ver docs/MOTOR.md), impórtala aquí y ponla
 * en la lista en su sitio. El número del archivo es solo para ordenar la
 * carpeta; manda el orden de esta lista.
 */
import type { Diapositiva } from '../motor/tipos';
import pruebaPasos from './01-prueba-pasos';
import pruebaMedio from './02-prueba-medio';
import pruebaWebgl from './03-prueba-webgl';

export const diapositivas: readonly Diapositiva[] = [pruebaPasos, pruebaMedio, pruebaWebgl];
