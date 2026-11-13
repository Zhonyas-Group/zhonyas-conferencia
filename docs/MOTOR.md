# Motor de la presentación

Motor propio para la conferencia de Zhonyas: un escenario fijo de 1920 × 1080 que se escala a cualquier pantalla, diapositivas escritas en React, ventana del presentador sincronizada y un `index.html` que se abre con doble clic desde un USB, **sin internet y sin servidor**.

Pila: Vite 7 + React 19 + TypeScript. Dependencias de ejecución: `gsap`, `motion` (las mismas versiones mayores que la web de Zhonyas) y `ogl` para WebGL. Nada se descarga en tiempo de ejecución: ni CDN ni Google Fonts.

---

## 1. Comandos

Hace falta Node 22.12 o superior solo para desarrollar. Para presentar basta Chrome o Edge.

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (no descarga navegadores). |
| `npm run dev` | Servidor de desarrollo en http://localhost:5180 (presentador: `/?presentador`). |
| `npm run build` | Comprueba tipos y compila a `dist/`: `index.html` con todo el JS y el CSS dentro, más `medios/` y `fonts/` como archivos. |
| `npm run servir` | Sirve `dist/` en http://localhost:4180 con un servidor mínimo de Node; si el 4180 está ocupado usa el siguiente libre y lo dice. `-- 8080` pide otro puerto (si está ocupado, lo avisa y sale) y `-- --red` lo deja ver desde otro equipo. |
| `npm run capturas` | Compila, captura cada diapositiva y cada paso a 1920 × 1080 en `verificacion/capturas/NN-id-pP.png` y vuelve a crear el PDF de respaldo en `dist/`. |
| `npm run pdf` | Compila y genera `dist/zhonyas-conferencia.pdf`: una página por diapositiva en su estado final. |
| `npm run probar` | Compila y pasa la prueba automática completa (ver §8). `node scripts/probar.mjs --canal msedge` la repite con Edge. |
| `npm run medio-prueba` | Regenera los medios de las diapositivas de prueba (los dibuja y graba Chrome; no descarga nada). |

Los scripts usan el Chrome o el Edge instalados mediante `playwright-core`. **Nunca** hace falta `playwright install`.

Cada compilación vacía `dist/`, también el PDF. `npm run pdf` y `npm run capturas` lo vuelven a crear (y lo dicen al final); `npm run build` y `npm run probar` avisan en su salida de que `dist/` se quedó sin él. Antes de copiar al USB, el último comando tiene que ser `npm run pdf` (o `npm run capturas`).

Si algo de `dist/` está abierto en un programa que lo bloquea (el PDF en Acrobat, por ejemplo) o es de solo lectura, la compilación se para **antes de borrar nada** y dice qué archivo cerrar: «No se puede compilar: dist/ tiene archivos abiertos en otro programa…». `dist/` queda como estaba. Tener la presentación abierta en Chrome o Edge (incluso con el video en marcha) no bloquea nada.

---

## 2. El día de la charla

### Antes de salir

1. `npm run pdf` (compila y deja el PDF de respaldo dentro de `dist/`).
2. Copia **la carpeta `dist/` entera** al USB. Se puede renombrar; da igual que la ruta tenga espacios o acentos.
3. Lleva también el PDF en el teléfono o en otro USB.

### En la sala

1. Conecta el cargador. Con batería, Chrome y Edge activan el ahorro de energía y limitan las animaciones a 30 fps. Si no hay enchufe, desactívalo en `chrome://settings/performance` (Edge: `edge://settings/system`).
2. Proyector en modo **Extender** (Win + P → Extender).
3. Doble clic en `index.html`. Si Windows lo abre con otro navegador: clic derecho → Abrir con → Chrome (o Edge). Abierto así (sin `#` en la dirección) empieza siempre en la diapositiva 1, aunque el ensayo terminara en otra.
4. Pulsa **P** (con la sala todavía en el portátil): se abre la ventana del presentador. Si ya hay uno abierto, P no abre otro: lo destaca con un marco (y lo trae delante si Windows lo permite).
5. Arrastra la ventana de la sala (la que no es el presentador) al proyector y pulsa **F** para ponerla a pantalla completa. El presentador se queda en el portátil. Al entrar en pantalla completa el navegador avisa «mantén pulsada Esc para salir»: es lo esperado (ver Esc en la tabla de teclas).
6. Mira el presentador: arriba a la derecha debe decir **«Sala conectada»** en verde y no debe haber franja roja de avisos.
7. El cronómetro arranca solo con el primer movimiento hacia delante: un avance (también el → que enciende la sala si esperaba en negro a que te presentaran) o un salto hacia delante con número + Intro, la cuadrícula o Fin. Volver atrás (Inicio, ←) no lo arranca. Si quedó tiempo de un ensayo de hace menos de una hora (el cronómetro no marca 0:00), pulsa **Reiniciar**; uno más viejo (parado hace más de una hora, o en marcha más de tres) vuelve a cero solo al abrir.
8. Desactiva las notificaciones de Windows (Asistente de concentración) para que no salgan encima.

