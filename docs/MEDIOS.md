# Medios que todavía pueden faltar

Los medios del guion que no existen hoy (docs/GUION.md, «Medios por grabar o conseguir») tienen una **ruta final** en `public/medios/`. Basta con dejar el archivo ahí, con ese nombre exacto, y volver a compilar (`npm run pdf`): la diapositiva lo usa sola, sin tocar el código. En desarrollo (`npm run dev`) la página se recarga al añadir o quitar un archivo.

Cómo funciona: el plugin `zhonyas:medios-presentes` de `vite.config.ts` mira qué archivos hay en `public/medios/` al compilar (o al arrancar el servidor) y lee los `.txt`. `src/medios-opcionales.ts` dice, para cada medio, si `hay`, y cada diapositiva pinta con eso el medio o el «si no llega» del guion. Lo que cambia con el medio (pasos, duración, notas) también se escribe con `hay`, así que cambia solo.

Para ver los dos estados sin tocar archivos, solo en desarrollo: `?con=M-02,M-03` hace como si ya estuvieran (con los medios de `medios/prueba/` en su lugar y créditos de muestra), `?sin=M-08` como si no estuvieran, y `?con=todos` o `?sin=todos` para todos a la vez.

Un video sin su póster **no cuenta** como que está (MOTOR §4.7): el presentador lo avisa en la franja roja. Un medio a medias (una foto sin su crédito, las tomas sin el último cuadro) también se avisa allí.

Cada sección dice qué archivo, dónde, a qué tamaño y qué cambia al llegar. Las diapositivas de cada medio las documenta quien las construye.

## Estado (13-nov, cierre del mazo)

### Lo que falta

Quién y cuándo, como en el guion (GUION, «Medios por grabar o conseguir»). Cada archivo se deja **con ese nombre exacto** en `public/medios/` del repositorio (no en `dist/`) y después `npm run pdf`. Las secciones de abajo dan el tamaño y el formato de cada uno.

| Medio | Quién · cuándo | Dónde se deja (`public/medios/…`) | Qué cambia al llegar | Si sigue faltando el día de la charla |
|---|---|---|---|---|
| **M-01** · La libreta | José o Gregory · viernes de día | `libreta/libreta-1690x620.webp`, `libreta/libreta-1690x850.webp` y `libreta/credito.txt` | La 02 y la 19 enseñan la foto bajo el titular, con su crédito; la 06, la foto a sangre en vez de negro. Las notas cambian solas | La 02 y la 19, con el titular solo; la 06, en negro |
| **M-02** · Pymex por dentro, 3 tomas | Steven con Gregory · prueba el viernes, tomas el sábado por la mañana | `pymex/toma-1.mp4` … `toma-3.mp4`, `toma-N-poster.webp` y `toma-3-ultimo-cuadro.webp` | La 07 pasa a tres pasos (una toma por pregunta) y a 80 s; la 08 usa el último cuadro de la toma 3 si falta M-03. El total sube 25 s | La 07 con la página pública (55 s en vez de 80) |
| **M-03** · José y Gregory en el ITLA | Cualquiera · viernes | `itla/jose-gregory-1690x620.webp` | La 08 enseña la foto, con «Foto: Zhonyas, ITLA, nov 2026» | La 08 con el último cuadro de la toma 3 (M-02); sin M-02 tampoco, el titular solo sobre el fondo |
| **M-04** · Respaldo de Z-10 | Angel · sábado, grabado en la laptop del día | `agujero/respaldo.mp4` (o `.webm`) y `agujero/respaldo-poster.webp` | V en la 10 pone el video del agujero de zhonyas.com, y otra V lo quita | La V no hace nada en la 10 (Z-10 en vivo ya está) |
| **M-05** · El iPhone | Angel · **viernes a las 9 p. m.** | `iphone/iphone.mp4` (o `.webm`) y `iphone/iphone-poster.webp` | La 12 entra en el mazo; la 11 vuelve a 85 s. El total sube 25 s | La 12 no está en el mazo y la 11 dura 95 s |
| **M-06** · El celular de otro | Angel · sábado | `celular/celular-de-otro.mp4` (o `.webm`), `celular/celular-de-otro-poster.webp` y `celular/nombre.txt` | La 13 pasa a tres pasos con el video y a 55 s; el crédito y las notas llevan el nombre. El total sube 10 s | La 13 sin video, en dos pasos (45 s) |

