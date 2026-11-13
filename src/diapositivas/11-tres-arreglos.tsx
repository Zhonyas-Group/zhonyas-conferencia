/**
 * 11 · tres-arreglos · Angel · 85 s (docs/GUION.md, «11 · tres-arreglos»). Rama diseno-wow.
 * Composición: a sangre (src/marca/composiciones/ASangre.tsx): el titular
 * arriba (x 115, y 115) y la línea de tiempo a escala real en el ancho útil;
 * la fuente abajo a la izquierda.
 *
 * La línea (11-tres-arreglos.css), a 67.6 px por día (1690 px ÷ 25 días):
 *   - la raya de 4 px con el degradado de la firma se DIBUJA de izquierda a
 *     derecha al llegar (entrada «raya», la cinta que se extiende, 03 M4);
 *   - las fechas, todas bajo la raya, CAEN a su muesca (entrada «caer»: la
 *     entrada de letra de capabilities-heading.css, 700 ms);
 *   - el personaje de píxeles de Angel (Z-11, el de su relevo) camina SOBRE la
 *     raya de fecha en fecha (walk, 8 fps; el tramo largo hasta el 20 de
 *     octubre, corriendo: run, 12 fps), y cada fecha cae cuando él llega. En
 *     el 29 sep y el 2 oct se pone a teclear (type): el arreglo. En el 20 oct
 *     celebra (celebrate).
 *
 * Pasos: 0, el titular se genera palabra a palabra (03 M3, «tres veces.» en
 * aurora), la raya se dibuja y cae «25 sep · estreno», con Angel encima;
 * 1, camina al 29 sep; 2, al 2 oct; 3, corre al 20 oct.
 *
 * Sin el video del iPhone (M-05) se cae la 12 y esta suma 10 s: Angel cuenta
 * el fallo en el paso 2 (docs/GUION.md, 12 «Si falla» y «Si falta un medio»).
 */
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { IdDato } from '../datos';
import { iphone } from '../medios-opcionales';
import { ASangre } from '../marca/composiciones';
import { Personaje, type AnimacionPersonaje } from '../marca/relevo/Personaje';
import { Palabras, cortina } from '../marca/wow';
import { useDiapositiva, useMovimiento } from '../motor/contexto';
import { Dato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './11-tres-arreglos.css';

/** Retícula (síntesis §4.3; --zh-margen): la raya ocupa los 1690 px útiles. */
const MARGEN = 115;
const ANCHO_UTIL = 1690;
/** Del 25-sep (#90) al 20-oct (#108): 25 días de calendario (src/datos.ts, agujero-negro-dias). */
const DIAS = 25;
/** 1690 ÷ 25 = 67.6 px por día (docs/GUION.md, 11; juicio de reglas). */
const PX_POR_DIA = ANCHO_UTIL / DIAS;
/** Ancho de la muesca (docs/GUION.md, 11: muescas de 4 × 32 px). */
const MUESCA = 4;

interface Marca {
  dato: IdDato;
  /** Días desde el estreno (25-sep). */
  dia: number;
  /** Paso en que entra. */
  paso: number;
  /** La palabra de debajo de la fecha, en --zh-texto-2. */
  palabra?: string;
}

const MARCAS: readonly Marca[] = [
  { dato: 'agujero-negro-estreno', dia: 0, paso: 0, palabra: 'estreno' },
  { dato: 'agujero-negro-arreglo-reloj', dia: 4, paso: 1 },
  { dato: 'agujero-negro-arreglo-iphone', dia: 7, paso: 2 },
  { dato: 'agujero-negro-arreglo-escritorio', dia: 25, paso: 3 },
];

/** Dónde pisa Angel en cada paso: el centro de la muesca de esa fecha. */
const PIES = MARCAS.map((m) => (m.dia === 0 ? MARGEN + MUESCA / 2 : m.dia === DIAS ? MARGEN + ANCHO_UTIL - MUESCA / 2 : MARGEN + m.dia * PX_POR_DIA));

/**
 * Velocidad sobre la raya. Caminando (walk: 4 cuadros a 8 fps, sprite-atlas.json)
 * da dos pasos por ciclo de 0,5 s; con el personaje a 0,7 cada paso mide unos
 * 50 px: 200 px/s. Corriendo (run: 3 cuadros a 12 fps), unos 720 px/s.
 */
const CAMINA_PX_S = 200;
const CORRE_PX_S = 720;
const corre = (paso: number) => paso === 3;
function duracionTramo(paso: number): number {
  if (paso <= 0) return 0;
  const distancia = Math.abs(PIES[paso] - PIES[paso - 1]);
  return Math.round((distancia / (corre(paso) ? CORRE_PX_S : CAMINA_PX_S)) * 1000);
}
/** Paso 0: la fecha cae cuando la raya ya va por la mitad (la raya empieza a los 250 ms y dura 900). */
const retrasoFecha = (paso: number) => (paso === 0 ? 650 : duracionTramo(paso));

/** La muesca se centra en su día, salvo la primera y la última, que se quedan dentro de la raya. */
function posicion(dia: number): CSSProperties {
  const x = MARGEN + dia * PX_POR_DIA;
  if (dia === 0) return { left: MARGEN };
  if (dia === DIAS) return { right: 1920 - x };
  return { left: x - MUESCA / 2 };
}

interface Pose {
  animacion: AnimacionPersonaje;
  vueltas?: number;
  luego?: AnimacionPersonaje;
}

/** Lo que hace Angel al llegar a cada fecha. */
function llegada(paso: number): Pose {
  if (paso === 0) return { animacion: 'front' };
  if (paso === DIAS || paso === 3) return { animacion: 'celebrate', vueltas: 4, luego: 'front' };
  return { animacion: 'type', vueltas: 3, luego: 'idle' };
}

function AngelEnLaLinea({ paso }: { paso: number }) {
  const { activa, direccion } = useDiapositiva();
  const { instantaneo, reducido } = useMovimiento();
  const caja = useRef<HTMLDivElement>(null);
  const anterior = useRef(paso);
  const [pose, setPose] = useState<Pose>(() => llegada(paso));

  useLayoutEffect(() => {
    const el = caja.current;
    const de = anterior.current;
    anterior.current = paso;
    if (!el) return;
    for (const a of el.getAnimations()) a.cancel();
    const animar = activa && !instantaneo && !reducido && direccion === 1 && paso === de + 1;
    if (!animar) {
      setPose(llegada(paso));
      return;
    }
    setPose({ animacion: corre(paso) ? 'run' : 'walk' });
    const tramo = el.animate([{ transform: `translateX(${PIES[de] - PIES[paso]}px)` }, { transform: 'translateX(0)' }], {
      duration: duracionTramo(paso),
      easing: 'linear', // a paso constante, como el ciclo del sprite (sprite-character.css:10)
    });
    tramo.onfinish = () => setPose(llegada(paso));
    return () => tramo.cancel();
  }, [paso, activa]);

  return (
    <div ref={caja} className="tres-arreglos__angel" style={{ left: PIES[paso] }} aria-hidden="true">
      <Personaje
        key={`${pose.animacion}-${paso}`}
        atlas="angel"
        animacion={pose.animacion}
        vueltas={pose.vueltas}
        luego={pose.luego}
        escala={0.7}
      />
    </div>
  );
}

function LineaDeTiempo({ paso }: { paso: number }) {
  return (
    <div className="tres-arreglos__escala">
      <Entrada desde={0} efecto="raya" className="tres-arreglos__raya">
        <span />
      </Entrada>
      {MARCAS.map((m) => (
        <Entrada
          key={m.dato}
          desde={m.paso}
          efecto="caer"
          className={`tres-arreglos__marca${m.dia === DIAS ? ' tres-arreglos__marca--final' : ''}`}
          style={posicion(m.dia)}
        >
          <span className="tres-arreglos__muesca" data-muesca="" data-retraso={retrasoFecha(m.paso)} aria-hidden="true" />
          {/* El auditor lee «20 oct» como la cifra «20» (la del 20 mensual de la 17): es una fecha. */}
          <p className="zh-lectura tres-arreglos__fecha" data-cae="" data-auditar-excepcion="A-69: fecha del historial (día y mes), no una cifra">
            <Dato id={m.dato} />
          </p>
          {m.palabra ? (
            <p className="zh-lectura tres-arreglos__palabra" data-cae="">
              {m.palabra}
            </p>
          ) : null}
        </Entrada>
      ))}
      <AngelEnLaLinea paso={paso} />
    </div>
  );
}

function TresArreglos({ paso }: PropsDiapositiva) {
  return (
    <ASangre
      titular={
        <Entrada como="span" desde={0} efecto="palabras">
          <Palabras texto="Hizo falta arreglarlo tres veces." clave={['tres', 'veces.']} />
        </Entrada>
      }
      evidencia={<LineaDeTiempo paso={paso} />}
      fuente="Historial de zhonyas-web, 2026"
    />
  );
}

export default definirDiapositiva({
  id: 'tres-arreglos',
  titulo: 'Tres arreglos',
  orador: 'angel',
  duracion: iphone.hay ? 85 : 95,
  pasos: 3,
  notas: [
    {
      decir: 'El 25 de septiembre lo subí a la web, y en mi computadora se veía perfecto.',
      claves: 'estreno · mi computadora',
      aparte: '**[CONFIRMAR con Angel; C-16].** Mi personaje camina de fecha en fecha: cada clic, a la siguiente.',
    },
    {
      decir:
        'Cuatro días después, el primer arreglo. Se abría al ritmo del scroll y se trababa: el navegador tenía que mover la página y pintar el agujero a la vez.',
      claves: 'scroll · se trababa · reloj',
      despues: '**Remate:** «Lo amarré a un reloj: abre en un segundo y medio, pase lo que pase con el dedo.»',
      aparte: '**[CONFIRMAR con Angel]** el «se trababa»: es una lectura del mensaje del #97.',
    },
    iphone.hay
      ? {
          decir: 'El 2 de octubre, el del iPhone: se cerraba solo. Ahorita se los enseño.',
          claves: 'iPhone · se cerraba solo',
        }
      : {
          decir: 'El 2 de octubre, el del iPhone: se cerraba solo.',
          claves: 'iPhone · se cerraba solo · la barra de Safari · yo nunca lo vi',
          despues:
            '**Luego, en lugar de la 12:** «Safari esconde su barra cuando uno baja, la pantalla cambia de alto y el agujero lo tomaba como la señal de cerrarse. En mi computadora eso no pasa, así que yo nunca lo vi.»',
          aparte:
            '**Sin el video del iPhone (M-05), la 12 se cae** y Angel lo cuenta aquí (+10 s).\n\n**[CONFIRMAR con Angel la explicación].**',
        },
    {
      decir:
        'Y el 20 de octubre, el último, en computadora: después de usar el menú, el agujero seguía el trackpad en vez de abrirse a su ritmo.',
      claves: 'menú · trackpad · a su ritmo',
      despues: 'El personaje corre hasta el 20 y celebra: dejar que llegue (dos segundos) antes de hablar.',
    },
  ],
  fuentes: [
    // auditar-excepcion: A-34 «#105» y «#108» son números de commit, no colores
    'Commits del repo privado https://github.com/Zhonyas-Group/zhonyas-web, 2026 (08 §2 y §6): #90, 25-sep: la primera versión; #97, 29-sep: pasa a reloj; #105, con los PR #2 y #3, 2-oct: el arreglo del iPhone; #108, con el PR #4, 20-oct: el arreglo de escritorio.',
    'En pantalla van fechas y una palabra nuestra; ningún mensaje de commit (decisión 4).',
    'Es una secuencia de verdad (A-26). La escala está comprobada: 1690 px ÷ 25 días = 67.6 px por día (juicio de reglas).',
  ],
  medios: ['medios/equipo/angel/personaje.webp'],
  transicion: cortina('angel'),
  Componente: TresArreglos,
});
