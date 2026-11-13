/**
 * 13 · celular-de-otro · Angel · 55 s (docs/GUION.md, «13 · celular-de-otro»).
 * Composición: a sangre. El titular arriba (x 115, y 115), en dos líneas, y
 * el video de 16:9 debajo (1102 × 620 en x 115, y 345, hasta y 965). El
 * crédito, bajo el video y en una línea (y 981), como en la 02, la 06, la 08
 * y la 19 (13-celular-de-otro.css).
 *
 * Movimiento: Z-12. Lo que se mueve es el video: corre una vez y se queda en
 * su último cuadro. El titular entra con corte, sin animación, para que el
 * único momento sea el video (el mazo no anima nada: sin momentos, A-54).
 *
 * Con el video (M-06): pasos 0, el póster (una mano con el celular), sin
 * titular; 1, corre el video; 2, el titular. 55 s.
 * Sin el video (el estado de hoy, «Si falla» del guion): la 13 va sin el paso
 * del video, con los pasos 0 y 2 del guion: 0, la pantalla sin nada mientras
 * Angel hace la pregunta al público; 1, el titular solo. 45 s.
 *
 * M-06: `celular.video` (public/medios/celular/celular-de-otro.mp4 y su
 * póster) y el nombre de su dueño, `celular.nombre` (public/medios/celular/
 * nombre.txt), que sale en el crédito y en las notas (docs/MEDIOS.md). Al
 * dejarlos ahí y volver a compilar, la diapositiva cambia sola. Si llega el
 * video sin el nombre, el video sale sin crédito (nunca «[nombre]» en
 * pantalla) y el presentador lo avisa, como la libreta sin su crédito (M-01).
 */
import { celular, mediosDe } from '../medios-opcionales';
import { Titular } from '../marca/composiciones';
import { Entrada } from '../motor/Entrada';
import { medio } from '../motor/medios';
import { definirDiapositiva, type NotaPaso, type PropsDiapositiva } from '../motor/tipos';
import { Video } from '../motor/Video';
import './13-celular-de-otro.css';

const nombre = celular.nombre.texto ?? '[nombre]';
const conVideo = celular.video.hay;
/** El paso del titular: el 2 del guion, o el 1 si no hay video. */
const PASO_TITULAR = conVideo ? 2 : 1;

function CelularDeOtro(_: PropsDiapositiva) {
  const { video, poster } = celular.video;
  return (
    <div className="zh-reticula celular">
      {/* En la retícula, el titular empieza en x 115, y 115 (síntesis §4.3). */}
      <Entrada desde={PASO_TITULAR}>
        <Titular>Está terminado cuando funciona en el celular de otro.</Titular>
      </Entrada>
      {conVideo && video && poster ? (
        <>
          <Entrada desde={0} hasta={0} className="celular__video">
            <img src={medio(poster)} alt="" decoding="async" draggable={false} />
          </Entrada>
          <Entrada desde={1} className="celular__video">
            <Video src={video} poster={poster} bucle={false} />
          </Entrada>
          {/* Sin nombre.txt no se pinta «[nombre]» delante de la sala: el crédito no sale y el presentador avisa (medios-opcionales.ts). */}
          {celular.nombre.hay ? <p className="zh-fuente celular__credito">El celular de {nombre}, que no es del equipo, nov 2026</p> : null}
        </>
      ) : null}
    </div>
  );
}

const PREGUNTA: NotaPaso = {
  decir: 'Una pregunta: levanten la mano los que han entregado algo que en su computadora funcionaba y en la del profesor no.',
  claves: 'esperar · «Yo también.» · clic',
  ...(conVideo
    ? { aparte: '**Pregunta al público.**' }
    : {
        despues: `**Luego, en lugar del video:** «En el celular de ${nombre} todavía no abre bien, y lo estoy arreglando.»`,
        aparte: '**Pregunta al público.**\n\n**Sin el video (M-06):** la 13 va sin video, con el titular solo en el clic siguiente.',
      }),
};

const VIDEO: NotaPaso = {
  decir: `Este es el celular de ${nombre}, que no es del equipo: zhonyas.com, Contacto, y abre como tiene que abrir.`,
  claves: 'el celular de otro · abre bien',
  siFalla: `Si el video no arranca, sale el póster y Angel lo cuenta. Si en el celular prestado no abrió bien al grabar, no se busca otro: se arregla. Si no da tiempo, la 13 va sin video (pasos 0 y 2, con el titular solo), y en lugar del paso 1 Angel dice: «En el celular de ${nombre} todavía no abre bien, y lo estoy arreglando.»`,
};

const TITULAR: NotaPaso = {
  decir: 'Lo que me llevo de esos 25 días: está terminado cuando funciona en el celular de otro.',
  claves: 'préstenselo · sin ayudarle · si falla, se arregla · entregar el clicker',
  despues:
    '**Remate:** «Antes de entregar, préstenselo a alguien con otro teléfono y mírenlo usarlo sin ayudarle. Y si ahí falla, no busquen otro teléfono: arréglenlo. José.»',
};

export default definirDiapositiva({
  id: 'celular-de-otro',
  titulo: 'El celular de otro',
  orador: 'angel',
  duracion: conVideo ? 55 : 45,
  pasos: conVideo ? 2 : 1,
  notas: conVideo ? [PREGUNTA, VIDEO, TITULAR] : [PREGUNTA, TITULAR],
  fuentes: ['Ninguna cifra en pantalla. Los 25 días se dicen en voz y no se repiten en pantalla (A-69).'],
  medios: mediosDe(celular.video),
  Componente: CelularDeOtro,
});