Lo que no es un archivo:

| Qué | Quién | Detalle |
|---|---|---|
| **M-07** · Lendex | José | Que `lendexgp.com/app?calculadora` abra la calculadora (entonces `LENDEX_ABRE_LA_CALCULADORA = true` y la 18 pasa a dos pasos), las tildes de «Tasa de Interés» y «amortización» (el 13-nov seguían sin ellas) y no desplegar nada desde el sábado. Después de cualquier cambio en Lendex, volver a grabar el respaldo con `node scripts/lendex-grabar-demo.mjs --guion` |
| **M-08** · El QR | José · viernes | Leerlo desde la última fila con tres teléfonos (uno, un Android de gama media) y en el proyector de la sala |
| **M-12** · Lista de créditos | José | Documento aparte, fuera de la pantalla: el origen de cada foto, video, captura y personaje |
| zhonyas.com en un iPhone (R-10) | José decide | El QR lleva a zhonyas.com, que en un iPhone va a unos 12 fps (el PR #1 sigue sin mezclar) y choca con la lección de la 13 |
| La página pública de la 07 | José decide | Su cabecera trae el rótulo en mayúsculas y las tarjetas que la charla evita (ver M-02, abajo) |

### Lo que ya está

| Medio | Estado |
|---|---|
| M-07 · Respaldo de la demo | Grabado el 13-nov con red (`node scripts/lendex-grabar-demo.mjs --guion`): `lendex/respaldo.webm`, `respaldo-poster.webp` y `respaldo-final.webp`. Lendex sale en oscuro aunque Windows esté en claro (M-07, abajo). Comprobado el 13-nov desde `dist/`: con red, Lendex carga en la 18 y V pone y quita el video; sin red, la sala lo pone sola |
| M-08 · El QR | `cierre/qr-zhonyas.svg` (`npm run qr`) |
| M-09 · Fotos de los relevos | Reexportadas el 13-nov (Angel a 2×; Gregory y José a su tamaño nativo) |
| M-10 · Logo y cinta | Portados; póster de la 20 en `cierre/cierre-poster.webp` |
| M-11 · Pósteres del presentador | 09, 10, 18 y 20 (abajo) |

Con lo que hay hoy, el mazo tiene **19 diapositivas y suma 955 s (15 min 55 s)**: la 07 baja 25 s, la 12 se cae (−35 s) y la 11 sube 10, la 13 baja 10, y como faltan a la vez M-02 y M-05 la 18 sube 15 y la 19, 5 (GUION, «Si falta un medio»). Con todos, **20 diapositivas y 995 s (16 min 35 s)**, lo que dice el guion; se comprueba con `?con=todos` en desarrollo. El presentador enseña la suma de lo que hay como «plan» al lado del objetivo de 16:35. Las hojas de contacto del estado de hoy están en `verificacion/mazo.png` y `verificacion/mazo-pasos.png` (no van al repositorio).

Los pósteres del presentador (M-11) ya están: `public/medios/posters/relevo-angel.webp` (09, el estado final del relevo; el guion pide «la 09 y la 10 como póster», 10, «Si falla», 4), `public/medios/posters/veinticinco-dias.webp` (10), `public/medios/lendex/respaldo-final.webp` (18, el último cuadro de M-07, con RD$10,000 al 20 %: las cifras que José va a decir) y `public/medios/cierre/cierre-poster.webp` (20, el estado final después de Z-02). Si cambia lo que se ve en una de ellas, su póster se vuelve a sacar del estado final con `?revision=1`.

---

## M-01 · La libreta (02, 06 y 19)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/libreta/libreta-1690x850.webp` | 3380 × 1700 px (1690 × 850 a 2×), WebP. Segundo recorte de la foto | 06 |
| `public/medios/libreta/libreta-1690x620.webp` | 3380 × 1240 px (1690 × 620 a 2×), WebP. Primer recorte | 02 y 19 |
| `public/medios/libreta/credito.txt` | Una línea, UTF-8: `Foto: Zhonyas, [negocio], [lugar], nov 2026`, con el negocio y el lugar de verdad | 02, 06 y 19 |

La foto: una libreta propia de un colmado o un salón cercano a la sede, abierta en una página de fiado o de ventas, horizontal, de día, con permiso del dueño por escrito; que no se lea ningún nombre de cliente ni ningún monto (GUION, M-01; R-12).

**06 · libreta.** Hoy va en negro (no se pinta nada, ni el crédito) mientras habla Gregory, y la nota del paso lo dice. Al llegar `libreta-1690x850.webp`:
- la foto ocupa 1690 × 850 en x 115, y 115, a sangre y sin titular, y entra con el corte (sin animación);
- el crédito de `credito.txt` sale a 32 px en `--zh-texto-2`, 16 px bajo la foto (y 981), y también en el panel de fuentes del presentador;
- desaparece de la nota el aviso «Sin la foto de la libreta (M-01)».

Si llega la foto sin `credito.txt`, la foto sale sin crédito y el presentador avisa. Si llega solo uno de los dos recortes, también avisa (la 02 y la 19 usan el otro).

## M-02 · Pymex por dentro (07, y 08 de respaldo)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/pymex/toma-1.mp4` (o `toma-1.webm`) | MP4 H.264 (o WebM VP9), grabado a 1920 × 1080 y 60 fps, sin sonido, 20–25 s. Toma 1: el inventario, producto por producto, con lo que vale | 07, paso 0 |
| `public/medios/pymex/toma-1-poster.webp` | WebP de 1920 × 1080: el primer cuadro de la toma | 07 |
| `public/medios/pymex/toma-2.mp4` y `toma-2-poster.webp` | Igual. Toma 2: una factura con sus abonos y el saldo que falta | 07, paso 1 |
| `public/medios/pymex/toma-3.mp4` y `toma-3-poster.webp` | Igual. Toma 3: el reporte del período que dice qué producto deja más | 07, paso 2 |
| `public/medios/pymex/toma-3-ultimo-cuadro.webp` | WebP de 1920 × 1080: el último cuadro de la toma 3, al tamaño grabado. No a 1440 × 810: la 08 lo enseña a 1690 de ancho y tendría que ampliarlo | 08, si no llega M-03 |

Las tomas: datos de ejemplo de una ferretería con nombre creíble; sin fechas de creación, nombres de repos, pestañas, marcadores ni la dirección del panel; nunca el tablero de la landing (GUION, M-02; R-08). En la diapositiva se ven a 1440 × 810, nunca ampliadas, y el texto de la interfaz tiene que medir 24 px o más ahí.

**Ya está (no tocar):** `public/medios/pymex/pagina-publica.webp`, el respaldo del guion: `investigacion/productos/pymex/escritorio-05-flujo-4-pasos.png` pasada a WebP (1920 × 1080, calidad 0,9, con el Chrome instalado). Se ve a su tamaño, sin ampliar ni reducir: la 07 enseña la ventana de x 240 a 1680 y de y 0 a 757, donde acaba la sección del flujo (con 810 asomaban 51 px de la sección siguiente). La 08 ya no la usa. **Pendiente de José:** la cabecera de la landing (el rótulo en mayúsculas, el titular «Un flujo que habla el idioma de tu negocio.», las cuatro tarjetas numeradas y «Conocer Pymex») es justo el kit que marca como slop; se puede recortar a la columna de los cuatro pasos o cambiar el respaldo por una pantalla de Pymex por dentro (revisión del 13-nov). Cambia el guion: lo decide él.

**07 · pymex-por-dentro.** Hoy usa la página pública, en 1440 × 757 en x 115, y 160, con el crédito «Página pública de Pymex» arriba (x 115, y 115, 32 px), dura 55 s, tiene un solo paso y Gregory dice las tres preguntas en voz. Solo cuando están **las tres tomas con sus tres pósteres** (una o dos no cambian nada):
- pasa a tres pasos, una toma por paso, en 1440 × 810 en x 115, y 160; entre tomas, corte seco;
- cada toma corre una vez y se queda en su último cuadro (sin bucle); si no arranca, se ve su póster;
- el crédito pasa a «Pymex por dentro, con datos de ejemplo», a la vista toda la diapositiva;
- la duración pasa de 55 a 80 s y las notas, a las de una pregunta por toma, con su «Si falla» (y los [CONFIRMAR con Steven]);
- el total de la charla sube 25 s (GUION, «Si falta un medio»). La 18 y la 19 miran también este medio para sus segundos de más.

Si están las tomas y falta `toma-3-ultimo-cuadro.webp`, el presentador lo avisa y la 08 sigue con el titular solo.

## M-03 · José y Gregory en el ITLA (08)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/itla/jose-gregory-1690x620.webp` | 3380 × 1240 px (1690 × 620 a 2×), WebP, ya recortada. Horizontal, de día, con el ITLA reconocible | 08 |

El crédito, «Foto: Zhonyas, ITLA, nov 2026», está en el código: no hace falta `.txt`.

**08 · proyecto-final.** La foto va en 1690 × 620 en x 115, y 345, con el crédito a 32 px 16 px debajo (y 981); el titular entra en el paso 1. Qué foto sale, por orden:
1. con M-03: la foto del ITLA, con «Foto: Zhonyas, ITLA, nov 2026»;
2. sin M-03 y con `toma-3-ultimo-cuadro.webp` (M-02): el último cuadro de la toma 3, centrado, con «Pymex por dentro, con datos de ejemplo»;
3. sin los dos (hoy): ninguna. El paso 0 queda vacío y en el paso 1 entra el titular solo sobre el fondo, con Z-01, como la 02 y la 19 sin la libreta. El guion no trae este caso; la cabecera de la landing, que iba antes, ponía otro titular, un rótulo en mayúsculas y el kit de tarjetas debajo del titular de la charla, y repetía la captura de la 07 (revisión del 13-nov; A-06, A-24, C-12).

La duración no cambia (55 s). Los avisos del paso 0 (plegados en el presentador) dicen cuál de los respaldos va mientras falte M-03.

## M-04 · El respaldo del agujero negro (10, tecla V)

Z-10 ya está portado (`src/marca/agujero/`) y la 10 entra por él: lo que falta es el **video de respaldo**.

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/agujero/respaldo.mp4` (o `respaldo.webm`) | MP4 H.264 (o WebM VP9) de 1920 × 1080 a 60 fps, sin sonido, unos 5 s: el agujero de zhonyas.com abriéndose, grabado en la laptop del día | 10, tecla V |
| `public/medios/agujero/respaldo-poster.webp` | WebP de 1920 × 1080: el primer cuadro del video | 10 |

**Ya está (no tocar):** `public/medios/posters/relevo-angel.webp`, el póster de la 09 (el estado final del paso 1, sacado igual el 13-nov), y `public/medios/posters/veinticinco-dias.webp`, el póster de la 10, para el presentador y las miniaturas (C-02; M-11; GUION 10, «Si falla», 4: «la 09 y la 10 se ven como póster»). Es el estado final de la 10 a 1920 × 1080, sacado con `?revision=1` y pasado a WebP con el Chrome del equipo (calidad 0,9). Si cambia lo que se ve en la 10, se vuelve a sacar igual.

**10 · veinticinco-dias.** Hoy la V no hace nada en la 10: si en vivo no se vio el agujero, Angel sigue con la cifra (el corte seco del «si no llega»), y la nota del «Si falla» lo dice. Al llegar el video **con su póster**:
- V pone el video a pantalla completa, encima de la cifra, y otra V lo quita. Funciona desde la sala y desde el presentador (las dos ventanas lo siguen), solo mientras la 10 está en pantalla;
- corre una vez y se queda en su último cuadro; al salir de la 10 se cierra solo;
- el punto 3 del «Si falla» pasa a «V pone el video del efecto (M-04), y V otra vez lo cierra».

La duración no cambia (35 s).

## M-05 · El iPhone que se cierra solo (12)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/iphone/iphone.mp4` (o `iphone.webm`) | MP4 H.264 (o WebM VP9), en 4:5, de 676 × 850 o más y sin ampliar: el recorte de la grabación de pantalla del propio iPhone, centrado en el agujero. 8–10 s, sin sonido. La versión de zhonyas-web anterior al commit #105, en un canal de vista previa de Firebase | 12 |
| `public/medios/iphone/iphone-poster.webp` | WebP del mismo tamaño: el primer cuadro | 12 |

**Plazo: viernes a las 9 p. m.** (GUION, M-05). El crédito, «Grabación de pantalla de un iPhone, versión anterior al arreglo», está en el código.

**Hoy la 12 no está en el mazo** («se cae la 12 y la 11 suma 10 s»): la 11 dura 95 s y, en el paso 2, la nota trae la explicación del fallo para decirla ahí. Al llegar el video **con su póster**:
- la 12 entra entre la 11 y la 13 (`src/diapositivas/indice.ts`): el titular a la izquierda, en la columna de 1014 px, y la grabación a la derecha, en 676 × 850 en x 1129, y 115, con el crédito a 32 px abajo a la izquierda (pie en y 965);
- paso 0: el titular y el póster; paso 1: corre la grabación, una vez, y se queda en su último cuadro;
- la 11 vuelve a 85 s y su paso 2 a «El 2 de octubre, el del iPhone: se cerraba solo. Ahorita se los enseño.»;
- el total de la charla sube 25 s (GUION, «Si falta un medio»).

## M-06 · El celular de otra persona (13)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/celular/celular-de-otro.mp4` (o `.webm`) | MP4 H.264 de 1920 × 1080, en horizontal 16:9, sin sonido, 10–12 s: el celular de alguien que no es del equipo (mejor un Android de gama media) con la versión de hoy, zhonyas.com → Contacto → el agujero abre. Sin notificaciones ni datos de esa persona, y con su permiso (R-12) | 13 |
| `public/medios/celular/celular-de-otro-poster.webp` | WebP de 1920 × 1080: el primer cuadro (una mano con el celular) | 13 |
| `public/medios/celular/nombre.txt` | Una línea, UTF-8: solo el nombre, como se dice en voz («María») | 13 (crédito y notas) |

**13 · celular-de-otro.** Hoy va sin video («Si falla» del guion): dos pasos y 45 s. Paso 0, la pantalla vacía mientras Angel hace la pregunta al público; paso 1, el titular solo, por corte. La nota del paso 0 trae la frase que Angel dice en lugar del video. Al llegar el video **con su póster**:
- tres pasos y 55 s: paso 0, el póster (sin titular); paso 1, corre el video, una vez, y se queda en su último cuadro; paso 2, el titular, por corte;
- el video va en 1102 × 620 en x 115, y 345, y el crédito «El celular de [nombre], que no es del equipo, nov 2026», a 32 px bajo el video y en una línea (x 115, y 981), como el de la 02, la 06, la 08 y la 19;
- las notas pasan a las del guion, con el nombre de `nombre.txt`;
- el total de la charla sube 10 s.

Si llega el video sin `nombre.txt`, el video sale **sin crédito** (nunca «[nombre]» en pantalla), las notas dicen «[nombre]» y el presentador lo avisa.

## M-07 · El respaldo de la demo de Lendex (18, tecla V)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/lendex/respaldo.webm` (o `respaldo.mp4`) | WebM VP9 (o MP4 H.264) de 1920 × 1080 a 60 fps, sin sonido, 60 s o menos: la propia 18 grabada con red, con RD$10,000, 20 %, 12 cuotas, Mensual y Francesa, hasta que se ve la cuota | 18, tecla V |
| `public/medios/lendex/respaldo-poster.webp` | WebP de 1920 × 1080: el primer cuadro del video | 18 |
| `public/medios/lendex/respaldo-final.webp` | WebP de 1920 × 1080: el último cuadro, con la cuota de RD$2,252.65 y el total de RD$27,031.75 | 18: póster del presentador, miniaturas y capturas |

**Ya está (13-nov):** grabado con red en lendexgp.com con `node scripts/lendex-grabar-demo.mjs --guion` (10,2 s, 59 fps en movimiento). Es la geometría de la 18: la página de escritorio de Lendex a 1920 × 1080, recortada a la tarjeta «Calculadora de Préstamos» (de x 1104 a 1776 y de y 316 a 764, vuelta a medir el 13-nov) y ampliada 2× en 1344 × 896 en x 288, y 115; arranca con lo que trae la calculadora (RD$50,000 al 5 %), escribe 10000 y 20 y se queda en la cuota. El script comprueba la cuota y el total antes de guardar nada, y deja la ficha en `verificacion/lendex/respaldo.json`. Si Lendex cambia (C-26; por ejemplo, al poner las tildes), se vuelve a grabar con la misma orden: el video enseña la calculadora como esté ese día.

Lo de Lendex que no es un archivo (GUION, M-07; lo decide José): que `/app?calculadora` abra la calculadora, las tildes de «Tasa de Interés» y «amortización», y que nada se despliegue en lendexgp.com desde el sábado.
- La 18 ya carga `https://lendexgp.com/app?calculadora`. Hoy Lendex no hace nada con ese parámetro, así que la 18 sigue el camino del guion para ese caso: tres pasos; en el paso 1 se ve Lendex sin recorte, a 1920 × 1080 sin ampliar, con «Calculadora de Préstamos» a la vista; Angel lo pulsa (la sala recupera el teclado sola) y el clic siguiente pasa al recorte de 2× por corte.
- Cuando José despliegue `?calculadora`: `node scripts/lendex-grabar-demo.mjs --guion --comprobar` dice «Lendex YA abre la calculadora sola»; entonces se pone `LENDEX_ABRE_LA_CALCULADORA = true` en `src/marca/lendex/DemoLendex.tsx` y se vuelve a compilar: la 18 pasa a dos pasos y abre directo en el recorte. Se vuelve a grabar el respaldo (las tildes).
- El día antes, la misma orden con `--comprobar` dice si Lendex se sigue dejando embeber y si el camino da RD$2,252.65; si no se deja, va el plan B del guion.

**Lendex en oscuro, el día de la charla** (MOTOR §2, «En la sala», punto 7). El video y sus pósteres están grabados en oscuro; lo vivo se pinta con el `prefers-color-scheme` que el navegador le da al iframe. Si le llegara el claro, el paso 1 de la 18, la pantalla de entrar de Lendex, sacaría la mitad izquierda del proyector en blanco («Bienvenido de nuevo», usuario y contraseña) entre diapositivas negras, y el recorte del paso 2 tendría los campos más claros que el video. En la ThinkPad no pasa aunque Windows tenga las apps en claro (`AppsUseLightTheme = 1`): el iframe lleva `color-scheme: dark` (`ESQUEMA_LENDEX`, en `src/marca/lendex/DemoLendex.tsx`) y Chrome y Edge 157 se lo pasan a Lendex (medido el 13-nov con Playwright sin emular el tema, `colorScheme: null`; con la emulación por defecto, `'light'`, Lendex sale en claro porque la emulación manda también dentro del iframe, y así salió en la revisión r2). Si otro navegador o versión no lo hiciera, el presentador lo avisa en la franja roja («Lendex saldrá en claro en la demo…») y en los avisos de la nota del paso 0 de la 18; entonces, Windows con las apps en oscuro (Configuración → Personalización → Colores → modo de aplicación: Oscuro) o Chrome abierto con `--force-dark-mode` (el acceso directo de R-14, con Chrome cerrado del todo antes). Lo que el aviso no ve: Lendex recuerda su sol/luna en ese navegador (su `localStorage`, «theme»), y lo recordado manda sobre el tema; si en un ensayo alguien lo pasó a claro, sale en claro sin aviso. Por eso, al recorrer la demo la mañana de la charla (GUION, R-01), que la pantalla de entrar salga oscura. Si sale clara, antes o en plena charla, la luna de arriba a la derecha de esa pantalla la pasa a oscuro en el acto y queda guardado (comprobado el 13-nov).

**Del 12-nov (laboratorio):** `demo-calculadora.webm`, `demo-inicio.webp` y `demo-poster.webp`, la versión estrecha de Lendex con RD$50,000 al 5 % (`node scripts/lendex-grabar-demo.mjs`, sin `--guion`). La 18 ya no los usa para la V ni para el póster: enseñaban el 5 % mientras se dice el 20 % (revisión del 13-nov). Solo si faltara `respaldo-final.webp`, el póster del presentador sería `demo-inicio.webp`, que no tiene resultados.

**18 · demo-lendex.** Con el video y su póster: la V lo pone, en la sala y en el presentador, desde el principio y una sola vez, y se queda en su último cuadro; el punto 1 del «Si falla» es el del guion («…grabado antes de la charla con diez mil pesos»: José lee la cuota y el total del video). **Si se borra el video:** el guion dice que sin video de respaldo no hay demo en vivo; la V no hace nada (nunca un video con otras cifras que las que se dicen), el punto 1 del «Si falla» lo dice y el presentador avisa en la franja roja.

La duración no cambia (110 s; 125 si faltan a la vez M-02 y M-05). Si llega el video sin su póster, o el póster sin el video, no se usa y el presentador lo avisa; si falta `respaldo-final.webp`, también.

## M-08 · El QR (20)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/cierre/qr-zhonyas.svg` | SVG sin ancho ni alto: a https://zhonyas.com (sin «www», que da 404), nivel M, módulos #010204 sobre la placa #f7f7fa, con zona de silencio de 4 módulos. Se pinta a 363 px (11 px por módulo) | 20, paso 1 |

**Ya está.** Lo genera `npm run qr`, en local y sin ningún servicio web, y lo comprueba leyéndolo con jsQR a 360, 180 y 99 px; `npm run qr -- --solo-comprobar` vuelve a leer el que hay sin regenerarlo. Falta lo que no hace un script (GUION, M-08): leerlo desde la última fila con tres teléfonos, uno de ellos un Android de gama media, y en el proyector de la sala.

**20 · cierre.** Al terminar Z-02 sale abajo a la izquierda, bajo la acción, con el pie en y 972 y el borde en x 115. El guion lo ponía abajo a la derecha, pero la cinta, medida en captura donde la deja Z-02, acaba en y 636 y la placa la pisaría; manda Z-02 tal cual y se mueve el QR (GUION, 20; 20-cierre.tsx lo explica). **Pendiente de José:** el guion solo permite mover el texto, y el cierre está en lo que tiene que aprobar (encabezado, punto 4). Si aprueba el QR abajo a la izquierda, hay que corregir en GUION 20 su posición y la medida real de la cinta (x 1093–1657, y 571–636; revisión del 13-nov). Sin el QR (si se borra el archivo, o con `?sin=M-08`) queda `zhonyas.com` a 60 px, que ya está en pantalla.

Si se regenera el QR, se vuelve a sacar `public/medios/cierre/cierre-poster.webp`, el póster de la 20 para el presentador, porque lo lleva dentro.

## M-09 · Las fotos de los relevos (03, 09 y 14)

| Archivo | Tamaño y formato | Para |
|---|---|---|
| `public/medios/equipo/angel/foto.webp` | 965 × 1240 (2× del retrato de 620 px de alto), WebP 0,9 | 09 |
| `public/medios/equipo/gregory/foto.webp` | 664 × 853, su alto nativo, sin ampliar | 03 |
| `public/medios/equipo/jose-leonardo/foto.webp` | 664 × 853, su alto nativo, sin ampliar | 14 |

**Ya están (13-nov).** Reexportadas de `investigacion/marca/equipo/fotos/*/photo.jpg` con el mismo recorte central de proporción 471,6 : 606 que usaban (src/marca/relevo/equipo.ts), con el Chrome del equipo. Antes estaban las tres a 1× (482 × 620 y 483 × 620). La de Angel (4160 × 2773) da para 2×; las de Gregory y José (1280 × 853) no: si José las quiere a 2×, hacen falta fotos nuevas de los dos (GUION, M-09). Los atlas y su JSON ya estaban.
