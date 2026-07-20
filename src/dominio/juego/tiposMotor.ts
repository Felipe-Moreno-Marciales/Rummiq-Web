/**
 * Tipos del motor de juego: jugadores, combinaciones en la mesa, estado de
 * turno y estado completo de la partida, además de las acciones del reductor.
 *
 * Todo el estado es inmutable (propiedades `readonly`) y serializable a JSON
 * para poder persistirlo.
 */
import type { Ficha, IdFicha } from './tipos';
import type { MotivoFinRonda, PuntuacionRonda } from './puntuacion';

/** Tipo de jugador. */
export type TipoJugador = 'humano' | 'maquina';

/** Dificultad de un jugador controlado por la máquina. */
export type Dificultad = 'facil' | 'media' | 'dificil';

/** Un jugador de la partida. */
export interface Jugador {
  readonly id: string;
  readonly nombre: string;
  readonly tipo: TipoJugador;
  /** Solo para jugadores de tipo `maquina`. */
  readonly dificultad?: Dificultad;
}

/** Configuración de una partida. */
export interface ConfiguracionPartida {
  readonly jugadores: readonly Jugador[];
  /** Número de rondas que se jugarán. */
  readonly rondas: number;
  /** Semilla opcional para partidas reproducibles (pruebas). */
  readonly semilla?: number | string;
}

/** Una combinación colocada en la mesa, con identificador estable. */
export interface Combinacion {
  readonly id: string;
  readonly fichas: readonly Ficha[];
}

/** Fase global de la partida. */
export type FasePartida = 'jugando' | 'fin-ronda' | 'fin-partida';

/** Criterio para ordenar el atril. */
export type CriterioOrden = 'numero' | 'color';

/** Instantánea inmutable del estado confirmado al iniciar un turno. */
export interface InstantaneaTurno {
  readonly mesa: readonly Combinacion[];
  readonly atril: readonly Ficha[];
  readonly haAbierto: boolean;
}

/**
 * Estado provisional del turno en curso. Contiene el trabajo aún no confirmado
 * y la instantánea a la que se puede volver con «deshacer».
 */
export interface EstadoTurno {
  readonly idJugador: string;
  readonly mesa: readonly Combinacion[];
  readonly atril: readonly Ficha[];
  readonly instantanea: InstantaneaTurno;
}

/** Códigos de error de las acciones del motor. */
export type CodigoErrorJuego =
  | 'mesa-invalida'
  | 'sin-cambios'
  | 'sin-jugar-ficha'
  | 'apertura-insuficiente'
  | 'apertura-modifica-mesa'
  | 'comodin-no-reubicado'
  | 'conservacion-fichas'
  | 'pozo-vacio'
  | 'no-permitido';

/** Mensaje de error del motor, legible y con detalle opcional. */
export interface MensajeErrorJuego {
  readonly codigo: CodigoErrorJuego;
  readonly mensaje: string;
  /** Índices de combinaciones inválidas, cuando aplica. */
  readonly combinacionesInvalidas?: readonly number[];
}

/** Estado completo de la partida. */
export interface EstadoJuego {
  readonly version: number;
  readonly config: ConfiguracionPartida;
  readonly jugadores: readonly Jugador[];
  readonly semilla: number | string;
  readonly rondaActual: number;
  readonly fase: FasePartida;

  // Estado confirmado de la ronda actual.
  readonly mesa: readonly Combinacion[];
  readonly pozo: readonly Ficha[];
  readonly manos: Readonly<Record<string, readonly Ficha[]>>;
  readonly haAbierto: Readonly<Record<string, boolean>>;
  readonly ordenTurnos: readonly string[];
  readonly turnoActual: number;
  readonly pasesConsecutivos: number;

  // Trabajo del turno en curso (null salvo en fase «jugando»).
  readonly turno: EstadoTurno | null;

  // Puntuación e historial.
  readonly puntuaciones: Readonly<Record<string, number>>;
  readonly rondasGanadas: Readonly<Record<string, number>>;
  readonly historialRondas: readonly PuntuacionRonda[];
  readonly resultadoRonda: PuntuacionRonda | null;

  // Contador para identificadores de combinación y último error.
  readonly contadorCombinacion: number;
  readonly ultimoError: MensajeErrorJuego | null;
}

/** Acciones que entiende el reductor del motor. */
export type AccionJuego =
  | {
      readonly tipo: 'ESTABLECER_PROVISIONAL';
      readonly mesa: readonly Combinacion[];
      readonly atril: readonly Ficha[];
    }
  | { readonly tipo: 'ORDENAR_ATRIL'; readonly criterio: CriterioOrden }
  | { readonly tipo: 'DESHACER_TURNO' }
  | { readonly tipo: 'ROBAR' }
  | { readonly tipo: 'CONFIRMAR' }
  | { readonly tipo: 'PASAR' }
  | { readonly tipo: 'SIGUIENTE_RONDA' }
  | { readonly tipo: 'REINICIAR_RONDA' };

/** Resultado de comprobar si se puede confirmar la jugada. */
export type ResultadoConfirmacion =
  | { readonly permitida: true; readonly abre: boolean }
  | { readonly permitida: false; readonly error: MensajeErrorJuego };

export type { Ficha, IdFicha, MotivoFinRonda, PuntuacionRonda };
