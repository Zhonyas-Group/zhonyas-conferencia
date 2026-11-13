/**
 * Comprobaciones de las composiciones, solo en desarrollo (npm run dev y el
 * laboratorio). Avisan con fijarProblema, en la sala, en el presentador y en
 * la franja del laboratorio. En la compilación de la charla no hacen nada.
 *
 *   - El titular empieza en x = 115, y = 115 (± 2 px) y no pasa de 2 líneas
 *     (síntesis §4.3; A-04, A-28, A-29).
 *   - Un texto encima de una imagen a sangre llega a 7:1 contra lo que tiene
 *     detrás (A-36; crítica C-19). Se mide la luminancia de la imagen bajo cada
 *     línea de texto, tal como se ve (object-fit y object-position), y se toma
 *     el percentil 95: lo más claro que el texto tiene detrás, sin que un píxel
 *     suelto decida.
 */
import { fijarProblema } from '../../motor/diagnostico';

const ANCHO = 1920;
const ALTO = 1080;
const MARGEN = 115; // síntesis §4.3; --zh-margen de marca.css
const TOLERANCIA_PX = 2; // síntesis §4.3: «x = 115 e y = 115 (±2 px)»
const LINEAS_MAX = 2; // A-04
const CONTRASTE_MIN = 7; // A-36 (WCAG 1.4.6, AAA); síntesis §1.3 fila 12

/** Caja de un elemento en píxeles del escenario (1920 × 1080), sea cual sea la escala. */
function enEscenario(rect: DOMRect, capa: DOMRect) {
  const escala = capa.width / ANCHO || 1;
  return {
    x: (rect.left - capa.left) / escala,
    y: (rect.top - capa.top) / escala,
    ancho: rect.width / escala,
    alto: rect.height / escala,
  };
}

/** Revisa la posición y las líneas de un titular. */
export function revisarTitular(el: HTMLElement, idDiapositiva: string) {
  const capa = el.closest<HTMLElement>('.diapositiva');
  if (!capa) return;
  const caja = enEscenario(el.getBoundingClientRect(), capa.getBoundingClientRect());
  const interlinea = parseFloat(getComputedStyle(el).lineHeight);
  const lineas = interlinea > 0 ? Math.round(caja.alto / interlinea) : 1;
  const fallos: string[] = [];
  if (Math.abs(caja.x - MARGEN) > TOLERANCIA_PX || Math.abs(caja.y - MARGEN) > TOLERANCIA_PX)
    fallos.push(`empieza en x = ${Math.round(caja.x)}, y = ${Math.round(caja.y)} y debe empezar en 115, 115 (síntesis §4.3)`);
  if (lineas > LINEAS_MAX) fallos.push(`ocupa ${lineas} líneas y el máximo es ${LINEAS_MAX} (A-04)`);
  fijarProblema(
    `titular:${idDiapositiva}`,
    fallos.length ? `«${idDiapositiva}»: el titular ${fallos.join('; ')}.` : null,
  );
}

// ——— Contraste sobre una imagen a sangre ———

function luminancia(r: number, g: number, b: number): number {
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

function colorCss(texto: string): [number, number, number] {
  const m = texto.match(/[\d.]+/g)?.map(Number) ?? [255, 255, 255];
  return [m[0], m[1], m[2]];
}

/** Donde se pinta una imagen dentro de su caja, según object-fit y object-position. */
function dibujo(img: HTMLImageElement, caja: { x: number; y: number; ancho: number; alto: number }) {
  const estilo = getComputedStyle(img);
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  let ancho = caja.ancho;
  let alto = caja.alto;
  if (estilo.objectFit === 'cover' || estilo.objectFit === 'contain') {
    const s = (estilo.objectFit === 'cover' ? Math.max : Math.min)(caja.ancho / nw, caja.alto / nh);
    ancho = nw * s;
    alto = nh * s;
  } else if (estilo.objectFit === 'none') {
    ancho = nw;
    alto = nh;
  }
  const [px = '50%', py = '50%'] = estilo.objectPosition.split(/\s+/);
  const lugar = (v: string, libre: number) => (v.endsWith('%') ? (parseFloat(v) / 100) * libre : parseFloat(v));
  return { x: caja.x + lugar(px, caja.ancho - ancho), y: caja.y + lugar(py, caja.alto - alto), ancho, alto };
}

/**
 * Mide el contraste de cada texto contra la imagen que tiene debajo.
 * `textos`: nombre para el aviso y elemento. Devuelve la promesa de la medida.
 */
export async function revisarContraste(
  img: HTMLImageElement,
  textos: readonly (readonly [string, HTMLElement])[],
  idDiapositiva: string,
): Promise<void> {
  const clave = `contraste:${idDiapositiva}`;
  try {
    await img.decode();
  } catch {
    return;
  }
  const capa = img.closest<HTMLElement>('.diapositiva');
  if (!capa || !img.naturalWidth) return;
  const rCapa = capa.getBoundingClientRect();
  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const c = lienzo.getContext('2d', { willReadFrequently: true });
  if (!c) return;
  c.fillStyle = getComputedStyle(capa).backgroundColor;
  c.fillRect(0, 0, ANCHO, ALTO);
  const caja = enEscenario(img.getBoundingClientRect(), rCapa);
  const d = dibujo(img, caja);
  c.save();
  c.beginPath();
  c.rect(caja.x, caja.y, caja.ancho, caja.alto);
  c.clip();
  c.drawImage(img, d.x, d.y, d.ancho, d.alto);
  c.restore();

  const fallos: string[] = [];
  for (const [nombre, el] of textos) {
    // Una caja por línea de cada nodo de texto (no la del bloque entero, que llega al margen derecho).
    const cajas: DOMRect[] = [];
    const recorrido = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let nodo = recorrido.nextNode(); nodo; nodo = recorrido.nextNode()) {
      const rango = document.createRange();
      rango.selectNodeContents(nodo);
      cajas.push(...rango.getClientRects());
    }
    const lums: number[] = [];
    for (const r of cajas) {
      const b = enEscenario(r, rCapa);
      const x = Math.max(0, Math.floor(b.x));
      const y = Math.max(0, Math.floor(b.y));
      const w = Math.min(ANCHO - x, Math.ceil(b.ancho));
      const h = Math.min(ALTO - y, Math.ceil(b.alto));
      if (w <= 0 || h <= 0) continue;
      let datos: Uint8ClampedArray;
      try {
        datos = c.getImageData(x, y, w, h).data;
      } catch {
        return; // imagen de otro origen (file://): no se puede leer; no se avisa
      }
      for (let i = 0; i < datos.length; i += 4) lums.push(luminancia(datos[i], datos[i + 1], datos[i + 2]));
    }
    if (!lums.length) continue;
    lums.sort((a, b) => a - b);
    const fondo = lums[Math.floor(0.95 * (lums.length - 1))];
    const tinta = luminancia(...colorCss(getComputedStyle(el).color));
    const contraste = (Math.max(fondo, tinta) + 0.05) / (Math.min(fondo, tinta) + 0.05);
    if (contraste < CONTRASTE_MIN)
      fallos.push(`${nombre} ${contraste.toFixed(1).replace('.', ',')}:1`);
  }
  fijarProblema(
    clave,
    fallos.length
      ? `«${idDiapositiva}»: texto encima de la imagen con menos de 7:1 (A-36): ${fallos.join('; ')}. ` +
          'Mueve la imagen (posicion) o elige otra parte de la captura.'
      : null,
  );
}
