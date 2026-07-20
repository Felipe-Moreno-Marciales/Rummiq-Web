import { describe, expect, it } from 'vitest';
import { puntosDeCombinacion, puntuarRonda, valorAtril, valorFichaEnAtril } from './puntuacion';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaComodin, FichaNumero, NumeroFicha } from './tipos';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

describe('valorFichaEnAtril', () => {
  it('una ficha numérica vale su número', () => {
    expect(valorFichaEnAtril(ficha('rojo', 9))).toBe(9);
  });

  it('un comodín en el atril vale 30 puntos', () => {
    expect(valorFichaEnAtril(comodin())).toBe(30);
  });
});

describe('valorAtril', () => {
  it('suma el valor de todas las fichas', () => {
    expect(valorAtril([ficha('rojo', 9), ficha('azul', 4), comodin()])).toBe(43);
  });

  it('un atril vacío vale 0', () => {
    expect(valorAtril([])).toBe(0);
  });
});

describe('puntosDeCombinacion', () => {
  it('suma los números de un grupo', () => {
    expect(puntosDeCombinacion([ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)])).toBe(21);
  });

  it('cuenta el comodín por el número que representa en un grupo', () => {
    // 7, 7 y comodín (=7) -> 21
    expect(puntosDeCombinacion([ficha('rojo', 7), ficha('azul', 7), comodin()])).toBe(21);
  });

  it('cuenta el comodín por su posición en una escalera', () => {
    // 4, 5, 6 y comodín (=7) -> 22
    expect(
      puntosDeCombinacion([ficha('azul', 4), ficha('azul', 5), ficha('azul', 6), comodin()]),
    ).toBe(22);
  });

  it('devuelve null para una combinación inválida', () => {
    expect(puntosDeCombinacion([ficha('rojo', 4), ficha('azul', 8)])).toBeNull();
  });
});

describe('puntuarRonda', () => {
  it('reparte puntos cuando un jugador vacía su atril', () => {
    const resultado = puntuarRonda(
      [
        { idJugador: 'ana', atril: [] },
        { idJugador: 'beto', atril: [ficha('rojo', 9), ficha('azul', 4)] },
        { idJugador: 'caro', atril: [ficha('negro', 5)] },
      ],
      'atril-vacio',
      'ana',
    );
    expect(resultado.idGanador).toBe('ana');
    const ana = resultado.resultados.find((r) => r.idJugador === 'ana');
    const beto = resultado.resultados.find((r) => r.idJugador === 'beto');
    const caro = resultado.resultados.find((r) => r.idJugador === 'caro');
    expect(ana?.puntos).toBe(18); // 13 (beto) + 5 (caro)
    expect(beto?.puntos).toBe(-13);
    expect(caro?.puntos).toBe(-5);
    expect(ana?.esGanador).toBe(true);
  });

  it('cuenta los comodines restantes como 30 puntos', () => {
    const resultado = puntuarRonda(
      [
        { idJugador: 'ana', atril: [] },
        { idJugador: 'beto', atril: [comodin()] },
      ],
      'atril-vacio',
      'ana',
    );
    expect(resultado.resultados.find((r) => r.idJugador === 'ana')?.puntos).toBe(30);
    expect(resultado.resultados.find((r) => r.idJugador === 'beto')?.puntos).toBe(-30);
  });

  it('en un bloqueo gana quien tiene menor valor de atril', () => {
    const resultado = puntuarRonda(
      [
        { idJugador: 'ana', atril: [ficha('rojo', 9)] },
        { idJugador: 'beto', atril: [ficha('azul', 2)] },
        { idJugador: 'caro', atril: [ficha('negro', 5)] },
      ],
      'bloqueo',
    );
    expect(resultado.idGanador).toBe('beto');
    expect(resultado.resultados.find((r) => r.idJugador === 'beto')?.puntos).toBe(14); // 9 + 5
  });

  it('desempata el bloqueo por orden de la ronda (menor índice)', () => {
    const resultado = puntuarRonda(
      [
        { idJugador: 'ana', atril: [ficha('rojo', 5)] },
        { idJugador: 'beto', atril: [ficha('azul', 5)] },
      ],
      'bloqueo',
    );
    expect(resultado.idGanador).toBe('ana');
  });

  it('lanza error si falta el ganador con atril vacío', () => {
    expect(() => puntuarRonda([{ idJugador: 'ana', atril: [] }], 'atril-vacio')).toThrow();
  });

  it('lanza error si el ganador indicado no existe', () => {
    expect(() => puntuarRonda([{ idJugador: 'ana', atril: [] }], 'atril-vacio', 'zoe')).toThrow();
  });

  it('lanza error si no hay jugadores', () => {
    expect(() => puntuarRonda([], 'bloqueo')).toThrow();
  });
});
