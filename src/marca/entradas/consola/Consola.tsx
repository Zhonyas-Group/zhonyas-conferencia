/**
 * <Consola>: la ventana de la consola de Servicios de zhonyas.com
 * (components/service-terminal.tsx) dentro de una <Entrada efecto="consola">.
 * Se escribe sola al llegar a su paso con los tiempos de la web (Z-06,
 * consola.entrada.ts).
 *
 *   <Consola
 *     desde={1}
 *     barra="zhonyas / software"
 *     comando="zhonyas explore --web"
 *     lineas={['Definir las secciones', 'Diseñar la experiencia', 'Desarrollar la web', 'Probar en móvil y escritorio']}
 *     resultado="Cuéntanos tu idea y definimos el alcance."
 *   />
 *
 * El CONTENIDO lo pone cada diapositiva. Esta pieza no trae textos propios.
 * Mensajes de commits privados, solo con el permiso de José (síntesis §10, pregunta 4).
 *
 * Diferencias con la web, todas por las reglas de la charla:
 *   - Letra de 32 px como mínimo (síntesis §4.4 Z-06; 01 P0-1). La web la pinta a 12,48 px.
 *   - Sin sombra ni halo del acento (A-43; MOTOR §4.9). Colores, solo los tokens de marca.css (ver consola.css).
 */
import type { CSSProperties } from 'react';
import { useLayoutEffect } from 'react';
import { useDiapositiva } from '../../../motor/contexto';
import { fijarProblema } from '../../../motor/diagnostico';
import { Entrada } from '../../../motor/Entrada';
import './consola.css';

/** Los cinco acentos de servicio (capabilities-section.tsx:27-59; marca.css): el único color que no es morado. */
export type AcentoConsola = 'software' | 'videojuegos' | 'vr' | 'sistemas' | 'ia';

/** Tamaño mínimo del texto en todo el mazo (síntesis §0.2 y §4.4 Z-06). */
const MINIMO_PX = 32;

export interface PropsConsola {
  /** Paso en el que aparece y se escribe. */
  desde: number;
  /** Último paso en el que se ve (opcional; sin salida animada: desaparece de golpe). */
  hasta?: number;
  /** Lo que se teclea después de ❯ (service-terminal.tsx:29). */
  comando: string;
  /** Las líneas con ✓, en orden (service-terminal.tsx:31-35). */
  lineas: readonly string[];
  /** La línea ↳ en el acento (service-terminal.tsx:36-39). Opcional. */
  resultado?: string;
  /** Texto de la barra, como «zhonyas / software» (service-terminal.tsx:25). Opcional. */
  barra?: string;
  /** Color del ❯, del ~/, del resultado y del cursor. Por defecto, el de Software (#d5a3ff). */
  acento?: AcentoConsola;
  /** Tamaño de la letra en px, 32 o más (por defecto, 32). */
  tamano?: number;
  className?: string;
  style?: CSSProperties;
}

export function Consola({
  desde,
  hasta,
  comando,
  lineas,
  resultado,
  barra,
  acento = 'software',
  tamano = MINIMO_PX,
  className,
  style,
}: PropsConsola) {
  const { id } = useDiapositiva();
  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return;
    fijarProblema(
      `consola-tamano:${id}`,
      tamano < MINIMO_PX ? `«${id}»: la consola tiene letra de ${tamano} px; el mínimo del mazo es ${MINIMO_PX} px (síntesis §4.4, Z-06).` : null,
    );
  }, [id, tamano]);

  const variables = {
    '--zh-consola-acento': `var(--zh-${acento})`,
    '--zh-consola-tamano': `${Math.max(tamano, MINIMO_PX)}px`,
    ...style,
  } as CSSProperties;

  return (
    <Entrada
      desde={desde}
      hasta={hasta}
      efecto="consola"
      className={className ? `zh-consola ${className}` : 'zh-consola'}
      style={variables}
    >
      <div className="zh-consola__barra">
        <span className="zh-consola__puntos" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="zh-consola__titulo">{barra}</span>
        <span className="zh-consola__shell">~/</span>
      </div>
      <div className="zh-consola__cuerpo">
        <div className="zh-consola__comando">
          <span>❯</span>
          <span className="zh-consola__tecleo">{comando}</span>
        </div>
        <div className="zh-consola__lineas">
          {lineas.map((linea, i) => (
            <div key={`${i}-${linea}`} className="zh-consola__linea">
              <span className="zh-consola__check">✓</span>
              <span>{linea}</span>
            </div>
          ))}
        </div>
        {resultado ? (
          <div className="zh-consola__resultado zh-consola__linea">
            <span>↳</span>
            <span>{resultado}</span>
          </div>
        ) : null}
        <div className="zh-consola__prompt zh-consola__linea">
          <span>❯</span>
          <span className="zh-consola__cursor" />
        </div>
      </div>
    </Entrada>
  );
}
