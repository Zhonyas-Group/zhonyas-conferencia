/**
 * 14 · relevo-jose · José · 20 s (docs/GUION.md, «14 · relevo-jose»).
 * Composición: dividida 1,2:0,8, igual que la 03: el retrato a la izquierda;
 * el nombre y el personaje, a la derecha. Movimiento: Z-05, con los valores de
 * la 03 (la pieza src/marca/relevo/, tal cual).
 *
 * - Paso 0: la foto de José en la caja de su tarjeta de la web, sola
 *   (TARJETAS[0] de geometria.ts: 473.6 × 608 en x 220, y 310.25; la 03 pide
 *   «474×608 en x 220, y 310»). Así la foto tiene de dónde salir (C-10 b).
 *   Nadie habla: Angel entrega el clicker y se queda junto a la laptop.
 * - Paso 1: José pulsa y corre Z-05: la foto vuela al retrato, entra el nombre
 *   y el personaje saluda una vez (`vueltas={1}`: un saludo, cuadros
 *   1-2-3-2-1; sprite-atlas.json, wave a 6 fps).
 *
 * En pantalla, el nombre (3 palabras), su cargo, quién es («Es el creador
 * principal de Lendex.», equipo.ts) y «Ahora, Lendex.». El nombre a 96 px como pide el guion y el
 * personaje al tamaño de la web, como en la 03, los pone la pieza
 * (src/marca/relevo/relevo.css).
 *
 * Rama diseno-wow (13-nov): sin paso propio para el vuelo. José pidió que el
 * relevo no necesite tantos clics: con un solo → entra la diapositiva, se ve
 * la tarjeta un momento y la foto vuela sola (`automatico`, Relevo.tsx);
 * el → siguiente ya pasa a la diapositiva que viene.
 */
import { RETRASO_RELEVO, Relevo } from '../marca/relevo/Relevo';
import { mediosRelevo } from '../marca/relevo/equipo';
import { TARJETAS } from '../marca/relevo/geometria';
import { cortina } from '../marca/wow';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';

function RelevoJose(_: PropsDiapositiva) {
  return <Relevo orador="jose" origen={TARJETAS[0]} nombre="José Leonardo Reyes" tema="Ahora, Lendex." vueltas={1} automatico={RETRASO_RELEVO} />;
}

export default definirDiapositiva({
  id: 'relevo-jose',
  titulo: 'Relevo: José',
  orador: 'jose',
  duracion: 20,
  pasos: 0,
  // La foto de José y su personaje: se precargan al llegar a la 13 y el motor avisa si faltan.
  medios: mediosRelevo('jose', ['jose']),
  notas: [
    {
      decir:
        'La foto vuela sola mientras Angel entrega el clicker y se queda junto a la laptop para la 18. Yo otra vez. Lendex lo creé yo: es el programa del prestamista, donde lleva los préstamos y los cobros que hoy apunta en un cuaderno.',
      claves: 'prestamista · Lendex · cuaderno · Angel a la laptop',
      siFalla:
        'Si la foto o el atlas no cargan, como en la 03: el motor deja el estado final (retrato y nombre) y José sigue.',
    },
  ],
  fuentes: [
    'Lendex es de José.',
    'El cuaderno sale de la propia landing de Lendex: la sección «El cambio» pone «Sin Lendex» el cuaderno, el Excel y el WhatsApp (04 §2). Aquí se presenta para que la 19 lo pueda recordar.',
    'Lendex no presta dinero: es el programa del prestamista (FAQ de la landing, 04 §2). Por eso se dice «lleva los préstamos», nunca «presta».',
  ],
  // Cambio de orador: la cortina con José corriendo encima (src/marca/wow/transiciones.ts), como la 03.
  transicion: cortina('jose-leonardo'),
  Componente: RelevoJose,
});
