/**
 * Secuencia de diapositivas dentro del escenario.
 *
 * Mantiene montadas, como capas apiladas:
 *   - la actual,
 *   - la que sale mientras dura la transición,
 *   - la anterior y la siguiente, ocultas (opacidad casi nula, ver motor.css),
 *     ya montadas, pintadas y con sus medios precargados, para que avanzar no
 *     tenga parpadeos ni tirones.
 * Las capas se pintan siempre en el orden de la presentación, así React nunca
 * mueve en el DOM un video o un lienzo WebGL que ya está montado.
 *
 * La que sale se queda montada como vecina oculta (no se desmonta para volver
 * a montarla). Las vecinas que faltan se montan de una en una, cuando el
 * navegador está libre y ya terminó la transición: primero la siguiente y
 * luego la anterior, para no juntar todo el trabajo en un solo cuadro.
 *
 * Si la diapositiva que entra no está lista (un salto con Fin, número + Intro
 * o la cuadrícula, o avanzar nada más abrir), la transición espera, como mucho
 * ESPERA_MAXIMA_MEDIOS, a que tenga imágenes pintadas, video y WebGL listos,
 * para que entre completa y no a trozos.
 *
 * La transición por defecto es el corte seco (Z-00, transiciones.ts): la capa
 * nueva queda encima, opaca, en el mismo cuadro.
 *
 * Con `estatico` (las vistas del presentador), una diapositiva `pesada` se
 * pinta como su póster quieto en vez de en vivo (C-02). En las miniaturas, siempre.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { ContextoDiapositiva, type DatosDiapositiva } from './contexto';
import { cuandoLibre, esPresentador, esRevision, useMenosMovimiento } from './entorno';
import { pasosDe, total } from './estado';
import { LimiteError } from './LimiteError';
import { capaLista, esperarCapa, precargar, prepararCapa } from './medios';
import { anotarMomento, declararExcepcionA54 } from './momentos';
import { PosterDiapositiva } from './PosterDiapositiva';
import { corte, ejecutarTransicion, limpiarCapa, type Controlador } from './transiciones';
import type { Direccion, ModoVista, RolCapa } from './tipos';

/**
 * Lo más que se espera a que una diapositiva recién montada tenga sus medios
 * listos antes de empezar la transición. Avanzando a la vecina no se espera
 * nada (ya está montada y pintada); solo en saltos. Pasado este tiempo entra
 * igual, y un lienzo WebGL que aún no esté listo enseña su póster.
 */
const ESPERA_MAXIMA_MEDIOS = 800;

/**
 * Opacidad de la diapositiva que entra mientras se espera a que esté lista. No
 * es 0 a propósito: Chrome no pinta una capa con opacidad 0, y entonces la
 * pintaría (foto incluida) en el primer cuadro en que se ve. Con 0,002 ya la
 * pinta y el ojo no la ve (medio nivel de 255 como mucho).
 */
const OPACIDAD_PREPARANDO = '0.002';

/** Cada cuánto se vuelve a mirar si la diapositiva en pantalla ya está quieta para montar sus vecinas. */
const ESPERA_QUIETA_MS = 100;

/**
 * ¿Tiene la capa algo animándose que vaya a terminar? Las animaciones en bucle
 * (un personaje que camina) no cuentan: si no, las vecinas no se montarían nunca.
 */
function animandose(capa: HTMLElement | undefined): boolean {
  if (!capa) return false;
  return capa.getAnimations({ subtree: true }).some((a) => {
    if (a.playState !== 'running') return false;
    const fin = Number(a.effect?.getComputedTiming().endTime ?? Infinity);
    return Number.isFinite(fin);
  });
}

interface PropsCapa {
  indice: number;
  rol: RolCapa;
  paso: number;
  activa: boolean;
  direccion: Direccion;
  modo: ModoVista;
  silencio: boolean;
  pausada?: boolean;
  /** Pintar las diapositivas pesadas como su póster (vistas del presentador). */
  estatico?: boolean;
  registrar?: (indice: number, el: HTMLDivElement | null) => void;
}

