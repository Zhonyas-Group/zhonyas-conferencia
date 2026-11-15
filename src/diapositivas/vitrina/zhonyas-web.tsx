/**
 * Vitrina · zhonyas.com (rama diseno-wow, 13-nov). La web del estudio («Nuestra web»: «zhonyas.com» a 128 px no cabe en la
 * columna de 700) en una ventana grande que se recorre sola de verdad: un video de la página en vivo
 * bajando de principio a fin (el logo, la cinta, «Nosotros», el equipo,
 * Servicios, Proyectos y la galaxia de Contacto), grabado con
 * scripts/vitrina-grabar-web.mjs el 13-nov. La presenta Angel. Sus notas no
 * dicen quién hizo los personajes ni el agujero negro (José, 14-nov: «quita lo
 * de que él fue quien hizo los 3D»).
 */
import { Producto, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const VIDEO = 'medios/vitrina/videos/zhonyas-web.webm';
const POSTER = 'medios/vitrina/videos/zhonyas-web.jpg';

function ZhonyasWeb(_: PropsDiapositiva) {
  return (
    <Producto
      nombre="Nuestra web"
      promesa="De una idea a algo extraordinario."
      clave={['extraordinario.']}
      queHace="Todo se mueve, y cada uno del equipo tiene su personaje."
      direccion="zhonyas.com"
      color="#d65be9"
      orador="angel"
    >
      <Ventana url="zhonyas.com" video={VIDEO} poster={POSTER} x={830} y={190} ancho={980} alto={613} giro={-6} orden={0} />
    </Producto>
  );
}

export default definirDiapositiva({
  id: 'vitrina-zhonyas-web',
  titulo: 'zhonyas.com',
  orador: 'angel',
  duracion: 60,
  pasos: 0,
  notas: [
    {
      decir:
        'Esta es nuestra web, zhonyas.com. Cada uno del equipo tiene su muñequito, y al final, en Contacto, se abre un agujero negro. Todo lo que ven se mueve en el navegador, sin videos.',
      claves: 'zhonyas.com · los muñequitos · el agujero negro al final',
      aparte: 'El video dura 51 s y vuelve a empezar: el agujero negro y la galaxia salen al final.',
    },
  ],
  fuentes: ['Lema: el pie de zhonyas.com («De una idea a algo extraordinario.»).'],
  medios: [VIDEO, POSTER],
  Componente: ZhonyasWeb,
});
