/**
 * La calculadora pública de Lendex, dentro de la presentación (rama
 * diseno-wow, 14-nov). José, sobre la demo en vivo: «esto está confuso desde
 * esta slide en adelante». La de antes cargaba lendexgp.com/app en un iframe:
 * primero la pantalla de entrar a pantalla completa, Angel pulsaba
 * «Calculadora de Préstamos» y un clic más pasaba a un recorte ampliado 2×.
 * Tres pantallas sin decir qué eran, y con internet.
 *
 * Aquí va la misma calculadora ya abierta, en una ventana de la vitrina:
 *   - la cuenta es la de Lendex, copiada sin cambios de
 *     Lendex/src/utils/calculateInstallments.ts (commit b0711d9), menos las
 *     fechas de cada cuota, que aquí no se ven;
 *   - los campos y los tres resultados son los de
 *     Lendex/src/components/PublicCalculator.tsx, con sus colores (emerald,
 *     blue y amber de Tailwind), pero con la letra al tamaño de la sala: la
 *     web los pone a 12–18 px y aquí se leen desde el fondo del aula;
 *   - arranca con las cifras de la charla: RD$10,000 al 20 % mensual en 12
 *     cuotas francesas (Lendex trae RD$50,000 al 5 %);
 *   - no necesita internet.
 *
 * Los campos llevan data-numerico (motor/teclado.ts): se quedan con las
 * cifras, la coma y borrar; una flecha del clicker suelta el campo y pasa de
 * diapositiva. Al entrar en un campo queda todo seleccionado. La tarjeta
 * lleva data-sin-clic: un clic en ella no pasa de diapositiva (Sala.tsx).
 *
 * Lo que se escribe en una ventana sale también en la otra (sala y
 * presentador) por el canal del motor: Angel puede teclear en la laptop.
 */
import { useSyncExternalStore, type ChangeEvent, type FocusEvent } from 'react';
import { enviar, escuchar } from '../../motor/canal';
import './calculadora.css';

/** Todo lo de la calculadora reproduce la interfaz de Lendex: colores, letra y cajas son suyos. */
export const EXCEPCION_CALCULADORA =
  'A-34, A-36, A-38, A-40, A-43, A-48, A-49, P0-10: la calculadora pública de Lendex reproducida (Lendex/src/components/PublicCalculator.tsx): sus colores de Tailwind (emerald, blue, amber), sus cajas y sus campos; es interfaz de un producto, no texto de la charla';

type Frecuencia = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
type Amortizacion = 'FRENCH' | 'COMPOUND' | 'SIMPLE';
type TipoInteres = 'PERCENTAGE' | 'FIXED';

interface Valores {
  monto: string;
  tasa: string;
  plazo: string;
  frecuencia: Frecuencia;
  amortizacion: Amortizacion;
  tipoInteres: TipoInteres;
}

/** Las cifras de la charla (las del video de respaldo, M-07). */
const INICIALES: Valores = {
  monto: '10000',
  tasa: '20',
  plazo: '12',
  frecuencia: 'MONTHLY',
  amortizacion: 'FRENCH',
  tipoInteres: 'PERCENTAGE',
};

// ——— Lo escrito, compartido entre las ventanas ———

interface MensajeCalculadora {
  tipo: 'calculadora-lendex';
  valores: Valores;
}

let valores: Valores = INICIALES;
let tocada = false;
const avisar = new Set<() => void>();

function poner(cambio: Partial<Valores>, propio: boolean) {
  valores = { ...valores, ...cambio };
  if (propio) {
    tocada = true;
    enviar({ tipo: 'calculadora-lendex', valores } satisfies MensajeCalculadora);
  }
  for (const f of avisar) f();
}

escuchar((mensaje) => {
  const m = mensaje as { tipo?: string; valores?: Valores } | null;
  if (m?.tipo === 'calculadora-lendex' && m.valores) poner(m.valores, false);
  // Una ventana que se abre a media charla recibe lo que ya se escribió.
  else if (m?.tipo === 'hola' && tocada) enviar({ tipo: 'calculadora-lendex', valores } satisfies MensajeCalculadora);
});

function suscribir(f: () => void) {
  avisar.add(f);
  return () => avisar.delete(f);
}