Las dos ventanas tienen que estar en **el mismo navegador y el mismo perfil** (no una en Chrome y otra en Edge, ni una en ventana privada) y abiertas **desde la misma carpeta**: se hablan por BroadcastChannel y localStorage, que son del perfil, y cada carpeta usa su propio canal. Así una copia vieja (en Descargas, en otro USB) abierta a la vez no mueve a la buena.

### Teclas

Funcionan igual en la sala y en el presentador.

| Tecla | Acción |
|---|---|
| → · Espacio · AvPág · ↓ · Intro · clic | Avanzar: primero los pasos de la diapositiva, luego la siguiente. |
| ← · RePág · ↑ · Retroceso | Retroceder. Desde el paso 0 vuelve a la anterior ya completa. |
| Inicio / Fin | Primera diapositiva / última, completa. |
| número + Intro | Salta a esa diapositiva. Mientras se teclea se ve «Ir a 12» (en la sala, abajo a la derecha; en el presentador, en grande sobre los botones). El número se borra solo a los 3 s o con Esc; mientras se ve, Intro salta en vez de avanzar. |
| G | Cuadrícula con todas las diapositivas. Se abre con la actual elegida; flechas para elegir (↑ y ↓ cambian de fila; si no hay otra fila, no se mueven), Intro o clic para ir, Esc o G para cerrar. Elegir la actual la deja como está, con los pasos ya mostrados (como cerrar con Esc); las demás empiezan en su paso 0. El ratón solo cambia la elección cuando se mueve: si la rejilla aparece debajo del puntero quieto, no elige nada. |
| B · . | Pantalla en negro, también con la cuadrícula abierta. Cualquier avance o retroceso la vuelve a encender sin moverse. |
| F · F5 | Pantalla completa (F5 no recarga). |
| Esc | Cierra lo que haya abierto: la ayuda, la cuadrícula, el «Ir a» o, desde el presentador, lo que tenga abierto la sala. Si no hay nada abierto, sale de pantalla completa (el «terminar» del puntero). Funciona igual a pantalla completa: la página se queda con Esc (Keyboard Lock), y **mantener Esc pulsado** sale siempre de pantalla completa. |
| P | Abre el presentador (solo desde la sala). |
| H · ? | Ayuda con los atajos. |

La cuadrícula y la ayuda son de cada ventana. Si están abiertas en la sala, el público las ve: el presentador lo avisa sobre «En pantalla» y **Esc** en el presentador (o el botón del aviso) las cierra. Si la charla se mueve desde el presentador, la sala las cierra sola.

Con la sala en negro, el proyector sigue en negro pase lo que pase: G y H no abren nada en la sala (para elegir diapositiva a oscuras, usa la cuadrícula del presentador, que es solo tuya; «b» o «.» con ella abierta ponen o quitan el negro sin cerrarla) y el «Ir a» queda debajo del negro. En la sala, «b» o «.» con la cuadrícula abierta la cierran y ponen el negro: al volver se ve la diapositiva. Mientras nadie ve la diapositiva (negro o cuadrícula encima), el video y la escena WebGL se paran y siguen desde el mismo punto al volver.

**Punteros (clickers):** envían AvPág / RePág o flechas para pasar, F5 / Mayús + F5 / Esc para empezar y terminar, y «b» o «.» para el negro. Todo eso está cubierto.

### Cambio de orador

Cada diapositiva dice quién la presenta (`orador`). En el presentador:

- arriba se ve **«Habla: José»** y **«Después: Orador 2 en la 7 (dentro de 2)»**;
- en el último paso antes del relevo aparece debajo de la vista siguiente la franja **«Al avanzar le toca a Orador 2»**, en el color de esa persona. Con la sala en negro no sale: el → solo encendería la pantalla («Siguiente: vuelve la imagen, sin moverse»), y la franja vuelve al encenderla.

El que habla lleva el puntero; el que entra mira esa franja para saber cuándo le toca.

### Si algo falla

