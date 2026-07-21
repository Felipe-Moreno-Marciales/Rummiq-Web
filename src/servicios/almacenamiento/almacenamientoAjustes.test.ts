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
    guardarAjustes({ tema: 'oscuro', sonidos: false, animaciones: false });
    expect(cargarAjustes()).toEqual({ tema: 'oscuro', sonidos: false, animaciones: false });
  });

  it('ignora datos corruptos o con forma inválida', () => {
    localStorage.setItem('rummiq:ajustes', 'no es json');
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
    localStorage.setItem('rummiq:ajustes', JSON.stringify({ tema: 'morado' }));
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
  });

  it('borra los ajustes guardados', () => {
    guardarAjustes({ tema: 'claro', sonidos: true, animaciones: true });
    borrarAjustes();
    expect(cargarAjustes()).toEqual(AJUSTES_POR_DEFECTO);
  });
});
