/**
 * El QR del cierre (M-08 de docs/GUION.md; docs/MEDIOS.md): genera
 * public/medios/cierre/qr-zhonyas.svg en local, sin ningún servicio web, y lo
 * comprueba leyéndolo.
 *
 *   npm run qr              genera y comprueba
 *   npm run qr -- --solo-comprobar   comprueba el que ya hay, sin regenerarlo
 *
 * - Contenido: https://zhonyas.com (sin «www», que da 404; GUION 20, Datos).
 * - Corrección de errores nivel M; zona de silencio de 4 módulos (M-08).
 * - Módulos #010204 (--zh-fondo) sobre #f7f7fa (--zh-texto): los dos son
 *   tokens de src/estilos/marca.css, así que el auditor no los marca.
 * - SVG sin ancho ni alto: se escala a la placa de 360 px de la 20 sin perder nitidez.
 *
 * Lo comprueba dos veces con jsQR (un lector de QR en JavaScript): sobre la
 * matriz de módulos, en Node, y sobre el propio SVG pintado por Chrome
 * (playwright-core, sin ventana) a 360 px, a 180 px y a 99 px (3 px por módulo).
 * Si alguna lectura no da exactamente la dirección, sale con código 1.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const DIRECCION = 'https://zhonyas.com';
const SALIDA = resolve(raiz, 'public', 'medios', 'cierre', 'qr-zhonyas.svg');
const OPCIONES = {
  errorCorrectionLevel: 'M',
  margin: 4,
  color: { dark: '#010204ff', light: '#f7f7faff' },
};
const soloComprobar = process.argv.includes('--solo-comprobar');

let fallos = 0;
const informar = (nombre, ok, detalle = '') => {
  if (!ok) fallos++;
  console.log(`${ok ? '  ok   ' : '  FALLA'}  ${nombre}${detalle ? `  —  ${detalle}` : ''}`);
};

// ——— 1. Generar ———
const qr = QRCode.create(DIRECCION, { errorCorrectionLevel: OPCIONES.errorCorrectionLevel });
const modulos = qr.modules.size;
const lado = modulos + 2 * OPCIONES.margin;
if (!soloComprobar) {
  const svg = await QRCode.toString(DIRECCION, { ...OPCIONES, type: 'svg' });
  await mkdir(dirname(SALIDA), { recursive: true });
  await writeFile(SALIDA, `${svg.trim()}\n`);
  console.log(`QR escrito en ${SALIDA}`);
}
console.log(
  `Versión ${qr.version} (${modulos} × ${modulos} módulos), nivel M, máscara ${qr.maskPattern}; ` +
    `con la zona de silencio, ${lado} × ${lado}: a 360 px, ${(360 / lado).toFixed(2)} px por módulo.\n`,
);

// ——— 2. Leer la matriz en Node ———
{
  const escala = 8;
  const px = lado * escala;
  const rgba = new Uint8ClampedArray(px * px * 4);
  for (let y = 0; y < px; y++)
    for (let x = 0; x < px; x++) {
      const mx = Math.floor(x / escala) - OPCIONES.margin;
      const my = Math.floor(y / escala) - OPCIONES.margin;
      const oscuro = mx >= 0 && my >= 0 && mx < modulos && my < modulos && qr.modules.get(my, mx);
      const i = (y * px + x) * 4;
      // #010204 y #f7f7fa, los colores del SVG.
      rgba.set(oscuro ? [0x01, 0x02, 0x04, 255] : [0xf7, 0xf7, 0xfa, 255], i);
    }
  const leido = jsQR(rgba, px, px);
  informar('jsQR lee la matriz (Node)', leido?.data === DIRECCION, leido ? `«${leido.data}», versión ${leido.version}` : 'no lo encontró');
}

// ——— 3. Leer el SVG tal como lo pinta Chrome ———
{
  const svg = await readFile(SALIDA, 'utf8');
  informar('El SVG usa solo #010204 y #f7f7fa', [...svg.matchAll(/#[0-9a-f]{3,8}\b/gi)].every((m) => /^#(010204|f7f7fa)$/i.test(m[0])));
  informar('El SVG no fija ancho ni alto (se escala a su placa)', !/<svg[^>]*\s(width|height)=/.test(svg));
  const navegador = await abrirNavegador();
  try {
    const pagina = await navegador.newPage();
    await pagina.setContent('<!doctype html><meta charset="utf-8"><body style="margin:0;background:#010204">');
    await pagina.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
    for (const tamano of [360, 180, 99]) {
      const resultado = await pagina.evaluate(
        async ({ svg, tamano }) => {
          const imagen = new Image();
          imagen.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
          await imagen.decode();
          const lienzo = document.createElement('canvas');
          lienzo.width = tamano;
          lienzo.height = tamano;
          const ctx = lienzo.getContext('2d');
          ctx.drawImage(imagen, 0, 0, tamano, tamano);
          const datos = ctx.getImageData(0, 0, tamano, tamano);
          const leido = window.jsQR(datos.data, tamano, tamano);
          return leido ? { data: leido.data, version: leido.version } : null;
        },
        { svg, tamano },
      );
      informar(
        `jsQR lee el SVG pintado por Chrome a ${tamano} px`,
        resultado?.data === DIRECCION,
        resultado ? `«${resultado.data}», versión ${resultado.version}` : 'no lo encontró',
      );
    }
  } finally {
    await navegador.close();
  }
}

console.log(fallos ? `\n${fallos} comprobaciones fallaron.` : '\nEl QR lleva a https://zhonyas.com.');
process.exitCode = fallos ? 1 : 0;