| Problema | Qué hacer |
|---|---|
| Se cierra o se cuelga la sala | Doble clic en `index.html`: se pone sola en la diapositiva del presentador. Llévala al proyector y pulsa F. |
| Se cierra o se cuelga el presentador a mitad de charla | Haz clic en la sala (el primer clic en una ventana que no tenía el foco solo la enfoca: **no avanza**) y pulsa **P**. Chrome y Edge abren la ventana nueva en la pantalla de la sala, es decir, en el proyector; mientras esté ahí, encima de la sala, el presentador **no enseña notas, cronómetro ni la siguiente**: solo la diapositiva en vivo (o negro, si la sala lo está) y una franja «Llévalo a la tuya con Win + Mayús + ← o →». Pulsa esa combinación: en tu pantalla vuelve a ser el presentador, con el cronómetro intacto. Si prefieres que el público no vea ni la franja, pon antes la sala en negro (B). |
| Se cerraron las dos | Ctrl + Mayús + T recupera la pestaña en su diapositiva (va en la dirección: `#/7/2`); si no, número + Intro. |
| «Sala sin conectar» en el presentador | Las ventanas están en navegadores o perfiles distintos, o se abrieron desde carpetas distintas. Cierra el presentador y pulsa P en la sala. La sala sigue funcionando sola con su teclado o el puntero. |
| Franja roja de avisos en el presentador | Falta un archivo de `medios/` (se copió mal) o una diapositiva falló. Dice cuál. |
| El equipo no tiene WebGL, o se pierde (al cambiar de proyector) | Esas diapositivas muestran su imagen fija (`poster`) y el presentador lo avisa («Este equipo no tiene WebGL…», con cómo activar la aceleración gráfica). La charla funciona igual. Si el navegador recupera WebGL, la animación vuelve sola. |
| Nada funciona | Abre `zhonyas-conferencia.pdf` y preséntalo a pantalla completa. |

---

## 3. La ventana del presentador

Se abre con **P** desde la sala o con `index.html?presentador`. Es una ventana aparte con su propio proceso: lo que pinte no le quita fotogramas a la proyección.

- **En pantalla:** la diapositiva actual **en vivo** (el mismo componente, con sus animaciones y su WebGL; el video va sin sonido). Si la sala está en negro, se ve un velo con el aviso; si la sala tiene abierta la cuadrícula o la ayuda, un aviso con el botón para cerrarla (también Esc).
- **Siguiente:** lo que aparecerá al avanzar. Si quedan pasos, la misma diapositiva en el paso siguiente; si no, la próxima diapositiva. Con la sala en negro, la actual tal como está («vuelve la imagen, sin moverse»): avanzar solo enciende.
- **Notas** en letra grande, con A− / A+ (el tamaño se recuerda).
- **Quién habla ahora y quién después**, y la franja de relevo (ver §2).
- **Cronómetro total** con el objetivo y lo que queda o lo que te pasaste: «0:42 · de [18] min · quedan 17:18». El objetivo se edita en ese mismo campo (18 por defecto; admite 18,5 o 18:30); Intro aplica y Esc cancela. Debajo, una barra con la marca de dónde deberías ir.
- **Ritmo:** compara el tiempo real con las duraciones sugeridas de cada diapositiva. «A tiempo» (±10 s), «Adelantado 0:30» o «Atrasado 0:45» (en rojo pasado un minuto). Si la suma de las duraciones no coincide con el objetivo, muestra «plan 17:20» al lado.
- **Esta diapositiva:** tiempo en la actual frente a su duración sugerida. Se mide con el cronómetro de la charla: no cuenta la espera antes del primer avance ni las pausas (en pausa se congelan el total, el ritmo y este tiempo).
- **Hora** y estado de la conexión con la sala.
- Botones: Anterior, Siguiente, Pantalla en negro, Cuadrícula, Pantalla completa, Iniciar / Pausar / Reiniciar.
- Cabe entero (cronómetro, objetivo, «Después» y relevo) desde 1280 × 600 (portátil con la pantalla al 150 %) y 1024 × 768; por debajo de 1100 px de ancho pasa a dos columnas.

- **En la pantalla del público:** si la ventana del presentador está en la misma pantalla que una sala a pantalla completa y el equipo tiene más de una pantalla (lo normal al reabrirlo con P a mitad de charla, ver §2 «Si algo falla»), solo enseña lo mismo que la sala y la franja para llevarlo a tu pantalla (Win + Mayús + ← o →). Las teclas y el puntero siguen funcionando. «Usarlo aquí» enseña el presentador entero en esa pantalla (el público lo verá). Con una sola pantalla (un ensayo en el portátil) esto no pasa nunca.
- Un **tema de contraste de Windows** no cambia lo que ve el público: el escenario se pinta igual que siempre; la interfaz del presentador sí sigue los colores del sistema.

