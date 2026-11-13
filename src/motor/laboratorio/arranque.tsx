/**
 * Arranque del laboratorio (lab.html). El reloj va PRIMERO: tiene que
 * envolver requestAnimationFrame, performance.now y Date.now antes de que
 * GSAP, OGL o React los guarden.
 */
import './reloj';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../estilos/fuentes.css';
import '../../estilos/marca.css';
import '../../estilos/base.css';
import '../../estilos/motor.css';
import './laboratorio.css';
import '../registroMarca';
import { aplicarModoRevision } from '../revision';
import { Laboratorio } from './Laboratorio';

document.title = 'Laboratorio · Zhonyas';
document.documentElement.classList.add('modo-laboratorio');
aplicarModoRevision();

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <Laboratorio />
  </StrictMode>,
);
