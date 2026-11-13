/**
 * ¿Está la ventana del presentador en la pantalla del público?
 *
 * Chrome y Edge abren una ventana emergente en la pantalla de la ventana que
 * la abre, y sin el permiso de gestión de ventanas no dejan ponerla en otra.
 * Si el presentador se cierra a mitad de charla y se vuelve a abrir con P
 * desde la sala (que está a pantalla completa en el proyector), la ventana
 * nueva sale en el proyector, encima de la sala: el público vería las notas,
 * el cronómetro y la diapositiva siguiente.
 *
 * Para que eso no pase, la sala cuenta en qué pantalla está y si está a
 * pantalla completa, y el presentador compara con la suya. Si está en la misma
 * pantalla que una sala a pantalla completa, y el equipo tiene más de una
 * pantalla, el presentador se pone «de cortina»: enseña solo lo mismo que la
 * sala (la diapositiva en vivo, o negro) y una franja discreta para llevarlo a
 * la pantalla propia (Win + Mayús + ← o →). Al llegar a otra pantalla vuelve a
 * ser el presentador de siempre.
 *
 * Con una sola pantalla (un ensayo en el portátil, o el proyector en modo
 * Duplicar) no hay pantalla del público aparte y el presentador nunca se tapa.
 */
import { useEffect, useState } from 'react';
import { enviar, escuchar } from './canal';
import { ventanaAbierta } from './conexion';

/** Una pantalla, como la ve cada ventana (en píxeles lógicos del sistema). */
export interface Pantalla {
  izquierda: number;
  arriba: number;
  ancho: number;
  alto: number;
}

interface DatosSala {
  pantallaCompleta: boolean;
  pantalla: Pantalla;
}

type MensajePantalla = ({ tipo: 'pantalla-sala' } & DatosSala) | { tipo: 'hola' };

type PantallaExtendida = Screen & { availLeft?: number; availTop?: number; isExtended?: boolean };

/** La pantalla en la que está esta ventana. */
export function pantallaPropia(): Pantalla {
  const s = screen as PantallaExtendida;
  return { izquierda: s.availLeft ?? 0, arriba: s.availTop ?? 0, ancho: s.width, alto: s.height };
}

function mismaPantalla(a: Pantalla, b: Pantalla): boolean {
  return a.izquierda === b.izquierda && a.arriba === b.arriba && a.ancho === b.ancho && a.alto === b.alto;
}

/** false solo si el navegador sabe que hay una única pantalla (sin el dato, se supone que puede haber varias). */
function variasPantallas(): boolean {
  return (screen as PantallaExtendida).isExtended !== false;
}

// ——— En la sala ———

function datosSala(): DatosSala {
  return { pantallaCompleta: !!document.fullscreenElement, pantalla: pantallaPropia() };
}

/**
 * Para la dirección del presentador que se abre con P: la pantalla de la sala,
 * si está a pantalla completa. Así el presentador sabe desde su primer
 * fotograma si ha caído encima de la sala, sin esperar al primer mensaje.
 */
export function parametroSala(): string | null {
  if (!document.fullscreenElement) return null;
  const p = pantallaPropia();
  return [p.izquierda, p.arriba, p.ancho, p.alto].join(',');
}

/** Lo instala la sala una vez. Devuelve la función para desinstalarlo. */
export function instalarPantallaSala(): () => void {
  let contado = '';
  const contar = (forzar = false) => {
    const datos = datosSala();
    const clave = JSON.stringify(datos);
    if (!forzar && clave === contado) return;
    contado = clave;
    enviar({ tipo: 'pantalla-sala', ...datos } satisfies MensajePantalla);
  };
  contar(true);
  const alCambiar = () => contar();
  document.addEventListener('fullscreenchange', alCambiar);
  window.addEventListener('resize', alCambiar);
  // Pasar la ventana a otra pantalla con la misma escala no dispara ningún evento.
  const vigilancia = window.setInterval(alCambiar, 1000);
  const quitarCanal = escuchar((mensaje) => {
    if ((mensaje as MensajePantalla)?.tipo === 'hola') contar(true);
  });
  return () => {
    document.removeEventListener('fullscreenchange', alCambiar);
    window.removeEventListener('resize', alCambiar);
    window.clearInterval(vigilancia);
    quitarCanal();
  };
}

// ——— En el presentador ———

/** Lo último que contó cada sala abierta. */
const salas = new Map<string, DatosSala>();

/**
 * Lo que dijo la URL al abrir (antes de que hable la sala). Se descarta con el
 * primer mensaje de verdad o a los pocos segundos, y se quita de la dirección
 * para que una recarga no lo vuelva a usar.
 */
const DESDE_URL = 'url';
const VALE_LA_URL_MS = 5000;
{
  const parametros = new URLSearchParams(location.search);
  const n = parametros.get('sala')?.split(',').map(Number) ?? [];
  if (n.length === 4 && n.every(Number.isFinite)) {
    salas.set(DESDE_URL, {
      pantallaCompleta: true,
      pantalla: { izquierda: n[0], arriba: n[1], ancho: n[2], alto: n[3] },
    });
  }
  if (parametros.has('sala')) {
    parametros.delete('sala');
    const busqueda = parametros.toString();
    try {
      history.replaceState(history.state, '', `${location.pathname}${busqueda ? `?${busqueda}` : ''}${location.hash}`);
    } catch {
      /* no es grave */
    }
  }
}

escuchar((mensaje, sobre) => {
  const m = mensaje as MensajePantalla;
  if (sobre.rol !== 'sala' || m?.tipo !== 'pantalla-sala' || !m.pantalla) return;
  salas.delete(DESDE_URL);
  salas.set(sobre.origen, { pantallaCompleta: !!m.pantallaCompleta, pantalla: m.pantalla });
});

/** «Usarla aquí»: quien presenta decidió usar el presentador en esta pantalla. */
let aceptadaAqui = false;

function tapaAlPublico(): boolean {
  if (aceptadaAqui || !variasPantallas()) return false;
  const propia = pantallaPropia();
  let tapa = false;
  for (const [origen, datos] of salas) {
    const vigente = origen === DESDE_URL ? performance.now() < VALE_LA_URL_MS : ventanaAbierta(origen);
    if (!vigente) {
      salas.delete(origen);
      continue;
    }
    if (datos.pantallaCompleta && mismaPantalla(datos.pantalla, propia)) tapa = true;
  }
  return tapa;
}

/**
 * En el presentador: ¿está esta ventana en la pantalla del público, encima de
 * una sala a pantalla completa? Se revisa dos veces por segundo (mover una
 * ventana de pantalla no siempre dispara eventos) y con cada mensaje de la sala.
 */
export function useEnPantallaDelPublico(): [boolean, () => void] {
  const [tapa, setTapa] = useState(tapaAlPublico);
  useEffect(() => {
    const revisar = () => setTapa(tapaAlPublico());
    revisar();
    const id = window.setInterval(revisar, 500);
    window.addEventListener('resize', revisar);
    const quitarCanal = escuchar((mensaje) => {
      if ((mensaje as MensajePantalla)?.tipo === 'pantalla-sala') revisar();
    });
    return () => {
      window.clearInterval(id);
      window.removeEventListener('resize', revisar);
      quitarCanal();
    };
  }, []);
  const usarAqui = () => {
    aceptadaAqui = true;
    setTapa(false);
  };
  return [tapa, usarAqui];
}
