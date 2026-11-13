/**
 * Capturas de página completa de los sitios en vivo (rama diseno-wow, la
 * vitrina): para que las ventanas de las diapositivas recorran la página de
 * verdad. Deja public/medios/vitrina/sitios/<id>.jpg (1440 de ancho).
 *   node scripts/vitrina-sitios.mjs [id…]
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { abrirNavegador } from './navegador.mjs';

const SITIOS = {
  pymex: 'https://pymex.zhonyas.com/',
  lendex: 'https://lendexgp.com/',
  cuqui: 'https://suplidoracuqui.zhonyas.com/',
  karla: 'https://portafolio-creativo-eeba0.web.app/',
  matriz: 'https://matriz.zhonyas.com/',
  cantus: 'https://set-coro.zhonyas.com/',
  butterfly: 'https://butterfly-pastry-demo.web.app/',
};
const raiz = resolve(import.meta.dirname, '..');
const salida = join(raiz, 'public', 'medios', 'vitrina', 'sitios');
mkdirSync(salida, { recursive: true });
const pedidos = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SITIOS);
const MAX_ALTO = 9000;

const nav = await abrirNavegador();
try {
  for (const id of pedidos) {
    const p = await nav.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    try {
      await p.goto(SITIOS[id], { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
      await p.waitForTimeout(2500);
      // Bajar poco a poco para que carguen las imágenes diferidas y se disparen las entradas.
      const alto = await p.evaluate(async (max) => {
        const h = () => Math.min(max, document.documentElement.scrollHeight);
        for (let y = 0; y < h(); y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 800));
        return h();
      }, MAX_ALTO);
      await p.screenshot({ path: join(salida, `${id}.jpg`), type: 'jpeg', quality: 78, fullPage: alto <= MAX_ALTO, clip: alto > MAX_ALTO ? { x: 0, y: 0, width: 1440, height: MAX_ALTO } : undefined });
      console.log(id, alto);
    } catch (e) {
      console.log(id, 'ERROR', e.message.split('\n')[0]);
    } finally {
      await p.close();
    }
  }
} finally {
  await nav.close();
}
