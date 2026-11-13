/**
 * Demo en vivo de Lendex, con el video de respaldo a una tecla (V).
 *
 * Decisión de José (12-nov): la calculadora pública de https://lendexgp.com/app
 * EN VIVO, con internet, y el video del mismo camino listo (síntesis §8, demo
 * de los arcos A–C; §9.2.7 (b); 05 §7: «camino dorado» y video ≤ 60 s).
 *
 * ——— Cómo se ve ———
 *
 * La calculadora es la protagonista (composición «a sangre», §4.3): un iframe
 * de la página de escritorio de Lendex, 1920 × 1080 px CSS, recortado a la
 * tarjeta «Calculadora de Préstamos» y ampliado 2× (`recorte`): 1344 × 896 en
 * x 288, y 115 (docs/GUION.md, 18). Su letra más pequeña (12 px) se proyecta
 * a 24 px y las cifras (18 px), a 36 px. Sin `recorte` se ve la página entera
 * a 1920 × 1080 sin ampliar: es la fase del guion para cuando Lendex todavía
 * no abre la calculadora con «?calculadora» (M-07): el botón «Calculadora de
 * Préstamos» se ve sin desplazar y Angel lo pulsa (LENDEX_ABRE_LA_CALCULADORA).
 * Antes (12-nov) era la versión estrecha de Lendex, 960 × 540 ampliada 2×: la
 * sala veía su pantalla de entrar ocupando todo y Angel tenía que bajar con la
 * rueda dentro del iframe para encontrar el botón (revisión del 13-nov).
 *
 * Movimiento: Z-12, «el producto se mueve solo» (síntesis §4.4): lo único que
 * se mueve es Lendex. El cambio entre lo vivo y el video es un corte seco
 * (Z-00, 05-oficio-conferencias.md:394): «sin cambiar de tono» (05 §7.6). Esta
 * pieza no anima nada propio, así que no suma momentos (A-54). Si la
 * diapositiva quiere abrirse como un detalle (Z-08), que la envuelva en la
 * entrada con nombre de esa pieza.
 *
 * ——— Dónde se ve qué ———
 *
 * - Sala (la ventana del público): la calculadora en vivo. Se carga ya cuando
 *   la diapositiva es vecina (la anterior en pantalla), así que al llegar no
 *   se ven los 2 s de presentación de Lendex (LoginPage.tsx: setShowSplash).
 * - Presentador («En pantalla»): el póster quieto y un aviso con el modo de la
 *   sala. Nunca un segundo Lendex en vivo: no estaría sincronizado con el de
 *   la sala y tentaría a escribir en el que el público no ve.
 * - «Siguiente», cuadrícula, capturas, PDF (?revision=1): el póster (`poster`).
 *   En la 18, el último cuadro del video del guion (M-07: RD$10,000 al 20 %,
 *   cuota de RD$2,252.65), el mismo recorte que ve la sala.
 * - Video (tecla V, o sin red): el video en las dos ventanas, desde el
 *   principio y una sola vez; se queda en la cuota.
 *
 * ——— Cómo se usa en una diapositiva ———
 *
 *   import { DemoLendex, FUENTES_DEMO_LENDEX, MEDIOS_DEMO_LENDEX, NOTA_DEMO_LENDEX } from '../marca/lendex/DemoLendex';
 *
 *   export default definirDiapositiva({
 *     id: 'demo-lendex',
 *     titulo: 'Demo en vivo: la calculadora de Lendex',
 *     pasos: 0,
 *     orador: 'jose',
 *     duracion: 100,
 *     medios: MEDIOS_DEMO_LENDEX,   // el video se precarga al llegar a la anterior
 *     notas: [NOTA_DEMO_LENDEX],    // con su «Si falla:»
 *     fuentes: FUENTES_DEMO_LENDEX,
 *     Componente: DemoLendex,
 *   });
 *
 * Sin `pesada`: el presentador tiene que montar la pieza (para oír V y decir
 * qué ve la sala); ya enseña el póster por su cuenta. El ejemplo, comprobado,
 * es la escena «demo-lendex» de demo-lendex.lab.tsx.
 *
 * Caso raro: si el presentador se reabre encima de la sala en el proyector
 * (MOTOR.md §2, «Si algo falla»), allí se ve el póster con el aviso, no la
 * calculadora. Llévalo a tu pantalla (Win + Mayús + ← o →) antes de la demo.
 *
 * ——— Las teclas ———
 *
 * - V, en la sala o en el presentador: pasa al video; otra V vuelve a lo vivo
 *   (la calculadora conserva lo que se escribió). Las dos ventanas lo siguen.
 * - Sin red (navigator.onLine falso) la sala ya enseña el video sola.
 * - → · AvPág · Espacio: siguen avanzando la charla. Un clic en la demo, no
 *   (tampoco sobre el video), y en la sala las teclas de escribir un número
 *   (cifras, punto, coma, Intro, Retroceso, Supr, Inicio, Fin) no mueven la
 *   charla mientras la demo está a la vista: «20» + Intro no salta a la 20
 *   (GUION, «Lo que necesita el motor», 7). El presentador, como siempre.
 *
 * ——— El foco (lo importante el día) ———
 *
 * Al hacer clic dentro de la calculadora, el teclado se queda en Lendex (un
 * iframe de otro origen): la sala deja de oír →, AvPág, el puntero y V.
 * Para devolvérselo, cualquiera de estas, comprobadas con Playwright:
 *   1. Sacar el ratón por un lado de la pantalla: hay una franja de 64 px a
 *      cada lado (data-sin-clic, no avanza) y la sala recupera el teclado al
 *      pasar por ella. También al salir el ratón de la ventana.
 *   2. Hacer clic en la ventana del presentador (en tu pantalla) y seguir
 *      desde ahí: las dos ventanas se mueven juntas.
 *   3. Pulsar V desde el presentador (paso 2) si lo vivo falla.
 * Mientras la calculadora no se ve (la diapositiva es la vecina de la que
 * está en pantalla, la pieza va en una <Entrada> todavía cerrada o el video
 * está puesto), el iframe va `inert` y un vigilante le devuelve el teclado a
 * la sala si Lendex lo toma por su cuenta (VistaSala): el teclado nunca se
 * queda escondido en una calculadora que no se ve.
 *
 * ——— El camino ensayado (el de la 18 mientras Lendex no abra solo) ———
 *
 *   1. En la diapositiva se ve la pantalla de entrar de Lendex, sin ampliar.
 *   2. Ratón al proyector y clic en «Calculadora de Préstamos», abajo a la
 *      izquierda, bajo «Entrar al Sistema»: la calculadora sale a la derecha.
 *      La sala recupera el teclado sola (VistaSala) y el clic siguiente del
 *      puntero pasa al recorte, por corte.
 *   3. Clic en «Monto (RD$)», Ctrl + A y escribir el monto SIN punto ni coma
 *      (10000). Un punto es decimal en ese campo: «10.000» calcula diez pesos.
 *   4. Igual con la tasa (20). El plazo (12), «Mensual» y «Francesa» ya vienen
 *      puestos. La cuota cambia sola con cada tecla.
 *   5. Sacar el ratón por un lado (o clic en el presentador) y seguir.
 *   No tocar las listas (Frecuencia, Amortización, Interés): su desplegable es
 *   del sistema, sale pequeño y sin escalar en el proyector.
 *
 * ——— El día antes ———
 *
 * - `node scripts/lendex-grabar-demo.mjs --guion --comprobar`: comprueba que
 *   Lendex se sigue dejando embeber (sin X-Frame-Options ni frame-ancestors),
 *   que el camino de la 18 funciona, que con RD$10,000 al 20 % la cuota da
 *   RD$2,252.65 y si «?calculadora» ya abre la calculadora sola. Si Lendex
 *   cambió (C-26), `node scripts/lendex-grabar-demo.mjs --guion` vuelve a
 *   grabar el respaldo de M-07 y sus cuadros en public/medios/lendex/.
 * - Lendex en oscuro (ESQUEMA_LENDEX, abajo). Si el presentador avisa en la
 *   franja roja «Lendex saldrá en claro en la demo», su pantalla de entrar
 *   saldría blanca entre diapositivas negras (el video está grabado en
 *   oscuro): Windows con las apps en modo oscuro, o Chrome abierto con
 *   --force-dark-mode. Lo que el aviso no ve: Lendex recuerda su sol/luna en
 *   ese navegador (localStorage «theme», por encima del tema), así que al
 *   recorrer la demo esa mañana hay que mirar que salga oscura. Si no, la luna
 *   de arriba a la derecha de su pantalla de entrar (x 908, y 32 en la sala)
 *   la pasa a oscuro en el acto y lo deja guardado (comprobado el 13-nov).
 * - Probar la red de la sala con la demo, no solo con un navegador.
 *
 * ——— Plan B: Lendex en una ventana aparte ———
 *
 * Solo si el --comprobar dice que Lendex ya no se deja embeber (hoy, 12-nov,
 * sí se deja: ninguna de las dos cabeceras). No probado en un proyector real.
 *   1. Antes de empezar: en el portátil, Ctrl + N, lendexgp.com/app, abrir la
 *      calculadora y F11 (pantalla completa). Dejarla detrás del presentador.
 *   2. Al llegar a la demo: clic en esa ventana y Win + Mayús + → (o ←, hacia
 *      el proyector). Llega a pantalla completa, encima de la sala, sin que
 *      se vea el escritorio.
 *   3. Para volver: Ctrl + W cierra Lendex y debajo queda la sala a pantalla
 *      completa. Clic en el presentador y →.
 *
 * ——— Fallos de Lendex que se verían en vivo (12-nov) ———
 *
 * - «Tasa de Interes (%)» y «Ver tabla de amortizacion»: sin tilde, a 24 px
 *   en el proyector (PublicCalculator.tsx; 04 §2, fallo 7).
 * - «FINANCIAL SOLUTIONS» en inglés y en mayúsculas bajo el logo, en una
 *   pantalla en español.
 * - El campo de número toma «.» como decimal (ver el camino, paso 3).
 * - Con el campo vacío desaparecen los resultados y vuelven al escribir.
 * - El enlace «Términos» abre un aviso propio; las páginas legales con
 *   «[COMPLETAR]» (04 §10) no están en este camino: no salir de él.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { fijarProblema } from '../../motor/diagnostico';
import { useVisibleEnEntrada } from '../../motor/Entrada';
import { esPresentador, esRevision } from '../../motor/entorno';
import { medio } from '../../motor/medios';
import type { NotaPaso, PropsDiapositiva } from '../../motor/tipos';
import { Video } from '../../motor/Video';
import { useEnLinea, useModoDemo, useTeclaV } from './modoDemo';
import './demo-lendex.css';

/**
 * La calculadora pública (no pide cuenta), con «?calculadora»: cuando Lendex lo
 * tenga, abrirá directo en la calculadora (docs/GUION.md, 18 y M-07). Hoy
 * (13-nov) Lendex no hace nada con ese parámetro y abre su pantalla de entrar.
 */
