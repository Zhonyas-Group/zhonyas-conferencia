/**
 * Prueba automática del motor sobre la carpeta compilada (dist/).
 *
 *   npm run probar                    → compila y prueba con Chrome
 *   node scripts/probar.mjs --canal msedge   → misma prueba con Edge (sin recompilar)
 *
 * Comprueba: escalado en 5 tamaños, teclas y clic, URL, cuadrícula, pantalla
 * en negro, ventana del presentador y su sincronización (las tres vías por
 * separado), WebGL que se pausa, video, modo revisión, menos movimiento,
 * servidor estático y fluidez al avanzar. Casi todo se hace en file://, que es
 * como se abrirá desde el USB. Deja capturas en verificacion/pruebas/.
 */
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';
import { crearServidor } from './servir.mjs';
import { AVISO_SIN_PDF, hayPdf } from './respaldo.mjs';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const salida = resolve(raiz, 'verificacion', 'pruebas');
const indiceCanal = process.argv.indexOf('--canal');
const canal = indiceCanal > 0 ? process.argv[indiceCanal + 1] : process.env.CANAL_NAVEGADOR ?? 'chrome';
process.env.CANAL_NAVEGADOR = canal;
const URL_ARCHIVO = pathToFileURL(resolve(raiz, 'dist', 'index.html')).href;

await mkdir(salida, { recursive: true });

const resultados = [];
const errores = [];

function comprobar(nombre, ok, detalle = '') {
  resultados.push({ nombre, ok: Boolean(ok), detalle });
  console.log(`${ok ? '  ok   ' : '  FALLA'}  ${nombre}${detalle ? `  —  ${detalle}` : ''}`);
}

/** Medida que se muestra pero no aprueba ni suspende. */
function informar(nombre, detalle) {
  resultados.push({ nombre, ok: true, informativo: true, detalle });
  console.log(`  info   ${nombre}  —  ${detalle}`);
}

function vigilar(pagina, etiqueta) {
  pagina.on('pageerror', (e) => errores.push(`${etiqueta}: ${e.message}`));
  pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push(`${etiqueta}: ${m.text()}`);
  });
}

async function listo(pagina) {
  await pagina.waitForFunction(() => window.__motor, null, { timeout: 10000 });
  await pagina.evaluate(() => window.__motor.esperar());
}

async function posicion(pagina) {
  const e = await pagina.evaluate(() => window.__motor.estado());
  return `${e.n}/${e.paso}`;
}

async function llegaA(pagina, esperado, ms = 3000) {
  try {
    await pagina.waitForFunction(
      (esp) => {
        const e = window.__motor.estado();
        return `${e.n}/${e.paso}` === esp;
      },
      esperado,
      { timeout: ms },
    );
    return true;
  } catch {
    return false;
  }
}

async function tecla(pagina, nombre, esperado, etiqueta) {
  await pagina.keyboard.press(nombre);
  const ok = await llegaA(pagina, esperado);
  comprobar(`${etiqueta ?? nombre} → ${esperado}`, ok, ok ? '' : `quedó en ${await posicion(pagina)}`);
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`\nProbando dist/ con ${canal}\n`);
const navegador = await abrirNavegador();

// ——— 1. Escalado ———
console.log('Escalado del escenario 1920×1080');
for (const [ancho, alto] of [
  [1920, 1080],
  [1366, 768],
  [1280, 720],
  [1280, 800],
  [1024, 768],
]) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto } });
  const p = await ctx.newPage();
  vigilar(p, `escala ${ancho}x${alto}`);
  await p.goto(`${URL_ARCHIVO}#/1/3`);
  await listo(p);
  const m = await p.evaluate(() => {
    const r = document.querySelector('.escenario').getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      w: r.width,
      h: r.height,
      vw: innerWidth,
      vh: innerHeight,
      scrollW: document.documentElement.scrollWidth,
      scrollH: document.documentElement.scrollHeight,
    };
  });
  const proporcion = Math.abs(m.w / m.h - 16 / 9) < 0.003;
  const cabe = m.x >= -0.5 && m.y >= -0.5 && m.x + m.w <= m.vw + 0.5 && m.y + m.h <= m.vh + 0.5;
  const centrado = Math.abs(m.x - (m.vw - m.x - m.w)) <= 1.5 && Math.abs(m.y - (m.vh - m.y - m.h)) <= 1.5;
  const llena = Math.abs(m.w - m.vw) < 1 || Math.abs(m.h - m.vh) < 1;
  const sinScroll = m.scrollW <= m.vw && m.scrollH <= m.vh;
  comprobar(
    `${ancho}×${alto}: 16:9, cabe, centrado, sin barras de desplazamiento`,
    proporcion && cabe && centrado && llena && sinScroll,
    `escenario ${m.w.toFixed(1)}×${m.h.toFixed(1)} en (${m.x}, ${m.y})`,
  );
  await p.screenshot({ path: resolve(salida, `tamano-${ancho}x${alto}.png`) });
  await ctx.close();
}

