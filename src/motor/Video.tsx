/**
 * Video local para una diapositiva.
 *
 * - Suena y se reproduce solo cuando su diapositiva está en pantalla y, si
 *   está dentro de una <Entrada>, solo desde el paso en que aparece (empieza
 *   desde el principio cada vez que aparece).
 * - Al salir se congela; cuando la capa queda oculta, vuelve al principio.
 * - Con la pantalla en negro o la cuadrícula encima (`pausada`) se detiene y
 *   sigue desde el mismo punto al volver.
 * - En el presentador va siempre sin sonido; en miniaturas y en modo revisión
 *   se ve el póster (un fotograma fijo, para capturas repetibles).
 */
import { useEffect, useRef, type CSSProperties } from 'react';
import { useDiapositiva } from './contexto';
import { useVisibleEnEntrada } from './Entrada';
import { esRevision } from './entorno';
import { medio } from './medios';

interface PropsVideo {
  /** Ruta relativa a public/ ('medios/demo.webm'). Debe estar también en `medios` de la diapositiva. */
  src: string;
  /** Imagen fija (ruta relativa a public/). Muy recomendable: se ve mientras carga y en miniaturas. */
  poster?: string;
  /** Repetir en bucle (por defecto sí). */
  bucle?: boolean;
  /** Con sonido (por defecto no). Solo suena en la ventana de la sala. */
  sonido?: boolean;
  /** Segundo desde el que empieza. */
  desde?: number;
  className?: string;
  style?: CSSProperties;
}

export function Video({ src, poster, bucle = true, sonido = false, desde = 0, className, style }: PropsVideo) {
  const { activa, rol, modo, silencio, pausada } = useDiapositiva();
  const visible = useVisibleEnEntrada();
  const ref = useRef<HTMLVideoElement>(null);
  /** Lo ocultó su Entrada: al volver a aparecer, empieza desde el principio. */
  const reiniciar = useRef(false);
  // En pausa (pantalla en negro o cuadrícula encima) se detiene donde va y sigue
  // desde ahí al volver: el público no se pierde ese trozo ni oye el audio a oscuras.
  const reproducir = activa && rol === 'actual' && modo === 'escenario' && !esRevision && visible && !pausada;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reproducir) {
      if (reiniciar.current) {
        reiniciar.current = false;
        try {
          video.currentTime = desde;
        } catch {
          /* aún sin metadatos */
        }
      }
      const promesa = video.play();
      promesa?.catch(() => {
        // Sin un gesto previo del usuario el navegador puede negar el sonido: se reintenta en silencio.
        video.muted = true;
        void video.play().catch(() => {});
      });
    } else {
      video.pause();
      if (rol === 'oculta' || rol === 'fija') {
        try {
          video.currentTime = desde;
        } catch {
          /* aún sin metadatos */
        }
      } else if (!visible) {
        // Se queda en su fotograma mientras su Entrada se desvanece; vuelve al principio al reaparecer.
        reiniciar.current = true;
      }
    }
  }, [reproducir, rol, desde, visible]);

  if ((modo === 'miniatura' || esRevision) && poster) {
    return <img className={className} style={style} src={medio(poster)} alt="" decoding="async" draggable={false} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      style={style}
      src={medio(src)}
      poster={poster ? medio(poster) : undefined}
      muted={!sonido || silencio}
      loop={bucle}
      playsInline
      preload={modo === 'miniatura' ? 'metadata' : 'auto'}
      disablePictureInPicture
      disableRemotePlayback
      onLoadedMetadata={(e) => {
        if (desde > 0) e.currentTarget.currentTime = desde;
      }}
    />
  );
}
