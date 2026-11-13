import { cambiarInterfaz } from './interfaz';

const TECLAS: Array<[string, string]> = [
  ['→  Espacio  AvPág  clic', 'Avanzar (paso y luego diapositiva)'],
  ['←  RePág', 'Retroceder'],
  ['Inicio  /  Fin', 'Primera / última'],
  ['número + Intro', 'Saltar a esa diapositiva'],
  ['G', 'Cuadrícula de diapositivas'],
  ['B  o  .', 'Pantalla en negro'],
  ['T', 'Prueba de sala (tamaños, colores, negros y bordes)'],
  ['L', 'Sala con luz: fuentes, créditos y etiquetas en blanco (se recuerda)'],
  ['F  o  F5', 'Pantalla completa'],
  ['Esc', 'Cerrar esto; sin nada abierto, salir de pantalla completa'],
  ['P', 'Abrir la ventana del presentador'],
  ['H  o  ?', 'Esta ayuda'],
];

export function Ayuda() {
  return (
    <div
      className="ayuda"
      role="dialog"
      aria-label="Atajos de teclado"
      onClick={(e) => {
        e.stopPropagation();
        cambiarInterfaz({ ayuda: false });
      }}
    >
      <dl className="ayuda__lista">
        {TECLAS.map(([tecla, accion]) => (
          <div key={tecla} className="ayuda__fila">
            <dt>{tecla}</dt>
            <dd>{accion}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
