/**
 * Modo revisión (?revision=1) y API de automatización (window.__motor).
 *
 * En revisión se apagan todas las animaciones (CSS, Web Animations, GSAP y
 * motion) para que cada captura muestre el estado final del paso.
 */
import { configuracion } from '../configuracion';
import { diapositivas } from '../diapositivas/indice';
import { estadisticasCanal } from './canal';
import { obtenerCronometro, transcurrido, type EstadoCronometro } from './cronometro';
import { obtenerProblemas } from './diagnostico';
import { esPresentador, esRevision } from './entorno';
import { alternarPruebaSala, avanzar, ir, obtenerEstado, retroceder, total } from './estado';
import { cuadrosOGL } from './LienzoOGL';
import { pendientesEnCapa } from './medios';
import { momentosDe } from './momentos';
import { aplicarModoRevision } from './revision';

export interface EstadoMotor {
  /** Número de diapositiva, contando desde 1 (como en la URL y en la cuadrícula). */
  n: number;
  /** Índice desde 0. */
  indice: number;
  paso: number;
  pasos: number;
  id: string;
  titulo: string;
  orador: string;
  total: number;
  negro: boolean;
  /** La sala enseña la prueba de sala (tecla T). */
  prueba: boolean;
}

export interface ApiMotor {
  /** Título de la presentación (configuracion.ts). */
  titulo: string;
  total: number;
  rol: 'sala' | 'presentador';
  revision: boolean;
  /** Ir a la diapositiva n (desde 1) en el paso indicado. */
  ir: (n: number, paso?: number) => void;
  avanzar: () => void;
  retroceder: () => void;
  estado: () => EstadoMotor;
  /** Resuelve cuando la diapositiva actual terminó de cargar (fuentes, imágenes, video, WebGL). */
  esperar: (limiteMs?: number) => Promise<boolean>;
  diapositivas: () => Array<{ n: number; id: string; titulo: string; pasos: number; orador: string; duracion: number }>;
  canales: () => typeof estadisticasCanal;
  /** Cronómetro compartido (objetivo en segundos) y milisegundos transcurridos. */
  cronometro: () => EstadoCronometro & { transcurrido: number };
  cuadrosOGL: () => Record<string, number>;
  problemas: () => string[];
  /** Abre (true), cierra (false) o alterna la prueba de sala. */
  pruebaSala: (abrir?: boolean) => void;
  /** Momentos animados anotados de una diapositiva (A-54), por su id. */
  momentos: (id: string) => string[];
}

declare global {
  interface Window {
    __motor?: ApiMotor;
  }
}

const pausa = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const cuadro = () => new Promise((r) => requestAnimationFrame(() => r(null)));

async function esperar(limiteMs = 15000): Promise<boolean> {
  const inicio = performance.now();
  try {
    await Promise.race([document.fonts?.ready, pausa(limiteMs)]);
  } catch {
    /* sin API de fuentes */
  }
  await cuadro();
  let listo = false;
  while (performance.now() - inicio < limiteMs) {
    const capa = document.querySelector<HTMLElement>('.sala .capa[data-rol="actual"], .vista-viva .capa[data-rol="actual"]');
    const enTransicion = document.querySelector('.capa[data-rol="saliente"]');
    if (capa && !enTransicion) {
      if (pendientesEnCapa(capa) === 0) {
        await Promise.all([...capa.querySelectorAll('img')].map((img) => img.decode().catch(() => undefined)));
        listo = true;
        break;
      }
    }
    await pausa(50);
  }
  await cuadro();
  await cuadro();
  return listo;
}

export function prepararAutomatizacion() {
  aplicarModoRevision();

  window.__motor = {
    titulo: configuracion.titulo,
    total,
    rol: esPresentador ? 'presentador' : 'sala',
    revision: esRevision,
    ir: (n, paso = 0) => ir(n - 1, paso),
    avanzar,
    retroceder,
    estado: () => {
      const e = obtenerEstado();
      const d = diapositivas[e.indice];
      return {
        n: e.indice + 1,
        indice: e.indice,
        paso: e.paso,
        pasos: d.pasos,
        id: d.id,
        titulo: d.titulo,
        orador: d.orador,
        total,
        negro: e.negro,
        prueba: e.prueba,
      };
    },
    esperar,
    diapositivas: () =>
      diapositivas.map((d, i) => ({
        n: i + 1,
        id: d.id,
        titulo: d.titulo,
        pasos: d.pasos,
        orador: d.orador,
        duracion: d.duracion,
      })),
    canales: () => ({ ...estadisticasCanal }),
    cronometro: () => {
      const c = obtenerCronometro();
      return { ...c, transcurrido: transcurrido(c) };
    },
    cuadrosOGL: () => ({ ...cuadrosOGL }),
    problemas: () => [...obtenerProblemas()],
    pruebaSala: (abrir) => alternarPruebaSala(abrir),
    momentos: (id) => momentosDe(id),
  };
}
