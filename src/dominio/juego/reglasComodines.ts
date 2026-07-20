/**
 * Reglas e interpretación de comodines en las combinaciones.
 *
 * Un comodín representa la ficha (color + número) que falta en una combinación.
 * Este módulo determina, de forma **determinista e inequívoca**, qué representa
 * cada comodín, y valida grupos y escaleras que pueden contener comodines.
 *
 * DECISIONES DE DISEÑO SOBRE COMODINES
 * ------------------------------------
 * 1. Un grupo se valida con semántica de conjunto (el orden no importa). Los
 *    comodines toman el número común del grupo y ocupan los colores que faltan,
 *    asignados en el orden canónico de `COLORES_FICHA`. El número es siempre
 *    inequívoco.
 * 2. Una escalera se valida con semántica **posicional**: el número de cada
 *    ficha viene dado por su posición en la disposición de la combinación. Las
 *    fichas numéricas fijan el número inicial (`inicio = número − índice`) y los
 *    comodines toman el número de su posición. Así, un comodín en un extremo
 *    ([4,5,6,C]) o en el medio ([4,C,6]) tiene una interpretación única sin
 *    ambigüedad, y se admiten comodines en los extremos.
 * 3. Varios comodines en una combinación: se admiten (el juego tiene dos). Cada
 *    uno recibe su interpretación por color (grupo) o por posición (escalera).
 * 4. Precedencia grupo → escalera: si una disposición es válida como grupo, se
 *    interpreta como grupo. El único caso que puede ser ambos es una ficha
 *    numérica con dos comodines ([X, C, C]); se resuelve como grupo. Se
 *    documenta esta regla para evitar cualquier ambigüedad.
 * 5. Ambigüedad real: una combinación formada solo por comodines no fija ninguna
 *    interpretación y se rechaza con el código `comodin-ambiguo`.
 * 6. Sustitución: una ficha del atril que coincide exactamente (color y número)
 *    con lo que representa un comodín puede sustituirlo. La reutilización del
 *    comodín dentro del mismo turno la gestiona el motor de juego (fase 5).
 * 7. Puntuación: un comodín vale el número que representa en su combinación
 *    (véase `puntuacion.ts`) y 30 puntos si permanece en el atril al terminar
 *    la ronda.
 */
import {
  COLORES_FICHA,
  NUMERO_FICHA_MAXIMO,
  NUMERO_FICHA_MINIMO,
  TAMANO_MAXIMO_GRUPO,
  TAMANO_MINIMO_COMBINACION,
} from './constantes';
import { crearError, esComodin, esFichaNumero } from './validadores';
import type {
  CodigoErrorValidacion,
  ColorFicha,
  ErrorValidacion,
  Ficha,
  IdFicha,
  NumeroFicha,
  TipoCombinacion,
} from './tipos';

/** Qué representa un comodín concreto dentro de una combinación. */
export interface InterpretacionComodin {
  readonly idComodin: IdFicha;
  readonly numero: NumeroFicha;
  readonly color: ColorFicha;
}

/**
 * Resultado de interpretar una combinación que puede contener comodines.
 * Si es válida, incluye el tipo y la interpretación de cada comodín.
 */
export type ResultadoCombinacion =
  | {
      readonly valida: true;
      readonly tipo: TipoCombinacion;
      readonly interpretaciones: readonly InterpretacionComodin[];
    }
  | { readonly valida: false; readonly errores: readonly ErrorValidacion[] };

function invalida(...codigos: CodigoErrorValidacion[]): ResultadoCombinacion {
  return { valida: false, errores: codigos.map(crearError) };
}

/**
 * Interpreta la combinación como grupo (semántica de conjunto).
 * Todas las fichas numéricas comparten número; los comodines completan los
 * colores que faltan.
 */
