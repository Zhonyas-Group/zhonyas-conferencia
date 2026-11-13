/**
 * Reloj del laboratorio: tiempo que se puede parar y mover cuadro a cuadro,
 * para capturar una animación en instantes exactos (t = 0, 33, 66… ms) sin
 * depender de lo rápido que vaya el equipo.
 *
 * Se instala ANTES que todo lo demás (es el primer import de arranque.tsx),
 * porque GSAP guarda Date.now al cargarse. Mientras el reloj corre, todo va en
 * tiempo real. Al congelarlo:
 *   - requestAnimationFrame, performance.now y Date.now pasan a tiempo virtual
 *     (lo usan GSAP, motion, OGL y cualquier bucle propio);
 *   - las animaciones del documento (Web Animations, transiciones y
 *     animaciones CSS) se pausan y se colocan en su instante virtual.
 * setTimeout y setInterval siguen en tiempo real: una pieza no debe medir su
 * movimiento con ellos (usa el `delay` de WAAPI o de CSS).
 *
 * Solo lo carga el laboratorio (lab.html); la presentación no lo toca.
 */

const nativo = {
  raf: window.requestAnimationFrame.bind(window),
  caf: window.cancelAnimationFrame.bind(window),
  ahora: performance.now.bind(performance),
  fecha: Date.now.bind(Date),
  animar: Element.prototype.animate,
};

let congelado = false;
/** Instante virtual (escala de performance.now) mientras está congelado. */
let t = 0;
/** Lo que el tiempo virtual se adelantó al real: al soltar, el reloj nunca va hacia atrás. */
let adelanto = 0;
let desfaseFecha = 0;
let siguienteId = 1;
/** Cuadros pedidos con el reloj congelado: se sirven al mover el tiempo. */
const pendientes = new Map<number, FrameRequestCallback>();
/** Cuadros pedidos en tiempo real: id propio → id del navegador. */
const enEspera = new Map<number, number>();
/** Animaciones del documento bajo control: instante virtual en que empezaron. */
const seguidas = new Map<Animation, number>();
const terminadas = new WeakSet<Animation>();

window.requestAnimationFrame = (cb: FrameRequestCallback): number => {
  const id = siguienteId++;
  if (congelado) {
    pendientes.set(id, cb);
    return id;
  }
  const n = nativo.raf((marca) => {
    enEspera.delete(id);
    if (congelado) pendientes.set(id, cb);
    else cb(marca + adelanto);
  });
  enEspera.set(id, n);
  return id;
};

window.cancelAnimationFrame = (id: number) => {
  pendientes.delete(id);
  const n = enEspera.get(id);
  if (n !== undefined) {
    nativo.caf(n);
    enEspera.delete(id);
  }
};

performance.now = () => (congelado ? t : nativo.ahora() + adelanto);
Date.now = () => (congelado ? Math.round(t + desfaseFecha) : nativo.fecha() + Math.round(adelanto));

Element.prototype.animate = function (this: Element, ...argumentos: Parameters<Element['animate']>) {
  const animacion = nativo.animar.apply(this, argumentos);
  if (congelado) seguir(animacion);
  return animacion;
};

function seguir(a: Animation) {
  if (seguidas.has(a) || terminadas.has(a)) return;
  seguidas.set(a, t - (Number(a.currentTime) || 0));
  a.pause();
}

/** Pone cada animación del documento en su instante virtual; termina las que ya acabaron. */
function sincronizar() {
  for (const a of document.getAnimations()) seguir(a);
  for (const [a, inicio] of seguidas) {
    if (a.playState === 'idle') {
      seguidas.delete(a);
      continue;
    }
    const local = t - inicio;
    const fin = Number(a.effect?.getComputedTiming().endTime ?? Infinity);
    if (Number.isFinite(fin) && local >= fin) {
      seguidas.delete(a);
      terminadas.add(a);
      a.finish();
    } else {
      a.currentTime = Math.max(0, local);
    }
  }
}

export function estaCongelado(): boolean {
  return congelado;
}

/** Instante virtual actual (ms, escala de performance.now). */
export function ahoraVirtual(): number {
  return congelado ? t : nativo.ahora() + adelanto;
}

/** Para el tiempo. Las animaciones en marcha se quedan donde van. */
export function congelar() {
  if (congelado) return;
  t = nativo.ahora() + adelanto;
  desfaseFecha = nativo.fecha() - nativo.ahora();
  congelado = true;
  sincronizar();
}

/** Recoge las animaciones CSS que acaba de crear un cambio (se llama justo después de él). */
export function recoger() {
  if (!congelado) return;
  // Leer un estilo obliga al navegador a crear ya las transiciones que tocan.
  void getComputedStyle(document.documentElement).opacity;
  sincronizar();
}

/** Mueve el tiempo virtual hasta `destino` en cuadros de 1/60 s, sirviendo los rAF y colocando las animaciones. */
export async function moverHasta(destino: number) {
  if (!congelado) throw new Error('El reloj no está congelado: llama antes a congelar().');
  const cuadro = 1000 / 60;
  while (t < destino - 1e-6) {
    t = Math.min(destino, t + cuadro);
    const lote = [...pendientes.values()];
    pendientes.clear();
    for (const cb of lote) {
      try {
        cb(t);
      } catch (error) {
        console.error('[laboratorio] Un requestAnimationFrame falló:', error);
      }
    }
    sincronizar();
    // Deja correr las promesas (fin de animaciones) y las tareas que encolen.
    await Promise.resolve();
  }
  sincronizar();
}

/** Vuelve al tiempo real: lo pausado sigue desde donde quedó y el reloj no retrocede. */
export function soltar() {
  if (!congelado) return;
  adelanto = Math.max(adelanto, t - nativo.ahora());
  congelado = false;
  for (const a of seguidas.keys()) {
    try {
      a.play();
    } catch {
      /* ya cancelada */
    }
  }
  seguidas.clear();
  const lote = [...pendientes.values()];
  pendientes.clear();
  for (const cb of lote) window.requestAnimationFrame(cb);
}

/** Un cuadro de verdad del navegador (para esperar a que pinte), aunque el reloj esté congelado. */
export function cuadroReal(): Promise<void> {
  return new Promise((resolver) => nativo.raf(() => resolver()));
}
