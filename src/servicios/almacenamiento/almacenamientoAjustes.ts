/**
 * Persistencia de los ajustes de la aplicación en `localStorage`.
 * Todos los datos permanecen exclusivamente en el navegador.
 */

/** Tema visual de la aplicación. */
export type Tema = 'claro' | 'oscuro' | 'automatico';

/** Ajustes configurables por la persona usuaria. */
export interface Ajustes {
  readonly tema: Tema;
  readonly sonidos: boolean;
  readonly animaciones: boolean;
}

/** Ajustes por defecto. */
export const AJUSTES_POR_DEFECTO: Ajustes = {
  tema: 'automatico',
  sonidos: true,
  animaciones: true,
};

const CLAVE_AJUSTES = 'rummiq:ajustes';
const TEMAS: readonly Tema[] = ['claro', 'oscuro', 'automatico'];

function disponible(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function esAjustes(datos: unknown): datos is Ajustes {
  if (typeof datos !== 'object' || datos === null) return false;
  const a = datos as Record<string, unknown>;
  return (
    typeof a.tema === 'string' &&
    TEMAS.includes(a.tema as Tema) &&
    typeof a.sonidos === 'boolean' &&
    typeof a.animaciones === 'boolean'
  );
}

/** Carga los ajustes guardados o devuelve los ajustes por defecto. */
export function cargarAjustes(): Ajustes {
  if (!disponible()) return AJUSTES_POR_DEFECTO;
  try {
    const texto = localStorage.getItem(CLAVE_AJUSTES);
    if (texto === null) return AJUSTES_POR_DEFECTO;
    const datos: unknown = JSON.parse(texto);
    return esAjustes(datos) ? datos : AJUSTES_POR_DEFECTO;
  } catch {
    return AJUSTES_POR_DEFECTO;
  }
}

/** Guarda los ajustes. */
export function guardarAjustes(ajustes: Ajustes): void {
  if (!disponible()) return;
  try {
    localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(ajustes));
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

/** Borra los ajustes guardados. */
export function borrarAjustes(): void {
  if (!disponible()) return;
  try {
    localStorage.removeItem(CLAVE_AJUSTES);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}
