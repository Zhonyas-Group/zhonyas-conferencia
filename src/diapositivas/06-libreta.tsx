/**
 * 06 · libreta · Gregory · 50 s (docs/GUION.md, «06 · libreta»). Rama diseno-wow.
 *
 * Hasta que llegue la foto (M-01), en vez de negro: una hoja de libreta de
 * colmado dibujada, que se escribe sola a mano al llegar (entrada
 * «escritura»: cada renglón se descubre de izquierda a derecha, como el
 * comando de la consola de la web, 03 M8; el subrayado y las tachaduras se
 * dibujan con su trazo). Apuntes genéricos de fiado: productos y cantidades,
 * sin nombres de personas. Dos renglones quedan tachados: ya los pagaron.
 * Gregory, abajo a la derecha, dibuja mientras se escribe (draw) y se queda quieto.
 *
 * Con la foto (`libreta.grande`, public/medios/libreta/libreta-1690x850.webp),
 * va la foto como antes, con su crédito, y la hoja dibujada no sale.
 */
import { OradorEsquina, camara } from '../marca/wow';
import { libreta, mediosDe } from '../medios-opcionales';
import { Entrada } from '../motor/Entrada';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import './06-libreta.css';
import './historia-gregory.css';

/** La caja de la foto (docs/GUION.md, 06: «1690×850, en x 115, y 115»). */
const FOTO = { left: 115, top: 115, width: 1690, height: 850 } as const;
/** El crédito, 16 px bajo la foto (historia-gregory.css, .hg-credito). */
const CREDITO_TOP = FOTO.top + FOTO.height + 16;

/** Lo apuntado: productos y cantidades, sin nombres (rama diseno-wow). `pagado`: se tacha al final. */
const RENGLONES = [
  { texto: '2 lb de arroz', pagado: true },
  { texto: '1 botella de aceite', pagado: false },
  { texto: '6 huevos', pagado: true },
  { texto: '1 salami', pagado: false },
  { texto: '4 panes', pagado: false },
  { texto: '1 sobre de café', pagado: false },
] as const;

/** Renglones de 76 px; el primero (el título) en y 120 de la hoja. */
const RENGLON = 76;
const PRIMERO = 120;
/** Ancho aproximado de cada renglón a 50 px de letra a mano (para la tachadura): 26 px por letra. */
const anchoDe = (texto: string) => Math.round(texto.length * 26 + 20);

// auditar-excepcion-inicio: A-34 — la libreta dibujada: los colores de una libreta de verdad (papel, tinta, espiral)
const EXCEPCION_LIBRETA =
  'A-45, A-34, A-36, A-38, A-40, A-69, A-48, P0-10: la libreta dibujada (rama diseno-wow): letra a mano, papel, renglones y tinta de una libreta de verdad; las cantidades son apuntes de la ilustración, no cifras; las tachaduras cruzan el renglón a propósito; tinta #22408f sobre papel #f3eee2, 9,3:1';
// auditar-excepcion-fin

