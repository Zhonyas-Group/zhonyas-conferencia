/**
 * 11 · tres-arreglos · Angel · 85 s (docs/GUION.md, «11 · tres-arreglos»).
 * Composición: a sangre (src/marca/composiciones/ASangre.tsx): el titular
 * arriba (x 115, y 115) y la línea de tiempo a escala real en el ancho útil;
 * la fuente abajo a la izquierda. Movimiento: Z-01 («cifra»), una fecha por
 * clic (excepción a A-54 declarada abajo).
 *
 * La línea se dibuja en código (11-tres-arreglos.css):
 *   - una raya de 4 px con el degradado de la firma (var(--zh-firma)), de
 *     x 115 a x 1805, a 67.6 px por día (1690 px ÷ 25 días, juicio de reglas);
 *     es lo que dice «esto es nuestro» (R-15, A-35): las fechas van en --zh-texto;
 *   - marcas en x 115 (25 sep, día 0), 385 (29 sep, día 4), 588 (2 oct, día 7)
 *     y 1805 (20 oct, día 25, con el texto alineado a la derecha);
 *   - 25 sep y 2 oct bajo la raya; 29 sep y 20 oct encima, para que no se pisen;
 *   - muescas de 4 × 32 px en --zh-texto-2; fechas en --zh-texto y «estreno»
 *     en --zh-texto-2, a 60 px.
 * La raya va a media altura (y 538–542): el centro de la pantalla.
 *
 * Pasos: 0, el titular, la raya y «25 sep · estreno» (entran con el corte);
 * 1, «29 sep»; 2, «2 oct»; 3, «20 oct». Cada fecha entra con su muesca, en su
 * sitio, cuando Angel la nombra.
 *
 * Sin el video del iPhone (M-05) se cae la 12 y esta suma 10 s: Angel cuenta
 * el fallo en el paso 2 (docs/GUION.md, 12 «Si falla» y «Si falta un medio»).
 */
import type { CSSProperties } from 'react';
import type { IdDato } from '../datos';
import { iphone } from '../medios-opcionales';
import { ASangre } from '../marca/composiciones';
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
  lado: 'arriba' | 'abajo';
  /** Paso en que entra (0: ya está). */
  paso: number;
  /** La palabra de debajo de la fecha, en --zh-texto-2. */
  palabra?: string;
}

const MARCAS: readonly Marca[] = [
  { dato: 'agujero-negro-estreno', dia: 0, lado: 'abajo', paso: 0, palabra: 'estreno' },
  { dato: 'agujero-negro-arreglo-reloj', dia: 4, lado: 'arriba', paso: 1 },
  { dato: 'agujero-negro-arreglo-iphone', dia: 7, lado: 'abajo', paso: 2 },
  { dato: 'agujero-negro-arreglo-escritorio', dia: 25, lado: 'arriba', paso: 3 },
];

/**
 * Dónde va cada marca en x. La muesca se centra en su día, salvo la primera y
 * la última, que se quedan dentro de la raya (su borde en x 115 y en x 1805).
 * El texto se alinea con la muesca: a la izquierda, y a la derecha en la última.
 */
function posicion(dia: number): CSSProperties {
  const x = MARGEN + dia * PX_POR_DIA;
  if (dia === 0) return { left: MARGEN };
  if (dia === DIAS) return { right: 1920 - x };
  return { left: x - MUESCA / 2 };
}

function contenido(m: Marca) {
  return (
    <>
      <span className="tres-arreglos__muesca" aria-hidden="true" />
      {/* El auditor lee «20 oct» como la cifra «20» (la del 20 mensual de la 17): es una fecha. */}
      <p className="zh-lectura tres-arreglos__fecha" data-auditar-excepcion="A-69: fecha del historial (día y mes), no una cifra">
        <Dato id={m.dato} />
      </p>
      {m.palabra ? <p className="zh-lectura tres-arreglos__palabra">{m.palabra}</p> : null}
    </>
  );
}

function LineaDeTiempo() {
  return (
    <div className="tres-arreglos__escala">
      <div className="tres-arreglos__raya" aria-hidden="true" />
      {MARCAS.map((m) => {
        const clase = `tres-arreglos__marca tres-arreglos__marca--${m.lado}${m.dia === DIAS ? ' tres-arreglos__marca--final' : ''}`;
        return m.paso === 0 ? (
          <div key={m.dato} className={clase} style={posicion(m.dia)}>
            {contenido(m)}
          </div>
        ) : (
          <Entrada key={m.dato} desde={m.paso} efecto="cifra" className={clase} style={posicion(m.dia)}>
            {contenido(m)}
          </Entrada>
        );
      })}
    </div>
  );
}

function TresArreglos(_: PropsDiapositiva) {
  return <ASangre titular="Hizo falta arreglarlo tres veces." evidencia={<LineaDeTiempo />} fuente="Historial de zhonyas-web, 2026" />;
}

export default definirDiapositiva({
  id: 'tres-arreglos',
  titulo: 'Tres arreglos',
  orador: 'angel',
  duracion: iphone.hay ? 85 : 95,
  pasos: 3,
  excepcionA54:
    'Z-01 clic a clic: cada clic trae la fecha que Angel nombra en ese momento (docs/GUION.md, encabezado, punto 2: la lectura de A-54 que aprueba José).',
  notas: [
    {
      decir: 'El 25 de septiembre lo subí a la web, y en mi computadora se veía perfecto.',
      claves: 'estreno · mi computadora',
      aparte: '**[CONFIRMAR con Angel; C-16].**',
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
    },
  ],
  fuentes: [
    // auditar-excepcion: A-34 «#105» y «#108» son números de commit, no colores
    'Commits del repo privado https://github.com/Zhonyas-Group/zhonyas-web, 2026 (08 §2 y §6): #90, 25-sep: la primera versión; #97, 29-sep: pasa a reloj; #105, con los PR #2 y #3, 2-oct: el arreglo del iPhone; #108, con el PR #4, 20-oct: el arreglo de escritorio.',
    'En pantalla van fechas y una palabra nuestra; ningún mensaje de commit (decisión 4).',
    'Es una secuencia de verdad (A-26). La escala está comprobada: 1690 px ÷ 25 días = 67.6 px por día (juicio de reglas).',
  ],
  Componente: TresArreglos,
});
