/**
 * Lienzo WebGL con OGL, pensado para diapositivas.
 *
 * - Solo anima (requestAnimationFrame) mientras su diapositiva está en pantalla
 *   y alguien la ve; fuera de ella, con la pantalla en negro o con la cuadrícula
 *   encima queda congelado en el último fotograma y no gasta GPU.
 * - El búfer se ajusta a los píxeles reales de la pantalla (escala del
 *   escenario × devicePixelRatio × calidad), con un tope de 4K. También cuando
 *   solo cambia la densidad (la ventana pasa a una pantalla con otra escala).
 * - Mientras la escena carga (`listo`) el lienzo no se ve: se ve el póster.
 *   Así nunca asoma un fotograma a medio hacer (sin texturas); al saltar a la
 *   diapositiva, la transición además espera a que la escena esté lista.
 * - En miniaturas no crea contexto WebGL (se ve el póster). Si el equipo no
 *   tiene WebGL, o se pierde el contexto (un reinicio del controlador de la
 *   GPU al cambiar de proyector), también se ve el póster; si el navegador
 *   recupera el contexto, la escena se vuelve a crear sola.
 * - Dentro de una <Entrada> oculta no anima.
 * - En una vecina oculta, la escena no se crea al montarse sino cuando la
 *   sala lleva ESPERA_VECINA_MS quieta en su diapositiva y el navegador está
 *   libre. Crear un contexto y una escena cuesta unos 50 ms de hilo principal
 *   (compilar shaders, idas y vueltas a la GPU, medido en la ronda 2): así no
 *   coincide con el cambio de diapositiva ni con lo que se anima justo al llegar. Si se
 *   avanza antes, se crea en ese momento y la transición la espera.
 * - En modo revisión pinta un único fotograma fijo en `tiempoRevision`.
 *
 * Texturas: en file:// Chrome no deja subir a WebGL una imagen suelta de la
 * carpeta (la trata como de otro origen). Las texturas se importan desde src/
 * (`import url from './textura.png'`): el build las mete dentro del HTML.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Renderer, type OGLRenderingContext } from 'ogl';
import { useDiapositiva } from './contexto';
import { useVisibleEnEntrada } from './Entrada';
import { cuandoLibre, esRevision } from './entorno';
import { useEscala } from './Escenario';
import { medio } from './medios';
import { registrarProblema } from './diagnostico';

export interface EscenaOGL {
  /** Pinta un fotograma. `tiempo` en segundos (solo avanza mientras la diapositiva está activa). */
  dibujar: (tiempo: number, delta: number) => void;
  /** El lienzo cambió de tamaño (en píxeles lógicos del escenario). */
  redimensionar?: (ancho: number, alto: number) => void;
  /** Liberar geometrías, texturas, etc. */
  destruir?: () => void;
  /**
   * Si la escena carga algo asíncrono (texturas), una promesa que se cumple al
   * terminar: el motor vuelve a pintar y solo entonces la marca como lista
   * (las capturas del modo revisión la esperan).
   */
  listo?: Promise<unknown>;
}

export type CrearEscenaOGL = (ctx: {
  renderer: Renderer;
  gl: OGLRenderingContext;
  canvas: HTMLCanvasElement;
}) => EscenaOGL;

interface PropsLienzo {
  /** Crea la escena. Debe ser una función estable (definida fuera del componente). */
  crear: CrearEscenaOGL;
  /** Imagen fija para miniaturas y para equipos sin WebGL (ruta relativa a public/). */
  poster?: string;
  /** Multiplicador de resolución (0.5 = la mitad de píxeles, para escenas pesadas). */
  calidad?: number;
  /** Momento (en segundos) que se pinta en modo revisión. */
  tiempoRevision?: number;
  className?: string;
  style?: CSSProperties;
}

/** Fotogramas pintados por diapositiva (diagnóstico y pruebas). */
export const cuadrosOGL: Record<string, number> = {};

const PIXELES_MAXIMOS = 3840 * 2160;

/** Lo que espera una vecina oculta, con la sala quieta, antes de crear su escena (ver arriba). */
const ESPERA_VECINA_MS = 1500;

/** Atributos del contexto. Se piden aquí y OGL recibe los mismos (ver crearContexto). */
const ATRIBUTOS = {
  alpha: true,
  depth: true,
  stencil: false,
  antialias: true,
  premultipliedAlpha: false,
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
} as const satisfies WebGLContextAttributes;

/** Se sabe que este navegador no da contexto WebGL: las demás escenas ni lo intentan. */
let sinWebGL = false;

const AVISO_SIN_WEBGL =
  'Este equipo no tiene WebGL: las escenas 3D muestran su imagen fija y la charla funciona igual. ' +
  'Para verlas animadas, activa la aceleración de gráficos en Configuración › Sistema (Chrome o Edge) y reinicia el navegador.';

