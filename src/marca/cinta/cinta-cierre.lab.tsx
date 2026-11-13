/**
 * El cierre (GUION, diapositiva 20): el paso 0 es como la portada (vuelve el
 * monograma); en el paso 1, Z-02 a la velocidad del menú, y al terminar
 * aparecen por corte la idea, la acción y «zhonyas.com» sobre la cinta.
 *
 * Colocación según el guion: la idea en x 115, y 115 a 96 px; la acción a 60 px
 * bajo la idea (y ≈ 430, hasta x ≈ 940); «zhonyas.com» a 60 px, alineado con el
 * borde derecho de la cinta y 16 px por encima. La cinta queda donde la deja
 * Z-02 tal cual (CAJA_CINTA_FINAL). El QR (M-08) todavía no existe: no se dibuja.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { LogoCinta } from './LogoCinta';
import { CAJA_CINTA_FINAL } from './medidas';

function Cierre() {
  const derecha = 1920 - (CAJA_CINTA_FINAL.x + CAJA_CINTA_FINAL.ancho);
  const abajo = 1080 - CAJA_CINTA_FINAL.y + 16; // 16 px sobre la cinta (GUION, 20)
  return (
    <LogoCinta desde={1}>
      <div className="zh-reticula">
        <p className="zh-titular" style={{ maxWidth: 1140 }}>
          El usuario de su proyecto final ya está en su calle.
        </p>
        <p className="zh-lectura" style={{ position: 'absolute', left: 115, top: 430, width: 825 }}>
          Pregúntenle esta semana qué anota a mano.
        </p>
        <p className="zh-lectura" style={{ position: 'absolute', right: derecha, bottom: abajo, lineHeight: 1 }}>
          zhonyas.com
        </p>
      </div>
    </LogoCinta>
  );
}

export default definirPieza({
  titulo: 'Cierre · vuelve el monograma y la Z se desenrolla (GUION 20)',
  movimiento: 'Z-02',
  notas: 'Paso 0: el logo como en la portada. Paso 1: Z-02 (1,2 s) y, al terminar, el texto por corte. Sin QR todavía (M-08).',
  pasos: 1,
  Componente: Cierre,
});
