/**
 * 18 · demo-lendex · José (Angel al teclado) · 110 s (docs/GUION.md, «18 · demo-lendex»).
 *
 * - Paso 0 · una cifra, con la frase en el lugar de la cifra: «Díganme un
 *   monto.» a 128 px y el crédito a 32 px abajo. Llega con el corte.
 * - Paso 1 · a sangre: la calculadora pública de Lendex EN VIVO, con la pieza
 *   src/marca/lendex/DemoLendex.tsx (iframe en la sala, video de respaldo con
 *   la tecla V, póster quieto en el presentador, el teclado que vuelve a la
 *   charla al sacar el ratón por un lado o al cambiar de diapositiva).
 *   Movimiento: Z-08, la calculadora se abre (<Detalle>, de
 *   src/marca/entradas/detalle/: opacidad 0 → 1 y scale 0.985 → 1 en 520 ms,
 *   (0.22, 1, 0.36, 1)). Lo demás que se mueve es de Lendex (Z-12).
 *
 * El iframe carga https://lendexgp.com/app?calculadora (GUION 18; M-07). Lo que
 * se ve depende de si Lendex ya abre la calculadora sola con ese parámetro
 * (LENDEX_ABRE_LA_CALCULADORA, en la pieza):
 *   - sí: dos pasos. En el paso 1 la tarjeta de la calculadora entra ya
 *     recortada y ampliada 2× (1344 × 896 en x 288, y 115);
 *   - no (hoy, 13-nov): tres pasos, el camino del guion para ese caso (M-07,
 *     «Sin ?calculadora»). En el paso 1 Z-08 abre Lendex sin recorte, a
 *     1920 × 1080 sin ampliar, con «Calculadora de Préstamos» a la vista sin
 *     desplazar; Angel lo pulsa y el clic siguiente (paso 2) pasa al recorte
 *     de 2× por corte, sin animación. Así la sala no ve la pantalla de entrar
 *     ampliada al doble ni a Angel bajando con la rueda dentro del iframe
 *     (revisión del 13-nov).
 *
 * La frase del paso 0 se va con el corte al pasar al 1 (`hasta={0}`): debajo
 * del detalle no queda texto tapado.
 *
 * En el paso 0, el detalle cerrado se queda pintado a 0,002 de opacidad y sin
 * ratón (18-demo-lendex.css): oculto, Chrome congela a Lendex, y al abrirse se
 * veía el final de su presentación encima de Z-08. El teclado, mientras tanto,
 * lo guarda la pieza: iframe `inert` y un vigilante que se lo devuelve a la
 * sala si Lendex lo toma (DemoLendex.tsx, VistaSala).
 *
 * El video de la V es el del guion (M-07: RD$10,000 al 20 %, 12 cuotas,
 * Mensual y Francesa; public/medios/lendex/respaldo.webm con su póster, que
 * graba `node scripts/lendex-grabar-demo.mjs --guion`), y su último cuadro es
 * el póster quieto del presentador: las cifras que José va a decir (C-04). Sin
 * M-07, la V no hace nada (nunca un video con otras cifras que las que se
 * dicen) y el presentador avisa (src/medios-opcionales.ts).
 *
 * Si faltan a la vez Pymex grabado (M-02) y el iPhone (M-05), esta suma 15 s:
 * José lee también el interés total (docs/GUION.md, «Si falta un medio»).
 */
import { Detalle } from '../marca/entradas';
import {
  AVISO_LENDEX_EN_CLARO,
  DemoLendex,
  LENDEX_ABRE_LA_CALCULADORA,
  lendexSaleEnClaro,
  vigilarTemaLendex,
  type RespaldoDemoLendex,
} from '../marca/lendex/DemoLendex';
import { iphone, lendex, pymex } from '../medios-opcionales';
import { Entrada } from '../motor/Entrada';
import { esPresentador, esRevision } from '../motor/entorno';
import { definirDiapositiva, type NotaPaso, type PropsDiapositiva } from '../motor/tipos';
import './18-demo-lendex.css';

/** El video del guion para la V (M-07), si ya está con su póster. Sin él, ninguno (null). */
const respaldoGuion: RespaldoDemoLendex | null =
  lendex.respaldo.hay && lendex.respaldo.video && lendex.respaldo.poster
    ? { video: lendex.respaldo.video, inicio: lendex.respaldo.poster }
    : null;

/**
 * El póster quieto del presentador, las miniaturas y las capturas: el último
 * cuadro de M-07, con las cifras que José va a decir (RD$10,000 al 20 %). Sin
 * M-07, un cuadro sin resultados (el primero del video del 12-nov, la pantalla
 * de entrar), para que José nunca lea por error las cifras del 5 % (C-04).
 */
