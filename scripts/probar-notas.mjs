/**
 * Prueba de las notas del presentador con el mazo de la charla compilado
 * (dist/): en cada paso de cada diapositiva, la nota cabe en su panel sin
 * desplazar, a 1920 × 1080, a 1366 × 768 y a 1280 × 720, que es lo que da la
 * ThinkPad de 1920 × 1080 al 150 % (docs/GUION.md, M-02 y R-14). La letra baja
 * sola hasta 18 px (Presentador.tsx, useNotasQueCaben); por debajo de eso, el
 * paso falla aunque se vea «sigue ↓». Revisión del 13-nov: a 1280 × 720 no
 * cabían 33 de 38 pasos y no había ninguna señal de que quedaba texto debajo.
 *
 * Comprueba también el aviso de Lendex en claro (revisión r2): sin emular el
 * tema no sale; emulando el claro sale en la franja roja y en la nota del paso
 * 0 de la demo, y se va solo al pasar a oscuro.
 *
 *   node scripts/probar-notas.mjs                 (sobre dist/, después de «npm run build»)
 *   node scripts/probar-notas.mjs --dist otra/carpeta --canal msedge
 *
 * Deja en verificacion/pruebas/notas/ una captura por tamaño del paso con la
 * nota más larga y el resultado.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argumento = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : undefined;
};
process.env.CANAL_NAVEGADOR = argumento('--canal') ?? process.env.CANAL_NAVEGADOR ?? 'chrome';
const DIST = resolve(argumento('--dist') ?? resolve(raiz, 'dist'));
const salida = resolve(raiz, 'verificacion', 'pruebas', 'notas');
const URL_ARCHIVO = pathToFileURL(resolve(DIST, 'index.html')).href;
const TAMANOS = [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
];
const MINIMO = 18;

await mkdir(salida, { recursive: true });
const resultados = [];
const errores = [];
function comprobar(nombre, ok, detalle = '') {
  resultados.push({ nombre, ok: Boolean(ok), detalle });
  console.log(`${ok ? '  ok   ' : '  FALLA'}  ${nombre}${detalle ? `  —  ${detalle}` : ''}`);
}
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\nNotas del presentador en ${DIST} con ${process.env.CANAL_NAVEGADOR}\n`);
const navegador = await abrirNavegador();
try {
  for (const [ancho, alto] of TAMANOS) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto } });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errores.push(`${ancho}×${alto}: ${e.message}`));
    await p.goto(`${URL_ARCHIVO}?presentador#/1/0`);
    await p.waitForFunction(() => window.__motor, null, { timeout: 15000 });
    await p.evaluate(() => window.__motor.esperar());
    const lista = await p.evaluate(() => window.__motor.diapositivas());
    const malos = [];
    let pasos = 0;
    let menor = Infinity;
    let peor = null;
    for (const d of lista) {
      for (let paso = 0; paso <= d.pasos; paso++) {
        pasos++;
        await p.evaluate(([n, s]) => window.__motor.ir(n, s), [d.n, paso]);
        await pausa(200);
        const m = await p.evaluate(() => {
          const el = document.querySelector('.p-notas__texto');
          return { alto: el.scrollHeight, caja: el.clientHeight, tam: Number(el.dataset.tam), sigue: !!document.querySelector('.p-notas__sigue') };
        });
        if (m.tam < menor) {
          menor = m.tam;
          peor = { n: d.n, id: d.id, paso };
        }
        if (m.alto > m.caja + 1) malos.push(`${d.n} ${d.id}, paso ${paso}: ${m.alto} px en ${m.caja} a ${m.tam} px${m.sigue ? ' (con «sigue ↓»)' : ' (SIN aviso)'}`);
      }
    }
    comprobar(`${ancho}×${alto}: la nota de cada paso cabe sin desplazar (${pasos} pasos)`, malos.length === 0, malos.join(' · '));
    comprobar(`${ancho}×${alto}: la letra no baja de ${MINIMO} px`, menor >= MINIMO, `la más chica, ${menor} px, en la ${peor?.n} (${peor?.id}), paso ${peor?.paso}`);
    if (peor) {
      await p.evaluate(([n, s]) => window.__motor.ir(n, s), [peor.n, peor.paso]);
      await pausa(300);
      await p.screenshot({ path: resolve(salida, `presentador-${ancho}x${alto}-la-mas-larga.png`) });
    }
    await ctx.close();
  }

  // ——— Lendex en claro (revisión r2, 13-nov) ———
  // El presentador avisa si Lendex fuera a salir en claro en la demo (DemoLendex.tsx, vigilarTemaLendex).
  // Sin emular el tema, como en la sala, el iframe lleva color-scheme: dark y Lendex ve el oscuro aunque
  // el navegador esté en claro: no hay aviso. Emulando el claro (la emulación manda también dentro del
  // iframe, como un navegador que no le pasara el color-scheme), sí, también en la nota del paso 0.
  const AVISO = 'Lendex saldrá en claro';
  const hayAviso = (p) => p.evaluate((a) => window.__motor.problemas().some((t) => t.startsWith(a)), AVISO);
  for (const [esquema, debe] of [
    [null, false],
    ['light', true],
  ]) {
    const ctx = await navegador.newContext({ viewport: { width: 1366, height: 768 }, colorScheme: esquema });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errores.push(`tema ${esquema}: ${e.message}`));
    await p.goto(`${URL_ARCHIVO}?presentador#/1/0`);
    await p.waitForFunction(() => window.__motor, null, { timeout: 15000 });
    await p.evaluate(() => window.__motor.esperar());
    const como = esquema ? 'emulando el tema claro' : 'sin emular el tema, como en la sala';
    comprobar(`Lendex en claro, ${como}: ${debe ? 'el presentador avisa' : 'sin aviso'}`, (await hayAviso(p)) === debe);
    if (debe) {
      const demo = (await p.evaluate(() => window.__motor.diapositivas())).find((d) => d.id === 'demo-lendex');
      await p.evaluate((n) => window.__motor.ir(n, 0), demo.n);
      await pausa(300);
      const aparte = await p.evaluate(() => document.querySelector('.nota-paso__aparte')?.textContent ?? '');
      comprobar('…y la nota del paso 0 de la demo lo repite en sus avisos', aparte.includes(AVISO));
      await p.emulateMedia({ colorScheme: 'dark' });
      await pausa(300);
      comprobar('…y el aviso se va solo al pasar el navegador a oscuro', !(await hayAviso(p)));
    }
    await ctx.close();
  }
} finally {
  await navegador.close();
}

comprobar('Sin errores de página', errores.length === 0, errores.join(' | '));
const fallos = resultados.filter((r) => !r.ok);
await writeFile(resolve(salida, 'resultado.json'), JSON.stringify({ fecha: new Date().toISOString(), resultados }, null, 2));
console.log(`\n${resultados.length - fallos.length} de ${resultados.length} comprobaciones de las notas bien.`);
process.exitCode = fallos.length ? 1 : 0;
