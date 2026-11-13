# Guion final: la charla de Zhonyas en el ITLA

Escrito el 12-nov-2026. Este guion manda sobre los tres candidatos de `investigacion/guion/`. La base es `guion-historias.md`, que tiene la mejor nota media de los tres jueces (7.3 contra 6.8 y 5.5). Le injerté lo mejor de `guion-estudiante.md` y de `guion-visual.md`, y corregí todo lo que señalaron `juicio-publico.md`, `juicio-slop.md` y `juicio-reglas.md`. La lista de esas correcciones está al final. Las rutas de medios son relativas a `investigacion/`.

---

## Encabezado

**La idea en una frase:** El usuario de su proyecto final ya está en su calle.

La idea habla del estudiante y deja una imagen: la libreta del colmado de su calle. Sale en la 02, sobre la foto de esa libreta, después de una mano alzada que la vuelve verdad en la sala. Vuelve en la 20, con el QR. No insinúa nada sobre el origen de Pymex: Pymex compite con la libreta, no sale de ella (decisión 3).

**Duración total sumada:** 995 s = **16 min 35 s**, en 20 diapositivas. Las preguntas van aparte. Lo que sobra del turno de 20 min (3 min 25 s) es margen, no tiempo de preguntas. En `src/configuracion.ts` el objetivo del cronómetro pasa de 18 a 16:35.

**Reparto por orador**

| Orador | Diapositivas | Segundos | Minutos |
|---|---|---|---|
| José Leonardo Reyes | 01–02 y 14–20 | 480 | 8 min 00 s |
| Gregory Martínez | 03–08 | 280 | 4 min 40 s |
| Angel Grullon | 09–13 | 235 | 3 min 55 s. Además maneja el teclado en la demo de la 18, sin hablar |

**Cambios de naturaleza.** Nunca pasan más de 2 min 25 s sin uno (principio 8).

| Minuto | Qué cambia | Diapositiva |
|---|---|---|
| 0:20 | Pregunta a mano alzada, en dos tiempos, con la libreta en pantalla | 02 |
| 1:35 | Relevo: habla Gregory (Z-05) | 03 |
| 4:00 | Pymex por dentro, grabado | 07 |
| 6:15 | Relevo: habla Angel. A las 6:40 el agujero negro se abre en vivo (Z-10) | 09 → 10 |
| 8:40 | Video: el iPhone que se cierra solo | 12 |
| 9:15 | Pregunta a mano alzada (Angel) y video del celular de otra persona | 13 |
| 10:10 | Relevo: vuelve José. A las 10:30, pregunta a mano alzada | 14–15 |
| 12:40 | Demo en vivo de Lendex con un monto que dice el público | 18 |
| 14:30 | La tarea para esta semana; a las 15:30, la cinta y el QR | 19–20 |

**Cómo termina cada bloque: lo que el estudiante se lleva**

| Bloque | Quién | Última pantalla | Qué hace el estudiante |
|---|---|---|---|
| Apertura | José | «El usuario de su proyecto final ya está en su calle.» | Mira su calle de otra manera |
| 1 · Una libreta | Gregory | «Escojan un proyecto final que un negocio quiera usar.» | Lo aplica al escoger tema |
| 2 · Un agujero negro | Angel | «Está terminado cuando funciona en el celular de otro.» | Lo aplica antes de entregar |
| 3 · Un prestamista | José | «Esta semana, pregúntenle a un negocio qué anota a mano.» | Lo hace esta semana |

**La acción para esta semana.** Se queda la recomendada, con el método del guion del estudiante: «pregúntenle a un negocio de su calle qué anota a mano; anoten lo que les diga, con sus palabras, y busquen tres preguntas que esa libreta no contesta». Hay cuatro razones:
1. La puede hacer cualquiera, esta semana, sin dinero y sin saber programar (TEDx, 05 §6).
2. Repite el método de Pymex, las tres preguntas que una libreta no contesta, así que la charla le enseña cómo hacerla.
3. Le da al estudiante el problema y el primer usuario de un proyecto final.
4. No es un pitch: no le pide a nadie que contrate a Zhonyas.

Se descartó «denle su proyecto a alguien de fuera y mírenlo usarlo», porque buena parte de la sala todavía no tiene proyecto. Esa idea queda como consejo en la 13.

**Lo que José tiene que aprobar antes de construir**
1. **La excepción de A-56.** Hay cinco escenas de más de 1 s: los tres relevos (Z-05, unos 1.7 s con el saludo), Z-10 y Z-02. La decisión 7 pide los relevos.
2. **La lectura de A-54.** Va un solo Z por diapositiva. Z-01 se puede repetir clic a clic dentro de la misma diapositiva (11, 15 y 16), y cada clic trae lo que se nombra en ese momento.
3. **Punto decimal en pantalla** («85.2 %», «RD$27,031.75»), como lo muestra la calculadora de Lendex (es-DO), que sale en vivo. Así hay una sola convención en todo lo que ve la sala (A-20). Si José prefiere la coma, se cambia en `datos.ts` y en los textos de este guion.
4. **El cierre.** La cinta se queda donde la deja Z-02 tal cual, a la derecha, con `zhonyas.com` encima, como «Nosotros» en la web. La idea va arriba a la izquierda.
5. **Lendex.** Tres cosas: que `/app?calculadora` abra la calculadora, las dos tildes que faltan y no desplegar nada desde el sábado (M-07).
6. Las frases marcadas **[CONFIRMAR]** (R-06).
7. **El nombre del juego.** No va en la charla: se contesta en las preguntas con una frase (decisión 8; R-07).

**Convenciones**
- **Palabras.** Se cuentan las que pone el mazo. Una cifra con su «%» cuenta como una palabra; «25 sep» y «25 días» cuentan como dos. No cuentan el logo, las fuentes ni los créditos a 32 px, ni el texto que trae una grabación o la calculadora en vivo (A-09).
- **Tamaños.** Son cinco en todo el mazo y como mucho tres por diapositiva (§4.2; A-49): cifra a 300 px, frase protagonista a 128 px, titular a 96 px, etiqueta a 60 px y fuente o crédito a 32 px. Arial, pesos 400 y 700. No hay monoespaciada, porque no hay consola.
- **Retícula.** Margen de 115 px. Los titulares empiezan en x 115, y 115 y van alineados a la izquierda, con `text-wrap: balance`. Se centran solo la 01 y el paso 0 de la 20 (2 de 20). Nada imprescindible por debajo de y 972 (A-30).
- **Color.** Fondo `--zh-fondo` quieto. Las cifras van en `--zh-texto`, que es el dato del país o del mundo, y las etiquetas en `--zh-texto-2`. Las cifras nuestras (10 y 11) también van en `--zh-texto`, porque el degradado no lleva texto; es una excepción declarada a A-35 (R-15). El degradado sale en tres sitios: el logo (01 y 20), la cinta (20) y la línea de «lo nuestro» (11). Los colores de Lendex y de Pymex solo salen dentro de su producto.
- **Movimiento.** El cambio de diapositiva es un corte seco (Z-00), salvo Z-10 (entrada de la 10) y Z-02 (dentro de la 20). Cada curva y cada duración llevan su comentario de fuente en el código (A-55). Z-01 es un fundido en su sitio de 280 ms con `cubic-bezier(0.22, 1, 0.36, 1)`: la duración es la de Vercel (05 §11.3) y la curva, la de la marca (C-14). Ningún video va en bucle: cada uno corre una vez y se queda en su último cuadro (C-11).
- **Preguntas.** Ningún titular termina en «?». Las preguntas de verdad están marcadas «Pregunta al público» (A-05): la 02, la 13, la 15 y la 18. Las retóricas, que no esperan respuesta, están marcadas «retórica».
- **Notas.** Cada paso lleva la **Entrada**, que es la frase entera con que arranca el orador (40 palabras o menos), y el **Apoyo**, 3 o 4 palabras para el resto. Cuando importa decirlo igual, lleva también el **Remate**. En las diapositivas de demo, video o WebGL lleva el **Si falla**.
- **«Zhonyas».** Antes del primer ensayo, José fija cómo se pronuncia y los tres lo dicen siempre igual (C-31).

---

## Tabla resumen

| NN | id | Orador | s | Palabras en pantalla | Z-id |
|---|---|---|---|---|---|
| 01 | portada | José | 20 | 0 | — (logo quieto) |
| 02 | su-calle | José | 75 | 11 | Z-01 |
| 03 | relevo-gregory | Gregory | 25 | 2 | Z-05 |
| 04 | sin-rnc | Gregory | 35 | 7 | Z-01 |
| 05 | efectivo | Gregory | 35 | 3 | Z-01 |
| 06 | libreta | Gregory | 50 | 0 | — (corte) |
| 07 | pymex-por-dentro | Gregory | 80 | 0 | Z-12 |
| 08 | proyecto-final | Gregory | 55 | 9 | Z-01 |
| 09 | relevo-angel | Angel | 25 | 2 | Z-05 |
| 10 | veinticinco-dias | Angel | 35 | 5 | Z-10 (entrada) |
| 11 | tres-arreglos | Angel | 85 | 14 | Z-01 |
| 12 | iphone | Angel | 35 | 6 | Z-12 |
| 13 | celular-de-otro | Angel | 55 | 9 | Z-12 |
| 14 | relevo-jose | José | 20 | 3 | Z-05 |
| 15 | prestamista-2014 | José | 55 | 15 | Z-01 |
| 16 | negocio-2024 | José | 40 | 14 | Z-01 |
| 17 | veinte-mensual | José | 35 | 9 | Z-01 |
| 18 | demo-lendex | José (Angel al teclado) | 110 | 3 | Z-08 |
| 19 | tarea | José | 60 | 10 | Z-01 |
| 20 | cierre | José | 65 | 19 | Z-02 |
| | **Total** | | **995** | **141** | |

- **Duración:** 995 s, dentro de 960–1020 (decisión 2).
- **Palabras:** 141 en total. Media de 7.05 por pantalla (el límite es 12) y máximo de 19, en la 20 (el límite es 20).
- **Las 10 primeras pantallas suman 39 palabras** (fila 3 del marcador: 40 o menos).
- **Titulares:** todos tienen verbo, 12 palabras o menos y 2 líneas o menos. El más largo es «Esta semana, pregúntenle a un negocio qué anota a mano.», con 55 caracteres: dos líneas a 96 px en 1690 px (C-08).

---

## Apertura · José (0:00–1:35)

### 01 · portada · [José] · 20 s
- **Composición:** portada.
- **En pantalla:**
  - Texto (0 palabras): ninguno. «Zhonyas» es parte del logo.
  - Medios: `marca/logo/zhonyas-logo-escena.svg`, como queda la web después de hidratarse. La caja SVG mide el alto de la pantalla, `viewBox="0 0 1254 1254"`, y el monograma queda de unos 336 px de ancho, quieto, con veta y sombra (03 M1; §4.3). Ya está en pantalla cuando entra el público.
