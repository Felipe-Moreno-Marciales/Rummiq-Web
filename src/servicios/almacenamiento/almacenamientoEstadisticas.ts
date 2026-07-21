/**
 * Persistencia de las estadísticas de partidas en `localStorage`.
 * Solo se guardan datos de juego, sin información personal.
 */

/** Resumen de una partida terminada. */
export interface ResumenPartida {
  readonly ganador: string;
  readonly jugadores: readonly { readonly nombre: string; readonly puntos: number }[];
  readonly rondas: number;
}

/** Estadísticas acumuladas. */
export interface Estadisticas {
  readonly partidasCompletadas: number;
  readonly rondasJugadas: number;
  /** Últimas partidas terminadas (las más recientes primero). */
  readonly historial: readonly ResumenPartida[];
}

/** Estadísticas vacías. */
export const ESTADISTICAS_VACIAS: Estadisticas = {
  partidasCompletadas: 0,
  rondasJugadas: 0,
  historial: [],
};

const CLAVE_ESTADISTICAS = 'rummiq:estadisticas';
const MAX_HISTORIAL = 20;

function disponible(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function esEstadisticas(datos: unknown): datos is Estadisticas {
  if (typeof datos !== 'object' || datos === null) return false;
  const e = datos as Record<string, unknown>;
  return (
    typeof e.partidasCompletadas === 'number' &&
    typeof e.rondasJugadas === 'number' &&
    Array.isArray(e.historial)
  );
}

/** Carga las estadísticas guardadas o devuelve las vacías. */
export function cargarEstadisticas(): Estadisticas {
  if (!disponible()) return ESTADISTICAS_VACIAS;
  try {
    const texto = localStorage.getItem(CLAVE_ESTADISTICAS);
    if (texto === null) return ESTADISTICAS_VACIAS;
    const datos: unknown = JSON.parse(texto);
    return esEstadisticas(datos) ? datos : ESTADISTICAS_VACIAS;
  } catch {
    return ESTADISTICAS_VACIAS;
  }
}

function guardar(estadisticas: Estadisticas): void {
  if (!disponible()) return;
  try {
    localStorage.setItem(CLAVE_ESTADISTICAS, JSON.stringify(estadisticas));
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

/** Registra una partida terminada y devuelve las estadísticas actualizadas. */
export function registrarPartida(resumen: ResumenPartida): Estadisticas {
  const previas = cargarEstadisticas();
  const actualizadas: Estadisticas = {
    partidasCompletadas: previas.partidasCompletadas + 1,
    rondasJugadas: previas.rondasJugadas + resumen.rondas,
    historial: [resumen, ...previas.historial].slice(0, MAX_HISTORIAL),
  };
  guardar(actualizadas);
  return actualizadas;
}

/** Borra las estadísticas guardadas. */
export function borrarEstadisticas(): void {
  if (!disponible()) return;
  try {
    localStorage.removeItem(CLAVE_ESTADISTICAS);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}
