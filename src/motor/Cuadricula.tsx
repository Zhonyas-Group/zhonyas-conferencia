/**
 * Vista de cuadrícula (tecla G): todas las diapositivas en miniatura, en su
 * estado final, para saltar a cualquiera. Flechas para moverse, Intro para ir
 * (a la actual: se queda como está, ver elegirEnCuadricula), Esc o G para cerrar.
 */
import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { nombreOrador, colorOrador } from '../configuracion';
import { Escenario } from './Escenario';
import { useNavegacion } from './estado';
import { cambiarInterfaz, obtenerInterfaz, useInterfaz } from './interfaz';
import { VistaFija } from './Secuencia';
import { cuadriculaInfo, elegirEnCuadricula } from './teclado';
import { formatoTiempo } from './utilidades';

/** Lo que tiene que moverse el ratón (en píxeles) para que cuente como movimiento de verdad. */
const UMBRAL_RATON = 4;

/**
 * Última posición conocida del ratón en esta ventana. Al abrirse, la
 * cuadrícula aparece debajo de un puntero que suele estar quieto (tras un
 * clic, o encima de «En pantalla» en el presentador) y el navegador dispara
 * mouseenter/mousemove en la miniatura que queda debajo. Eso no es elegir: la
 * selección empieza en la diapositiva actual y solo la cambia el ratón cuando
 * de verdad se mueve desde donde estaba.
 */
let ultimoRaton: { x: number; y: number } | null = null;
window.addEventListener(
  'mousemove',
  (e) => {
    ultimoRaton = { x: e.clientX, y: e.clientY };
  },
  { capture: true, passive: true },
);

export function Cuadricula() {
  const { seleccion } = useInterfaz();
  const { indice } = useNavegacion();
  const rejilla = useRef<HTMLDivElement>(null);
  // Dónde estaba el ratón al abrir (se toma una vez, antes de que lleguen eventos).
  const raton = useRef<{ origen: { x: number; y: number } | null; seMovio: boolean } | null>(null);
  if (raton.current === null) raton.current = { origen: ultimoRaton, seMovio: false };

  const alMoverRaton = (e: MouseEvent, i: number) => {
    const r = raton.current!;
    if (!r.seMovio) {
      if (!r.origen) {
        // Sin posición previa (el ratón no se había movido en esta ventana): este es el punto de partida.
        r.origen = { x: e.clientX, y: e.clientY };
        return;
      }
      if (Math.hypot(e.clientX - r.origen.x, e.clientY - r.origen.y) < UMBRAL_RATON) return;
      r.seMovio = true;
    }
    if (obtenerInterfaz().seleccion !== i) cambiarInterfaz({ seleccion: i });
  };

  // Las flechas arriba/abajo saltan una fila: hace falta saber cuántas columnas caben.
  useLayoutEffect(() => {
    const el = rejilla.current;
    if (!el) return;
    const medir = () => {
      const columnas = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      cuadriculaInfo.columnas = Math.max(1, columnas);
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    rejilla.current
      ?.querySelector(`[data-celda="${seleccion}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [seleccion]);

  return (
    <div
      className="cuadricula"
      role="dialog"
      aria-label="Todas las diapositivas"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cuadricula__cabecera">
        <span>
          {diapositivas.length} diapositivas · {formatoTiempo(diapositivas.reduce((s, d) => s + d.duracion, 0))}
        </span>
        <span className="cuadricula__pista">Flechas para elegir · Intro para ir · Esc para cerrar</span>
      </div>
      <div className="cuadricula__rejilla" ref={rejilla}>
        {diapositivas.map((d, i) => (
          <div
            key={d.id}
            role="button"
            tabIndex={-1}
            className="celda"
            data-celda={i}
            data-seleccion={i === seleccion ? '' : undefined}
            data-actual={i === indice ? '' : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onMouseMove={(e) => alMoverRaton(e, i)}
            onClick={() => elegirEnCuadricula(i)}
          >
            <div className="celda__vista">
              <Escenario>
                <VistaFija indice={i} paso={d.pasos} modo="miniatura" />
              </Escenario>
            </div>
            <span className="celda__pie">
              <span className="celda__n">{i + 1}</span>
              <span className="celda__titulo">{d.titulo}</span>
              <span className="celda__orador" style={{ color: colorOrador(d.orador) }}>
                {nombreOrador(d.orador)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
