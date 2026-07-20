import { describe, expect, it } from 'vitest';
import {
  cantidadPozo,
  combinacionesInvalidasActuales,
  esTurnoDe,
  infoOponentes,
  jugadorActual,
  tablaPosiciones,
} from './selectores';
import { crearPartida, reducir } from './motorJuego';
import type { Jugador } from './tiposMotor';

const JUGADORES: Jugador[] = [
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
  { id: 'beto', nombre: 'Beto', tipo: 'maquina', dificultad: 'facil' },
  { id: 'caro', nombre: 'Caro', tipo: 'humano' },
];

describe('selectores básicos', () => {
  const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'sel' });

  it('jugadorActual y esTurnoDe coinciden', () => {
    const actual = jugadorActual(estado);
    expect(actual).toBeDefined();
    expect(esTurnoDe(estado, actual!.id)).toBe(true);
  });

  it('cantidadPozo cuenta las fichas del pozo', () => {
    expect(cantidadPozo(estado)).toBe(estado.pozo.length);
  });

  it('infoOponentes oculta las fichas y solo expone la cantidad', () => {
    const info = infoOponentes(estado, 'ana');
    expect(info).toHaveLength(2);
    for (const oponente of info) {
      expect(oponente.cantidadFichas).toBe(14);
      expect(Object.keys(oponente)).not.toContain('atril');
      expect(Object.keys(oponente)).not.toContain('fichas');
    }
  });
});

describe('tablaPosiciones', () => {
  it('ordena por puntos de forma determinista', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 't' });
    const conPuntos = {
      ...estado,
      puntuaciones: { ana: 10, beto: 30, caro: 20 },
      rondasGanadas: { ana: 0, beto: 1, caro: 0 },
    };
    expect(tablaPosiciones(conPuntos).map((p) => p.id)).toEqual(['beto', 'caro', 'ana']);
  });
});

describe('combinacionesInvalidasActuales', () => {
  it('detecta la combinación inválida del trabajo provisional', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'inv' });
    const idActual = estado.ordenTurnos[estado.turnoActual]!;
    const dos = (estado.manos[idActual] ?? []).slice(0, 2);
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [{ id: 'x', fichas: dos }],
      atril: (estado.manos[idActual] ?? []).slice(2),
    });
    // Dos fichas nunca forman una combinación válida.
    expect(combinacionesInvalidasActuales(provisional)).toEqual([0]);
  });

  it('devuelve una lista vacía cuando no hay turno', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'nt' });
    expect(combinacionesInvalidasActuales({ ...estado, turno: null })).toEqual([]);
  });
});

describe('valores por defecto y desempates', () => {
  const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'def' });

  it('jugadorActual es indefinido si el índice de turno no corresponde a nadie', () => {
    expect(jugadorActual({ ...estado, turnoActual: 99 })).toBeUndefined();
  });

  it('usa valores por defecto cuando faltan entradas de estado', () => {
    const vacio = { ...estado, manos: {}, haAbierto: {}, puntuaciones: {}, rondasGanadas: {} };
    const info = infoOponentes(vacio, 'ana');
    expect(info[0]?.cantidadFichas).toBe(0);
    expect(info[0]?.haAbierto).toBe(false);
    expect(tablaPosiciones(vacio).every((p) => p.puntos === 0)).toBe(true);
  });

  it('tablaPosiciones desempata por rondas ganadas', () => {
    const conEmpate = {
      ...estado,
      puntuaciones: { ana: 10, beto: 10, caro: 10 },
      rondasGanadas: { ana: 0, beto: 2, caro: 1 },
    };
    expect(tablaPosiciones(conEmpate).map((p) => p.id)).toEqual(['beto', 'caro', 'ana']);
  });
});
