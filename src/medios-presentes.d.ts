/**
 * Módulo virtual que genera vite.config.ts (plugin «zhonyas:medios-presentes»)
 * al compilar o al arrancar el servidor de desarrollo. Lo usa
 * src/medios-opcionales.ts; las diapositivas no lo importan directamente.
 */
declare module 'virtual:medios-presentes' {
  /** Cada archivo de public/medios/, con su ruta relativa a public/ («medios/libreta/…»), en orden. */
  export const archivos: readonly string[];
  /** El texto de cada .txt de public/medios/ (créditos, nombres), sin espacios a los lados. */
  export const textos: Readonly<Record<string, string>>;
}

/**
 * Módulo virtual de vite.config.ts (plugin «zhonyas:medios-en-linea»): en el
 * modo «muestra», los medios que van dentro del HTML como data: URI, por su
 * ruta relativa («medios/equipo/angel/personaje.webp»). En los demás, vacío.
 */
declare module 'virtual:medios-en-linea' {
  export const enLinea: Readonly<Record<string, string>>;
}
