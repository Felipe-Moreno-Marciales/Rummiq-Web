/**
 * Sonidos del juego generados con la Web Audio API. Son completamente
 * originales (síntesis de tonos) y no dependen de ningún recurso externo.
 *
 * - No suenan hasta que hay interacción del usuario (el contexto de audio se
 *   crea y se reanuda dentro de un gesto).
 * - Se pueden desactivar mediante los ajustes (parámetro `habilitado`).
 */

/** Tipos de sonido disponibles. */
export type TipoSonido = 'mover' | 'confirmar' | 'robar' | 'error' | 'ganar';

interface Nota {
  readonly frecuencia: number;
  readonly inicio: number;
  readonly duracion: number;
  readonly tipo: OscillatorType;
  readonly volumen: number;
}

const SONIDOS: Record<TipoSonido, Nota[]> = {
  mover: [{ frecuencia: 320, inicio: 0, duracion: 0.08, tipo: 'sine', volumen: 0.18 }],
  confirmar: [
    { frecuencia: 523, inicio: 0, duracion: 0.1, tipo: 'triangle', volumen: 0.2 },
    { frecuencia: 784, inicio: 0.09, duracion: 0.12, tipo: 'triangle', volumen: 0.2 },
  ],
  robar: [{ frecuencia: 440, inicio: 0, duracion: 0.09, tipo: 'sine', volumen: 0.18 }],
  error: [{ frecuencia: 160, inicio: 0, duracion: 0.22, tipo: 'sawtooth', volumen: 0.16 }],
  ganar: [
    { frecuencia: 523, inicio: 0, duracion: 0.12, tipo: 'triangle', volumen: 0.22 },
    { frecuencia: 659, inicio: 0.11, duracion: 0.12, tipo: 'triangle', volumen: 0.22 },
    { frecuencia: 784, inicio: 0.22, duracion: 0.12, tipo: 'triangle', volumen: 0.22 },
    { frecuencia: 1047, inicio: 0.33, duracion: 0.2, tipo: 'triangle', volumen: 0.22 },
  ],
};

interface VentanaConAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let contexto: AudioContext | null = null;

function obtenerContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Constructor = window.AudioContext ?? (window as VentanaConAudio).webkitAudioContext;
  if (!Constructor) return null;
  contexto ??= new Constructor();
  return contexto;
}

/**
 * Prepara el audio dentro de un gesto del usuario (reanuda el contexto si el
 * navegador lo tenía suspendido). Seguro de llamar varias veces.
 */
export function desbloquearAudio(): void {
  const ctx = obtenerContexto();
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

/** Reproduce un sonido si está habilitado y el audio está disponible. */
export function reproducirSonido(tipo: TipoSonido, habilitado: boolean): void {
  if (!habilitado) return;
  const ctx = obtenerContexto();
  if (!ctx) return;
  if (ctx.state === 'suspended') void ctx.resume();

  const inicioBase = ctx.currentTime;
  for (const nota of SONIDOS[tipo]) {
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();
    oscilador.type = nota.tipo;
    oscilador.frequency.value = nota.frecuencia;

    const t0 = inicioBase + nota.inicio;
    const t1 = t0 + nota.duracion;
    ganancia.gain.setValueAtTime(0.0001, t0);
    ganancia.gain.exponentialRampToValueAtTime(nota.volumen, t0 + 0.01);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, t1);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);
    oscilador.start(t0);
    oscilador.stop(t1);
  }
}
