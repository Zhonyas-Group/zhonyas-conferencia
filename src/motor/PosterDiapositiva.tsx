/**
 * Una diapositiva pesada (WebGL, filtros SVG, el agujero negro) vista desde el
 * presentador o en una miniatura: su póster quieto en lugar de la escena en
 * vivo (crítica C-02). Todas las ventanas de Chrome comparten la GPU: pintar la
 * escena otra vez en el portátil le quitaría cuadros a la proyección.
 */
import { medio } from './medios';
import type { Diapositiva } from './tipos';

export function PosterDiapositiva({ diapositiva, rotulo }: { diapositiva: Diapositiva; rotulo: boolean }) {
  return (
    <div className="poster-diapositiva" data-poster-de={diapositiva.id}>
      {diapositiva.poster ? (
        <img className="poster-diapositiva__imagen" src={medio(diapositiva.poster)} alt="" decoding="async" draggable={false} />
      ) : (
        <p className="poster-diapositiva__vacio">{diapositiva.titulo}</p>
      )}
      {rotulo && <span className="poster-diapositiva__rotulo">Póster quieto · en la sala se ve en vivo</span>}
    </div>
  );
}
