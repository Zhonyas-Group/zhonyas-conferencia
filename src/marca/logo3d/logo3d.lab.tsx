/**
 * Z-09 · el logo 3D en vivo. Paso 0: quieto, en reposo (rotateX(-8deg)
 * rotateY(-16deg)). Con el ratón encima sigue al puntero (±18° / ±24°); al
 * arrastrar, 0,36°/px y 0,28°/px; al salir, vuelve al reposo en 160 ms ease-out.
 * Comparar con investigacion/movimiento/08b-visor-3d.png y marca/referencias/logo-3d.png.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { Logo3D } from './Logo3D';

function Escena() {
  return (
    <div className="zh-reticula" style={{ display: 'grid', placeItems: 'center' }}>
      <Logo3D style={{ width: 1014 }} />
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-09 · Logo 3D en vivo (sin WebGL)',
  movimiento: 'Z-09',
  notas: 'Mover el ratón por encima y arrastrar. Sin entrada, sin rótulo y sin halos (con halo: <Logo3D halo />).',
  pasos: 0,
  Componente: Escena,
});
