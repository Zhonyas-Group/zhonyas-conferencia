/**
 * Pone la duración a un WebM de MediaRecorder (le falta en Info). Copiado de
 * scripts/lendex-grabar-demo.mjs (leerVint, tamanoVint, analizarWebm, ponerDuracion).
 */
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
export function ponerDuracion(buf, grabadoMs) {
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
