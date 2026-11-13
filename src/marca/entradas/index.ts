/**
 * Las piezas de las entradas con nombre que traen su propio marcado.
 * Las entradas en sí (cifra, consola, encender, detalle) se registran solas
 * (src/marca/**\/*.entrada.ts, motor/registroMarca.ts).
 *
 *   import { Consola, Encender, Detalle } from '../marca/entradas';
 */
export { Consola, type PropsConsola, type AcentoConsola } from './consola/Consola';
export { Encender, type PropsEncender } from './encender/Encender';
export { Detalle, type PropsDetalle } from './detalle/Detalle';
