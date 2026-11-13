/**
 * Recorta una imagen con el Chrome del equipo (sin ImageMagick ni ffmpeg).
 *   node scripts/vitrina-recortar.mjs entrada.jpg salida.jpg y0 y1 [ancho_salida]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { abrirNavegador } from './navegador.mjs';
const [entrada, salida, y0, y1, anchoSalida] = process.argv.slice(2);
const nav = await abrirNavegador();
try {
  const p = await nav.newPage();
  const datos = `data:image/jpeg;base64,${readFileSync(entrada).toString('base64')}`;
  const b64 = await p.evaluate(async ([src, y0, y1, w2]) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const alto = Math.min(img.naturalHeight, y1) - y0;
    const escala = w2 ? w2 / img.naturalWidth : 1;
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(alto * escala);
    c.getContext('2d').drawImage(img, 0, y0, img.naturalWidth, alto, 0, 0, c.width, c.height);
    return c.toDataURL(src.includes('png') ? 'image/png' : 'image/jpeg', 0.8).split(',')[1];
  }, [datos, Number(y0), Number(y1), Number(anchoSalida) || 0]);
  writeFileSync(salida, Buffer.from(b64, 'base64'));
  console.log('ok', salida);
} finally {
  await nav.close();
}
