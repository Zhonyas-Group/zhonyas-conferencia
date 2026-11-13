/**
 * Z-10 · El agujero negro de Contacto como transición entre dos diapositivas
 * (síntesis §4.4; 03 M12; 02 §5.7). Una sola vez en toda la charla.
 *
 * Copiado de zhonyas-web:
 *   - components/contact-section.tsx:19-29   constantes y smoothstep;
 *   - components/contact-section.tsx:108-169 la función `render(progress)`, sin cambios en sus fórmulas;
 *   - components/contact-section.tsx:219-262 el tween por reloj (begin, finish, tick): 1500 ms al
 *     abrir, 1200 ms al cerrar, lineal en t, y lo proporcional si se interrumpe a medias;
 *   - components/team-contact.css:109-137    las capas (agujero.css);
 *   - lib/black-hole-lens.ts                 el mapa de la lente (lente.ts).
 * Sobra todo el control del scroll (contact-section.tsx:170-338: Lenis, retención, saltos):
 * aquí el progreso solo lo mueve el reloj, como en la web desde el commit #97.
 *
 * Cómo encaja en el motor (MOTOR.md §4.6): la transición vive en la diapositiva
 * que sale del agujero (B, «Contacto» en la web). Al avanzar de A a B se abre
 * sobre A («Proyectos» en la web), que se encoge hacia el agujero, se oscurece y
 * se curva con la lente; al retroceder de B a A se cierra (1200 ms).
 *
 * Fórmulas (todas de contact-section.tsx, `progress` = p, lineal en el tiempo):
 *   e = p²(3 − 2p)                                   :114
 *   radio = media diagonal × e                       :115-116
 *   B: clip-path circle(radio) hasta p ≥ 0,999       :121
 *   disco: escala radio / 400; brillo min(1, p/0,04) × (1 − smooth(0,72; 0,98; p))   :129-130
 *   horizonte: 1 − smooth(0,55; 0,92; p)             :131
 *   texto de B: smooth(0,62; 0,95; p)                :136
 *   A: scale 1 − e × 0,045 hacia el centro del agujero; brightness 1 − e × 0,5      :139-147
 *   lente: radio × 0,9 × min(1, p/0,05) × (1 − smooth(0,8; 0,999; p))               :148-160
 *
 * No va (a propósito):
 *   - la galaxia (Galaxy.jsx de React Bits, contact-section.tsx:356-362) ni el empuje de sus
 *     estrellas (:132): su licencia no está confirmada para la charla. Dentro del agujero se ve
 *     el fondo de la diapositiva B, quieto (o lo que B pinte con data-agujero-fondo);
 *   - `inert`, `data-ready` y `visibility: hidden` de Proyectos (:122-123, :165-167): de qué capa
 *     se ve y cuál recibe el puntero ya se encarga el motor.
 *
 * El presentador no lo reproduce: hace corte (C-02; la diapositiva va `pesada` con póster, ver
 * conAgujeroNegro). Con «menos movimiento» tampoco: la web abre Contacto sin agujero
 * (contact-section.tsx:83, 266). En modo revisión el motor ya no ejecuta transiciones.
 */
import { fijarProblema } from '../../motor/diagnostico';
import { cuandoLibre, esPresentador, esRevision } from '../../motor/entorno';
import type { Diapositiva, Transicion } from '../../motor/tipos';
import { anotarRecorrido, LENS_EXTENT, lenteEncendida, mapaLente } from './lente';
import './agujero.css';

// ——— Constantes (contact-section.tsx) ———

/** contact-section.tsx:19 (OPEN_MS). */
export const OPEN_MS = 1500;
/** contact-section.tsx:20 (CLOSE_MS). */
export const CLOSE_MS = 1200;
/** Desplazamiento en el horizonte, como parte del radio del agujero (contact-section.tsx:25). */
const LENS_STRENGTH = 0.9;
/** contact-section.tsx:26-29. */
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

const ID_FILTRO = 'zh-agujero-lente';
const SVG = 'http://www.w3.org/2000/svg';

// ——— Las capas (agujero.css; contact-section.tsx:344-351 y 377-381) ———

interface Lente {
  filtro: SVGFilterElement;
  mapa: SVGFEImageElement;
  desplazamiento: SVGFEDisplacementMapElement;
}

interface Capas {
  raiz: HTMLDivElement;
  horizonte: HTMLDivElement;
}

let lenteCreada: Lente | null = null;

/**
 * contact-section.tsx:344-351: el filtro de la lente, tal cual. Como en la web,
 * se crea una vez y se queda (un filtro definido y sin usar no pinta nada), con
 * el mapa puesto una sola vez (:87): así el navegador no vuelve a decodificar el
 * mapa en el primer cuadro de cada recorrido. Va en <body>, fuera de React.
 */
