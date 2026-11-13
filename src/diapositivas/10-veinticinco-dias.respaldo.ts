/**
 * La tecla V de la 10: pone y quita el video de respaldo del agujero negro
 * (M-04; docs/GUION.md, 10 «Si falla», punto 3, y «Lo que necesita el motor»,
 * punto 2: «Pone y quita el video de respaldo de la diapositiva actual»).
 *
 * Funciona desde la sala y desde el presentador. El presentador no monta la
 * 10 (es `pesada`: enseña su póster, C-02), así que la tecla se oye con un
 * solo oyente de la ventana, instalado al cargar el módulo, que solo actúa
 * cuando la diapositiva en pantalla es la 10 (window.__motor.estado().id).
 * El estado viaja entre las dos ventanas por las mismas dos vías que el motor
 * (motor/canal.ts) y que la demo de Lendex (marca/lendex/modoDemo.ts):
 * BroadcastChannel y, de respaldo, el evento `storage` de localStorage, con el
 * prefijo de la carpeta (motor/entorno.ts, PREFIJO). Gana el cambio más reciente.
 *
 * Es una copia mínima de modoDemo.ts con otra clave: aquella guarda el modo de
 * la 18 y no se puede reutilizar sin que la V de la 10 deje la 18 en video
 * (ver el informe: se pide una versión con clave en la pieza).
 *
 * Sin el video (M-04 no está) no se instala nada: la V no hace nada.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { almacen, esRevision, PREFIJO } from '../motor/entorno';

interface Registro {
  abierto: boolean;
  /** Cuándo se cambió (Date.now()): gana el más reciente y sirve para volver a montar el video. */
  t: number;
}

const CLAVE = 'agujero-respaldo';
/** Un estado guardado de un ensayo de hace más de una hora no cuenta (como modoDemo.ts y el cronómetro). */
const CADUCA_MS = 60 * 60 * 1000;

function valido(r: unknown): r is Registro {
  const x = r as Registro | null;
  return !!x && typeof x.abierto === 'boolean' && typeof x.t === 'number';
}

function inicial(): Registro {
  const guardado = almacen.leer<Registro>(CLAVE);
  return valido(guardado) && Date.now() - guardado.t < CADUCA_MS ? guardado : { abierto: false, t: 0 };
}

let actual: Registro = { abierto: false, t: 0 };
const oyentes = new Set<() => void>();
let canal: BroadcastChannel | null = null;
let instalado = false;

function aplicar(r: Registro) {
  if (r.t <= actual.t) return;
  actual = r;
  oyentes.forEach((avisar) => avisar());
}

function cambiar(abierto: boolean) {
  if (actual.abierto === abierto) return;
  const nuevo: Registro = { abierto, t: Math.max(Date.now(), actual.t + 1) };
  aplicar(nuevo);
  almacen.escribir(CLAVE, nuevo);
  try {
    canal?.postMessage(nuevo);
  } catch {
    /* canal cerrado */
  }
}

function esCampoDeTexto(objetivo: EventTarget | null): boolean {
  return objetivo instanceof HTMLElement && (objetivo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(objetivo.tagName));
}

/**
 * Instala la tecla V para la diapositiva `id` en esta ventana (sala o
 * presentador). Solo si `hay` (el video de respaldo está) y fuera del modo revisión.
 */
export function instalarTeclaRespaldo(id: string, hay: boolean) {
  if (instalado || !hay || esRevision || typeof window === 'undefined') return;
  instalado = true;
  actual = inicial();
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
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'v' && e.key !== 'V') return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat || esCampoDeTexto(e.target)) return;
    if (window.__motor?.estado().id !== id) return;
    e.preventDefault();
    cambiar(!actual.abierto);
  });
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => oyentes.delete(avisar);
}

/**
 * Lo que pinta la 10 en la sala: si el video de respaldo está abierto y una
 * marca para volver a montarlo (así empieza desde el principio cada vez).
 * `enSala`: la 10 está en pantalla en esta ventana. Al dejar de estarlo, el
 * video se cierra (en las dos ventanas), para que no siga puesto al volver.
 */
export function useRespaldoAgujero(hay: boolean, enSala: boolean): { abierto: boolean; vez: number } {
  const r = useSyncExternalStore(suscribir, () => actual);
  useEffect(() => {
    if (hay && !enSala && actual.abierto) cambiar(false);
  }, [hay, enSala]);
  return { abierto: hay && enSala && r.abierto, vez: r.t };
}
