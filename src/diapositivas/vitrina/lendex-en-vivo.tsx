/**
 * Vitrina · Lendex en vivo (rama diseno-wow, 14-nov). Sustituye en la vitrina
 * a la demo de la 18. José, sobre ella: «esto está confuso desde esta slide en
 * adelante». La 18 eran tres pantallas sueltas: «Díganme un monto.» sin nada
 * más, la pantalla de entrar de Lendex a pantalla completa y un recorte
 * ampliado; ni decía qué era ni de dónde salía el 20 %.
 *
 * Ahora es una diapositiva de producto como las demás (Producto, de
 * src/marca/vitrina), con un solo →: a la izquierda la pregunta, qué es y de
 * dónde sale el 20 % (la cita del prestamista, entera: A-65); a la derecha,
 * la calculadora de Lendex ya abierta en su ventana (Calculadora.tsx), con la
 * misma cuenta que lendexgp.com/app y sin internet. El público dice un monto,
 * Angel lo escribe y los resultados cambian al momento.
 *
 * La 18 se queda como estaba en el mazo completo (src/diapositivas/indice.ts).
 */
import { datos } from '../../datos';
import { CalculadoraLendex } from '../../marca/vitrina/Calculadora';
import { Producto, Ventana } from '../../marca/vitrina';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';

const CITA = datos.find((d) => d.id === 'prestamista-cita')!;

function LendexEnVivo(_: PropsDiapositiva) {
  return (
    <Producto
      nombre="Díganme un monto."
      promesa="Lendex saca la cuota al momento."
      clave={['momento.']}
      queHace={`Un prestamista, a El Día: ${CITA.valor}`}
      // auditar-excepcion-inicio: A-34 — el verde de la marca de Lendex (lendexgp.com), solo en el brillo y el marco
      color="#12a57c"
      // auditar-excepcion-fin
      orador="jose-leonardo"
    >
      <Ventana url="lendexgp.com/app" x={860} y={185} ancho={980} alto={650} giro={-4} orden={0}>
        <CalculadoraLendex />
      </Ventana>
    </Producto>
  );
}

export default definirDiapositiva({
  id: 'vitrina-lendex-en-vivo',
  titulo: 'Lendex en vivo',
  orador: 'jose',
  duracion: 90,
  pasos: 0,
  notas: [
    {
      decir:
        'Esta es la calculadora de Lendex, la pública: cualquiera la abre sin cuenta. Un prestamista le contó a El Día que presta a un 20 mensual. Díganme un monto, el que le pedirían a un prestamista.',
      despues:
        '**Angel escribe el monto. Sin clic:** «Miren la cuota: [cuota] al mes. En un año pagan [total]: casi tres veces lo que pidieron.»\n\n' +
        '**Remate:** «Esta calculadora no pide cuenta. La puede usar el prestamista, y también el que va a pedir prestado, antes de firmar.»',
      claves: 'sin cuenta · un 20 mensual · díganme un monto · casi tres veces',
      aparte:
        '**Angel, en la laptop:** clic en «Monto» (se selecciona solo) y escribir el número sin punto ni coma. El 20 % y las 12 cuotas ya están puestos. Lo que se escribe en la ventana del presentador sale también en la de la sala.\n\n' +
        'Si nadie dice nada: «¿Diez mil? Diez mil.» Ya viene puesto.\n\n' +
        'Para seguir, → en el clicker: suelta el campo y pasa al cierre.',
      siFalla:
        'No necesita internet: la calculadora va dentro de la presentación. Si un monto es absurdo (menos de mil o más de diez millones), se usa 10,000: cuota de RD$2,252.65 y total de RD$27,031.75.',
    },
  ],
  fuentes: [
    'Calculadora: la pública de Lendex (https://lendexgp.com/app), reproducida con su misma cuenta: Lendex/src/utils/calculateInstallments.ts y src/components/PublicCalculator.tsx (commit b0711d9). Arranca en RD$10,000 al 20 % mensual, 12 cuotas francesas; Lendex trae RD$50,000 al 5 %.',
    `${CITA.fuente}: ${CITA.url}. ${CITA.nota}`,
    'Con 20 % mensual a 12 cuotas francesas, el total a pagar es 2.70 veces el monto, sea cual sea el monto: por eso «casi tres veces» vale para cualquier cifra que diga el público.',
    'Referencia para José, que no se proyecta (cuota / total a 20 % y 12 cuotas): RD$5,000 → 1,126.32 / 13,516.04; RD$20,000 → 4,505.30 / 54,063.56; RD$25,000 → 5,631.62 / 67,579.61; RD$50,000 → 11,263.25 / 135,158.88; RD$100,000 → 22,526.50 / 270,317.85.',
  ],
  Componente: LendexEnVivo,
});
