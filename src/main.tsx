import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './estilos/fuentes.css';
import './estilos/marca.css';
import './estilos/base.css';
import './estilos/motor.css';
// Las entradas con nombre de las piezas de marca (src/marca/**/*.entrada.ts) se registran antes que nada.
import './motor/registroMarca';
import { configuracion } from './configuracion';
import { diapositivas } from './diapositivas/indice';
import { prepararAutomatizacion } from './motor/automatizacion';
import { empezarLatidos } from './motor/conexion';
import { registrarProblema } from './motor/diagnostico';
import { cuandoLibre, esPresentador, esRevision } from './motor/entorno';
import { verificarMedios } from './motor/medios';
import { Presentador } from './motor/Presentador';
import { Sala } from './motor/Sala';
import { validarDiapositivas } from './motor/validacion';

document.title = configuracion.titulo;
document.documentElement.classList.add(esPresentador ? 'modo-presentador' : 'modo-sala');

validarDiapositivas();
prepararAutomatizacion();
if (!esRevision) empezarLatidos();

// Comprobar, sin prisa, que todos los medios declarados (y los pósteres) existen (útil tras copiar al USB).
cuandoLibre(() => {
  const rutas = diapositivas.flatMap((d) => [...(d.medios ?? []), ...(d.poster ? [d.poster] : [])]);
  void verificarMedios(rutas).then((faltan) => {
    for (const ruta of faltan) registrarProblema(`No se encuentra el archivo «${ruta}».`);
  });
}, 2000);

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>{esPresentador ? <Presentador /> : <Sala />}</StrictMode>,
);
