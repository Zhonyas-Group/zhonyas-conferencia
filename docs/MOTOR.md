# Motor de la presentación

Motor propio para la conferencia de Zhonyas: un escenario fijo de 1920 × 1080 que se escala a cualquier pantalla, diapositivas escritas en React, ventana del presentador sincronizada y un `index.html` que se abre con doble clic desde un USB, **sin internet y sin servidor**.

Pila: Vite 7 + React 19 + TypeScript. Dependencias de ejecución: `gsap`, `motion` (las mismas versiones mayores que la web de Zhonyas) y `ogl` para WebGL. Nada se descarga en tiempo de ejecución: ni CDN ni Google Fonts.

Lo que el motor pone por su cuenta es lo mínimo, y lo demás sale de la marca (síntesis §4 y §9.2):

- el cambio de diapositiva es un **corte seco** (Z-00); solo las escenas medidas Z-02 y Z-10 declaran la suya;
- una `<Entrada>` sin efecto aparece **de golpe**; cada movimiento de la marca es una **entrada con nombre** que registra su pieza en `src/marca/` (§9);
- toda cifra sale del **registro de datos** (`src/datos.ts`) con `<Dato id>`, y la compilación falla si alguna está por confirmar (§10);
- notas **por paso**, fuentes aparte, alerta del +20 %, **prueba de sala** con la tecla T y las diapositivas **pesadas** como póster en el presentador;
- un **laboratorio** (`lab.html`) para probar cada pieza a 1920 × 1080 y capturarla cuadro a cuadro sin tocar el índice (§11).

---

## 1. Comandos

Hace falta Node 22.12 o superior solo para desarrollar. Para presentar basta Chrome o Edge.

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (no descarga navegadores). |
| `npm run dev` | Servidor de desarrollo en http://localhost:5180 (presentador: `/?presentador`; laboratorio: `/lab.html`). `npm run dev -- --port 5290` usa otro puerto. |
| `npm run lab` | El mismo servidor, abriendo el laboratorio de piezas (§11). |
| `npm run build` | Comprueba tipos y compila a `dist/`: `index.html` con todo el JS y el CSS dentro, más `medios/` y `fonts/` como archivos. **Falla si una diapositiva usa un dato por confirmar** (§10). |
| `npm run lab:compilar` | Compila el laboratorio a `dist-lab/lab.html` (también un solo HTML que se abre desde `file://`). |
| `npm run lab:cuadros -- --pieza cifra --paso 1` | Cuadros de una pieza en instantes exactos y su hoja de contacto (§11.4). |
| `npm run servir` | Sirve `dist/` en http://localhost:4180 con un servidor mínimo de Node; si el 4180 está ocupado usa el siguiente libre y lo dice. `-- 8080` pide otro puerto (si está ocupado, lo avisa y sale) y `-- --red` lo deja ver desde otro equipo. |
| `npm run capturas` | Compila, captura cada diapositiva y cada paso a 1920 × 1080 en `verificacion/capturas/NN-id-pP.png` y vuelve a crear el PDF de respaldo en `dist/`. |
| `npm run pdf` | Compila y genera `dist/zhonyas-conferencia.pdf`: una página por diapositiva en su estado final. |
| `npm run probar` | Compila y pasa las dos pruebas automáticas: la del motor (`probar.mjs`, 85 comprobaciones) y la de las novedades (`probar-novedades.mjs`, 38). Ver §8. Después prueba el auditor y **audita el mazo contra el slop**: si encuentra algo, falla (§12). |
| `npm run auditar` | El auditor anti-slop sobre `dist/` (cada paso a 1920 × 1080) y sobre el código de `src/`. Deja `verificacion/auditoria.md` con una captura anotada de cada pantalla con fallos. `-- --dist otra/carpeta`, `-- --url http://localhost:5306/`, `-- --lab --pieza cinta`. Ver §12. |
| `npm run auditar:probar` | Prueba el propio auditor contra su trampa (`src/marca/auditor/`): cada regla tiene que encontrar lo suyo y nada más (§12.5). |
| `npm run medio-prueba` | Regenera los medios de las diapositivas de prueba (los dibuja y graba Chrome; no descarga nada). |

Los scripts usan el Chrome o el Edge instalados mediante `playwright-core`. **Nunca** hace falta `playwright install`.

**Compilar sin tocar `dist/`** (para probar una pieza mientras otra persona trabaja): `npx vite build --outDir otra/carpeta` y `node scripts/probar.mjs --dist otra/carpeta --salida otra/carpeta-pruebas` (igual con `probar-novedades.mjs`). Las comprobaciones de `dist/` bloqueado y el aviso del PDF miran la carpeta de salida real; en una carpeta que no es `dist/` no avisan del PDF.

Cada compilación vacía `dist/`, también el PDF. `npm run pdf` y `npm run capturas` lo vuelven a crear (y lo dicen al final); `npm run build` y `npm run probar` avisan en su salida de que `dist/` se quedó sin él. Antes de copiar al USB, el último comando tiene que ser `npm run pdf` (o `npm run capturas`).

Si algo de `dist/` está abierto en un programa que lo bloquea (el PDF en Acrobat, por ejemplo) o es de solo lectura, la compilación se para **antes de borrar nada** y dice qué archivo cerrar: «No se puede compilar: dist/ tiene archivos abiertos en otro programa…». `dist/` queda como estaba. Tener la presentación abierta en Chrome o Edge (incluso con el video en marcha) no bloquea nada.

---

## 2. El día de la charla

### Antes de salir

1. `npm run pdf` (compila y deja el PDF de respaldo dentro de `dist/`).
2. Copia **la carpeta `dist/` entera** al USB. Se puede renombrar; da igual que la ruta tenga espacios o acentos.
3. Lleva también el PDF en el teléfono o en otro USB.

### En la sala

1. Conecta el cargador. Con batería, Chrome y Edge activan el ahorro de energía y reducen la frecuencia de imágenes. Si no hay enchufe, desactívalo en `chrome://settings/performance` (Edge: `edge://settings/system`).
2. Proyector en modo **Extender** (Win + P → Extender), con la salida de Windows a la **resolución nativa del proyector** (si no, el proyector reescala y el texto de 32 px se ve borroso).
3. Doble clic en `index.html`. Si Windows lo abre con otro navegador: clic derecho → Abrir con → Chrome (o Edge). Abierto así (sin `#` en la dirección) empieza siempre en la diapositiva 1, aunque el ensayo terminara en otra.
4. Pulsa **P** (con la sala todavía en el portátil): se abre la ventana del presentador. Si ya hay uno abierto, P no abre otro: lo destaca con un marco (y lo trae delante si Windows lo permite).
5. Arrastra la ventana de la sala (la que no es el presentador) al proyector y pulsa **F** para ponerla a pantalla completa. El presentador se queda en el portátil. Al entrar en pantalla completa el navegador avisa «mantén pulsada Esc para salir»: es lo esperado (ver Esc en la tabla de teclas).
6. **Prueba de sala:** pulsa **T**, con las luces como van a estar, y mírala desde la última fila (§2.1). T o Esc la quitan.
7. Mira el presentador: arriba a la derecha debe decir **«Sala conectada»** en verde y no debe haber franja roja de avisos.
8. El cronómetro arranca solo con el primer movimiento hacia delante: un avance (también el → que enciende la sala si esperaba en negro a que te presentaran) o un salto hacia delante con número + Intro, la cuadrícula o Fin. Volver atrás (Inicio, ←) no lo arranca, y cerrar la prueba de sala tampoco. Si quedó tiempo de un ensayo de hace menos de una hora (el cronómetro no marca 0:00), pulsa **Reiniciar**; uno más viejo (parado hace más de una hora, o en marcha más de tres) vuelve a cero solo al abrir.
9. Desactiva las notificaciones de Windows (Asistente de concentración) para que no salgan encima.

Las dos ventanas tienen que estar en **el mismo navegador y el mismo perfil** (no una en Chrome y otra en Edge, ni una en ventana privada) y abiertas **desde la misma carpeta**: se hablan por BroadcastChannel y localStorage, que son del perfil, y cada carpeta usa su propio canal. Así una copia vieja (en Descargas, en otro USB) abierta a la vez no mueve a la buena.

### 2.1 La prueba de sala (tecla T)

Una diapositiva oculta, fuera del orden (no está en la cuadrícula ni cuenta para el ritmo), para decidir si el proyector y la luz de la sala dejan ver lo que se diseñó (síntesis §4.1, §9.2.8; A-37; C-22):

- los **cinco tamaños** de la escala: la cifra de 240 px, la portadilla de 128, el titular de 96, la lectura de 60 y la fuente de 32;
- los **16 colores** de texto de la marca, cada uno con su contraste contra el fondo **calculado en vivo** desde el CSS (lo que se ve es lo que hay en `marca.css`);
- el **degradado de la firma**, sin nada encima;
- los **escalones de negro** de la marca, de `#010204` a `#141318`: si el proyector los junta, lo que vaya en `--zh-tarjeta` o en la consola no se verá;
- **líneas de 1 px** (verticales, horizontales y en damero): si salen grises o con muaré, el proyector está reescalando;
- un **patrón de bordes**: el borde de la imagen, el 2,5 % y el 5 % (lo que suelen recortar los proyectores) y el margen de 115 px de la retícula, en discontinua.

Se abre con T desde la sala o desde el presentador (que la enseña sobre «En pantalla» con el aviso «El público ve la prueba de sala»). T o Esc la cierran, y cualquier avance o retroceso también, **sin moverse** de diapositiva («Siguiente: se cierra la prueba de sala, sin moverse»). Mientras está abierta, el video y el WebGL de la diapositiva de debajo se paran. También se ve como pieza del laboratorio: `lab.html?pieza=prueba-sala`.

### Teclas

Funcionan igual en la sala y en el presentador.

