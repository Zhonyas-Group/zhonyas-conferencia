/**
 * PDF de respaldo: una página por diapositiva, en su estado final, en
 * dist/zhonyas-conferencia.pdf (se copia al USB junto con lo demás).
 *
 *   npm run pdf    (compila antes)
 *
 * Cada página es la captura exacta de la diapositiva a 1920×1080 (lo que se ve
 * es lo que sale, incluido WebGL), en una hoja de 16:9 (13,33 × 7,5 pulgadas,
 * el tamaño panorámico de PowerPoint). «npm run capturas» también lo crea.
 */
import { recorrer } from './recorrer.mjs';
import { NOMBRE_PDF, nuevoPdf } from './respaldo.mjs';

const pdf = await nuevoPdf();

const resultado = await recorrer({ soloFinal: true, formato: 'jpeg' }, async (c) => {
  await pdf.agregar(c.imagen);
  console.log(`  página ${c.n}: ${c.titulo}`);
});

const { paginas, kb } = await pdf.guardar(resultado.titulo);
console.log(`\n${paginas} páginas → dist/${NOMBRE_PDF} (${kb} KB)`);
if (resultado.errores.length) {
  console.log(`Errores en la página:\n  ${resultado.errores.join('\n  ')}`);
  process.exitCode = 1;
}