- **Movimiento:** ninguno (M1: el logo no tiene entrada). Se mueve una sola vez en la charla, en la 20.
- **Pasos:** paso 0: el logo.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Buenas tardes. Soy José Leonardo Reyes, estudio aquí en el ITLA igual que ustedes, y con Gregory y Angel trabajo en Zhonyas, un estudio de software y diseño de Santiago que le hace sistemas a negocios como Layla Comercial.»
    - Apoyo: una sola frase · mirar a la sala · clic.
- **Datos:** ninguna cifra. Layla Comercial se nombra con el permiso de José (decisión 4). Se dice «buenas tardes» o «buenos días», según la hora.

### 02 · su-calle · [José] · 75 s
- **Composición:** a sangre. El titular va arriba (x 115, y 115; 96 px; dos líneas, hasta y ≈ 307). Debajo va la foto, recortada a 1690×620 (x 115, y 345 → 965).
- **En pantalla:**
  - Texto (11 palabras): `El usuario de su proyecto final ya está en su calle.`
  - Crédito (32 px, `--zh-texto-2`, bajo la foto): «Foto: Zhonyas, [negocio], [lugar], nov 2026».
  - Medios: **por conseguir**, M-01: la libreta de un negocio cercano a la sede, primer recorte.
- **Movimiento:** Z-01. El titular entra en su sitio, sin desplazamiento ni escala. La foto entra con el corte desde el logo y no tiene animación propia.
- **Pasos:**
  - paso 0: la foto sola;
  - paso 1: el titular.
- **Notas por paso:**
  - Paso 0 · **Pregunta al público**, en dos tiempos y sin clic entre ellos.
    - Entrada: «Antes de arrancar, quiero ver manos: los que tienen que entregar el proyecto final este año o el que viene.»
    - Apoyo: esperar tres segundos · si suben muchas: «Casi todos.» · si suben pocas: «Los demás, ya les toca; esto les sirve igual.»
    - Segundo tiempo: «Ahora, dejen la mano arriba si cerca de su casa hay un colmado o un salón que apunta algo en una libreta: el fiado o lo que vendió.»
    - Apoyo: decir lo que se ve · si quedan pocas: «Fíjense la próxima vez que vayan a comprar.»
  - Paso 1
    - Entrada: «Miren cuántas manos siguen arriba. Esa es la idea de hoy: el usuario de su proyecto final ya está en su calle.» Si quedaron pocas manos, empieza: «Miren esa libreta. Esa es la idea de hoy:». Luego, dos segundos de silencio.
    - Remate: «Se la vamos a contar con tres historias, y cada uno cuenta la suya: Gregory, la de nuestro proyecto final; Angel, la de un efecto que no se dejaba terminar; y yo, la de un prestamista. Gregory.»
    - Apoyo: silencio · tres historias · entregar el clicker.
- **Datos:** ninguna cifra. Las tres historias son tres de verdad (A-11) y se anuncian solo en voz, sin pantalla de agenda (A-32). Las manos son de la sala: no se comparan con ninguna estadística.

---

## Historia 1 · Gregory: una libreta (1:35–6:15)

### 03 · relevo-gregory · [Gregory] · 25 s
- **Composición:** dividida 1,2:0,8, la del perfil del equipo en la web. El retrato va a la izquierda; el nombre y el personaje, a la derecha.
- **En pantalla:**
  - Texto (2 palabras): `Gregory Martínez` (96 px).
  - Medios:
    - foto: `marca/equipo/fotos/gregory/photo.jpg` (1280×853), recortada en la proporción 440:620 y centrada en la cara. Se exporta a su resolución nativa, unos 605×853 (1.4× sobre 440×620), sin ampliarla: el original no da para 880×1240 (A-33);
    - personaje: `marca/equipo/sprites/atlas/gregory.webp`, con `marca/equipo/sprites/sprite-atlas.json` (`wave` e `idle`), al tamaño del perfil de la web y con `image-rendering: pixelated`.
- **Movimiento:** Z-05 (03 M5; `team-profile.tsx` 96–112). Sin el fondo desenfocado de la web (A-44).
  - Paso 0: la foto aparece con el corte en la caja de su tarjeta de la web (474×608 en x 220, y 310), así que tiene de dónde salir (C-10 b).
  - Paso 1: la foto vuela al retrato (440×620 en x 153.6, y 230; `scale .94`, `rotateY 12°`, `rotateZ −3°`) en 700 ms con `(0.22, 1, 0.36, 1)`.
  - El nombre entra desde +60 px en 450 ms, con 180 ms de retraso.
  - El personaje aparece a los 500 ms y sube 10 px en 400 ms. Saluda **una vez** con `wave` (cuadros 1-2-3-2-1 a 6 fps, unos 0.83 s) y se queda quieto en `idle`, sin el respiro de 1 px (C-11).
- **Pasos:**
  - paso 0: la foto en su caja, mientras José entrega el clicker;
  - paso 1: Gregory pulsa y corre Z-05.
- **Notas por paso:**
  - Paso 0: nadie habla. José le da el clicker a Gregory (relevo del guion visual).
  - Paso 1
    - Entrada: «Gracias, José. Soy Gregory Martínez y hago diseño de producto en Zhonyas. Pymex es nuestro proyecto final del ITLA, el de José y mío. Y en un proyecto final, lo primero que te piden es el problema, con datos.»
    - Apoyo: diseño de producto · proyecto final · el problema, con datos.
    - Si falla: si la foto o el atlas no cargan, el motor deja el estado final (retrato y nombre) y Gregory sigue.
- **Datos:** ninguna cifra. Pymex es el proyecto final de José y Gregory en el ITLA (decisión 3).

### 04 · sin-rnc · [Gregory] · 35 s
- **Composición:** una cifra.
- **En pantalla:**
  - Texto (7 palabras): `85.2 %` (300 px) · `de las mipymes no tiene RNC` (60 px, `--zh-texto-2`).
  - Fuente (32 px): «BCRD y MICM, ENMIPYMES 2022–2023, pp. 9 y 11».
  - Medios: ninguno.
- **Movimiento:** Z-01. La cifra, su etiqueta y la fuente entran juntas, en su sitio.
- **Pasos:**
  - paso 0: vacía;
  - paso 1: la cifra con su etiqueta y su fuente.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Los nuestros salieron de la encuesta de mipymes del Banco Central y el MICM, la de 2022 y 2023. Contaron 404,034 mipymes en todo el país. ¿Cuántas no tienen RNC?» (retórica: pausa corta y clic).
    - Apoyo: 2022 y 2023 · cuatrocientas cuatro mil · pausa.
  - Paso 1
    - Entrada: «El 85.2 %: más de ocho de cada diez son informales.»
    - Apoyo: «ochenta y cinco punto dos» · informales.
- **Datos:** 404,034 mipymes y 85.2 % informales, sin RNC (2022–2023). BCRD y MICM, ENMIPYMES, pp. 9 y 11: https://cdn.bancentral.gov.do/documents/otras-publicaciones/documents/ENMIPYMES-Documento-principales-resultados-aspectos-metodologicos.pdf (§6.1, fila 5). El año se dice en voz.

### 05 · efectivo · [Gregory] · 35 s
- **Composición:** una cifra.
- **En pantalla:**
  - Texto (3 palabras): `92.7 %` (300 px) · `usa efectivo` (60 px, `--zh-texto-2`).
  - Fuente (32 px): «BCRD y MICM, ENMIPYMES 2022–2023, p. 25».
  - Medios: ninguno.
- **Movimiento:** Z-01, igual que en la 04.
- **Pasos:**
  - paso 0: vacía;
  - paso 1: la cifra con su etiqueta y su fuente.
- **Notas por paso:**
  - Paso 0
    - Entrada: «La misma encuesta preguntó con qué medio de pago trabajan.»
    - Apoyo: medio de pago · clic.
  - Paso 1
    - Entrada: «El 92.7 % usa efectivo.»
    - Remate: «Sin RNC y con efectivo, ¿dónde se lleva la cuenta?» (retórica: no se espera respuesta; la contesta la 06. Clic enseguida).
    - Apoyo: «usa», nunca «cobra» · la pregunta · clic.
- **Datos:** el 92.7 % de las mipymes usa efectivo como medio de pago (2022–2023). ENMIPYMES, p. 25, la misma URL de la 04 (§6.1, fila 6).

### 06 · libreta · [Gregory] · 50 s
- **Composición:** a sangre y sin titular. La foto de la 02 ocupa toda el área útil (1690×850, en x 115, y 115). Es la respuesta a la pregunta de la 05.
- **En pantalla:**
  - Texto (0 palabras).
  - Crédito (32 px): el mismo de la 02.
  - Medios: M-01, segundo recorte (1690×850).
- **Movimiento:** ninguno. Entra con el corte.
- **Pasos:** paso 0: la foto.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Eso ya lo contestaron ustedes con la mano arriba: en una libreta.»
    - Remate: «Y esa libreta es la competencia más dura de Pymex: no se cae y todo el mundo sabe usarla. Si Pymex es más difícil que la libreta, el dueño vuelve a la libreta al otro día.»
    - Para pasar a la 07: «Pero hay tres preguntas que una libreta no contesta. Las publicamos en septiembre, y se las enseño en Pymex.»
    - Apoyo: la mano arriba · no se cae · vuelve a la libreta · tres preguntas.
    - [CONFIRMAR con Gregory] Si tiene una escena real con un dueño y su libreta, va aquí en una frase. Si no la tiene, no se dice nada.
- **Datos:**
  - Ninguna cifra. «En una libreta» no sale de la ENMIPYMES: lo contestó la sala en la 02, y así se dice. Tampoco se dice que la encuesta no pregunta por los registros: nadie lo comprobó en el PDF.
  - Las tres preguntas son de la publicación de Zhonyas en LinkedIn del 24-sep-2026: https://es.linkedin.com/posts/zhonyas_tres-preguntas-que-una-libreta-no-contesta-activity-7509097081492402176-FBKV
  - Va sin titular para que las 10 primeras pantallas no pasen de 40 palabras. La foto ya salió con su frase en la 02.

### 07 · pymex-por-dentro · [Gregory] · 80 s
- **Composición:** a sangre. La línea de crédito va arriba (x 115, y 115, 32 px). Debajo, la grabación de 1440×810 en x 115, y 160, que termina en y 970, fuera del 10 % de abajo.
- **En pantalla:**
  - Texto (0 palabras).
  - Crédito, a la vista toda la diapositiva (32 px, `--zh-texto-2`; A-63): «Pymex por dentro, con datos de ejemplo».
  - Medios: **por grabar**, M-02. Son tres tomas, una por pregunta:
    1. el inventario, producto por producto, con lo que vale;
    2. una factura con sus abonos y el saldo que falta;
    3. el reporte del período que dice qué producto deja más.
