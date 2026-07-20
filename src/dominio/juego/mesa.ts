/**
 * Reglas de validación de la mesa.
 *
 * La mesa es un conjunto de combinaciones. Para poder confirmar una jugada,
 * todas las combinaciones deben ser válidas (no se permiten fichas sueltas ni
 * combinaciones inválidas) y ninguna ficha puede aparecer en dos zonas a la vez.
 */
import { esCombinacionValida } from './reglasComodines';
import type { Ficha, IdFicha } from './tipos';

/** Resultado de validar la mesa completa. */
export interface ResultadoMesa {
  readonly valida: boolean;
  /** Índices de las combinaciones inválidas (incluye las que tienen fichas sueltas). */
  readonly combinacionesInvalidas: readonly number[];
}

/**
 * Valida todas las combinaciones de la mesa. Una mesa vacía es válida (no hay
 * nada inválido sobre ella).
 */
export function validarMesa(mesa: readonly (readonly Ficha[])[]): ResultadoMesa {
  const combinacionesInvalidas: number[] = [];
  mesa.forEach((combinacion, indice) => {
    if (!esCombinacionValida(combinacion)) combinacionesInvalidas.push(indice);
  });
  return { valida: combinacionesInvalidas.length === 0, combinacionesInvalidas };
}

/**
 * Devuelve los identificadores de ficha que aparecen en más de una zona (o
 * repetidos dentro de una zona). Sirve para detectar estados imposibles.
 */
export function idsDuplicados(zonas: readonly (readonly Ficha[])[]): IdFicha[] {
  const vistos = new Set<IdFicha>();
  const duplicados = new Set<IdFicha>();
  for (const zona of zonas) {
    for (const ficha of zona) {
      if (vistos.has(ficha.id)) duplicados.add(ficha.id);
      else vistos.add(ficha.id);
    }
  }
  return [...duplicados];
}
