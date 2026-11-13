/**
 * Z-10 · La lente del agujero negro y su interruptor.
 *
 * 1. `construirMapaLente` es zhonyas-web/lib/black-hole-lens.ts copiado tal
 *    cual (solo cambian los nombres): un <canvas> de 256 × 256 con el mapa de
 *    desplazamiento de un feDisplacementMap (rojo = x, verde = y, neutro 0,5).
 *    Cerca del horizonte la imagen se toma de más cerca del centro (empuje
 *    radial −0,5) con un arrastre tangencial de 0,24; cae con el cuadrado de la
 *    distancia y se anula a 3 radios (02 §5.7).
 *
 * 2. El interruptor (síntesis §9.2.6): la lente es lo caro del agujero negro
 *    (03 M12: «13 cuadros en 1,5 s» en esta laptop con la web). Va encendida en
 *    el primer recorrido completo, que se mide contando solo los
 *    requestAnimationFrame (C-13), y se apaga sola en esa máquina si ese
 *    recorrido da menos de 50 fps. La decisión se guarda en localStorage (la
 *    carpeta de la presentación, ver PREFIJO en motor/entorno.ts): se ensaya
 *    una vez en la laptop del día y la charla ya sale con la decisión tomada.
 *    El laboratorio guarda la suya aparte, para no decidir por la charla.
 *
 * Medido en este PC el 12 y 13-nov-2026 (ThinkPad, i5-1145G7, GPU Intel Iris
 * Xe, enchufado; Chrome sin pantalla pero con la GPU real (ANGLE D3D11),
 * 1920 × 1080, compilado y desde file://; solo requestAnimationFrame; otros
 * agentes compilaban a la vez, de ahí los rangos), con el precalentado de agujero.ts:
 *   - primer recorrido con lente (el que decide), en frío: 31–32 fps (sin
 *     precalentado, 23–27); con el presentador abierto, 36,0 fps (55 cuadros,
 *     el peor de 50 ms); con la máquina cargada, hasta 22 → la lente se apaga
 *     en esta máquina;
 *   - con lente, los recorridos siguientes: abrir 35–43 fps, cerrar 29–39 fps;
 *   - sin lente: abrir 57–60 fps (87–92 cuadros en 1,5 s), cerrar 51–58 fps; con
 *     el presentador abierto y la máquina tranquila, 60,0 (peor cuadro 17 ms) y 57,9;
 *   - sin vsync (lo que cuesta cada cuadro): con lente ≈ 58 fps, sin lente ≈ 176 fps.
 * La web en esta laptop: «13 cuadros en 1,5 s» con lente (03 M12, otro instrumento).
 */
import { fijarProblema } from '../../motor/diagnostico';
import { almacen, cuandoLibre } from '../../motor/entorno';

// ——— 1. El mapa (lib/black-hole-lens.ts, tal cual) ———

// black-hole-lens.ts:1-4
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Tamaño del mapa respecto al agujero: abarca LENS_EXTENT radios desde el centro (black-hole-lens.ts:7). */
export const LENS_EXTENT = 3;

