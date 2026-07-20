/**
 * Persistencia de la partida en `localStorage`.
 *
 * - Guarda solo el estado confirmado (nunca el trabajo provisional del turno).
 * - Incluye la versión del esquema y prepara migraciones.
 * - Valida los datos recuperados y maneja información corrupta y errores de
 *   almacenamiento sin lanzar excepciones al llamante.
 * - Todos los datos permanecen exclusivamente en el navegador.
 */
import { VERSION_ESQUEMA, estadoParaGuardar, reanudarPartida } from '@/dominio/juego/motorJuego';
import type { EstadoJuego } from '@/dominio/juego/tiposMotor';

/** Clave de almacenamiento de la partida en curso. */
export const CLAVE_PARTIDA = 'rummiq:partida';

/** Indica si `localStorage` está disponible en el entorno actual. */
export function almacenamientoDisponible(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Comprueba de forma superficial que un valor tiene la forma de EstadoJuego. */
function esEstadoJuego(datos: unknown): datos is EstadoJuego {
  if (typeof datos !== 'object' || datos === null) return false;
  const e = datos as Record<string, unknown>;
  return (
    typeof e.version === 'number' &&
    typeof e.config === 'object' &&
    e.config !== null &&
    Array.isArray(e.jugadores) &&
    Array.isArray(e.mesa) &&
    Array.isArray(e.pozo) &&
    Array.isArray(e.ordenTurnos) &&
    typeof e.manos === 'object' &&
    e.manos !== null &&
    typeof e.fase === 'string' &&
    typeof e.turnoActual === 'number'
  );
}

/**
 * Migra un estado a la versión actual del esquema. Devuelve `null` si no es
 * posible migrarlo (por ahora solo se admite la versión vigente).
 */
function migrar(datos: EstadoJuego): EstadoJuego | null {
  if (datos.version === VERSION_ESQUEMA) return datos;
  // Aquí se añadirán migraciones cuando cambie el esquema.
  return null;
}

/** Guarda la partida en curso. No persiste el trabajo provisional del turno. */
export function guardarPartida(estado: EstadoJuego): boolean {
  if (!almacenamientoDisponible()) return false;
  try {
    localStorage.setItem(CLAVE_PARTIDA, JSON.stringify(estadoParaGuardar(estado)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Carga la partida guardada. Devuelve `null` si no hay ninguna, si los datos
 * están corruptos o si no se pueden migrar.
 */
export function cargarPartida(): EstadoJuego | null {
  if (!almacenamientoDisponible()) return null;
  let texto: string | null;
  try {
    texto = localStorage.getItem(CLAVE_PARTIDA);
  } catch {
    return null;
  }
  if (texto === null) return null;

  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return null;
  }

  if (!esEstadoJuego(datos)) return null;
  const migrado = migrar(datos);
  if (migrado === null) return null;
  return reanudarPartida(migrado);
}

/** Indica si hay una partida guardada válida. */
export function hayPartidaGuardada(): boolean {
  return cargarPartida() !== null;
}

/** Borra la partida guardada. */
export function borrarPartida(): void {
  if (!almacenamientoDisponible()) return;
  try {
    localStorage.removeItem(CLAVE_PARTIDA);
  } catch {
    // Ignorar errores de almacenamiento al borrar.
  }
}