const POSTER = lendex.ultimoCuadro.medios[0] ?? 'medios/lendex/demo-inicio.webp';

/** El paso en que la calculadora ya se ve recortada y ampliada 2×. */
const PASO_RECORTE = LENDEX_ABRE_LA_CALCULADORA ? 1 : 2;

function Demo({ paso }: PropsDiapositiva) {
  return (
    <>
      <Entrada desde={0} hasta={0} className="zh-reticula zh-una-cifra zh-comp-una-cifra">
        <p className="zh-portadilla">Díganme un monto.</p>
        <p className="zh-fuente">Calculadora pública de Lendex: lendexgp.com/app</p>
      </Entrada>
      {/* Cerrado, en el paso 0, se queda pintado e invisible para que Lendex llegue asentado (18-demo-lendex.css). */}
      <Detalle desde={1} className="d18-demo__detalle">
        <DemoLendex respaldo={respaldoGuion} recorte={paso >= PASO_RECORTE} poster={POSTER} />
      </Detalle>
    </>
  );
}

const faltanLosDos = !pymex.hay && !iphone.hay;

// Si el navegador le fuera a dar a Lendex el tema claro, su pantalla de entrar saldría blanca en el
// proyector (DemoLendex.tsx, ESQUEMA_LENDEX). El presentador lo avisa en la franja roja; la sala no enseña avisos.
if (esPresentador && !esRevision) vigilarTemaLendex();

const APARTE_PREGUNTA =
  '**Pregunta al público.**\n\n' +
  '**Angel, en la calculadora:** solo el monto y la tasa (clic en el campo, Ctrl+A y escribir). El monto, sin punto ni coma: en ese campo, «10.000» calcula diez pesos. Las 12 cuotas, «Mensual» y «Francesa» ya vienen puestas. Angel teclea mirando la pantalla de la sala, y José lee los resultados de ahí: en la laptop, el presentador solo tiene el póster (C-04). Se ensaya así.';

const PREGUNTA: NotaPaso = {
  decir:
    'Esa cuenta la vamos a sacar con la calculadora de Lendex, la pública, la que cualquiera abre sin cuenta. Díganme un monto, el que le pedirían a un prestamista.',
  claves:
    'repetir el monto en voz alta · si nadie habla: «¿Diez mil? Diez mil.» · si dicen algo absurdo: «Ese préstamo no lo da ni el Banco Central. Uno más chiquito.» · clic',
  // Se lee al pintar la nota: si el navegador pasa a oscuro con la charla abierta, el aviso se va al volver a la 18.
  get aparte() {
    return lendexSaleEnClaro() ? `**${AVISO_LENDEX_EN_CLARO}**\n\n${APARTE_PREGUNTA}` : APARTE_PREGUNTA;
  },
};

const PIDE: Pick<NotaPaso, 'decir'> = { decir: '[Monto] pesos, a un 20 mensual, en doce cuotas fijas. Angel, ponle eso.' };

/** «En vivo, sin clic», el remate y el cierre de la demo: lo que José dice con la calculadora ya en grande. */
const EN_VIVO = {
  decir: 'Miren la cuota: [cuota] al mes. En un año pagan [total]: casi tres veces lo que pidieron.',
  despues:
    '**Remate:** «Esta calculadora no pide cuenta. La puede usar el prestamista, y también el que va a pedir prestado, antes de firmar.»\n\n' +
    '**Al terminar**, Angel hace clic en la ventana del presentador. **Hasta ese clic, José no toca el clicker:** con el foco en la calculadora, las flechas le cambian la tasa.' +
    (faltanLosDos ? '\n\n**Faltan Pymex grabado y el iPhone:** José lee también el interés total (+15 s).' : ''),
  claves: 'cuota · total a pagar · casi tres veces · antes de firmar',
};

/** «Si falla» (GUION, 18). El punto 1 depende de si está el video del guion (M-07). */
const SI_FALLA =
  (respaldoGuion
    ? '1. No carga en 5 s, sale en blanco o no hay red: V en el presentador. José dice: «La señal no quiso participar. Esto es lo mismo, grabado antes de la charla con diez mil pesos». Lee lo que se ve en el video: cuota de RD$2,252.65 y total de RD$27,031.75, «casi tres veces». '
    : '1. Sin el video de respaldo (M-07) no hay demo en vivo (GUION, M-07, decisión 5): la V no hace nada. Si no carga, José dice las cifras de diez mil de las Fuentes (cuota de RD$2,252.65 y total de RD$27,031.75, «casi tres veces»). ') +
  '2. Un monto de menos de mil o de más de diez millones: se usa 10,000. ' +
  '3. Un error al teclear: se borra en vivo y se sigue. ' +
  (LENDEX_ABRE_LA_CALCULADORA
    ? '4. La calculadora no abre sola: ← y Angel la abre con su botón, o el plan B de M-07. '
    : '4. Si Lendex ya no se deja embeber (el --comprobar de scripts/lendex-grabar-demo.mjs lo dice el día antes), el plan B de M-07. ') +
  '5. El clicker no avanza al terminar: clic en la ventana del presentador.';

