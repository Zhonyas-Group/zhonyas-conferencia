/**
 * Z-09 · El logo 3D en vivo, para que el orador lo gire con el ratón.
 *
 * Es zhonyas-web/components/interactive-logo-3d.tsx (con globals.css:2004-2094)
 * casi tal cual: 16 copias SVG del monograma apiladas en CSS 3D, sin WebGL
 * (02 §5.8; 03 M11). Lo que cambia, y por qué:
 *   1. useMobileLayout() y useAnimationPolicy() son constantes: escritorio y
 *      calidad «full», la laptop de la charla (síntesis §9.2, punto 6).
 *   2. Sin el rótulo «Arrastra para explorar» (MAYÚSCULAS e icono de Lucide:
 *      A-31, A-61) ni los botones del teléfono (no es teléfono).
 *   3. Sin teclado: en la charla las flechas son del puntero y pasan de
 *      diapositiva (teclado.ts). El original giraba con ellas (l. 100-120) y
 *      la diapositiva avanzaría a la vez.
 *   4. `data-sin-clic`: arrastrar no avanza la diapositiva (Sala.tsx, esInteractivo).
 *   5. Los halos solo con `halo`: el resplandor magenta de la cara
 *      (drop-shadow 0 0 22px, globals.css:2060-2062) y el «suelo» difuminado
 *      (globals.css:2066-2076). Anti-slop (síntesis §3.2) y en un proyector
 *      no se ven (§4.1). La sombra negra de la cara y el filo de 1 px de cada
 *      capa se quedan: son la forma, no adorno.
 *   6. Solo responde en la diapositiva que está en pantalla; al salir de ella
 *      vuelve al reposo.
 * Sin animación de entrada, como en la web (03 M11).
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import { useDiapositiva } from '../../motor/contexto';
import './logo3d.css';

// interactive-logo-3d.tsx:16-20
const Z_PATH =
  "M 389 404 H 626 C 656 404 678 426 678 455 C 678 470 673 482 662 493 L 505 664 H 705 C 731 664 750 676 762 698 L 776 726 C 779 732 775 738 768 738 H 437 C 412 738 395 721 395 696 C 395 682 400 672 410 661 L 591 476 H 452 C 431 476 415 465 406 447 L 386 414 C 382 408 385 404 389 404 Z";

const H_PATH =
  "M 608 596 L 658 545 C 666 537 677 533 690 533 H 777 C 784 533 788 529 788 521 V 453 C 788 434 796 419 810 408 L 849 380 C 854 377 858 380 858 386 V 678 C 858 700 847 716 829 727 L 788 739 V 605 H 612 C 606 605 604 601 608 596 Z";

// interactive-logo-3d.tsx:22-23
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

type Rotation = {
  x: number;
  y: number;
};

// Las dos políticas de la web, fijas (cambio 1): escritorio y calidad «full».
const LITE = false; // useAnimationPolicy().lite (interactive-logo-3d.tsx:32)
const ECONOMICAL = false; // useAnimationPolicy().economical (interactive-logo-3d.tsx:32)

/** Reposo: rotateX(-8deg) rotateY(-16deg) (interactive-logo-3d.tsx:38, 110, 143). */
export const REPOSO: Rotation = { x: -8, y: -16 };

