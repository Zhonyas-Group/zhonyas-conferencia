/**
 * Laboratorio de la composición Dividida 1,2 : 0,8 (Dividida.tsx).
 *
 * Titular arriba a la izquierda, texto de lectura abajo en la misma columna
 * (985 px) y la evidencia centrada en la de la derecha (657 px), con 48 px de
 * hueco. La evidencia es la captura del tablero de Pymex en el teléfono
 * (390 × 844 a 2×; ojo: es la maqueta de la landing, C-12).
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { Dividida } from './Dividida';
import tablero from '../../../investigacion/productos/pymex/movil-02-tablero.png';

function Escena() {
  return (
    <Dividida titular="El tablero cabe en la pantalla de un teléfono" evidencia={<img src={tablero} alt="Tablero de Pymex en un teléfono" />}>
      <p className="zh-lectura">Texto de lectura a 60 px, abajo, alineado con el pie de la captura.</p>
    </Dividida>
  );
}

export default definirPieza({
  titulo: 'Composición · Dividida 1,2 : 0,8',
  notas: 'Columnas de 985 y 657 px con 48 px de hueco (capabilities-section.css:5 y :12). Titular en 115, 115.',
  pasos: 0,
  Componente: Escena,
});
