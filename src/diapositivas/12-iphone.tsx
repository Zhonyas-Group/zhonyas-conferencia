/**
 * 12 · iphone · Angel · 35 s (docs/GUION.md, «12 · iphone»).
 * Composición: dividida 1,2:0,8 con las medidas del guion: el titular a la
 * izquierda, en la columna de 1014 px y en dos líneas; la grabación a la
 * derecha, en 676 × 850 (x 1129, y 115), el 40 % del área útil (A-24). La
 * pieza <Dividida> da 985 : 657 con hueco de 48 px y la grabación no cabe a
 * 676: aquí se coloca a mano con el <Titular> de la marca (ver el informe).
 * El crédito, abajo en la columna del texto (y 965), alineado con el pie de la grabación.
 *
 * Movimiento: Z-12. Lo que se mueve es la grabación: corre una vez y se queda
 * en su último cuadro. El mazo no anima nada (sin momentos, A-54).
 *   - Paso 0: el titular y el póster.
 *   - Paso 1: corre la grabación (por corte: el primer cuadro es el póster).
 *
 * M-05 (el iPhone que se cierra solo): `iphone` de src/medios-opcionales.ts,
 * en public/medios/iphone/ (docs/MEDIOS.md). Si no llega, esta diapositiva no
 * entra en el índice (indice.ts) y la 11 suma 10 s. Para construirla sin el
 * video: `?con=M-05` en desarrollo.
 */
import { iphone, mediosDe } from '../medios-opcionales';
import { Titular } from '../marca/composiciones';
import { Entrada } from '../motor/Entrada';
import { medio } from '../motor/medios';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { Video } from '../motor/Video';
import './12-iphone.css';

function Iphone(_: PropsDiapositiva) {
  return (
    <div className="zh-reticula iphone">
      <Titular className="iphone__titular">En el iPhone, se cerraba solo.</Titular>
      <p className="zh-fuente iphone__credito">Grabación de pantalla de un iPhone, versión anterior al arreglo</p>
      {iphone.video && iphone.poster ? (
        <>
          <Entrada desde={0} hasta={0} className="iphone__grabacion">
            <img src={medio(iphone.poster)} alt="" decoding="async" draggable={false} />
          </Entrada>
          <Entrada desde={1} className="iphone__grabacion">
            <Video src={iphone.video} poster={iphone.poster} bucle={false} />
          </Entrada>
        </>
      ) : null}
    </div>
  );
}

export default definirDiapositiva({
  id: 'iphone',
  titulo: 'El iPhone',
  orador: 'angel',
  duracion: 35,
  pasos: 1,
  notas: [
    {
      decir: 'De los tres arreglos, este es el que más me enseñó. Miren lo que veía cualquiera que entrara desde un iPhone.',
      claves: 'el que más me enseñó · clic',
    },
    {
      decir:
        '**Después del video:** Safari esconde su barra cuando uno baja, la pantalla cambia de alto y el agujero lo tomaba como la señal de cerrarse. En mi computadora eso no pasa, así que yo nunca lo vi.',
      claves: 'la barra de Safari · cambia de alto · yo nunca lo vi',
      aparte: '**[CONFIRMAR con Angel la explicación].**',
      siFalla:
        'Si en vivo no arranca, Angel lo cuenta sobre el póster. Si no se grabó a tiempo, la diapositiva se cae y Angel lo cuenta en el paso 2 de la 11, que suma 10 s.',
    },
  ],
  // auditar-excepcion: A-34 «#105» es un número de commit, no un color
  fuentes: ['Commit #105 y PR #2 y #3 de zhonyas-web, 2-oct-2026 (08 §2).'],
  medios: mediosDe(iphone),
  Componente: Iphone,
});