function lente(): Lente {
  if (lenteCreada?.filtro.isConnected) return lenteCreada;
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('class', 'zh-agujero__lente');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const filtro = document.createElementNS(SVG, 'filter');
  filtro.id = ID_FILTRO;
  filtro.setAttribute('filterUnits', 'userSpaceOnUse');
  filtro.setAttribute('color-interpolation-filters', 'sRGB');
  const neutro = document.createElementNS(SVG, 'feFlood');
  neutro.setAttribute('flood-color', 'rgb(128,128,128)');
  neutro.setAttribute('result', 'neutral');
  const mapa = document.createElementNS(SVG, 'feImage');
  mapa.setAttribute('preserveAspectRatio', 'none');
  mapa.setAttribute('result', 'lens-map');
  const mezcla = document.createElementNS(SVG, 'feMerge');
  mezcla.setAttribute('result', 'lens-field');
  for (const entrada of ['neutral', 'lens-map']) {
    const nodo = document.createElementNS(SVG, 'feMergeNode');
    nodo.setAttribute('in', entrada);
    mezcla.appendChild(nodo);
  }
  const desplazamiento = document.createElementNS(SVG, 'feDisplacementMap');
  desplazamiento.setAttribute('in', 'SourceGraphic');
  desplazamiento.setAttribute('in2', 'lens-field');
  desplazamiento.setAttribute('scale', '0');
  desplazamiento.setAttribute('xChannelSelector', 'R');
  desplazamiento.setAttribute('yChannelSelector', 'G');
  filtro.append(neutro, mapa, mezcla, desplazamiento);
  svg.appendChild(filtro);
  mapa.setAttribute('href', mapaLente()); // contact-section.tsx:87
  document.body.appendChild(svg);
  lenteCreada = { filtro, mapa, desplazamiento };
  return lenteCreada;
}

/**
 * contact-section.tsx:377 (.contact-horizon) y 379-381 (.contact-blackhole y su
 * disco). Solo existen mientras dura la transición: al terminar se quitan, y
 * con ellas las vetas que giran.
 */
function crearCapas(b: HTMLElement): Capas {
  const raiz = document.createElement('div');
  raiz.className = 'zh-agujero';
  raiz.setAttribute('aria-hidden', 'true');
  const horizonte = document.createElement('div');
  horizonte.className = 'zh-agujero__horizonte';
  const luz = document.createElement('div');
  luz.className = 'zh-agujero__luz';
  const disco = document.createElement('div');
  disco.className = 'zh-agujero__disco';
  for (const nombre of ['resplandor', 'doppler', 'vetas', 'fotones']) {
    const i = document.createElement('i');
    i.className = `zh-agujero__${nombre}`;
    disco.appendChild(i);
  }
  luz.appendChild(disco);
  raiz.append(horizonte, luz);
  b.appendChild(raiz);
  return { raiz, horizonte };
}

// ——— El recorrido ———

/** Lo que el motor espera de una línea de tiempo (tipos.ts, ResultadoTransicion): progress, then y kill. */
interface Recorrido {
  progress: (valor: number) => void;
  then: (fn: () => void) => void;
  kill: () => void;
}

/**
 * Si el orador vuelve atrás a mitad de camino, el motor lleva la transición a su
 * final y empieza la contraria en el mismo instante. La web sigue desde donde
 * iba y tarda lo proporcional (contact-section.tsx:226-227; 02 §5.7): aquí se
 * recuerda dónde se cortó para que la contraria salga de ahí.
 */
let cortado: { b: HTMLElement; progreso: number; hacia: 0 | 1; cuando: number } | null = null;
/** Lo que se tarda, como mucho, entre el corte y la transición contraria (el mismo cambio de React). */
const MS_CORTE_A_CONTRARIA = 100;

