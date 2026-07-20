import { describe, expect, it } from 'vitest';
import {
  crearPartida,
  estadoParaGuardar,
  evaluarConfirmacion,
  ordenarFichas,
  reanudarPartida,
  reducir,
} from './motorJuego';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import { FICHAS_INICIALES_POR_JUGADOR, TOTAL_FICHAS } from './constantes';
import type { ColorFicha, CopiaFicha, FichaComodin, FichaNumero, NumeroFicha } from './tipos';
import type { Combinacion, EstadoJuego, Jugador } from './tiposMotor';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

function combinacion(
  id: string,
  fichas: FichaNumero[] | (FichaNumero | FichaComodin)[],
): Combinacion {
  return { id, fichas };
}

const DOS_JUGADORES: Jugador[] = [
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
  { id: 'beto', nombre: 'Beto', tipo: 'humano' },
];

interface Opciones {
  readonly mesa?: Combinacion[];
  readonly pozo?: FichaNumero[];
  readonly haAbierto?: Record<string, boolean>;
  readonly turnoActual?: number;
  readonly rondas?: number;
  readonly rondaActual?: number;
  readonly jugadores?: Jugador[];
}

/** Construye un estado de prueba en fase «jugando» con manos controladas. */
function estadoDePrueba(
  manos: Record<string, (FichaNumero | FichaComodin)[]>,
  opciones: Opciones = {},
): EstadoJuego {
  const jugadores = opciones.jugadores ?? DOS_JUGADORES;
  const haAbierto: Record<string, boolean> = {};
  for (const j of jugadores) haAbierto[j.id] = opciones.haAbierto?.[j.id] ?? false;
  const base: EstadoJuego = {
    version: 1,
    config: { jugadores, rondas: opciones.rondas ?? 1, semilla: 'prueba' },
    jugadores,
    semilla: 'prueba',
    rondaActual: opciones.rondaActual ?? 1,
    fase: 'jugando',
    mesa: opciones.mesa ?? [],
    pozo: opciones.pozo ?? [],
    manos,
    haAbierto,
    ordenTurnos: jugadores.map((j) => j.id),
    turnoActual: opciones.turnoActual ?? 0,
    pasesConsecutivos: 0,
    turno: null,
    puntuaciones: Object.fromEntries(jugadores.map((j) => [j.id, 0])),
    rondasGanadas: Object.fromEntries(jugadores.map((j) => [j.id, 0])),
    historialRondas: [],
    resultadoRonda: null,
    contadorCombinacion: 0,
    ultimoError: null,
  };
  return reanudarPartida(base);
}

describe('crearPartida', () => {
  it('reparte 14 fichas a cada jugador y el resto al pozo', () => {
    const estado = crearPartida({ jugadores: DOS_JUGADORES, rondas: 3, semilla: 'x' });
    expect(estado.manos.ana).toHaveLength(FICHAS_INICIALES_POR_JUGADOR);
    expect(estado.manos.beto).toHaveLength(FICHAS_INICIALES_POR_JUGADOR);
    expect(estado.pozo).toHaveLength(TOTAL_FICHAS - 2 * FICHAS_INICIALES_POR_JUGADOR);
    expect(estado.fase).toBe('jugando');
    expect(estado.turno).not.toBeNull();
  });

  it('es reproducible con la misma semilla', () => {
    const a = crearPartida({ jugadores: DOS_JUGADORES, rondas: 1, semilla: 'misma' });
    const b = crearPartida({ jugadores: DOS_JUGADORES, rondas: 1, semilla: 'misma' });
    expect(a.manos.ana?.map((f) => f.id)).toEqual(b.manos.ana?.map((f) => f.id));
    expect(a.turnoActual).toBe(b.turnoActual);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(() => crearPartida({ jugadores: [DOS_JUGADORES[0]!], rondas: 1 })).toThrow();
    expect(() => crearPartida({ jugadores: DOS_JUGADORES, rondas: 0 })).toThrow();
  });
});

describe('ordenarFichas', () => {
  it('ordena por número y coloca los comodines al final', () => {
    const ordenadas = ordenarFichas([ficha('azul', 5), comodin(), ficha('rojo', 2)], 'numero');
    expect(ordenadas.map((f) => f.id)).toEqual(['rojo-2-a', 'azul-5-a', 'comodin-a']);
  });

  it('ordena por color', () => {
    const ordenadas = ordenarFichas([ficha('negro', 2), ficha('rojo', 9)], 'color');
    expect(ordenadas.map((f) => f.id)).toEqual(['rojo-9-a', 'negro-2-a']);
  });
});

