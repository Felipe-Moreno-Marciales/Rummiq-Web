import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CLAVE_PARTIDA,
  borrarPartida,
  cargarPartida,
  guardarPartida,
  hayPartidaGuardada,
} from './almacenamientoPartida';
import { crearPartida, reducir } from '@/dominio/juego/motorJuego';
import type { Jugador } from '@/dominio/juego/tiposMotor';

const JUGADORES: Jugador[] = [
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
  { id: 'beto', nombre: 'Beto', tipo: 'humano' },
];

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('almacenamiento de la partida', () => {
  it('guarda y recupera la partida conservando el estado confirmado', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 2, semilla: 'g' });
    expect(guardarPartida(estado)).toBe(true);

    const cargado = cargarPartida();
    expect(cargado).not.toBeNull();
    expect(cargado?.rondaActual).toBe(estado.rondaActual);
    expect(cargado?.manos.ana?.map((f) => f.id)).toEqual(estado.manos.ana?.map((f) => f.id));
    expect(cargado?.pozo).toHaveLength(estado.pozo.length);
    // Al reanudar, se reconstruye el turno.
    expect(cargado?.turno).not.toBeNull();
  });

  it('no persiste el trabajo provisional del turno', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'p' });
    const idActual = estado.ordenTurnos[estado.turnoActual]!;
    const provisional = reducir(estado, {
      tipo: 'ESTABLECER_PROVISIONAL',
      mesa: [{ id: 'x', fichas: (estado.manos[idActual] ?? []).slice(0, 3) }],
      atril: (estado.manos[idActual] ?? []).slice(3),
    });
    guardarPartida(provisional);
    const cargado = cargarPartida();
    // El trabajo provisional se descarta: la mesa vuelve a estar vacía.
    expect(cargado?.mesa).toHaveLength(0);
    expect(cargado?.turno?.atril).toHaveLength(14);
  });

  it('devuelve null si no hay partida guardada', () => {
    expect(cargarPartida()).toBeNull();
    expect(hayPartidaGuardada()).toBe(false);
  });

  it('maneja datos corruptos devolviendo null', () => {
    localStorage.setItem(CLAVE_PARTIDA, 'esto no es json {');
    expect(cargarPartida()).toBeNull();
  });

  it('rechaza datos con una versión de esquema desconocida', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'v' });
    localStorage.setItem(CLAVE_PARTIDA, JSON.stringify({ ...estado, turno: null, version: 999 }));
    expect(cargarPartida()).toBeNull();
  });

  it('rechaza datos con forma inválida', () => {
    localStorage.setItem(CLAVE_PARTIDA, JSON.stringify({ cualquier: 'cosa' }));
    expect(cargarPartida()).toBeNull();
  });

  it('borra la partida guardada', () => {
    const estado = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'b' });
    guardarPartida(estado);
    expect(hayPartidaGuardada()).toBe(true);
    borrarPartida();
    expect(hayPartidaGuardada()).toBe(false);
  });
});