function recorrer(a: HTMLElement, b: HTMLElement, to: 0 | 1): Recorrido {
  const diapositivaB = b.querySelector<HTMLElement>(':scope > .diapositiva');
  // La escena es el escenario fijo de 1920 × 1080: medido una vez (la web lo mide en cada
  // cuadro porque su panel cambia con la ventana, contact-section.tsx:115-118).
  const ancho = b.offsetWidth || 1920;
  const alto = b.offsetHeight || 1080;
  const radius = Math.hypot(ancho, alto) / 2; // contact-section.tsx:115 (1101 px a 1920 × 1080)
  // Proyectos se encoge hacia el agujero, no hacia su propio centro (contact-section.tsx:140-143).
  // Las dos capas cubren el escenario entero: la esquina de A está en (0, 0) y el centro del
  // agujero en (ancho/2, alto/2), así que no hace falta leer cajas ni deshacer la escala anterior.
  const left = 0,
    top = 0;
  const origin = [ancho / 2 - left, alto / 2 - top];
  cancelarPrecalentado?.();
  const lens = lenteEncendida();
  const filtroLente = lens ? lente() : null;
  const capas = crearCapas(b);
  const fondoB = diapositivaB ? getComputedStyle(diapositivaB).backgroundColor : '';
  if (fondoB) b.style.setProperty('--zh-agujero-fondo', fondoB);
  b.dataset.agujero = to === 1 ? 'abre' : 'cierra';
  // Al cerrar, B es la que sale (z 1 en motor.css) pero se tiene que cerrar ENCIMA de A.
  if (to === 0) b.style.zIndex = '3';
  a.style.transformOrigin = `${origin[0]}px ${origin[1]}px`; // contact-section.tsx:143
  if (filtroLente) {
    // «Filter only what is on screen, in Proyectos' own coordinates» (contact-section.tsx:150-155).
    const margin = 0.08; // :150
    filtroLente.filtro.setAttribute('x', String(-left - ancho * margin)); // :152
    filtroLente.filtro.setAttribute('y', String(-top - alto * margin)); // :153
    filtroLente.filtro.setAttribute('width', String(ancho * (1 + 2 * margin))); // :154
    filtroLente.filtro.setAttribute('height', String(alto * (1 + 2 * margin))); // :155
  }

  let lastProgress = -1;
  /** contact-section.tsx:108-169 (render), con las mismas fórmulas. */
  const render = (progress: number) => {
    // Nothing moves while the progress is unchanged (contact-section.tsx:109-111).
    if (progress === lastProgress) return;
    lastProgress = progress;
    const eased = progress * progress * (3 - 2 * progress); // :114
    const hole = radius * eased; // :116
    const recorte = progress >= 0.999 ? 'none' : `circle(${hole}px at 50% 50%)`; // :121
    if (diapositivaB) diapositivaB.style.clipPath = recorte;
    capas.horizonte.style.clipPath = recorte; // en la web el horizonte va dentro de la sección recortada
    // El disco abraza el horizonte y se apaga cuando el agujero ya es más ancho que la pantalla;
    // el horizonte sigue negro hasta que B sale de dentro (:127-131).
    b.style.setProperty('--bh-scale', String(hole / 400)); // :129
    b.style.setProperty('--bh-glow', String(Math.min(1, progress / 0.04) * (1 - smooth(0.72, 0.98, progress)))); // :130
    b.style.setProperty('--bh-dark', String(1 - smooth(0.55, 0.92, progress))); // :131
    b.style.setProperty('--contact-fade', String(smooth(0.62, 0.95, progress))); // :136
    // A, detrás (:138-164).
    const scale = 1 - eased * 0.045; // :139
    // No scale or filter at rest: even an identity filter keeps it in its own GPU layer (:144-145).
    a.style.scale = scale < 1 ? `${scale}` : '';
    const dim = `brightness(${1 - eased * 0.5})`; // :147
    const strength = Math.min(1, progress / 0.05) * (1 - smooth(0.8, 0.999, progress)); // :148
    if (filtroLente && strength > 0.001) {
      const extent = LENS_EXTENT * hole; // :150
      filtroLente.mapa.setAttribute('x', String(origin[0] - extent)); // :156
      filtroLente.mapa.setAttribute('y', String(origin[1] - extent)); // :157
      filtroLente.mapa.setAttribute('width', String(2 * extent)); // :158
      filtroLente.mapa.setAttribute('height', String(2 * extent)); // :159
      filtroLente.desplazamiento.setAttribute('scale', String(hole * LENS_STRENGTH * strength)); // :160
      a.style.filter = `url(#${ID_FILTRO}) ${dim}`; // :161
    } else {
      a.style.filter = eased > 0 ? dim : ''; // :163
    }
  };

  // contact-section.tsx:226-227: desde donde iba, y lo proporcional del tiempo.
  const ahora = performance.now();
  const contraria = cortado && cortado.b === b && cortado.hacia !== to && ahora - cortado.cuando < MS_CORTE_A_CONTRARIA;
  const from = contraria ? cortado!.progreso : 1 - to;
  cortado = null;
  const duration = (to === 1 ? OPEN_MS : CLOSE_MS) * Math.abs(to - from); // :227
  const start = ahora;
  // El primer cuadro ya sale en su estado inicial (sin parpadeo de B entera ni de A sin encoger).
  render(from);

  let frame = 0;
  let vivo = true;
  const alTerminar: Array<() => void> = [];
  // Medida del recorrido para el interruptor de la lente: solo requestAnimationFrame (C-13).
  let cuadros = 0,
    primero = 0,
    ultimo = 0,
    peor = 0;

  const limpiar = () => {
    capas.raiz.remove();
    delete b.dataset.agujero;
    if (diapositivaB) diapositivaB.style.removeProperty('clip-path');
    for (const p of ['--bh-scale', '--bh-glow', '--bh-dark', '--contact-fade', '--zh-agujero-fondo', 'z-index']) b.style.removeProperty(p);
    for (const p of ['scale', 'filter', 'transform-origin']) a.style.removeProperty(p); // como la web al desmontar (:336)
  };
  const acabar = () => {
    if (!vivo) return;
    vivo = false;
    cancelAnimationFrame(frame);
    frame = 0;
    limpiar();
    for (const fn of alTerminar.splice(0)) fn();
  };

  // contact-section.tsx:248-264 (tick, la rama del tween).
  const tick = (now: number) => {
    frame = 0;
    if (!vivo) return;
    if (cuadros === 0) primero = now;
    else peor = Math.max(peor, now - ultimo);
    cuadros++;
    ultimo = now;
    // La marca de tiempo de un cuadro puede ser anterior al arranque: t no baja de 0.
    const t = Math.max(0, Math.min(1, (now - start) / Math.max(duration, 1))); // :260
    render(from + (to - from) * t); // :261
    if (t >= 1) {
      // Solo un recorrido entero mide (uno cortado o proporcional no decide nada).
      if (!contraria && ultimo > primero) {
        const ms = ultimo - primero;
        anotarRecorrido({ fps: ((cuadros - 1) * 1000) / ms, cuadros, ms, peor, conLente: lens, sentido: to === 1 ? 'abrir' : 'cerrar' });
      }
      render(to); // finish() (:240)
      acabar();
    } else frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    // El motor la lleva a su final si el orador avanza a mitad (MOTOR.md §4.6): como finish() (:233-247).
    progress: (valor: number) => {
      if (!vivo) return;
      if (valor >= 1) {
        cortado = { b, progreso: lastProgress, hacia: to, cuando: performance.now() };
        render(to);
        acabar();
      }
    },
    then: (fn) => {
      if (vivo) alTerminar.push(fn);
      else fn();
    },
    kill: acabar,
  };
}

