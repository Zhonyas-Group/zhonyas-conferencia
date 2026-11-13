/**
 * Captura cada diapositiva y cada paso a 1920×1080 en verificacion/capturas/
 * y, de paso, vuelve a crear el PDF de respaldo en dist/ (la compilación que
 * hace «npm run capturas» antes lo borra, y así dist/ queda completo).
 *
 *   npm run capturas                         (compila antes)
 *   node scripts/capturas.mjs --solo-final   (solo el estado final de cada una)
 *
 * Nombre de cada archivo: NN-id-pP.png (NN = número de diapositiva, P = paso).
 */
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { raiz, recorrer } from './recorrer.mjs';
import { NOMBRE_PDF, nuevoPdf } from './respaldo.mjs';

const carpeta = resolve(raiz, 'verificacion', 'capturas');
await mkdir(carpeta, { recursive: true });
for (const archivo of await readdir(carpeta)) {
  if (archivo.endsWith('.png')) await rm(resolve(carpeta, archivo));
}

const pdf = await nuevoPdf();
let cuantas = 0;
const resultado = await recorrer({ soloFinal: process.argv.includes('--solo-final'), jpegFinal: true }, async (c) => {
  const nombre = `${String(c.n).padStart(2, '0')}-${c.id}-p${c.paso}.png`;
  await writeFile(resolve(carpeta, nombre), c.imagen);
  if (c.jpeg) await pdf.agregar(c.jpeg);
  cuantas += 1;
  console.log(`  ${nombre}`);
});

console.log(`\n${cuantas} capturas de ${resultado.total} diapositivas en verificacion/capturas/`);
const { paginas, kb } = await pdf.guardar(resultado.titulo);
console.log(`PDF de respaldo: ${paginas} páginas → dist/${NOMBRE_PDF} (${kb} KB)`);
if (resultado.problemas.length) console.log(`Avisos del motor:\n  ${resultado.problemas.join('\n  ')}`);
if (resultado.errores.length) {
  console.log(`Errores en la página:\n  ${resultado.errores.join('\n  ')}`);
  process.exitCode = 1;
}
