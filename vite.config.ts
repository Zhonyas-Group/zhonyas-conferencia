import { closeSync, existsSync, openSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, transformWithEsbuild, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const RAIZ = fileURLToPath(new URL('.', import.meta.url));
const RAIZ_POSIX = RAIZ.replace(/\\/g, '/');
const DIST_POR_DEFECTO = resolve(RAIZ, 'dist');

/**
 * Antes de vaciar la carpeta de salida, comprueba que se puede borrar todo lo
 * que hay dentro. Un lector de PDF como Acrobat bloquea el archivo que tiene
 * abierto: Vite empezaba a vaciar dist/, borraba index.html, medios/ y
 * fonts/, y fallaba en el PDF con «EBUSY», dejando dist/ solo con el PDF
 * viejo. Si algo está bloqueado, la compilación se para aquí, sin tocar nada,
 * y dice qué cerrar. Mira la carpeta de salida real (también con --outDir).
 */
function distLibre(): Plugin {
  let DIST = DIST_POR_DEFECTO;
  return {
    name: 'zhonyas:dist-libre',
    apply: 'build',
    configResolved(config) {
      DIST = resolve(config.root, config.build.outDir);
    },
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
 * lo vuelven a crear justo después y lo dicen en su salida). Una compilación
 * de prueba en otra carpeta (--outDir) no es la del USB: ahí no se avisa.
 */
function avisoPdfDeRespaldo(): Plugin {
  let pdf = join(DIST_POR_DEFECTO, 'zhonyas-conferencia.pdf');
  let esDistPropio = true;
  let habia = false;
  return {
    name: 'zhonyas:aviso-pdf',
    apply: 'build',
    configResolved(config) {
      const salida = resolve(config.root, config.build.outDir);
      esDistPropio = salida === DIST_POR_DEFECTO;
      pdf = join(salida, 'zhonyas-conferencia.pdf');
    },
    buildStart() {
      habia = existsSync(pdf);
    },
    closeBundle() {
      if (!esDistPropio || existsSync(pdf)) return;
      const como = habia ? 'se borró al vaciar dist/' : 'no está en dist/';
      console.warn(
        `\n\x1b[33mAVISO: el PDF de respaldo (zhonyas-conferencia.pdf) ${como}.\x1b[0m\n` +
          '       Antes de copiar dist/ al USB: «npm run pdf» (o «npm run capturas», que también lo crea).\n',
      );
    },
  };
}

interface DatoRegistrado {
  id: string;
  valor: string;
  estado: string;
}

/** Quita los comentarios de un módulo (los ids que salen en un comentario no cuentan). */
function sinComentarios(codigo: string): string {
  return codigo.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:\\'"`])\/\/[^\n]*/g, '$1');
}

/**
 * Registro de datos (src/datos.ts; síntesis §9.2.3; A-65).
 *
 * En cada módulo del proyecto (salvo el motor y el propio registro) busca los ids
 * del registro escritos tal cual, entre comillas: `<Dato id="mipymes-total" />`,
 * pero también `<Cifra dato="mipymes-total" />` si una pieza envuelve a <Dato>.
 *   - Si alguno está «por confirmar», la compilación de la presentación FALLA
 *     y dice qué archivo, qué dato y qué hacer. En desarrollo (npm run dev) y
 *     en el laboratorio solo avisa.
 *   - Un `<Dato id="…">` con un id que no existe también falla.
 *   - En cada diapositiva (`definirDiapositiva({`) deja la lista de sus datos en
 *     `datosDetectados`: de ahí sale el panel de fuentes del presentador.
 */
function registroDeDatos(): Plugin {
  const archivo = resolve(RAIZ, 'src', 'datos.ts');
  let registro = new Map<string, DatoRegistrado>();
  let firma = '';
  let estricto = false;

  async function cargar() {
    const fuente = readFileSync(archivo, 'utf8');
    if (fuente === firma) return;
    // datos.ts no importa nada: se compila a JS y se evalúa tal cual, sin reescribir su contenido.
    const { code } = await transformWithEsbuild(fuente, archivo, { loader: 'ts', format: 'esm' });
    const modulo = (await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)) as {
      datos: readonly DatoRegistrado[];
    };
    registro = new Map(modulo.datos.map((d) => [d.id, d]));
    firma = fuente;
  }

  return {
    name: 'zhonyas:datos',
    enforce: 'pre',
    configResolved(config) {
      estricto = config.command === 'build' && config.mode !== 'lab';
    },
    async buildStart() {
      await cargar();
      this.addWatchFile(archivo);
    },
    async transform(codigo, id) {
      const ruta = id.split('?')[0].replace(/\\/g, '/');
      const delProyecto = ruta.toLowerCase().startsWith(RAIZ_POSIX.toLowerCase());
      if (!delProyecto || !/\.[jt]sx?$/.test(ruta) || ruta.includes('/node_modules/')) return null;
      if (ruta.endsWith('/src/datos.ts') || ruta.includes('/src/motor/')) return null;
      await cargar();
      const limpio = sinComentarios(codigo);
      const donde = relative(RAIZ, ruta).replace(/\\/g, '/');
      const problemas: string[] = [];

      const usados = new Set<string>();
      for (const m of limpio.matchAll(/(['"`])([a-z0-9][a-z0-9-]*)\1/g)) if (registro.has(m[2])) usados.add(m[2]);
      for (const m of limpio.matchAll(/<Dato\b[^>]*?\bid\s*=\s*\{?\s*(['"`])([^'"`]+)\1/g))
        if (!registro.has(m[2])) problemas.push(`usa <Dato id="${m[2]}">, y ese id no está en src/datos.ts`);
      for (const idDato of usados) {
        const dato = registro.get(idDato)!;
        if (dato.estado !== 'confirmado')
          problemas.push(
            `usa el dato «${idDato}» (${dato.valor}), que está «${dato.estado}». ` +
              'Confírmalo con su fuente en src/datos.ts (estado: \'confirmado\') o quítalo de la diapositiva',
          );
      }
      for (const texto of problemas) {
        // Al fallar, Vite ya pone el archivo delante; en el aviso, no.
        if (estricto) this.error(`${texto}.`);
        else this.warn(`${donde}: ${texto}.`);
      }

      if (usados.size === 0 || !/definirDiapositiva\(\s*\{/.test(codigo)) return null;
      // En la misma línea, para no mover el resto del archivo.
      const lista = JSON.stringify([...usados].sort());
      return { code: codigo.replace(/definirDiapositiva\(\s*\{/, `definirDiapositiva({ datosDetectados: ${lista},`), map: null };
    },
  };
}

// La presentación tiene que abrirse con doble clic desde un USB (file://).
// Por eso todo el JS y el CSS van dentro de dist/index.html (vite-plugin-singlefile)
// y los medios de public/ se copian tal cual a dist/ y se piden con rutas relativas.
//
// Con --mode lab se compila el laboratorio de piezas (lab.html, ver docs/MOTOR.md §9)
// en dist-lab/, también en un solo HTML que se abre desde file://.
export default defineConfig(({ mode }) => {
  const lab = mode === 'lab';
  return {
    base: './',
    plugins: [
      ...(lab ? [] : [distLibre()]),
      registroDeDatos(),
      react(),
      viteSingleFile({ removeViteModuleLoader: true }),
      ...(lab ? [] : [avisoPdfDeRespaldo()]),
    ],
    build: {
      // Margen para navegadores algo viejos en los equipos de la universidad (Chrome/Edge 80+).
      target: 'es2020',
      outDir: lab ? 'dist-lab' : 'dist',
      emptyOutDir: true,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 4000,
      rollupOptions: { input: resolve(RAIZ, lab ? 'lab.html' : 'index.html') },
    },
    server: { port: 5180, strictPort: false },
    preview: { port: 4180 },
  };
});
