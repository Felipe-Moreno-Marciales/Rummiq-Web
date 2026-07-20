import { describe, expect, it } from 'vitest';
import { barajar, crearGeneradorAleatorio } from './barajar';
import { crearConjuntoFichas } from './crearConjuntoFichas';

describe('crearGeneradorAleatorio', () => {
  it('produce la misma secuencia para la misma semilla numérica', () => {
    const a = crearGeneradorAleatorio(12345);
    const b = crearGeneradorAleatorio(12345);
    const secuenciaA = Array.from({ length: 5 }, () => a());
    const secuenciaB = Array.from({ length: 5 }, () => b());
    expect(secuenciaA).toEqual(secuenciaB);
  });

  it('produce secuencias distintas para semillas distintas', () => {
    const a = crearGeneradorAleatorio(1);
    const b = crearGeneradorAleatorio(2);
    expect(a()).not.toBe(b());
  });

  it('acepta semillas de texto de forma determinista', () => {
    const a = crearGeneradorAleatorio('rummiq');
    const b = crearGeneradorAleatorio('rummiq');
    expect(a()).toBe(b());
    expect(crearGeneradorAleatorio('otra')()).not.toBe(crearGeneradorAleatorio('rummiq')());
  });

  it('devuelve valores en el rango [0, 1)', () => {
    const generador = crearGeneradorAleatorio('rango');
    for (let i = 0; i < 1000; i += 1) {
      const valor = generador();
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    }
  });
});

describe('barajar (Fisher-Yates)', () => {
  it('no muta el arreglo original', () => {
    const original = [1, 2, 3, 4, 5];
    const copia = [...original];
    barajar(original, crearGeneradorAleatorio(42));
    expect(original).toEqual(copia);
  });

  it('conserva exactamente los mismos elementos', () => {
    const fichas = crearConjuntoFichas();
    const barajadas = barajar(fichas, crearGeneradorAleatorio('semilla'));
    expect(barajadas).toHaveLength(fichas.length);
    expect(new Set(barajadas.map((f) => f.id))).toEqual(new Set(fichas.map((f) => f.id)));
  });

  it('es reproducible con la misma semilla', () => {
    const fichas = crearConjuntoFichas();
    const primera = barajar(fichas, crearGeneradorAleatorio('reproducible')).map((f) => f.id);
    const segunda = barajar(fichas, crearGeneradorAleatorio('reproducible')).map((f) => f.id);
    expect(primera).toEqual(segunda);
  });

  it('produce órdenes distintos con semillas distintas', () => {
    const fichas = crearConjuntoFichas();
    const primera = barajar(fichas, crearGeneradorAleatorio('a')).map((f) => f.id);
    const segunda = barajar(fichas, crearGeneradorAleatorio('b')).map((f) => f.id);
    expect(primera).not.toEqual(segunda);
  });

  it('gestiona arreglos vacíos y de un solo elemento', () => {
    expect(barajar([], crearGeneradorAleatorio(1))).toEqual([]);
    expect(barajar([99], crearGeneradorAleatorio(1))).toEqual([99]);
  });

  it('funciona con Math.random por defecto sin lanzar errores', () => {
    const resultado = barajar([1, 2, 3]);
    expect(resultado).toHaveLength(3);
    expect(new Set(resultado)).toEqual(new Set([1, 2, 3]));
  });
});
