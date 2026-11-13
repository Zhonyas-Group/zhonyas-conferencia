/**
 * 07 · pymex-por-dentro · Gregory · 80 s (docs/GUION.md, «07 · pymex-por-dentro»).
 * Composición: a sangre (crédito arriba; la grabación de 1440×810 debajo). Movimiento: Z-12 (lo que se mueve es Pymex).
 *
 * El crédito va arriba, a la vista toda la diapositiva (x 115, y 115, 32 px,
 * --zh-texto-2; A-63). Debajo, en 1440 × 810 en x 115, y 160 (termina en
 * y 970, fuera del 10 % de abajo), lo que se enseña de Pymex:
 *
 * - Con M-02 (las tres tomas, `pymex.tomas`): una toma por paso, con
 *   «Pymex por dentro, con datos de ejemplo». Cada toma corre una vez y se
 *   queda en su último cuadro (`bucle={false}`; C-11). Entre tomas, corte
 *   seco (<Entrada> sin efecto). El mazo no anima nada: el movimiento es el
 *   de Pymex en la grabación (Z-12). Si una toma no arranca, se ve su póster.
 * - Sin M-02 (hoy): el respaldo del guion, la página pública de Pymex
 *   (`pymex.respaldo`: investigacion/productos/pymex/escritorio-05-flujo-4-pasos.png
 *   pasada a WebP, 1920 × 1080, de la que se ve una ventana de 1440 × 757 a su
 *   tamaño, sin ampliar ni reducir: hasta donde acaba la sección del flujo), con
 *   «Página pública de Pymex». Dura 55 s, un solo paso, y Gregory dice las tres
 *   preguntas en voz (docs/GUION.md, M-02 y «Si falta un medio»).
 *
 * Al dejar las tres tomas y sus pósteres en public/medios/pymex/ y volver a
 * compilar, la diapositiva pasa sola a las tomas: pasos, duración y notas
 * incluidos (src/medios-opcionales.ts; docs/MEDIOS.md).
 */
import { mediosDe, pymex } from '../medios-opcionales';
import { Entrada } from '../motor/Entrada';
import { medio } from '../motor/medios';
import { definirDiapositiva, type NotaPaso, type PropsDiapositiva } from '../motor/tipos';
import { Video } from '../motor/Video';
import './historia-gregory.css';

/** La caja de la grabación (docs/GUION.md, 07: «1440×810 en x 115, y 160»). */
const GRABACION = { left: 115, top: 160, width: 1440, height: 810 } as const;

/**
 * El respaldo es la captura entera, de 1920 × 1080. Se ve a su tamaño, sin
 * ampliarla ni reducirla (A-33; M-02: «sin ampliarla por encima de lo
 * grabado»): la ventana enseña de x 240 a 1680 (la barra y el flujo,
 * centrados) y de y 0 a 757, donde acaba la sección morada del flujo.
 * Medido en el archivo el 13-nov: la fila 756 es morada (80, 69, 230), la 757
 * y la 758 son el borde suavizado y desde la 759 empieza la sección siguiente,
 * azul marino (15, 23, 43). Con 810 de alto, esa sección asomaba 51 px al pie
 * de la caja como una franja cortada (A-03, A-33). Por eso la caja del
 * respaldo mide 1440 × 757 (de y 160 a 917) y no 1440 × 810, que es la de las
 * tomas de M-02.
 */
const RECORTE_RESPALDO = { objectFit: 'none', objectPosition: '-240px 0px' } as const;
const CAJA_RESPALDO = { ...GRABACION, height: 757 } as const;

const CREDITO_TOMAS = 'Pymex por dentro, con datos de ejemplo';
const CREDITO_RESPALDO = 'Página pública de Pymex';

