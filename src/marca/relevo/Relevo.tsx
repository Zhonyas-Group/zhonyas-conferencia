/**
 * Z-05 · Relevo de orador (síntesis §4.4; 03 M5).
 *
 * En el paso anterior a `desde` se ven las tarjetas del equipo, como en la
 * web (la primera tanda de tres de lib/team.ts son justo los oradores). Al
 * avanzar a `desde`, la tarjeta del que entra se abre como el perfil de
 * zhonyas.com (components/team-profile.tsx:96-112):
 *   - la foto vuela de la tarjeta al retrato: 440 × 620 a 8 % del ancho, con
 *     scale .94, rotateY 12°, rotateZ −3°, en 700 ms (0.22, 1, 0.36, 1);
 *   - las tarjetas se van de golpe en ese cuadro (como en la web, hoja 05,
 *     «clic +50 ms») y el fondo liso se funde en 500 ms;
 *   - el nombre y lo que hizo entran desde +60 px en 450 ms, a los 180 ms;
 *   - su personaje aparece a los 500 ms (sube 10 px en 400 ms) y saluda
 *     (wave: 3 cuadros a 6 fps, ida y vuelta); con `vueltas`, saluda con los
 *     cuadros 1-2-3-2-1 y después se queda quieto en idle, sin respiro
 *     (docs/GUION.md, 03; C-11).
 * Los valores y su fuente están en geometria.ts y relevo.entrada.ts.
 *
 * La foto sale de algo que ya estaba (03 §1, regla 4; crítica C-10 b): de su
 * tarjeta. Por eso `desde` tiene que ser ≥ 1: en el paso 0 se ven las tarjetas.
 *
 *   import { Relevo } from '../marca/relevo/Relevo';
 *   import { mediosRelevo } from '../marca/relevo/equipo';
 *
 *   export default definirDiapositiva({
 *     id: 'relevo-gregory', titulo: 'Relevo: Gregory', pasos: 1, orador: 'gregory',
 *     medios: mediosRelevo('gregory'),
 *     Componente: () => <Relevo orador="gregory" />,
 *     …
 *   });
 */
import { useLayoutEffect, type CSSProperties } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { registrarProblema } from '../../motor/diagnostico';
import { Entrada } from '../../motor/Entrada';
import { medio } from '../../motor/medios';
import { EQUIPO, ORDEN_TARJETAS, type IdOrador } from './equipo';
import { TARJETAS, type Caja } from './geometria';
import { Personaje } from './Personaje';
import './relevo.css';

interface PropsRelevo {
  /** Quién toma la palabra. */
  orador: IdOrador;
  /** Paso en que vuela la foto (1 por defecto). En los anteriores se ven las tarjetas. */
  desde?: number;
  /**
   * Las tarjetas del paso anterior, de izquierda a derecha, en las posiciones
   * de la web (geometria.ts, TARJETAS; como mucho tres). Por defecto, el orden
   * de la web: José, Angel, Gregory. Tiene que incluir a `orador`.
   */
  tarjetas?: readonly IdOrador[];
  /**
   * En vez de las tarjetas, una sola: la foto del orador en esta caja (px del
   * escenario). Para cuando la diapositiva anterior la dejó en otro sitio.
   */
  origen?: Caja;
  /** Cambia el nombre de equipo.ts. */
  nombre?: string;
  /** Cambia lo que hizo de equipo.ts (sin cifras: una cifra va con <Dato>). */
  hizo?: string;
  /**
   * Saludos (cada uno, los cuadros 1-2-3-2-1 de wave a 6 fps, 0,83 s). Al
   * terminarlos se queda quieto en idle (docs/GUION.md, 03: `vueltas={1}`).
   * Sin él, como en la web: saluda mientras esté en pantalla (crítica C-11).
   */
  vueltas?: number;
}

function estiloCaja(c: Caja): CSSProperties {
  return { left: c.left, top: c.top, width: c.width, height: c.height };
}

export function Relevo({ orador, desde = 1, tarjetas = ORDEN_TARJETAS, origen, nombre, hizo, vueltas }: PropsRelevo) {
  const { id, paso } = useDiapositiva();
  const persona = EQUIPO[orador];
  const volo = paso >= desde;

  // Las tarjetas que se ven antes del vuelo y la caja de la que sale la foto.
  const cajas: { id: IdOrador; caja: Caja }[] = origen
    ? [{ id: orador, caja: origen }]
    : tarjetas.slice(0, TARJETAS.length).map((t, i) => ({ id: t, caja: TARJETAS[i] }));
  const salida = cajas.find((c) => c.id === orador)?.caja;

  useLayoutEffect(() => {
    if (desde < 1)
      registrarProblema(`«${id}»: el relevo de ${persona.nombre} vuela en el paso ${desde}; tiene que ser ≥ 1 para que antes se vea la tarjeta de la que sale (C-10 b).`);
    if (!origen && tarjetas.length > TARJETAS.length)
      registrarProblema(`«${id}»: el relevo tiene ${tarjetas.length} tarjetas y solo caben ${TARJETAS.length} (las posiciones de la web).`);
    if (!salida)
      registrarProblema(`«${id}»: ${persona.nombre} no está entre las tarjetas del relevo; la foto no tiene de dónde salir y aparece de golpe.`);
  }, [id, desde, origen, tarjetas, salida, persona.nombre]);

  // team-profile.tsx:31-33: la última palabra del nombre lleva al lado el personaje.
  const palabras = (nombre ?? persona.nombre).split(' ');
  const fin = palabras.pop();
  const principio = palabras.join(' ');

  return (
    <div className="relevo">
      {/* Las tarjetas se van de golpe en el cuadro del clic, como en la web (relevo.css). */}
      <div className="relevo-tarjetas" data-volo={volo ? '' : undefined}>
        {cajas.map(({ id: quien, caja }) => (
          <div key={quien} className="relevo-tarjeta" style={estiloCaja(caja)}>
            <img src={medio(EQUIPO[quien].foto)} alt="" decoding="async" draggable={false} />
          </div>
        ))}
      </div>

      <Entrada desde={desde} efecto="relevo" className="relevo-perfil">
        <div className="relevo-fondo" data-relevo="fondo" />
        <div className="relevo-escena">
          <div
            className="relevo-retrato"
            data-relevo="retrato"
            data-origen={salida ? [salida.left, salida.top, salida.width, salida.height].join(',') : undefined}
          >
            <img src={medio(persona.foto)} alt={`Retrato de ${nombre ?? persona.nombre}`} decoding="async" draggable={false} />
          </div>
          <div className="relevo-texto" data-relevo="texto">
            <h2 className="zh-portadilla relevo-nombre">
              {principio}
              {principio && ' '}
              <span className="relevo-nombre-fin">
                {fin}
                <span className="relevo-avatar" data-relevo="avatar" aria-hidden="true">
                  <Personaje atlas={persona.atlas} animacion="wave" vueltas={vueltas} luego="idle" />
                </span>
              </span>
            </h2>
            <p className="zh-lectura relevo-hizo">{hizo ?? persona.hizo}</p>
          </div>
        </div>
      </Entrada>
    </div>
  );
}
