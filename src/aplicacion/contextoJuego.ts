/**
 * Contexto de React que expone el estado del juego y las acciones de alto nivel
 * (nueva partida, reanudar, salir) además del despacho de acciones del motor.
 */
import { createContext } from 'react';
import type { AccionJuego, ConfiguracionPartida, EstadoJuego } from '@/dominio/juego/tiposMotor';

export interface ValorContextoJuego {
  readonly estado: EstadoJuego | null;
  readonly despachar: (accion: AccionJuego) => void;
  readonly nuevaPartida: (config: ConfiguracionPartida) => void;
  readonly reanudar: () => boolean;
  readonly salir: () => void;
}

export const ContextoJuego = createContext<ValorContextoJuego | null>(null);