/** black-hole-lens.ts:17-43 (buildLensMap), sin cambios. */
export function construirMapaLente(size = 256): string {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(size, size);
  const centre = size / 2,
    horizon = size / (2 * LENS_EXTENT);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - centre,
        dy = y + 0.5 - centre;
      const distance = Math.hypot(dx, dy) || 1;
      const ux = dx / distance,
        uy = dy / distance;
      const pull = (horizon / Math.max(distance, horizon)) ** 2;
      const fade = 1 - smoothstep(2 * horizon, LENS_EXTENT * horizon, distance);
      const radial = -0.5 * pull * fade;
      const swirl = 0.24 * pull * fade;
      const vx = radial * ux - swirl * uy,
        vy = radial * uy + swirl * ux;
      const index = (y * size + x) * 4;
      image.data[index] = Math.round(Math.min(255, Math.max(0, 127.5 + 255 * vx)));
      image.data[index + 1] = Math.round(Math.min(255, Math.max(0, 127.5 + 255 * vy)));
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

let mapa: string | null = null;

/** El mapa, hecho una sola vez (la web lo hace una vez por página: contact-section.tsx:87). */
export function mapaLente(): string {
  if (mapa === null) mapa = construirMapaLente();
  return mapa;
}

// Se prepara con el navegador libre, para que el primer cuadro del agujero no lo pague (≈ 65 000 píxeles y un PNG).
cuandoLibre(() => void mapaLente(), 3000);

// ——— 2. El interruptor ———

/** Umbral de la síntesis §9.2.6: «se apaga sola si el primer recorrido mide menos de 50 fps». */
export const FPS_MINIMOS = 50;
/** 21.3 → «21,3» (coma decimal). */
const cifra = (n: number, decimales = 1) => n.toFixed(decimales).replace('.', ',');

/** Un recorrido más corto (uno cortado a medias que dura lo proporcional) no decide nada. */
const MS_MINIMOS_PARA_MEDIR = 600;

/**
 * - `auto`: encendida hasta que un recorrido completo con lente mide < 50 fps; entonces se apaga en esta máquina.
 * - `encendida` / `apagada`: a mano, sin medir (para ensayar o para el día, si se prefiere decidir).
 */
export type ModoLente = 'auto' | 'encendida' | 'apagada';

export interface Medida {
  /** Cuadros por segundo del recorrido, contando solo requestAnimationFrame. */
  fps: number;
  /** Cuadros pintados (llamadas a requestAnimationFrame) durante el recorrido. */
  cuadros: number;
  /** Duración del recorrido en ms (del primer al último cuadro). */
  ms: number;
  /** El intervalo más largo entre dos cuadros, en ms. */
  peor: number;
  conLente: boolean;
  sentido: 'abrir' | 'cerrar';
  fecha: string;
}

interface Registro {
  modo: ModoLente;
  /** El recorrido que decidió en modo `auto` (con lente). */
  decision?: Medida;
}

const esLaboratorio = document.documentElement.classList.contains('modo-laboratorio');
const CLAVE = esLaboratorio ? 'agujero-negro:lente:laboratorio' : 'agujero-negro:lente';

let registro: Registro = almacen.leer<Registro>(CLAVE) ?? { modo: 'auto' };
/** Todos los recorridos medidos en esta ventana (para Playwright y la consola). */
const mediciones: Medida[] = [];

function guardar() {
  almacen.escribir(CLAVE, registro);
}

function avisar() {
  const d = registro.decision;
  if (registro.modo === 'auto' && d && d.fps < FPS_MINIMOS) {
    fijarProblema(
      'agujero-negro:lente',
      `Agujero negro: el primer recorrido con lente midió ${cifra(d.fps)} fps (< ${FPS_MINIMOS}); la lente queda apagada en esta máquina. Para volver a medir: __agujero.lente('auto').`,
    );
  } else fijarProblema('agujero-negro:lente', null);
}
avisar();

/**
 * La web solo pone la lente con un puntero preciso y fuera de Safari, que no la
 * pinta bien (contact-section.tsx:84-85). Se respeta tal cual.
 */
function navegadorAdmiteLente(): boolean {
  const safari = /^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent); // contact-section.tsx:84
  return !safari && window.matchMedia('(pointer: fine)').matches; // contact-section.tsx:85
}

/** ¿Lleva lente el recorrido que empieza ahora? */
export function lenteEncendida(): boolean {
  if (!navegadorAdmiteLente()) return false;
  if (registro.modo === 'apagada') return false;
  if (registro.modo === 'encendida') return true;
  // auto: encendida mientras no haya un recorrido que diga lo contrario.
  return !(registro.decision && registro.decision.fps < FPS_MINIMOS);
}

/** ¿Hay que medir este recorrido para decidir? Solo en `auto` y si todavía no se decidió. */
export function hayQueDecidir(): boolean {
  return registro.modo === 'auto' && !registro.decision;
}

/** El laboratorio con el reloj congelado da 60 fps «virtuales»: esos no cuentan. */
function relojVirtual(): boolean {
  const lab = (window as { __lab?: { estado: () => { congelado: boolean } } }).__lab;
  return !!lab && lab.estado().congelado;
}

/** Lo llama el agujero al terminar un recorrido completo (no uno cortado a medias). */
export function anotarRecorrido(medida: Omit<Medida, 'fecha'>) {
  if (relojVirtual() || medida.ms < MS_MINIMOS_PARA_MEDIR || medida.cuadros < 2) return;
  const completa: Medida = { ...medida, fecha: new Date().toISOString() };
  mediciones.push(completa);
  console.info(
    `[agujero] ${completa.sentido}: ${cifra(completa.fps)} fps (${completa.cuadros} cuadros en ${cifra(completa.ms, 0)} ms, peor ${cifra(completa.peor)} ms), ${completa.conLente ? 'con' : 'sin'} lente`,
  );
  if (hayQueDecidir() && completa.conLente) {
    registro = { ...registro, decision: completa };
    guardar();
    console.info(
      completa.fps < FPS_MINIMOS
        ? `[agujero] Primer recorrido por debajo de ${FPS_MINIMOS} fps: la lente se apaga en esta máquina.`
        : `[agujero] Primer recorrido a ${FPS_MINIMOS} fps o más: la lente se queda.`,
    );
    avisar();
  }
}

/** Cambia el modo. `auto` borra la decisión: el próximo recorrido completo vuelve a medir. */
export function fijarLente(modo: ModoLente) {
  registro = modo === 'auto' ? { modo } : { ...registro, modo };
  guardar();
  avisar();
}

export function estadoLente() {
  return {
    modo: registro.modo,
    encendida: lenteEncendida(),
    navegadorAdmiteLente: navegadorAdmiteLente(),
    decision: registro.decision ?? null,
    mediciones: [...mediciones],
  };
}

declare global {
  interface Window {
    /** Interruptor de la lente del agujero negro (consola y Playwright). */
    __agujero?: {
      estado: typeof estadoLente;
      lente: typeof fijarLente;
    };
  }
}

window.__agujero = { estado: estadoLente, lente: fijarLente };
