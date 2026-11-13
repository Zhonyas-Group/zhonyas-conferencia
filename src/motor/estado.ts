/**
 * Estado de la navegación: en qué diapositiva y en qué paso estamos, si la
 * pantalla está en negro y en qué momento de la charla se entró en esta
 * diapositiva.
 *
 * Cada ventana tiene su copia. Los cambios locales suben la versión y se
 * difunden; una ventana adopta un estado ajeno según `gana()` (canal.ts):
 * versión mayor y, a igualdad, la ventana que ya estaba abierta. Así las dos
 * ventanas convergen siempre y una ventana recién abierta toma la posición de
 * la que ya estaba.
 */
import { useSyncExternalStore } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { almacen, aperturaVentana, idVentana } from './entorno';
import { enviar, escuchar, gana, type Versionado } from './canal';
import { iniciarCronometroSiHaceFalta, obtenerCronometro, transcurrido } from './cronometro';
import type { Direccion } from './tipos';

export interface EstadoNavegacion extends Versionado {
  /** Índice de la diapositiva, desde 0. */
  indice: number;
  /** Paso dentro de la diapositiva, de 0 a `pasos`. */
  paso: number;
  /** Pantalla de la sala en negro. */
  negro: boolean;
  /**
   * La sala enseña la diapositiva oculta de prueba de sala (tecla T): tamaños
   * de letra, colores, escalones de negro y bordes, para probar el proyector.
   * Va fuera del orden: no cuenta como diapositiva ni mueve el cronómetro.
   */
  prueba: boolean;
  /**
   * Modo «sala con luz» (tecla L; docs/GUION.md, «Lo que necesita el motor»,
   * 10; síntesis §4.1; A-36 y A-37): en un aula con luz el proyector sube el
   * negro y lava los grises, y --zh-texto-2 (fuentes, créditos, etiquetas) se
   * queda por debajo de 7:1. Con él, la raíz lleva [data-luz] y marca.css pasa
   * esos textos a --zh-texto. Viaja con la posición, como la prueba de sala, y
   * se recuerda en localStorage: se decide una vez en la sala con la prueba (T).
   */
  luz: boolean;
  /** Sentido del último movimiento. */
  direccion: Direccion;
  /**
   * Tiempo de la charla (ms del cronómetro) al entrar en la diapositiva actual.
   * «Esta diapositiva» = cronómetro ahora − esta marca: no cuenta la espera
   * antes de empezar ni las pausas.
   */
  cronoAlEntrar: number;
  /** Época del cronómetro en la que se tomó `cronoAlEntrar` (si se reinició, la marca ya no vale). */
  epocaCrono: string;
}

/** Dónde se recuerda el modo «sala con luz» (localStorage, con el prefijo de la carpeta). */
const CLAVE_LUZ = 'sala-con-luz';

type MensajeEstado = { tipo: 'estado'; estado: EstadoNavegacion } | { tipo: 'hola' };

export const total = diapositivas.length;

export function pasosDe(indice: number): number {
  return Math.max(0, Math.floor(diapositivas[indice]?.pasos ?? 0));
}

function acotar(indice: number, paso: number): { indice: number; paso: number } {
  const i = Math.min(Math.max(0, Math.floor(Number.isFinite(indice) ? indice : 0)), Math.max(0, total - 1));
  const p = Math.min(Math.max(0, Math.floor(Number.isFinite(paso) ? paso : 0)), pasosDe(i));
  return { indice: i, paso: p };
}

/** Lee «#/3/1» → diapositiva 3 (contando desde 1), paso 1. */
export function leerHash(hash = location.hash): { indice: number; paso: number } | null {
  const m = /^#\/(\d+)(?:\/(\d+))?/.exec(hash);
  if (!m) return null;
  return acotar(Number(m[1]) - 1, Number(m[2] ?? 0));
}

function escribirHash(e: EstadoNavegacion) {
  const hash = `#/${e.indice + 1}/${e.paso}`;
  if (location.hash === hash) return;
  try {
    history.replaceState(history.state, '', `${location.pathname}${location.search}${hash}`);
  } catch {
    /* file:// con políticas raras: no es grave */
  }
}

function marcaDelCronometro(): Pick<EstadoNavegacion, 'cronoAlEntrar' | 'epocaCrono'> {
  const c = obtenerCronometro();
  return { cronoAlEntrar: transcurrido(c), epocaCrono: c.epoca };
}

/**
 * Posición al abrir: la del # de la URL (recargar, o una pestaña recuperada
 * con Ctrl+Mayús+T) o, sin #, la primera diapositiva. A propósito NO se
 * recupera la última posición guardada: al abrir con doble clic el día de la
 * charla, la sala empezaba en la última diapositiva del ensayo. Si ya hay otra
 * ventana abierta (el presentador), esta adopta su posición al conectarse.
 */
function estadoInicial(): EstadoNavegacion {
  const pos = leerHash() ?? { indice: 0, paso: 0 };
  return {
    ...pos,
    negro: false,
    prueba: false,
    luz: almacen.leer<boolean>(CLAVE_LUZ) === true,
    direccion: 0,
    ...marcaDelCronometro(),
    version: 0,
    apertura: aperturaVentana,
    origen: idVentana,
  };
}

let estado: EstadoNavegacion = estadoInicial();
const oyentes = new Set<() => void>();

/** La raíz del documento lleva [data-luz] mientras el modo «sala con luz» está puesto (marca.css). */
function aplicarLuz() {
  try {
    document.documentElement.toggleAttribute('data-luz', estado.luz === true);
  } catch {
    /* sin documento (pruebas): nada que pintar */
  }
}
aplicarLuz();

function avisar() {
  for (const oyente of oyentes) oyente();
}

