/**
 * Vitrina · «Lo que construimos» (rama diseno-wow, 13-nov). La puerta de las
 * diapositivas de producto: los cinco sitios en vivo, cada uno en su ventana,
 * vuelan uno detrás de otro y quedan en arco. Los nombres son los de la web
 * (lib/projects.ts) y las capturas, de los sitios de verdad
 * (scripts/vitrina-sitios.mjs, 13-nov). Pymex sale de la portada de la web:
 * ese día pymex.zhonyas.com daba «Bad gateway».
 */
import { Galeria, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

/** Cinco ventanas de 440 px en arco: centros cada 312,5 px entre los márgenes de 115. */
const PIEZAS = [
  { nombre: 'Lendex', url: 'lendexgp.com', imagen: 'medios/vitrina/sitios/lendex-sin-precios.jpg', x: 115, y: 470, giro: 16 },
  { nombre: 'Pymex', url: 'pymex.zhonyas.com', imagen: 'medios/vitrina/pymex-portada.webp', x: 427, y: 445, giro: 8 },
  { nombre: 'Matriz ZH', url: 'matriz.zhonyas.com', imagen: 'medios/vitrina/sitios/matriz.jpg', x: 740, y: 430, giro: 0 },
  { nombre: 'Cantus', url: 'set-coro.zhonyas.com', imagen: 'medios/vitrina/sitios/cantus.jpg', x: 1052, y: 445, giro: -8 },
  { nombre: 'Suplidora Cuqui', url: 'suplidoracuqui.zhonyas.com', imagen: 'medios/vitrina/sitios/cuqui.jpg', x: 1365, y: 470, giro: -16 },
] as const;
const ANCHO = 440;
const ALTO = 275;

function Construimos(_: PropsDiapositiva) {
  return (
    <Galeria
      titular="Lo que construimos."
      clave={['construimos.']}
      color="#a975ff"
      orador="jose-leonardo"
      animacion="type"
      nombres={PIEZAS.map((p) => [p.nombre, p.x + ANCHO / 2, p.y + ALTO + 46 + 34] as const)}
    >
      {PIEZAS.map((p, i) => (
        <Ventana
          key={p.nombre}
          url={p.url}
          imagen={p.imagen}
          x={p.x}
          y={p.y}
          ancho={ANCHO}
          alto={ALTO}
          giro={p.giro}
          orden={i}
          fase={i * 1.7}
          capa={i === 2 ? 3 : i === 1 || i === 3 ? 2 : 1}
        />
      ))}
    </Galeria>
  );
}

export default definirDiapositiva({
  id: 'vitrina-construimos',
  titulo: 'Lo que construimos',
  orador: 'jose',
  duracion: 30,
  pasos: 0,
  notas: [
    {
      decir:
        'Esto es lo que hemos construido: Lendex, Pymex, Matriz ZH, Cantus y la página de Suplidora Cuqui. Todo está en línea. Les enseño los dos primeros por dentro.',
      claves: 'cinco cosas en línea · los dos primeros por dentro',
    },
  ],
  fuentes: ['Nombres y direcciones de lib/projects.ts de zhonyas-web; capturas de los sitios en vivo del 13-nov (scripts/vitrina-sitios.mjs).'],
  medios: PIEZAS.map((p) => p.imagen),
  Componente: Construimos,
});
