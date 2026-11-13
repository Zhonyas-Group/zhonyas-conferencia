/**
 * 20 · cierre · José · 65 s (docs/GUION.md, «20 · cierre»).
 *
 * Paso 0: el logo quieto, como la portada (corte seco desde la 19).
 * Paso 1: Z-02 (logo → cinta, src/marca/cinta/LogoCinta.tsx, tal cual) y, al
 * terminar, por corte y sin animación propia, la composición de «Nosotros» en
 * la web (investigacion/movimiento/03-nosotros.png), que se queda durante las
 * preguntas:
 *   - la idea arriba a la izquierda (x 115, y 115), a 96 px y en dos líneas;
 *   - la acción a 60 px, a la izquierda, bajo la idea, en dos líneas;
 *   - la cinta donde la deja Z-02 (CAJA_CINTA_FINAL, medida en captura:
 *     x 1093–1657, y 571–636), sin nada encima;
 *   - «zhonyas.com» a 60 px encima de la cinta, alineado con su borde derecho
 *     y separado 16 px;
 *   - el QR (M-08) en su placa #f7f7fa (el propio SVG la trae, con su zona de
 *     silencio de 4 módulos).
 *
 * Dónde va el QR: el guion lo pone abajo a la derecha (x 1445–1805, y 612–972),
 * calculado con la cinta en y 508–572. Medida en captura, la cinta acaba en
 * y 636 y en x 1657, así que esa placa la pisaría (x 1445–1657, y 612–636).
 * Bajarla hasta dejarla libre la saca por debajo de y 972 (A-30) y achicarla la
 * deja por debajo de los 360 px de M-08. Manda Z-02 tal cual y se mueve lo
 * demás (GUION, 20): el QR pasa abajo a la izquierda, bajo la acción, con el
 * mismo borde inferior (y 972) y el margen de la retícula (x 115). Ver 20-cierre.css.
 *
 * Si falta el QR (M-08), queda «zhonyas.com» a 60 px (ya está en pantalla).
 *
 * Es pesada (filtros SVG del logo y una escena de 1.2 s): el presentador
 * enseña el póster del estado final (GUION, «Lo que necesita el motor», 8).
 */
import type { CSSProperties } from 'react';
import { CAJA_CINTA_FINAL, LogoCinta } from '../marca/cinta';
import { Titular } from '../marca/composiciones';
import { mediosDe, qr } from '../medios-opcionales';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { EXCEPCION_BRILLO_LOGO } from './01-portada';
import './20-cierre.css';

/** «zhonyas.com» sobre la cinta: su borde derecho y 16 px por encima (GUION, 20). */
const SOBRE_LA_CINTA = {
  right: 1920 - (CAJA_CINTA_FINAL.x + CAJA_CINTA_FINAL.ancho),
  bottom: 1080 - CAJA_CINTA_FINAL.y + 16,
} satisfies CSSProperties;

function Cierre(_: PropsDiapositiva) {
  return (
    // La excepción A-38 del brillo del logo y de la cinta: la misma de la portada (01-portada.tsx).
    <div style={{ display: 'contents' }} data-auditar-excepcion={EXCEPCION_BRILLO_LOGO}>
      <LogoCinta desde={1}>
        <div className="zh-reticula zh-cierre">
          <Titular>El usuario de su proyecto final ya está en su calle.</Titular>
          <p className="zh-lectura zh-cierre__accion">Pregúntenle esta semana qué anota a mano.</p>
          <p className="zh-lectura zh-cierre__web" style={SOBRE_LA_CINTA}>
            zhonyas.com
          </p>
          {qr.hay ? (
            <img className="zh-cierre__qr" src={qr.src} alt="Código QR que lleva a https://zhonyas.com" decoding="async" />
          ) : null}
        </div>
      </LogoCinta>
    </div>
  );
}

export default definirDiapositiva({
  id: 'cierre',
  titulo: 'Cierre',
  orador: 'jose',
  duracion: 65,
  pasos: 1,
  notas: [
    {
      decir: 'Cierro con lo mismo con que empezamos.',
      claves: 'clic',
    },
    {
      decir:
        'El usuario de su proyecto final ya está en su calle. Pregúntenle esta semana, y si quieren, cuéntennos qué encontraron: ese QR los lleva a nuestra web.',
      claves: 'dejar el QR a la vista · el equipo · gracias · preguntas',
      despues:
        '**Remate:** «Esto lo hacemos entre seis: Steven, Cristopher y José Carlos no están en la tarima, y mucho de lo que vieron hoy también es de ellos. Gracias. Ahora sí, sus preguntas.»',
      aparte:
        '**[CONFIRMAR con José la frase del equipo].**' + (qr.hay ? '' : '\n\n**Sin el QR (M-08):** queda zhonyas.com a 60 px.'),
      siFalla:
        'Si la escena se traba, el motor salta al estado final. Si la cinta no se portó a tiempo, el estado final va quieto, como póster. El QR tiene que estar en pantalla antes de abrir las preguntas.',
    },
  ],
  fuentes: [
    'zhonyas.com respondió 200 y www.zhonyas.com, 404 (curl -I, 12-nov-2026).',
    'En pantalla nunca va «Gracias» (A-32); el «gracias» va en voz.',
    '«Entre seis»: las seis personas de lib/team.ts en zhonyas-web, las mismas que son miembros de Zhonyas-Group en GitHub (§6.2). Es un dato del equipo, no del negocio.',
    'A los tres que no hablan se los nombra como equipo, sin repartir el código de nadie (decisión 3).',
    'El nombre del juego no va aquí (decisión 8; R-07).',
  ],
  medios: mediosDe(qr),
  pesada: true,
  poster: 'medios/cierre/cierre-poster.webp',
  Componente: Cierre,
});