/**
 * Pide el contexto WebGL antes que OGL. Si el equipo no tiene WebGL, OGL
 * escribe un error en la consola y su constructor revienta con un TypeError
 * incomprensible; así se sabe antes y se avisa con claras. Si hay contexto,
 * OGL recoge este mismo (mismo tipo de contexto sobre el mismo canvas).
 */
function crearContexto(canvas: HTMLCanvasElement): boolean {
  if (sinWebGL) return false;
  try {
    if (canvas.getContext('webgl2', ATRIBUTOS) || canvas.getContext('webgl', ATRIBUTOS)) return true;
  } catch {
    /* algunos navegadores lanzan en vez de devolver null */
  }
  sinWebGL = true;
  return false;
}

interface Motor {
  renderer: Renderer;
  escena: EscenaOGL;
  tiempo: number;
  corriendo: boolean;
  pintar: (delta?: number) => void;
}

export function LienzoOGL({ crear, poster, calidad = 1, tiempoRevision = 0, className, style }: PropsLienzo) {
  const { activa, rol, modo, id, pausada } = useDiapositiva();
  const visible = useVisibleEnEntrada();
  const escala = useEscala();
  /** Contenedor exterior: lleva data-listo y data-perdido (el CSS decide si se ve el lienzo o el póster). */
  const exterior = useRef<HTMLDivElement>(null);
  /** Donde se monta el canvas. */
  const caja = useRef<HTMLDivElement>(null);
  const motor = useRef<Motor | null>(null);
  const [fallo, setFallo] = useState(false);
  const [generacion, setGeneracion] = useState(0);
  // Vecina oculta: la escena se crea con la sala quieta (o en cuanto deja de estar oculta).
  const [aplazado, setAplazado] = useState(rol === 'oculta' && !esRevision);
  useEffect(() => {
    if (!aplazado) return;
    if (rol !== 'oculta') {
      setAplazado(false);
      return;
    }
    let cancelarLibre = () => {};
    const espera = window.setTimeout(() => {
      cancelarLibre = cuandoLibre(() => setAplazado(false), 2000);
    }, ESPERA_VECINA_MS);
    return () => {
      window.clearTimeout(espera);
      cancelarLibre();
    };
  }, [aplazado, rol]);
  /** Lleva lienzo (marcado): mientras está aplazado se ve el póster y la capa no cuenta como lista. */
  const conGL = modo !== 'miniatura' && !fallo;
  const usarGL = conGL && !aplazado;
  // Con la pantalla en negro o la cuadrícula encima nadie la ve: se para como fuera de su diapositiva.
  const enMarcha = usarGL && activa && visible && !pausada && rol === 'actual' && modo === 'escenario' && !esRevision;

  // Crear y destruir el contexto. El canvas se crea aquí mismo para que cada
  // montaje tenga uno nuevo (un canvas cuyo contexto se liberó no se reutiliza).
  useEffect(() => {
    const contenedor = caja.current;
    const marco = exterior.current;
    if (!usarGL || !contenedor || !marco) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'lienzo-ogl__canvas';
    contenedor.appendChild(canvas);
    if (!crearContexto(canvas)) {
      canvas.remove();
      registrarProblema(AVISO_SIN_WEBGL);
      setFallo(true);
      return;
    }
    let renderer: Renderer;
    let escena: EscenaOGL;
    try {
      renderer = new Renderer({ canvas, dpr: 1, ...ATRIBUTOS });
      escena = crear({ renderer, gl: renderer.gl, canvas });
    } catch (error) {
      canvas.remove();
      registrarProblema(
        `La escena WebGL de «${id}» falló al crearse; se muestra su póster. Detalle para quien la programó: ${(error as Error).message}`,
      );
      setFallo(true);
      return;
    }
    /**
     * El contexto se perdió en algún momento. Los programas y búferes de esta
     * escena murieron con él: no se vuelve a pintar con ella (aunque el
     * navegador ya haya devuelto el contexto) ni se borran sus objetos.
     */
    let perdido = false;
    const m: Motor = {
      renderer,
      escena,
      tiempo: esRevision ? tiempoRevision : 0,
      corriendo: false,
      pintar: (delta = 0) => {
        if (perdido || renderer.gl.isContextLost()) return;
        escena.dibujar(m.tiempo, delta);
        cuadrosOGL[id] = (cuadrosOGL[id] ?? 0) + 1;
      },
    };
    motor.current = m;
    let vivo = true;
    const marcarListo = () => {
      if (!vivo) return;
      // Primero el fotograma completo y después se muestra: el primer cuadro visible ya lleva las texturas.
      m.pintar();
      marco.dataset.listo = '';
    };
    void Promise.resolve(escena.listo).then(marcarListo, marcarListo);

    const alPerder = (e: Event) => {
      // preventDefault: le dice al navegador que queremos recuperarlo (si no, nunca lo devuelve).
      e.preventDefault();
      perdido = true;
      marco.dataset.perdido = '';
      registrarProblema(`Se perdió el contexto WebGL en «${id}»; se muestra el póster mientras se intenta recuperar.`);
    };
    const alRecuperar = () => setGeneracion((g) => g + 1);
    canvas.addEventListener('webglcontextlost', alPerder);
    canvas.addEventListener('webglcontextrestored', alRecuperar);

    return () => {
      vivo = false;
      canvas.removeEventListener('webglcontextlost', alPerder);
      canvas.removeEventListener('webglcontextrestored', alRecuperar);
      // Tras una pérdida, los búferes y programas murieron con el contexto viejo:
      // borrarlos ahora solo produce avisos «object does not belong to this context».
      if (!perdido) {
        try {
          escena.destruir?.();
        } catch {
          /* nada que liberar */
        }
      }
      if (!renderer.gl.isContextLost()) renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      delete marco.dataset.listo;
      delete marco.dataset.perdido;
      motor.current = null;
    };
  }, [crear, usarGL, generacion, id, tiempoRevision]);

  // Tamaño del búfer = píxeles reales en pantalla.
  useEffect(() => {
    const contenedor = caja.current;
    const m = motor.current;
    if (!usarGL || !contenedor || !m) return;
    let densidadAplicada = 0;
    const aplicar = () => {
      const ancho = contenedor.clientWidth;
      const alto = contenedor.clientHeight;
      if (!ancho || !alto) return;
      densidadAplicada = window.devicePixelRatio || 1;
      let dpr = Math.min(window.devicePixelRatio || 1, 2) * escala * calidad;
      if (ancho * alto * dpr * dpr > PIXELES_MAXIMOS) dpr = Math.sqrt(PIXELES_MAXIMOS / (ancho * alto));
      m.renderer.dpr = dpr;
      m.renderer.setSize(ancho, alto);
      m.escena.redimensionar?.(ancho, alto);
      if (!m.corriendo) m.pintar();
    };
    aplicar();
    const observador = new ResizeObserver(aplicar);
    observador.observe(contenedor);
    window.addEventListener('resize', aplicar);
    // Si solo cambia la densidad de píxeles (la ventana pasa del portátil al 150 % a un
    // proyector al 100 %, con el mismo tamaño lógico), no hay resize ni cambia la caja:
    // se vigila con una consulta de resolución, que se renueva con cada cambio, y, por si
    // el navegador no la avisa (con la densidad emulada por CDP no lo hace), mirando la
    // densidad una vez por segundo (leer un número: no cuesta nada).
    let consulta: MediaQueryList | null = null;
    const alCambiarDensidad = () => {
      aplicar();
      vigilarDensidad();
    };
    const vigilarDensidad = () => {
      consulta?.removeEventListener('change', alCambiarDensidad);
      consulta = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      consulta.addEventListener('change', alCambiarDensidad);
    };
    vigilarDensidad();
    const revision = window.setInterval(() => {
      if ((window.devicePixelRatio || 1) !== densidadAplicada) alCambiarDensidad();
    }, 1000);
    return () => {
      observador.disconnect();
      window.removeEventListener('resize', aplicar);
      consulta?.removeEventListener('change', alCambiarDensidad);
      window.clearInterval(revision);
    };
  }, [escala, calidad, usarGL, generacion]);

  // Bucle: solo con la diapositiva en pantalla. Fuera, congelado.
  useEffect(() => {
    const m = motor.current;
    if (!m) return;
    if (!enMarcha) {
      m.pintar();
      return;
    }
    let ultimo = performance.now();
    let raf = 0;
    const bucle = (ahora: number) => {
      // Tope al delta: al volver de una pestaña oculta no se salta la animación.
      const delta = Math.min((ahora - ultimo) / 1000, 1 / 15);
      ultimo = ahora;
      m.tiempo += delta;
      m.pintar(delta);
      raf = requestAnimationFrame(bucle);
    };
    m.corriendo = true;
    raf = requestAnimationFrame(bucle);
    return () => {
      m.corriendo = false;
      cancelAnimationFrame(raf);
    };
  }, [enMarcha, generacion, usarGL]);

  const clase = className ? `lienzo-ogl ${className}` : 'lienzo-ogl';
  const respaldo = poster ? (
    <img className="lienzo-ogl__poster" src={medio(poster)} alt="" decoding="async" draggable={false} />
  ) : (
    <div className="lienzo-ogl__sustituto" />
  );
  if (!conGL) {
    return (
      <div className={clase} style={style} data-ogl="" data-listo="" data-sin-gl="">
        {respaldo}
      </div>
    );
  }
  // El póster queda debajo del lienzo; el CSS lo muestra mientras la escena carga o si se pierde el contexto.
  return (
    <div ref={exterior} className={clase} style={style} data-ogl="">
      {respaldo}
      <div ref={caja} className="lienzo-ogl__gl" />
    </div>
  );
}
