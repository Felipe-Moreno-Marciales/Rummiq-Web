/**
 * Jugador controlado por la máquina (IA local basada en heurísticas).
 *
 * Principios:
 * - Solo usa la mano propia y la mesa pública; nunca conoce las fichas ocultas
 *   de los oponentes.
 * - Nunca genera estados ilegales: cada combinación candidata se valida con el
 *   validador real (`interpretarCombinacion`) antes de usarse, y la jugada final
 *   pasa por la confirmación del motor. Si algo fallara, la IA roba o pasa.
 * - La búsqueda está acotada por un presupuesto de nodos por dificultad, de modo
 *   que el cálculo es breve y no bloquea la interfaz.
 *
 * Dificultades:
 * - Fácil: búsqueda muy corta; baja la primera jugada razonable; no reorganiza
 *   la mesa.
 * - Media: busca mejores repartos y añade fichas a combinaciones existentes.
 * - Difícil: búsqueda más amplia, prioriza vaciar el atril y aprovechar los
 *   comodines.
 */
import { PUNTOS_MINIMOS_APERTURA } from './constantes';
import { esComodin, esFichaNumero } from './validadores';
import { interpretarCombinacion } from './reglasComodines';
import { puntosDeCombinacion } from './puntuacion';
import { reducir } from './motorJuego';
import type { Combinacion, Dificultad, EstadoJuego } from './tiposMotor';
import type { Ficha, FichaNumero, IdFicha } from './tipos';

/** Plan de la IA para el turno. */
export type PlanBot =
  | { readonly tipo: 'jugar'; readonly mesa: Combinacion[]; readonly atril: Ficha[] }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'pasar' };

const PRESUPUESTO_NODOS: Record<Dificultad, number> = {
  facil: 120,
  media: 900,
  dificil: 2500,
};

type Objetivo = 'puntos' | 'fichas';

interface Reparto {
  readonly melds: readonly Ficha[][];
  readonly fichas: number;
  readonly puntos: number;
}

function puntosMeld(meld: readonly Ficha[]): number {
  return puntosDeCombinacion(meld) ?? 0;
}

function subconjuntos<T>(elementos: readonly T[]): T[][] {
  const resultado: T[][] = [[]];
  for (const elemento of elementos) {
    const n = resultado.length;
    for (let i = 0; i < n; i += 1) resultado.push([...resultado[i]!, elemento]);
  }
  return resultado;
}

/** Combinaciones de tipo grupo que incluyen la ficha pivote. */
function gruposCon(pivote: FichaNumero, disponibles: readonly Ficha[]): Ficha[][] {
  const comodines = disponibles.filter(esComodin);
  const porColor = new Map<string, FichaNumero>();
  for (const ficha of disponibles) {
    if (
      esFichaNumero(ficha) &&
      ficha.numero === pivote.numero &&
      ficha.id !== pivote.id &&
      !porColor.has(ficha.color)
    ) {
      porColor.set(ficha.color, ficha);
    }
  }
  const otros = [...porColor.values()];
  const candidatos: Ficha[][] = [];
  for (const subconjunto of subconjuntos(otros)) {
    for (let comodinesUsados = 0; comodinesUsados <= comodines.length; comodinesUsados += 1) {
      const tamano = 1 + subconjunto.length + comodinesUsados;
      if (tamano < 3 || tamano > 4) continue;
      const meld = [pivote, ...subconjunto, ...comodines.slice(0, comodinesUsados)];
      if (interpretarCombinacion(meld).valida) candidatos.push(meld);
    }
  }
  return candidatos;
}

/** Combinaciones de tipo escalera que incluyen la ficha pivote. */
function escalerasCon(pivote: FichaNumero, disponibles: readonly Ficha[]): Ficha[][] {
  const color = pivote.color;
  const comodines = disponibles.filter(esComodin);
  const porNumero = new Map<number, FichaNumero>();
  for (const ficha of disponibles) {
    if (esFichaNumero(ficha) && ficha.color === color && !porNumero.has(ficha.numero)) {
      porNumero.set(ficha.numero, ficha);
    }
  }
  porNumero.set(pivote.numero, pivote);

  const candidatos: Ficha[][] = [];
  for (let inicio = Math.max(1, pivote.numero - 12); inicio <= pivote.numero; inicio += 1) {
    for (let fin = inicio + 2; fin <= 13; fin += 1) {
      if (pivote.numero < inicio || pivote.numero > fin) continue;
      const meld: Ficha[] = [];
      let comodinesUsados = 0;
      let posible = true;
      for (let n = inicio; n <= fin; n += 1) {
        const ficha = porNumero.get(n);
        if (ficha) {
          meld.push(ficha);
        } else if (comodinesUsados < comodines.length) {
          meld.push(comodines[comodinesUsados]!);
          comodinesUsados += 1;
        } else {
          posible = false;
          break;
        }
      }
      if (posible && interpretarCombinacion(meld).valida) candidatos.push(meld);
    }
  }
  return candidatos;
}

function quitar(fichas: readonly Ficha[], meld: readonly Ficha[]): Ficha[] {
  const ids = new Set(meld.map((f) => f.id));
  return fichas.filter((f) => !ids.has(f.id));
}

function mejor(a: Reparto, b: Reparto, objetivo: Objetivo): Reparto {
  if (objetivo === 'puntos') {
    if (b.puntos !== a.puntos) return b.puntos > a.puntos ? b : a;
    return b.fichas > a.fichas ? b : a;
  }
  if (b.fichas !== a.fichas) return b.fichas > a.fichas ? b : a;
  return b.puntos > a.puntos ? b : a;
}

