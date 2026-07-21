/**
 * Ayudantes puros para mover fichas entre el atril y las combinaciones de la
 * mesa durante un turno. Los usan tanto la interacción por selección/botones
 * como el arrastrar y soltar, y más adelante la IA.
 *
 * La conservación de fichas la garantiza el reductor del motor al establecer el
 * estado provisional; aquí solo se calcula la nueva disposición.
 */
import type { Combinacion } from './tiposMotor';
import type { Ficha, IdFicha } from './tipos';

/** Zonas editables durante el turno. */
export interface ZonasTurno {
  readonly mesa: readonly Combinacion[];
  readonly atril: readonly Ficha[];
}

/** Destino de un movimiento de fichas. */
export type Destino =
  | { readonly tipo: 'atril' }
  | { readonly tipo: 'nueva' }
  | { readonly tipo: 'combinacion'; readonly id: string; readonly indice?: number };

function sinVacias(mesa: readonly Combinacion[]): Combinacion[] {
  return mesa.filter((combinacion) => combinacion.fichas.length > 0);
}

/**
 * Mueve las fichas indicadas (en el orden dado) al destino, quitándolas de
 * donde estuvieran. Devuelve la nueva mesa y el nuevo atril.
 */
export function moverFichas(
  zonas: ZonasTurno,
  ids: readonly IdFicha[],
  destino: Destino,
): ZonasTurno {
  const seleccion = new Set(ids);

  const porId = new Map<IdFicha, Ficha>();
  for (const ficha of zonas.atril) porId.set(ficha.id, ficha);
  for (const combinacion of zonas.mesa) {
    for (const ficha of combinacion.fichas) porId.set(ficha.id, ficha);
  }
  const fichasMovidas = ids
    .map((id) => porId.get(id))
    .filter((ficha): ficha is Ficha => ficha !== undefined);

  const atrilRestante = zonas.atril.filter((ficha) => !seleccion.has(ficha.id));
  const mesaRestante = zonas.mesa.map((combinacion) => ({
    ...combinacion,
    fichas: combinacion.fichas.filter((ficha) => !seleccion.has(ficha.id)),
  }));

  if (destino.tipo === 'atril') {
    return { mesa: sinVacias(mesaRestante), atril: [...atrilRestante, ...fichasMovidas] };
  }

  if (destino.tipo === 'nueva') {
    return {
      mesa: sinVacias([...mesaRestante, { id: '', fichas: fichasMovidas }]),
      atril: atrilRestante,
    };
  }

  const mesaConDestino = mesaRestante.map((combinacion) => {
    if (combinacion.id !== destino.id) return combinacion;
    const fichas = [...combinacion.fichas];
    const indice = destino.indice ?? fichas.length;
    fichas.splice(Math.max(0, Math.min(indice, fichas.length)), 0, ...fichasMovidas);
    return { ...combinacion, fichas };
  });
  return { mesa: sinVacias(mesaConDestino), atril: atrilRestante };
}
