import { describe, expect, it } from 'vitest';
import { crearConjuntoFichas, idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import {
  COLORES_FICHA,
  COPIAS_POR_COMBINACION,
  NUMERO_COMODINES,
  NUMEROS_FICHA,
  TOTAL_FICHAS,
} from './constantes';
import { esComodin, esFichaNumero } from './validadores';

describe('crearConjuntoFichas', () => {
  const fichas = crearConjuntoFichas();

  it('crea exactamente 106 fichas', () => {
    expect(TOTAL_FICHAS).toBe(106);
    expect(fichas).toHaveLength(106);
  });

  it('asigna identificadores únicos a todas las fichas', () => {
    const ids = new Set(fichas.map((ficha) => ficha.id));
    expect(ids.size).toBe(fichas.length);
  });

  it('incluye exactamente dos comodines', () => {
    const comodines = fichas.filter(esComodin);
    expect(comodines).toHaveLength(NUMERO_COMODINES);
    expect(new Set(comodines.map((c) => c.id)).size).toBe(NUMERO_COMODINES);
  });

  it('incluye 104 fichas numéricas (4 colores × 13 números × 2 copias)', () => {
    const fichasNumero = fichas.filter(esFichaNumero);
    expect(fichasNumero).toHaveLength(
      COLORES_FICHA.length * NUMEROS_FICHA.length * COPIAS_POR_COMBINACION,
    );
  });

  it('crea dos copias de cada combinación de número y color', () => {
    for (const color of COLORES_FICHA) {
      for (const numero of NUMEROS_FICHA) {
        const coincidencias = fichas.filter(
          (ficha) => ficha.tipo === 'numero' && ficha.color === color && ficha.numero === numero,
        );
        expect(coincidencias).toHaveLength(2);
        expect(new Set(coincidencias.map((f) => f.id)).size).toBe(2);
      }
    }
  });

  it('dos fichas con el mismo color y número tienen identificadores distintos', () => {
    expect(idFichaNumero('rojo', 7, 'a')).toBe('rojo-7-a');
    expect(idFichaNumero('rojo', 7, 'b')).toBe('rojo-7-b');
    expect(idFichaNumero('rojo', 7, 'a')).not.toBe(idFichaNumero('rojo', 7, 'b'));
  });

  it('genera identificadores estables para los comodines', () => {
    expect(idFichaComodin('a')).toBe('comodin-a');
    expect(idFichaComodin('b')).toBe('comodin-b');
  });

  it('devuelve un conjunto nuevo en cada llamada', () => {
    expect(crearConjuntoFichas()).not.toBe(fichas);
    expect(crearConjuntoFichas()).toEqual(fichas);
  });
});