// ——— 2. Navegación en la sala (file://) ———
console.log('\nNavegación en la sala (file://)');
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  vigilar(p, 'navegacion');
  await p.goto(`${URL_ARCHIVO}`);
  await listo(p);
  comprobar('Arranca en 1/0', (await posicion(p)) === '1/0');
  comprobar('Sin problemas registrados (medios presentes)', (await p.evaluate(() => window.__motor.problemas())).length === 0,
    (await p.evaluate(() => window.__motor.problemas())).join(' | '));
  await tecla(p, 'ArrowRight', '1/1');
  await tecla(p, 'Space', '1/2', 'Espacio');
  await tecla(p, 'PageDown', '1/3', 'AvPág');
  await p.mouse.click(640, 360);
  comprobar('clic → 2/0', await llegaA(p, '2/0'));
  await tecla(p, 'ArrowLeft', '1/3', '← desde el paso 0 vuelve a la anterior completa');
  await tecla(p, 'PageUp', '1/2', 'RePág');
  await tecla(p, 'End', '3/1', 'Fin');
  await tecla(p, 'Home', '1/0', 'Inicio');
  await p.keyboard.press('3');
  comprobar('Al teclear un número se ve «Ir a 3»', (await p.textContent('.salto'))?.includes('3'));
  await tecla(p, 'Enter', '3/0', '3 + Intro');
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('ArrowUp');
  comprobar('↓ y ↑ también avanzan/retroceden', await llegaA(p, '3/0'));
  await p.keyboard.press('b');
  comprobar('B → pantalla en negro', await p.evaluate(() => window.__motor.estado().negro));
  const opacidadNegro = await p.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 400));
    return getComputedStyle(document.querySelector('.negro')).opacity;
  });
  comprobar('El velo negro cubre la pantalla', opacidadNegro === '1', `opacidad ${opacidadNegro}`);
  await p.keyboard.press('ArrowRight');
  comprobar(
    'Avanzar con la pantalla en negro solo la enciende (no se mueve)',
    !(await p.evaluate(() => window.__motor.estado().negro)) && (await posicion(p)) === '3/0',
  );
  await p.keyboard.press('Period');
  comprobar('«.» (puntero) → negro', await p.evaluate(() => window.__motor.estado().negro));
  await p.keyboard.press('Period');
  comprobar('«.» otra vez → vuelve', !(await p.evaluate(() => window.__motor.estado().negro)));
  await p.keyboard.press('g');
  comprobar('G abre la cuadrícula', await p.isVisible('.cuadricula'));
  comprobar('La cuadrícula tiene una miniatura por diapositiva', (await p.locator('.celda').count()) === 3);
  await p.screenshot({ path: resolve(salida, 'cuadricula.png') });
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('Enter');
  comprobar('← + Intro en la cuadrícula salta a 2/0 y la cierra', (await llegaA(p, '2/0')) && !(await p.isVisible('.cuadricula')));
  await p.keyboard.press('g');
  await p.keyboard.press('Escape');
  comprobar('Esc cierra la cuadrícula', !(await p.isVisible('.cuadricula')));
  await p.keyboard.press('g');
  await p.click('.celda[data-celda="2"]');
  comprobar('Clic en una miniatura salta a ella', await llegaA(p, '3/0'));
  await p.evaluate(() => window.__motor.ir(1, 0));
  for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight');
  comprobar('Seis avances seguidos sin esperar llegan a 3/0', await llegaA(p, '3/0'));
  await pausa(900);
  const capas = await p.evaluate(() =>
    [...document.querySelectorAll('.sala .capa')].map((c) => ({
      rol: c.dataset.rol,
      estilo: c.getAttribute('style'),
      opacidad: getComputedStyle(c).opacity,
    })),
  );
  comprobar(
    '…y las capas quedan limpias (una sola actual, opaca, sin estilos sueltos)',
    capas.filter((c) => c.rol === 'actual').length === 1 &&
      capas.every((c) => !c.estilo && c.rol !== 'saliente') &&
      capas.find((c) => c.rol === 'actual')?.opacidad === '1',
    JSON.stringify(capas),
  );
  await p.keyboard.press('h');
  comprobar('H muestra la ayuda', await p.isVisible('.ayuda'));
  await p.keyboard.press('Escape');
  comprobar('Esc cierra la ayuda', !(await p.isVisible('.ayuda')));
  comprobar('La URL refleja la posición (#/3/0)', p.url().endsWith('#/3/0'), p.url());
  await p.keyboard.press('ArrowRight');
  await p.reload();
  await listo(p);
  comprobar('Al recargar vuelve a 3/1', (await posicion(p)) === '3/1');
  await p.evaluate(() => (location.hash = '#/1/2'));
  comprobar('Cambiar el hash a mano navega (#/1/2)', await llegaA(p, '1/2'));
  await p.goto(`${URL_ARCHIVO}#/2/1`);
  await listo(p);
  comprobar('Abrir con #/2/1 entra en 2/1', (await posicion(p)) === '2/1');
  await p.keyboard.press('F5');
  await pausa(200);
  comprobar('F5 no recarga la página (pantalla completa en su lugar)', (await posicion(p)) === '2/1');
  await ctx.close();
}

