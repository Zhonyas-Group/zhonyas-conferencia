/**
 * Entrada por paso: el contenido aparece cuando la diapositiva llega al paso
 * `desde` (y, si se indica, desaparece después de `hasta`).
 *
 * El efecto base es sobrio: fundido con un desplazamiento corto hacia arriba
 * (solo fundido con prefers-reduced-motion, nada en modo revisión). Mientras
 * está oculto conserva su sitio, así que mostrarlo no recoloca el resto.
 * Para un efecto propio: `className` + CSS sobre `[data-oculto]`, o GSAP con
 * `usePaso()` y `useMovimiento()`.
 *
 * Lo que va dentro sabe si se ve (`useVisibleEnEntrada()`): un <Video> no se
 * reproduce mientras su Entrada está oculta y empieza desde el principio al
 * aparecer; un <LienzoOGL> no anima mientras está oculto.
 */
import { createContext, useContext, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { usePaso } from './contexto';

const ContextoEntrada = createContext(true);

/** ¿Se ve el componente? false si alguna <Entrada> que lo contiene está oculta en este paso. */
export function useVisibleEnEntrada(): boolean {
  return useContext(ContextoEntrada);
}

interface PropsEntrada {
  /** Paso en el que aparece (0 = desde el principio). */
  desde: number;
  /** Último paso en el que se ve (opcional). */
  hasta?: number;
  /** Retraso en milisegundos al aparecer (para escalonar varias piezas en el mismo paso). */
  retraso?: number;
  /** Etiqueta HTML a usar (div por defecto). */
  como?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Entrada({ desde, hasta, retraso = 0, como: Etiqueta = 'div', className, style, children }: PropsEntrada) {
  const paso = usePaso();
  const padreVisible = useContext(ContextoEntrada);
  const visible = paso >= desde && (hasta === undefined || paso <= hasta);
  return (
    <Etiqueta
      className={className ? `entrada ${className}` : 'entrada'}
      data-oculto={visible ? undefined : ''}
      style={retraso ? ({ ...style, '--retraso': `${retraso}ms` } as CSSProperties) : style}
    >
      <ContextoEntrada.Provider value={padreVisible && visible}>{children}</ContextoEntrada.Provider>
    </Etiqueta>
  );
}
