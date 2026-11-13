/**
 * Muestra de la dirección nueva (rama diseno-wow): mide, enseña y graba
 * dist-muestra/index.html abierto por file:// en Chrome sin ventana (1920 × 1080).
 *
 *   node scripts/wow-medir.mjs --fps     cuadros por segundo en cada transición, en cada
 *                                        momento animado y con el fondo vivo solo
 *                                        → verificacion/wow/fps.json
 *   node scripts/wow-medir.mjs --tiras   tira de cuadros de cada transición y cada momento
 *                                        (captura de pantalla por CDP, cuadro a cuadro)
 *                                        → verificacion/wow/tiras/NN-nombre.png
 *   node scripts/wow-medir.mjs --video   el recorrido a 1920 × 1080, paso a paso, con tiempos
 *                                        humanos → verificacion/wow/muestra.webm
 *
 * El video: Playwright no puede usar recordVideo sin su ffmpeg («playwright
 * install», que aquí no se usa), así que Chrome graba su propia pestaña
 * (getDisplayMedia con --auto-accept-this-tab-capture) con MediaRecorder en
 * WebM VP9, como scripts/lendex-grabar-demo.mjs. Playwright la maneja.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';
import { ponerDuracion } from './webm-duracion.mjs';

const raiz = resolve(import.meta.dirname, '..');
const salida = join(raiz, 'verificacion', 'wow');
mkdirSync(join(salida, 'tiras'), { recursive: true });
const url = pathToFileURL(join(raiz, 'dist-muestra', 'index.html')).href;
const modo = process.argv.includes('--video') ? 'video' : process.argv.includes('--tiras') ? 'tiras' : 'fps';
const reducido = process.argv.includes('--reducido');

/**
 * El recorrido: cada avance, lo que se mide (ventana, ms) y cuánto se queda
 * en pantalla en el video (como lo pasaría un orador sin hablar: 2–3 s por
 * paso, más donde la animación es larga).
 */
const RECORRIDO = [
  { nombre: '01-portada-se-arma', ventana: 1900, video: 3200 },
  { nombre: '02-inmersion-portada-a-su-calle', ventana: 1100, video: 2400 },
  { nombre: '03-su-calle-titular-palabra-a-palabra', ventana: 1300, video: 3000 },
  { nombre: '04-cortina-jose-a-gregory', ventana: 1100, video: 2300 },
  { nombre: '05-relevo-gregory-vuelo', ventana: 1900, video: 3000 },
  { nombre: '06-camara-relevo-a-sin-rnc', ventana: 1100, video: 2600 },
  { nombre: '07-sin-rnc-cascada', ventana: 2300, video: 3600 },
  { nombre: '08-camara-y-libreta-que-se-escribe', ventana: 4600, video: 6200 },
  { nombre: '09-cortina-gregory-a-angel-y-raya', ventana: 2200, video: 3400 },
  { nombre: '10-angel-camina-29-sep', ventana: 2700, video: 3500 },
  { nombre: '11-angel-camina-2-oct', ventana: 2400, video: 3300 },
  { nombre: '12-angel-corre-20-oct', ventana: 3200, video: 4600 },
];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrir(navegador, extra = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: null,
    reducedMotion: reducido ? 'reduce' : 'no-preference',
    ...extra,
  });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  await pagina.goto(url);
  await pagina.waitForFunction(() => window.__motor?.total > 0);
  await pagina.evaluate(() => window.__motor.esperar());
  return { contexto, pagina, errores };
}

/** Estadística de una lista de instantes de rAF. */
function estadistica(t) {
  if (t.length < 3) return null;
  const d = t.slice(1).map((v, i) => v - t[i]).sort((a, b) => a - b);
  const q = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))];
  return {
    cuadros: t.length,
    fps: +(((t.length - 1) / (t.at(-1) - t[0])) * 1000).toFixed(1),
    medianaMs: +q(0.5).toFixed(1),
    p95Ms: +q(0.95).toFixed(1),
    maximoMs: +d.at(-1).toFixed(1),
    deMasDe25ms: d.filter((x) => x > 25).length,
  };
}

