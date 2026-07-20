/**
 * Puntuación del juego: valor de fichas y combinaciones, valor del atril y
 * cálculo de la puntuación al terminar una ronda.
 *
 * REGLAS DE PUNTUACIÓN (véanse secciones 8 y 11 de las especificaciones)
 * - Una ficha numérica vale su número.
 * - En una combinación, un comodín vale el número que representa.
 * - Un comodín que permanece en el atril al terminar la ronda vale 30 puntos.
 * - Al vaciar el atril, el ganador suma el valor total de las fichas de sus
 *   rivales; cada rival resta el valor de sus fichas restantes.
 * - En un bloqueo, gana quien tenga el menor valor total en el atril. El
 *   desempate es determinista: gana el jugador con menor índice en el orden de
 *   la ronda (su turno es anterior).
 */
import { PENALIZACION_COMODIN } from './constantes';
import { interpretarCombinacion } from './reglasComodines';
import { esComodin } from './validadores';
import type { Ficha, IdFicha } from './tipos';

/** Valor de una ficha cuando permanece en el atril al terminar la ronda. */
export function valorFichaEnAtril(ficha: Ficha): number {
  return esComodin(ficha) ? PENALIZACION_COMODIN : ficha.numero;
}

/** Valor total de las fichas que quedan en un atril. */
export function valorAtril(fichas: readonly Ficha[]): number {
  return fichas.reduce((total, ficha) => total + valorFichaEnAtril(ficha), 0);
}

/**
 * Puntos de una combinación válida: suma del número de cada ficha, contando los
 * comodines por el número que representan. Devuelve `null` si no es válida.
 */
export function puntosDeCombinacion(fichas: readonly Ficha[]): number | null {
  const resultado = interpretarCombinacion(fichas);
  if (!resultado.valida) return null;

  const numeroComodin = new Map<IdFicha, number>(
    resultado.interpretaciones.map((i) => [i.idComodin, i.numero]),
  );

  return fichas.reduce((total, ficha) => {
    if (esComodin(ficha)) return total + (numeroComodin.get(ficha.id) ?? 0);
    return total + ficha.numero;
  }, 0);
}

/** Motivo por el que termina una ronda. */
export type MotivoFinRonda = 'atril-vacio' | 'bloqueo';

/** Atril de un jugador identificado, para el cálculo de puntuación. */
export interface AtrilJugador {
  readonly idJugador: string;
  readonly atril: readonly Ficha[];
}

/** Puntuación de un jugador en una ronda. */
export interface PuntuacionJugadorRonda {
  readonly idJugador: string;
  readonly valorAtril: number;
  readonly puntos: number;
  readonly esGanador: boolean;
}

/** Resultado de puntuar una ronda completa. */
export interface PuntuacionRonda {
  readonly motivo: MotivoFinRonda;
  readonly idGanador: string;
  readonly resultados: readonly PuntuacionJugadorRonda[];
}

/**
 * Determina el ganador de una ronda bloqueada: menor valor de atril, con
 * desempate por orden de la ronda (menor índice gana).
 */
function ganadorPorBloqueo(jugadores: readonly AtrilJugador[]): string {
  let mejor = jugadores[0]!;
  let mejorValor = valorAtril(mejor.atril);
  for (let i = 1; i < jugadores.length; i += 1) {
    const jugador = jugadores[i]!;
    const valor = valorAtril(jugador.atril);
    if (valor < mejorValor) {
      mejor = jugador;
      mejorValor = valor;
    }
  }
  return mejor.idJugador;
}

/**
 * Calcula la puntuación de una ronda.
 *
 * @param jugadores Atriles de todos los jugadores, en el orden de la ronda.
 * @param motivo Cómo terminó la ronda.
 * @param idGanadorAtrilVacio Jugador que vació su atril (obligatorio si el
 *   motivo es `atril-vacio`).
 */
export function puntuarRonda(
  jugadores: readonly AtrilJugador[],
  motivo: MotivoFinRonda,
  idGanadorAtrilVacio?: string,
): PuntuacionRonda {
  if (jugadores.length === 0) {
    throw new Error('No se puede puntuar una ronda sin jugadores.');
  }

  let idGanador: string;
  if (motivo === 'atril-vacio') {
    if (idGanadorAtrilVacio === undefined) {
      throw new Error('Falta el ganador que vació el atril.');
    }
    if (!jugadores.some((j) => j.idJugador === idGanadorAtrilVacio)) {
      throw new Error('El ganador indicado no está entre los jugadores.');
    }
    idGanador = idGanadorAtrilVacio;
  } else {
    idGanador = ganadorPorBloqueo(jugadores);
  }

  const valores = new Map<string, number>(jugadores.map((j) => [j.idJugador, valorAtril(j.atril)]));
  const totalRivales = jugadores
    .filter((j) => j.idJugador !== idGanador)
    .reduce((total, j) => total + (valores.get(j.idJugador) ?? 0), 0);

  const resultados: PuntuacionJugadorRonda[] = jugadores.map((jugador) => {
    const valor = valores.get(jugador.idJugador) ?? 0;
    const esGanador = jugador.idJugador === idGanador;
    return {
      idJugador: jugador.idJugador,
      valorAtril: valor,
      puntos: esGanador ? totalRivales : -valor,
      esGanador,
    };
  });

  return { motivo, idGanador, resultados };
}
