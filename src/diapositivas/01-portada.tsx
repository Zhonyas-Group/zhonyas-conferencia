/**
 * 01 · portada · José · 20 s (docs/GUION.md, «01 · portada»). Rama diseno-wow.
 *
 * El logo 3D de la web (Z-09, src/marca/logo3d: interactive-logo-3d.tsx) es
 * el protagonista, sobre el fondo vivo, y se mece solo dentro de los topes con
 * los que sigue al ratón en la web; si José mueve el ratón, lo sigue.
 *
 * Pasos:
 *   0. Mientras entra el público: solo el fondo vivo (la aurora y los meteoros).
 *   1. Con el primer clic, el logo se arma: sus 16 capas se juntan como un
 *      acordeón y el objeto gira hasta su reposo (entrada «ensamblar», 1,1 s);
 *      «Zhonyas» se descubre letra a letra de abajo arriba (fancy-text, 03 M3)
 *      y debajo aparecen los tres oradores en píxeles, que saludan una vez.
 *
 * Al salir, la cámara entra en el logo (transición «inmersion»).
 */
import { Logo3D } from '../marca/logo3d';
import { Personaje } from '../marca/relevo/Personaje';
import { Letras } from '../marca/wow';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './01-portada.css';

/**
 * El brillo del logo (mark-shine) es un segundo degradado copiado tal cual de
 * la web, sobre la firma y sin texto. La 20 lo declara con esta misma excepción.
 */
export const EXCEPCION_BRILLO_LOGO =
  'A-38: brillo del logo (mark-shine), el segundo degradado del monograma, copiado tal cual de page.tsx:829-840; va sobre la firma y sin texto';

/** El logo 3D de la web (Z-09) en la portada: capas y degradados tal cual (rama diseno-wow). */
const EXCEPCION_LOGO3D =
  'A-34, A-38: el logo 3D de zhonyas.com (Z-09), con los colores de sus 16 capas y los degradados de su cara copiados de interactive-logo-3d.tsx:146-196';

/** Los tres, en el orden en que José los nombra: él, Gregory y Angel. */
const TRES = [
  { atlas: 'jose-leonardo', retraso: 0 },
  { atlas: 'gregory', retraso: 1 },
  { atlas: 'angel', retraso: 2 },
] as const;

function Portada(_: PropsDiapositiva) {
  return (
    <div className="portada" data-auditar-excepcion={EXCEPCION_LOGO3D}>
      <Entrada desde={1} efecto="ensamblar" className="portada__logo">
        <Logo3D ancho={760} balanceo />
      </Entrada>
      <Entrada desde={1} efecto="letras" className="portada__nombre">
        <p className="zh-portadilla">
          <Letras texto="Zhonyas" />
        </p>
      </Entrada>
      {/* Caen cuando el logo ya está armado (900 ms), uno detrás de otro (entrada «caer»). */}
      <Entrada desde={1} efecto="caer" className="portada__tres">
        <span data-retraso="800" hidden />
        {TRES.map((p) => (
          <span key={p.atlas} className="portada__persona" data-cae="" style={{ ['--orden' as string]: p.retraso }}>
            <Personaje atlas={p.atlas} animacion="wave" vueltas={1} luego="front" escala={0.7} />
          </span>
        ))}
      </Entrada>
    </div>
  );
}

export default definirDiapositiva({
  id: 'portada',
  titulo: 'Portada',
  orador: 'jose',
  duracion: 20,
  pasos: 1,
  notas: [
    {
      decir: 'Sin hablar. El público entra con el fondo vivo en pantalla. Cuando les toque, clic: el logo se arma.',
      claves: 'esperar en silencio · clic para empezar',
    },
    {
      decir:
        'Buenas tardes. Soy José Leonardo Reyes, estudio aquí en el ITLA igual que ustedes, y con Gregory y Angel trabajo en Zhonyas, un estudio de software y diseño de Santiago que le hace sistemas a negocios como Layla Comercial.',
      claves: 'una sola frase · mirar a la sala · clic',
      despues: 'Se dice «buenas tardes» o «buenos días», según la hora. Si mueves el ratón, el logo lo sigue.',
    },
  ],
  fuentes: ['Layla Comercial se nombra con el permiso de José (decisión 4).'],
  medios: ['medios/equipo/jose-leonardo/personaje.webp', 'medios/equipo/gregory/personaje.webp', 'medios/equipo/angel/personaje.webp'],
  Componente: Portada,
});