// ——— 3. Presentador abierto con P (file://) ———
async function probarPresentador(etiqueta, base, opcionesContexto = {}, initScript = null) {
  const ctx = await navegador.newContext({ viewport: { width: 1366, height: 768 }, ...opcionesContexto });
  if (initScript) await ctx.addInitScript(initScript);
  const sala = await ctx.newPage();
  vigilar(sala, `${etiqueta} sala`);
  await sala.goto(`${base}#/1/0`);
  await listo(sala);
  const [pres] = await Promise.all([ctx.waitForEvent('page'), sala.keyboard.press('p')]);
  vigilar(pres, `${etiqueta} presentador`);
  await pres.setViewportSize({ width: 1366, height: 768 });
  await listo(pres);
  return { ctx, sala, pres };
}

console.log('\nPresentador (P en la sala, file://)');
{
  const { ctx, sala, pres } = await probarPresentador('presentador', URL_ARCHIVO);
  comprobar('P abre la ventana del presentador', pres.url().includes('presentador'), pres.url());
  comprobar('…sin opener (proceso propio, no le quita cuadros a la sala)', await pres.evaluate(() => window.opener === null));
  const paginasAntes = ctx.pages().length;
  await sala.keyboard.press('p');
  await pausa(800);
  comprobar('Pulsar P otra vez enseguida no abre un segundo presentador', ctx.pages().length === paginasAntes);
  comprobar('El presentador arranca en la misma posición', (await posicion(pres)) === '1/0');
  let conectado = false;
  try {
    await pres.waitForSelector('.p-conexion[data-ok]', { timeout: 6000 });
    conectado = true;
  } catch {}
  comprobar('El presentador ve la sala conectada', conectado);
  await pres.keyboard.press('ArrowRight');
  comprobar('→ en el presentador mueve la sala (1/1)', await llegaA(sala, '1/1'));
  await sala.keyboard.press('ArrowRight');
  comprobar('→ en la sala mueve al presentador (1/2)', await llegaA(pres, '1/2'));
  await pres.click('.p-boton--grande >> text=Siguiente');
  comprobar('Botón «Siguiente» del presentador (1/3)', await llegaA(sala, '1/3'));
  comprobar('La vista en vivo es la diapositiva real', (await pres.getAttribute('.vista-viva .capa[data-rol="actual"]', 'data-id')) === 'prueba-pasos');
  comprobar('«Siguiente» anuncia la diapositiva 2', (await pres.textContent('.p-siguiente .p-rotulo'))?.includes('Siguiente: 2'));
  comprobar('Las notas se ven', (await pres.textContent('.p-notas__texto'))?.includes('prueba'));
  comprobar('Muestra quién habla (José)', (await pres.textContent('.p-orador strong'))?.includes('José'));
  comprobar('Anuncia el siguiente orador', (await pres.textContent('.p-orador--despues'))?.includes('Orador 2'));
  await pres.keyboard.press('ArrowRight');
  await pres.keyboard.press('ArrowRight');
  comprobar('Sala en 2/1', await llegaA(sala, '2/1'));
  comprobar('Aviso de relevo: «Al avanzar le toca a Orador 2»', (await pres.textContent('.p-relevo').catch(() => ''))?.includes('Orador 2'));
  await pausa(1300);
  const cifra = await pres.textContent('.p-total__cifra');
  comprobar('El cronómetro arrancó solo al primer avance', cifra !== '0:00', cifra);
  comprobar('Hay indicador de ritmo', (await pres.textContent('.p-datos'))?.match(/A tiempo|Adelantado|Atrasado/));
  await pres.click('.p-objetivo input');
  await pres.keyboard.type('20');
  await pres.keyboard.press('Enter');
  comprobar(
    'Cambiar el objetivo a 20 min',
    (await pres.inputValue('.p-objetivo input')) === '20' &&
      (await pres.evaluate(() => window.__motor.cronometro().objetivo)) === 1200,
  );
  comprobar('Escribir en el campo no movió la presentación', (await posicion(sala)) === '2/1');
  await pres.screenshot({ path: resolve(salida, 'presentador-1366x768.png') });
  await pres.keyboard.press('b');
  comprobar('B en el presentador pone la sala en negro', await sala.waitForFunction(() => window.__motor.estado().negro, null, { timeout: 3000 }).then(() => true, () => false));
  comprobar('El presentador muestra el aviso de negro', await pres.isVisible('.p-velo'));
  await sala.keyboard.press('b');
  comprobar('B en la sala lo quita en ambas', await pres.waitForFunction(() => !window.__motor.estado().negro, null, { timeout: 3000 }).then(() => true, () => false));
  await pres.keyboard.press('ArrowRight');
  await llegaA(sala, '3/0');
  await pausa(300);
  await pres.screenshot({ path: resolve(salida, 'presentador-webgl.png') });
  await pres.setViewportSize({ width: 1024, height: 768 });
  await pausa(300);
  await pres.screenshot({ path: resolve(salida, 'presentador-1024x768.png') });
  const canalesSala = await sala.evaluate(() => window.__motor.canales());
  comprobar('Vías que llegaron en file://', canalesSala.utiles > 0, JSON.stringify(canalesSala));
  // Recargar el presentador no lo desincroniza ni reinicia el cronómetro.
  const antes = await pres.textContent('.p-total__cifra');
  await pres.reload();
  await listo(pres);
  await pausa(600);
  comprobar('Recargar el presentador conserva la posición', (await posicion(pres)) === (await posicion(sala)));
  const despues = await pres.textContent('.p-total__cifra');
  comprobar('…y el cronómetro sigue', despues !== '0:00', `${antes} → ${despues}`);
  await ctx.close();
}