export const URL_DEMO_LENDEX = 'https://lendexgp.com/app?calculadora';

/**
 * ¿Lendex ya abre la calculadora sola con «?calculadora»? Hoy no (comprobado
 * el 13-nov con `node scripts/lendex-grabar-demo.mjs --guion --comprobar`).
 * Mientras sea false, la 18 sigue el camino del guion para ese caso (M-07,
 * «Sin ?calculadora»): el iframe arranca sin recorte, a 1920 × 1080 CSS y sin
 * ampliar, con el botón «Calculadora de Préstamos» a la vista; Angel lo pulsa
 * y el clic siguiente pasa al recorte de 2× por corte. Cuando José lo
 * despliegue y ese --comprobar diga «abre sola», se pone en true y se vuelve a
 * compilar: la 18 abre directo en el recorte, sin la pantalla de entrar.
 */
export const LENDEX_ABRE_LA_CALCULADORA = false;

/**
 * El color-scheme del iframe de Lendex. Lendex se pinta según
 * prefers-color-scheme, y dentro de un iframe Chrome y Edge 157 se lo dan
 * según el color-scheme del elemento <iframe>, no según Windows. Medido el
 * 13-nov en la ThinkPad (Windows con las apps en claro, AppsUseLightTheme = 1;
 * Playwright sin emular el tema): con `dark` en el iframe, Lendex ve «dark» y
 * su pantalla de entrar sale oscura; sin él, ve el claro del navegador y la
 * mitad izquierda del proyector sale blanca, entre diapositivas negras. La
 * sala ya lo hereda de :root (base.css), pero se declara aquí para que no
 * dependa de eso.
 *
 * Ojo al verificar: Playwright emula por defecto `colorScheme: 'light'`, y la
 * emulación manda también dentro del iframe; así salía blanca la 18 en las
 * capturas de la revisión r2. Para ver lo que verá la sala, `colorScheme: null`.
 */
