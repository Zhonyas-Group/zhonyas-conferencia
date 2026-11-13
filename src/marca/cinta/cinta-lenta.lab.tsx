/**
 * Z-02 · versión lenta (03 M2, opción B): lo que da la rueda a ritmo fijo,
 * 2488 px de scroll en 5957 ms (pasada 2), pasando por los ms medidos de cada
 * fase (reloj.ts, NUDOS_LENTO). Es la que se compara cuadro a cuadro con
 * investigacion/movimiento/02-cinta.png: las seis fronteras de fase caen en su
 * ms; dentro de cada fase queda el vaivén de la propia pasada (≤ 75 ms).
 * Hoja lado a lado: verificacion/fidelidad/cinta.png.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { LogoCinta } from './LogoCinta';

function Escena() {
  return <LogoCinta desde={1} ritmo="lento" />;
}

export default definirPieza({
  titulo: 'Z-02 · Logo → cinta, lenta (unos 6 s a ritmo fijo)',
  movimiento: 'Z-02',
  notas:
    'Fundido de 74 a 1158 ms, Z → cinta de 1641 a 4492 ms y cinta a la derecha de 4896 a 5957 ms, como la web (03 M2, pasada 2). Comparar con investigacion/movimiento/02-cinta.png y verificacion/fidelidad/cinta.png.',
  pasos: 1,
  Componente: Escena,
});