function PymexPorDentro(_: PropsDiapositiva) {
  return (
    <>
      <p className="zh-fuente hg-credito" style={{ top: 115 }}>
        {pymex.hay ? CREDITO_TOMAS : CREDITO_RESPALDO}
      </p>
      {pymex.hay ? (
        pymex.tomas.map((toma, i) => (
          // Una toma por paso; la última se queda (paso 2 en adelante).
          <Entrada
            key={toma.rutaPoster}
            desde={i}
            hasta={i < pymex.tomas.length - 1 ? i : undefined}
            className="hg-evidencia"
            style={GRABACION}
          >
            <Video src={toma.video!} poster={toma.poster} bucle={false} />
          </Entrada>
        ))
      ) : (
        <div className="hg-evidencia" style={CAJA_RESPALDO}>
          <img
            src={medio(pymex.respaldo)}
            alt="Página pública de Pymex: el flujo en cuatro pasos (vendes, Pymex actualiza, cobras, tú decides)"
            decoding="async"
            draggable={false}
            style={RECORTE_RESPALDO}
          />
        </div>
      )}
    </>
  );
}

const SI_FALLA =
  'Si una toma no arranca, sale su póster y Gregory la cuenta en voz. Si la grabación no existe el sábado a mediodía, se usa el respaldo de M-02.';

const CON_TOMAS: readonly NotaPaso[] = [
  {
    decir:
      'La primera: ¿cuánto vale lo que tienes guardado? Esta es una ferretería de ejemplo: el inventario, producto por producto, con lo que vale.',
    claves: 'inventario · lo que vale · datos de ejemplo',
    aparte: '**[CONFIRMAR con Steven qué pantalla lo enseña].**',
    siFalla: SI_FALLA,
  },
  {
    decir: 'La segunda: ¿quién te debe, y cuánto? Cada factura con sus abonos y lo que falta por cobrar.',
    claves: 'abonos · lo que falta',
    siFalla: SI_FALLA,
  },
  {
    decir: 'Y la tercera: ¿en qué producto ganas más? El reporte del período te lo dice sin sacar la calculadora.',
    claves: 'reporte · qué deja más',
    aparte: '**[CONFIRMAR con Steven qué reporte lo contesta].**',
    siFalla: SI_FALLA,
  },
];

const SIN_TOMAS: readonly NotaPaso[] = [
  {
    decir: 'La primera: ¿cuánto vale lo que tienes guardado? La segunda: ¿quién te debe, y cuánto? Y la tercera: ¿en qué producto ganas más?',
    claves: 'inventario · abonos · reporte',
    aparte:
      '**Sin Pymex grabado (M-02):** la 07 usa la página pública de Pymex, con el crédito «Página pública de Pymex», dura 55 s y Gregory dice las tres preguntas en voz.\n\n' +
      '**[CONFIRMAR con Steven]** qué pantalla enseña la primera y qué reporte contesta la tercera.',
  },
];

export default definirDiapositiva({
  id: 'pymex-por-dentro',
  titulo: 'Pymex por dentro',
  orador: 'gregory',
  duracion: pymex.hay ? 80 : 55,
  pasos: pymex.hay ? 2 : 0,
  notas: pymex.hay ? CON_TOMAS : SIN_TOMAS,
  fuentes: [
    'Funciones según https://pymex.zhonyas.com (12-nov-2026): inventario, cotizaciones, facturas y abonos con su historial, y reportes de ventas, gastos y balance (04 §3).',
    'Que Pymex contesta las tres lo dice la publicación de LinkedIn de la 06 («Pymex responde las tres»).',
    'Ninguna cifra: los montos de la grabación son de ejemplo y no se leen.',
    ...(pymex.hay ? [] : ['Respaldo: investigacion/productos/pymex/escritorio-05-flujo-4-pasos.png, captura de https://pymex.zhonyas.com (12-nov-2026).']),
  ],
  medios: pymex.hay ? mediosDe(...pymex.tomas) : [pymex.respaldo],
  Componente: PymexPorDentro,
});
