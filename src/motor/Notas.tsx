/**
 * Notas del presentador.
 *
 * - Por paso (lo normal): se ve la nota del paso en el que está la sala, con
 *   la frase de entrada completa en grande, las 3–4 palabras clave y, si la
 *   hay, la salida para cuando algo falla (05 §8.1).
 * - Texto libre (una nota para toda la diapositiva), con un formato mínimo:
 *   párrafos separados por una línea en blanco, viñetas con «- » y **negrita**.
 */
import type { ReactNode } from 'react';
import type { NotaPaso } from './tipos';

function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) =>
    trozo.startsWith('**') && trozo.endsWith('**') ? <strong key={i}>{trozo.slice(2, -2)}</strong> : trozo,
  );
}

function TextoLibre({ texto }: { texto: string }) {
  const bloques = texto
    .split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean))
    .filter((lineas) => lineas.length > 0);

  if (bloques.length === 0) return <p className="notas__vacio">Sin notas.</p>;

  return (
    <>
      {bloques.map((lineas, i) =>
        lineas.every((l) => l.startsWith('- ')) ? (
          <ul key={i}>
            {lineas.map((l, j) => (
              <li key={j}>{enLinea(l.slice(2))}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {lineas.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {enLinea(l)}
              </span>
            ))}
          </p>
        ),
      )}
    </>
  );
}

/** El paso en que está la sala ya sale arriba («paso 2 de 3»): aquí solo lo que hay que decir. */
function NotaDelPaso({ nota, paso }: { nota: NotaPaso | undefined; paso: number }) {
  if (!nota) return <p className="notas__vacio">Sin nota para el paso {paso}.</p>;
  return (
    <div className="nota-paso">
      <p className="nota-paso__decir">{enLinea(nota.decir)}</p>
      <p className="nota-paso__claves">{nota.claves}</p>
      {nota.siFalla && (
        <p className="nota-paso__falla">
          <strong>Si falla:</strong> {enLinea(nota.siFalla)}
        </p>
      )}
    </div>
  );
}

export function Notas({ notas, paso }: { notas: string | readonly NotaPaso[]; paso: number }) {
  if (typeof notas === 'string') return <TextoLibre texto={notas} />;
  return <NotaDelPaso nota={notas[paso]} paso={paso} />;
}
