/**
 * TRAMPA del auditor anti-slop: una escena por regla, cada una rompiendo a
 * propósito lo que el auditor tiene que encontrar (y solo eso), más una escena
 * limpia que no debe dar nada y una con una excepción declarada.
 *
 *   lab.html?pieza=auditor                          para verlas una a una
 *   node scripts/probar-auditor.mjs                 comprueba que cada escena da exactamente sus reglas
 *   node scripts/auditar.mjs --lab --pieza auditor  el informe de la trampa
 *
 * No es de la charla ni de la marca: no la uses de modelo. La auditoría
 * normal la deja fuera (en el laboratorio y en el código).
 */
import { useId, type ReactElement } from 'react';
import { Dato } from '../../motor/Dato';
import { definirPieza, type EscenaLab } from '../../motor/laboratorio/tipos';
import './trampas.css';

// ——— Código que la auditoría del código tiene que encontrar (A-55) ———

/** Una curva sin fuente. */
export const CURVA_TRAMPA = [0.4, 0, 0.2, 1];

/** Una duración sin fuente en una animación (la otra, con la suya, pasa). */
export function animarTrampa(el: HTMLElement) {
  el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
  return el.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 520, // globals.css:1387 (03 M10)
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // globals.css:1387
  });
}

// ——— Escenas ———

const escena = (id: string, Componente: () => ReactElement): EscenaLab => ({ id, pasos: 0, Componente });

/** Cumple todo: titular, una cifra del registro y su fuente (la composición «una cifra», síntesis §4.3). */
function Limpia() {
  return (
    <div className="zh-reticula zh-una-cifra">
      <p className="zh-titular">Esta pantalla cumple las reglas del auditor</p>
      <p className="zh-cifra">
        <Dato id="gem-actividad-emprendedora" />
      </p>
      <p className="zh-fuente">
        <Dato id="gem-actividad-emprendedora" campo="fuente" />
      </p>
    </div>
  );
}

/** A-48: un pie de 24 px y una lectura de 48 px. */
function TextoChico() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">El pie de esta pantalla no se lee</p>
      <p className="zh-fuente" style={{ fontSize: 24, marginTop: 64 }}>
        Pie de veinticuatro
      </p>
      <p className="zh-lectura" style={{ fontSize: 48, marginTop: 64 }}>
        Lectura de cuarenta y ocho
      </p>
    </div>
  );
}

/** A-09: 24 palabras. */
function Palabras() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Demasiadas palabras</p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        Este párrafo tiene más palabras de las que caben en una pantalla, así que el público deja de escuchar para leerlo
        entero.
      </p>
    </div>
  );
}

/** A-69: la misma cifra dos veces aquí, y ya salió en «limpia». */
function CifraRepetida() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">La misma cifra sale dos veces</p>
      <p className="zh-cifra" style={{ marginTop: 48 }}>
        <Dato id="gem-actividad-emprendedora" />
      </p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        Otra vez: <Dato id="gem-actividad-emprendedora" />
      </p>
    </div>
  );
}

/** P0-10: una raya y una diagonal SVG cruzan dos textos (en el gris de la tarjeta, para que el contraste no caiga). */
function Cruce() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Una raya atraviesa este titular</p>
      <div style={{ position: 'absolute', left: 60, top: 160, width: 1500, height: 6, background: 'var(--zh-tarjeta)' }} />
      <svg style={{ position: 'absolute', inset: 0 }} width="1920" height="1080" viewBox="0 0 1920 1080">
        <line x1="100" y1="700" x2="1000" y2="420" stroke="var(--zh-tarjeta)" strokeWidth="6" />
      </svg>
      <p className="zh-lectura" style={{ position: 'absolute', left: 115, top: 500 }}>
        Y una diagonal cruza la lectura
      </p>
    </div>
  );
}

/**
 * Nada: un <rect> que tapa el titular entero pero recortado con clip-path a una
 * franja de debajo, como la cinta (Cinta.tsx). Su geometría «toca» el texto; lo
 * que pinta, no. El auditor lo decide con píxeles.
 */
