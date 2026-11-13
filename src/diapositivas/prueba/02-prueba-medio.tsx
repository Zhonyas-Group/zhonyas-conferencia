/**
 * PRUEBA del motor: imagen grande (3840×2160) y video local. Es del mazo de prueba del motor (prueba/indice.ts), no de la charla.
 */
import { definirDiapositiva } from '../../motor/tipos';
import { Entrada } from '../../motor/Entrada';
import { medio } from '../../motor/medios';
import { Video } from '../../motor/Video';
import './prueba.css';

function PruebaMedio() {
  return (
    <>
      <img className="prueba-medio__imagen" src={medio('medios/prueba/imagen-grande.webp')} alt="" decoding="async" draggable={false} />
      <div className="prueba">
        <span className="prueba__sello">PRUEBA</span>
        <h1 className="prueba__titulo">Imagen grande y video local</h1>
        <p className="prueba__bajada">Todo sale de la carpeta medios/, sin internet.</p>
      </div>
      <Entrada desde={1} className="prueba-medio__video">
        <Video src="medios/prueba/video.webm" poster="medios/prueba/video-poster.webp" />
      </Entrada>
      <Entrada desde={1} className="prueba-medio__pie">
        Video WebM de 4 s en bucle. Se congela al salir de la diapositiva y vuelve a empezar al regresar.
      </Entrada>
    </>
  );
}

export default definirDiapositiva({
  id: 'prueba-medio',
  titulo: 'PRUEBA · imagen y video',
  pasos: 1,
  orador: 'jose',
  duracion: 45,
  notas: `
    Prueba de **medios locales**.

    Paso 0: imagen de 3840×2160 a pantalla completa (debe verse nítida en el proyector).
    Paso 1: aparece el video, que se reproduce solo mientras esta diapositiva está en pantalla.

    Al avanzar cambia el orador: le toca al Orador 2.
  `,
  medios: ['medios/prueba/imagen-grande.webp', 'medios/prueba/video.webm', 'medios/prueba/video-poster.webp'],
  Componente: PruebaMedio,
});
