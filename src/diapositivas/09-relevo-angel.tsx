/**
 * 09 · relevo-angel · Angel · 25 s (docs/GUION.md, «09 · relevo-angel»).
 * Composición: dividida 1,2:0,8, igual que la 03 (la pone la pieza del relevo).
 * Movimiento: Z-05 (src/marca/relevo/). La salida es Z-10, que es la entrada
 * de la 10 y no cuenta como momento de esta diapositiva.
 *
 * - Paso 0: la foto de Angel en la caja de su tarjeta de la web, sola
 *   (473,6 × 608 en x 220, y 310,25: TARJETAS[0] de geometria.ts, la caja que
 *   el guion de la 03 da como 474×608 en x 220, y 310), mientras Gregory
 *   entrega el clicker.
 * - Paso 1: Angel pulsa y corre Z-05: la foto vuela al retrato, entra el
 *   nombre y el personaje saluda una vez con `wave` (cuadros 1-2-3-2-1).
 * - El clic siguiente lleva a la 10 por el agujero negro (Z-10, de la 10).
 *
 * En pantalla, solo «Angel Grullon» (2 palabras, 96 px): `hizo=""` quita la
 * frase de lo que hizo que la pieza pone por defecto, que el guion no lleva.
 * El nombre a 96 px y el personaje al tamaño de la web los pone la pieza,
 * igual que en la 03 (src/marca/relevo/relevo.css).
 *
 * Va `pesada`, con su póster: el guion pide que en el presentador «la 09 y la
 * 10 se ven como póster» (10, «Si falla», punto 4; C-02; M-04 y M-11: «uno
 * para el presentador en la 09, la 10 y la 18»), porque el agujero se abre
 * sobre la 09 y la laptop comparte la GPU con la sala justo ahí. El póster es
 * el estado final del paso 1 (retrato, nombre y personaje quieto en idle),
 * sacado con ?revision=1 a 1920 × 1080 y pasado a WebP con el Chrome del
 * equipo (calidad 0,9), como el de la 10. Si cambia lo que se ve en la 09, se
 * vuelve a sacar igual (docs/MEDIOS.md, M-04).
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

/** Solo la tarjeta de Angel, en la primera caja de la web (la del guion de la 03). */
const TARJETAS = ['angel'] as const;

function RelevoAngel(_: PropsDiapositiva) {
  // vueltas 1: un saludo, cuadros 1-2-3-2-1 a 6 fps, 0,83 s (GUION 03; personaje.css).
  return <Relevo orador="angel" tarjetas={TARJETAS} tema="Hoy habla de nuestra web y de las landings." vueltas={1} automatico={RETRASO_RELEVO} />;
}

export default definirDiapositiva({
  id: 'relevo-angel',
  titulo: 'Relevo: Angel',
  orador: 'angel',
  duracion: 25,
  pasos: 0,
  notas: [
    {
      decir:
        'La foto vuela sola mientras Gregory entrega el clicker. Yo soy Angel Grullon. En la web de Zhonyas armé los muñequitos de píxeles que ven saludando y el agujero negro de la página de contacto. Fíjense en el centro de la pantalla.',
      claves: 'el clicker · muñequitos · agujero negro · «fíjense en el centro» · clic y callarse',
      aparte:
        'El clic siguiente abre Z-10 y lleva a la 10.\n\n' +
        '**[CONFIRMAR con Angel cómo escribe su nombre].**\n\n' +
        // Revisión del 13-nov: el personaje saluda una vez entre los 0,5 y los 1,3 s del clic (GUION, 03) y Angel lo nombra a los 4–5 s.
        '**[CONFIRMAR con Angel y José]** «que ven saludando»: cuando Angel lo dice, el personaje ya saludó y está quieto. Propuesta: «que acaban de ver saludar», o decir el nombre y esa frase antes del clic.',
      siFalla: 'Si la foto o el atlas no cargan, como en la 03. Lo del agujero negro, en la 10.',
    },
  ],
  fuentes: ['Angel armó los personajes y el agujero negro (08 §4; commits #77–89 y #90 de zhonyas-web). Se dice «armé», no «hice».'],
  medios: mediosRelevo('angel', TARJETAS),
  // En el presentador y en las miniaturas, quieta (C-02; GUION 10, «Si falla», 4). La sala la pinta en vivo.
  pesada: true,
  poster: 'medios/posters/relevo-angel.webp',
  // Cambio de orador: la cortina con Angel corriendo encima (src/marca/wow/transiciones.ts), como la 03.
  transicion: cortina('angel'),
  Componente: RelevoAngel,
});