/** Mientras Lendex no abra solo con ?calculadora: el paso 1 enseña su pantalla de entrar, sin ampliar. */
const ELEGIR: NotaPaso = {
  ...PIDE,
  claves: 'Angel pulsa «Calculadora de Préstamos» · clic: la calculadora en grande',
  aparte:
    '**Sin ?calculadora (M-07):** Lendex abre en su pantalla de entrar, sin ampliar. Angel pulsa «Calculadora de Préstamos», abajo a la izquierda, bajo «Entrar al Sistema», y la calculadora sale a la derecha. La sala recupera el teclado sola: el clic siguiente pasa al recorte de 2×, por corte.\n\n' +
    'Si la calculadora ya está abierta a la derecha (Lendex ya tiene ?calculadora), no pulsar el botón, que la cerraría: clic y avisar para poner LENDEX_ABRE_LA_CALCULADORA en true. Si se pasó al recorte sin abrirla: ← vuelve a la pantalla de entrar.\n\n' +
    'Si la pantalla de entrar sale en tema claro (fondo blanco con «Bienvenido de nuevo»): Angel pulsa la luna de arriba, hacia el centro, y Lendex pasa a oscuro en el acto.',
  siFalla: SI_FALLA,
};

/** El paso de la calculadora en grande: Angel escribe y, sin clic, José lee. */
const CALCULAR: NotaPaso = LENDEX_ABRE_LA_CALCULADORA
  ? {
      ...PIDE,
      despues: `**Sin clic**, cuando Angel termina: «${EN_VIVO.decir}»\n\n${EN_VIVO.despues}`,
      claves: EN_VIVO.claves,
      siFalla: SI_FALLA,
    }
  : {
      decir: EN_VIVO.decir,
      despues: `**Sin clic**, cuando Angel termina de escribir el monto y el 20.\n\n${EN_VIVO.despues}`,
      claves: EN_VIVO.claves,
      siFalla: SI_FALLA,
    };

export default definirDiapositiva({
  id: 'demo-lendex',
  titulo: 'Demo de Lendex',
  orador: 'jose',
  duracion: faltanLosDos ? 125 : 110,
  pasos: PASO_RECORTE,
  // El video de la V con su primer cuadro y el póster del presentador: se precargan al llegar a la 17 y el motor avisa si faltan.
  medios: respaldoGuion ? [respaldoGuion.video, respaldoGuion.inicio, POSTER] : [POSTER],
  notas: LENDEX_ABRE_LA_CALCULADORA ? [PREGUNTA, CALCULAR] : [PREGUNTA, ELEGIR, CALCULAR],
  fuentes: [
    'Calculadora: https://lendexgp.com/app, consultada el 12-nov-2026. Trae RD$50,000, 5 % mensual, 12 cuotas, Mensual y Francesa, y calcula mientras se escribe (04 §2).',
    'Con 20 % mensual a 12 cuotas francesas, el total a pagar es 2.70 veces el monto, sea cual sea el monto. Por eso «casi tres veces» vale para cualquier cifra que diga el público. Es cálculo propio con C:/Users/joser/Lendex/src/utils/calculateInstallments.ts (12-nov-2026): la app redondea la cuota a centavos y ajusta la última.',
    'Respaldo con RD$10,000: cuota de RD$2,252.65 (la última es de RD$2,252.60), total de RD$27,031.75 e interés de RD$17,031.75.',
    'Referencia para José, que no se proyecta (cuota / total a 20 % y 12 cuotas): RD$5,000 → 1,126.32 / 13,516.04; RD$20,000 → 4,505.30 / 54,063.56; RD$25,000 → 5,631.62 / 67,579.61; RD$50,000 → 11,263.25 / 135,158.88; RD$100,000 → 22,526.50 / 270,317.85.',
    'El 20 mensual sale de la cita de la 17. Los precios y los planes de Lendex no salen (decisión 4).',
    respaldoGuion
      ? 'Video de la tecla V: la propia 18 grabada con red (lendexgp.com, scripts/lendex-grabar-demo.mjs --guion), con RD$10,000, 20 %, 12 cuotas, Mensual y Francesa (M-07; public/medios/lendex/respaldo.webm).'
      : 'Video de la tecla V: falta el del guion (M-07: RD$10,000 al 20 %). Lo graba node scripts/lendex-grabar-demo.mjs --guion (docs/MEDIOS.md).',
  ],
  Componente: Demo,
});
