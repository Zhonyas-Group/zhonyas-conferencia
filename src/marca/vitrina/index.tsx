/**
 * La vitrina (rama diseno-wow, 13-nov). José: «quiero que la diapositiva
 * muestre cosas: Lendex, Pymex y demás». Todas las diapositivas de producto
 * se arman con estas mismas piezas, para que el mazo sea coherente:
 *
 *   <Ventana>   una ventana de navegador con la página de verdad: recorre la
 *               captura de página completa (scripts/vitrina-sitios.mjs) o
 *               reproduce un video.
 *   <Telefono>  un teléfono con el video del producto, recortado a su pantalla.
 *   <Producto>  la composición de un producto: a la izquierda el nombre (letra
 *               a letra), la promesa (palabra a palabra) y la dirección; a la
 *               derecha, las piezas que flotan sobre un brillo de su color.
 *
 * Las piezas entran con la entrada «vitrina» (vitrina.entrada.ts): vuelan de
 * la derecha con el giro del perfil del equipo y se quedan flotando.
 */
import type { CSSProperties, ReactNode } from 'react';
import { useDiapositiva } from '../../motor/contexto';
import { Entrada } from '../../motor/Entrada';
import { medio } from '../../motor/medios';
import { Video } from '../../motor/Video';
import { Personaje, type AnimacionPersonaje, type IdAtlas } from '../relevo/Personaje';
import { Letras, Palabras } from '../wow';
import './vitrina.css';
import './vitrina.entrada';

/** Los colores de cada producto (sus propias marcas) solo van en el brillo y el marco, nunca en el texto. */
export const EXCEPCION_COLOR_PRODUCTO =
  'A-34, A-38, A-40, P0-10, A-43: la vitrina (aprobada por José el 13-nov): el brillo de fondo es luz del color de cada producto (el azul de Pymex, reference_pymex_marca; el verde de lendexgp.com), no una caja ni un degradado de adorno; los marcos de ventana y teléfono llevan el filo de 1 px de --zh-linea y su sombra';

/** La barra de direcciones reproduce la de un navegador a su tamaño; no es texto de la charla. */
const EXCEPCION_BARRA =
  'A-48, A-49, A-36: la barra de direcciones de un navegador a su tamaño real (18 px, gris oscuro sobre su píldora blanca), como en el video de Pymex; es interfaz reproducida, no texto de la charla';

interface PropsPieza {
  /** Orden de entrada (0, 1, 2…): cada una sale 140 ms después de la anterior. */
  orden?: number;
  /** Caja en px del escenario (1920 × 1080). */
  x: number;
  y: number;
  ancho: number;
  /** Giro en reposo (grados de rotateY): las de la derecha miran hacia el centro. */
  giro?: number;
  /** Desfase del flotar, para que no suban y bajen todas a la vez (s). */
  fase?: number;
  /** Encima o debajo de las demás. */
  capa?: number;
}

function estiloPieza({ x, y, ancho, giro = 0, fase = 0, capa = 1, orden = 0 }: PropsPieza): CSSProperties {
  return {
    left: x,
    top: y,
    width: ancho,
    zIndex: capa,
    ['--giro' as string]: `${giro}deg`,
    ['--fase' as string]: `${-fase}s`,
    ['--orden' as string]: orden,
  };
}

interface PropsVentana extends PropsPieza {
  /** Lo que se lee en la barra de direcciones. */
  url: string;
  /** Captura de página completa que se recorre de arriba abajo, o imagen fija. */
  imagen?: string;
  /** Video en lugar de imagen. */
  video?: string;
  poster?: string;
  /** Alto de la parte visible de la página (px). */
  alto: number;
  /** Recorrer la página (s que tarda en bajar; luego sube). Sin él, la imagen queda quieta arriba. */
  recorrido?: number;
  /** Una página viva en vez de imagen o video (la calculadora de Lendex). */
  children?: ReactNode;
}

