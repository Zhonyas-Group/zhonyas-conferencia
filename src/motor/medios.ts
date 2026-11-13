/**
 * Medios (imágenes, video, fuentes) que viven en public/ y se copian tal cual a dist/.
 *
 * Siempre se piden con rutas RELATIVAS a index.html ('medios/equipo.webp'),
 * porque desde un USB la página se abre como file:///E:/presentacion/index.html
 * y una ruta absoluta ('/medios/…') apuntaría a la raíz del disco.
 */

/** Ruta lista para usar en src: medio('medios/prueba/foto.webp'). */
export function medio(ruta: string): string {
  return `${import.meta.env.BASE_URL}${ruta.replace(/^\.?\/+/, '')}`;
}

const EXT_VIDEO = /\.(mp4|webm|m4v|mov|ogv)(\?.*)?$/i;
const EXT_IMAGEN = /\.(png|jpe?g|webp|avif|gif|svg)(\?.*)?$/i;
const MAX_EN_CACHE = 24;

/** Elementos ya pedidos: mantenerlos vivos evita que el navegador descarte lo decodificado. */
const cache = new Map<string, HTMLImageElement | HTMLVideoElement>();

function recordar(url: string, elemento: HTMLImageElement | HTMLVideoElement) {
  cache.set(url, elemento);
  while (cache.size > MAX_EN_CACHE) {
    const [masViejo, el] = cache.entries().next().value as [string, HTMLImageElement | HTMLVideoElement];
    if (el instanceof HTMLVideoElement) {
      el.removeAttribute('src');
      el.load();
    }
    cache.delete(masViejo);
  }
}

/** Pide y decodifica por adelantado los medios de una diapositiva. */
export function precargar(rutas: readonly string[] | undefined) {
  if (!rutas) return;
  for (const ruta of rutas) {
    const url = medio(ruta);
    if (cache.has(url)) {
      // Refrescar su posición en la cola.
      const el = cache.get(url)!;
      cache.delete(url);
      cache.set(url, el);
      continue;
    }
    if (EXT_VIDEO.test(ruta)) {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = url;
      video.load();
      recordar(url, video);
    } else if (EXT_IMAGEN.test(ruta)) {
      const imagen = new Image();
      imagen.decoding = 'async';
      imagen.src = url;
      imagen.decode().catch(() => {
        /* se informa en verificarMedios */
      });
      recordar(url, imagen);
    }
  }
}

/**
 * Piezas de una capa que todavía no pueden pintarse completas: imágenes sin
 * cargar, videos sin su primer fotograma y lienzos WebGL que no han terminado
 * de cargar su escena (sin `data-listo`).
 *
 * Con `videosConPoster: false` no cuenta los videos que tienen póster (mientras
 * cargan se ve el póster, así que no hace falta esperarlos para mostrarlos).
 */
export function pendientesEnCapa(capa: Element, { videosConPoster = true } = {}): number {
  let pendientes = capa.querySelectorAll('[data-ogl]:not([data-listo])').length;
  for (const img of capa.querySelectorAll('img')) if (!img.complete) pendientes++;
  for (const video of capa.querySelectorAll('video')) {
    if (!videosConPoster && video.poster) continue;
    if (video.readyState < 2 && !video.error) pendientes++;
  }
  return pendientes;
}

/**
 * Cuadros que se dejan pasar, con las imágenes ya decodificadas, para que el
 * compositor reciba la capa y la rasterice antes de enseñarla. Hacen falta
 * dos: uno para que el cambio llegue al compositor y otro para que la capa
 * esté activada (Chrome no hace el siguiente commit hasta activar el anterior).
 */
const CUADROS_DE_PINTADO = 2;

interface Preparacion {
  lista: boolean;
  promesa: Promise<void>;
}

/** Capas montadas y si ya están pintadas (WeakMap: se olvidan solas al desmontarse). */
const preparaciones = new WeakMap<Element, Preparacion>();