| Tecla | Acción |
|---|---|
| → · Espacio · AvPág · ↓ · Intro · clic | Avanzar: primero los pasos de la diapositiva, luego la siguiente. |
| ← · RePág · ↑ · Retroceso | Retroceder. Desde el paso 0 vuelve a la anterior ya completa. |
| Inicio / Fin | Primera diapositiva / última, completa. |
| número + Intro | Salta a esa diapositiva. Mientras se teclea se ve «Ir a 12» (en la sala, abajo a la derecha; en el presentador, en grande sobre los botones). El número se borra solo a los 3 s o con Esc; mientras se ve, Intro salta en vez de avanzar. |
| G | Cuadrícula con todas las diapositivas. Se abre con la actual elegida; flechas para elegir (↑ y ↓ cambian de fila; si no hay otra fila, no se mueven), Intro o clic para ir, Esc o G para cerrar. Elegir la actual la deja como está, con los pasos ya mostrados (como cerrar con Esc); las demás empiezan en su paso 0. El ratón solo cambia la elección cuando se mueve: si la rejilla aparece debajo del puntero quieto, no elige nada. |
| B · . | Pantalla en negro, de golpe (sin fundido), también con la cuadrícula abierta. Cualquier avance o retroceso la vuelve a encender sin moverse. |
| T | Prueba de sala (§2.1). |
| F · F5 | Pantalla completa (F5 no recarga). |
| Esc | Cierra lo que haya abierto: la ayuda, la prueba de sala, la cuadrícula, el «Ir a» o, desde el presentador, lo que tenga abierto la sala. Si no hay nada abierto, sale de pantalla completa (el «terminar» del puntero). Funciona igual a pantalla completa: la página se queda con Esc (Keyboard Lock), y **mantener Esc pulsado** sale siempre de pantalla completa. |
| P | Abre el presentador (solo desde la sala). |
| H · ? | Ayuda con los atajos. |

La cuadrícula y la ayuda son de cada ventana. Si están abiertas en la sala, el público las ve: el presentador lo avisa sobre «En pantalla» y **Esc** en el presentador (o el botón del aviso) las cierra. Si la charla se mueve desde el presentador, la sala las cierra sola.

Con la sala en negro, el proyector sigue en negro pase lo que pase: G y H no abren nada en la sala (para elegir diapositiva a oscuras, usa la cuadrícula del presentador, que es solo tuya; «b» o «.» con ella abierta ponen o quitan el negro sin cerrarla) y el «Ir a» queda debajo del negro. En la sala, «b» o «.» con la cuadrícula abierta la cierran y ponen el negro: al volver se ve la diapositiva. Mientras nadie ve la diapositiva (negro, cuadrícula o prueba de sala encima), el video y la escena WebGL se paran y siguen desde el mismo punto al volver.

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
| Franja roja de avisos en el presentador | Falta un archivo de `medios/` (se copió mal), una diapositiva falló, una pesada no tiene póster o una cifra está por confirmar. Dice cuál. |
| El equipo no tiene WebGL, o se pierde (al cambiar de proyector) | Esas diapositivas muestran su imagen fija (`poster`) y el presentador lo avisa («Este equipo no tiene WebGL…», con cómo activar la aceleración gráfica). La charla funciona igual. Si el navegador recupera WebGL, la animación vuelve sola. |
| Nada funciona | Abre `zhonyas-conferencia.pdf` y preséntalo a pantalla completa. |

---

## 3. La ventana del presentador

Se abre con **P** desde la sala o con `index.html?presentador`. Es una ventana aparte con su propio proceso, pero **comparte la GPU con la sala** (todas las ventanas de Chrome usan el mismo proceso de GPU; crítica C-02): por eso las diapositivas pesadas se ven aquí como póster.

- **En pantalla:** la diapositiva actual **en vivo** (el mismo componente, con sus animaciones; el video va sin sonido). Las **pesadas** (`pesada: true`: WebGL, filtros SVG, el agujero negro) se ven como su **póster quieto**, con el rótulo «Póster quieto · en la sala se ve en vivo»: así la laptop no pinta lo más caro dos o tres veces a la vez. Si la sala está en negro, se ve un velo con el aviso; si la sala tiene abierta la cuadrícula o la ayuda, un aviso con el botón para cerrarla (también Esc); si enseña la prueba de sala, la prueba con el aviso «El público ve la prueba de sala».
- **Siguiente:** lo que aparecerá al avanzar. Si quedan pasos, la misma diapositiva en el paso siguiente; si no, la próxima diapositiva (las pesadas, como póster). Con la sala en negro o con la prueba de sala abierta, la actual tal como está: avanzar solo enciende o cierra.
- **Notas por paso**, en letra grande, con A− / A+ (el tamaño se recuerda): la **frase de entrada completa** (`decir`), debajo las **3–4 palabras clave** en ámbar y, si la hay, la caja **«Si falla:»** en rojo. Cambian con cada paso. Las notas de texto libre (una para toda la diapositiva) siguen funcionando.
- **Fuentes**, en un panel aparte debajo de las notas: cada cifra de la diapositiva (de su `<Dato>`) con su texto, su fuente, su fecha y su «Ojo:» si lo tiene, y las `fuentes` escritas a mano. Si la diapositiva no tiene ninguna, el panel no sale y las notas ocupan toda la columna. Una cifra por confirmar sale en rojo.
- **Quién habla ahora y quién después**, y la franja de relevo (ver §2).
- **Cronómetro total** con el objetivo y lo que queda o lo que te pasaste: «0:42 · de [18] min · quedan 17:18». El objetivo se edita en ese mismo campo (18 por defecto; admite 18,5 o 18:30); Intro aplica y Esc cancela. Debajo, una barra con la marca de dónde deberías ir.
- **Ritmo:** compara el tiempo real con las duraciones sugeridas de cada diapositiva. «A tiempo» (±10 s), «Adelantado 0:30» o «Atrasado 0:45» (en rojo pasado un minuto). Si la suma de las duraciones no coincide con el objetivo, muestra «plan 17:20» al lado.
- **Esta diapositiva:** tiempo en la actual frente a su duración sugerida: en ámbar al pasarla y, **pasado el +20 %, todo el panel del tiempo se pone en rojo** (01 P1-17). Se mide con el cronómetro de la charla: no cuenta la espera antes del primer avance ni las pausas (en pausa se congelan el total, el ritmo y este tiempo).
- **Hora** y estado de la conexión con la sala.
- Botones: Anterior, Siguiente, Pantalla en negro, Cuadrícula, Pantalla completa, Iniciar / Pausar / Reiniciar. La prueba de sala va con T.
- Cabe entero (cronómetro, objetivo, «Después», relevo, notas y fuentes) desde 1280 × 600 (portátil con la pantalla al 150 %) y 1024 × 768; por debajo de 1100 px de ancho pasa a dos columnas y las fuentes se quedan en una franja corta que se desplaza, para que las notas manden.

- **En la pantalla del público:** si la ventana del presentador está en la misma pantalla que una sala a pantalla completa y el equipo tiene más de una pantalla (lo normal al reabrirlo con P a mitad de charla, ver §2 «Si algo falla»), solo enseña lo mismo que la sala y la franja para llevarlo a tu pantalla (Win + Mayús + ← o →). Ahí las pesadas se ven en vivo, porque es lo que ve el público. Las teclas y el puntero siguen funcionando. «Usarlo aquí» enseña el presentador entero en esa pantalla (el público lo verá). Con una sola pantalla (un ensayo en el portátil) esto no pasa nunca.
- Un **tema de contraste de Windows** no cambia lo que ve el público: el escenario se pinta igual que siempre; la interfaz del presentador sí sigue los colores del sistema.

El campo del objetivo no se queda con el puntero: las flechas, AvPág, RePág, «b» y «.» (el negro del puntero), Espacio o cualquier tecla que no sirva para escribir un número lo suelta (aplicando lo escrito) y hace lo suyo. Los decimales se escriben con coma (18,5) o con dos puntos (18:30); el punto del teclado numérico también vale. Pulsar cualquier botón del presentador también lo suelta. Si se deja el campo seleccionado sin escribir, lo suelta solo a los 6 s. Para corregir una cifra, Retroceso o escribir el número de nuevo (al entrar en el campo queda todo seleccionado): ← y → no mueven el cursor del campo, pasan diapositiva.

Las dos ventanas se controlan con las mismas teclas y quedan sincronizadas: cada cambio sale por BroadcastChannel y, como respaldo, por el evento `storage` de localStorage. Gana siempre el cambio más reciente (la versión) y, a igualdad, la ventana que ya estaba abierta: una ventana que llega (el presentador abierto con `index.html?presentador`, una sala recargada) toma la posición de la que ya estaba, nunca al revés. Todas aplican la misma regla, así que nunca se quedan en posiciones distintas. La prueba de sala viaja con la posición.

---

## 4. Crear una diapositiva

### 4.1 El archivo

Cada diapositiva es un módulo `src/diapositivas/NN-nombre.tsx` que exporta por defecto su definición:

```tsx
import { definirDiapositiva, type PropsDiapositiva } from '../motor/tipos';
import { Dato } from '../motor/Dato';
import { Entrada } from '../motor/Entrada';

function Informales(_: PropsDiapositiva) {
  return (
    <div className="zh-reticula zh-una-cifra">
      <p className="zh-titular">Casi todas las mipymes trabajan sin RNC</p>
      <Entrada desde={1} efecto="cifra">
        <p className="zh-cifra"><Dato id="mipymes-informales" /></p>
      </Entrada>
      <p className="zh-fuente"><Dato id="mipymes-informales" campo="fuente" /></p>
    </div>
  );
}

export default definirDiapositiva({
  id: 'informales',
  titulo: 'Mipymes informales',
  pasos: 1,
  orador: 'jose',
  duracion: 45,
  notas: [
    { decir: 'Ahora piensen en el colmado de la esquina.', claves: 'colmado · sin RNC' },
    { decir: 'Ocho y media de cada diez mipymes no tienen RNC.', claves: '85,2 % · informales', siFalla: 'Si no sale la cifra, decirla.' },
  ],
  Componente: Informales,
});
```

Y se registra en su sitio en `src/diapositivas/indice.ts`, que es el que manda el orden (el `NN` del nombre de archivo solo ordena la carpeta):

```ts
import informales from './04-informales';
export const diapositivas = [portada, problema, informales, cierre];
```

(El ejemplo usa `efecto="cifra"`, que existirá cuando su pieza de `src/marca/` la registre, y las clases de `marca.css` de §4.12.)

### 4.2 Campos