/** Busca el mejor reparto de la mano en combinaciones válidas (nuevas). */
function mejorReparto(mano: readonly Ficha[], maxNodos: number, objetivo: Objetivo): Reparto {
  let resultado: Reparto = { melds: [], fichas: 0, puntos: 0 };
  let nodos = 0;

  function explorar(restantes: readonly Ficha[], acum: Reparto): void {
    nodos += 1;
    if (nodos > maxNodos) return;
    resultado = mejor(resultado, acum, objetivo);

    const indicePivote = restantes.findIndex(esFichaNumero);
    if (indicePivote < 0) return;
    const pivote = restantes[indicePivote] as FichaNumero;

    const candidatos = [...gruposCon(pivote, restantes), ...escalerasCon(pivote, restantes)];
    for (const meld of candidatos) {
      if (nodos > maxNodos) return;
      explorar(quitar(restantes, meld), {
        melds: [...acum.melds, meld],
        fichas: acum.fichas + meld.length,
        puntos: acum.puntos + puntosMeld(meld),
      });
    }
    // Opción de no usar el pivote (dejarlo en el atril).
    explorar(
      restantes.filter((f) => f.id !== pivote.id),
      acum,
    );
  }

  explorar(mano, { melds: [], fichas: 0, puntos: 0 });
  return resultado;
}

/** Intenta añadir las fichas sobrantes a combinaciones existentes de la mesa. */
function anadirAMesa(
  mesa: readonly Combinacion[],
  atril: readonly Ficha[],
): {
  mesa: Combinacion[];
  atril: Ficha[];
} {
  const mesaX: Combinacion[] = mesa.map((c) => ({ ...c, fichas: [...c.fichas] }));
  const sobrantes = [...atril];

  let progreso = true;
  while (progreso) {
    progreso = false;
    for (let i = 0; i < sobrantes.length && !progreso; i += 1) {
      const ficha = sobrantes[i]!;
      for (let m = 0; m < mesaX.length && !progreso; m += 1) {
        const actual = mesaX[m]!;
        const candidatos = [
          [...actual.fichas, ficha],
          [ficha, ...actual.fichas],
        ];
        for (const candidato of candidatos) {
          if (interpretarCombinacion(candidato).valida) {
            mesaX[m] = { ...actual, fichas: candidato };
            sobrantes.splice(i, 1);
            progreso = true;
            break;
          }
        }
      }
    }
  }

  return { mesa: mesaX, atril: sobrantes };
}

function idsUsadas(melds: readonly Ficha[][]): Set<IdFicha> {
  const ids = new Set<IdFicha>();
  for (const meld of melds) for (const ficha of meld) ids.add(ficha.id);
  return ids;
}

function comoCombinaciones(melds: readonly Ficha[][]): Combinacion[] {
  return melds.map((fichas) => ({ id: '', fichas }));
}

/** Decide la jugada de la máquina para el turno actual (función pura). */
export function planificarJugada(estado: EstadoJuego): PlanBot {
  const id = estado.ordenTurnos[estado.turnoActual];
  if (id === undefined || estado.fase !== 'jugando') {
    return estado.pozo.length > 0 ? { tipo: 'robar' } : { tipo: 'pasar' };
  }
  const jugador = estado.jugadores.find((j) => j.id === id);
  const dificultad: Dificultad = jugador?.dificultad ?? 'media';
  const maxNodos = PRESUPUESTO_NODOS[dificultad];
  const mano = estado.manos[id] ?? [];
  const abierto = estado.haAbierto[id] ?? false;

  const robarOPasar: PlanBot = estado.pozo.length > 0 ? { tipo: 'robar' } : { tipo: 'pasar' };

  if (!abierto) {
    const reparto = mejorReparto(mano, maxNodos, 'puntos');
    if (reparto.puntos >= PUNTOS_MINIMOS_APERTURA && reparto.melds.length > 0) {
      const usadas = idsUsadas(reparto.melds);
      return {
        tipo: 'jugar',
        mesa: [...estado.mesa, ...comoCombinaciones(reparto.melds)],
        atril: mano.filter((f) => !usadas.has(f.id)),
      };
    }
    return robarOPasar;
  }

  const reparto = mejorReparto(mano, maxNodos, 'fichas');
  const usadas = idsUsadas(reparto.melds);
  let mesa: Combinacion[] = [...estado.mesa, ...comoCombinaciones(reparto.melds)];
  let atril = mano.filter((f) => !usadas.has(f.id));

  if (dificultad !== 'facil') {
    const resultado = anadirAMesa(mesa, atril);
    mesa = resultado.mesa;
    atril = resultado.atril;
  }

  if (atril.length < mano.length) {
    return { tipo: 'jugar', mesa, atril };
  }
  return robarOPasar;
}

/**
 * Aplica la jugada de la máquina y devuelve el nuevo estado. Si la confirmación
 * fallara por cualquier motivo, la IA roba o pasa, garantizando un estado legal.
 */
export function aplicarJugadaBot(estado: EstadoJuego): EstadoJuego {
  const plan = planificarJugada(estado);

  if (plan.tipo === 'jugar') {
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: plan.mesa,
      atril: plan.atril,
    });
    const confirmado = reducir(provisional, { tipo: 'CONFIRMAR' });
    if (confirmado.ultimoError === null) return confirmado;
    // Reserva: si algo no cuadró, robar o pasar.
    return estado.pozo.length > 0
      ? reducir(estado, { tipo: 'ROBAR' })
      : reducir(estado, { tipo: 'PASAR' });
  }

  return plan.tipo === 'robar'
    ? reducir(estado, { tipo: 'ROBAR' })
    : reducir(estado, { tipo: 'PASAR' });
}
