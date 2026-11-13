/**
 * Z-02 · Logo → cinta, a la velocidad del menú (la del guion): el salto de
 * «Nosotros» de la web, 1,2 s con easeOutExpo (navbar.tsx:49; smooth-scroll.tsx:6-7),
 * hasta la cinta en +17 vw (reloj.ts, ritmo «menu»: por qué no es el destino del menú).
 *
 * Qué mirar: la H y el nombre se apagan hacia los 33 ms, la Z se vuelve cinta
 * de ~52 a ~241 ms y la cinta se corre de ~302 ms a 1200 ms, frenando. Hoja lado
 * a lado con la web en vivo: verificacion/fidelidad/cinta-menu.png.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { LogoCinta } from './LogoCinta';

function Escena() {
  return <LogoCinta desde={1} />;
}

export default definirPieza({
  titulo: 'Z-02 · Logo → cinta (1,2 s, como el menú)',
  movimiento: 'Z-02',
  notas:
    'Paso 0: el monograma quieto (M1). Paso 1: H y nombre se apagan (smoothstep), la Z se vuelve cinta (quíntica) y la cinta va +17 vw (smoothstep), con el reloj del menú (1,2 s, easeOutExpo). Al terminar, recorte de un solo trazado (PR #1). Comparar con verificacion/fidelidad/cinta-menu.png.',
  pasos: 1,
  Componente: Escena,
});
