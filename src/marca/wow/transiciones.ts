/**
 * Transiciones de la dirección nueva (rama diseno-wow). Ninguna pasa de 900 ms
 * para no frenar al orador, y cada una tiene un sentido:
 *
 *   - `camara`: la historia sigue con el mismo orador. La cámara avanza: lo
 *     de antes pasa de largo (crece y se va) y lo nuevo llega desde el fondo.
 *     Es el cambio de panel de la web (team-shell, globals.css:1210-1212:
 *     transform 900 ms cubic-bezier(0.76, 0, 0.24, 1) y opacity 480 ms ease),
 *     con la escala del retrato del perfil (0,94, 03 M5) y la curva de salida
 *     de la marca (globals.css:1387) para lo que llega. 700 ms.
 *   - `cortina`: cambia el orador. Cruza la pantalla el fondo del portal del
 *     equipo de la web (team-stage, globals.css:236-240) y, montado en él,
 *     corre el personaje de píxeles de quien entra (sprite-character, fila
 *     «run»). Con la pantalla tapada, la diapositiva cambia. 850 ms, curva
 *     cubic-bezier(0.76, 0, 0.24, 1) (globals.css:1211; 03 §1, regla 1).
 *   - `inmersion`: de la portada a la charla, la cámara entra en el logo (la
 *     marca es lo único que puede crecer mucho, 03 §1, regla 6). 750 ms.
 *
 * Al retroceder, cada una se reproduce en espejo. Con «menos movimiento», un
 * fundido de 200 ms (MOTOR §4.5: fundidos sí, desplazamientos no).
 */
import atlas from '../relevo/sprite-atlas.json';
import { medio } from '../../motor/medios';
import type { ContextoTransicion, Transicion } from '../../motor/tipos';

/** La salida de la marca: rápida y se posa despacio (globals.css:1387; 03 §1, regla 1). */
const CURVA_MARCA = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Acelera y frena: los cambios de panel de la web (globals.css:1211; 03 §1, regla 1). */
const CURVA_PANEL = 'cubic-bezier(0.76, 0, 0.24, 1)';

function fundido(capa: HTMLElement, entra: boolean): Animation {
  return capa.animate([{ opacity: entra ? 0 : 1 }, { opacity: entra ? 1 : 0 }], {
    duration: 200, // 03 M13: el fundido del menú (MOTOR §4.5, menos movimiento)
    easing: 'ease', // 03 M13
    fill: 'both',
  });
}

/* ——— Cámara ——— */

export const camara: Transicion = {
  entrar: (capa, { direccion, reducido }) => {
    if (reducido) return fundido(capa, true);
    // Hacia delante llega desde el fondo (0,94 → 1, el retrato del perfil, 03 M5); hacia atrás, desde delante.
    const desde = direccion > 0 ? 0.94 : 1.06;
    return capa.animate(
      [
        { opacity: 0, transform: `scale(${desde})` },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: 700, delay: 120, easing: CURVA_MARCA, fill: 'both' }, // 03 M5: el vuelo al retrato, 700 ms; globals.css:1212
    );
  },
  salir: (capa, { direccion, reducido }) => {
    if (reducido) return fundido(capa, false);
    const hasta = direccion > 0 ? 1.06 : 0.94;
    return [
      // transform 900 ms → aquí 700 (tope de la charla), curva del panel (globals.css:1211)
      capa.animate([{ transform: 'scale(1)' }, { transform: `scale(${hasta})` }], {
        duration: 700, // globals.css:1211 (900 ms), al tope de la charla con la entrada encima (03 M5: 700 ms)
        easing: CURVA_PANEL,
        fill: 'both',
      }),
      // opacity 480 ms ease (globals.css:1212)
      capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 480, easing: 'ease', fill: 'both' }),
    ];
  },
};

/* ——— Inmersión (portada → charla) ——— */

export const inmersion: Transicion = {
  entrar: (capa, { direccion, reducido }) => {
    if (reducido) return fundido(capa, true);
    const desde = direccion > 0 ? 0.94 : 1.45;
    return capa.animate(
      [
        { opacity: 0, transform: `scale(${desde})` },
        { opacity: 1, transform: 'scale(1)' },
      ],
      { duration: 600, delay: 150, easing: CURVA_MARCA, fill: 'both' }, // 03 M9: el panel de Proyectos (520–600 ms)
    );
  },
  salir: (capa, { direccion, reducido }) => {
    if (reducido) return fundido(capa, false);
    // Hacia delante, la cámara entra en el logo: crece 1,45 veces y se apaga (con 1,8 la ThinkPad bajaba a 42 fps).
    const hasta = direccion > 0 ? 1.45 : 0.94;
    return capa.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: `scale(${hasta})` },
      ],
      { duration: 750, easing: CURVA_PANEL, fill: 'both' }, // globals.css:1211 (team-shell, 900 ms), al tope de la charla
    );
  },
};

/* ——— Cortina (cambio de orador) ——— */