describe('ESTABLECER_PROVISIONAL', () => {
  it('permite mover fichas del atril a una combinación nueva', () => {
    const estado = estadoDePrueba({
      ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
      beto: [ficha('rojo', 5)],
    });
    const siguiente = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('nueva', estado.manos.ana as FichaNumero[])],
      atril: [],
    });
    expect(siguiente.ultimoError).toBeNull();
    expect(siguiente.turno?.mesa).toHaveLength(1);
    expect(siguiente.turno?.atril).toHaveLength(0);
  });

  it('rechaza un movimiento que no conserva las fichas', () => {
    const estado = estadoDePrueba({ ana: [ficha('rojo', 5)], beto: [] });
    const siguiente = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('x', [ficha('rojo', 9)])], // ficha inexistente en el turno
      atril: [ficha('rojo', 5)],
    });
    expect(siguiente.ultimoError?.codigo).toBe('conservacion-fichas');
  });
});

describe('CONFIRMAR — apertura', () => {
  function bajarGrupo(estado: EstadoJuego): EstadoJuego {
    return reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('g', estado.manos.ana as FichaNumero[])],
      atril: [],
    });
  }

  it('acepta una apertura de al menos 30 puntos y marca al jugador como abierto', () => {
    // Ana conserva una ficha para que el turno avance en vez de terminar la ronda.
    const estado = estadoDePrueba(
      {
        ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11), ficha('rojo', 2)],
        beto: [ficha('rojo', 5)],
      },
      { rondas: 2 },
    );
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('g', [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)])],
      atril: [ficha('rojo', 2)],
    });
    const confirmado = reducir(provisional, { tipo: 'CONFIRMAR' });
    expect(confirmado.ultimoError).toBeNull();
    expect(confirmado.haAbierto.ana).toBe(true);
    expect(confirmado.turnoActual).toBe(1); // avanzó el turno
    expect(confirmado.manos.ana).toHaveLength(1);
  });

  it('rechaza una apertura por debajo de 30 puntos', () => {
    const estado = estadoDePrueba({
      ana: [ficha('rojo', 1), ficha('azul', 1), ficha('negro', 1)],
      beto: [ficha('rojo', 5)],
    });
    const confirmado = reducir(bajarGrupo(estado), { tipo: 'CONFIRMAR' });
    expect(confirmado.ultimoError?.codigo).toBe('apertura-insuficiente');
    expect(confirmado.haAbierto.ana).toBe(false);
    expect(confirmado.turnoActual).toBe(0); // no avanzó
  });

  it('impide modificar la mesa antes de abrir', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 8)], beto: [] },
      { mesa: [combinacion('m', [ficha('rojo', 5), ficha('rojo', 6), ficha('rojo', 7)])] },
    );
    // Ana añade su ficha a la combinación existente sin haber abierto.
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [
        combinacion('m', [ficha('rojo', 5), ficha('rojo', 6), ficha('rojo', 7), ficha('rojo', 8)]),
      ],
      atril: [],
    });
    const confirmado = reducir(provisional, { tipo: 'CONFIRMAR' });
    expect(confirmado.ultimoError?.codigo).toBe('apertura-modifica-mesa');
  });
});

describe('CONFIRMAR — restricciones generales', () => {
  it('no permite confirmar sin cambios', () => {
    const estado = estadoDePrueba({ ana: [ficha('rojo', 5)], beto: [] });
    expect(reducir(estado, { tipo: 'CONFIRMAR' }).ultimoError?.codigo).toBe('sin-cambios');
  });

  it('exige jugar al menos una ficha (no solo reorganizar la mesa)', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 1)], beto: [] },
      {
        haAbierto: { ana: true },
        mesa: [
          combinacion('a', [ficha('rojo', 3), ficha('rojo', 4), ficha('rojo', 5)]),
          combinacion('b', [ficha('rojo', 6), ficha('rojo', 7), ficha('rojo', 8)]),
        ],
      },
    );
    // Fusiona ambas escaleras en una sola sin jugar ninguna ficha del atril.
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [
        combinacion('c', [
          ficha('rojo', 3),
          ficha('rojo', 4),
          ficha('rojo', 5),
          ficha('rojo', 6),
          ficha('rojo', 7),
          ficha('rojo', 8),
        ]),
      ],
      atril: [ficha('rojo', 1)],
    });
    expect(reducir(provisional, { tipo: 'CONFIRMAR' }).ultimoError?.codigo).toBe('sin-jugar-ficha');
  });

  it('bloquea la confirmación si la mesa tiene combinaciones inválidas', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 1), ficha('azul', 9)], beto: [] },
      { haAbierto: { ana: true } },
    );
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('x', [ficha('rojo', 1), ficha('azul', 9)])],
      atril: [],
    });
    const confirmado = reducir(provisional, { tipo: 'CONFIRMAR' });
    expect(confirmado.ultimoError?.codigo).toBe('mesa-invalida');
    expect(confirmado.ultimoError?.combinacionesInvalidas).toEqual([0]);
  });

  it('no permite que un comodín recuperado quede en el atril', () => {
    const estado = estadoDePrueba(
      {
        ana: [ficha('rojo', 6), ficha('azul', 7), ficha('azul', 8), ficha('azul', 9)],
        beto: [],
      },
      {
        haAbierto: { ana: true },
        mesa: [combinacion('m', [ficha('rojo', 4), ficha('rojo', 5), comodin('a')])],
      },
    );
    // Sustituye el comodín (=rojo 6) por la ficha real y baja otra escalera,
    // pero deja el comodín en el atril.
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [
        combinacion('m', [ficha('rojo', 4), ficha('rojo', 5), ficha('rojo', 6)]),
        combinacion('n', [ficha('azul', 7), ficha('azul', 8), ficha('azul', 9)]),
      ],
      atril: [comodin('a')],
    });
    expect(reducir(provisional, { tipo: 'CONFIRMAR' }).ultimoError?.codigo).toBe(
      'comodin-no-reubicado',
    );
  });
});