function Recorte() {
  const id = useId();
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Una forma recortada bajo el titular</p>
      <svg style={{ position: 'absolute', inset: 0 }} width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <clipPath id={id}>
            <rect x="115" y="260" width="630" height="85" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="1400" height="600" fill="var(--zh-tarjeta)" clipPath={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** P0-10: lo mismo, pero la franja recortada sí pasa por el titular. */
function RecorteToca() {
  const id = useId();
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Una forma recortada sobre el titular</p>
      <svg style={{ position: 'absolute', inset: 0 }} width="1920" height="1080" viewBox="0 0 1920 1080">
        <defs>
          <clipPath id={id}>
            <rect x="115" y="150" width="630" height="20" />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="1400" height="600" fill="var(--zh-tarjeta)" clipPath={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** A-36: el violeta de disciplina a 32 px (5,94:1) y blanco al 30 % a 60 px. */
function Contraste() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Este texto se pierde en el fondo</p>
      <p className="zh-fuente" style={{ marginTop: 64, color: 'var(--zh-disciplina-landings)' }}>
        Fuente en violeta de disciplina
      </p>
      <p className="zh-lectura" style={{ marginTop: 48, color: 'rgb(247 247 250 / 0.3)' }}>
        Lectura casi transparente
      </p>
    </div>
  );
}

/** A-13 y A-12. */
function Vocabulario() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Potenciamos tu ecosistema digital</p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        No somos una agencia, somos tu equipo
      </p>
    </div>
  );
}

/** A-05 y A-14. */
function Pregunta() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">¿Por qué Zhonyas?</p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        Hoy en día todo cambia
      </p>
    </div>
  );
}

/** A-67: «10x» y «600+». */
function Adorno() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Entregamos 10x más rápido</p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        Con 600+ proyectos
      </p>
    </div>
  );
}

/** A-10: una lista y una viñeta escrita. */
function Vinetas() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Tres cosas en viñetas</p>
      <ul className="zh-lectura" style={{ marginTop: 48, paddingLeft: 60 }}>
        <li>Primera cosa</li>
        <li>Segunda cosa</li>
      </ul>
      <p className="zh-lectura">• Tercera cosa</p>
    </div>
  );
}

/** A-19: emojis. */
function Emoji() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Hecho en Santiago 🚀</p>
      <p className="zh-lectura" style={{ marginTop: 48 }}>
        Con orgullo 🇩🇴
      </p>
    </div>
  );
}

/** A-34: un naranja ajeno (en trampas.css) y una caja azul. */
function Color() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Colores que no son de la marca</p>
      <p className="zh-lectura trampa-hex" style={{ marginTop: 48 }}>
        Naranja de otra paleta
      </p>
      <div style={{ width: 400, height: 120, marginTop: 48, background: '#2244aa' }} />
    </div>
  );
}

/** A-45 (Inter, en trampas.css), A-50 (mono fuera de consola) y §4.2 (peso 600); con el titular son tres pesos (A-49). */
function Letra() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Letras que no son de la marca</p>
      <p className="zh-lectura trampa-letra" style={{ marginTop: 32 }}>
        Una letra ajena
      </p>
      <p className="zh-fuente zh-mono" style={{ marginTop: 32 }}>
        monoespaciada fuera de una consola
      </p>
      <p className="zh-lectura" style={{ marginTop: 32, fontWeight: 600 }}>
        Peso seiscientos
      </p>
    </div>
  );
}

/** A-61: un icono de Lucide (el cohete, dibujado aquí: no se instala la librería). */
function Lucide() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Un icono de adorno</p>
      <svg
        className="lucide lucide-rocket"
        style={{ marginTop: 48 }}
        width="160"
        height="160"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    </div>
  );
}

