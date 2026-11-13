import { useEffect, useState } from 'react';
import { almacen } from './entorno';

/** 452 → «7:32»; 3723 → «1:02:03». Negativos con signo menos tipográfico. */
export function formatoTiempo(segundos: number): string {
  const signo = segundos < 0 ? '−' : '';
  const s = Math.floor(Math.abs(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${signo}${h}:${String(m).padStart(2, '0')}:${ss}` : `${signo}${m}:${ss}`;
}

/** Date.now() que se refresca cada `intervalo` ms. */
export function useAhora(intervalo = 500): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setAhora(Date.now()), intervalo);
    return () => window.clearInterval(id);
  }, [intervalo]);
  return ahora;
}

/** Preferencia de esta ventana guardada en localStorage (tamaño de las notas, etc.). */
export function usePreferencia<T>(clave: string, inicial: T): [T, (valor: T) => void] {
  const [valor, setValor] = useState<T>(() => almacen.leer<T>(`pref:${clave}`) ?? inicial);
  const fijar = (nuevo: T) => {
    setValor(nuevo);
    almacen.escribir(`pref:${clave}`, nuevo);
  };
  return [valor, fijar];
}

/** Título de la pestaña. */
export function useTituloVentana(titulo: string) {
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
}
