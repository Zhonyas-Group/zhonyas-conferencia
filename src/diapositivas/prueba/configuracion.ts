/**
 * Configuración del mazo de PRUEBA del motor (ver ./indice.ts). En el modo
 * «prueba» de vite.config.ts sustituye a src/configuracion.ts.
 *
 * Tiene las mismas claves de orador que la charla (lo exige el tipo), pero
 * conserva los nombres y el objetivo con que se escribieron las pruebas del
 * motor («Orador 2», 18 min): scripts/probar.mjs y los de
 * verificacion/pruebas-motor/ los buscan tal cual.
 *
 * No importa src/configuracion.ts en tiempo de ejecución (el `import type` se
 * borra al compilar): en el modo «prueba» ese import volvería a este archivo.
 */
import type { ClaveOrador } from '../../configuracion';

const oradores: Record<ClaveOrador, { nombre: string; color: string }> = {
  jose: { nombre: 'José', color: '#7cc4ff' },
  gregory: { nombre: 'Orador 2', color: '#ffb86b' },
  angel: { nombre: 'Orador 3', color: '#9be28f' },
};

export const configuracion = {
  titulo: 'Zhonyas · Prueba del motor',
  objetivoMinutos: 18,
  oradores,
};

export function nombreOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.nombre ?? clave;
}

export function colorOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.color ?? '#ffffff';
}
