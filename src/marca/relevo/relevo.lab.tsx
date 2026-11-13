/**
 * Laboratorio de Z-05 · Relevo de orador: una escena por orador, cada una con
 * dos pasos (0: las tarjetas; 1: la foto vuela, entra el nombre y saluda).
 *
 * Posiciones del laboratorio: 0–1 José, 2–3 Gregory, 4–5 Angel.
 *   npm run lab:cuadros -- --pieza relevo --paso 1 --cada 33 --hasta 1000
 * José es el que midió la web (su tarjeta es la primera, en 220 · 310,25):
 * comparar con investigacion/movimiento/05-equipo-perfil-personaje.png.
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { Relevo } from './Relevo';

function RelevoJose() {
  return <Relevo orador="jose" />;
}

function RelevoGregory() {
  return <Relevo orador="gregory" />;
}

function RelevoAngel() {
  return <Relevo orador="angel" />;
}

export default definirPieza({
  titulo: 'Z-05 · Relevo de orador',
  movimiento: 'Z-05',
  notas:
    'Paso 1 (José), 3 (Gregory) y 5 (Angel): la foto vuela de su tarjeta al retrato en 700 ms, el texto entra a los 180 ms y el personaje a los 500 ms, saludando cada 167 ms. ' +
    'Comparar con investigacion/movimiento/05-equipo-perfil-personaje.png (clic +50, +166, +266, +400, +550, +700, +900 ms).',
  escenas: [
    { id: 'relevo-jose', pasos: 1, Componente: RelevoJose },
    { id: 'relevo-gregory', pasos: 1, Componente: RelevoGregory },
    { id: 'relevo-angel', pasos: 1, Componente: RelevoAngel },
  ],
});
