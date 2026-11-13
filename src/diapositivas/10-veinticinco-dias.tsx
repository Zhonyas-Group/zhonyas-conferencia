/**
 * 10 · veinticinco-dias · Angel · 35 s (docs/GUION.md, «10 · veinticinco-dias»).
 * Composición: una cifra (src/marca/composiciones/UnaCifra.tsx).
 * Movimiento: entra por Z-10, el agujero negro (src/marca/agujero/): es la
 * transición de esta diapositiva, la única de cambio de diapositiva aparte de
 * la 20, y su único momento animado. Dentro no se mueve nada más.
 *
 * - Paso 0: la cifra, ya dentro. «25 días» (300 px, lo pone la pieza:
 *   composiciones.css) · «para 1.5 segundos»
 *   (60 px, en --zh-texto-2) · la fuente «Historial de zhonyas-web, sep–oct
 *   2026», sin las fechas exactas, que salen como marcas en la 11 (A-69).
 * - `conAgujeroNegro` pone la transición (1500 ms al abrir sobre la 09, 1200
 *   al cerrar al volver a ella), marca la diapositiva `pesada` (en el
 *   presentador se ve su póster y el agujero es un corte, C-02) y precalienta
 *   el disco. La lente se enciende sola si el primer recorrido pasa de 50 fps
 *   (lente.ts). Va sin galaxia.
 *
 * Tecla V (M-04, docs/MEDIOS.md): si está el video de respaldo del efecto
 * (public/medios/agujero/respaldo.mp4 o .webm, con respaldo-poster.webp), V
 * lo pone a pantalla completa sobre la cifra y otra V lo quita, en la sala o
 * en el presentador; las dos ventanas lo siguen. Corre una vez y se queda en
 * su último cuadro. Al salir de la 10 se cierra solo. Sin el video, la V no
 * hace nada y queda el corte seco del «si falla».
 */
import { agujero, mediosDe } from '../medios-opcionales';
import { conAgujeroNegro } from '../marca/agujero/agujero';
import { UnaCifra } from '../marca/composiciones';
import { useDiapositiva } from '../motor/contexto';
import { Dato } from '../motor/Dato';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { Video } from '../motor/Video';
import { instalarTeclaRespaldo, useRespaldoAgujero } from './10-veinticinco-dias.respaldo';
import './10-veinticinco-dias.css';

const ID = 'veinticinco-dias';

/**
 * Póster para el presentador y las miniaturas (C-02; M-11): el estado final
 * de esta diapositiva a 1920 × 1080, sacado con ?revision=1 y pasado a WebP
 * con el Chrome del equipo (calidad 0,9, como medios/pymex/pagina-publica.webp).
 * Si cambia lo que se ve en la 10, se vuelve a sacar: `npm run capturas` y
 * verificacion/capturas/NN-veinticinco-dias-p0.png a WebP (docs/MEDIOS.md, M-04).
 */
const POSTER = 'medios/posters/veinticinco-dias.webp';

// La V se oye en las dos ventanas aunque el presentador no monte la 10 (es pesada).
instalarTeclaRespaldo(ID, agujero.respaldo.hay);

function VeinticincoDias(_: PropsDiapositiva) {
  const { activa, rol, modo } = useDiapositiva();
  const respaldo = agujero.respaldo;
  const enSala = modo === 'escenario' && activa && rol === 'actual';
  const { abierto, vez } = useRespaldoAgujero(respaldo.hay, enSala);
  return (
    <>
      <div className="veinticinco-dias">
        <UnaCifra
          dato="agujero-negro-dias"
          etiqueta={
            <span className="veinticinco-dias__etiqueta">
              para <Dato id="agujero-negro-abre" />
            </span>
          }
          fuente="Historial de zhonyas-web, sep–oct 2026"
        />
      </div>
      {abierto && respaldo.video && respaldo.poster ? (
        <div className="veinticinco-dias__respaldo">
          <Video key={vez} src={respaldo.video} poster={respaldo.poster} bucle={false} />
        </div>
      ) : null}
    </>
  );
}

export default definirDiapositiva({
  id: ID,
  titulo: 'Veinticinco días',
  orador: 'angel',
  duracion: 35,
  pasos: 0,
  notas: [
    {
      decir:
        'Eso que acaban de ver dura un segundo y medio. Desde que lo subí hasta que quedó bien, en celular y en computadora, pasaron 25 días.',
      claves: 'un segundo y medio · 25 días de calendario · tres arreglos',
      siFalla:
        '1. El día antes se mide la apertura en la laptop del día, enchufada y con las dos ventanas abiertas. Con menos de 50 fps, va sin lente. ' +
        '2. Si en vivo se traba, Angel no lo repite ni lo comenta. ' +
        (agujero.respaldo.hay
          ? '3. Si no se vio nada, V pone el video del efecto (M-04), y V otra vez lo cierra. '
          : '3. Si no se vio nada, sigue con la cifra: todavía no está el video del efecto (M-04) y la V no hace nada. ') +
        '4. En el presentador, la 09 y la 10 se ven como póster y el agujero es un corte (C-02).',
    },
  ],
  fuentes: [
    '1.5 s para abrir y 1.2 s para cerrar: OPEN_MS = 1500 y CLOSE_MS = 1200, components/contact-section.tsx l. 19–20, commit #97 del 29-sep-2026.',
    // auditar-excepcion: A-34 «#108» es un número de commit, no un color
    '25 días: del commit #90 (25-sep-2026) al #108 (20-oct-2026), en el repo privado https://github.com/Zhonyas-Group/zhonyas-web.',
    'Son días de calendario, no de trabajo. En voz se dice «pasaron», nunca «nos tomó» ni «trabajamos» (A-67, A-73). Es una cifra de trabajo, permitida por la decisión 4, y la comparación con 1.5 s justifica la cifra grande (A-68).',
  ],
  medios: mediosDe(agujero.respaldo),
  ...conAgujeroNegro({ id: ID, poster: POSTER }),
  Componente: VeinticincoDias,
});