function cuadros(n: number): Promise<void> {
  return new Promise((resolver) => {
    const paso = () => (--n <= 0 ? resolver() : requestAnimationFrame(paso));
    requestAnimationFrame(paso);
  });
}

/**
 * Prepara una capa recién montada: decodifica sus imágenes y deja que el
 * navegador la pinte mientras sigue invisible (opacidad casi nula, ver
 * motor.css). Se llama al montar cada capa; repetir la llamada no repite el trabajo.
 *
 * Por qué no basta con img.decode(): Chrome decodifica para decode() a tamaño
 * natural, pero al pintar una foto 4K reducida vuelve a decodificarla a la
 * escala de la pantalla, y si la capa se enseña antes, el primer cuadro sale
 * sin la foto (medido: el título sobre negro y la foto de golpe 50–220 ms
 * después). Por eso, además, se espera a que la capa haya pasado por el
 * compositor ya decodificada.
 */
export function prepararCapa(capa: Element): Promise<void> {
  const existente = preparaciones.get(capa);
  if (existente) return existente.promesa;
  const preparacion: Preparacion = { lista: false, promesa: Promise.resolve() };
  preparacion.promesa = Promise.all(
    [...capa.querySelectorAll('img')].map((img) => img.decode().catch(() => undefined)),
  )
    .then(() => cuadros(CUADROS_DE_PINTADO))
    .then(() => {
      preparacion.lista = true;
    });
  preparaciones.set(capa, preparacion);
  return preparacion.promesa;
}

/**
 * ¿Se puede enseñar ya esta capa sin que asome a medias? Imágenes
 * decodificadas y pintadas (prepararCapa), videos con fotograma y escenas
 * WebGL con sus texturas.
 */
export function capaLista(capa: Element): boolean {
  return !!preparaciones.get(capa)?.lista && pendientesEnCapa(capa, { videosConPoster: false }) === 0;
}

/**
 * Espera (como mucho `limiteMs`) a que una capa esté lista para enseñarse
 * (capaLista). Devuelve una función para cancelar la espera.
 */
export function esperarCapa(capa: Element, limiteMs: number, alTerminar: () => void): () => void {
  let cancelado = false;
  let raf = 0;
  const inicio = performance.now();
  void prepararCapa(capa);
  const revisar = () => {
    if (cancelado) return;
    if (capaLista(capa) || performance.now() - inicio >= limiteMs) {
      alTerminar();
      return;
    }
    raf = requestAnimationFrame(revisar);
  };
  raf = requestAnimationFrame(revisar);
  return () => {
    cancelado = true;
    cancelAnimationFrame(raf);
  };
}

/**
 * Comprueba que existan todos los medios declarados. Devuelve las rutas que
 * fallan (p. ej. una carpeta que no se copió al USB). No usa fetch porque en
 * file:// Chrome lo bloquea; carga cada archivo con su elemento.
 */
export function verificarMedios(rutas: readonly string[]): Promise<string[]> {
  const unicas = [...new Set(rutas)];
  return Promise.all(
    unicas.map(
      (ruta) =>
        new Promise<string | null>((resolver) => {
          const url = medio(ruta);
          const limite = window.setTimeout(() => resolver(null), 8000);
          const ok = () => {
            window.clearTimeout(limite);
            resolver(null);
          };
          const falla = () => {
            window.clearTimeout(limite);
            resolver(ruta);
          };
          if (EXT_VIDEO.test(ruta)) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.onloadedmetadata = () => {
              ok();
              video.removeAttribute('src');
              video.load();
            };
            video.onerror = falla;
            video.src = url;
          } else if (EXT_IMAGEN.test(ruta)) {
            const imagen = new Image();
            imagen.onload = ok;
            imagen.onerror = falla;
            imagen.src = url;
          } else {
            ok();
          }
        }),
    ),
  ).then((resultado) => resultado.filter((r): r is string => r !== null));
}
