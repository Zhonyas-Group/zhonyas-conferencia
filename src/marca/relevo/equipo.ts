/**
 * Los tres oradores, tal como salen en el relevo (Z-05) y en su personaje (Z-11).
 *
 * - `nombre`: el de zhonyas-web/lib/team.ts (l. 18, 27 y 36), con la tilde de
 *   «Martínez» como lo escribe la síntesis (§0.1). Pendiente: que cada uno diga
 *   cómo quiere salir.
 * - `papel`: quién es en Zhonyas, en una frase, como lo pidió José el 14-nov
 *   («No hable de lo que hizo, información como Gregory: fue el desarrollador
 *   principal de Pymex; Angel: es el que dirige el backend; José: es el
 *   creador principal de Lendex»). Antes iba lo que cada uno hizo en la web
 *   (la cinta, los personajes…). Sin cifras: una cifra iría por el registro
 *   de datos.
 * - `foto`: public/medios/equipo/<atlas>/foto.webp, sacada de
 *   investigacion/marca/equipo/fotos/<atlas>/photo.jpg (la que usa la web en
 *   escritorio, team-profile.tsx:102): recorte central de proporción
 *   471,6 : 606 (la caja de la foto en la tarjeta, la más ancha de las dos) a
 *   todo el alto. Así object-fit: cover enseña en la tarjeta y en el retrato
 *   el mismo recorte que la web. Tamaños (docs/GUION.md, M-09; A-33): la de
 *   Angel (4160 × 2773) a 965 × 1240, 2× del retrato de 620 px de alto; la de
 *   Gregory (1280 × 853) a su alto nativo, 664 × 853, sin ampliar (el
 *   original no da para 2×). WebP calidad 0,9 con el Chrome del equipo
 *   (13-nov). Antes estaban las tres a 1×, de 620 px de alto.
 *   La de José ya no es la de la web (la del polo azul): el 18-nov pidió su
 *   foto de GitHub y el 20-nov la cambió por una suya (la de los lentes, que
 *   dejó en Descargas, 1066 × 1600). Mismo recorte de 471,6 : 606 a todo el
 *   ancho (1066 × 1370 desde y 110), llevado a 965 × 1240 (2×, como la de
 *   Angel) con Lanczos y guardado en WebP calidad 90 con Pillow.
 * - `atlas`: el id de la persona en sprite-atlas.json (copia sin cambios de
 *   zhonyas-web/lib/sprite-atlas.json) y en public/medios/equipo/<atlas>/
 *   personaje.webp (copia sin cambios de public/sprites/atlas/<id>.webp).
 */

export type IdOrador = 'jose' | 'gregory' | 'angel';

export interface Orador {
  /** Nombre completo. La última palabra lleva al lado el personaje (team-profile.tsx:31-33, 108). */
  nombre: string;
  /** Su cargo en Zhonyas, tal cual lo pone la web (lib/team.ts, `role`). */
  cargo: string;
  /** Quién es en Zhonyas, a 60 px (zh-lectura). Una frase corta. */
  papel: string;
  /** De dónde sale `papel`. */
  fuentePapel: string;
  /** Id del atlas de su personaje (sprite-atlas.json). */
  atlas: 'jose-leonardo' | 'gregory' | 'angel';
  /** Foto al tamaño de uso, relativa a index.html. */
  foto: string;
  /** Atlas del personaje, relativo a index.html. */
  personaje: string;
}

export const EQUIPO: Record<IdOrador, Orador> = {
  jose: {
    nombre: 'José Leonardo', // team.ts:18
    cargo: 'Dirección creativa', // team.ts:21
    papel: 'Es el creador principal de Lendex.',
    fuentePapel: 'José, 14-nov: «Jose: Es el creador principal de LENDEX»',
    atlas: 'jose-leonardo',
    foto: 'medios/equipo/jose-leonardo/foto.webp',
    personaje: 'medios/equipo/jose-leonardo/personaje.webp',
  },
  gregory: {
    nombre: 'Gregory Martínez', // team.ts:36 escribe «Martinez»; la síntesis §0.1, «Martínez»
    cargo: 'Product design', // team.ts:39
    papel: 'Fue el desarrollador principal de Pymex.',
    fuentePapel: 'José, 14-nov: «Gregory: Fue el desarrolador principal de Pymex»',
    atlas: 'gregory',
    foto: 'medios/equipo/gregory/foto.webp',
    personaje: 'medios/equipo/gregory/personaje.webp',
  },
  angel: {
    nombre: 'Angel Grullon', // team.ts:27 y síntesis §0.1
    cargo: 'Desarrollo full-stack', // team.ts:30
    papel: 'Es el que dirige el backend.',
    fuentePapel: 'José, 14-nov: «Angel: Es el que dirige el backend»',
    atlas: 'angel',
    foto: 'medios/equipo/angel/foto.webp',
    personaje: 'medios/equipo/angel/personaje.webp',
  },
};

/**
 * Orden de las tarjetas del paso anterior al vuelo: el de la web
 * (lib/team.ts:15-42), que en su primera tanda de tres son justo los oradores.
 */
export const ORDEN_TARJETAS: readonly IdOrador[] = ['jose', 'angel', 'gregory'];

/** Medios que usa un relevo: para el campo `medios` de la diapositiva (se precargan y se comprueban). */
export function mediosRelevo(orador: IdOrador, tarjetas: readonly IdOrador[] = ORDEN_TARJETAS): string[] {
  const ids = new Set<IdOrador>([...tarjetas, orador]);
  return [...[...ids].map((id) => EQUIPO[id].foto), EQUIPO[orador].personaje];
}
