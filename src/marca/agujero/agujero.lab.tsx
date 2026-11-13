/**
 * Laboratorio de Z-10 · el agujero negro entre dos escenas.
 *
 *   lab.html?pieza=agujero&paso=0   la de antes (hace de «Proyectos»)
 *   → (paso 1)                      se abre el agujero: 1500 ms (contact-section.tsx:19)
 *   ← (vuelta al 0)                 se cierra: 1200 ms (contact-section.tsx:20)
 *
 * Se compara con investigacion/movimiento/09-contacto-agujero-negro.png, que
 * mide la web a +50, +420, +500, +570, +780, +950, +1070, +1150, +1300, +1400,
 * +1480 y +1570 ms. La escena de antes lleva tres portadas reales para que se
 * vea la lente curvarlas; son copias de investigacion/marca/proyectos/.
 *
 * Interruptor de la lente desde la consola o Playwright:
 *   __agujero.estado()             modo, si está encendida y lo medido
 *   __agujero.lente('apagada')     'auto' | 'encendida' | 'apagada'
 * El laboratorio guarda su decisión aparte de la de la charla (lente.ts).
 */
import { Dato } from '../../motor/Dato';
import { definirPieza } from '../../motor/laboratorio/tipos';
import { agujeroNegro, precalentarAgujero } from './agujero';
import lendex from './lab/lendex.webp';
import matriz from './lab/matriz-zh.webp';
import pymex from './lab/pymex.webp';

// En la charla lo hace conAgujeroNegro; aquí la escena B no es una diapositiva y se pide a mano.
precalentarAgujero('agujero-despues');

const PORTADAS = [
  { src: lendex, nombre: 'Lendex' },
  { src: pymex, nombre: 'Pymex' },
  { src: matriz, nombre: 'Matriz ZH' },
];

function Antes() {
  return (
    <div className="zh-reticula">
      <p className="zh-titular">Escena de antes: la lente la curva</p>
      <div style={{ display: 'flex', gap: 'var(--zh-hueco-dividida)', marginTop: 96 }}>
        {PORTADAS.map((p) => (
          <figure key={p.nombre} style={{ margin: 0, flex: 1 }}>
            <img src={p.src} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1.44', objectFit: 'cover', borderRadius: 'var(--zh-radio-tarjeta)' }} />
            <figcaption className="zh-fuente" style={{ marginTop: 24 }}>
              {p.nombre}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Despues() {
  return (
    <div className="zh-reticula zh-una-cifra">
      <p className="zh-titular">El agujero negro tarda en abrirse</p>
      <p className="zh-cifra zh-cifra--maxima">
        <Dato id="agujero-negro-abre" />
      </p>
      <p className="zh-fuente">
        <Dato id="agujero-negro-abre" campo="fuente" />
      </p>
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-10 · Agujero negro (transición, una vez en la charla)',
  movimiento: 'Z-10',
  notas:
    'Paso 1: se abre en 1500 ms; ← se cierra en 1200 ms. Fórmulas de contact-section.tsx: radio 286 px a 500 ms, 766 a 950 y 1087 a 1400; disco a 0 en 1500; texto 0,99 a 1400. Comparar con investigacion/movimiento/09-contacto-agujero-negro.png, que midió 271, 661 y 1077 px: con 13 cuadros en 1,5 s, sus cuadros llegaban tarde.',
  escenas: [
    { id: 'agujero-antes', pasos: 0, Componente: Antes },
    { id: 'agujero-despues', pasos: 0, Componente: Despues, transicion: agujeroNegro },
  ],
});
