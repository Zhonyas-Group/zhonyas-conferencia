/**
 * Vitrina · Pymex (rama diseno-wow, 13-nov). Detrás, su página en una ventana
 * (la portada de la web: pymex.zhonyas.com daba «Bad gateway» el 13-nov);
 * delante, su video promocional, el que publicaron en LinkedIn el 24-sep
 * (720 × 720, 27 s), que se reproduce solo y en bucle. La ventana enseña
 * otra parte de su página: la portada ya sale dentro del video.
 */
import { Producto, TarjetaVideo, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const VIDEO = 'medios/vitrina/videos/pymex-promo.mp4';
const POSTER = 'medios/vitrina/videos/pymex-promo.jpg';
/** La sección «Un flujo que habla el idioma de tu negocio» de su página (la portada ya sale en el video). */
const PAGINA = 'medios/pymex/pagina-publica.webp';

function Pymex(_: PropsDiapositiva) {
  return (
    <Producto
      nombre="Pymex"
      promesa="Menos caos. Más negocio."
      clave={['negocio.']}
      queHace="Inventario, ventas y caja en un solo lugar."
      direccion="pymex.zhonyas.com"
      // auditar-excepcion-inicio: A-34 — el azul de la marca de Pymex (reference_pymex_marca), solo en el brillo y el marco
      color="#0C5FFE"
      // auditar-excepcion-fin
      orador="gregory"
    >
      <Ventana url="pymex.zhonyas.com" imagen={PAGINA} x={850} y={130} ancho={720} alto={405} giro={-6} orden={0} />
      <TarjetaVideo video={VIDEO} poster={POSTER} proporcion={1} x={1200} y={330} ancho={620} giro={-12} orden={1} fase={2.5} capa={2} />
    </Producto>
  );
}

export default definirDiapositiva({
  id: 'vitrina-pymex',
  titulo: 'Pymex',
  orador: 'gregory',
  duracion: 40,
  pasos: 0,
  notas: [
    {
      decir:
        'Pymex: inventario, ventas y caja en un solo lugar, para el negocio que hoy lo lleva en una libreta. Es nuestro proyecto final del ITLA. El video lo hicimos para lanzarlo.',
      claves: 'inventario, ventas y caja · la libreta · proyecto final',
      siFalla: 'Si el video no carga, se ve su fotograma fijo y la página detrás: se sigue igual.',
    },
  ],
  fuentes: [
    'Promesa y lema: reference_pymex_marca («Menos caos. Más negocio.»); lo que hace: lib/projects.ts de zhonyas-web.',
    'Video: la publicación de Zhonyas en LinkedIn del 24-sep-2026 (720p).',
  ],
  medios: [VIDEO, POSTER, PAGINA],
  Componente: Pymex,
});
