/**
 * <Dato id="…" />: la única forma de pintar una cifra en una diapositiva.
 *
 *   <Dato id="gem-actividad-emprendedora" />              → «41.9 %»
 *   <Dato id="gem-actividad-emprendedora" campo="fuente" /> → «GEM 2021/2022 Global Report, pp. 44 y 106»
 *   const d = useDato('mipymes-efectivo');                  → el registro entero, para maquetarlo a mano
 *
 * El id tiene que estar en src/datos.ts (los tipos lo comprueban) y escribirse
 * tal cual en el archivo de la diapositiva: la compilación lo busca ahí para
 * fallar si está «por confirmar» y para llenar el panel de fuentes del
 * presentador. Lleva `data-dato` para que una auditoría distinga las cifras
 * del registro de las escritas a mano.
 */
import { useEffect, useSyncExternalStore, type CSSProperties } from 'react';
import { datosPorId, type IdDato, type RegistroDato } from '../datos';
import { useDiapositiva } from './contexto';
import { registrarProblema } from './diagnostico';
import type { Diapositiva } from './tipos';

export type CampoDato = 'valor' | 'texto' | 'fuente' | 'fecha';

/** Datos que cada diapositiva pintó (respaldo de `datosDetectados`, que pone la compilación). */
const vistos = new Map<string, Set<string>>();
const oyentes = new Set<() => void>();
let version = 0;

function anotarVisto(diapositiva: string, id: string) {
  if (!diapositiva) return;
  let ids = vistos.get(diapositiva);
  if (!ids) vistos.set(diapositiva, (ids = new Set()));
  if (ids.has(id)) return;
  ids.add(id);
  version++;
  for (const oyente of oyentes) oyente();
}

function avisar(diapositiva: string, id: string, dato: RegistroDato | undefined) {
  const donde = diapositiva ? `«${diapositiva}»` : 'Una pieza';
  if (!dato) registrarProblema(`${donde} usa el dato «${id}», que no está en src/datos.ts.`);
  else if (dato.estado !== 'confirmado')
    registrarProblema(
      import.meta.env.DEV
        ? `${donde} usa el dato «${id}» (${dato.valor}), que está por confirmar: «vite build» fallará hasta que se confirme.`
        : `${donde} enseña el dato «${id}» (${dato.valor}), que está por confirmar.`,
    );
}

/** El registro de un dato (para maquetar sus partes a mano). */
export function useDato(id: IdDato): RegistroDato {
  const { id: diapositiva } = useDiapositiva();
  const dato = datosPorId.get(id);
  useEffect(() => {
    anotarVisto(diapositiva, id);
    avisar(diapositiva, id, dato);
  }, [diapositiva, id, dato]);
  return dato ?? { id, valor: `¿${id}?`, texto: '', fuente: '', url: '', fecha: '', estado: 'por-confirmar' };
}

export function Dato({
  id,
  campo = 'valor',
  className,
  style,
}: {
  id: IdDato;
  campo?: CampoDato;
  className?: string;
  style?: CSSProperties;
}) {
  const dato = useDato(id);
  return (
    <span className={className} style={style} data-dato={id} data-estado={dato.estado}>
      {dato[campo]}
    </span>
  );
}

/** Los datos de una diapositiva: los que vio la compilación en su archivo y los que pintó. */
export function datosDeDiapositiva(d: Diapositiva): RegistroDato[] {
  const ids = new Set<string>([...(d.datosDetectados ?? []), ...(vistos.get(d.id) ?? [])]);
  return [...ids].map((id) => datosPorId.get(id)).filter((x): x is RegistroDato => !!x);
}

/** Se vuelve a pintar cuando alguna diapositiva pinta un dato nuevo. */
export function useDatosVistos(): number {
  return useSyncExternalStore(
    (oyente) => {
      oyentes.add(oyente);
      return () => oyentes.delete(oyente);
    },
    () => version,
  );
}
