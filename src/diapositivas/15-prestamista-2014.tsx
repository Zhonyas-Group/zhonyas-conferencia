/**
 * 15 · prestamista-2014 · José · 55 s (docs/GUION.md, «15 · prestamista-2014»).
 * Composición: una cifra (src/marca/composiciones/UnaCifra.tsx, tal cual).
 * Movimiento: Z-01 («cifra»), clic a clic:
 *   - paso 0: vacía (la mano alzada);
 *   - paso 1: la cifra con su etiqueta y su fuente, juntas;
 *   - paso 2: «1.º de 143 economías», en su sitio, bajo la etiqueta.
 *
 * En pantalla (15 palabras): «20.9 %» a 300 px · «de los adultos pidió
 * prestado a un prestamista en 2014» a 60 px · «1.º de 143 economías» a 60 px.
 * Fuente a 32 px, la del guion. Las tres cifras (la cifra, el año y el puesto)
 * salen del registro (src/datos.ts). Colores (GUION, Convenciones): la cifra y
 * el puesto, que son dato del mundo, en --zh-texto; la etiqueta, en
 * --zh-texto-2 (15-prestamista-2014.css). La cifra a 300 px la pone la pieza
 * (composiciones.css).
 */
import { UnaCifra } from '../marca/composiciones';
import { Dato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './15-prestamista-2014.css';

function Prestamista2014(_: PropsDiapositiva) {
  return (
    <div className="d15-prestamista">
      <UnaCifra
        dato="prestamista-privado"
        desde={1}
        etiqueta={
          <>
            <span className="d15-prestamista__etiqueta">
              de los adultos pidió prestado a un prestamista en <Dato id="prestamista-privado" campo="fecha" />
            </span>
            <Entrada desde={2} efecto="cifra" como="span" className="d15-prestamista__puesto">
              <Dato id="prestamista-puesto" />
            </Entrada>
          </>
        }
        fuente="Banco Mundial, Global Findex (GFDD.AI.15). El puesto es cálculo nuestro"
      />
    </div>
  );
}

export default definirDiapositiva({
  id: 'prestamista-2014',
  titulo: 'Prestamista 2014',
  orador: 'jose',
  duracion: 55,
  pasos: 2,
  excepcionA54:
    'Z-01 clic a clic: cada clic trae lo que José nombra en ese momento (docs/GUION.md, encabezado, punto 2: la lectura de A-54 que aprueba José).',
  notas: [
    {
      decir: 'Levanten la mano si conocen a alguien que presta dinero en su barrio. Sin decir nombres.',
      claves: 'esperar · decir lo que se ve · no comparar las manos con la cifra (C-17)',
      despues:
        '**Pregunta al público.**\n\n' +
        '**Luego:** «En 2014, el Banco Mundial preguntó otra cosa en 143 economías: si en el último año la gente le había pedido prestado a un prestamista.»',
    },
    {
      decir: 'En la República Dominicana dijo que sí el 20.9 % de los adultos: uno de cada cinco.',
      claves: '«veinte punto nueve» · uno de cada cinco',
    },
    {
      decir: 'Ninguna de las otras 142 economías con dato tuvo más. Y esa pregunta no la volvieron a hacer.',
      claves: 'decir «2014» · «economías», nunca «países» ni «récord mundial»',
    },
  ],
  fuentes: [
    'El 20.9 % de los adultos le pidió prestado a un prestamista privado en el último año (2014), el valor más alto de las 143 economías con dato. Banco Mundial, GFDD.AI.15: https://api.worldbank.org/v2/country/all/indicator/GFDD.AI.15?source=32&date=2014&format=json&per_page=400 (§6.1, fila 9).',
    'El puesto es cálculo propio sobre esa consulta (07 §3.2). El año se dice en voz y está en pantalla (decisión 9).',
  ],
  Componente: Prestamista2014,
});
