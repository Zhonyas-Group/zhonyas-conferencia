/**
 * Teclado y punteros (clickers). Los punteros envían teclas normales:
 * AvPág/RePág o flechas para pasar, F5 / Mayús+F5 / Esc para empezar o salir,
 * y «b» o «.» para la pantalla en negro.
 */
import { esPresentador } from './entorno';
import {
  alternarNegro,
  avanzar,
  irAlFinal,
  irAlInicio,
  obtenerEstado,
  retroceder,
  saltar,
  total,
} from './estado';
import { cambiarInterfaz, obtenerInterfaz } from './interfaz';

export interface OpcionesTeclado {
  /** Solo la ventana de la sala abre al presentador con «P». */
  abrirPresentador?: () => void;
  /**
   * Esc que esta ventana no usa (no tiene ayuda, cuadrícula ni número abiertos).
   * El presentador lo usa para cerrar lo que la sala tenga abierto. Devuelve
   * true si hizo algo.
   */
  alEscapeLibre?: () => boolean;
}

/** Columnas visibles en la cuadrícula (la cuadrícula lo actualiza al medirse). */
export const cuadriculaInfo = { columnas: 4 };

let temporizadorNumero = 0;

function borrarNumeroLuego() {
  window.clearTimeout(temporizadorNumero);
  temporizadorNumero = window.setTimeout(() => cambiarInterfaz({ numero: '' }), 3000);
}

// ——— Pantalla completa y Esc ———

interface TecladoDelSistema {
  lock?: (teclas?: string[]) => Promise<void>;
  unlock?: () => void;
}

const tecladoDelSistema = (navigator as Navigator & { keyboard?: TecladoDelSistema }).keyboard;

/**
 * A pantalla completa, Chrome y Edge se quedan Esc para salir de ella y la
 * página ni se entera: con la cuadrícula, la ayuda o el «Ir a» abiertos, el
 * proyector salía de pantalla completa (el público veía el navegador) y la
 * capa seguía encima de la diapositiva. Con Keyboard Lock la página recibe
 * Esc: cierra lo que haya abierto y, si no hay nada, sale ella de pantalla
 * completa (el «terminar» del puntero sigue funcionando). Mantener Esc
 * pulsado sigue saliendo siempre: lo hace el navegador, y lo dice en su
 * propio aviso al entrar en pantalla completa.
 *
 * Solo funciona en pantalla completa pedida por la página (F, F5, el botón),
 * no con F11. Se pide antes de entrar, para que el aviso del navegador ya
 * salga con el texto de «mantener pulsado», y se suelta al salir.
 */
function quedarseConEsc() {
  try {
    void tecladoDelSistema?.lock?.(['Escape']).catch(() => {});
  } catch {
    /* navegador sin Keyboard Lock: Esc vuelve a ser del navegador */
  }
}

function soltarEsc() {
  try {
    tecladoDelSistema?.unlock?.();
  } catch {
    /* nada que soltar */
  }
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) soltarEsc();
});

export function salirDePantallaCompleta() {
  try {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  } catch {
    /* el navegador no lo permite aquí */
  }
}

export function alternarPantallaCompleta() {
  if (document.fullscreenElement) return salirDePantallaCompleta();
  try {
    quedarseConEsc();
    void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => soltarEsc());
  } catch {
    /* el navegador no lo permite aquí */
  }
}

// ——— Cuadrícula y ayuda ———

/**
 * En la sala, la cuadrícula y la ayuda las ve el público. Con la pantalla en
 * negro no se abren (se pintarían encima del negro y el presentador seguiría
 * diciendo «Pantalla en negro»): para elegir diapositiva a oscuras está la
 * cuadrícula del presentador, que es solo suya.
 */
function tapaElNegro(): boolean {
  return !esPresentador && obtenerEstado().negro;
}

export function abrirCuadricula() {
  if (tapaElNegro()) return;
  cambiarInterfaz({ cuadricula: true, seleccion: obtenerEstado().indice, ayuda: false });
}

export function cerrarCuadricula() {
  cambiarInterfaz({ cuadricula: false });
}

/**
 * Intro o clic sobre una miniatura. Elegir la diapositiva actual (la que viene
 * elegida al abrir) la deja como estaba, con los pasos que el público ya vio,
 * igual que cerrar con Esc; si la sala estaba en negro, la enciende. Las demás
 * empiezan en su paso 0.
 */
export function elegirEnCuadricula(indice: number) {
  cerrarCuadricula();
  const e = obtenerEstado();
  if (indice === e.indice) {
    if (e.negro) alternarNegro(false);
    return;
  }
  saltar(indice, 0);
}

function esCampoDeTexto(objetivo: EventTarget | null): objetivo is HTMLElement {
  if (!(objetivo instanceof HTMLElement)) return false;
  return objetivo.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(objetivo.tagName);
}

/**
 * Teclas que editan un campo de número: cifras, separador decimal, borrar,
 * Inicio/Fin, Intro y Esc. Las flechas NO están: muchos punteros pasan
 * diapositivas con → y ←, y un campo que se las quedara dejaría la charla
 * parada. Para corregir una cifra basta con borrarla o reescribir el número
 * (al entrar en el campo queda todo seleccionado).
 */
const TECLAS_DE_EDICION = new Set([
  'Backspace',
  'Delete',
  'Home',
  'End',
  'Tab',
  'Enter',
  'Escape',
  'Shift',
  'Control',
  'Alt',
  'Meta',
]);