// ——— La cuenta de Lendex ———

interface Cuota {
  amount: number;
  interest_component: number;
}

/**
 * Lendex/src/utils/calculateInstallments.ts (commit b0711d9), sin cambios en
 * la cuenta. Solo se quitan la fecha de cada cuota y los campos que aquí no
 * se usan (principal_component, remaining_principal, period).
 */
function calcularCuotas(
  amount: number,
  interestRate: number,
  termMonths: number,
  amortizationType: string,
  interestType: string,
): Cuota[] {
  const iType = interestType || 'PERCENTAGE';
  const ratePerPeriod = iType === 'FIXED' ? 0 : interestRate / 100;
  const fixedInterestPerPeriod = iType === 'FIXED' ? interestRate : 0;
  const installments: Cuota[] = [];
  let remainingPrincipal = amount;

  const round = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  if (amortizationType === 'COMPOUND' && iType === 'PERCENTAGE') {
    const principalPerPeriod = round(amount / termMonths);
    for (let i = 1; i <= termMonths; i++) {
      const isLast = i === termMonths;
      const interest = round(remainingPrincipal * ratePerPeriod);
      const principal = isLast ? round(remainingPrincipal) : principalPerPeriod;
      const payment = round(principal + interest);
      remainingPrincipal -= principal;
      installments.push({ amount: payment, interest_component: interest });
    }
  } else if (amortizationType === 'FRENCH' && iType === 'PERCENTAGE') {
    if (ratePerPeriod === 0) {
      const principal = round(amount / termMonths);
      for (let i = 1; i <= termMonths; i++) {
        const isLast = i === termMonths;
        const p = isLast ? round(remainingPrincipal) : principal;
        remainingPrincipal -= p;
        installments.push({ amount: p, interest_component: 0 });
      }
    } else {
      const payment = round(
        (amount * (ratePerPeriod * Math.pow(1 + ratePerPeriod, termMonths))) / (Math.pow(1 + ratePerPeriod, termMonths) - 1),
      );
      for (let i = 1; i <= termMonths; i++) {
        const isLast = i === termMonths;
        const interest = round(remainingPrincipal * ratePerPeriod);
        const principal = isLast ? round(remainingPrincipal) : round(payment - interest);
        const cuota = isLast ? round(principal + interest) : payment;
        remainingPrincipal -= principal;
        installments.push({ amount: cuota, interest_component: interest });
      }
    }
  } else {
    const totalInterest = iType === 'FIXED' ? fixedInterestPerPeriod : amount * ratePerPeriod;
    const periodPrincipal = round(amount / termMonths);
    const periodInterest = round(totalInterest / termMonths);
    let accInterest = 0;
    for (let i = 1; i <= termMonths; i++) {
      const isLast = i === termMonths;
      const principal = isLast ? round(remainingPrincipal) : periodPrincipal;
      const interest = isLast ? round(totalInterest - accInterest) : periodInterest;
      const cuota = round(principal + interest);
      remainingPrincipal -= principal;
      accInterest += interest;
      installments.push({ amount: cuota, interest_component: interest });
    }
  }
  return installments;
}

/** Un número escrito en la sala: el monto sin separadores; la coma vale como decimal (el punto es la tecla de negro). */
function leer(texto: string, decimales: boolean): number {
  const limpio = decimales ? texto.replace(/[^\d,]/g, '').replace(',', '.') : texto.replace(/\D/g, '');
  return limpio ? Number(limpio) : 0;
}

