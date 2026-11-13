/**
 * Graba el video de respaldo de la demo de Lendex (pieza src/marca/lendex/) y
 * sus pósteres, recorriendo el camino ensayado en la calculadora pública de
 * https://lendexgp.com/app.
 *
 *   node scripts/lendex-grabar-demo.mjs --guion               M-07, el respaldo de la 18 (lo que usa la charla)
 *   node scripts/lendex-grabar-demo.mjs --guion --comprobar   solo recorre y comprueba: no graba ni escribe
 *   node scripts/lendex-grabar-demo.mjs                       el video del 12-nov (laboratorio de la pieza)
 *   … --salida carpeta                                         guarda en otra carpeta
 *
 * Con --guion (docs/GUION.md, 18 y M-07): la página de escritorio de Lendex a
 * 1920 × 1080, el clic en «Calculadora de Préstamos» (o nada, si ?calculadora
 * ya la abre sola), el recorte de la 18 (la tarjeta ampliada 2× en 1344 × 896
 * en x 288, y 115) y, grabando, RD$10,000 y 20 % hasta ver la cuota de
 * RD$2,252.65 y el total de RD$27,031.75. Crea respaldo.webm, respaldo-poster.webp
 * (su primer cuadro) y respaldo-final.webp (el último: el póster del presentador).
 *
 * Sin --guion, el camino del 12-nov: la versión estrecha de Lendex, bajar hasta
 * «Calculadora de Préstamos», abrirla y escribir RD$50.000, 5 % y 12 cuotas.
 *
 * No descarga nada ni necesita ffmpeg: Chrome sin pantalla graba su propia
 * pestaña (getDisplayMedia con --auto-accept-this-tab-capture) con
 * MediaRecorder en WebM VP9, y los pósteres salen del propio video
 * (canvas → WebP). No inicia sesión ni crea cuentas: la calculadora es pública.
 *
 * Crea, sin --guion:
 *   demo-calculadora.webm  1920×1080, VP9, ~20 s, sin sonido
 *   demo-inicio.webp       primer fotograma (póster del <video>)
 *   demo-poster.webp       último fotograma, con la cuota (miniaturas, PDF, presentador)
 *
 * Por qué así (medido el 12-nov-2026):
 *   - Sin --guion, Lendex a 960×540 px CSS con escala 2 enseña la calculadora
 *     entera en 1920×1080 y su letra más pequeña (12 px) sale a 24 px. Era la
 *     geometría de la 18 hasta el 13-nov; ahora la 18 usa la del guion (--guion).
 *   - Tema oscuro: Lendex sigue a prefers-color-scheme; en oscuro la pantalla
 *     de entrar no deslumbra al lado de las diapositivas.
 *   - Sin puntero: la captura de la pestaña no lo pinta (nada de cursor falso).
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argumentos = process.argv.slice(2);
const argumento = (nombre) => {
  const i = argumentos.indexOf(nombre);
  return i >= 0 ? argumentos[i + 1] : undefined;
};
const soloComprobar = argumentos.includes('--comprobar');
/**
 * --guion: el respaldo de M-07 (docs/GUION.md, 18 y M-07; docs/MEDIOS.md): la
 * propia 18 grabada con red, con la geometría de la diapositiva (la página de
 * escritorio de Lendex, 1920 × 1080, recortada a la tarjeta de la calculadora
 * y ampliada 2× en 1344 × 896 en x 288, y 115; src/marca/lendex/DemoLendex.tsx)
 * y lo que se escribe en la charla: RD$10,000 y 20 % (12 cuotas, Mensual y
 * Francesa ya vienen). Deja respaldo.webm, respaldo-poster.webp (su primer
 * cuadro) y respaldo-final.webp (el último, con la cuota: el póster del
 * presentador). Dice también si «?calculadora» ya abre la calculadora sola
 * (LENDEX_ABRE_LA_CALCULADORA de la pieza).
 * Sin --guion, el video del 12-nov: la versión estrecha de Lendex (960 × 540
 * ampliada 2×) con lo que trae (RD$50,000 al 5 %), para el laboratorio.
 */