/** Una diapositiva montada. Memorizada: las capas ocultas no se repintan al cambiar de paso. */
export const Capa = memo(function Capa({
  indice,
  rol,
  paso,
  activa,
  direccion,
  modo,
  silencio,
  pausada = false,
  estatico = false,
  registrar,
}: PropsCapa) {
  const d = diapositivas[indice];
  // A-54: la excepción se declara al pintar, antes de que sus entradas anoten momentos;
  // la transición propia cuenta como un momento más.
  declararExcepcionA54(d.id, d.excepcionA54);
  useEffect(() => {
    if (d.transicion && d.transicion !== corte) anotarMomento(d.id, 'transición');
  }, [d]);
  const comoPoster = !!d.pesada && (estatico || modo === 'miniatura');
  const datos = useMemo<DatosDiapositiva>(
    () => ({ id: d.id, indice, paso, pasos: d.pasos, activa, direccion, modo, rol, silencio, pausada }),
    [d, indice, paso, activa, direccion, modo, rol, silencio, pausada],
  );
  const ref = useCallback((el: HTMLDivElement | null) => registrar?.(indice, el), [registrar, indice]);
  const { Componente } = d;
  return (
    <div
      ref={ref}
      className="capa"
      data-rol={rol}
      data-id={d.id}
      aria-hidden={rol === 'oculta' || rol === 'saliente' ? true : undefined}
    >
      <div className="diapositiva" style={d.fondo ? { background: d.fondo } : undefined}>
        <LimiteError id={d.id} titulo={d.titulo} discreto={modo === 'escenario' && !esPresentador}>
          <ContextoDiapositiva.Provider value={datos}>
            {comoPoster ? (
              <PosterDiapositiva diapositiva={d} rotulo={modo !== 'miniatura'} />
            ) : (
              <Componente paso={paso} activa={activa} direccion={direccion} />
            )}
          </ContextoDiapositiva.Provider>
        </LimiteError>
      </div>
    </div>
  );
});

interface PropsSecuencia {
  indice: number;
  paso: number;
  direccion: Direccion;
  /** Montar por adelantado la anterior y la siguiente (en la sala y en «En pantalla» del presentador). */
  vecinos?: boolean;
  silencio?: boolean;
  /** Nadie ve la diapositiva actual (negro o cuadrícula encima): ver `pausada` en contexto.tsx. */
  pausada?: boolean;
  /** Las diapositivas pesadas, como póster quieto (vistas del presentador, C-02). */
  estatico?: boolean;
}

interface Transito {
  /** Diapositiva que sale (null si no hay transición en curso). */
  de: number | null;
  /** Paso en el que estaba la que sale, para que no cambie mientras se funde. */
  pasoDe: number;
  /** Diapositiva actual. */
  a: number;
  /** Contador de transiciones. */
  n: number;
}

