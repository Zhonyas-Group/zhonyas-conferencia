/**
 * Prueba del auditor anti-slop (scripts/auditar.mjs): que encuentre lo que
 * tiene que encontrar, y nada más.
 *
 *   node scripts/probar-auditor.mjs                          compila el laboratorio en una carpeta temporal
 *   node scripts/probar-auditor.mjs --url http://localhost:5306/lab.html
 *   node scripts/probar-auditor.mjs --mazo C:/…/dist          además, que las diapositivas de prueba fallen en lo suyo
 *   --canal msedge
 *
 * Usa la trampa src/marca/auditor/ (una escena por regla, una limpia y una con
 * excepción, y un CSS y un TSX con errores de código a propósito). Deja el
 * informe de la trampa en verificacion/pruebas/auditor/.
 */
import { access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditar, contar } from './auditoria/auditor.mjs';
import { auditarCodigo, separar } from './auditoria/codigo.mjs';
import { escribirInforme, escribirJson } from './auditoria/informe.mjs';
import { EMOJI, PATRONES, PREGUNTA, REFERENCIA, cifrasDe, contarPalabras } from './auditoria/reglas.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valor = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
if (valor('--canal')) process.env.CANAL_NAVEGADOR = valor('--canal');
const salida = join(raiz, 'verificacion', 'pruebas', 'auditor');

let bien = 0;
let mal = 0;
const comprobar = (texto, ok, detalle = '') => {
  if (ok) bien++;
  else mal++;
  console.log(`${ok ? '  ✓' : '  ✗'} ${texto}${!ok && detalle ? `\n      ${detalle}` : ''}`);
};
const igual = (a, b) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

// ——— A. Las piezas sueltas, sin navegador ———
console.log('Reglas sin navegador');
comprobar('cifra con unidad: «41,9 %»', igual(cifrasDe('El 41,9 % de los adultos'), ['41,9 %']));
comprobar('enteros de una cifra no son datos: «Paso 1 de 3»', cifrasDe('Paso 1 de 3').length === 0);
comprobar('los años sí: «Desde 2021» (06 §9, A-69)', igual(cifrasDe('Desde 2021'), ['2021']));
comprobar('miles con espacio: «1 500 mipymes» = 1500', igual(cifrasDe('1 500 mipymes'), ['1500']));
comprobar('palabras: «41,9 % de las mipymes» son 4', contarPalabras('41,9 % de las mipymes') === 4);
for (const [t, si] of [
  ['globals.css:1387', true],
  ['contact-section.tsx:19-20', true],
  ['03 M10', true],
  ['Z-08', true],
  ['05 §11.3', true],
  [' :16 · la pose', true],
  ['la curva de la marca', false],
  ['C-14', false],
]) comprobar(`fuente de un movimiento: «${t}» ${si ? 'vale' : 'no vale'}`, REFERENCIA.test(t) === si);
comprobar('«✓» de la consola no es emoji (service-terminal.tsx:33)', !EMOJI.test('✓ build'));
comprobar('«🚀» y «🇩🇴» sí', EMOJI.test('🚀') && EMOJI.test('🇩🇴'));
const vetado = PATRONES.find((p) => p.regla === 'A-13').re;
const busca = (re, t) => {
  re.lastIndex = 0;
  return re.test(t);
};
comprobar('A-13 con acentos: «impulsó» sí, «integralmente» no', busca(vetado, 'Lo impulsó') && !busca(vetado, 'integralmente'));
comprobar('A-05: «¿Por qué?»» termina en pregunta', PREGUNTA.test('¿Por qué?»'));
const lineas = separar("const u = 'http://x/#ff0000'; // globals.css:1\n/**\n * a\n */\nx();", false);
comprobar(
  'separar(): la URL es código y el comentario va aparte; el cierre «*/» cuenta como comentario',
  lineas[0].codigo.includes("'http://x/#ff0000'") && lineas[0].comentario.trim() === 'globals.css:1' && lineas[3].hay && !lineas[3].codigo.trim(),
);

