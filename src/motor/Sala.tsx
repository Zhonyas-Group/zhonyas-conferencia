/**
 * Ventana de la sala: lo que ve el público en el proyector.
 */
import { useEffect, type MouseEvent } from 'react';
import { diapositivas } from '../diapositivas/indice';
import { configuracion } from '../configuracion';
import { Ayuda } from './Ayuda';
import { instalarCapasSala } from './capasSala';
import { enviar } from './canal';
import { hayVentana, ultimaSenal, type MensajeMostrarPresentador } from './conexion';
import { Cuadricula } from './Cuadricula';
import { useProblemas } from './diagnostico';
import { esRevision } from './entorno';
import { Escenario } from './Escenario';
import { avanzar, total, useNavegacion } from './estado';
import { useInterfaz } from './interfaz';
import { instalarPantallaSala, parametroSala } from './pantallas';
import { Secuencia } from './Secuencia';
import { instalarTeclado } from './teclado';
import { useTituloVentana } from './utilidades';

let ultimaApertura = 0;

/** Lo que se espera a que conteste un presentador que parece abierto (cabe en el margen que da una tecla para window.open). */
const ESPERA_RESPUESTA_PRESENTADOR = 700;

/**
 * Abre la ventana del presentador. Con «noopener» Chrome le da un proceso
 * propio: lo que pinte el presentador no le quita cuadros a la proyección.
 * Las ventanas se hablan por BroadcastChannel / localStorage (canal.ts).
 */
export function abrirPresentador() {
  // Evita abrir dos por una doble pulsación (el presentador tarda en dar su primer latido).
  if (Date.now() - ultimaApertura < 3000) return;
  // Parece que ya hay un presentador: no se abre otro. Se le pide que se ponga
  // delante (si el sistema lo permite) y que destaque para encontrarlo. Si no
  // contesta enseguida (se cerró sin despedirse o está colgado), se abre uno nuevo.
  if (hayVentana('presentador')) {
    const pedido = Date.now();
    enviar({ tipo: 'mostrar-presentador' } satisfies MensajeMostrarPresentador);
    window.setTimeout(() => {
      if (ultimaSenal('presentador') < pedido) abrirVentanaPresentador();
    }, ESPERA_RESPUESTA_PRESENTADOR);
    return;
  }
  abrirVentanaPresentador();
}

function abrirVentanaPresentador() {
  if (Date.now() - ultimaApertura < 3000) return;
  ultimaApertura = Date.now();
  const url = new URL(location.href);
  url.searchParams.set('presentador', '1');
  url.searchParams.delete('revision');
  // Con la sala a pantalla completa (en el proyector), la ventana nueva cae en su misma
  // pantalla: el presentador lo sabe desde el primer fotograma y no enseña las notas (pantallas.ts).
  const sala = parametroSala();
  if (sala) url.searchParams.set('sala', sala);
  window.open(url.toString(), '_blank', 'noopener,popup,width=1366,height=820');
}

/**
 * El primer clic en la sala cuando no tenía el foco (estaba en el presentador)
 * solo la enfoca, no avanza: para pulsar una tecla en la sala hay que hacer
 * clic en ella, y ese clic movía la diapositiva delante del público. Cuenta
 * como «de enfoque» un clic que empieza:
 *   - sin foco;
 *   - justo después de recibirlo (al hacer clic en una ventana de atrás,
 *     Windows la activa antes de entregar el clic);
 *   - o el primero desde que la sala perdió el foco, si no ha llegado el aviso
 *     de foco ni se ha pulsado una tecla en ella (Chrome no siempre avisa).
 */