console.log('\nRespaldo sin BroadcastChannel (solo el evento storage)');
{
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(() => {
    delete window.BroadcastChannel;
  });
  const sala = await ctx.newPage();
  vigilar(sala, 'storage sala');
  await sala.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(sala);
  const pres = await ctx.newPage();
  vigilar(pres, 'storage presentador');
  await pres.goto(`${URL_ARCHIVO}?presentador#/1/0`);
  await listo(pres);
  await pres.keyboard.press('ArrowRight');
  comprobar('Presentador → sala por localStorage', await llegaA(sala, '1/1'));
  await sala.keyboard.press('ArrowRight');
  comprobar('Sala → presentador por localStorage', await llegaA(pres, '1/2'));
  const c = await sala.evaluate(() => window.__motor.canales());
  comprobar('Llegó por storage y no por BroadcastChannel', c.storage > 0 && c.broadcast === 0, JSON.stringify(c));
  await ctx.close();
}

console.log('\nSin BroadcastChannel ni localStorage: el presentador tiene que avisar');
{
  const { ctx, sala, pres } = await probarPresentador('sin-canal', URL_ARCHIVO, {}, () => {
    delete window.BroadcastChannel;
    Storage.prototype.setItem = function () {
      throw new Error('localStorage bloqueado (prueba)');
    };
  });
  await pausa(5500);
  comprobar('Muestra «Sala sin conectar»', (await pres.textContent('.p-conexion'))?.includes('sin conectar'));
  await sala.keyboard.press('ArrowRight');
  comprobar('La sala sigue funcionando por su cuenta', await llegaA(sala, '1/1'));
  await ctx.close();
}