const modoGuion = argumentos.includes('--guion');
const salida = resolve(raiz, argumento('--salida') ?? 'public/medios/lendex');

export const URL_CALCULADORA = modoGuion ? 'https://lendexgp.com/app?calculadora' : 'https://lendexgp.com/app';
/** Lo que se escribe, en orden. */
const CAMPOS = modoGuion
  ? [
      { indice: 0, texto: '10000' }, // Monto (RD$): el «¿Diez mil? Diez mil.» del guion
      { indice: 1, texto: '20' }, // Tasa: el «20 mensual» de la cita de la 17
    ]
  : [
      { indice: 0, texto: '50000' }, // Monto (RD$): los valores por defecto, escritos a mano
      { indice: 1, texto: '5' }, // Tasa de Interes (%)
      { indice: 2, texto: '12' }, // Plazo (cuotas)
    ];
/**
 * Con --guion: 10 000 al 20 % mensual en 12 cuotas francesas: cuota de
 * RD$2,252.65 y total de RD$27,031.75 (docs/GUION.md, 18, «Datos»; cálculo
 * con calculateInstallments.ts de Lendex). Sin él: 50 000 × 0,05 / (1 − 1,05⁻¹²)
 * = 5 641,27 (síntesis §6.3; 04 §2, verificado).
 */
const CUOTA_ESPERADA = modoGuion ? 'RD$2,252.65' : 'RD$5,641.27';
const TOTAL_ESPERADO = modoGuion ? 'RD$27,031.75' : 'RD$67,695.26';
/** Los archivos que deja, en `salida` (la ficha, en verificacion/lendex/). */
const NOMBRES = modoGuion
  ? { video: 'respaldo.webm', inicio: 'respaldo-poster.webp', final: 'respaldo-final.webp', ficha: 'respaldo.json' }
  : { video: 'demo-calculadora.webm', inicio: 'demo-inicio.webp', final: 'demo-poster.webp', ficha: 'demo-calculadora.json' };
/** Página de Lendex en px CSS y su escala en la pestaña grabada (sin --guion, la versión estrecha ampliada 2×). */
const ANCHO = modoGuion ? 1920 : 960;
const ALTO = modoGuion ? 1080 : 540;
const ESCALA = modoGuion ? 1 : 2;
/** Con --guion, la tarjeta en la página de Lendex y dónde queda en la diapositiva (DemoLendex.tsx: TARJETA_LENDEX y RECORTE_LENDEX). */
const TARJETA = { x: 1104, y: 316, ancho: 672, alto: 448 };
const RECORTE = { x: 288, y: 115, escala: 2 };
/** De px CSS de Lendex a px de la pestaña: cambia al recortar (solo con --guion). */
let aPagina = (x, y) => [x * ESCALA, y * ESCALA];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ——— Comprobación de cabeceras: ¿se puede seguir embebiendo en un iframe? ———

async function comprobarCabeceras() {
  const r = await fetch(URL_CALCULADORA, { redirect: 'follow' });
  const xfo = r.headers.get('x-frame-options');
  const csp = r.headers.get('content-security-policy') ?? '';
  const ancestros = /frame-ancestors\s+([^;]*)/i.exec(csp)?.[1]?.trim() ?? null;
  const bloquea = !!xfo || (ancestros !== null && !/\*/.test(ancestros));
  return { estado: r.status, xfo, frameAncestors: ancestros, embebible: r.ok && !bloquea };
}

// ——— WebM de MediaRecorder: le falta la duración. Se añade en Info. ———

function leerVint(buf, pos, conMarca) {
  const primero = buf[pos];
  let largo = 1;
  while (largo <= 8 && !(primero & (0x80 >> (largo - 1)))) largo++;
  if (largo > 8) throw new Error(`vint inválido en ${pos}`);
  let valor = conMarca ? primero : primero & (0xff >> largo);
  let desconocido = (primero & (0xff >> largo)) === 0xff >> largo;
  for (let i = 1; i < largo; i++) {
    valor = valor * 256 + buf[pos + i];
    if (buf[pos + i] !== 0xff) desconocido = false;
  }
  return { valor, largo, desconocido: !conMarca && desconocido };
}