// ——— B. El código de la trampa ———
console.log('\nCódigo de la trampa (src/marca/auditor/)');
const trampa = await auditarCodigo({ raiz, soloTrampas: true });
const deArchivo = (sufijo) => trampa.hallazgos.filter((h) => h.archivo.endsWith(sufijo));
const reglasDe = (lista) => new Set(lista.filter((h) => !h.excepcion).map((h) => h.regla));
const css = deArchivo('trampas.css');
const tsx = deArchivo('auditor.lab.tsx');
for (const r of ['A-34', 'A-38', 'A-45', 'A-55']) comprobar(`trampas.css: ${r}`, reglasDe(css).has(r), JSON.stringify(css.map((h) => `${h.regla}@${h.linea}`)));
comprobar(
  'trampas.css: la duración con fuente, la máscara y la excepción no fallan',
  !css.some((h) => !h.excepcion && /trampa-bien|520ms|mask-image|250ms/.test(h.codigo)),
  JSON.stringify(css.map((h) => h.codigo)),
);
comprobar('trampas.css: la excepción A-55 queda como excepción', css.some((h) => h.regla === 'A-55' && h.excepcion));
for (const r of ['A-34', 'A-38', 'A-55', 'A-61']) comprobar(`auditor.lab.tsx: ${r}`, reglasDe(tsx).has(r), JSON.stringify(tsx.map((h) => `${h.regla}@${h.linea}`)));
comprobar(
  'auditor.lab.tsx: «duration: 520» y su curva, con globals.css:1387, no fallan',
  !tsx.some((h) => h.regla === 'A-55' && /520|0\.22, 1, 0\.36, 1/.test(h.codigo)),
  JSON.stringify(tsx.filter((h) => h.regla === 'A-55').map((h) => h.codigo)),
);
comprobar('auditor.lab.tsx: «duration: 400» sin fuente, sí', tsx.some((h) => h.regla === 'A-55' && /400/.test(h.codigo)));
const real = await auditarCodigo({ raiz });
comprobar('la auditoría normal deja fuera la trampa', real.fuera.includes('src/marca/auditor/') && !real.hallazgos.some((h) => h.archivo.startsWith('src/marca/auditor/')));