// ——— 4. WebGL y video ———
console.log('\nWebGL y video');
{
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  vigilar(p, 'medios');
  await p.goto(`${URL_ARCHIVO}#/3/0`);
  await listo(p);
  await pausa(1000);
  const a = (await p.evaluate(() => window.__motor.cuadrosOGL()))['prueba-webgl'] ?? 0;
  await pausa(1000);
  const b = (await p.evaluate(() => window.__motor.cuadrosOGL()))['prueba-webgl'] ?? 0;
  // El ritmo depende del equipo (con batería, Chrome limita a 30 fps); basta con que avance.
  comprobar('WebGL anima en su diapositiva', b - a >= 20, `${b - a} fotogramas en 1 s`);
  await p.evaluate(() => window.__motor.ir(2, 1));
  await pausa(800);
  const c = (await p.evaluate(() => window.__motor.cuadrosOGL()))['prueba-webgl'] ?? 0;
  await pausa(1200);
  const d = (await p.evaluate(() => window.__motor.cuadrosOGL()))['prueba-webgl'] ?? 0;
  comprobar('WebGL se pausa al salir', d === c, `${d - c} fotogramas en 1,2 s fuera de su diapositiva`);

  const v1 = await p.evaluate(() => {
    const v = document.querySelector('.capa[data-rol="actual"] video');
    return v && { pausado: v.paused, t: v.currentTime, listo: v.readyState };
  });
  await pausa(1200);
  const v2 = await p.evaluate(() => {
    const v = document.querySelector('.capa[data-rol="actual"] video');
    return v && { pausado: v.paused, t: v.currentTime };
  });
  comprobar('El video se reproduce en su diapositiva', v1 && v2 && !v2.pausado && v2.t !== v1.t, JSON.stringify([v1, v2]));
  await pausa(4200);
  const v3 = await p.evaluate(() => {
    const v = document.querySelector('.capa[data-rol="actual"] video');
    return v && { pausado: v.paused, terminado: v.ended, t: v.currentTime };
  });
  comprobar('El video sigue en bucle pasados sus 4 s', v3 && !v3.pausado && !v3.terminado, JSON.stringify(v3));
  await p.evaluate(() => window.__motor.ir(3, 0));
  await pausa(1500);
  const v4 = await p.evaluate(() => {
    const v = document.querySelector('.capa[data-id="prueba-medio"] video');
    return v ? { pausado: v.paused, t: v.currentTime } : null;
  });
  comprobar('Al salir el video se detiene y vuelve al principio', v4 && v4.pausado && v4.t === 0, JSON.stringify(v4));
  await ctx.close();
}

// ——— 5. Modo revisión y menos movimiento ———
console.log('\nModo revisión y prefers-reduced-motion');
{
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  vigilar(p, 'revision');
  await p.goto(`${URL_ARCHIVO}?revision=1#/1/0`);
  await listo(p);
  comprobar('?revision=1 marca el documento', await p.evaluate(() => document.documentElement.classList.contains('revision')));
  await p.evaluate(() => window.__motor.ir(1, 3));
  const opacidades = await p.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return [...document.querySelectorAll('.capa[data-rol="actual"] .entrada')].map((e) => getComputedStyle(e).opacity);
  });
  comprobar('En revisión los pasos quedan en su estado final al instante', opacidades.length === 3 && opacidades.every((o) => o === '1'), opacidades.join(', '));
  await p.evaluate(() => window.__motor.ir(3, 1));
  const listoGL = await p.evaluate(() => window.__motor.esperar());
  comprobar('esperar() espera al WebGL', listoGL && (await p.isVisible('.capa[data-rol="actual"] [data-ogl][data-listo]')));
  await ctx.close();

  const ctx2 = await navegador.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  const p2 = await ctx2.newPage();
  vigilar(p2, 'reduced');
  await p2.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(p2);
  const transform = await p2.evaluate(() => getComputedStyle(document.querySelector('.entrada[data-oculto]')).transform);
  comprobar('Con menos movimiento las entradas no se desplazan', transform === 'none', transform);
  await ctx2.close();
}

