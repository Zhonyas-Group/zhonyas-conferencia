/**
 * Prueba de la pieza de la demo de Lendex (src/marca/lendex/) en el
 * laboratorio, a 1920×1080, con Chrome sin pantalla. Necesita internet
 * (la parte en vivo carga https://lendexgp.com/app).
 *
 *   node scripts/lendex-probar-demo.mjs --url http://localhost:5305/lab.html
 *   node scripts/lendex-probar-demo.mjs --lab otra/carpeta/lab.html     (laboratorio compilado, file://)
 *
 * Deja capturas y el resultado en verificacion/lendex/.
 * Solo usa el ratón y el teclado de Playwright dentro del navegador.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const arg = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
let base = arg('--url') ?? 'http://localhost:5305/lab.html';
if (arg('--lab')) base = pathToFileURL(resolve(arg('--lab'))).href;
const salida = resolve(raiz, arg('--salida') ?? 'verificacion/lendex');
await mkdir(salida, { recursive: true });

const PIEZA = 'demo-lendex';
const resultados = [];
const ok = (nombre, cumple, detalle = '') => {
  resultados.push({ nombre, cumple: !!cumple, detalle });
  console.log(`${cumple ? 'bien ' : 'FALLA'}  ${nombre}${detalle ? `  (${detalle})` : ''}`);
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const cuotaFrancesa = (monto, tasa, n) => {
  const i = tasa / 100;
  const c = (monto * i) / (1 - (1 + i) ** -n);
  return `RD$${c.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const url = (extra = '') => `${base}${base.includes('?') ? '&' : '?'}pieza=${PIEZA}&hud=0${extra}`;

async function abrirLab(ctx, extra = '') {
  const p = await ctx.newPage();
  const errores = [];
  const ajenos = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => {
    if (m.type() !== 'error') return;
    const origen = m.location()?.url ?? '';
    // Lo que diga Lendex (o su analítica) dentro del iframe no es de la presentación.
    if (/lendexgp\.com|cloudflareinsights|googleapis|gstatic/.test(origen)) ajenos.push(m.text());
    else errores.push(`${m.text()} @ ${origen}`);
  });
  await p.goto(url(extra));
  await p.waitForFunction(() => window.__lab, null, { timeout: 30000 });
  return { p, errores, ajenos };
}

const marcoDe = async (p) => {
  const el = await p.waitForSelector('.capa[data-id="demo-lendex"] iframe.lendex-demo__marco', { state: 'attached' });
  return { el, frame: await el.contentFrame() };
};

/** Rectángulo de algo dentro de Lendex, en px de la página (iframe escalado). */
async function enPagina(p, frame, codigo, arg) {
  const caja = await p.evaluate(() => {
    const r = document.querySelector('.capa[data-id="demo-lendex"] iframe.lendex-demo__marco').getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const escala = caja.w / 960;
  const r = await frame.evaluate(
    ([c, a]) => {
      const el = new Function('a', c)(a);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, w: b.width, h: b.height };
    },
    [codigo, arg],
  );
  if (!r) return null;
  return { cx: caja.x + (r.x + r.w / 2) * escala, cy: caja.y + (r.y + r.h / 2) * escala, x: caja.x + r.x * escala, y: caja.y + r.y * escala, h: r.h * escala, escala };
}

const BOTON = `return [...document.querySelectorAll('button')].find((b) => /Calculadora de Pr/.test(b.textContent) && b.getClientRects().length);`;
const CAMPO = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  return t?.closest('.rounded-2xl')?.querySelectorAll('input[type=number]')[a] ?? null;`;
const CUOTA = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  const p = [...(t?.closest('.rounded-2xl')?.querySelectorAll('p') ?? [])];
  const i = p.findIndex((x) => /^Cuota /.test(x.textContent));
  return i >= 0 ? p[i + 1] : null;`;

const activo = (p) => p.evaluate(() => document.activeElement?.tagName ?? null);
const modo = (p) => p.evaluate(() => document.querySelector('.capa[data-id="demo-lendex"] .lendex-demo')?.getAttribute('data-modo') ?? null);
const posicion = (p) => p.evaluate(() => window.__lab.estado().posicion);
/** Deja la demo en un modo con la tecla V (solo si hace falta). */
async function ponerModo(p, quiero) {
  if ((await modo(p)) !== quiero) {
    await p.keyboard.press('v');
    await espera(400);
  }
  return (await modo(p)) === quiero;
}

const navegador = await abrirNavegador();
let errores = [];
let ajenos = [];
try {
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: 'dark', locale: 'es-DO' });

  // ——— 1. La pieza está en el laboratorio y la demo se precarga ———
  const A = await abrirLab(ctx);
  const p = A.p;
  const piezas = await p.evaluate(() => window.__lab.piezas());
  const pieza = piezas.find((x) => x.id === PIEZA);
  ok('La pieza aparece en el laboratorio sin error', pieza && !pieza.error, pieza?.error ?? pieza?.archivo);
  await p.evaluate((id) => window.__lab.ir(id, 0), PIEZA);
  const { el: marcoEl, frame } = await marcoDe(p);
  await frame.waitForLoadState('load');
  ok('En la escena anterior, Lendex ya se está cargando debajo', /lendexgp\.com/.test(frame.url()), frame.url());
  const inertOculta = await marcoEl.evaluate((e) => e.inert);
  ok('El iframe de la escena oculta es inert (no puede quedarse con el teclado)', inertOculta === true);
  await frame.waitForFunction((c) => !!new Function(c)(), BOTON, { timeout: 30000 });
  await p.screenshot({ path: resolve(salida, 'p0-antes.png') });

  // ——— 2. La demo en pantalla, a sangre y a escala 2 ———
  await p.evaluate(() => window.__lab.avanzar());
  await espera(400);
  ok('Avanzar lleva a la demo', (await posicion(p)) === 1);
  const caja = await marcoEl.evaluate((e) => {
    const r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, inert: e.inert, sandbox: e.getAttribute('sandbox') };
  });
  ok('El iframe ocupa 1920×1080 a partir de (0, 0)', caja.x === 0 && caja.y === 0 && caja.w === 1920 && caja.h === 1080, JSON.stringify(caja));
  ok('En pantalla ya no es inert', caja.inert === false);
  ok('Sin permiso para ventanas emergentes ni para mover la sala', !/allow-popups|allow-top-navigation/.test(caja.sandbox), caja.sandbox);
  const vista = await frame.evaluate(() => ({ w: innerWidth, h: innerHeight }));
  ok('Lendex se maqueta a 960×540 (versión estrecha, calculadora entera)', vista.w === 960 && vista.h === 540, JSON.stringify(vista));
  await p.screenshot({ path: resolve(salida, 'p1-vivo-entrar.png') });

  // ——— 3. El camino ensayado, con un monto distinto del de por defecto ———
  let boton = await enPagina(p, frame, BOTON);
  await p.mouse.move(960, 810);
  for (let i = 0; i < 12 && boton.y + boton.h > 1080 - 80; i++) {
    await p.mouse.wheel(0, 120);
    await espera(150);
    boton = await enPagina(p, frame, BOTON);
  }
  await espera(700);
  boton = await enPagina(p, frame, BOTON);
  await p.mouse.click(boton.cx, boton.cy);
  await frame.waitForFunction((c) => !!new Function('a', c)(0), CAMPO, { timeout: 5000 });
  await espera(600);
  const monto = await enPagina(p, frame, CAMPO, 0);
  await p.mouse.click(monto.x + 160, monto.cy);
  await p.keyboard.press('Control+A');
  await p.keyboard.type('80000', { delay: 80 });
  await espera(400);
  const cuota = await frame.evaluate((c) => new Function(c)()?.textContent ?? null, CUOTA);
  const esperada = cuotaFrancesa(80000, 5, 12);
  ok('La calculadora en vivo da la cuota correcta para RD$80.000', cuota === esperada, `${cuota} · esperada ${esperada}`);
  await p.screenshot({ path: resolve(salida, 'p1-vivo-80000.png') });
  const letra = await frame.evaluate(() => {
    const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent));
    const tam = [...t.closest('.rounded-2xl').querySelectorAll('label, input, p, button, h3, select')].map((e) => parseFloat(getComputedStyle(e).fontSize));
    return Math.min(...tam);
  });
  ok('La letra más pequeña de la calculadora se proyecta a ≥ 24 px', letra * caja.w / 960 >= 24, `${letra} px CSS × ${caja.w / 960}`);

  // ——— 4. El foco ———
  ok('Con el clic en la calculadora, el teclado está en Lendex', (await activo(p)) === 'IFRAME');
  await p.keyboard.press('ArrowRight');
  await espera(200);
  ok('… y → no mueve la charla (lo recibe Lendex)', (await posicion(p)) === 1);
  await p.mouse.move(monto.cx, monto.cy);
  await p.mouse.move(30, 540, { steps: 6 });
  await espera(150);
  ok('Al pasar el ratón por la franja izquierda, la sala recupera el teclado', (await activo(p)) !== 'IFRAME', await activo(p));
  await p.mouse.click(monto.x + 160, monto.cy);
  await p.mouse.move(1890, 540, { steps: 6 });
  await espera(150);
  ok('… y por la franja derecha', (await activo(p)) !== 'IFRAME', await activo(p));
  await p.mouse.click(monto.x + 160, monto.cy);
  await p.mouse.move(monto.cx, -20, { steps: 6 });
  await espera(150);
  ok('… y al salir el ratón de la ventana', (await activo(p)) !== 'IFRAME', await activo(p));
  const clicEnBorde = await (async () => {
    await p.mouse.click(30, 540);
    await espera(250);
    return posicion(p);
  })();
  ok('Un clic en la franja no avanza la charla (data-sin-clic)', clicEnBorde === 1);

  // ——— 5. V: al video y de vuelta ———
  await p.keyboard.press('v');
  await espera(1500);
  const enVideo = await p.evaluate(() => {
    const v = document.querySelector('.capa[data-id="demo-lendex"] video');
    return v ? { t: v.currentTime, w: v.videoWidth, h: v.videoHeight, pausado: v.paused, src: v.currentSrc } : null;
  });
  ok('V pasa al video', (await modo(p)) === 'video' && enVideo, JSON.stringify(enVideo));
  ok('El video es 1920×1080 y avanza desde el principio', enVideo && enVideo.w === 1920 && enVideo.h === 1080 && enVideo.t > 0.5 && enVideo.t < 3 && !enVideo.pausado);
  ok('El iframe, escondido y sin teclado, sigue montado debajo', await marcoEl.evaluate((e) => e.isConnected && e.inert && getComputedStyle(e).visibility === 'hidden'));
  await p.screenshot({ path: resolve(salida, 'p1-video-1500ms.png') });
  await p.keyboard.press('ArrowRight');
  await espera(300);
  ok('En video, → sigue moviendo la charla', (await posicion(p)) === 2);
  await p.keyboard.press('ArrowLeft');
  await espera(300);
  ok('← vuelve a la demo, aún en video', (await posicion(p)) === 1 && (await modo(p)) === 'video');
  await p.keyboard.press('v');
  await espera(400);
  const montoTras = await frame.evaluate((c) => new Function('a', c)(0)?.value, CAMPO);
  ok('Otra V vuelve a lo vivo y la calculadora conserva lo escrito', (await modo(p)) === 'vivo' && montoTras === '80000', `monto ${montoTras}`);

  // ——— 6. Al cambiar de diapositiva con el teclado dentro de Lendex ———
  await p.mouse.click(monto.x + 160, monto.cy);
  ok('(teclado otra vez en Lendex)', (await activo(p)) === 'IFRAME');
  await p.evaluate(() => window.__lab.avanzar());
  await espera(300);
  ok('Al pasar a la siguiente, el teclado vuelve a la charla (iframe inert)', (await activo(p)) !== 'IFRAME', await activo(p));
  await p.keyboard.press('ArrowLeft');
  await espera(300);
  ok('… y ← funciona enseguida', (await posicion(p)) === 1);

  // ——— 7. Dos ventanas: V en una cambia la otra ———
  if ((await posicion(p)) !== 1) await p.evaluate((id) => window.__lab.ir(id, 1), PIEZA);
  await ponerModo(p, 'vivo');
  const B = await abrirLab(ctx);
  await B.p.evaluate((id) => window.__lab.ir(id, 1), PIEZA);
  await espera(500);
  await p.keyboard.press('v');
  await espera(500);
  ok('V en una ventana pone el video en la otra', (await modo(B.p)) === 'video');
  await B.p.keyboard.press('v');
  await espera(500);
  ok('… y V en la otra vuelve a lo vivo en la primera', (await modo(p)) === 'vivo');
  await B.p.close();
  errores.push(...B.errores);
  ajenos.push(...B.ajenos);

  // ——— 8. Sin red: el video solo ———
  await ponerModo(p, 'vivo');
  await ctx.setOffline(true);
  await espera(500);
  ok('Sin red, la sala enseña el video sola', (await modo(p)) === 'video');
  await p.screenshot({ path: resolve(salida, 'p1-sin-red.png') });
  await ctx.setOffline(false);
  await espera(500);
  ok('Con red otra vez, vuelve a lo vivo', (await modo(p)) === 'vivo');

  // ——— 9. Presentador: póster y aviso, nunca un segundo Lendex ———
  await ponerModo(p, 'vivo');
  const P = await abrirLab(ctx, '&presentador=1');
  await P.p.evaluate((id) => window.__lab.ir(id, 1), PIEZA);
  await espera(800);
  const vp = await P.p.evaluate(() => {
    const c = document.querySelector('.capa[data-id="demo-lendex"]');
    return {
      iframes: c.querySelectorAll('iframe').length,
      poster: c.querySelector('img.lendex-demo__lleno')?.getAttribute('src') ?? null,
      aviso: c.querySelector('.lendex-demo__aviso')?.textContent ?? null,
    };
  });
  ok('Presentador: sin iframe, con el póster y el aviso del modo', vp.iframes === 0 && /demo-poster\.webp$/.test(vp.poster ?? '') && /en vivo/.test(vp.aviso ?? ''), JSON.stringify(vp));
  await P.p.screenshot({ path: resolve(salida, 'presentador-vivo.png') });
  await P.p.keyboard.press('v');
  await espera(800);
  const vp2 = await P.p.evaluate(() => ({
    aviso: document.querySelector('.capa[data-id="demo-lendex"] .lendex-demo__aviso')?.textContent,
    video: !!document.querySelector('.capa[data-id="demo-lendex"] video'),
  }));
  ok('Presentador: V pone el video también allí y lo dice', vp2.video && /video/.test(vp2.aviso ?? ''), JSON.stringify(vp2));
  ok('… y la sala lo sigue', (await modo(p)) === 'video');
  await P.p.screenshot({ path: resolve(salida, 'presentador-video.png') });
  await P.p.keyboard.press('v');
  await espera(300);
  await P.p.close();
  errores.push(...P.errores);
  ajenos.push(...P.ajenos);

  // ——— 10. Revisión (capturas y PDF): el póster ———
  const R = await abrirLab(ctx, '&revision=1');
  await R.p.evaluate((id) => window.__lab.ir(id, 1), PIEZA);
  await espera(500);
  const vr = await R.p.evaluate(() => {
    const c = document.querySelector('.capa[data-id="demo-lendex"]');
    const img = c.querySelector('img.lendex-demo__lleno');
    return { iframes: c.querySelectorAll('iframe').length, videos: c.querySelectorAll('video').length, img: img?.getAttribute('src'), lista: img?.complete && img?.naturalWidth };
  });
  ok('Revisión: solo el póster de 1920 px, sin iframe ni video', vr.iframes === 0 && vr.videos === 0 && vr.lista === 1920, JSON.stringify(vr));
  await R.p.screenshot({ path: resolve(salida, 'revision.png') });
  await R.p.close();
  errores.push(...R.errores);
  ajenos.push(...R.ajenos);

  // ——— 11. Motor ———
  const problemas = await p.evaluate(() => window.__lab.problemas());
  const momentos = await p.evaluate(() => window.__lab.momentos());
  ok('Sin avisos del motor', problemas.length === 0, problemas.join(' | '));
  ok('Ningún momento animado propio (A-54)', Object.values(momentos).every((m) => m.length === 0), JSON.stringify(momentos));
  errores.push(...A.errores);
  ajenos.push(...A.ajenos);
  ok('Sin errores en la consola de la presentación', errores.length === 0, errores.join(' | '));
  await ctx.close();
} finally {
  await navegador.close();
}
const fallos = resultados.filter((r) => !r.cumple);
await writeFile(
  resolve(salida, 'prueba.json'),
  JSON.stringify({ fecha: new Date().toISOString(), base, resultados, erroresDeLendex: [...new Set(ajenos)] }, null, 2),
);
console.log(`\n${resultados.length - fallos.length}/${resultados.length} bien. Capturas en ${salida}`);
if (ajenos.length) console.log(`Errores de consola de Lendex (no de la presentación): ${[...new Set(ajenos)].join(' | ')}`);
process.exitCode = fallos.length ? 1 : 0;