/** Como lo escribe Lendex: RD$ y es-DO con dos decimales (PublicCalculator.tsx). */
function pesos(n: number): string {
  return `RD$${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

/** La cifra cabe en su caja aunque el monto sea de millones: la caja no cambia de tamaño, la letra baja. */
function tamCifra(texto: string): number {
  return Math.min(34, Math.floor(250 / (texto.length * 0.56)));
}

const ETIQUETA_FRECUENCIA: Record<Frecuencia, string> = { DAILY: 'Diario', WEEKLY: 'Semanal', BIWEEKLY: 'Quincenal', MONTHLY: 'Mensual' };

function seleccionarTodo(e: FocusEvent<HTMLInputElement>) {
  e.currentTarget.select();
}

/** El icono Calculator de lucide-react, el que lleva la tarjeta en Lendex. */
function Icono() {
  return (
    <svg className="calc-lendex__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
    </svg>
  );
}

/** La calculadora de Lendex, ya abierta, para el interior de una <Ventana>. */
export function CalculadoraLendex() {
  const v = useSyncExternalStore(suscribir, () => valores);
  const monto = leer(v.monto, false);
  const tasa = leer(v.tasa, true);
  const plazo = Math.floor(leer(v.plazo, false));

  const cuotas = monto > 0 && plazo > 0 && plazo <= 360 ? calcularCuotas(monto, tasa, plazo, v.amortizacion, v.tipoInteres) : [];
  const total = cuotas.reduce((s, c) => s + c.amount, 0);
  const interes = cuotas.reduce((s, c) => s + c.interest_component, 0);
  const resultados = cuotas.length
    ? [pesos(cuotas[0].amount), pesos(total), pesos(interes)]
    : ['—', '—', '—'];

  const campo = (clave: 'monto' | 'tasa' | 'plazo') => ({
    value: v[clave],
    onChange: (e: ChangeEvent<HTMLInputElement>) => poner({ [clave]: e.target.value }, true),
    onFocus: seleccionarTodo,
    type: 'text',
    inputMode: 'decimal' as const,
    autoComplete: 'off',
    spellCheck: false,
    'data-numerico': '',
  });

  return (
    // data-consola: es interfaz de producto, como una captura; A-09 no cuenta sus palabras (06 A-09; auditoria/pantalla.mjs).
    <div className="calc-lendex" data-consola="" data-auditar-excepcion={EXCEPCION_CALCULADORA}>
      <div className="calc-lendex__tarjeta" data-sin-clic="">
        <div className="calc-lendex__titulo">
          <Icono />
          <span>Calculadora de Préstamos</span>
        </div>
        <div className="calc-lendex__campos">
          <label>
            <span>Monto (RD$)</span>
            <input {...campo('monto')} />
          </label>
          <label>
            <span>{v.tipoInteres === 'FIXED' ? 'Interés Fijo (RD$)' : 'Tasa de Interés (%)'}</span>
            <input {...campo('tasa')} />
          </label>
          <label>
            <span>Plazo (cuotas)</span>
            <input {...campo('plazo')} />
          </label>
          <label>
            <span>Frecuencia</span>
            <select data-numerico="" value={v.frecuencia} onChange={(e) => poner({ frecuencia: e.target.value as Frecuencia }, true)}>
              <option value="DAILY">Diario</option>
              <option value="WEEKLY">Semanal</option>
              <option value="BIWEEKLY">Quincenal</option>
              <option value="MONTHLY">Mensual</option>
            </select>
          </label>
          <label>
            <span>Tipo Amortización</span>
            <select data-numerico="" value={v.amortizacion} onChange={(e) => poner({ amortizacion: e.target.value as Amortizacion }, true)}>
              <option value="FRENCH">Francesa (cuota fija)</option>
              <option value="COMPOUND">Alemana (capital fijo)</option>
              <option value="SIMPLE">Interés Simple</option>
            </select>
          </label>
          <label>
            <span>Tipo Interés</span>
            <select data-numerico="" value={v.tipoInteres} onChange={(e) => poner({ tipoInteres: e.target.value as TipoInteres }, true)}>
              <option value="PERCENTAGE">Porcentaje (%)</option>
              <option value="FIXED">Monto Fijo (RD$)</option>
            </select>
          </label>
        </div>
        <div className="calc-lendex__resultados">
          {(
            [
              ['cuota', `Cuota ${ETIQUETA_FRECUENCIA[v.frecuencia].toLowerCase()}`],
              ['total', 'Total a Pagar'],
              ['interes', 'Total Interés'],
            ] as const
          ).map(([tipo, etiqueta], i) => (
            <div key={tipo} className={`calc-lendex__resultado calc-lendex__resultado--${tipo}`}>
              <span>{etiqueta}</span>
              <strong style={{ fontSize: tamCifra(resultados[i]) }}>{resultados[i]}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
