/**
 * Constantes centralizadas del dominio del juego.
 *
 * Estas listas `as const` son además la fuente de la que se derivan los tipos
 * (véase `tipos.ts`), de modo que valores y tipos nunca se desincronizan.
 */

/** Colores de ficha disponibles. */
export const COLORES_FICHA = ['rojo', 'azul', 'amarillo', 'negro'] as const;

/** Números válidos de una ficha, del 1 al 13. */
export const NUMEROS_FICHA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

/**
 * Identificador de cada copia de una misma combinación color+número.
 * Existen dos copias, de modo que dos fichas idénticas tengan IDs distintos.
 */
export const COPIAS_FICHA = ['a', 'b'] as const;

/** Número de copias de cada combinación color+número. */
export const COPIAS_POR_COMBINACION = COPIAS_FICHA.length;

/** Número de comodines en el juego. */
export const NUMERO_COMODINES = 2;

/** Número más bajo de una ficha. */
export const NUMERO_FICHA_MINIMO = 1;

/** Número más alto de una ficha. */
export const NUMERO_FICHA_MAXIMO = 13;

/**
 * Total de fichas del juego:
 * 4 colores × 13 números × 2 copias = 104, más 2 comodines = 106.
 */
export const TOTAL_FICHAS =
  COLORES_FICHA.length * NUMEROS_FICHA.length * COPIAS_POR_COMBINACION + NUMERO_COMODINES;

/** Fichas que recibe cada jugador al inicio de la ronda. */
export const FICHAS_INICIALES_POR_JUGADOR = 14;

/** Tamaño mínimo de una combinación válida (grupo o escalera). */
export const TAMANO_MINIMO_COMBINACION = 3;

/** Tamaño máximo de un grupo (uno por cada color). */
export const TAMANO_MAXIMO_GRUPO = COLORES_FICHA.length;

/** Puntos mínimos requeridos para completar la apertura inicial. */
export const PUNTOS_MINIMOS_APERTURA = 30;

/** Puntos que vale un comodín que permanece en el atril al terminar la ronda. */
export const PENALIZACION_COMODIN = 30;