/** Una ventana de navegador con la página de verdad. */
export function Ventana({ url, imagen, video, poster, alto, recorrido, children, ...pieza }: PropsVentana) {
  const { activa } = useDiapositiva();
  return (
    <div className="vitrina-pieza" data-vitrina-pieza="" style={estiloPieza(pieza)}>
      <div className="vitrina-flota">
        <div className="vitrina-ventana">
          <div className="vitrina-ventana__barra" aria-hidden="true" data-auditar-excepcion={EXCEPCION_BARRA}>
            <i />
            <i />
            <i />
            <span className="vitrina-ventana__url">{url}</span>
          </div>
          <div className="vitrina-ventana__pagina" style={{ height: alto, ['--alto' as string]: `${alto}px` }}>
            {children ? (
              children
            ) : video ? (
              <Video src={video} poster={poster} />
            ) : imagen ? (
              <img
                src={medio(imagen)}
                alt={`La página ${url}`}
                decoding="async"
                draggable={false}
                data-recorre={recorrido && activa ? '' : undefined}
                style={recorrido ? { ['--recorrido' as string]: `${recorrido}s` } : undefined}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

interface PropsTelefono extends PropsPieza {
  video: string;
  poster?: string;
  /**
   * La pantalla dentro del video (px del video): el video se amplía para que
   * solo se vea esa caja. Los de Lendex traen su propio teléfono dibujado.
   */
  recorte: { x: number; y: number; ancho: number; alto: number; anchoVideo: number };
}

/** El borde negro del teléfono alrededor de la pantalla. */
const BISEL = 12;

/** Un teléfono con el video del producto, recortado a su pantalla. */
export function Telefono({ video, poster, recorte, ...pieza }: PropsTelefono) {
  // El marco negro del teléfono (BISEL px por lado) rodea la pantalla.
  const pantalla = pieza.ancho - 2 * BISEL;
  const escala = pantalla / recorte.ancho;
  return (
    <div className="vitrina-pieza" data-vitrina-pieza="" style={estiloPieza(pieza)}>
      <div className="vitrina-flota">
        <div className="vitrina-telefono" style={{ height: recorte.alto * escala + 2 * BISEL, padding: BISEL }}>
          <div className="vitrina-telefono__pantalla" style={{ height: recorte.alto * escala }}>
          <Video
            src={video}
            poster={poster}
            style={{
              position: 'absolute',
              width: recorte.anchoVideo * escala,
              left: -recorte.x * escala,
              top: -recorte.y * escala,
              maxWidth: 'none',
            }}
          />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PropsTarjeta extends PropsPieza {
  video: string;
  poster?: string;
  /** Proporción alto/ancho del video. */
  proporcion: number;
}

/** Un video de producto suelto (la pieza promocional), con las esquinas de las tarjetas de la web. */
export function TarjetaVideo({ video, poster, proporcion, ...pieza }: PropsTarjeta) {
  return (
    <div className="vitrina-pieza" data-vitrina-pieza="" style={estiloPieza(pieza)}>
      <div className="vitrina-flota">
        <div className="vitrina-tarjeta" style={{ height: pieza.ancho * proporcion }}>
          <Video src={video} poster={poster} />
        </div>
      </div>
    </div>
  );
}

interface PropsTarjetaFoto extends PropsPieza {
  foto: string;
  alt: string;
  /** Alto de la foto (px). */
  alto: number;
  /** Su personaje de píxeles, de pie encima de la tarjeta: saluda una vez y se queda quieto. */
  personaje?: IdAtlas;
}

/** La tarjeta del equipo de la web (la foto con las esquinas de las tarjetas), con su personaje encima. */
export function TarjetaFoto({ foto, alt, alto, personaje, ...pieza }: PropsTarjetaFoto) {
  return (
    <div className="vitrina-pieza" data-vitrina-pieza="" style={estiloPieza(pieza)}>
      <div className="vitrina-flota">
        {personaje ? (
          <span className="vitrina-foto__personaje" aria-hidden="true">
            <Personaje atlas={personaje} animacion="wave" vueltas={1} luego="idle" escala={0.6} />
          </span>
        ) : null}
        <div className="vitrina-foto" style={{ height: alto }}>
          <img src={medio(foto)} alt={alt} decoding="async" draggable={false} />
        </div>
      </div>
    </div>
  );
}

interface PropsProducto {
  nombre: string;
  /** La promesa del producto, tal cual la dice su sitio. */
  promesa: string;
  /** Palabras de la promesa en aurora. */
  clave?: readonly string[];
  /** Lo que hace, en una línea (el texto de la web de Zhonyas, lib/projects.ts). */
  queHace?: string;
  /** La dirección, abajo del texto. Sin ella, nada (la de Lendex en vivo ya va en la barra de su ventana). */
  direccion?: string;
  /** Color del brillo detrás de las piezas (la marca del producto). */
  color: string;
  /** Quién lo presenta, abajo a la izquierda, con lo que hace el guía de la web (project-guide.tsx:42). */
  orador: IdAtlas;
  animacion?: AnimacionPersonaje;
  children: ReactNode;
}

/** La composición de un producto: el texto a la izquierda y lo que se ve a la derecha. */
export function Producto({ nombre, promesa, clave, queHace, direccion, color, orador, animacion = 'type', children }: PropsProducto) {
  return (
    <div className="vitrina" data-auditar-excepcion={EXCEPCION_COLOR_PRODUCTO} style={{ ['--color-producto' as string]: color }}>
      <div className="vitrina__brillo" aria-hidden="true" />
      <div className="vitrina__texto">
        <Entrada desde={0} efecto="letras">
          <h2 className="zh-portadilla vitrina__nombre">
            <Letras texto={nombre} />
          </h2>
        </Entrada>
        <Entrada desde={0} efecto="palabras">
          <p className="zh-lectura zh-lectura--fuerte vitrina__promesa">
            <Palabras texto={promesa} clave={clave} />
          </p>
        </Entrada>
        {queHace ? <p className="zh-fuente vitrina__que-hace">{queHace}</p> : null}
        {direccion ? <p className="zh-fuente vitrina__direccion">{direccion}</p> : null}
      </div>
      <Entrada desde={0} efecto="vitrina" className="vitrina__escena">
        {children}
      </Entrada>
      <div className="vitrina__orador" aria-hidden="true">
        <Personaje atlas={orador} animacion={animacion} escala={0.9} />
      </div>
    </div>
  );
}

interface PropsGaleria {
  titular: string;
  clave?: readonly string[];
  /** Una línea bajo el titular (32 px). */
  bajada?: string;
  color: string;
  /** Quién presenta, arriba a la derecha (sin él, nadie: las piezas ya traen personajes). */
  orador?: IdAtlas;
  animacion?: AnimacionPersonaje;
  /** Los nombres debajo de cada pieza, en px del escenario: [texto, x centro, y, segunda línea]. */
  nombres: readonly (readonly [string, number, number, string?])[];
  children: ReactNode;
}

/** Varias piezas a lo ancho con el titular arriba (la portada de la vitrina y las landings). */
export function Galeria({ titular, clave, bajada, color, orador, animacion = 'draw', nombres, children }: PropsGaleria) {
  return (
    <div className="vitrina vitrina--galeria" data-auditar-excepcion={EXCEPCION_COLOR_PRODUCTO} style={{ ['--color-producto' as string]: color }}>
      <div className="vitrina__brillo" aria-hidden="true" />
      <Entrada desde={0} efecto="palabras" className="vitrina__titular">
        <h2 className="zh-titular">
          <Palabras texto={titular} clave={clave} />
        </h2>
        {bajada ? <p className="zh-fuente vitrina__bajada">{bajada}</p> : null}
      </Entrada>
      <Entrada desde={0} efecto="vitrina" className="vitrina__escena">
        {children}
        {nombres.map(([texto, x, y, segunda], i) => (
          <p
            key={texto}
            className="zh-fuente vitrina__nombre-pieza"
            data-vitrina-nombre=""
            style={{ left: x, top: y, ['--orden' as string]: i }}
          >
            {texto}
            {segunda ? <span className="vitrina__segunda">{segunda}</span> : null}
          </p>
        ))}
      </Entrada>
      {orador ? (
        <div className="vitrina__orador" aria-hidden="true">
          <Personaje atlas={orador} animacion={animacion} escala={0.9} />
        </div>
      ) : null}
    </div>
  );
}