// ——— 5 bis. Copia en otra carpeta, con espacios y acentos (como un USB) ———
console.log('\nCopia de dist/ en una carpeta con espacios y acentos');
{
  const copia = resolve(salida, 'USB de prueba', 'Presentación Zhonyas (copia ñ)');
  await rm(resolve(salida, 'USB de prueba'), { recursive: true, force: true });
  await cp(resolve(raiz, 'dist'), copia, { recursive: true });
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  vigilar(p, 'copia usb');
  await p.goto(`${pathToFileURL(resolve(copia, 'index.html')).href}#/2/1`);
  await listo(p);
  await pausa(2500);
  comprobar('Abre desde la copia y encuentra todos sus medios', (await p.evaluate(() => window.__motor.problemas())).length === 0);
  comprobar(
    'El video de la copia se reproduce',
    await p.evaluate(() => {
      const v = document.querySelector('.capa[data-rol="actual"] video');
      return Boolean(v && !v.paused && v.readyState >= 2);
    }),
  );
  await ctx.close();
  await rm(resolve(salida, 'USB de prueba'), { recursive: true, force: true });
}

// ——— 6. Servidor estático ———
console.log('\nServidor estático (npm run servir)');
{
  const servidor = crearServidor(resolve(raiz, 'dist'));
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const puerto = servidor.address().port;
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  vigilar(p, 'http');
  const respuestas = [];
  p.on('response', (r) => respuestas.push(r.status()));
  await p.goto(`http://127.0.0.1:${puerto}/#/2/1`);
  await listo(p);
  comprobar('Sirve la presentación por http', (await posicion(p)) === '2/1');
  comprobar('Ningún archivo falta (sin 404)', !respuestas.includes(404), respuestas.join(','));
  const rango = await fetch(`http://127.0.0.1:${puerto}/medios/prueba/video.webm`, { headers: { Range: 'bytes=0-99' } });
  comprobar('Responde a peticiones por rangos (video)', rango.status === 206 && (await rango.arrayBuffer()).byteLength === 100);
  const [pres] = await Promise.all([ctx.waitForEvent('page'), p.keyboard.press('p')]);
  vigilar(pres, 'http presentador');
  await listo(pres);
  await pres.keyboard.press('ArrowRight');
  comprobar('Presentador sincronizado también por http', await llegaA(p, '3/0'));
  await ctx.close();
  servidor.close();
}

