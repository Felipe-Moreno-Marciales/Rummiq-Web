/**
 * Tipos del dominio del juego.
 *
 * Los tipos de color y número se derivan de las constantes `as const` para
 * evitar cualquier desincronización entre valores y tipos.
 */
import type { COLORES_FICHA, COPIAS_FICHA, NUMEROS_FICHA } from './constantes';

/** Color de una ficha numérica: rojo, azul, amarillo o negro. */
export type ColorFicha = (typeof COLORES_FICHA)[number];

/** Número de una ficha, del 1 al 13. */
export type NumeroFicha = (typeof NUMEROS_FICHA)[number];

/** Identificador de copia dentro de una combinación color+número. */
export type CopiaFicha = (typeof COPIAS_FICHA)[number];

/**
 * Identificador único y estable de una ficha.
 *
 * Formato:
 * - Fichas numéricas: `"{color}-{número}-{copia}"`, p. ej. `"rojo-7-a"`.
 * - Comodines: `"comodin-{copia}"`, p. ej. `"comodin-a"`.
 */
export type IdFicha = string;

/** Ficha numérica: tiene color y número. */
export interface FichaNumero {
  readonly id: IdFicha;
  readonly tipo: 'numero';
  readonly color: ColorFicha;
  readonly numero: NumeroFicha;
}

/** Comodín: puede representar la ficha necesaria en una combinación. */
export interface FichaComodin {
  readonly id: IdFicha;
  readonly tipo: 'comodin';
}

/** Cualquier ficha del juego. */
export type Ficha = FichaNumero | FichaComodin;

/** Tipo de combinación: grupo (mismo número) o escalera (mismo color). */
export type TipoCombinacion = 'grupo' | 'escalera';

/** Códigos de error de validación de combinaciones. */
export type CodigoErrorValidacion =
  | 'vacia'
  | 'pocas-fichas'
  | 'demasiadas-fichas'
  | 'numeros-distintos'
  | 'color-repetido'
  | 'colores-distintos'
  | 'numeros-repetidos'
  | 'no-consecutivos'
  | 'comodin-no-admitido'
  | 'combinacion-invalida';

/** Error de validación tipado, con mensaje legible en español. */
export interface ErrorValidacion {
  readonly codigo: CodigoErrorValidacion;
  readonly mensaje: string;
}

/**
 * Resultado de validar una combinación.
 * Unión discriminada: si `valida` es `true` incluye el tipo de combinación;
 * si es `false` incluye la lista de errores tipados.
 */
export type ValidacionCombinacion =
  | { readonly valida: true; readonly tipo: TipoCombinacion }
  | { readonly valida: false; readonly errores: readonly ErrorValidacion[] };
