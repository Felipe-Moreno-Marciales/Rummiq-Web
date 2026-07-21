import { afterEach, describe, expect, it, vi } from 'vitest';
import { reproducirSonido } from './sonidos';

let osciladoresCreados = 0;

class OsciladorFalso {
  type = '';
  frequency = { value: 0 };
  connect(): void {}
  start(): void {}
  stop(): void {}
}

class GananciaFalsa {
  gain = { setValueAtTime(): void {}, exponentialRampToValueAtTime(): void {} };
  connect(): void {}
}

class ContextoAudioFalso {
  currentTime = 0;
  state = 'running';
  destination = {};
  createOscillator(): OsciladorFalso {
    osciladoresCreados += 1;
    return new OsciladorFalso();
  }
  createGain(): GananciaFalsa {
    return new GananciaFalsa();
  }
  resume(): Promise<void> {
    return Promise.resolve();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  osciladoresCreados = 0;
});

describe('reproducirSonido', () => {
  it('no hace nada si está deshabilitado', () => {
    expect(() => reproducirSonido('mover', false)).not.toThrow();
  });

  it('no falla cuando no hay Web Audio API disponible', () => {
    expect(() => reproducirSonido('mover', true)).not.toThrow();
  });

  it('crea osciladores cuando está habilitado y hay contexto de audio', () => {
    vi.stubGlobal('AudioContext', ContextoAudioFalso);
    reproducirSonido('confirmar', true); // dos notas
    expect(osciladoresCreados).toBe(2);
  });
});
