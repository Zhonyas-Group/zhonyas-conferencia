/**
 * Laboratorio de la demo de Lendex: lab.html?pieza=demo-lendex
 *
 * Tres escenas, como en la charla: la anterior (con la demo ya cargándose
 * debajo, como vecina), la demo y la siguiente (al llegar, el iframe queda
 * inert y el teclado vuelve a la charla).
 *
 *   paso 0  escena anterior
 *   paso 1  la demo: Lendex en vivo (necesita internet); V pasa al video
 *   paso 2  escena siguiente
 *
 * Variantes por la dirección:
 *   &presentador=1   lo que enseña la ventana del presentador (póster y aviso)
 *   &revision=1      lo que sale en capturas y PDF (el póster)
 *
 * Con el equipo sin red, la demo enseña el video sola.
 * Prueba automática: node scripts/lendex-probar-demo.mjs --url http://localhost:5305/lab.html
 */
import { registrarProblema } from '../../motor/diagnostico';
import { definirPieza } from '../../motor/laboratorio/tipos';
import { revisarDiapositiva } from '../../motor/revisar';
import { definirDiapositiva } from '../../motor/tipos';
import { DemoLendex, FUENTES_DEMO_LENDEX, MEDIOS_DEMO_LENDEX, NOTA_DEMO_LENDEX } from './DemoLendex';

/**
 * La diapositiva tal como irá en src/diapositivas/ (ejemplo completo). Sin
 * `pesada`: el presentador tiene que montar la pieza para oír V y decir el modo.
 */
const demo = definirDiapositiva({
  id: 'demo-lendex',
  titulo: 'Demo en vivo: la calculadora de Lendex',
  pasos: 0,
  orador: 'jose',
  duracion: 100, // síntesis §8, arco A, diapositiva 18 (100 s); los arcos B y C le dan 110
  medios: MEDIOS_DEMO_LENDEX,
  notas: [NOTA_DEMO_LENDEX],
  fuentes: FUENTES_DEMO_LENDEX,
  Componente: DemoLendex,
});
// Las mismas comprobaciones que el motor hace con el índice (notas por paso, palabras, orador…).
revisarDiapositiva(demo, 'demo-lendex (laboratorio)').forEach(registrarProblema);

function Antes() {
  return (
    <div className="zh-reticula">
      <p className="zh-fuente">Escena anterior: la demo se carga debajo.</p>
    </div>
  );
}

function Despues() {
  return (
    <div className="zh-reticula">
      <p className="zh-fuente">Escena siguiente.</p>
    </div>
  );
}

export default definirPieza({
  titulo: 'Demo en vivo de Lendex, con video a una tecla (V)',
  movimiento: 'Z-12',
  notas:
    'Z-12: se mueve Lendex, no la pieza. Lo vivo y el video cambian con un corte (Z-00). Comparar el vivo con public/medios/lendex/demo-poster.webp: mismo encuadre.',
  escenas: [
    { id: 'antes', pasos: 0, Componente: Antes },
    demo,
    { id: 'despues', pasos: 0, Componente: Despues },
  ],
});