/** A-40 y A-36: titular encima de la firma. A-38: un degradado CSS y uno SVG que no son el token. */
function Degradado() {
  const id = useId();
  return (
    <div className="zh-reticula">
      <div style={{ position: 'absolute', left: 80, top: 80, width: 1300, height: 200, background: 'var(--zh-firma)' }} />
      <p className="zh-titular" style={{ position: 'relative' }}>
        Titular encima de la firma
      </p>
      <div style={{ position: 'absolute', left: 115, top: 600, width: 600, height: 160, background: 'linear-gradient(90deg, #4f46e5, #a975ff)' }} />
      <svg style={{ position: 'absolute', left: 900, top: 600 }} width="600" height="160">
        <defs>
          <linearGradient id={id}>
            <stop offset="0" stopColor="#4f46e5" />
            <stop offset="1" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect width="600" height="160" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

/** A-43 (texto con halo y caja que brilla) y A-44 (vidrio). */
function Halo() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Brillos de adorno</p>
      <p className="zh-lectura" style={{ marginTop: 48, textShadow: '0 0 24px var(--zh-acento)' }}>
        Texto con halo
      </p>
      <div style={{ marginTop: 64, display: 'flex', gap: 64 }}>
        <div style={{ width: 400, height: 160, background: 'var(--zh-tarjeta)', boxShadow: '0 0 40px rgba(214, 91, 233, 0.6)' }} />
        <div style={{ width: 400, height: 160, background: 'rgb(247 247 250 / 0.08)', backdropFilter: 'blur(20px)' }} />
      </div>
    </div>
  );
}

/** A-31: un rótulo con text-transform y un titular escrito en mayúsculas. */
function Mayusculas() {
  return (
    <div className="zh-reticula">
      <p className="zh-fuente" style={{ textTransform: 'uppercase', letterSpacing: '0.2em' }}>
        somos zhonyas
      </p>
      <p className="zh-titular" style={{ marginTop: 24 }}>
        NUESTROS SERVICIOS
      </p>
    </div>
  );
}

/** A-49: cuatro tamaños (96, 60, 48 y 32 px). */
function Tamanos() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Cuatro tamaños en una pantalla</p>
      <p className="zh-lectura" style={{ marginTop: 32 }}>
        Lectura de sesenta
      </p>
      <p style={{ marginTop: 32, fontSize: 48 }}>Texto de cuarenta y ocho</p>
      <p className="zh-fuente" style={{ marginTop: 32 }}>
        Fuente de treinta y dos
      </p>
    </div>
  );
}

/** El mismo halo que «halo», declarado como excepción: no falla, sale en «Excepciones». */
function Excepcion() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Un halo declarado como excepción</p>
      <p
        className="zh-lectura"
        data-auditar-excepcion="A-43: prueba de la excepción del auditor"
        style={{ marginTop: 48, textShadow: '0 0 24px var(--zh-acento)' }}
      >
        Texto con halo permitido
      </p>
    </div>
  );
}

export default definirPieza({
  titulo: 'Trampa del auditor anti-slop',
  notas:
    'Una escena por regla (scripts/probar-auditor.mjs sabe cuál espera de cada una). No es de la charla: ' +
    'la auditoría normal la deja fuera. Ver docs/MOTOR.md §12.',
  escenas: [
    escena('limpia', Limpia),
    escena('texto-chico', TextoChico),
    escena('palabras', Palabras),
    escena('cifra-repetida', CifraRepetida),
    escena('cruce', Cruce),
    escena('recorte', Recorte),
    escena('recorte-toca', RecorteToca),
    escena('contraste', Contraste),
    escena('vocabulario', Vocabulario),
    escena('pregunta', Pregunta),
    escena('adorno', Adorno),
    escena('vinetas', Vinetas),
    escena('emoji', Emoji),
    escena('color', Color),
    escena('letra', Letra),
    escena('lucide', Lucide),
    escena('degradado', Degradado),
    escena('halo', Halo),
    escena('mayusculas', Mayusculas),
    escena('tamanos', Tamanos),
    escena('excepcion', Excepcion),
  ],
});
