import { describe, expect, it } from 'vitest';
import {
  esCombinacionValida,
  fichaSustituyeComodin,
  interpretarCombinacion,
  interpretarEscalera,
  interpretarGrupo,
} from './reglasComodines';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaComodin, FichaNumero, NumeroFicha } from './tipos';
import type { ResultadoCombinacion } from './reglasComodines';

/** Crea una ficha numérica. */
function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

/** Crea un comodín. */
function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

/** Códigos de error de un resultado. */
function codigos(resultado: ResultadoCombinacion): string[] {
  return resultado.valida ? [] : resultado.errores.map((e) => e.codigo);
}

describe('interpretarGrupo con comodines', () => {
  it('completa el color que falta con un comodín', () => {
    const resultado = interpretarGrupo([ficha('rojo', 7), ficha('azul', 7), comodin()]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.tipo).toBe('grupo');
      expect(resultado.interpretaciones).toEqual([
        { idComodin: 'comodin-a', numero: 7, color: 'amarillo' },
      ]);
    }
  });

  it('admite dos comodines completando dos colores', () => {
    const resultado = interpretarGrupo([ficha('rojo', 5), comodin('a'), comodin('b')]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.interpretaciones.map((i) => i.color)).toEqual(['azul', 'amarillo']);
      expect(resultado.interpretaciones.every((i) => i.numero === 5)).toBe(true);
    }
  });

  it('rechaza un grupo formado solo por comodines por ambigüedad', () => {
    expect(codigos(interpretarGrupo([comodin('a'), comodin('b')]))).toContain('comodin-ambiguo');
  });
});

describe('interpretarEscalera con comodines (posicional)', () => {
  it('interpreta un comodín en el extremo alto', () => {
    const resultado = interpretarEscalera([
      ficha('azul', 4),
      ficha('azul', 5),
      ficha('azul', 6),
      comodin(),
    ]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.interpretaciones).toEqual([
        { idComodin: 'comodin-a', numero: 7, color: 'azul' },
      ]);
    }
  });

  it('interpreta un comodín en el extremo bajo según su posición', () => {
    const resultado = interpretarEscalera([comodin(), ficha('rojo', 4), ficha('rojo', 5)]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.interpretaciones[0]?.numero).toBe(3);
    }
  });

  it('interpreta un comodín en el medio', () => {
    const resultado = interpretarEscalera([ficha('negro', 8), comodin(), ficha('negro', 10)]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.interpretaciones[0]?.numero).toBe(9);
    }
  });

  it('rechaza una escalera cuyo comodín se saldría del rango', () => {
    expect(
      codigos(interpretarEscalera([ficha('rojo', 12), ficha('rojo', 13), comodin()])),
    ).toContain('numero-fuera-de-rango');
  });

  it('rechaza posiciones incoherentes de las fichas numéricas', () => {
    expect(codigos(interpretarEscalera([ficha('rojo', 4), comodin(), ficha('rojo', 7)]))).toContain(
      'no-consecutivos',
    );
  });

  it('rechaza una escalera solo de comodines por ambigüedad', () => {
    expect(codigos(interpretarEscalera([comodin('a'), comodin('b'), comodin('a')]))).toContain(
      'comodin-ambiguo',
    );
  });
});

describe('interpretarCombinacion (precedencia y diagnóstico)', () => {
  it('interpreta [X, C, C] como grupo (precedencia grupo → escalera)', () => {
    const resultado = interpretarCombinacion([ficha('rojo', 5), comodin('a'), comodin('b')]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) expect(resultado.tipo).toBe('grupo');
  });

  it('interpreta una escalera con comodín cuando hay dos numéricas del mismo color', () => {
    const resultado = interpretarCombinacion([ficha('rojo', 5), comodin(), ficha('rojo', 7)]);
    expect(resultado.valida).toBe(true);
    if (resultado.valida) {
      expect(resultado.tipo).toBe('escalera');
      expect(resultado.interpretaciones[0]?.numero).toBe(6);
    }
  });

  it('rechaza una combinación vacía', () => {
    expect(codigos(interpretarCombinacion([]))).toEqual(['vacia']);
  });

  it('devuelve error genérico cuando no es grupo ni escalera', () => {
    expect(
      codigos(interpretarCombinacion([ficha('rojo', 2), ficha('azul', 5), ficha('amarillo', 9)])),
    ).toContain('combinacion-invalida');
  });

  it('devuelve error de escalera cuando las numéricas comparten color', () => {
    expect(
      codigos(interpretarCombinacion([ficha('rojo', 2), ficha('rojo', 5), ficha('rojo', 9)])),
    ).toContain('no-consecutivos');
  });

  it('devuelve error de grupo cuando las numéricas comparten número', () => {
    expect(
      codigos(
        interpretarCombinacion([ficha('rojo', 5, 'a'), ficha('rojo', 5, 'b'), ficha('azul', 5)]),
      ),
    ).toContain('color-repetido');
  });

  it('rechaza una combinación solo de comodines por ambigüedad', () => {
    expect(codigos(interpretarCombinacion([comodin('a'), comodin('b')]))).toContain(
      'comodin-ambiguo',
    );
  });
});

describe('esCombinacionValida', () => {
  it('reconoce combinaciones válidas e inválidas', () => {
    expect(esCombinacionValida([ficha('rojo', 7), ficha('azul', 7), ficha('negro', 7)])).toBe(true);
    expect(esCombinacionValida([ficha('rojo', 7), ficha('azul', 8)])).toBe(false);
  });
});

describe('fichaSustituyeComodin', () => {
  const interpretacion = {
    idComodin: 'comodin-a',
    numero: 6 as NumeroFicha,
    color: 'azul' as ColorFicha,
  };

  it('acepta la ficha exacta que representa el comodín', () => {
    expect(fichaSustituyeComodin(ficha('azul', 6), interpretacion)).toBe(true);
  });

  it('rechaza una ficha de otro color o número', () => {
    expect(fichaSustituyeComodin(ficha('rojo', 6), interpretacion)).toBe(false);
    expect(fichaSustituyeComodin(ficha('azul', 7), interpretacion)).toBe(false);
  });

  it('rechaza un comodín como sustituto', () => {
    expect(fichaSustituyeComodin(comodin(), interpretacion)).toBe(false);
  });
});
