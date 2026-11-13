/**
 * Prueba de lo que el motor ganó con la marca (síntesis §9.2, puntos 1, 2, 3,
 * 5 y 8, y la crítica C-02), sobre la carpeta compilada y sobre el
 * laboratorio, casi todo en file://:
 *   - corte seco por defecto (Z-00), <Entrada> sin efecto que aparece de golpe, negro sin fundido;
 *   - registro de datos: <Dato> pinta la cifra, el panel de fuentes la cita y
 *     la compilación falla con un dato «por confirmar»;
 *   - notas por paso (decir, claves, si falla) y alerta del +20 %;
 *   - prueba de sala (T) en la sala y desde el presentador;
 *   - diapositivas pesadas como póster en el presentador (C-02);
 *   - laboratorio: índice, ?pieza=&paso=, reproducción cuadro a cuadro con
 *     valores exactos, salida animada, transición entre escenas, momentos (A-54).
 *
 *   node scripts/probar-novedades.mjs                    (sobre dist/)
 *   node scripts/probar-novedades.mjs --dist otra/carpeta --canal msedge
 *
 * Deja capturas y el resultado en verificacion/pruebas/novedades/.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compilarLab, raiz } from './compilar-lab.mjs';
import { abrirNavegador } from './navegador.mjs';

const argumento = (nombre) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const canal = argumento('--canal') ?? process.env.CANAL_NAVEGADOR ?? 'chrome';
process.env.CANAL_NAVEGADOR = canal;
const DIST = resolve(argumento('--dist') ?? process.env.DIST_PRUEBA ?? resolve(raiz, 'dist'));
const salida = resolve(argumento('--salida') ?? resolve(raiz, 'verificacion', 'pruebas', 'novedades'));
const URL_ARCHIVO = pathToFileURL(resolve(DIST, 'index.html')).href;

await mkdir(salida, { recursive: true });

const resultados = [];
const errores = [];

function comprobar(nombre, ok, detalle = '') {
  resultados.push({ nombre, ok: Boolean(ok), detalle });
  console.log(`${ok ? '  ok   ' : '  FALLA'}  ${nombre}${detalle ? `  —  ${detalle}` : ''}`);
}

function vigilar(pagina, etiqueta) {
  pagina.on('pageerror', (e) => errores.push(`${etiqueta}: ${e.message}`));
  pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push(`${etiqueta}: ${m.text()}`);
  });
}

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function listo(pagina) {
  await pagina.waitForFunction(() => window.__motor, null, { timeout: 10000 });
  await pagina.evaluate(() => window.__motor.esperar());
}

async function posicion(pagina) {
  const e = await pagina.evaluate(() => window.__motor.estado());
  return `${e.n}/${e.paso}`;
}

async function hasta(pagina, condicion, arg, ms = 3000) {
  try {
    await pagina.waitForFunction(condicion, arg, { timeout: ms });
    return true;
  } catch {
    return false;
  }
}

/** cubic-bezier(x1, y1, x2, y2) evaluada en el progreso x (como la evalúa el navegador). */
function bezier(x1, y1, x2, y2, x) {
  const cx = (t) => 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
  const cy = (t) => 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3;
  let a = 0;
  let b = 1;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (cx(m) < x) a = m;
    else b = m;
  }
  return cy((a + b) / 2);
}

console.log(`\nProbando las novedades del motor en ${DIST} con ${canal}\n`);
const navegador = await abrirNavegador();