// ——— C. La trampa en pantalla ———
console.log('\nLa trampa en el laboratorio, a 1920 × 1080');
const ESPERADO = {
  limpia: [],
  'texto-chico': ['A-48'],
  palabras: ['A-09'],
  'cifra-repetida': ['A-69'],
  cruce: ['P0-10'],
  recorte: [],
  'recorte-toca': ['P0-10'],
  contraste: ['A-36'],
  vocabulario: ['A-13', 'A-12'],
  pregunta: ['A-05', 'A-14'],
  adorno: ['A-67'],
  vinetas: ['A-10'],
  emoji: ['A-19'],
  color: ['A-34'],
  letra: ['A-45', 'A-50', '§4.2', 'A-49'],
  lucide: ['A-61'],
  degradado: ['A-38', 'A-40', 'A-36'],
  halo: ['A-43', 'A-44'],
  mayusculas: ['A-31'],
  tamanos: ['A-49'],
  excepcion: [],
};
let url = valor('--url');
let lab = null;
if (!url) {
  console.log('  (compilando el laboratorio en una carpeta temporal…)');
  const { compilarLab } = await import('./compilar-lab.mjs');
  lab = await compilarLab();
  url = lab.url;
}
let r;
try {
  r = await auditar({ raiz, modo: 'lab', url, piezas: ['auditor'], codigo: false, carpetaCapturas: join(salida, 'trampa') });
} finally {
  await lab?.borrar();
}
await escribirInforme(r, { rutaMd: join(salida, 'trampa.md'), origen: `la trampa del auditor (${url})`, raiz });
await escribirJson(r, join(salida, 'trampa.json'));
comprobar(`las ${Object.keys(ESPERADO).length} escenas se midieron`, r.pantallas.length === Object.keys(ESPERADO).length, `${r.pantallas.length}`);
for (const p of r.pantallas) {
  const fallos = new Set(p.hallazgos.filter((h) => h.gravedad === 'fallo' && !h.excepcion).map((h) => h.regla));
  const esperado = ESPERADO[p.id] ?? ['?'];
  comprobar(`${p.id}: ${esperado.length ? esperado.join(', ') : 'nada'}`, igual(fallos, esperado), `dio ${JSON.stringify([...fallos])}`);
}
const excepcion = r.pantallas.find((p) => p.id === 'excepcion');
comprobar('excepcion: el halo sale como excepción A-43 con su motivo', excepcion?.hallazgos.some((h) => h.regla === 'A-43' && /prueba de la excepción/.test(h.excepcion ?? '')));
const limpia = r.pantallas.find((p) => p.id === 'limpia');
const titular = limpia?.medidas.find((m) => /cumple/.test(m.texto));
comprobar(
  'limpia: el titular mide 96 px y su contraste es el de la marca (19,41:1, síntesis §4.1)',
  titular && titular.tamEf === 96 && Math.abs(titular.contraste - 19.41) < 0.05,
  JSON.stringify(titular),
);
comprobar('limpia: la cifra mide 240 px', limpia?.medidas.some((m) => m.texto === '41,9 %' && m.tamEf === 240), JSON.stringify(limpia?.medidas));
const cruce = r.pantallas.find((p) => p.id === 'cruce');
comprobar('cruce: la raya y la diagonal SVG, cada una en su texto', cruce?.hallazgos.filter((h) => h.regla === 'P0-10').length === 2);
const repetida = r.pantallas.find((p) => p.id === 'cifra-repetida');
comprobar(
  'cifra-repetida: dos veces aquí y «ya salió» en limpia',
  repetida?.hallazgos.some((h) => /2 veces/.test(h.mensaje)) && repetida?.hallazgos.some((h) => /ya salió en la escena «limpia»/.test(h.mensaje)),
);
const conCaptura = r.pantallas.filter((p) => p.hallazgos.length);
let capturas = 0;
for (const p of conCaptura) {
  try {
    await access(p.captura);
    capturas++;
  } catch {
    /* falta */
  }
}
comprobar(`cada pantalla con hallazgos tiene su captura anotada (${capturas}/${conCaptura.length})`, capturas === conCaptura.length);

// ——— D. Las diapositivas de prueba del motor, si se pide ———
if (valor('--mazo')) {
  console.log('\nLas diapositivas de prueba del motor (deben fallar)');
  const indice = pathToFileURL(join(resolve(valor('--mazo')), 'index.html')).href;
  const m = await auditar({ raiz, modo: 'mazo', url: indice, codigo: false, carpetaCapturas: join(salida, 'mazo') });
  await escribirInforme(m, { rutaMd: join(salida, 'mazo.md'), origen: indice, raiz });
  const { fallos } = contar(m);
  const reglas = new Set(fallos.map((h) => h.regla));
  comprobar(`fallan (${fallos.length} fallos)`, fallos.length > 0);
  for (const regla of ['A-48', 'A-31', 'A-50', 'A-10', 'A-34', 'A-36', 'A-43', '§4.2']) comprobar(`incluye ${regla}`, reglas.has(regla));
  const sello = fallos.find((h) => h.regla === 'A-48' && /PRUEBA/.test(h.mensaje));
  comprobar('«PRUEBA» mide 22 px (prueba.css:22)', sello?.medida === '22 px', JSON.stringify(sello));
}

console.log(`\n${bien}/${bien + mal} bien${mal ? ` · ${mal} mal` : ''} · informe de la trampa: ${join(salida, 'trampa.md')}`);
process.exitCode = mal ? 1 : 0;
