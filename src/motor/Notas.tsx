/**
 * Notas del presentador con un formato mínimo:
 * párrafos separados por una línea en blanco, viñetas con «- » y **negrita**.
 */
import type { ReactNode } from 'react';

function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) =>
    trozo.startsWith('**') && trozo.endsWith('**') ? <strong key={i}>{trozo.slice(2, -2)}</strong> : trozo,
  );
}

export function Notas({ texto }: { texto: string }) {
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