// ——— 1. Sala: corte, entradas, negro, datos y prueba de sala ———
console.log('Sala (file://)');
{
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  vigilar(p, 'sala');
  await p.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(p);

  // Prueba de sala antes de empezar: no arranca el cronómetro.
  await p.keyboard.press('t');
  comprobar(
    'T abre la prueba de sala (fuera del orden)',
    (await p.isVisible('.capa-prueba-sala')) && (await p.evaluate(() => window.__motor.estado().prueba)),
  );
  const tamanos = await p.evaluate(() =>
    ['.zh-cifra', '.zh-portadilla', '.zh-titular', '.zh-lectura', '.zh-fuente'].map((s) => {
      const c = getComputedStyle(document.querySelector(`.capa-prueba-sala ${s}`));
      return { s, tam: c.fontSize, peso: c.fontWeight, letra: c.fontFamily.split(',')[0].replace(/["']/g, ''), espacio: c.letterSpacing };
    }),
  );
  const esperado = [
    ['240px', '700', '-18px'],
    ['128px', '700', '-9.6px'],
    ['96px', '700', '-6.24px'],
    ['60px', '400', '-2.1px'],
    ['32px', '400', 'normal'],
  ];
  comprobar(
    '…con los cinco tamaños de la escala en Arial y su interletrado (240, 128, 96, 60 y 32 px)',
    tamanos.every((t, i) => t.tam === esperado[i][0] && t.peso === esperado[i][1] && t.letra === 'Arial' && (t.espacio === esperado[i][2] || (esperado[i][2] === 'normal' && t.espacio === '0px'))),
    tamanos.map((t) => `${t.tam}/${t.peso}/${t.espacio}/${t.letra}`).join(' · '),
  );
  const colores = await p.evaluate(() => [...document.querySelectorAll('.capa-prueba-sala .ps-color')].map((li) => li.textContent.trim()));
  comprobar(
    '…con los 16 colores de texto y su contraste medido en vivo (texto 19,4:1; texto 2 9,9:1)',
    colores.length === 16 && colores[0] === 'texto 19,4:1' && colores[1] === 'texto 2 9,9:1',
    colores.slice(0, 4).join(' · '),
  );
  const negros = await p.evaluate(() => [...document.querySelectorAll('.capa-prueba-sala .ps-negro')].map((li) => li.textContent.trim()));
  comprobar(
    '…con los escalones de negro de #010204 a #141318',
    negros.join(' ') === '#010204 #050609 #09090d #0b0a10 #141318',
    negros.join(' '),
  );
  comprobar('…con la firma y el patrón de bordes', (await p.isVisible('.capa-prueba-sala .ps-firma__cinta')) && (await p.locator('.capa-prueba-sala .ps-borde').count()) === 4);
  await p.screenshot({ path: resolve(salida, 'prueba-sala.png') });
  await p.keyboard.press('ArrowRight');
  comprobar(
    '→ con la prueba abierta solo la cierra: no se mueve ni arranca el cronómetro',
    !(await p.evaluate(() => window.__motor.estado().prueba)) &&
      (await posicion(p)) === '1/0' &&
      !(await p.evaluate(() => window.__motor.cronometro().corriendo)),
  );
  await p.keyboard.press('t');
  await p.keyboard.press('Escape');
  comprobar('Esc también la cierra', !(await p.isVisible('.capa-prueba-sala')));

  const dato = await p.textContent('.sala .capa[data-rol="actual"] [data-dato="gem-actividad-emprendedora"]');
  comprobar('<Dato> pinta la cifra del registro (src/datos.ts)', dato === '41,9 %', dato ?? 'no está');

  // Entrada sin efecto: de golpe.
  const entrada = await p.evaluate(async () => {
    window.__motor.avanzar();
    await new Promise((r) => requestAnimationFrame(r));
    const e = document.querySelector('.sala .capa[data-rol="actual"] .entrada');
    const c = getComputedStyle(e);
    return { visibilidad: c.visibility, opacidad: c.opacity, transform: c.transform, animaciones: e.getAnimations().length };
  });
  comprobar(
    'Una <Entrada> sin efecto aparece de golpe en el cuadro siguiente (sin fundido ni desplazamiento)',
    entrada.visibilidad === 'visible' && entrada.opacidad === '1' && entrada.transform === 'none' && entrada.animaciones === 0,
    JSON.stringify(entrada),
  );

  // Corte seco: de 1/3 a 2/0.
  await p.evaluate(() => window.__motor.ir(1, 3));
  await pausa(2500); // que la vecina esté montada y pintada, como en la charla
  const corte = await p.evaluate(async () => {
    const t0 = performance.now();
    window.__motor.avanzar();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const actual = document.querySelector('.sala .capa[data-rol="actual"]');
    return {
      id: actual?.dataset.id,
      opacidad: getComputedStyle(actual).opacity,
      salientes: document.querySelectorAll('.sala .capa[data-rol="saliente"]').length,
      animaciones: actual.getAnimations().length,
      ms: Math.round(performance.now() - t0),
    };
  });
  comprobar(
    'Corte seco (Z-00): a los 2 cuadros la nueva está entera, sin animación, y la anterior ya no está',
    corte.id === 'prueba-medio' && corte.opacidad === '1' && corte.salientes === 0 && corte.animaciones === 0,
    JSON.stringify(corte),
  );

  await p.keyboard.press('b');
  const negro = await p.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(r));
    return getComputedStyle(document.querySelector('.negro')).opacity;
  });
  comprobar('El negro entra de golpe (sin fundido)', negro === '1', `opacidad al cuadro siguiente: ${negro}`);
  await p.keyboard.press('b');
  await ctx.close();
}

