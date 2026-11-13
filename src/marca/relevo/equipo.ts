/**
 * Los tres oradores, tal como salen en el relevo (Z-05) y en su personaje (Z-11).
 *
 * - `nombre`: el de zhonyas-web/lib/team.ts (l. 18, 27 y 36), con la tilde de
 *   «Martínez» como lo escribe la síntesis (§0.1). Pendiente: que cada uno diga
 *   cómo quiere salir.
 * - `hizo`: lo que esa persona HIZO, no su cargo (síntesis §7.2, «Quién hizo
 *   qué»; 08 §4 y §5). Sin cifras: una cifra iría por el registro de datos.
 *   Pendiente: que cada uno lo confirme (08, preguntas 25 y 26).
 * - `foto`: public/medios/equipo/<atlas>/foto.webp, sacada de
 *   investigacion/marca/equipo/fotos/<atlas>/photo.jpg (la que usa la web en
 *   escritorio, team-profile.tsx:102): recorte central de proporción
 *   471,6 : 606 (la caja de la foto en la tarjeta, la más ancha de las dos) a
 *   todo el alto, reducido a 620 px de alto (el mayor alto al que se ve).
 *   Así object-fit: cover enseña en la tarjeta y en el retrato el mismo
 *   recorte que la web.
 * - `atlas`: el id de la persona en sprite-atlas.json (copia sin cambios de
 *   zhonyas-web/lib/sprite-atlas.json) y en public/medios/equipo/<atlas>/
 *   personaje.webp (copia sin cambios de public/sprites/atlas/<id>.webp).
 */

export type IdOrador = 'jose' | 'gregory' | 'angel';

export interface Orador {
  /** Nombre completo. La última palabra lleva al lado el personaje (team-profile.tsx:31-33, 108). */
  nombre: string;
  /** Lo que hizo, a 60 px (zh-lectura). Una frase corta. */
  hizo: string;
  /** De dónde sale `hizo`. */
  fuenteHizo: string;
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
    hizo: 'Hizo la cinta, el logo 3D y la animación de zhonyas.com.',
    fuenteHizo: '08 §4 (José: «hizo el logo 3D, la cinta… y la política de animación») y §5, «La propia web» («José hizo la narrativa y la animación»)',
    atlas: 'jose-leonardo',
    foto: 'medios/equipo/jose-leonardo/foto.webp',
    personaje: 'medios/equipo/jose-leonardo/personaje.webp',
  },
  gregory: {
    nombre: 'Gregory Martínez', // team.ts:36 escribe «Martinez»; la síntesis §0.1, «Martínez»
    hizo: 'Escribe con José la tesis de Pymex en el ITLA.',
    fuenteHizo: '08 §4 (Gregory: «es coautor de la tesis de Pymex»; no tiene commits) y síntesis §0.1. Su parte de diseño la tiene que contar él (08, pregunta 26)',
    atlas: 'gregory',
    foto: 'medios/equipo/gregory/foto.webp',
    personaje: 'medios/equipo/gregory/personaje.webp',
  },
  angel: {
    nombre: 'Angel Grullon', // team.ts:27 y síntesis §0.1
    hizo: 'Armó los personajes de píxeles e hizo el agujero negro.',
    fuenteHizo: '08 §4 (Angel: «personajes de píxeles y la herramienta que los arma… el agujero negro»). «Armó» y no «dibujó»: las poses las generó Codex (08 §2, 24-sep)',
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
