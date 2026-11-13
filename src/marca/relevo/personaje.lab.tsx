/**
 * Laboratorio de Z-11 · Personaje: los tres oradores a escala 1 (1 px del
 * atlas = 1 px del escenario), con las animaciones que nombra la síntesis
 * §4.4: paso 0 `wave` (3 cuadros a 6 fps, ida y vuelta), paso 1 `walk`
 * (4 a 8 fps) y paso 2 `type` (2 a 4 fps). Cada paso arranca el ciclo desde
 * su primer cuadro.
 *   npm run lab:cuadros -- --pieza personaje --paso 1 --cada 125 --hasta 1000   (walk: un cuadro cada 125 ms)
 * Es una hoja de prueba, no una diapositiva: los nombres de abajo son rótulos del laboratorio.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import type { PropsDiapositiva } from '../../motor/tipos';
import { EQUIPO, type IdOrador } from './equipo';
import { Personaje, type AnimacionPersonaje } from './Personaje';

const ANIMACIONES: readonly AnimacionPersonaje[] = ['wave', 'walk', 'type'];
const ORADORES: readonly IdOrador[] = ['jose', 'gregory', 'angel'];

function Hoja({ paso }: PropsDiapositiva) {
  const animacion = ANIMACIONES[Math.min(paso, ANIMACIONES.length - 1)];
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Personajes · {animacion}</p>
      {ORADORES.map((id, i) => (
        <div key={id} style={{ position: 'absolute', left: 480 * (i + 1) - 200, top: 360, width: 400, height: 400 }}>
          {/* El personaje pisa el borde de abajo de esta caja (sprite-character.css:4). */}
          <div key={animacion} data-personaje={id} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }}>
            <Personaje atlas={EQUIPO[id].atlas} animacion={animacion} />
          </div>
          <p className="zh-fuente" style={{ position: 'absolute', top: 320, width: '100%', textAlign: 'center' }}>
            {EQUIPO[id].nombre}
          </p>
        </div>
      ))}
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-11 · Personaje de píxeles',
  movimiento: 'Z-11',
  notas:
    'wave: 0 → 1 → 2 → 2 → 1 → 0, un cuadro cada 167 ms (03 M5). walk: 4 cuadros, uno cada 125 ms. type: 2 cuadros, uno cada 250 ms. ' +
    'Comparar con la tira de saludo de investigacion/movimiento/05-equipo-perfil-personaje.png.',
  pasos: 2,
  Componente: Hoja,
});
