/**
 * Catálogo de reglas del auditor anti-slop (scripts/auditar.mjs).
 *
 * Cada regla lleva el id de investigacion/06-anti-slop.md (A-nn) o de la
 * síntesis (§n), lo que exige en una línea y de dónde sale. Los umbrales y los
 * patrones de texto están aquí, una sola vez: los usan la auditoría de las
 * pantallas, la del código, el informe y su prueba (scripts/probar-auditor.mjs).
 */

/** Gravedad: «fallo» hace fallar la auditoría (y npm run probar); «aviso» solo se anota. */
export const FALLO = 'fallo';
export const AVISO = 'aviso';

/**
 * Umbrales. Cada uno con su fuente.
 */
export const UMBRAL = {
  /** Texto mínimo a 1920 × 1080: fuentes y créditos (síntesis §4.2, fila «Fuente, pie o crédito»; 01 P0-1). */
  textoMinimo: 32,
  /** Texto de lectura (06 A-48: «Lo que el público debe leer», 60 px = 30 pt de PowerPoint en 16:9). */
  lecturaMinima: 60,
  /** Palabras por pantalla, sin contar las fuentes (06 A-09). */
  palabrasMaximas: 20,
  /** Media del mazo (06 A-09): solo aviso, porque se mide al final. */
  palabrasMedia: 12,
  /** Contraste del texto de menos de 48 px (06 A-36: WCAG 2.2, 1.4.6, nivel AAA). */
  contrasteTexto: 7,
  /** A partir de qué tamaño un texto es «grande» (06 A-34 y A-36: los acentos, «solo texto de 48 px o más»). */
  textoGrande: 48,
  /** Contraste del texto grande: el otro umbral del mismo criterio WCAG 1.4.6 (AAA, texto grande). */
  contrasteGrande: 4.5,
  /** Tamaños y pesos por pantalla (06 A-49). */
  tamanosMaximos: 3,
  pesosMaximos: 2,
  /** Los dos pesos de la marca (síntesis §4.2: «Solo dos pesos: 400 y 700»). */
  pesos: [400, 700],
  /** Titulares: desde 96 px (síntesis §4.2, «Titular-oración»; 06 A-48). */
  titular: 96,
  /** Opacidad por debajo de la cual algo no se ve (criterio del auditor, el de recorrido.js de T-Eco). */
  opacidadVisible: 0.05,
  /** Diferencia por canal (0–255) a partir de la que un píxel es tinta del texto (criterio del auditor). */
  difTinta: 8,
};

/**
 * Las reglas. `pide` dice si estaba en el encargo del auditor (síntesis §9.2.4)
 * o si se añadió de la misma lista (06 §11 y las reglas de José).
 */