// ——— 2. Presentador: notas por paso, fuentes, pesadas, prueba de sala ———
console.log('\nPresentador (P en la sala, file://)');
{
  const ctx = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
  const sala = await ctx.newPage();
  vigilar(sala, 'presentador sala');
  await sala.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(sala);
  const [pres] = await Promise.all([ctx.waitForEvent('page'), sala.keyboard.press('p')]);
  vigilar(pres, 'presentador');
  await pres.setViewportSize({ width: 1366, height: 768 });
  await listo(pres);

  const nota0 = (await pres.textContent('.p-notas__texto')) ?? '';
  comprobar(
    'Notas por paso: la del paso 0 con su frase de entrada y sus claves',
    nota0.includes('Esta es la diapositiva de prueba del motor') && nota0.includes('prueba · tres pasos') && !(await pres.isVisible('.nota-paso__falla')),
    nota0.slice(0, 90),
  );
  for (let i = 0; i < 3; i++) await pres.keyboard.press('ArrowRight');
  await hasta(sala, () => window.__motor.estado().paso === 3);
  const nota3 = (await pres.textContent('.p-notas__texto')) ?? '';
  comprobar(
    '…cambia con el paso y enseña «Si falla» aparte',
    nota3.includes('Tercer paso de la prueba') && (await pres.textContent('.nota-paso__falla'))?.includes('número 2'),
    nota3.slice(0, 90),
  );
  const fuentes = (await pres.textContent('.p-fuentes').catch(() => '')) ?? '';
  comprobar(
    'Panel de fuentes aparte: la cifra con su fuente y su fecha, y las fuentes escritas a mano',
    fuentes.includes('41,9 %') && fuentes.includes('GEM 2021/2022 Global Report') && fuentes.includes('(2021)') && fuentes.includes('Texto de prueba del motor'),
    fuentes.slice(0, 120),
  );
  await pres.screenshot({ path: resolve(salida, 'presentador-notas-y-fuentes.png') });

  await pres.keyboard.press('ArrowRight');
  await pres.keyboard.press('ArrowRight');
  await hasta(sala, () => window.__motor.estado().n === 2 && window.__motor.estado().paso === 1);
  comprobar(
    'Diapositiva pesada en «Siguiente»: su póster quieto',
    await hasta(pres, () => !!document.querySelector('.p-siguiente .poster-diapositiva[data-poster-de="prueba-webgl"]')),
  );
  await pres.keyboard.press('ArrowRight');
  await hasta(sala, () => window.__motor.estado().n === 3);
  await pausa(600);
  comprobar(
    'Diapositiva pesada en «En pantalla»: póster, sin lienzo WebGL (C-02)',
    (await pres.isVisible('.vista-viva .capa[data-rol="actual"] .poster-diapositiva img')) &&
      (await pres.locator('.vista-viva .capa[data-rol="actual"] canvas').count()) === 0,
  );
  comprobar('…mientras la sala la pinta en vivo', (await sala.locator('.sala .capa[data-rol="actual"] canvas').count()) === 1);
  await pres.screenshot({ path: resolve(salida, 'presentador-pesada.png') });

  await pres.keyboard.press('t');
  comprobar(
    'T en el presentador abre la prueba en la sala y la enseña sobre «En pantalla»',
    (await hasta(sala, () => !!document.querySelector('.capa-prueba-sala'))) && (await pres.isVisible('.p-prueba')),
  );
  comprobar(
    '…y «Siguiente» avisa de que avanzar solo la cierra',
    (await pres.textContent('.p-siguiente .p-rotulo'))?.includes('se cierra la prueba de sala'),
  );
  await pres.keyboard.press('Escape');
  comprobar('Esc en el presentador la quita de la sala', await hasta(sala, () => !document.querySelector('.capa-prueba-sala')));
  await ctx.close();
}

