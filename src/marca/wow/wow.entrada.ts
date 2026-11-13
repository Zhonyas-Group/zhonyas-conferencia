/**
 * Entradas con nombre de la dirección nueva (rama diseno-wow). Cada duración,
 * retraso y curva lleva su fuente: un archivo de zhonyas-web con su línea o
 * la medida de investigacion/03-movimiento-zhonyas.md (M-n).
 *
 *   palabras  · el texto se genera palabra a palabra con desenfoque (M3)
 *   letras    · una palabra que se descubre letra a letra de abajo arriba (M3)
 *   ensamblar · las 16 capas del logo 3D se juntan y el objeto gira a su reposo
 *   escritura · la libreta se escribe sola: renglones de izquierda a derecha y trazos
 *   raya      · la raya del tiempo se dibuja de izquierda a derecha
 *   caer      · una fecha cae a su sitio en la raya
 *   reloj     · un reloj sin efecto visible para piezas que se dibujan solas (la cascada de la 04)
 */
import { registrarEntrada } from '../../motor/entradas';
import './wow.css';

declare module '../../motor/entradas' {
  interface EntradasRegistradas {
    palabras: true;
    letras: true;
    ensamblar: true;
    escritura: true;
    raya: true;
    caer: true;
    reloj: true;
  }
}

/** La salida de la marca (globals.css:1387; 03 §1, regla 1). */
const CURVA_MARCA = 'cubic-bezier(0.22, 1, 0.36, 1)';

const fundido = (el: HTMLElement) =>
  // Menos movimiento: un fundido de 200 ms con ease (MOTOR §4.5; el fundido del menú de la web, 03 M13)
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease', fill: 'backwards' }); // 03 M13

/* ——— palabras: animated-textgenerate.tsx (03 M3) ——— */

/** Una palabra cada max(speed × 200, 100) ms = 100 ms (animated-textgenerate.tsx:46; 03 M3: 100 ms medidos). */
const ENTRE_PALABRAS = 100;
/** Cada palabra, opacidad 0 → 1 y blur(10px) → 0 en speed × 0,3 s = 84 ms, easeOut (animated-textgenerate.tsx:96-104; page.tsx:1027, speed 0,28). */
const PALABRA = 84;
/** Hasta 4 píldoras por delante; aparecen en 200 ms, escala 0,8 → 1 y opacidad 0 → 0,4 (animated-textgenerate.tsx:66-70, :120-130). */
const PILDORAS = 4;
const PILDORA = 200;

registrarEntrada({
  nombre: 'palabras',
  movimiento: 'M3',
  fuente: 'animated-textgenerate.tsx:46, :96-104 y :120-130; page.tsx:1027 (speed 0,28); 03 M3 (100 ms por palabra, 84 ms cada una)',
  aparecer: (el, { reducido }) => {
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')];
    if (reducido || palabras.length === 0) return fundido(el);
    const animaciones: Animation[] = [];
    palabras.forEach((palabra, i) => {
      const llega = (i + 1) * ENTRE_PALABRAS; // la primera, al primer tic del intervalo
      animaciones.push(
        palabra.animate(
          [
            { opacity: 0, filter: 'blur(10px)' },
            { opacity: 1, filter: 'blur(0px)' },
          ],
          { duration: PALABRA, delay: llega, easing: 'ease-out', fill: 'backwards' }, // easeOut: animated-textgenerate.tsx:102
        ),
      );
      const desde = Math.max(0, llega - PILDORAS * ENTRE_PALABRAS);
      const dura = llega - desde;
      animaciones.push(
        palabra.animate(
          [
            // auditar-excepcion-inicio: A-34 — el gris de la píldora, bg-gray-600 de animated-textgenerate.tsx:127
            { opacity: 0, transform: 'scale(0.8)', backgroundColor: '#4b5563' }, // bg-gray-600 (animated-textgenerate.tsx:127)
            { opacity: 0.4, transform: 'scale(1)', backgroundColor: '#4b5563', offset: Math.min(1, PILDORA / dura) },
            { opacity: 0.4, transform: 'scale(1)', backgroundColor: '#4b5563' },
            // auditar-excepcion-fin
          ],
          { duration: dura, delay: desde, easing: 'linear', fill: 'backwards', pseudoElement: '::after' }, // 200 ms: animated-textgenerate.tsx:123
        ),
      );
    });
    return animaciones;
  },
});

