/**
 * Persistencia de los ajustes de la aplicación en `localStorage`.
 * Todos los datos permanecen exclusivamente en el navegador.
 */

/** Tema visual de la aplicación. */
export type Tema = 'claro' | 'oscuro' | 'automatico';

/** Color de acento de la interfaz. */
export type Acento = 'azul' | 'violeta' | 'turquesa' | 'esmeralda' | 'rosa' | 'naranja';

/** Ajustes configurables por la persona usuaria. */
export interface Ajustes {
  readonly tema: Tema;
  readonly acento: Acento;
  readonly sonidos: boolean;
  readonly animaciones: boolean;
}

/** Ajustes por defecto. */
export const AJUSTES_POR_DEFECTO: Ajustes = {
  tema: 'automatico',
  acento: 'azul',
  sonidos: true,
  animaciones: true,
};

const CLAVE_AJUSTES = 'rummiq:ajustes';
const TEMAS: readonly Tema[] = ['claro', 'oscuro', 'automatico'];
const ACENTOS: readonly Acento[] = ['azul', 'violeta', 'turquesa', 'esmeralda', 'rosa', 'naranja'];

function disponible(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/** Normaliza datos desconocidos a unos ajustes válidos, o `null` si no lo son. */
function normalizar(datos: unknown): Ajustes | null {
  if (typeof datos !== 'object' || datos === null) return null;
  const a = datos as Record<string, unknown>;
  if (typeof a.tema !== 'string' || !TEMAS.includes(a.tema as Tema)) return null;
  if (typeof a.sonidos !== 'boolean' || typeof a.animaciones !== 'boolean') return null;
  const acento =
    typeof a.acento === 'string' && ACENTOS.includes(a.acento as Acento)
      ? (a.acento as Acento)
      : AJUSTES_POR_DEFECTO.acento;
  return { tema: a.tema as Tema, acento, sonidos: a.sonidos, animaciones: a.animaciones };
}

/** Carga los ajustes guardados o devuelve los ajustes por defecto. */
export function cargarAjustes(): Ajustes {
  if (!disponible()) return AJUSTES_POR_DEFECTO;
  try {
    const texto = localStorage.getItem(CLAVE_AJUSTES);
    if (texto === null) return AJUSTES_POR_DEFECTO;
    const datos: unknown = JSON.parse(texto);
    return normalizar(datos) ?? AJUSTES_POR_DEFECTO;
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