| Campo | Tipo | Para qué |
|---|---|---|
| `id` | texto | Único y estable. Aparece en capturas, URL de depuración y avisos. |
| `titulo` | texto | Interno: solo lo ven el presentador y la cuadrícula. |
| `pasos` | entero ≥ 0 | Sub-pasos («builds»). Con `pasos: 2` hay tres estados: 0, 1 y 2. |
| `orador` | clave | Quién la dice: una clave de `oradores` en `src/configuracion.ts`. |
| `notas` | lista o texto | **Por paso:** `pasos + 1` notas `{ decir, claves, siFalla? }` (la del paso 0, la del 1…). `decir` es la frase de entrada completa (≤ 40 palabras); `claves`, 3–4 palabras; `siFalla`, qué hacer si algo falla (demos, video, WebGL). **Texto libre:** una nota para toda la diapositiva (línea en blanco = párrafo, «- » = viñeta, `**negrita**`). |
| `fuentes` | lista de textos (opcional) | Créditos y fuentes de lo que se afirma; van al panel «Fuentes». Las de las cifras salen solas del registro. |
| `duracion` | segundos | Duración sugerida (ritmo y alerta del +20 %). |
| `Componente` | componente React | Dibuja la diapositiva en el escenario de 1920 × 1080. |
| `medios` | lista (opcional) | Archivos de `public/` que usa: se precargan y se comprueba que existen. |
| `transicion` | opcional | Transición propia (§4.6). Solo Z-02 y Z-10. |
| `fondo` | color (opcional) | Fondo de la diapositiva y de las bandas laterales. |
| `pesada` | booleano (opcional) | WebGL, filtros SVG o el agujero negro: en el presentador y en las miniaturas se ve su `poster` (C-02). |
| `poster` | ruta (opcional) | Imagen de la diapositiva entera a 1920 × 1080 (de `public/`). Obligatoria si es pesada; el motor comprueba que exista. Se saca con `npm run capturas` y se pasa a WebP. |
| `excepcionA54` | texto (opcional) | Motivo para usar más de un momento animado (§4.4). Silencia el aviso y queda escrito. |
| `datosDetectados` | — | No se escribe: lo pone la compilación (§10). |

Los oradores, el título y el objetivo de minutos están en `src/configuracion.ts`. Si una definición está mal (id repetido, orador que no existe, pasos negativos, notas por paso que no son `pasos + 1`, una nota sin `decir` o sin `claves`, una pesada sin póster), el motor lo avisa en la consola, en el presentador y, en desarrollo, también en la sala. En desarrollo avisa además si `decir` pasa de 40 palabras o `claves` de 4.

### 4.3 Lo que recibe el componente

`{ paso, activa, direccion }`:

- `paso`: de 0 a `pasos`.
- `activa`: `true` solo en la diapositiva que está en pantalla (no en la vista previa ni en miniaturas). Úsalo para arrancar y parar cosas.
- `direccion`: `1` si se avanzó, `-1` si se retrocedió, `0` si fue un salto.

Desde cualquier pieza interna, sin pasar props: `usePaso()`, `useDiapositiva()` (id, paso, activa, modo, rol, `pausada`…) y `useMovimiento()` (ver §4.5).

`useDiapositiva().pausada` es `true` mientras la diapositiva está en pantalla pero nadie la ve (sala en negro, cuadrícula o prueba de sala encima). `<Video>` y `<LienzoOGL>` ya lo respetan; una animación propia en bucle (GSAP con `repeat: -1`, un `requestAnimationFrame` a mano) debería pararse con él y seguir desde el mismo punto. No cambia `activa`: lo que se anima al entrar no se repite al quitar el negro.

