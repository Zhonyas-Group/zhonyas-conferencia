/**
 * Laboratorio de piezas (lab.html): monta cada pieza de src/marca/**\/*.lab.tsx
 * a 1920 × 1080 en el escenario del motor, sin tocar el índice de diapositivas.
 *
 *   lab.html                      índice de piezas y de entradas registradas
 *   lab.html?pieza=cifra&paso=1   la pieza «cifra» quieta en el paso 1
 *   …&revision=1                  sin animaciones (estado final, como las capturas)
 *   …&hud=0                       sin la franja de ayuda de abajo
 *
 * Teclas: → / Espacio avanza con su animación, ← retrocede, R repite el paso
 * actual desde el anterior, Inicio vuelve al paso 0, H esconde la franja, Esc
 * vuelve al índice.
 *
 * Para Playwright, `window.__lab` (ver ApiLab): reproducir un paso desde t = 0
 * con el reloj congelado y capturar los cuadros que se quieran.
 */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { ContextoDiapositiva, type DatosDiapositiva } from '../contexto';
import { obtenerProblemas, registrarProblema, useProblemas } from '../diagnostico';
import { entradasRegistradas } from '../entradas';
import { esRevision, useMenosMovimiento } from '../entorno';
import { Escenario } from '../Escenario';
import { LimiteError } from '../LimiteError';
import { pendientesEnCapa, prepararCapa } from '../medios';
import { anotarMomento, declararExcepcionA54, momentosDe, suscribirMomentos } from '../momentos';
import { corte, ejecutarTransicion, limpiarCapa, type Controlador } from '../transiciones';
import type { Diapositiva, Direccion, RolCapa } from '../tipos';
import * as reloj from './reloj';
import { posicionesDe, type EscenaLab, type Pieza, type PiezaCargada } from './tipos';

// ——— Piezas ———

/** Cada archivo se carga solo cuando se pide: una pieza a medio hacer no rompe las demás. */
const modulos = import.meta.glob<{ default?: Pieza }>(['/src/marca/**/*.lab.tsx', '/src/motor/**/*.lab.tsx']);

const archivos = new Map<string, string>();
for (const ruta of Object.keys(modulos).sort()) {
  const id = ruta.split('/').pop()!.replace(/\.lab\.tsx$/, '');
  if (archivos.has(id)) registrarProblema(`Dos piezas se llaman «${id}»: ${archivos.get(id)} y ${ruta}. Cambia el nombre de una.`);
  else archivos.set(id, ruta);
}

const cache = new Map<string, Promise<PiezaCargada>>();

function normalizar(e: EscenaLab | Diapositiva): EscenaLab {
  return {
    id: e.id,
    pasos: e.pasos,
    Componente: e.Componente,
    transicion: e.transicion,
    fondo: e.fondo,
    excepcionA54: e.excepcionA54,
  };
}

function cargarPieza(id: string): Promise<PiezaCargada> {
  const previa = cache.get(id);
  if (previa) return previa;
  const promesa = (async () => {
    const ruta = archivos.get(id);
    if (!ruta) throw new Error(`No hay ninguna pieza «${id}» (se buscan src/marca/**/${id}.lab.tsx y src/motor/**/${id}.lab.tsx).`);
    const p = (await modulos[ruta]()).default;
    if (!p) throw new Error(`${ruta} no exporta por defecto definirPieza({ … }).`);
    const escenas = p.escenas?.length
      ? p.escenas.map(normalizar)
      : p.Componente
        ? [{ id, pasos: p.pasos ?? 0, Componente: p.Componente, transicion: p.transicion, fondo: p.fondo }]
        : [];
    if (escenas.length === 0) throw new Error(`${ruta}: la pieza no tiene escenas (ni «escenas» ni «Componente»).`);
    return { id, archivo: ruta, titulo: p.titulo, movimiento: p.movimiento, notas: p.notas, escenas };
  })();
  cache.set(id, promesa);
  return promesa;
}

// ——— Estado del laboratorio ———

interface EstadoLab {
  pieza: PiezaCargada | null;
  error: string | null;
  /** Posición en la pieza (escena y paso aplanados); −1 = antes de la primera escena. */
  posicion: number;
  direccion: Direccion;
}

let estado: EstadoLab = { pieza: null, error: null, posicion: 0, direccion: 0 };
const oyentes = new Set<() => void>();

