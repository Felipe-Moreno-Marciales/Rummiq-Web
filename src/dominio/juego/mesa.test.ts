import { describe, expect, it } from 'vitest';
import { idsDuplicados, validarMesa } from './mesa';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaComodin, FichaNumero, NumeroFicha } from './tipos';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

describe('validarMesa', () => {
  it('una mesa vacía es válida', () => {
    expect(validarMesa([])).toEqual({ valida: true, combinacionesInvalidas: [] });
  });

  it('acepta una mesa con todas las combinaciones válidas', () => {
    const resultado = validarMesa([
      [ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)],
      [ficha('azul', 4), ficha('azul', 5), ficha('azul', 6)],
    ]);
    expect(resultado.valida).toBe(true);
  });

  it('identifica las combinaciones inválidas por su índice', () => {
    const resultado = validarMesa([
      [ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)],
      [ficha('azul', 4), ficha('azul', 6)], // ficha suelta / inválida
      [ficha('rojo', 1), ficha('azul', 2)], // inválida
    ]);
    expect(resultado.valida).toBe(false);
    expect(resultado.combinacionesInvalidas).toEqual([1, 2]);
  });
});

describe('idsDuplicados', () => {
  it('no encuentra duplicados cuando cada ficha está en una sola zona', () => {
    expect(idsDuplicados([[ficha('rojo', 7)], [ficha('azul', 7)], [comodin('a')]])).toEqual([]);
  });

  it('detecta una ficha presente en dos zonas', () => {
    const repetida = ficha('rojo', 7);
    expect(idsDuplicados([[repetida], [repetida]])).toEqual(['rojo-7-a']);
  });

  it('detecta duplicados dentro de una misma zona', () => {
    const repetida = comodin('a');
    expect(idsDuplicados([[repetida, repetida]])).toEqual(['comodin-a']);
  });
});
