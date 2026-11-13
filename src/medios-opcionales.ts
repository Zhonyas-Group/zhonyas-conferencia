/**
 * Medios opcionales: los del guion que todavía pueden no existir
 * (docs/GUION.md, «Medios por grabar o conseguir»; la lista de archivos, en
 * docs/MEDIOS.md).
 *
 * Cada uno tiene su RUTA FINAL en public/medios/. La compilación y el
 * servidor de desarrollo miran qué archivos hay ahí (vite.config.ts, plugin
 * «zhonyas:medios-presentes»): si el archivo está, `hay` es true y la
 * diapositiva lo usa; si no, pinta el «si no llega» del guion. Al dejar el
 * archivo en su ruta basta con volver a compilar (`npm run pdf`); en
 * desarrollo la página se recarga sola. Nadie toca el código.
 *
 * Uso en una diapositiva:
 *
 *   import { libreta, mediosDe } from '../medios-opcionales';
 *
 *   function SuCalle() {
 *     return libreta.calle.hay ? <img src={libreta.calle.src} alt="" … /> : null;
 *   }
 *
 *   export default definirDiapositiva({
 *     …,
 *     medios: mediosDe(libreta.calle),   // solo lo que hay: se precarga y se comprueba en el USB
 *     Componente: SuCalle,
 *   });
 *
 * Lo que cambia al llegar un medio (los pasos, la duración, las notas, si la
 * diapositiva está en el índice) se escribe con `hay` en la propia
 * definición, así que también cambia solo.
 *
 * Para ver los dos estados sin tocar archivos, solo en desarrollo y en el
 * laboratorio (nunca en una compilación de la charla):
 *   ?con=M-05,M-06   hace como si esos medios ya estuvieran, con los de
 *                    medios/prueba/ en su lugar (y créditos de muestra);
 *   ?sin=M-08        hace como si no estuvieran;
 *   ?con=todos · ?sin=todos   para todos a la vez.
 * El presentador que se abre con P hereda la misma dirección.
 */
import { archivos, textos } from 'virtual:medios-presentes';
import { registrarProblema } from './motor/diagnostico';
import { medio } from './motor/medios';

/** Los medios del guion que pueden faltar (los demás ya están en public/medios/). */
export type IdMedio = 'M-01' | 'M-02' | 'M-03' | 'M-04' | 'M-05' | 'M-06' | 'M-07' | 'M-08';
const IDS: readonly IdMedio[] = ['M-01', 'M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-08'];

/** Lo que se ve en lugar de un medio simulado con ?con= (archivos del mazo de prueba del motor). */
const SUPLENTE = {
  imagen: 'medios/prueba/imagen-grande.webp',
  video: 'medios/prueba/video.webm',
  poster: 'medios/prueba/video-poster.webp',
} as const;

function simulacion(parametro: 'con' | 'sin'): ReadonlySet<IdMedio> {
  const permitido = import.meta.env.DEV || import.meta.env.MODE === 'lab';
  if (!permitido || typeof location === 'undefined') return new Set();
  const valor = new URLSearchParams(location.search).get(parametro);
  if (!valor) return new Set();
  const pedidos = valor.split(',').map((trozo) => trozo.trim().toUpperCase());
  return new Set(pedidos.includes('TODOS') ? IDS : IDS.filter((id) => pedidos.includes(id)));
}

const simularCon = simulacion('con');
const simularSin = simulacion('sin');
const presentes = new Set(archivos);

/** ¿Está el archivo en public/? (respeta ?sin=). */
function esta(m: IdMedio, ruta: string): boolean {
  return !simularSin.has(m) && presentes.has(ruta);
}

/** El primero de los candidatos que está, o undefined. */
function primero(m: IdMedio, candidatos: readonly string[]): string | undefined {
  return candidatos.find((ruta) => esta(m, ruta));
}

const simulado = (m: IdMedio, hay: boolean) => !hay && simularCon.has(m);

/** Una imagen (o el SVG del QR) del guion. */
export interface ImagenOpcional {
  readonly m: IdMedio;
  /** Ruta final, relativa a public/ (la que dice docs/MEDIOS.md). */
  readonly ruta: string;
  /** Si el archivo estaba al compilar (o se simula con ?con=). */
  readonly hay: boolean;
  /** Ruta lista para `src`, o undefined si no hay. */
  readonly src: string | undefined;
  /** Lo que hay que declarar en `medios` de la diapositiva (vacío si no hay). */
  readonly medios: readonly string[];
  /** true si `hay` viene de ?con= y `src` es un suplente de medios/prueba/. */
  readonly simulado: boolean;
}

/** Un video del guion con su póster (sin póster no cuenta como que está: MOTOR §4.7). */
export interface VideoOpcional {
  readonly m: IdMedio;
  /** Rutas finales aceptadas, relativas a public/: la primera es la que pide el guion (MP4). */
  readonly rutas: readonly string[];
  readonly rutaPoster: string;
  readonly hay: boolean;
  /** Para `<Video src>` y `<Video poster>` (rutas relativas, como las pide el motor). */
  readonly video: string | undefined;
  readonly poster: string | undefined;
  readonly medios: readonly string[];
  readonly simulado: boolean;
}

