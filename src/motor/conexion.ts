/**
 * Latidos entre ventanas: cada ventana avisa cada 2 s de que sigue abierta, y
 * se despide al cerrarse. El presentador lo usa para mostrar si la sala está
 * conectada (si no lo está, avanzar desde el presentador no movería la
 * pantalla del público) y la sala, para no abrir dos presentadores.
 */
import { useEffect, useState } from 'react';
import { enviar, escuchar, type RolVentana, type Sobre } from './canal';

type MensajeLatido = { tipo: 'latido' } | { tipo: 'adios' };

/** Una ventana que lleva este tiempo callada se da por cerrada. */
const SIN_SENAL_MS = 5000;

/**
 * Última señal de cada ventana, por su id (no por rol): puede haber dos salas
 * (otro doble clic en index.html) o dos presentadores, y el «adiós» de una no
 * debe dar por cerradas a las demás de su mismo rol.
 */
const senales = new Map<string, { rol: RolVentana; t: number }>();
let intervalo: number | null = null;

// Cualquier mensaje (latido, estado, cronómetro) cuenta como señal de vida.
escuchar((mensaje, sobre: Sobre) => {
  const ahora = Date.now();
  if ((mensaje as MensajeLatido)?.tipo === 'adios') senales.delete(sobre.origen);
  else senales.set(sobre.origen, { rol: sobre.rol, t: ahora });
  // Las ventanas que se cerraron sin despedirse (o se recargaron) no se acumulan.
  for (const [origen, s] of senales) if (ahora - s.t > 60_000) senales.delete(origen);
});

export function empezarLatidos() {
  if (intervalo !== null) return;
  const latir = () => enviar({ tipo: 'latido' } satisfies MensajeLatido);
  latir();
  intervalo = window.setInterval(latir, 2000);
  window.addEventListener('pagehide', () => enviar({ tipo: 'adios' } satisfies MensajeLatido));
}

/** ¿Hay otra ventana con ese rol que haya dado señales en los últimos 5 s? */
export function hayVentana(rol: RolVentana): boolean {
  return Date.now() - ultimaSenal(rol) < SIN_SENAL_MS;
}

/** Date.now() del último mensaje recibido de alguna ventana con ese rol (0 si ninguna sigue abierta). */
export function ultimaSenal(rol: RolVentana): number {
  let ultima = 0;
  for (const s of senales.values()) if (s.rol === rol && s.t > ultima) ultima = s.t;
  return ultima;
}

/** ¿Sigue abierta la ventana con ese id (dio señales hace poco y no se despidió)? */
export function ventanaAbierta(origen: string): boolean {
  const s = senales.get(origen);
  return !!s && Date.now() - s.t < SIN_SENAL_MS;
}

/** La sala pide al presentador que ya está abierto que se muestre (P con un presentador abierto). */
export type MensajeMostrarPresentador = { tipo: 'mostrar-presentador' };

/**
 * En el presentador: al pedirlo la sala, contesta enseguida (así la sala sabe
 * que sigue vivo y no abre otro), intenta ponerse delante y avisa
 * (`alMostrar`) para destacar la ventana un momento.
 */
export function useMostrarPresentador(alMostrar: () => void) {
  useEffect(
    () =>
      escuchar((mensaje) => {
        if ((mensaje as MensajeMostrarPresentador)?.tipo !== 'mostrar-presentador') return;
        enviar({ tipo: 'latido' } satisfies MensajeLatido);
        try {
          window.focus();
        } catch {
          /* el sistema no deja traer la ventana al frente */
        }
        alMostrar();
      }),
    [alMostrar],
  );
}

export function useConectado(rol: RolVentana): boolean {
  const [conectado, setConectado] = useState(false);
  useEffect(() => {
    const revisar = () => setConectado(hayVentana(rol));
    revisar();
    const id = window.setInterval(revisar, 1000);
    return () => window.clearInterval(id);
  }, [rol]);
  return conectado;
}