function tamanoVint(n) {
  // 8 bytes siempre: sobra sitio y no cambia el resto del archivo más de lo necesario.
  const b = Buffer.alloc(8);
  b[0] = 0x01;
  let v = n;
  for (let i = 7; i >= 1; i--) {
    b[i] = v % 256;
    v = Math.floor(v / 256);
  }
  return b;
}

const ID = {
  EBML: 0x1a45dfa3,
  Segment: 0x18538067,
  SeekHead: 0x114d9b74,
  Info: 0x1549a966,
  TimecodeScale: 0x2ad7b1,
  Duration: 0x4489,
  Tracks: 0x1654ae6b,
  Cluster: 0x1f43b675,
  Timecode: 0xe7,
  SimpleBlock: 0xa3,
  BlockGroup: 0xa0,
  Block: 0xa1,
  Cues: 0x1c53bb6b,
};
const CONTENEDORES = new Set([ID.Segment, ID.Cluster, ID.BlockGroup]);

/** Recorre el WebM y devuelve dónde está Info, la escala de tiempo y los instantes de cada bloque. */
function analizarWebm(buf) {
  let info = null;
  let escala = 1_000_000;
  let tiempoCluster = 0;
  const bloques = [];
  let seekHead = false;
  let cues = false;
  let pos = 0;
  while (pos < buf.length) {
    const id = leerVint(buf, pos, true);
    const tam = leerVint(buf, pos + id.largo, false);
    const inicioDatos = pos + id.largo + tam.largo;
    if (id.valor === ID.SeekHead) seekHead = true;
    if (id.valor === ID.Cues) cues = true;
    if (CONTENEDORES.has(id.valor)) {
      pos = inicioDatos; // se entra (tamaño conocido o «desconocido» de una grabación en vivo)
      continue;
    }
    if (tam.desconocido) throw new Error(`Elemento ${id.valor.toString(16)} de tamaño desconocido`);
    const fin = inicioDatos + tam.valor;
    if (id.valor === ID.Info) {
      info = { inicio: pos, inicioDatos, fin };
      // Escala de tiempo, si la hay.
      let p = inicioDatos;
      while (p < fin) {
        const hid = leerVint(buf, p, true);
        const htam = leerVint(buf, p + hid.largo, false);
        const d = p + hid.largo + htam.largo;
        if (hid.valor === ID.TimecodeScale) escala = buf.readUIntBE(d, htam.valor);
        if (hid.valor === ID.Duration) info.yaTieneDuracion = true;
        p = d + htam.valor;
      }
    } else if (id.valor === ID.Timecode) {
      tiempoCluster = buf.readUIntBE(inicioDatos, tam.valor);
    } else if (id.valor === ID.SimpleBlock || id.valor === ID.Block) {
      const pista = leerVint(buf, inicioDatos, false);
      const relativo = buf.readInt16BE(inicioDatos + pista.largo);
      const banderas = buf[inicioDatos + pista.largo + 2];
      bloques.push({ t: tiempoCluster + relativo, clave: id.valor === ID.SimpleBlock && !!(banderas & 0x80) });
    }
    pos = fin;
  }
  return { info, escala, bloques, seekHead, cues };
}

/**
 * La captura de una pestaña solo manda cuadros cuando algo cambia (y uno de
 * refresco por segundo): la duración se pone con el tiempo real grabado
 * (`grabadoMs`), para que la pausa final sobre la cuota no se pierda.
 */