describe('DESHACER_TURNO', () => {
  it('restaura la instantánea del inicio del turno', () => {
    const estado = estadoDePrueba({
      ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
      beto: [],
    });
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('g', estado.manos.ana as FichaNumero[])],
      atril: [],
    });
    const deshecho = reducir(provisional, { tipo: 'DESHACER_TURNO' });
    expect(deshecho.turno?.mesa).toHaveLength(0);
    expect(deshecho.turno?.atril).toHaveLength(3);
  });
});

describe('ROBAR', () => {
  it('roba una ficha del pozo y termina el turno', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 5)], beto: [ficha('azul', 3)] },
      { pozo: [ficha('negro', 9)] },
    );
    const siguiente = reducir(estado, { tipo: 'ROBAR' });
    expect(siguiente.manos.ana).toHaveLength(2);
    expect(siguiente.pozo).toHaveLength(0);
    expect(siguiente.turnoActual).toBe(1);
  });

  it('no permite robar con el pozo vacío', () => {
    const estado = estadoDePrueba({ ana: [ficha('rojo', 5)], beto: [] }, { pozo: [] });
    const siguiente = reducir(estado, { tipo: 'ROBAR' });
    expect(siguiente.ultimoError?.codigo).toBe('pozo-vacio');
    expect(siguiente.turnoActual).toBe(0);
  });
});

describe('PASAR y bloqueo', () => {
  it('no permite pasar si aún hay fichas en el pozo', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 5)], beto: [] },
      { pozo: [ficha('negro', 9)] },
    );
    expect(reducir(estado, { tipo: 'PASAR' }).ultimoError?.codigo).toBe('no-permitido');
  });

  it('termina la ronda por bloqueo cuando todos pasan con el pozo vacío', () => {
    const estado = estadoDePrueba(
      { ana: [ficha('rojo', 9)], beto: [ficha('azul', 2)] },
      { pozo: [] },
    );
    const trasAna = reducir(estado, { tipo: 'PASAR' });
    expect(trasAna.fase).toBe('jugando');
    expect(trasAna.turnoActual).toBe(1);
    const trasBeto = reducir(trasAna, { tipo: 'PASAR' });
    expect(trasBeto.fase).toBe('fin-partida');
    expect(trasBeto.resultadoRonda?.motivo).toBe('bloqueo');
    expect(trasBeto.resultadoRonda?.idGanador).toBe('beto'); // menor valor de atril
  });
});

