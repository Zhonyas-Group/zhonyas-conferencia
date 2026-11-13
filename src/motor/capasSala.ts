/**
 * Lo que la sala tiene abierto encima de la diapositiva (cuadrícula o ayuda).
 *
 * La interfaz de cada ventana es suya (interfaz.ts), pero lo que tapa la
 * diapositiva en el proyector lo ve el público, y la charla se maneja desde
 * cualquiera de las dos ventanas. Por eso:
 *   - la sala cierra su cuadrícula y su ayuda en cuanto la charla se mueve
 *     desde otra ventana (el presentador avanzó: el público tiene que ver la
 *     diapositiva, no la rejilla);
 *   - la sala cuenta lo que tiene abierto, y el presentador lo muestra sobre
 *     «En pantalla» y puede cerrarlo (Esc o el botón del aviso) sin ir a la
 *     ventana del proyector.
 */
import { useSyncExternalStore } from 'react';
import { enviar, escuchar } from './canal';
import { ventanaAbierta } from './conexion';
import { idVentana } from './entorno';
import { obtenerEstado, suscribirEstado } from './estado';
import { cambiarInterfaz, obtenerInterfaz, suscribirInterfaz } from './interfaz';

export interface CapasSala {
  cuadricula: boolean;
  ayuda: boolean;
}

type MensajeCapas =
  | ({ tipo: 'capas-sala' } & CapasSala)
  | { tipo: 'cerrar-capas-sala' }
  | { tipo: 'hola' };

const NINGUNA: CapasSala = { cuadricula: false, ayuda: false };

function cerrarCapasPropias() {
  const ui = obtenerInterfaz();
  if (ui.cuadricula || ui.ayuda || ui.numero) cambiarInterfaz({ cuadricula: false, ayuda: false, numero: '' });
}

// ——— En la sala ———

/** Lo instala la sala una vez. Devuelve la función para desinstalarlo. */
export function instalarCapasSala(): () => void {
  let enviadas: CapasSala = NINGUNA;
  const actuales = (): CapasSala => {
    const ui = obtenerInterfaz();
    return { cuadricula: ui.cuadricula, ayuda: ui.ayuda };
  };
  const contar = (forzar = false) => {
    const c = actuales();
    if (!forzar && c.cuadricula === enviadas.cuadricula && c.ayuda === enviadas.ayuda) return;
    enviadas = c;
    enviar({ tipo: 'capas-sala', ...c } satisfies MensajeCapas);
  };

  const quitarInterfaz = suscribirInterfaz(() => contar());

  // La charla se movió desde otra ventana: fuera lo que tape la diapositiva.
  let previo = obtenerEstado();
  const quitarEstado = suscribirEstado(() => {
    const e = obtenerEstado();
    const movida = e.indice !== previo.indice || e.paso !== previo.paso || e.negro !== previo.negro;
    previo = e;
    if (movida && e.origen !== idVentana) cerrarCapasPropias();
  });

  const quitarCanal = escuchar((mensaje) => {
    const m = mensaje as MensajeCapas;
    if (m?.tipo === 'cerrar-capas-sala') cerrarCapasPropias();
    // Un presentador recién abierto pregunta: se le cuenta lo que haya abierto.
    else if (m?.tipo === 'hola') contar(true);
  });

  return () => {
    quitarInterfaz();
    quitarEstado();
    quitarCanal();
  };
}

// ——— En el presentador ———

/** Lo último que contó cada sala abierta (puede haber más de una). */
const porSala = new Map<string, CapasSala>();
let resumen: CapasSala = NINGUNA;
const oyentes = new Set<() => void>();

function recalcular() {
  let cuadricula = false;
  let ayuda = false;
  for (const [origen, c] of porSala) {
    if (!ventanaAbierta(origen)) {
      porSala.delete(origen);
      continue;
    }
    cuadricula ||= c.cuadricula;
    ayuda ||= c.ayuda;
  }
  if (cuadricula === resumen.cuadricula && ayuda === resumen.ayuda) return;
  resumen = { cuadricula, ayuda };
  for (const oyente of oyentes) oyente();
}

escuchar((mensaje, sobre) => {
  const m = mensaje as MensajeCapas | { tipo: 'adios' };
  if (sobre.rol !== 'sala') return;
  if (m?.tipo === 'capas-sala') porSala.set(sobre.origen, { cuadricula: !!m.cuadricula, ayuda: !!m.ayuda });
  else if (m?.tipo === 'adios') porSala.delete(sobre.origen);
  else return;
  recalcular();
});

let vigilancia = 0;
function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  // Una sala que se cerró sin despedirse deja de contar al dejar de latir.
  if (oyentes.size === 1) vigilancia = window.setInterval(recalcular, 1000);
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) window.clearInterval(vigilancia);
  };
}

/** En el presentador: ¿qué tiene abierto la sala encima de la diapositiva? */
export function useCapasSala(): CapasSala {
  return useSyncExternalStore(suscribir, () => resumen);
}

export function hayCapasEnSala(): boolean {
  return resumen.cuadricula || resumen.ayuda;
}

/** Pide a la sala (o salas) que cierren la cuadrícula y la ayuda. */
export function cerrarCapasSala() {
  enviar({ tipo: 'cerrar-capas-sala' } satisfies MensajeCapas);
}
