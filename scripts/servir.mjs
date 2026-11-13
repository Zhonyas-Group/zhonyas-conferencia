/**
 * Servidor estático mínimo (sin dependencias) para la carpeta compilada.
 *
 *   npm run servir                → sirve dist/ en http://localhost:4180 (o el siguiente libre)
 *   npm run servir -- 8080        → otro puerto (si está ocupado, lo dice y sale)
 *   npm run servir -- 8080 otra/  → otra carpeta
 *
 * Soporta peticiones por rangos (Range), que el video necesita para saltar.
 * Escucha solo en este equipo (127.0.0.1) salvo que se pida --red.
 */
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
};

export function crearServidor(carpeta) {
  const raiz = resolve(carpeta);
  return createServer(async (pet, res) => {
    try {
      const ruta = decodeURIComponent(new URL(pet.url ?? '/', 'http://x').pathname);
      let archivo = normalize(join(raiz, ruta));
      if (archivo !== raiz && !archivo.startsWith(raiz + sep)) {
        res.writeHead(403).end('Prohibido');
        return;
      }
      let info = await stat(archivo).catch(() => null);
      if (info?.isDirectory()) {
        archivo = join(archivo, 'index.html');
        info = await stat(archivo).catch(() => null);
      }
      if (!info) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
        return;
      }
      const tipo = TIPOS[extname(archivo).toLowerCase()] ?? 'application/octet-stream';
      const comunes = { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
      const rango = /^bytes=(\d*)-(\d*)$/.exec(pet.headers.range ?? '');
      if (rango) {
        let inicio = rango[1] === '' ? info.size - Number(rango[2]) : Number(rango[1]);
        let fin = rango[1] !== '' && rango[2] !== '' ? Number(rango[2]) : info.size - 1;
        inicio = Math.max(0, inicio);
        fin = Math.min(fin, info.size - 1);
        if (inicio > fin) {
          res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
          return;
        }
        res.writeHead(206, { ...comunes, 'Content-Length': fin - inicio + 1, 'Content-Range': `bytes ${inicio}-${fin}/${info.size}` });
        if (pet.method === 'HEAD') return res.end();
        createReadStream(archivo, { start: inicio, end: fin }).pipe(res);
        return;
      }
      res.writeHead(200, { ...comunes, 'Content-Length': info.size });
      if (pet.method === 'HEAD') return res.end();
      createReadStream(archivo).pipe(res);
    } catch (error) {
      res.writeHead(500).end(String(error));
    }
  });
}

const esPrincipal = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (esPrincipal) {
  const argumentos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const pedido = argumentos.find((a) => /^\d+$/.test(a)) ?? process.env.PUERTO;
  const puertoInicial = Number(pedido ?? 4180);
  // Sin puerto pedido, si el 4180 está ocupado se prueba con los siguientes.
  const intentosMaximos = pedido === undefined ? 10 : 1;
  const carpeta = resolve(argumentos.find((a) => !/^\d+$/.test(a)) ?? resolve(fileURLToPath(import.meta.url), '..', '..', 'dist'));
  const anfitrion = process.argv.includes('--red') ? '0.0.0.0' : '127.0.0.1';

  if (!existsSync(join(carpeta, 'index.html'))) {
    console.error(`No hay index.html en ${carpeta}.`);
    console.error('Compila primero con «npm run build» (o indica otra carpeta: npm run servir -- 8080 ruta/a/dist).');
    process.exit(1);
  }

  const servidor = crearServidor(carpeta);
  let puerto = puertoInicial;
  let intentos = 1;
  servidor.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && intentos < intentosMaximos) {
      intentos += 1;
      puerto += 1;
      servidor.close();
      servidor.listen(puerto, anfitrion);
      return;
    }
    if (error.code === 'EADDRINUSE') {
      const otro = puerto === 8080 ? 8081 : 8080;
      console.error(
        intentosMaximos > 1
          ? `Los puertos ${puertoInicial} a ${puerto} están ocupados.`
          : `El puerto ${puerto} está ocupado (¿hay otro «npm run servir» abierto?).`,
      );
      console.error(`Prueba con otro: npm run servir -- ${otro}`);
    } else if (error.code === 'EACCES') {
      console.error(`No hay permiso para usar el puerto ${puerto}. Prueba con uno mayor que 1024: npm run servir -- 8080`);
    } else {
      console.error(`No se pudo abrir el servidor en el puerto ${puerto}: ${error.message}`);
    }
    process.exit(1);
  });
  servidor.on('listening', () => {
    if (puerto !== puertoInicial) console.log(`(El puerto ${puertoInicial} estaba ocupado; se usa el ${puerto}).`);
    console.log(`Presentación en http://localhost:${puerto}/  (carpeta ${carpeta})`);
    console.log(`Presentador:    http://localhost:${puerto}/?presentador`);
    console.log('Ctrl+C para parar.');
  });
  servidor.listen(puerto, anfitrion);
}