function ponerDuracion(buf, grabadoMs) {
  const a = analizarWebm(buf);
  if (!a.info) throw new Error('El WebM no tiene Info');
  if (a.seekHead || a.cues) throw new Error('El WebM trae SeekHead o Cues: no se toca (cambiaría sus posiciones)');
  const tiempos = a.bloques.map((b) => b.t).sort((x, y) => x - y);
  const intervalo = tiempos.length > 1 ? (tiempos.at(-1) - tiempos[0]) / (tiempos.length - 1) : 16;
  // En unidades de TimecodeScale (ms con la escala de 1e6).
  const duracion = Math.max(tiempos.at(-1) + intervalo, (grabadoMs * 1e6) / a.escala);
  const huecos = tiempos.slice(1).map((t, i) => ((t - tiempos[i]) * a.escala) / 1e6);
  // Fluidez mientras algo se mueve: huecos de menos de 100 ms (los demás son ratos quietos).
  const enMovimiento = huecos.filter((h) => h < 100).sort((x, y) => x - y);
  const resumen = {
    cuadros: tiempos.length,
    clave: a.bloques.filter((b) => b.clave).length,
    duracionMs: Math.round((duracion * a.escala) / 1e6),
    fpsEnMovimiento: enMovimiento.length ? Math.round(1000 / enMovimiento[Math.floor(enMovimiento.length / 2)]) : 0,
    huecoP90EnMovimientoMs: enMovimiento.length ? Math.round(enMovimiento[Math.floor(enMovimiento.length * 0.9)]) : 0,
    huecoMaximoMs: Math.round(Math.max(0, ...huecos)),
  };
  if (a.info.yaTieneDuracion) return { webm: buf, resumen };
  const elementoDuracion = Buffer.alloc(11);
  elementoDuracion.writeUInt16BE(ID.Duration, 0);
  elementoDuracion[2] = 0x88; // tamaño 8
  elementoDuracion.writeDoubleBE(duracion, 3);
  const datosInfo = Buffer.concat([buf.subarray(a.info.inicioDatos, a.info.fin), elementoDuracion]);
  const idInfo = buf.subarray(a.info.inicio, a.info.inicio + 4);
  const nuevaInfo = Buffer.concat([idInfo, tamanoVint(datosInfo.length), datosInfo]);
  return { webm: Buffer.concat([buf.subarray(0, a.info.inicio), nuevaInfo, buf.subarray(a.info.fin)]), resumen };
}

// ——— El recorrido ———

/** Rectángulo (px CSS del iframe; en la página, ×ESCALA) de algo dentro de Lendex. */
async function rect(marco, codigo, arg) {
  return marco.evaluate(
    ([c, a]) => {
      const el = new Function('a', c)(a);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
    },
    [codigo, arg],
  );
}

const BOTON_CALCULADORA = `return [...document.querySelectorAll('button')].find((b) => /Calculadora de Pr/.test(b.textContent) && b.getClientRects().length);`;
const CAMPO = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  return t?.closest('.rounded-2xl')?.querySelectorAll('input[type=number]')[a] ?? null;`;
const CUOTA = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  const p = [...(t?.closest('.rounded-2xl')?.querySelectorAll('p') ?? [])];
  const i = p.findIndex((x) => /^Cuota /.test(x.textContent));
  return i >= 0 ? p[i + 1] : null;`;
