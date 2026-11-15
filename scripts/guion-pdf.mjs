/**
 * El guion de la charla en PDF (rama diseno-wow, 14-nov). José: «dame el guion
 * ahora en PDF bonito, explicando la parte de cada quien».
 *
 * Todo sale del mazo compilado, así que el PDF dice lo mismo que la ventana
 * del presentador:
 *   - el orden, los tiempos y las notas del orador: window.__motor.diapositivas();
 *   - el cargo y quién es cada uno: el texto del relevo en pantalla (equipo.ts);
 *   - la miniatura de cada diapositiva: su estado final con ?revision=1;
 *   - las fotos: public/medios/equipo; el monograma: Logo3D.tsx (Z_PATH, H_PATH).
 * Lo único escrito aquí es lo que hace cada uno con las manos (PARTES y
 * MANOS): quién lleva el clicker y quién escribe en la calculadora.
 *
 *   npm run guion            (compila la vitrina antes)
 *   node scripts/guion-pdf.mjs [--dist dist-vitrina] [--salida docs/guion-vitrina.pdf]
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirNavegador } from './navegador.mjs';

const raiz = resolve(import.meta.dirname, '..');
const opcion = (nombre, porDefecto) => {
  const i = process.argv.indexOf(nombre);
  return i > 0 ? process.argv[i + 1] : porDefecto;
};
const dist = opcion('--dist', 'dist-vitrina');
const salida = resolve(raiz, opcion('--salida', join('docs', 'guion-vitrina.pdf')));

/* ——— Las personas: colores para papel claro (tinta), para el fondo oscuro (vivo) y de fondo (tenue) ——— */

const PERSONAS = {
  jose: { nombre: 'José Leonardo Reyes', corto: 'José', foto: 'jose-leonardo', tinta: '#a21caf', vivo: '#e879f9', tenue: '#fdf4ff' },
  gregory: { nombre: 'Gregory Martínez', corto: 'Gregory', foto: 'gregory', tinta: '#1d4ed8', vivo: '#60a5fa', tenue: '#eff6ff' },
  angel: { nombre: 'Angel Grullon', corto: 'Angel', foto: 'angel', tinta: '#c2410c', vivo: '#fb923c', tenue: '#fff7ed' },
};

/** Lo que hace cada uno, además de hablar. */
const PARTES = {
  jose: [
    'Abre la charla: se presenta, presenta al equipo y enseña lo que hemos construido.',
    'Le pasa el clicker a Gregory.',
    'Vuelve en la 10 con Lendex: el programa, la calculadora con el monto que diga el público y el cierre con el QR.',
  ],
  gregory: [
    'Recibe el clicker de José, se presenta y enseña Pymex, nuestro proyecto final del ITLA.',
    'Le pasa el clicker a Angel.',
  ],
  angel: [
    'Recibe el clicker de Gregory, se presenta y enseña nuestra web y las landings.',
    'Le pasa el clicker a José y se queda en la laptop.',
    'En la 12 escribe en la calculadora de Lendex el monto que diga el público.',
  ],
};

/** Qué pasa con las manos en cada diapositiva, si no es solo «habla y pulsa». */
const MANOS = {
  'relevo-gregory': 'José le da el clicker a Gregory',
  'relevo-angel': 'Gregory le da el clicker a Angel',
  'relevo-jose': 'Angel le da el clicker a José y se queda en la laptop',
  'vitrina-lendex-en-vivo': 'Habla José; Angel escribe en la laptop',
};

/** Título de cada turno, por la diapositiva con que empieza. */
const TURNOS = {
  portada: 'José abre la charla',
  'relevo-gregory': 'Gregory enseña Pymex',
  'relevo-angel': 'Angel enseña la web y las landings',
  'relevo-jose': 'José enseña Lendex y cierra',
};

/* ——— Utilidades ——— */

const escapar = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** El markdown de las notas: párrafos, **negrita** y [huecos] por rellenar. */
const md = (t) =>
  String(t)
    .split(/\n{2,}/)
    .map((p) =>
      `<p>${escapar(p)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]/g, '<span class="hueco">$1</span>')
        .replace(/\n/g, '<br>')}</p>`,
    )
    .join('');

