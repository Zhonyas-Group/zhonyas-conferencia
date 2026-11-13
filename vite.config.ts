import { closeSync, existsSync, openSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const DIST = fileURLToPath(new URL('./dist', import.meta.url));

/**
 * Antes de vaciar dist/, comprueba que se puede borrar todo lo que hay dentro.
 * Un lector de PDF como Acrobat bloquea el archivo que tiene abierto: Vite
 * empezaba a vaciar dist/, borraba index.html, medios/ y fonts/, y fallaba en
 * el PDF con «EBUSY», dejando dist/ solo con el PDF viejo. Si algo está
 * bloqueado, la compilación se para aquí, sin tocar nada, y dice qué cerrar.
 */
function distLibre(): Plugin {
  return {
    name: 'zhonyas:dist-libre',
    apply: 'build',
    buildStart() {
      if (!existsSync(DIST)) return;
      const bloqueados: string[] = [];
      const revisar = (carpeta: string) => {
        for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
          const ruta = join(carpeta, entrada.name);
          if (entrada.isDirectory()) {
            revisar(ruta);
            continue;
          }
          try {
            // Abrir para escribir falla igual que el borrado si otro programa lo tiene bloqueado
            // (o si es de solo lectura). No cambia nada del archivo.
            closeSync(openSync(ruta, 'r+'));
          } catch (error) {
            const codigo = (error as NodeJS.ErrnoException).code ?? '';
            if (['EBUSY', 'EPERM', 'EACCES'].includes(codigo)) bloqueados.push(`${relative(DIST, ruta)} (${codigo})`);
          }
        }
      };
      revisar(DIST);
      if (bloqueados.length === 0) return;
      // Solo el mensaje, sin la traza de Rollup encima, y fuera: así no se llega a vaciar dist/.
      console.error(
        '\n\x1b[31mNo se puede compilar: dist/ tiene archivos abiertos en otro programa o de solo lectura:\x1b[0m\n' +
          bloqueados.map((b) => `  · ${b}`).join('\n') +
          '\nCierra ese programa (por ejemplo, el lector de PDF que tiene abierto zhonyas-conferencia.pdf)' +
          ' y vuelve a ejecutar el comando.\nNo se ha borrado nada: dist/ sigue como estaba.\n',
      );
      process.exit(1);
    },
  };
}

/**
 * Cada compilación vacía dist/ y con ella se va el PDF de respaldo. Que no se
 * pierda en silencio: se avisa al terminar («npm run pdf» y «npm run capturas»
 * lo vuelven a crear justo después y lo dicen en su salida).
 */
function avisoPdfDeRespaldo(): Plugin {
  const pdf = join(DIST, 'zhonyas-conferencia.pdf');
  let habia = false;
  return {
    name: 'zhonyas:aviso-pdf',
    apply: 'build',
    buildStart() {
      habia = existsSync(pdf);
    },
    closeBundle() {
      if (existsSync(pdf)) return;
      const como = habia ? 'se borró al vaciar dist/' : 'no está en dist/';
      console.warn(
        `\n\x1b[33mAVISO: el PDF de respaldo (zhonyas-conferencia.pdf) ${como}.\x1b[0m\n` +
          '       Antes de copiar dist/ al USB: «npm run pdf» (o «npm run capturas», que también lo crea).\n',
      );
    },
  };
}

// La presentación tiene que abrirse con doble clic desde un USB (file://).
// Por eso todo el JS y el CSS van dentro de dist/index.html (vite-plugin-singlefile)
// y los medios de public/ se copian tal cual a dist/ y se piden con rutas relativas.
export default defineConfig({
  base: './',
  plugins: [distLibre(), react(), viteSingleFile({ removeViteModuleLoader: true }), avisoPdfDeRespaldo()],
  build: {
    // Margen para navegadores algo viejos en los equipos de la universidad (Chrome/Edge 80+).
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 4000,
  },
  server: { port: 5180, strictPort: false },
  preview: { port: 4180 },
});
