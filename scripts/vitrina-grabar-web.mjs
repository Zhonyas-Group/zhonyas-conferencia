/**
 * Graba zhonyas.com recorriéndose sola (rama diseno-wow, la vitrina). Chrome
 * sin ventana graba su propia pestaña (getDisplayMedia con
 * --auto-accept-this-tab-capture, MediaRecorder en WebM VP9), como
 * lendex-grabar-demo.mjs, sin ffmpeg. La rueda del ratón baja en pasos cortos
 * (la web usa Lenis) y el bloqueo de «Nosotros» se salta con el evento de su
 * propio test:browser (zhonyas:skip-about-lock).
 *   node scripts/vitrina-grabar-web.mjs [segundos] [salida.webm]
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { abrirNavegador } from './navegador.mjs';
import { ponerDuracion } from './webm-duracion.mjs';

const raiz = resolve(import.meta.dirname, '..');
const segundos = Number(process.argv[2] ?? 40);
const salida = resolve(raiz, process.argv[3] ?? 'public/medios/vitrina/videos/zhonyas-web.webm');
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = await abrirNavegador({ args: ['--auto-accept-this-tab-capture'] });
try {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, colorScheme: 'dark', locale: 'es-DO' });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  await p.goto('https://zhonyas.com/', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await espera(3000);
  await p.mouse.move(720, 450);
  await p.evaluate(async () => {
    const flujo = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 60 }, width: { ideal: 1440 }, height: { ideal: 900 }, cursor: 'never' },
      audio: false, preferCurrentTab: true, selfBrowserSurface: 'include',
    });
    const grabadora = new MediaRecorder(flujo, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 3500000 });
    const trozos = [];
    grabadora.ondataavailable = (e) => e.data.size && trozos.push(e.data);
    await new Promise((r) => { grabadora.onstart = r; grabadora.start(1000); });
    window.__grabacion = { grabadora, trozos, flujo, inicio: performance.now() };
  });
  // Un momento quieto con el logo, y a bajar.
  await espera(1500);
  const t0 = Date.now();
  let saltado = false;
  while (Date.now() - t0 < segundos * 1000) {
    await p.mouse.wheel(0, 90);
    await espera(60);
    if (!saltado && Date.now() - t0 > 8000) {
      await p.evaluate(() => window.dispatchEvent(new Event('zhonyas:skip-about-lock')));
      saltado = true;
    }
  }
  await espera(2500);
  const { base64, ms } = await p.evaluate(async () => {
    const g = window.__grabacion;
    const ms = performance.now() - g.inicio;
    await new Promise((r) => { g.grabadora.onstop = r; g.grabadora.stop(); });
    g.flujo.getTracks().forEach((t) => t.stop());
    const b = new Uint8Array(await new Blob(g.trozos, { type: 'video/webm' }).arrayBuffer());
    let s = '';
    for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
    return { base64: btoa(s), ms };
  });
  const { webm, resumen } = ponerDuracion(Buffer.from(base64, 'base64'), ms);
  writeFileSync(salida, webm);
  console.log(salida, `${(webm.length / 1e6).toFixed(1)} MB`, JSON.stringify(resumen));
  console.log('al final:', JSON.stringify(await p.evaluate(() => ({ y: Math.round(scrollY), alto: document.documentElement.scrollHeight }))));
  console.log(errores.length ? `errores: ${errores.join(' | ')}` : 'sin errores de la página');
} finally {
  await nav.close();
}