El campo del objetivo no se queda con el puntero: las flechas, AvPág, RePág, «b» y «.» (el negro del puntero), Espacio o cualquier tecla que no sirva para escribir un número lo suelta (aplicando lo escrito) y hace lo suyo. Los decimales se escriben con coma (18,5) o con dos puntos (18:30); el punto del teclado numérico también vale. Pulsar cualquier botón del presentador también lo suelta. Si se deja el campo seleccionado sin escribir, lo suelta solo a los 6 s. Para corregir una cifra, Retroceso o escribir el número de nuevo (al entrar en el campo queda todo seleccionado): ← y → no mueven el cursor del campo, pasan diapositiva.

Las dos ventanas se controlan con las mismas teclas y quedan sincronizadas: cada cambio sale por BroadcastChannel y, como respaldo, por el evento `storage` de localStorage. Gana siempre el cambio más reciente (la versión) y, a igualdad, la ventana que ya estaba abierta: una ventana que llega (el presentador abierto con `index.html?presentador`, una sala recargada) toma la posición de la que ya estaba, nunca al revés. Todas aplican la misma regla, así que nunca se quedan en posiciones distintas.

---

## 4. Crear una diapositiva

### 4.1 El archivo

Cada diapositiva es un módulo `src/diapositivas/NN-nombre.tsx` que exporta por defecto su definición:

```tsx
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { Entrada } from '../motor/Entrada';
import { medio } from '../motor/medios';
import './equipo.css';

function Equipo({ paso }: PropsDiapositiva) {
  return (
    <div className="equipo">
      <h1>Somos seis</h1>
      <Entrada desde={1}>
        <img src={medio('medios/equipo/foto.webp')} alt="" />
      </Entrada>
      <Entrada desde={2} retraso={120}>
        <p>Diseño, código y 3D en el mismo estudio.</p>
      </Entrada>
    </div>
  );
}

export default definirDiapositiva({
  id: 'equipo',
  titulo: 'Equipo',
  pasos: 2,
  orador: 'jose',
  duracion: 60,
  notas: `
    Presentar al equipo **sin leer los nombres**.

    - Paso 1: aparece la foto.
    - Paso 2: la frase.
  `,
  medios: ['medios/equipo/foto.webp'],
  Componente: Equipo,
});
```

Y se registra en su sitio en `src/diapositivas/indice.ts`, que es el que manda el orden (el `NN` del nombre de archivo solo ordena la carpeta):

```ts
import equipo from './04-equipo';
export const diapositivas = [portada, problema, equipo, cierre];
```

### 4.2 Campos

| Campo | Tipo | Para qué |
|---|---|---|
| `id` | texto | Único y estable. Aparece en capturas, URL de depuración y avisos. |
| `titulo` | texto | Interno: solo lo ven el presentador y la cuadrícula. |
| `pasos` | entero ≥ 0 | Sub-pasos («builds»). Con `pasos: 2` hay tres estados: 0, 1 y 2. |
| `orador` | clave | Quién la dice: una clave de `oradores` en `src/configuracion.ts`. |
| `notas` | texto | Notas del presentador: línea en blanco = párrafo nuevo, «- » = viñeta, `**negrita**`. |
| `duracion` | segundos | Duración sugerida (para el ritmo). |
| `Componente` | componente React | Dibuja la diapositiva en el escenario de 1920 × 1080. |
| `medios` | lista (opcional) | Archivos de `public/` que usa: se precargan y se comprueba que existen. |
| `transicion` | opcional | Transición propia (§4.6). |
| `fondo` | color (opcional) | Fondo de la diapositiva y de las bandas laterales. |

Los oradores, el título y el objetivo de minutos están en `src/configuracion.ts`. Si una definición está mal (id repetido, orador que no existe, pasos negativos), el motor lo avisa en la consola, en el presentador y, en desarrollo, también en la sala.

### 4.3 Lo que recibe el componente

`{ paso, activa, direccion }`:

- `paso`: de 0 a `pasos`.
- `activa`: `true` solo en la diapositiva que está en pantalla (no en la vista previa ni en miniaturas). Úsalo para arrancar y parar cosas.
- `direccion`: `1` si se avanzó, `-1` si se retrocedió, `0` si fue un salto.

Desde cualquier pieza interna, sin pasar props: `usePaso()`, `useDiapositiva()` (id, paso, activa, modo, rol, `pausada`…) y `useMovimiento()` (ver §4.5).

`useDiapositiva().pausada` es `true` mientras la diapositiva está en pantalla pero nadie la ve (sala en negro o cuadrícula encima). `<Video>` y `<LienzoOGL>` ya lo respetan; una animación propia en bucle (GSAP con `repeat: -1`, un `requestAnimationFrame` a mano) debería pararse con él y seguir desde el mismo punto. No cambia `activa`: lo que se anima al entrar no se repite al quitar el negro.

