/**
 * Muestra de la dirección nueva (rama diseno-wow): una captura de cada paso,
 * ya quieto, de dist-muestra/index.html abierto por file://.
 *   node scripts/wow-capturas.mjs [--espera 2600]
 * Deja verificacion/wow/pasos/NN-id-pP.png.
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(import.meta.dirname, '..');
const salida = join(raiz, 'verificacion', 'wow', 'pasos');
mkdirSync(salida, { recursive: true });
const i = process.argv.indexOf('--espera');
const espera = i > 0 ? Number(process.argv[i + 1]) : 2600;
const solo = process.argv.includes('--solo') ? process.argv[process.argv.indexOf('--solo') + 1] : null;

const navegador = await abrirNavegador();
try {
  const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 }, colorScheme: null });
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await pagina.goto(pathToFileURL(join(raiz, 'dist-muestra', 'index.html')).href);
  await pagina.waitForFunction(() => window.__motor?.total > 0);
  const lista = await pagina.evaluate(() => window.__motor.diapositivas());
  await pagina.waitForTimeout(800);
  for (const d of lista) {
    for (let p = 0; p <= d.pasos; p++) {
      if (solo && !String(d.n).padStart(2, '0').startsWith(solo) && d.id !== solo) {
        await pagina.evaluate(() => window.__motor.avanzar());
        continue;
      }
      await pagina.waitForTimeout(espera);
      const nombre = `${String(d.n).padStart(2, '0')}-${d.id}-p${p}.png`;
      await pagina.screenshot({ path: join(salida, nombre) });
      console.log(nombre);
      await pagina.evaluate(() => window.__motor.avanzar());
    }
  }
  console.log(errores.length ? `Errores:\n${errores.join('\n')}` : 'Sin errores en la consola.');
  console.log('Problemas del motor:', JSON.stringify(await pagina.evaluate(() => window.__motor.problemas())));
} finally {
  await navegador.close();
}
