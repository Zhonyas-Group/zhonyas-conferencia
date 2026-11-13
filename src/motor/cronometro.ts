/**
 * Cronómetro de la charla, compartido entre ventanas y guardado en
 * localStorage (si se recarga el presentador, el tiempo sigue contando).
 */
import { useSyncExternalStore } from 'react';
import { configuracion } from '../configuracion';
import { almacen, aperturaVentana, idVentana } from './entorno';
import { enviar, escuchar, gana, type Versionado } from './canal';

export interface EstadoCronometro extends Versionado {
  corriendo: boolean;
  /** Date.now() cuando se puso en marcha por última vez (si corre). */
  inicio: number | null;
  /** Milisegundos acumulados antes de la última puesta en marcha. */
  acumulado: number;
  /** Duración objetivo, en segundos. */
  objetivo: number;
  /**
   * Cambia cada vez que el cronómetro vuelve a cero. El tiempo en cada
   * diapositiva se mide contra el cronómetro (ver ritmo.ts) y la época dice si
   * la marca guardada al entrar en la diapositiva sigue valiendo.
   */
  epoca: string;
  /** Date.now() del último cambio (arrancar, pausar, reiniciar, objetivo). */
  actualizado: number;
}

type MensajeCronometro = { tipo: 'cronometro'; cronometro: EstadoCronometro } | { tipo: 'hola' };

/** Un cronómetro en marcha con más de esto es de un ensayo olvidado. */
const CADUCA_EN_MARCHA = 3 * 60 * 60 * 1000;
/** Un cronómetro parado desde hace más de esto también: ninguna pausa de una charla dura tanto. */
const CADUCA_PARADO = 60 * 60 * 1000;

function nuevaEpoca(): string {
  return `${idVentana}-${Date.now().toString(36)}`;
}

export function transcurrido(c: EstadoCronometro, ahora = Date.now()): number {
  return c.acumulado + (c.corriendo && c.inicio !== null ? Math.max(0, ahora - c.inicio) : 0);
}

/** ¿Es un cronómetro guardado de un ensayo anterior (no de la charla en curso)? */
function caducado(c: EstadoCronometro, ahora: number): boolean {
  if (c.corriendo) return transcurrido(c, ahora) > CADUCA_EN_MARCHA;
  if (c.acumulado <= 0) return false;
  // Sin fecha (guardado por una versión anterior del motor): se da por viejo.
  return !(c.actualizado > 0) || ahora - c.actualizado > CADUCA_PARADO;
}

function inicial(): EstadoCronometro {
  const ahora = Date.now();
  const base: EstadoCronometro = {
    corriendo: false,
    inicio: null,
    acumulado: 0,
    // Redondeado como en fijarObjetivo: 16 min 35 s da 994,999… s en coma flotante.
    objetivo: Math.round(configuracion.objetivoMinutos * 60),
    epoca: nuevaEpoca(),
    actualizado: ahora,
    version: 0,
    apertura: aperturaVentana,
    origen: idVentana,
  };
  const guardado = almacen.leer<EstadoCronometro>('cronometro');
  if (!guardado || typeof guardado.acumulado !== 'number') return base;
  const objetivo = guardado.objetivo > 0 ? guardado.objetivo : base.objetivo;
  // Un cronómetro olvidado de un ensayo (ayer, o pausado hace horas) no sirve:
  // vuelve a cero y arranca solo con el primer avance. Se conserva el objetivo.
  if (caducado(guardado, ahora)) return { ...base, objetivo };
  return {
    ...base,
    corriendo: !!guardado.corriendo,
    inicio: guardado.inicio ?? null,
    acumulado: guardado.acumulado,
    objetivo,
    epoca: guardado.epoca || base.epoca,
    actualizado: guardado.actualizado || ahora,
  };
}

let cronometro = inicial();
const oyentes = new Set<() => void>();

function avisar() {
  for (const oyente of oyentes) oyente();
}

function cambiar(parcial: Partial<EstadoCronometro>) {
  cronometro = {
    ...cronometro,
    ...parcial,
    actualizado: Date.now(),
    version: cronometro.version + 1,
    apertura: aperturaVentana,
    origen: idVentana,
  };
  almacen.escribir('cronometro', cronometro);
  enviar({ tipo: 'cronometro', cronometro } satisfies MensajeCronometro);
  avisar();
}

escuchar((mensaje) => {
  const m = mensaje as MensajeCronometro;
  if (m?.tipo === 'hola') {
    enviar({ tipo: 'cronometro', cronometro } satisfies MensajeCronometro);
    return;
  }
  if (m?.tipo !== 'cronometro' || !m.cronometro) return;
  if (!gana(m.cronometro, cronometro)) return;
  cronometro = m.cronometro;
  avisar();
});

export function obtenerCronometro(): EstadoCronometro {
  return cronometro;
}

export function useCronometro(): EstadoCronometro {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => cronometro,
  );
}

export function iniciarCronometro() {
  if (cronometro.corriendo) return;
  cambiar({ corriendo: true, inicio: Date.now() });
}

export function pausarCronometro() {
  if (!cronometro.corriendo) return;
  cambiar({ corriendo: false, inicio: null, acumulado: transcurrido(cronometro) });
}

export function reiniciarCronometro() {
  cambiar({ corriendo: false, inicio: null, acumulado: 0, epoca: nuevaEpoca() });
}

/** Minutos que se aceptan como objetivo. */
export const OBJETIVO_MINIMO = 1;
export const OBJETIVO_MAXIMO = 180;

/** Fija el objetivo en minutos (admite decimales: 18,5 = 18:30). Se guarda redondeado al segundo. */
export function fijarObjetivo(minutos: number) {
  if (!Number.isFinite(minutos) || minutos < OBJETIVO_MINIMO || minutos > OBJETIVO_MAXIMO) return;
  const segundos = Math.round(minutos * 60);
  if (segundos === cronometro.objetivo) return;
  cambiar({ objetivo: segundos });
}

/** La charla empieza al primer avance: si el cronómetro nunca arrancó, arranca solo. */
export function iniciarCronometroSiHaceFalta() {
  if (!cronometro.corriendo && cronometro.acumulado === 0) iniciarCronometro();
}
