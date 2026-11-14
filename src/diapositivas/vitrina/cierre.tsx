/**
 * Vitrina · Cierre (rama diseno-wow, 13-nov). La frase con la que cierra la
 * web (Contacto: «Tú pones la idea. Nosotros, el diseño y la tecnología.»),
 * el QR a https://zhonyas.com (sin «www», que da 404: scripts/generar-qr.mjs)
 * en una tarjeta que entra como las piezas de la vitrina, cómo encontrarnos y
 * los tres oradores al pie, que caen y saludan como en la portada.
 */
import { Personaje } from '../../marca/relevo/Personaje';
import { Palabras } from '../../marca/wow';
import { Entrada } from '../../motor/Entrada';
import { medio } from '../../motor/medios';
import { definirDiapositiva, type PropsDiapositiva } from '../../motor/tipos';
import { EXCEPCION_COLOR_PRODUCTO } from '../../marca/vitrina';
import './cierre.css';

const QR = 'medios/cierre/qr-zhonyas.svg';
const TRES = ['jose-leonardo', 'gregory', 'angel'] as const;

function Cierre(_: PropsDiapositiva) {
  return (
    <div className="vitrina-cierre" data-auditar-excepcion={EXCEPCION_COLOR_PRODUCTO}>
      <div className="vitrina__brillo vitrina-cierre__brillo" aria-hidden="true" />
      <Entrada desde={0} efecto="palabras" className="vitrina-cierre__frase">
        <h2 className="zh-titular">
          <Palabras texto="Tú pones la idea." />
        </h2>
        <h2 className="zh-titular">
          <Palabras texto="Nosotros, el diseño y la tecnología." clave={['tecnología.']} />
        </h2>
      </Entrada>
      <div className="vitrina-cierre__datos">
        <p className="zh-lectura zh-lectura--fuerte">zhonyas.com</p>
        <p className="zh-fuente">contacto@zhonyas.com · @zhonyasgroup</p>
      </div>
      <Entrada desde={0} efecto="vitrina" className="vitrina__escena">
        <div className="vitrina-pieza" data-vitrina-pieza="" style={{ left: 1405, top: 330, width: 400, ['--giro' as string]: '-8deg', ['--fase' as string]: '0s', ['--orden' as string]: 0 }}>
          <div className="vitrina-flota">
            <img className="vitrina-cierre__qr" src={medio(QR)} alt="Código QR a zhonyas.com" draggable={false} />
          </div>
        </div>
      </Entrada>
      <Entrada desde={0} efecto="caer" className="vitrina-cierre__tres">
        <span data-retraso="900" hidden />
        {TRES.map((atlas, i) => (
          <span key={atlas} className="vitrina-cierre__persona" data-cae="" style={{ ['--orden' as string]: i }}>
            <Personaje atlas={atlas} animacion="wave" vueltas={2} luego="front" escala={0.8} />
          </span>
        ))}
      </Entrada>
    </div>
  );
}

export default definirDiapositiva({
  id: 'vitrina-cierre',
  titulo: 'Cierre',
  orador: 'jose',
  duracion: 45,
  pasos: 0,
  notas: [
    {
      decir:
        'Tú pones la idea; nosotros, el diseño y la tecnología. Escaneen el código y nos encuentran en zhonyas.com. Gracias. ¿Preguntas?',
      claves: 'la frase de la web · el QR · gracias · preguntas',
      siFalla: 'Si el QR no carga, se lee «zhonyas.com» debajo de la frase.',
    },
  ],
  fuentes: ['Frase: la sección Contacto de zhonyas.com; correo e Instagram: lib/site.ts de zhonyas-web.'],
  medios: [QR, ...TRES.map((t) => `medios/equipo/${t}/personaje.webp`)],
  Componente: Cierre,
});