const TOTAL = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  const p = [...(t?.closest('.rounded-2xl')?.querySelectorAll('p') ?? [])];
  const i = p.findIndex((x) => /^Total a Pagar/.test(x.textContent));
  return i >= 0 ? p[i + 1] : null;`;
const TARJETA_ABIERTA = `const t = [...document.querySelectorAll('h3')].find((h) => /Calculadora de Pr/.test(h.textContent) && h.getClientRects().length);
  return t?.closest('.rounded-2xl') ?? null;`;

/**
 * --guion, antes de grabar: abre la calculadora como lo hace Angel (o ve que
 * ya abrió sola con ?calculadora), comprueba que la tarjeta está donde la
 * recorta la diapositiva y aplica el recorte de 2×. Devuelve si abrió sola.
 */
async function prepararGuion(pagina, marco, { pausa }) {
  await pausa(800);
  let tarjeta = await rect(marco, TARJETA_ABIERTA);
  const abreSola = !!tarjeta;
  if (!abreSola) {
    const boton = await rect(marco, BOTON_CALCULADORA);
    if (!boton) throw new Error('No aparece el botón «Calculadora de Préstamos» en la pantalla de entrar');
    if (boton.y + boton.h > ALTO) throw new Error(`El botón «Calculadora de Préstamos» no se ve sin desplazar (y ${Math.round(boton.y)})`);
    const [x, y] = aPagina(boton.cx, boton.cy);
    await pagina.mouse.click(x, y);
    await marco.waitForFunction((c) => !!new Function(c)(), TARJETA_ABIERTA, { timeout: 4000 });
    await pausa(1100); // la entrada de la tarjeta (motion) termina
    tarjeta = await rect(marco, TARJETA_ABIERTA);
  }
  const fuera = ['x', 'y'].some((k) => Math.abs(tarjeta[k] - TARJETA[k]) > 2) || Math.abs(tarjeta.w - TARJETA.ancho) > 2 || Math.abs(tarjeta.h - TARJETA.alto) > 2;
  if (fuera)
    throw new Error(
      `La tarjeta de la calculadora ya no está donde la recorta la diapositiva: ${JSON.stringify(tarjeta)} en vez de ${JSON.stringify(TARJETA)}. Hay que volver a medirla (TARJETA_LENDEX en DemoLendex.tsx).`,
    );
  await pagina.evaluate(() => window.recortar());
  aPagina = (x, y) => [RECORTE.x + (x - TARJETA.x) * RECORTE.escala, RECORTE.y + (y - TARJETA.y) * RECORTE.escala];
  await pausa(300);
  return { abreSola, tarjeta };
}

/** --guion, grabando: la calculadora quieta un momento, el monto y la tasa como Angel, y quieta en la cuota. */
async function escribirGuion(pagina, marco, { pausa }) {
  await pausa(1500);
  for (const campo of CAMPOS) {
    const r = await rect(marco, CAMPO, campo.indice);
    if (!r) throw new Error(`No aparece el campo ${campo.indice} de la calculadora`);
    const [x, y] = aPagina(r.x + Math.min(160, r.w / 2), r.cy);
    await pagina.mouse.click(x, y);
    await pausa(250);
    await pagina.keyboard.press('Control+A');
    await pausa(200);
    for (const letra of campo.texto) {
      await pagina.keyboard.type(letra);
      await pausa(230);
    }
    await pausa(700);
  }
  // Soltar el campo: clic en un hueco vacío de la tarjeta, a la derecha del título (así el campo
  // pierde el foco dentro de Lendex y no se quedan a la vista sus flechitas de número), y el ratón fuera.
  const [hx, hy] = aPagina(TARJETA.x + TARJETA.ancho - 40, TARJETA.y + 30);
  await pagina.mouse.click(hx, hy);
  await pagina.mouse.move(60, ALTO - 40);
  await pausa(3500);
  const cuota = await marco.evaluate((c) => new Function(c)()?.textContent ?? null, CUOTA);
  const total = await marco.evaluate((c) => new Function(c)()?.textContent ?? null, TOTAL);
  return { cuota, total };
}

async function recorrer(pagina, marco, { pausa }) {
  // 1. La pantalla de entrar, quieta.
  await pausa(1500);
  // 2. Bajar con la rueda hasta que se vea «Calculadora de Préstamos».
  let boton = await rect(marco, BOTON_CALCULADORA);
  if (!boton) throw new Error('No aparece el botón «Calculadora de Préstamos» en la pantalla de entrar');
  await pagina.mouse.move((ANCHO / 2) * ESCALA, ALTO * 0.75 * ESCALA);
  for (let i = 0; i < 12 && boton.y + boton.h > ALTO - 40; i++) {
    await pagina.mouse.wheel(0, 120);
    await pausa(140);
    boton = await rect(marco, BOTON_CALCULADORA);
  }
  // 3. Abrir la calculadora, cuando el desplazamiento suave ya terminó (el botón no se mueve).
  let anterior = null;
  for (let i = 0; i < 20; i++) {
    await pausa(150);
    boton = await rect(marco, BOTON_CALCULADORA);
    if (anterior && Math.abs(anterior.cy - boton.cy) < 0.5) break;
    anterior = boton;
  }
  await pausa(400);
  for (let intento = 0; intento < 3; intento++) {
    boton = await rect(marco, BOTON_CALCULADORA);
    await pagina.mouse.click(boton.cx * ESCALA, boton.cy * ESCALA);
    const abierta = await marco
      .waitForFunction((c) => !!new Function('a', c)(0), CAMPO, { timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    if (abierta) break;
  }
  await pausa(1100);
  // 4. Escribir cada campo como lo haría una persona: seleccionar todo y teclear.
  for (const campo of CAMPOS) {
    const r = await rect(marco, CAMPO, campo.indice);
    if (!r) throw new Error(`No aparece el campo ${campo.indice} de la calculadora`);
    await pagina.mouse.click((r.x + Math.min(160, r.w / 2)) * ESCALA, r.cy * ESCALA);
    await pausa(250);
    await pagina.keyboard.press('Control+A');
    await pausa(200);
    for (const letra of campo.texto) {
      await pagina.keyboard.type(letra);
      await pausa(230);
    }
    await pausa(700);
  }
  // 5. Soltar el campo (clic en el fondo vacío de la calculadora) y quedarse en la cuota.
  await pagina.mouse.click(24 * ESCALA, (ALTO / 2) * ESCALA);
  await pausa(3200);
  const cuota = await marco.evaluate((c) => new Function(c)()?.textContent ?? null, CUOTA);
  return { cuota };
}

// ——— Principal ———

const cabeceras = await comprobarCabeceras();
console.log(`Cabeceras de ${URL_CALCULADORA}: ${JSON.stringify(cabeceras)}`);
if (!cabeceras.embebible) {
  console.log(
    'AVISO: Lendex ya no se deja embeber en un iframe. La diapositiva en vivo no cargará: usa el video (V) o la ventana aparte (ver el comentario de src/marca/lendex/DemoLendex.tsx).',
  );
}

const carpetaTemporal = join(tmpdir(), `zhonyas-lendex-${process.pid}`);
await mkdir(carpetaTemporal, { recursive: true });
const estudio = join(carpetaTemporal, 'estudio.html');
await writeFile(
  estudio,
  (modoGuion
    ? `<!doctype html><meta charset="utf-8"><title>Estudio Lendex (M-07)</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#010204}
