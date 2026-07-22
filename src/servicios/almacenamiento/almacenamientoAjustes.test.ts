import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  AJUSTES_POR_DEFECTO,
  borrarAjustes,
  cargarAjustes,
  guardarAjustes,
} from './almacenamientoAjustes';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('almacenamiento de ajustes', () => {
  it('devuelve los ajustes por defecto cuando no hay nada guardado', () => {
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
  });

  it('guarda y recupera los ajustes', () => {
    guardarAjustes({ tema: 'oscuro', acento: 'turquesa', sonidos: false, animaciones: false });
    expect(cargarAjustes()).toEqual({
      tema: 'oscuro',
      acento: 'turquesa',
      sonidos: false,
      animaciones: false,
    });
  });

  it('usa el acento por defecto si falta o no es válido', () => {
    localStorage.setItem(
      'rummiq:ajustes',
      JSON.stringify({ tema: 'claro', sonidos: true, animaciones: true }),
    );
    expect(cargarAjustes().acento).toBe('azul');
  });

  it('ignora datos corruptos o con forma inválida', () => {
    localStorage.setItem('rummiq:ajustes', 'no es json');
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
    localStorage.setItem('rummiq:ajustes', JSON.stringify({ tema: 'morado' }));
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
  });

  it('borra los ajustes guardados', () => {
    guardarAjustes({ tema: 'claro', acento: 'rosa', sonidos: true, animaciones: true });
    borrarAjustes();
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
  });
});
