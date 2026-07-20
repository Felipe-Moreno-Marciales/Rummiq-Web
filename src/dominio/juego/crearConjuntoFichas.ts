/**
 * Generación del conjunto completo de fichas.
 *
 * El juego usa 106 fichas: 4 colores × 13 números × 2 copias (104) más 2
 * comodines. Cada ficha recibe un identificador único y estable, de modo que
 * dos fichas con el mismo color y número siguen siendo distinguibles.
 */
import { COLORES_FICHA, COPIAS_FICHA, NUMEROS_FICHA } from './constantes';
import type { ColorFicha, CopiaFicha, Ficha, IdFicha, NumeroFicha } from './tipos';

/** Construye el identificador estable de una ficha numérica. */
export function idFichaNumero(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha): IdFicha {
  return `${color}-${numero}-${copia}`;
}

/** Construye el identificador estable de un comodín. */
export function idFichaComodin(copia: CopiaFicha): IdFicha {
  return `comodin-${copia}`;
}

/**
 * Devuelve un nuevo conjunto ordenado de las 106 fichas del juego.
 * El orden es determinista (por color, número y copia, y luego los comodines).
 */
export function crearConjuntoFichas(): Ficha[] {
  const fichas: Ficha[] = [];

  for (const color of COLORES_FICHA) {
    for (const numero of NUMEROS_FICHA) {
      for (const copia of COPIAS_FICHA) {
        fichas.push({
          id: idFichaNumero(color, numero, copia),
          tipo: 'numero',
          color,
          numero,
        });
      }
    }
  }

  for (const copia of COPIAS_FICHA) {
    fichas.push({ id: idFichaComodin(copia), tipo: 'comodin' });
  }

  return fichas;
}
