/**
 * Fondo vivo: el fondo continuo de toda la charla (rama diseno-wow).
 *
 * Va DEBAJO de la secuencia de diapositivas, dentro del escenario (Sala.tsx),
 * así que sobrevive a los cambios de diapositiva: lo que cambia es lo de
 * encima. Tres capas, todas copiadas de zhonyas.com y todas animadas solo con
 * transform y opacity (las compone la GPU sin repintar):
 *
 *   1. La viñeta del cuerpo de la web: body::before, globals.css:90-93.
 *   2. La aurora: los dos resplandores del panel del equipo (team-shell,
 *      globals.css:1204-1207: violeta a la derecha, magenta abajo a la
 *      izquierda) y el del centro de la escena del logo (globals.css:1129),
 *      que derivan despacio. El periodo sale de la aurora de la web
 *      (capabilities-heading.css:15, 9 s ease-in-out): cada resplandor da una
 *      vuelta en 3 × 9 s y en 4 × 9 s, para que nunca se repita el dibujo.
 *   3. Los meteoros de la sección de contacto (components/ui/meteors.tsx y
 *      team-contact.css:146-155): 8 estelas con sus mismas posiciones,
 *      retrasos, duraciones y recorrido, al 55 % de opacidad.
 *
 * Con la sala en negro, la cuadrícula o la prueba de sala encima se congela
 * (data-pausado). Con «menos movimiento» se queda quieto y sin meteoros.
 */
import type { CSSProperties } from 'react';
import './fondo-vivo.css';

/** components/ui/meteors.tsx:4-9: 8 meteoros. */
const METEOROS = Array.from({ length: 8 }, (_, indice) => ({
  left: `${12 + indice * 14}%`, // meteors.tsx:5
  top: `${-12 + (indice % 3) * 13}%`, // meteors.tsx:6
  '--retraso': `${-indice * 1.7}s`, // meteors.tsx:7
  '--duracion': `${6 + (indice % 4) * 1.3}s`, // meteors.tsx:8
}));

export function FondoVivo({ pausado = false }: { pausado?: boolean }) {
  return (
    <div className="fondo-vivo" data-pausado={pausado ? '' : undefined} aria-hidden="true">
      <div className="fondo-vivo__aurora fondo-vivo__aurora--violeta" />
      <div className="fondo-vivo__aurora fondo-vivo__aurora--magenta" />
      <div className="fondo-vivo__aurora fondo-vivo__aurora--centro" />
      <div className="fondo-vivo__meteoros">
        {METEOROS.map((m, i) => (
          <span key={i} className="fondo-vivo__meteoro" style={m as CSSProperties} />
        ))}
      </div>
      <div className="fondo-vivo__vineta" />
    </div>
  );
}
