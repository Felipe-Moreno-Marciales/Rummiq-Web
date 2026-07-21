import { describe, expect, it } from 'vitest';
import { aplicarJugadaBot, planificarJugada } from './bot';
import { crearPartida, reanudarPartida } from './motorJuego';
import { validarMesa } from './mesa';
import { idFichaComodin, idFichaNumero } from './crearConjuntoFichas';
import type {
  ColorFicha,
  CopiaFicha,
  Ficha,
  FichaComodin,
  FichaNumero,
  NumeroFicha,
} from './tipos';
import type { Combinacion, Dificultad, EstadoJuego, Jugador } from './tiposMotor';

function ficha(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

function comodin(copia: CopiaFicha = 'a'): FichaComodin {
  return { id: idFichaComodin(copia), tipo: 'comodin' };
}

function maquina(id: string, dificultad: Dificultad): Jugador {
  return { id, nombre: id, tipo: 'maquina', dificultad };
}

interface Opciones {
  readonly mesa?: Combinacion[];
  readonly haAbierto?: Record<string, boolean>;
  readonly pozo?: Ficha[];
  readonly jugadores?: Jugador[];
}

function estadoDePrueba(
  manos: Record<string, (FichaNumero | FichaComodin)[]>,
  opciones: Opciones = {},
): EstadoJuego {
  const jugadores = opciones.jugadores ?? [maquina('m1', 'facil'), maquina('m2', 'facil')];
  const haAbierto: Record<string, boolean> = {};
  for (const j of jugadores) haAbierto[j.id] = opciones.haAbierto?.[j.id] ?? false;
  const base: EstadoJuego = {
    version: 1,
    config: { jugadores, rondas: 1, semilla: 'prueba' },
    jugadores,
    semilla: 'prueba',
    rondaActual: 1,
    fase: 'jugando',
    mesa: opciones.mesa ?? [],
    pozo: opciones.pozo ?? [],
    manos,
    haAbierto,
    ordenTurnos: jugadores.map((j) => j.id),
    turnoActual: 0,
    pasesConsecutivos: 0,
    turno: null,
    puntuaciones: Object.fromEntries(jugadores.map((j) => [j.id, 0])),
    rondasGanadas: Object.fromEntries(jugadores.map((j) => [j.id, 0])),
    historialRondas: [],
    resultadoRonda: null,
    contadorCombinacion: 0,
    ultimoError: null,
  };
  return reanudarPartida(base);
}

function contarFichas(estado: EstadoJuego): number {
  const enMesa = estado.mesa.reduce((t, c) => t + c.fichas.length, 0);
  const enManos = Object.values(estado.manos).reduce((t, m) => t + m.length, 0);
  return enMesa + enManos + estado.pozo.length;
}

describe('planificarJugada', () => {
  it('abre bajando un grupo de 30+ puntos', () => {
    const estado = estadoDePrueba({
      m1: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11), ficha('rojo', 2)],
      m2: [ficha('rojo', 5)],
    });
    const plan = planificarJugada(estado);
    expect(plan.tipo).toBe('jugar');
  });

  it('roba cuando no puede abrir y hay pozo', () => {
    const estado = estadoDePrueba(
      { m1: [ficha('rojo', 1), ficha('azul', 5), ficha('negro', 9)], m2: [ficha('rojo', 5)] },
      { pozo: [ficha('amarillo', 8)] },
    );
    expect(planificarJugada(estado).tipo).toBe('robar');
  });

  it('pasa cuando no puede abrir y el pozo está vacío', () => {
    const estado = estadoDePrueba(
      { m1: [ficha('rojo', 1), ficha('azul', 5), ficha('negro', 9)], m2: [ficha('rojo', 5)] },
      { pozo: [] },
    );
    expect(planificarJugada(estado).tipo).toBe('pasar');
  });

  it('añade fichas a combinaciones existentes tras abrir (media)', () => {
    const estado = estadoDePrueba(
      { m1: [ficha('azul', 7), ficha('rojo', 1)], m2: [ficha('rojo', 5)] },
      {
        jugadores: [maquina('m1', 'media'), maquina('m2', 'media')],
        haAbierto: { m1: true, m2: true },
        mesa: [{ id: 'c1', fichas: [ficha('azul', 4), ficha('azul', 5), ficha('azul', 6)] }],
        pozo: [ficha('negro', 8)],
      },
    );
    const plan = planificarJugada(estado);
    expect(plan.tipo).toBe('jugar');
    if (plan.tipo === 'jugar') {
      const escalera = plan.mesa.find((c) => c.id === 'c1');
      expect(escalera?.fichas.some((f) => f.id === 'azul-7-a')).toBe(true);
    }
  });

  it('usa comodines para completar una combinación', () => {
    const estado = estadoDePrueba({
      m1: [ficha('rojo', 10), ficha('azul', 10), comodin(), ficha('rojo', 1)],
      m2: [ficha('rojo', 5)],
    });
    const plan = planificarJugada(estado);
    expect(plan.tipo).toBe('jugar'); // 10 + 10 + comodín(=10) = 30
  });
});

describe('aplicarJugadaBot', () => {
  it('marca al jugador como abierto tras una apertura válida', () => {
    const estado = estadoDePrueba({
      m1: [ficha('rojo', 11), ficha('azul', 11), ficha('negro', 11), ficha('rojo', 2)],
      m2: [ficha('rojo', 5)],
    });
    const siguiente = aplicarJugadaBot(estado);
    expect(siguiente.ultimoError).toBeNull();
    expect(siguiente.haAbierto.m1).toBe(true);
  });

  it('nunca deja un estado ilegal al robar', () => {
    const estado = estadoDePrueba(
      { m1: [ficha('rojo', 1), ficha('azul', 5)], m2: [ficha('rojo', 5)] },
      { pozo: [ficha('amarillo', 8)] },
    );
    const siguiente = aplicarJugadaBot(estado);
    expect(siguiente.ultimoError).toBeNull();
    expect(siguiente.turnoActual).toBe(1);
  });
});

describe('legalidad de la IA (partidas completas)', () => {
  const dificultades: Dificultad[] = ['facil', 'media', 'dificil'];

  for (const dificultad of dificultades) {
    it(`nunca genera estados ilegales y la partida termina (${dificultad})`, () => {
      const jugadores = [maquina('a', dificultad), maquina('b', dificultad)];
      let estado = crearPartida({ jugadores, rondas: 1, semilla: `fuzz-${dificultad}` });

      let iteraciones = 0;
      while (estado.fase === 'jugando' && iteraciones < 1000) {
        estado = aplicarJugadaBot(estado);
        iteraciones += 1;
        expect(estado.ultimoError).toBeNull();
        expect(validarMesa(estado.mesa.map((c) => c.fichas)).valida).toBe(true);
        expect(contarFichas(estado)).toBe(106);
      }
      expect(estado.fase).not.toBe('jugando');
    });
  }
});