/** Un texto de una línea que acompaña a un medio (un crédito, un nombre). */
export interface TextoOpcional {
  readonly m: IdMedio;
  readonly ruta: string;
  readonly hay: boolean;
  readonly texto: string | undefined;
  readonly simulado: boolean;
}

function imagen(m: IdMedio, ruta: string): ImagenOpcional {
  const real = esta(m, ruta);
  const sim = simulado(m, real);
  const usada = real ? ruta : sim ? SUPLENTE.imagen : undefined;
  return { m, ruta, hay: real || sim, src: usada && medio(usada), medios: usada ? [usada] : [], simulado: sim };
}

function video(m: IdMedio, rutas: readonly string[], rutaPoster: string): VideoOpcional {
  const encontrado = primero(m, rutas);
  const conPoster = esta(m, rutaPoster);
  if (encontrado && !conPoster)
    registrarProblema(`${m}: está el video «${encontrado}» y falta su póster «${rutaPoster}». Sin póster no se usa (docs/MEDIOS.md).`);
  if (!encontrado && conPoster)
    registrarProblema(`${m}: está el póster «${rutaPoster}» y falta su video («${rutas[0]}»). Sin video no se usa (docs/MEDIOS.md).`);
  const real = !!encontrado && conPoster;
  const sim = simulado(m, real);
  const v = real ? encontrado : sim ? SUPLENTE.video : undefined;
  const p = real ? rutaPoster : sim ? SUPLENTE.poster : undefined;
  return { m, rutas, rutaPoster, hay: real || sim, video: v, poster: p, medios: v && p ? [v, p] : [], simulado: sim };
}

function texto(m: IdMedio, ruta: string, muestra: string): TextoOpcional {
  const real = esta(m, ruta) && !!textos[ruta];
  const sim = simulado(m, real);
  return { m, ruta, hay: real || sim, texto: real ? textos[ruta] : sim ? muestra : undefined, simulado: sim };
}

// ——— El catálogo: una entrada por archivo que espera el guion (docs/MEDIOS.md) ———

/** M-01 · La libreta de un negocio cercano a la sede (02, 06 y 19). WebP a 2×. */
export const libreta = {
  /** Primer recorte, 1690×620 (02 y 19): 3380×1240 px. */
  calle: imagen('M-01', 'medios/libreta/libreta-1690x620.webp'),
  /** Segundo recorte, 1690×850 (06): 3380×1700 px. */
  grande: imagen('M-01', 'medios/libreta/libreta-1690x850.webp'),
  /** El crédito entero, una línea: «Foto: Zhonyas, [negocio], [lugar], nov 2026». */
  credito: texto('M-01', 'medios/libreta/credito.txt', 'Foto: Zhonyas, [negocio], [lugar], nov 2026'),
};

/** M-02 · Pymex por dentro, una toma por pregunta (07). MP4 H.264 1440×810 o más, con póster. */
export const pymex = {
  tomas: [
    video('M-02', ['medios/pymex/toma-1.mp4', 'medios/pymex/toma-1.webm'], 'medios/pymex/toma-1-poster.webp'),
    video('M-02', ['medios/pymex/toma-2.mp4', 'medios/pymex/toma-2.webm'], 'medios/pymex/toma-2-poster.webp'),
    video('M-02', ['medios/pymex/toma-3.mp4', 'medios/pymex/toma-3.webm'], 'medios/pymex/toma-3-poster.webp'),
  ] as const,
  /**
   * El último cuadro de la toma 3, quieto (WebP de 1440×810 o más). Si no llega
   * la foto del ITLA (M-03), la 08 lo enseña con el crédito de la 07.
   */
  ultimoCuadro: imagen('M-02', 'medios/pymex/toma-3-ultimo-cuadro.webp'),
  /**
   * El respaldo de la 07 si no llegan las tomas: la página pública de Pymex
   * (investigacion/productos/pymex/escritorio-05-flujo-4-pasos.png pasada a
   * WebP; la pone el constructor de la 07). No es opcional: es el estado de hoy.
   */
  respaldo: 'medios/pymex/pagina-publica.webp',
  get hay(): boolean {
    return this.tomas.every((toma) => toma.hay);
  },
};

/** M-03 · José y Gregory en el ITLA (08). WebP de 3380×1240 (1690×620 a 2×). */
export const itla = imagen('M-03', 'medios/itla/jose-gregory-1690x620.webp');

/**
 * M-04 · El video de respaldo del agujero negro (tecla V en la 10): 5 s del
 * efecto en zhonyas.com, 1920×1080, 60 fps, sin sonido, con póster. Z-10 ya
 * está portado (src/marca/agujero/); sin video, la V no hace nada y queda el corte seco.
 */
