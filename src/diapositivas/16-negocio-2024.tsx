/**
 * 16 · negocio-2024 · José · 40 s (docs/GUION.md, «16 · negocio-2024»).
 * Composición: una cifra (src/marca/composiciones/UnaCifra.tsx, tal cual).
 * Movimiento: Z-01 («cifra»), clic a clic:
 *   - paso 0: vacía;
 *   - paso 1: la cifra con su etiqueta y su fuente, juntas;
 *   - paso 2: «América Latina: 7.5 %», en su sitio, bajo la etiqueta.
 *
 * En pantalla (14 palabras): «15.3 %» a 300 px · «de los adultos pidió
 * prestado para un negocio en 2024» a 60 px · «América Latina: 7.5 %» a 60 px.
 * Fuente a 32 px, la del guion. Las dos cifras y el año salen del registro
 * (src/datos.ts). Colores (GUION, 16): la cifra y la comparación van en
 * --zh-texto, «porque las dos son dato del mundo»; la etiqueta, en
 * --zh-texto-2 (Convenciones; 16-negocio-2024.css). La cifra a 300 px la pone
 * la pieza (composiciones.css).
 */
import { UnaCifra } from '../marca/composiciones';
import { Dato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './16-negocio-2024.css';

function Negocio2024(_: PropsDiapositiva) {
  return (
    <div className="d16-negocio">
      <UnaCifra
        dato="findex-prestamo-negocio"
        desde={1}
        etiqueta={
          <>
            <span className="d16-negocio__etiqueta">
              de los adultos pidió prestado para un negocio en <Dato id="findex-prestamo-negocio" campo="fecha" />
            </span>
            <Entrada desde={2} efecto="cifra" como="span" className="d16-negocio__comparacion">
              América Latina: <Dato id="findex-prestamo-negocio-latam" />
            </Entrada>
          </>
        }
        fuente="Banco Mundial, Global Findex 2025 (fin22e). América Latina y el Caribe sin ingreso alto"
      />
    </div>
  );
}

export default definirDiapositiva({
  id: 'negocio-2024',
  titulo: 'Negocio 2024',
  orador: 'jose',
  duracion: 40,
  pasos: 2,
  excepcionA54:
    'Z-01 clic a clic: cada clic trae lo que José nombra en ese momento (docs/GUION.md, encabezado, punto 2: la lectura de A-54 que aprueba José).',
  notas: [
    {
      decir: 'Diez años después, en 2024, midieron otra cosa: quién pidió prestado para empezar o mantener un negocio, a quien fuera.',
      claves: '2024 · empezar o mantener · a quien fuera',
    },
    {
      decir: 'Aquí, el 15.3 % de los adultos.',
      // El guion no le pone «Apoyo» a este paso; el motor pide claves: van las de la propia entrada.
      claves: 'el 15.3 % · de los adultos',
    },
    {
      decir: 'En América Latina, el 7.5 %. Nosotros, el doble.',
      claves: 'el doble',
    },
  ],
  fuentes: [
    '15.3 % en la RD y 7.5 % en América Latina y el Caribe sin ingreso alto, en 2024. Global Findex 2025, fin22e: https://api.worldbank.org/v2/country/DOM;LAC/indicator/fin22e?source=28&format=json (§6.1, fila 10).',
    '«El doble» es correcto: 15.3 ÷ 7.5 = 2.04. La cifra no dice a quién le pidieron, y José no dice «a un prestamista».',
  ],
  Componente: Negocio2024,
});