// ——— 7. Fluidez al avanzar ———
// Dos medidas:
//  a) Con vsync normal, como en la charla: fps reales y cuadros perdidos (> 20 ms),
//     a velocidad normal y con la CPU 4 veces más lenta (portátil modesto).
//     Si el navegador ya limita a 30 fps (portátil con batería y ahorro de energía),
//     se avisa y no se cuenta como fallo: no mediría el motor sino el ahorro.
//  b) Sin tope de fotogramas (sin vsync): cada intervalo es lo que de verdad cuesta
//     producir un cuadro; da el margen que queda por encima de 60 fps.
async function medirFluidez(navegadorUsado, ralentizar) {
  const ctx = await navegadorUsado.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  vigilar(p, `fluidez ${ralentizar}x`);
  await p.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(p);
  await pausa(800);
  if (ralentizar > 1) {
    const cdp = await ctx.newCDPSession(p);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: ralentizar });
  }
  // Solo los 600 ms que siguen a cada avance: ahí están las transiciones y los pasos.
  const intervalos = [];
  const recorrido = [...Array(6).fill('ArrowRight'), ...Array(6).fill('ArrowLeft')];
  for (const teclaNav of recorrido) {
    await p.evaluate(() => {
      window.__intervalos = [];
      window.__midiendo = true;
      let ultimo = 0;
      const cuadro = (t) => {
        if (ultimo) window.__intervalos.push(t - ultimo);
        ultimo = t;
        if (window.__midiendo) requestAnimationFrame(cuadro);
      };
      requestAnimationFrame(cuadro);
    });
    await p.keyboard.press(teclaNav);
    await pausa(600);
    intervalos.push(
      ...(await p.evaluate(() => {
        window.__midiendo = false;
        return window.__intervalos;
      })),
    );
    await pausa(150);
  }
  await ctx.close();
  const orden = [...intervalos].sort((x, y) => x - y);
  const pct = (q) => orden[Math.min(orden.length - 1, Math.floor(q * orden.length))];
  const media = intervalos.reduce((s, x) => s + x, 0) / intervalos.length;
  return {
    fps: 1000 / media,
    p95: pct(0.95),
    p99: pct(0.99),
    max: orden[orden.length - 1],
    perdidos: intervalos.filter((x) => x > 20).length,
    lentos: intervalos.filter((x) => x > 16.7).length,
    total: intervalos.length,
  };
}

async function fpsEnBlanco() {
  const ctx = await navegador.newContext();
  const p = await ctx.newPage();
  await p.setContent('<!doctype html><body></body>');
  const fps = await p.evaluate(
    () =>
      new Promise((listo) => {
        let n = 0;
        const t0 = performance.now();
        const f = (t) => (t - t0 < 1000 ? (n++, requestAnimationFrame(f)) : listo(n));
        requestAnimationFrame(f);
      }),
  );
  await ctx.close();
  return fps;
}

console.log('\nFluidez al avanzar (12 cambios por toda la presentación)');
{
  const base = await fpsEnBlanco();
  const describir = (r) =>
    `${r.fps.toFixed(1)} fps de media; ${r.perdidos}/${r.total} cuadros > 20 ms; peor ${r.max.toFixed(0)} ms`;
  if (base < 50) {
    comprobar(
      `Fluidez con vsync: no se mide (el navegador limita a ${base} fps: ¿batería y ahorro de energía?)`,
      true,
      'conecta el cargador y repite',
    );
  } else {
    const normal = await medirFluidez(navegador, 1);
    comprobar('A 60 Hz: 60 fps y casi sin cuadros perdidos', normal.fps > 57 && normal.perdidos / normal.total < 0.02, describir(normal));
    const lento = await medirFluidez(navegador, 4);
    // Con la CPU frenada por emulación los resultados varían mucho entre una pasada y otra
    // (y más si el equipo está haciendo otras cosas): se informa, no se exige.
    informar('CPU 4 veces más lenta (portátil modesto), orientativo', describir(lento));
  }
  const navegadorLibre = await abrirNavegador({ args: ['--disable-frame-rate-limit', '--disable-gpu-vsync'] });
  const libre = await medirFluidez(navegadorLibre, 1);
  comprobar(
    'Margen sin vsync: el 95 % de los cuadros cuesta menos de 16,7 ms',
    libre.p95 < 16.7,
    `hasta ${libre.fps.toFixed(0)} fps; p95 ${libre.p95.toFixed(1)} ms, p99 ${libre.p99.toFixed(1)} ms`,
  );
  await navegadorLibre.close();
}

await navegador.close();

comprobar('Sin errores en la consola', errores.length === 0, errores.slice(0, 8).join(' | '));

const fallos = resultados.filter((r) => !r.ok);
await writeFile(resolve(salida, `resultado-${canal}.json`), JSON.stringify({ canal, fecha: new Date().toISOString(), resultados, errores }, null, 2));
const evaluadas = resultados.filter((r) => !r.informativo);
console.log(`\n${evaluadas.length - fallos.length} de ${evaluadas.length} comprobaciones bien con ${canal}.`);
if (fallos.length) {
  console.log('Fallaron:');
  for (const f of fallos) console.log(`  - ${f.nombre}${f.detalle ? ` (${f.detalle})` : ''}`);
  process.exitCode = 1;
}
if (!(await hayPdf())) console.log(`\n${AVISO_SIN_PDF}`);
