/**
 * Laboratorio de Z-08 · Abrir y cerrar un detalle (detalle.entrada.ts, Detalle.tsx).
 *
 * Paso 0: una diapositiva con su titular. Paso 1: se abre, encima, la captura
 * de la calculadora pública de Lendex a pantalla completa (520 ms). Paso 2: se
 * cierra (420 ms) y vuelve la diapositiva. Comparar con
 * investigacion/movimiento/08a-dialogo-disciplina.png.
 */
import { definirPieza } from '../../../motor/laboratorio/tipos';
import { Titular } from '../../composiciones';
import { Detalle } from './Detalle';
import calculadora from '../../../../investigacion/productos/lendex/app-escritorio-calculadora-publica.png';

function Escena() {
  return (
    <div className="zh-reticula">
      <Titular>Lendex calcula la cuota de un préstamo</Titular>
      <Detalle desde={1} hasta={1}>
        <img className="zh-detalle__medio" src={calculadora} alt="Calculadora pública de Lendex" data-lab="detalle" />
      </Detalle>
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-08 · Abrir y cerrar un detalle',
  movimiento: 'Z-08',
  notas:
    'Paso 1: opacidad 0 → 1 y escala 0,985 → 1 en 520 ms (0.22, 1, 0.36, 1). Paso 2: al revés en 420 ms (0.76, 0, 0.24, 1), ' +
    'sin parpadeo al final (salidaSinParpadeo.ts). globals.css:1387-1415; 08a-dialogo-disciplina.png.',
  escenas: [
    {
      id: 'detalle-lab',
      pasos: 2,
      Componente: Escena,
      excepcionA54: 'Laboratorio de Z-08: abrir y cerrar el mismo detalle son sus dos mitades.',
    },
  ],
});