/* ——— letras: fancy-text.tsx (03 M3, «Nosotros») ——— */

registrarEntrada({
  nombre: 'letras',
  movimiento: 'M3',
  fuente: 'fancy-text.tsx:56-62 y page.tsx:1027-1047: clip-path de abajo arriba, 850 ms, ease, 75 ms entre letras (03 M3)',
  aparecer: (el, { reducido }) => {
    const letras = [...el.querySelectorAll<HTMLElement>('[data-letra]')];
    if (reducido || letras.length === 0) return fundido(el);
    return letras.map((letra, i) =>
      letra.animate(
        [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(-25% 0 -25% 0)' }], // fancy-text.tsx:58-59
        { duration: 850, delay: 450 + i * 75, easing: 'ease', fill: 'backwards' }, // 850 ms, 75 ms (03 M3); 450 ms: cuando el logo ya está casi armado
      ),
    );
  },
});

/* ——— ensamblar: el logo 3D (interactive-logo-3d.tsx) se arma capa a capa ——— */

registrarEntrada({
  nombre: 'ensamblar',
  movimiento: 'M11 + M4',
  fuente:
    'Capas y reposo de interactive-logo-3d.tsx:38 y :146-165; 1100 ms y la curva de la marca: la entrada de Contacto (03 §1, regla 1: 1000–1100 ms, cubic-bezier(0.22, 1, 0.36, 1))',
  aparecer: (el, { reducido }) => {
    const objeto = el.querySelector<HTMLElement>('.zh-logo3d__object');
    const capas = [...el.querySelectorAll<SVGElement>('.zh-logo3d__layer')];
    if (reducido || !objeto) return fundido(el);
    const final = objeto.style.transform || 'rotateX(-8deg) rotateY(-16deg)';
    const animaciones: Animation[] = [
      objeto.animate(
        [
          { transform: 'rotateX(24deg) rotateY(-118deg) scale(0.62)', opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: `${final} scale(1)`, opacity: 1 },
        ],
        { duration: 1100, easing: CURVA_MARCA, fill: 'backwards' }, // 03 M12: la entrada de Contacto, 1000–1100 ms (03 §1, regla 1)
      ),
    ];
    const total = capas.length;
    capas.forEach((capa, i) => {
      const propia = capa.style.transform || 'translateZ(6px)';
      // Las capas del fondo empiezan más lejos: el bloque se junta como un acordeón.
      const lejos = (total - i) * 46;
      animaciones.push(
        capa.animate([{ transform: `${propia} translateZ(${-lejos}px)` }, { transform: propia }], {
          duration: 1100, // 03 M12: la entrada de Contacto (03 §1, regla 1)
          easing: CURVA_MARCA,
          fill: 'backwards',
        }),
      );
    });
    return animaciones;
  },
});

/* ——— escritura: la libreta que se escribe sola ——— */

/** Velocidad de la mano: 38 ms por letra; entre renglones, 120 ms (la consola de la web deja 400 ms entre líneas, 03 M8; a mano va más suelto). */
const POR_LETRA = 38;
const ENTRE_RENGLONES = 120;

registrarEntrada({
  nombre: 'escritura',
  movimiento: 'M8',
  fuente:
    'El descubrimiento de izquierda a derecha con clip-path de la consola (service-terminal.tsx; 03 M8, 03 §1 regla 3); los trazos, stroke-dashoffset con la curva de la marca (globals.css:1387)',
  aparecer: (el, { reducido }) => {
    const trazos = [...el.querySelectorAll<HTMLElement | SVGPathElement>('[data-trazo]')];
    if (reducido || trazos.length === 0) return fundido(el);
    let t = 350; // 03 M8: la consola escribe cuando el panel ya entró (aquí, la cámara: 350 ms)
    const animaciones: Animation[] = [];
    for (const trazo of trazos) {
      if (trazo instanceof SVGElement) {
        const dura = Number(trazo.getAttribute('data-trazo')) || 360;
        animaciones.push(
          trazo.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
            duration: dura,
            delay: t,
            easing: CURVA_MARCA,
            fill: 'backwards',
          }),
        );
        t += dura * 0.7;
      } else {
        const letras = (trazo.textContent ?? '').length;
        const dura = Math.max(220, letras * POR_LETRA);
        animaciones.push(
          trazo.animate([{ clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% -2% -20% 0)' }], {
            duration: dura,
            delay: t,
            easing: 'linear', // 03 M8: el comando se descubre a ritmo fijo
            fill: 'backwards',
          }),
        );
        t += dura + ENTRE_RENGLONES;
      }
    }
    return animaciones;
  },
});

