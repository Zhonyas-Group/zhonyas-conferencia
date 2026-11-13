/**
 * 01 · portada · José · 20 s (docs/GUION.md, «01 · portada»).
 * Composición: portada (centrada). 0 palabras: «Zhonyas» es parte del logo.
 * Medios: el logo de zhonyas-logo-escena.svg como queda la web después de
 * hidratarse, con veta y sombra: la caja SVG mide el alto de la pantalla
 * (viewBox «0 0 1254 1254») y el monograma, unos 336 px de ancho (03 M1; §4.3).
 * Es el <Monograma /> de la pieza «cinta» (src/marca/cinta/LogoCinta.tsx), el
 * mismo armazón que se mueve en la 20.
 * Movimiento: ninguno (M1: el logo no tiene entrada). Ya está en pantalla
 * cuando entra el público y se mueve una sola vez en la charla, en la 20.
 */
import { Monograma } from '../marca/cinta';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';

/**
 * El brillo del logo (mark-shine) es un segundo degradado, copiado tal cual de
 * la web, que va encima de la firma y no lleva texto. La pieza no lo declara
 * (src/marca/cinta/LogoCinta.tsx), así que la excepción va aquí; la 20 la
 * declara igual. Sin ella, el auditor marca A-38 en el logo.
 */
export const EXCEPCION_BRILLO_LOGO =
  'A-38: brillo del logo (mark-shine), el segundo degradado del monograma, copiado tal cual de page.tsx:829-840; va sobre la firma y sin texto';

function Portada(_: PropsDiapositiva) {
  return (
    <div style={{ display: 'contents' }} data-auditar-excepcion={EXCEPCION_BRILLO_LOGO}>
      <Monograma />
    </div>
  );
}

export default definirDiapositiva({
  id: 'portada',
  titulo: 'Portada',
  orador: 'jose',
  duracion: 20,
  pasos: 0,
  notas: [
    {
      decir:
        'Buenas tardes. Soy José Leonardo Reyes, estudio aquí en el ITLA igual que ustedes, y con Gregory y Angel trabajo en Zhonyas, un estudio de software y diseño de Santiago que le hace sistemas a negocios como Layla Comercial.',
      claves: 'una sola frase · mirar a la sala · clic',
      despues: 'Se dice «buenas tardes» o «buenos días», según la hora.',
    },
  ],
  fuentes: ['Layla Comercial se nombra con el permiso de José (decisión 4).'],
  Componente: Portada,
});
