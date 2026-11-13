/**
 * Registro de datos: TODA cifra que se ve en pantalla sale de aquí, con su
 * fuente, su fecha y su estado (síntesis §6; 01 P1-20; A-65). Las diapositivas
 * la pintan con <Dato id="…" /> (src/motor/Dato.tsx).
 *
 * - `valor`: exactamente como se ve en pantalla («85.2 %», «404,034»): punto
 *   decimal y coma de miles, como la calculadora de Lendex (es-DO), que sale en
 *   vivo. Una sola convención en todo lo que ve la sala (docs/GUION.md,
 *   encabezado, punto 3; A-20). Lo mismo en `texto` y en `nota`.
 * - `texto`: lo que dice la cifra, en una frase (lo que la acompaña o se dice).
 * - `fuente`: documento y página; `url`: dónde comprobarla; `fecha`: a qué periodo se refiere.
 * - `estado`: 'confirmado' o 'por-confirmar'. **Si una diapositiva usa un dato
 *   por confirmar, `vite build` falla** (vite.config.ts, plugin «zhonyas:datos»).
 *   En desarrollo solo avisa.
 * - `nota` (opcional): cómo NO decirla. Sale en el panel de fuentes del presentador.
 *
 * Este archivo no importa nada: la compilación lo lee tal cual para comprobarlo.
 * Los ids van en minúsculas con guiones y no se cambian (las diapositivas los usan).
 */

export type EstadoDato = 'confirmado' | 'por-confirmar';

export interface RegistroDato {
  id: string;
  valor: string;
  texto: string;
  fuente: string;
  url: string;
  fecha: string;
  estado: EstadoDato;
  nota?: string;
}

const GEM = 'https://www.um.si/wp-content/uploads/2022/02/GEM-Global-Report-2021-22.pdf';
const ENMIPYMES =
  'https://cdn.bancentral.gov.do/documents/otras-publicaciones/documents/ENMIPYMES-Documento-principales-resultados-aspectos-metodologicos.pdf';
const FINDEX_2025 = 'https://api.worldbank.org/v2/country/DOM;LAC/indicator/fin22e?source=28&format=json';
const FINDEX_2025_SAN = 'https://api.worldbank.org/v2/country/DOM;LAC/indicator/fin22c?source=28&format=json';
const DGII = 'https://presidencia.gob.do/noticias/dgii-alcanza-los-100000-contribuyentes-con-facturacion-electronica';
const TIC_EXPORTACIONES = 'https://data.worldbank.org/indicator/BX.GSR.CCIS.CD?locations=DO';
const NINI = 'https://data.worldbank.org/indicator/SL.UEM.NEET.ZS?locations=DO-ZJ';
const MESCYT = 'https://www.elcaribe.com.do/panorama/educacion/deficit-carreras-stem-republica-dominicana/';
const WEB = 'Repositorio zhonyas-web (privado, de la organización Zhonyas-Group)';

