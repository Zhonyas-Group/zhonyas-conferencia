/**
 * Modo de la demo de Lendex, compartido entre la sala y el presentador:
 * «vivo» (la calculadora de lendexgp.com dentro de la diapositiva) o «video»
 * (la grabación del mismo camino, public/medios/lendex/demo-calculadora.webm).
 *
 * La tecla V lo cambia desde cualquiera de las dos ventanas y la otra lo sigue,
 * por las mismas dos vías que el motor (motor/canal.ts): BroadcastChannel y,
 * de respaldo, el evento `storage` de localStorage. Gana el cambio más reciente.
 * Va con el prefijo de la carpeta (motor/entorno.ts, PREFIJO): una copia vieja
 * de la presentación abierta a la vez no cambia el modo de la buena.
 *
 * Un modo guardado hace más de una hora (un ensayo) no cuenta: al abrir, la
 * demo vuelve a «vivo», como el cronómetro del motor (MOTOR.md §2, paso 8).
 */
import { useEffect, useSyncExternalStore } from 'react';
import { almacen, PREFIJO } from '../../motor/entorno';

export type ModoDemo = 'vivo' | 'video';

export interface RegistroModo {
  modo: ModoDemo;
  /** Cuándo se cambió (Date.now()). Sirve para que gane el último y para reiniciar el video. */
  t: number;
}

const CLAVE = 'lendex-demo';
const CADUCA_MS = 60 * 60 * 1000;

function valido(r: unknown): r is RegistroModo {
  const x = r as RegistroModo | null;
  return !!x && (x.modo === 'vivo' || x.modo === 'video') && typeof x.t === 'number';
}

function inicial(): RegistroModo {
  const guardado = almacen.leer<RegistroModo>(CLAVE);
  if (valido(guardado) && Date.now() - guardado.t < CADUCA_MS) return guardado;
  return { modo: 'vivo', t: 0 };
}

let actual: RegistroModo = inicial();
const oyentes = new Set<() => void>();

function aplicar(r: RegistroModo) {
  if (r.t <= actual.t) return; // gana el cambio más reciente
  actual = r;
  oyentes.forEach((avisar) => avisar());
}

let canal: BroadcastChannel | null = null;
try {
  canal = new BroadcastChannel(`${PREFIJO}:${CLAVE}`);
  canal.onmessage = (e: MessageEvent) => {
    if (valido(e.data)) aplicar(e.data);
  };
} catch {
  /* sin BroadcastChannel: queda localStorage */
}

window.addEventListener('storage', (e) => {
  if (e.key !== `${PREFIJO}:${CLAVE}` || !e.newValue) return;
  try {
    const r: unknown = JSON.parse(e.newValue);
    if (valido(r)) aplicar(r);
  } catch {
    /* valor ajeno */
  }
});

/** Cambia el modo (sin argumento, lo alterna) en esta ventana y en las demás. */
export function cambiarModoDemo(modo?: ModoDemo) {
  const nuevo: RegistroModo = {
    modo: modo ?? (actual.modo === 'vivo' ? 'video' : 'vivo'),
    t: Math.max(Date.now(), actual.t + 1),
  };
  aplicar(nuevo);
  almacen.escribir(CLAVE, nuevo);
  try {
    canal?.postMessage(nuevo);
  } catch {
    /* canal cerrado */
  }
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

/** El modo actual de la demo (se vuelve a pintar cuando cambia en cualquier ventana). */
export function useModoDemo(): RegistroModo {
  return useSyncExternalStore(suscribir, () => actual);
}

// ——— Con red o sin ella ———

function suscribirRed(avisar: () => void) {
  window.addEventListener('online', avisar);
  window.addEventListener('offline', avisar);
  return () => {
    window.removeEventListener('online', avisar);
    window.removeEventListener('offline', avisar);
  };
}

/**
 * `false` cuando el equipo sabe que no tiene red (Wi-Fi apagado, cable fuera).
 * `true` no garantiza que lendexgp.com responda: para eso está la tecla V.
 */
export function useEnLinea(): boolean {
  return useSyncExternalStore(suscribirRed, () => navigator.onLine);
}

// ——— La tecla V ———

function esCampoDeTexto(objetivo: EventTarget | null): boolean {
  return (
    objetivo instanceof HTMLElement && (objetivo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(objetivo.tagName))
  );
}

function alPulsar(e: KeyboardEvent) {
  if (e.key !== 'v' && e.key !== 'V') return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || esCampoDeTexto(e.target)) return;
  e.preventDefault();
  cambiarModoDemo();
}

let instalados = 0;

/**
 * Escucha V en esta ventana mientras `activa` (la demo en pantalla). Varias
 * instancias en la misma ventana comparten un solo oyente. Con el foco dentro
 * de la calculadora (un iframe de otro origen) esta ventana no oye ninguna
 * tecla: ver «El foco» en DemoLendex.tsx.
 */
export function useTeclaV(activa: boolean) {
  useEffect(() => {
    if (!activa) return;
    if (instalados++ === 0) window.addEventListener('keydown', alPulsar);
    return () => {
      if (--instalados === 0) window.removeEventListener('keydown', alPulsar);
    };
  }, [activa]);
}