const reloj = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const duracion = (s) => {
  const m = Math.floor(s / 60);
  const r = Math.round(s % 60);
  if (!m) return `${r} s`;
  return r ? `${m} min ${r} s` : `${m} min`;
};
const rango = (ns) => {
  const tramos = [];
  for (const n of ns) {
    const ultimo = tramos.at(-1);
    if (ultimo && n === ultimo[1] + 1) ultimo[1] = n;
    else tramos.push([n, n]);
  }
  return tramos.map(([a, b]) => (a === b ? `${a}` : `${a}–${b}`)).join(' y ');
};

const datosUrl = (ruta, tipo) => `data:${tipo};base64,${readFileSync(ruta).toString('base64')}`;
const foto = (id) => datosUrl(join(raiz, 'public', 'medios', 'equipo', PERSONAS[id].foto, 'foto.webp'), 'image/webp');

/** Separa lo que pasa en escena («La foto vuela sola…», «Sin hablar…») de lo que se dice. */
function partir(decir) {
  if (/^Sin hablar/.test(decir)) return { escena: decir, dices: '' };
  const m = decir.match(/^(La foto vuela sola[^.]*\.)\s*(.*)$/s);
  return m ? { escena: m[1], dices: m[2] } : { escena: '', dices: decir };
}

/**
 * Cuota francesa con interés en porcentaje: la rama FRENCH de calcularCuotas
 * (Calculadora.tsx, copiada de Lendex), con su redondeo cuota a cuota y la
 * última que ajusta. El total es la suma de las cuotas, como en la pantalla.
 */
