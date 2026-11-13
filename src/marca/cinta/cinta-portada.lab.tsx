/**
 * La portada (síntesis §4.3; 03 M1): el logo quieto como queda zhonyas.com
 * después de hidratarse. Caja SVG del alto de la pantalla, viewBox «0 0 1254
 * 1254», con veta y sombra. Sin animación de entrada.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { Monograma } from './LogoCinta';

function Portada() {
  return <Monograma />;
}

export default definirPieza({
  titulo: 'Portada · el monograma quieto',
  movimiento: 'M1 (sin movimiento)',
  notas: 'Comparar con investigacion/movimiento/01-logo-carga.png (después de hidratar) y con marca/logo/zhonyas-logo-escena.svg.',
  pasos: 0,
  Componente: Portada,
});