describe('fin de ronda por atril vacío y varias rondas', () => {
  it('termina la partida cuando un jugador vacía su atril en la última ronda', () => {
    const estado = estadoDePrueba(
      {
        ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
        beto: [ficha('rojo', 5), ficha('azul', 6)],
      },
      { rondas: 1 },
    );
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('g', estado.manos.ana as FichaNumero[])],
      atril: [],
    });
    const fin = reducir(provisional, { tipo: 'CONFIRMAR' });
    expect(fin.fase).toBe('fin-partida');
    expect(fin.resultadoRonda?.idGanador).toBe('ana');
    expect(fin.puntuaciones.ana).toBe(11); // 5 + 6 de Beto
    expect(fin.puntuaciones.beto).toBe(-11);
    expect(fin.rondasGanadas.ana).toBe(1);
  });

  it('pasa a la siguiente ronda y conserva la puntuación acumulada', () => {
    const estado = estadoDePrueba(
      {
        ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
        beto: [ficha('rojo', 5)],
      },
      { rondas: 2 },
    );
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [combinacion('g', estado.manos.ana as FichaNumero[])],
      atril: [],
    });
    const finRonda = reducir(provisional, { tipo: 'CONFIRMAR' });
    expect(finRonda.fase).toBe('fin-ronda');
    const ronda2 = reducir(finRonda, { tipo: 'SIGUIENTE_RONDA' });
    expect(ronda2.fase).toBe('jugando');
    expect(ronda2.rondaActual).toBe(2);
    expect(ronda2.puntuaciones.ana).toBe(5); // se conserva
    expect(ronda2.manos.ana).toHaveLength(FICHAS_INICIALES_POR_JUGADOR);
  });

  it('REINICIAR_RONDA vuelve a repartir la ronda actual', () => {
    const estado = crearPartida({ jugadores: DOS_JUGADORES, rondas: 2, semilla: 'r' });
    const reiniciada = reducir(estado, { tipo: 'REINICIAR_RONDA' });
    expect(reiniciada.rondaActual).toBe(1);
    expect(reiniciada.manos.ana).toHaveLength(FICHAS_INICIALES_POR_JUGADOR);
    // Misma semilla y ronda -> mismo reparto.
    expect(reiniciada.manos.ana?.map((f) => f.id)).toEqual(estado.manos.ana?.map((f) => f.id));
  });
});

describe('evaluarConfirmacion', () => {
  it('devuelve no permitido si no hay turno', () => {
    const estado = estadoDePrueba({ ana: [], beto: [] });
    const sinTurno = { ...estado, turno: null };
    expect(evaluarConfirmacion(sinTurno).permitida).toBe(false);
  });
});

describe('casos límite del reductor', () => {
  const enJuego = (): EstadoJuego => estadoDePrueba({ ana: [ficha('rojo', 5)], beto: [] });
  const sinTurno = (): EstadoJuego => ({ ...enJuego(), turno: null });
  const finPartida = (): EstadoJuego => ({ ...enJuego(), fase: 'fin-partida', turno: null });

  it('ORDENAR_ATRIL sin turno no está permitido', () => {
    expect(
      reducir(sinTurno(), { tipo: 'ORDENAR_ATRIL', criterio: 'numero' }).ultimoError?.codigo,
    ).toBe('no-permitido');
  });

  it('DESHACER_TURNO sin turno no está permitido', () => {
    expect(reducir(sinTurno(), { tipo: 'DESHACER_TURNO' }).ultimoError?.codigo).toBe(
      'no-permitido',
    );
  });

  it('ESTABLECER_PROVISIONAL fuera de la fase de juego no está permitido', () => {
    expect(
      reducir(finPartida(), { tipo: 'ESTABLECER_PROVISIONAL', mesa: [], atril: [] }).ultimoError
        ?.codigo,
    ).toBe('no-permitido');
  });

  it('ROBAR y PASAR fuera de la fase de juego no están permitidos', () => {
    expect(reducir(finPartida(), { tipo: 'ROBAR' }).ultimoError?.codigo).toBe('no-permitido');
    expect(reducir(finPartida(), { tipo: 'PASAR' }).ultimoError?.codigo).toBe('no-permitido');
  });

  it('CONFIRMAR sin turno no está permitido', () => {
    expect(reducir(sinTurno(), { tipo: 'CONFIRMAR' }).ultimoError?.codigo).toBe('no-permitido');
  });

  it('SIGUIENTE_RONDA en fase incorrecta no está permitido', () => {
    expect(reducir(enJuego(), { tipo: 'SIGUIENTE_RONDA' }).ultimoError?.codigo).toBe(
      'no-permitido',
    );
  });

  it('ESTABLECER_PROVISIONAL descarta combinaciones vacías y asigna identificadores', () => {
    const estado = estadoDePrueba({
      ana: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
      beto: [],
    });
    const resultado = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [
        { id: '', fichas: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)] },
        { id: '', fichas: [] },
      ],
      atril: [],
    });
    expect(resultado.turno?.mesa).toHaveLength(1);
    expect(resultado.turno?.mesa[0]?.id).toBeTruthy();
  });

  it('reanudarPartida no modifica un estado que no está en juego', () => {
    expect(reanudarPartida(finPartida()).turno).toBeNull();
  });

  it('estadoParaGuardar elimina el turno y el último error', () => {
    const guardable = estadoParaGuardar(enJuego());
    expect(guardable.turno).toBeNull();
    expect(guardable.ultimoError).toBeNull();
  });
});
