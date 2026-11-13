/**
 * PRUEBA del motor: lienzo WebGL (OGL) que se pausa al salir. Se borra cuando haya diapositivas reales.
 */
import { useEffect, useState } from 'react';
import { Mesh, Program, Texture, Triangle } from 'ogl';
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { useDiapositiva } from '../motor/contexto';
import { Entrada } from '../motor/Entrada';
import { cuadrosOGL, LienzoOGL, type CrearEscenaOGL } from '../motor/LienzoOGL';
// Importada desde src/: el build la incrusta en el HTML (en file:// WebGL no acepta imágenes sueltas).
import urlTextura from './recursos/textura-prueba.png';
import './prueba.css';

const vertice = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmento = /* glsl */ `
  precision highp float;
  uniform float uTiempo;
  uniform float uAspecto;
  uniform sampler2D uTextura;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspecto, 1.0);
    float r = length(p);
    float a = atan(p.y, p.x);
    // Túnel: la textura se repite a lo largo del radio y gira con el tiempo.
    vec2 t = vec2(a / 6.28318 * 4.0 + uTiempo * 0.05, 0.35 / max(r, 0.02) + uTiempo * 0.35);
    vec3 color = texture2D(uTextura, fract(t)).rgb;
    vec3 tinte = mix(vec3(0.10, 0.25, 0.55), vec3(0.55, 0.15, 0.45), 0.5 + 0.5 * sin(uTiempo * 0.4 + a));
    color = mix(tinte, color * tinte * 2.2, 0.55);
    color *= smoothstep(0.0, 0.55, r);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Definida fuera del componente: LienzoOGL necesita una función estable. */
const crearEscena: CrearEscenaOGL = ({ renderer, gl }) => {
  gl.clearColor(0.004, 0.008, 0.016, 1);
  const geometria = new Triangle(gl);
  const textura = new Texture(gl, { generateMipmaps: false });
  const imagen = new Image();
  const listo = new Promise<void>((resolver, rechazar) => {
    imagen.onload = () => {
      textura.image = imagen;
      resolver();
    };
    imagen.onerror = () => rechazar(new Error('textura de prueba'));
  });
  imagen.src = urlTextura;
  const programa = new Program(gl, {
    vertex: vertice,
    fragment: fragmento,
    uniforms: {
      uTiempo: { value: 0 },
      uAspecto: { value: 16 / 9 },
      uTextura: { value: textura },
    },
  });
  const malla = new Mesh(gl, { geometry: geometria, program: programa });
  return {
    listo,
    dibujar: (tiempo) => {
      programa.uniforms.uTiempo.value = tiempo;
      renderer.render({ scene: malla });
    },
    redimensionar: (ancho, alto) => {
      programa.uniforms.uAspecto.value = ancho / alto;
    },
    destruir: () => {
      geometria.remove();
      programa.remove();
    },
  };
};

/** Contador visible de fotogramas: demuestra que el lienzo se detiene al salir. */
function Contador() {
  const { id, activa } = useDiapositiva();
  const [cuadros, setCuadros] = useState(0);
  useEffect(() => {
    setCuadros(cuadrosOGL[id] ?? 0);
    if (!activa) return;
    const intervalo = window.setInterval(() => setCuadros(cuadrosOGL[id] ?? 0), 250);
    return () => window.clearInterval(intervalo);
  }, [id, activa]);
  return <p className="prueba-webgl__contador">Fotogramas pintados: {cuadros}</p>;
}

function PruebaWebgl({ paso }: PropsDiapositiva) {
  return (
    <>
      <LienzoOGL
        className="prueba-webgl__lienzo"
        crear={crearEscena}
        poster="medios/prueba/webgl-poster.webp"
        tiempoRevision={2.4}
      />
      <span className="prueba__sello" style={{ position: 'absolute' }}>
        PRUEBA
      </span>
      <div className="prueba-webgl__texto">
        <h1 className="prueba__titulo">WebGL que se pausa</h1>
        <Entrada desde={1}>
          <p className="prueba__bajada">Paso {paso}: el contador deja de subir cuando sales de esta diapositiva.</p>
        </Entrada>
        <Contador />
      </div>
    </>
  );
}

export default definirDiapositiva({
  id: 'prueba-webgl',
  titulo: 'PRUEBA · WebGL',
  pasos: 1,
  orador: 'orador2',
  duracion: 35,
  notas: `
    Prueba de **WebGL con OGL** (Orador 2).

    El túnel solo se anima mientras esta diapositiva está en pantalla. En la
    cuadrícula y en la vista previa se ve el póster o un fotograma fijo.
  `,
  medios: ['medios/prueba/webgl-poster.webp'],
  Componente: PruebaWebgl,
});