export interface PropsLogo3D {
  /** Que responda al ratón (por defecto, sí). */
  interactive?: boolean;
  /** Ancho del objeto en px del escenario: min(95 %, 730px) (globals.css:2036). */
  ancho?: number;
  /** El resplandor de la cara y el suelo de la web (cambio 5). Por defecto, no. */
  halo?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Logo3D({ interactive: pedidoInteractivo = true, ancho = 730, halo = false, className, style }: PropsLogo3D) {
  const { activa } = useDiapositiva();
  // Cambio 6: solo en la diapositiva que está en pantalla.
  const interactive = pedidoInteractivo && activa;
  // interactive-logo-3d.tsx:33
  const layerCount = LITE ? (interactive ? 4 : 2) : ECONOMICAL ? 8 : 16;
  const [isDragging, setIsDragging] = useState(false);
  const gradientId = `logo3d-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const highlightId = `logo3d-highlight-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const objectRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<Rotation>({ ...REPOSO });
  const animationFrameRef = useRef(0);
  const dragStart = useRef({ pointerX: 0, pointerY: 0, rotationX: 0, rotationY: 0 });

  // interactive-logo-3d.tsx:42-52
  const updateRotation = useCallback((nextRotation: Rotation) => {
    rotationRef.current = nextRotation;
    if (animationFrameRef.current) return;
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = 0;
      if (objectRef.current) {
        objectRef.current.style.transform =
          `rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
      }
    });
  }, []);

  // interactive-logo-3d.tsx:54-57
  useEffect(
    () => () => cancelAnimationFrame(animationFrameRef.current),
    [],
  );

  // Cambio 6: al dejar la pantalla, de vuelta al reposo.
  useEffect(() => {
    if (!activa) {
      setIsDragging(false);
      updateRotation({ ...REPOSO });
    }
  }, [activa, updateRotation]);

  // interactive-logo-3d.tsx:59-68
  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      rotationX: rotationRef.current.x,
      rotationY: rotationRef.current.y,
    };
    setIsDragging(true);
  }, []);

  // interactive-logo-3d.tsx:70-91
  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const deltaX = event.clientX - dragStart.current.pointerX;
      const deltaY = event.clientY - dragStart.current.pointerY;

      updateRotation({
        x: clamp(dragStart.current.rotationX - deltaY * 0.28, -38, 38), // l. 76: 0,28° por px, tope ±38°
        y: dragStart.current.rotationY + deltaX * 0.36, // l. 77: 0,36° por px, sin tope
      });
      return;
    }

    if (LITE) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width;
    const pointerY = (event.clientY - bounds.top) / bounds.height;

    updateRotation({
      x: clamp((0.5 - pointerY) * 22, -18, 18), // l. 88: ±18°
      y: clamp((pointerX - 0.5) * 30, -24, 24), // l. 89: ±24°
    });
  }, [isDragging, updateRotation]);

  // interactive-logo-3d.tsx:93-98
  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  }, []);

  return (
    <div className={className ? `zh-logo3d ${className}` : 'zh-logo3d'} style={style}>
      <div
        className={`zh-logo3d__viewport${isDragging ? ' is-dragging' : ''}`}
        role="img"
        aria-label="Logo 3D de Zhonyas"
        data-sin-clic={interactive ? '' : undefined}
        data-interactivo={interactive ? '' : undefined}
        onPointerDown={interactive ? handlePointerDown : undefined}
        onPointerMove={interactive ? handlePointerMove : undefined}
        onPointerUp={interactive ? endDrag : undefined}
        onPointerCancel={interactive ? endDrag : undefined}
        // interactive-logo-3d.tsx:134-136
        onPointerLeave={interactive && !LITE ? () => {
          if (!isDragging) updateRotation({ ...REPOSO });
        } : undefined}
      >
        <div
          ref={objectRef}
          className="zh-logo3d__object"
          style={{
            width: ancho,
            transform: `rotateX(${REPOSO.x}deg) rotateY(${REPOSO.y}deg)`,
          }}
        >
          {/* interactive-logo-3d.tsx:146-165 */}
          {Array.from({ length: layerCount }, (_, index) => {
            const layer = index * (16 / layerCount);
            const depth = 15 - layer;
            const lightness = 20 + layer * 0.75;

            return (
              <svg
                key={index}
                className="zh-logo3d__layer"
                viewBox="350 340 545 440"
                aria-hidden="true"
                style={{
                  transform: `translate3d(${depth * 0.48}px, ${depth * 0.62}px, ${-depth * 2.2}px)`,
                }}
              >
                <path d={Z_PATH} fill={`hsl(286 58% ${lightness}%)`} />
                <path d={H_PATH} fill={`hsl(270 54% ${lightness + 2}%)`} />
              </svg>
            );
          })}

          {/* interactive-logo-3d.tsx:167-202 */}
          <svg
            className={`zh-logo3d__layer zh-logo3d__face${halo ? ' zh-logo3d__face--halo' : ''}`}
            viewBox="350 340 545 440"
            aria-hidden="true"
          >
            <defs>
              {/* auditar-excepcion-inicio: A-34 — la cara del logo 3D (Z-09) con su degradado y su brillo, copiados tal cual de interactive-logo-3d.tsx:173-196; es el objeto, no un adorno, y ninguna diapositiva de la charla usa Z-09 (docs/GUION.md) */}
              <linearGradient
                id={gradientId}
                x1="386"
                y1="718"
                x2="858"
                y2="390"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#f014b8" />
                <stop offset="0.48" stopColor="#d43dde" />
                <stop offset="1" stopColor="#9f79ff" />
              </linearGradient>
              <linearGradient
                id={highlightId}
                x1="435"
                y1="390"
                x2="785"
                y2="730"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ffffff" stopOpacity="0.28" />
                <stop offset="0.52" stopColor="#ffffff" stopOpacity="0.03" />
                <stop offset="1" stopColor="#7d42ff" stopOpacity="0.18" />
              </linearGradient>
              {/* auditar-excepcion-fin */}
            </defs>
            <path d={Z_PATH} fill={`url(#${gradientId})`} />
            <path d={H_PATH} fill={`url(#${gradientId})`} />
            <path d={Z_PATH} fill={`url(#${highlightId})`} />
            <path d={H_PATH} fill={`url(#${highlightId})`} />
          </svg>
        </div>

        {/* interactive-logo-3d.tsx:205 (cambio 5: solo con `halo`) */}
        {halo && <div className="zh-logo3d__floor" aria-hidden="true" />}
      </div>
    </div>
  );
}
