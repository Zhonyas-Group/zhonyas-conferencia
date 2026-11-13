/**
 * 08 · proyecto-final · Gregory · 55 s (docs/GUION.md, «08 · proyecto-final»).
 * Composición: a sangre (titular arriba, la foto de 1690×620 debajo). Movimiento: Z-01 en el titular.
 *
 * Paso 0: la foto sola, en 1690 × 620 en x 115, y 345, con su crédito a 32 px
 * debajo. Paso 1: el titular (96 px, dos líneas, x 115, y 115) entra en su
 * sitio con Z-01 («cifra», un solo momento: cifra@1). 9 palabras.
 *
 * Qué foto va, por orden (docs/GUION.md, M-03; src/medios-opcionales.ts):
 *   1. M-03, José y Gregory en el ITLA (`itla`), con «Foto: Zhonyas, ITLA, nov 2026»;
 *   2. si no llega, el último cuadro de la toma 3 de la 07 (`pymex.ultimoCuadro`),
 *      con el crédito de la 07, «Pymex por dentro, con datos de ejemplo»;
 *   3. si tampoco hay tomas (hoy): ninguna. El paso 0 queda vacío y en el paso 1
 *      entra el titular solo sobre el fondo, con Z-01, como la 02 y la 19 sin la
 *      libreta (M-01). El guion no trae este caso: la cabecera de la landing de
 *      Pymex, que iba antes, ponía su propio titular, su rótulo en mayúsculas, el
 *      kit de cuatro tarjetas y el botón «Conocer Pymex» debajo del titular de la
 *      charla (A-06, A-22, A-24, A-26, A-31; C-12), y era la misma captura de la 07.
 * Cambia sola al dejar el archivo en su ruta y volver a compilar (docs/MEDIOS.md).
 */
import type { CSSProperties } from 'react';
import { itla, mediosDe, pymex } from '../medios-opcionales';
import { Titular } from '../marca/composiciones';
import { Entrada } from '../motor/Entrada';
import { medio } from '../motor/medios';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './historia-gregory.css';

/** La caja de la foto (docs/GUION.md, 08: «1690×620, en x 115, y 345»). */
const FOTO = { left: 115, top: 345, width: 1690, height: 620 } as const;
/** El crédito, 16 px bajo la foto (historia-gregory.css, .hg-credito). */
const CREDITO_TOP = FOTO.top + FOTO.height + 16;

interface Foto {
  /** Ruta relativa a public/ (para `medios`). */
  ruta: string;
  credito: string;
  alt: string;
  /** Cómo se recorta en la caja de 1690 × 620 (object-fit y object-position). */
  recorte: CSSProperties;
}

const foto: Foto | null =
  itla.hay && itla.medios[0]
    ? {
        ruta: itla.medios[0],
        credito: 'Foto: Zhonyas, ITLA, nov 2026',
        alt: 'José y Gregory en el ITLA',
        recorte: {}, // ya viene recortada a 1690 × 620 (a 2×: 3380 × 1240; M-03)
      }
    : pymex.ultimoCuadro.hay && pymex.ultimoCuadro.medios[0]
      ? {
          ruta: pymex.ultimoCuadro.medios[0],
          credito: 'Pymex por dentro, con datos de ejemplo',
          alt: 'Pymex por dentro: el reporte del período, con datos de ejemplo',
          recorte: { objectPosition: '50% 50%' }, // 16:9 a 1690 de ancho: se ven los 620 del centro
        }
      : null; // sin M-03 ni M-02: el titular solo sobre el fondo (arriba, punto 3)

function ProyectoFinal(_: PropsDiapositiva) {
  return (
    <>
      {foto && (
        <>
          <div className="hg-evidencia" style={FOTO}>
            <img src={medio(foto.ruta)} alt={foto.alt} decoding="async" draggable={false} style={foto.recorte} />
          </div>
          <p className="zh-fuente hg-credito" style={{ top: CREDITO_TOP }}>
            {foto.credito}
          </p>
        </>
      )}
      <Entrada desde={1} efecto="cifra" className="hg-titular">
        <Titular>Escojan un proyecto final que un negocio quiera usar.</Titular>
      </Entrada>
    </>
  );
}

const sinFotoItla = itla.hay
  ? undefined
  : pymex.ultimoCuadro.hay
    ? '**Sin la foto del ITLA (M-03):** va el último cuadro de la toma 3 de la 07, con su crédito. La duración no cambia.'
    : '**Sin la foto del ITLA (M-03) ni Pymex grabado (M-02):** el paso 0 queda vacío y en el paso 1 entra el titular solo sobre el fondo, como la 02 sin la libreta. La duración no cambia.';

export default definirDiapositiva({
  id: 'proyecto-final',
  titulo: 'Proyecto final',
  orador: 'gregory',
  duracion: 55,
  pasos: 1,
  notas: [
    {
      decir:
        'El documento de Pymex lo estamos haciendo con la misma plantilla que les van a dar a ustedes, y nos cuesta el mismo semestre. La diferencia es que del otro lado hay negocios usándolo.',
      claves: 'misma plantilla · mismo semestre · negocios usándolo, sin números',
      ...(sinFotoItla ? { aparte: sinFotoItla } : {}),
    },
    {
      decir: 'Por eso les dejo esto: escojan un proyecto final que un negocio quiera usar.',
      claves: 'mismo trabajo · el lunes · entregar el clicker',
      despues: '**Remate:** «Les cuesta el mismo trabajo, y alguien lo abre el lunes. Angel.»',
    },
  ],
  fuentes: [
    '«Hay negocios usándolo» es palabra de José: va en voz y sin números (decisión 4).',
    'No se dice quién escribe el código ni qué había antes del proyecto final (decisión 3; R-07).',
  ],
  medios: itla.hay ? mediosDe(itla) : mediosDe(pymex.ultimoCuadro),
  Componente: ProyectoFinal,
});
