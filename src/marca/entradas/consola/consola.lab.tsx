/**
 * Laboratorio de Z-06 · Consola (consola.entrada.ts, Consola.tsx).
 *
 * El contenido es el de la web tal cual: la consola de «Desarrollo de
 * software» con la opción «app» (capabilities-section.tsx:76 y 143), la misma vuelta
 * que se midió en investigacion/movimiento/06b-servicios-consola.png y
 * 06c-servicios-consola-recorte.png («Desarrollo de software → «app»»), para
 * comparar cuadro a cuadro con el mismo texto. Las diapositivas ponen el suyo.
 *
 * Paso 1: el comando se teclea en 1 s (24 saltos); las cuatro líneas a 1,1 ·
 * 1,5 · 1,9 · 2,3 s; el resultado a 2,9 s; el cursor a 3,3 s. Quieta a 3,55 s.
 */
import { definirPieza } from '../../../motor/laboratorio/tipos';
import { Dividida } from '../../composiciones';
import { Consola } from './Consola';

function Escena() {
  return (
    <Dividida
      titular="La consola de la web, con sus tiempos"
      evidencia={
        <Consola
          desde={1}
          barra="zhonyas / software"
          comando="zhonyas explore --app"
          lineas={['Entender a los usuarios', 'Diseñar los flujos', 'Conectar los datos', 'Probar las funciones']}
          resultado="Cuéntanos tu idea y definimos el alcance."
        />
      }
    />
  );
}

export default definirPieza({
  titulo: 'Z-06 · Consola',
  movimiento: 'Z-06',
  notas:
    'Comparar con investigacion/movimiento/06c-servicios-consola-recorte.png (medido: tecleo hasta 1119 ms; líneas 1250, 1618, 2067, 2417; ' +
    'resultado 3033; cursor 3417, todo ~120 ms tarde por el montaje de React). Código: service-terminal.tsx:31-41, capabilities-section.css:70-74.',
  pasos: 1,
  Componente: Escena,
});