const navegador = await abrirNavegador({ args: modo === 'video' ? ['--auto-accept-this-tab-capture'] : [] });
try {
  if (modo === 'fps') {
    const { pagina, errores } = await abrir(navegador);
    await pagina.evaluate(() => {
      window.__t = [];
      const f = (t) => {
        window.__t.push(t);
        requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    });
    const medir = async (ms) => {
      await pagina.evaluate(() => (window.__t.length = 0));
      await espera(ms);
      return estadistica(await pagina.evaluate(() => window.__t.slice()));
    };
    const resultados = { fecha: new Date().toISOString(), reducido, fondoSolo: await medir(5000), momentos: [] };
    for (const r of RECORRIDO) {
      await pagina.evaluate(() => {
        window.__t.length = 0;
        window.__motor.avanzar();
      });
      await espera(r.ventana);
      const est = estadistica(await pagina.evaluate(() => window.__t.slice()));
      resultados.momentos.push({ nombre: r.nombre, ventanaMs: r.ventana, ...est });
      console.log(r.nombre.padEnd(42), JSON.stringify(est));
      await espera(500);
    }
    resultados.fondoConDiapositiva = await medir(4000);
    resultados.errores = errores;
    console.log('fondo solo', JSON.stringify(resultados.fondoSolo));
    console.log('fondo con la 11', JSON.stringify(resultados.fondoConDiapositiva));
    writeFileSync(join(salida, reducido ? 'fps-reducido.json' : 'fps.json'), JSON.stringify(resultados, null, 2));
    console.log(errores.length ? `Errores: ${errores.join(' | ')}` : 'Sin errores en la consola.');
  } else if (modo === 'tiras') {
    const { pagina, contexto, errores } = await abrir(navegador);
    const cdp = await contexto.newCDPSession(pagina);
    let cuadros = [];
    cdp.on('Page.screencastFrame', (f) => {
      cuadros.push({ t: f.metadata.timestamp * 1000, datos: f.data });
      void cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 960, maxHeight: 540, everyNthFrame: 1 });
    await espera(1200);
    const hoja = await contexto.newPage();
    for (const r of RECORRIDO) {
      cuadros = [];
      const t0 = Date.now();
      await pagina.evaluate(() => window.__motor.avanzar());
      await espera(r.ventana + 150);
      const vistos = cuadros.filter((c) => c.t >= t0 - 20);
      // 10 cuadros repartidos en la ventana (el primero, el del clic).
      const elegidos = [];
      for (let k = 0; k < 10; k++) {
        const objetivo = t0 + (r.ventana * k) / 9;
        let mejor = vistos[0];
        for (const c of vistos) if (Math.abs(c.t - objetivo) < Math.abs((mejor?.t ?? 0) - objetivo)) mejor = c;
        if (mejor) elegidos.push({ ms: Math.max(0, Math.round(mejor.t - t0)), datos: mejor.datos });
      }
      const html = `<!doctype html><meta charset="utf-8"><style>
        body{margin:0;background:#0b0a10;font:600 22px Arial;color:#f7f7fa;width:2440px}
        h1{font-size:28px;margin:16px 20px}
        .r{display:grid;grid-template-columns:repeat(5,480px);gap:8px;padding:0 20px 20px}
        figure{margin:0}img{width:480px;height:270px;display:block}
        figcaption{padding:4px 0;color:#c5bccb}</style>
        <h1>${r.nombre} · ${vistos.length} cuadros capturados en ${r.ventana} ms</h1><div class="r">${elegidos
          .map((e) => `<figure><img src="data:image/jpeg;base64,${e.datos}"><figcaption>t = ${e.ms} ms</figcaption></figure>`)
          .join('')}</div>`;
      await hoja.setViewportSize({ width: 2440, height: 680 });
      await hoja.setContent(html);
      await hoja.waitForTimeout(150);
      await hoja.screenshot({ path: join(salida, 'tiras', `${r.nombre}.png`), fullPage: true });
      console.log(r.nombre, vistos.length, 'cuadros');
      await espera(400);
    }
    await cdp.send('Page.stopScreencast');
    console.log(errores.length ? `Errores: ${errores.join(' | ')}` : 'Sin errores en la consola.');
  } else {
    const { pagina, errores } = await abrir(navegador);
    const trozos = [];
    await pagina.exposeFunction('__trozo', (b64) => trozos.push(Buffer.from(b64, 'base64')));
    const ajustes = await pagina.evaluate(async () => {
      const flujo = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 60 }, width: { ideal: 1920 }, height: { ideal: 1080 }, cursor: 'never' },
        audio: false,
        preferCurrentTab: true,
        selfBrowserSurface: 'include',
      });
      const grabadora = new MediaRecorder(flujo, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 10_000_000 });
      grabadora.ondataavailable = async (e) => {
        if (!e.data.size) return;
        const b = new Uint8Array(await e.data.arrayBuffer());
        let s = '';
        for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
        await window.__trozo(btoa(s));
      };
      window.__grabadora = grabadora;
      window.__flujo = flujo;
      await new Promise((r) => {
        grabadora.onstart = r;
        grabadora.start(1000);
      });
      window.__inicio = performance.now();
      return flujo.getVideoTracks()[0].getSettings();
    });
    console.log('Captura:', JSON.stringify(ajustes));
    await espera(2600); // la portada en espera: el fondo vivo solo
    for (const r of RECORRIDO) {
      await pagina.evaluate(() => window.__motor.avanzar());
      await espera(r.video);
    }
    const ms = await pagina.evaluate(async () => {
      const ms = performance.now() - window.__inicio;
      await new Promise((r) => {
        window.__grabadora.onstop = r;
        window.__grabadora.stop();
      });
      window.__flujo.getTracks().forEach((t) => t.stop());
      return ms;
    });
    await espera(1500); // los últimos trozos
    const { webm, resumen } = ponerDuracion(Buffer.concat(trozos), ms);
    writeFileSync(join(salida, 'muestra.webm'), webm);
    console.log('muestra.webm', (webm.length / 1e6).toFixed(1), 'MB', JSON.stringify(resumen));
    console.log(errores.length ? `Errores: ${errores.join(' | ')}` : 'Sin errores en la consola.');
  }
} finally {
  await navegador.close();
}
