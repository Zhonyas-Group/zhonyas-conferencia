/**
 * El PDF de respaldo (dist/zhonyas-conferencia.pdf): lo crean «npm run pdf»
 * y «npm run capturas», y lo vigilan los demás comandos que compilan, porque
 * cada compilación vacía dist/ y con ella se va el PDF.
 */
import { access, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const NOMBRE_PDF = 'zhonyas-conferencia.pdf';
export const RUTA_PDF = resolve(raiz, 'dist', NOMBRE_PDF);

/** Hoja de 16:9 (13,33 × 7,5 pulgadas, el tamaño panorámico de PowerPoint), en puntos. */
const ANCHO_PT = 960;
const ALTO_PT = 540;

/** Va juntando páginas (capturas JPEG a 1920 × 1080) y guarda el PDF en dist/. */
export async function nuevoPdf() {
  const pdf = await PDFDocument.create();
  pdf.setAuthor('Zhonyas');
  pdf.setCreator('Motor de presentación de Zhonyas');
  pdf.setProducer('pdf-lib');
  pdf.setCreationDate(new Date());
  let paginas = 0;
  return {
    async agregar(jpeg) {
      const imagen = await pdf.embedJpg(jpeg);
      const pagina = pdf.addPage([ANCHO_PT, ALTO_PT]);
      pagina.drawImage(imagen, { x: 0, y: 0, width: ANCHO_PT, height: ALTO_PT });
      paginas += 1;
    },
    async guardar(titulo) {
      pdf.setTitle(titulo);
      const bytes = await pdf.save();
      await writeFile(RUTA_PDF, bytes);
      return { paginas, kb: Math.round(bytes.length / 1024) };
    },
  };
}

export async function hayPdf() {
  try {
    await access(RUTA_PDF);
    return true;
  } catch {
    return false;
  }
}

/** Aviso para la salida de un comando que deja dist/ sin el PDF. */
export const AVISO_SIN_PDF = `AVISO: dist/ no tiene el PDF de respaldo (${NOMBRE_PDF}); cada compilación lo borra.
       Antes de copiar dist/ al USB, ejecuta «npm run pdf» (o «npm run capturas», que también lo crea).`;
