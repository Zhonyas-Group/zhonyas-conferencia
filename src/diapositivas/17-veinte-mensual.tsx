/**
 * 17 · veinte-mensual · José · 35 s (docs/GUION.md, «17 · veinte-mensual»).
 * Composición: una cifra, con la cita en el lugar de la cifra, a 128 px,
 * alineada a la izquierda y en dos líneas; el crédito a 32 px abajo.
 * Movimiento: Z-01 («cifra»): la cita entra en su sitio, con su crédito.
 *   - paso 0: vacía;
 *   - paso 1: la cita.
 *
 * UnaCifra pinta la cifra a 300 px y en una línea; la cita va a 128 y en
 * dos, así que esta diapositiva arma la misma composición a mano, con las
 * mismas clases (marca.css: .zh-una-cifra; composiciones.css) y las dos
 * <Entrada> de Z-01 en el mismo paso, que son un solo momento (A-54).
 *
 * La cita sale entera del registro (src/datos.ts, «prestamista-cita»; A-65),
 * y su crédito también. El iframe de la 18 se monta mientras esta está en
 * pantalla: la 18 es su vecina y el motor la monta debajo (MOTOR §7).
 *
 * El auditor (A-69) toma el «20» de la cita por el «20» de «20 oct» en la 11.
 * No es la misma cifra: aquí es una tasa, dicha por un prestamista y citada
 * entera (A-65); allí, un día del mes. Va declarado como excepción.
 */
const EXCEPCION_VEINTE =
  'A-69: el «20» de la cita es una tasa, dicha por un prestamista y citada entera (A-65); el «20» de la 11 es un día del mes («20 oct»), no la misma cifra';
import { Dato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './17-veinte-mensual.css';

function VeinteMensual(_: PropsDiapositiva) {
  return (
    <div className="zh-reticula zh-una-cifra zh-comp-una-cifra d17-veinte">
      <Entrada desde={1} efecto="cifra" className="zh-comp-una-cifra__dato">
        <p className="zh-portadilla d17-veinte__cita" data-auditar-excepcion={EXCEPCION_VEINTE}>
          <Dato id="prestamista-cita" />
        </p>
      </Entrada>
      <Entrada desde={1} efecto="cifra" className="zh-comp-una-cifra__fuente">
        <p className="zh-fuente">
          <Dato id="prestamista-cita" campo="fuente" />
        </p>
      </Entrada>
    </div>
  );
}

export default definirDiapositiva({
  id: 'veinte-mensual',
  titulo: 'Veinte mensual',
  orador: 'jose',
  duracion: 35,
  pasos: 1,
  notas: [
    {
      decir: '¿Y a cómo presta un prestamista? En junio de este año, uno se lo explicó al periódico El Día.',
      claves: 'lo dijo una persona · El Día · clic',
      despues: '**Retórica:** la contesta la pantalla.',
    },
    {
      decir: 'Tres segundos de silencio para que lo lean.',
      claves: 'silencio · a la demo',
      despues: '**Remate:** «Un 20 mensual. Vamos a sacar esa cuenta aquí mismo.»',
    },
  ],
  fuentes: [
    'Testimonio de un prestamista en El Día, 28-jun-2026: https://eldia.com.do/dinero-rapido-deudas-permanentes-la-realidad-detras-de-los-prestamos-informales/. Es un testimonio, no una estadística (§6.1). La cita va entera, sin cortar (A-65).',
  ],
  Componente: VeinteMensual,
});
