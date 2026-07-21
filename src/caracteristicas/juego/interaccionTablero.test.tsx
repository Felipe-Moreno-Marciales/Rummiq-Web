import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderAplicacion } from '@/pruebas/utilidades';
import { crearPartida } from '@/dominio/juego/motorJuego';
import { guardarPartida } from '@/servicios/almacenamiento/almacenamientoPartida';
import { idFichaNumero } from '@/dominio/juego/crearConjuntoFichas';
import type { ColorFicha, CopiaFicha, FichaNumero, NumeroFicha } from '@/dominio/juego/tipos';
import type { EstadoJuego, Jugador } from '@/dominio/juego/tiposMotor';

function f(color: ColorFicha, numero: NumeroFicha, copia: CopiaFicha = 'a'): FichaNumero {
  return { id: idFichaNumero(color, numero, copia), tipo: 'numero', color, numero };
}

const JUGADORES: Jugador[] = [
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
  { id: 'beto', nombre: 'Beto', tipo: 'humano' },
];

/** Prepara y guarda una partida con manos controladas (turno de Ana). */
function guardarPartidaControlada() {
  const base = crearPartida({ jugadores: JUGADORES, rondas: 2, semilla: 'ui' });
  const estado: EstadoJuego = {
    ...base,
    mesa: [],
    turnoActual: 0,
    haAbierto: { ana: false, beto: false },
    manos: {
      ana: [f('rojo', 11), f('azul', 11), f('negro', 11), f('rojo', 2)],
      beto: [f('rojo', 5)],
    },
    turno: null,
    fase: 'jugando',
    resultadoRonda: null,
  };
  guardarPartida(estado);
}

const renderApp = renderAplicacion;

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('interacción del tablero (selección y botones)', () => {
  it('permite abrir bajando un grupo de 30+ puntos con la alternativa por botones', async () => {
    guardarPartidaControlada();
    const usuario = userEvent.setup();
    renderApp();

    await usuario.click(screen.getByRole('button', { name: /reanudar partida/i }));
    expect(screen.getByRole('heading', { name: /atril de ana/i })).toBeInTheDocument();

    // Selecciona el grupo de onces (33 puntos).
    await usuario.click(screen.getByRole('button', { name: '11 rojo' }));
    await usuario.click(screen.getByRole('button', { name: '11 azul' }));
    await usuario.click(screen.getByRole('button', { name: '11 negro' }));

    // Crea la combinación y confirma la jugada.
    await usuario.click(screen.getByRole('button', { name: /crear combinación/i }));
    await usuario.click(screen.getByRole('button', { name: /confirmar jugada/i }));

    // La apertura es válida: el turno pasa a Beto.
    expect(screen.getByText(/Turno: Beto/)).toBeInTheDocument();
  });

  it('marca la selección de una ficha con el teclado (aria-pressed)', async () => {
    guardarPartidaControlada();
    const usuario = userEvent.setup();
    renderApp();
    await usuario.click(screen.getByRole('button', { name: /reanudar partida/i }));

    const ficha = screen.getByRole('button', { name: '2 rojo' });
    ficha.focus();
    await usuario.keyboard('{Enter}');
    expect(ficha).toHaveAttribute('aria-pressed', 'true');
  });

  it('muestra un mensaje cuando la apertura es insuficiente', async () => {
    guardarPartidaControlada();
    const usuario = userEvent.setup();
    renderApp();
    await usuario.click(screen.getByRole('button', { name: /reanudar partida/i }));

    // Baja solo el 2 rojo como combinación (inválida e insuficiente) y confirma.
    await usuario.click(screen.getByRole('button', { name: '2 rojo' }));
    await usuario.click(screen.getByRole('button', { name: /crear combinación/i }));
    await usuario.click(screen.getByRole('button', { name: /confirmar jugada/i }));

    expect(screen.getByText(/inválidas en la mesa/i)).toBeInTheDocument();
    expect(screen.getByText(/Turno: Ana/)).toBeInTheDocument();
  });
});
