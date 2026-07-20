/**
 * Barajado determinista mediante Fisher-Yates y un generador de números
 * pseudoaleatorios (PRNG) con semilla opcional para pruebas reproducibles.
 *
 * El algoritmo del PRNG (mulberry32, con derivación de semilla estilo xmur3)
 * es una implementación propia y pública; no depende de recursos externos.
 */

/** Función que devuelve un número pseudoaleatorio en el rango [0, 1). */
export type FuncionAleatoria = () => number;

/**
 * Deriva una semilla numérica de 32 bits a partir de una cadena.
 * Implementación estilo xmur3.
 */
function derivarSemilla(semilla: string): number {
  let h = 1779033703 ^ semilla.length;
  for (let i = 0; i < semilla.length; i += 1) {
    h = Math.imul(h ^ semilla.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Crea un PRNG determinista a partir de una semilla numérica o de texto.
 * La misma semilla produce siempre la misma secuencia (mulberry32).
 */
export function crearGeneradorAleatorio(semilla: number | string): FuncionAleatoria {
  let estado = (typeof semilla === 'number' ? semilla : derivarSemilla(semilla)) >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Devuelve una copia barajada del arreglo usando el algoritmo Fisher-Yates.
 *
 * No muta el arreglo original. Si no se proporciona una función aleatoria,
 * usa `Math.random`; para pruebas reproducibles, pásale
 * `crearGeneradorAleatorio(semilla)`.
 */
export function barajar<T>(
  elementos: readonly T[],
  aleatorio: FuncionAleatoria = Math.random,
): T[] {
  const resultado = [...elementos];
  for (let i = resultado.length - 1; i > 0; i -= 1) {
    const j = Math.floor(aleatorio() * (i + 1));
    const temporal = resultado[i]!;
    resultado[i] = resultado[j]!;
    resultado[j] = temporal;
  }
  return resultado;
}
