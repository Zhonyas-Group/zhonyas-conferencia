/**
 * 04 · sin-rnc · Gregory · 35 s (docs/GUION.md, «04 · sin-rnc»). Rama diseno-wow.
 *
 * La cifra se vuelve tangible: a la derecha, mil puntos son mil mipymes (la
 * encuesta contó 404,034: cada punto, unas 404). Con el clic, la cifra cuenta
 * desde 0 y, a la vez, 852 puntos se encienden en cascada con el degradado de
 * la firma, columna a columna, de izquierda a derecha: lo que queda gris son
 * las 148 que sí tienen RNC. La cuenta va con la cascada (puntos encendidos ÷ 10),
 * así que llega a la cifra del registro en el mismo cuadro que el último punto.
 *
 *   0. Los mil puntos en gris. Gregory, abajo a la derecha, piensa (think).
 *   1. La cuenta y la cascada (1,9 s); la etiqueta se genera palabra a palabra
 *      (03 M3) con «RNC» en aurora; Gregory se pone nervioso (nervous).
 *
 * En pantalla, lo del guion: «85.2 %» (300 px), «de las mipymes no tiene RNC»
 * (60 px, --zh-texto-2) y la fuente (32 px). La cifra sale de <Dato>: la cuenta
 * solo se ve mientras corre; al terminar, se ve el <Dato>.
 */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { OradorEsquina, Palabras, camara } from '../marca/wow';