export const ESQUEMA_LENDEX = 'dark';

/** El aviso de la franja roja del presentador y de la nota del paso 0 de la 18. */
export const AVISO_LENDEX_EN_CLARO =
  'Lendex saldrá en claro en la demo: Windows con las apps en modo oscuro (Configuración → Personalización → Colores) o Chrome con --force-dark-mode (MOTOR §2).';

/**
 * Lo que verá Lendex, preguntado a una sonda: un iframe vacío del mismo
 * origen, oculto y con el mismo color-scheme. Un navegador que no pase el
 * color-scheme al iframe (otra versión, otro navegador) y con el tema claro
 * la deja en claro. Medido el 13-nov en Chrome y Edge 157: la sonda dice lo
 * mismo que Lendex con el tema claro y el oscuro, con y sin emular, y con
 * --force-dark-mode. Con display: none no vale (no calcula su estilo).
 */
let sonda: MediaQueryList | null | undefined;
function consultaLendex(): MediaQueryList | null {
  if (sonda !== undefined) return sonda;
  if (typeof document === 'undefined' || !document.body) return null;
  const marco = document.createElement('iframe');
  marco.setAttribute('aria-hidden', 'true');
  marco.tabIndex = -1;
  marco.inert = true;
  marco.style.cssText = `position:fixed;left:0;top:0;width:0;height:0;border:0;visibility:hidden;pointer-events:none;color-scheme:${ESQUEMA_LENDEX}`;
  document.body.append(marco);
  sonda = marco.contentWindow?.matchMedia('(prefers-color-scheme: dark)') ?? null;
  return sonda;
}

