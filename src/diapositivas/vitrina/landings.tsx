/**
 * Vitrina · Landings (rama diseno-wow, 13-nov). Tres páginas hechas para
 * otros, cada una en su ventana, que se recorren solas a ritmos distintos.
 * El titular es el de la categoría en la web (lib/projects.ts: «Páginas con
 * identidad propia…»). Butterfly Pastry es una demo con datos de ejemplo:
 * se enseña como página, nunca como cliente.
 */
import { Galeria, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const PIEZAS = [
  { nombre: 'Suplidora Cuqui', url: 'suplidoracuqui.zhonyas.com', imagen: 'medios/vitrina/sitios/cuqui.jpg', x: 115, giro: 10, recorrido: 34 },
  { nombre: 'Karla Ventura', url: 'portafolio-creativo-eeba0.web.app', imagen: 'medios/vitrina/sitios/karla.jpg', x: 710, giro: 0, recorrido: 38 },
  { nombre: 'Butterfly Pastry', url: 'butterfly-pastry-demo.web.app', imagen: 'medios/vitrina/sitios/butterfly.jpg', x: 1305, giro: -10, recorrido: 28 },
] as const;
const ANCHO = 500;
const ALTO = 560;
const Y = 300;

function Landings(_: PropsDiapositiva) {
  return (
    <Galeria
      titular="Páginas con identidad propia."
      clave={['propia.']}
      color="#8c73ff"
      orador="angel"
      animacion="draw"
      nombres={PIEZAS.map((p) => [p.nombre, p.x + ANCHO / 2, Y + ALTO + 46 + 34] as const)}
    >
      {PIEZAS.map((p, i) => (
        <Ventana
          key={p.nombre}
          url={p.url}
          imagen={p.imagen}
          x={p.x}
          y={Y}
          ancho={ANCHO}
          alto={ALTO}
          giro={p.giro}
          recorrido={p.recorrido}
          orden={i}
          fase={i * 2.3}
          capa={i === 1 ? 2 : 1}
        />
      ))}
    </Galeria>
  );
}

export default definirDiapositiva({
  id: 'vitrina-landings',
  titulo: 'Landings',
  orador: 'angel',
  duracion: 30,
  pasos: 0,
  notas: [
    {
      decir:
        'Y páginas para otros: la de Suplidora Cuqui, una mueblería de Santiago; el portafolio de Karla Ventura; y Butterfly Pastry, una demo de pastelería. Cada una con su propia cara.',
      claves: 'Cuqui · Karla · Butterfly es demo',
      aparte: 'Butterfly Pastry es una demo con datos de ejemplo: no decir que es un cliente.',
    },
  ],
  fuentes: ['Titular: la categoría «Landings» de lib/projects.ts de zhonyas-web; capturas de los sitios en vivo del 13-nov.'],
  medios: PIEZAS.map((p) => p.imagen),
  Componente: Landings,
});