export const REGLAS = {
  'A-48': {
    nombre: 'Texto demasiado pequeño',
    exige: 'Ningún texto visible de menos de 32 px; el de lectura (data-lectura o .zh-lectura), de 60 px o más.',
    fuente: '06 A-48; síntesis §4.2',
    pide: true,
  },
  'A-09': {
    nombre: 'Demasiadas palabras',
    exige: 'Como máximo 20 palabras visibles por pantalla, sin contar las fuentes.',
    fuente: '06 A-09; síntesis §2.4 (Garner y Alley, 2013)',
    pide: true,
  },
  'A-69': {
    nombre: 'Cifra repetida',
    exige: 'La misma cifra no aparece dos veces en el mazo (ni dos veces en una pantalla), salvo que se cite a propósito.',
    fuente: '06 A-69 (José: «el mismo total dos veces»)',
    pide: true,
  },
  'A-67': {
    nombre: 'Cifra de adorno',
    exige: 'Cifras exactas: sin «+» de adorno, sin «10x», «100 %» ni «miles de».',
    fuente: '06 A-67',
    pide: false,
  },
  'P0-10': {
    nombre: 'Decoración que cruza un texto',
    exige: 'Ninguna decoración (línea, caja, imagen, forma SVG) toca la tinta de un texto sin contenerlo entero.',
    fuente: '01 §6.8 y P0-10 (en T-Eco, 18 de 29 posiciones); síntesis §1.3 fila 10',
    pide: true,
  },
  'A-36': {
    nombre: 'Contraste insuficiente',
    exige: 'Texto de menos de 48 px a 7:1 o más contra su fondo real (el peor píxel); el de 48 px o más, a 4,5:1.',
    fuente: '06 A-36 (WCAG 2.2, 1.4.6); síntesis §4.1',
    pide: true,
  },
  'A-13': {
    nombre: 'Vocabulario vetado',
    exige: 'Nada de «potenciar, impulsar, innovador, soluciones, extraordinario, descubre, explora…».',
    fuente: '06 A-13 y §10',
    pide: true,
  },
  'A-14': { nombre: 'Apertura de manual', exige: 'Ninguna frase empieza con «En la era…», «Hoy en día…», «Imagina…».', fuente: '06 A-14 y §10', pide: true },
  'A-12': { nombre: 'Paralelismo negativo', exige: 'Nada de «No es X, es Y», «No solo… sino también», «Más que un…».', fuente: '06 A-12 y §10', pide: true },
  'A-15': { nombre: 'Calco', exige: 'Nada de «jugar un rol», «en base a», «hacer sentido», «aportar valor»…', fuente: '06 A-15 y §10', pide: true },
  'A-07': { nombre: 'Texto que explica la diapositiva', exige: 'Nada de «En esta diapositiva», «A continuación», «Como se puede ver»…', fuente: '06 A-07 y §10', pide: true },
  'A-66': { nombre: 'Atribución vaga', exige: 'Nada de «estudios demuestran», «según expertos», «se estima que»…', fuente: '06 A-66 y §10', pide: true },
  'A-16': {
    nombre: 'Gerundio colgado',
    exige: 'Sin «…, garantizando la calidad» al final de la frase. Solo aviso: el patrón de §10 también encuentra «cuando».',
    fuente: '06 A-16 y §10',
    pide: true,
    gravedad: AVISO,
  },
  'A-05': {
    nombre: 'Título en forma de pregunta',
    exige: 'Ningún título termina en «?», salvo una pregunta real al público marcada en las notas («Pregunta al público»).',
    fuente: '06 A-05 y §10',
    pide: true,
  },
  'A-19': {
    nombre: 'Emoji o puntuación de adorno',
    exige: 'Sin emojis; sin «!» ni «…» en los títulos.',
    fuente: '06 A-19 y §10',
    pide: true,
  },
  'A-10': {
    nombre: 'Viñetas',
    exige: 'Ninguna lista en pantalla: ni <ul>, <ol> o <li>, ni «•» u otra viñeta al empezar una línea.',
    fuente: '06 A-10',
    pide: true,
  },
  'A-34': {
    nombre: 'Color fuera de la paleta',
    exige: 'Solo los colores de los tokens de marca.css (síntesis §4.1).',
    fuente: '06 A-34; síntesis §4.1',
    pide: true,
  },
  'A-45': {
    nombre: 'Letra ajena a la marca',
    exige: 'Arial (o su misma métrica: Helvetica, Liberation Sans, Arimo) y la mono del sistema, nada más.',
    fuente: '06 A-45; síntesis §4.2',
    pide: true,
  },
  'A-50': {
    nombre: 'Mono fuera de una consola',
    exige: 'La monoespaciada solo dentro de una consola de verdad (data-consola, pre, code).',
    fuente: '06 A-50; síntesis §4.2',
    pide: false,
  },
  '§4.2': {
    nombre: 'Peso de letra fuera de la marca',
    exige: 'Solo los pesos 400 y 700 (en Windows 500 se pinta como 400 y 800 como Arial Black).',
    fuente: 'síntesis §4.2; 02 §3.1',
    pide: false,
  },
  'A-49': {
    nombre: 'Demasiados tamaños o pesos',
    exige: 'Como mucho tres tamaños y dos pesos de letra por pantalla.',
    fuente: '06 A-49; síntesis §4.2',
    pide: false,
  },
  'A-31': {
    nombre: 'MAYÚSCULAS de rótulo',
    exige: 'Sin rótulos en mayúsculas (text-transform o escritos así); las siglas sí.',
    fuente: '06 A-18 y A-31; síntesis §0.2 (por defecto, ningún rótulo)',
    pide: false,
  },
  'A-61': {
    nombre: 'Iconos de Lucide',
    exige: 'Nada de Lucide (ni la dependencia, ni el código, ni un svg.lucide en pantalla).',
    fuente: '06 A-61',
    pide: true,
  },
  'A-38': {
    nombre: 'Degradado sin el token',
    exige: 'Todo degradado es var(--zh-firma) (o el fondo del equipo, var(--zh-fondo-equipo)); un SVG, con las paradas de --zh-firma-paradas.',
    fuente: '06 A-38; síntesis §4.1',
    pide: true,
  },
  'A-40': {
    nombre: 'Degradado detrás de texto',
    exige: 'Nunca texto encima de la firma; encima del fondo del equipo, solo titulares (96 px o más). Ni texto relleno de degradado.',
    fuente: '06 A-40; síntesis §4.1',
    pide: false,
  },
  'A-43': {
    nombre: 'Halo o brillo de adorno',
    exige: 'Sin text-shadow, ni box-shadow o drop-shadow de color o claros, ni manchas difuminadas.',
    fuente: '06 A-43; síntesis §3.1',
    pide: false,
  },
  'A-44': { nombre: 'Vidrio esmerilado', exige: 'Sin backdrop-filter de adorno.', fuente: '06 A-44', pide: false },
  'A-55': {
    nombre: 'Movimiento sin fuente',
    exige: 'Cada cubic-bezier, steps(), curva y duración lleva en un comentario su fuente (archivo:línea, M-n o Z-nn).',
    fuente: '06 A-55; síntesis §4.4; docs/MOTOR.md §4.5',
    pide: true,
  },
  'medida': {
    nombre: 'La pantalla no se pudo medir',
    exige: 'Cada pantalla carga a tiempo y sin errores en la página.',
    fuente: 'el propio auditor',
    pide: false,
  },
};

