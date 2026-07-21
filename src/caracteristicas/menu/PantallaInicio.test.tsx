import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderAplicacion } from '@/pruebas/utilidades';
import { crearPartida } from '@/dominio/juego/motorJuego';
import { guardarPartida } from '@/servicios/almacenamiento/almacenamientoPartida';
import type { Jugador } from '@/dominio/juego/tiposMotor';

const JUGADORES: Jugador[] = [
  { id: 'ana', nombre: 'Ana', tipo: 'humano' },
  { id: 'beto', nombre: 'Beto', tipo: 'humano' },
];

const renderApp = renderAplicacion;

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('Inicio con partida guardada', () => {
  it('ofrece reanudar y pide confirmación antes de descartar', async () => {
    guardarPartida(crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'g' }));
    const usuario = userEvent.setup();
    renderApp();

    expect(screen.getByRole('button', { name: /reanudar partida/i })).toBeInTheDocument();

    // «Nueva partida» abre un diálogo de confirmación.
    await usuario.click(screen.getByRole('button', { name: /nueva partida/i }));
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveTextContent(/descartar/i);

    // Cancelar cierra el diálogo sin salir del inicio.
    await usuario.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
  });

  it('descarta la partida y va a la configuración al confirmar', async () => {
    guardarPartida(crearPartida({ jugadores: JUGADORES, rondas: 1, semilla: 'g' }));
    const usuario = userEvent.setup();
    renderApp();

    await usuario.click(screen.getByRole('button', { name: /nueva partida/i }));
    await usuario.click(screen.getByRole('button', { name: /descartar y empezar/i }));
    expect(screen.getByRole('heading', { name: /configurar partida/i })).toBeInTheDocument();
  });
});
