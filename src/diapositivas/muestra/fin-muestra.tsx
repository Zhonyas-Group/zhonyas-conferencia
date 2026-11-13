/**
 * Cierre de la muestra (solo en dist-muestra, rama diseno-wow). Sin esta
 * tarjeta, la 11 era la última y → no hacía nada: parecía trabada.
 *
 * Paso 0: el titular sale palabra a palabra con «muestra.» en aurora y caen
 * los tres oradores en píxeles, que saludan una vez (lo mismo de la portada).
 */
import { Personaje } from '../../marca/relevo/Personaje';
import { Palabras } from '../../marca/wow';
import { Entrada } from '../../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';
import './fin-muestra.css';

const TRES = ['jose-leonardo', 'gregory', 'angel'] as const;

function FinMuestra(_: PropsDiapositiva) {
  return (
    <div className="fin-muestra">
      <Entrada desde={0} efecto="palabras" className="fin-muestra__titular">
        <h1 className="zh-titular">
          <Palabras texto="Hasta aquí la muestra." clave={['muestra.']} />
        </h1>
      </Entrada>
      <p className="zh-fuente fin-muestra__nota">Las otras 12 diapositivas se rehacen con esta misma dirección.</p>
      <Entrada desde={0} efecto="caer" className="fin-muestra__tres">
        <span data-retraso="600" hidden />
        {TRES.map((atlas, i) => (
          <span key={atlas} className="fin-muestra__persona" data-cae="" style={{ ['--orden' as string]: i }}>
            <Personaje atlas={atlas} animacion="wave" vueltas={1} luego="front" escala={0.7} />
          </span>
        ))}
      </Entrada>
    </div>
  );
}

export default definirDiapositiva({
  id: 'fin-muestra',
  titulo: 'Fin de la muestra',
  orador: 'angel',
  duracion: 5,
  pasos: 0,
  notas: [{ decir: 'Fin de la muestra: con ← se vuelve a cualquiera de las seis.', claves: 'fin de la muestra' }],
  fuentes: [],
  Componente: FinMuestra,
});
