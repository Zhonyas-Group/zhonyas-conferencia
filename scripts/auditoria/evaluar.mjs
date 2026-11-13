/**
 * De lo medido en una pantalla (pantalla.mjs) a los hallazgos, regla por regla.
 * Corre en Node: aquí están las decisiones; el navegador solo mide.
 */
import {
  AVISO,
  CIFRA,
  EMOJI,
  EXCLAMACION,
  PATRONES,
  PREGUNTA,
  SUSPENSIVOS,
  UMBRAL,
  VINETA,
  aHex,
  cifrasDe,
  coloresEn,
  contarPalabras,
  esNeutro,
  gravedadDe,
  luminancia,
} from './reglas.mjs';

// ——— Utilidades ———

/** Separa por comas de primer nivel (las de dentro de rgba() no cuentan). */
export function partirCapas(valor) {
  const capas = [];
  let nivel = 0;
  let actual = '';
  for (const c of valor) {
    if (c === '(') nivel++;
    if (c === ')') nivel--;
    if (c === ',' && nivel === 0) {
      capas.push(actual.trim());
      actual = '';
    } else actual += c;
  }
  if (actual.trim()) capas.push(actual.trim());
  return capas;
}

const union = (cajas) => {
  const v = cajas.filter(Boolean);
  if (!v.length) return null;
  return { x0: Math.min(...v.map((c) => c.x0)), y0: Math.min(...v.map((c) => c.y0)), x1: Math.max(...v.map((c) => c.x1)), y1: Math.max(...v.map((c) => c.y1)) };
};
const corto = (t, n = 70) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
/** Une los nodos de texto tal como se leen (con sus propios espacios). */
const unir = (ts) =>
  ts
    .map((x) => x.crudo ?? ` ${x.texto} `)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
const redondo = (x) => Math.round(x * 10) / 10;
const primerColor = (valor) => coloresEn(valor ?? '')[0] ?? null;

/** Las excepciones escritas en data-auditar-excepcion («A-43, A-38: motivo; P0-10: otro»). */
export function excepcionPara(regla, excepciones = []) {
  for (const valor of excepciones) {
    for (const parte of valor.split(';')) {
      const [ids, ...resto] = parte.split(':');
      const lista = ids.match(/A-\d{2}|P0-\d+|§\d(?:\.\d)?/g) ?? [];
      if (lista.includes(regla)) return resto.join(':').trim() || '(sin motivo)';
    }
  }
  return null;
}

/** Tokens de color (#rrggbb, sin alfa), paradas de la firma y capas canónicas de los degradados permitidos. */
export function prepararTokens(hechos) {
  const colores = new Set();
  for (const valor of Object.values(hechos.tokens ?? {})) for (const c of coloresEn(valor)) colores.add(aHex(c));
  const paradas = [];
  const texto = hechos.tokens?.['--zh-firma-paradas'] ?? '';
  for (const parte of partirCapas(texto)) {
    const c = primerColor(parte);
    const o = /(\d*\.?\d+)%/.exec(parte.replace(c?.escrito ?? '', ''));
    if (c) paradas.push({ ...c, offset: o ? parseFloat(o[1]) / 100 : null });
  }
  return {
    colores,
    paradasFirma: paradas,
    capasFirma: new Set(partirCapas(hechos.canon?.firma ?? '')),
    capasEquipo: new Set(partirCapas(hechos.canon?.equipo ?? '')),
    leidos: Object.keys(hechos.tokens ?? {}).length,
  };
}

