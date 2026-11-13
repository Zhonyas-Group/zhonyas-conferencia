/**
 * Ventana del presentador (tecla P en la sala, o ?presentador en la URL).
 *
 * Muestra la diapositiva actual EN VIVO (el mismo componente, no una imagen),
 * lo que viene al avanzar, las notas, quién habla ahora y después, el
 * cronómetro con su objetivo, el ritmo y la hora. Se maneja con las mismas
 * teclas que la sala y ambas ventanas quedan sincronizadas.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { colorOrador, nombreOrador } from '../configuracion';
import { Ayuda } from './Ayuda';
import { cerrarCapasSala, hayCapasEnSala, useCapasSala } from './capasSala';
import { useConectado, useMostrarPresentador } from './conexion';
import {
  fijarObjetivo,
  iniciarCronometro,
  pausarCronometro,
  reiniciarCronometro,
  transcurrido,
  useCronometro,
} from './cronometro';
import { Cuadricula } from './Cuadricula';
import { useProblemas } from './diagnostico';
import { Escenario } from './Escenario';
import { alternarNegro, avanzar, retroceder, total, useNavegacion } from './estado';
import { Fuentes, hayFuentes } from './Fuentes';
import { useInterfaz } from './interfaz';
import { Notas } from './Notas';
import { useEnPantallaDelPublico } from './pantallas';
import { PruebaSala } from './PruebaSala';
import {
  desvio,
  duracionPlanificada,
  inicioPlanificado,
  proximoCambioDeOrador,
  siguienteVista,
  tiempoEnDiapositiva,
} from './ritmo';
import { Secuencia, VistaFija } from './Secuencia';
import { abrirCuadricula, alternarPantallaCompleta, instalarTeclado } from './teclado';
import { formatoTiempo, useAhora, usePreferencia, useTituloVentana } from './utilidades';

function Boton({
  children,
  alPulsar,
  activo,
  titulo,
  variante,
}: {
  children: ReactNode;
  alPulsar: () => void;
  activo?: boolean;
  titulo?: string;
  variante?: 'principal' | 'grande';
}) {
  return (
    <button
      type="button"
      className={variante ? `p-boton p-boton--${variante}` : 'p-boton'}
      data-activo={activo ? '' : undefined}
      aria-pressed={activo === undefined ? undefined : activo}
      title={titulo}
      // Sin foco: así Espacio e Intro siguen siendo «avanzar» y no repiten el último botón.
      // Pero un botón sí suelta el campo del objetivo (que aplica lo escrito): si no,
      // el campo seguiría con el foco y se quedaría con las teclas del puntero.
      onMouseDown={(e) => {
        e.preventDefault();
        soltarCampoDeTexto();
      }}
      onClick={(e) => {
        alPulsar();
        e.currentTarget.blur();
      }}
    >
      {children}
    </button>
  );
}

/** Quita el foco de un campo de texto (el del objetivo), que así aplica lo escrito. */
function soltarCampoDeTexto() {
  const activo = document.activeElement;
  if (activo instanceof HTMLInputElement || activo instanceof HTMLTextAreaElement) activo.blur();
}

/**
 * 1080 s → «18»; 995 s → «16:35»; 1110 s → «18:30». En minutos y segundos,
 * como «quedan 16:35» y «plan 15:55» que van al lado: «16,58» se leía de reojo
 * como 16:58, 23 s de más (docs/GUION.md, encabezado: «el objetivo del
 * cronómetro pasa de 18 a 16:35»). leerMinutos acepta lo mismo de vuelta.
 */
