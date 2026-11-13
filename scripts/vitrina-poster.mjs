/**
 * Un fotograma de un video, a su tamaño, con el Chrome del equipo (sin ffmpeg).
 *   node scripts/vitrina-poster.mjs video.mp4 segundo salida.jpg
 */
import { writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';
const [entrada, segundo, salida] = process.argv.slice(2);
const html = join(resolve(import.meta.dirname, '..', 'verificacion'), 'poster.html');
writeFileSync(html, `<body style="margin:0"><video id="v" muted preload="auto" src="${pathToFileURL(resolve(entrada)).href}"></video></body>`);
const nav = await abrirNavegador();
try {
  const p = await nav.newPage();
  await p.goto(pathToFileURL(html).href);
  // El canvas queda «manchado» por file://: se captura la pantalla con el video a su tamaño.
  const tam = await p.evaluate(async (t) => {
    const v = document.getElementById('v');
    await new Promise((ok) => (v.readyState >= 1 ? ok() : (v.onloadedmetadata = ok)));
    await new Promise((ok) => { v.onseeked = ok; v.currentTime = t; });
    return { width: v.videoWidth, height: v.videoHeight };
  }, Number(segundo));
  await p.setViewportSize(tam);
  await p.waitForTimeout(300);
  await p.locator('#v').screenshot({ path: salida, type: 'jpeg', quality: 85 });
  console.log('ok', salida);
} finally {
  await nav.close();
}
