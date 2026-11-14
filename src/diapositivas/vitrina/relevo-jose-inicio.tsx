/**
 * Vitrina · José se presenta (rama diseno-wow, 13-nov). José: «cuando cada
 * quien se presente, ponle algo para que sepan quién es». Gregory y Angel se
 * presentan en su relevo; José abría con la portada y su relevo llegaba en la
 * novena, ya de vuelta. Aquí va su relevo completo, justo después de la
 * portada: la foto vuela sola, el nombre, su cargo en Zhonyas (lib/team.ts),
 * lo que hizo (equipo.ts) y de qué habla. En la novena queda «Ahora, Lendex.».
 */
import { mediosRelevo } from '../../marca/relevo/equipo';
import { TARJETAS } from '../../marca/relevo/geometria';
import { RETRASO_RELEVO, Relevo } from '../../marca/relevo/Relevo';
import { cortina } from '../../marca/wow';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

function RelevoJoseInicio(_: PropsDiapositiva) {
  return (
    <Relevo
      orador="jose"
      origen={TARJETAS[0]}
      nombre="José Leonardo Reyes"
      tema="Hoy les presenta Zhonyas."
      vueltas={1}
      automatico={RETRASO_RELEVO}
    />
  );
}

export default definirDiapositiva({
  id: 'relevo-jose-inicio',
  titulo: 'José se presenta',
  orador: 'jose',
  duracion: 25,
  pasos: 0,
  notas: [
    {
      decir:
        'Buenas tardes. Soy José Leonardo Reyes, estudio aquí en el ITLA y en Zhonyas llevo la dirección creativa: hice la cinta, el logo 3D y la animación de nuestra web.',
      claves: 'buenas tardes · ITLA · dirección creativa · la web',
    },
  ],
  fuentes: ['Cargo: lib/team.ts de zhonyas-web; lo que hizo: src/marca/relevo/equipo.ts (08 §4).'],
  medios: mediosRelevo('jose', ['jose']),
  transicion: cortina('jose-leonardo'),
  Componente: RelevoJoseInicio,
});
