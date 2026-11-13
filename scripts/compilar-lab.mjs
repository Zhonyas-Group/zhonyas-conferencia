/**
 * Compila el laboratorio de piezas (lab.html, --mode lab) en una carpeta
 * temporal propia, para que varias personas (o agentes) puedan probar piezas
 * a la vez sin pisarse. Lo usan probar-novedades.mjs y lab-cuadros.mjs.
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {object} [opciones]
 * @param {string} [opciones.salida] carpeta de salida (por defecto, una temporal nueva)
 * @returns {Promise<{ carpeta: string, url: string, borrar: () => Promise<void> }>}
 */
export async function compilarLab({ salida } = {}) {
  const { build } = await import('vite');
  const carpeta = salida ? resolve(salida) : await mkdtemp(join(tmpdir(), 'zhonyas-lab-'));
  await build({
    root: raiz,
    configFile: resolve(raiz, 'vite.config.ts'),
    mode: 'lab',
    logLevel: 'warn',
    build: { outDir: carpeta, emptyOutDir: true },
  });
  return {
    carpeta,
    url: pathToFileURL(join(carpeta, 'lab.html')).href,
    borrar: () => (salida ? Promise.resolve() : rm(carpeta, { recursive: true, force: true })),
  };
}
