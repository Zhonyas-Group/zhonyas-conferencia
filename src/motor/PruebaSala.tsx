/**
 * Diapositiva oculta de PRUEBA DE SALA (tecla T, fuera del orden; síntesis
 * §9.2.8, §4.1 y A-37). Se proyecta en la sala con las luces como van a estar
 * y se mira desde la última fila:
 *   - los cinco tamaños de letra de la escala (§4.2), del 240 al 32;
 *   - todos los tokens de color sobre el fondo, con su contraste calculado en
 *     vivo desde el CSS (lo que ves es lo que hay en marca.css);
 *   - el degradado de la firma, sin nada encima;
 *   - los escalones de negro de la marca, de #010204 a #141318: si el
 *     proyector los junta, lo que vaya en --zh-tarjeta o --zh-consola no se verá;
 *   - líneas de 1 px (si salen grises o con muaré, el proyector está
 *     reescalando: poner Windows a su resolución nativa, C-22);
 *   - un patrón de bordes: el borde de la imagen, el 2,5 % y el 5 % (lo que
 *     suelen recortar los proyectores) y el margen de 115 px de la retícula.
 * De ahí se decide si hace falta el «modo sala con luz».
 */
import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import '../estilos/prueba-sala.css';

const TAMANOS = [
  { clase: 'zh-cifra', texto: '240' },
  { clase: 'zh-portadilla', texto: 'Portadilla 128' },
  { clase: 'zh-titular', texto: 'Titular de 96 px' },
  { clase: 'zh-lectura', texto: 'Lectura de 60 px' },
  { clase: 'zh-fuente', texto: 'Fuente, pie o crédito de 32 px' },
];

/** Los tokens de color de marca.css que pueden ir como texto o como acento: [token, nombre corto]. */
const COLORES: ReadonlyArray<[string, string]> = [
  ['texto', 'texto'],
  ['texto-2', 'texto 2'],
  ['rotulo', 'rótulo'],
  ['lila', 'lila'],
  ['disciplina-saas', 'SaaS'],
  ['disciplina-3d', '3D'],
  ['disciplina-landings', 'landings'],
  ['software', 'software'],
  ['videojuegos', 'videojuegos'],
  ['vr', 'VR'],
  ['sistemas', 'sistemas'],
  ['ia', 'IA'],
  ['punto-rojo', 'rojo'],
  ['punto-ambar', 'ámbar'],
  ['punto-verde', 'verde'],
  ['check', 'check'],
];

/** Los fondos de la marca entre #010204 y #141318, de más oscuro a más claro. */
const NEGROS = ['fondo', 'fondo-2', 'seccion', 'consola', 'tarjeta'];

function canales(css: string): [number, number, number] | null {
  const m = /rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/.exec(css);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** Luminancia relativa de WCAG 2.2. */
function luminancia([r, g, b]: [number, number, number]): number {
  const lineal = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b);
}

function contraste(a: [number, number, number], b: [number, number, number]): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const hex = (c: [number, number, number]) => `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const coma = (n: number, decimales = 1) => n.toFixed(decimales).replace('.', ',');

/** Lee el color real de cada muestra (desde el CSS) y escribe su hex y su contraste con el fondo. */
function useMedidas(raiz: RefObject<HTMLDivElement | null>) {
  const [medidas, setMedidas] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;
    const fondo = canales(getComputedStyle(el).backgroundColor) ?? [1, 2, 4];
    const nuevas: Record<string, string> = {};
    for (const muestra of el.querySelectorAll<HTMLElement>('[data-muestra]')) {
      const tipo = muestra.dataset.muestra!;
      const color = canales(tipo === 'texto' ? getComputedStyle(muestra).color : getComputedStyle(muestra).backgroundColor);
      if (!color) continue;
      nuevas[muestra.dataset.token!] = tipo === 'texto' ? `${coma(contraste(color, fondo))}:1` : hex(color);
    }
    setMedidas(nuevas);
  }, [raiz]);
  return medidas;
}

export function PruebaSala() {
  const raiz = useRef<HTMLDivElement>(null);
  const medidas = useMedidas(raiz);
  return (
    <div className="prueba-sala" ref={raiz}>
      {/* Bordes: la imagen entera, lo que suelen recortar los proyectores y el margen de la retícula. */}
      <div className="ps-borde ps-borde--0" />
      <div className="ps-borde ps-borde--2-5" />
      <div className="ps-borde ps-borde--5" />
      <div className="ps-borde ps-borde--margen" />
      <p className="ps-leyenda-bordes">De fuera adentro: borde, 2,5 %, 5 % y el margen de 115 px (discontinua)</p>

      <div className="zh-reticula ps-reticula">
        <div className="ps-izquierda">
          {TAMANOS.map((t) => (
            <p key={t.clase} className={t.clase}>
              {t.texto}
            </p>
          ))}
          <div className="ps-pixeles">
            <div className="ps-pixeles__muestra ps-pixeles__muestra--verticales" />
            <div className="ps-pixeles__muestra ps-pixeles__muestra--horizontales" />
            <div className="ps-pixeles__muestra ps-pixeles__muestra--damero" />
            <p className="zh-fuente">Líneas de 1 px · T o Esc para salir</p>
          </div>
        </div>

        <div className="ps-derecha">
          <ul className="ps-colores">
            {COLORES.map(([token, nombre]) => (
              <li key={token} className="ps-color" style={{ color: `var(--zh-${token})` }}>
                <span className="ps-color__cuadro" style={{ background: `var(--zh-${token})` }} />
                <span data-muestra="texto" data-token={token}>
                  {nombre} {medidas[token] ?? ''}
                </span>
              </li>
            ))}
          </ul>

          <div className="ps-firma">
            <div className="ps-firma__cinta" />
            <p className="zh-fuente">Firma</p>
          </div>

          <ul className="ps-negros">
            {NEGROS.map((token) => (
              <li key={token} className="ps-negro">
                <span
                  className="ps-negro__cuadro"
                  data-muestra="fondo"
                  data-token={`negro-${token}`}
                  style={{ background: `var(--zh-${token})` }}
                />
                <span className="zh-fuente">{medidas[`negro-${token}`] ?? token}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