function editaCampoNumerico(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return true; // copiar, pegar, seleccionar todo
  // El punto es la tecla de negro de muchos punteros: no se escribe, pone la
  // sala en negro (como «b»). Los decimales van con coma o con dos puntos
  // (18,5 o 18:30, como se muestran). El punto del teclado numérico sí se
  // escribe: un puntero no lo manda.
  if (e.key === '.') return e.code === 'NumpadDecimal';
  if (e.key.length === 1) return /[0-9,:]/.test(e.key);
  return TECLAS_DE_EDICION.has(e.key);
}

function teclaEnCuadricula(e: KeyboardEvent): boolean {
  const ui = obtenerInterfaz();
  const mover = (delta: number) =>
    cambiarInterfaz({ seleccion: Math.min(total - 1, Math.max(0, ui.seleccion + delta)) });
  switch (e.key) {
    case 'ArrowRight':
    case 'PageDown':
      mover(1);
      return true;
    case 'ArrowLeft':
    case 'PageUp':
      mover(-1);
      return true;
    case 'ArrowDown': {
      // A la misma columna de la fila de abajo. Si esa fila es más corta, a su
      // última miniatura; si no hay fila debajo, la selección se queda donde está.
      const columnas = cuadriculaInfo.columnas;
      const filaDeAbajo = Math.floor(ui.seleccion / columnas) + 1;
      if (filaDeAbajo * columnas <= total - 1) mover(columnas);
      return true;
    }
    case 'ArrowUp':
      // A la misma columna de la fila de arriba; en la primera fila no se mueve.
      if (ui.seleccion - cuadriculaInfo.columnas >= 0) mover(-cuadriculaInfo.columnas);
      return true;
    case 'Home':
      cambiarInterfaz({ seleccion: 0 });
      return true;
    case 'End':
      cambiarInterfaz({ seleccion: total - 1 });
      return true;
    case 'Enter':
    case ' ':
      elegirEnCuadricula(ui.seleccion);
      return true;
    case 'Escape':
    case 'g':
    case 'G':
      cerrarCuadricula();
      return true;
    case 'b':
    case 'B':
    case '.':
      // El negro del puntero obedece también con la cuadrícula abierta. En la
      // sala la cuadrícula la ve el público: se cierra, y al volver del negro
      // se ve la diapositiva. En el presentador es solo suya y sigue abierta,
      // para elegir adónde ir mientras la sala está a oscuras.
      if (!e.repeat) {
        if (!esPresentador) cerrarCuadricula();
        alternarNegro();
      }
      return true;
    default:
      return false;
  }
}

export function instalarTeclado(opciones: OpcionesTeclado = {}): () => void {
  const alPulsar = (e: KeyboardEvent) => {
    if (esCampoDeTexto(e.target)) {
      // Un campo de número (data-numerico, como el objetivo del presentador) solo
      // se queda con las teclas que lo editan. Lo demás —flechas, AvPág, RePág,
      // «b» o F5 del puntero, Espacio, letras— suelta el campo (que aplica lo
      // escrito) y se obedece: el puntero nunca se queda muerto por un clic en el campo.
      if (!e.target.hasAttribute('data-numerico') || editaCampoNumerico(e)) return;
      e.target.blur();
    }
    // F5 y Mayús+F5 (botón «empezar» de muchos punteros): pantalla completa en vez de recargar.
    if (e.key === 'F5' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      if (!e.repeat && !document.fullscreenElement) alternarPantallaCompleta();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const ui = obtenerInterfaz();
    if (ui.cuadricula) {
      if (teclaEnCuadricula(e)) e.preventDefault();
      return;
    }

    // Número + Intro para saltar.
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      cambiarInterfaz({ numero: (ui.numero + e.key).slice(-3) });
      borrarNumeroLuego();
      return;
    }
    if (ui.numero) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const n = Number(ui.numero);
        cambiarInterfaz({ numero: '' });
        if (n >= 1) saltar(n - 1, 0);
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        cambiarInterfaz({ numero: ui.numero.slice(0, -1) });
        borrarNumeroLuego();
        return;
      }
      if (e.key === 'Escape') {
        cambiarInterfaz({ numero: '' });
        return;
      }
    }

    let manejada = true;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
      case 'Enter':
      case 'n':
      case 'N':
        avanzar();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
      case 'Backspace':
        retroceder();
        break;
      case 'Home':
        irAlInicio();
        break;
      case 'End':
        irAlFinal();
        break;
      case 'b':
      case 'B':
      case '.':
        if (!e.repeat) alternarNegro();
        break;
      case 'f':
      case 'F':
        if (!e.repeat) alternarPantallaCompleta();
        break;
      case 'g':
      case 'G':
        if (!e.repeat) abrirCuadricula();
        break;
      case 'p':
      case 'P':
        if (opciones.abrirPresentador && !e.repeat) opciones.abrirPresentador();
        else manejada = false;
        break;
      case 'h':
      case 'H':
      case '?':
        if (ui.ayuda) cambiarInterfaz({ ayuda: false });
        else if (!tapaElNegro()) cambiarInterfaz({ ayuda: true });
        break;
      case 'Escape':
        // Mantener Esc pulsado es «salir» para el navegador: las repeticiones no hacen nada aquí.
        if (e.repeat) break;
        // Lo primero que haya abierto: la ayuda, después lo que tenga la sala
        // (desde el presentador) y, si no hay nada, salir de pantalla completa
        // (el «terminar» del puntero; ver quedarseConEsc).
        if (ui.ayuda) cambiarInterfaz({ ayuda: false });
        else if (opciones.alEscapeLibre?.()) break;
        else if (document.fullscreenElement) salirDePantallaCompleta();
        else manejada = false;
        break;
      default:
        manejada = false;
    }
    if (manejada) e.preventDefault();
  };

  window.addEventListener('keydown', alPulsar);
  return () => window.removeEventListener('keydown', alPulsar);
}
