/**
 * 19 · tarea · José · 60 s (docs/GUION.md, «19 · tarea»).
 * Composición: a sangre, la de la 02 (TitularSobreLibreta): el titular arriba,
 * en dos líneas, y debajo la foto de la 02 con el mismo recorte (1690×620) y
 * el mismo crédito. Movimiento: Z-01 en el titular, en el paso 1.
 *
 * M-01 (la libreta): `libreta.calle` y `libreta.credito`. Si no llega, el
 * titular solo sobre el fondo. Si faltan a la vez Pymex grabado (M-02) y el
 * iPhone (M-05), esta suma 5 s (docs/GUION.md, «Si falta un medio»).
 */
import { iphone, libreta, mediosDe, pymex } from '../medios-opcionales';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { TitularSobreLibreta } from './02-su-calle';

// Espacio duro en «a un»: sin él, `balance` corta «…pregúntenle a / un negocio…» y deja la «a» colgando al final de la línea.
const TITULAR = 'Esta semana, pregúntenle a un negocio qué anota a mano.';

function Tarea(_: PropsDiapositiva) {
  return <TitularSobreLibreta titular={TITULAR} />;
}

const sinFoto = libreta.calle.hay ? '' : '**Sin la foto de la libreta (M-01):** la 19 va con el titular solo sobre el fondo; el paso 0, en negro.';

export default definirDiapositiva({
  id: 'tarea',
  titulo: 'La tarea',
  orador: 'jose',
  duracion: !pymex.hay && !iphone.hay ? 65 : 60,
  pasos: 1,
  notas: [
    {
      decir:
        'Si se fijan, las tres historias empiezan igual: con alguien de afuera. Un negocio con su libreta. Un celular que no era el de Angel. Un prestamista con su cuaderno.',
      claves: 'alguien de afuera · libreta, celular, cuaderno · clic',
      ...(sinFoto ? { aparte: sinFoto } : {}),
    },
    {
      decir: 'Y les dejo una tarea, que no vale puntos: esta semana, pregúntenle a un negocio de su calle qué anota a mano.',
      claves: 'no vale puntos · con sus palabras · tres preguntas · la primera persona',
      despues:
        '**Remate:** «Anoten lo que les diga, con sus palabras, y busquen tres preguntas que esa libreta no contesta. Ahí tienen el problema de un proyecto final y la primera persona que lo va a usar.»',
    },
  ],
  fuentes: [
    'El porqué de esta acción está en el encabezado del guion (docs/GUION.md, «La acción para esta semana»).',
    ...(libreta.credito.texto ? [libreta.credito.texto] : []),
  ],
  medios: mediosDe(libreta.calle),
  Componente: Tarea,
});