/* ——— raya: la cinta que se extiende (03 M4) ——— */

registrarEntrada({
  nombre: 'raya',
  movimiento: 'M4',
  fuente: 'La cinta que se expande hasta ocupar la sección (03 M4); 900 ms con la curva de la marca: el zoom de las portadas (03 §1, regla 1)',
  aparecer: (el, { reducido }) => {
    if (reducido) return fundido(el);
    return el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: 900, // 03 §1, regla 1: el zoom de las portadas, 900 ms
      delay: 250, // 03 M2: la cinta empieza cuando lo demás ya se apagó (aquí, la cámara a los 250 ms)
      easing: CURVA_MARCA, // globals.css:1387
      fill: 'backwards',
    });
  },
});

/* ——— caer: la fecha cae a su muesca ——— */

registrarEntrada({
  nombre: 'caer',
  movimiento: 'M6',
  fuente:
    'capabilities-heading.css:11 y :13 (capabilities-letter-in): 700 ms, cubic-bezier(0.22, 1, 0.36, 1), desde blur(8px) y 0,22 em más arriba; aquí la fecha entera cae desde 1 em',
  aparecer: (el, { reducido }) => {
    if (reducido) return fundido(el);
    // El retraso lo da la pieza (data-retraso): en la 11, lo que tarda Angel en llegar a la fecha.
    const retraso = Number(el.querySelector<HTMLElement>('[data-retraso]')?.dataset.retraso ?? 0);
    const muesca = el.querySelector<HTMLElement>('[data-muesca]');
    const texto = [...el.querySelectorAll<HTMLElement>('[data-cae]')];
    const animaciones: Animation[] = [];
    if (muesca)
      animaciones.push(
        muesca.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
          duration: 280, // Z-01: 280 ms (cifra.entrada.ts)
          delay: retraso,
          easing: CURVA_MARCA,
          fill: 'backwards',
        }),
      );
    texto.forEach((t, i) =>
      animaciones.push(
        t.animate(
          [
            { opacity: 0, filter: 'blur(8px)', transform: 'translateY(-1em)' }, // capabilities-heading.css:13
            { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' },
          ],
          { duration: 700, delay: retraso + 120 + i * 140, easing: CURVA_MARCA, fill: 'backwards' }, // 700 ms (capabilities-heading.css:11)
        ),
      ),
    );
    return animaciones;
  },
});

/* ——— reloj: un tiempo que el motor puede llevar a su final ——— */

registrarEntrada({
  nombre: 'reloj',
  movimiento: '—',
  fuente: 'Sin efecto propio: marca el tiempo de una pieza que se dibuja sola (la cascada de la 04 lee su currentTime)',
  aparecer: (el, { reducido }) => {
    // La pieza que se dibuja sola marca con data-reloj cuánto dura y escucha «wow-reloj».
    const pieza = el.querySelector<HTMLElement>('[data-reloj]') ?? el;
    const dura = reducido ? 1 : Number(pieza.dataset.reloj ?? 1000);
    const reloj = el.animate([{ opacity: 1 }, { opacity: 1 }], { duration: dura, fill: 'none' });
    pieza.dispatchEvent(new CustomEvent('wow-reloj', { detail: reloj }));
    return reloj;
  },
});
