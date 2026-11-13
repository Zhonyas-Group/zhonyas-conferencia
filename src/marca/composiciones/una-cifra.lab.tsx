/**
 * Laboratorio de la composición Una cifra (UnaCifra.tsx).
 *
 * Paso 0: el titular. Paso 1: la cifra a 300 px y su fuente
 * entran juntas con Z-01 (cifra.entrada.ts).
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { UnaCifra } from './UnaCifra';

function Escena() {
  return (
    <UnaCifra
      dato="mipymes-efectivo"
      desde={1}
      titular="Casi todas las mipymes usan efectivo"
    />
  );
}

export default definirPieza({
  titulo: 'Composición · Una cifra',
  movimiento: 'Z-01',
  notas: 'Titular en 115, 115; la cifra a la izquierda, en medio; la fuente abajo, a 32 px. Paso 1: entran con Z-01.',
  pasos: 1,
  Componente: Escena,
});