export const agujero = {
  respaldo: video('M-04', ['medios/agujero/respaldo.mp4', 'medios/agujero/respaldo.webm'], 'medios/agujero/respaldo-poster.webp'),
};

/** M-05 · El iPhone que se cierra solo (12). 4:5, 676×850 o más, sin ampliar, con póster. */
export const iphone = video('M-05', ['medios/iphone/iphone.mp4', 'medios/iphone/iphone.webm'], 'medios/iphone/iphone-poster.webp');

/** M-06 · El celular de otra persona (13). 16:9, 1920×1080, con póster, y el nombre de esa persona. */
export const celular = {
  video: video('M-06', ['medios/celular/celular-de-otro.mp4', 'medios/celular/celular-de-otro.webm'], 'medios/celular/celular-de-otro-poster.webp'),
  /** Solo el nombre, como se dice en voz («María»): sale en el crédito y en las notas. */
  nombre: texto('M-06', 'medios/celular/nombre.txt', '[nombre]'),
};

/**
 * M-07 · El respaldo de la demo de Lendex (tecla V en la 18): la propia 18
 * grabada con red, con RD$10,000, 20 %, 12 cuotas, Mensual y Francesa;
 * 1920×1080, 60 s o menos, sin sonido, con póster (su primer cuadro). Lo graba
 * `node scripts/lendex-grabar-demo.mjs --guion`. Sin él, la V no hace nada en
 * la 18 (no se enseña el video del 12-nov, al 5 %, mientras se dice el 20 %) y
 * el presentador avisa: «sin el video de respaldo no hay demo en vivo» (GUION,
 * M-07, decisión 5).
 */
export const lendex = {
  respaldo: video('M-07', ['medios/lendex/respaldo.mp4', 'medios/lendex/respaldo.webm'], 'medios/lendex/respaldo-poster.webp'),
  /**
   * Su último cuadro (WebP de 1920 × 1080): la tarjeta con RD$10,000 al 20 % y
   * la cuota de RD$2,252.65. Es el póster quieto de la 18 en el presentador,
   * las miniaturas y las capturas: las cifras que José va a decir.
   */
  ultimoCuadro: imagen('M-07', 'medios/lendex/respaldo-final.webp'),
};

/** M-08 · El QR a https://zhonyas.com (20). Lo genera `npm run qr`. */
export const qr = imagen('M-08', 'medios/cierre/qr-zhonyas.svg');

/** ¿Está todo lo que hace falta de ese medio? (los textos aparte: avisan si faltan). */
export function hayMedio(m: IdMedio): boolean {
  switch (m) {
    case 'M-01':
      return libreta.calle.hay && libreta.grande.hay;
    case 'M-02':
      return pymex.hay;
    case 'M-03':
      return itla.hay;
    case 'M-04':
      return agujero.respaldo.hay;
    case 'M-05':
      return iphone.hay;
    case 'M-06':
      return celular.video.hay;
    case 'M-07':
      return lendex.respaldo.hay;
    case 'M-08':
      return qr.hay;
  }
}

/** Las rutas para el campo `medios` de una diapositiva: solo lo que hay. */
export function mediosDe(...piezas: readonly (ImagenOpcional | VideoOpcional)[]): string[] {
  return [...new Set(piezas.flatMap((pieza) => pieza.medios))];
}

// ——— Avisos: un medio a medias se ve en el presentador antes de empezar ———
if (libreta.calle.hay !== libreta.grande.hay)
  registrarProblema(
    `M-01: está ${libreta.calle.hay ? '«libreta-1690x620.webp» y falta «libreta-1690x850.webp» (la 06 sigue en negro)' : '«libreta-1690x850.webp» y falta «libreta-1690x620.webp» (la 02 y la 19 siguen sin foto)'}.`,
  );
if ((libreta.calle.hay || libreta.grande.hay) && !libreta.credito.hay)
  registrarProblema('M-01: está la foto de la libreta y falta su crédito en «public/medios/libreta/credito.txt» (docs/MEDIOS.md).');
if (pymex.hay && !pymex.ultimoCuadro.hay)
  registrarProblema('M-02: están las tres tomas de Pymex y falta «toma-3-ultimo-cuadro.webp», el respaldo de la 08 sin la foto del ITLA (docs/MEDIOS.md).');
if (!lendex.respaldo.hay)
  registrarProblema(
    'M-07: falta el video de respaldo de la demo (public/medios/lendex/respaldo.webm y respaldo-poster.webp; lo graba «node scripts/lendex-grabar-demo.mjs --guion»). Sin él no hay demo en vivo (GUION, M-07, decisión 5) y la V no hace nada en la 18.',
  );
else if (!lendex.ultimoCuadro.hay)
  registrarProblema('M-07: está el video de respaldo y falta su último cuadro, «respaldo-final.webp»: el presentador enseña la 18 sin póster (docs/MEDIOS.md).');
if (celular.video.hay && !celular.nombre.hay)
  registrarProblema('M-06: está el video del celular y falta el nombre de su dueño en «public/medios/celular/nombre.txt» (docs/MEDIOS.md).');