function fijar(parcial: Partial<EstadoLab>) {
  estado = { ...estado, ...parcial };
  for (const oyente of oyentes) oyente();
}

function useEstadoLab(): EstadoLab {
  return useSyncExternalStore(
    (o) => {
      oyentes.add(o);
      return () => oyentes.delete(o);
    },
    () => estado,
  );
}

function totalPosiciones(): number {
  return estado.pieza ? posicionesDe(estado.pieza).length : 0;
}

function escribirUrl() {
  const url = new URL(location.href);
  if (estado.pieza) {
    url.searchParams.set('pieza', estado.pieza.id);
    url.searchParams.set('paso', String(Math.max(0, estado.posicion)));
  }
  try {
    history.replaceState(null, '', url);
  } catch {
    /* file:// raro */
  }
}

function moverA(posicion: number, direccion: Direccion) {
  const p = Math.min(Math.max(-1, Math.floor(posicion)), totalPosiciones() - 1);
  if (p === estado.posicion && direccion !== 0) return;
  fijar({ posicion: p, direccion });
  escribirUrl();
}

const pausa = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Fuentes, imágenes y WebGL de la escena en pantalla listos, y dos cuadros pintados. */
async function esperar(limiteMs = 10000): Promise<boolean> {
  try {
    await Promise.race([document.fonts?.ready, pausa(limiteMs)]);
  } catch {
    /* sin API de fuentes */
  }
  // Se cuenta en cuadros reales: con el reloj congelado, performance.now no avanza.
  const vueltas = Math.ceil(limiteMs / 16);
  let listo = false;
  for (let i = 0; i < vueltas && !listo; i++) {
    // prepararCapa espera cuadros con requestAnimationFrame: con el reloj congelado no llegarían.
    if (!reloj.estaCongelado()) {
      const capas = [...document.querySelectorAll<HTMLElement>('.lab-escenario .capa')];
      await Promise.race([Promise.all(capas.map((c) => prepararCapa(c))), pausa(2000)]);
    }
    const actual = document.querySelector<HTMLElement>('.lab-escenario .capa[data-rol="actual"]');
    listo = !actual || pendientesEnCapa(actual) === 0;
    if (!listo) await reloj.cuadroReal();
  }
  await reloj.cuadroReal();
  await reloj.cuadroReal();
  return listo;
}

// ——— API para Playwright ———

export interface InfoPieza {
  id: string;
  archivo: string;
  titulo?: string;
  movimiento?: string;
  notas?: string;
  /** Posiciones de la pieza: los «pasos» del laboratorio (escena y paso, aplanados), de 0 a posiciones − 1. */
  posiciones?: number;
  escenas?: Array<{ id: string; pasos: number }>;
  error?: string;
}

export interface ApiLab {
  /** Todas las piezas (las carga para leer su título; una que falla trae `error`). */
  piezas: () => Promise<InfoPieza[]>;
  /** Muestra la pieza en ese paso, quieta, en su estado final. −1 = antes de la primera escena. */
  ir: (pieza: string, paso?: number) => Promise<void>;
  /** Como las flechas: con su animación, en tiempo real. */
  avanzar: () => void;
  retroceder: () => void;
  estado: () => {
    pieza: string | null;
    posicion: number;
    total: number;
    escena: string | null;
    paso: number;
    congelado: boolean;
    /** ms desde el disparo, con el reloj congelado. */
    t: number | null;
  };
  /** Espera a que la escena en pantalla tenga fuentes, imágenes y WebGL listos. */
  esperar: () => Promise<boolean>;
  /** Deja la pieza quieta en el paso anterior a `paso`, lista, con el reloj congelado. */
  preparar: (pieza: string, paso: number) => Promise<void>;
  /** Avanza al paso preparado con el reloj quieto: es el instante t = 0. */
  disparar: () => Promise<void>;
  /** Lleva el reloj a `ms` desde el disparo (solo hacia delante) y deja pintado ese instante. */
  cuadro: (ms: number) => Promise<void>;
  /** Vuelve al tiempo real. */
  soltar: () => void;
  /** Momentos animados (A-54) de cada escena de la pieza cargada. */
  momentos: () => Record<string, string[]>;
  problemas: () => string[];
  /** Entradas con nombre registradas: nombre, movimiento y fuente. */
  entradas: () => Array<{ nombre: string; movimiento: string; fuente: string }>;
}

declare global {
  interface Window {
    __lab?: ApiLab;
  }
}