El escenario mide **siempre 1920 × 1080**: escribe tamaños en píxeles pensando en esa pantalla y el motor lo escala. La diapositiva tiene `position: absolute; inset: 0`, fuente `var(--fuente-texto)` (Arial) a 32 px y fondo `var(--fondo)` (`--zh-fondo`, #010204).

### 4.4 Pasos y entradas

`<Entrada desde={n}>` aparece al llegar al paso `n`; con `hasta={m}` desaparece después del paso `m`; `como="li"` cambia la etiqueta. Mientras está oculta conserva su hueco (`visibility: hidden`), así que mostrarla no mueve nada más.

**Sin `efecto`, aparece y desaparece de golpe** (corte). El motor ya no trae el «fundido y desplazamiento corto»: era la entrada genérica que prohíbe A-53. Para animar, `efecto="nombre"`, una **entrada con nombre** que registra una pieza de `src/marca/` con los valores copiados de la web (§9):

```tsx
<Entrada desde={1} efecto="cifra">…</Entrada>
```

Reglas de una entrada con nombre:

- Solo se anima al **avanzar** hasta su paso, en la diapositiva que está en pantalla (la sala y «En pantalla» del presentador). Al retroceder, al saltar, en «Siguiente», en las miniaturas y en modo revisión queda en su estado final al instante.
- Una entrada con `desde={0}` se anima cuando se llega a la diapositiva avanzando (no al saltar a ella).
- Si el orador avanza a mitad, la animación se lleva a su final.
- Con `hasta`, si el efecto tiene salida animada (`desaparecer`), se cierra animada al avanzar más allá; si no, desaparece de golpe.
- Un nombre que no está registrado se avisa y la entrada aparece de golpe. Los nombres registrados están en los tipos: uno mal escrito falla en `npm run tipos`.

**Un solo momento animado por diapositiva (A-54).** Cada entrada con efecto cuenta como un momento (`efecto@paso`; las piezas con el mismo efecto en el mismo paso, como las letras de un titular, son uno), la salida animada otro y la transición propia otro. Una animación propia que no es una `<Entrada>` (GSAP, rAF) se declara con `useMomento('nombre', paso)` de `motor/momentos`. En desarrollo, si una diapositiva pasa de uno, sale el aviso «tiene 3 momentos animados (cifra@1, cifra@2, cifra@3)…» en la sala y en el presentador. Si es a propósito, `excepcionA54: 'motivo'` en la diapositiva lo silencia. **Pendiente (C-09):** si el momento se cuenta por diapositiva o por paso; hoy, por diapositiva.

### 4.5 Movimiento, revisión y accesibilidad

`useMovimiento()` devuelve:

- `revision`: modo de capturas (todo tiene que quedar en su estado final al instante);
- `reducido`: el sistema pide menos movimiento (prefers-reduced-motion): fundidos sí, desplazamientos no;
- `duracion(ms)`: la duración a usar en una animación propia (0 en revisión y en miniaturas).

En modo revisión el motor ya apaga las transiciones y animaciones CSS, la Web Animations API de las capas, GSAP (línea de tiempo global acelerada) y `motion` (`MotionGlobalConfig.skipAnimations`). Una animación hecha con `requestAnimationFrame` a mano tiene que mirar `useMovimiento()` ella misma.

**Cada curva y cada duración lleva su fuente en un comentario** (archivo:línea de zhonyas-web o el id M-n de `investigacion/03-movimiento-zhonyas.md`), y solo se usan los movimientos del catálogo Z-00 a Z-12 de la síntesis §4.4. Nada «aproximado».

### 4.6 Transiciones entre diapositivas

Por defecto, **corte seco** (Z-00): la diapositiva nueva sustituye a la anterior en el mismo cuadro, sin fundido. Es como cambia Figma Config 2025 de una función a otra, medido cuadro a cuadro (05-oficio-conferencias.md:394), y lo que pide A-53. Las bandas laterales y el negro también cambian de golpe. Con el corte, la tecla y el primer cuadro nuevo van seguidos: en la prueba, a los dos cuadros la nueva está entera y la anterior ya no está.

Una diapositiva puede declarar la suya: **solo las escenas medidas Z-02 (logo → cinta) y Z-10 (agujero negro)**. **Regla:** la transición vive en el borde entre dos diapositivas: al avanzar de A a B se usa la de B; al retroceder de B a A se usa también la de B, con `direccion = -1`.

Esquema (los fotogramas y los valores los pone la pieza de Z-10, copiados de la web):

```tsx
import type { Transicion } from '../motor/tipos';

const FOTOGRAMAS_ENTRAR: Keyframe[] = [/* copiados de contact-section.tsx (render) y team-contact.css:109-137 */];
const FOTOGRAMAS_ATRAS: Keyframe[] = [/* la de atrás se encoge a 0,955 y baja al 50 % de brillo (03 M12) */];

const agujeroNegro: Transicion = {
  entrar: (capa, { direccion }) =>
    capa.animate(FOTOGRAMAS_ENTRAR, {
      duration: direccion > 0 ? 1500 : 1200, // contact-section.tsx:19-20 (OPEN_MS, CLOSE_MS)
      easing: 'linear', // lineal en t (03 M12)
      fill: 'both',
    }),
  salir: (capa, { direccion }) =>
    capa.animate(FOTOGRAMAS_ATRAS, { duration: direccion > 0 ? 1500 : 1200, easing: 'linear', fill: 'both' }),
};

export default definirDiapositiva({ /* … */ transicion: agujeroNegro });
```

`entrar` y `salir` reciben la capa (el `div` de la diapositiva) y pueden devolver una animación de `elemento.animate()` (o una lista), una línea de tiempo de GSAP, una promesa o nada. La capa que entra va encima. Si el orador avanza a mitad de transición, el motor la lleva a su final y empieza la siguiente. Al terminar borra los estilos en línea que la transición haya dejado en las capas. La transición cuenta como un momento animado (§4.4).

### 4.7 Medios

- Van en `public/medios/…` y se copian tal cual a `dist/medios/…`.
- Se piden con **rutas relativas**: `medio('medios/equipo/foto.webp')`. Nunca con barra inicial (`/medios/…`): desde el USB apuntaría a la raíz del disco.
- Declara cada archivo en `medios` de su diapositiva: se precarga al llegar a la anterior y el motor avisa si falta.
- **Video:** `<Video src="medios/demo.mp4" poster="medios/demo-poster.webp" />`. Se reproduce solo con su diapositiva en pantalla, se congela al salir y vuelve al principio cuando su capa queda oculta. Con la sala en negro, la cuadrícula o la prueba de sala encima se para y sigue desde el mismo punto al volver (el audio no suena a oscuras). Dentro de una `<Entrada desde={n}>` no corre mientras está oculto y empieza desde el principio cada vez que aparece. Sin sonido por defecto (`sonido` para activarlo; el presentador nunca suena). MP4 H.264 o WebM VP9, siempre con póster: es lo que se ve en miniaturas, en el PDF y en las capturas.
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

- Una diapositiva con WebGL se marca `pesada: true` con su `poster` (§3).
- Solo anima mientras su diapositiva está en pantalla y alguien la ve; fuera, con la sala en negro, con la cuadrícula o la prueba de sala encima queda congelada (el contador de la diapositiva de prueba lo demuestra) y sigue desde el mismo punto al volver.
- El búfer se ajusta a los píxeles reales de la pantalla (escala × devicePixelRatio × `calidad`, con tope 4K), también cuando solo cambia la densidad (la ventana pasa del portátil al 150 % a un proyector al 100 %, sin cambiar de tamaño). Para escenas pesadas, `calidad={0.75}`.
- En la cuadrícula no crea contexto (se ve el `poster`); si el equipo no tiene WebGL o se pierde el contexto, también (y si el navegador lo recupera, la escena se vuelve a crear).
- Si la escena carga algo (texturas, modelos), devuelve `listo` con la promesa: hasta que se cumple, el lienzo no se ve (se ve el póster). Si la diapositiva que entra no está lista (al **saltar** con Fin, número + Intro o la cuadrícula, o al avanzar nada más abrir), la transición espera, como mucho 800 ms, a que la escena, las imágenes (decodificadas y ya pintadas) y el video estén listos, para que entre completa y no a trozos. Avanzando a una vecina ya preparada no hay espera.
- En una vecina oculta la escena no se crea al montarse, sino cuando la sala lleva 1,5 s quieta y el navegador está libre (crear contexto y escena cuesta unos 50 ms de hilo principal). Si se avanza antes, se crea en ese momento y la transición la espera; mientras tanto se ve el póster.
- Si el equipo no tiene WebGL, el motor lo detecta antes de crear el `Renderer` de OGL: se ve el póster, el presentador lo avisa una sola vez y la consola queda limpia.
- Dentro de una `<Entrada>` oculta no anima.
- **Texturas y modelos: impórtalos desde `src/`** (`import url from './textura.png'`, `import modelo from './logo.glb?url'`). El build los mete dentro del HTML. En `file://` Chrome trata las imágenes sueltas de la carpeta como de otro origen y no deja subirlas a WebGL (comprobado: `SecurityError` en `texImage2D`).

### 4.9 Reglas que evitan sorpresas

- **Nada de `fetch` a archivos locales:** en `file://` Chrome lo bloquea. Los datos (JSON) se importan: `import datos from './datos.json'`.
- **Las diapositivas no importan `motor/estado.ts`** (crearía un ciclo de importación al arrancar). Lo que necesitan está en `motor/contexto`.
- **Ninguna cifra escrita a mano:** siempre `<Dato id>` (§10).
- Anima `transform` y `opacity`. Evita sombras con mucho desenfoque (`box-shadow` grande, `filter: blur`) en piezas que entran con un paso: rasterizarlas la primera vez costó 50–67 ms (medido con el video de prueba). Si hacen falta, que la sombra sea una imagen o que ya esté visible antes.
- Las vecinas (anterior y siguiente) ya están montadas y pintadas, ocultas bajo la actual (ver §7). Se montan de una en una cuando el navegador está libre y la diapositiva en pantalla está **quieta** (sin ninguna animación que vaya a terminar: una entrada con nombre, una consola; las que van en bucle no cuentan). La que sale no se desmonta para volver a montarla.

### 4.10 Fuentes de letra

La marca usa **Arial** (400 y 700) y, solo dentro de una consola, **la mono del sistema** (`ui-monospace, SFMono-Regular, Consolas, monospace`): no hay archivos que empaquetar (02 §3.1; A-45, A-50). `--fuente-titulo` y `--fuente-texto` de `base.css` apuntan a `--zh-sans` (`Arial, Helvetica, 'Liberation Sans', Arimo, sans-serif`: las dos últimas tienen la misma métrica, por si la laptop del día es Linux) y `--fuente-mono` a `--zh-mono`. Pide solo los pesos 400 y 700: en Windows 500 se pinta como 400 y 800 como Arial Black.

Si algún día hiciera falta un archivo de fuente, va en `public/fonts/` y se declara en `src/estilos/fuentes.css` con ruta relativa **sin barra**: `url('fonts/marca.woff2')`. Vite avisa al compilar de que «no se resolvió» y la deja tal cual: es lo correcto (comprobado en Chrome y Edge desde `file://`).

### 4.11 Cifras

Ver §10: `<Dato id="mipymes-efectivo" />`, `<Dato id="…" campo="fuente" />` o `useDato('…')`.

### 4.12 La marca en CSS (`src/estilos/marca.css`)

Se carga antes que todo lo demás (en la presentación y en el laboratorio).

**Tokens** (síntesis §4.1), copiados de `investigacion/marca/zhonyas-tokens.css` con su archivo y su línea de zhonyas-web:

| Grupo | Tokens |
|---|---|
| Fondos | `--zh-fondo` #010204 · `--zh-fondo-2` #050609 · `--zh-seccion` #09090d · `--zh-consola` #0b0a10 · `--zh-tarjeta` #141318 · `--zh-tile` #151219 |
| Texto | `--zh-texto` #f7f7fa (19,41:1) · `--zh-texto-2` #b6b1be (9,91:1, fuentes y créditos) · `--zh-rotulo` #c5bccb · `--zh-lila` #d6a2f0 (segunda línea de un titular) · `--zh-linea` #ffffff1f · `--zh-borde-consola` #ffffff24 |
| Firma | `--zh-magenta`, `--zh-fucsia`, `--zh-orquidea`, `--zh-violeta`; `--zh-firma-paradas` (una sola definición, A-38) y `--zh-firma`: el degradado en la diagonal del logo (57,4° en CSS, magenta abajo a la izquierda; `zhonyas-tokens.css` lo escribió a 90°, manda §4.1). **Nunca lleva texto encima.** |
| Acentos | `--zh-acento` #d65be9 · disciplinas `--zh-disciplina-saas` #d65be9, `--zh-disciplina-3d` #a975ff, `--zh-disciplina-landings` #8c73ff (solo texto ≥ 48 px) · servicios `--zh-software`, `--zh-videojuegos`, `--zh-vr`, `--zh-sistemas`, `--zh-ia` |
| Consola | `--zh-punto-rojo`, `--zh-punto-ambar`, `--zh-punto-verde`, `--zh-check` |
| Portal del equipo | `--zh-fondo-equipo` (una sola vez en la charla) |
| Letra, curvas, radios | `--zh-sans`, `--zh-mono`; `--zh-salida` (0.22, 1, 0.36, 1), `--zh-entrada-salida` (0.76, 0, 0.24, 1); `--zh-radio-consola` 14 px, `--zh-radio-tarjeta` 24 px, `--zh-radio-tile` 3 px |
| Retícula | `--zh-margen` 115 px (`.team-stage`, globals.css:233) · `--zh-hueco-dividida` 48 px (`.capabilities-intro`, capabilities-section.css:5) |

**Escala de letra** (síntesis §4.2): cinco clases, todas en Arial con el interletrado negativo de la web. Como mucho tres por diapositiva (A-49).

| Clase | Tamaño | Peso | Interletrado | Interlínea |
|---|---|---|---|---|
| `.zh-cifra` (`.zh-cifra--maxima`: 330 px) | 240 px | 700 | −0,075 em | 0,84 |
| `.zh-portadilla` | 128 px | 700 | −0,075 em | 0,84 |
| `.zh-titular` (con `text-wrap: balance`) | 96 px | 700 | −0,065 em | 1 |
| `.zh-lectura` (`.zh-lectura--fuerte`: 700) | 60 px | 400 | −0,035 em | 1,24 |
| `.zh-fuente` (en `--zh-texto-2`) | 32 px | 400 | 0 | 1,3 |

Más `.zh-segunda-linea` (la línea entera en lila, nunca una palabra suelta, A-47) y `.zh-mono` (solo en una consola de verdad).

**Retícula** (síntesis §4.3): `.zh-reticula` (margen de 115 px: área útil de 1690 × 850; el titular empieza en x = 115, y = 115) y sus tres composiciones: `.zh-a-sangre` (con `.zh-evidencia` a pantalla completa y el `.zh-titular` en el margen), `.zh-dividida` (1,2 : 0,8 con 48 px de hueco: 985 : 657) y `.zh-una-cifra` (la cifra a la izquierda y la fuente abajo). `.zh-centrada` solo para portada, portadillas y cierre (≤ 20 % de las diapositivas).

---

## 5. Diapositivas y piezas de prueba

`01-prueba-pasos`, `02-prueba-medio` y `03-prueba-webgl` (títulos «PRUEBA · …») ejercitan pasos, notas por paso, un `<Dato>` y sus fuentes, imagen 4K, video local, cambio de orador, WebGL con textura y una diapositiva pesada con póster. Cuando haya diapositivas reales: bórralas de `indice.ts`, borra sus archivos, `prueba.css`, `recursos/textura-prueba.png` y `public/medios/prueba/`. Las pruebas automáticas están escritas para ellas; habrá que adaptar sus posiciones esperadas. **No cumplen la marca** (sello «PRUEBA» en mono a 22 px, pesos 500 a 650, una lista, texto sobre el WebGL con sombra…): mientras estén, el auditor de §12 hace fallar `npm run probar`, y es lo correcto.

En el laboratorio, `src/motor/laboratorio/prueba-motor.lab.tsx` (una entrada con nombre que se abre y se cierra con los valores de Z-08, una entrada sin efecto, una excepción a A-54 y una transición entre dos escenas) y `prueba-sala.lab.tsx` (la prueba de sala) son del motor: no son de la charla. `src/marca/auditor/` (`lab.html?pieza=auditor`) es la **trampa del auditor**: una escena por regla rota a propósito (§12.5). No es de la charla ni sirve de modelo.

---

## 6. Modo revisión y automatización

`index.html?revision=1` quita todas las animaciones para capturar el estado final de cada paso. En cualquier modo la página expone `window.__motor`:

| | |
|---|---|
| `total` | Número de diapositivas. |
| `ir(n, paso)` | Ir a la diapositiva `n` (**contando desde 1**, como la URL y la cuadrícula) en ese paso. |
| `avanzar()`, `retroceder()` | Igual que las teclas. |
| `estado()` | `{ n, indice, paso, pasos, id, titulo, orador, total, negro, prueba }`. |
| `esperar()` | Promesa que se cumple cuando la diapositiva actual cargó fuentes, imágenes, video y WebGL. |
| `diapositivas()` | Lista con `n`, `id`, `titulo`, `pasos`, `orador`, `duracion`. |
| `problemas()` | Avisos del motor (medios que faltan, diapositivas que fallaron, momentos de más…). |
| `pruebaSala(abrir?)` | Abre (`true`), cierra (`false`) o alterna la prueba de sala. |
| `momentos(id)` | Momentos animados anotados de una diapositiva (A-54). |
| `canales()`, `cuadrosOGL()` | Diagnóstico de la sincronización y de los lienzos WebGL. |
| `cronometro()` | Cronómetro compartido: `objetivo` (segundos), `corriendo`, `transcurrido` (ms)… |

La URL lleva diapositiva y paso: `#/3/1` es la diapositiva 3, paso 1. Al recargar vuelve ahí; editarla a mano también navega. Sin `#` (doble clic) empieza en la 1, salvo que ya haya otra ventana de la misma carpeta abierta: entonces se pone donde ella.

---

## 7. Cómo está hecho

```
index.html                 contenedor (#raiz)
lab.html                   laboratorio de piezas (§11)
vite.config.ts             base relativa + vite-plugin-singlefile; plugin «zhonyas:datos» (§10); --mode lab
src/main.tsx               arranque: sala o presentador según la URL
src/configuracion.ts       título, objetivo de minutos, oradores
src/datos.ts               registro de cifras (§10)
src/diapositivas/          una diapositiva por archivo + indice.ts
src/marca/                 piezas de marca: entradas con nombre (*.entrada.ts) y sus *.lab.tsx (§9)
src/estilos/
  marca.css                tokens, escala de letra y retícula (§4.12)
  base.css, fuentes.css    nombres que usa el motor; fuentes (Arial: no hay archivos)
  motor.css                escenario, sala, presentador, cuadrícula
  prueba-sala.css          la carta de ajuste de la tecla T
src/motor/
  tipos.ts                 contrato de una diapositiva, de una nota por paso y de una transición
  Escenario.tsx            escenario 1920×1080 escalado con transform (texto vectorial, nítido)
  Secuencia.tsx            capas: actual, la que sale y vecinas precargadas; transiciones; pesadas como póster
  transiciones.ts          corte seco (Z-00) y control de animaciones (WAAPI, listas, GSAP, promesas)
  Entrada.tsx, entradas.ts <Entrada> por paso y el registro de entradas con nombre
  momentos.ts              un momento animado por diapositiva (A-54): aviso en desarrollo, useMomento
  registroMarca.ts         carga src/marca/**/*.entrada.ts al arrancar
  Dato.tsx                 <Dato id>, useDato y los datos de cada diapositiva
  Notas.tsx, Fuentes.tsx   notas por paso y panel de fuentes del presentador
  PruebaSala.tsx           la prueba de sala (tecla T)
  PosterDiapositiva.tsx    una pesada vista como póster (C-02)
  estado.ts                navegación, prueba de sala, URL, versión para sincronizar
  canal.ts                 BroadcastChannel + respaldo por localStorage; regla de quién gana (gana)
  cronometro.ts            cronómetro compartido y guardado
  conexion.ts              latidos de cada ventana («Sala conectada»; el «adiós» de una no borra a las demás)
  capasSala.ts             cuadrícula o ayuda abiertas en la sala: aviso y cierre desde el presentador
  pantallas.ts             en qué pantalla está la sala: el presentador no enseña notas si cae encima de ella
  teclado.ts               teclas y punteros
  Sala.tsx                 ventana del público (cursor que se oculta, pantalla sin suspender)
  Presentador.tsx          ventana del presentador · ritmo.ts: cálculos de tiempo y relevos
  Cuadricula.tsx, Ayuda.tsx
  Video.tsx, LienzoOGL.tsx piezas para diapositivas
  medios.ts                rutas relativas, precarga, capas listas para enseñarse, verificación de archivos
  automatizacion.ts        window.__motor · revision.ts: ?revision=1
  diagnostico.ts           avisos (por clave) · validacion.ts, revisar.ts: revisión de las definiciones
  LimiteError.tsx          diapositivas que fallan sin tumbar la charla
  laboratorio/             lab.html: Laboratorio.tsx, reloj.ts (tiempo virtual), tipos.ts, piezas de prueba
scripts/                   servir, capturas, pdf (respaldo.mjs), probar, probar-novedades, compilar-lab,
                           lab-cuadros, medio de prueba, auditar y probar-auditor (§12)
  auditoria/               el auditor: reglas.mjs (umbrales y patrones), pantalla.mjs (lo que mide en el
                           navegador), evaluar.mjs (las decisiones), codigo.mjs (src/), auditor.mjs, informe.mjs
```

Decisiones medidas en este equipo:

- **Un solo HTML.** Los scripts de módulo externos no cargan desde `file://` (la presentación de T-Eco tiene ese problema); aquí el JS y el CSS van dentro de `index.html` (≈ 420 KB) y solo los medios son archivos.
- **Presentador en otro proceso.** Abierto como ventana emergente normal comparte proceso con la sala, y la sala pasaba de 3 a 8 cuadros largos en 12 avances. Con `noopener` vuelve a 3. Por eso no hay enlace directo entre ventanas: se hablan por BroadcastChannel y localStorage (las dos vías funcionan en `file://` en Chrome y Edge; la prueba las verifica por separado). **Pero la GPU es la misma** (C-02): de ahí las pesadas como póster.
- **Corte seco.** Sin fundido no hay nada que pintar entre la tecla y la diapositiva nueva. Medido en la prueba (Chrome, 1920 × 1080, con vsync, 12-nov, en dos pasadas con el equipo compilando otras cosas): 0 y 3 de unos 445 cuadros de más de 20 ms en 12 cambios, el peor de 17 y de 34 ms (con el fundido de 420 ms, la última pasada guardada: 1 de 446, el peor de 34 ms). Sin vsync y con el píxel testigo de §8, p95 de 1,2–2,4 ms y p99 de 3,8–5,4 ms.
- **Vecinas pintadas de antemano.** Chrome no rasteriza una capa con `opacity: 0` (aunque lleve `will-change: opacity`, y aunque esté encima): la pintaba, foto 4K incluida, en el primer cuadro del cambio. Las vecinas ocultas van con `opacity: 0.002` **debajo** de la actual: Chrome ya las tiene pintadas, y como la actual es opaca y está encima, no se llegan a dibujar en pantalla. En modo revisión van con 0.
- **Diapositiva que entra sin estar lista.** `img.decode()` no basta: Chrome decodifica a tamaño natural y, al pintar la foto 4K reducida, la vuelve a decodificar a la escala de la pantalla; si la capa se enseña antes, el título aparece sobre negro y la foto llega de golpe 50–220 ms después. Cada capa montada se prepara (imágenes decodificadas y dos cuadros más para que el compositor la pinte) y, si la que entra no está preparada, espera con opacidad 0,002 (no 0, para que se pinte) hasta 800 ms.
- **Montar sin juntar trabajo.** Las vecinas se montan de una en una, en ratos libres y con la diapositiva en pantalla quieta (antes esperaban al fundido; ahora esperan a que terminen sus entradas animadas); la que sale no se desmonta para volver a montarla, y la escena WebGL de una vecina se crea con la sala quieta (§4.8). «En pantalla» del presentador también monta sus vecinas.
- **Escalado con `transform`** sin `will-change: transform` en el escenario: Chrome vuelve a rasterizar el texto a la escala real.
- La pantalla no se suspende durante la charla (Screen Wake Lock) y el cursor se oculta tras 2,5 s quieto.

---

## 8. Pruebas automáticas

`npm run probar` compila y pasa dos pruebas sobre `dist/`, casi todo en `file://`. Con `--dist otra/carpeta` (y `--salida`) prueban otra compilación; con `--canal msedge`, Edge. Al final pasa la prueba del auditor (`probar-auditor.mjs`) y el auditor anti-slop (`auditar.mjs`), que no prueba el motor sino el contenido: ver §12.

**`scripts/probar.mjs`** (85 comprobaciones, el motor):

- escalado en 1920 × 1080, 1366 × 768, 1280 × 720, 1280 × 800 y 1024 × 768 (16:9, centrado, sin barras);
- todas las teclas, el clic, «número + Intro», cuadrícula, ayuda, negro, URL, recarga y F5;
- presentador abierto con P: proceso propio, sincronización en los dos sentidos, notas, oradores, relevo, cronómetro, negro, recarga del presentador;
- sincronización solo por localStorage (sin BroadcastChannel), y aviso «Sala sin conectar» cuando no hay ninguna vía;
- WebGL que anima en su diapositiva y se detiene al salir; video que se reproduce, hace bucle, se detiene y vuelve al principio;
- modo revisión, menos movimiento, copia en una carpeta con espacios y acentos, servidor estático (incluidas peticiones por rangos);
- fluidez al avanzar a 60 Hz, con la CPU 4 veces más lenta (orientativo) y el margen sin vsync;
- que no haya errores en la consola.

Sobre el margen sin vsync: con la pantalla quieta, Chrome vuelve a cuadros de 16,7 ms aunque no tenga tope, y esos cuadros de reposo no son trabajo. Con el corte seco casi toda la ventana de 600 ms es reposo y salían como «p95 16,9 ms». Ahora un píxel testigo de 1 × 1 (del color del fondo ± 1) cambia en cada cuadro durante esa medida: el navegador sigue sin tope y cada intervalo vuelve a medir lo que cuesta el cuadro. Comprobado con un registro de cuándo cae cada cuadro largo: sin testigo, todos los de ~17 ms eran de reposo; con él, solo quedan 3 de más de 10 ms en 12 cambios, en el cuadro del corte.

**`scripts/probar-novedades.mjs`** (38 comprobaciones, lo nuevo):

- corte seco (a los dos cuadros la nueva entera, sin animación, y la anterior fuera), `<Entrada>` sin efecto de golpe, negro sin fundido;
- prueba de sala: T, los cinco tamaños con su interletrado en Arial, los 16 colores con su contraste, los cinco negros, firma y bordes; → la cierra sin moverse ni arrancar el cronómetro; Esc; T y Esc desde el presentador;
- `<Dato>` pinta la cifra; notas por paso con `decir`, `claves` y «Si falla»; panel de fuentes;
- pesadas como póster en «Siguiente» y en «En pantalla», en vivo en la sala;
- alerta del +20 % (con el reloj de Playwright: aviso a los 45 s de 40, rojo a los 50);
- `vite build` falla con un dato por confirmar y compila con uno confirmado;
- laboratorio compilado: índice, entradas registradas, `?pieza=&paso=`, reproducción cuadro a cuadro que sigue la curva y la duración exactas (±0,02), dos reproducciones iguales, salida animada, transición entre escenas, momentos y `?revision=1`.

Dejan capturas y el resultado en `verificacion/pruebas/` (y `verificacion/pruebas/novedades/`).

Los fallos que encontró la primera ronda de pruebas (desfase del presentador, cronómetro, campo del objetivo, copias en otra carpeta, presentador en pantallas pequeñas, WebGL al saltar o al perder el contexto, video en un paso, puerto ocupado) tienen su propia comprobación: `node verificacion/pruebas-motor/arreglos-r1/verificar.mjs dist despues` (añade `--canal msedge` para Edge o `--solo T1,T11` para unas pocas). Con el corte seco da lo mismo que antes: todo bien salvo dos comprobaciones de T6 y T7 (escribir «17.5» en el campo del objetivo), que ya fallaban con el motor anterior porque desde la tercera ronda el punto es la tecla de negro del puntero (los decimales van con coma o dos puntos). Los scripts de `ronda-1/aula-scripts/` miden el fundido de antes y ya no aplican.

Los de la tercera ronda (Esc a pantalla completa, negro y cuadrícula, cronómetro al encender, presentador reabierto encima de la sala, clic de enfoque, densidad de píxeles, PDF bloqueado, contraste de Windows…) se comprueban con los scripts de `verificacion/pruebas-motor/arreglos-r3/` (`scripts/v-varios.mjs` sin ventana; `v-cortina-y-clic.mjs`, `g2-esc-real.mjs`, `g4-esc-real-presentador.mjs` y `w-clic-real-de-enfoque.mjs` abren ventanas y usan el teclado o el ratón de Windows: no toques el equipo mientras corren). Se les pasa la copia de `dist/` con `DIST=…/index.html USB=…` y la carpeta de salida con `EVID=…`. Con el corte seco, `v-varios.mjs` da 16 bien y una que cambió a propósito: la 9 espera que el presentador anime la escena WebGL y ahora enseña su póster (C-02). Los que usan el teclado o el ratón de Windows no se han vuelto a pasar.

---

## 9. Piezas de marca: entradas con nombre

Cada movimiento del catálogo (síntesis §4.4: Z-01 cifra, Z-03 título que se llena, Z-04 letra a letra, Z-05 relevo, Z-06 consola, Z-07 encender, Z-08 detalle…) es una pieza de `src/marca/<pieza>/`. El motor no trae ninguno: los registra cada pieza, con sus valores copiados de la web y su fuente en un comentario.

### 9.1 Registrar una entrada

En `src/marca/<pieza>/<pieza>.entrada.ts` (o `.tsx`). El motor carga **todos** los `src/marca/**/*.entrada.ts` al arrancar la presentación y el laboratorio (`motor/registroMarca.ts`): una diapositiva puede usar `efecto="cifra"` sin importar la pieza.

```ts
import { registrarEntrada } from '../../motor/entradas';
import './cifra.css';

// El nombre entra en los tipos: un efecto mal escrito falla en «npm run tipos».
declare module '../../motor/entradas' {
  interface EntradasRegistradas {
    cifra: true;
  }
}

registrarEntrada({
  nombre: 'cifra',
  movimiento: 'Z-01',
  fuente: 'Vercel Ship 2025, «140B» y «1T» (05 §11.3); curva de la marca (02 §5.12), C-14',
  aparecer: (el, { reducido }) =>
    el.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 300, // Z-01: de invisible a estable en 0,27–0,30 s (05 §11.3)
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // globals.css: la salida de la marca (C-14)
      fill: 'backwards',
    }),
  // desaparecer: (el, ctx) => …  (opcional: salida animada al pasar de `hasta`)
});
```

(Los valores del ejemplo son ilustrativos; los de verdad los fija la pieza de Z-01.)

`aparecer(el, ctx)` y `desaparecer(el, ctx)` reciben el `div` de la `<Entrada>` y `{ reducido, paso, diapositiva }`, y devuelven una animación de `el.animate()`, una **lista** de ellas (una por letra, por ejemplo), una línea de tiempo de GSAP o una promesa. El contrato:

- **El estado final de `aparecer` es el estado visible del CSS**: al terminar, el motor cancela las animaciones que devolvió. Con WAAPI, `fill: 'backwards'` (el primer cuadro ya sale en el estado inicial, sin parpadeo). Con GSAP, que la línea de tiempo acabe con `clearProps`.
- **El estado oculto por defecto es `visibility: hidden`.** Un efecto que no oculta sino que «apaga» (Z-07: gris y al 65 % de brillo hasta que se nombra) lo cambia en su CSS:

  ```css
  .entrada[data-efecto='encender'][data-oculto] {
    visibility: visible;
    filter: grayscale(1) brightness(0.65); /* project-gallery.css:32 (03 M9) */
  }
  ```

- Mientras sale (`desaparecer`), el elemento lleva `data-saliendo` y todavía no `data-oculto`; al terminar, el motor pone el estado oculto.
- Cada duración, curva y retraso lleva su comentario con la fuente (archivo:línea o M-id). Lo que no está en el catálogo no se usa.
- Una animación que no es una entrada (un tween de GSAP, un `requestAnimationFrame`) se declara con `useMomento('nombre', paso)` para que cuente en A-54, y mira `useMovimiento()` para el modo revisión.

### 9.2 Usarla en una diapositiva

```tsx
<Entrada desde={1} efecto="cifra">
  <p className="zh-cifra"><Dato id="gem-actividad-emprendedora" /></p>
</Entrada>
```

---

## 10. Registro de datos (`src/datos.ts`)

**Toda cifra que se ve en pantalla sale del registro** (01 P1-20; A-65). Cada entrada:

```ts
{
  id: 'mipymes-efectivo',              // minúsculas y guiones; no se cambia
  valor: '92,7 %',                     // tal como se ve en pantalla
  texto: 'de las mipymes usa efectivo como medio de pago',
  fuente: 'BCRD y MICM, ENMIPYMES, p. 25',
  url: 'https://cdn.bancentral.gov.do/…',
  fecha: '2022–2023',                  // a qué periodo se refiere
  estado: 'confirmado',                // o 'por-confirmar'
  nota: 'No decir «cobra en efectivo».', // opcional: cómo NO decirla (sale en el panel de fuentes)
}
```

Cargadas hoy:

- **Las 15 filas de la síntesis §6.1** (contexto dominicano, todas confirmadas), una entrada por cifra que se puede enseñar sola: 26 entradas (`gem-actividad-emprendedora`, `gem-negocio-establecido`, `gem-habilidades`, `gem-nota-financiamiento`, `mipymes-total`, `mipymes-informales`, `mipymes-efectivo`, `mipymes-santiago`, `mipymes-credito`, `mipymes-prestamista-informal`, `prestamista-privado`, `findex-prestamo-negocio`, `findex-prestamo-negocio-latam`, `findex-san`, `findex-san-latam`, `dgii-plazo-factura`, `dgii-emisores`, `dgii-proveedores`, `tic-exportaciones`, `tic-exportaciones-porcentaje`, `nini-rd`, `nini-latam`, `tic-universitarios`, `tic-universitarias-mujeres`). Las advertencias de la síntesis van en `nota` (el 54,8 %, «no decir cobra en efectivo», el 15,5 % no es del monto, C-17, C-25).
- **Las cifras de trabajo de §6.2 que José permitió**, confirmadas: `commits-organizacion` (300), `agujero-negro-dias` (25 días), `agujero-negro-abre` (1,5 s, contact-section.tsx:19) y `agujero-negro-cierra` (1,2 s, contact-section.tsx:20).
- **El resto de §6.2, por confirmar** (pregunta 4 de la síntesis): `dias-desde-primer-commit` (135), `dias-antes-de-la-tesis` (87), `dias-con-commits` (53), `dia-con-mas-commits` (31), `animaciones-por-personaje` (16), `web-iphone-fps` (12 fps), `dias-hasta-el-nombre-pymex` (42). No pasan la compilación hasta que José dé el OK.

### 10.1 Pintarlas

```tsx
import { Dato, useDato } from '../motor/Dato';

<Dato id="gem-actividad-emprendedora" />                 // «41,9 %»
<Dato id="gem-actividad-emprendedora" campo="texto" />   // la frase
<Dato id="gem-actividad-emprendedora" campo="fuente" />  // «GEM 2021/2022 Global Report, pp. 44 y 106»
<Dato id="gem-actividad-emprendedora" campo="fecha" />   // «2021»
const d = useDato('mipymes-efectivo');                    // el registro entero, para maquetarlo a mano
```

`<Dato>` pinta un `<span data-dato="id" data-estado="…">`. El `id` está tipado (`IdDato`): uno que no existe falla en `npm run tipos`. Un componente de `src/marca/` puede recibir el id como prop y pasárselo a `<Dato>`: lo que cuenta es que **el id esté escrito tal cual, entre comillas, en el archivo de la diapositiva** (`<Cifra dato="mipymes-total" />`).

### 10.2 Lo que hace la compilación

El plugin `zhonyas:datos` de `vite.config.ts` lee `src/datos.ts` (lo compila y lo evalúa tal cual: no importa nada) y busca en cada módulo del proyecto, salvo el motor y el propio registro, los ids del registro escritos entre comillas (sin contar los comentarios):

- **si alguno está «por confirmar», `vite build` falla**: «… usa el dato «dias-desde-primer-commit» (135), que está «por-confirmar». Confírmalo con su fuente en src/datos.ts (estado: 'confirmado') o quítalo de la diapositiva»;
- un `<Dato id="…">` con un id que no existe también falla;
- en cada diapositiva (`definirDiapositiva({`) deja la lista de sus datos en `datosDetectados`: de ahí sale el panel de fuentes del presentador, también para las pesadas que no se pintan en él.

En desarrollo (`npm run dev`) y en el laboratorio solo avisa (en la terminal de Vite, en la consola y en los avisos de la sala y del presentador), para poder maquetar mientras José confirma. **Pendiente (C-25):** que las cifras que dependen de la fecha (los días desde el primer commit, el plazo de la DGII) se calculen con la fecha de la charla.

---

## 11. Laboratorio de piezas (`lab.html`)

Cada pieza se prueba a 1920 × 1080, en el escenario y con las capas del motor, **sin tocar el índice de diapositivas**. Lo que se ve en el laboratorio es lo que se verá en la charla: mismo CSS (`marca.css`, `motor.css`), mismas entradas registradas, misma regla de transiciones.

### 11.1 Abrirlo

- En desarrollo: `npm run lab` (o `npm run dev -- --port 5290` y abrir http://localhost:5290/lab.html).
- Compilado: `npm run lab:compilar` deja `dist-lab/lab.html`, que se abre con doble clic (`file://`). Para no pisar a otros: `npx vite build --mode lab --outDir otra/carpeta`.

| Dirección | Qué enseña |
|---|---|
| `lab.html` | Índice de piezas (con su error si una no carga) y de las entradas registradas, con su movimiento y su fuente. |
| `lab.html?pieza=cifra&paso=1` | La pieza «cifra» quieta en el paso 1 (estado final). |
| `…&revision=1` | Sin animaciones (como las capturas). |
| `…&hud=0` | Sin la franja de ayuda de abajo (con Playwright no sale nunca). |

Teclas: → / Espacio / clic avanzan **con su animación**, ← retrocede, **R** repite el paso actual desde el anterior, Inicio vuelve al paso 0, H esconde la franja, Esc vuelve al índice. La franja dice la pieza, el movimiento, el paso, los momentos animados si hay más de uno y los avisos del motor.

### 11.2 Escribir un `.lab.tsx`

Un archivo `src/marca/**/<id>.lab.tsx` por pieza. **El id de la pieza es el nombre del archivo** sin `.lab.tsx`. Cada archivo se carga solo cuando se pide: una pieza a medio hacer no rompe las demás.

Una sola escena:

```tsx
import { Entrada } from '../../motor/Entrada';
import { Dato } from '../../motor/Dato';
import { definirPieza } from '../../motor/laboratorio/tipos';

function Escena() {
  return (
    <div className="zh-reticula zh-una-cifra">
      <Entrada desde={1} efecto="cifra">
        <p className="zh-cifra"><Dato id="mipymes-efectivo" /></p>
      </Entrada>
      <p className="zh-fuente"><Dato id="mipymes-efectivo" campo="fuente" /></p>
    </div>
  );
}

export default definirPieza({
  titulo: 'Z-01 · Cifra que entra',
  movimiento: 'Z-01',
  notas: 'Comparar con investigacion/movimiento/… a 0, 100, 200 y 300 ms.',
  pasos: 1,
  Componente: Escena,
});
```

Varias escenas (para probar una transición, Z-02 o Z-10: la de la **segunda** escena, como en la charla):

```tsx
export default definirPieza({
  titulo: 'Z-10 · Agujero negro',
  movimiento: 'Z-10',
  escenas: [
    { id: 'antes', pasos: 0, Componente: Antes },
    { id: 'contacto', pasos: 0, Componente: Contacto, transicion: agujeroNegro },
  ],
});
```

Cada escena es `{ id, pasos, Componente, transicion?, fondo?, excepcionA54? }` o una diapositiva entera hecha con `definirDiapositiva` (se puede importar una de `src/diapositivas/` para probarla). Los **pasos del laboratorio** recorren todas las escenas seguidas: con dos escenas de 0 pasos hay dos, el 0 (la primera) y el 1 (la segunda, que entra con su transición).

### 11.3 `window.__lab` (para Playwright)

| | |
|---|---|
| `piezas()` | Promesa con todas las piezas: `id`, `archivo`, `titulo`, `movimiento`, `notas`, `posiciones`, `escenas` o `error`. |
| `ir(id, paso)` | Muestra la pieza quieta en ese paso y espera a que esté lista. `−1` = antes de la primera escena (fondo vacío). |
| `avanzar()`, `retroceder()` | Como las flechas: con su animación, en tiempo real. |
| `estado()` | `{ pieza, posicion, total, escena, paso, congelado, t }`. |
| `esperar()` | Fuentes, imágenes y WebGL de la escena en pantalla listos. |
| `preparar(id, paso)` | Deja la pieza quieta en el paso anterior a `paso`, lista, y **congela el reloj**. |
| `disparar()` | Avanza a `paso` con el reloj quieto: es el instante **t = 0**. |
| `cuadro(ms)` | Lleva el reloj a `ms` desde el disparo (solo hacia delante, en cuadros de 1/60 s) y deja pintado ese instante. |
| `soltar()` | Vuelve al tiempo real. |
| `momentos()` | Momentos animados (A-54) de cada escena. |
| `problemas()`, `entradas()` | Avisos del motor; entradas registradas con su movimiento y su fuente. |

```js
await page.goto(`${urlDelLab}?pieza=cifra&hud=0`);
await page.waitForFunction(() => window.__lab);
await page.evaluate(() => window.__lab.preparar('cifra', 1));
await page.evaluate(() => window.__lab.disparar());
for (const ms of [0, 33, 67, 100, 200, 300]) {
  await page.evaluate((x) => window.__lab.cuadro(x), ms);
  await page.screenshot({ path: `cifra-${ms}.png` });
}
```

**El reloj del laboratorio** (`motor/laboratorio/reloj.ts`) se instala antes que nada y, al congelarse, pasa a tiempo virtual `requestAnimationFrame`, `performance.now` y `Date.now` (lo que usan GSAP, motion, OGL y cualquier bucle propio), y pausa y coloca en su instante las animaciones del documento (Web Animations, transiciones y animaciones CSS). Dos reproducciones dan los mismos cuadros, y los valores coinciden con la curva (comprobado: la entrada de prueba a 130 ms da 0,765 de opacidad y la curva `cubic-bezier(0.22, 1, 0.36, 1)` también). **`setTimeout` y `setInterval` siguen en tiempo real**: una pieza no debe medir su movimiento con ellos (usa el `delay` de WAAPI o de CSS).

### 11.4 Cuadros y hoja de contacto

```
npm run lab:cuadros -- --pieza cifra --paso 1                       (uno cada 33 ms hasta 1000)
npm run lab:cuadros -- --pieza cifra --paso 1 --ms 0,33,67,100,200,300
npm run lab:cuadros -- --pieza cifra --paso 1 --cada 50 --hasta 1500 --salida otra/carpeta
npm run lab:cuadros -- --pieza cinta --paso 1 --url http://localhost:5290/lab.html
```

Sin `--url` ni `--lab`, compila el laboratorio en una carpeta temporal propia (varias personas pueden usarlo a la vez) y la borra al terminar. Deja en `verificacion/lab/<pieza>/` (ignorada por git) cada cuadro a 1920 × 1080 (`<pieza>-p<paso>-t<ms>.png`), una **hoja de contacto** con todos los cuadros rotulados (`<pieza>-p<paso>-hoja.png`) para ponerla al lado de las de `investigacion/movimiento/`, y un `.json` con los instantes, los momentos y los avisos.

---

## 12. Auditor anti-slop (`npm run auditar`)

Lo que pide la síntesis §9.2.4 y la fila 22 de §1.3 («un script que falla con texto chico, palabras de más, cifras repetidas, cruces o vocabulario vetado»), con las reglas de `investigacion/06-anti-slop.md`. Recorre **cada paso de cada diapositiva** a 1920 × 1080 en modo revisión (`?revision=1`, estado final, con `window.__motor`), mide lo que se ve de verdad (en el DOM y en píxeles) y lee el código de `src/`. Si encuentra algo, sale con código 1: es el último paso de `npm run probar`. Reutiliza las ideas de `recorrido.js`, `cruces.js` y `proyector.js` de la auditoría de T-Eco (tamaño efectivo de cada texto, opacidad acumulada, líneas que cruzan un texto).

### 12.1 Ejecutarlo

| Comando | Qué audita | Informe |
|---|---|---|
| `node scripts/auditar.mjs` | `dist/index.html` y `src/`. Compila antes: `npm run build` o, para no pisar a nadie, `npx vite build --outDir otra/carpeta` y `--dist otra/carpeta` | `verificacion/auditoria.md` |
| `… --url http://localhost:5306/` | el mazo en el servidor de desarrollo (`npm run dev -- --port 5306`) | igual |
| `… --diapositiva 3,intro` | solo esas (número desde 1 o id) | igual |
| `… --lab` | las piezas de `src/marca/` en el laboratorio (lo compila en una carpeta temporal propia) | `verificacion/auditoria-lab/todas.md` |
| `… --lab --pieza cinta` · `… --lab http://localhost:5306/lab.html --pieza cinta` | una pieza (o varias, con comas) | `verificacion/auditoria-lab/cinta.md` |
| `… --solo-codigo` · `… --sin-codigo` | solo `src/` (sin navegador) · solo las pantallas | |
| `… --salida otra/ruta.md` · `… --canal msedge` | otro informe (las capturas van en `otra/ruta/`) · Edge | |

Junto al `.md` deja un `.json` con lo mismo y, por pantalla, `medidas`: cada texto visible con su tamaño efectivo, su peso y su peor contraste. Sirve para resolver una duda («¿cuánto le falta a ese pie?») sin volver a correrlo. Con las tres diapositivas de prueba tarda unos 6 s: algo menos de 1 s por pantalla.

### 12.2 Qué hace fallar

En pantalla (cada paso):

| Regla | Falla si | Cómo lo mide |
|---|---|---|
| **A-48** | un texto visible mide menos de 32 px, o menos de 60 px si es de lectura (`data-lectura` o `.zh-lectura`) | tamaño calculado por la escala de cada `transform` hasta el escenario (Z-07 deja una pieza a 1,055) |
| **A-09** | hay más de 20 palabras en pantalla | cuenta lo que lleva letra o número (`41,9` sí, `%` no). No cuentan las fuentes (`.zh-fuente`, `data-fuente`) ni el texto de una consola (`data-consola`), igual que 06 A-09 no cuenta las capturas. La media del mazo (más de 12) sale como aviso |
| **A-69** | una cifra sale dos veces en la pantalla o ya salió en otra diapositiva | número con su unidad pegada (`41,9 %`, `25 días`, `1,5 s`). Los años cuentan («Desde 2021» repetido es el caso de T-Eco); los enteros de una cifra sin unidad y las fuentes, no |
| **A-67** | «600+», «10x», «100 %», «miles de» | patrón de texto |
| **P0-10** | una decoración toca la tinta de un texto sin tenerlo entero detrás | la tinta de cada texto sale en píxeles (captura normal contra captura con el texto transparente). Cajas con fondo o borde, `img`, `video`, `canvas` y pseudoelementos, por su caja; formas SVG, por su geometría (`isPointInFill`, `isPointInStroke`); las recortadas o enmascaradas (la cinta), ocultándolas y mirando si cambia algo bajo la tinta |
| **A-36** | texto de menos de 48 px por debajo de 7:1, o de 48 px o más por debajo de 4,5:1 (los dos umbrales de WCAG 1.4.6), contra su fondo real | el peor píxel bajo cada línea en la captura con el texto transparente (foto, degradado, WebGL, la sombra del propio texto…), con el color del CSS mezclado con su alfa y su opacidad; con filtro o mezcla, el color de la propia tinta. El blanco de la marca da 19,41:1, como dice §4.1 |
| **A-13 · A-14 · A-12 · A-15 · A-07 · A-66** | vocabulario vetado y demás patrones de 06 §10 | los mismos términos con límites de palabra Unicode («impulsó» también), por bloque (párrafo o título), sin las fuentes ni la consola. A-16 (gerundio colgado) sale como aviso: el patrón de §10 encuentra también «cuando» |
| **A-05 · A-19** | un título termina en «?» (o lleva «!» o «…»), o hay un emoji | título: `h1` a `h6`, `.zh-titular`, `.zh-portadilla`, `.zh-cifra` o 96 px o más. Emoji: la propiedad `Emoji_Presentation` de Unicode; el rango de §10 incluía el «✓» de la consola de la web (`service-terminal.tsx:33`), que no es emoji. Las banderas sí cuentan |
| **A-10** | `ul`, `ol`, `li` o `display: list-item`, o una línea que empieza por «•», «–», «*»… | DOM |
| **A-34** | un color pintado que no es de los tokens `--zh-*` | `color`, fondos, bordes, contornos, `fill` y `stroke`, comparados (sin el alfa) con los tokens leídos del CSS de la propia página |
| **A-45 · A-50 · §4.2 · A-49** | letra que no es Arial (o Helvetica, Liberation Sans, Arimo) ni la mono; mono fuera de una consola; peso que no es 400 ni 700; más de 3 tamaños o de 2 pesos | estilos calculados de cada texto visible |
| **A-31** | `text-transform: uppercase`, versalitas o un rótulo escrito en mayúsculas | dos o más palabras en mayúsculas, o una con interletrado positivo. Las siglas sueltas («RNC», «DGII») y las cifras, no |
| **A-38 · A-40** | un degradado que no es `var(--zh-firma)` ni `var(--zh-fondo-equipo)` (en SVG, con paradas que no son `--zh-firma-paradas`); texto encima de la firma, o encima del fondo del equipo sin ser titular (96 px o más); texto relleno de degradado | el `background-image` calculado, comparado con el del token calculado en la misma página; las paradas de cada `<linearGradient>` que pinta algo |
| **A-43 · A-44** | `text-shadow`; `box-shadow` o `drop-shadow` de color o claros (las sombras grises oscuras no); manchas con `blur` de 8 px o más; `backdrop-filter` | estilos calculados |
| **A-61** | un `svg.lucide` en pantalla | DOM |

En el código (`src/`, sin navegador):

| Regla | Falla si |
|---|---|
| **A-55** | un `cubic-bezier`, `steps()`, una curva (`ease`, `linear`…) o una duración o retraso (`transition` y `animation` de CSS, `duration:`, `delay:`, `easing:`, `ease:`, `stagger:`, `duracion(…)`, una constante que se usa como duración o se llama `CURVA` o `EASE`) no tiene su fuente en un comentario: en la línea, en el bloque de comentarios de encima o en otra línea de la misma declaración (el mismo objeto de opciones o la misma regla CSS). Fuente es un archivo (`globals.css:1387`, `page.tsx`), una línea suelta cuando la cabecera dice el archivo (`/* :16 */`), un M-n de 03 (`M10`), un Z-nn de la síntesis (`Z-08`) o una sección (`05 §11.3`). Las cadenas que son frases (las notas de una pieza, el campo `fuente` de una entrada) no cuentan como valores |
| **A-34** | un hex o un `rgb()` que no es de los tokens, en el mazo (`src/diapositivas`, `src/marca`) o en `marca.css` fuera de sus `--zh-*`. No cuentan las máscaras (`mask`, `<mask>`: solo alfa), los recortes (`<clipPath>`), los filtros (`<filter>`, `flood-color`) ni las sombras (las juzga A-43 en pantalla) |
| **A-38** | un `linear-`, `radial-` o `conic-gradient(` escrito a mano en el mazo (salvo en una máscara) |
| **A-45** | un `font-family`, `font:` o `fontFamily` con una letra que no es Arial ni la mono, o un `@font-face`, en el mazo, `marca.css`, `base.css` o `fuentes.css` |
| **A-61** | «lucide» en el código, en `package.json`, en `index.html` o en `lab.html` |

El **motor** (`src/motor/`, `motor.css`, `prueba-sala.css`) es la interfaz del presentador y del laboratorio: sus movimientos sin fuente salen como **aviso**, no como fallo (hoy, las cuatro transiciones de `motor.css`: líneas 282, 426, 431 y 818). Lo que el motor pinte dentro de una diapositiva ya lo mide la auditoría de pantallas. Para que fallen, en `scripts/auditoria/codigo.mjs` se cambia el `AVISO` del ámbito `motor`.

### 12.3 Cómo leer el informe

1. **La cabecera** dice PASA o FALLA, cuántos fallos, avisos y excepciones hay, qué se auditó (la ruta exacta, el navegador y su versión), la media de palabras y cuántos archivos de cada ámbito se leyeron.
2. **El resumen por regla** ordena las reglas de más a menos fallos. «Qué exige» es la regla en una línea; «Dónde» dice en qué pantallas (`3·p1` es la diapositiva 3 en el paso 1; en el laboratorio, `escena·p0`) o en qué archivos. Debajo, «Sin ningún hallazgo» lista las reglas que se miraron y pasaron.
3. **Pantallas.** Una sección por pantalla con hallazgos, con su captura a 1920 × 1080 y una tabla:
   - el número `#` es el del recuadro en la captura: **rojo** es fallo, **ámbar** es aviso y **gris** es una excepción declarada. Lo que es de toda la pantalla (A-09, A-49) lleva la etiqueta «N · regla (toda la pantalla)» arriba a la derecha;
   - «Qué pasa» cita el texto y el dato que falla; «Medida» y «Límite» dan el número medido y el que exige la regla; «Dónde» es el selector del elemento (las tres últimas etiquetas con sus clases), para buscarlo en el código;
   - los hallazgos iguales en el mismo sitio se juntan («— y 15 más iguales en el mismo sitio»: las capas del logo 3D);
   - una diapositiva repite sus fallos en cada paso (el sello del paso 0 sigue en el 1): arreglado una vez, desaparece de todos.

   Al final va la lista de pantallas sin hallazgos.
4. **Código.** Tres tablas: fallos, avisos (el motor) y excepciones, con `archivo:línea`, qué pasa y la línea de código con su comentario.
5. **Avisos generales** (la media de palabras del mazo, una pantalla que no cargó a tiempo, errores en la consola de la página) y **lo que no mide**.

Para arreglar algo: el recuadro dice qué elemento es, «Dónde» dice cómo se llama y la tabla de §12.2 dice qué hay que cumplir. Si la duda es un número (un contraste de 6,9:1, un pie de 31,5 px), está en `medidas` del `.json`.

### 12.4 Excepciones

Algunas cosas se rompen a propósito: el lema con «extraordinario» si José lo decide, el resplandor propio de la cinta que permite A-43, una cifra citada dos veces con intención. Se declaran y quedan escritas; no hacen fallar, y salen en gris en la captura y en la tabla con su motivo.

- **En pantalla:** `data-auditar-excepcion="A-43: resplandor propio de la cinta (06 A-43)"` en el elemento o en uno que lo contenga. Varias reglas van con comas y varias excepciones con `;`: `"A-38, A-34: veta del logo (page.tsx:829-840); A-43: …"`.
- **En el código:** un comentario `auditar-excepcion: A-34 motivo` en la línea o justo encima, o un bloque entre `auditar-excepcion-inicio: A-34, A-38 motivo` y `auditar-excepcion-fin` (para los `<stop>` de un degradado copiado de la web, por ejemplo).
- **A-05:** un título-pregunta pasa si las notas de su diapositiva dicen «Pregunta al público» (06 A-05).

Una excepción sin motivo se acepta, pero el informe dice «(sin motivo)».

### 12.5 La prueba del auditor (`npm run auditar:probar`)

`scripts/probar-auditor.mjs` comprueba que el auditor encuentra lo que tiene que encontrar **y nada más**, con la trampa de `src/marca/auditor/`:

- `auditor.lab.tsx` (`lab.html?pieza=auditor`) tiene 21 escenas: una por regla rota a propósito, más una limpia (titular, cifra del registro y su fuente: no da nada), una con una forma SVG recortada que pasa bajo el titular sin tocarlo (no da nada; la que sí lo toca da P0-10) y una con la excepción declarada. Cada escena tiene que dar **exactamente** sus reglas.
- `trampas.css` y el propio `.lab.tsx` tienen errores de código a propósito (un hex ajeno, un degradado a mano, Inter, una curva sin fuente) junto a los mismos valores bien escritos (con su fuente, en una máscara, como excepción), que no deben fallar.
- Además comprueba las piezas sueltas (cifras, palabras, qué cuenta como fuente, emojis, límites de palabra con acentos, el separador de comentarios), que el titular blanco mida 96 px y 19,41:1, que cada pantalla con hallazgos tenga su captura y que la auditoría normal deje fuera la trampa.

Son 59 comprobaciones; con `--mazo otra/carpeta-dist`, 69, porque además exige que las diapositivas de prueba del motor fallen en lo suyo. Pasa en Chrome y en Edge (`--canal msedge`), con el laboratorio compilado (`file://`) o servido (`--url http://localhost:5306/lab.html`). Deja el informe de la trampa en `verificacion/pruebas/auditor/trampa.md`: es también el mejor ejemplo de cómo se ve cada fallo.

### 12.6 Lo que no mide

- El texto dentro de imágenes, videos y lienzos WebGL (no es texto del DOM), ni si una captura de producto se lee.
- Lo que pasa **durante** una animación: mide el estado final de cada paso. Las curvas y duraciones se revisan en el código (A-55) y cuadro a cuadro en el laboratorio (§11.4); el «cuadro de más de 33 ms» de la síntesis §9.2.4 lo mide la fluidez de `probar.mjs` (§8).
- Lo que pide criterio: A-01, A-02, A-04, A-06, A-08, A-11, A-17, A-22, A-24, A-27, A-47 y A-70 a A-72 (06 §11). A-54 (un momento animado por diapositiva) lo cuenta el motor (§4.4).
- El contraste en el aula: se calcula sobre la captura; el del proyector y la luz se mira con la prueba de sala (tecla T, §2.1).
- Los pseudoelementos con texto entran en tamaño, emojis y viñetas, pero no en contraste ni en cruces; su caja, si decoran, es aproximada (lo dice el hallazgo).
