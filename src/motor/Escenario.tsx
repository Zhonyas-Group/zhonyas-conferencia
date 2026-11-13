/**
 * Escenario lógico fijo de 1920×1080. Se escala con transform para caber en
 * cualquier contenedor (la ventana entera, o un panel del presentador) y deja
 * bandas del color de fondo. Como es un transform y no una imagen, el texto
 * sigue siendo vectorial y nítido a cualquier tamaño.
 */
import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export const ANCHO = 1920;
export const ALTO = 1080;

/** Escala actual del escenario (píxeles de pantalla por píxel lógico). */
const ContextoEscala = createContext(1);

export function useEscala(): number {
  return useContext(ContextoEscala);
}

interface Medida {
  ancho: number;
  alto: number;
}

export function Escenario({
  children,
  className,
  fondo,
}: {
  children: ReactNode;
  className?: string;
  /** Color de las bandas (por defecto, var(--fondo)). */
  fondo?: string;
}) {
  const marco = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState<Medida | null>(null);

  useLayoutEffect(() => {
    const el = marco.current;
    if (!el) return;
    const medir = () => {
      const ancho = el.clientWidth;
      const alto = el.clientHeight;
      setMedida((anterior) =>
        anterior && anterior.ancho === ancho && anterior.alto === alto ? anterior : { ancho, alto },
      );
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  let estilo: CSSProperties = { visibility: 'hidden' };
  let escala = 1;
  if (medida && medida.ancho > 0 && medida.alto > 0) {
    escala = Math.min(medida.ancho / ANCHO, medida.alto / ALTO);
    // Posición en píxeles enteros: evita que el texto quede a medio píxel y se vea borroso.
    const x = Math.round((medida.ancho - ANCHO * escala) / 2);
    const y = Math.round((medida.alto - ALTO * escala) / 2);
    estilo = { transform: `translate(${x}px, ${y}px) scale(${escala})` };
  }

  return (
    <div ref={marco} className={`marco ${className ?? ''}`} style={fondo ? { background: fondo } : undefined}>
      <div className="escenario" style={estilo}>
        <ContextoEscala.Provider value={escala}>{children}</ContextoEscala.Provider>
      </div>
    </div>
  );
}
