/**
 * 06 · libreta · Gregory · 50 s (docs/GUION.md, «06 · libreta»).
 * Composición: a sangre y sin titular (la foto en 1690×850). Movimiento: ninguno (entra con el corte).
 *
 * M-01 (la libreta): `libreta.grande`, el segundo recorte, en 1690 × 850 en
 * x 115, y 115, con el crédito de la 02 (`libreta.credito`) a 32 px debajo.
 * Es la respuesta, en imagen, a la pregunta de la 05 (R-15, A-04).
 *
 * Si no llega (hoy), la 06 va en negro mientras habla Gregory: no se pinta
 * nada, ni el crédito. Al dejar public/medios/libreta/libreta-1690x850.webp
 * y credito.txt y volver a compilar, sale la foto sin tocar este archivo
 * (src/medios-opcionales.ts; docs/MEDIOS.md).
 */
import { libreta, mediosDe } from '../medios-opcionales';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './historia-gregory.css';

/** La caja de la foto (docs/GUION.md, 06: «1690×850, en x 115, y 115»). */
const FOTO = { left: 115, top: 115, width: 1690, height: 850 } as const;
/** El crédito, 16 px bajo la foto (historia-gregory.css, .hg-credito). */
const CREDITO_TOP = FOTO.top + FOTO.height + 16;

function Libreta(_: PropsDiapositiva) {
  if (!libreta.grande.src) return null;
  return (
    <>
      <div className="hg-evidencia" style={FOTO}>
        <img
          src={libreta.grande.src}
          alt="La libreta de un negocio cercano, abierta en una página de fiado o de ventas"
          decoding="async"
          draggable={false}
        />
      </div>
      {libreta.credito.texto ? (
        <p className="zh-fuente hg-credito" style={{ top: CREDITO_TOP }}>
          {libreta.credito.texto}
        </p>
      ) : null}
    </>
  );
}

const sinFoto = libreta.grande.hay ? '' : '\n\n**Sin la foto de la libreta (M-01):** la 06 va en negro mientras habla Gregory.';
const CONFIRMAR =
  '**[CONFIRMAR con Gregory]** Si tiene una escena real con un dueño y su libreta, va aquí en una frase. Si no la tiene, no se dice nada.';

export default definirDiapositiva({
  id: 'libreta',
  titulo: 'La libreta',
  orador: 'gregory',
  duracion: 50,
  pasos: 0,
  notas: [
    {
      decir: 'Eso ya lo contestaron ustedes con la mano arriba: en una libreta.',
      claves: 'la mano arriba · no se cae · vuelve a la libreta · tres preguntas',
      despues:
        '**Remate:** «Y esa libreta es la competencia más dura de Pymex: no se cae y todo el mundo sabe usarla. Si Pymex es más difícil que la libreta, el dueño vuelve a la libreta al otro día.»\n\n' +
        '**Para pasar a la 07:** «Pero hay tres preguntas que una libreta no contesta. Las publicamos en septiembre, y se las enseño en Pymex.»',
      aparte: CONFIRMAR + sinFoto,
    },
  ],
  fuentes: [
    '«En una libreta» no sale de la ENMIPYMES: lo contestó la sala en la 02, y así se dice. Tampoco se dice que la encuesta no pregunta por los registros: nadie lo comprobó en el PDF.',
    'Las tres preguntas son de la publicación de Zhonyas en LinkedIn del 24-sep-2026: https://es.linkedin.com/posts/zhonyas_tres-preguntas-que-una-libreta-no-contesta-activity-7509097081492402176-FBKV',
    'Va sin titular para que las 10 primeras pantallas no pasen de 40 palabras. La foto ya salió con su frase en la 02.',
    ...(libreta.credito.texto ? [libreta.credito.texto] : []),
  ],
  medios: mediosDe(libreta.grande),
  Componente: Libreta,
});
