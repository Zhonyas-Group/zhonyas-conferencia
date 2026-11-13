/**
 * Entrada por paso: el contenido aparece cuando la diapositiva llega al paso
 * `desde` (y, si se indica, desaparece después de `hasta`).
 *
 * Sin `efecto` aparece DE GOLPE (corte): el motor no trae una entrada
 * genérica, porque el «aparece y sube 20 px» en cada bloque es justo lo que
 * prohíbe A-53. Con `efecto="nombre"` usa una entrada con nombre registrada
 * por una pieza de src/marca/ (entradas.ts), con los valores de la web.
 *
 * Mientras está oculta conserva su sitio (visibility: hidden), así que
 * mostrarla no recoloca el resto. Lo que va dentro sabe si se ve
 * (`useVisibleEnEntrada()`): un <Video> no se reproduce mientras su Entrada
 * está oculta y empieza desde el principio al aparecer; un <LienzoOGL> no
 * anima mientras está oculto.
 */
import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { useDiapositiva, useMovimiento } from './contexto';
import { registrarProblema } from './diagnostico';
import { obtenerEntrada, type ContextoEntrada as ContextoEfecto, type NombreEntrada } from './entradas';
import { anotarMomento } from './momentos';
import { controlar, type Controlador } from './transiciones';

const ContextoEntrada = createContext(true);

/** ¿Se ve el componente? false si alguna <Entrada> que lo contiene está oculta en este paso. */
export function useVisibleEnEntrada(): boolean {
  return useContext(ContextoEntrada);
}

interface PropsEntrada {
  /** Paso en el que aparece (0 = desde que llega la diapositiva). */
  desde: number;
  /** Último paso en el que se ve (opcional). */
  hasta?: number;
  /** Entrada con nombre (registrada en src/marca/). Sin efecto: aparece de golpe. */
  efecto?: NombreEntrada;
  /** Etiqueta HTML a usar (div por defecto). */
  como?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function Entrada({ desde, hasta, efecto, como: Etiqueta = 'div', className, style, children }: PropsEntrada) {
  const { id, paso, direccion, rol, modo, activa } = useDiapositiva();
  const { reducido, instantaneo } = useMovimiento();
  const padreVisible = useContext(ContextoEntrada);
  const visible = paso >= desde && (hasta === undefined || paso <= hasta);

  const ref = useRef<HTMLElement>(null);
  /** Animación en curso (aparecer o desaparecer). */
  const control = useRef<Controlador | null>(null);
  /** Lo que había en el render anterior: ¿se veía y estaba en pantalla? */
  const antes = useRef<{ visible: boolean; enPantalla: boolean } | null>(null);
  /** Saliendo con su animación: todavía no lleva el estado oculto. */
  const [saliendo, setSaliendo] = useState(false);
  const saliendoRef = useRef(false);
  const fijarSaliendo = (valor: boolean) => {
    if (saliendoRef.current === valor) return;
    saliendoRef.current = valor;
    setSaliendo(valor);
  };

  // Un efecto que no existe se avisa; cada efecto cuenta como momento animado (A-54).
  useLayoutEffect(() => {
    if (!efecto) return;
    const definicion = obtenerEntrada(efecto);
    if (!definicion) {
      registrarProblema(
        `«${id}» usa la entrada «${efecto}», que no está registrada (falta su src/marca/…/*.entrada.ts); aparece de golpe.`,
      );
      return;
    }
    anotarMomento(id, `${efecto}@${desde}`);
    if (hasta !== undefined && definicion.desaparecer) anotarMomento(id, `${efecto}-sale@${hasta + 1}`);
  }, [id, efecto, desde, hasta]);

  useLayoutEffect(() => {
    const el = ref.current;
    const previo = antes.current;
    const enPantalla = modo === 'escenario' && rol === 'actual' && activa;
    antes.current = { visible, enPantalla };
    const definicion = efecto ? obtenerEntrada(efecto) : undefined;
    if (!el || !definicion) return;

    const terminarAnterior = () => {
      const c = control.current;
      control.current = null;
      if (c) {
        c.finalizar();
        c.cancelar();
      }
      fijarSaliendo(false);
    };
    // Solo se anima al AVANZAR, en la diapositiva que está en pantalla. Al
    // retroceder, al saltar, en las vistas previas y en revisión: estado final.
    const animar = enPantalla && !instantaneo && direccion === 1;
    const loVeiaElPublico = !!previo && previo.enPantalla && previo.visible;
    const ctx: ContextoEfecto = { reducido, paso, diapositiva: id };

    if (visible && !loVeiaElPublico) {
      terminarAnterior();
      if (!animar || !definicion.aparecer) return;
      const c = controlar(definicion.aparecer(el, ctx));
      control.current = c;
      void c.terminado.then(() => {
        if (control.current !== c) return;
        control.current = null;
        // El estado final es el del CSS: se quitan los efectos de la animación.
        c.cancelar();
      });
    } else if (!visible && loVeiaElPublico) {
      terminarAnterior();
      if (animar && definicion.desaparecer) fijarSaliendo(true);
    } else if (!enPantalla && (control.current || saliendoRef.current)) {
      // La diapositiva dejó de estar en pantalla: queda en su estado final.
      terminarAnterior();
    }
  });

  // Salida animada: el estado oculto se aplica cuando termina.
  useLayoutEffect(() => {
    if (!saliendo) return;
    const el = ref.current;
    const definicion = efecto ? obtenerEntrada(efecto) : undefined;
    if (!el || !definicion?.desaparecer) {
      fijarSaliendo(false);
      return;
    }
    const c = controlar(definicion.desaparecer(el, { reducido, paso, diapositiva: id }));
    control.current = c;
    void c.terminado.then(() => {
      if (control.current !== c) return;
      control.current = null;
      c.cancelar();
      fijarSaliendo(false);
    });
    // Solo al empezar a salir.
  }, [saliendo]);

  const oculto = !visible && !saliendo;
  return (
    <Etiqueta
      ref={ref}
      className={className ? `entrada ${className}` : 'entrada'}
      data-efecto={efecto}
      data-oculto={oculto ? '' : undefined}
      data-saliendo={saliendo ? '' : undefined}
      style={style}
    >
      <ContextoEntrada.Provider value={padreVisible && visible}>{children}</ContextoEntrada.Provider>
    </Etiqueta>
  );
}
