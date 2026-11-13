/**
 * PRUEBA del motor: varios pasos («builds»), notas por paso y un dato del
 * registro. Es del mazo de prueba del motor (prueba/indice.ts), no de la charla.
 */
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';
import { Dato } from '../../motor/Dato';
import { Entrada } from '../../motor/Entrada';
import './prueba.css';

const PUNTOS = ['Primer paso: aparece de golpe', 'Segundo: sin animación propia', 'Tercero: y el último paso'];

function PruebaPasos({ paso }: PropsDiapositiva) {
  return (
    <div className="prueba">
      <span className="prueba__sello">PRUEBA</span>
      <h1 className="prueba__titulo">Pasos dentro de una diapositiva</h1>
      <p className="prueba__bajada">
        Cada avance muestra una línea. Dato del registro: <Dato id="gem-actividad-emprendedora" />.
      </p>
      <ol className="prueba__lista">
        {PUNTOS.map((texto, i) => (
          <Entrada key={texto} como="li" desde={i + 1} className="prueba__item">
            <span className="prueba__numero">0{i + 1}</span>
            <span>{texto}</span>
          </Entrada>
        ))}
      </ol>
      <div className="prueba__pasos" aria-hidden>
        {[0, 1, 2, 3].map((p) => (
          <span key={p} className="prueba__punto" data-encendido={p <= paso ? '' : undefined} />
        ))}
      </div>
    </div>
  );
}

export default definirDiapositiva({
  id: 'prueba-pasos',
  titulo: 'PRUEBA · pasos',
  pasos: 3,
  orador: 'jose',
  duracion: 40,
  notas: [
    { decir: 'Esta es la diapositiva de prueba del motor, con tres pasos.', claves: 'prueba · tres pasos' },
    { decir: 'Primer paso de la prueba: aparece la primera línea.', claves: 'primera línea' },
    { decir: 'Segundo paso de la prueba: aparece la segunda.', claves: 'segunda línea' },
    {
      decir: 'Tercer paso de la prueba: el siguiente avance pasa a la diapositiva 2.',
      claves: 'última · sigue la 2',
      siFalla: 'Si no avanza, número 2 + Intro.',
    },
  ],
  fuentes: ['Texto de prueba del motor (docs/MOTOR.md §5).'],
  Componente: PruebaPasos,
});