/** ¿Qué degradado es? 'firma', 'equipo' u 'otro' (null si no es un degradado). */
export function tipoDegradado(fondoImagen, tk) {
  if (!fondoImagen || !/gradient\(/.test(fondoImagen)) return null;
  const capas = partirCapas(fondoImagen).filter((c) => /gradient\(/.test(c));
  if (capas.every((c) => tk.capasFirma.has(c))) return 'firma';
  if (capas.every((c) => tk.capasEquipo.has(c))) return 'equipo';
  return 'otro';
}

export function paradasSonFirma(paradas, tk) {
  if (paradas.length !== tk.paradasFirma.length || !paradas.length) return false;
  return paradas.every((p, k) => {
    const f = tk.paradasFirma[k];
    const c = primerColor(p.color);
    return c && Math.abs(c.r - f.r) <= 1 && Math.abs(c.g - f.g) <= 1 && Math.abs(c.b - f.b) <= 1 && (f.offset === null || Math.abs(p.offset - f.offset) <= 0.006);
  });
}

/** Clasifica cada decoración con degradado: { j: 'firma' | 'equipo' | 'otro' }. */
export function clasificarDegradados(hechos, tk) {
  const mapa = {};
  for (const d of hechos.decoraciones) {
    const t = tipoDegradado(d.fondoImagen, tk);
    if (t) mapa[d.j] = t;
    if (d.gradienteSvg) {
      const g = hechos.gradientesSvg.find((x) => x.id === d.gradienteSvg);
      mapa[d.j] = g && paradasSonFirma(g.paradas, tk) ? 'firma' : 'otro';
    }
  }
  return mapa;
}

/** Color con el que se pinta un texto, con su alfa por la opacidad acumulada; null si no se sabe (relleno de degradado). */
export function colorDeTexto(t) {
  if (t.clipTexto) return null;
  const relleno = primerColor(t.relleno);
  const base = relleno && t.relleno !== t.color ? relleno : primerColor(t.color);
  if (!base || base.a === 0) return null;
  return [base.r, base.g, base.b, base.a * t.opacidad];
}

/** Sombras de box-shadow o drop-shadow: color y longitudes. */
function sombras(valor) {
  if (!valor || valor === 'none') return [];
  return partirCapas(valor).map((s) => {
    const c = primerColor(s);
    const resto = c ? s.replace(c.escrito, '') : s;
    const largos = [...resto.matchAll(/(-?\d*\.?\d+)px/g)].map((m) => parseFloat(m[1]));
    return { color: c, desenfoque: largos[2] ?? 0, extension: largos[3] ?? 0, texto: s };
  });
}
/** Un halo: una sombra de color, o clara, que se difumina o se extiende (A-43). Las sombras grises oscuras no lo son. */
const esHalo = (s) => s.color && s.color.a > 0.05 && (s.desenfoque > 0 || s.extension > 0) && (!esNeutro(s.color) || luminancia(s.color) > 0.4);

// ——— La pantalla ———

/**
 * @param {object} p
 * @param {any} p.hechos   lo de medirPantalla
 * @param {any[]} p.pixeles lo de analizarPixeles
 * @param {{ cruces: any[], debajo: any[] }} p.cruces lo de medirCruces
 * @param {Record<number,string>} p.degradados clasificarDegradados
 * @param {ReturnType<typeof prepararTokens>} p.tk
 * @param {{ preguntaAlPublico?: boolean }} p.ctx
 */
export function evaluarPantalla({ hechos, pixeles, cruces, degradados, tk, ctx = {} }) {
  const hallazgos = [];
  const tinta = (t) => pixeles[t.i]?.tinta ?? null;
  const textos = hechos.textos.filter((t) => tinta(t));
  const agregar = (h, excepciones = []) => {
    const motivo = excepcionPara(h.regla, excepciones);
    hallazgos.push({ gravedad: gravedadDe(h.regla), ...h, ...(motivo ? { excepcion: motivo } : {}) });
  };

  // Textos agrupados por elemento: un hallazgo por elemento, no por nodo de texto.
  const grupos = new Map();
  for (const t of textos) {
    const clave = t.elemento ?? `t${t.i}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(t);
  }
  const resumen = [...grupos.values()].map((ts) => ({
    ts,
    t: ts[0],
    texto: corto(unir(ts)),
    caja: union(ts.map(tinta)),
    excepciones: ts[0].excepciones,
  }));

  // A-48: tamaño mínimo.
  for (const g of resumen) {
    const minimo = g.t.lectura ? UMBRAL.lecturaMinima : UMBRAL.textoMinimo;
    if (g.t.tamEf < minimo - 0.05) {
      agregar(
        {
          regla: 'A-48',
          mensaje: `«${g.texto}» mide ${redondo(g.t.tamEf)} px${g.t.lectura ? ' y es de lectura' : ''}`,
          medida: `${redondo(g.t.tamEf)} px`,
          limite: `${minimo} px`,
          caja: g.caja,
          donde: g.t.donde,
        },
        g.excepciones,
      );
    }
  }
  for (const p of hechos.pseudoTextos) {
    if (p.tamEf < UMBRAL.textoMinimo - 0.05 && /[\p{L}\p{N}]/u.test(p.texto)) {
      agregar({ regla: 'A-48', mensaje: `«${corto(p.texto)}» (pseudoelemento) mide ${p.tamEf} px`, medida: `${p.tamEf} px`, limite: `${UMBRAL.textoMinimo} px`, caja: p.caja, donde: p.donde }, p.excepciones);
    }
  }

  // A-09: palabras por pantalla, sin las fuentes ni lo que va dentro de una consola (06 A-09 no
  // cuenta «el texto dentro de las capturas de producto»; la consola enseña pasos y commits de verdad, A-50).
  const contadas = textos.filter((t) => !t.fuente && !t.consola);
  const palabras = contadas.reduce((n, t) => n + contarPalabras(t.texto), 0);
  const enConsola = textos.filter((t) => t.consola).reduce((n, t) => n + contarPalabras(t.texto), 0);
  if (palabras > UMBRAL.palabrasMaximas) {
    agregar({
      regla: 'A-09',
      mensaje: `${palabras} palabras en pantalla (sin contar las fuentes${enConsola ? ` ni las ${enConsola} de la consola` : ''})`,
      medida: `${palabras}`,
      limite: `${UMBRAL.palabrasMaximas}`,
      caja: null,
    });
  }

  // A-69 (en la misma pantalla): la misma cifra dos veces. Las fuentes no cuentan.
  const cifras = [];
  for (const g of resumen) {
    if (g.t.fuente) continue;
    for (const valor of cifrasDe(unir(g.ts))) cifras.push({ valor, caja: g.caja, donde: g.t.donde, excepciones: g.excepciones });
  }
  const porValor = new Map();
  for (const c of cifras) {
    if (!porValor.has(c.valor)) porValor.set(c.valor, []);
    porValor.get(c.valor).push(c);
  }
  for (const [valor, lista] of porValor) {
    if (lista.length > 1) {
      agregar({ regla: 'A-69', mensaje: `«${valor}» sale ${lista.length} veces en esta pantalla`, medida: `${lista.length} veces`, limite: '1', caja: lista[1].caja, donde: lista[1].donde }, lista[1].excepciones);
    }
  }

  // A-36: contraste contra el fondo real (el peor píxel).
  for (const g of resumen) {
    const conDato = g.ts.filter((x) => pixeles[x.i]?.contraste !== undefined);
    if (!conDato.length) continue;
    const peor = conDato.reduce((a, b) => (pixeles[b.i].contraste < pixeles[a.i].contraste ? b : a));
    const px = pixeles[peor.i];
    const limite = g.t.tamEf < UMBRAL.textoGrande ? UMBRAL.contrasteTexto : UMBRAL.contrasteGrande;
    if (px.contraste < limite) {
      agregar(
        {
          regla: 'A-36',
          mensaje: `«${g.texto}» (${redondo(g.t.tamEf)} px, ${aHex({ r: px.colorTexto[0], g: px.colorTexto[1], b: px.colorTexto[2] })}${px.deTinta ? ', color medido en la tinta' : ''}) sobre ${aHex({ r: px.fondo[0], g: px.fondo[1], b: px.fondo[2] })}`,
          medida: `${px.contraste.toFixed(2).replace('.', ',')}:1`,
          limite: `${String(limite).replace('.', ',')}:1`,
          caja: g.caja,
          donde: g.t.donde,
        },
        g.excepciones,
      );
    }
  }

  // Patrones de texto de 06 §10, por bloque (párrafo, título…). Las fuentes no cuentan.
  const bloques = hechos.bloques
    .map((b, k) => ({ ...b, k, visibles: b.textos.map((i) => hechos.textos[i]).filter((t) => tinta(t)) }))
    .filter((b) => b.visibles.length);
  for (const b of bloques) {
    const texto = unir(b.visibles);
    const caja = union(b.visibles.map(tinta));
    const excepciones = b.visibles[0].excepciones;
    // Ni las fuentes (son títulos de documentos) ni la consola (comandos de verdad: «zhonyas explore --web») se redactan.
    const sinRedaccion = b.visibles.every((t) => t.fuente || t.consola);
    if (!sinRedaccion) {
      for (const { regla, re } of PATRONES) {
        re.lastIndex = 0;
        const hallados = [...texto.matchAll(re)].map((m) => m[0].trim());
        if (hallados.length) agregar({ regla, mensaje: `«${hallados.join('», «')}» en «${corto(texto)}»`, caja, donde: b.donde }, excepciones);
      }
    }
    const esTitulo = b.visibles.some((t) => t.titulo || t.tamEf >= UMBRAL.titular);
    if (esTitulo && PREGUNTA.test(texto)) {
      const h = { regla: 'A-05', mensaje: `título-pregunta: «${corto(texto)}»`, caja, donde: b.donde };
      if (ctx.preguntaAlPublico) agregar({ ...h, excepcion: 'las notas la marcan como «Pregunta al público» (06 A-05)' });
      else agregar(h, excepciones);
    }
    if (esTitulo && (EXCLAMACION.test(texto) || SUSPENSIVOS.test(texto))) agregar({ regla: 'A-19', mensaje: `título con «!» o «…»: «${corto(texto)}»`, caja, donde: b.donde }, excepciones);
    if (EMOJI.test(texto)) agregar({ regla: 'A-19', mensaje: `emoji en «${corto(texto)}»`, caja, donde: b.donde }, excepciones);
    if (!b.visibles.some((t) => t.consola) && VINETA.test(texto)) agregar({ regla: 'A-10', mensaje: `viñeta al empezar: «${corto(texto)}»`, caja, donde: b.donde }, excepciones);
  }
  for (const p of hechos.pseudoTextos) {
    if (EMOJI.test(p.texto)) agregar({ regla: 'A-19', mensaje: `emoji en un pseudoelemento: «${p.texto}»`, caja: p.caja, donde: p.donde }, p.excepciones);
    if (/^[•·▪◦‣⁃●○■□►▸➤*–—-]$/u.test(p.texto)) agregar({ regla: 'A-10', mensaje: `viñeta «${p.texto}» en un pseudoelemento`, caja: p.caja, donde: p.donde }, p.excepciones);
  }

  // Letra: familia (A-45), mono fuera de consola (A-50), pesos (§4.2), mayúsculas (A-31).
  const SANS = new Set(['arial', 'helvetica', 'liberation sans', 'arimo', 'sans-serif']);
  const MONO = new Set(['ui-monospace', 'sfmono-regular', 'consolas', 'monospace', 'menlo']);
  for (const g of resumen) {
    const familias = g.t.familia.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
    const ajenas = familias.filter((f) => !SANS.has(f) && !MONO.has(f));
    if (ajenas.length) agregar({ regla: 'A-45', mensaje: `«${g.texto}» en ${g.t.familia}`, medida: ajenas.join(', '), limite: 'Arial o la mono', caja: g.caja, donde: g.t.donde }, g.excepciones);
    else if (MONO.has(familias[0]) && !g.t.consola) agregar({ regla: 'A-50', mensaje: `«${g.texto}» en monoespaciada fuera de una consola`, medida: familias[0], caja: g.caja, donde: g.t.donde }, g.excepciones);
    if (!UMBRAL.pesos.includes(g.t.peso)) agregar({ regla: '§4.2', mensaje: `«${g.texto}» con peso ${g.t.peso}`, medida: `${g.t.peso}`, limite: '400 o 700', caja: g.caja, donde: g.t.donde }, g.excepciones);
    const letras = g.texto.match(/\p{L}/gu) ?? [];
    const enMayusculas = letras.length >= 4 && g.texto === g.texto.toLocaleUpperCase('es') && g.texto !== g.texto.toLocaleLowerCase('es');
    const palabrasLargas = (g.texto.match(/\p{L}{3,}/gu) ?? []).length;
    if (g.t.mayusculas) agregar({ regla: 'A-31', mensaje: `«${g.texto}» con text-transform: uppercase`, caja: g.caja, donde: g.t.donde }, g.excepciones);
    else if (enMayusculas && !g.t.consola && !g.t.dato && (palabrasLargas >= 2 || g.t.interletra > 0.05))
      agregar({ regla: 'A-31', mensaje: `«${g.texto}» escrito en mayúsculas`, caja: g.caja, donde: g.t.donde }, g.excepciones);
  }

  // A-49: tamaños y pesos distintos en la pantalla.
  const tamanos = [...new Set(textos.map((t) => Math.round(t.tamEf)))].sort((a, b) => b - a);
  if (tamanos.length > UMBRAL.tamanosMaximos) agregar({ regla: 'A-49', mensaje: `${tamanos.length} tamaños de letra: ${tamanos.join(', ')} px`, medida: `${tamanos.length}`, limite: `${UMBRAL.tamanosMaximos}`, caja: null });
  const pesos = [...new Set(textos.map((t) => t.peso))].sort();
  if (pesos.length > UMBRAL.pesosMaximos) agregar({ regla: 'A-49', mensaje: `${pesos.length} pesos de letra: ${pesos.join(', ')}`, medida: `${pesos.length}`, limite: `${UMBRAL.pesosMaximos}`, caja: null });

  // Elementos: color (A-34), listas (A-10), Lucide (A-61), degradados (A-38), halos (A-43), vidrio (A-44).
  const listas = hechos.elementos.filter((e) => e.lista);
  const contiene = (a, b) => a.x0 <= b.x0 + 0.5 && a.y0 <= b.y0 + 0.5 && a.x1 >= b.x1 - 0.5 && a.y1 >= b.y1 - 0.5;
  for (const e of hechos.elementos) {
    const ajenos = new Map();
    for (const { prop, valor } of e.colores) {
      const c = primerColor(valor);
      if (!c || c.a === 0) continue;
      const hex = aHex(c);
      if (!tk.colores.has(hex)) ajenos.set(hex, [...(ajenos.get(hex) ?? []), prop]);
    }
    for (const [hex, props] of ajenos) agregar({ regla: 'A-34', mensaje: `${hex} en ${props.join(', ')}`, medida: hex, limite: 'tokens de marca.css', caja: e.caja, donde: e.donde }, e.excepciones);

    if (e.lista) {
      const raiz = ['ul', 'ol', 'dl'].includes(e.etiqueta);
      const dentro = listas.some((o) => o !== e && ['ul', 'ol', 'dl'].includes(o.etiqueta) && contiene(o.caja, e.caja));
      if (raiz || !dentro) agregar({ regla: 'A-10', mensaje: `lista <${e.etiqueta}> en pantalla`, caja: e.caja, donde: e.donde }, e.excepciones);
    }
    if (e.lucide) agregar({ regla: 'A-61', mensaje: `icono de Lucide (${e.clases})`, caja: e.caja, donde: e.donde }, e.excepciones);

    const deg = tipoDegradado(e.fondoImagen, tk);
    if (deg === 'otro') agregar({ regla: 'A-38', mensaje: `degradado que no es el token: ${corto(e.fondoImagen, 110)}`, caja: e.caja, donde: e.donde }, e.excepciones);
    if (e.bordeImagen && /gradient\(/.test(e.bordeImagen)) agregar({ regla: 'A-38', mensaje: `borde con degradado: ${corto(e.bordeImagen, 110)}`, caja: e.caja, donde: e.donde }, e.excepciones);

    if (e.sombraTexto) agregar({ regla: 'A-43', mensaje: `text-shadow: ${corto(e.sombraTexto, 90)}`, caja: e.caja, donde: e.donde }, e.excepciones);
    const halos = sombras(e.sombraCaja).filter(esHalo);
    if (halos.length) agregar({ regla: 'A-43', mensaje: `box-shadow de color o claro: ${corto(halos.map((s) => s.texto).join(', '), 90)}`, caja: e.caja, donde: e.donde }, e.excepciones);
    if (e.filtro) {
      const gotas = [...e.filtro.matchAll(/drop-shadow\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)].map((m) => sombras(m[1])[0]).filter(Boolean);
      if (gotas.some(esHalo)) agregar({ regla: 'A-43', mensaje: `drop-shadow de color o claro: ${corto(e.filtro, 90)}`, caja: e.caja, donde: e.donde }, e.excepciones);
      const difuminado = /blur\((\d*\.?\d+)px\)/.exec(e.filtro);
      if (difuminado && parseFloat(difuminado[1]) >= 8 && e.tieneFondo) agregar({ regla: 'A-43', mensaje: `mancha difuminada (${difuminado[0]})`, caja: e.caja, donde: e.donde }, e.excepciones);
    }
    if (e.vidrio) agregar({ regla: 'A-44', mensaje: `backdrop-filter: ${e.vidrio}`, caja: e.caja, donde: e.donde }, e.excepciones);
  }
  // Degradados SVG que no son la firma.
  for (const d of hechos.decoraciones) {
    if (!d.gradienteSvg || degradados[d.j] !== 'otro') continue;
    const g = hechos.gradientesSvg.find((x) => x.id === d.gradienteSvg);
    const e = hechos.elementos[d.elemento];
    agregar(
      { regla: 'A-38', mensaje: `degradado SVG #${d.gradienteSvg} con paradas que no son --zh-firma-paradas (${g ? g.paradas.map((p) => `${p.color} ${Math.round(p.offset * 100)} %`).join(', ') : 'sin paradas'})`, caja: d.caja, donde: d.donde },
      e?.excepciones,
    );
  }

  // A-40: degradado detrás de texto (y texto relleno de degradado).
  const vistos = new Set();
  for (const { texto: i, deco: j } of cruces.debajo) {
    const t = hechos.textos[i];
    const tipo = degradados[j];
    if (!t || !tipo || (tipo === 'equipo' && t.tamEf >= UMBRAL.titular)) continue;
    const clave = `${t.elemento}|${j}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    const d = hechos.decoraciones[j];
    agregar(
      {
        regla: 'A-40',
        mensaje: `«${corto(t.texto)}» (${redondo(t.tamEf)} px) encima de ${tipo === 'firma' ? 'la firma' : tipo === 'equipo' ? 'el fondo del equipo (solo titulares de 96 px o más)' : 'un degradado'} (${d.donde})`,
        caja: tinta(t),
        donde: t.donde,
      },
      t.excepciones,
    );
  }
  for (const g of resumen) {
    if (g.t.clipTexto) agregar({ regla: 'A-40', mensaje: `«${g.texto}» relleno de degradado (background-clip: text)`, caja: g.caja, donde: g.t.donde }, g.excepciones);
  }

  // P0-10: decoraciones que cruzan un texto.
  const cruzados = new Set();
  for (const c of cruces.cruces) {
    const t = hechos.textos[c.texto];
    const d = hechos.decoraciones[c.deco];
    const clave = `${t.elemento}|${c.deco}`;
    if (cruzados.has(clave)) continue;
    cruzados.add(clave);
    const e = hechos.elementos[d.elemento];
    agregar(
      {
        regla: 'P0-10',
        mensaje: `${d.donde} (${d.tipo === 'svg' ? `forma SVG <${d.etiqueta}>${c.pixeles ? ', recortada: comprobado con píxeles' : ''}` : d.tipo === 'medio' ? `<${d.etiqueta}>` : d.aproximada ? 'pseudoelemento, caja aproximada' : 'caja con fondo o borde'}) toca la tinta de «${corto(t.texto)}»`,
        caja: c.zona,
        donde: t.donde,
      },
      [...(t.excepciones ?? []), ...(e?.excepciones ?? [])],
    );
  }

  // Lo medido de cada texto visible (va al .json: sirve para revisar un hallazgo o una duda).
  const medidas = resumen.map((g) => ({
    texto: g.texto,
    tamEf: redondo(g.t.tamEf),
    peso: g.t.peso,
    contraste: Math.min(...g.ts.map((x) => pixeles[x.i]?.contraste ?? Infinity)),
    fuente: g.t.fuente,
    donde: g.t.donde,
  }));
  return { hallazgos: agrupar(hallazgos), cifras, palabras, medidas };
}

/**
 * Junta los hallazgos iguales de una pantalla: misma regla, mismo sitio
 * (selector) y el mismo mensaje salvo colores, números y textos citados. Las
 * 16 capas del logo 3D con la misma sombra son un hallazgo, no 16.
 */
export function agrupar(lista) {
  const grupos = new Map();
  for (const h of lista) {
    const forma = h.mensaje.replace(/«[^»]*»/g, '«»').replace(/#[0-9a-f]{6}\b|\d+(?:[.,]\d+)?/gi, '·');
    const clave = h.donde ? [h.regla, h.gravedad, h.excepcion ?? '', h.donde, forma].join('|') : Symbol();
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(h);
  }
  return [...grupos.values()].map((g) => {
    if (g.length === 1) return g[0];
    const medidas = [...new Set(g.map((h) => h.medida).filter(Boolean))];
    return {
      ...g[0],
      mensaje: `${g[0].mensaje} — y ${g.length - 1} más igual${g.length > 2 ? 'es' : ''} en el mismo sitio`,
      medida: medidas.length > 5 ? `${medidas.slice(0, 5).join(', ')}… (${medidas.length})` : medidas.join(', ') || undefined,
      caja: union(g.map((h) => h.caja)),
      veces: g.length,
    };
  });
}

/** Un aviso sin regla de pantalla (carga, errores de la página). */
export const avisoMedida = (mensaje) => ({ regla: 'medida', gravedad: AVISO, mensaje, caja: null });

export { CIFRA };
