import { describe, expect, it } from 'vitest';
import { evaluarApertura } from './apertura';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaComodin, FichaNumero, NumeroFicha } from './tipos';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

describe('evaluarApertura', () => {
  it('acepta una única combinación que llega a 30 puntos', () => {
    // 11 + 11 + 11 = 33
    const resultado = evaluarApertura([[ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)]]);
    expect(resultado.valida).toBe(true);
    expect(resultado.puntos).toBe(33);
    expect(resultado.cumpleMinimo).toBe(true);
  });

  it('suma varias combinaciones para alcanzar el mínimo', () => {
    // 5+6+7 = 18 y 4+4+4 = 12 -> 30
    const resultado = evaluarApertura([
      [ficha('azul', 5), ficha('azul', 6), ficha('azul', 7)],
      [ficha('rojo', 4), ficha('azul', 4), ficha('negro', 4)],
    ]);
    expect(resultado.puntos).toBe(30);
    expect(resultado.valida).toBe(true);
  });

  it('rechaza una apertura por debajo de 30 puntos', () => {
    const resultado = evaluarApertura([[ficha('rojo', 1), ficha('azul', 1), ficha('negro', 1)]]);
    expect(resultado.puntos).toBe(3);
    expect(resultado.cumpleMinimo).toBe(false);
    expect(resultado.valida).toBe(false);
  });

  it('cuenta el comodín por el número que representa', () => {
    // 10, 10 y comodín (=10) -> 30
    const resultado = evaluarApertura([[ficha('rojo', 10), ficha('azul', 10), comodin()]]);
    expect(resultado.puntos).toBe(30);
    expect(resultado.valida).toBe(true);
  });

  it('marca las combinaciones inválidas por su índice', () => {
    const resultado = evaluarApertura([
      [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11)],
      [ficha('rojo', 4), ficha('azul', 8)],
    ]);
    expect(resultado.combinacionesInvalidas).toEqual([1]);
    expect(resultado.valida).toBe(false);
  });

  it('una apertura sin combinaciones no es válida', () => {
    const resultado = evaluarApertura([]);
    expect(resultado.valida).toBe(false);
    expect(resultado.puntos).toBe(0);
  });
});