// ——— Precalentado: que el primer recorrido no pague lo que se pinta por primera vez ———

/**
 * El agujero sale una sola vez por carga, así que el público ve justo el primer
 * recorrido, el más caro: con el navegador en frío, el disco (degradados,
 * máscaras y `mix-blend-mode`) daba cuadros de 117–167 ms y la lente se medía
 * en su peor momento (19–22 fps frente a 36–41 de los siguientes). Por eso,
 * cuando B ya está montada como vecina oculta (opacidad 0,002 bajo la actual,
 * motor.css) y el navegador está libre, se pinta una vez dentro de B, durante
 * CUADROS_PRECALENTADO cuadros, el disco a mitad de recorrido y, si la lente va
 * encendida, el filtro sobre la propia B. B no se ve, así que en pantalla no
 * cambia nada y nada se mueve; después se quita todo. No es un movimiento: no
 * lleva valores de la web porque no se ve.
 * Medido en este PC con el navegador en frío (3 cargas por caso, mismas condiciones):
 *   sin lente, el primer recorrido pasa de 50–53 a 55–58 fps y el peor cuadro de 100–134 a 50–67 ms;
 *   con lente, de 23–27 a 31–32 fps (los siguientes recorridos dan 36–41).
 */
const CUADROS_PRECALENTADO = 4;
let cancelarPrecalentado: (() => void) | null = null;