function minutosLegibles(segundos: number): string {
  const s = Math.round(segundos);
  if (s % 60 === 0) return String(s / 60);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** «18», «18,5», «18.5» o «18:30» → minutos. null si no se entiende. */
function leerMinutos(texto: string): number | null {
  const t = texto.trim();
  const mmss = /^(\d{1,3}):([0-5]?\d)$/.exec(t);
  if (mmss) return Number(mmss[1]) + Number(mmss[2]) / 60;
  if (!/^\d{1,3}(?:[.,]\d+)?$/.test(t)) return null;
  return Number(t.replace(',', '.'));
}

/** Sin teclear nada durante este tiempo, el campo suelta el foco (y el puntero vuelve a mandar). */
const SUELTA_EL_CAMPO_MS = 6000;

/**
 * Minutos objetivo. Muestra exactamente lo que usa el cronómetro, en minutos y
 * segundos (16:35). Se aplica con Intro o al salir del campo (también al pulsar
 * cualquier botón del presentador); Esc cancela. Lleva data-numerico: cualquier
 * tecla que no edite un número (flechas o AvPág del puntero, «b» o «.»,
 * Espacio…) suelta el campo y se obedece (teclado.ts). Se escribe «16:35», o
 * en minutos con coma (16,5).
 */
function CampoObjetivo({ segundos }: { segundos: number }) {
  const [texto, setTexto] = useState('');
  const [editando, setEditando] = useState(false);
  const campo = useRef<HTMLInputElement>(null);
  const cancelado = useRef(false);
  const inactividad = useRef(0);
  const vigilarInactividad = () => {
    window.clearTimeout(inactividad.current);
    inactividad.current = window.setTimeout(() => campo.current?.blur(), SUELTA_EL_CAMPO_MS);
  };
  useEffect(() => () => window.clearTimeout(inactividad.current), []);
  const alSalir = () => {
    window.clearTimeout(inactividad.current);
    const minutos = cancelado.current ? null : leerMinutos(texto);
    cancelado.current = false;
    if (minutos !== null) fijarObjetivo(minutos);
    setEditando(false);
  };
  return (
    <label
      className="p-objetivo"
      title="Duración objetivo de la charla, en minutos y segundos (16:35; también admite 16,5). Intro aplica, Esc cancela. Las flechas y AvPág/RePág sueltan el campo y pasan diapositiva, como el puntero; «b» y «.» ponen la sala en negro."
    >
      <input
        ref={campo}
        type="text"
        inputMode="decimal"
        data-numerico=""
        aria-label="Objetivo de la charla, en minutos"
        value={editando ? texto : minutosLegibles(segundos)}
        onFocus={(e) => {
          cancelado.current = false;
          setTexto(minutosLegibles(segundos));
          setEditando(true);
          e.currentTarget.select();
          vigilarInactividad();
        }}
        onChange={(e) => {
          setTexto(e.target.value);
          vigilarInactividad();
        }}
        onBlur={alSalir}
        onKeyDown={(e) => {
          vigilarInactividad();
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelado.current = true;
            e.currentTarget.blur();
          }
        }}
      />
      min
    </label>
  );
}

function colorVar(color: string): CSSProperties {
  return { '--color-orador': color } as CSSProperties;
}

/**
 * Por debajo de este alto de ventana (un portátil de 1920 × 1080 al 150 % da
 * 1280 × 720; uno de 1366 × 768, menos de 700 útiles), las notas arrancan a
 * 24 px en vez de 30 y las fuentes se pliegan en una línea (GUION, M-02 y R-14:
 * la laptop del día puede ser la ThinkPad).
 */
const ALTO_BAJO = 800;
/** Letra de las notas por defecto, en px, con alto de sobra y con poco alto. */
const NOTAS_ALTO = 30;
const NOTAS_BAJO = 24;
/** Hasta aquí baja sola la letra para que la nota del paso quepa entera. */
const NOTAS_MINIMO = 18;