function cuota(monto, tasa = 0.2, n = 12) {
  const redondear = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const pago = redondear((monto * (tasa * (1 + tasa) ** n)) / ((1 + tasa) ** n - 1));
  let resta = monto;
  let total = 0;
  for (let i = 1; i <= n; i++) {
    const interes = redondear(resta * tasa);
    const capital = i === n ? redondear(resta) : redondear(pago - interes);
    total += i === n ? redondear(capital + interes) : pago;
    resta -= capital;
  }
  return { cuota: pago, total: redondear(total) };
}
const pesos = (v) => `RD$${v.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ——— 1. Sacar del mazo las notas, los textos de los relevos y las miniaturas ——— */

const navegador = await abrirNavegador();
try {
  const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, colorScheme: null });
  const sala = await contexto.newPage();
  await sala.goto(`${pathToFileURL(join(raiz, dist, 'index.html')).href}?revision=1`);
  await sala.waitForFunction(() => window.__motor?.total > 0);
  const lista = await sala.evaluate(() => window.__motor.diapositivas());
  if (!lista[0].notas) throw new Error(`${dist} no trae las notas en __motor.diapositivas(): vuelve a compilar.`);

  const quien = {};
  for (const d of lista) {
    await sala.evaluate(([n, paso]) => window.__motor.ir(n, paso), [d.n, d.pasos]);
    await sala.evaluate(() => window.__motor.esperar());
    await sala.waitForTimeout(700);
    const jpg = await sala.screenshot({ type: 'jpeg', quality: 72 });
    d.miniatura = `data:image/jpeg;base64,${jpg.toString('base64')}`;
    if (d.id.startsWith('relevo-') && !quien[d.orador]) {
      quien[d.orador] = await sala.evaluate(() => {
        const capa = document.querySelector('.capa[data-rol="actual"]') ?? document;
        const texto = (sel) => capa.querySelector(sel)?.textContent?.trim() ?? '';
        return { cargo: texto('.relevo-cargo'), papel: texto('.relevo-papel') };
      });
    }
    process.stdout.write(`  ${d.n} ${d.titulo}\n`);
  }
  const problemas = await sala.evaluate(() => window.__motor.problemas());
  if (problemas.length) console.log('Problemas del motor:', JSON.stringify(problemas));
  await sala.close();

  /* ——— 2. Las cuentas ——— */

  let t = 0;
  for (const d of lista) {
    d.inicio = t;
    t += d.duracion;
  }
  const total = t;
  const orden = ['jose', 'gregory', 'angel'];
  const suyas = (id) => lista.filter((d) => d.orador === id);
  const turnos = [];
  for (const d of lista) {
    const ultimo = turnos.at(-1);
    if (ultimo && ultimo.orador === d.orador) ultimo.diapositivas.push(d);
    else turnos.push({ orador: d.orador, diapositivas: [d] });
  }
  const relevos = turnos.slice(1).map((tu, i) => {
    const antes = turnos[i];
    return { de: antes.orador, a: tu.orador, desde: antes.diapositivas.at(-1).n, hasta: tu.diapositivas[0].n };
  });

  /* ——— 3. El HTML ——— */

  const logo = readFileSync(join(raiz, 'src', 'marca', 'logo3d', 'Logo3D.tsx'), 'utf8');
  const trazo = (nombre) => logo.match(new RegExp(`const ${nombre} =\\s*"([^"]+)"`))?.[1] ?? '';
  const monograma = `<svg class="monograma" viewBox="350 340 545 440" aria-hidden="true">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f014b8"/><stop offset=".5" stop-color="#d43dde"/><stop offset="1" stop-color="#9f79ff"/></linearGradient></defs>
    <path d="${trazo('Z_PATH')}" fill="url(#g)"/><path d="${trazo('H_PATH')}" fill="url(#g)"/></svg>`;

  const fecha = new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' });

  const portada = `
  <section class="portada">
    <div class="portada__arriba">${monograma}<span>Zhonyas en el ITLA</span></div>
    <h1>El guion de la charla</h1>
    <p class="portada__bajada">Quién dice qué, diapositiva por diapositiva.</p>
    <div class="portada__tres">
      ${orden
        .map((id) => {
          const p = PERSONAS[id];
          const ds = suyas(id);
          return `<figure style="--vivo:${p.vivo}">
            <img src="${foto(id)}" alt="">
            <figcaption><strong>${p.nombre}</strong>
            <span>Diapositivas ${rango(ds.map((d) => d.n))}</span><span>${duracion(ds.reduce((s, d) => s + d.duracion, 0))}</span></figcaption>
          </figure>`;
        })
        .join('')}
    </div>
    <p class="portada__pie">${lista.length} diapositivas · ${duracion(total)} sin las preguntas · ${fecha}</p>
  </section>`;

  const reparto = `
  <section class="reparto">
    <h2>La parte de cada uno</h2>
    <p class="entrada">Hablamos por turnos, y el clicker pasa de mano en cada relevo. Al entrar, la foto de cada uno vuela sola a su sitio y en pantalla salen su nombre, su cargo y quién es; no hay que pulsar nada.</p>
    <div class="reparto__tres">
      ${orden
        .map((id) => {
          const p = PERSONAS[id];
          const ds = suyas(id);
          const q = quien[id] ?? {};
          return `<article style="--c:${p.tinta};--tenue:${p.tenue}">
            <img src="${foto(id)}" alt="">
            <h3>${p.nombre}</h3>
            <p class="cargo">${escapar(q.cargo ?? '')}</p>
            <p class="papel">${escapar(q.papel ?? '')}</p>
            <dl>
              <div><dt>Diapositivas</dt><dd>${rango(ds.map((d) => d.n))}</dd></div>
              <div><dt>Tiempo</dt><dd>${duracion(ds.reduce((s, d) => s + d.duracion, 0))}</dd></div>
            </dl>
            <ul>${PARTES[id].map((x) => `<li>${escapar(x)}</li>`).join('')}</ul>
          </article>`;
        })
        .join('')}
    </div>

    <h3 class="sub">El orden</h3>
    <div class="cinta">
      ${lista
        .map((d) => `<div style="flex:${d.duracion};--c:${PERSONAS[d.orador].tinta}" title="${escapar(d.titulo)}"><span>${d.n}</span></div>`)
        .join('')}
    </div>
    <div class="marcas">
      ${Array.from({ length: Math.floor(total / 60) + 1 }, (_, m) => `<span style="left:${((m * 60) / total) * 100}%">${m}:00</span>`).join('')}
    </div>
    <ol class="leyenda">
      ${turnos
        .map(
          (tu) => `<li style="--c:${PERSONAS[tu.orador].tinta}"><b>${rango(tu.diapositivas.map((d) => d.n))}</b> ${escapar(TURNOS[tu.diapositivas[0].id] ?? PERSONAS[tu.orador].corto)} <span>desde ${reloj(tu.diapositivas[0].inicio)}</span></li>`,
        )
        .join('')}
    </ol>

    <h3 class="sub">Los relevos</h3>
    <ul class="relevos">
      ${relevos
        .map(
          (r) => `<li><span class="paso">${r.desde} → ${r.hasta}</span> <b style="color:${PERSONAS[r.de].tinta}">${PERSONAS[r.de].corto}</b> le da el clicker a <b style="color:${PERSONAS[r.a].tinta}">${PERSONAS[r.a].corto}</b>${r.de === 'angel' ? ', y Angel se queda en la laptop para la 12' : ''}.</li>`,
        )
        .join('')}
    </ul>
  </section>`;

  const tarjeta = (d) => {
    const p = PERSONAS[d.orador];
    const notas = Array.isArray(d.notas) ? d.notas : [{ decir: d.notas, claves: '' }];
    const pasos = notas
      .map((nota, i) => {
        const { escena, dices } = partir(nota.decir);
        const rotulo = notas.length > 1 ? `<p class="momento">${i === 0 ? 'Al llegar' : `Con el clic ${i}`}</p>` : '';
        return `${rotulo}
          ${escena ? `<p class="escena">${escapar(escena)}</p>` : ''}
          ${dices ? `<div class="dices"><p class="rot">Dices</p><blockquote>${md(dices)}</blockquote></div>` : ''}
          ${nota.despues ? `<div class="despues"><p class="rot">Después</p>${md(nota.despues)}</div>` : ''}
          ${nota.claves ? `<ul class="claves">${nota.claves.split(' · ').map((c) => `<li>${escapar(c)}</li>`).join('')}</ul>` : ''}
          ${nota.aparte ? `<div class="aparte"><p class="rot">Aparte, no se dice</p>${md(nota.aparte)}</div>` : ''}
          ${nota.siFalla ? `<div class="falla"><p class="rot">Si falla</p>${md(nota.siFalla)}</div>` : ''}`;
      })
      .join('');
    return `<article class="diapo" style="--c:${p.tinta};--tenue:${p.tenue}">
      <header>
        <span class="num">${d.n}</span>
        <h4>${escapar(d.titulo)}</h4>
        <span class="meta">${escapar(MANOS[d.id] ?? `Habla ${p.corto}`)} · ${duracion(d.duracion)} · desde ${reloj(d.inicio)}</span>
      </header>
      <div class="cuerpo">
        <img class="mini" src="${d.miniatura}" alt="">
        <div class="texto">${pasos}</div>
      </div>
    </article>`;
  };

  const bloques = turnos
    .map((tu) => {
      const p = PERSONAS[tu.orador];
      const ds = tu.diapositivas;
      const cabeza = `<header class="turno__cabeza">
          <img src="${foto(tu.orador)}" alt="">
          <div>
            <h2>${escapar(TURNOS[ds[0].id] ?? p.corto)}</h2>
            <p>Diapositivas ${rango(ds.map((d) => d.n))} · ${duracion(ds.reduce((s, d) => s + d.duracion, 0))} · desde ${reloj(ds[0].inicio)}</p>
          </div>
        </header>`;
      return `<section class="turno" style="--c:${p.tinta};--tenue:${p.tenue}">
        <div class="junto">${cabeza}${tarjeta(ds[0])}</div>
        ${ds.slice(1).map(tarjeta).join('')}
      </section>`;
    })
    .join('');

  const montos = [5000, 10000, 20000, 25000, 50000, 100000];
  const dia = `
  <section class="dia">
    <h2>El día de la charla</h2>
    <div class="dia__dos">
      <div>
        <h3 class="sub">Antes de empezar</h3>
        <ol class="lista">
          <li>Copiar a la laptop la carpeta <b>dist-vitrina</b> entera: el <b>index.html</b> y, al lado, la carpeta <b>medios</b>, que lleva los videos y las fotos.</li>
          <li>Abrir <b>index.html</b> en Chrome, con la laptop conectada al proyector. No hace falta internet.</li>
          <li>Pulsar <b>P</b>: se abre la ventana del presentador, con estas notas, para la pantalla de la laptop. La de la sala va al proyector, en pantalla completa con <b>F</b>.</li>
          <li>Probar el clicker: → pasa a la siguiente y ← vuelve.</li>
        </ol>
        <h3 class="sub">Teclas</h3>
        <table class="teclas">
          <tr><td><kbd>→</kbd> o clic</td><td>Siguiente</td></tr>
          <tr><td><kbd>←</kbd></td><td>Anterior</td></tr>
          <tr><td>Número + <kbd>Intro</kbd></td><td>Saltar a esa diapositiva (12 + Intro: la calculadora)</td></tr>
          <tr><td><kbd>.</kbd> o <kbd>B</kbd></td><td>Pantalla en negro, y otra vez para volver</td></tr>
          <tr><td><kbd>F</kbd></td><td>Pantalla completa</td></tr>
          <tr><td><kbd>P</kbd></td><td>Ventana del presentador</td></tr>
        </table>
      </div>
      <div>
        <h3 class="sub">Lendex en vivo: las cuentas</h3>
        <p class="nota">Al 20 % mensual y en 12 cuotas, como viene puesta. Para José, por si hay que decirlo de memoria; esto no se proyecta.</p>
        <table class="cuentas">
          <thead><tr><th>Monto</th><th>Cuota al mes</th><th>Total en un año</th></tr></thead>
          <tbody>${montos
            .map((m) => {
              const c = cuota(m);
              return `<tr><td>${pesos(m)}</td><td>${pesos(c.cuota)}</td><td>${pesos(c.total)}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
        <p class="nota">Sea cual sea el monto, en un año se paga 2.70 veces lo prestado: por eso «casi tres veces» vale para cualquier cifra.</p>
        <h3 class="sub">Angel, en la 12</h3>
        <ol class="lista">
          <li>Clic en <b>Monto</b>: se selecciona solo.</li>
          <li>Escribir el número sin punto ni coma. La cuota cambia al momento.</li>
          <li>Para seguir, → en el clicker: suelta el campo y pasa al cierre.</li>
        </ol>
      </div>
    </div>
  </section>`;

  const css = `
  @page { size: A4; margin: 15mm 15mm 17mm;
    @bottom-left { content: "Zhonyas en el ITLA · el guion"; font: 7.5pt Arial, sans-serif; color: #8a8697; }
    @bottom-right { content: counter(page) " de " counter(pages); font: 7.5pt Arial, sans-serif; color: #8a8697; } }
  @page tapa { margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-family: Arial, Helvetica, sans-serif; font-size: 9.5pt; line-height: 1.45; color: #17141f;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  b, strong { font-weight: 700; }
  h2 { font-size: 21pt; line-height: 1.1; letter-spacing: -0.02em; }
  .sub { font-size: 11pt; margin: 7mm 0 2.5mm; }

  /* Tapa */
  .portada { page: tapa; position: relative; width: 210mm; height: 297mm; padding: 22mm 20mm; color: #fff; overflow: hidden;
    background: radial-gradient(ellipse 120mm 90mm at 88% 4%, #d43dde55, transparent 70%),
                radial-gradient(ellipse 140mm 110mm at 0% 100%, #9f79ff40, transparent 70%), #06060b; }
  .portada__arriba { display: flex; align-items: center; gap: 4mm; font-size: 11pt; color: #cfc9dc; }
  .monograma { width: 15mm; height: auto; }
  .portada h1 { margin-top: 34mm; font-size: 46pt; line-height: 1; letter-spacing: -0.045em; max-width: 150mm; }
  .portada__bajada { margin-top: 7mm; font-size: 16pt; color: #d9d4e6; }
  .portada__bajada::after { content: ""; display: block; width: 42mm; height: 1.2mm; margin-top: 9mm; border-radius: 1mm;
    background: linear-gradient(90deg, #f014b8, #d43dde, #9f79ff); }
  .portada__tres { position: absolute; left: 20mm; right: 20mm; bottom: 38mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 7mm; }
  .portada__tres img { display: block; width: 100%; aspect-ratio: 440 / 560; object-fit: cover; border-radius: 4mm; border: 0.3mm solid #ffffff25; }
  .portada__tres figcaption { margin-top: 3.5mm; }
  .portada__tres strong { display: block; font-size: 11.5pt; }
  .portada__tres span { display: block; margin-top: 0.8mm; font-size: 9pt; color: var(--vivo); }
  .portada__pie { position: absolute; left: 20mm; right: 20mm; bottom: 20mm; padding-top: 4mm; border-top: 0.3mm solid #ffffff22; font-size: 9pt; color: #a9a3b8; }

  /* Reparto */
  .reparto { break-before: page; }
  .entrada { margin-top: 3mm; max-width: 165mm; font-size: 10.5pt; color: #47434f; }
  .reparto__tres { margin-top: 7mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 5mm; }
  .reparto__tres article { padding: 4mm; border-radius: 3mm; background: var(--tenue); border-top: 1.2mm solid var(--c); }
  .reparto__tres img { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; object-position: 50% 25%; border-radius: 2mm; }
  .reparto__tres h3 { margin-top: 3.5mm; font-size: 11pt; }
  .cargo { margin-top: 0.5mm; color: var(--c); font-weight: 700; }
  .papel { margin-top: 1.5mm; }
  .reparto__tres dl { margin-top: 3mm; display: grid; grid-template-columns: 1fr 1fr; gap: 2mm; }
  .reparto__tres dt { font-size: 7.5pt; color: #6b6777; }
  .reparto__tres dd { font-weight: 700; }
  .reparto__tres ul { margin-top: 3mm; padding-left: 4mm; display: grid; gap: 1.5mm; font-size: 9pt; }
  .cinta { display: flex; gap: 0.6mm; height: 9mm; }
  .cinta div { display: flex; align-items: center; justify-content: center; border-radius: 1.2mm; background: var(--c); color: #fff; font-weight: 700; font-size: 8pt; }
  .marcas { position: relative; height: 5mm; margin-top: 1mm; font-size: 7pt; color: #6b6777; }
  .marcas span { position: absolute; top: 0; transform: translateX(-50%); }
  .marcas span:first-child { transform: none; }
  .leyenda { list-style: none; margin-top: 2mm; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5mm 6mm; }
  .leyenda li { padding-left: 3.5mm; border-left: 1.2mm solid var(--c); }
  .leyenda b { color: var(--c); margin-right: 1mm; }
  .leyenda span { color: #6b6777; }
  .relevos { list-style: none; display: grid; gap: 1.8mm; }
  .relevos .paso { display: inline-block; min-width: 13mm; font-weight: 700; color: #6b6777; }

  /* Turnos y diapositivas */
  .turno:first-of-type { break-before: page; }
  .reparto + .turno { break-before: page; }
  .turno + .turno { margin-top: 10mm; }
  .junto { break-inside: avoid; }
  .turno__cabeza { display: flex; align-items: center; gap: 5mm; padding-bottom: 5mm; margin-bottom: 5mm; border-bottom: 0.8mm solid var(--c); }
  .turno__cabeza img { width: 17mm; height: 17mm; border-radius: 50%; object-fit: cover; object-position: 50% 25%; }
  .turno__cabeza h2 { color: var(--c); }
  .turno__cabeza p { margin-top: 1.5mm; color: #5b5767; }
  .diapo { break-inside: avoid; margin-bottom: 6mm; padding: 4mm; border-radius: 3mm; border: 0.3mm solid #e7e3ee; border-left: 1.2mm solid var(--c); }
  .diapo header { display: flex; align-items: baseline; gap: 3mm; flex-wrap: wrap; margin-bottom: 3mm; }
  .num { display: inline-flex; align-items: center; justify-content: center; min-width: 7mm; height: 7mm; padding: 0 1.5mm; border-radius: 3.5mm;
    background: var(--c); color: #fff; font-weight: 700; font-size: 9pt; align-self: center; }
  .diapo h4 { font-size: 12.5pt; }
  .meta { margin-left: auto; color: #6b6777; font-size: 8.5pt; }
  .cuerpo { display: grid; grid-template-columns: 68mm 1fr; gap: 5mm; align-items: start; }
  .mini { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 1.5mm; box-shadow: 0 0 0 0.3mm #00000018; }
  .texto > * + * { margin-top: 2.5mm; }
  .momento { font-weight: 700; color: var(--c); }
  .momento:not(:first-child) { margin-top: 4mm; padding-top: 3mm; border-top: 0.3mm dashed #ddd8e6; }
  .escena { font-style: italic; color: #5b5767; }
  .rot { font-size: 7.5pt; font-weight: 700; color: #6b6777; margin-bottom: 0.8mm; }
  .dices blockquote { padding: 2.5mm 3.5mm; border-radius: 2mm; background: var(--tenue); font-size: 11pt; line-height: 1.4; }
  .dices blockquote p + p, .despues p + p, .aparte p + p, .falla p + p { margin-top: 1.5mm; }
  .claves { list-style: none; display: flex; flex-wrap: wrap; gap: 1.2mm; }
  .claves li { padding: 0.6mm 2.2mm; border-radius: 3mm; border: 0.3mm solid var(--c); color: var(--c); font-size: 8pt; }
  .aparte { padding: 2mm 3mm; border-radius: 2mm; background: #f6f5f8; }
  .falla { padding: 2mm 3mm; border-radius: 2mm; background: #fff8eb; }
  .falla .rot { color: #a15c00; }
  .hueco { padding: 0 1mm; border-radius: 1mm; background: #fde68a; }

  /* El día */
  .dia { break-before: page; }
  .dia__dos { display: grid; grid-template-columns: 1fr 1fr; gap: 9mm; }
  .lista { padding-left: 5mm; display: grid; gap: 2mm; }
  table { width: 100%; border-collapse: collapse; }
  .teclas td { padding: 1.8mm 0; border-bottom: 0.3mm solid #ece9f1; vertical-align: top; }
  .teclas td:first-child { width: 33mm; white-space: nowrap; }
  kbd { display: inline-block; min-width: 5.5mm; padding: 0.2mm 1.4mm; border-radius: 1mm; border: 0.3mm solid #c9c4d4; border-bottom-width: 0.7mm;
    font: 700 8.5pt Arial, sans-serif; text-align: center; background: #fff; }
  .cuentas th { text-align: right; font-size: 8pt; color: #6b6777; padding: 0 0 1.5mm; border-bottom: 0.5mm solid #17141f; }
  .cuentas td { text-align: right; padding: 1.6mm 0; border-bottom: 0.3mm solid #ece9f1; font-variant-numeric: tabular-nums; }
  .cuentas th:first-child, .cuentas td:first-child { text-align: left; font-weight: 700; }
  .nota { color: #5b5767; margin-bottom: 2.5mm; }
  .cuentas + .nota { margin-top: 2.5mm; }
  `;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>El guion de la charla · Zhonyas en el ITLA</title><style>${css}</style></head>
  <body>${portada}${reparto}${bloques}${dia}</body></html>`;

  /* ——— 4. El PDF ——— */

  const hoja = await contexto.newPage();
  await hoja.setContent(html, { waitUntil: 'load' });
  await hoja.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(salida), { recursive: true });
  await hoja.pdf({ path: salida, printBackground: true, preferCSSPageSize: true });
  if (process.argv.includes('--html')) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync(salida.replace(/\.pdf$/, '.html'), html);
  }
  console.log(`\nGuion: ${relative(raiz, salida)} · ${lista.length} diapositivas · ${duracion(total)}`);
} finally {
  await navegador.close();
}