// ——— 3. Alerta del +20 % (con el reloj de Playwright: 50 s en una diapositiva de 40) ———
console.log('\nAlerta del +20 % en el presentador');
{
  const ctx = await navegador.newContext({ viewport: { width: 1366, height: 768 } });
  await ctx.clock.install();
  const sala = await ctx.newPage();
  vigilar(sala, 'alerta sala');
  await sala.goto(`${URL_ARCHIVO}#/1/0`);
  await listo(sala);
  const pres = await ctx.newPage();
  vigilar(pres, 'alerta presentador');
  await pres.goto(`${URL_ARCHIVO}?presentador#/1/0`);
  await listo(pres);
  await pres.keyboard.press('ArrowRight'); // arranca el cronómetro en la diapositiva 1 (duración 40 s)
  await ctx.clock.fastForward('00:45');
  await pausa(400);
  const aviso = await pres.evaluate(() => ({
    alerta: document.querySelector('.p-tiempos')?.hasAttribute('data-alerta'),
    estado: [...document.querySelectorAll('.p-datos dd')][1]?.dataset.estado,
  }));
  comprobar('A los 45 s de 40: aviso (ámbar), todavía sin alerta', !aviso.alerta && aviso.estado === 'aviso', JSON.stringify(aviso));
  await ctx.clock.fastForward('00:05');
  await pausa(400);
  const alerta = await pres.evaluate(() => ({
    alerta: document.querySelector('.p-tiempos')?.hasAttribute('data-alerta'),
    estado: [...document.querySelectorAll('.p-datos dd')][1]?.dataset.estado,
  }));
  comprobar('A los 50 s de 40 (más del +20 %): el panel del tiempo se pone en rojo', alerta.alerta && alerta.estado === 'mal', JSON.stringify(alerta));
  await pres.screenshot({ path: resolve(salida, 'presentador-alerta.png') });
  await ctx.close();
}

// ——— 4. La compilación falla con un dato por confirmar ———
console.log('\nRegistro de datos en la compilación');
{
  const { build } = await import('vite');
  // Dentro de la raíz del proyecto (Vite no compila un HTML de fuera) y en una carpeta ignorada por git.
  const carpeta = resolve(raiz, 'verificacion', 'pruebas', `datos-compilacion-${process.pid}`);
  await rm(carpeta, { recursive: true, force: true });
  await mkdir(carpeta, { recursive: true });
  await writeFile(resolve(carpeta, 'entrada.html'), '<!doctype html><script type="module" src="./entrada.ts"></script>\n');
  const compilar = async (id) => {
    await writeFile(resolve(carpeta, 'entrada.ts'), `// Diapositiva de prueba del registro.\nexport const usado = '${id}';\nconsole.log(usado);\n`);
    try {
      await build({
        root: raiz,
        configFile: resolve(raiz, 'vite.config.ts'),
        logLevel: 'silent',
        build: { outDir: resolve(carpeta, 'salida'), emptyOutDir: true, rollupOptions: { input: resolve(carpeta, 'entrada.html') } },
      });
      return { ok: true, mensaje: '' };
    } catch (error) {
      return { ok: false, mensaje: String(error?.message ?? error) };
    }
  };
  const mal = await compilar('dias-desde-primer-commit');
  comprobar(
    'vite build FALLA si se usa un dato «por confirmar», y dice cuál',
    !mal.ok && mal.mensaje.includes('dias-desde-primer-commit') && mal.mensaje.includes('por-confirmar'),
    mal.mensaje.split('\n')[0].slice(0, 160),
  );
  const bien = await compilar('commits-organizacion');
  comprobar('…y compila con un dato confirmado', bien.ok, bien.mensaje.slice(0, 160));
  await rm(carpeta, { recursive: true, force: true });
}