export const gravedadDe = (regla) => REGLAS[regla]?.gravedad ?? FALLO;

// ——— Patrones de texto de 06-anti-slop.md §10 (líneas 510–535) ———
//
// Los de §10 usan \b y \w, que en JavaScript solo conocen el ASCII («impulsó»
// partiría la palabra en la «ó»). Aquí van con los mismos términos y límites
// de palabra Unicode. Se buscan sin distinguir mayúsculas.

const L = '[\\p{L}\\p{N}_]';
const ini = `(?<!${L})`;
const fin = `(?!${L})`;
const W = `${L}*`;
const patron = (cuerpo) => new RegExp(cuerpo, 'giu');

export const PATRONES = [
  {
    regla: 'A-13',
    re: patron(
      `${ini}(potenci${W}|impuls${W}|desbloque${W}|revolucion${W}|sin fisuras|sin esfuerzo|de vanguardia|de última generación|innovador${W}|disrupt${W}|robust${W}|escalab${W}|integral(es)?|ecosistema|sinergi${W}|empoder${W}|apalanc${W}|elevar|siguiente nivel|reglas del juego|el futuro de|mundo de posibilidades|crucial|fundamental|esencial|sumérg${W}|adént${W}|descubr${W}|explor${W}|extraordinari${W}|mágic${W}|soluciones)${fin}`,
    ),
  },
  // Al empezar la frase: al principio del bloque o tras «.», «!», «?» o «…».
  { regla: 'A-14', re: patron(`(?:^|[.!?…]\\s+)(en la era|en un mundo|hoy en día|vivimos en|¿sabías|imagina|todos sabemos)${fin}`) },
  {
    regla: 'A-12',
    re: patron(`${ini}no (es|son|somos) [^.;]+, (es|son|somos)${fin}|${ini}no solo${fin}|${ini}sino también${fin}|${ini}más que (un|una)${fin}`),
  },
  // Solo aviso (ver REGLAS['A-16']).
  { regla: 'A-16', re: patron(`, ${L}+(ando|iendo)${fin}[^.]*\\.?$`) },
  {
    regla: 'A-15',
    re: patron(
      `${ini}(jugar un (rol|papel)|en base a|aplicar a|hacer? sentido|es por eso que|al final del día|customiz${W}|enfrentar (los )?desaf${W}|(agregar|aportar) valor)${fin}`,
    ),
  },
  { regla: 'A-07', re: patron(`${ini}(en esta diapositiva|a continuación|como se puede (ver|observar)|la siguiente imagen)${fin}`) },
  { regla: 'A-66', re: patron(`${ini}(estudios (demuestran|muestran)|según (los )?expertos|se estima que|la mayoría de)${fin}`) },
  // A-67: «+» de adorno detrás de una cifra, «10x», «100 %», «miles de».
  { regla: 'A-67', re: patron(`\\d\\s?\\+(?!\\d)|${ini}\\d+\\s?x${fin}|${ini}100\\s?%|${ini}miles de${fin}`) },
];

/**
 * A-19, emojis. El rango de §10 ([\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]) incluye
 * «✓» (U+2713), que es el de la consola de la web (service-terminal.tsx:33) y
 * no es un emoji: se usa la propiedad Unicode Emoji_Presentation (lo que se
 * pinta como emoji sin más), lo que lleva el selector de emoji (U+FE0F) y las
 * banderas (indicadores regionales, que el rango de §10 no tenía).
 */
export const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️|[\u{1F1E6}-\u{1F1FF}]/u;

