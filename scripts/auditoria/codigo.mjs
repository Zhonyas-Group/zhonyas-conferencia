/**
 * Auditoría del código de src/ (sin navegador): lo que se ve leyendo, no en pantalla.
 *
 *   A-55  cubic-bezier, steps(), curvas y duraciones sin comentario de fuente
 *   A-34  colores (hex, rgb/rgba) que no son de los tokens de marca.css
 *   A-38  degradados escritos a mano (fuera de los tokens --zh-*)
 *   A-45  font-family o @font-face que no son Arial o la mono del sistema
 *   A-61  «lucide» en el código o en las dependencias
 *
 * Ámbitos (ambitoDe): el MAZO (src/diapositivas, src/marca) cumple todo; los
 * TOKENS (src/estilos/marca.css) pueden escribir colores y degradados solo en
 * sus --zh-*; la LETRA del motor (base.css, fuentes.css) solo se revisa en
 * A-45; el MOTOR (src/motor, motor.css, prueba-sala.css…) es la interfaz del
 * presentador y del laboratorio: sus movimientos sin fuente salen como AVISO
 * (no los ve el público como parte de la charla; lo que el motor pinte dentro
 * de una diapositiva ya lo mide la auditoría de pantallas). La TRAMPA del
 * propio auditor (src/marca/auditor/) queda fuera; la revisa probar-auditor.mjs.
 */
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { AVISO, EXCEPCION_CODIGO, FALLO, REFERENCIA, aHex, coloresEn } from './reglas.mjs';

export const CARPETA_TRAMPAS = 'src/marca/auditor/';

export function ambitoDe(rel) {
  if (rel.startsWith(CARPETA_TRAMPAS)) return 'trampa';
  if (rel.startsWith('src/diapositivas/') || rel.startsWith('src/marca/')) return 'mazo';
  if (rel === 'src/estilos/marca.css') return 'tokens';
  if (rel === 'src/estilos/base.css' || rel === 'src/estilos/fuentes.css') return 'letra';
  return 'motor';
}

/**
 * Separa código y comentarios, línea a línea, sin cambiar la numeración.
 * Las cadenas se quedan en el código (un cubic-bezier o un color dentro de una
 * cadena cuenta). Para TS/TSX entiende //, /* *\/, cadenas y plantillas con ${…}.
 */
export function separar(fuente, css) {
  let estado = 'codigo';
  const lineas = [{ codigo: '', comentario: '', hay: false }];
  const poner = (c, campo) => {
    if (c === '\n') lineas.push({ codigo: '', comentario: '', hay: estado === 'bloque' });
    else {
      lineas[lineas.length - 1][campo] += c;
      if (campo === 'comentario') lineas[lineas.length - 1].hay = true;
    }
  };
  // La línea tiene comentario aunque solo sea el cierre de un bloque: así un /** … */ sigue unido a su código.
  const marcar = () => (lineas[lineas.length - 1].hay = true);
  let comilla = '';
  const plantillas = []; // profundidad de llaves dentro de cada ${…}
  for (let i = 0; i < fuente.length; i++) {
    const c = fuente[i];
    const d = fuente[i + 1];
    if (c === '\r') continue;
    if (estado === 'codigo') {
      if (c === '/' && d === '*') {
        estado = 'bloque';
        marcar();
        i++;
        continue;
      }
      if (!css && c === '/' && d === '/') {
        estado = 'linea';
        marcar();
        i++;
        continue;
      }
      if (c === '"' || c === "'" || (!css && c === '`')) {
        estado = c === '`' ? 'plantilla' : 'cadena';
        comilla = c;
        poner(c, 'codigo');
        continue;
      }
      if (!css && plantillas.length) {
        if (c === '{') plantillas[plantillas.length - 1]++;
        if (c === '}') {
          if (plantillas[plantillas.length - 1] === 0) {
            plantillas.pop();
            estado = 'plantilla';
            poner(c, 'codigo');
            continue;
          }
          plantillas[plantillas.length - 1]--;
        }
      }
      poner(c, 'codigo');
    } else if (estado === 'bloque') {
      if (c === '*' && d === '/') {
        estado = 'codigo';
        marcar();
        i++;
        continue;
      }
      poner(c, 'comentario');
    } else if (estado === 'linea') {
      if (c === '\n') {
        estado = 'codigo';
        poner(c, 'codigo');
        continue;
      }
      poner(c, 'comentario');
    } else if (estado === 'cadena') {
      poner(c, 'codigo');
      if (c === '\\' && d !== undefined && d !== '\n') {
        poner(d, 'codigo');
        i++;
      } else if (c === comilla || c === '\n') estado = 'codigo';
    } else if (estado === 'plantilla') {
      if (c === '\\' && d !== undefined) {
        poner(c, 'codigo');
        poner(d, 'codigo');
        i++;
        continue;
      }
      if (c === '$' && d === '{') {
        poner(c, 'codigo');
        poner(d, 'codigo');
        i++;
        plantillas.push(0);
        estado = 'codigo';
        continue;
      }
      poner(c, 'codigo');
      if (c === '`') estado = 'codigo';
    }
  }
  return lineas;
}

