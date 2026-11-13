/**
 * Demo en vivo de Lendex, con el video de respaldo a una tecla (V).
 *
 * Decisión de José (12-nov): la calculadora pública de https://lendexgp.com/app
 * EN VIVO, con internet, y el video del mismo camino listo (síntesis §8, demo
 * de los arcos A–C; §9.2.7 (b); 05 §7: «camino dorado» y video ≤ 60 s).
 *
 * ——— Cómo se ve ———
 *
 * La calculadora ocupa la diapositiva entera (composición «a sangre», §4.3):
 * un iframe de 960×540 px CSS escalado ×2 a 1920×1080. A ese tamaño Lendex
 * enseña su calculadora completa (la versión de pantalla estrecha, < 1024 px)
 * y su letra más pequeña (text-xs, 12 px) se proyecta a 24 px; los campos, a
 * 32 px, y la cuota, a 36 px. Medido el 12-nov a 960×540, 768×432 y 853×480:
 * solo 960×540 deja ver la cuota sin desplazar (investigación de la pieza).
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
 * - «Siguiente», cuadrícula, capturas, PDF (?revision=1): el póster, que es
 *   el último fotograma del video (la cuota RD$5,641.27).
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
 * - → · AvPág · clic (fuera de la calculadora): siguen avanzando la charla.
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
 * Al cambiar de diapositiva, el iframe queda `inert`: el foco no puede
 * quedarse escondido en una calculadora que ya no se ve.
 *
 * ——— El camino ensayado (el mismo del video) ———
 *
 *   1. En la diapositiva se ve la pantalla de entrar de Lendex (de verdad).
 *   2. Ratón al proyector, rueda hacia abajo sobre el formulario hasta ver
 *      «Calculadora de Préstamos» (debajo de «Entrar al Sistema») y clic.
 *   3. Clic en «Monto (RD$)», Ctrl + A y escribir el monto SIN punto ni coma
 *      (80000). Un punto es decimal en ese campo: «80.000» calcula 80 pesos.
 *   4. Igual con la tasa (5) y el plazo (12) si se quieren cambiar. La cuota
 *      cambia sola con cada tecla.
 *   5. Sacar el ratón por un lado (o clic en el presentador) y seguir.
 *   No tocar las listas (Frecuencia, Amortización, Interés): su desplegable es
 *   del sistema, sale pequeño y sin escalar en el proyector.
 *
 * ——— El día antes ———
 *
 * - `node scripts/lendex-grabar-demo.mjs --comprobar`: comprueba que Lendex
 *   se sigue dejando embeber (sin X-Frame-Options ni frame-ancestors), que
 *   el camino funciona y que la cuota da RD$5,641.27. Si Lendex cambió (C-26),
 *   `node scripts/lendex-grabar-demo.mjs` vuelve a grabar el video y los
 *   pósteres en public/medios/lendex/.
 * - Windows en modo oscuro (Configuración → Personalización → Colores →
 *   Modo: Oscuro). Lendex sigue el tema del sistema; en claro, su pantalla de
 *   entrar es blanca y deslumbra entre diapositivas negras. El video está
 *   grabado en oscuro. Si no se puede, el sol/luna de arriba a la derecha de
 *   Lendex lo cambia en vivo.
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
import { useCallback, useEffect, useRef } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { esPresentador, esRevision } from '../../motor/entorno';
import { medio } from '../../motor/medios';
import type { NotaPaso, PropsDiapositiva } from '../../motor/tipos';
import { Video } from '../../motor/Video';
import { useEnLinea, useModoDemo, useTeclaV } from './modoDemo';
import './demo-lendex.css';

/** La calculadora pública (no pide cuenta). */
export const URL_DEMO_LENDEX = 'https://lendexgp.com/app';
/** Grabado con scripts/lendex-grabar-demo.mjs: 1920×1080, VP9, 13,2 s, el mismo camino. */
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

/**
 * La demo. Se usa como `Componente` de la diapositiva (recibe sus props y no
 * las necesita) o dentro de otra, a pantalla completa.
 */
export function DemoLendex(_: Partial<PropsDiapositiva> = {}) {
  const { activa, rol, modo } = useDiapositiva();
  const { modo: modoDemo, t } = useModoDemo();
  const enLinea = useEnLinea();
  const enEscena = modo === 'escenario' && !esRevision;
  /** La instancia que está en pantalla en esta ventana: la que oye V. */
  const manda = enEscena && activa && rol === 'actual';
  useTeclaV(manda);
  const video = modoDemo === 'video' || !enLinea;

  if (!enEscena) {
    return (
      <div className="lendex-demo">
        <img className="lendex-demo__lleno" src={medio(POSTER_DEMO_LENDEX)} alt="" decoding="async" draggable={false} />
      </div>
    );
  }
  if (esPresentador) return <VistaPresentador video={video} enLinea={enLinea} reinicio={t} />;
  return <VistaSala video={video} manda={manda} reinicio={t} />;
}

/** El video, desde el principio cada vez que se pide (la clave lo vuelve a montar). */
function VideoDemo({ reinicio }: { reinicio: number }) {
  return (
    <Video
      key={reinicio}
      className="lendex-demo__lleno"
      src={VIDEO_DEMO_LENDEX}
      poster={INICIO_DEMO_LENDEX}
      bucle={false}
    />
  );
}

function VistaSala({ video, manda, reinicio }: { video: boolean; manda: boolean; reinicio: number }) {
  const marco = useRef<HTMLIFrameElement>(null);
  const ancla = useRef<HTMLSpanElement>(null);

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
    if (!manda) return;
    document.addEventListener('mouseleave', devolverTeclado);
    return () => document.removeEventListener('mouseleave', devolverTeclado);
  }, [manda, devolverTeclado]);

  // Al pasar al video o al dejar de estar en pantalla, el teclado vuelve a la charla.
  useEffect(() => {
    if (video || !manda) devolverTeclado();
  }, [video, manda, devolverTeclado]);

  return (
    <div className="lendex-demo" data-modo={video ? 'video' : 'vivo'}>
      <iframe
        ref={marco}
        className="lendex-demo__marco"
        src={URL_DEMO_LENDEX}
        title="Lendex: calculadora de préstamos"
        // Sin allow-popups ni allow-top-navigation: Lendex no puede abrir ventanas
        // sobre el proyector ni sacar a la sala de la presentación.
        sandbox="allow-scripts allow-same-origin allow-forms"
        tabIndex={-1}
        inert={!manda || video}
        aria-hidden={video || undefined}
      />
      {video && <VideoDemo reinicio={reinicio} />}
      {manda && !video &&
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

function VistaPresentador({ video, enLinea, reinicio }: { video: boolean; enLinea: boolean; reinicio: number }) {
  const aviso = !enLinea
    ? 'Sin red: la sala enseña el video'
    : video
      ? 'La sala enseña el video · V vuelve a lo vivo'
      : 'La sala enseña Lendex en vivo · V pone el video';
  return (
    <div className="lendex-demo" data-modo={video ? 'video' : 'vivo'}>
      {video ? (
        <VideoDemo reinicio={reinicio} />
      ) : (
        <img className="lendex-demo__lleno" src={medio(POSTER_DEMO_LENDEX)} alt="" decoding="async" draggable={false} />
      )}
      <p className="lendex-demo__aviso">{aviso}</p>
    </div>
  );
}
