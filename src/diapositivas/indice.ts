/**
 * Orden de la charla (docs/GUION.md, «Tabla resumen»): 20 diapositivas, una
 * por archivo `NN-id.tsx`. Manda el orden de esta lista; el número del
 * archivo solo ordena la carpeta. Los constructores no tocan este archivo.
 *
 * La 12 (el iPhone) solo entra si está su video (M-05): sin él «se cae la 12
 * y la 11 suma 10 s» (docs/GUION.md, «Si falta un medio»; la 11 ya lo tiene en
 * cuenta). Con `?con=M-05` en desarrollo se ve igual (src/medios-opcionales.ts).
 *
 * El mazo de prueba del motor tiene su propio índice: src/diapositivas/prueba/indice.ts.
 */
import { iphone } from '../medios-opcionales';
import type { Diapositiva } from '../motor/tipos';
import portada from './01-portada';
import suCalle from './02-su-calle';
import relevoGregory from './03-relevo-gregory';
import sinRnc from './04-sin-rnc';
import efectivo from './05-efectivo';
import libreta from './06-libreta';
import pymexPorDentro from './07-pymex-por-dentro';
import proyectoFinal from './08-proyecto-final';
import relevoAngel from './09-relevo-angel';
import veinticincoDias from './10-veinticinco-dias';
import tresArreglos from './11-tres-arreglos';
import diapositivaIphone from './12-iphone';
import celularDeOtro from './13-celular-de-otro';
import relevoJose from './14-relevo-jose';
import prestamista2014 from './15-prestamista-2014';
import negocio2024 from './16-negocio-2024';
import veinteMensual from './17-veinte-mensual';
import demoLendex from './18-demo-lendex';
import tarea from './19-tarea';
import cierre from './20-cierre';

export const diapositivas: readonly Diapositiva[] = [
  // Apertura · José
  portada,
  suCalle,
  // Historia 1 · Gregory: una libreta
  relevoGregory,
  sinRnc,
  efectivo,
  libreta,
  pymexPorDentro,
  proyectoFinal,
  // Historia 2 · Angel: un agujero negro
  relevoAngel,
  veinticincoDias,
  tresArreglos,
  ...(iphone.hay ? [diapositivaIphone] : []),
  celularDeOtro,
  // Historia 3 · José: un prestamista
  relevoJose,
  prestamista2014,
  negocio2024,
  veinteMensual,
  demoLendex,
  tarea,
  cierre,
];