- **Movimiento:** Z-12. Lo que se mueve es el producto en la grabación; el mazo no anima nada. Cada toma corre una vez y se queda en su último cuadro. Entre tomas, corte seco.
- **Pasos:**
  - paso 0: toma 1;
  - paso 1: toma 2;
  - paso 2: toma 3.
- **Notas por paso:**
  - Paso 0
    - Entrada: «La primera: ¿cuánto vale lo que tienes guardado? Esta es una ferretería de ejemplo: el inventario, producto por producto, con lo que vale.»
    - Apoyo: inventario · lo que vale · datos de ejemplo.
    - [CONFIRMAR con Steven qué pantalla lo enseña].
  - Paso 1
    - Entrada: «La segunda: ¿quién te debe, y cuánto? Cada factura con sus abonos y lo que falta por cobrar.»
    - Apoyo: abonos · lo que falta.
  - Paso 2
    - Entrada: «Y la tercera: ¿en qué producto ganas más? El reporte del período te lo dice sin sacar la calculadora.»
    - Apoyo: reporte · qué deja más.
    - [CONFIRMAR con Steven qué reporte lo contesta].
  - Si falla:
    - Si una toma no arranca, sale su póster y Gregory la cuenta en voz.
    - Si la grabación no existe el sábado a mediodía, se usa el respaldo de M-02.
- **Datos:**
  - Funciones según https://pymex.zhonyas.com (12-nov-2026): inventario, cotizaciones, facturas y abonos con su historial, y reportes de ventas, gastos y balance (04 §3).
  - Que Pymex contesta las tres lo dice la publicación de LinkedIn de la 06 («Pymex responde las tres»).
  - Ninguna cifra: los montos de la grabación son de ejemplo y no se leen.

### 08 · proyecto-final · [Gregory] · 55 s
- **Composición:** a sangre. El titular va arriba, en dos líneas, y la foto debajo (1690×620, en x 115, y 345).
- **En pantalla:**
  - Texto (9 palabras): `Escojan un proyecto final que un negocio quiera usar.`
  - Crédito (32 px): «Foto: Zhonyas, ITLA, nov 2026».
  - Medios: **por tomar**, M-03: José y Gregory en el ITLA. Si no llega, el último cuadro de la toma 3 de la 07, con el crédito de la 07.
- **Movimiento:** Z-01. El titular entra en su sitio.
- **Pasos:**
  - paso 0: la foto;
  - paso 1: el titular.
- **Notas por paso:**
  - Paso 0
    - Entrada: «El documento de Pymex lo estamos haciendo con la misma plantilla que les van a dar a ustedes, y nos cuesta el mismo semestre. La diferencia es que del otro lado hay negocios usándolo.»
    - Apoyo: misma plantilla · mismo semestre · negocios usándolo, sin números.
  - Paso 1
    - Entrada: «Por eso les dejo esto: escojan un proyecto final que un negocio quiera usar.»
    - Remate: «Les cuesta el mismo trabajo, y alguien lo abre el lunes. Angel.»
    - Apoyo: mismo trabajo · el lunes · entregar el clicker.
- **Datos:**
  - «Hay negocios usándolo» es palabra de José: va en voz y sin números (decisión 4).
  - No se dice quién escribe el código ni qué había antes del proyecto final (decisión 3; R-07).

---

## Historia 2 · Angel: un agujero negro (6:15–10:10)

### 09 · relevo-angel · [Angel] · 25 s
- **Composición:** dividida 1,2:0,8, igual que la 03.
- **En pantalla:**
  - Texto (2 palabras): `Angel Grullon` (96 px). [CONFIRMAR con Angel cómo escribe su nombre].
  - Medios:
    - foto: `marca/equipo/fotos/angel/photo.jpg` (4160×2773), recortada a 440×620 y exportada a 880×1240;
    - personaje: `marca/equipo/sprites/atlas/angel.webp`, con su JSON (`wave` e `idle`).
- **Movimiento:** Z-05, con los valores de la 03. La salida es Z-10, que es la entrada de la 10 y no cuenta como momento de esta diapositiva.
- **Pasos:**
  - paso 0: la foto en su caja, mientras Gregory entrega el clicker;
  - paso 1: Angel pulsa y corre Z-05;
  - el clic siguiente abre Z-10 y lleva a la 10.
- **Notas por paso:**
  - Paso 0: nadie habla.
  - Paso 1
    - Entrada: «Yo soy Angel Grullon. En la web de Zhonyas armé los muñequitos de píxeles que ven saludando y el agujero negro de la página de contacto. Fíjense en el centro de la pantalla.»
    - Apoyo: muñequitos · agujero negro · «fíjense en el centro» · clic y callarse.
    - Si falla: si la foto o el atlas no cargan, como en la 03. Lo del agujero negro, en la 10.
