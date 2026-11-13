/**
 * Notas del presentador.
 *
 * - Por paso (lo normal): se ve la nota del paso en el que está la sala, en el
 *   orden en que se dice (docs/GUION.md, Convenciones, «Notas»): la frase de
 *   entrada completa en grande; justo debajo, lo que se dice después en el
 *   mismo paso (el remate, el segundo tiempo, el «En vivo»); luego las 3–4
 *   palabras clave. Al final, plegado en una línea, lo que no se dice: el «Si
 *   falla» y los avisos (medios que faltan, frases por confirmar). Así, en un
 *   portátil al 150 % (1280 × 720), lo que hay que decir no queda debajo del
 *   panel (05 §8.1; síntesis §1.3, fila 16, «Notas que sirven»).
 * - Texto libre (una nota para toda la diapositiva), con un formato mínimo:
 *   párrafos separados por una línea en blanco, viñetas con «- » y **negrita**.
 */
import { useState, type ReactNode } from 'react';
import type { NotaPaso } from './tipos';

function enLinea(texto: string): ReactNode[] {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((trozo, i) =>
    trozo.startsWith('**') && trozo.endsWith('**') ? <strong key={i}>{trozo.slice(2, -2)}</strong> : trozo,
  );
}

/** Un párrafo por bloque separado por una línea en blanco; los saltos sueltos, como espacio. */
function Parrafos({ texto }: { texto: string }) {
  return (
    <>
      {texto
        .split(/\n\s*\n/)
        .map((parrafo) => parrafo.trim())
        .filter(Boolean)
        .map((parrafo, i) => (
          <p key={i}>{enLinea(parrafo.replace(/\s*\n\s*/g, ' '))}</p>
        ))}
    </>
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

/**
 * El «Si falla» y los avisos, plegados en una línea. Se abren con un clic en
 * esa línea, que no se queda con el teclado (como los botones del
 * presentador): Espacio e Intro siguen avanzando la charla. Se vuelven a
 * plegar al cambiar de paso (el presentador monta una nota nueva por paso).
 * Plegados siguen en la página, ocultos: se pueden leer y buscar.
 */
function Plegado({ siFalla, aparte }: { siFalla?: string; aparte?: string }) {
  const [abierto, setAbierto] = useState(false);
  const rotulo = siFalla && aparte ? 'Si falla y avisos' : siFalla ? 'Si falla' : 'Avisos';
  return (
    <div className="nota-paso__plegado" data-abierto={abierto ? '' : undefined}>
      <button
        type="button"
        className="nota-paso__pliegue"
        aria-expanded={abierto}
        title={abierto ? 'Plegar' : 'Ver lo que no se dice: qué hacer si falla y los avisos'}
        // Sin foco, como los botones del presentador: Espacio e Intro siguen moviendo la charla.
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          setAbierto(!abierto);
          e.currentTarget.blur();
        }}
      >
        <span aria-hidden>{abierto ? '▾' : '▸'}</span> {rotulo}
      </button>
      <div className="nota-paso__plegable" hidden={!abierto}>
        {siFalla && (
          <p className="nota-paso__falla">
            <strong>Si falla:</strong> {enLinea(siFalla)}
          </p>
        )}
        {aparte && (
          <div className="nota-paso__aparte">
            <Parrafos texto={aparte} />
          </div>
        )}
      </div>
    </div>
  );
}

/** El paso en que está la sala ya sale arriba («paso 2 de 3»): aquí solo lo que hay que decir. */
function NotaDelPaso({ nota, paso }: { nota: NotaPaso | undefined; paso: number }) {
  if (!nota) return <p className="notas__vacio">Sin nota para el paso {paso}.</p>;
  return (
    <div className="nota-paso">
      <p className="nota-paso__decir">{enLinea(nota.decir)}</p>
      {nota.despues && (
        <div className="nota-paso__despues">
          <Parrafos texto={nota.despues} />
        </div>
      )}
      <p className="nota-paso__claves">{nota.claves}</p>
      {(nota.siFalla || nota.aparte) && <Plegado siFalla={nota.siFalla} aparte={nota.aparte} />}
    </div>
  );
}

export function Notas({ notas, paso }: { notas: string | readonly NotaPaso[]; paso: number }) {
  if (typeof notas === 'string') return <TextoLibre texto={notas} />;
  return <NotaDelPaso nota={notas[paso]} paso={paso} />;
}
