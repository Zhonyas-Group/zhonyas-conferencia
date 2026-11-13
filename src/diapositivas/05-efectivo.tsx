/**
 * 05 · efectivo · Gregory · 35 s (docs/GUION.md, «05 · efectivo»).
 * Composición: una cifra. Movimiento: Z-01, igual que en la 04.
 *
 * <UnaCifra> tal cual, como la 04: en el paso 0, vacía; en el paso 1 entran
 * juntas, con Z-01 («cifra»), la cifra, su etiqueta y su fuente. En pantalla,
 * 3 palabras: «92.7 %» (300 px) y «usa efectivo» (60 px, --zh-texto-2).
 * La cifra a 300 px la pone la pieza (composiciones.css).
 */
import { UnaCifra } from '../marca/composiciones';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './historia-gregory.css';

function Efectivo(_: PropsDiapositiva) {
  return (
    <UnaCifra
      dato="mipymes-efectivo"
      desde={1}
      etiqueta={<span className="hg-etiqueta">usa efectivo</span>}
      fuente="BCRD y MICM, ENMIPYMES 2022–2023, p. 25"
    />
  );
}

export default definirDiapositiva({
  id: 'efectivo',
  titulo: 'Efectivo',
  orador: 'gregory',
  duracion: 35,
  pasos: 1,
  notas: [
    {
      decir: 'La misma encuesta preguntó con qué medio de pago trabajan.',
      claves: 'medio de pago · clic',
    },
    {
      decir: 'El 92.7 % usa efectivo.',
      claves: '«usa», nunca «cobra» · la pregunta · clic',
      despues:
        '**Remate:** «Sin RNC y con efectivo, ¿dónde se lleva la cuenta?» (retórica: no se espera respuesta; la contesta la 06. Clic enseguida).',
    },
  ],
  fuentes: [
    'El 92.7 % de las mipymes usa efectivo como medio de pago (2022–2023). ENMIPYMES, p. 25, la misma URL de la 04 (§6.1, fila 6).',
  ],
  Componente: Efectivo,
});
