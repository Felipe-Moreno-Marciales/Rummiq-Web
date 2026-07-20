import { describe, expect, it } from 'vitest';
import {
  esComodin,
  esEscaleraValida,
  esFichaNumero,
  esGrupoValido,
  validarCombinacion,
} from './validadores';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type {
  ColorFicha,
  CopiaFicha,
  FichaComodin,
  FichaNumero,
  NumeroFicha,
  ValidacionCombinacion,
} from './tipos';

/** Crea una ficha numérica para las pruebas. */
function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

/** Crea un comodín para las pruebas. */
function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

/** Extrae los códigos de error de un resultado inválido. */
function codigos(resultado: ValidacionCombinacion): string[] {
  return resultado.valida ? [] : resultado.errores.map((e) => e.codigo);
}

describe('guardas de tipo', () => {
  it('esComodin distingue comodines de fichas numéricas', () => {
    expect(esComodin(comodin())).toBe(true);
    expect(esComodin(ficha('rojo', 5))).toBe(false);
  });

  it('esFichaNumero distingue fichas numéricas de comodines', () => {
    expect(esFichaNumero(ficha('rojo', 5))).toBe(true);
    expect(esFichaNumero(comodin())).toBe(false);
  });
});

describe('esGrupoValido', () => {
  it('acepta un grupo de tres colores distintos con el mismo número', () => {
    const resultado = esGrupoValido([ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)]);
    expect(resultado).toEqual({ valida: true, tipo: 'grupo' });
  });

  it('acepta un grupo de cuatro colores distintos', () => {
    const resultado = esGrupoValido([
      ficha('rojo', 12),
      ficha('amarillo', 12),
      ficha('azul', 12),
      ficha('negro', 12),
    ]);
    expect(resultado.valida).toBe(true);
  });

  it('rechaza un grupo con un color repetido', () => {
    const resultado = esGrupoValido([
      ficha('rojo', 5, 'a'),
      ficha('rojo', 5, 'b'),
      ficha('azul', 5),
    ]);
    expect(codigos(resultado)).toContain('color-repetido');
  });

  it('rechaza un grupo con menos de tres fichas', () => {
    const resultado = esGrupoValido([ficha('rojo', 8), ficha('azul', 8)]);
    expect(codigos(resultado)).toContain('pocas-fichas');
  });

  it('rechaza un grupo con más de cuatro fichas', () => {
    const resultado = esGrupoValido([
      ficha('rojo', 3),
      ficha('azul', 3),
      ficha('amarillo', 3),
      ficha('negro', 3),
      ficha('rojo', 3, 'b'),
    ]);
    expect(codigos(resultado)).toContain('demasiadas-fichas');
  });

  it('rechaza un grupo con números distintos', () => {
    const resultado = esGrupoValido([ficha('rojo', 9), ficha('azul', 9), ficha('negro', 10)]);
    expect(codigos(resultado)).toContain('numeros-distintos');
  });

  it('rechaza una combinación vacía', () => {
    expect(codigos(esGrupoValido([]))).toEqual(['vacia']);
  });

  it('marca los comodines como no admitidos en la validación básica', () => {
    expect(codigos(esGrupoValido([ficha('rojo', 7), ficha('azul', 7), comodin()]))).toEqual([
      'comodin-no-admitido',
    ]);
  });
});

describe('esEscaleraValida', () => {
  it('acepta una escalera de tres números consecutivos del mismo color', () => {
    const resultado = esEscaleraValida([
      ficha('amarillo', 3),
      ficha('amarillo', 4),
      ficha('amarillo', 5),
    ]);
    expect(resultado).toEqual({ valida: true, tipo: 'escalera' });
  });

  it('acepta una escalera larga del mismo color', () => {
    const resultado = esEscaleraValida([
      ficha('azul', 9),
      ficha('azul', 10),
      ficha('azul', 11),
      ficha('azul', 12),
    ]);
    expect(resultado.valida).toBe(true);
  });

  it('acepta una escalera que empieza en 1', () => {
    const resultado = esEscaleraValida([ficha('rojo', 1), ficha('rojo', 2), ficha('rojo', 3)]);
    expect(resultado.valida).toBe(true);
  });

  it('es independiente del orden de las fichas', () => {
    const resultado = esEscaleraValida([ficha('rojo', 3), ficha('rojo', 1), ficha('rojo', 2)]);
    expect(resultado.valida).toBe(true);
  });

  it('rechaza una escalera con un hueco', () => {
    const resultado = esEscaleraValida([ficha('negro', 7), ficha('negro', 9), ficha('negro', 10)]);
    expect(codigos(resultado)).toContain('no-consecutivos');
  });

  it('rechaza una secuencia circular 12-13-1', () => {
    const resultado = esEscaleraValida([ficha('rojo', 12), ficha('rojo', 13), ficha('rojo', 1)]);
    expect(codigos(resultado)).toContain('no-consecutivos');
  });

  it('rechaza una escalera con números repetidos', () => {
    const resultado = esEscaleraValida([
      ficha('azul', 4, 'a'),
      ficha('azul', 4, 'b'),
      ficha('azul', 5),
    ]);
    expect(codigos(resultado)).toContain('numeros-repetidos');
  });

  it('rechaza una escalera con colores mezclados', () => {
    const resultado = esEscaleraValida([ficha('rojo', 2), ficha('rojo', 3), ficha('azul', 4)]);
    expect(codigos(resultado)).toContain('colores-distintos');
  });

  it('rechaza una escalera demasiado corta', () => {
    const resultado = esEscaleraValida([ficha('rojo', 2), ficha('rojo', 3)]);
    expect(codigos(resultado)).toContain('pocas-fichas');
  });

  it('rechaza una combinación vacía', () => {
    expect(codigos(esEscaleraValida([]))).toEqual(['vacia']);
  });

  it('marca los comodines como no admitidos en la validación básica', () => {
    expect(codigos(esEscaleraValida([ficha('rojo', 1), ficha('rojo', 2), comodin()]))).toEqual([
      'comodin-no-admitido',
    ]);
  });
});

describe('validarCombinacion', () => {
  it('reconoce un grupo válido', () => {
    expect(validarCombinacion([ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)])).toEqual({
      valida: true,
      tipo: 'grupo',
    });
  });

  it('reconoce una escalera válida', () => {
    expect(validarCombinacion([ficha('rojo', 5), ficha('rojo', 6), ficha('rojo', 7)])).toEqual({
      valida: true,
      tipo: 'escalera',
    });
  });

  it('devuelve errores de escalera cuando las fichas comparten color', () => {
    const resultado = validarCombinacion([ficha('rojo', 5), ficha('rojo', 7), ficha('rojo', 9)]);
    expect(codigos(resultado)).toContain('no-consecutivos');
  });

  it('devuelve errores de grupo cuando las fichas comparten número', () => {
    const resultado = validarCombinacion([
      ficha('rojo', 5, 'a'),
      ficha('rojo', 5, 'b'),
      ficha('azul', 5),
    ]);
    expect(codigos(resultado)).toContain('color-repetido');
  });

  it('devuelve un error genérico cuando no es ni grupo ni escalera', () => {
    const resultado = validarCombinacion([
      ficha('rojo', 2),
      ficha('azul', 5),
      ficha('amarillo', 9),
    ]);
    expect(codigos(resultado)).toContain('combinacion-invalida');
  });

  it('propaga el error de combinación vacía', () => {
    expect(codigos(validarCombinacion([]))).toEqual(['vacia']);
  });
});