/** ¿Lendex saldría ahora en claro en este navegador? */
export function lendexSaleEnClaro(): boolean {
  const consulta = consultaLendex();
  return consulta !== null && !consulta.matches;
}

/**
 * Pone el aviso en la franja roja mientras Lendex fuera a salir en claro y lo
 * quita en cuanto el navegador pasa a oscuro, sin recargar. Solo para el
 * presentador (la sala no enseña avisos), que está en el mismo navegador.
 *
 * El «change» de la sonda no basta: es un iframe de 0 × 0 y oculto, y Chrome
 * deja de actualizarlo, así que a veces no lo dispara aunque `matches` ya diga
 * oscuro (medido el 13-nov con probar-notas.mjs: el aviso se quedaba). Por eso
 * se vuelve a preguntar a la sonda cuando cambia el tema de la propia ventana,
 * al volver el foco y, por si acaso, cada 2 s: leer `matches` siempre da lo de ahora.
 */
export function vigilarTemaLendex(): void {
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', vigilarTemaLendex, { once: true });
    return;
  }
  const consulta = consultaLendex();
  if (!consulta) return;
  const revisar = () => fijarProblema('lendex-en-claro', consulta.matches ? null : AVISO_LENDEX_EN_CLARO);
  revisar();
  consulta.addEventListener('change', revisar);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', revisar);
  window.addEventListener('focus', revisar);
  window.setInterval(revisar, 2000);
}

/**
 * La tarjeta «Calculadora de Préstamos» en la página de escritorio de Lendex a
 * 1920 × 1080 CSS, en tema oscuro: de x 1104 a 1776 y de y 316 a 764 (la
 * medida del guion visual; vuelta a medir el 13-nov con Playwright sobre
 * lendexgp.com). Está centrada en la columna derecha (LoginPage.tsx: «flex
 * items-center justify-center», max-w-2xl = 672 px).
 */