- **Datos:** Angel armó los personajes y el agujero negro (08 §4; commits #77–89 y #90 de zhonyas-web). Se dice «armé», no «hice».

### 10 · veinticinco-dias · [Angel] · 35 s
- **Composición:** una cifra.
- **En pantalla:**
  - Texto (5 palabras): `25 días` (300 px) · `para 1.5 segundos` (60 px, `--zh-texto-2`).
  - Fuente (32 px): «Historial de zhonyas-web, sep–oct 2026». Sin las fechas exactas, que salen como marcas en la 11 (A-69).
  - Medios: el agujero negro portado de zhonyas-web (M-04).
- **Movimiento:** entra por **Z-10**, la única escena de cambio de diapositiva aparte de la 20:
  - 1500 ms, lineal en t; radio = media diagonal × `smoothstep`;
  - el disco se apaga entre el 72 y el 98 %;
  - el horizonte se aclara entre el 55 y el 92 %;
  - esta diapositiva aparece entre el 62 y el 95 %;
  - la 09 se encoge a 0.955 y baja al 50 % de brillo.

  Va sin galaxia. La lente solo se enciende si el recorrido de prueba pasa de 50 fps. No hay ningún otro movimiento. Al retroceder, corre la misma escena al revés en 1200 ms.
- **Pasos:** paso 0: la cifra, ya dentro.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Eso que acaban de ver dura un segundo y medio. Desde que lo subí hasta que quedó bien, en celular y en computadora, pasaron 25 días.»
    - Apoyo: un segundo y medio · 25 días de calendario · tres arreglos.
  - Si falla (Z-10):
    1. El día antes se mide la apertura en la laptop del día, enchufada y con las dos ventanas abiertas. Con menos de 50 fps, va sin lente.
    2. Si en vivo se traba, Angel no lo repite ni lo comenta.
    3. Si no se vio nada, V pone el video del efecto (M-04), y V otra vez lo cierra.
    4. En el presentador, la 09 y la 10 se ven como póster (C-02).
- **Datos:**
  - 1.5 s para abrir y 1.2 s para cerrar: `OPEN_MS = 1500` y `CLOSE_MS = 1200`, `components/contact-section.tsx` l. 19–20, commit #97 del 29-sep-2026.
  - 25 días: del commit #90 (25-sep-2026) al #108 (20-oct-2026), en el repo privado https://github.com/Zhonyas-Group/zhonyas-web.
  - Son días de calendario, no de trabajo. En voz se dice «pasaron», nunca «nos tomó» ni «trabajamos» (A-67, A-73). Es una cifra de trabajo, permitida por la decisión 4, y la comparación con 1.5 s justifica la cifra grande (A-68).

### 11 · tres-arreglos · [Angel] · 85 s
- **Composición:** a sangre. El titular va arriba y la línea de tiempo, a escala real, ocupa el ancho útil.
- **En pantalla:**
  - Texto (14 palabras): el titular (96 px) `Hizo falta arreglarlo tres veces.` y las marcas (60 px) `25 sep` con `estreno` debajo · `29 sep` · `2 oct` · `20 oct`.
  - Fuente (32 px): «Historial de zhonyas-web, 2026».
  - Medios: ninguno. La línea se dibuja en código:
    - una raya de 4 px con el degradado de la firma, de x 115 a x 1805, a 67.6 px por día (A-39, punto 3; menos del 3 % del área);
    - marcas en x 115 (25 sep), 385 (29 sep), 588 (2 oct) y 1805 (20 oct, con el texto alineado a la derecha);
    - 25 sep y 2 oct van bajo la raya, y 29 sep y 20 oct encima, para que no se pisen;
    - muescas de 4×32 px en `--zh-texto-2`; fechas en `--zh-texto` y «estreno» en `--zh-texto-2`.
- **Movimiento:** Z-01. Cada fecha entra en su sitio cuando Angel la nombra, una por clic. El titular y la raya ya están.
- **Pasos:**
  - paso 0: el titular, la raya y «25 sep · estreno»;
  - paso 1: «29 sep»;
  - paso 2: «2 oct»;
  - paso 3: «20 oct».
- **Notas por paso:**
  - Paso 0
    - Entrada: «El 25 de septiembre lo subí a la web, y en mi computadora se veía perfecto.» [CONFIRMAR con Angel; C-16].
    - Apoyo: estreno · mi computadora.
  - Paso 1
    - Entrada: «Cuatro días después, el primer arreglo. Se abría al ritmo del scroll y se trababa: el navegador tenía que mover la página y pintar el agujero a la vez.»
    - Remate: «Lo amarré a un reloj: abre en un segundo y medio, pase lo que pase con el dedo.»
    - Apoyo: scroll · se trababa · reloj.
  - Paso 2
    - Entrada: «El 2 de octubre, el del iPhone: se cerraba solo. Ahorita se los enseño.»
    - Apoyo: iPhone · se cerraba solo.
  - Paso 3
    - Entrada: «Y el 20 de octubre, el último, en computadora: después de usar el menú, el agujero seguía el trackpad en vez de abrirse a su ritmo.»
    - Apoyo: menú · trackpad · a su ritmo.
- **Datos:**
  - Commits del repo privado https://github.com/Zhonyas-Group/zhonyas-web, 2026 (08 §2 y §6):
    - #90, 25-sep: la primera versión;
    - #97, 29-sep: pasa a reloj;
    - #105, con los PR #2 y #3, 2-oct: el arreglo del iPhone;
    - #108, con el PR #4, 20-oct: el arreglo de escritorio.
  - En pantalla van fechas y una palabra nuestra; ningún mensaje de commit (decisión 4).
  - Es una secuencia de verdad (A-26). La escala está comprobada: 1690 px ÷ 25 días = 67.6 px por día (juicio de reglas).

### 12 · iphone · [Angel] · 35 s
- **Composición:** dividida 1,2:0,8. El titular va a la izquierda, en la columna de 1014 px y en dos líneas. La grabación va a la derecha, en 676×850: el 40 % del área útil.
- **En pantalla:**
  - Texto (6 palabras): `En el iPhone, se cerraba solo.`
  - Crédito (32 px): «Grabación de pantalla de un iPhone, versión anterior al arreglo». La fecha ya está en la 11 (A-69).
  - Medios: **por grabar**, M-05.
- **Movimiento:** Z-12. La grabación corre una vez y se queda en su último cuadro.
- **Pasos:**
  - paso 0: el titular y el póster;
  - paso 1: corre la grabación.
- **Notas por paso:**
  - Paso 0
    - Entrada: «De los tres arreglos, este es el que más me enseñó. Miren lo que veía cualquiera que entrara desde un iPhone.»
    - Apoyo: el que más me enseñó · clic.
  - Paso 1
    - Remate, después del video: «Safari esconde su barra cuando uno baja, la pantalla cambia de alto y el agujero lo tomaba como la señal de cerrarse. En mi computadora eso no pasa, así que yo nunca lo vi.» [CONFIRMAR con Angel la explicación].
    - Apoyo: la barra de Safari · cambia de alto · yo nunca lo vi.
  - Si falla:
    - Si en vivo no arranca, Angel lo cuenta sobre el póster.
    - Si no se grabó a tiempo, la diapositiva se cae y Angel lo cuenta en el paso 2 de la 11, que suma 10 s.
- **Datos:** commit #105 y PR #2 y #3 de zhonyas-web, 2-oct-2026 (08 §2).

### 13 · celular-de-otro · [Angel] · 55 s
- **Composición:** a sangre. El titular va arriba, en dos líneas, y el video de 16:9 debajo (1102×620, en x 115, y 345).
- **En pantalla:**
  - Texto (9 palabras): `Está terminado cuando funciona en el celular de otro.`
  - Crédito (32 px): «El celular de [nombre], que no es del equipo, nov 2026».
  - Medios: **por grabar**, M-06.
- **Movimiento:** Z-12. El video corre una vez y se queda en su último cuadro. El titular entra con corte, sin animación, en el paso 2: así el único momento animado es el video.
- **Pasos:**
  - paso 0: el póster del video (una mano con el celular), sin titular;
  - paso 1: corre el video;
  - paso 2: el titular.
- **Notas por paso:**
  - Paso 0 · **Pregunta al público**
    - Entrada: «Una pregunta: levanten la mano los que han entregado algo que en su computadora funcionaba y en la del profesor no.»
    - Apoyo: esperar · «Yo también.» · clic.
  - Paso 1
    - Entrada: «Este es el celular de [nombre], que no es del equipo: zhonyas.com, Contacto, y abre como tiene que abrir.»
    - Apoyo: el celular de otro · abre bien.
  - Paso 2
    - Entrada: «Lo que me llevo de esos 25 días: está terminado cuando funciona en el celular de otro.»
    - Remate: «Antes de entregar, préstenselo a alguien con otro teléfono y mírenlo usarlo sin ayudarle. Y si ahí falla, no busquen otro teléfono: arréglenlo. José.»
    - Apoyo: préstenselo · sin ayudarle · si falla, se arregla · entregar el clicker.
  - Si falla:
    - Si el video no arranca, sale el póster y Angel lo cuenta.
    - Si en el celular prestado no abrió bien al grabar, no se busca otro: se arregla. Si no da tiempo, la 13 va sin video (pasos 0 y 2, con el titular solo), y en lugar del paso 1 Angel dice: «En el celular de [nombre] todavía no abre bien, y lo estoy arreglando.»
- **Datos:** ninguna cifra en pantalla. Los 25 días se dicen en voz y no se repiten en pantalla (A-69).

---

## Historia 3 · José: un prestamista (10:10–16:35)

### 14 · relevo-jose · [José] · 20 s
- **Composición:** dividida 1,2:0,8, igual que la 03.
- **En pantalla:**
  - Texto (3 palabras): `José Leonardo Reyes` (96 px).
  - Medios:
    - foto: `marca/equipo/fotos/jose-leonardo/photo.jpg` (1280×853), recortada en la proporción 440:620 y exportada a su resolución nativa, unos 605×853, sin ampliarla (A-33), igual que la de Gregory;
    - personaje: `marca/equipo/sprites/atlas/jose-leonardo.webp`, con su JSON (`wave` e `idle`).
- **Movimiento:** Z-05, con los valores de la 03.
- **Pasos:**
  - paso 0: la foto en su caja. Angel entrega el clicker y se queda junto a la laptop para la 18;
  - paso 1: José pulsa y corre Z-05.
- **Notas por paso:**
  - Paso 0: nadie habla.
  - Paso 1
    - Entrada: «Yo otra vez. Mi historia es la de un prestamista y la de Lendex, un producto mío: ahí el prestamista lleva los préstamos y los cobros que hoy apunta en un cuaderno.»
    - Apoyo: prestamista · Lendex · cuaderno · Angel a la laptop.
    - Si falla: si la foto o el atlas no cargan, como en la 03.
- **Datos:**
  - Ninguna cifra. Lendex es de José.
  - El cuaderno sale de la propia landing de Lendex: la sección «El cambio» pone «Sin Lendex» el cuaderno, el Excel y el WhatsApp (04 §2). Aquí se presenta para que la 19 lo pueda recordar.
  - Lendex no presta dinero: es el programa del prestamista (FAQ de la landing, 04 §2). Por eso se dice «lleva los préstamos», nunca «presta».

### 15 · prestamista-2014 · [José] · 55 s
- **Composición:** una cifra.
- **En pantalla:**
  - Texto (15 palabras): `20.9 %` (300 px) · `de los adultos pidió prestado a un prestamista en 2014` (60 px) · `1.º de 143 economías` (60 px).
  - Fuente (32 px): «Banco Mundial, Global Findex (GFDD.AI.15). El puesto es cálculo nuestro». El año ya está en la etiqueta y no se repite (A-69).
  - Medios: ninguno.
- **Movimiento:** Z-01. En el paso 1 entran la cifra, su etiqueta y la fuente; en el paso 2, el puesto.
- **Pasos:**
  - paso 0: vacía;
  - paso 1: la cifra con su etiqueta y su fuente;
  - paso 2: «1.º de 143 economías».
- **Notas por paso:**
  - Paso 0 · **Pregunta al público**
    - Entrada: «Levanten la mano si conocen a alguien que presta dinero en su barrio. Sin decir nombres.»
    - Apoyo: esperar · decir lo que se ve · no comparar las manos con la cifra (C-17).
    - Luego: «En 2014, el Banco Mundial preguntó otra cosa en 143 economías: si en el último año la gente le había pedido prestado a un prestamista.»
  - Paso 1
    - Entrada: «En la República Dominicana dijo que sí el 20.9 % de los adultos: uno de cada cinco.»
    - Apoyo: «veinte punto nueve» · uno de cada cinco.
  - Paso 2
    - Entrada: «Ninguna de las otras 142 economías con dato tuvo más. Y esa pregunta no la volvieron a hacer.»
    - Apoyo: decir «2014» · «economías», nunca «países» ni «récord mundial».
- **Datos:** el 20.9 % de los adultos le pidió prestado a un prestamista privado en el último año (2014), el valor más alto de las 143 economías con dato. Banco Mundial, GFDD.AI.15: https://api.worldbank.org/v2/country/all/indicator/GFDD.AI.15?source=32&date=2014&format=json&per_page=400 (§6.1, fila 9). El puesto es cálculo propio sobre esa consulta (07 §3.2). El año se dice en voz y está en pantalla (decisión 9).

### 16 · negocio-2024 · [José] · 40 s
- **Composición:** una cifra.
- **En pantalla:**
  - Texto (14 palabras): `15.3 %` (300 px) · `de los adultos pidió prestado para un negocio en 2024` (60 px) · `América Latina: 7.5 %` (60 px).
  - Fuente (32 px): «Banco Mundial, Global Findex 2025 (fin22e). América Latina y el Caribe sin ingreso alto». El año de la encuesta ya está en la etiqueta (A-69).
  - Medios: ninguno.
- **Movimiento:** Z-01. Primero la cifra; en el clic siguiente, la comparación. Las dos van en `--zh-texto`, porque las dos son dato del mundo.
- **Pasos:**
  - paso 0: vacía;
  - paso 1: la cifra con su etiqueta y su fuente;
  - paso 2: «América Latina: 7.5 %».
- **Notas por paso:**
  - Paso 0
    - Entrada: «Diez años después, en 2024, midieron otra cosa: quién pidió prestado para empezar o mantener un negocio, a quien fuera.»
    - Apoyo: 2024 · empezar o mantener · a quien fuera.
  - Paso 1
    - Entrada: «Aquí, el 15.3 % de los adultos.»
  - Paso 2
    - Entrada: «En América Latina, el 7.5 %. Nosotros, el doble.»
    - Apoyo: el doble.
- **Datos:** 15.3 % en la RD y 7.5 % en América Latina y el Caribe sin ingreso alto, en 2024. Global Findex 2025, fin22e: https://api.worldbank.org/v2/country/DOM;LAC/indicator/fin22e?source=28&format=json (§6.1, fila 10). «El doble» es correcto: 15.3 ÷ 7.5 = 2.04. La cifra no dice a quién le pidieron, y José no dice «a un prestamista».

### 17 · veinte-mensual · [José] · 35 s
- **Composición:** una cifra. La cita va en el lugar de la cifra, a 128 px, alineada a la izquierda y en dos líneas.
- **En pantalla:**
  - Texto (9 palabras): `«Es a un 20 mensual y un 10 quincenal.»`
  - Crédito (32 px): «Un prestamista, en El Día, 28 jun 2026».
  - Medios: ninguno.
- **Movimiento:** Z-01. La cita entra en su sitio.
- **Pasos:**
  - paso 0: vacía;
  - paso 1: la cita.
- **Notas por paso:**
  - Paso 0
    - Entrada: «¿Y a cómo presta un prestamista? En junio de este año, uno se lo explicó al periódico El Día.» (retórica: la contesta la pantalla).
    - Apoyo: lo dijo una persona · El Día · clic.
  - Paso 1
    - Entrada: tres segundos de silencio para que lo lean.
    - Remate: «Un 20 mensual. Vamos a sacar esa cuenta aquí mismo.»
    - Apoyo: silencio · a la demo.
- **Datos:** testimonio de un prestamista en El Día, 28-jun-2026: https://eldia.com.do/dinero-rapido-deudas-permanentes-la-realidad-detras-de-los-prestamos-informales/. Es un testimonio, no una estadística (§6.1). La cita va entera, sin cortar (A-65).

### 18 · demo-lendex · [José; Angel al teclado] · 110 s
- **Composición:**
  - paso 0: una cifra, con la frase en el lugar de la cifra (128 px);
  - paso 1: a sangre, con la calculadora en vivo como protagonista (1344×896).
- **En pantalla:**
  - Paso 0, texto (3 palabras): `Díganme un monto.` (128 px). Crédito (32 px): «Calculadora pública de Lendex: lendexgp.com/app».
  - Paso 1, texto del mazo (0 palabras): solo la calculadora real.
  - Medios:
    - **En vivo:** un `iframe` de https://lendexgp.com/app?calculadora (M-07) a 1920×1080 CSS, ampliado 2× y recortado a la tarjeta «Calculadora de Préstamos». En la página, la tarjeta va de x 1104 a 1776 y de y 316 a 764 (medida del guion visual; se vuelve a medir el viernes).
      - En la diapositiva queda de 1344×896, en x 288, y 115.
      - Las etiquetas de 12 px pasan a 24 px y las cifras de 18 px a 36 px.
      - La fila de la cuota cae hacia y 750–880, por encima del 10 % de abajo.
    - **Respaldo (tecla V):** **por grabar**, M-07. Es la propia 18 grabada con red, con RD$10,000, 20 %, 12 cuotas, Mensual y Francesa.
    - **Presentador:** un póster quieto de la calculadora, para no cargar un segundo `iframe` (C-02).
- **Movimiento:** Z-08. En el paso 1, la calculadora se abre: opacidad 0 → 1 y `scale` 0.985 → 1 en 520 ms con `(0.22, 1, 0.36, 1)`. Los resultados entran con la animación propia de Lendex; es del producto y no se toca.
- **Pasos:**
  - paso 0: la frase;
  - paso 1: la calculadora.
- **Notas por paso:**
  - Paso 0 · **Pregunta al público**
    - Entrada: «Esa cuenta la vamos a sacar con la calculadora de Lendex, la pública, la que cualquiera abre sin cuenta. Díganme un monto, el que le pedirían a un prestamista.»
    - Apoyo:
      - repetir el monto en voz alta;
      - si nadie habla: «¿Diez mil? Diez mil.»;
      - si dicen algo absurdo: «Ese préstamo no lo da ni el Banco Central. Uno más chiquito.»;
      - clic.
  - Paso 1
    - Entrada: «[Monto] pesos, a un 20 mensual, en doce cuotas fijas. Angel, ponle eso.»
    - Apoyo: Angel cambia solo el monto y la tasa (clic en el campo, Ctrl+A y escribir) · las 12 cuotas, «Mensual» y «Francesa» ya vienen puestas.
    - Angel teclea mirando la pantalla de la sala, y José lee los resultados de ahí: en la laptop, el presentador solo tiene el póster (C-04). Se ensaya así.
  - En vivo, sin clic
    - Entrada: «Miren la cuota: [cuota] al mes. En un año pagan [total]: casi tres veces lo que pidieron.»
    - Remate: «Esta calculadora no pide cuenta. La puede usar el prestamista, y también el que va a pedir prestado, antes de firmar.»
    - Apoyo: cuota · total a pagar · casi tres veces · antes de firmar.
  - Al terminar, Angel hace clic en la ventana del presentador, en la pantalla de la laptop, y desde ahí el clicker vuelve a mover el mazo. **Hasta ese clic, José no toca el clicker:** con el foco en la calculadora, las flechas le cambian la tasa.
  - Si falla:
    1. No carga en 5 s, sale en blanco o no hay red: V en el presentador. José dice: «La señal no quiso participar. Esto es lo mismo, grabado antes de la charla con diez mil pesos». Lee lo que se ve en el video: cuota de RD$2,252.65 y total de RD$27,031.75, «casi tres veces».
    2. Un monto de menos de mil o de más de diez millones: se usa 10,000.
    3. Un error al teclear: se borra en vivo y se sigue.
    4. La calculadora no abre sola porque `?calculadora` no llegó a Lendex: se usa el plan B de M-07.
    5. El clicker no avanza al terminar: clic en la ventana del presentador.
- **Datos:**
  - Calculadora: https://lendexgp.com/app, consultada el 12-nov-2026. Trae RD$50,000, 5 % mensual, 12 cuotas, Mensual y Francesa, y calcula mientras se escribe (04 §2).
  - Con 20 % mensual a 12 cuotas francesas, el total a pagar es 2.70 veces el monto, sea cual sea el monto. Por eso «casi tres veces» vale para cualquier cifra que diga el público. Es cálculo propio con `C:/Users/joser/Lendex/src/utils/calculateInstallments.ts` (12-nov-2026): la app redondea la cuota a centavos y ajusta la última.
  - Respaldo con RD$10,000: cuota de RD$2,252.65 (la última es de RD$2,252.60), total de RD$27,031.75 e interés de RD$17,031.75. Es el mismo cálculo, y coincide con el juicio de reglas.
  - Referencia para José, que no se proyecta (cuota / total a 20 % y 12 cuotas): RD$5,000 → 1,126.32 / 13,516.04; RD$20,000 → 4,505.30 / 54,063.56; RD$25,000 → 5,631.62 / 67,579.61; RD$50,000 → 11,263.25 / 135,158.88; RD$100,000 → 22,526.50 / 270,317.85.
  - El 20 mensual sale de la cita de la 17. Los precios y los planes de Lendex no salen (decisión 4).

### 19 · tarea · [José] · 60 s
- **Composición:** a sangre. El titular va arriba, en dos líneas, y debajo la foto de la 02, con el mismo recorte (1690×620) y el mismo crédito.
- **En pantalla:**
  - Texto (10 palabras): `Esta semana, pregúntenle a un negocio qué anota a mano.`
  - Crédito (32 px): el de la 02.
  - Medios: M-01, primer recorte.
- **Movimiento:** Z-01. El titular entra en su sitio.
- **Pasos:**
  - paso 0: la foto sola;
  - paso 1: el titular.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Si se fijan, las tres historias empiezan igual: con alguien de afuera. Un negocio con su libreta. Un celular que no era el de Angel. Un prestamista con su cuaderno.»
    - Apoyo: alguien de afuera · libreta, celular, cuaderno · clic.
  - Paso 1
    - Entrada: «Y les dejo una tarea, que no vale puntos: esta semana, pregúntenle a un negocio de su calle qué anota a mano.»
    - Remate: «Anoten lo que les diga, con sus palabras, y busquen tres preguntas que esa libreta no contesta. Ahí tienen el problema de un proyecto final y la primera persona que lo va a usar.»
    - Apoyo: no vale puntos · con sus palabras · tres preguntas · la primera persona.
- **Datos:** ninguna cifra. El porqué de esta acción está en el encabezado.

### 20 · cierre · [José] · 65 s
- **Composición:** cierre. El paso 0 es como la portada. Al terminar Z-02 queda la composición de «Nosotros» en la web (`movimiento/03-nosotros.png`):
  - la idea arriba a la izquierda (x 115, y 115), a 96 px y en dos líneas;
  - la cinta donde la deja Z-02 tal cual: el centro más 17 vw (≈ +326 px), a media altura, de unos 564×64 px (≈ x 1004–1568, y 508–572);
  - `zhonyas.com` a 60 px encima de la cinta, alineado con su borde derecho y separado 16 px. Nunca va sobre el degradado (§4.1);
  - la acción corta a 60 px, a la izquierda, bajo la idea (x 115, y ≈ 430, hasta x ≈ 940, en dos líneas);
  - el QR abajo a la derecha, en una placa #f7f7fa de 360 px (x 1445–1805, y 612–972), con su zona de silencio.

  Todo esto se mide en una captura antes de construirlo. Si algo choca, manda Z-02 tal cual y se mueve el texto.
- **En pantalla:**
  - Texto (19 palabras): `El usuario de su proyecto final ya está en su calle.` (96 px) · `Pregúntenle esta semana qué anota a mano.` (60 px) · `zhonyas.com` (60 px).
  - Medios:
    - paso 0: `marca/logo/zhonyas-logo-escena.svg`, igual que en la 01;
    - la cinta: `app/ribbonGeometry.ts` de zhonyas-web, con el armazón SVG de `page.tsx` 806–1010 (M-10);
    - **por generar**, M-08: el QR a https://zhonyas.com, nivel M, con módulos #010204. Sin «www», que da 404.
- **Movimiento:** Z-02, la segunda escena de más de 1 s que cambia la pantalla entera. El progreso va de 0 a 0.42 en 1.2 s con `easeOutExpo = 1.001 − 2^(−10t)`, con las funciones de `page.tsx` 26–39 y 296–386 tal cual:
  - la H y la palabra se apagan (`smoothstep`);
  - la Z se vuelve cinta (quíntica);
  - la cinta se corre +17 vw.

  Al terminar, la idea, la acción, `zhonyas.com` y el QR aparecen por corte, sin animación propia. Una entrada durante la escena no tiene medida (C-10).
- **Pasos:**
  - paso 0: el logo quieto (corte seco desde la 19);
  - paso 1: Z-02 y el estado final, que se queda durante las preguntas.
- **Notas por paso:**
  - Paso 0
    - Entrada: «Cierro con lo mismo con que empezamos.»
    - Apoyo: clic.
  - Paso 1
    - Entrada: «El usuario de su proyecto final ya está en su calle. Pregúntenle esta semana, y si quieren, cuéntennos qué encontraron: ese QR los lleva a nuestra web.»
    - Remate: «Esto lo hacemos entre seis: Steven, Cristopher y José Carlos no están en la tarima, y mucho de lo que vieron hoy también es de ellos. Gracias. Ahora sí, sus preguntas.» [CONFIRMAR con José la frase del equipo].
    - Apoyo: dejar el QR a la vista · el equipo · gracias · preguntas.
  - Si falla (Z-02): si la escena se traba, el motor salta al estado final. Si la cinta no se portó a tiempo, el estado final va quieto, como póster. El QR tiene que estar en pantalla antes de abrir las preguntas.
- **Datos:**
  - zhonyas.com respondió 200 y www.zhonyas.com, 404 (`curl -I`, 12-nov-2026).
  - En pantalla nunca va «Gracias» (A-32); el «gracias» va en voz.
  - «Entre seis»: las seis personas de `lib/team.ts` en zhonyas-web, las mismas que son miembros de Zhonyas-Group en GitHub (§6.2). Es un dato del equipo, no del negocio.
  - A los tres que no hablan se los nombra como equipo, sin repartir el código de nadie (decisión 3).
  - El nombre del juego no va aquí (decisión 8; R-07).

---

## Medios por grabar o conseguir

| # | Para | Qué | Especificación | Quién y cuándo | Si no llega |
|---|---|---|---|---|---|
| M-01 | 02, 06 y 19 | Foto de la libreta | Una libreta propia de un colmado o un salón **cercano a la sede de la charla** (si es en el ITLA de Las Américas, de por ahí; C-05), abierta en una página de fiado o de ventas. Horizontal, de 4000×3000 o más, con luz de día. Permiso del dueño por escrito. Que no se lea ningún nombre de cliente ni ningún monto. Dos recortes: 1690×620 (02 y 19) y 1690×850 (06), en WebP a 2×. Nunca una libreta preparada para la foto | José o Gregory · viernes de día | La 02 y la 19 van con el titular solo sobre el fondo. La 06, en negro (tecla B) mientras habla Gregory |
| M-02 | 07 (y 08 de respaldo) | Pymex por dentro, en 3 tomas | Una toma por pregunta, de 20–25 s cada una. Datos de ejemplo de una ferretería con nombre creíble (nada de «Acme»). Sin fechas de creación, sin nombres de repos, sin pestañas ni marcadores y sin la dirección del panel (R-08). Nunca el tablero de la landing, que es una maqueta (C-12). Se graba con la Xbox Game Bar en la ThinkPad (1920×1080 al 150 %), en MP4 H.264, a 60 fps, sin sonido y con un póster por toma. En la diapositiva va a 1440×810, sin ampliarla por encima de lo grabado, y el texto de la interfaz tiene que medir 24 px o más. Si con zoom Pymex pasa a su diseño de tableta, se recorta en vez de ampliar: fuera la barra del navegador y el menú lateral, y queda la tabla o el reporte que contesta la pregunta. **Toma de prueba el viernes**, antes de grabar las tres. Steven confirma las pantallas de la toma 1 y la 3 | Steven con Gregory · prueba el viernes, tomas el sábado por la mañana | La 07 usa `productos/pymex/escritorio-05-flujo-4-pasos.png` con el crédito «Página pública de Pymex», dura 55 s y Gregory dice las tres preguntas en voz |
| M-03 | 08 | Foto de José y Gregory en el ITLA | Horizontal, de día, con el ITLA reconocible. Recorte de 1690×620 | Cualquiera · viernes | El último cuadro de la toma 3 de la 07 |
| M-04 | 09 → 10 | Z-10 portado y su respaldo | Portar `lib/black-hole-lens.ts`, `team-contact.css` 109–137 y la función `render` de `contact-section.tsx` 108–169, de `C:/Users/joser/zhonyas-web`, con un tween de 1500 ms, sin galaxia y con la lente apagable. Respaldo: un video de 5 s del efecto en zhonyas.com, grabado en la laptop del día, a 1920×1080 y 60 fps, sin sonido, en la tecla V. Pósteres de la 09 y la 10 para el presentador | Angel · sábado | La tecla V con el video; si tampoco hay video, corte seco a la 10 |
| M-05 | 12 | El iPhone que se cierra solo | La versión de zhonyas-web anterior al commit #105, en un canal de vista previa de Firebase. Grabación de pantalla del propio iPhone, sin filmarlo (así no hay reflejos ni moiré), de 8–10 s y sin sonido. Recorte de 4:5 a 676×850, centrado en el agujero y sin ampliar | Angel · **plazo: viernes a las 9 p. m.** | La 12 se cae y la 11 suma 10 s |
| M-06 | 13 | El celular de otra persona | El celular de alguien que no es del equipo (mejor un Android de gama media), con la versión de hoy: zhonyas.com → Contacto → el agujero abre. Se filma en horizontal 16:9 con otro teléfono, con buena luz y el brillo alto. 10–12 s, sin sonido, MP4 H.264 de 1920×1080, con póster. Sin notificaciones ni datos de esa persona a la vista, y con su permiso | Angel · sábado | Ver el «Si falla» de la 13 |
| M-07 | 18 | Lendex en vivo y su respaldo | **José, en Lendex:** que `/app?calculadora` abra la calculadora; las tildes de «Tasa de Interés» y «amortización»; y desde el sábado, nada se despliega en lendexgp.com (C-26; el repo local tiene commits del 12-nov hasta las 22:30). **En el motor:** el `iframe` de la 18 con sus protecciones (ver «Lo que necesita el motor»), probado desde `file://` en la laptop del día. El 12-nov a las 22:39, `curl -I https://lendexgp.com/app?calculadora` respondió 200 sin `X-Frame-Options` ni `Content-Security-Policy`, así que hoy el `iframe` carga. Se vuelve a comprobar después de desplegar `?calculadora`. **Respaldo:** la propia 18 grabada con red, con RD$10,000 y 20 %, de 60 s o menos, en MP4 H.264 a 60 fps, sin sonido y con póster. **Plan B** si el sábado a mediodía el `iframe` no pasa la prueba: una ventana aparte de Chrome con la calculadora, ya abierta y esperando en la pantalla de la laptop. En la 18, Angel la lleva a la sala (Win+Mayús+→) y la pone a pantalla completa (F11), con zoom del 200 %. Al terminar, Alt+Tab al mazo y se comprueba que responde. Se ensaya tres veces. **Sin `?calculadora`:** el `iframe` arranca sin recorte, Angel pulsa «Calculadora de Préstamos» y el siguiente clic pasa al recorte de 2× por corte | José y quien arme el motor · viernes | **Sin el video de respaldo no hay demo en vivo** (05 §7; decisión 5) |
| M-08 | 20 | QR | A https://zhonyas.com, nivel M, módulos #010204 sobre una placa #f7f7fa de 360 px o más, con zona de silencio de 4 módulos. Se prueba desde la última fila con tres teléfonos, uno de ellos un Android de gama media, y en el proyector | José · viernes | `zhonyas.com` a 60 px |
| M-09 | 03, 09 y 14 | Fotos y personajes | Recortes en la proporción 440:620 de `marca/equipo/fotos/`. El de Angel (4160×2773) sale a 880×1240. Los de Gregory y José (1280×853) dan como mucho unos 605×853 y se exportan así, sin ampliar (A-33). Si José quiere 2×, hacen falta fotos nuevas de los dos. Los atlas y el JSON ya existen | Angel · viernes | El estado final quieto |
| M-10 | 01 y 20 | Logo y cinta | Portar `app/ribbonGeometry.ts` y el armazón SVG de `page.tsx` 806–1010. Póster del estado final de la 20 | José · sábado | El póster del estado final |
| M-11 | Todas las de video y WebGL | Pósteres | Uno por cada video (07, 12, 13 y los respaldos) y uno para el presentador en la 09, la 10 y la 18 | Quien arme el motor · sábado | — |
| M-12 | Documento aparte | Lista de créditos | El origen de cada foto, video, captura y personaje (A-60). Va fuera de la pantalla y José decide la redacción. No se dice nada de eso en la charla (decisión 4) | José | — |

## Lo que necesita el motor

Es la ruta crítica, y es la misma para cualquier guion (juicio de slop). Va por orden:
1. **Corte seco** (Z-00) por defecto, en lugar del fundido de 420 ms de `transiciones.ts`.
2. **Tecla V** en la sala y en el presentador (`teclado.ts`). Pone y quita el video de respaldo de la diapositiva actual (10 y 18). Desde el presentador funciona aunque la sala tenga el foco en la calculadora.
3. **`Cifra` (Z-01):** un fundido en su sitio de 280 ms con `cubic-bezier(0.22, 1, 0.36, 1)`, con este comentario: «duración: Vercel Ship 2025 (05 §11.3); curva: la de la marca (C-14)».
4. **`Relevo` (Z-05):** el paso 0 con la foto en su caja, el paso 1 con el vuelo, el atlas y un solo `wave`. Sin respiro.
5. **`Video` sin bucle**, que se queda en el último cuadro (07, 12 y 13). Hoy el motor lo repite.
6. **Z-10** como transición de la 10: la lente va en un interruptor que la apaga por debajo de 50 fps, y el presentador muestra un póster.
7. **Z-08 y la 18:**
   - el `iframe` se monta cuando la 17 está en pantalla y no se desmonta en toda la charla;
   - en la 18 el clic no avanza, «número + Intro» no salta y el cursor se ve;
   - el presentador muestra un póster.
8. **Z-02** en la 20, con su póster del estado final.
9. **`datos.ts`** con cada cifra y su fuente, URL, fecha y estado. El objetivo del cronómetro pasa a 16:35.
10. **La diapositiva oculta de prueba de sala** y el modo «sala con luz» (§9.2.8).

**Calendario.**
- **Jueves por la noche:** se congela este guion. Steven recibe la lista de tomas y Angel prepara el canal de vista previa.
- **Viernes:**
  - en el motor, los puntos 1–5 y 9;
  - las fotos de la libreta y del ITLA;
  - lo de Lendex;
  - el video de respaldo de la 18;
  - la toma de prueba de Pymex;
  - el iPhone, antes de las 9 p. m.
- **Sábado:**
  - Z-10, Z-02 y la 18;
  - las tomas de Pymex;
  - medir los fps en la laptop del día, enchufada y con las dos ventanas abiertas;
  - el primer ensayo con reloj.
- **Domingo:** dos ensayos más y un recorrido completo con el Wi-Fi apagado, salvo la demo (fila 24: tres ensayos o más).

Si la charla cae otro día, el calendario se corre con ella.

## Si falta un medio

| Falta | Qué pasa | Total |
|---|---|---|
| Nada | — | 995 s |
| El iPhone (M-05) | Se cae la 12 (−35 s) y la 11 suma 10 s | 970 s |
| Pymex grabado (M-02) | La 07 va con la página pública y dura 55 s (−25 s) | 970 s |
| Las dos anteriores | Además, la 18 suma 15 s (José lee también el interés total) y la 19, 5 s | 965 s |
| El celular de otro (M-06) | La 13 va sin el paso 1 (−10 s) | 985 s |
| La foto del ITLA, la de la libreta, Z-10, Z-02 o la red | Sus respaldos, sin cambiar la duración | 995 s |

## Riesgos

- **R-01 · La demo en vivo.** Es lo que más puede fallar. Para cubrirlo:
  - el `iframe` evita mover ventanas entre pantallas (C-04);
  - el plan B está ensayado (M-07);
  - Angel está al teclado y José tiene el micrófono;
  - la V funciona desde el presentador;
  - Lendex queda congelado desde el sábado (C-26), y la mañana de la charla se vuelve a recorrer la demo con la red de la sala;
  - si la sala no tiene red, el teléfono de José sirve de punto de acceso.
- **R-02 · Z-10 y la GPU.** En la laptop de las mediciones dio 13 cuadros en 1.5 s (C-13). Se mide en la laptop del día, enchufada y con el presentador abierto, porque las dos ventanas comparten la GPU (C-02). Va sin lente si no llega a 50 fps.
- **R-03 · Las cinco escenas de más de 1 s** (A-56) y la lectura de A-54. Las aprueba José (encabezado, puntos 1 y 2).
- **R-04 · El clicker.** Muchos clickers usan el mismo botón para F5 y Esc, y Esc saca la presentación de pantalla completa (C-20). Se prueba el clicker del día. Ninguna tecla del clicker se pulsa mientras la calculadora tiene el foco (18).
- **R-05 · La sala** (C-05 y C-22). No se sabe la luz, el proyector, su resolución nativa ni la distancia a la última fila. Antes de empezar:
  - se pasa la diapositiva de prueba de sala;
  - la salida de Windows se pone a la resolución nativa del proyector;
  - se mira si la placa blanca del QR deslumbra.

  La foto de la libreta tiene que ser de cerca de la sede.
- **R-06 · Frases que hay que confirmar:**
  - **Gregory:** una escena real con un dueño y su libreta (06).
  - **Angel:**
    - cómo escribe su nombre (09);
    - «en mi computadora se veía perfecto» (11);
    - la explicación del fallo del iPhone (12).
  - **Steven:** qué pantallas de Pymex contestan «cuánto vale lo guardado» y «en qué producto ganas más» (07). Si alguna no existe, se cambia esa pregunta por una que Pymex sí conteste, en la 06 y en la 07.
  - **José:** la frase del equipo (20).
- **R-07 · Las preguntas difíciles.** José y Gregory acuerdan las respuestas antes del primer ensayo:
  - «¿Quién programó Pymex?»: la propuesta es «Lo hacemos en equipo en Zhonyas; el proyecto final es de Gregory y mío», sin hablar de nada anterior al proyecto final (decisión 3). [DECIDE JOSÉ]
  - «¿De dónde sale el nombre?»: «Del Reloj de Arena de Zhonya, un objeto de League of Legends». Una frase y sin arte de Riot (decisión 8).
  - «¿Cuántos clientes tienen?» o «¿Cuánto cobran?»: «Eso no lo compartimos; los cuatro productos tienen gente usándolos» (decisión 4).
- **R-08 · La decisión 3 en las grabaciones.** Pymex lleva datos de ejemplo de una ferretería, sin fechas de creación, sin nombres de repos y sin pestañas. Ninguna toma enseña nada anterior al proyecto final.
- **R-09 · Lo que ve quien entre a Lendex** desde su celular durante la charla. Las páginas legales tienen «[COMPLETAR]», los correos rebotan y en el pie no se lee «LEND» (04 §10; C-27). El QR lleva a zhonyas.com, no a Lendex, pero conviene arreglarlo esta semana. Las tildes de la calculadora van en M-07.
- **R-10 · Lo que ve quien escanee el QR.** En el iPhone, la web va a unos 12 fps (el PR #1 sigue sin mezclar), e ir a Contacto congela la página unos 2.7 s (C-23). Se prueba con un Android de gama media antes de la charla. Choca con la lección de la 13 («está terminado cuando funciona en el celular de otro»): si alguien en la sala la abre en un iPhone y la ve trabada, la lección se cae sola. Hay que mezclar y desplegar el PR #1 antes de la charla, o probar la web en un iPhone ajeno y decidir con lo que se vea. [DECIDE JOSÉ]
- **R-11 · La fila 13 del marcador no se cumple.** Hay dos productos en movimiento (Pymex grabado y Lendex en vivo), más el efecto de la web. De Matriz ZH y de Cantus no hay pantallas por dentro. José lo sabe y lo acepta, o pide esas pantallas.
- **R-12 · La privacidad.** En la libreta no se lee ningún nombre ni ningún monto. En el celular prestado, ningún dato de su dueño. Las fotos llevan el permiso de quien sale o de quien es dueño de lo que sale.
- **R-13 · Fechas.** «En junio de este año» (17) vale en 2026. No se usa nada que caduque: ni el plazo de la DGII ni los días desde el primer commit (C-25).
- **R-14 · El navegador.** El doble clic abre el navegador predeterminado, que en la ThinkPad puede ser Firefox, y el motor solo se probó en Chrome y Edge (C-21). Se abre con un acceso directo a Chrome.
- **R-15 · Excepciones declaradas.**
  - A-24: los relevos (el retrato ocupa un 19 % del área útil, como pide la decisión 7) y las cifras, donde manda la composición de una cifra (§4.3).
  - A-04: la 06 y la 07 van sin titular por la fila 3. La 06 es la respuesta, en imagen, a la pregunta de la 05; la 07 lleva su crédito a la vista.
  - A-01: las cifras del país (04, 05, 15 y 16) no nombran nada propio. Lo propio entra en la diapositiva siguiente: Pymex en la 07 y Lendex en la 18.
  - A-35: «25 días» (10) y las fechas de la 11 son datos nuestros, pero van en `--zh-texto` porque el degradado nunca lleva texto (§4.1). Lo que dice «esto es nuestro» en esas dos es la raya con degradado de la 11.

## Si hay que recortar a 13 min (780 s)

**Se caen tres diapositivas** (−95 s netos). Ninguna sale de las diez primeras: si se cae una de esas, la 11, con 14 palabras, entra entre las diez primeras y la suma llega a 48, por encima de las 40 de la fila 3.

| Diapositiva | s | Qué la reemplaza | Neto |
|---|---|---|---|
| 12 · iphone | 35 | Angel cuenta el fallo en el paso 2 de la 11 (+10 s) | −25 |
| 17 · veinte-mensual | 35 | José dice la cita entera en voz al entrar en la 18 (+10 s) | −25 |
| 19 · tarea | 60 | La tarea y su método pasan al paso 1 de la 20 (+15 s): «Esta semana, pregúntenle a un negocio de su calle qué anota a mano; anoten lo que les diga y busquen tres preguntas que esa libreta no contesta». La pantalla de la 20 ya trae la acción | −45 |

**Se acortan nueve** (−120 s):

| Diapositiva | De → a | Cómo |
|---|---|---|
| 02 · su-calle | 75 → 60 | Una sola mano alzada, la del negocio con libreta |
| 06 · libreta | 50 → 40 | Sin el puente a las tres preguntas; Gregory las dice en la 07 |
| 07 · pymex-por-dentro | 80 → 60 | Tomas de 15 s |
| 08 · proyecto-final | 55 → 45 | Sin el remate |
| 11 · tres-arreglos | 95 → 80 | Pasos 1 y 3 más cortos (los 95 ya incluyen el fallo del iPhone) |
| 13 · celular-de-otro | 55 → 50 | La mano alzada, más corta |
| 15 · prestamista-2014 | 55 → 45 | Sin la mano alzada |
| 18 · demo-lendex | 120 → 100 | Sin el monto absurdo: si dudan, 10,000 (los 120 ya incluyen la cita) |
| 20 · cierre | 80 → 65 | Sin la pausa del paso 0 y sin «cuéntennos qué encontraron» (los 80 ya incluyen la tarea) |

**Resultado:** 17 diapositivas que suman 780 s:
- 01 · 20 s
- 02 · 60 s
- 03 · 25 s
- 04 · 35 s
- 05 · 35 s
- 06 · 40 s
- 07 · 60 s
- 08 · 45 s
- 09 · 25 s
- 10 · 35 s
- 11 · 80 s
- 13 · 50 s
- 14 · 20 s
- 15 · 45 s
- 16 · 40 s
- 18 · 100 s
- 20 · 65 s

Se mantienen las tres historias, las dos parejas de cifras (04–05 y 15–16), el agujero negro en vivo con sus 25 días en pantalla, la demo con el monto del público, los tres relevos, la acción (dentro de la 20) y el QR. Las diez primeras pantallas son las mismas que en la versión completa: 39 palabras. Se pierde el «tres historias empiezan igual» de la 19.

---

## De dónde sale cada parte

| Parte | Origen |
|---|---|
| Columna de tres historias, voz, cifras con fuente, la libreta como competencia (06), «lo primero que te piden es el problema» (03), «Fíjense en el centro» (09), la línea de tiempo (11), el 20 % de la demo y su remate (18), la cita entera (17), los [CONFIRMAR], la protección de las grabaciones | `guion-historias.md` |
| La libreta como imagen de principio y final (02, 06, 19), la mano alzada «el fiado o lo que vendió», «misma plantilla, mismo semestre» (08), «Yo otra vez», «¿Y a cómo presta?», «préstenselo… sin ayudarle» y «si falla, se arregla» (13), «busquen tres preguntas» (19), la escala real de 67.6 px por día, la mano alzada del prestamista (15) y el cierre con idea, acción y QR | `guion-estudiante.md` |
| El relevo con el clicker en mano y la foto en su caja (03, 09 y 14), la calculadora dentro de la diapositiva (18), el video del celular de otra persona (13), los pósteres del presentador, la curva de Z-01, «cuéntennos qué encontraron» (20) y la composición de «Nosotros» para el cierre | `guion-visual.md` |
| La idea nueva, la mano alzada de Angel (13), el orden con las 10 primeras en 39 palabras, el punto decimal, el plan del `iframe` con `?calculadora` y el foco, y los plazos de los medios | Este guion, a partir de los tres juicios |

## Correcciones a los juicios

**Juicio del público**
- La 18 del estudiante iba al 5 % → la demo va al 20 mensual de la cita, con «casi tres veces lo que pidieron» y el remate del que pide prestado (18).
- El catálogo de cuatro productos, el «seis personas» y la atribución del código → se quitaron. A los tres que no hablan se los nombra como equipo en la 20, sin repartir el código.
- «Números no les doy» → no se dice. Si lo preguntan, va en R-07.
- 100 s de Pymex sin nada que leer → la 07 dura 80 s, en tres tomas, con el crédito a la vista.
- El nombre del juego en medio de Angel o antes de «Gracias» → no va en la charla (R-07).
- Dos pantallas de cifra seguidas (1.5 s y 25 días) → una sola (10).
- El video del iPhone antes de la línea de tiempo, y los videos en bucle → la línea de tiempo va primero (11) y los videos corren una vez (12 y 13).
- Los rótulos «reloj», «escritorio» y «computadora» → solo las fechas, más «estreno»; la causa va en voz y con palabras de Angel.
- La lección de Angel explicaba un solo arreglo → se presenta como la del iPhone, «el que más me enseñó» (12 y 13).
- El plazo de la DGII → fuera.
- Los Alt+Tab → la calculadora va dentro de la diapositiva.
- El catálogo de la empresa con la pantalla en negro (Historias 02) → José se presenta en una frase sobre el logo, y la libreta está en pantalla durante la mano alzada.
- La idea abstracta → la idea tiene imagen y es del estudiante.
- Seis moralejas → quedan la idea (02 y 20), dos lecciones de bloque (08 y 13) y la tarea (19).
- La 08 de Historias, una lección de diseñador → fuera.
- Las tres preguntas recitadas dos veces → una vez, una por toma (07).
- Siete minutos de José sin nada que hacer y tres cierres seguidos → hay una mano alzada en la 15, una demo con el público y dos cierres (19 y 20).
- «Bastantes» escrito de antemano → hay dos ramas (02).
- La agenda dibujada → no hay agenda.
- El saludo cinco veces → tres, uno por relevo.
- Las 26 columnas → una escala con cuatro fechas.
- Los rótulos sin verbo → no hay rótulos en la 07.
- «Tiene otro nombre aquí adentro» y el Z-07 sobre una sola pieza → fuera.
- Una demo de 150 s que describía la interfaz → 110 s, sin describir la interfaz.
- La consola de mentira → fuera.
- El cierre recargado → la idea a 96 px y lo demás a 60 px, con 19 palabras.
- «Reemplazar» → fuera.
- Dos momentos en la 02 → uno.
- «Tesis» → se dice «proyecto final» en toda la charla.
- La foto de «su calle» → de cerca de la sede (M-01).

**Juicio de slop**
- La fila 3 → 39 palabras.
- La fila 25 → la 20 lleva la idea, la acción y el QR.
- La cinta del cierre → donde la deja Z-02 tal cual, medida en captura, con el texto por corte al terminar.
- La foto que salía de la nada → paso 0 con la foto en su caja.
- La 12, difícil de producir → plazo el viernes y respaldo que sostiene la duración (970 s).
- La foto del iPhone de Angel bajo «celular de otro» → el video es del celular de otra persona (13).
- La 19 de Historias → fuera.
- Mover ventanas en vivo → `iframe`, y el plan B ensayado tres veces.
- La curva de Z-01 → fijada (Convenciones).
- La frase a 128 px en tres líneas → la idea va a 96 px, en dos.
- El recorte de 2.41:1 → 16:9 a 1440×810, con lo que se corta en cada toma (M-02).
- A-56 → declarada para que José la apruebe.
- Seis tamaños de letra → cinco.
- A-63 → el crédito «con datos de ejemplo» está en pantalla (07).
- «25 días de arreglos» → «para 1.5 segundos», y «pasaron» en voz.
- Grabar «a 2×» → criterio de 24 px y una toma de prueba (M-02).
- La ruta crítica del motor → en «Lo que necesita el motor».
- Los respaldos que sacaban la charla del rango → ver «Si falta un medio».

**Juicio de reglas**
- El total del respaldo de Lendex → RD$27,031.75 y RD$17,031.75, que es lo que muestra la app.
- La frase de Gregory sobre el código → fuera.
- «Preguntas aparte» → lo que sobra es margen.
- «Terminado es cuando», un calco → «Está terminado cuando», probado en un celular ajeno.
- «Completa» → la 19 de Historias ya no está.
- «Hice» → «armé».
- Las pantallas de Pymex sin comprobar → se confirman con Steven (R-06).
- La fuente de los 25 días sin URL → con URL.
- «Y de la web» (falso) → fuera.
- Las matrículas de la portada → la portada no se usa.
- La cita cortada → va entera.
- La afirmación de la landing en pantalla → fuera.
- «Ningún otro país» y «récord mundial» → «economías con dato».
- «Lo dimos por terminado» → va en voz y con [CONFIRMAR].
- «Lo grabamos ayer» → «grabado antes de la charla».
- «Este año» → «en el último año».
- La libreta presentada como dato de la encuesta → la contesta la sala.
- La V dentro del `iframe` → la V se pulsa desde el presentador.
- Texto sobre la cinta → `zhonyas.com` va encima, separado 16 px.

---

## Revisión crítica (12-nov)

Revisión adversarial del 12-nov-2026 por la noche. La hice contra `00-SINTESIS.md`, `04`, `06`, `07` y `08`, el código de `C:/Users/joser/Lendex` y lo que respondían en vivo lendexgp.com y zhonyas.com.

### Lo que cambié y por qué

1. **El recorte a 13 min decía algo falso.**
   - Al quitar la 10, la 11 (14 palabras) entraba entre las diez primeras pantallas. Eso da 48 palabras, no «menos de 40» (fila 3).
   - Ahora se caen la 12, la 17 y la 19, y se acortan nueve. La acción de la 19 pasa a la 20, que ya la tiene en pantalla.
   - Suma 780 s, y las diez primeras siguen en 39 palabras.
2. **La 19 recordaba un cuaderno que nadie había nombrado.**
   - «Un prestamista con su cuaderno» no salía en ningún momento del bloque de José, y la cita de El Día no habla de cuadernos.
   - Ahora la 14 presenta Lendex en una frase, con el cuaderno de su propia landing («Sin Lendex», 04 §2).
   - De paso, la sala sabe qué es Lendex antes de la demo. Antes solo se decía «un producto mío».
3. **La 06 afirmaba algo que nadie comprobó.** Decía «Eso la encuesta no lo pregunta», y nadie revisó si la ENMIPYMES pregunta por los registros. Ahora queda «Eso ya lo contestaron ustedes con la mano arriba: en una libreta».
4. **Las fotos de dos relevos no se podían exportar a 2×.**
   - Las de Gregory y José miden 1280×853. Un recorte de 440:620 da como mucho 605×853, y exportarlo a 880×1240 era ampliarlo 1.45× (A-33).
   - Ahora se exportan a su tamaño nativo (03, 14 y M-09).
   - La de Angel sí da 880×1240.
5. **La 02 tenía frases que sonaban a texto escrito.**
   - «Una pregunta de verdad» era la etiqueta de A-05 metida en la boca de José.
   - «Esas manos son la idea de hoy» era una metáfora de redacción.
   - «Cada una de quien la vivió» era la frase del encargo, y a José no le cuadra: él no vivió un préstamo.
   - Quedan «quiero ver manos», «Miren cuántas manos siguen arriba. Esa es la idea de hoy» y «cada uno cuenta la suya».
6. **Gramática en la 19.** «Con alguien que no éramos nosotros» mezcla el singular con el plural. Ahora dice «con alguien de afuera», que es lo que ya decía el Apoyo.
7. **Cifras repetidas en pantalla (A-69).**
   - En la 15 y en la 16, el año salía dos veces en la misma pantalla: en la etiqueta y en la fuente.
   - Las fechas exactas de la 11 salían antes en la fuente de la 10 y después en el crédito de la 12.
   - Quité esas repeticiones de las fuentes y del crédito.
8. **A-35 sin declarar.** «25 días» y las fechas de la 11 son datos nuestros, pero van en blanco, el color del dato del país. Lo declaré en Convenciones y en R-15, con la razón: el degradado nunca lleva texto.
9. **La demo no decía a dónde mira Angel.** En la 18, el presentador muestra un póster. Angel tiene que teclear mirando la pantalla de la sala, y José tiene que leer de ahí (C-04). Lo añadí en la 18.
10. **El `iframe` de Lendex ya está comprobado.**
    - `curl -I` a las 22:39 devolvió 200, sin `X-Frame-Options` ni CSP, así que la página carga desde `file://`.
    - Lo anoté en M-07, con la hora.
    - La hora de los últimos commits de Lendex pasa de 22:09 a 22:30.
11. **«Entre seis» no tenía fuente** (20). Ahora la tiene: `lib/team.ts` (§6.2).
12. **Faltaban el «si falla» y el paso 0** en los relevos de la 09 y la 14.
13. **R-10, ampliado.** La web va a 12 fps en el iPhone. Si alguien escanea el QR con uno, eso contradice la lección de la 13. Queda como decisión de José.

### Lo que comprobé y está bien

- **Duraciones.**
  - Suman 995 s.
  - El reparto es de 480, 280 y 235 s.
  - Cuadran los minutos de cada cambio de naturaleza y de cada bloque. El tramo más largo sin un cambio dura 2:25.
- **Palabras.**
  - Son 141 en total, con una media de 7.05 y un máximo de 19. Las diez primeras pantallas suman 39.
  - Todos los titulares tienen 12 palabras o menos y 55 caracteres o menos, o sea, dos líneas.
- **Lendex.**
  - Recalculé con `calculateInstallments.ts` la cuota de RD$2,252.65, el total de RD$27,031.75, el interés y la tabla de referencia.
  - El total es 2.7032 veces el monto, sea cual sea el monto.
  - Con `es-DO`, la app escribe «27,031.75».
- **Cifras del país.**
  - Las cuatro (85.2 %, 92.7 %, 20.9 % y 15.3 / 7.5 %) son de §6.1 y llevan su año.
  - Cuadran «1.º de 143», «las otras 142», «el doble» (2.04) y «uno de cada cinco».
  - La cita es de un prestamista, en El Día (07, línea 193).
- **Las tres preguntas de la 07** y «Pymex responde las tres» son textuales de la publicación de LinkedIn (`fuentes/pag-www_linkedin_com_company_zhonyas.html`).
- **Commits del agujero negro.**
  - El #90, el #97, el #105 y el #108 son de Angel (08 §2).
  - Lo que se dice de cada arreglo coincide con 08 §6. Eso incluye la corrección del #108: el agujero seguía el scroll, no es que «no dejaba abrirse».
- **El canal de vista previa de M-05 se puede hacer.** zhonyas.com corre en Firebase Hosting: lo dicen la cabecera `x-fh-requested-host` y 08 (19-sep).
- **Medios.** Las rutas existen, y el atlas trae `wave` (3 cuadros a 6 fps) e `idle`.
- **Lo prohibido no aparece, ni en pantalla ni en voz.**
  - No hay nada del origen de Pymex anterior al proyecto final (decisión 3).
  - No hay mensajes de commits, uso de la IA, precios ni cifras del negocio.
  - El grep de 06 §10 (vocabulario, paralelismos negativos, calcos, gerundios y atribución vaga) da cero.

### Lo que no pude resolver

- **Los [CONFIRMAR] de R-06 siguen abiertos**, y hay que sumarles uno. El «se trababa» de la 11 (paso 1) es una lectura del #97, cuyo mensaje dice que el navegador desplazaba y redibujaba el agujero en el mismo cuadro. Lo confirma Angel.
- **R-10.** El PR #1 sigue sin mezclar, y lo decide José.
- **Z-12 en la 12 y la 13.** Esas dos grabaciones son de la web, no de un producto. Z-12 es lo más cercano del catálogo, porque no hay una ficha para un video propio.
- **La 14 queda justa.** Dura 20 s, y ahora tiene unas 32 palabras más el relevo. Si en el primer ensayo se pasa, los 5 s salen de la 11, que tiene 85 s para unas 85 palabras.
- **Siguen en manos de José:**
  - la fila 13 del marcador (R-11);
  - la sede (C-05);
  - la excepción de A-56 y la lectura de A-54;
  - el punto decimal.
- **La plantilla de la 08.** «La misma plantilla que les van a dar» se apoya en la nota de la tesis, que habla de la plantilla del ITLA en las defensas. No vi la plantilla.