El escenario mide **siempre 1920 × 1080**: escribe tamaños en píxeles pensando en esa pantalla y el motor lo escala. La diapositiva tiene `position: absolute; inset: 0`, fuente `var(--fuente-texto)` a 32 px y fondo `var(--fondo)`.

### 4.4 Pasos

`<Entrada desde={n}>` aparece al llegar al paso `n` con un fundido y un desplazamiento corto; con `hasta={m}` desaparece después del paso `m`; `retraso` (ms) escalona varias piezas en el mismo paso; `como="li"` cambia la etiqueta. Mientras está oculta conserva su hueco, así que mostrarla no mueve nada más.

Para un efecto propio, CSS sobre `[data-oculto]` con una clase, o GSAP con el paso:

```tsx
import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { usePaso, useMovimiento } from '../motor/contexto';

function Cifra() {
  const ref = useRef<HTMLSpanElement>(null);
  const paso = usePaso();
  const { duracion } = useMovimiento();
  useLayoutEffect(() => {
    gsap.to(ref.current, { scale: paso >= 1 ? 1 : 0.6, opacity: paso >= 1 ? 1 : 0, duration: duracion(600) / 1000 });
  }, [paso, duracion]);
  return <span ref={ref}>35</span>;
}
```

### 4.5 Movimiento, revisión y accesibilidad

`useMovimiento()` devuelve:

- `revision`: modo de capturas (todo tiene que quedar en su estado final al instante);
- `reducido`: el sistema pide menos movimiento (prefers-reduced-motion): fundidos sí, desplazamientos no;
- `duracion(ms)`: la duración a usar en una animación propia (0 en revisión y en miniaturas).

En modo revisión el motor ya apaga las transiciones y animaciones CSS, la Web Animations API de las capas, GSAP (línea de tiempo global acelerada) y `motion` (`MotionGlobalConfig.skipAnimations`). Una animación hecha con `requestAnimationFrame` a mano tiene que mirar `useMovimiento()` ella misma.

### 4.6 Transiciones entre diapositivas

Por defecto, fundido cruzado de 420 ms: la que entra aparece encima de la que sale (sin bajar a negro). Con menos movimiento dura 200 ms; en revisión no hay.

Una diapositiva puede declarar la suya. **Regla:** la transición vive en el borde entre dos diapositivas: al avanzar de A a B se usa la de B; al retroceder de B a A se usa también la de B, con `direccion = -1`.

```tsx
import type { Transicion } from '../motor/tipos';

const barrido: Transicion = {
  entrar: (capa, { direccion, reducido }) =>
    capa.animate(
      reducido
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ clipPath: direccion > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' }, { clipPath: 'inset(0)' }],
      { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
    ),
};

export default definirDiapositiva({ /* … */ transicion: barrido });
```

`entrar` y `salir` reciben la capa (el `div` de la diapositiva) y pueden devolver una animación de `elemento.animate()`, una línea de tiempo de GSAP, una promesa o nada. Si el orador avanza a mitad de transición, el motor la lleva a su final y empieza la siguiente. Al terminar borra los estilos en línea que la transición haya dejado en las capas.

### 4.7 Medios

- Van en `public/medios/…` y se copian tal cual a `dist/medios/…`.
- Se piden con **rutas relativas**: `medio('medios/equipo/foto.webp')`. Nunca con barra inicial (`/medios/…`): desde el USB apuntaría a la raíz del disco.
- Declara cada archivo en `medios` de su diapositiva: se precarga al llegar a la anterior y el motor avisa si falta.
- **Video:** `<Video src="medios/demo.mp4" poster="medios/demo-poster.webp" />`. Se reproduce solo con su diapositiva en pantalla, se congela al salir y vuelve al principio cuando su capa queda oculta. Con la sala en negro o la cuadrícula encima se para y sigue desde el mismo punto al volver (el audio no suena a oscuras). Dentro de una `<Entrada desde={n}>` no corre mientras está oculto y empieza desde el principio cada vez que aparece. Sin sonido por defecto (`sonido` para activarlo; el presentador nunca suena). MP4 H.264 o WebM VP9, siempre con póster: es lo que se ve en miniaturas, en el PDF y en las capturas.
- **Imágenes:** WebP o AVIF al tamaño al que se ven (una imagen de fondo: 1920 de ancho; 3840 solo si de verdad hace falta).

### 4.8 WebGL (OGL)

