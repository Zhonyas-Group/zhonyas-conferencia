/**
 * El recorrido del auditor: abre el mazo (o el laboratorio) a 1920 × 1080 en
 * modo revisión, pasa por cada paso de cada diapositiva, mide, evalúa, anota
 * las capturas de lo que falla y junta la auditoría del código.
 *
 * Lo usan scripts/auditar.mjs (la línea de comandos) y scripts/probar-auditor.mjs.
 */
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { abrirNavegador } from '../navegador.mjs';
import { auditarCodigo } from './codigo.mjs';
import { avisoMedida, clasificarDegradados, colorDeTexto, evaluarPantalla, excepcionPara, prepararTokens } from './evaluar.mjs';
import { analizarPixeles, anotar, compararZonas, medirCruces, medirPantalla, ocultarDecoracion, ocultarTexto } from './pantalla.mjs';
import { AVISO, FALLO, UMBRAL } from './reglas.mjs';

const COLOR_MARCA = { [FALLO]: '#e5242b', [AVISO]: '#b86e00', excepcion: '#5b5b66' };

const conParametros = (url, parametros) => {
  const [base, hash = ''] = url.split('#');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}${new URLSearchParams(parametros)}${hash ? `#${hash}` : ''}`;
};

/** Diapositivas cuyas notas marcan una «Pregunta al público» (06 A-05): su título-pregunta es una excepción. */
async function preguntasAlPublico(raiz) {
  const ids = new Set();
  try {
    const carpeta = join(raiz, 'src', 'diapositivas');
    for (const nombre of await readdir(carpeta)) {
      if (!/\.tsx?$/.test(nombre)) continue;
      const texto = await readFile(join(carpeta, nombre), 'utf8');
      if (!/pregunta al público/i.test(texto)) continue;
      for (const m of texto.matchAll(/\bid:\s*['"]([\w-]+)['"]/g)) ids.add(m[1]);
    }
  } catch {
    /* sin carpeta */
  }
  return ids;
}

/**
 * @param {object} op
 * @param {string} op.raiz
 * @param {'mazo'|'lab'} op.modo
 * @param {string} [op.url]         index.html o lab.html (file:// o http://)
 * @param {string[]} [op.piezas]    en el laboratorio, solo estas piezas
 * @param {Array<number|string>} [op.diapositivas] en el mazo, solo estas (número desde 1 o id)
 * @param {boolean} [op.codigo]     auditar también src/
 * @param {boolean} [op.soloTrampasCodigo] auditar solo src/marca/auditor/ (la prueba del auditor)
 * @param {string} op.carpetaCapturas
 * @param {(texto: string) => void} [op.registrar]
 */
export async function auditar(op) {
  const registrar = op.registrar ?? (() => {});
  const resultado = {
    fecha: new Date(),
    modo: op.modo,
    url: op.url ?? null,
    navegador: null,
    pantallas: [],
    codigo: null,
    avisos: [],
    errores: [],
    tokens: 0,
  };
  if (op.codigo !== false) {
    registrar('Código de src/…');
    resultado.codigo = await auditarCodigo({ raiz: op.raiz, soloTrampas: !!op.soloTrampasCodigo });
  }
  if (!op.url) return resultado;

  await mkdir(op.carpetaCapturas, { recursive: true });
  for (const archivo of await readdir(op.carpetaCapturas)) if (archivo.endsWith('.jpg')) await rm(join(op.carpetaCapturas, archivo));

  const preguntas = op.modo === 'mazo' ? await preguntasAlPublico(op.raiz) : new Set();
  const navegador = await abrirNavegador();
  resultado.navegador = navegador.version();
  try {
    const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'es-DO' });
    const pagina = await ctx.newPage();
    const pix = await ctx.newPage();
    let erroresPantalla = [];
    pagina.on('pageerror', (e) => erroresPantalla.push(e.message));
    pagina.on('console', (m) => m.type() === 'error' && erroresPantalla.push(m.text()));

    // ——— Qué pantallas hay ———
    const lista = [];
    let ir;
    let selectorCapa;
    if (op.modo === 'mazo') {
      await pagina.goto(conParametros(op.url.split('#')[0], { revision: '1' }) + '#/1/0');
      await pagina.waitForFunction(() => window.__motor, null, { timeout: 30000 });
      const diapositivas = await pagina.evaluate(() => window.__motor.diapositivas());
      for (const d of diapositivas) {
        if (op.diapositivas?.length && !op.diapositivas.some((x) => String(x) === String(d.n) || x === d.id)) continue;
        for (let paso = 0; paso <= d.pasos; paso++) {
          lista.push({
            clave: `${d.n} · ${d.id} · paso ${paso}`,
            archivo: `${String(d.n).padStart(2, '0')}-${d.id}-p${paso}.jpg`,
            n: d.n,
            id: d.id,
            titulo: d.titulo,
            paso,
            pasos: d.pasos,
            diapositiva: d.id,
            etiqueta: `la diapositiva ${d.n} (${d.id})`,
          });
        }
      }
      ir = async (p) => {
        await pagina.evaluate(([n, paso]) => window.__motor.ir(n, paso), [p.n, p.paso]);
        return pagina.evaluate(() => window.__motor.esperar(10000));
      };
      selectorCapa = '.sala .capa[data-rol="actual"]';
    } else {
      await pagina.goto(conParametros(op.url, { revision: '1', hud: '0' }));
      await pagina.waitForFunction(() => window.__lab, null, { timeout: 30000 });
      const piezas = await pagina.evaluate(() => window.__lab.piezas());
      const elegidas = op.piezas?.length
        ? piezas.filter((p) => op.piezas.includes(p.id))
        : piezas.filter((p) => p.archivo?.startsWith('/src/marca/') && p.id !== 'auditor');
      for (const falta of op.piezas?.filter((id) => !piezas.some((p) => p.id === id)) ?? []) {
        resultado.avisos.push(avisoMedida(`No hay ninguna pieza «${falta}» en el laboratorio (src/marca/**/${falta}.lab.tsx).`));
        resultado.errores.push(`pieza «${falta}» no encontrada`);
      }
      for (const p of elegidas) {
        if (p.error) {
          resultado.pantallas.push({ clave: `${p.id}`, id: p.id, paso: 0, hallazgos: [{ regla: 'medida', gravedad: FALLO, mensaje: `la pieza no carga: ${p.error}`, caja: null }], palabras: 0 });
          continue;
        }
        let posicion = 0;
        for (const e of p.escenas) {
          for (let paso = 0; paso <= Math.max(0, e.pasos); paso++) {
            lista.push({
              clave: `${p.id} · ${e.id} · paso ${paso}`,
              archivo: `${p.id}-${e.id}-p${paso}.jpg`,
              pieza: p.id,
              id: e.id,
              titulo: p.titulo,
              posicion: posicion++,
              paso,
              pasos: e.pasos,
              diapositiva: `${p.id}/${e.id}`,
              etiqueta: `la escena «${e.id}» de «${p.id}»`,
            });
          }
        }
      }
      ir = async (p) => {
        await pagina.evaluate(([id, pos]) => window.__lab.ir(id, pos), [p.pieza, p.posicion]);
        await pagina.evaluate(() => window.__lab.esperar());
        return true;
      };
      selectorCapa = '.lab-pieza .capa[data-rol="actual"]';
    }

    // ——— Cada pantalla ———
    let tk = null;
    const cifrasVistas = new Map();
    const repetidasAvisadas = new Set();
    for (const p of lista) {
      erroresPantalla = [];
      registrar(`  ${p.clave}`);
      const pantalla = { ...p, hallazgos: [], palabras: 0, captura: null };
      resultado.pantallas.push(pantalla);
      let listo = false;
      try {
        listo = await ir(p);
      } catch (error) {
        pantalla.hallazgos.push({ regla: 'medida', gravedad: FALLO, mensaje: `no se pudo ir a esta pantalla: ${error.message}`, caja: null });
        continue;
      }
      if (listo === false) pantalla.hallazgos.push(avisoMedida('no terminó de cargar a tiempo (fuentes, imágenes, video o WebGL): se midió como estaba'));
      const hechos = await pagina.evaluate(medirPantalla, { selectorCapa, opacidadVisible: UMBRAL.opacidadVisible });
      if (!hechos.ok) {
        pantalla.hallazgos.push({ regla: 'medida', gravedad: FALLO, mensaje: hechos.error, caja: null });
        continue;
      }
      if (!tk) {
        tk = prepararTokens(hechos);
        resultado.tokens = tk.leidos;
        if (!tk.leidos) resultado.avisos.push(avisoMedida('No se leyó ningún token --zh-* del CSS de la página: ¿falta marca.css? Todos los colores saldrán como ajenos.'));
      }
      const conTexto = await pagina.screenshot({ type: 'png' });
      await pagina.evaluate(ocultarTexto, true);
      const sinTexto = await pagina.screenshot({ type: 'png' });
      await pagina.evaluate(ocultarTexto, false);
      const items = hechos.textos.map((t) => {
        const rgba = colorDeTexto(t);
        return { i: t.i, rects: t.rects, rgba, tinta: t.filtro || !rgba };
      });
      const pixeles = await pix.evaluate(analizarPixeles, { a: conTexto.toString('base64'), b: sinTexto.toString('base64'), difTinta: UMBRAL.difTinta, items });
      const degradados = clasificarDegradados(hechos, tk);
      const cruces = await pagina.evaluate(medirCruces, {
        tintas: pixeles.map((x) => x.tinta),
        cajas: hechos.decoraciones.map((d) => d.caja),
        degradados,
      });
      // Formas SVG recortadas o enmascaradas: se ocultan una a una y se mira si cambia algo bajo la tinta.
      if (cruces.dudosos.length) {
        await pagina.evaluate(ocultarTexto, true);
        const porDeco = new Map();
        for (const d of cruces.dudosos) porDeco.set(d.deco, [...(porDeco.get(d.deco) ?? []), d]);
        for (const [j, lista] of porDeco) {
          await pagina.evaluate(ocultarDecoracion, { j, ocultar: true });
          const sinDeco = await pagina.screenshot({ type: 'png' });
          await pagina.evaluate(ocultarDecoracion, { j, ocultar: false });
          const fracciones = await pix.evaluate(compararZonas, {
            a: sinTexto.toString('base64'),
            b: sinDeco.toString('base64'),
            difTinta: UMBRAL.difTinta,
            zonas: lista.map((d) => d.tinta),
          });
          lista.forEach((d, k) => {
            const f = fracciones[k];
            if (!f) return; // no pinta nada bajo la tinta
            if (degradados[j]) cruces.debajo.push({ texto: d.texto, deco: j });
            if (f < 0.98) cruces.cruces.push({ texto: d.texto, deco: j, zona: d.zona, pixeles: true });
          });
        }
        await pagina.evaluate(ocultarTexto, false);
      }
      const { hallazgos, cifras, palabras, medidas } = evaluarPantalla({
        hechos,
        pixeles,
        cruces,
        degradados,
        tk,
        ctx: { preguntaAlPublico: preguntas.has(p.diapositiva) },
      });
      pantalla.palabras = palabras;
      pantalla.medidas = medidas;
      pantalla.hallazgos.push(...hallazgos);

      // A-69 entre diapositivas: la segunda vez que sale una cifra, en otra diapositiva.
      const enEsta = new Set();
      for (const c of cifras) {
        if (enEsta.has(c.valor)) continue;
        enEsta.add(c.valor);
        const previa = cifrasVistas.get(c.valor);
        if (!previa) cifrasVistas.set(c.valor, p);
        else if (previa.diapositiva !== p.diapositiva && !repetidasAvisadas.has(`${p.diapositiva}|${c.valor}`)) {
          repetidasAvisadas.add(`${p.diapositiva}|${c.valor}`);
          const motivo = excepcionPara('A-69', c.excepciones);
          pantalla.hallazgos.push({
            regla: 'A-69',
            gravedad: FALLO,
            mensaje: `«${c.valor}» ya salió en ${previa.etiqueta}, paso ${previa.paso}`,
            caja: c.caja,
            donde: c.donde,
            ...(motivo ? { excepcion: motivo } : {}),
          });
        }
      }
      if (erroresPantalla.length) pantalla.hallazgos.push(avisoMedida(`errores en la página: ${erroresPantalla.slice(0, 3).join(' · ')}`));

      // Captura anotada: cada hallazgo con su número.
      if (pantalla.hallazgos.length) {
        pantalla.hallazgos.forEach((h, k) => (h.n = k + 1));
        const marcas = pantalla.hallazgos.map((h) => ({
          n: h.n,
          regla: h.regla,
          caja: h.caja,
          color: h.excepcion ? COLOR_MARCA.excepcion : COLOR_MARCA[h.gravedad] ?? COLOR_MARCA[FALLO],
        }));
        const jpg = await pix.evaluate(anotar, { imagen: conTexto.toString('base64'), marcas, calidad: 0.86 });
        const ruta = resolve(op.carpetaCapturas, p.archivo);
        await writeFile(ruta, Buffer.from(jpg, 'base64'));
        pantalla.captura = ruta;
      }
    }

    // A-09: la media del mazo (aviso). Por diapositiva cuenta su pantalla con más palabras.
    const porDiapositiva = new Map();
    for (const p of resultado.pantallas) porDiapositiva.set(p.diapositiva, Math.max(porDiapositiva.get(p.diapositiva) ?? 0, p.palabras ?? 0));
    if (porDiapositiva.size) {
      const media = [...porDiapositiva.values()].reduce((a, b) => a + b, 0) / porDiapositiva.size;
      resultado.mediaPalabras = Math.round(media * 10) / 10;
      if (media > UMBRAL.palabrasMedia) {
        resultado.avisos.push({
          regla: 'A-09',
          gravedad: AVISO,
          mensaje: `la media es de ${resultado.mediaPalabras.toLocaleString('es')} palabras por diapositiva (06 A-09 pide 12 o menos en todo el mazo)`,
        });
      }
    }
  } finally {
    await navegador.close();
  }
  return resultado;
}

/** Cuenta lo que hace fallar la auditoría. */
export function contar(resultado) {
  const todos = [
    ...resultado.pantallas.flatMap((p) => p.hallazgos.map((h) => ({ ...h, pantalla: p }))),
    ...(resultado.codigo?.hallazgos ?? []),
    ...resultado.avisos,
  ];
  const fallos = todos.filter((h) => h.gravedad === FALLO && !h.excepcion);
  const avisos = todos.filter((h) => h.gravedad === AVISO && !h.excepcion);
  const excepciones = todos.filter((h) => h.excepcion);
  return { todos, fallos, avisos, excepciones };
}