export const TARJETA_LENDEX = { x: 1104, y: 316, ancho: 672, alto: 448 } as const;

/**
 * Dónde queda la tarjeta en la diapositiva: ampliada 2×, 1344 × 896 en x 288,
 * y 115 (docs/GUION.md, 18). Las etiquetas de 12 px pasan a 24 px y las cifras
 * de 18 px a 36 px; la fila de la cuota cae hacia y 750–880.
 */
export const RECORTE_LENDEX = { x: 288, y: 115, escala: 2 } as const;
/** Las medidas del recorte para demo-lendex.css, sacadas de las constantes de arriba (una sola fuente). */
const GEOMETRIA = {
  '--lendex-tarjeta-x': `${TARJETA_LENDEX.x}px`,
  '--lendex-tarjeta-y': `${TARJETA_LENDEX.y}px`,
  '--lendex-recorte-x': `${RECORTE_LENDEX.x}px`,
  '--lendex-recorte-y': `${RECORTE_LENDEX.y}px`,
  '--lendex-recorte-ancho': `${TARJETA_LENDEX.ancho * RECORTE_LENDEX.escala}px`,
  '--lendex-recorte-alto': `${TARJETA_LENDEX.alto * RECORTE_LENDEX.escala}px`,
  '--lendex-escala': RECORTE_LENDEX.escala,
} as CSSProperties;

/** Grabado con scripts/lendex-grabar-demo.mjs el 12-nov: 1920×1080, VP9, 13,2 s, con lo que trae Lendex (RD$50,000 al 5 %). */
export const VIDEO_DEMO_LENDEX = 'medios/lendex/demo-calculadora.webm';
/** Primer fotograma del video: se ve mientras el video arranca. */
const INICIO_DEMO_LENDEX = 'medios/lendex/demo-inicio.webp';
/** Último fotograma del video, con la cuota: miniaturas, PDF, «Siguiente» y presentador. */
export const POSTER_DEMO_LENDEX = 'medios/lendex/demo-poster.webp';
/** Para `medios` de la diapositiva: se precargan al llegar a la anterior y el motor avisa si faltan. */
export const MEDIOS_DEMO_LENDEX = [VIDEO_DEMO_LENDEX, INICIO_DEMO_LENDEX, POSTER_DEMO_LENDEX] as const;

/** Nota del paso 0 para la diapositiva de la demo (05 §8.1: frase, claves y «si falla»). */
export const NOTA_DEMO_LENDEX: NotaPaso = {
  decir:
    'Esto es Lendex de verdad, en internet, sin cuenta. Díganme un monto: lo que le pedirían a un prestamista. Al cinco por ciento mensual y doce cuotas, la cuota sale sola.',
  claves: 'monto del público · cuota',
  siFalla:
    'Si no carga o se traba: saca el ratón por un lado (o clic en el presentador) y pulsa V. Sale el video del mismo camino con RD$50.000. Sin red, la sala ya enseña el video.',
};

/** Para `fuentes` de la diapositiva (panel «Fuentes» del presentador). */
export const FUENTES_DEMO_LENDEX: readonly string[] = [
  'Lendex, calculadora pública: https://lendexgp.com/app (sin cuenta).',
  'Con RD$50.000, 5 % mensual y 12 cuotas (francesa) la cuota es RD$5,641.27: 50 000 × 0,05 / (1 − 1,05⁻¹²) (síntesis §6.3; 04 §2).',
  'Video de respaldo grabado de lendexgp.com el 12-nov-2026 (scripts/lendex-grabar-demo.mjs).',
];

/** Otro video para la V: el del guion (M-07, src/medios-opcionales.ts) cuando llegue. */
export interface RespaldoDemoLendex {
  /** El video, relativo a public/ (como lo pide <Video>). */
  video: string;
  /** Su primer cuadro: se ve mientras el video arranca. */
  inicio: string;
}

