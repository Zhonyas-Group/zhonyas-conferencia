/**
 * Auditor anti-slop: recorre cada paso de cada diapositiva a 1920 × 1080 y
 * revisa el código de src/. Falla (código de salida 1) si encuentra algo de la
 * lista de la síntesis §9.2.4 y de 06-anti-slop.md. Cómo leer el informe:
 * docs/MOTOR.md §12.
 *
 *   node scripts/auditar.mjs                          dist/index.html (npm run probar compila antes)
 *   node scripts/auditar.mjs --dist otra/carpeta      otra compilación (npx vite build --outDir …)
 *   node scripts/auditar.mjs --url http://localhost:5306/   el servidor de desarrollo
 *   node scripts/auditar.mjs --diapositiva 3,intro    solo esas (número desde 1 o id)
 *   node scripts/auditar.mjs --lab                    las piezas de src/marca/ en el laboratorio
 *   node scripts/auditar.mjs --lab --pieza cinta      una pieza (compila el laboratorio en una carpeta temporal)
 *   node scripts/auditar.mjs --lab http://localhost:5306/lab.html --pieza cinta
 *   node scripts/auditar.mjs --solo-codigo            sin navegador: solo src/
 *   node scripts/auditar.mjs --sin-codigo             solo las pantallas
 *
 * Opciones:
 *   --salida  informe .md                 [verificacion/auditoria.md; en el laboratorio, verificacion/auditoria-lab/<pieza>.md]
 *             las capturas van en una carpeta con el mismo nombre, sin «.md» (verificacion/auditoria/)
 *   --canal   chrome (por defecto) o msedge
 *
 * Deja el informe .md (con una captura anotada de cada pantalla que tiene
 * hallazgos) y un .json con lo mismo al lado.
 */
import { access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditar, contar } from './auditoria/auditor.mjs';
import { escribirInforme, escribirJson } from './auditoria/informe.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tiene = (n) => args.includes(n);
const valor = (n) => {
  const i = args.indexOf(n);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : undefined;
};
const lista = (n) => (valor(n) ? valor(n).split(',').map((x) => x.trim()).filter(Boolean) : undefined);
if (valor('--canal')) process.env.CANAL_NAVEGADOR = valor('--canal');

const soloCodigo = tiene('--solo-codigo');
const piezas = lista('--pieza');
const modo = tiene('--lab') || piezas ? 'lab' : 'mazo';

let url;
let origen;
let lab = null;
if (!soloCodigo) {
  if (modo === 'lab') {
    const dado = valor('--lab') ?? valor('--url');
    if (dado) {
      url = /^(https?|file):/.test(dado) ? dado : pathToFileURL(resolve(dado)).href;
      origen = `el laboratorio en ${url}`;
    } else {
      console.log('Compilando el laboratorio en una carpeta temporal…');
      const { compilarLab } = await import('./compilar-lab.mjs');
      lab = await compilarLab();
      url = lab.url;
      origen = 'el laboratorio compilado en una carpeta temporal (npx vite build --mode lab)';
    }
    origen += piezas ? `, piezas ${piezas.map((p) => `«${p}»`).join(', ')}` : ', las piezas de src/marca/ (sin la trampa del auditor)';
  } else if (valor('--url')) {
    url = valor('--url');
    origen = `el mazo servido en ${url}`;
  } else {
    const carpeta = resolve(valor('--dist') ?? join(raiz, 'dist'));
    const indice = join(carpeta, 'index.html');
    try {
      await access(indice);
    } catch {
      console.error(`No existe ${indice}: compila antes (npm run build, o npx vite build --outDir ${carpeta}).`);
      process.exit(2);
    }
    url = pathToFileURL(indice).href;
    origen = `el mazo compilado, ${indice.replace(/\\/g, '/')} (file://)`;
  }
} else origen = 'solo el código de src/ (sin navegador)';

const porDefecto = modo === 'lab' ? join(raiz, 'verificacion', 'auditoria-lab', `${piezas ? piezas.join('+') : 'todas'}.md`) : join(raiz, 'verificacion', 'auditoria.md');
const rutaMd = resolve(valor('--salida') ?? porDefecto);
const carpetaCapturas = rutaMd.replace(/\.md$/i, '');

let resultado;
try {
  resultado = await auditar({
    raiz,
    modo,
    url,
    piezas,
    diapositivas: lista('--diapositiva'),
    codigo: !tiene('--sin-codigo'),
    carpetaCapturas,
    registrar: (t) => console.log(t),
  });
} catch (error) {
  console.error(`La auditoría no pudo terminar: ${error.stack ?? error.message}`);
  await lab?.borrar();
  process.exit(2);
}
await lab?.borrar();

await escribirInforme(resultado, { rutaMd, origen, raiz });
await escribirJson(resultado, rutaMd.replace(/\.md$/i, '.json'));
const { fallos, avisos, excepciones } = contar(resultado);

// Resumen en la terminal: cuántos por regla.
const porRegla = {};
for (const h of fallos) porRegla[h.regla] = (porRegla[h.regla] ?? 0) + 1;
console.log(`\nAuditoría anti-slop: ${fallos.length ? 'FALLA' : 'PASA'} · ${fallos.length} fallos · ${avisos.length} avisos · ${excepciones.length} excepciones`);
for (const [regla, n] of Object.entries(porRegla).sort((a, b) => b[1] - a[1])) console.log(`  ${regla.padEnd(6)} ${n}`);
console.log(`Informe: ${rutaMd}`);
if (resultado.errores.length) process.exitCode = 2;
else if (fallos.length) process.exitCode = 1;