export function interpretarGrupo(fichas: readonly Ficha[]): ResultadoCombinacion {
  const codigos: CodigoErrorValidacion[] = [];
  if (fichas.length < TAMANO_MINIMO_COMBINACION) codigos.push('pocas-fichas');
  if (fichas.length > TAMANO_MAXIMO_GRUPO) codigos.push('demasiadas-fichas');

  const numericas = fichas.filter(esFichaNumero);
  const comodines = fichas.filter(esComodin);

  if (numericas.length === 0) {
    return invalida('comodin-ambiguo');
  }

  const numero = numericas[0]!.numero;
  if (!numericas.every((f) => f.numero === numero)) codigos.push('numeros-distintos');

  const coloresUsados = numericas.map((f) => f.color);
  if (new Set(coloresUsados).size !== coloresUsados.length) codigos.push('color-repetido');

  const coloresDisponibles = COLORES_FICHA.filter((color) => !coloresUsados.includes(color));
  if (comodines.length > coloresDisponibles.length) codigos.push('color-repetido');

  if (codigos.length > 0) return { valida: false, errores: codigos.map(crearError) };

  const interpretaciones: InterpretacionComodin[] = comodines.map((comodin, indice) => ({
    idComodin: comodin.id,
    numero,
    color: coloresDisponibles[indice]!,
  }));
  return { valida: true, tipo: 'grupo', interpretaciones };
}

/**
 * Interpreta la combinación como escalera (semántica posicional).
 * Las fichas numéricas fijan el número inicial según su posición; los comodines
 * toman el número que corresponde a su posición.
 */
export function interpretarEscalera(fichas: readonly Ficha[]): ResultadoCombinacion {
  const codigos: CodigoErrorValidacion[] = [];
  if (fichas.length < TAMANO_MINIMO_COMBINACION) codigos.push('pocas-fichas');

  const numericas = fichas.filter(esFichaNumero);
  if (numericas.length === 0) {
    return invalida(...codigos, 'comodin-ambiguo');
  }

  const color = numericas[0]!.color;
  if (!numericas.every((f) => f.color === color)) codigos.push('colores-distintos');

  let inicio: number | undefined;
  let desacuerdo = false;
  fichas.forEach((ficha, indice) => {
    if (esFichaNumero(ficha)) {
      const posibleInicio = ficha.numero - indice;
      if (inicio === undefined) inicio = posibleInicio;
      else if (posibleInicio !== inicio) desacuerdo = true;
    }
  });
  if (desacuerdo) codigos.push('no-consecutivos');

  if (inicio !== undefined && !desacuerdo) {
    const minimo = inicio;
    const maximo = inicio + fichas.length - 1;
    if (minimo < NUMERO_FICHA_MINIMO || maximo > NUMERO_FICHA_MAXIMO) {
      codigos.push('numero-fuera-de-rango');
    }
  }

  if (codigos.length > 0 || inicio === undefined) {
    return { valida: false, errores: codigos.map(crearError) };
  }

  const numeroInicial = inicio;
  const interpretaciones: InterpretacionComodin[] = [];
  fichas.forEach((ficha, indice) => {
    if (esComodin(ficha)) {
      interpretaciones.push({
        idComodin: ficha.id,
        numero: (numeroInicial + indice) as NumeroFicha,
        color,
      });
    }
  });
  return { valida: true, tipo: 'escalera', interpretaciones };
}

/**
 * Interpreta una combinación cualquiera (con o sin comodines). Intenta grupo y,
 * si no, escalera. Devuelve la interpretación válida o el diagnóstico más
 * relevante en caso de error.
 */
export function interpretarCombinacion(fichas: readonly Ficha[]): ResultadoCombinacion {
  if (fichas.length === 0) return invalida('vacia');

  const comoGrupo = interpretarGrupo(fichas);
  if (comoGrupo.valida) return comoGrupo;

  const comoEscalera = interpretarEscalera(fichas);
  if (comoEscalera.valida) return comoEscalera;

  const numericas = fichas.filter(esFichaNumero);
  if (numericas.length === 0) return invalida('comodin-ambiguo');

  const mismoColor = new Set(numericas.map((f) => f.color)).size === 1;
  if (mismoColor) return comoEscalera;

  const mismoNumero = new Set(numericas.map((f) => f.numero)).size === 1;
  if (mismoNumero) return comoGrupo;

  return invalida('combinacion-invalida');
}

/** Indica si una combinación (con o sin comodines) es válida. */
export function esCombinacionValida(fichas: readonly Ficha[]): boolean {
  return interpretarCombinacion(fichas).valida;
}

/**
 * Indica si una ficha del atril puede sustituir a un comodín, es decir, si
 * coincide exactamente con el color y el número que el comodín representa.
 */
export function fichaSustituyeComodin(
  ficha: Ficha,
  interpretacion: InterpretacionComodin,
): boolean {
  return (
    esFichaNumero(ficha) &&
    ficha.color === interpretacion.color &&
    ficha.numero === interpretacion.numero
  );
}
