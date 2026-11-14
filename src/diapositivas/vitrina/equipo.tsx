/**
 * Vitrina · «Somos Zhonyas» (rama diseno-wow, 13-nov). Los seis del equipo,
 * como en la web (lib/team.ts: el orden, los nombres y los cargos), cada uno
 * en su tarjeta con su personaje de píxeles de pie encima, que saluda una vez
 * cuando su tarjeta llega. Fotos: public/team/<id>/ de zhonyas-web (las de los
 * tres oradores, las de sus relevos).
 */
import type { IdAtlas } from '../../marca/relevo/Personaje';
import { Galeria, TarjetaFoto } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const EQUIPO: readonly { id: IdAtlas; nombre: string; cargo: string; foto: string }[] = [
  { id: 'jose-leonardo', nombre: 'José Leonardo', cargo: 'Dirección creativa', foto: 'medios/equipo/jose-leonardo/foto.webp' },
  { id: 'angel', nombre: 'Angel Grullon', cargo: 'Desarrollo full-stack', foto: 'medios/equipo/angel/foto.webp' },
  { id: 'gregory', nombre: 'Gregory Martínez', cargo: 'Product design', foto: 'medios/equipo/gregory/foto.webp' },
  { id: 'cristopher', nombre: 'Cristopher Javier', cargo: '3D & motion', foto: 'medios/equipo/cristopher/foto.jpg' },
  { id: 'jose-carlos', nombre: 'José Carlos', cargo: 'Estrategia de marca', foto: 'medios/equipo/jose-carlos/foto.jpg' },
  { id: 'steven', nombre: 'Steven Jimenez', cargo: 'Growth & contenido', foto: 'medios/equipo/steven/foto.jpg' },
];

/** Seis tarjetas de 250 px con 38 de aire: 6 × 250 + 5 × 38 = 1690, el ancho útil de la retícula. */
const ANCHO = 250;
const PASO = 288;
const ALTO = 330;
const Y = 430;

function Equipo(_: PropsDiapositiva) {
  return (
    <Galeria
      titular="Somos Zhonyas."
      clave={['Zhonyas.']}
      bajada="Un estudio de software y diseño de Santiago."
      color="#a975ff"
      nombres={EQUIPO.map((p, i) => [p.nombre, 115 + i * PASO + ANCHO / 2, Y + ALTO + 26, p.cargo] as const)}
    >
      {EQUIPO.map((p, i) => (
        <TarjetaFoto
          key={p.id}
          foto={p.foto}
          alt={p.nombre}
          personaje={p.id}
          x={115 + i * PASO}
          y={Y}
          ancho={ANCHO}
          alto={ALTO}
          giro={(2.5 - i) * 3}
          orden={i}
          fase={i * 1.3}
        />
      ))}
    </Galeria>
  );
}

export default definirDiapositiva({
  id: 'vitrina-equipo',
  titulo: 'Somos Zhonyas',
  orador: 'jose',
  duracion: 60,
  pasos: 0,
  notas: [
    {
      decir:
        'Somos Zhonyas, un estudio de software y diseño de Santiago. Somos seis; hoy venimos tres: Gregory, Angel y yo. Cada uno tiene su muñequito: Angel los hizo para la web.',
      claves: 'estudio de Santiago · somos seis · hoy venimos tres · los muñequitos',
    },
  ],
  fuentes: ['Nombres, cargos y orden: lib/team.ts de zhonyas-web; «Santiago de los Caballeros»: la página de LinkedIn de Zhonyas.'],
  medios: EQUIPO.flatMap((p) => [p.foto, `medios/equipo/${p.id}/personaje.webp`]),
  Componente: Equipo,
});
