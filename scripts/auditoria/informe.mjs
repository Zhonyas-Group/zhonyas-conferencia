/**
 * El informe legible de la auditoría (Markdown) y su copia en JSON.
 * Cómo leerlo: docs/MOTOR.md §12.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { contar } from './auditor.mjs';
import { AVISO, FALLO, REGLAS, UMBRAL } from './reglas.mjs';

const celda = (t) => String(t ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const codigo = (t) => (t ? `\`${String(t).replace(/`/g, 'ˋ')}\`` : '');
const nombreRegla = (id) => `${id} · ${REGLAS[id]?.nombre ?? id}`;
const fecha = (d) =>
  d.toLocaleString('es-DO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Santo_Domingo' });
const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export async function escribirInforme(resultado, { rutaMd, origen, raiz }) {
  const { fallos, avisos, excepciones } = contar(resultado);
  const dir = dirname(rutaMd);
  const enlace = (ruta) => relative(dir, ruta).replace(/\\/g, '/');
  const L = [];
  const pasa = fallos.length === 0;

  L.push('# Auditoría anti-slop', '');
  L.push(
    `**${pasa ? 'PASA' : 'FALLA'}** · ${plural(fallos.length, 'fallo', 'fallos')} en ${plural(new Set(fallos.map((h) => h.regla)).size, 'regla', 'reglas')} · ${plural(avisos.length, 'aviso', 'avisos')} · ${plural(excepciones.length, 'excepción declarada', 'excepciones declaradas')}`,
    '',
  );
  const pantallas = resultado.pantallas;
  const diapositivas = new Set(pantallas.map((p) => p.diapositiva));
  L.push(`- **Qué:** ${origen}`);
  if (resultado.url) {
    L.push(
      `- **Pantallas:** ${plural(pantallas.length, 'pantalla', 'pantallas')} de ${plural(diapositivas.size, resultado.modo === 'lab' ? 'escena' : 'diapositiva', resultado.modo === 'lab' ? 'escenas' : 'diapositivas')}, cada paso a 1920 × 1080 en \`?revision=1\` (estado final), con ${resultado.navegador ? `Chrome/Edge ${resultado.navegador}` : 'el navegador del equipo'}.`,
    );
    if (resultado.mediaPalabras !== undefined) L.push(`- **Palabras:** media de ${String(resultado.mediaPalabras).replace('.', ',')} por ${resultado.modo === 'lab' ? 'escena' : 'diapositiva'} (A-09 pide ${UMBRAL.palabrasMedia} o menos; sin contar las fuentes).`);
  }
  if (resultado.codigo) {
    const a = resultado.codigo.archivos;
    L.push(
      `- **Código:** ${plural(a.mazo + a.tokens, 'archivo', 'archivos')} del mazo (src/diapositivas, src/marca y marca.css), ${a.letra} de la letra del motor y ${a.motor} del motor${a.trampa ? ` y ${a.trampa} de la trampa del auditor` : ''}.${resultado.codigo.fuera.length ? ` Fuera: ${resultado.codigo.fuera.map(codigo).join(', ')} (la trampa del propio auditor; la revisa \`scripts/probar-auditor.mjs\`).` : ''}`,
    );
  }
  L.push(`- **Cuándo:** ${fecha(resultado.fecha)} (hora de RD).`);
  L.push('- **Cómo leerlo:** [docs/MOTOR.md §12](' + enlace(join(raiz, 'docs', 'MOTOR.md')) + '). Cada fallo de pantalla tiene su número en la captura de esa pantalla.', '');

  // ——— Resumen por regla ———
  const porRegla = new Map();
  for (const h of [...fallos, ...avisos, ...excepciones]) {
    if (!porRegla.has(h.regla)) porRegla.set(h.regla, { fallos: 0, avisos: 0, excepciones: 0, donde: new Set() });
    const r = porRegla.get(h.regla);
    if (h.excepcion) r.excepciones++;
    else if (h.gravedad === FALLO) r.fallos++;
    else r.avisos++;
    r.donde.add(h.pantalla ? (resultado.modo === 'lab' ? `${h.pantalla.id}·p${h.pantalla.paso}` : `${h.pantalla.n ?? h.pantalla.id}·p${h.pantalla.paso}`) : h.archivo ? `${h.archivo.replace(/^src\//, '')}` : 'mazo');
  }
  L.push('## Resumen por regla', '');
  if (porRegla.size) {
    L.push('| Regla | Qué exige | Fallos | Avisos | Excep. | Dónde |', '|---|---|---:|---:|---:|---|');
    const orden = Object.keys(REGLAS);
    for (const [id, r] of [...porRegla].sort((a, b) => b[1].fallos - a[1].fallos || orden.indexOf(a[0]) - orden.indexOf(b[0]))) {
      const donde = [...r.donde];
      L.push(
        `| **${celda(nombreRegla(id))}** | ${celda(REGLAS[id]?.exige ?? '')} | ${r.fallos || ''} | ${r.avisos || ''} | ${r.excepciones || ''} | ${celda(donde.slice(0, 8).join(', ') + (donde.length > 8 ? ` y ${donde.length - 8} más` : ''))} |`,
      );
    }
    L.push('');
  }
  // Solo las reglas que de verdad se miraron: las del código si se auditó el código, las de pantalla si hubo pantallas.
  const DE_CODIGO = new Set(['A-55', 'A-34', 'A-38', 'A-45', 'A-61']);
  const limpias = Object.keys(REGLAS).filter(
    (id) => id !== 'medida' && !porRegla.has(id) && ((resultado.url && id !== 'A-55') || (resultado.codigo && DE_CODIGO.has(id))),
  );
  if (limpias.length) L.push(`**Sin ningún hallazgo:** ${limpias.map((id) => nombreRegla(id)).join(' · ')}.`, '');
  L.push('En la columna «Dónde», `3·p1` es la diapositiva 3 en el paso 1; un nombre de archivo es un hallazgo del código.', '');

  // ——— Pantallas ———
  if (resultado.url) {
    const conHallazgos = pantallas.filter((p) => p.hallazgos.length);
    const sin = pantallas.filter((p) => !p.hallazgos.length);
    L.push('## Pantallas', '');
    if (!conHallazgos.length) L.push('Ninguna pantalla tiene hallazgos.', '');
    for (const p of conHallazgos) {
      const f = p.hallazgos.filter((h) => h.gravedad === FALLO && !h.excepcion).length;
      L.push(`### ${p.clave} — ${f ? plural(f, 'fallo', 'fallos') : 'sin fallos'}${p.titulo ? ` · «${celda(p.titulo)}»` : ''}`, '');
      if (p.captura) L.push(`![${celda(p.clave)}](${enlace(p.captura)})`, '');
      L.push('| # | Regla | Qué pasa | Medida | Límite | Dónde |', '|---:|---|---|---|---|---|');
      for (const h of p.hallazgos) {
        const estado = h.excepcion ? ' (excepción)' : h.gravedad === AVISO ? ' (aviso)' : '';
        L.push(
          `| ${h.n ?? ''} | ${celda(h.regla)}${estado} | ${celda(h.mensaje)}${h.excepcion ? ` — *motivo: ${celda(h.excepcion)}*` : ''} | ${celda(h.medida)} | ${celda(h.limite)} | ${h.donde ? codigo(celda(h.donde)) : ''} |`,
        );
      }
      L.push('');
    }
    if (sin.length) L.push(`**Pantallas sin hallazgos (${sin.length}):** ${sin.map((p) => p.clave).join(' · ')}.`, '');
  }

  // ——— Código ———
  if (resultado.codigo) {
    const hs = resultado.codigo.hallazgos;
    L.push('## Código', '');
    if (!hs.length) L.push('Ningún hallazgo en el código.', '');
    const grupos = [
      ['Fallos', hs.filter((h) => h.gravedad === FALLO && !h.excepcion)],
      ['Avisos (interfaz del motor: no la ve el público como parte de la charla)', hs.filter((h) => h.gravedad === AVISO && !h.excepcion)],
      ['Excepciones', hs.filter((h) => h.excepcion)],
    ];
    for (const [titulo, lista] of grupos) {
      if (!lista.length) continue;
      L.push(`### ${titulo} (${lista.length})`, '');
      L.push('| Regla | Archivo:línea | Qué pasa | Código |', '|---|---|---|---|');
      for (const h of lista) {
        L.push(
          `| ${celda(h.regla)} | ${codigo(`${h.archivo}${h.linea ? `:${h.linea}` : ''}`)} | ${celda(h.mensaje)}${h.excepcion ? ` — *motivo: ${celda(h.excepcion)}*` : ''} | ${codigo(celda(h.codigo))} |`,
        );
      }
      L.push('');
    }
  }

  // ——— Avisos generales ———
  if (resultado.avisos.length) {
    L.push('## Avisos generales', '');
    for (const a of resultado.avisos) L.push(`- **${celda(a.regla)}:** ${a.mensaje}`);
    L.push('');
  }

  L.push('## Lo que esta auditoría no mide', '');
  L.push(
    '- El texto dentro de imágenes, videos y lienzos WebGL (no es texto del DOM), ni si una captura de producto es legible.',
    '- Lo que pasa *durante* una animación: mide el estado final de cada paso (`?revision=1`). Las curvas y duraciones se revisan en el código (A-55) y en el laboratorio (`npm run lab:cuadros`).',
    '- A-01, A-02, A-04, A-06, A-08, A-11, A-17, A-22, A-24, A-27, A-47, A-54 y A-70 a A-72: piden criterio (o los cuenta el motor, como A-54). Ver 06 §11.',
    '- El contraste se calcula con el color del CSS sobre la captura; el del proyector del aula se mira con la prueba de sala (tecla T).',
    '',
  );
  await mkdir(dir, { recursive: true });
  await writeFile(rutaMd, L.join('\n'), 'utf8');
  return { fallos: fallos.length, avisos: avisos.length, excepciones: excepciones.length };
}

/** La misma auditoría en JSON (para otras herramientas). */
export async function escribirJson(resultado, ruta) {
  const { fallos, avisos, excepciones } = contar(resultado);
  const limpio = {
    ...resultado,
    fecha: resultado.fecha.toISOString(),
    resumen: { pasa: fallos.length === 0, fallos: fallos.length, avisos: avisos.length, excepciones: excepciones.length },
  };
  await mkdir(dirname(ruta), { recursive: true });
  await writeFile(ruta, JSON.stringify(limpio, null, 1), 'utf8');
}