export interface PropsDemoLendex extends Partial<PropsDiapositiva> {
  /**
   * El video de la V. Sin él (undefined), el del 12-nov (VIDEO_DEMO_LENDEX).
   * Con null, ninguno: la V no hace nada (la 18 sin M-07: no se enseña un
   * video con otras cifras que las que se dicen).
   */
  respaldo?: RespaldoDemoLendex | null;
  /**
   * La página de escritorio recortada a la tarjeta de la calculadora y
   * ampliada 2× (TARJETA_LENDEX → RECORTE_LENDEX). Sin él, Lendex entero a
   * 1920 × 1080 sin ampliar, para pulsar «Calculadora de Préstamos».
   */
  recorte?: boolean;
  /** Imagen quieta para el presentador, las miniaturas y las capturas. Por defecto, POSTER_DEMO_LENDEX. */
  poster?: string;
}

/**
 * La demo. Se usa como `Componente` de la diapositiva (recibe sus props y no
 * las necesita) o dentro de otra, a pantalla completa.
 */
export function DemoLendex({ respaldo, recorte = false, poster = POSTER_DEMO_LENDEX }: PropsDemoLendex = {}) {
  const { activa, rol, modo } = useDiapositiva();
  const { modo: modoDemo, t } = useModoDemo();
  const enLinea = useEnLinea();
  // Dentro de una <Entrada> (el <Detalle> de la 18) todavía oculta, la pieza está montada pero no se ve.
  const visibleEnEntrada = useVisibleEnEntrada();
  const enEscena = modo === 'escenario' && !esRevision;
  /** La instancia que está en pantalla en esta ventana: la que oye V (también antes de abrirse, para dejar el video puesto). */
  const manda = enEscena && activa && rol === 'actual';
  const hayVideo = respaldo !== null;
  useTeclaV(manda && hayVideo);
  const video = hayVideo && (modoDemo === 'video' || !enLinea);

  if (!enEscena) {
    return (
      <div className="lendex-demo">
        <img className="lendex-demo__lleno" src={medio(poster)} alt="" decoding="async" draggable={false} />
      </div>
    );
  }
  if (esPresentador)
    return (
      <VistaPresentador
        video={video}
        enLinea={enLinea}
        reinicio={t}
        respaldo={respaldo ?? undefined}
        recorte={recorte}
        poster={poster}
        hayVideo={hayVideo}
      />
    );
  return <VistaSala video={video} aLaVista={manda && visibleEnEntrada} reinicio={t} respaldo={respaldo ?? undefined} recorte={recorte} />;
}

/** El video, desde el principio cada vez que se pide (la clave lo vuelve a montar). */
function VideoDemo({ reinicio, respaldo }: { reinicio: number; respaldo?: RespaldoDemoLendex }) {
  return (
    <Video
      key={reinicio}
      className="lendex-demo__lleno"
      src={respaldo?.video ?? VIDEO_DEMO_LENDEX}
      poster={respaldo?.inicio ?? INICIO_DEMO_LENDEX}
      bucle={false}
    />
  );
}

/**
 * Teclas de escribir un número en la calculadora. Con la demo a la vista, si
 * el teclado no está dentro de Lendex (Angel aún no hizo clic en el campo, o
 * lo hizo en una franja), la sala no las usa: «20» + Intro saltaría a la 20,
 * Intro sola pasaría a la 19, Retroceso cerraría la calculadora, Inicio y Fin
 * irían a la portada o al cierre, y el punto pondría la sala en negro
 * (motor/teclado.ts). docs/GUION.md, «Lo que necesita el motor», 7: en la 18
 * «número + Intro» no salta. Las flechas, AvPág y RePág, Espacio, B y V siguen
 * mandando, y desde el presentador todo funciona como siempre.
 */
const TECLAS_DE_NUMERO = /^(?:[0-9.,+-]|Enter|Backspace|Delete|Home|End)$/;

