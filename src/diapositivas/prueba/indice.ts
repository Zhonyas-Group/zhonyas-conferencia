/**
 * Mazo de PRUEBA del motor: las tres diapositivas que ejercitan pasos, notas,
 * un <Dato>, imagen 4K, video, cambio de orador y WebGL con póster
 * (docs/MOTOR.md §5 y §8). No es la charla: el índice de la charla es
 * src/diapositivas/indice.ts.
 *
 * Se compila con `vite build --mode prueba` (npm run compilar:prueba, en
 * dist-prueba/): en ese modo vite.config.ts cambia src/diapositivas/indice.ts
 * por este archivo y src/configuracion.ts por ./configuracion.ts. Así las
 * pruebas automáticas (scripts/probar.mjs y probar-novedades.mjs) no dependen
 * de lo que tenga la charla.
 */
import type { Diapositiva } from '../../motor/tipos';
import pruebaPasos from './01-prueba-pasos';
import pruebaMedio from './02-prueba-medio';
import pruebaWebgl from './03-prueba-webgl';

export const diapositivas: readonly Diapositiva[] = [pruebaPasos, pruebaMedio, pruebaWebgl];
