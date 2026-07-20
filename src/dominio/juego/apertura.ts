/**
 * Apertura inicial.
 *
 * Antes de completar su apertura, un jugador debe bajar una o varias
 * combinaciones válidas que sumen al menos 30 puntos, usando solo fichas de su
 * propio atril y sin modificar combinaciones existentes. El valor de un comodín
 * es el número que representa en su combinación.
 *
 * Este módulo solo evalúa la validez y los puntos de un conjunto de
 * combinaciones candidatas; las restricciones sobre el origen de las fichas y
 * la mesa las aplica el motor de juego (fase 5).
 */
import { PUNTOS_MINIMOS_APERTURA } from './constantes';
import { puntosDeCombinacion } from './puntuacion';
import type { Ficha } from './tipos';

/** Resultado de evaluar una apertura candidata. */
export interface ResultadoApertura {
  /** La apertura es válida: todas las combinaciones válidas y suma suficiente. */
  readonly valida: boolean;
  /** Puntos totales de las combinaciones válidas. */
  readonly puntos: number;
  /** Si alcanza el mínimo de puntos requerido. */
  readonly cumpleMinimo: boolean;
  /** Índices de las combinaciones que no son válidas. */
  readonly combinacionesInvalidas: readonly number[];
}

/** Puntos mínimos requeridos para completar la apertura. */
export { PUNTOS_MINIMOS_APERTURA };

/**
 * Evalúa una apertura formada por una o varias combinaciones. Es válida si hay
 * al menos una combinación, todas son válidas y la suma alcanza el mínimo.
 */
export function evaluarApertura(combinaciones: readonly (readonly Ficha[])[]): ResultadoApertura {
  const combinacionesInvalidas: number[] = [];
  let puntos = 0;

  combinaciones.forEach((combinacion, indice) => {
    const puntosCombinacion = puntosDeCombinacion(combinacion);
    if (puntosCombinacion === null) combinacionesInvalidas.push(indice);
    else puntos += puntosCombinacion;
  });

  const todasValidas = combinaciones.length > 0 && combinacionesInvalidas.length === 0;
  const cumpleMinimo = puntos >= PUNTOS_MINIMOS_APERTURA;

  return {
    valida: todasValidas && cumpleMinimo,
    puntos,
    cumpleMinimo,
    combinacionesInvalidas,
  };
}