/** A-05: título que termina en «?» (con comillas o paréntesis de cierre detrás). */
export const PREGUNTA = /\?[\s»”"')\]]*$/u;
/** A-19: título con «!» o con puntos suspensivos. */
export const EXCLAMACION = /![\s»”"')\]]*$|¡/u;
export const SUSPENSIVOS = /…|\.\.\./u;

/** A-10: viñeta al empezar un bloque. */
export const VINETA = /^\s*(?:[•·▪◦‣⁃●○■□►▸➤*]|[-–—](?=\s))\s*/u;

/**
 * A-69: cifras. Un número (con separadores de miles o decimales, «1.500»,
 * «92,7», «1 254») y, si va pegado, su unidad. Se ignoran los enteros de una
 * cifra sin unidad («3 historias», «paso 1»): no son datos. Los años sí cuentan
 * («Desde 2021» repetido en T-Eco es un caso de A-69, 06 §9).
 */
export const CIFRA =
  /(?<![\p{L}\p{N}])(\d+(?:[.,:]\d+)*(?:[   ]\d{3}(?![\p{N}]))*)(?:[   ]?(%|‰|ms|s|fps|x|×|k|mil|millones|días|años|horas|minutos|min|h|px))?(?![\p{L}\p{N}])/gu;

export function cifrasDe(texto) {
  const lista = [];
  for (const m of texto.matchAll(CIFRA)) {
    const numero = m[1].replace(/[   ]/g, '');
    const unidad = (m[2] ?? '').toLowerCase();
    if (!unidad && /^\d$/.test(numero)) continue;
    lista.push(unidad ? `${numero} ${unidad}` : numero);
  }
  return lista;
}

/** Palabras: lo que lleva al menos una letra o un número («41,9» cuenta; «%» y «·» no). */
export const contarPalabras = (texto) => texto.split(/\s+/u).filter((p) => /[\p{L}\p{N}]/u.test(p)).length;

/**
 * A-55: qué cuenta como «comentario de fuente». Un archivo (con o sin línea:
 * «globals.css:1387», «contact-section.tsx:19-20», «page.tsx»), un id de
 * movimiento de investigacion/03-movimiento-zhonyas.md («M12», «03 M2»), uno
 * del catálogo de la síntesis §4.4 («Z-08») o una sección de un informe
 * («05 §11.3», «síntesis §4.4»). Es lo que pide docs/MOTOR.md §4.5. También
 * una línea suelta («:16», «:226-227») cuando la cabecera del archivo dice de
 * qué archivo de la web se copió (así lo hace src/marca/relevo/personaje.css).
 */
export const REFERENCIA =
  /[\w.-]+\.(?:css|tsx?|jsx?|mjs|md|json|glsl|svg)\b(?::\d+)?|(?<![\w-])M-?\d{1,2}(?!\w)|(?<![\w-])Z-\d{2}(?!\w)|§\s?\d|(?:^|\s|\()(?::\d+(?:[-–]\d+)?)(?![\w:])/u;

/** Marca de excepción escrita en un comentario del código: «auditar-excepcion: A-55 motivo». */
export const EXCEPCION_CODIGO = /auditar-excepcion:\s*((?:A-\d{2}|P0-\d+|§\d(?:\.\d)?)(?:\s*,\s*(?:A-\d{2}|P0-\d+|§\d(?:\.\d)?))*)\s*[:—–-]?\s*(.*)/u;

// ——— Colores ———

const HEX = /#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-z_-])/giu;
const RGB = /rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/giu;

const canal = (v) => (v.endsWith('%') ? Math.round((parseFloat(v) / 100) * 255) : Math.round(parseFloat(v)));
const alfa = (v) => (v === undefined ? 1 : v.endsWith('%') ? parseFloat(v) / 100 : parseFloat(v));

/** Lee un hex de 3, 4, 6 u 8 cifras: { r, g, b, a }. */
export function leerHex(hex) {
  let h = hex.replace('#', '').toLowerCase();
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
}

/** Todos los colores escritos en un texto (hex y rgb/rgba), con su posición. */
export function coloresEn(texto) {
  const lista = [];
  for (const m of texto.matchAll(HEX)) lista.push({ ...leerHex(m[0]), escrito: m[0], indice: m.index });
  for (const m of texto.matchAll(RGB)) {
    lista.push({ r: canal(m[1]), g: canal(m[2]), b: canal(m[3]), a: alfa(m[4]), escrito: m[0], indice: m.index });
  }
  return lista.sort((x, y) => x.indice - y.indice);
}

export const aHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');

/** Luminancia relativa (WCAG 2.2) y contraste. */
const lineal = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
export const luminancia = ({ r, g, b }) => 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
export function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** ¿Es un gris (blanco, negro o gris, con cualquier alfa)? Para separar sombras neutras de los brillos de color. */
export function esNeutro({ r, g, b }) {
  return Math.max(r, g, b) - Math.min(r, g, b) <= 24;
}
