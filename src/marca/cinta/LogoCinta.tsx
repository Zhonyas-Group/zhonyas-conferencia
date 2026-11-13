/**
 * El logo de la portada y su transformación en cinta (síntesis §4.3 y Z-02).
 *
 * El SVG es el armazón de zhonyas-web/app/page.tsx:806-1010 tal cual (mismos
 * trazados, degradados, filtros y máscara), con los id con sufijo para que
 * varias copias en el mismo documento (la sala, el presentador, las vecinas)
 * no se pisen la máscara. Lo mueve escena.ts (las funciones de page.tsx) con
 * el reloj de reloj.ts en vez del scroll.
 *
 *   <Monograma />                          la portada: el logo quieto, como en la web tras hidratarse (M1)
 *   <LogoCinta desde={1}>…</LogoCinta>     en el paso 1, Z-02: la H y el nombre se apagan, la Z se
 *                                          vuelve cinta y la cinta va a la derecha; lo de dentro
 *                                          aparece por corte cuando termina (GUION, 20)
 *   <LogoCinta desde={1} sentido="cinta-a-logo" />   el camino de vuelta
 *
 * Igual que una <Entrada> con nombre: solo se anima al AVANZAR hasta `desde`,
 * en la diapositiva que está en pantalla. Al retroceder, al saltar, en «Siguiente»,
 * en las miniaturas y en revisión queda en su estado, de golpe. Si el orador
 * avanza a mitad, la escena salta a su final. Cuenta como un momento animado
 * (A-54): «cinta@desde».
 *
 * Lo que NO se trae de la web (anti-slop y proyector, síntesis §3.2 y §4.1):
 * el halo de .logo-stage::before (globals.css:160-172, 5,5 % de magenta), el
 * fondo radial y el grano del body (globals.css:90-101). El fondo es --zh-fondo.
 */
import { useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useDiapositiva, useMovimiento } from '../../motor/contexto';
import { anotarMomento } from '../../motor/momentos';
import {
  CENTRO_CINTA_INICIAL,
  estadoEscena,
  transformLogo,
  trazadoCintaTerminada,
} from './escena';
import { recorrido, progresoEn, type Ritmo, type Sentido } from './reloj';
import { buildRibbonGeometry } from './ribbonGeometry';
import './cinta.css';

// page.tsx:22-23
const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

// Trazados del monograma (page.tsx:904-912).
export const Z_SHAPE =
  'M 389 404 H 626 C 656 404 678 426 678 455 C 678 470 673 482 662 493 L 505 664 H 705 C 731 664 750 676 762 698 L 776 726 C 779 732 775 738 768 738 H 437 C 412 738 395 721 395 696 C 395 682 400 672 410 661 L 591 476 H 452 C 431 476 415 465 406 447 L 386 414 C 382 408 385 404 389 404 Z';
export const H_SHAPE =
  'M 608 596 L 658 545 C 666 537 677 533 690 533 H 777 C 784 533 788 529 788 521 V 453 C 788 434 796 419 810 408 L 849 380 C 854 377 858 380 858 386 V 678 C 858 700 847 716 829 727 L 788 739 V 605 H 612 C 606 605 604 601 608 596 Z';

