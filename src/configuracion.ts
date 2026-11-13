/**
 * Datos generales de la presentación.
 *
 * Los oradores se declaran aquí una sola vez y cada diapositiva dice quién la
 * presenta con la clave (`orador: 'jose'`). El presentador usa esto para avisar
 * de los cambios de orador.
 */
export const configuracion = {
  /** Título de la ventana del navegador. */
  titulo: 'Zhonyas · Conferencia',
  /** Duración objetivo de la charla, en minutos (se puede cambiar en la ventana del presentador). */
  objetivoMinutos: 18,
  oradores: {
    jose: { nombre: 'José', color: '#7cc4ff' },
    orador2: { nombre: 'Orador 2', color: '#ffb86b' },
    orador3: { nombre: 'Orador 3', color: '#9be28f' },
  },
} as const;

export type ClaveOrador = keyof typeof configuracion.oradores;

export function nombreOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.nombre ?? clave;
}

export function colorOrador(clave: ClaveOrador): string {
  return configuracion.oradores[clave]?.color ?? '#ffffff';
}
