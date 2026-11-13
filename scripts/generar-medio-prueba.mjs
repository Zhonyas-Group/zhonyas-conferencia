/**
 * Genera los medios de las diapositivas de PRUEBA sin descargar nada:
 * los dibuja en un canvas dentro de Chrome y graba el video con MediaRecorder.
 *
 *   npm run medio-prueba
 *
 * Crea:
 *   public/medios/prueba/imagen-grande.webp   3840×2160
 *   public/medios/prueba/video.webm           1280×720, ~4 s, VP9
 *   public/medios/prueba/video-poster.webp    primer fotograma del video
 *   public/medios/prueba/webgl-poster.webp    imagen fija para la miniatura WebGL
 *   src/diapositivas/prueba/recursos/textura-prueba.png  textura (se incrusta en el HTML)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const salida = (ruta) => resolve(raiz, ruta);

async function guardar(ruta, base64) {
  const destino = salida(ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, Buffer.from(base64, 'base64'));
  console.log(`  ${ruta}  (${Math.round(Buffer.byteLength(base64, 'base64') / 1024)} KB)`);
}

const navegador = await abrirNavegador();
const pagina = await navegador.newPage();
await pagina.setContent('<!doctype html><body style="margin:0;background:#000"></body>');

const resultado = await pagina.evaluate(async () => {
  const aBase64 = (dataUrl) => dataUrl.slice(dataUrl.indexOf(',') + 1);

  function fondo(ctx, w, h, t = 0) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0b1220');
    g.addColorStop(1, '#1b0f24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // Rejilla fina: deja ver si la imagen se escala nítida.
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = Math.max(1, w / 1920);
    const paso = w / 32;
    for (let x = 0; x <= w; x += paso) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += paso) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Círculos concéntricos que se mueven con t.
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.strokeStyle = `hsla(${200 + i * 18}, 90%, 65%, ${0.5 - i * 0.06})`;
      ctx.lineWidth = w / 400;
      const r = (h / 9) * (i + 1) + Math.sin(t * 2 + i) * (h / 40);
      ctx.arc(w / 2 + Math.cos(t) * (w / 12), h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function rotulo(ctx, w, h, texto, sub) {
    ctx.fillStyle = '#f7f7fa';
    ctx.font = `600 ${Math.round(h / 12)}px Segoe UI, system-ui, sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(texto, w * 0.06, h * 0.86);
    ctx.fillStyle = 'rgba(247,247,250,0.6)';
    ctx.font = `400 ${Math.round(h / 30)}px Segoe UI, system-ui, sans-serif`;
    ctx.fillText(sub, w * 0.06, h * 0.92);
  }

  const lienzo = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  // 1. Imagen grande.
  const grande = lienzo(3840, 2160);
  const g = grande.getContext('2d');
  fondo(g, 3840, 2160, 0.6);
  g.fillStyle = 'rgba(247,247,250,0.55)';
  g.font = '400 60px Segoe UI, system-ui, sans-serif';
  g.fillText('Imagen de prueba 3840 × 2160 · la rejilla debe verse fina, sin escalones', 280, 2010);
  const imagen = aBase64(grande.toDataURL('image/webp', 0.86));

  // 2. Póster WebGL.
  const posterGL = lienzo(1280, 720);
  const p = posterGL.getContext('2d');
  const rg = p.createRadialGradient(640, 330, 20, 640, 360, 700);
  rg.addColorStop(0, '#3a7bd5');
  rg.addColorStop(0.5, '#1a1f4a');
  rg.addColorStop(1, '#05060a');
  p.fillStyle = rg;
  p.fillRect(0, 0, 1280, 720);
  const webglPoster = aBase64(posterGL.toDataURL('image/webp', 0.9));

  // 3. Textura para WebGL (PNG pequeño, se importa desde src/).
  const tex = lienzo(512, 512);
  const t = tex.getContext('2d');
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      t.fillStyle = (x + y) % 2 ? '#f7f7fa' : '#7cc4ff';
      t.fillRect(x * 64, y * 64, 64, 64);
    }
  }
  t.fillStyle = '#010204';
  t.font = '700 120px Segoe UI, system-ui, sans-serif';
  t.textAlign = 'center';
  t.textBaseline = 'middle';
  t.fillText('Z', 256, 262);
  const textura = aBase64(tex.toDataURL('image/png'));

  // 4. Video de ~4 s grabado del canvas.
  const v = lienzo(1280, 720);
  const vc = v.getContext('2d');
  const dibujar = (seg) => {
    fondo(vc, 1280, 720, seg * 1.6);
    rotulo(vc, 1280, 720, 'PRUEBA · video local', `t = ${seg.toFixed(2)} s`);
  };
  dibujar(0);
  const poster = aBase64(v.toDataURL('image/webp', 0.9));

  const tipo = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm';
  // El canvas tiene que estar en la página para que Chrome (también sin ventana) entregue fotogramas.
  document.body.appendChild(v);

  async function grabar(segundos) {
    const flujo = v.captureStream(30);
    const grabadora = new MediaRecorder(flujo, { mimeType: tipo, videoBitsPerSecond: 4_000_000 });
    const trozos = [];
    grabadora.ondataavailable = (e) => e.data.size && trozos.push(e.data);
    const terminado = new Promise((r) => (grabadora.onstop = r));
    dibujar(0);
    await new Promise((r) => setTimeout(r, 300));
    grabadora.start(250);
    const inicio = performance.now();
    await new Promise((listo) => {
      const cuadro = (ahora) => {
        const seg = (ahora - inicio) / 1000;
        dibujar(Math.min(seg, segundos));
        if (seg < segundos) requestAnimationFrame(cuadro);
        else listo();
      };
      requestAnimationFrame(cuadro);
    });
    grabadora.stop();
    await terminado;
    for (const pista of flujo.getTracks()) pista.stop();
    return new Blob(trozos, { type: 'video/webm' });
  }

  // En Chrome sin ventana la PRIMERA grabación suele salir vacía: se descarta una corta y se reintenta.
  await grabar(0.5);
  let blob = await grabar(4);
  for (let intento = 0; blob.size < 10_000 && intento < 6; intento++) blob = await grabar(4);
  if (blob.size < 10_000) throw new Error('MediaRecorder no produjo video.');
  const buffer = new Uint8Array(await blob.arrayBuffer());
  let binario = '';
  for (let i = 0; i < buffer.length; i += 0x8000) binario += String.fromCharCode(...buffer.subarray(i, i + 0x8000));
  const video = btoa(binario);

  return { imagen, webglPoster, textura, poster, video, tipo };
});

console.log(`Medios de prueba (video: ${resultado.tipo}):`);
await guardar('public/medios/prueba/imagen-grande.webp', resultado.imagen);
await guardar('public/medios/prueba/webgl-poster.webp', resultado.webglPoster);
await guardar('public/medios/prueba/video-poster.webp', resultado.poster);
await guardar('public/medios/prueba/video.webm', resultado.video);
await guardar('src/diapositivas/prueba/recursos/textura-prueba.png', resultado.textura);
await navegador.close();