import { useDiapositiva } from '../motor/contexto';
import { Dato, useDato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './04-sin-rnc.css';
import './historia-gregory.css';

const COLUMNAS = 40;
const FILAS = 25;
const PASO_PX = 20;
const RADIO = 6.5;
/** Los encendidos: 85.2 % de mil. Sale del registro (mipymes-informales), no se escribe a mano. */
const DURACION = 1900;
/** La salida de la marca (globals.css:1387), cada punto: 1 − (1 − t)³ (03 §1, regla 2). */
const salida = (t: number) => 1 - (1 - t) ** 3;

/** Las tres paradas de la firma (--zh-firma-paradas, marca.css): magenta, fucsia, violeta. */
const FIRMA: readonly [number, number, number][] = [
  [240, 20, 184],
  [212, 61, 222],
  [159, 121, 255],
];
function firmaEn(x: number): string {
  const tramo = x < 0.48 ? 0 : 1;
  const t = tramo === 0 ? x / 0.48 : (x - 0.48) / 0.52;
  const [a, b] = [FIRMA[tramo], FIRMA[tramo + 1]];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

function CifraQueSeEnciende({ paso }: { paso: number }) {
  const { valor } = useDato('mipymes-informales');
  const numero = parseFloat(valor);
  const sufijo = valor.replace(/^[\d.,]+/, '');
  const encendidos = Math.round(numero * 10);
  const { activa, pausada } = useDiapositiva();
  const lienzo = useRef<HTMLCanvasElement>(null);
  const reloj = useRef<HTMLDivElement>(null);
  const contador = useRef<HTMLSpanElement>(null);
  const dato = useRef<HTMLSpanElement>(null);
  /** La cascada está corriendo (la entrada «reloj» la arrancó): el estado quieto no la pisa. */
  const corriendo = useRef(false);

  // Dibuja la cascada en el instante p (0 → 1) y devuelve cuántos puntos van encendidos.
  const dibujar = (p: number): number => {
    const c = lienzo.current;
    const g = c?.getContext('2d');
    if (!c || !g) return 0;
    const escala = c.width / (COLUMNAS * PASO_PX);
    g.setTransform(escala, 0, 0, escala, 0, 0);
    g.clearRect(0, 0, COLUMNAS * PASO_PX, FILAS * PASO_PX);
    let ya = 0;
    for (let col = 0; col < COLUMNAS; col++) {
      for (let fila = 0; fila < FILAS; fila++) {
        const i = col * FILAS + fila;
        const x = col * PASO_PX + PASO_PX / 2;
        const y = fila * PASO_PX + PASO_PX / 2;
        let t = 0;
        if (i < encendidos) {
          const empieza = (i / encendidos) * 0.72;
          t = Math.min(1, Math.max(0, (p - empieza) / 0.28));
        }
        if (t >= 0.5) ya++;
        const e = salida(t);
        g.globalAlpha = 1;
        // Apagado: gris claro (--zh-texto) al 30 %.
        if (e < 1) {
          g.fillStyle = 'rgba(247, 247, 250, 0.3)';
          g.beginPath();
          g.arc(x, y, RADIO, 0, Math.PI * 2);
          g.fill();
        }
        if (e > 0) {
          g.globalAlpha = e;
          g.fillStyle = firmaEn(col / (COLUMNAS - 1));
          g.beginPath();
          g.arc(x, y, RADIO * (1 + 0.45 * Math.sin(Math.PI * e)), 0, Math.PI * 2);
          g.fill();
        }
      }
    }
    g.globalAlpha = 1;
    return ya;
  };

  // El estado quieto de cada paso (al llegar, al volver, en capturas).
  useLayoutEffect(() => {
    const c = lienzo.current;
    if (c && c.width === 0) {
      c.width = COLUMNAS * PASO_PX * 2;
      c.height = FILAS * PASO_PX * 2;
    }
    if (corriendo.current) return;
    dibujar(paso >= 1 ? 1 : 0);
    if (contador.current) contador.current.textContent = '';
    if (dato.current) dato.current.style.visibility = '';
  }, [paso]);

  // La cuenta: la entrada «reloj» (src/marca/wow/wow.entrada.ts) da el tiempo; si Gregory avanza a mitad, salta al final.
  useEffect(() => {
    const el = reloj.current;
    if (!el) return;
    let cuadro = 0;
    const alEmpezar = (e: Event) => {
      const animacion = (e as CustomEvent<Animation>).detail;
      cancelAnimationFrame(cuadro);
      const terminar = () => {
        corriendo.current = false;
        dibujar(1);
        if (contador.current) contador.current.textContent = '';
        if (dato.current) dato.current.style.visibility = '';
      };
      corriendo.current = true;
      if (dato.current) dato.current.style.visibility = 'hidden';
      const tic = () => {
        const estado = animacion.playState;
        if (estado === 'finished' || estado === 'idle') return terminar();
        const p = Math.min(1, Number(animacion.currentTime ?? 0) / DURACION);
        const ya = dibujar(p);
        if (contador.current) contador.current.textContent = `${(ya / 10).toFixed(1)}${sufijo}`;
        cuadro = requestAnimationFrame(tic);
      };
      tic();
    };
    el.addEventListener('wow-reloj', alEmpezar);
    return () => {
      el.removeEventListener('wow-reloj', alEmpezar);
      cancelAnimationFrame(cuadro);
    };
  }, [sufijo, encendidos]);

  return (
    <>
      <canvas ref={lienzo} className="sin-rnc__puntos" data-activa={activa ? '' : undefined} data-pausada={pausada ? '' : undefined} aria-hidden="true" />
      <Entrada desde={1} efecto="reloj" className="sin-rnc__cifra">
        <div ref={reloj} data-reloj={DURACION}>
          <p className="zh-cifra">
            <span ref={dato}>
              <Dato id="mipymes-informales" />
            </span>
            <span ref={contador} className="sin-rnc__contador" aria-hidden="true" />
          </p>
        </div>
      </Entrada>
    </>
  );
}

function SinRnc({ paso }: PropsDiapositiva) {
  return (
    <div className="sin-rnc">
      <CifraQueSeEnciende paso={paso} />
      <Entrada desde={1} efecto="palabras" className="sin-rnc__etiqueta">
        <p className="zh-lectura hg-etiqueta">
          <Palabras texto="de las mipymes no tiene RNC" clave={['RNC']} />
        </p>
      </Entrada>
      <Entrada desde={1} efecto="cifra" className="sin-rnc__fuente">
        <p className="zh-fuente">BCRD y MICM, ENMIPYMES 2022–2023, pp. 9 y 11</p>
      </Entrada>
      {paso === 0 ? (
        <OradorEsquina atlas="gregory" animacion="think" />
      ) : (
        <OradorEsquina atlas="gregory" animacion="nervous" />
      )}
    </div>
  );
}

export default definirDiapositiva({
  id: 'sin-rnc',
  titulo: 'Sin RNC',
  orador: 'gregory',
  duracion: 35,
  pasos: 1,
  notas: [
    {
      decir:
        'Los nuestros salieron de la encuesta de mipymes del Banco Central y el MICM, la de 2022 y 2023. Contaron 404,034 mipymes en todo el país. ¿Cuántas no tienen RNC?',
      claves: '2022 y 2023 · cuatrocientas cuatro mil · mil puntos · pausa',
      despues: '**Apoyo:** «Cada punto son unas cuatrocientas mipymes.» **Retórica:** pausa corta y clic.',
    },
    {
      decir: 'El 85.2 %: más de ocho de cada diez son informales.',
      claves: '«ochenta y cinco punto dos» · informales · lo gris sí tiene RNC',
      despues: 'Dejar que la cuenta termine (dos segundos) antes de hablar.',
    },
  ],
  fuentes: [
    '404,034 mipymes y 85.2 % informales, sin RNC (2022–2023). BCRD y MICM, ENMIPYMES, pp. 9 y 11: https://cdn.bancentral.gov.do/documents/otras-publicaciones/documents/ENMIPYMES-Documento-principales-resultados-aspectos-metodologicos.pdf (§6.1, fila 5).',
    'Los mil puntos son una proporción (cada uno, unas 404 mipymes), no un conteo.',
    'El año se dice en voz.',
  ],
  medios: ['medios/equipo/gregory/personaje.webp'],
  transicion: camara,
  Componente: SinRnc,
});
