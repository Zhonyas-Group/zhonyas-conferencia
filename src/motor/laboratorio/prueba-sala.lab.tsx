/**
 * La diapositiva oculta de prueba de sala (tecla T en la charla), para
 * capturarla a 1920 × 1080 sin abrir la presentación: lab.html?pieza=prueba-sala.
 */
import { PruebaSala } from '../PruebaSala';
import { definirPieza } from './tipos';

export default definirPieza({
  titulo: 'Prueba de sala (tecla T): tamaños, colores, negros y bordes',
  notas: 'Proyectarla en la sala con las luces del día y mirarla desde la última fila (síntesis §9.2.8).',
  pasos: 0,
  Componente: PruebaSala,
});
