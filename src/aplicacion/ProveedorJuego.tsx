/**
 * Proveedor del contexto de juego. Gestiona el estado con `useReducer`,
 * envuelve el reductor del motor y guarda automáticamente la partida tras cada
 * cambio confirmado (el trabajo provisional nunca se persiste).
 */
import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { crearPartida, reducir } from '@/dominio/juego/motorJuego';
import { aplicarJugadaBot } from '@/dominio/juego/bot';
import { cargarPartida, guardarPartida } from '@/servicios/almacenamiento/almacenamientoPartida';
import type { AccionJuego, ConfiguracionPartida, EstadoJuego } from '@/dominio/juego/tiposMotor';
import { ContextoJuego, type ValorContextoJuego } from './contextoJuego';

type AccionApp =
  | { readonly tipo: 'NUEVA'; readonly estado: EstadoJuego }
  | { readonly tipo: 'CARGAR'; readonly estado: EstadoJuego }
  | { readonly tipo: 'SALIR' }
  | { readonly tipo: 'JUEGO'; readonly accion: AccionJuego }
  | { readonly tipo: 'BOT' };

function reductorApp(estado: EstadoJuego | null, accion: AccionApp): EstadoJuego | null {
  switch (accion.tipo) {
    case 'NUEVA':
    case 'CARGAR':
      return accion.estado;
    case 'SALIR':
      return null;
    case 'JUEGO':
      return estado ? reducir(estado, accion.accion) : estado;
    case 'BOT':
      return estado ? aplicarJugadaBot(estado) : estado;
    default:
      return estado;
  }
}

export function ProveedorJuego({ children }: { readonly children: ReactNode }) {
  const [estado, despacharApp] = useReducer(reductorApp, null);

  useEffect(() => {
    if (estado) guardarPartida(estado);
  }, [estado]);

  const despachar = useCallback((accion: AccionJuego) => {
    despacharApp({ tipo: 'JUEGO', accion });
  }, []);

  const nuevaPartida = useCallback((config: ConfiguracionPartida) => {
    despacharApp({ tipo: 'NUEVA', estado: crearPartida(config) });
  }, []);

  const reanudar = useCallback(() => {
    const guardada = cargarPartida();
    if (guardada) {
      despacharApp({ tipo: 'CARGAR', estado: guardada });
      return true;
    }
    return false;
  }, []);

  const salir = useCallback(() => {
    despacharApp({ tipo: 'SALIR' });
  }, []);

  const jugarBot = useCallback(() => {
    despacharApp({ tipo: 'BOT' });
  }, []);

  const valor = useMemo<ValorContextoJuego>(
    () => ({ estado, despachar, nuevaPartida, reanudar, salir, jugarBot }),
    [estado, despachar, nuevaPartida, reanudar, salir, jugarBot],
  );

  return <ContextoJuego.Provider value={valor}>{children}</ContextoJuego.Provider>;
}