type IdAtlas = 'jose-leonardo' | 'gregory' | 'angel';
interface FilaAtlas {
  y: number;
  w: number;
  h: number;
  frames: number;
  fps: number;
  ax: number;
  ay: number;
}
const HOJAS = atlas as unknown as Record<IdAtlas, { width: number; animations: Record<string, FilaAtlas> }>;

/** Ancho del panel: con 4200 px tapa la pantalla entera durante un tercio del recorrido (un margen para cuadros lentos). */
const ANCHO_CORTINA = 4200;
/** Inclinación del borde (la diagonal del logo, 57,4° de --zh-firma, a 90° − 57,4° ≈ 32° del vertical; más suave: 14°). */
const SESGO = 14;
const DURACION_CORTINA = 850; // globals.css:1211: el cambio de panel de 900 ms, bajo el tope de 900 ms

/** Un personaje de píxeles hecho a mano (el mismo CSS que Personaje.tsx: personaje.css). */
function spriteSuelto(id: IdAtlas, animacion: string, escala: number): HTMLSpanElement {
  const hoja = HOJAS[id];
  const fila = hoja.animations[animacion];
  const s = document.createElement('span');
  s.className = 'zh-sprite';
  s.dataset.animation = animacion;
  s.dataset.loop = 'true';
  const vars: Record<string, string> = {
    '--sprite': `url("${medio(`medios/equipo/${id}/personaje.webp`)}")`,
    '--atlas-w': String(hoja.width),
    '--y': String(fila.y),
    '--w': String(fila.w),
    '--h': String(fila.h),
    '--ax': String(fila.ax),
    '--ay': String(fila.ay),
    '--frames': String(fila.frames),
    '--duration': `${fila.frames / fila.fps}s`, // sprite-character.tsx:12
    '--s': String(escala),
  };
  for (const [k, v] of Object.entries(vars)) s.style.setProperty(k, v);
  return s;
}

/**
 * La cortina del cambio de orador. `quien` es el personaje que corre montado
 * en ella: el de la persona que toma la palabra.
 */
export function cortina(quien: IdAtlas): Transicion {
  const crearPanel = (capa: HTMLElement, ctx: ContextoTransicion): Animation[] => {
    const contenedor = capa.parentElement;
    if (!contenedor) return [];
    const adelante = ctx.direccion > 0;
    const panel = document.createElement('div');
    panel.className = 'wow-cortina';
    panel.setAttribute('aria-hidden', 'true');
    panel.style.width = `${ANCHO_CORTINA}px`;
    // El fondo del portal se pinta a un cuarto de ancho y se estira ×4: son degradados
    // suaves, se ven igual, y la GPU rasteriza 1050 px en vez de 4200 (medido: menos tirones al empezar).
    const fondo = document.createElement('div');
    fondo.className = 'wow-cortina__fondo';
    panel.appendChild(fondo);
    const piso = document.createElement('div');
    piso.className = 'wow-cortina__piso';
    const sprite = spriteSuelto(quien, 'run', 1.1);
    if (!adelante) sprite.style.scale = '-1 1';
    piso.appendChild(sprite);
    panel.appendChild(piso);
    contenedor.appendChild(panel);
    // De izquierda a derecha al avanzar (el sentido de lectura); al revés al volver.
    // Empieza y acaba justo fuera de la pantalla (170 px: lo que el sesgo saca la esquina).
    const fuera = 1920 + 170;
    const izquierda = -ANCHO_CORTINA - 170;
    const [x0, x1] = adelante ? [izquierda, fuera] : [fuera, izquierda];
    const animacion = panel.animate(
      [
        { transform: `translateX(${x0}px) skewX(${-SESGO}deg)` },
        { transform: `translateX(${x1}px) skewX(${-SESGO}deg)` },
      ],
      { duration: DURACION_CORTINA, easing: CURVA_PANEL, fill: 'both' },
    );
    const quitar = () => panel.remove();
    animacion.finished.then(quitar, quitar);
    animacion.addEventListener('cancel', quitar);
    return [animacion];
  };

  // El cambio, con la pantalla tapada: a la mitad del tiempo (la curva es simétrica, mitad del recorrido).
  const cambio = (entra: boolean): Keyframe[] => [
    { opacity: entra ? 0 : 1, offset: 0 },
    { opacity: entra ? 0 : 1, offset: 0.5 },
    { opacity: entra ? 1 : 0, offset: 0.5 },
    { opacity: entra ? 1 : 0, offset: 1 },
  ];

  return {
    entrar: (capa, ctx) => {
      if (ctx.reducido) return fundido(capa, true);
      return [
        ...crearPanel(capa, ctx),
        capa.animate(cambio(true), { duration: DURACION_CORTINA, easing: 'linear', fill: 'both' }), // Z-00: el corte, bajo la cortina
      ];
    },
    salir: (capa, ctx) => {
      if (ctx.reducido) return fundido(capa, false);
      return capa.animate(cambio(false), { duration: DURACION_CORTINA, easing: 'linear', fill: 'both' }); // Z-00: el corte, bajo la cortina
    },
  };
}
