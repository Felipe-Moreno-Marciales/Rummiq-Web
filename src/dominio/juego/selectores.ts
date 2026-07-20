/**
 * Selectores: datos derivados del estado del juego para la interfaz.
 *
 * Importante: las fichas de los oponentes permanecen ocultas. Solo se expone la
 * cantidad de fichas de cada oponente, nunca su contenido.
 */
import { validarMesa } from './mesa';
import type { EstadoJuego, Jugador } from './tiposMotor';

/** Jugador al que le toca jugar. */
export function jugadorActual(estado: EstadoJuego): Jugador | undefined {
  const id = estado.ordenTurnos[estado.turnoActual];
  return estado.jugadores.find((j) => j.id === id);
}

/** Indica si es el turno del jugador indicado. */
export function esTurnoDe(estado: EstadoJuego, idJugador: string): boolean {
  return estado.ordenTurnos[estado.turnoActual] === idJugador;
}

/** Número de fichas en el pozo. */
export function cantidadPozo(estado: EstadoJuego): number {
  return estado.pozo.length;
}

/** Información pública de un oponente (sin revelar sus fichas). */
export interface InfoOponente {
  readonly id: string;
  readonly nombre: string;
  readonly cantidadFichas: number;
  readonly haAbierto: boolean;
  readonly esTurno: boolean;
}

/**
 * Información pública de todos los jugadores distintos del indicado. Solo
 * incluye la cantidad de fichas, nunca su contenido.
 */
export function infoOponentes(estado: EstadoJuego, idJugador: string): InfoOponente[] {
  return estado.jugadores
    .filter((j) => j.id !== idJugador)
    .map((j) => ({
      id: j.id,
      nombre: j.nombre,
      cantidadFichas: (estado.manos[j.id] ?? []).length,
      haAbierto: estado.haAbierto[j.id] ?? false,
      esTurno: esTurnoDe(estado, j.id),
    }));
}

/** Fila de la tabla de posiciones. */
export interface PosicionJugador {
  readonly id: string;
  readonly nombre: string;
  readonly puntos: number;
  readonly rondasGanadas: number;
}

/**
 * Tabla de posiciones ordenada por puntos (descendente) y, a igualdad, por
 * rondas ganadas. El orden es determinista.
 */
export function tablaPosiciones(estado: EstadoJuego): PosicionJugador[] {
  return estado.jugadores
    .map((j) => ({
      id: j.id,
      nombre: j.nombre,
      puntos: estado.puntuaciones[j.id] ?? 0,
      rondasGanadas: estado.rondasGanadas[j.id] ?? 0,
    }))
    .sort((a, b) => b.puntos - a.puntos || b.rondasGanadas - a.rondasGanadas);
}

/** Índices de las combinaciones inválidas en el trabajo provisional del turno. */
export function combinacionesInvalidasActuales(estado: EstadoJuego): readonly number[] {
  if (!estado.turno) return [];
  return validarMesa(estado.turno.mesa.map((c) => c.fichas)).combinacionesInvalidas;
}