```tsx
import { LienzoOGL, type CrearEscenaOGL } from '../motor/LienzoOGL';

// Fuera del componente: tiene que ser una función estable.
const crearGalaxia: CrearEscenaOGL = ({ renderer, gl }) => {
  // …crear geometría, programa, malla…
  return {
    dibujar: (tiempo, delta) => renderer.render({ scene: malla }),
    redimensionar: (ancho, alto) => { /* aspecto */ },
    destruir: () => { /* liberar */ },
    listo: promesaDeTexturas, // opcional
  };
};

<LienzoOGL crear={crearGalaxia} poster="medios/galaxia.webp" calidad={1} tiempoRevision={3} />
```

- Solo anima mientras su diapositiva está en pantalla y alguien la ve; fuera, con la sala en negro o con la cuadrícula encima queda congelada (el contador de la diapositiva de prueba lo demuestra) y sigue desde el mismo punto al volver.
- El búfer se ajusta a los píxeles reales de la pantalla (escala × devicePixelRatio × `calidad`, con tope 4K), también cuando solo cambia la densidad (la ventana pasa del portátil al 150 % a un proyector al 100 %, sin cambiar de tamaño). Para escenas pesadas, `calidad={0.75}`.
- En la cuadrícula no crea contexto (se ve el `poster`); si el equipo no tiene WebGL o se pierde el contexto, también (y si el navegador lo recupera, la escena se vuelve a crear).
- Si la escena carga algo (texturas, modelos), devuelve `listo` con la promesa: hasta que se cumple, el lienzo no se ve (se ve el póster). Si la diapositiva que entra no está lista (al **saltar** con Fin, número + Intro o la cuadrícula, o al avanzar nada más abrir), la transición espera, como mucho 800 ms, a que la escena, las imágenes (decodificadas y ya pintadas) y el video estén listos, para que entre completa y no a trozos. Avanzando a una vecina ya preparada no hay espera.
- En una vecina oculta la escena no se crea al montarse, sino cuando la sala lleva 1,5 s quieta y el navegador está libre (crear contexto y escena cuesta unos 50 ms de hilo principal: así no coincide con el fundido ni con lo que se anima al llegar). Si se avanza antes, se crea en ese momento y la transición la espera; mientras tanto se ve el póster.
- Si el equipo no tiene WebGL, el motor lo detecta antes de crear el `Renderer` de OGL: se ve el póster, el presentador lo avisa una sola vez y la consola queda limpia.
- Dentro de una `<Entrada>` oculta no anima.
- **Texturas y modelos: impórtalos desde `src/`** (`import url from './textura.png'`, `import modelo from './logo.glb?url'`). El build los mete dentro del HTML. En `file://` Chrome trata las imágenes sueltas de la carpeta como de otro origen y no deja subirlas a WebGL (comprobado: `SecurityError` en `texImage2D`).

### 4.9 Reglas que evitan sorpresas

- **Nada de `fetch` a archivos locales:** en `file://` Chrome lo bloquea. Los datos (JSON) se importan: `import datos from './datos.json'`.
- **Las diapositivas no importan `motor/estado.ts`** (crearía un ciclo de importación al arrancar). Lo que necesitan está en `motor/contexto`.
- Anima `transform` y `opacity`. Evita sombras con mucho desenfoque (`box-shadow` grande, `filter: blur`) en piezas que entran con un paso: rasterizarlas la primera vez costó 50–67 ms (medido con el video de prueba). Si hacen falta, que la sombra sea una imagen o que ya esté visible antes.
- Las vecinas (anterior y siguiente) ya están montadas y pintadas, ocultas bajo la actual (ver §7). Se montan de una en una cuando el navegador está libre y la transición ya terminó: una diapositiva que haga trabajo caro al montarse (crear una escena WebGL, compilar shaders) lo hará mientras se ve la anterior, sin estorbar el fundido. La que sale se queda montada como vecina: retroceder no la vuelve a montar.

### 4.10 Fuentes de la marca

Los archivos van en `public/fonts/` y se declaran en `src/estilos/fuentes.css` con ruta relativa **sin barra**: `url('fonts/marca.woff2')`. Vite avisa al compilar de que «no se resolvió» y la deja tal cual: es lo correcto (en ejecución el CSS vive dentro de `index.html` y la ruta se resuelve junto a él). Comprobado en Chrome y Edge desde `file://`. Luego se ponen en `--fuente-titulo`, `--fuente-texto` y `--fuente-mono` de `src/estilos/base.css`.

---

## 5. Diapositivas de prueba

`01-prueba-pasos`, `02-prueba-medio` y `03-prueba-webgl` (títulos «PRUEBA · …») ejercitan pasos, imagen 4K, video local, cambio de orador y WebGL con textura. Cuando haya diapositivas reales: bórralas de `indice.ts`, borra sus archivos, `prueba.css`, `recursos/textura-prueba.png` y `public/medios/prueba/`. La prueba automática (`npm run probar`) está escrita para ellas; habrá que adaptar sus posiciones esperadas.

