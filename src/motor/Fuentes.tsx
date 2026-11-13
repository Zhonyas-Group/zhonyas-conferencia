/**
 * Panel «Fuentes» del presentador: de dónde sale lo que está en pantalla,
 * aparte de las notas (01 P1-16). Junta las cifras de la diapositiva (cada
 * <Dato>, con su fuente, su fecha y su cuidado) y sus `fuentes` escritas a mano.
 */
import { datosDeDiapositiva, useDatosVistos } from './Dato';
import type { Diapositiva } from './tipos';

export function hayFuentes(d: Diapositiva): boolean {
  return (d.fuentes?.length ?? 0) > 0 || datosDeDiapositiva(d).length > 0;
}

export function Fuentes({ diapositiva }: { diapositiva: Diapositiva }) {
  useDatosVistos();
  const datos = datosDeDiapositiva(diapositiva);
  const libres = diapositiva.fuentes ?? [];
  return (
    <ul className="fuentes">
      {datos.map((d) => (
        <li key={d.id} className="fuentes__dato" data-estado={d.estado}>
          <span className="fuentes__valor">{d.valor}</span> {d.texto}.{' '}
          <span className="fuentes__origen">
            {d.fuente} ({d.fecha}).
          </span>
          {d.estado !== 'confirmado' && <strong className="fuentes__aviso"> Por confirmar.</strong>}
          {d.nota && <span className="fuentes__nota"> Ojo: {d.nota}</span>}
        </li>
      ))}
      {libres.map((texto) => (
        <li key={texto} className="fuentes__libre">
          {texto}
        </li>
      ))}
    </ul>
  );
}
