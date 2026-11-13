/**
 * Laboratorio de Z-01 · Cifra que entra (cifra.entrada.ts).
 *
 * Paso 0: la retícula vacía. Paso 1: la cifra, su etiqueta y su fuente entran
 * a la vez, fundidas en su sitio en 280 ms con la curva de la marca, como
 * «140B» y «Weekly requests» en Vercel Ship 2025 (05-oficio-conferencias.md:361-391).
 * Mismo efecto y mismo paso: un solo momento (A-54). Va dentro de la
 * composición Una cifra, sin titular (cifra, etiqueta y fuente: tres tamaños, A-49).
 */
import { definirPieza } from '../../../motor/laboratorio/tipos';
import { UnaCifra } from '../../composiciones';

function Escena() {
  return <UnaCifra dato="prestamista-privado" desde={1} etiqueta="de los adultos le pidió prestado a un prestamista privado" />;
}

export default definirPieza({
  titulo: 'Z-01 · Cifra que entra',
  movimiento: 'Z-01',
  notas:
    'Paso 1: fundido en su sitio, 280 ms, cubic-bezier(0.22, 1, 0.36, 1). Opacidad esperada: 0,460 a 33 ms, ' +
    '0,748 a 67 ms, 0,887 a 100 ms, 0,983 a 167 ms y 1 a 280 ms. Vercel (medido): 0,21 · 0,42 · 0,64 · 0,78 · 0,87 · 0,92 · 0,96 · 0,99 por cuadro de 33 ms.',
  pasos: 1,
  Componente: Escena,
});