let t0 = 0;

async function ir(id: string, paso = 0) {
  reloj.soltar();
  let pieza: PiezaCargada;
  try {
    pieza = await cargarPieza(id);
  } catch (error) {
    fijar({ pieza: null, error: (error as Error).message });
    throw error;
  }
  const total = posicionesDe(pieza).length;
  const posicion = Math.min(Math.max(-1, Math.floor(paso)), total - 1);
  // Otra pieza: se desmonta la anterior entera, para que nada se arrastre.
  if (estado.pieza?.id !== pieza.id) flushSync(() => fijar({ pieza: null, error: null }));
  flushSync(() => fijar({ pieza, error: null, posicion, direccion: 0 }));
  escribirUrl();
  await esperar();
}

window.__lab = {
  piezas: async () =>
    Promise.all(
      [...archivos].map(async ([id, archivo]): Promise<InfoPieza> => {
        try {
          const p = await cargarPieza(id);
          return {
            id,
            archivo,
            titulo: p.titulo,
            movimiento: p.movimiento,
            notas: p.notas,
            posiciones: posicionesDe(p).length,
            escenas: p.escenas.map((e) => ({ id: e.id, pasos: e.pasos })),
          };
        } catch (error) {
          return { id, archivo, error: (error as Error).message };
        }
      }),
    ),
  ir,
  avanzar: () => moverA(estado.posicion + 1, 1),
  retroceder: () => moverA(estado.posicion - 1, -1),
  estado: () => {
    const pos = estado.pieza && estado.posicion >= 0 ? posicionesDe(estado.pieza)[estado.posicion] : null;
    return {
      pieza: estado.pieza?.id ?? null,
      posicion: estado.posicion,
      total: totalPosiciones(),
      escena: pos && estado.pieza ? estado.pieza.escenas[pos.escena].id : null,
      paso: pos?.paso ?? 0,
      congelado: reloj.estaCongelado(),
      t: reloj.estaCongelado() ? reloj.ahoraVirtual() - t0 : null,
    };
  },
  esperar: () => esperar(),
  preparar: async (id, paso) => {
    await ir(id, paso - 1);
    reloj.congelar();
    t0 = reloj.ahoraVirtual();
  },
  disparar: async () => {
    if (!reloj.estaCongelado()) reloj.congelar();
    t0 = reloj.ahoraVirtual();
    flushSync(() => moverA(estado.posicion + 1, 1));
    reloj.recoger();
    await reloj.cuadroReal();
    reloj.recoger();
    await reloj.cuadroReal();
  },
  cuadro: async (ms) => {
    if (!reloj.estaCongelado()) throw new Error('Primero __lab.preparar(pieza, paso) y __lab.disparar().');
    await reloj.moverHasta(t0 + ms);
    await reloj.cuadroReal();
    reloj.recoger();
    await reloj.cuadroReal();
  },
  soltar: () => reloj.soltar(),
  momentos: () => Object.fromEntries((estado.pieza?.escenas ?? []).map((e) => [e.id, momentosDe(e.id)])),
  problemas: () => [...obtenerProblemas()],
  entradas: () => entradasRegistradas().map((e) => ({ nombre: e.nombre, movimiento: e.movimiento, fuente: e.fuente })),
};

// ——— Escenas ———

interface PropsCapa {
  escena: EscenaLab;
  indice: number;
  rol: RolCapa;
  paso: number;
  direccion: Direccion;
  registrar: (indice: number, el: HTMLDivElement | null) => void;
}

const CapaLab = memo(function CapaLab({ escena, indice, rol, paso, direccion, registrar }: PropsCapa) {
  declararExcepcionA54(escena.id, escena.excepcionA54);
  useEffect(() => {
    if (escena.transicion && escena.transicion !== corte) anotarMomento(escena.id, 'transición');
  }, [escena]);
  const activa = rol === 'actual';
  const datos = useMemo<DatosDiapositiva>(
    () => ({
      id: escena.id,
      indice,
      paso,
      pasos: escena.pasos,
      activa,
      direccion: activa ? direccion : 0,
      modo: 'escenario',
      rol,
      silencio: true,
      pausada: false,
    }),
    [escena, indice, paso, activa, direccion, rol],
  );
  const ref = useCallback((el: HTMLDivElement | null) => registrar(indice, el), [registrar, indice]);
  const { Componente } = escena;
  return (
    <div ref={ref} className="capa" data-rol={rol} data-id={escena.id} aria-hidden={activa ? undefined : true}>
      <div className="diapositiva" style={escena.fondo ? { background: escena.fondo } : undefined}>
        <LimiteError id={escena.id} titulo={escena.id}>
          <ContextoDiapositiva.Provider value={datos}>
            <Componente paso={paso} activa={activa} direccion={activa ? direccion : 0} />
          </ContextoDiapositiva.Provider>
        </LimiteError>
      </div>
    </div>
  );
});

