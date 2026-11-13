/**
 * Vitrina · Lendex (rama diseno-wow, 13-nov). Detrás, lendexgp.com en una
 * ventana que recorre la página sola (cortada antes de los precios: en la
 * charla no van precios); delante, el teléfono con el video «Renegociar un
 * préstamo» que José grabó el 13-nov, recortado a la pantalla del teléfono
 * que el video trae dibujado (x 150, y 128, 780 × 1580 de 1080 × 1920).
 */
import { Producto, Telefono, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const VIDEO = 'medios/vitrina/videos/lendex-renegociar.mp4';
const POSTER = 'medios/vitrina/videos/lendex-renegociar.jpg';
const PAGINA = 'medios/vitrina/sitios/lendex-sin-precios.jpg';
const PANTALLA = { x: 150, y: 128, ancho: 780, alto: 1580, anchoVideo: 1080 };

function Lendex(_: PropsDiapositiva) {
  return (
    <Producto
      nombre="Lendex"
      promesa="Tu negocio de préstamos, ordenado y rentable."
      clave={['rentable.']}
      queHace="Préstamos y cobranzas, bajo control."
      direccion="lendexgp.com"
      // auditar-excepcion-inicio: A-34 — el verde de la marca de Lendex (lendexgp.com), solo en el brillo y el marco
      color="#12a57c"
      // auditar-excepcion-fin
      orador="jose-leonardo"
    >
      <Ventana url="lendexgp.com" imagen={PAGINA} x={860} y={150} ancho={800} alto={600} recorrido={45} giro={-8} orden={0} />
      <Telefono video={VIDEO} poster={POSTER} recorte={PANTALLA} x={1470} y={210} ancho={330} giro={-16} orden={1} fase={2.5} capa={2} />
    </Producto>
  );
}

export default definirDiapositiva({
  id: 'vitrina-lendex',
  titulo: 'Lendex',
  orador: 'jose',
  duracion: 40,
  pasos: 0,
  notas: [
    {
      decir:
        'Lendex: el programa del prestamista. Lleva los préstamos y los cobros que hoy apunta en un cuaderno. En el teléfono: renegociar un préstamo y mandarle el plan nuevo al cliente por WhatsApp.',
      claves: 'el prestamista · el cuaderno · renegociar · WhatsApp',
      siFalla: 'Si el video no carga, se ve su fotograma fijo; la página sigue bajando sola.',
    },
  ],
  fuentes: [
    'Promesa: la portada de lendexgp.com («Tu negocio de préstamos, ordenado y rentable.»); lo que hace: lib/projects.ts de zhonyas-web.',
    'Video: «Lendex - Renegociar prestamo», grabado por José el 13-nov-2026 (datos de demostración).',
  ],
  medios: [VIDEO, POSTER, PAGINA],
  Componente: Lendex,
});