export function obtenerEstado(): EstadoNavegacion {
  return estado;
}

export function suscribirEstado(oyente: () => void): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function useNavegacion(): EstadoNavegacion {
  return useSyncExternalStore(suscribirEstado, obtenerEstado);
}

/** Cambio hecho en esta ventana: sube la versión y se difunde. */
function cambiar(parcial: Partial<EstadoNavegacion>) {
  const siguiente: EstadoNavegacion = {
    ...estado,
    ...parcial,
    version: estado.version + 1,
    apertura: aperturaVentana,
    origen: idVentana,
  };
  if (siguiente.indice !== estado.indice) Object.assign(siguiente, marcaDelCronometro());
  if (siguiente.luz !== estado.luz) almacen.escribir(CLAVE_LUZ, siguiente.luz);
  estado = siguiente;
  aplicarLuz();
  escribirHash(estado);
  enviar({ tipo: 'estado', estado } satisfies MensajeEstado);
  avisar();
}

function adoptar(remoto: EstadoNavegacion) {
  if (!gana(remoto, estado)) return;
  const pos = acotar(remoto.indice, remoto.paso);
  estado = { ...remoto, prueba: remoto.prueba ?? false, luz: remoto.luz ?? false, ...pos };
  aplicarLuz();
  escribirHash(estado);
  avisar();
}

escuchar((mensaje) => {
  const m = mensaje as MensajeEstado;
  if (m?.tipo === 'estado' && m.estado) adoptar(m.estado);
  else if (m?.tipo === 'hola') enviar({ tipo: 'estado', estado } satisfies MensajeEstado);
});

// Al abrir una ventana nueva, pide el estado a las que ya estén abiertas.
enviar({ tipo: 'hola' } satisfies MensajeEstado);

// Si alguien edita la URL a mano (#/5/0), se obedece.
window.addEventListener('hashchange', () => {
  const pos = leerHash();
  if (pos && (pos.indice !== estado.indice || pos.paso !== estado.paso)) ir(pos.indice, pos.paso);
});

escribirHash(estado);

// ——— Acciones ———

/**
 * Paso siguiente; si ya está todo mostrado, diapositiva siguiente. Con la
 * pantalla en negro solo la enciende (sin moverse).
 *
 * La charla empieza con el primer avance, y eso incluye el → que enciende una
 * sala que esperaba en negro a que presentaran al orador: desde ahí ya se
 * habla sobre la portada, así que el cronómetro arranca también entonces.
 */
export function avanzar() {
  if (estado.negro) {
    cambiar({ negro: false });
    // Encender una sala que enseña la prueba de sala no es empezar la charla.
    if (!estado.prueba) iniciarCronometroSiHaceFalta();
    return;
  }
  // Con la prueba de sala abierta, avanzar solo la cierra (sin moverse ni arrancar el cronómetro).
  if (estado.prueba) return cambiar({ prueba: false });
  if (estado.paso < pasosDe(estado.indice)) {
    cambiar({ paso: estado.paso + 1, direccion: 1 });
  } else if (estado.indice < total - 1) {
    cambiar({ indice: estado.indice + 1, paso: 0, direccion: 1 });
  } else {
    return;
  }
  iniciarCronometroSiHaceFalta();
}

/** Paso anterior; desde el paso 0, la diapositiva anterior ya completa. */
export function retroceder() {
  if (estado.negro) return cambiar({ negro: false });
  if (estado.prueba) return cambiar({ prueba: false });
  if (estado.paso > 0) {
    cambiar({ paso: estado.paso - 1, direccion: -1 });
  } else if (estado.indice > 0) {
    const anterior = estado.indice - 1;
    cambiar({ indice: anterior, paso: pasosDe(anterior), direccion: -1 });
  }
}

/** Salto directo (índice desde 0). */
export function ir(indice: number, paso = 0) {
  const pos = acotar(indice, paso);
  if (pos.indice === estado.indice && pos.paso === estado.paso && !estado.negro && !estado.prueba) return;
  const direccion: Direccion =
    pos.indice === estado.indice ? (pos.paso > estado.paso ? 1 : -1) : 0;
  cambiar({ ...pos, negro: false, prueba: false, direccion });
}

/**
 * Salto pedido por quien presenta (número + Intro, cuadrícula, Inicio o Fin).
 * Igual que `ir`, y si el salto es hacia delante cuenta como avance: si la
 * charla aún no había empezado, arranca el cronómetro. Un salto hacia atrás
 * (Inicio desde la posición del ensayo) no lo arranca. La URL editada a mano y
 * `window.__motor.ir` usan `ir` y tampoco lo arrancan.
 */
export function saltar(indice: number, paso = 0) {
  const pos = acotar(indice, paso);
  const haciaDelante = pos.indice > estado.indice || (pos.indice === estado.indice && pos.paso > estado.paso);
  ir(pos.indice, pos.paso);
  if (haciaDelante) iniciarCronometroSiHaceFalta();
}

export function irAlInicio() {
  saltar(0, 0);
}

export function irAlFinal() {
  saltar(total - 1, pasosDe(total - 1));
}

export function alternarNegro(forzar?: boolean) {
  cambiar({ negro: forzar ?? !estado.negro });
}

/** Abre o cierra la diapositiva oculta de prueba de sala (tecla T). */
export function alternarPruebaSala(forzar?: boolean) {
  const prueba = forzar ?? !estado.prueba;
  if (prueba === estado.prueba) return;
  cambiar({ prueba });
}

/** Pone o quita el modo «sala con luz» (tecla L), en las dos ventanas. */
export function alternarLuz(forzar?: boolean) {
  const luz = forzar ?? !estado.luz;
  if (luz === estado.luz) return;
  cambiar({ luz });
}