function useAltoVentana(): number {
  const [alto, setAlto] = useState(() => window.innerHeight);
  useEffect(() => {
    const medir = () => setAlto(window.innerHeight);
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);
  return alto;
}

/**
 * Ajusta la letra de las notas para que la del paso quepa sin desplazar: parte
 * del tamaño elegido (A− / A+) y baja de 1 en 1 px hasta NOTAS_MINIMO mientras
 * el texto sea más alto que el panel. Si ni así cabe, `sigue` es true mientras
 * quede texto por debajo (el panel enseña «sigue ↓»). Se vuelve a medir al
 * cambiar de paso, al cambiar el tamaño de la ventana o del panel, y al abrir o
 * plegar el «Si falla» (un ResizeObserver sobre el texto).
 */
function useNotasQueCaben(base: number, clave: string) {
  const caja = useRef<HTMLDivElement>(null);
  const [sigue, setSigue] = useState(false);
  const mirarSiSigue = useCallback(() => {
    const el = caja.current;
    if (!el) return;
    setSigue(el.scrollHeight > el.clientHeight + 1 && el.scrollTop + el.clientHeight < el.scrollHeight - 2);
  }, []);
  const ajustar = useCallback(() => {
    const el = caja.current;
    if (!el) return;
    const minimo = Math.min(NOTAS_MINIMO, base);
    let tam = base;
    el.style.fontSize = `${tam}px`;
    while (tam > minimo && el.scrollHeight > el.clientHeight + 1) {
      tam -= 1;
      el.style.fontSize = `${tam}px`;
    }
    el.dataset.tam = String(tam);
    mirarSiSigue();
  }, [base, mirarSiSigue]);
  useLayoutEffect(() => {
    if (caja.current) caja.current.scrollTop = 0;
    ajustar();
  }, [ajustar, clave]);
  useEffect(() => {
    const el = caja.current;
    if (!el || typeof ResizeObserver !== 'function') return;
    const observador = new ResizeObserver(() => ajustar());
    observador.observe(el);
    if (el.firstElementChild) observador.observe(el.firstElementChild);
    return () => observador.disconnect();
  }, [ajustar, clave]);
  return { caja, sigue, mirarSiSigue };
}

export function Presentador() {
  const nav = useNavegacion();
  const cron = useCronometro();
  const ui = useInterfaz();
  const ahora = useAhora(250);
  const problemas = useProblemas();
  const salaConectada = useConectado('sala');
  const capasSala = useCapasSala();
  // Un tamaño elegido para cada alto de ventana: el de la ThinkPad al 150 % no pisa el de una pantalla grande.
  const bajo = useAltoVentana() < ALTO_BAJO;
  const [tamAlto, setTamAlto] = usePreferencia('tamano-notas', NOTAS_ALTO);
  const [tamBajo, setTamBajo] = usePreferencia('tamano-notas-bajo', NOTAS_BAJO);
  const tamNotas = bajo ? tamBajo : tamAlto;
  const setTamNotas = bajo ? setTamBajo : setTamAlto;
  const [fuentesAbiertas, setFuentesAbiertas] = useState(false);
  const [enPantallaDelPublico, usarAqui] = useEnPantallaDelPublico();

  // P en la sala con este presentador abierto: no se abre otro, este se destaca.
  const [destacado, setDestacado] = useState(false);
  const temporizadorDestacado = useRef(0);
  const destacar = useCallback(() => {
    setDestacado(true);
    window.clearTimeout(temporizadorDestacado.current);
    temporizadorDestacado.current = window.setTimeout(() => setDestacado(false), 1600);
  }, []);
  useMostrarPresentador(destacar);

  // Esc sin nada propio abierto cierra la cuadrícula o la ayuda que tenga abierta la sala.
  useEffect(
    () =>
      instalarTeclado({
        alEscapeLibre: () => {
          if (!hayCapasEnSala()) return false;
          cerrarCapasSala();
          return true;
        },
      }),
    [],
  );
  useTituloVentana(`Presentador · ${nav.indice + 1}/${total}`);

  const d = diapositivas[nav.indice];
  // La clave también cambia al volver de la pantalla del público: el panel de notas se monta de nuevo.
  const notas = useNotasQueCaben(tamNotas, `${d.id}:${nav.paso}:${enPantallaDelPublico ? 'publico' : 'propio'}`);
  // Las fuentes plegadas vuelven a plegarse en cada diapositiva.
  useEffect(() => setFuentesAbiertas(false), [d.id]);
  const fuentesPlegadas = bajo && !fuentesAbiertas;
  const siguiente = siguienteVista(nav);
  const cambio = proximoCambioDeOrador(nav.indice);
  const relevoAlAvanzar = siguiente.tipo === 'diapositiva' && diapositivas[siguiente.indice].orador !== d.orador;

  const tTotal = transcurrido(cron, ahora) / 1000;
  const tDiapositiva = tiempoEnDiapositiva(nav, cron, ahora);
  // Alerta de color pasado el +20 % de la duración sugerida (01 P1-17); aviso al pasarla.
  const exceso = d.duracion > 0 ? tDiapositiva / d.duracion : 0;
  const estadoDiapositiva = exceso > 1.2 ? 'mal' : exceso > 1 ? 'aviso' : 'neutro';
  const dv = desvio(nav, cron, ahora);
  const restante = cron.objetivo - tTotal;
  const progreso = Math.min(1, tTotal / cron.objetivo);
  const marcaPlan = Math.min(1, (inicioPlanificado(nav.indice) + d.duracion) / cron.objetivo);

  let ritmoTexto = 'Sin empezar';
  let ritmoEstado = 'neutro';
  if (dv !== null) {
    if (Math.abs(dv) < 10) {
      ritmoTexto = 'A tiempo';
      ritmoEstado = 'bien';
    } else if (dv > 0) {
      ritmoTexto = `Atrasado ${formatoTiempo(dv)}`;
      ritmoEstado = dv > 60 ? 'mal' : 'aviso';
    } else {
      ritmoTexto = `Adelantado ${formatoTiempo(-dv)}`;
      ritmoEstado = dv < -60 ? 'aviso' : 'bien';
    }
  }

  let rotuloSiguiente = 'Fin de la presentación';
  if (siguiente.tipo === 'encender') rotuloSiguiente = 'Siguiente: vuelve la imagen, sin moverse';
  else if (siguiente.tipo === 'cerrar-prueba') rotuloSiguiente = 'Siguiente: se cierra la prueba de sala, sin moverse';
  else if (siguiente.tipo === 'paso') rotuloSiguiente = `Siguiente: paso ${siguiente.paso} de ${d.pasos}`;
  else if (siguiente.tipo === 'diapositiva')
    rotuloSiguiente = `Siguiente: ${siguiente.indice + 1} · ${diapositivas[siguiente.indice].titulo}`;

  const hora = new Date(ahora).toLocaleTimeString('es-DO', { hour: 'numeric', minute: '2-digit' });

  // La ventana está en la pantalla del público, encima de la sala (se reabrió con P
  // desde la sala a pantalla completa): solo enseña lo que ve el público (pantallas.ts).
  // Las teclas y el puntero siguen mandando igual.
  if (enPantallaDelPublico) {
    return (
      <div className="cortina" style={{ background: d.fondo ?? undefined }}>
        <Escenario fondo={d.fondo}>
          <Secuencia
            indice={nav.indice}
            paso={nav.paso}
            direccion={nav.direccion}
            silencio
            pausada={nav.negro || nav.prueba}
          />
        </Escenario>
        {nav.prueba && (
          <div className="capa-prueba-sala" aria-label="Prueba de sala">
            <Escenario>
              <PruebaSala />
            </Escenario>
          </div>
        )}
        <div className="negro" data-activo={nav.negro ? '' : undefined} aria-hidden />
        <div className="cortina__aviso" role="status">
          <span>
            El presentador está en la pantalla del público. Llévalo a la tuya con{' '}
            <span className="cortina__teclas">
              <kbd>Win</kbd> + <kbd>Mayús</kbd> + <kbd>←</kbd> o <kbd>→</kbd>
            </span>
          </span>
          <Boton alPulsar={usarAqui} titulo="Enseñar aquí las notas y el cronómetro (el público los verá)">
            Usarlo aquí
          </Boton>
        </div>
      </div>
    );
  }

  return (
    <div className="presentador" data-destacado={destacado ? '' : undefined}>
      <header className="p-barra">
        <div className="p-posicion">
          <span className="p-posicion__n">{nav.indice + 1}</span>
          <span className="p-posicion__total">/ {total}</span>
          {d.pasos > 0 && (
            <span className="p-posicion__paso">
              paso {nav.paso} de {d.pasos}
            </span>
          )}
          <span className="p-posicion__titulo">{d.titulo}</span>
        </div>
        <div className="p-oradores">
          <span className="p-orador" style={colorVar(colorOrador(d.orador))}>
            <span className="p-etiqueta">Habla</span>
            <strong>{nombreOrador(d.orador)}</strong>
          </span>
          <span className="p-orador p-orador--despues" style={cambio ? colorVar(colorOrador(cambio.orador)) : undefined}>
            <span className="p-etiqueta">Después</span>
            {cambio ? (
              <span>
                <strong>{nombreOrador(cambio.orador)}</strong> en la {cambio.indice + 1}
                {cambio.indice === nav.indice + 1 ? ' (la siguiente)' : ` (dentro de ${cambio.indice - nav.indice})`}
              </span>
            ) : (
              <span>nadie más: cierras tú</span>
            )}
          </span>
        </div>
        <div className="p-estado">
          {nav.luz && (
            <span className="p-luz" title="Modo sala con luz: fuentes, créditos y etiquetas en blanco. L lo quita.">
              Sala con luz · L
            </span>
          )}
          <span
            className="p-conexion"
            data-ok={salaConectada ? '' : undefined}
            title={
              salaConectada
                ? 'La ventana de la sala responde.'
                : 'No responde la ventana de la sala. Ábrela (index.html) en este mismo navegador y pulsa P en ella.'
            }
          >
            {salaConectada ? 'Sala conectada' : 'Sala sin conectar'}
          </span>
          <span className="p-reloj">{hora}</span>
        </div>
      </header>

      {problemas.length > 0 && (
        <div className="p-avisos" role="alert">
          <strong>
            {problemas.length === 1 ? '1 aviso' : `${problemas.length} avisos`}
          </strong>
          {problemas.map((p) => (
            <span key={p}>{p}</span>
          ))}
        </div>
      )}

      <main className="p-cuerpo">
        <section className="p-panel p-actual">
          <div className="p-rotulo">En pantalla</div>
          <div className="p-vista vista-viva">
            <Escenario fondo="transparent">
              {/* Con vecinas montadas también aquí: el presentador comparte la GPU con la sala, y pintar
                  de golpe una foto 4K al avanzar le quitaba cuadros a la proyección. Por lo mismo, las
                  diapositivas pesadas (WebGL, filtros SVG) se ven como póster quieto (C-02). */}
              <Secuencia
                indice={nav.indice}
                paso={nav.paso}
                direccion={nav.direccion}
                silencio
                estatico
                pausada={nav.negro || ui.cuadricula || nav.prueba}
              />
            </Escenario>
            {nav.prueba && (
              <div className="p-prueba">
                <Escenario fondo="transparent">
                  <PruebaSala />
                </Escenario>
                <span className="p-prueba__aviso">El público ve la prueba de sala · T o Esc para quitarla</span>
              </div>
            )}
            {nav.negro && <div className="p-velo">Pantalla en negro · B para volver</div>}
            {!nav.negro && (capasSala.cuadricula || capasSala.ayuda) && (
              <div className="p-velo p-velo--capa" role="status">
                <span>
                  El público ve {capasSala.cuadricula ? 'la cuadrícula' : 'la ayuda de teclas'} encima de la diapositiva
                </span>
                <Boton alPulsar={cerrarCapasSala} titulo="Cierra lo que la sala tiene abierto (también con Esc)">
                  Cerrar en la sala · Esc
                </Boton>
              </div>
            )}
          </div>
        </section>

        <section className="p-panel p-siguiente">
          <div className="p-rotulo">{rotuloSiguiente}</div>
          <div className="p-vista">
            {siguiente.tipo === 'fin' ? (
              <div className="p-fin">Última diapositiva</div>
            ) : (
              <Escenario fondo="transparent">
                <VistaFija indice={siguiente.indice} paso={siguiente.paso} modo="vista" estatico />
              </Escenario>
            )}
          </div>
          {relevoAlAvanzar && siguiente.tipo === 'diapositiva' && (
            <div className="p-relevo" style={colorVar(colorOrador(diapositivas[siguiente.indice].orador))}>
              Al avanzar le toca a <strong>{nombreOrador(diapositivas[siguiente.indice].orador)}</strong>
            </div>
          )}
        </section>

        <section
          className="p-panel p-tiempos"
          data-alerta={estadoDiapositiva === 'mal' ? '' : undefined}
          title={estadoDiapositiva === 'mal' ? 'Esta diapositiva ya pasó el +20 % de su duración sugerida.' : undefined}
        >
          <div className="p-total" data-estado={restante < 0 ? 'mal' : restante < 60 ? 'aviso' : 'neutro'}>
            <span className="p-total__cifra">{formatoTiempo(tTotal)}</span>
            <span className="p-total__detalle">
              <span>de</span>
              <CampoObjetivo segundos={cron.objetivo} />
              <span>·</span>
              <span className="p-total__queda">
                {restante >= 0 ? `quedan ${formatoTiempo(restante)}` : `te pasaste ${formatoTiempo(-restante)}`}
              </span>
            </span>
          </div>
          <div className="p-barra-tiempo" aria-hidden>
            <span className="p-barra-tiempo__lleno" style={{ transform: `scaleX(${progreso})` }} />
            <span className="p-barra-tiempo__plan" style={{ left: `${marcaPlan * 100}%` }} />
          </div>
          <dl className="p-datos">
            <div>
              <dt
                title={`Comparado con las duraciones sugeridas de cada diapositiva (suman ${formatoTiempo(duracionPlanificada)}).`}
              >
                Ritmo
                {Math.abs(duracionPlanificada - cron.objetivo) >= 30 && (
                  <span className="p-datos__de"> · plan {formatoTiempo(duracionPlanificada)}</span>
                )}
              </dt>
              <dd data-estado={ritmoEstado}>{ritmoTexto}</dd>
            </div>
            <div>
              <dt>Esta diapositiva</dt>
              <dd data-estado={estadoDiapositiva}>
                {formatoTiempo(tDiapositiva)} <span className="p-datos__de">de {formatoTiempo(d.duracion)}</span>
              </dd>
            </div>
          </dl>
          <div className="p-cronometro">
            {cron.corriendo ? (
              <Boton alPulsar={pausarCronometro}>Pausar</Boton>
            ) : (
              <Boton alPulsar={iniciarCronometro} variante="principal">
                {tTotal > 0 ? 'Seguir' : 'Iniciar'}
              </Boton>
            )}
            <Boton alPulsar={reiniciarCronometro} titulo="Poner el cronómetro a cero">
              Reiniciar
            </Boton>
          </div>
        </section>

        <div className="p-columna-notas">
          <section className="p-panel p-notas">
            <div className="p-rotulo">
              Notas
              <span className="p-tamano">
                <Boton alPulsar={() => setTamNotas(Math.max(16, tamNotas - 2))} titulo="Letra más pequeña">
                  A−
                </Boton>
                <Boton alPulsar={() => setTamNotas(Math.min(64, tamNotas + 2))} titulo="Letra más grande">
                  A+
                </Boton>
              </span>
            </div>
            {/* La letra la pone useNotasQueCaben (de tamNotas hasta 18 px, para que quepa la nota entera). */}
            <div className="p-notas__texto" ref={notas.caja} onScroll={notas.mirarSiSigue}>
              <div className="p-notas__contenido">
                <Notas key={`${d.id}:${nav.paso}`} notas={d.notas} paso={nav.paso} />
              </div>
            </div>
            {notas.sigue && (
              <span className="p-notas__sigue" aria-hidden>
                sigue ↓
              </span>
            )}
          </section>
          {/* Las fuentes, aparte de lo que se dice (01 P1-16). Con poco alto, plegadas en una línea. */}
          {hayFuentes(d) && (
            <section
              className="p-panel p-fuentes"
              aria-label="Fuentes de esta diapositiva"
              data-plegadas={fuentesPlegadas ? '' : undefined}
            >
              <div className="p-rotulo">
                Fuentes
                {bajo && (
                  <Boton
                    alPulsar={() => setFuentesAbiertas(!fuentesAbiertas)}
                    titulo={fuentesAbiertas ? 'Plegar las fuentes' : 'Ver las fuentes de esta diapositiva'}
                  >
                    {fuentesAbiertas ? 'Plegar' : 'Ver'}
                  </Boton>
                )}
              </div>
              {/* Plegadas siguen en la página, ocultas: se pueden buscar y leer (como el «Si falla» de las notas). */}
              <div className="p-fuentes__texto" hidden={fuentesPlegadas}>
                <Fuentes diapositiva={d} />
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="p-controles">
        <Boton alPulsar={retroceder} variante="grande" titulo="← o RePág">
          ← Anterior
        </Boton>
        <Boton alPulsar={avanzar} variante="grande" titulo="→, Espacio o AvPág">
          Siguiente →
        </Boton>
        <span className="p-controles__hueco" />
        <Boton alPulsar={() => alternarNegro()} activo={nav.negro} titulo="Tecla B o «.»">
          Pantalla en negro
        </Boton>
        <Boton alPulsar={abrirCuadricula} titulo="Tecla G">
          Cuadrícula
        </Boton>
        <Boton alPulsar={alternarPantallaCompleta} titulo="Tecla F">
          Pantalla completa
        </Boton>
      </footer>

      {ui.numero && (
        <div className="salto salto--presentador" aria-live="polite">
          <span>
            Ir a <strong>{ui.numero}</strong>
            {Number(ui.numero) > total && <span className="salto__aviso"> · solo hay {total}</span>}
          </span>
          <span className="salto__ayuda">Intro salta · Esc cancela</span>
        </div>
      )}
      {ui.cuadricula && <Cuadricula />}
      {ui.ayuda && <Ayuda />}
    </div>
  );
}
