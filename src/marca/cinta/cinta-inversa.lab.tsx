/**
 * Z-02 al revés: la cinta se vuelve a enrollar en la Z y vuelven la H y el
 * nombre. Es el «Inicio» del menú de la web desde «Nosotros»: 1,05 s con
 * easeOutExpo (navbar.tsx:76-81; 03 M14).
 */
import { definirPieza } from '../../motor/laboratorio/tipos';
import { LogoCinta } from './LogoCinta';

function Escena() {
  return <LogoCinta desde={1} sentido="cinta-a-logo" />;
}

export default definirPieza({
  titulo: 'Z-02 al revés · cinta → logo (1,05 s, «Inicio» del menú)',
  movimiento: 'Z-02',
  notas:
    'Paso 0: la cinta a la derecha, quieta (recorte de un solo trazado). Paso 1: vuelve al centro, la cinta se enrolla en la Z (máscara) y la H y el nombre se encienden; al llegar a 0, la sombra y la veta vuelven.',
  pasos: 1,
  Componente: Escena,
});
