/**
 * Carga las entradas con nombre de las piezas de marca: cada archivo
 * src/marca/**\/*.entrada.ts (o .tsx) llama a registrarEntrada() al cargarse
 * (entradas.ts). Se importan todas aquí, una vez, al arrancar la presentación
 * y el laboratorio, para que una diapositiva pueda usar `efecto="cifra"` sin
 * importar la pieza a mano.
 */
import.meta.glob('/src/marca/**/*.entrada.{ts,tsx}', { eager: true });
