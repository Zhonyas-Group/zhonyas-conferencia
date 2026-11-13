/**
 * 02 · su-calle · José · 75 s (docs/GUION.md, «02 · su-calle»).
 * Composición: a sangre. El titular arriba (x 115, y 115; 96 px; dos líneas,
 * hasta y ≈ 307) y debajo la foto, recortada a 1690×620 (x 115, y 345 → 965).
 * El crédito, a 32 px en --zh-texto-2, bajo la foto.
 * Movimiento: Z-01 en el titular (efecto «cifra»), en el paso 1. La foto entra
 * con el corte desde el logo y no tiene animación propia.
 *
 * M-01 (la libreta): `libreta.calle` y su crédito `libreta.credito`
 * (src/medios-opcionales.ts). Si no llega, la 02 va con el titular solo sobre
 * el fondo (docs/GUION.md, «Medios por grabar o conseguir»; docs/MEDIOS.md).
 * Al dejar el archivo en su ruta y volver a compilar, la foto sale sola.
 *
 * La 19 tiene la misma composición, con otro titular: usa `TitularSobreLibreta`.
 */
import type { ReactNode } from 'react';
import { ASangre } from '../marca/composiciones';
import { libreta, mediosDe } from '../medios-opcionales';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './02-su-calle.css';

/**
 * La composición de la 02 y la 19: paso 0, la foto de la libreta sola (o el
 * fondo, si no llegó); paso 1, el titular con Z-01, en su sitio.
 */
export function TitularSobreLibreta({ titular }: { titular: ReactNode }) {
  const foto = libreta.calle;
  return (
    <ASangre
      titular={
        <Entrada como="span" desde={1} efecto="cifra">
          {titular}
        </Entrada>
      }
      evidencia={
        foto.hay ? (
          <div className="zh-libreta-calle__foto">
            <img src={foto.src} alt="La libreta de un negocio cercano, abierta en una página de fiado" decoding="async" />
          </div>
        ) : null
      }
    >
      {foto.hay && libreta.credito.texto ? <p className="zh-fuente zh-libreta-calle__credito">{libreta.credito.texto}</p> : null}
    </ASangre>
  );
}

function SuCalle(_: PropsDiapositiva) {
  return <TitularSobreLibreta titular="El usuario de su proyecto final ya está en su calle." />;
}

/**
 * Sin la foto (M-01), la sala no ve ninguna libreta: la rama de «pocas manos»
 * del paso 1 no puede decir «Miren esa libreta» (GUION, 02, paso 1; M-01, «Si
 * no llega»). Va «Piensen en esa libreta», que remite a la de la mano alzada;
 * la redacción la confirma José. Con la foto vuelve la del guion, sola.
 */
const pocasManos = libreta.calle.hay ? 'Miren esa libreta. Esa es la idea de hoy:' : 'Piensen en esa libreta. Esa es la idea de hoy:';
const sinFoto = libreta.calle.hay
  ? undefined
  : '**Sin la foto de la libreta (M-01):** la 02 va con el titular solo sobre el fondo; el paso 0, en negro.';

export default definirDiapositiva({
  id: 'su-calle',
  titulo: 'Su calle',
  orador: 'jose',
  duracion: 75,
  pasos: 1,
  notas: [
    {
      decir: 'Antes de arrancar, quiero ver manos: los que tienen que entregar el proyecto final este año o el que viene.',
      claves: 'esperar tres segundos · si suben muchas: «Casi todos.» · si suben pocas: «Los demás, ya les toca; esto les sirve igual.»',
      despues:
        '**Segundo tiempo**, sin clic: «Ahora, dejen la mano arriba si cerca de su casa hay un colmado o un salón que apunta algo en una libreta: el fiado o lo que vendió.»\n\n' +
        '**Apoyo:** decir lo que se ve · si quedan pocas: «Fíjense la próxima vez que vayan a comprar.»',
      aparte: '**Pregunta al público**, en dos tiempos y sin clic entre ellos.' + (sinFoto ? `\n\n${sinFoto}` : ''),
    },
    {
      decir: 'Miren cuántas manos siguen arriba. Esa es la idea de hoy: el usuario de su proyecto final ya está en su calle.',
      claves: 'silencio · tres historias · entregar el clicker',
      despues:
        `**Si quedaron pocas manos**, empieza: «${pocasManos}». Luego, dos segundos de silencio.\n\n` +
        '**Remate:** «Se la vamos a contar con tres historias, y cada uno cuenta la suya: Gregory, la de nuestro proyecto final; Angel, la de un efecto que no se dejaba terminar; y yo, la de un prestamista. Gregory.»',
      ...(sinFoto
        ? {
            aparte: `${sinFoto} Por eso, con pocas manos, «Piensen en esa libreta» y no «Miren esa libreta» [CONFIRMAR con José la frase].`,
          }
        : {}),
    },
  ],
  fuentes: [
    'Las tres historias son tres de verdad (A-11) y se anuncian solo en voz, sin pantalla de agenda (A-32).',
    'Las manos son de la sala: no se comparan con ninguna estadística.',
    ...(libreta.credito.texto ? [libreta.credito.texto] : []),
  ],
  medios: mediosDe(libreta.calle),
  Componente: SuCalle,
});