function precalentar(b: HTMLElement, alTerminar: () => void) {
  const capas = crearCapas(b);
  // Un estado intermedio cualquiera: el disco entero, a escala 1 (horizonte de 400 px).
  capas.raiz.style.cssText = '--bh-scale: 1; --bh-glow: 1; --bh-dark: 0.5';
  const filtroLente = lenteEncendida() ? lente() : null;
  if (filtroLente) {
    filtroLente.mapa.setAttribute('x', '560');
    filtroLente.mapa.setAttribute('y', '140');
    filtroLente.mapa.setAttribute('width', '800');
    filtroLente.mapa.setAttribute('height', '800');
    filtroLente.desplazamiento.setAttribute('scale', '100');
    b.style.filter = `url(#${ID_FILTRO}) brightness(0.5)`;
  }
  let n = 0,
    frame = 0;
  // Termina igual si se acaban los cuadros o si el agujero empieza antes (recorrer lo cancela):
  // en los dos casos ya no hace falta volver a precalentar.
  const quitar = () => {
    cancelAnimationFrame(frame);
    capas.raiz.remove();
    if (filtroLente) b.style.removeProperty('filter');
    cancelarPrecalentado = null;
    alTerminar();
  };
  cancelarPrecalentado = quitar;
  const cuadro = () => {
    if (++n < CUADROS_PRECALENTADO) frame = requestAnimationFrame(cuadro);
    else quitar();
  };
  frame = requestAnimationFrame(cuadro);
}

/** ¿Hay algo animándose que vaya a terminar en la diapositiva en pantalla? (como Secuencia.tsx, `animandose`). */
function salaOcupada(): boolean {
  const actual = document.querySelector<HTMLElement>('.capa[data-rol="actual"]');
  return !!actual?.getAnimations({ subtree: true }).some((a) => a.playState === 'running' && Number.isFinite(Number(a.effect?.getComputedTiming().endTime ?? Infinity)));
}

const precalentadas = new WeakSet<HTMLElement>();

/**
 * Vigila, una vez por segundo, si la diapositiva `id` ya está montada como vecina
 * oculta y, con el navegador libre y la sala quieta, la precalienta una vez por
 * carga. No corre en el presentador (allí el agujero es un corte) ni en revisión.
 */
export function precalentarAgujero(id: string) {
  if (esPresentador || esRevision) return;
  let ocupado = false;
  const reloj = window.setInterval(() => {
    if (ocupado) return;
    const b = document.querySelector<HTMLElement>(`.capa[data-rol="oculta"][data-id="${CSS.escape(id)}"]`);
    if (!b || precalentadas.has(b)) return;
    ocupado = true;
    cuandoLibre(() => {
      const sigue = b.isConnected && b.dataset.rol === 'oculta' && !b.dataset.agujero;
      if (!sigue || salaOcupada()) {
        ocupado = false;
        return;
      }
      precalentar(b, () => {
        precalentadas.add(b);
        window.clearInterval(reloj);
      });
    }, 2000);
  }, 1000);
}

// ——— La transición para el motor ———

/** La capa que entra: el motor llama a `entrar` y, justo después, a `salir` (transiciones.ts). */
let capaQueEntra: HTMLElement | null = null;

/**
 * Z-10 como `Transicion` del motor. Úsala con `conAgujeroNegro` (marca la
 * diapositiva como pesada y avisa si se usa más de una vez).
 */
export const agujeroNegro: Transicion = {
  entrar: (capa) => {
    capaQueEntra = capa;
  },
  salir: (capa, { direccion, reducido }) => {
    const entra = capaQueEntra;
    capaQueEntra = null;
    // Corte seco (Z-00) en el presentador (C-02) y con «menos movimiento» (contact-section.tsx:83, 266).
    if (!entra || esPresentador || reducido) return;
    // Al avanzar, entra B (la que lleva la transición) y sale A; al retroceder, al revés.
    const b = direccion > 0 ? entra : capa;
    const a = direccion > 0 ? capa : entra;
    return recorrer(a, b, direccion > 0 ? 1 : 0);
  },
};

const usos = new Set<string>();

/**
 * Lo que una diapositiva añade a su definición para salir del agujero negro:
 *
 *   export default definirDiapositiva({
 *     id: 'contacto', …,
 *     ...conAgujeroNegro({ id: 'contacto', poster: 'medios/posters/contacto.webp' }),
 *   });
 *
 * Pone la transición, la marca `pesada` (el presentador enseña el póster y hace
 * corte, C-02) y avisa en desarrollo si dos diapositivas la usan: Z-10 va una
 * sola vez en la charla (síntesis §4.4; A-56).
 */
export function conAgujeroNegro({ id, poster }: { id: string; poster: string }): Pick<Diapositiva, 'transicion' | 'pesada' | 'poster'> {
  usos.add(id);
  if (usos.size > 1) {
    fijarProblema(
      'agujero-negro:una-vez',
      `El agujero negro (Z-10) sale en ${usos.size} diapositivas (${[...usos].join(', ')}): va una sola vez en la charla (síntesis §4.4).`,
    );
  }
  precalentarAgujero(id);
  // La transición cuenta como el momento animado de la diapositiva (A-54): el motor ya la anota (Secuencia.tsx).
  return { transicion: agujeroNegro, pesada: true, poster };
}