interface Transito {
  de: number | null;
  pasoDe: number;
  a: number;
  n: number;
}

/** Las escenas de la pieza como capas, con la misma regla de transiciones que la charla. */
function SecuenciaLab({ pieza, posicion, direccion }: { pieza: PiezaCargada; posicion: number; direccion: Direccion }) {
  const reducido = useMenosMovimiento();
  const posiciones = useMemo(() => posicionesDe(pieza), [pieza]);
  const actual = posicion >= 0 ? posiciones[posicion] : null;
  const escenaActual = actual ? actual.escena : -1;
  const pasoActual = actual ? actual.paso : 0;
  const capas = useRef(new Map<number, HTMLDivElement>());
  const registrar = useCallback((i: number, el: HTMLDivElement | null) => {
    if (el) capas.current.set(i, el);
    else capas.current.delete(i);
  }, []);
  const ultimo = useRef({ escena: escenaActual, paso: pasoActual });
  const [transito, setTransito] = useState<Transito>({ de: null, pasoDe: 0, a: escenaActual, n: 0 });

  let t = transito;
  if (escenaActual !== transito.a) {
    const pasoDe = ultimo.current.escena === transito.a ? ultimo.current.paso : 0;
    t = { de: transito.a, pasoDe, a: escenaActual, n: transito.n + 1 };
    setTransito(t);
  }
  useLayoutEffect(() => {
    ultimo.current = { escena: escenaActual, paso: pasoActual };
  });

  useLayoutEffect(() => {
    if (transito.de === null) return;
    const n = transito.n;
    const de = transito.de;
    const terminar = () => setTransito((x) => (x.n === n && x.de !== null ? { ...x, de: null } : x));
    // Desde «antes de la primera escena» no hay transición: la escena aparece.
    if (esRevision || de < 0 || transito.a < 0) {
      terminar();
      return;
    }
    const entra = capas.current.get(transito.a) ?? null;
    const sale = capas.current.get(de) ?? null;
    let vigente = true;
    const acabar = () => {
      if (!vigente) return;
      vigente = false;
      limpiarCapa(entra);
      limpiarCapa(sale);
      terminar();
    };
    const posterior = pieza.escenas[Math.max(transito.a, de)];
    const controladores: Controlador[] = ejecutarTransicion(posterior?.transicion ?? corte, entra, sale, {
      direccion: transito.a > de ? 1 : -1,
      reducido,
    });
    void Promise.all(controladores.map((c) => c.terminado)).then(acabar);
    return () => {
      if (!vigente) return;
      vigente = false;
      for (const c of controladores) c.finalizar();
      limpiarCapa(entra);
      limpiarCapa(sale);
    };
  }, [transito.n]);

  return (
    <div className="secuencia">
      {pieza.escenas.map((escena, i) => {
        const rol: RolCapa = i === t.a ? 'actual' : i === t.de ? 'saliente' : 'oculta';
        const paso = rol === 'actual' ? pasoActual : rol === 'saliente' ? t.pasoDe : i < t.a ? escena.pasos : 0;
        return (
          <CapaLab
            key={escena.id}
            escena={escena}
            indice={i}
            rol={rol}
            paso={paso}
            direccion={rol === 'actual' ? direccion : 0}
            registrar={registrar}
          />
        );
      })}
    </div>
  );
}

// ——— Vistas ———

function useMomentos(pieza: PiezaCargada | null): string[] {
  const [, setVersion] = useState(0);
  useEffect(() => suscribirMomentos(() => setVersion((v) => v + 1)), []);
  return (pieza?.escenas ?? []).flatMap((e) => momentosDe(e.id).map((m) => `${e.id}: ${m}`));
}

const sinFranja = new URLSearchParams(location.search).get('hud') === '0' || navigator.webdriver;