/**
 * La sala. `aLaVista`: esta es la diapositiva en pantalla y la calculadora ya se
 * ve (en la 18, desde el paso 1, cuando se abre el detalle). Solo entonces, y en
 * vivo, Lendex puede quedarse con el teclado.
 *
 * Mientras no está a la vista (la 18 es la vecina con la 17 o la 19 en
 * pantalla, el paso 0 de la 18, o el video puesto), el iframe va `inert`. Pero
 * `inert` no basta: en Chrome 157 una página de otro origen dentro de un iframe
 * `inert` (o con visibility: hidden, o casi transparente como las vecinas) se
 * lleva el teclado con un simple focus() en uno de sus campos, y entonces las
 * flechas y el puntero dejan de mover la charla en la 17 o en el paso 0 de la
 * 18, sin nada en pantalla que lo explique. Medido el 13-nov con Playwright y
 * un Lendex falso que pide el foco una vez, o cada 150 ms. Hoy Lendex no lo
 * pide en /app, pero sí tiene campos con autoFocus en otras pantallas.
 *
 * Por eso, mientras no está a la vista, un vigilante devuelve el teclado a la
 * sala en cuanto Lendex lo toma (al perder la ventana el foco y, por si acaso,
 * cada 250 ms) y deja su caja dormida (display: none, demo-lendex.css) hasta
 * que la calculadora se vea: con Lendex ya cargado es lo único que le impide
 * volver a pedirlo (content-visibility: hidden no basta), y no lo recarga. No
 * se duerme de entrada: dormido, Lendex no corre sus animaciones, y al abrir
 * la calculadora se verían el final de su presentación y su entrada (hasta
 * 1,5 s, medido). Sin robo, Lendex sigue montado y la calculadora sale
 * asentada en cuanto se abre el detalle (la 18 lo deja pintado en su paso 0:
 * 18-demo-lendex.css).
 */
