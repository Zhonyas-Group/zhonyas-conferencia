/**
 * Pieza de PRUEBA del motor (no es de la charla): ejercita en el laboratorio
 * una entrada con nombre que aparece y se cierra, una entrada sin efecto
 * (corte), la excepción a A-54 y una transición propia entre dos escenas.
 * La comprueba scripts/probar-novedades.mjs.
 *
 * Para no inventar movimientos usa los de Z-08 (abrir y cerrar un detalle),
 * copiados de zhonyas-web/app/globals.css:1387-1416 (03 M10). La pieza de
 * marca de verdad de Z-08 vive en src/marca/; esta solo prueba el motor.
 */
import { Entrada } from '../Entrada';
import { registrarEntrada } from '../entradas';
import type { Transicion } from '../tipos';
import { definirPieza } from './tipos';

declare module '../entradas' {
  interface EntradasRegistradas {
    'prueba-motor': true;
  }
}

// Z-08 · abrir: opacidad 0 → 1 y scale 0,985 → 1 (globals.css:1390-1399).
const ABRIR: Keyframe[] = [
  { opacity: 0, transform: 'scale(0.985)' },
  { opacity: 1, transform: 'scale(1)' },
];
// Z-08 · cerrar: lo mismo al revés (globals.css:1407-1416).
const CERRAR: Keyframe[] = [
  { opacity: 1, transform: 'scale(1)' },
  { opacity: 0, transform: 'scale(0.985)' },
];

registrarEntrada({
  nombre: 'prueba-motor',
  movimiento: 'Z-08 (prueba del motor)',
  fuente: 'zhonyas-web/app/globals.css:1387-1416 (03 M10)',
  aparecer: (el) =>
    el.animate(ABRIR, {
      duration: 520, // globals.css:1387 (service-experience-in 520ms)
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // globals.css:1387
      fill: 'backwards',
    }),
  desaparecer: (el) =>
    el.animate(CERRAR, {
      duration: 420, // globals.css:1403 (service-experience-out 420ms)
      easing: 'cubic-bezier(0.76, 0, 0.24, 1)', // globals.css:1403
      fill: 'forwards',
    }),
});

/** Transición de prueba: la escena que entra (la de encima, en los dos sentidos) se abre como Z-08. */
const abrirEscena: Transicion = {
  entrar: (capa) =>
    capa.animate(ABRIR, {
      duration: 520, // globals.css:1387
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // globals.css:1387
      fill: 'backwards',
    }),
};

function EscenaA({ paso }: { paso: number }) {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Prueba del motor · paso {paso}</p>
      <Entrada desde={1} hasta={1} efecto="prueba-motor" className="zh-lectura" style={{ marginTop: 60 }}>
        <span data-prueba="detalle">Detalle que se abre (Z-08)</span>
      </Entrada>
      <Entrada desde={2} className="zh-lectura">
        <span data-prueba="corte">Aparece de golpe, sin efecto</span>
      </Entrada>
    </div>
  );
}

function EscenaB() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular" data-prueba="escena-b">
        Segunda escena
      </p>
    </div>
  );
}

export default definirPieza({
  titulo: 'Prueba del motor: entrada, salida, corte y transición',
  movimiento: 'Z-08 (prueba)',
  notas: 'Paso 1: el detalle se abre en 520 ms. Paso 2: se cierra en 420 ms y la otra línea aparece de golpe. Paso 3: la segunda escena entra con su transición.',
  escenas: [
    {
      id: 'prueba-motor-a',
      pasos: 2,
      Componente: EscenaA,
      excepcionA54: 'Escena de prueba del motor: ejercita una entrada y su salida en la misma diapositiva.',
    },
    { id: 'prueba-motor-b', pasos: 0, Componente: EscenaB, transicion: abrirEscena },
  ],
});
