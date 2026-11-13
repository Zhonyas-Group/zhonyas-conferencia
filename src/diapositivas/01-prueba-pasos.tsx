/**
 * PRUEBA del motor: varios pasos («builds»). Se borra cuando haya diapositivas reales.
 */
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { Entrada } from '../motor/Entrada';
import './prueba.css';

const PUNTOS = ['Primer paso: entra con fundido', 'Segundo: con un retraso escalonado', 'Tercero: y el último paso'];

function PruebaPasos({ paso }: PropsDiapositiva) {
  return (
    <div className="prueba">
      <span className="prueba__sello">PRUEBA</span>
      <h1 className="prueba__titulo">Pasos dentro de una diapositiva</h1>
      <p className="prueba__bajada">Cada avance muestra una línea. Al retroceder se ocultan en orden inverso.</p>
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
  notas: `
    Diapositiva de **prueba** del motor: tiene 3 pasos.

    - Paso 1: aparece la primera línea.
    - Paso 2: la segunda.
    - Paso 3: la tercera; el siguiente avance pasa a la diapositiva 2.

    Retroceder desde la diapositiva 2 vuelve aquí con todo mostrado.
  `,
  Componente: PruebaPasos,
});