// ——— 5. Laboratorio ———
console.log('\nLaboratorio (lab.html, compilado con --mode lab, file://)');
{
  const lab = await compilarLab();
  const ctx = await navegador.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  vigilar(p, 'laboratorio');
  await p.goto(lab.url);
  await p.waitForFunction(() => window.__lab);
  const piezas = await p.evaluate(() => window.__lab.piezas());
  const motor = piezas.find((x) => x.id === 'prueba-motor');
  comprobar(
    'El laboratorio encuentra las piezas (*.lab.tsx) sin tocar el índice',
    motor && !motor.error && motor.posiciones === 4 && piezas.some((x) => x.id === 'prueba-sala' && !x.error),
    piezas.map((x) => `${x.id}${x.error ? ' (error)' : ''}`).join(', '),
  );
  const entradas = await p.evaluate(() => window.__lab.entradas());
  comprobar('…y las entradas registradas, con su movimiento y su fuente', entradas.some((e) => e.nombre === 'prueba-motor' && e.fuente.includes('globals.css')));

  await p.goto(`${lab.url}?pieza=prueba-motor&paso=1`);
  await p.waitForFunction(() => window.__lab?.estado().pieza === 'prueba-motor');
  await p.evaluate(() => window.__lab.esperar());
  const quieta = await p.evaluate(() => {
    const e = document.querySelector('.lab-escenario .capa[data-rol="actual"] [data-efecto="prueba-motor"]');
    return { opacidad: getComputedStyle(e).opacity, visibilidad: getComputedStyle(e).visibility, escala: document.querySelector('.lab-escenario').getBoundingClientRect().width };
  });
  comprobar(
    '?pieza=prueba-motor&paso=1 la enseña quieta en ese paso, a 1920 × 1080',
    quieta.opacidad === '1' && quieta.visibilidad === 'visible' && quieta.escala === 1920,
    JSON.stringify(quieta),
  );

  const leer = () =>
    p.evaluate(() => {
      const e = document.querySelector('.lab-escenario .capa[data-rol="actual"] [data-efecto="prueba-motor"]');
      const c = getComputedStyle(e);
      return {
        opacidad: Number(c.opacity),
        visibilidad: c.visibility,
        escala: c.transform === 'none' ? 1 : Number(c.transform.match(/matrix\(([^,]+)/)?.[1]),
        saliendo: e.hasAttribute('data-saliendo'),
      };
    });

  // Aparecer: 520 ms, cubic-bezier(0.22, 1, 0.36, 1) (globals.css:1387).
  const instantes = [0, 130, 260, 390, 520, 700];
  const vueltas = [];
  for (let vuelta = 0; vuelta < 2; vuelta++) {
    await p.evaluate(() => window.__lab.preparar('prueba-motor', 1));
    await p.evaluate(() => window.__lab.disparar());
    const medidas = [];
    for (const ms of instantes) {
      await p.evaluate((x) => window.__lab.cuadro(x), ms);
      medidas.push(await leer());
      if (vuelta === 0) await p.screenshot({ path: resolve(salida, `lab-aparecer-${String(ms).padStart(4, '0')}ms.png`) });
    }
    vueltas.push(medidas);
  }
  const [medidas] = vueltas;
  const esperadas = instantes.map((ms) => (ms >= 520 ? 1 : bezier(0.22, 1, 0.36, 1, ms / 520)));
  const desvio = Math.max(...medidas.map((m, i) => Math.abs(m.opacidad - esperadas[i])));
  comprobar(
    'Cuadro a cuadro desde t = 0: la opacidad sigue la curva y la duración de la web (±0,02)',
    desvio <= 0.02 && medidas[0].opacidad < 0.01,
    medidas.map((m, i) => `${instantes[i]} ms: ${m.opacidad.toFixed(3)} (${esperadas[i].toFixed(3)})`).join(' · '),
  );
  comprobar(
    '…también la escala de 0,985 a 1, y al terminar queda en el estado del CSS',
    Math.abs(medidas[0].escala - 0.985) < 0.001 && medidas[5].escala === 1 && medidas[5].opacidad === 1,
    medidas.map((m) => m.escala.toFixed(4)).join(' · '),
  );
  comprobar(
    '…y dos reproducciones dan los mismos cuadros',
    JSON.stringify(vueltas[0]) === JSON.stringify(vueltas[1]),
  );

  // Desaparecer: 420 ms, cubic-bezier(0.76, 0, 0.24, 1) (globals.css:1403); la línea sin efecto aparece de golpe.
  await p.evaluate(() => window.__lab.preparar('prueba-motor', 2));
  await p.evaluate(() => window.__lab.disparar());
  await p.evaluate(() => window.__lab.cuadro(0));
  const s0 = await leer();
  const corte0 = await p.evaluate(() => getComputedStyle(document.querySelector('[data-prueba="corte"]').closest('.entrada')).visibility);
  await p.evaluate(() => window.__lab.cuadro(210));
  const s1 = await leer();
  await p.evaluate(() => window.__lab.cuadro(500));
  const s2 = await leer();
  comprobar(
    'Salida animada (desaparecer): se ve al empezar, a mitad va por la curva y al final queda oculta',
    s0.opacidad === 1 && s0.saliendo && Math.abs(s1.opacidad - (1 - bezier(0.76, 0, 0.24, 1, 0.5))) <= 0.02 && s2.visibilidad === 'hidden' && !s2.saliendo,
    `${JSON.stringify(s0)} → ${JSON.stringify(s1)} → ${JSON.stringify(s2)}`,
  );
  comprobar('…y la <Entrada> sin efecto del mismo paso aparece de golpe en t = 0', corte0 === 'visible', corte0);

  // Transición propia de la segunda escena.
  await p.evaluate(() => window.__lab.preparar('prueba-motor', 3));
  await p.evaluate(() => window.__lab.disparar());
  const capa = (ms) =>
    p.evaluate(async (x) => {
      await window.__lab.cuadro(x);
      const c = document.querySelector('.lab-escenario .capa[data-id="prueba-motor-b"]');
      return { rol: c.dataset.rol, opacidad: Number(getComputedStyle(c).opacity), salientes: document.querySelectorAll('.lab-escenario .capa[data-rol="saliente"]').length };
    }, ms);
  const c0 = await capa(0);
  const c1 = await capa(700);
  comprobar(
    'Transición entre escenas: la de la segunda, desde t = 0, y al terminar no queda capa saliente',
    c0.rol === 'actual' && c0.opacidad < 0.01 && c1.opacidad === 1 && c1.salientes === 0,
    `${JSON.stringify(c0)} → ${JSON.stringify(c1)}`,
  );
  await p.evaluate(() => window.__lab.soltar());

  const momentos = await p.evaluate(() => window.__lab.momentos());
  comprobar(
    'Momentos animados (A-54) por escena: entrada y salida en la primera, transición en la segunda',
    JSON.stringify(momentos) === JSON.stringify({ 'prueba-motor-a': ['prueba-motor-sale@2', 'prueba-motor@1'], 'prueba-motor-b': ['transición'] }),
    JSON.stringify(momentos),
  );

  await p.goto(`${lab.url}?pieza=prueba-motor&paso=1&revision=1`);
  await p.waitForFunction(() => window.__lab?.estado().pieza === 'prueba-motor');
  comprobar('?revision=1 también en el laboratorio', await p.evaluate(() => document.documentElement.classList.contains('revision')));

  await p.goto(`${lab.url}?pieza=prueba-sala&paso=0`);
  await p.waitForFunction(() => window.__lab?.estado().pieza === 'prueba-sala');
  await p.evaluate(() => window.__lab.esperar());
  comprobar('La prueba de sala también se ve como pieza del laboratorio', await p.isVisible('.lab-escenario .prueba-sala .zh-cifra'));
  await p.screenshot({ path: resolve(salida, 'lab-prueba-sala.png') });
  comprobar('El laboratorio no deja avisos del motor', (await p.evaluate(() => window.__lab.problemas())).length === 0, (await p.evaluate(() => window.__lab.problemas())).join(' | '));
  await ctx.close();
  await lab.borrar();
}

await navegador.close();
comprobar('Sin errores en la consola', errores.length === 0, errores.slice(0, 6).join(' | '));

const fallos = resultados.filter((r) => !r.ok);
await writeFile(resolve(salida, `resultado-${canal}.json`), JSON.stringify({ canal, fecha: new Date().toISOString(), resultados, errores }, null, 2));
console.log(`\n${resultados.length - fallos.length} de ${resultados.length} comprobaciones de las novedades bien con ${canal}.`);
if (fallos.length) {
  console.log('Fallaron:');
  for (const f of fallos) console.log(`  - ${f.nombre}${f.detalle ? ` (${f.detalle})` : ''}`);
  process.exitCode = 1;
}