function VistaPieza({ pieza, posicion, direccion }: { pieza: PiezaCargada; posicion: number; direccion: Direccion }) {
  const [franja, setFranja] = useState(!sinFranja);
  const problemas = useProblemas();
  const momentos = useMomentos(pieza);
  const total = posicionesDe(pieza).length;
  const pos = posicion >= 0 ? posicionesDe(pieza)[posicion] : null;

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          window.__lab?.avanzar();
          break;
        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          window.__lab?.retroceder();
          break;
        case 'Home':
          void window.__lab?.ir(pieza.id, 0);
          break;
        case 'r':
        case 'R':
          void window.__lab?.ir(pieza.id, estado.posicion - 1).then(() => window.__lab?.avanzar());
          break;
        case 'h':
        case 'H':
          setFranja((f) => !f);
          break;
        case 'Escape':
          location.search = '';
          break;
        default:
          return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [pieza.id]);

  return (
    <div className="lab-pieza" onClick={() => window.__lab?.avanzar()}>
      <Escenario className="lab-escenario">
        <SecuenciaLab pieza={pieza} posicion={posicion} direccion={direccion} />
      </Escenario>
      {franja && (
        <div className="lab-franja" onClick={(e) => e.stopPropagation()}>
          <strong>{pieza.id}</strong>
          {pieza.movimiento && <span>{pieza.movimiento}</span>}
          <span>
            paso {Math.max(0, posicion)} de {total - 1}
            {pos && pieza.escenas.length > 1 ? ` · escena ${pieza.escenas[pos.escena].id}, paso ${pos.paso}` : ''}
          </span>
          <span>→ avanza · ← retrocede · R repite · H esconde · Esc índice</span>
          {momentos.length > 1 && <span className="lab-franja__aviso">{momentos.length} momentos: {momentos.join(', ')}</span>}
          {problemas.length > 0 && <span className="lab-franja__aviso">{problemas.join(' · ')}</span>}
        </div>
      )}
    </div>
  );
}

function Indice() {
  const [piezas, setPiezas] = useState<InfoPieza[] | null>(null);
  useEffect(() => {
    void window.__lab!.piezas().then(setPiezas);
  }, []);
  const entradas = window.__lab!.entradas();
  return (
    <main className="lab-indice">
      <h1>Laboratorio de piezas</h1>
      <p>
        Cada archivo <code>src/marca/**/*.lab.tsx</code> es una pieza. Se ve a 1920 × 1080 en el escenario del motor,
        sin tocar el índice de la charla.
      </p>
      {piezas === null ? (
        <p>Cargando…</p>
      ) : piezas.length === 0 ? (
        <p>Todavía no hay piezas.</p>
      ) : (
        <ul className="lab-indice__lista">
          {piezas.map((p) => (
            <li key={p.id} data-error={p.error ? '' : undefined}>
              <a href={`?pieza=${encodeURIComponent(p.id)}&paso=0`}>{p.id}</a>
              <span>{p.titulo ?? ''}</span>
              <span>{p.movimiento ?? ''}</span>
              <span>
                {p.error ? `Error: ${p.error}` : p.posiciones === 1 ? 'un solo paso' : `pasos 0 a ${(p.posiciones ?? 1) - 1}`}
              </span>
            </li>
          ))}
        </ul>
      )}
      <h2>Entradas registradas</h2>
      {entradas.length === 0 ? (
        <p>Ninguna todavía (src/marca/**/*.entrada.ts).</p>
      ) : (
        <ul className="lab-indice__lista">
          {entradas.map((e) => (
            <li key={e.nombre}>
              <code>{e.nombre}</code>
              <span>{e.movimiento}</span>
              <span>{e.fuente}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function Laboratorio() {
  const { pieza, error, posicion, direccion } = useEstadoLab();
  const [inicial] = useState(() => new URLSearchParams(location.search));
  const piezaPedida = inicial.get('pieza');

  useEffect(() => {
    if (!piezaPedida) return;
    void ir(piezaPedida, Number(inicial.get('paso') ?? 0) || 0).catch(() => {});
  }, [piezaPedida, inicial]);

  // Manda el estado, no la URL con la que se abrió: __lab.ir() o preparar() cambian de pieza sin recargar.
  if (pieza) return <VistaPieza pieza={pieza} posicion={posicion} direccion={direccion} />;
  if (error) return <p className="lab-error">{error}</p>;
  if (piezaPedida) return <p className="lab-error">Cargando «{piezaPedida}»…</p>;
  return <Indice />;
}
