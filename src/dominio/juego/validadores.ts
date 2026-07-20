/**
 * Validadores básicos de combinaciones (grupos y escaleras) para fichas
 * numéricas, sin comodines. La interpretación de comodines se añade en una fase
 * posterior (`reglasComodines.ts`).
 *
 * Decisiones de diseño:
 * - Las combinaciones se validan con semántica de conjunto: el orden en que se
 *   pasan las fichas no afecta al resultado. La disposición visual es
 *   responsabilidad de la capa de presentación.
 * - Todos los errores son tipados (código + mensaje legible en español).
 */
import { TAMANO_MAXIMO_GRUPO, TAMANO_MINIMO_COMBINACION } from './constantes';
import type {
  CodigoErrorValidacion,
  ErrorValidacion,
  Ficha,
  FichaComodin,
  FichaNumero,
  ValidacionCombinacion,
} from './tipos';

/** Indica si una ficha es un comodín. */
export function esComodin(ficha: Ficha): ficha is FichaComodin {
  return ficha.tipo === 'comodin';
}

/** Indica si una ficha es numérica. */
export function esFichaNumero(ficha: Ficha): ficha is FichaNumero {
  return ficha.tipo === 'numero';
}

const MENSAJES: Record<CodigoErrorValidacion, string> = {
  vacia: 'La combinación no tiene fichas.',
  'pocas-fichas': `Una combinación necesita al menos ${TAMANO_MINIMO_COMBINACION} fichas.`,
  'demasiadas-fichas': `Un grupo puede tener como máximo ${TAMANO_MAXIMO_GRUPO} fichas.`,
  'numeros-distintos': 'Todas las fichas de un grupo deben tener el mismo número.',
  'color-repetido': 'Un grupo no puede repetir color.',
  'colores-distintos': 'Todas las fichas de una escalera deben ser del mismo color.',
  'numeros-repetidos': 'Una escalera no puede repetir números.',
  'no-consecutivos': 'Los números de una escalera deben ser consecutivos.',
  'comodin-no-admitido': 'La validación básica todavía no admite comodines.',
  'comodin-ambiguo': 'No se puede determinar de forma única el valor de los comodines.',
  'numero-fuera-de-rango': 'La escalera se sale del rango del 1 al 13.',
  'combinacion-invalida': 'Las fichas no forman un grupo ni una escalera válidos.',
};

/** Construye un error de validación tipado con su mensaje legible en español. */
export function crearError(codigo: CodigoErrorValidacion): ErrorValidacion {
  return { codigo, mensaje: MENSAJES[codigo] };
}

function invalida(...codigos: CodigoErrorValidacion[]): ValidacionCombinacion {
  return { valida: false, errores: codigos.map(crearError) };
}

/** Devuelve `true` si alguna de las fichas es un comodín. */
function contieneComodin(fichas: readonly Ficha[]): boolean {
  return fichas.some(esComodin);
}

/**
 * Valida un grupo: de 3 a 4 fichas, todas con el mismo número y colores
 * distintos entre sí. (Versión sin comodines.)
 */
export function esGrupoValido(fichas: readonly Ficha[]): ValidacionCombinacion {
  if (fichas.length === 0) return invalida('vacia');
  if (contieneComodin(fichas)) return invalida('comodin-no-admitido');

  const fichasNumero = fichas.filter(esFichaNumero);
  const codigos: CodigoErrorValidacion[] = [];

  if (fichasNumero.length < TAMANO_MINIMO_COMBINACION) codigos.push('pocas-fichas');
  if (fichasNumero.length > TAMANO_MAXIMO_GRUPO) codigos.push('demasiadas-fichas');

  const primerNumero = fichasNumero[0]?.numero;
  if (!fichasNumero.every((ficha) => ficha.numero === primerNumero)) {
    codigos.push('numeros-distintos');
  }

  const colores = new Set(fichasNumero.map((ficha) => ficha.color));
  if (colores.size !== fichasNumero.length) {
    codigos.push('color-repetido');
  }

  return codigos.length === 0
    ? { valida: true, tipo: 'grupo' }
    : { valida: false, errores: codigos.map(crearError) };
}

/**
 * Valida una escalera: 3 o más fichas del mismo color con números
 * consecutivos y sin repeticiones. No se admiten secuencias circulares ni el 1
 * después del 13 (queda excluido por la comprobación de consecutividad).
 * (Versión sin comodines.)
 */
export function esEscaleraValida(fichas: readonly Ficha[]): ValidacionCombinacion {
  if (fichas.length === 0) return invalida('vacia');
  if (contieneComodin(fichas)) return invalida('comodin-no-admitido');

  const fichasNumero = fichas.filter(esFichaNumero);
  const codigos: CodigoErrorValidacion[] = [];

  if (fichasNumero.length < TAMANO_MINIMO_COMBINACION) codigos.push('pocas-fichas');

  const colores = new Set(fichasNumero.map((ficha) => ficha.color));
  if (colores.size > 1) codigos.push('colores-distintos');

  const numeros = fichasNumero.map((ficha) => ficha.numero);
  const numerosUnicos = new Set(numeros);
  if (numerosUnicos.size !== numeros.length) {
    codigos.push('numeros-repetidos');
  } else {
    const ordenados = [...numeros].sort((a, b) => a - b);
    const minimo = ordenados[0];
    const maximo = ordenados[ordenados.length - 1];
    if (minimo !== undefined && maximo !== undefined && maximo - minimo !== ordenados.length - 1) {
      codigos.push('no-consecutivos');
    }
  }

  return codigos.length === 0
    ? { valida: true, tipo: 'escalera' }
    : { valida: false, errores: codigos.map(crearError) };
}

/**
 * Valida si un conjunto de fichas forma una combinación válida (grupo o
 * escalera). Devuelve el tipo cuando es válida; en caso contrario, los errores.
 */
export function validarCombinacion(fichas: readonly Ficha[]): ValidacionCombinacion {
  const comoGrupo = esGrupoValido(fichas);
  if (comoGrupo.valida) return comoGrupo;

  const comoEscalera = esEscaleraValida(fichas);
  if (comoEscalera.valida) return comoEscalera;

  // Elegimos el diagnóstico más relevante según la intención aparente:
  // mismo color sugiere escalera; mismo número sugiere grupo.
  const fichasNumero = fichas.filter(esFichaNumero);
  if (fichasNumero.length === 0) {
    return comoGrupo; // errores de vacío/comodín ya recogidos
  }

  const mismoColor = new Set(fichasNumero.map((f) => f.color)).size === 1;
  if (mismoColor && !comoEscalera.valida) return comoEscalera;

  const mismoNumero = new Set(fichasNumero.map((f) => f.numero)).size === 1;
  if (mismoNumero && !comoGrupo.valida) return comoGrupo;

  return invalida('combinacion-invalida');
}