---

## 6. Modo revisión y automatización

`index.html?revision=1` quita todas las animaciones para capturar el estado final de cada paso. En cualquier modo la página expone `window.__motor`:

| | |
|---|---|
| `total` | Número de diapositivas. |
| `ir(n, paso)` | Ir a la diapositiva `n` (**contando desde 1**, como la URL y la cuadrícula) en ese paso. |
| `avanzar()`, `retroceder()` | Igual que las teclas. |
| `estado()` | `{ n, indice, paso, pasos, id, titulo, orador, total, negro }`. |
| `esperar()` | Promesa que se cumple cuando la diapositiva actual cargó fuentes, imágenes, video y WebGL. |
| `diapositivas()` | Lista con `n`, `id`, `titulo`, `pasos`, `orador`, `duracion`. |
| `problemas()` | Avisos del motor (medios que faltan, diapositivas que fallaron…). |
| `canales()`, `cuadrosOGL()` | Diagnóstico de la sincronización y de los lienzos WebGL. |
| `cronometro()` | Cronómetro compartido: `objetivo` (segundos), `corriendo`, `transcurrido` (ms)… |

La URL lleva diapositiva y paso: `#/3/1` es la diapositiva 3, paso 1. Al recargar vuelve ahí; editarla a mano también navega. Sin `#` (doble clic) empieza en la 1, salvo que ya haya otra ventana de la misma carpeta abierta: entonces se pone donde ella.

---

## 7. Cómo está hecho

```
index.html                 contenedor (#raiz)
vite.config.ts             base relativa + vite-plugin-singlefile
src/main.tsx               arranque: sala o presentador según la URL
src/configuracion.ts       título, objetivo de minutos, oradores
src/diapositivas/          una diapositiva por archivo + indice.ts
src/estilos/               tokens (base.css), fuentes, estilos del motor
src/motor/
  tipos.ts                 contrato de una diapositiva y de una transición
  Escenario.tsx            escenario 1920×1080 escalado con transform (texto vectorial, nítido)
  Secuencia.tsx            capas: actual, la que sale y vecinas precargadas; transiciones
  transiciones.ts          fundido base y control de animaciones (WAAPI, GSAP, promesas)
  estado.ts                navegación, URL, versión para sincronizar
  canal.ts                 BroadcastChannel + respaldo por localStorage; regla de quién gana (gana)
  cronometro.ts            cronómetro compartido y guardado
  conexion.ts              latidos de cada ventana («Sala conectada»; el «adiós» de una no borra a las demás)
  capasSala.ts             cuadrícula o ayuda abiertas en la sala: aviso y cierre desde el presentador
  pantallas.ts             en qué pantalla está la sala: el presentador no enseña notas si cae encima de ella
  teclado.ts               teclas y punteros
  Sala.tsx                 ventana del público (cursor que se oculta, pantalla sin suspender)
  Presentador.tsx          ventana del presentador · ritmo.ts: cálculos de tiempo y relevos
  Cuadricula.tsx, Ayuda.tsx, Notas.tsx
  Entrada.tsx, Video.tsx, LienzoOGL.tsx   piezas para diapositivas
  medios.ts                rutas relativas, precarga, capas listas para enseñarse, verificación de archivos
  automatizacion.ts        ?revision=1 y window.__motor
  diagnostico.ts, LimiteError.tsx         avisos y diapositivas que fallan sin tumbar la charla
scripts/                   servir, capturas, pdf (respaldo.mjs: el PDF y su aviso), probar, medio de prueba
```

Decisiones medidas en este equipo:

