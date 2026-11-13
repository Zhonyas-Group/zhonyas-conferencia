/**
 * La cinta suelta bajo un titular (síntesis §4.3; A-41): 630 px de ancho,
 * quieta. El titular en x = 115, y = 115 (retícula §4.3). La separación de
 * 16 px es la del guion para «zhonyas.com» sobre la cinta (GUION, 20); aquí
 * solo sirve de ejemplo: la pone cada diapositiva.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { Cinta } from './Cinta';

function ConTitular() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular" style={{ maxWidth: 1690 }}>
        El usuario de su proyecto final ya está en su calle.
      </p>
      <Cinta style={{ marginTop: 16 }} />
    </div>
  );
}

export default definirPieza({
  titulo: 'Cinta bajo un titular (quieta, 630 px)',
  movimiento: 'Z-02 (estado final)',
  notas: 'La forma final de Z-02. Proporción real 8,55 : 1 con el filo (no 7,45 : 1). ≤ 3 % del área (A-41).',
  pasos: 0,
  Componente: ConTitular,
});
