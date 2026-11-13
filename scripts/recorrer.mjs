/**
 * Recorre la presentación compilada en modo revisión (sin animaciones) y
 * entrega una captura de cada diapositiva y paso. Lo usan capturas.mjs y pdf.mjs.
 */
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * @param {object} opciones
 * @param {boolean} [opciones.soloFinal]  solo el último paso de cada diapositiva
 * @param {'png'|'jpeg'} [opciones.formato]
 * @param {boolean} [opciones.jpegFinal]  además, en el último paso de cada diapositiva, un JPEG para el PDF (en `jpeg`)
 * @param {(captura: {n:number,id:string,titulo:string,paso:number,pasos:number,imagen:Buffer,jpeg?:Buffer}) => Promise<void>|void} alCapturar
 */
export async function recorrer({ soloFinal = false, formato = 'png', jpegFinal = false } = {}, alCapturar) {
  const indice = resolve(raiz, 'dist', 'index.html');
  try {
    await access(indice);
  } catch {
    throw new Error('No existe dist/index.html: ejecuta antes «npm run build».');
  }
  const navegador = await abrirNavegador();
  const errores = [];
  try {
    const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    const pagina = await contexto.newPage();
    pagina.on('pageerror', (e) => errores.push(e.message));
    await pagina.goto(`${pathToFileURL(indice).href}?revision=1#/1/0`);
    await pagina.waitForFunction(() => window.__motor, null, { timeout: 15000 });
    const lista = await pagina.evaluate(() => window.__motor.diapositivas());
    const titulo = await pagina.evaluate(() => window.__motor.titulo);
    for (const d of lista) {
      const pasos = soloFinal ? [d.pasos] : Array.from({ length: d.pasos + 1 }, (_, i) => i);
      for (const paso of pasos) {
        await pagina.evaluate(([n, p]) => window.__motor.ir(n, p), [d.n, paso]);
        const listo = await pagina.evaluate(() => window.__motor.esperar());
        if (!listo) console.warn(`  aviso: la diapositiva ${d.n} (${d.id}) no terminó de cargar a tiempo`);
        const imagen = await pagina.screenshot({ type: formato, ...(formato === 'jpeg' ? { quality: 92 } : {}) });
        const jpeg = jpegFinal && paso === d.pasos ? await pagina.screenshot({ type: 'jpeg', quality: 92 }) : undefined;
        await alCapturar({ n: d.n, id: d.id, titulo: d.titulo, paso, pasos: d.pasos, imagen, jpeg });
      }
    }
    const problemas = await pagina.evaluate(() => window.__motor.problemas());
    return { titulo, total: lista.length, problemas, errores };
  } finally {
    await navegador.close();
  }
}