/** Sufijo seguro para id de SVG a partir de useId (React pone caracteres que no valen en url(#…)). */
function useSufijo(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

export interface PropsLogoCinta {
  /**
   * Paso en el que la escena va de su estado inicial al final. Sin `desde`, la
   * escena se queda quieta en su estado inicial (la portada).
   */
  desde?: number;
  /** `logo-a-cinta` (por defecto) o `cinta-a-logo` (reloj.ts). */
  sentido?: Sentido;
  /** `menu` (por defecto: 1,2 s / 1,05 s con easeOutExpo) o `lento` (5957 ms a ritmo fijo). Ver reloj.ts. */
  ritmo?: Ritmo;
  /**
   * Lo que aparece, por corte, cuando la escena llega a su final (la idea, la
   * acción, «zhonyas.com» y el QR de la 20). Va en una capa de 1920 × 1080
   * encima del logo; se coloca con posición absoluta (medidas.ts: CAJA_CINTA_FINAL).
   */
  children?: ReactNode;
  /** Texto alternativo del logo. */
  etiqueta?: string;
}

interface Animacion {
  raf: number;
  testigo: Animation | null;
}

export function LogoCinta({ desde, sentido = 'logo-a-cinta', ritmo = 'menu', children, etiqueta }: PropsLogoCinta) {
  const { id, paso, direccion, rol, modo, activa } = useDiapositiva();
  const { instantaneo } = useMovimiento();
  const s = useSufijo();
  const ids = useMemo(
    () => ({
      gradiente: `mark-gradient-${s}`,
      brillo: `mark-shine-${s}`,
      palabra: `word-gradient-${s}`,
      sombra: `mark-shadow-${s}`,
      sombraPalabra: `word-shadow-${s}`,
      veta: `mark-texture-${s}`,
      z: `z-shape-${s}`,
      h: `h-shape-${s}`,
      zClip: `z-clip-${s}`,
      hClip: `h-clip-${s}`,
      encimaDeLaBase: `moving-above-base-${s}`,
      mascara: `ribbon-mask-${s}`,
      recorte: `ribbon-clip-${s}`,
    }),
    [s],
  );

  const r = useMemo(() => recorrido(sentido, ritmo), [sentido, ritmo]);
  const alcanzado = desde !== undefined && paso >= desde;
  const enPantalla = modo === 'escenario' && rol === 'actual' && activa;

  const raizRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<SVGSVGElement>(null);
  const logoArtworkRef = useRef<SVGGElement>(null);
  const originalRibbonRef = useRef<SVGUseElement>(null);
  const ribbonBaseRef = useRef<SVGPathElement>(null);
  const ribbonBodyRef = useRef<SVGPathElement>(null);
  const ribbonTipRef = useRef<SVGPathElement>(null);
  // Arreglo del PR #1 (escena.ts, trazadoCintaTerminada).
  const rellenoRef = useRef<SVGGElement>(null);
  const recorteRef = useRef<SVGPathElement>(null);
  const filoRef = useRef<SVGGElement>(null);

  /** Lo último que se escribió, para no tocar el DOM si no cambia (page.tsx:200-207, 125). */
  const escrito = useRef({ ribbonProgress: -1, centro: CENTRO_CINTA_INICIAL, transform: '', recorte: '' });
  const animacion = useRef<Animacion | null>(null);
  const antes = useRef<{ alcanzado: boolean; enPantalla: boolean } | null>(null);
  const [animando, setAnimando] = useState(false);

  /** Pinta la escena en un progreso: lo que hace updateFromScroll (page.tsx:252, 295-368, 445-492). */
  const aplicar = (progreso: number) => {
    const raiz = raizRef.current;
    const logo = logoRef.current;
    if (!raiz || !logo) return;
    const e = estadoEscena(progreso);
    const w = escrito.current;

    // page.tsx:252 → responsive.css:16-19 (la sombra y la veta se apagan mientras se transforma).
    raiz.toggleAttribute('data-logo-morphing', e.morphing);
    // page.tsx:299-300
    if (logo.style.getPropertyValue('--fade-opacity') !== e.fadeOpacity) logo.style.setProperty('--fade-opacity', e.fadeOpacity);

    // page.tsx:313-317
    const setPath = (element: SVGPathElement | null, path: string) => {
      if (!element) return;
      element.style.display = path ? '' : 'none';
      if (path && element.getAttribute('d') !== path) element.setAttribute('d', path);
    };

    const ribbonProgress = e.ribbonProgress;
    const lastRibbonProgress = w.ribbonProgress;
    // page.tsx:319-368
    if (
      Math.abs(ribbonProgress - lastRibbonProgress) >= 0.00025 ||
      (ribbonProgress === 1 && lastRibbonProgress !== 1) ||
      (ribbonProgress === 0 && lastRibbonProgress !== 0)
    ) {
      w.ribbonProgress = ribbonProgress;
      const geometry = buildRibbonGeometry(ribbonProgress);

      if (originalRibbonRef.current) {
        originalRibbonRef.current.style.display = geometry.showOriginal ? '' : 'none';
      }

      setPath(ribbonBaseRef.current, geometry.basePath);
      setPath(ribbonBodyRef.current, geometry.bodyPath);
      setPath(ribbonTipRef.current, geometry.tipPath);

      if (ribbonTipRef.current) {
        if (geometry.clipTip) {
          ribbonTipRef.current.setAttribute('clip-path', `url(#${ids.encimaDeLaBase})`);
        } else {
          ribbonTipRef.current.removeAttribute('clip-path');
        }
      }

      if (ribbonProgress === 1) {
        // page.tsx:343-367: mide la cinta terminada para saber su centro (solo
        // cuenta al volver al centro o al expandirse, fuera de 0–0,42).
        const ribbonParts = [ribbonBaseRef.current, ribbonBodyRef.current, ribbonTipRef.current].filter(
          (part): part is SVGPathElement => Boolean(part && part.style.display !== 'none'),
        );
        let minimumX = Number.POSITIVE_INFINITY;
        let maximumX = Number.NEGATIVE_INFINITY;
        try {
          ribbonParts.forEach((part) => {
            const bounds = part.getBBox();
            minimumX = Math.min(minimumX, bounds.x);
            maximumX = Math.max(maximumX, bounds.x + bounds.width);
          });
        } catch {
          /* sin caja (capa sin pintar): se queda el centro anterior */
        }
        if (Number.isFinite(minimumX) && Number.isFinite(maximumX) && maximumX > minimumX) {
          w.centro = clamp((minimumX + maximumX) / 2 / 1254, 0.45, 0.7);
        }
      }

      // PR #1 de zhonyas-web (0cbe819): con la cinta terminada, un solo trazado
      // de recorte en vez de la máscara, y dos trazos (degradado y brillo) que
      // reponen el filo de 2 unidades del trazo blanco de la máscara. Mientras
      // la forma cambia, la máscara.
      const unico = trazadoCintaTerminada(geometry);
      const relleno = rellenoRef.current;
      const filo = filoRef.current;
      if (relleno && filo) {
        if (unico) {
          if (w.recorte !== unico) {
            w.recorte = unico;
            recorteRef.current?.setAttribute('d', unico);
            filo.querySelectorAll('path').forEach((p) => p.setAttribute('d', unico));
          }
          relleno.removeAttribute('mask');
          relleno.setAttribute('clip-path', `url(#${ids.recorte})`);
          filo.style.display = '';
        } else {
          relleno.removeAttribute('clip-path');
          relleno.setAttribute('mask', `url(#${ids.mascara})`);
          filo.style.display = 'none';
        }
      }
    }

    // page.tsx:486-492 (con las medidas fijas del escenario, escena.ts)
    const transform = transformLogo(e, w.centro);
    if (w.transform !== transform) {
      w.transform = transform;
      logoArtworkRef.current?.setAttribute('transform', transform);
    }
  };

  // Un solo momento animado: la escena (A-54).
  useLayoutEffect(() => {
    if (desde !== undefined) anotarMomento(id, `cinta@${desde}`);
  }, [id, desde]);

  useLayoutEffect(() => {
    const previo = antes.current;
    antes.current = { alcanzado, enPantalla };

    // Lo que estuviera corriendo se lleva a su final (el orador avanzó a mitad, o la diapositiva dejó la pantalla).
    const enCurso = animacion.current;
    if (enCurso) {
      cancelAnimationFrame(enCurso.raf);
      enCurso.testigo?.cancel();
      animacion.current = null;
    }

    const loVeiaElPublico = !!previo && previo.enPantalla && previo.alcanzado;
    const animar = alcanzado && !loVeiaElPublico && enPantalla && !instantaneo && direccion === 1;
    if (!animar) {
      aplicar(alcanzado ? r.hasta : r.desde);
      setAnimando(false);
      return;
    }

    // El reloj: performance.now (el laboratorio lo congela y lo mueve cuadro a cuadro).
    const inicio = performance.now();
    // Testigo para el motor: mientras corre, la diapositiva «se está animando» y
    // las vecinas no se montan (Secuencia.tsx, animandose). No cambia nada visible.
    const testigo =
      raizRef.current?.animate([{ opacity: 1 }, { opacity: 1 }], {
        duration: r.duracion, // la de la escena (reloj.ts)
        easing: 'linear',
      }) ?? null;
    const cuadro = () => {
      const ms = performance.now() - inicio;
      aplicar(progresoEn(r, ms));
      const a = animacion.current;
      if (!a) return;
      if (ms >= r.duracion) {
        a.testigo?.cancel();
        animacion.current = null;
        setAnimando(false);
        return;
      }
      a.raf = requestAnimationFrame(cuadro);
    };
    aplicar(progresoEn(r, 0));
    animacion.current = { raf: requestAnimationFrame(cuadro), testigo };
    setAnimando(true);
  }, [alcanzado, enPantalla, instantaneo, direccion, paso, r]);

  // Al desmontar (y en el doble montaje de StrictMode): parar y olvidar lo visto.
  useLayoutEffect(
    () => () => {
      const a = animacion.current;
      if (a) {
        cancelAnimationFrame(a.raf);
        a.testigo?.cancel();
      }
      animacion.current = null;
      antes.current = null;
      escrito.current = { ribbonProgress: -1, centro: CENTRO_CINTA_INICIAL, transform: '', recorte: '' };
    },
    [],
  );

  const terminada = alcanzado && !animando;

  return (
    <div
      ref={raizRef}
      className="zh-logo-cinta"
      data-sentido={sentido}
      data-terminada={terminada ? '' : undefined}
    >
      <div className="zh-logo-cinta__escenario">
        <svg
          ref={logoRef}
          className="zh-logo-cinta__logo"
          viewBox="0 0 1254 1254"
          role="img"
          aria-label={etiqueta ?? 'Zhonyas, monograma geométrico en degradado magenta y violeta'}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={ids.gradiente} x1="386" y1="700" x2="858" y2="398" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ef0bb4" />
              <stop offset="0.43" stopColor="#db33dc" />
              <stop offset="0.76" stopColor="#bc59ef" />
              <stop offset="1" stopColor="#a975ff" />
            </linearGradient>

            <linearGradient id={ids.brillo} x1="421" y1="420" x2="819" y2="699" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff79ec" stopOpacity="0.18" />
              <stop offset="0.48" stopColor="#ffffff" stopOpacity="0.04" />
              <stop offset="1" stopColor="#7b48ff" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id={ids.palabra} x1="0" y1="784" x2="0" y2="927" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.56" stopColor="#f6f6f8" />
              <stop offset="1" stopColor="#dddde4" />
            </linearGradient>

            <filter id={ids.sombra} x="-20%" y="-20%" width="140%" height="150%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="blur" />
              <feColorMatrix
                in="blur"
                type="matrix"
                values=".72 0 0 0 .21 0 .24 0 0 .02 0 0 .85 0 .39 0 0 0 .42 0"
                result="glow"
              />
              <feOffset dy="8" in="SourceAlpha" result="offset" />
              <feGaussianBlur in="offset" stdDeviation="15" result="shadow-blur" />
              <feColorMatrix
                in="shadow-blur"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .7 0"
                result="dark-shadow"
              />
              <feMerge>
                <feMergeNode in="dark-shadow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={ids.sombraPalabra} x="-8%" y="-30%" width="116%" height="170%">
              <feDropShadow dx="0" dy="7" stdDeviation="8" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            <filter id={ids.veta} x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.035 0.48" numOctaves="2" seed="21" result="noise" />
              <feComposite in="noise" in2="SourceGraphic" operator="in" result="texture" />
              <feColorMatrix in="texture" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .09 0" />
            </filter>

            <path id={ids.z} d={Z_SHAPE} />
            <path id={ids.h} d={H_SHAPE} />

            <clipPath id={ids.zClip}>
              <use href={`#${ids.z}`} />
            </clipPath>
            <clipPath id={ids.hClip}>
              <use href={`#${ids.h}`} />
            </clipPath>

            <clipPath id={ids.encimaDeLaBase} clipPathUnits="userSpaceOnUse">
              <rect x="0" y="0" width="1254" height="664.5" />
            </clipPath>

            {/* PR #1 (0cbe819): el recorte de un solo trazado de la cinta terminada. */}
            <clipPath id={ids.recorte} clipPathUnits="userSpaceOnUse">
              <path ref={recorteRef} />
            </clipPath>

            <mask
              id={ids.mascara}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1254"
              height="1254"
              style={{ maskType: 'luminance' }}
            >
              <rect width="1254" height="1254" fill="#000000" />
              <use ref={originalRibbonRef} href={`#${ids.z}`} fill="#ffffff" />
              <path
                ref={ribbonBaseRef}
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ display: 'none' }}
              />
              <path
                ref={ribbonBodyRef}
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                clipPath={`url(#${ids.encimaDeLaBase})`}
                style={{ display: 'none' }}
              />
              <path
                ref={ribbonTipRef}
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ display: 'none' }}
              />
            </mask>
          </defs>

          <g ref={logoArtworkRef}>
            <g filter={`url(#${ids.sombra})`}>
              {/*
                PR #1 (0cbe819): el filo de 2 unidades que pone el trazo blanco de
                la máscara (page.tsx:943-945), repuesto con dos trazos: el
                degradado y el brillo. Va debajo del relleno recortado, para que
                solo se vea la unidad de fuera. Oculto mientras se usa la máscara.
              */}
              <g ref={filoRef} fill="none" strokeWidth="2" strokeLinejoin="round" style={{ display: 'none' }}>
                <path stroke={`url(#${ids.gradiente})`} />
                <path stroke={`url(#${ids.brillo})`} />
              </g>
              <g ref={rellenoRef} mask={`url(#${ids.mascara})`}>
                <rect width="1254" height="1254" fill={`url(#${ids.gradiente})`} />
                <rect width="1254" height="1254" fill={`url(#${ids.brillo})`} />
                <rect
                  className="zh-logo-cinta__veta"
                  width="1254"
                  height="1254"
                  fill="#ffffff"
                  opacity="0.24"
                  filter={`url(#${ids.veta})`}
                />
              </g>
              <use className="fade-target" href={`#${ids.h}`} fill={`url(#${ids.gradiente})`} />
              <use className="fade-target" href={`#${ids.h}`} fill={`url(#${ids.brillo})`} />
            </g>

            <g className="fade-target">
              <g className="zh-logo-cinta__veta" clipPath={`url(#${ids.hClip})`} opacity="0.24" filter={`url(#${ids.veta})`}>
                <rect x="380" y="375" width="490" height="375" fill="#ffffff" />
              </g>
            </g>

            <g
              className="fade-target"
              fill="none"
              stroke={`url(#${ids.palabra})`}
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#${ids.sombraPalabra})`}
            >
              <path d="M 287 794 H 361 L 287 892 H 366" />
              <path d="M 400 794 V 892 M 400 844 C 412 827 432 823 447 835 C 458 844 462 856 462 872 V 892" />
              <ellipse cx="530" cy="858" rx="38" ry="35" />
              <path d="M 600 892 V 834 M 600 844 C 612 827 635 823 651 836 C 662 845 666 857 666 872 V 892" />
              <path d="M 705 833 V 859 C 705 882 718 894 736 894 C 757 894 771 879 771 857 V 833 M 771 833 V 882 C 771 906 757 923 736 923 C 727 923 718 920 710 915" />
              <ellipse cx="840" cy="858" rx="36" ry="35" />
              <path d="M 876 833 V 892" />
              <path d="M 960 833 H 931 C 919 833 912 840 912 849 C 912 859 921 864 933 864 H 944 C 956 864 964 869 964 879 C 964 887 957 892 946 892 H 914" />
            </g>
          </g>
        </svg>
      </div>

      {children !== undefined && (
        <div className="zh-logo-cinta__despues" data-oculto={terminada ? undefined : ''}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * La portada (síntesis §4.3; 03 M1): el logo quieto como queda la web después
 * de hidratarse, la caja SVG del alto de la pantalla y viewBox «0 0 1254 1254»,
 * con veta y sombra. Sin animación de entrada.
 */
export function Monograma({ etiqueta }: { etiqueta?: string }) {
  return <LogoCinta etiqueta={etiqueta} />;
}

