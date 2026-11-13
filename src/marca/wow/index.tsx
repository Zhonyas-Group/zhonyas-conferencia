/**
 * Piezas de la dirección nueva (rama diseno-wow) para usar en una diapositiva.
 *
 *   <Entrada desde={1} efecto="palabras"><Palabras texto="…" clave={['calle.']} /></Entrada>
 *   <OradorEsquina atlas="gregory" animacion="think" />
 *
 * Las entradas con nombre están en wow.entrada.ts; las transiciones, en transiciones.ts.
 */
import { Fragment } from 'react';
import { Personaje, type AnimacionPersonaje, type IdAtlas } from '../relevo/Personaje';
import './wow.css';

export { FondoVivo } from './FondoVivo';
export { camara, cortina, inmersion } from './transiciones';

/**
 * La palabra en aurora es el titular de la web (capabilities-heading.css:9):
 * texto relleno de degradado. El auditor no sabe medir el contraste de un
 * background-clip: text; la parada más oscura (#b59aff) da más de 8:1 sobre
 * el fondo vivo detrás de un titular.
 */
const EXCEPCION_AURORA =
  'A-36, A-38, A-40, A-34, P0-10: la palabra clave en aurora, copiada de capabilities-heading.css:8-15 (rama diseno-wow); contraste de más de 8:1';

/** Las palabras vecinas de la aurora: la caja de la palabra en aurora (su relleno) roza su línea de al lado. */
const EXCEPCION_JUNTO_A_AURORA =
  'A-40: la caja de la palabra en aurora (capabilities-heading.css:9) roza las palabras de al lado; el degradado solo rellena su propia letra';

/**
 * Un texto partido en palabras para la entrada «palabras» (03 M3). Las de
 * `clave` (tal cual se escriben, con su puntuación) van en aurora
 * (capabilities-heading.css:9). Cada palabra conserva su hueco: el titular no
 * se mueve mientras se genera.
 */
export function Palabras({ texto, clave = [] }: { texto: string; clave?: readonly string[] }) {
  const palabras = texto.split(' ');
  return (
    <span data-auditar-excepcion={clave.length ? EXCEPCION_JUNTO_A_AURORA : undefined}>
      {palabras.map((palabra, i) => (
        <Fragment key={i}>
          {i > 0 ? ' ' : null}
          <span
            className={clave.includes(palabra) ? 'wow-palabra zh-aurora' : 'wow-palabra'}
            data-palabra=""
            data-auditar-excepcion={clave.includes(palabra) ? EXCEPCION_AURORA : undefined}
          >
            {palabra}
          </span>
        </Fragment>
      ))}
    </span>
  );
}

/** Una palabra partida en letras para la entrada «letras» (fancy-text.tsx; 03 M3). */
export function Letras({ texto }: { texto: string }) {
  return (
    <span aria-label={texto}>
      {Array.from(texto).map((letra, i) => (
        <span key={i} className="wow-letra" data-letra="" aria-hidden="true">
          {letra}
        </span>
      ))}
    </span>
  );
}

/**
 * El orador de turno, pequeño, abajo a la derecha: su personaje de píxeles
 * (Z-11, el mismo de los relevos) reacciona a lo que pasa en la diapositiva.
 */
export function OradorEsquina({
  atlas,
  animacion,
  vueltas,
  luego,
  escala = 0.66,
}: {
  atlas: IdAtlas;
  animacion: AnimacionPersonaje;
  vueltas?: number;
  luego?: AnimacionPersonaje;
  escala?: number;
}) {
  return (
    <div className="wow-orador" aria-hidden="true">
      <Personaje key={`${animacion}-${vueltas ?? ''}`} atlas={atlas} animacion={animacion} escala={escala} vueltas={vueltas} luego={luego} />
    </div>
  );
}
