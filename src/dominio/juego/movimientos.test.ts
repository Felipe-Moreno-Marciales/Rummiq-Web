import { describe, expect, it } from 'vitest';
import { moverFichas, type ZonasTurno } from './movimientos';
import { idFichaNumero } from './crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, Ficha, FichaNumero, NumeroFicha } from './tipos';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

/** Números de una lista de fichas (los comodines cuentan como 0 en las pruebas). */
function numeros(fichas: readonly Ficha[] | undefined): number[] {
  return (fichas ?? []).map((f) => (f.tipo === 'numero' ? f.numero : 0));
}

describe('moverFichas', () => {
  it('crea una combinación nueva con las fichas del atril', () => {
    const zonas: ZonasTurno = {
      mesa: [],
      atril: [ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)],
    };
    const resultado = moverFichas(zonas, ['rojo-7-a', 'azul-7-a', 'negro-7-a'], { tipo: 'nueva' });
    expect(resultado.atril).toHaveLength(0);
    expect(resultado.mesa).toHaveLength(1);
    expect(resultado.mesa[0]?.fichas.map((f) => f.id)).toEqual([
      'rojo-7-a',
      'azul-7-a',
      'negro-7-a',
    ]);
  });

  it('respeta el orden de selección al crear la combinación', () => {
    const zonas: ZonasTurno = {
      mesa: [],
      atril: [ficha('rojo', 3), ficha('rojo', 4), ficha('rojo', 5)],
    };
    const resultado = moverFichas(zonas, ['rojo-5-a', 'rojo-3-a', 'rojo-4-a'], { tipo: 'nueva' });
    expect(numeros(resultado.mesa[0]?.fichas)).toEqual([5, 3, 4]);
  });

  it('añade fichas a una combinación existente al final', () => {
    const zonas: ZonasTurno = {
      mesa: [{ id: 'c1', fichas: [ficha('azul', 4), ficha('azul', 5)] }],
      atril: [ficha('azul', 6)],
    };
    const resultado = moverFichas(zonas, ['azul-6-a'], { tipo: 'combinacion', id: 'c1' });
    expect(resultado.atril).toHaveLength(0);
    expect(numeros(resultado.mesa[0]?.fichas)).toEqual([4, 5, 6]);
  });

  it('inserta fichas en una posición concreta de la combinación', () => {
    const zonas: ZonasTurno = {
      mesa: [{ id: 'c1', fichas: [ficha('azul', 4), ficha('azul', 6)] }],
      atril: [ficha('azul', 5)],
    };
    const resultado = moverFichas(zonas, ['azul-5-a'], {
      tipo: 'combinacion',
      id: 'c1',
      indice: 1,
    });
    expect(numeros(resultado.mesa[0]?.fichas)).toEqual([4, 5, 6]);
  });

  it('devuelve fichas de la mesa al atril y elimina combinaciones vacías', () => {
    const zonas: ZonasTurno = {
      mesa: [{ id: 'c1', fichas: [ficha('rojo', 7)] }],
      atril: [],
    };
    const resultado = moverFichas(zonas, ['rojo-7-a'], { tipo: 'atril' });
    expect(resultado.mesa).toHaveLength(0);
    expect(resultado.atril.map((f) => f.id)).toEqual(['rojo-7-a']);
  });

  it('mueve fichas entre combinaciones', () => {
    const zonas: ZonasTurno = {
      mesa: [
        { id: 'c1', fichas: [ficha('rojo', 5), ficha('rojo', 6), ficha('rojo', 7)] },
        { id: 'c2', fichas: [ficha('azul', 9), ficha('azul', 10), ficha('azul', 11)] },
      ],
      atril: [],
    };
    const resultado = moverFichas(zonas, ['rojo-7-a'], { tipo: 'combinacion', id: 'c2' });
    expect(numeros(resultado.mesa[0]?.fichas)).toEqual([5, 6]);
    expect(numeros(resultado.mesa[1]?.fichas)).toEqual([9, 10, 11, 7]);
  });
});