function HojaDibujada() {
  return (
    <div className="libreta" data-auditar-excepcion={EXCEPCION_LIBRETA}>
      <Entrada desde={0} efecto="escritura" className="libreta__hoja">
        <div className="libreta__papel" aria-label="Una hoja de libreta de fiado: arroz, aceite, huevos, salami, panes y café; el arroz y los huevos, tachados">
          {/* auditar-excepcion-inicio: A-34 — la espiral de la libreta: agujeros y alambre */}
          <svg className="libreta__espiral" viewBox="0 0 1180 60" aria-hidden="true">
            {Array.from({ length: 15 }, (_, i) => (
              <g key={i} transform={`translate(${70 + i * 74} 0)`}>
                <circle cx="0" cy="40" r="9" fill="#2a2730" />
                <path d="M -6 40 C -6 6, 6 6, 6 26" fill="none" stroke="#9a96a3" strokeWidth="5" strokeLinecap="round" />
              </g>
            ))}
          </svg>
          {/* auditar-excepcion-fin */}
          <p className="libreta__renglon libreta__titulo" style={{ top: PRIMERO }} data-trazo="">
            Fiado
          </p>
          <svg className="libreta__trazos" viewBox="0 0 1180 800" aria-hidden="true">
            {/* El subrayado del título, a mano: una curva que sube un poco al final. */}
            <path
              d={`M 170 ${PRIMERO + 72} C 260 ${PRIMERO + 80}, 340 ${PRIMERO + 70}, 420 ${PRIMERO + 62}`}
              pathLength={1}
              data-trazo="420"
            />
          </svg>
          {RENGLONES.map((r, i) => (
            <p key={r.texto} className="libreta__renglon" style={{ top: PRIMERO + RENGLON * (i + 1) + 8 }} data-trazo="">
              {r.texto}
            </p>
          ))}
          <svg className="libreta__trazos" viewBox="0 0 1180 800" aria-hidden="true">
            {RENGLONES.map((r, i) =>
              r.pagado ? (
                <path
                  key={r.texto}
                  d={(() => {
                    const y = PRIMERO + RENGLON * (i + 1) + 8 + 46;
                    const x1 = 150 + anchoDe(r.texto);
                    return `M 150 ${y + 4} C ${150 + (x1 - 150) * 0.35} ${y - 2}, ${150 + (x1 - 150) * 0.7} ${y + 6}, ${x1} ${y - 4}`;
                  })()}
                  pathLength={1}
                  data-trazo="380"
                />
              ) : null,
            )}
          </svg>
        </div>
      </Entrada>
      <OradorEsquina atlas="gregory" animacion="draw" vueltas={10} luego="idle" />
    </div>
  );
}

function Libreta(_: PropsDiapositiva) {
  if (!libreta.grande.src) return <HojaDibujada />;
  return (
    <>
      <div className="hg-evidencia" style={FOTO}>
        <img
          src={libreta.grande.src}
          alt="La libreta de un negocio cercano, abierta en una página de fiado o de ventas"
          decoding="async"
          draggable={false}
        />
      </div>
      {libreta.credito.texto ? (
        <p className="zh-fuente hg-credito" style={{ top: CREDITO_TOP }}>
          {libreta.credito.texto}
        </p>
      ) : null}
    </>
  );
}

const sinFoto = libreta.grande.hay
  ? ''
  : '\n\n**Sin la foto de la libreta (M-01):** va la hoja dibujada que se escribe sola (arroz, aceite, huevos…; el arroz y los huevos, tachados: ya los pagaron).';
const CONFIRMAR =
  '**[CONFIRMAR con Gregory]** Si tiene una escena real con un dueño y su libreta, va aquí en una frase. Si no la tiene, no se dice nada.';

export default definirDiapositiva({
  id: 'libreta',
  titulo: 'La libreta',
  orador: 'gregory',
  duracion: 50,
  pasos: 0,
  notas: [
    {
      decir: 'Eso ya lo contestaron ustedes con la mano arriba: en una libreta.',
      claves: 'la mano arriba · no se cae · vuelve a la libreta · tres preguntas',
      despues:
        '**Remate:** «Y esa libreta es la competencia más dura de Pymex: no se cae y todo el mundo sabe usarla. Si Pymex es más difícil que la libreta, el dueño vuelve a la libreta al otro día.»\n\n' +
        '**Para pasar a la 07:** «Pero hay tres preguntas que una libreta no contesta. Las publicamos en septiembre, y se las enseño en Pymex.»',
      aparte: CONFIRMAR + sinFoto,
    },
  ],
  fuentes: [
    '«En una libreta» no sale de la ENMIPYMES: lo contestó la sala en la 02, y así se dice. Tampoco se dice que la encuesta no pregunta por los registros: nadie lo comprobó en el PDF.',
    'Las tres preguntas son de la publicación de Zhonyas en LinkedIn del 24-sep-2026: https://es.linkedin.com/posts/zhonyas_tres-preguntas-que-una-libreta-no-contesta-activity-7509097081492402176-FBKV',
    'Va sin titular para que las 10 primeras pantallas no pasen de 40 palabras. La hoja dibujada son apuntes genéricos: sin nombres de clientes.',
    ...(libreta.credito.texto ? [libreta.credito.texto] : []),
  ],
  medios: [...mediosDe(libreta.grande), 'medios/equipo/gregory/personaje.webp'],
  transicion: camara,
  Componente: Libreta,
});
