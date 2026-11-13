/**
 * Abre el Chrome (o Edge) instalado en el equipo con playwright-core.
 * Nunca descarga navegadores: no hace falta «playwright install».
 */
import { chromium } from 'playwright-core';

export async function abrirNavegador({ headless = true, args = [] } = {}) {
  const comunes = {
    headless,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--hide-scrollbars',
      // Sin ventana, Chrome frena temporizadores y pintado; para medir y grabar hace falta que no lo haga.
      '--disable-renderer-backgrounding',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      ...args,
    ],
  };
  const canales = process.env.CANAL_NAVEGADOR ? [process.env.CANAL_NAVEGADOR] : ['chrome', 'msedge'];
  let ultimoError;
  for (const channel of canales) {
    try {
      return await chromium.launch({ ...comunes, channel });
    } catch (error) {
      ultimoError = error;
    }
  }
  throw new Error(
    `No se pudo abrir Chrome ni Edge con playwright-core. Instala Google Chrome o define CANAL_NAVEGADOR.\n${ultimoError?.message ?? ''}`,
  );
}