const MARGEN_CLIC_DE_ENFOQUE_MS = 400;
let enfocadaEn = -Infinity;
let perdioElFoco = false;
let clicDeEnfoque = false;
window.addEventListener('blur', () => {
  perdioElFoco = true;
});
window.addEventListener('focus', () => {
  enfocadaEn = performance.now();
  perdioElFoco = false;
});
window.addEventListener(
  'keydown',
  () => {
    perdioElFoco = false;
  },
  { capture: true },
);
window.addEventListener(
  'pointerdown',
  () => {
    const conFoco = document.hasFocus();
    clicDeEnfoque = !conFoco || perdioElFoco || performance.now() - enfocadaEn < MARGEN_CLIC_DE_ENFOQUE_MS;
    // Hasta que la sala tenga el foco de verdad, el siguiente clic también es «de enfoque».
    if (conFoco) perdioElFoco = false;
  },
  { capture: true },
);

/** El puntero del ratón desaparece tras 2,5 s quieto. */
function useCursorOculto() {
  useEffect(() => {
    let temporizador = 0;
    const mostrar = () => {
      document.body.classList.remove('cursor-oculto');
      window.clearTimeout(temporizador);
      temporizador = window.setTimeout(() => document.body.classList.add('cursor-oculto'), 2500);
    };
    mostrar();
    window.addEventListener('mousemove', mostrar);
    return () => {
      window.removeEventListener('mousemove', mostrar);
      window.clearTimeout(temporizador);
      document.body.classList.remove('cursor-oculto');
    };
  }, []);
}

/** Que la pantalla no se apague ni se bloquee en mitad de la charla (Screen Wake Lock). */
function useSinSuspender() {
  useEffect(() => {
    let bloqueo: WakeLockSentinel | null = null;
    const pedir = async () => {
      if (document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
      try {
        bloqueo = await navigator.wakeLock.request('screen');
      } catch {
        /* sin permiso: no es grave */
      }
    };
    void pedir();
    const alCambiar = () => {
      if (document.visibilityState === 'visible' && (!bloqueo || bloqueo.released)) void pedir();
    };
    document.addEventListener('visibilitychange', alCambiar);
    window.addEventListener('pointerdown', alCambiar);
    window.addEventListener('keydown', alCambiar);
    return () => {
      document.removeEventListener('visibilitychange', alCambiar);
      window.removeEventListener('pointerdown', alCambiar);
      window.removeEventListener('keydown', alCambiar);
      void bloqueo?.release().catch(() => {});
    };
  }, []);
}

function esInteractivo(objetivo: EventTarget | null): boolean {
  return objetivo instanceof Element && !!objetivo.closest('a, button, input, select, textarea, [data-sin-clic]');
}

export function Sala() {
  const nav = useNavegacion();
  const ui = useInterfaz();
  const problemas = useProblemas();
  const d = diapositivas[nav.indice];

  useEffect(() => instalarTeclado({ abrirPresentador }), []);
  useEffect(() => instalarCapasSala(), []);
  useEffect(() => instalarPantallaSala(), []);
  useCursorOculto();
  useSinSuspender();
  useTituloVentana(`${nav.indice + 1}/${total} · ${configuracion.titulo}`);

  const alClic = (e: MouseEvent) => {
    if (e.button !== 0 || esInteractivo(e.target)) return;
    if (clicDeEnfoque) {
      clicDeEnfoque = false;
      return;
    }
    if (window.getSelection()?.toString()) return;
    avanzar();
  };

  return (
    <div className="sala" onClick={alClic} style={{ background: d.fondo ?? undefined }}>
      <Escenario fondo={d.fondo}>
        {/* Con la pantalla en negro o la cuadrícula encima nadie ve la diapositiva: video y WebGL se paran. */}
        <Secuencia indice={nav.indice} paso={nav.paso} direccion={nav.direccion} pausada={nav.negro || ui.cuadricula} />
      </Escenario>
      <div className="negro" data-activo={nav.negro ? '' : undefined} aria-hidden />
      {ui.numero && (
        <div className="salto" aria-live="polite">
          Ir a <strong>{ui.numero}</strong>
        </div>
      )}
      {ui.cuadricula && <Cuadricula />}
      {ui.ayuda && <Ayuda />}
      {import.meta.env.DEV && !esRevision && problemas.length > 0 && (
        <div className="avisos-dev" data-sin-clic>
          {problemas.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
