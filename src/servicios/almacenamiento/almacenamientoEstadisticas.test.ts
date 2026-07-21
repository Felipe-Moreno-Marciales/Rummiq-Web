import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ESTADISTICAS_VACIAS,
  borrarEstadisticas,
  cargarEstadisticas,
  registrarPartida,
  type ResumenPartida,
} from './almacenamientoEstadisticas';

const RESUMEN: ResumenPartida = {
  ganador: 'Ana',
  jugadores: [
    { nombre: 'Ana', puntos: 30 },
    { nombre: 'Beto', puntos: -30 },
  ],
  rondas: 3,
};

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('almacenamiento de estadísticas', () => {
  it('parte de estadísticas vacías', () => {
    expect(cargarEstadisticas()).toEqual(ESTADISTICAS_VACIAS);
  });

  it('registra una partida y acumula totales', () => {
    registrarPartida(RESUMEN);
    const estadisticas = registrarPartida(RESUMEN);
    expect(estadisticas.partidasCompletadas).toBe(2);
    expect(estadisticas.rondasJugadas).toBe(6);
    expect(estadisticas.historial).toHaveLength(2);
    expect(estadisticas.historial[0]?.ganador).toBe('Ana');
  });

  it('mantiene el historial acotado a 20 partidas', () => {
    for (let i = 0; i < 25; i += 1) registrarPartida(RESUMEN);
    expect(cargarEstadisticas().historial).toHaveLength(20);
  });

  it('borra las estadísticas', () => {
    registrarPartida(RESUMEN);
    borrarEstadisticas();
    expect(cargarEstadisticas()).toEqual(ESTADISTICAS_VACIAS);
  });
});
