import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Aplicacion } from '@/aplicacion/Aplicacion';
import { ProveedorJuego } from '@/aplicacion/ProveedorJuego';
import { crearPartida } from '@/dominio/juego/motorJuego';
import { guardarPartida } from '@/servicios/almacenamiento/almacenamientoPartida';
import { idFichaNumero } from '@/dominio/juego/crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaNumero, NumeroFicha } from '@/dominio/juego/tipos';
import type { EstadoJuego, Jugador } from '@/dominio/juego/tiposMotor';

function f(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

const JUGADORES: Jugador[] = [
  { id: 'maq', nombre: 'Robotina', tipo: 'maquina', dificultad: 'facil' },
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
];

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('juego automático de la máquina', () => {
  it('la máquina juega su turno y lo pasa al humano', async () => {
    const base = crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'bot-ui' });
    const estado: EstadoJuego = {
      ...base,
      mesa: [],
      turnoActual: 0, // turno de la máquina
      manos: {
        maq: [f('rojo', 1), f('azul', 5), f('negro', 9)], // sin combinación posible
        ana: [f('rojo', 5)],
      },
      pozo: [f('amarillo', 8), f('amarillo', 10)],
      turno: null,
      fase: 'jugando',
      resultadoRonda: null,
    };
    guardarPartida(estado);

    const usuario = userEvent.setup();
    render(
      <ProveedorJuego>
        <Aplicacion />
      </ProveedorJuego>,
    );

    await usuario.click(screen.getByRole('button', { name: /reanudar partida/i }));
    // Al principio es el turno de la máquina.
    expect(screen.getByText(/Turno: Robotina/)).toBeInTheDocument();

    // Tras su jugada automática, el turno pasa a Ana.
    await waitFor(() => expect(screen.getByText(/Turno: Ana/)).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});