#caja{position:fixed;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
#caja.recorte{left:${RECORTE.x}px;top:${RECORTE.y}px;width:${TARJETA.ancho * RECORTE.escala}px;height:${TARJETA.alto * RECORTE.escala}px}
iframe{position:absolute;left:0;top:0;width:1920px;height:1080px;border:0;display:block;transform-origin:0 0}
#caja.recorte iframe{transform:scale(${RECORTE.escala}) translate(-${TARJETA.x}px,-${TARJETA.y}px)}</style>
<!-- La geometría de la 18 (src/marca/lendex/demo-lendex.css): la página de escritorio de Lendex a
     1920×1080; después, la tarjeta de la calculadora ampliada 2× en 1344×896 en x 288, y 115, sobre
     el fondo de la marca (#010204, --zh-fondo). -->
<div id="caja"><iframe id="lendex" src="${URL_CALCULADORA}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe></div>
<script>
window.recortar = () => document.getElementById('caja').classList.add('recorte');`
    : `<!doctype html><meta charset="utf-8"><title>Estudio Lendex</title>
<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}
iframe{position:fixed;left:0;top:0;width:${ANCHO}px;height:${ALTO}px;border:0;display:block;transform-origin:0 0;transform:scale(${ESCALA})}</style>
<!-- La geometría del 12-nov: la página mide 1920×1080 y el iframe 960×540 escalado ×2. Si la
     página midiera 960×540 a escala 2, al grabar la pestaña Chrome la redimensiona al tamaño de
     la captura y Lendex pasa a su versión de escritorio (medido el 12-nov). -->
