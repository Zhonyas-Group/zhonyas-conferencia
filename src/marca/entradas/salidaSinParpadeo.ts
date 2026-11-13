/**
 * Salida animada sin parpadeo al terminar.
 *
 * Al acabar una salida (`desaparecer`), el motor cancela sus animaciones y
 * después pide a React que ponga `data-oculto` (Entrada.tsx). React lo pinta en
 * una tarea posterior, así que entre una cosa y otra el navegador puede pintar
 * un cuadro con el estado VISIBLE: el detalle que se acaba de cerrar vuelve a
 * verse entero un instante, o la pieza apagada se ve en color.
 *
 * Esto lo evita sin tocar el motor: cuando terminan todas las animaciones,
 * pone `data-oculto` en la misma tarea, antes de que el motor las cancele. El
 * estado final de la salida y el estado oculto del CSS son el mismo, así que
 * no cambia nada en pantalla. Devuelve un objeto con la forma de una línea de
 * tiempo de GSAP (`then`, `progress`, `kill`), que el motor ya sabe controlar
 * (transiciones.ts, `controlar`): `progress(1)` lleva la salida a su final y
 * `kill()` la cancela. Si el motor la corta antes de que termine (al retroceder
 * a mitad, al cambiar de diapositiva), no pone nada: manda React.
 */
export function terminarSinParpadeo(el: HTMLElement, animaciones: readonly Animation[]) {
  let cortada = false;
  const fin = Promise.all(animaciones.map((a) => a.finished.then(() => undefined))).then(
    () => {
      if (!cortada) el.setAttribute('data-oculto', '');
    },
    () => undefined, // cancelada a mitad: nada que hacer
  );
  return {
    then: (seguir: () => void) => fin.then(seguir),
    progress: (valor: number) => {
      if (valor >= 1) for (const a of animaciones) a.finish();
    },
    kill: () => {
      cortada = true;
      for (const a of animaciones) a.cancel();
    },
  };
}
