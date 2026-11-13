/**
 * Cuadros de una pieza del laboratorio, en instantes exactos desde t = 0,
 * para compararlos lado a lado con las hojas de investigacion/movimiento/.
 *
 *   node scripts/lab-cuadros.mjs --pieza cifra --paso 1
 *   node scripts/lab-cuadros.mjs --pieza cifra --paso 1 --ms 0,33,67,100,150,200,300
 *   node scripts/lab-cuadros.mjs --pieza cifra --paso 1 --cada 33 --hasta 900
 *   node scripts/lab-cuadros.mjs --pieza cinta --paso 1 --url http://localhost:5290/lab.html
 *
 * Opciones:
 *   --pieza   id de la pieza (nombre del archivo sin .lab.tsx)            [obligatoria]
 *   --paso    paso que se reproduce (desde el anterior, quieto)            [1]
 *   --ms      instantes en ms, separados por comas
 *   --cada / --hasta   o bien uno cada N ms hasta M ms                     [cada 33 hasta 1000]
 *   --salida  carpeta de las capturas                                       [verificacion/lab/<pieza>]
 *   --url     lab.html de un servidor de desarrollo ya abierto (npm run dev -- --port N)
 *   --lab     un lab.html ya compilado (npx vite build --mode lab --outDir …)
 *             sin --url ni --lab, compila el laboratorio en una carpeta temporal propia
 *   --canal   chrome (por defecto) o msedge
 *
 * Deja <pieza>-p<paso>-t<ms>.png (1920 × 1080), una hoja de contacto
 * <pieza>-p<paso>-hoja.png con todos los cuadros rotulados y un .json con los
 * instantes, los momentos animados (A-54) y los avisos del motor.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compilarLab, raiz } from './compilar-lab.mjs';
import { abrirNavegador } from './navegador.mjs';

const argumento = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : undefined;
};

const pieza = argumento('--pieza');
if (!pieza) {
  console.error('Falta --pieza <id>. Ejemplo: node scripts/lab-cuadros.mjs --pieza cifra --paso 1');
  process.exit(1);
}
const paso = Number(argumento('--paso') ?? 1);
if (argumento('--canal')) process.env.CANAL_NAVEGADOR = argumento('--canal');
const instantes = argumento('--ms')
  ? argumento('--ms').split(',').map(Number)
  : (() => {
      const cada = Number(argumento('--cada') ?? 33);
      const hasta = Number(argumento('--hasta') ?? 1000);
      const lista = [];
      for (let t = 0; t <= hasta + 1e-6; t += cada) lista.push(Math.round(t));
      return lista;
    })();
if (instantes.some((x) => !Number.isFinite(x) || x < 0)) {
  console.error('Los instantes tienen que ser milisegundos ≥ 0.');
  process.exit(1);
}
instantes.sort((a, b) => a - b);
const salida = resolve(argumento('--salida') ?? resolve(raiz, 'verificacion', 'lab', pieza));
await mkdir(salida, { recursive: true });

let lab = null;
let url = argumento('--url');
if (!url && argumento('--lab')) url = pathToFileURL(resolve(argumento('--lab'))).href;
if (!url) {
  console.log('Compilando el laboratorio en una carpeta temporal…');
  lab = await compilarLab();
  url = lab.url;
}

const navegador = await abrirNavegador();
const errores = [];
try {
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await p.goto(`${url}${url.includes('?') ? '&' : '?'}pieza=${encodeURIComponent(pieza)}&hud=0`);
  await p.waitForFunction(() => window.__lab, null, { timeout: 30000 });
  await p.evaluate(([id, n]) => window.__lab.preparar(id, n), [pieza, paso]);
  await p.evaluate(() => window.__lab.disparar());
  const cuadros = [];
  for (const ms of instantes) {
    await p.evaluate((x) => window.__lab.cuadro(x), ms);
    const imagen = await p.screenshot({ type: 'png' });
    const nombre = `${pieza}-p${paso}-t${String(ms).padStart(4, '0')}.png`;
    await writeFile(resolve(salida, nombre), imagen);
    cuadros.push({ ms, nombre, imagen });
    process.stdout.write(`  ${nombre}\n`);
  }
  const estado = await p.evaluate(() => window.__lab.estado());
  const momentos = await p.evaluate(() => window.__lab.momentos());
  const problemas = await p.evaluate(() => window.__lab.problemas());
  await p.evaluate(() => window.__lab.soltar());

  // Hoja de contacto: cuatro columnas a 1/4, cada cuadro con su instante.
  const hoja = await ctx.newPage();
  await hoja.setViewportSize({ width: 1920, height: 1080 });
  const celdas = cuadros
    .map(
      (c) =>
        `<figure><img src="data:image/png;base64,${c.imagen.toString('base64')}"><figcaption>t = ${c.ms} ms</figcaption></figure>`,
    )
    .join('');
  await hoja.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#141318;color:#f7f7fa;font:20px/1.3 Arial,sans-serif;padding:16px}
    h1{font-size:24px;margin:0 0 12px}
    main{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
    figure{margin:0} img{width:100%;display:block;outline:1px solid #ffffff1f}
    figcaption{padding:4px 2px;color:#b6b1be}
  </style><h1>${pieza} · paso ${paso} · ${cuadros.length} cuadros desde t = 0</h1><main>${celdas}</main>`);
  await hoja.waitForFunction(() => [...document.images].every((i) => i.complete));
  const nombreHoja = `${pieza}-p${paso}-hoja.png`;
  await hoja.screenshot({ path: resolve(salida, nombreHoja), fullPage: true });
  await writeFile(
    resolve(salida, `${pieza}-p${paso}.json`),
    JSON.stringify({ pieza, paso, instantes, estado, momentos, problemas, errores, fecha: new Date().toISOString() }, null, 2),
  );
  console.log(`\n${cuadros.length} cuadros y la hoja ${nombreHoja} en ${salida}`);
  if (Object.values(momentos).some((m) => m.length > 1)) console.log(`Momentos animados (A-54): ${JSON.stringify(momentos)}`);
  if (problemas.length) console.log(`Avisos del motor:\n  ${problemas.join('\n  ')}`);
  if (errores.length) {
    console.log(`Errores en la página:\n  ${errores.join('\n  ')}`);
    process.exitCode = 1;
  }
} finally {
  await navegador.close();
  await lab?.borrar();
}