<iframe id="lendex" src="${URL_CALCULADORA}" sandbox="allow-scripts allow-same-origin allow-forms"></iframe>
<script>`) +
    `
let grabadora = null, trozos = [], flujo = null;
window.empezar = async () => {
  flujo = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 60 }, width: { ideal: ${ANCHO * ESCALA} }, height: { ideal: ${ALTO * ESCALA} }, cursor: 'never' },
    audio: false, preferCurrentTab: true, selfBrowserSurface: 'include',
  });
  const pista = flujo.getVideoTracks()[0];
  grabadora = new MediaRecorder(flujo, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 12000000 });
  grabadora.ondataavailable = (e) => e.data.size && trozos.push(e.data);
  await new Promise((r) => { grabadora.onstart = r; grabadora.start(1000); });
  window.inicioGrabacion = performance.now();
  return pista.getSettings();
};
window.terminar = async () => {
  const ms = performance.now() - window.inicioGrabacion;
  await new Promise((r) => { grabadora.onstop = r; grabadora.stop(); });
  flujo.getTracks().forEach((t) => t.stop());
  const b = new Uint8Array(await new Blob(trozos, { type: 'video/webm' }).arrayBuffer());
  let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return { base64: btoa(s), ms };
};
</script>`,
);

const navegador = await abrirNavegador({ args: ['--auto-accept-this-tab-capture'] });
let codigoSalida = 0;
let pagina = null;
try {
  const ctx = await navegador.newContext({
    viewport: { width: ANCHO * ESCALA, height: ALTO * ESCALA },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    locale: 'es-DO',
  });
  pagina = await ctx.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  await pagina.goto(pathToFileURL(estudio).href);
  const marcoEl = await pagina.waitForSelector('#lendex');
  const marco = await marcoEl.contentFrame();
  await marco.waitForLoadState('load');
  // La pantalla de entrar tiene 2 s de presentación (LoginPage.tsx: setShowSplash, 2000 ms).
  await marco.waitForFunction((c) => !!new Function(c)(), BOTON_CALCULADORA, { timeout: 30000 });
  await espera(800);

  let ajustes = null;
  let preparado = null;
  if (modoGuion) {
    preparado = await prepararGuion(pagina, marco, { pausa: espera });
    console.log(
      preparado.abreSola
        ? 'Lendex YA abre la calculadora sola con ?calculadora: pon LENDEX_ABRE_LA_CALCULADORA = true en src/marca/lendex/DemoLendex.tsx y vuelve a compilar (la 18 pasa a dos pasos).'
        : 'Lendex todavía no abre la calculadora sola con ?calculadora: la 18 sigue con la pantalla de entrar y Angel pulsa el botón (LENDEX_ABRE_LA_CALCULADORA = false).',
    );
  }
  if (!soloComprobar) ajustes = await pagina.evaluate(() => window.empezar());
  const t0 = Date.now();
  const { cuota, total } = modoGuion
    ? await escribirGuion(pagina, marco, { pausa: espera })
    : { ...(await recorrer(pagina, marco, { pausa: espera })), total: await marco.evaluate((c) => new Function(c)()?.textContent ?? null, TOTAL) };
  const segundos = (Date.now() - t0) / 1000;
  console.log(`Recorrido: ${segundos.toFixed(1)} s · cuota en pantalla: ${cuota} · total: ${total}`);
  if (cuota !== CUOTA_ESPERADA || total !== TOTAL_ESPERADO) {
    codigoSalida = 1;
    throw new Error(`La cuota y el total no son ${CUOTA_ESPERADA} y ${TOTAL_ESPERADO} sino ${cuota} y ${total}: Lendex cambió. No se guarda nada.`);
  }
  if (soloComprobar) {
    console.log('Comprobado: el camino funciona y la cuota es la esperada. No se grabó nada (--comprobar).');
  } else {
    const grabado = await pagina.evaluate(() => window.terminar());
    const { webm, resumen } = ponerDuracion(Buffer.from(grabado.base64, 'base64'), grabado.ms);
    await mkdir(salida, { recursive: true });
    const rutaVideo = join(salida, NOMBRES.video);
    await writeFile(rutaVideo, webm);
    console.log(`Captura: ${JSON.stringify(ajustes)}`);
    console.log(`Video: ${(webm.length / 1048576).toFixed(2)} MB · ${JSON.stringify(resumen)}`);

    // Pósteres sacados del propio video: primer y último fotograma, a 1920×1080, en WebP.
    const visor = await ctx.newPage();
    await visor.setViewportSize({ width: 640, height: 360 });
    await writeFile(join(carpetaTemporal, 'visor.html'), '<!doctype html><meta charset="utf-8"><body style="margin:0;background:#000">');
    await visor.goto(pathToFileURL(join(carpetaTemporal, 'visor.html')).href);
    const fotogramas = await visor.evaluate(
      async ({ base64, ancho, alto }) => {
        // Como blob (mismo origen): un video file:// deja el canvas «contaminado» y no se puede exportar.
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const v = document.createElement('video');
        v.muted = true;
        v.preload = 'auto';
        v.src = URL.createObjectURL(new Blob([bytes], { type: 'video/webm' }));
        document.body.appendChild(v);
        await new Promise((r, x) => {
          v.onloadeddata = r;
          v.onerror = () => x(new Error('El video no carga'));
        });
        const c = document.createElement('canvas');
        c.width = ancho;
        c.height = alto;
        const g = c.getContext('2d');
        const en = async (t) => {
          await new Promise((r) => {
            v.onseeked = r;
            v.currentTime = t;
          });
          g.drawImage(v, 0, 0, ancho, alto);
          return c.toDataURL('image/webp', 0.92);
        };
        const inicio = await en(0);
        const final = await en(Math.max(0, v.duration - 0.1));
        return { inicio, final, duracion: v.duration, w: v.videoWidth, h: v.videoHeight };
      },
      { base64: webm.toString('base64'), ancho: ANCHO * ESCALA, alto: ALTO * ESCALA },
    );
    const guardar = async (nombre, dataUrl) => {
      const datos = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
      await writeFile(join(salida, nombre), datos);
      console.log(`  ${nombre}  (${Math.round(datos.length / 1024)} KB)`);
    };
    await guardar(NOMBRES.inicio, fotogramas.inicio);
    await guardar(NOMBRES.final, fotogramas.final);
    console.log(`  ${NOMBRES.video}  ${fotogramas.w}×${fotogramas.h}, ${fotogramas.duracion.toFixed(2)} s en Chrome`);
    // La ficha de la grabación va fuera de public/ para no acabar en dist/.
    const fichas = resolve(raiz, 'verificacion/lendex');
    await mkdir(fichas, { recursive: true });
    await writeFile(
      join(fichas, NOMBRES.ficha),
      JSON.stringify(
        {
          grabado: new Date().toISOString(),
          url: URL_CALCULADORA,
          cabeceras,
          valores: modoGuion ? { monto: 10000, tasa: 20, cuotas: 12 } : { monto: 50000, tasa: 5, cuotas: 12 },
          ...(preparado ? { abreSola: preparado.abreSola, tarjeta: preparado.tarjeta } : {}),
          cuota,
          total,
          captura: ajustes,
          video: resumen,
        },
        null,
        2,
      ),
    );
  }
  if (errores.length) console.log(`Errores de página: ${errores.join(' | ')}`);
  await ctx.close();
} catch (error) {
  console.error(error.message);
  codigoSalida = 1;
  if (pagina) {
    const fallo = resolve(raiz, 'verificacion/lendex/fallo.png');
    await mkdir(dirname(fallo), { recursive: true });
    await pagina.screenshot({ path: fallo }).catch(() => {});
    console.error(`Captura del momento del fallo: ${fallo}`);
  }
} finally {
  await navegador.close();
  await rm(carpetaTemporal, { recursive: true, force: true });
}
process.exitCode = codigoSalida;