export function Secuencia({
  indice,
  paso,
  direccion,
  vecinos = true,
  silencio = false,
  pausada = false,
  estatico = false,
}: PropsSecuencia) {
  const reducido = useMenosMovimiento();
  const capas = useRef(new Map<number, HTMLDivElement>());
  const registrar = useCallback((i: number, el: HTMLDivElement | null) => {
    if (el) {
      capas.current.set(i, el);
      // Empieza ya a decodificar y pintar sus imágenes (la capa todavía no se ve).
      if (!esRevision) void prepararCapa(el);
    } else capas.current.delete(i);
  }, []);

  // Último estado pintado: con él se sabe en qué paso estaba la diapositiva que sale.
  const ultimo = useRef({ indice, paso });
  const [transito, setTransito] = useState<Transito>({ de: null, pasoDe: 0, a: indice, n: 0 });
  /** Vecinas montadas (ocultas). */
  const [montadas, setMontadas] = useState<number[]>([]);

  let t = transito;
  if (indice !== transito.a) {
    // Estado derivado durante el render (patrón recomendado por React para «cambió una prop»).
    const pasoDe = ultimo.current.indice === transito.a ? ultimo.current.paso : pasosDe(transito.a);
    t = { de: transito.a, pasoDe, a: indice, n: transito.n + 1 };
    setTransito(t);
    // La que sale se queda montada: al terminar la transición pasa a vecina oculta
    // (si lo es: avanzar o retroceder de uno en uno) sin desmontarla y volver a
    // montarla. Las vecinas que sobran se quitan después, con el navegador libre;
    // aquí solo las que quedan a más de dos, para que avanzar muy deprisa no
    // vaya acumulando capas montadas.
    if (vecinos) {
      const siguen = [...new Set([...montadas, transito.a])].filter((i) => Math.abs(i - indice) <= 2);
      if (siguen.length !== montadas.length || siguen.some((i, k) => i !== montadas[k])) setMontadas(siguen);
    }
  }

  useLayoutEffect(() => {
    ultimo.current = { indice, paso };
  });

  // Transición entre capas.
  useLayoutEffect(() => {
    if (transito.de === null) return;
    const n = transito.n;
    const de = transito.de;
    const entra = capas.current.get(transito.a) ?? null;
    const sale = capas.current.get(de) ?? null;
    const terminar = () => setTransito((t) => (t.n === n && t.de !== null ? { ...t, de: null } : t));
    if (esRevision) {
      terminar();
      return;
    }
    let vigente = true;
    let controladores: Controlador[] = [];
    let seguro = 0;
    let cancelarEspera = () => {};
    const acabar = () => {
      if (!vigente) return;
      vigente = false;
      limpiarCapa(entra);
      limpiarCapa(sale);
      terminar();
    };
    const empezar = () => {
      if (!vigente) return;
      entra?.style.removeProperty('opacity');
      const posterior = diapositivas[Math.max(transito.a, de)];
      controladores = ejecutarTransicion(posterior?.transicion ?? corte, entra, sale, {
        direccion: transito.a > de ? 1 : -1,
        reducido,
      });
      // Red de seguridad: una transición propia que nunca termina no deja la capa a medias.
      seguro = window.setTimeout(acabar, 4000);
      void Promise.all(controladores.map((c) => c.terminado)).then(acabar);
    };
    if (entra && !capaLista(entra)) {
      // La que entra no está lista: un salto a una diapositiva que no estaba
      // montada (Fin, número + Intro, cuadrícula), o una vecina recién montada
      // (avanzar nada más abrir). La que sale sigue a la vista hasta que la
      // nueva tiene imágenes pintadas, video y WebGL listos, y entonces entra
      // completa con su transición.
      entra.style.opacity = OPACIDAD_PREPARANDO;
      cancelarEspera = esperarCapa(entra, ESPERA_MAXIMA_MEDIOS, empezar);
    } else {
      empezar();
    }
    return () => {
      cancelarEspera();
      window.clearTimeout(seguro);
      if (!vigente) return; // ya terminó y se limpió
      // Se avanzó otra vez a mitad de camino (o se desmonta): cortar y limpiar.
      vigente = false;
      for (const c of controladores) c.finalizar();
      limpiarCapa(entra);
      limpiarCapa(sale);
    };
    // Solo debe reaccionar a una transición nueva.
  }, [transito.n]);

  // Vecinas y medios precargados, cuando el navegador está libre y no hay
  // transición. Un trabajo por cada rato libre: quitar las que sobran, montar
  // la siguiente, montar la anterior y precargar la de dos más allá.
  useEffect(() => {
    if (t.de !== null) return;
    const a = t.a;
    const existe = (i: number) => i >= 0 && i < total;
    const esVecina = (i: number) => i === a - 1 || i === a + 1;
    precargar(diapositivas[a]?.medios);
    const tareas: Array<() => void> = [];
    if (vecinos) {
      tareas.push(() => setMontadas((m) => (m.every(esVecina) ? m : m.filter(esVecina))));
      for (const i of [a + 1, a - 1].filter(existe)) {
        tareas.push(() => {
          precargar(diapositivas[i]?.medios);
          setMontadas((m) => (m.includes(i) ? m : [...m, i]));
        });
      }
    } else {
      tareas.push(() => {
        precargar(diapositivas[a + 1]?.medios);
        precargar(diapositivas[a - 1]?.medios);
      });
    }
    tareas.push(() => precargar(diapositivas[a + 2]?.medios));
    let cancelar = () => {};
    const siguiente = () => {
      // Con el corte seco no hay fundido que esperar, pero sí lo que se anima al
      // llegar (una entrada con nombre, una consola): montar una vecina en medio
      // le quitaría cuadros. Se espera a que la diapositiva en pantalla esté quieta.
      if (animandose(capas.current.get(a))) {
        const espera = window.setTimeout(() => (cancelar = cuandoLibre(siguiente)), ESPERA_QUIETA_MS);
        cancelar = () => window.clearTimeout(espera);
        return;
      }
      tareas.shift()?.();
      if (tareas.length) cancelar = cuandoLibre(siguiente);
    };
    cancelar = cuandoLibre(siguiente);
    return () => cancelar();
  }, [t.a, t.de, vecinos]);

  const roles = new Map<number, RolCapa>();
  for (const i of montadas) roles.set(i, 'oculta');
  if (t.de !== null) roles.set(t.de, 'saliente');
  roles.set(t.a, 'actual');
  const orden = [...roles.keys()].sort((x, y) => x - y);

  return (
    <div className="secuencia">
      {orden.map((i) => {
        const rol = roles.get(i)!;
        const pasoCapa = rol === 'actual' ? paso : rol === 'saliente' ? t.pasoDe : i < t.a ? pasosDe(i) : 0;
        return (
          <Capa
            key={diapositivas[i].id}
            indice={i}
            rol={rol}
            paso={pasoCapa}
            activa={rol === 'actual'}
            direccion={rol === 'actual' ? direccion : 0}
            modo="escenario"
            silencio={silencio}
            pausada={rol === 'actual' && pausada}
            estatico={estatico}
            registrar={registrar}
          />
        );
      })}
    </div>
  );
}

/** Una diapositiva quieta en un paso dado (vista previa del presentador, miniaturas, PDF). */
export function VistaFija({
  indice,
  paso,
  modo,
  estatico = false,
}: {
  indice: number;
  paso: number;
  modo: ModoVista;
  estatico?: boolean;
}) {
  return (
    <div className="secuencia">
      <Capa indice={indice} rol="fija" paso={paso} activa={false} direccion={0} modo={modo} silencio estatico={estatico} />
    </div>
  );
}
