/**
 * Lo que el auditor ejecuta DENTRO del navegador (page.evaluate). Cada función
 * se serializa sola: no puede usar nada de fuera de su cuerpo.
 *
 *   medirPantalla   la diapositiva en pantalla: textos, bloques, estilos, decoraciones y tokens
 *   ocultarTexto    pinta (o no) el texto transparente, para capturar el fondo real de cada texto
 *   medirCruces     con la tinta de cada texto ya medida: qué decoración la toca y qué degradado tiene debajo
 *   analizarPixeles (en otra pestaña) tinta y contraste de cada texto con las dos capturas
 *   anotar          (en otra pestaña) la captura con cada fallo enmarcado y numerado
 *
 * Idea de recorrido.js y cruces.js de la auditoría de T-Eco
 * (C:/Users/joser/.claude/jobs/cc7e4a10/tmp/teco-auditoria/): medir cada texto
 * con su tamaño efectivo y su opacidad acumulada, y buscar las líneas que lo
 * cruzan muestreando su geometría.
 */

/** @param {{ selectorCapa: string, opacidadVisible: number }} op */
export function medirPantalla(op) {
  const capa = document.querySelector(op.selectorCapa);
  if (!capa) return { ok: false, error: `No hay ninguna capa «${op.selectorCapa}» en la página.` };
  const ancho = innerWidth;
  const alto = innerHeight;
  const escenario = capa.closest('.escenario') ?? capa;
  const rEsc = escenario.getBoundingClientRect();
  const escalaEscenario = rEsc.width / 1920 || 1;

  const estilos = new Map();
  const cs = (el, pseudo) => {
    const clave = pseudo ? `${pseudo}` : '';
    let porEl = estilos.get(el);
    if (!porEl) estilos.set(el, (porEl = new Map()));
    let s = porEl.get(clave);
    if (!s) porEl.set(clave, (s = getComputedStyle(el, pseudo || null)));
    return s;
  };
  const opacidades = new Map();
  const opacidad = (el) => {
    if (!el || !capa.contains(el)) return 1;
    if (opacidades.has(el)) return opacidades.get(el);
    const propia = parseFloat(cs(el).opacity);
    const valor = (Number.isFinite(propia) ? propia : 1) * (el === capa ? 1 : opacidad(el.parentElement));
    opacidades.set(el, valor);
    return valor;
  };
  const caja = (r) => ({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom });
  const enPantalla = (r) => r.width > 0.5 && r.height > 0.5 && r.right > 0 && r.bottom > 0 && r.left < ancho && r.top < alto;
  const clases = (el) => (typeof el.className === 'string' ? el.className : el.className?.baseVal ?? '').trim();
  const nombre = (el) => {
    const c = clases(el).split(/\s+/).filter(Boolean).slice(0, 2);
    return el.tagName.toLowerCase() + c.map((x) => `.${x}`).join('');
  };
  const ruta = (el) => {
    const partes = [];
    for (let e = el; e && e !== capa && partes.length < 3; e = e.parentElement) partes.unshift(nombre(e));
    return partes.join(' > ');
  };
  const excepcionesDe = (el) => {
    const lista = [];
    for (let e = el; e && e !== capa.parentElement; e = e.parentElement) {
      const v = e.getAttribute?.('data-auditar-excepcion');
      if (v) lista.push(v);
    }
    return lista;
  };
  const esSvg = (el) => el instanceof SVGElement;
  const NO_PINTA = 'defs,mask,clipPath,symbol,pattern,marker,title,desc,style,script,template,noscript,linearGradient,radialGradient,filter,metadata';

  // ——— Tokens de marca.css, leídos del CSSOM: lo que hay es lo que vale ———
  const tokens = {};
  const recorrerReglas = (reglas) => {
    for (const r of reglas) {
      if (r instanceof CSSStyleRule && /(^|,)\s*:root\s*(,|$)/.test(r.selectorText)) {
        for (let k = 0; k < r.style.length; k++) {
          const p = r.style[k];
          if (p.startsWith('--zh-')) tokens[p] = r.style.getPropertyValue(p).trim();
        }
      }
      if (r.cssRules) recorrerReglas(r.cssRules);
    }
  };
  for (const hoja of document.styleSheets) {
    try {
      recorrerReglas(hoja.cssRules);
    } catch {
      /* hoja de otro origen */
    }
  }
  // Cómo queda calculado un fondo con el token: así se compara con el de cada elemento.
  const sonda = document.createElement('div');
  document.body.appendChild(sonda);
  const canonico = (valor) => {
    sonda.style.backgroundImage = valor;
    return getComputedStyle(sonda).backgroundImage;
  };
  const canon = { firma: canonico('var(--zh-firma)'), equipo: canonico('var(--zh-fondo-equipo)') };
  sonda.remove();

  // ——— Textos: cada nodo de texto visible, con su caja de línea ———
  const textos = [];
  const refsTextos = [];
  const bloques = [];
  const indiceBloque = new Map();
  const bloqueDe = (el) => {
    if (esSvg(el)) return el.closest('text') ?? el;
    for (let e = el; e && e !== capa; e = e.parentElement) {
      const d = cs(e).display;
      if (!d.startsWith('inline') && d !== 'contents') return e;
    }
    return el;
  };
  const conTexto = new Set();
  const paseo = document.createTreeWalker(capa, NodeFilter.SHOW_TEXT);
  for (let n = paseo.nextNode(); n; n = paseo.nextNode()) {
    const texto = n.textContent.replace(/\s+/g, ' ').trim();
    if (!texto) continue;
    const el = n.parentElement;
    if (!el || el.closest(NO_PINTA)) continue;
    const s = cs(el);
    if (s.visibility !== 'visible' || s.display === 'none') continue;
    const op_ = opacidad(el);
    if (op_ < op.opacidadVisible) continue;
    const rango = document.createRange();
    rango.selectNodeContents(n);
    let rects = [...rango.getClientRects()].filter(enPantalla);
    if (!rects.length && esSvg(el)) {
      const r = el.getBoundingClientRect();
      if (enPantalla(r)) rects = [r];
    }
    if (!rects.length) continue;
    const tam = parseFloat(s.fontSize);
    // Escala real del texto: la del escenario por la de cada transform entre el texto y el escenario
    // (Z-07 deja una pieza a 1,055). En SVG, la de su matriz de pantalla.
    let escala = escalaEscenario;
    if (esSvg(el)) {
      const m = el.getScreenCTM?.();
      if (m) escala = Math.hypot(m.a, m.b);
    } else {
      for (let e = el; e && e !== escenario; e = e.parentElement) {
        const t = cs(e).transform;
        if (t && t !== 'none') {
          const m = new DOMMatrixReadOnly(t);
          escala *= Math.hypot(m.m11, m.m12);
        }
      }
    }
    let filtro = false;
    for (let e = el; e && e !== capa.parentElement; e = e.parentElement) {
      const se = cs(e);
      if (se.filter !== 'none' || se.mixBlendMode !== 'normal') {
        filtro = true;
        break;
      }
    }
    const b = bloqueDe(el);
    if (!indiceBloque.has(b)) {
      indiceBloque.set(b, bloques.length);
      bloques.push({ textos: [], donde: ruta(b), etiqueta: b.tagName.toLowerCase() });
    }
    const ib = indiceBloque.get(b);
    const i = textos.length;
    bloques[ib].textos.push(i);
    const lsp = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing);
    textos.push({
      i,
      texto,
      // Con sus espacios de los bordes: React parte «Paso {n}: …» en tres nodos y hay que unirlos tal cual.
      crudo: n.textContent.replace(/\s+/g, ' '),
      rects: rects.map(caja),
      tam,
      tamEf: Math.round(tam * escala * 10) / 10,
      familia: s.fontFamily,
      peso: Number(s.fontWeight),
      color: s.color,
      relleno: s.webkitTextFillColor,
      clipTexto: s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text',
      mayusculas: s.textTransform === 'uppercase' || /small-caps/.test(s.fontVariantCaps ?? ''),
      interletra: tam ? lsp / tam : 0,
      sombra: s.textShadow,
      opacidad: op_,
      filtro,
      titulo: !!el.closest('h1,h2,h3,h4,h5,h6,.zh-titular,.zh-portadilla,.zh-cifra,[data-titulo]'),
      lectura: !!el.closest('[data-lectura],.zh-lectura'),
      fuente: !!el.closest('.zh-fuente,[data-fuente]'),
      consola: !!el.closest('[data-consola],pre,code,kbd,samp,[class*="consola"]'),
      dato: el.closest('[data-dato]')?.getAttribute('data-dato') ?? null,
      excepciones: excepcionesDe(el),
      donde: ruta(el),
      bloque: ib,
    });
    refsTextos.push({ nodo: n, el });
    conTexto.add(el);
  }

  // ——— Elementos: estilos que se auditan y decoraciones ———
  const elementos = [];
  const decoraciones = [];
  const refsDecoraciones = [];
  const pseudoTextos = [];
  const FORMAS = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'use', 'image']);
  const MEDIOS = new Set(['img', 'video', 'canvas', 'iframe', 'object', 'embed']);
  const transparente = (c) => !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c) || /\/\s*0\)$/.test(c);
  const bordeVisible = (s, lado) =>
    parseFloat(s[`border${lado}Width`]) > 0 && !['none', 'hidden'].includes(s[`border${lado}Style`]) && !transparente(s[`border${lado}Color`]);
  const usados = new Set();
  const indiceElemento = new Map();

  for (const el of capa.querySelectorAll('*')) {
    if (el.closest(NO_PINTA)) continue;
    const s = cs(el);
    if (s.display === 'none' || s.visibility !== 'visible') continue;
    const op_ = opacidad(el);
    if (op_ < op.opacidadVisible) continue;
    const r = el.getBoundingClientRect();
    if (!enPantalla(r)) continue;
    const etiqueta = el.tagName.toLowerCase();
    const svg = esSvg(el);
    const hecho = { i: elementos.length, etiqueta, clases: clases(el), donde: ruta(el), caja: caja(r), excepciones: excepcionesDe(el), colores: [] };
    elementos.push(hecho);
    indiceElemento.set(el, hecho.i);
    const color = (prop, valor) => !transparente(valor) && hecho.colores.push({ prop, valor });
    if (conTexto.has(el)) {
      color('color', s.color);
      if (s.webkitTextFillColor && s.webkitTextFillColor !== s.color) color('-webkit-text-fill-color', s.webkitTextFillColor);
    }
    if (!svg) {
      color('background-color', s.backgroundColor);
      for (const lado of ['Top', 'Right', 'Bottom', 'Left']) if (bordeVisible(s, lado)) color(`border-${lado.toLowerCase()}-color`, s[`border${lado}Color`]);
      if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) color('outline-color', s.outlineColor);
      if (conTexto.has(el) && s.textDecorationLine !== 'none') color('text-decoration-color', s.textDecorationColor);
    } else if (FORMAS.has(etiqueta) || etiqueta === 'text' || etiqueta === 'tspan') {
      for (const prop of ['fill', 'stroke']) {
        const v = s[prop];
        if (!v || v === 'none') continue;
        // Lo que no pinta: el relleno de una <line>, un relleno o un trazo con opacidad 0, un trazo de grosor 0.
        if (prop === 'fill' && (etiqueta === 'line' || parseFloat(s.fillOpacity) === 0)) continue;
        if (prop === 'stroke' && (parseFloat(s.strokeOpacity) === 0 || parseFloat(s.strokeWidth) === 0)) continue;
        const url = /url\(["']?#([^"')]+)/.exec(v);
        if (url) usados.add(url[1]);
        else color(prop, v);
      }
    }
    if (!svg && s.backgroundImage !== 'none') hecho.fondoImagen = s.backgroundImage;
    if (!svg && s.borderImageSource && s.borderImageSource !== 'none') hecho.bordeImagen = s.borderImageSource;
    if (s.boxShadow !== 'none') hecho.sombraCaja = s.boxShadow;
    if (conTexto.has(el) && s.textShadow !== 'none') hecho.sombraTexto = s.textShadow;
    if (s.filter !== 'none') hecho.filtro = s.filter;
    const vidrio = s.backdropFilter || s.webkitBackdropFilter;
    if (vidrio && vidrio !== 'none') hecho.vidrio = vidrio;
    if (['ul', 'ol', 'li', 'dl'].includes(etiqueta) || s.display === 'list-item') hecho.lista = true;
    if (/lucide/i.test(hecho.clases) || el.hasAttribute('data-lucide')) hecho.lucide = true;
    hecho.tieneFondo = !svg && (!transparente(s.backgroundColor) || s.backgroundImage !== 'none');

    // Decoración: lo que pinta algo y no es texto.
    let tipo = null;
    if (MEDIOS.has(etiqueta)) tipo = 'medio';
    else if (svg && FORMAS.has(etiqueta) && (s.fill !== 'none' || s.stroke !== 'none' || etiqueta === 'image' || etiqueta === 'use')) tipo = 'svg';
    else if (
      !svg &&
      (!transparente(s.backgroundColor) ||
        s.backgroundImage !== 'none' ||
        ['Top', 'Right', 'Bottom', 'Left'].some((l) => bordeVisible(s, l)) ||
        s.boxShadow !== 'none' ||
        (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && !transparente(s.outlineColor)))
    )
      tipo = 'caja';
    if (tipo) {
      const deco = { j: decoraciones.length, tipo, etiqueta, donde: ruta(el), caja: caja(r), elemento: hecho.i };
      if (tipo === 'svg') {
        deco.relleno = s.fill !== 'none';
        deco.trazo = s.stroke !== 'none';
        const url = /url\(["']?#([^"')]+)/.exec(s.fill);
        if (url) deco.gradienteSvg = url[1];
      }
      if (tipo === 'caja' && s.backgroundImage !== 'none') deco.fondoImagen = s.backgroundImage;
      decoraciones.push(deco);
      refsDecoraciones.push({ el });
    }

    // Pseudo-elementos: su texto (viñetas, rótulos) y su caja si decoran.
    if (!svg) {
      for (const pseudo of ['::before', '::after', '::marker']) {
        const ps = cs(el, pseudo);
        const contenido = ps.content;
        if (!contenido || contenido === 'none' || contenido === 'normal') continue;
        if (pseudo === '::marker') continue; // el marcador de <li> ya cuenta como lista
        const literal = /^"(.*)"$/.exec(contenido);
        if (literal && literal[1].trim()) {
          pseudoTextos.push({
            texto: literal[1].trim(),
            tamEf: Math.round(parseFloat(ps.fontSize) * escalaEscenario * 10) / 10,
            familia: ps.fontFamily,
            donde: `${ruta(el)}${pseudo}`,
            caja: caja(r),
            excepciones: excepcionesDe(el),
          });
        }
        const pinta =
          !transparente(ps.backgroundColor) ||
          ps.backgroundImage !== 'none' ||
          ['Top', 'Right', 'Bottom', 'Left'].some((l) => bordeVisible(ps, l)) ||
          ps.boxShadow !== 'none';
        if (!pinta || ps.display === 'none') continue;
        // Caja aproximada: la de un pseudo absoluto respecto de su anfitrión (ancho y alto ya resueltos en px).
        const w = parseFloat(ps.width);
        const h = parseFloat(ps.height);
        if (!(w > 0.5 && h > 0.5)) continue;
        const bl = parseFloat(s.borderLeftWidth) || 0;
        const bt = parseFloat(s.borderTopWidth) || 0;
        let x0 = r.left + bl * escalaEscenario;
        let y0 = r.top + bt * escalaEscenario;
        if (ps.position === 'absolute' || ps.position === 'fixed') {
          if (ps.left !== 'auto') x0 += parseFloat(ps.left) * escalaEscenario;
          else if (ps.right !== 'auto') x0 = r.right - (parseFloat(s.borderRightWidth) || 0) * escalaEscenario - (parseFloat(ps.right) + w) * escalaEscenario;
          if (ps.top !== 'auto') y0 += parseFloat(ps.top) * escalaEscenario;
          else if (ps.bottom !== 'auto') y0 = r.bottom - (parseFloat(s.borderBottomWidth) || 0) * escalaEscenario - (parseFloat(ps.bottom) + h) * escalaEscenario;
        }
        const c = { x0, y0, x1: x0 + w * escalaEscenario, y1: y0 + h * escalaEscenario };
        const colores = [];
        if (!transparente(ps.backgroundColor)) colores.push({ prop: `${pseudo} background-color`, valor: ps.backgroundColor });
        for (const lado of ['Top', 'Right', 'Bottom', 'Left'])
          if (bordeVisible(ps, lado)) colores.push({ prop: `${pseudo} border-${lado.toLowerCase()}-color`, valor: ps[`border${lado}Color`] });
        elementos.push({
          i: elementos.length,
          etiqueta: `${etiqueta}${pseudo}`,
          clases: hecho.clases,
          donde: `${ruta(el)}${pseudo}`,
          caja: c,
          excepciones: excepcionesDe(el),
          colores,
          fondoImagen: ps.backgroundImage !== 'none' ? ps.backgroundImage : undefined,
          sombraCaja: ps.boxShadow !== 'none' ? ps.boxShadow : undefined,
          filtro: ps.filter !== 'none' ? ps.filter : undefined,
          tieneFondo: !transparente(ps.backgroundColor) || ps.backgroundImage !== 'none',
          aproximada: true,
        });
        decoraciones.push({
          j: decoraciones.length,
          tipo: 'pseudo',
          etiqueta: `${etiqueta}${pseudo}`,
          donde: `${ruta(el)}${pseudo}`,
          caja: c,
          elemento: elementos.length - 1,
          fondoImagen: ps.backgroundImage !== 'none' ? ps.backgroundImage : undefined,
          aproximada: true,
        });
        refsDecoraciones.push({ el, pseudo: true });
      }
    }
  }
  textos.forEach((t, k) => {
    t.elemento = indiceElemento.get(refsTextos[k].el) ?? null;
  });

  // ——— Degradados SVG que pinta alguna forma visible: sus paradas ———
  const gradientesSvg = [];
  for (const id of usados) {
    let g = document.getElementById(id);
    if (!g) continue;
    const visto = new Set();
    let paradas = [...g.querySelectorAll(':scope > stop')];
    while (!paradas.length && g && !visto.has(g)) {
      visto.add(g);
      const ref = (g.getAttribute('href') || g.getAttribute('xlink:href') || '').replace(/^#/, '');
      g = ref ? document.getElementById(ref) : null;
      if (g) paradas = [...g.querySelectorAll(':scope > stop')];
    }
    gradientesSvg.push({
      id,
      paradas: paradas.map((p) => {
        const o = (p.getAttribute('offset') ?? '0').trim();
        return {
          offset: o.endsWith('%') ? parseFloat(o) / 100 : parseFloat(o),
          color: getComputedStyle(p).stopColor,
          opacidad: parseFloat(getComputedStyle(p).stopOpacity),
        };
      }),
    });
  }

  window.__auditor = { capa, textos: refsTextos, decoraciones: refsDecoraciones };
  return {
    ok: true,
    escala: escalaEscenario,
    escenario: caja(rEsc),
    textos,
    bloques,
    elementos,
    decoraciones,
    pseudoTextos,
    gradientesSvg,
    tokens,
    canon,
  };
}

/** Texto transparente (con su sombra, que es parte del fondo que ve el público) o normal otra vez. */
export async function ocultarTexto(activar) {
  const id = 'auditor-sin-texto';
  document.getElementById(id)?.remove();
  if (activar) {
    const st = document.createElement('style');
    st.id = id;
    st.textContent = `
      .capa *, .capa { -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important;
        -webkit-text-stroke-color: transparent !important; caret-color: transparent !important; }
      .capa text, .capa tspan, .capa textPath { fill: transparent !important; stroke: transparent !important; }`;
    document.head.appendChild(st);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/**
 * Cruces (P0-10) y degradados debajo del texto (A-40), con la tinta de cada
 * texto ya medida en píxeles.
 * @param {{ tintas: Array<{x0:number,y0:number,x1:number,y1:number}|null>, degradados: Record<number, string> }} op
 */
export function medirCruces(op) {
  const a = window.__auditor;
  if (!a) return { cruces: [], debajo: [], dudosos: [] };
  const cruces = [];
  const debajo = [];
  const dudosos = [];
  /** ¿La forma o algún grupo suyo dentro del SVG tiene clip-path o máscara? */
  const recortada = (el) => {
    for (let e = el; e && !(e instanceof SVGSVGElement && !e.ownerSVGElement); e = e.parentElement) {
      const s = getComputedStyle(e);
      if ((s.clipPath && s.clipPath !== 'none') || (s.mask && s.mask !== 'none') || (s.maskImage && s.maskImage !== 'none')) return true;
      if (e.hasAttribute?.('clip-path') || e.hasAttribute?.('mask')) return true;
    }
    return false;
  };
  const corta = (k, r) => {
    const x0 = Math.max(k.x0, r.x0);
    const y0 = Math.max(k.y0, r.y0);
    const x1 = Math.min(k.x1, r.x1);
    const y1 = Math.min(k.y1, r.y1);
    return x1 - x0 >= 1 && y1 - y0 >= 1 ? { x0, y0, x1, y1 } : null;
  };
  const contiene = (r, k) => r.x0 <= k.x0 + 0.5 && r.y0 <= k.y0 + 0.5 && r.x1 >= k.x1 - 0.5 && r.y1 >= k.y1 - 0.5;
  const cajaDe = (el) => {
    const r = el.getBoundingClientRect();
    return { x0: r.left, y0: r.top, x1: r.right, y1: r.bottom };
  };
  /** Fracción de puntos de la zona que caen dentro de la forma SVG (relleno o trazo), o null si no se puede saber. */
  const enForma = (el, zona) => {
    if (typeof el.isPointInFill !== 'function') return null;
    const m = el.getScreenCTM?.();
    if (!m) return null;
    const inv = m.inverse();
    const s = getComputedStyle(el);
    const relleno = s.fill !== 'none';
    const trazo = s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0;
    const paso = Math.max(1.5, Math.min(zona.x1 - zona.x0, zona.y1 - zona.y0) / 14, Math.sqrt(((zona.x1 - zona.x0) * (zona.y1 - zona.y0)) / 900));
    let dentro = 0;
    let total = 0;
    for (let y = zona.y0 + paso / 2; y < zona.y1; y += paso) {
      for (let x = zona.x0 + paso / 2; x < zona.x1; x += paso) {
        const p = new DOMPoint(x, y).matrixTransform(inv);
        total++;
        if ((relleno && el.isPointInFill(p)) || (trazo && el.isPointInStroke(p))) dentro++;
      }
    }
    return total ? dentro / total : 0;
  };

  a.textos.forEach(({ el }, i) => {
    const k = op.tintas[i];
    if (!k) return;
    a.decoraciones.forEach(({ el: deco, pseudo }, j) => {
      const esSvgForma = deco instanceof SVGGeometryElement;
      // El fondo del propio texto (su tarjeta, la diapositiva) no lo cruza: lo contiene.
      if (!pseudo && (deco === el || deco.contains(el))) {
        if (op.degradados[j] && corta(k, cajaDe(deco))) debajo.push({ texto: i, deco: j });
        return;
      }
      const r = op.cajas[j];
      const zona = corta(k, r);
      if (!zona) return;
      // Una forma SVG recortada o enmascarada (la cinta es un <rect> con clip-path y máscara), un <use>
      // o una <image>: su geometría no dice lo que pinta. Se decide con píxeles (Node la oculta y compara).
      if (deco instanceof SVGElement && (!esSvgForma || recortada(deco))) {
        dudosos.push({ texto: i, deco: j, zona, tinta: k, caja: r });
        return;
      }
      if (esSvgForma) {
        const f = enForma(deco, zona);
        if (f === 0) return;
        if (op.degradados[j]) debajo.push({ texto: i, deco: j });
        if (f === 1 && contiene(r, k)) return; // forma rellena debajo de todo el texto: es su fondo
        cruces.push({ texto: i, deco: j, zona, forma: true });
        return;
      }
      if (op.degradados[j]) debajo.push({ texto: i, deco: j });
      if (contiene(r, k)) return; // lo tiene detrás entero: es su fondo (el contraste lo mide aparte)
      cruces.push({ texto: i, deco: j, zona });
    });
  });
  return { cruces, debajo, dudosos };
}

/** Oculta (o vuelve a enseñar) una decoración por su índice, para la prueba con píxeles de medirCruces. */
export async function ocultarDecoracion({ j, ocultar }) {
  const el = window.__auditor?.decoraciones[j]?.el;
  if (!el) return false;
  if (ocultar) {
    el.dataset.auditorVisibilidad = el.style.visibility;
    el.style.setProperty('visibility', 'hidden', 'important');
  } else {
    el.style.visibility = el.dataset.auditorVisibilidad ?? '';
    delete el.dataset.auditorVisibilidad;
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
}

/**
 * Qué parte de cada zona cambia entre dos capturas (con y sin una decoración),
 * en fracción de píxeles: 0 = la decoración no pinta ahí; 1 = la pinta entera.
 * @param {{ a: string, b: string, difTinta: number, zonas: Array<{x0:number,y0:number,x1:number,y1:number}> }} op
 */
export async function compararZonas(op) {
  const cargar = async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const lienzo = new OffscreenCanvas(bmp.width, bmp.height);
    const x = lienzo.getContext('2d', { willReadFrequently: true });
    x.drawImage(bmp, 0, 0);
    return x.getImageData(0, 0, bmp.width, bmp.height);
  };
  const [A, B] = await Promise.all([cargar(op.a), cargar(op.b)]);
  return op.zonas.map((z) => {
    let cambian = 0;
    let total = 0;
    for (let y = Math.max(0, Math.floor(z.y0)); y < Math.min(A.height, Math.ceil(z.y1)); y++) {
      for (let x = Math.max(0, Math.floor(z.x0)); x < Math.min(A.width, Math.ceil(z.x1)); x++) {
        const k = (y * A.width + x) * 4;
        total++;
        if (Math.max(Math.abs(A.data[k] - B.data[k]), Math.abs(A.data[k + 1] - B.data[k + 1]), Math.abs(A.data[k + 2] - B.data[k + 2])) >= op.difTinta) cambian++;
      }
    }
    return total ? cambian / total : 0;
  });
}

/**
 * Tinta y contraste de cada texto, con la captura normal (a) y la del texto
 * transparente (b). Corre en una pestaña vacía.
 *
 * - Tinta: los píxeles en que a y b difieren (≥ difTinta en algún canal) dentro de las cajas de línea.
 * - Contraste: el peor del rectángulo, contra cada píxel de b (el fondo real: foto, degradado, línea…),
 *   con el color calculado del texto mezclado con su alfa y su opacidad. Si el texto tiene filtro o
 *   mezcla (o relleno de degradado), el color sale de la propia tinta: el píxel que más se aparta del fondo.
 *
 * @param {{ a: string, b: string, difTinta: number, items: Array<{ i:number, rects:any[], rgba:number[]|null, tinta:boolean }> }} op
 */
export async function analizarPixeles(op) {
  const cargar = async (b64) => {
    const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
    const bmp = await createImageBitmap(blob, { colorSpaceConversion: 'none', premultiplyAlpha: 'none' });
    const lienzo = new OffscreenCanvas(bmp.width, bmp.height);
    const x = lienzo.getContext('2d', { willReadFrequently: true });
    x.drawImage(bmp, 0, 0);
    return x.getImageData(0, 0, bmp.width, bmp.height);
  };
  const [A, B] = await Promise.all([cargar(op.a), cargar(op.b)]);
  const W = A.width;
  const H = A.height;
  const lin = new Float64Array(256);
  for (let v = 0; v < 256; v++) {
    const c = v / 255;
    lin[v] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }
  const lum = (r, g, b) => 0.2126 * lin[r] + 0.7152 * lin[g] + 0.0722 * lin[b];
  const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const salida = [];
  for (const item of op.items) {
    const zonas = item.rects.map((r) => ({
      x0: Math.max(0, Math.floor(r.x0)),
      y0: Math.max(0, Math.floor(r.y0)),
      x1: Math.min(W, Math.ceil(r.x1)),
      y1: Math.min(H, Math.ceil(r.y1)),
    }));
    let n = 0;
    let tx0 = Infinity;
    let ty0 = Infinity;
    let tx1 = -Infinity;
    let ty1 = -Infinity;
    let maxD = -1;
    let tintaColor = null;
    for (const z of zonas) {
      for (let y = z.y0; y < z.y1; y++) {
        for (let x = z.x0; x < z.x1; x++) {
          const k = (y * W + x) * 4;
          const d = Math.max(Math.abs(A.data[k] - B.data[k]), Math.abs(A.data[k + 1] - B.data[k + 1]), Math.abs(A.data[k + 2] - B.data[k + 2]));
          if (d >= op.difTinta) {
            n++;
            if (x < tx0) tx0 = x;
            if (y < ty0) ty0 = y;
            if (x + 1 > tx1) tx1 = x + 1;
            if (y + 1 > ty1) ty1 = y + 1;
            if (d > maxD) {
              maxD = d;
              tintaColor = [A.data[k], A.data[k + 1], A.data[k + 2]];
            }
          }
        }
      }
    }
    if (!n) {
      salida.push({ i: item.i, tinta: null });
      continue;
    }
    // Color del texto: el calculado (con su alfa) o, si hay filtro o mezcla, el de su propia tinta.
    const usarTinta = item.tinta || !item.rgba;
    const [cr, cg, cb, ca] = usarTinta ? [...tintaColor, 1] : item.rgba;
    let peor = Infinity;
    let peorFondo = null;
    for (const z of zonas) {
      for (let y = z.y0; y < z.y1; y++) {
        for (let x = z.x0; x < z.x1; x++) {
          const k = (y * W + x) * 4;
          const br = B.data[k];
          const bg = B.data[k + 1];
          const bb = B.data[k + 2];
          const tr = Math.round(ca * cr + (1 - ca) * br);
          const tg = Math.round(ca * cg + (1 - ca) * bg);
          const tb = Math.round(ca * cb + (1 - ca) * bb);
          const c = ratio(lum(tr, tg, tb), lum(br, bg, bb));
          if (c < peor) {
            peor = c;
            peorFondo = [br, bg, bb];
          }
        }
      }
    }
    salida.push({
      i: item.i,
      tinta: { x0: tx0, y0: ty0, x1: tx1, y1: ty1, n },
      contraste: Math.round(peor * 100) / 100,
      fondo: peorFondo,
      colorTexto: [cr, cg, cb],
      deTinta: usarTinta,
    });
  }
  return salida;
}

/**
 * La captura con cada hallazgo enmarcado y numerado (JPEG en base64).
 * @param {{ imagen: string, marcas: Array<{ n:number, caja:any, color:string }>, calidad: number }} op
 */
export async function anotar(op) {
  const blob = await (await fetch(`data:image/png;base64,${op.imagen}`)).blob();
  const bmp = await createImageBitmap(blob);
  const lienzo = new OffscreenCanvas(bmp.width, bmp.height);
  const x = lienzo.getContext('2d');
  x.drawImage(bmp, 0, 0);
  x.font = 'bold 26px Arial, sans-serif';
  x.textBaseline = 'middle';
  const etiquetas = [];
  let enEsquina = 0;
  for (const m of op.marcas) {
    x.strokeStyle = m.color;
    x.lineWidth = 4;
    const texto = m.caja ? String(m.n) : `${m.n} · ${m.regla} (toda la pantalla)`;
    const w = x.measureText(texto).width + 18;
    let ex;
    let ey;
    if (m.caja) {
      const { x0, y0, x1, y1 } = m.caja;
      x.strokeRect(x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6);
      ex = Math.min(Math.max(0, x0 - 3), bmp.width - w);
      ey = y0 - 38 >= 0 ? y0 - 38 : Math.min(bmp.height - 34, y1 + 6);
    } else {
      // Lo que es de toda la pantalla (A-09, A-49), en columna arriba a la derecha.
      ex = bmp.width - w - 8;
      ey = 8 + enEsquina * 40;
      enEsquina++;
    }
    // Que las etiquetas no se tapen: a la derecha si cabe; si no, debajo.
    const choca = () => etiquetas.some((e) => ex < e.x + e.w && ex + w > e.x && ey < e.y + 34 && ey + 34 > e.y);
    for (let intento = 0; choca() && intento < 40; intento++) {
      if (m.caja && ex + w + 40 < bmp.width) ex += Math.min(w, 44) + 4;
      else ey = Math.min(bmp.height - 34, ey + 38);
    }
    etiquetas.push({ x: ex, y: ey, w });
    x.fillStyle = m.color;
    x.fillRect(ex, ey, w, 34);
    x.fillStyle = '#ffffff';
    x.fillText(texto, ex + 9, ey + 17);
  }
  const salida = await lienzo.convertToBlob({ type: 'image/jpeg', quality: op.calidad });
  const bytes = new Uint8Array(await salida.arrayBuffer());
  let bin = '';
  for (let k = 0; k < bytes.length; k += 0x8000) bin += String.fromCharCode(...bytes.subarray(k, k + 0x8000));
  return btoa(bin);
}
