/**
 * Laboratorio de Z-07 · Encender una pieza (encender.entrada.ts, Encender.tsx).
 *
 * Tres portadas apagadas (gris al 65 %). Paso 1: se enciende Lendex. Paso 2:
 * Lendex se apaga (al revés, mismos tiempos) y se enciende Pymex. Paso 3: lo
 * mismo con Matriz ZH. Como la galería de disciplinas de la web
 * (investigacion/movimiento/07-proyectos-cuadricula.png), pero por paso.
 *
 * Las portadas son las de zhonyas.com, copiadas en investigacion/marca/proyectos/.
 * El hueco entre las tres, el de la cuadrícula de la web: clamp(0.8rem, 1.5vw,
 * 1.5rem) = 24 px a 1920 (project-gallery.css:2).
 */
import { definirPieza } from '../../../motor/laboratorio/tipos';
import { Titular } from '../../composiciones';
import { Encender } from './Encender';
import lendex from '../../../../investigacion/marca/proyectos/lendex/hero.webp';
import pymex from '../../../../investigacion/marca/proyectos/pymex/cover.webp';
import matriz from '../../../../investigacion/marca/proyectos/matriz-zh/cover.webp';

const piezas = [
  // La portada de Lendex es la de la tarjeta SaaS de la web, con su encuadre: object-position 36% center
  // (project-gallery.css:36). Así se compara con 07-proyectos-cuadricula.png con la misma parte de la imagen.
  { nombre: 'Lendex', src: lendex, posicion: '36% center' },
  { nombre: 'Pymex', src: pymex, posicion: undefined },
  { nombre: 'Matriz ZH', src: matriz, posicion: undefined },
];

function Escena() {
  return (
    <div className="zh-reticula" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--zh-hueco-dividida)' }}>
      <Titular>Se enciende un producto en cada paso</Titular>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 /* project-gallery.css:2 */, minHeight: 0 }}>
        {piezas.map((p, i) => (
          <Encender
            key={p.nombre}
            desde={i + 1}
            hasta={i + 1 < piezas.length ? i + 1 : undefined}
            texto={<p className="zh-lectura zh-lectura--fuerte">{p.nombre}</p>}
          >
            <img
              src={p.src}
              alt={`Portada de ${p.nombre}`}
              data-lab={`portada-${i + 1}`}
              style={p.posicion ? { objectPosition: p.posicion } : undefined}
            />
          </Encender>
        ))}
      </div>
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-07 · Encender una pieza',
  movimiento: 'Z-07',
  notas:
    'Comparar con investigacion/movimiento/07-proyectos-cuadricula.png: color en 600 ms ease, escala 1 → 1,055 en 900 ms ' +
    '(0.22, 1, 0.36, 1) y texto que sube 27,2 px en 450 ms ease (project-gallery.css:31-32, 43, 48, 52). Al pasar, la anterior se apaga al revés.',
  escenas: [
    {
      id: 'encender-lab',
      pasos: 3,
      Componente: Escena,
      excepcionA54: 'Laboratorio de Z-07: encender y apagar tres piezas, una por paso, es el uso para el que existe.',
    },
  ],
});
