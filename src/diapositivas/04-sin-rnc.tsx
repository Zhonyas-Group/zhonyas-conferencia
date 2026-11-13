/**
 * 04 · sin-rnc · Gregory · 35 s (docs/GUION.md, «04 · sin-rnc»).
 * Composición: una cifra. Movimiento: Z-01 (la cifra, su etiqueta y la fuente, juntas).
 *
 * <UnaCifra> tal cual: con `desde={1}`, la cifra, la etiqueta y la fuente
 * entran juntas con Z-01 («cifra»), un solo momento (cifra@1). En el paso 0,
 * vacía. En pantalla, 7 palabras: «85.2 %» (300 px) y «de las mipymes no tiene
 * RNC» (60 px, --zh-texto-2); la fuente, a 32 px, como la da el guion.
 * La cifra a 300 px la pone la pieza (composiciones.css).
 */
import { UnaCifra } from '../marca/composiciones';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './historia-gregory.css';

function SinRnc(_: PropsDiapositiva) {
  return (
    <UnaCifra
      dato="mipymes-informales"
      desde={1}
      etiqueta={<span className="hg-etiqueta">de las mipymes no tiene RNC</span>}
      fuente="BCRD y MICM, ENMIPYMES 2022–2023, pp. 9 y 11"
    />
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
      claves: '2022 y 2023 · cuatrocientas cuatro mil · pausa',
      despues: '**Retórica:** pausa corta y clic.',
    },
    {
      decir: 'El 85.2 %: más de ocho de cada diez son informales.',
      claves: '«ochenta y cinco punto dos» · informales',
    },
  ],
  fuentes: [
    '404,034 mipymes y 85.2 % informales, sin RNC (2022–2023). BCRD y MICM, ENMIPYMES, pp. 9 y 11: https://cdn.bancentral.gov.do/documents/otras-publicaciones/documents/ENMIPYMES-Documento-principales-resultados-aspectos-metodologicos.pdf (§6.1, fila 5).',
    'El año se dice en voz.',
  ],
  Componente: SinRnc,
});
