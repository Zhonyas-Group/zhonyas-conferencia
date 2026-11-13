/**
 * 02 · su-calle · José · 75 s (docs/GUION.md, «02 · su-calle»). Rama diseno-wow.
 * Composición: a sangre. El titular arriba (x 115, y 115; 96 px; dos líneas).
 *
 * Entra desde la portada con la «inmersion» (la cámara atraviesa el logo).
 *   0. «Quiero ver manos»: el personaje de José, abajo a la derecha, levanta la
 *      mano y saluda (wave, Z-11) mientras la sala levanta las suyas.
 *   1. El titular se genera palabra a palabra con desenfoque (animated-
 *      textgenerate, 03 M3) y «calle.» queda en aurora (capabilities-heading).
 *
 * M-01 (la libreta): `libreta.calle` y su crédito (src/medios-opcionales.ts).
 * Con la foto, va debajo del titular como antes. Sin ella, el fondo vivo.
 *
 * La 19 tiene la misma composición, con otro titular: usa `TitularSobreLibreta`.
 */
import type { ReactNode } from 'react';
import { ASangre } from '../marca/composiciones';
import { OradorEsquina, Palabras, inmersion } from '../marca/wow';
import { libreta, mediosDe } from '../medios-opcionales';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './02-su-calle.css';

/**
 * La composición de la 02 y la 19: paso 0, la foto de la libreta sola (o el
 * fondo vivo, si no llegó); paso 1, el titular, que se genera palabra a palabra.
 * Si el titular es un texto, se parte en palabras; `clave` va en aurora.
 */
export function TitularSobreLibreta({ titular, clave }: { titular: ReactNode; clave?: readonly string[] }) {
  const foto = libreta.calle;
  return (
    <div className="zh-libreta-calle">
    <ASangre
      anchoTitular={foto.hay ? undefined : 1500}
      titular={
        typeof titular === 'string' ? (
          <Entrada como="span" desde={1} efecto="palabras">
            <Palabras texto={titular} clave={clave} />
          </Entrada>
        ) : (
          <Entrada como="span" desde={1} efecto="cifra">
            {titular}
          </Entrada>
        )
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
    </div>
  );
}

function SuCalle({ paso }: PropsDiapositiva) {
  return (
    <>
      <TitularSobreLibreta titular="El usuario de su proyecto final ya está en su calle." clave={['calle.']} />
      {/* Paso 0: la mano arriba (cuatro saludos, unos 3 s: lo que José espera a que suban las manos); luego, de frente. */}
      {paso === 0 ? (
        <OradorEsquina atlas="jose-leonardo" animacion="wave" vueltas={4} luego="front" escala={0.9} />
      ) : (
        <OradorEsquina atlas="jose-leonardo" animacion="front" escala={0.9} />
      )}
    </>
  );
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
  : '**Sin la foto de la libreta (M-01):** la 02 va con el titular sobre el fondo vivo; en el paso 0, el personaje de José con la mano arriba.';

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
  medios: [...mediosDe(libreta.calle), 'medios/equipo/jose-leonardo/personaje.webp'],
  transicion: inmersion,
  Componente: SuCalle,
});