/**
 * CSS: cada línea en trozos { prop, texto }, siguiendo la declaración aunque
 * su valor ocupe varias líneas. `prop` es null en los selectores.
 */
function trozosCss(lineas) {
  let prop = null;
  return lineas.map(({ codigo }) => {
    const trozos = [];
    const partes = codigo.split(/([;{}])/);
    for (let k = 0; k < partes.length; k += 2) {
      const texto = partes[k] ?? '';
      const borde = partes[k + 1];
      if (borde === '{') {
        prop = null;
        continue; // selector o regla @: no se revisa
      }
      const decl = /^\s*(--[\w-]+|-?[a-z][\w-]*)\s*:(?!:)/i.exec(texto);
      if (decl) prop = decl[1].toLowerCase();
      if (texto.trim()) trozos.push({ prop, texto: decl ? texto.slice(decl[0].length) : texto });
      if (borde === ';' || borde === '}') prop = null;
    }
    return trozos;
  });
}

// ——— A-55 ———

const MOVIMIENTO_CSS = new Set([
  'transition',
  'transition-duration',
  'transition-delay',
  'transition-timing-function',
  'animation',
  'animation-duration',
  'animation-delay',
  'animation-timing-function',
]);
const CURVA = /cubic-bezier\(|steps\(\s*\d/i;
const PALABRA_CURVA = /(?<![\w-])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-])/i;
const TIEMPO = /(?<![\w.-])(\d*\.?\d+)(ms|s)(?![\w-])/gi;
const tiempoPositivo = (texto) => [...texto.matchAll(TIEMPO)].some((m) => parseFloat(m[1]) > 0);
const NUMERO = /(?<![\w.$#-])(\d*\.?\d+)(?![\w.])/g;
const numeroPositivo = (texto) => [...texto.matchAll(NUMERO)].some((m) => parseFloat(m[1]) > 0);

const CLAVES_TS =
  /(?<![\w$.])(duration|delay|endDelay|stagger|easing|ease|repeatDelay|transitionDuration|transitionDelay|animationDuration|animationDelay|transitionTimingFunction|animationTimingFunction)\s*:\s*([^,}\n]*)/g;
const CADENA_MOVIMIENTO_TS = /(?<![\w$.-])(transition|animation)\s*:\s*(['"`])([^'"`]*)\2/g;
const CONSTANTE_TS = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(-?\d*\.?\d+|\[)/g;
/** Una constante con nombre de curva se revisa siempre; una de tiempo (OPEN_MS), solo si se usa como duración o retraso. */
const NOMBRE_CURVA = /(^|_)(EASE|EASING|CURVA|BEZIER)(_|$)|(Ease|Easing|Curva|Bezier)$|^(curva|ease|easing)$/;
const CADENA = /(['"`])((?:\\.|(?!\1).)*)\1/g;
/** Palabras de un valor de CSS: una cadena con tres o más palabras que no son de estas es una frase (una nota, una fuente). */
const VOCABULARIO_CSS = new Set(
  'opacity transform filter clip path cubic bezier steps ease linear start end both forwards backwards infinite alternate reverse normal none all color background translate translatex translatey scale rotate rotatex rotatey visibility width height top left right bottom inset jump var salida entrada power expo sine quad cubic quart quint circ back elastic bounce out inout'.split(
    ' ',
  ),
);
const esFrase = (cadena) => (cadena.match(/\p{L}{3,}/gu) ?? []).filter((p) => !VOCABULARIO_CSS.has(p.toLowerCase())).length >= 3;
/** El código de la línea sin las cadenas que son frases: «'Paso 1: fundido de 300 ms, cubic-bezier(…)'» no es un valor. */
const sinFrases = (codigo) => codigo.replace(CADENA, (todo, q, dentro) => (esFrase(dentro) ? `${q}${q}` : todo));

function movimientoCss(trozos) {
  const motivos = [];
  for (const { prop, texto } of trozos) {
    if (CURVA.test(texto)) motivos.push('curva');
    else if (prop && MOVIMIENTO_CSS.has(prop) && (tiempoPositivo(texto) || PALABRA_CURVA.test(texto))) motivos.push(prop);
  }
  return motivos;
}

/** Identificadores que un archivo usa como valor de una duración, un retraso o una curva. */
function usadosEnMovimiento(lineas) {
  const usados = new Set();
  for (const { codigo } of lineas) {
    for (const m of codigo.matchAll(CLAVES_TS)) for (const id of m[2].matchAll(/(?<![\w$.'"`])([A-Za-z_$][\w$]*)/g)) usados.add(id[1]);
    for (const m of codigo.matchAll(/(?<![\w$.])duracion\(\s*([A-Za-z_$][\w$]*)/g)) usados.add(m[1]);
    for (const m of codigo.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}\s*m?s\b/g)) usados.add(m[1]);
  }
  return usados;
}

function movimientoTs(codigoOriginal, usados) {
  const codigo = sinFrases(codigoOriginal);
  const motivos = [];
  if (CURVA.test(codigo)) motivos.push('curva');
  for (const m of codigo.matchAll(CLAVES_TS)) {
    const valor = m[2].trim();
    if (/['"`[]/.test(valor) || numeroPositivo(valor)) motivos.push(m[1]);
  }
  for (const m of codigo.matchAll(CADENA_MOVIMIENTO_TS)) if (tiempoPositivo(m[3]) || PALABRA_CURVA.test(m[3])) motivos.push(m[1]);
  if (/(?<![\w$.])duracion\(\s*\d/.test(codigo)) motivos.push('duracion()');
  for (const m of codigo.matchAll(CONSTANTE_TS)) {
    const valor = m[2] === '[' || parseFloat(m[2]) > 0;
    if (valor && (NOMBRE_CURVA.test(m[1]) || usados.has(m[1]))) motivos.push(m[1]);
  }
  return [...new Set(motivos)];
}

/**
 * Los comentarios que cuentan como fuente de la línea k: el suyo, el bloque de
 * comentarios de justo encima y los de las otras líneas de la misma
 * declaración (el mismo objeto de opciones o la misma regla CSS) que no son
 * valores de movimiento con su propia fuente, más el bloque que la encabeza.
 */
function comentariosDe(lineas, k, conMovimiento, css) {
  const lista = [lineas[k].comentario];
  const bloqueEncima = (desde) => {
    for (let j = desde; j >= 0 && !lineas[j].codigo.trim() && lineas[j].hay; j--) lista.push(lineas[j].comentario);
  };
  bloqueEncima(k - 1);
  // La misma declaración: hacia arriba hasta su principio (o 12 líneas).
  let j = k - 1;
  for (; j >= 0 && k - j <= 12; j--) {
    const c = lineas[j].codigo.trim();
    if (!c && !lineas[j].hay) return lista; // línea en blanco: otra cosa
    if (css ? /[}]/.test(c) : /;\s*$/.test(c)) return lista; // termina la anterior
    if (c && !conMovimiento?.[j]) lista.push(lineas[j].comentario);
    if (css && /\{\s*$/.test(c)) {
      // El selector de la regla, con las demás líneas de su lista («.a,» «.b {»).
      while (j > 0 && /,\s*$/.test(lineas[j - 1].codigo.trim())) j--;
      break;
    }
  }
  bloqueEncima(j - 1);
  return lista;
}

/** Excepciones escritas en el código: en la línea, justo encima, o entre «auditar-excepcion-inicio: …» y «auditar-excepcion-fin». */
function excepcionesDelArchivo(lineas) {
  const rangos = [];
  let abierto = null;
  lineas.forEach(({ comentario }, k) => {
    const inicio = /auditar-excepcion-inicio:\s*((?:A-\d{2}|P0-\d+|§\d(?:\.\d)?)(?:\s*,\s*(?:A-\d{2}|P0-\d+|§\d(?:\.\d)?))*)\s*[:—–-]?\s*(.*)/u.exec(comentario);
    if (inicio) abierto = { desde: k, reglas: inicio[1].split(/\s*,\s*/), motivo: inicio[2].trim() || '(sin motivo)' };
    if (/auditar-excepcion-fin/.test(comentario) && abierto) {
      rangos.push({ ...abierto, hasta: k });
      abierto = null;
    }
  });
  if (abierto) rangos.push({ ...abierto, hasta: lineas.length - 1 });
  return rangos;
}

function excepcionDe(lineas, k, regla, rangos) {
  for (const r of rangos) if (k >= r.desde && k <= r.hasta && r.reglas.includes(regla)) return r.motivo;
  const comentarios = [lineas[k].comentario];
  for (let j = k - 1; j >= 0 && !lineas[j].codigo.trim() && lineas[j].hay; j--) comentarios.push(lineas[j].comentario);
  for (const c of comentarios) {
    const m = EXCEPCION_CODIGO.exec(c);
    if (m && m[1].split(/\s*,\s*/).includes(regla)) return m[2].trim() || '(sin motivo)';
  }
  return null;
}

// ——— A-34 y A-38: dónde un color no es un color pintado ———

/** Declaraciones CSS cuyo color no se pinta como tal: máscaras (solo alfa) y sombras (las juzga A-43 en pantalla). */
const PROP_SIN_COLOR = /^(-webkit-)?mask(-image|-border)?$|^(box|text)-shadow$|^filter$/;
/** En TS/TSX, lo mismo: dentro de <mask>, <filter> o <clipPath>, y en sombras o colores de filtro. */
const LINEA_SIN_COLOR = /flood-?color|lighting-?color|drop-shadow|box-?shadow|text-?shadow|maskImage|WebkitMask/i;
function bloquesSinColor(lineas) {
  const dentro = [];
  let nivel = 0;
  for (const { codigo } of lineas) {
    const abre = (codigo.match(/<(mask|filter|clipPath)\b(?![^>]*\/>)/g) ?? []).length;
    const cierra = (codigo.match(/<\/(mask|filter|clipPath)>/g) ?? []).length;
    dentro.push(nivel > 0 || abre > 0);
    nivel = Math.max(0, nivel + abre - cierra);
  }
  return dentro;
}

// ——— A-45 ———

const LETRAS = new Set(['arial', 'helvetica', 'liberation sans', 'arimo', 'sans-serif', 'ui-monospace', 'sfmono-regular', 'consolas', 'monospace']);
const VARIABLES_LETRA = /^var\(--(zh-sans|zh-mono|fuente-titulo|fuente-texto|fuente-mono)\)$/;
const GLOBALES = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer']);

export function familiasAjenas(lista) {
  return lista
    .split(',')
    .map((f) => f.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
    .filter((f) => !LETRAS.has(f.toLowerCase()) && !VARIABLES_LETRA.test(f) && !GLOBALES.has(f.toLowerCase()));
}

const TAMANO_FONT =
  /(?:^|\s)(?:\d*\.?\d+(?:px|r?em|%|pt|vh|vw|vmin|vmax|ch|ex|cap|lh)|xx-small|x-small|small|medium|large|x-large|xx-large|smaller|larger|calc\([^)]*\)|var\([^)]*\))(?:\s*\/\s*\S+)?\s+(.+)$/i;

function familiaDeFont(valor) {
  const v = valor.trim().replace(/\s*!important\s*$/, '');
  if (GLOBALES.has(v.toLowerCase())) return null;
  const m = TAMANO_FONT.exec(v);
  return m ? m[1] : null;
}

// ——— Recorrido ———

async function archivos(raiz, carpeta, lista = []) {
  for (const e of await readdir(join(raiz, carpeta), { withFileTypes: true })) {
    const rel = `${carpeta}/${e.name}`;
    if (e.isDirectory()) {
      if (e.name !== 'node_modules') await archivos(raiz, rel, lista);
    } else if (['.css', '.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(e.name))) lista.push(rel);
  }
  return lista;
}

/** Los colores de los tokens de marca.css (solo los de sus --zh-*), como #rrggbb. */
export async function coloresDeTokens(raiz) {
  const fuente = await readFile(join(raiz, 'src/estilos/marca.css'), 'utf8');
  const lineas = separar(fuente, true);
  const trozos = trozosCss(lineas);
  const set = new Set();
  trozos.flat().forEach(({ prop, texto }) => {
    if (prop?.startsWith('--zh-')) for (const c of coloresEn(texto)) set.add(aHex(c));
  });
  return set;
}

/**
 * @param {{ raiz: string, soloTrampas?: boolean }} op
 * @returns {Promise<{ hallazgos: any[], archivos: Record<string, number>, fuera: string[] }>}
 */
export async function auditarCodigo({ raiz, soloTrampas = false }) {
  const tokens = await coloresDeTokens(raiz);
  const hallazgos = [];
  const cuenta = { mazo: 0, tokens: 0, letra: 0, motor: 0, trampa: 0 };
  const fuera = [];
  const lista = await archivos(raiz, 'src');
  for (const rel of lista.sort()) {
    const ambito = ambitoDe(rel);
    if (soloTrampas ? ambito !== 'trampa' : ambito === 'trampa') {
      if (!soloTrampas && !fuera.includes(CARPETA_TRAMPAS)) fuera.push(CARPETA_TRAMPAS);
      continue;
    }
    cuenta[ambito]++;
    const css = rel.endsWith('.css');
    const fuente = await readFile(join(raiz, rel), 'utf8');
    const lineas = separar(fuente, css);
    const trozos = css ? trozosCss(lineas) : null;
    const deMazo = ambito === 'mazo' || ambito === 'trampa';
    const rangos = excepcionesDelArchivo(lineas);
    const usados = css ? null : usadosEnMovimiento(lineas);
    const movimiento = lineas.map((l, k) => (!l.codigo.trim() ? [] : css ? movimientoCss(trozos[k]) : movimientoTs(l.codigo, usados)));
    const conMovimiento = movimiento.map((m) => m.length > 0);
    const sinColor = css ? null : bloquesSinColor(lineas);
    const anotar = (k, regla, mensaje, gravedad = FALLO) => {
      const motivo = excepcionDe(lineas, k, regla, rangos);
      hallazgos.push({
        regla,
        gravedad,
        archivo: rel,
        linea: k + 1,
        ambito,
        mensaje,
        codigo: (lineas[k].codigo + (lineas[k].comentario ? ` /* ${lineas[k].comentario.trim()} */` : '')).trim().slice(0, 160),
        ...(motivo ? { excepcion: motivo } : {}),
      });
    };

    lineas.forEach((linea, k) => {
      const codigo = linea.codigo;
      if (!codigo.trim()) return;

      // A-55: movimiento sin fuente.
      const motivos = movimiento[k];
      if (motivos.length && !comentariosDe(lineas, k, conMovimiento, css).some((c) => REFERENCIA.test(c))) {
        anotar(
          k,
          'A-55',
          `${motivos.join(', ')} sin comentario de fuente (archivo:línea, M-n o Z-nn) en la línea, justo encima o en su declaración`,
          ambito === 'motor' || ambito === 'letra' ? AVISO : FALLO,
        );
      }

      // A-61: Lucide, en cualquier sitio.
      if (/lucide/i.test(codigo)) anotar(k, 'A-61', '«lucide» en el código');

      // A-34 y A-38: colores y degradados del mazo (los tokens, solo en sus --zh-*).
      if ((deMazo || ambito === 'tokens') && !(sinColor?.[k] || (!css && LINEA_SIN_COLOR.test(codigo)))) {
        const textos = css
          ? trozos[k].filter((t) => !(ambito === 'tokens' && t.prop?.startsWith('--zh-')) && !PROP_SIN_COLOR.test(t.prop ?? '')).map((t) => t.texto)
          : [codigo];
        for (const t of textos) {
          const ajenos = coloresEn(t).filter((c) => !tokens.has(aHex(c)));
          if (ajenos.length) anotar(k, 'A-34', `color fuera de los tokens: ${ajenos.map((c) => `${c.escrito} (${aHex(c)})`).join(', ')}`);
          if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(t)) anotar(k, 'A-38', 'degradado escrito a mano: usa var(--zh-firma) (o var(--zh-fondo-equipo))');
        }
      }

      // A-45: letra.
      if (deMazo || ambito === 'tokens' || ambito === 'letra') {
        if (css) {
          if (/@font-face/i.test(codigo)) anotar(k, 'A-45', '@font-face: la marca usa Arial y la mono del sistema, sin archivos de letra');
          for (const { prop, texto } of trozos[k]) {
            let familias = null;
            if (prop === 'font-family' || (prop && /^--(zh-sans|zh-mono|fuente-[\w-]+)$/.test(prop))) familias = texto.replace(/;?\s*$/, '');
            else if (prop === 'font') familias = familiaDeFont(texto.replace(/;?\s*$/, ''));
            const ajenas = familias ? familiasAjenas(familias) : [];
            if (ajenas.length) anotar(k, 'A-45', `letra ajena: ${ajenas.join(', ')}`);
          }
        } else {
          for (const m of codigo.matchAll(/(?<![\w$.-])(fontFamily|font)\s*:\s*(['"`])([^'"`]*)\2/g)) {
            const familias = m[1] === 'font' ? familiaDeFont(m[3]) : m[3];
            const ajenas = familias ? familiasAjenas(familias) : [];
            if (ajenas.length) anotar(k, 'A-45', `letra ajena: ${ajenas.join(', ')}`);
          }
        }
      }
    });
  }

  // A-61 también en las dependencias y en las páginas de entrada.
  if (!soloTrampas) {
    try {
      const paquete = JSON.parse(await readFile(join(raiz, 'package.json'), 'utf8'));
      for (const grupo of ['dependencies', 'devDependencies', 'optionalDependencies']) {
        for (const nombre of Object.keys(paquete[grupo] ?? {})) {
          if (/lucide/i.test(nombre)) hallazgos.push({ regla: 'A-61', gravedad: FALLO, archivo: 'package.json', linea: 0, ambito: 'mazo', mensaje: `dependencia «${nombre}» en ${grupo}`, codigo: nombre });
        }
      }
    } catch {
      /* sin package.json */
    }
    for (const pagina of ['index.html', 'lab.html']) {
      try {
        const texto = await readFile(join(raiz, pagina), 'utf8');
        texto.split('\n').forEach((l, k) => {
          if (/lucide/i.test(l)) hallazgos.push({ regla: 'A-61', gravedad: FALLO, archivo: pagina, linea: k + 1, ambito: 'mazo', mensaje: '«lucide» en la página', codigo: l.trim().slice(0, 160) });
        });
      } catch {
        /* no existe */
      }
    }
  }
  return { hallazgos, archivos: cuenta, fuera };
}