function VistaSala({
  video,
  aLaVista,
  reinicio,
  respaldo,
  recorte,
}: {
  video: boolean;
  aLaVista: boolean;
  reinicio: number;
  respaldo?: RespaldoDemoLendex;
  recorte: boolean;
}) {
  const marco = useRef<HTMLIFrameElement>(null);
  const ancla = useRef<HTMLSpanElement>(null);
  /** Lendex en vivo y a la vista: se puede pulsar (el clic de Angel). */
  const despierta = aLaVista && !video;
  /** Lendex tomó el teclado sin estar a la vista: queda dormido hasta que se vea. */
  const [dormida, setDormida] = useState(false);
  if (despierta && dormida) setDormida(false);

  /** Si el teclado está dentro de Lendex, se lo devuelve a la sala (y no deja nada enfocado). */
  const devolverTeclado = useCallback(() => {
    if (document.activeElement !== marco.current) return;
    marco.current?.blur();
    if (document.activeElement !== marco.current) return;
    ancla.current?.focus({ preventScroll: true });
    ancla.current?.blur();
  }, []);

  // El ratón sale de la ventana (hacia la pantalla del portátil): la sala recupera el teclado.
  useEffect(() => {
    if (!despierta) return;
    document.addEventListener('mouseleave', devolverTeclado);
    return () => document.removeEventListener('mouseleave', devolverTeclado);
  }, [despierta, devolverTeclado]);

  // Al pasar al video, al cerrar el detalle o al dejar de estar en pantalla, el
  // teclado vuelve a la charla. Y mientras no se vea, Lendex no se lo puede llevar.
  useEffect(() => {
    if (despierta) return;
    const vigilar = () => {
      if (document.activeElement !== marco.current) return;
      devolverTeclado();
      setDormida(true);
    };
    devolverTeclado();
    window.addEventListener('blur', vigilar);
    const reloj = window.setInterval(vigilar, 250);
    return () => {
      window.removeEventListener('blur', vigilar);
      window.clearInterval(reloj);
    };
  }, [despierta, devolverTeclado]);

  // Sin recorte (la pantalla de entrar, antes de «Calculadora de Préstamos»): ahí no se
  // escribe nada, solo se pulsa el botón. Tras el clic de Angel, Lendex se queda con el
  // teclado y el clicker de José ya no pasaría al recorte; así que la sala se lo quita
  // un momento después, cuando el clic ya llegó al botón (400 ms: el clic de una persona
  // tarda unos 100 ms entre bajar y subir el botón). En el recorte, Lendex se lo queda
  // para que Angel escriba (GUION, M-07: «Angel pulsa… y el siguiente clic pasa al recorte»).
  useEffect(() => {
    if (!despierta || recorte) return;
    let temporizador = 0;
    const alPerderElFoco = () => {
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(devolverTeclado, 400);
    };
    window.addEventListener('blur', alPerderElFoco);
    return () => {
      window.removeEventListener('blur', alPerderElFoco);
      window.clearTimeout(temporizador);
    };
  }, [despierta, recorte, devolverTeclado]);

  // Con la demo a la vista, escribir un número en la sala no mueve la charla (TECLAS_DE_NUMERO).
  // En captura, antes que el oyente del motor (teclado.ts, en window y sin captura).
  useEffect(() => {
    if (!aLaVista) return;
    const tragar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (TECLAS_DE_NUMERO.test(e.key)) e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', tragar, { capture: true });
    return () => window.removeEventListener('keydown', tragar, { capture: true });
  }, [aLaVista]);

  return (
    // Con la demo a la vista, un clic no avanza (Sala.tsx mira [data-sin-clic]): tampoco sobre el video.
    <div className="lendex-demo" data-modo={video ? 'video' : 'vivo'} data-sin-clic={aLaVista ? '' : undefined}>
      {/* El mismo iframe en las dos fases: pasar al recorte no lo recarga ni le borra lo escrito (demo-lendex.css). */}
      <div
        className="lendex-demo__caja"
        data-dormida={dormida ? '' : undefined}
        data-recorte={recorte ? '' : undefined}
        style={GEOMETRIA}
      >
        <iframe
          ref={marco}
          className="lendex-demo__marco"
          src={URL_DEMO_LENDEX}
          title="Lendex: calculadora de préstamos"
          // Sin allow-popups ni allow-top-navigation: Lendex no puede abrir ventanas
          // sobre el proyector ni sacar a la sala de la presentación.
          sandbox="allow-scripts allow-same-origin allow-forms"
          // Lendex en oscuro aunque Windows esté en claro (ESQUEMA_LENDEX).
          style={{ colorScheme: ESQUEMA_LENDEX }}
          tabIndex={-1}
          inert={!despierta}
          aria-hidden={video || undefined}
        />
      </div>
      {video && <VideoDemo reinicio={reinicio} respaldo={respaldo} />}
      {despierta &&
        (['izquierda', 'derecha'] as const).map((lado) => (
          <div
            key={lado}
            className="lendex-demo__borde"
            data-lado={lado}
            // La sala no avanza con un clic en [data-sin-clic] (Sala.tsx, esInteractivo); el
            // laboratorio no lo mira, así que además se corta aquí: un clic en la franja nunca mueve la charla.
            data-sin-clic
            onClick={(e) => e.stopPropagation()}
            onPointerEnter={devolverTeclado}
          />
        ))}
      <span ref={ancla} className="lendex-demo__ancla" tabIndex={-1} />
    </div>
  );
}

function VistaPresentador({
  video,
  enLinea,
  reinicio,
  respaldo,
  recorte,
  poster,
  hayVideo,
}: {
  video: boolean;
  enLinea: boolean;
  reinicio: number;
  respaldo?: RespaldoDemoLendex;
  recorte: boolean;
  poster: string;
  hayVideo: boolean;
}) {
  const conV = hayVideo ? ' · V pone el video' : ' · sin video de respaldo';
  const aviso = !enLinea
    ? hayVideo
      ? 'Sin red: la sala enseña el video'
      : 'Sin red y sin video de respaldo'
    : video
      ? 'La sala enseña el video · V vuelve a lo vivo'
      : recorte
        ? `La sala enseña Lendex en vivo${conV}`
        : 'Sala: la entrada de Lendex · Angel la abre';
  return (
    <div className="lendex-demo" data-modo={video ? 'video' : 'vivo'}>
      {video ? (
        <VideoDemo reinicio={reinicio} respaldo={respaldo} />
      ) : (
        <img className="lendex-demo__lleno" src={medio(poster)} alt="" decoding="async" draggable={false} />
      )}
      <p className="lendex-demo__aviso">{aviso}</p>
    </div>
  );
}
