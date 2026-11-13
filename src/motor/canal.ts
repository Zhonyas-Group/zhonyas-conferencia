/**
 * Canal entre la ventana de la sala y la del presentador.
 *
 * Cada mensaje sale a la vez por dos vías y el receptor descarta los repetidos:
 * 1. BroadcastChannel (lo normal, con servidor o sin él),
 * 2. el evento «storage» de localStorage (respaldo si BroadcastChannel no
 *    existe o no llega entre documentos file://).
 *
 * No hay enlace directo entre ventanas (window.opener) a propósito: el
 * presentador se abre con «noopener» para que Chrome le dé su propio proceso.
 * Si compartiera el de la sala, cada repintado del presentador le quitaría
 * cuadros a la proyección (medido: de 3 a 8 cuadros largos en 12 avances).
 */
import { PREFIJO, esPresentador, idVentana } from './entorno';

export type RolVentana = 'sala' | 'presentador';

export interface Sobre<M = unknown> {
  zhonyas: 1;
  id: string;
  origen: string;
  rol: RolVentana;
  mensaje: M;
}

type Via = 'broadcast' | 'storage';
type Oyente = (mensaje: unknown, sobre: Sobre) => void;

const CLAVE_STORAGE = `${PREFIJO}:canal`;
const oyentes = new Set<Oyente>();
const vistos: string[] = [];
const vistosSet = new Set<string>();
let secuencia = 0;
const rolPropio: RolVentana = esPresentador ? 'presentador' : 'sala';

/**
 * Diagnóstico: mensajes que llegaron por cada vía (contando repetidos, para
 * saber qué vías funcionan en este navegador), cuántos fueron útiles y cuántos se enviaron.
 */
export const estadisticasCanal: Record<Via, number> & { utiles: number; enviados: number } = {
  broadcast: 0,
  storage: 0,
  utiles: 0,
  enviados: 0,
};

let bc: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel === 'function') {
    bc = new BroadcastChannel(PREFIJO);
    bc.onmessage = (evento) => recibir(evento.data, 'broadcast');
  }
} catch {
  bc = null;
}

window.addEventListener('storage', (evento) => {
  if (evento.key !== CLAVE_STORAGE || !evento.newValue) return;
  try {
    recibir(JSON.parse(evento.newValue), 'storage');
  } catch {
    /* mensaje corrupto: se ignora */
  }
});

function esSobre(dato: unknown): dato is Sobre {
  return typeof dato === 'object' && dato !== null && (dato as Sobre).zhonyas === 1;
}

function recibir(dato: unknown, via: Via) {
  if (!esSobre(dato) || dato.origen === idVentana) return;
  estadisticasCanal[via] += 1;
  if (vistosSet.has(dato.id)) return;
  vistosSet.add(dato.id);
  vistos.push(dato.id);
  if (vistos.length > 400) vistosSet.delete(vistos.shift()!);
  estadisticasCanal.utiles += 1;
  for (const oyente of oyentes) oyente(dato.mensaje, dato);
}

export function enviar(mensaje: unknown) {
  const sobre: Sobre = {
    zhonyas: 1,
    id: `${idVentana}-${++secuencia}`,
    origen: idVentana,
    rol: rolPropio,
    mensaje,
  };
  estadisticasCanal.enviados += 1;
  try {
    bc?.postMessage(sobre);
  } catch {
    /* canal cerrado */
  }
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sobre));
  } catch {
    /* localStorage bloqueado: queda BroadcastChannel */
  }
}

export function escuchar(oyente: Oyente): () => void {
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

/** Lo que llevan los estados que se sincronizan (navegación y cronómetro). */
export interface Versionado {
  /** Sube en cada cambio hecho a mano; al adoptar un estado ajeno se copia la suya. */
  version: number;
  /** Momento en que se abrió la ventana que hizo el cambio (ver `aperturaVentana`). */
  apertura: number;
  /** Ventana que hizo el cambio. */
  origen: string;
}

/**
 * Orden total entre dos estados: ¿`remoto` debe reemplazar a `local`?
 *
 * 1. Gana la versión mayor (el cambio más reciente).
 * 2. A igualdad, gana el de la ventana que se abrió antes: una ventana recién
 *    abierta (versión 0) adopta lo que ya había y nunca al revés. Sin esto el
 *    empate se decidía por el id al azar y, la mitad de las veces, el
 *    presentador recién abierto se quedaba en otra diapositiva.
 * 3. A igualdad de todo, el id de ventana (solo para que sea determinista).
 *
 * Como es un orden total y todas las ventanas aplican la misma regla, siempre
 * convergen al mismo estado.
 */
export function gana(remoto: Versionado, local: Versionado): boolean {
  if (remoto.version !== local.version) return remoto.version > local.version;
  const ra = remoto.apertura ?? Number.MAX_SAFE_INTEGER;
  const la = local.apertura ?? Number.MAX_SAFE_INTEGER;
  if (ra !== la) return ra < la;
  return remoto.origen > local.origen;
}
