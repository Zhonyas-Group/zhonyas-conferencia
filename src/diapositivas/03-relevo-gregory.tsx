/**
 * 03 · relevo-gregory · Gregory · 25 s (docs/GUION.md, «03 · relevo-gregory»).
 * Composición: dividida 1,2:0,8 (retrato a la izquierda; nombre y personaje a la derecha). Movimiento: Z-05.
 *
 * La pieza Z-05 tal cual (src/marca/relevo/Relevo.tsx), con tres cosas del guion:
 *   - paso 0: una sola tarjeta, la de Gregory, en la primera caja de la web
 *     (474 × 608 en x 220, y 310: geometria.ts, TARJETAS[0]), mientras José
 *     entrega el clicker (C-10 b: la foto tiene de dónde salir);
 *   - paso 1: el vuelo, el nombre y el personaje, que saluda UNA vez
 *     (`vueltas={1}`: un saludo, cuadros 1-2-3-2-1 a 6 fps, 0,83 s; personaje.css)
 *     y se queda quieto, sin el respiro (C-11);
 *   - en pantalla, solo «Gregory Martínez» (2 palabras, 96 px): sin la frase
 *     de lo que hizo (`hizo=""`), que el guion no pone.
 * El nombre a 96 px y el personaje al tamaño de la web los pone la pieza
 * (src/marca/relevo/relevo.css).
 *
 * Si la foto o el atlas no cargan, el motor deja el estado final y Gregory sigue.
 *
 * Rama diseno-wow: entra con la cortina del cambio de orador (el fondo del
 * portal del equipo cruza la pantalla con el personaje de Gregory corriendo
 * encima: src/marca/wow/transiciones.ts) y el perfil deja ver el fondo vivo.
 *
 * Rama diseno-wow (13-nov): sin paso propio para el vuelo. José pidió que el
 * relevo no necesite tantos clics: con un solo → entra la diapositiva, se ve
 * la tarjeta un momento y la foto vuela sola (`automatico`, Relevo.tsx);
 * el → siguiente ya pasa a la diapositiva que viene.
 */
import { mediosRelevo } from '../marca/relevo/equipo';
import { RETRASO_RELEVO, Relevo } from '../marca/relevo/Relevo';
import { cortina } from '../marca/wow';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';

/** Solo su tarjeta, en la primera caja de la web (docs/GUION.md, 03, paso 0). */
const TARJETAS = ['gregory'] as const;

function RelevoGregory(_: PropsDiapositiva) {
  return <Relevo orador="gregory" tarjetas={TARJETAS} hizo="" vueltas={1} automatico={RETRASO_RELEVO} />;
}

export default definirDiapositiva({
  id: 'relevo-gregory',
  titulo: 'Relevo: Gregory',
  orador: 'gregory',
  duracion: 25,
  pasos: 0,
  notas: [
    {
      decir:
        'La foto vuela sola mientras José le da el clicker a Gregory. Gracias, José. Soy Gregory Martínez y hago diseño de producto en Zhonyas. Pymex es nuestro proyecto final del ITLA, el de José y mío. Y en un proyecto final, lo primero que te piden es el problema, con datos.',
      claves: 'el clicker · diseño de producto · proyecto final · el problema, con datos',
      siFalla: 'Si la foto o el atlas no cargan, el motor deja el estado final (retrato y nombre) y Gregory sigue.',
    },
  ],
  fuentes: ['Pymex es el proyecto final de José y Gregory en el ITLA (decisión 3).'],
  medios: mediosRelevo('gregory', TARJETAS),
  transicion: cortina('gregory'),
  Componente: RelevoGregory,
});