export const datos = [
  // ——— Síntesis §6.1: contexto dominicano. Las 15 filas quedaron confirmadas (07 §6). ———
  // Una entrada por cifra que se puede enseñar sola: las filas con dos cifras dan dos entradas.

  // §6.1 #1
  {
    id: 'gem-actividad-emprendedora',
    valor: '41.9 %',
    texto: 'de los adultos estaba empezando un negocio o tenía uno de menos de 3.5 años: el más alto de 47 economías',
    fuente: 'GEM 2021/2022 Global Report, pp. 44 y 106',
    url: GEM,
    fecha: '2021',
    estado: 'confirmado',
  },
  // §6.1 #2
  {
    id: 'gem-negocio-establecido',
    valor: '3.8 %',
    texto: 'tenía un negocio establecido; según el GEM, la mayoría de los negocios nuevos «no llegan a madurar»',
    fuente: 'GEM 2021/2022 Global Report, pp. 44 y 106',
    url: GEM,
    fecha: '2021',
    estado: 'confirmado',
  },
  // §6.1 #3
  {
    id: 'gem-habilidades',
    valor: '88.7 %',
    texto: 'cree tener las habilidades para emprender (2.º de 47 economías)',
    fuente: 'GEM 2021/2022 Global Report, p. 106',
    url: GEM,
    fecha: '2021',
    estado: 'confirmado',
    nota: 'No es «quiere emprender»: eso es el 54.8 %.',
  },
  // §6.1 #4
  {
    id: 'gem-nota-financiamiento',
    valor: '2.42',
    texto: 'sobre 10: la nota de los expertos al financiamiento emprendedor, la más baja de su grupo',
    fuente: 'GEM 2021/2022 Global Report, tabla 6.2, p. 87',
    url: GEM,
    fecha: '2021',
    estado: 'confirmado',
  },
  // §6.1 #5
  {
    id: 'mipymes-total',
    valor: '404,034',
    texto: 'mipymes en el país',
    fuente: 'BCRD y MICM, ENMIPYMES, p. 9',
    url: ENMIPYMES,
    fecha: '2022–2023',
    estado: 'confirmado',
  },
  {
    id: 'mipymes-informales',
    valor: '85.2 %',
    texto: 'de las mipymes son informales (no tienen RNC)',
    fuente: 'BCRD y MICM, ENMIPYMES, p. 11',
    url: ENMIPYMES,
    fecha: '2022–2023',
    estado: 'confirmado',
  },
  // §6.1 #6
  {
    id: 'mipymes-efectivo',
    valor: '92.7 %',
    texto: 'de las mipymes usa efectivo como medio de pago',
    fuente: 'BCRD y MICM, ENMIPYMES, p. 25',
    url: ENMIPYMES,
    fecha: '2022–2023',
    estado: 'confirmado',
    nota: 'No decir «cobra en efectivo».',
  },
  // §6.1 #7
  {
    id: 'mipymes-santiago',
    valor: '12.7 %',
    texto: 'de las mipymes del país está en Santiago',
    fuente: 'BCRD y MICM, ENMIPYMES, p. 14',
    url: ENMIPYMES,
    fecha: '2022–2023',
    estado: 'confirmado',
  },
  // §6.1 #8
  {
    id: 'mipymes-credito',
    valor: '34.5 %',
    texto: 'de las mipymes consiguió crédito',
    fuente: 'BCRD y MICM, ENMIPYMES, pp. 22–23',
    url: ENMIPYMES,
    fecha: '2022',
    estado: 'confirmado',
  },
  {
    id: 'mipymes-prestamista-informal',
    valor: '15.5 %',
    texto: 'de las mipymes con crédito se lo pidió a un prestamista informal',
    fuente: 'BCRD y MICM, ENMIPYMES, pp. 22–23',
    url: ENMIPYMES,
    fecha: '2022',
    estado: 'confirmado',
    nota: 'Es el 15.5 % de las mipymes con crédito, no del monto prestado.',
  },
  // §6.1 #9
  {
    id: 'prestamista-privado',
    valor: '20.9 %',
    texto: 'de los adultos le pidió prestado a un prestamista privado: el más alto de 143 economías',
    fuente: 'Banco Mundial, GFDD.AI.15 (el puesto entre 143 es cálculo propio)',
    url: 'https://api.worldbank.org/v2/country/all/indicator/GFDD.AI.15?source=32&date=2014&format=json&per_page=400',
    fecha: '2014',
    estado: 'confirmado',
    nota: 'El Findex no volvió a hacer esa pregunta: es el dato más reciente que existe.',
  },
  // §6.1 #10
  {
    id: 'findex-prestamo-negocio',
    valor: '15.3 %',
    texto: 'pidió prestado para empezar o mantener un negocio',
    fuente: 'Global Findex 2025, indicador fin22e',
    url: FINDEX_2025,
    fecha: '2024',
    estado: 'confirmado',
  },
  {
    id: 'findex-prestamo-negocio-latam',
    valor: '7.5 %',
    texto: 'en América Latina pidió prestado para empezar o mantener un negocio',
    fuente: 'Global Findex 2025, indicador fin22e',
    url: FINDEX_2025,
    fecha: '2024',
    estado: 'confirmado',
  },
  // §6.1 #11
  {
    id: 'findex-san',
    valor: '9.4 %',
    texto: 'pidió prestado a un san o club de ahorro',
    fuente: 'Global Findex 2025, indicador fin22c',
    url: FINDEX_2025_SAN,
    fecha: '2024',
    estado: 'confirmado',
  },
  {
    id: 'findex-san-latam',
    valor: '2.2 %',
    texto: 'en América Latina pidió prestado a un san o club de ahorro',
    fuente: 'Global Findex 2025, indicador fin22c',
    url: FINDEX_2025_SAN,
    fecha: '2024',
    estado: 'confirmado',
  },
  // §6.1 #12
  {
    id: 'dgii-plazo-factura',
    valor: '15 de noviembre de 2026',
    texto: 'vence el plazo de la factura electrónica para las micro y pequeñas empresas',
    fuente: 'DGII, vía Presidencia de la República',
    url: DGII,
    fecha: '2026',
    estado: 'confirmado',
    nota: 'Si la charla es después del 15-nov, «vence» pasa a «venció» (C-25). No decir que Pymex emite factura electrónica: no está comprobado.',
  },
  {
    id: 'dgii-emisores',
    valor: '100,000',
    texto: 'contribuyentes ya emiten factura electrónica',
    fuente: 'DGII, vía Presidencia de la República',
    url: DGII,
    fecha: '2026',
    estado: 'confirmado',
  },
  {
    id: 'dgii-proveedores',
    valor: 'cerca de 200',
    texto: 'proveedores de facturación electrónica',
    fuente: 'DGII, vía Presidencia de la República',
    url: DGII,
    fecha: '2026',
    estado: 'confirmado',
  },
  // §6.1 #13
  {
    id: 'tic-exportaciones',
    valor: 'US$75.3 millones',
    texto: 'en exportaciones de servicios TIC',
    fuente: 'Banco Mundial, indicador BX.GSR.CCIS.CD',
    url: TIC_EXPORTACIONES,
    fecha: '2025',
    estado: 'confirmado',
    nota: 'Las exportaciones de los freelances no se registran (estrategia del MICM, 07 §2.1): decirlo junto a la cifra (C-17).',
  },
  {
    id: 'tic-exportaciones-porcentaje',
    valor: '0.52 %',
    texto: 'de las exportaciones de servicios son servicios TIC',
    fuente: 'Banco Mundial, indicador BX.GSR.CCIS.CD',
    url: TIC_EXPORTACIONES,
    fecha: '2025',
    estado: 'confirmado',
  },
  // §6.1 #14
  {
    id: 'nini-rd',
    valor: '24.7 %',
    texto: 'de los jóvenes de 15 a 24 años ni estudia ni trabaja',
    fuente: 'Banco Mundial y OIT, indicador SL.UEM.NEET.ZS',
    url: NINI,
    fecha: '2025',
    estado: 'confirmado',
  },
  {
    id: 'nini-latam',
    valor: '18.1 %',
    texto: 'de los jóvenes de 15 a 24 años ni estudia ni trabaja en América Latina',
    fuente: 'Banco Mundial y OIT, indicador SL.UEM.NEET.ZS',
    url: NINI,
    fecha: '2025',
    estado: 'confirmado',
  },
  // §6.1 #15
  {
    id: 'tic-universitarios',
    valor: '39,800',
    texto: 'universitarios estudian carreras TIC',
    fuente: 'MESCYT, vía El Caribe (4-feb-2026)',
    url: MESCYT,
    fecha: '2024',
    estado: 'confirmado',
  },
  {
    id: 'tic-universitarias-mujeres',
    valor: '19 %',
    texto: 'de quienes estudian carreras TIC son mujeres',
    fuente: 'MESCYT, vía El Caribe (4-feb-2026)',
    url: MESCYT,
    fecha: '2024',
    estado: 'confirmado',
  },

  // ——— Síntesis §6.2: cifras de trabajo de Zhonyas (08 §7). José permitió estas cuatro. ———
  {
    id: 'commits-organizacion',
    valor: '300',
    texto: 'commits en los 4 repositorios con código de la organización (Pymex 169, web 109, landing de Layla 12, Laylapp 10)',
    fuente: 'API de GitHub, solo ramas principales; cálculo propio (08 §7)',
    url: 'https://github.com/Zhonyas-Group',
    fecha: 'del 30-jun al 12-nov-2026',
    estado: 'confirmado',
    nota: 'No incluye Lendex, Matriz ZH ni Cantus, que están fuera de la organización.',
  },
  {
    id: 'agujero-negro-dias',
    valor: '25 días',
    texto: 'de la primera versión del agujero negro a su último arreglo, con 3 rondas de arreglos (25-sep → 20-oct)',
    fuente: `${WEB}: commits #90, #97, #105 y #108 (08 §2)`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '2026',
    estado: 'confirmado',
    nota: '4 rondas contando la primera versión. Que ya «funcione en todo» no está comprobado.',
  },
  {
    id: 'agujero-negro-abre',
    valor: '1.5 segundos',
    texto: 'tarda el agujero negro en abrirse',
    fuente: `${WEB}: components/contact-section.tsx:19 (OPEN_MS = 1500), desde el commit #97`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '2026',
    estado: 'confirmado',
  },
  {
    id: 'agujero-negro-cierra',
    valor: '1.2 segundos',
    texto: 'tarda el agujero negro en cerrarse',
    fuente: `${WEB}: components/contact-section.tsx:20 (CLOSE_MS = 1200), desde el commit #97`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '2026',
    estado: 'confirmado',
  },

  // ——— Las demás cifras que el guion pone en pantalla (docs/GUION.md, 11, 15 y 17). ———
  // Con punto decimal, como la calculadora de Lendex (GUION, encabezado, punto 3).
  {
    id: 'prestamista-puesto',
    valor: '1.º de 143 economías',
    texto: 'la República Dominicana tuvo el valor más alto: ninguna de las otras 142 economías con dato tuvo más',
    fuente: 'Cálculo propio sobre Banco Mundial, GFDD.AI.15 (07 §3.2)',
    url: 'https://api.worldbank.org/v2/country/all/indicator/GFDD.AI.15?source=32&date=2014&format=json&per_page=400',
    fecha: '2014',
    estado: 'confirmado',
    nota: 'Decir «economías», nunca «países» ni «récord mundial». Y esa pregunta no la volvieron a hacer.',
  },
  {
    id: 'prestamista-cita',
    valor: '«Es a un 20 mensual y un 10 quincenal.»',
    texto: 'lo que cobra un prestamista, dicho por él mismo al periódico El Día',
    fuente: 'Un prestamista, en El Día, 28 jun 2026',
    url: 'https://eldia.com.do/dinero-rapido-deudas-permanentes-la-realidad-detras-de-los-prestamos-informales/',
    fecha: '28-jun-2026',
    estado: 'confirmado',
    nota: 'Es un testimonio, no una estadística (§6.1). La cita va entera, sin cortar (A-65).',
  },
  {
    id: 'agujero-negro-estreno',
    valor: '25 sep',
    texto: 'la primera versión del agujero negro sube a zhonyas.com (estreno)',
    fuente: `${WEB}: commit #90 (08 §2)`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '25-sep-2026',
    estado: 'confirmado',
  },
  {
    id: 'agujero-negro-arreglo-reloj',
    valor: '29 sep',
    texto: 'primer arreglo: el agujero pasa del scroll a un reloj de 1.5 s',
    fuente: `${WEB}: commit #97 (08 §2 y §6)`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '29-sep-2026',
    estado: 'confirmado',
    nota: '«Se trababa» es una lectura del mensaje del #97: lo confirma Angel (GUION, «Lo que no pude resolver»).',
  },
  {
    id: 'agujero-negro-arreglo-iphone',
    valor: '2 oct',
    texto: 'segundo arreglo: en el iPhone se cerraba solo',
    fuente: `${WEB}: commit #105, con los PR #2 y #3 (08 §2)`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '2-oct-2026',
    estado: 'confirmado',
  },
  {
    id: 'agujero-negro-arreglo-escritorio',
    valor: '20 oct',
    texto: 'tercer arreglo, el último: en computadora, después del menú, seguía el trackpad en vez de abrirse a su ritmo',
    fuente: `${WEB}: commit #108, con el PR #4 (08 §2 y §6)`,
    url: 'https://github.com/Zhonyas-Group/zhonyas-web',
    fecha: '20-oct-2026',
    estado: 'confirmado',
  },

  // ——— Síntesis §6.2: las demás necesitan el OK de José (pregunta 4). No pasan la compilación. ———
  // Se quitaron las tres que contaban el origen de Pymex antes del proyecto final o cómo se usa la IA
  // (decisiones 3 y 4 de José; GUION R-07): los días antes de la tesis, los días hasta el nombre «Pymex»
  // y las animaciones por personaje (revisión del 13-nov).
  {
    id: 'dias-desde-primer-commit',
    valor: '135',
    texto: 'días desde el primer commit de Pymex (30-jun-2026)',
    fuente: 'API de GitHub; cálculo propio (08 §7)',
    url: 'https://github.com/Zhonyas-Group',
    fecha: 'al 12-nov-2026',
    estado: 'por-confirmar',
    nota: 'Crece cada día (C-18, C-25): el 19-nov serán 142.',
  },
  {
    id: 'dias-con-commits',
    valor: '53',
    texto: 'días distintos con commits',
    fuente: 'API de GitHub, hora de RD (08 §7)',
    url: 'https://github.com/Zhonyas-Group',
    fecha: 'al 12-nov-2026',
    estado: 'por-confirmar',
  },
  {
    id: 'dia-con-mas-commits',
    valor: '31',
    texto: 'commits el 22-sep-2026, el día con más trabajo',
    fuente: 'API de GitHub (08 §7)',
    url: 'https://github.com/Zhonyas-Group',
    fecha: '2026',
    estado: 'por-confirmar',
  },
  {
    id: 'web-iphone-fps',
    valor: '12 fps',
    texto: 'iba la web en el iPhone por una máscara SVG que Safari dibuja con el procesador',
    fuente: 'Nota project_zhonyas_web.md; el arreglo está en el PR #1, sin mezclar',
    url: 'https://zhonyas.com',
    fecha: '2026',
    estado: 'por-confirmar',
    nota: 'Los «7 commits que atacaron otra cosa» salen de una nota, no de los commits (C-16).',
  },
] as const satisfies readonly RegistroDato[];

export type IdDato = (typeof datos)[number]['id'];

/** Los datos por id. */
export const datosPorId: ReadonlyMap<string, RegistroDato> = new Map(datos.map((d) => [d.id, d]));
