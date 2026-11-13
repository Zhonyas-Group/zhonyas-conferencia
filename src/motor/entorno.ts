import { useSyncExternalStore } from 'react';

/** Datos de la ventana que no cambian durante la sesión. */
const parametros = new URLSearchParams(location.search);

function bandera(nombre: string): boolean {
  if (!parametros.has(nombre)) return false;
  const valor = parametros.get(nombre);
  return valor !== '0' && valor !== 'false' && valor !== 'no';
}

/** Ventana del presentador (?presentador). */
export const esPresentador = bandera('presentador');
/** Modo revisión (?revision=1): sin animaciones, para capturas automáticas. */
export const esRevision = bandera('revision');
/** Abierta con doble clic (file://), sin servidor. */
export const esArchivo = location.protocol === 'file:';

/** Identificador de esta ventana para la sincronización. */
export const idVentana: string = (() => {
  try {
    return crypto.randomUUID().slice(0, 8);
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
})();

/**
 * Momento en que se abrió esta ventana. Sirve para desempatar entre ventanas:
 * a igualdad de versión manda la que ya estaba abierta, así una ventana que
 * llega (el presentador, una sala recargada) adopta la posición de la que
 * tiene delante el público y no al revés.
 */
export const aperturaVentana: number = Date.now();

/** Huella corta y estable de un texto (djb2), para nombres de claves. */
function huella(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/**
 * Carpeta desde la que se abrió la presentación. En file:// todas las páginas
 * comparten localStorage y BroadcastChannel, así que una copia vieja en
 * Descargas y la del USB se controlarían entre sí si no se separan por carpeta.
 * «…/dist/» y «…/dist/index.html» son la misma copia; en Windows las rutas no
 * distinguen mayúsculas.
 */
const carpeta = (() => {
  const ruta = location.pathname.replace(/[^/]*$/, '');
  let legible = ruta;
  try {
    legible = decodeURIComponent(ruta);
  } catch {
    /* ruta con % sueltos: se usa tal cual */
  }
  return location.protocol === 'file:' ? legible.toLowerCase() : legible;
})();

/**
 * Prefijo de las claves de localStorage y del nombre del canal: una copia de
 * la presentación (otra carpeta, otro USB) no pisa ni mueve a otra.
 */
export const PREFIJO = `zhonyas-conferencia:${huella(carpeta)}`;

/** localStorage puede lanzar (sitio bloqueado, modo privado estricto): siempre envuelto. */
export const almacen = {
  leer<T>(clave: string): T | null {
    try {
      const crudo = localStorage.getItem(`${PREFIJO}:${clave}`);
      return crudo ? (JSON.parse(crudo) as T) : null;
    } catch {
      return null;
    }
  },
  escribir(clave: string, valor: unknown): boolean {
    try {
      localStorage.setItem(`${PREFIJO}:${clave}`, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  },
};

// prefers-reduced-motion puede cambiar con la presentación abierta.
const consultaMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

export function prefiereMenosMovimiento(): boolean {
  return consultaMovimiento.matches;
}

function suscribirMovimiento(avisar: () => void) {
  consultaMovimiento.addEventListener('change', avisar);
  return () => consultaMovimiento.removeEventListener('change', avisar);
}

export function useMenosMovimiento(): boolean {
  return useSyncExternalStore(suscribirMovimiento, prefiereMenosMovimiento);
}

/** requestIdleCallback con respaldo (Safari no lo tiene). */
export function cuandoLibre(fn: () => void, espera = 600): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(fn, { timeout: espera });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 120);
  return () => clearTimeout(id);
}