- **Un solo HTML.** Los scripts de módulo externos no cargan desde `file://` (la presentación de T-Eco tiene ese problema); aquí el JS y el CSS van dentro de `index.html` (≈ 380 KB) y solo los medios son archivos.
- **Presentador en otro proceso.** Abierto como ventana emergente normal comparte proceso con la sala, y la sala pasaba de 3 a 8 cuadros largos en 12 avances. Con `noopener` vuelve a 3. Por eso no hay enlace directo entre ventanas: se hablan por BroadcastChannel y localStorage (las dos vías funcionan en `file://` en Chrome y Edge; la prueba las verifica por separado).
- **Vecinas pintadas de antemano.** Chrome no rasteriza una capa con `opacity: 0` (aunque lleve `will-change: opacity`, y aunque esté encima): la pintaba, foto 4K incluida, en el primer cuadro del fundido, y la primera entrada en cada diapositiva tenía un cuadro de 33–50 ms (3 de 5 entradas). Las vecinas ocultas van con `opacity: 0.002` **debajo** de la actual: Chrome ya las tiene pintadas, y como la actual es opaca y está encima, no se llegan a dibujar en pantalla. Medido: 0 de 5 entradas con tirón al empezar el fundido. En modo revisión van con 0.
- **Diapositiva que entra sin estar lista.** `img.decode()` no basta: Chrome decodifica a tamaño natural y, al pintar la foto 4K reducida, la vuelve a decodificar a la escala de la pantalla; si la capa se enseña antes, el título aparece sobre negro y la foto llega de golpe 50–220 ms después. Cada capa montada se prepara (imágenes decodificadas y dos cuadros más para que el compositor la pinte) y, si la que entra no está preparada, espera con opacidad 0,002 (no 0, para que se pinte) hasta 800 ms.
- **Montar sin juntar trabajo.** Las vecinas se montan de una en una, en ratos libres y después del fundido; la que sale no se desmonta para volver a montarla, y la escena WebGL de una vecina se crea con la sala quieta (§4.8). «En pantalla» del presentador también monta sus vecinas: comparte la GPU con la sala, y pintar de golpe una foto 4K al avanzar le quitaba cuadros a la proyección.
- Resultado medido en la ronda 2 (Chrome, 1920 × 1080, CPU 1×, con cargador), primera entrada en la diapositiva con imagen 4K: antes, 10 de 10 entradas con presentador y 5 de 10 sin él tenían cuadros de 33–67 ms; después, 0 de 10 sin presentador y, con presentador, 2 de 10 con un cuadro de 50 ms en esa misma prueba; medidas con marca de tiempo (15 entradas con presentador y 5 sin él), ningún cuadro de más de 25 ms después de la tecla. Con la CPU frenada 4× sigue habiendo cuadros de 50–85 ms al pulsar (el trabajo de React de cambiar de diapositiva, ×4) y de 50–120 ms al montar la vecina siguiente, con la pantalla ya quieta.
- **Escalado con `transform`** sin `will-change: transform` en el escenario: Chrome vuelve a rasterizar el texto a la escala real.
- La pantalla no se suspende durante la charla (Screen Wake Lock) y el cursor se oculta tras 2,5 s quieto.

---

## 8. Prueba automática

`npm run probar` (o `node scripts/probar.mjs --canal msedge`) comprueba sobre `dist/`, casi todo en `file://`:

- escalado en 1920 × 1080, 1366 × 768, 1280 × 720, 1280 × 800 y 1024 × 768 (16:9, centrado, sin barras);
- todas las teclas, el clic, «número + Intro», cuadrícula, ayuda, negro, URL, recarga y F5;
- presentador abierto con P: proceso propio, sincronización en los dos sentidos, notas, oradores, relevo, cronómetro, negro, recarga del presentador;
- sincronización solo por localStorage (sin BroadcastChannel), y aviso «Sala sin conectar» cuando no hay ninguna vía;
- WebGL que anima en su diapositiva y se detiene al salir; video que se reproduce, hace bucle, se detiene y vuelve al principio;
- modo revisión, menos movimiento, copia en una carpeta con espacios y acentos, servidor estático (incluidas peticiones por rangos);
- fluidez al avanzar a 60 Hz, con la CPU 4 veces más lenta (orientativo) y el margen sin vsync;
- que no haya errores en la consola.

Deja capturas en `verificacion/pruebas/` y el resultado en `verificacion/pruebas/resultado-<navegador>.json`.

Los fallos que encontró la primera ronda de pruebas (desfase del presentador, cronómetro, campo del objetivo, copias en otra carpeta, presentador en pantallas pequeñas, WebGL al saltar o al perder el contexto, video en un paso, puerto ocupado) tienen su propia comprobación: `node verificacion/pruebas-motor/arreglos-r1/verificar.mjs dist despues` (añade `--canal msedge` para Edge o `--solo T1,T11` para unas pocas).

Los de la tercera ronda (Esc a pantalla completa, negro y cuadrícula, cronómetro al encender, presentador reabierto encima de la sala, clic de enfoque, densidad de píxeles, PDF bloqueado, contraste de Windows…) se comprueban con los scripts de `verificacion/pruebas-motor/arreglos-r3/` (`scripts/v-varios.mjs` sin ventana; `v-cortina-y-clic.mjs`, `g2-esc-real.mjs`, `g4-esc-real-presentador.mjs` y `w-clic-real-de-enfoque.mjs` abren ventanas y usan el teclado o el ratón de Windows: no toques el equipo mientras corren). Se les pasa la copia de `dist/` con `DIST=…/index.html USB=…` y la carpeta de salida con `EVID=…`.
