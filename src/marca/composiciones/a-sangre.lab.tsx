/**
 * Laboratorio de la composición A sangre (ASangre.tsx).
 *
 * Paso 0: una captura de 1920 × 1080 a sangre, con el titular y la fuente
 * encima, en el margen, sobre la parte oscura de la captura (se cumple 7:1).
 * Paso 1: otra captura, clara donde va el texto: en desarrollo sale A PROPÓSITO
 * el aviso de contraste por debajo de 7:1 (revisar.ts), para ver que la
 * comprobación funciona.
 *
 * Capturas de investigacion/productos/ (04-productos.md).
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { ASangre } from './ASangre';
import cantus from '../../../investigacion/productos/cantus/escritorio-acceso.png';
import matriz from '../../../investigacion/marca/proyectos/matriz-zh/cover.webp';

function Oscura() {
  return (
    <ASangre
      titular="Cantus guarda el repertorio de la banda"
      anchoTitular={900}
      evidencia={<img src={cantus} alt="Pantalla de entrada de Cantus" />}
      fuente="Captura de Cantus, pantalla de entrada, 12-nov-2026"
    />
  );
}

function Clara() {
  return (
    <ASangre
      titular="Esta captura es clara detrás del titular"
      evidencia={<img src={matriz} alt="Portada de Matriz ZH" />}
      fuente="Portada de Matriz ZH en zhonyas.com"
    />
  );
}

export default definirPieza({
  titulo: 'Composición · A sangre',
  notas:
    'Titular en x = 115, y = 115 y fuente abajo a la izquierda a 115 px del borde. Paso 1: aviso de contraste a propósito (captura clara).',
  escenas: [
    { id: 'a-sangre-oscura', pasos: 0, Componente: Oscura },
    { id: 'a-sangre-clara', pasos: 0, Componente: Clara },
  ],
});
