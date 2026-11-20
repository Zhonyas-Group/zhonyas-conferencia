/**
 * El mazo de la vitrina (rama diseno-wow, 13-nov). José: «olvídate del guion
 * por ahora; quiero que la diapositiva muestre cosas: Lendex, Pymex y demás».
 * Con lo que ya aprobó (la portada, los relevos con un solo clic y las piezas
 * de src/marca/vitrina) y en el orden de los tres oradores:
 *
 *   José     portada · se presenta · somos Zhonyas · lo que construimos
 *   Gregory  relevo · Pymex
 *   Angel    relevo · zhonyas.com · landings
 *   José     relevo · Lendex · Lendex en vivo (la calculadora; Angel al teclado) · cierre
 *
 * Se compila con `npm run compilar:vitrina` (vite build --mode vitrina) en
 * dist-vitrina/, con la carpeta medios/ al lado (lleva videos).
 */
import type { Diapositiva, NotaPaso } from '../../motor/tipos';
import portada from '../01-portada';
import relevoGregory from '../03-relevo-gregory';
import relevoAngel from '../09-relevo-angel';
import relevoJose from '../14-relevo-jose';
import cierre from './cierre';
import construimos from './construimos';
import equipo from './equipo';
import landings from './landings';
import lendex from './lendex';
import lendexEnVivo from './lendex-en-vivo';
import pymex from './pymex';
import relevoJoseInicio from './relevo-jose-inicio';
import zhonyasWeb from './zhonyas-web';

/**
 * Las notas de cuatro diapositivas del mazo completo, ajustadas a la vitrina
 * (14-nov, al sacar el guion en PDF): allí hablaban de diapositivas que aquí
 * no están. José se presentaba en la portada (aquí lo hace en la 2), Gregory
 * llevaba a «el problema, con datos» (aquí sigue Pymex), Angel a la 10 por el
 * agujero negro (aquí sigue la web) y José mandaba a Angel a la laptop «para
 * la 18» (aquí, la calculadora de la 12). El resto de cada una, igual.
 */
function conNotas(d: Diapositiva, notas: readonly NotaPaso[]): Diapositiva {
  return { ...d, notas };
}

const portadaVitrina = conNotas(portada, [
  {
    decir: 'Sin hablar. El público entra con el fondo vivo en pantalla. Cuando les toque, clic: el logo se arma.',
    claves: 'esperar en silencio · clic para empezar',
  },
  {
    decir: 'Sin hablar todavía: el logo se arma. Cuando termine, clic: te presentas en la siguiente, con tu foto.',
    claves: 'el logo se arma · clic',
    despues: 'Si mueves el ratón, el logo lo sigue.',
  },
]);

const relevoGregoryVitrina = conNotas(relevoGregory, [
  {
    decir:
      'La foto vuela sola mientras José le da el clicker. Gracias, José. Soy Gregory Martínez, hago diseño de producto en Zhonyas y fui el desarrollador principal de Pymex, nuestro proyecto final del ITLA, de José y mío. Se lo enseño.',
    claves: 'el clicker · desarrollador principal de Pymex · proyecto final',
    siFalla: 'Si la foto o el personaje no cargan, queda el estado final (retrato y nombre) y Gregory sigue.',
  },
]);

const relevoAngelVitrina = conNotas(relevoAngel, [
  {
    decir:
      'La foto vuela sola mientras Gregory entrega el clicker. Yo soy Angel Grullon y en Zhonyas dirijo el backend. Les voy a enseñar nuestra web y las landings que hacemos.',
    claves: 'el clicker · dirijo el backend · la web y las landings',
    aparte: 'El clic siguiente lleva a nuestra web.\n\n**[CONFIRMAR con Angel cómo escribe su nombre].**',
    siFalla: 'Si la foto o el personaje no cargan, queda el estado final (retrato y nombre) y Angel sigue.',
  },
]);

const relevoJoseVitrina = conNotas(relevoJose, [
  {
    decir:
      'La foto vuela sola mientras Angel entrega el clicker y se queda en la laptop. Yo otra vez. Lendex lo creé yo: es el programa del prestamista, donde lleva los préstamos y cobros que hoy apunta en un cuaderno.',
    claves: 'prestamista · Lendex · cuaderno · Angel a la laptop',
    aparte: 'Angel se queda en la laptop para escribir el monto en la calculadora de la 12.',
    siFalla: 'Si la foto o el personaje no cargan, queda el estado final (retrato y nombre) y José sigue.',
  },
]);

export const diapositivas: readonly Diapositiva[] = [
  portadaVitrina,
  relevoJoseInicio,
  equipo,
  construimos,
  relevoGregoryVitrina,
  pymex,
  relevoAngelVitrina,
  zhonyasWeb,
  landings,
  relevoJoseVitrina,
  lendex,
  lendexEnVivo,
  cierre,
];
