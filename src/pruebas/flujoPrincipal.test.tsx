import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Aplicacion } from '@/aplicacion/Aplicacion';
import { ProveedorJuego } from '@/aplicacion/ProveedorJuego';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('flujo principal', () => {
  it('permite configurar una partida, entrar al tablero y robar una ficha', async () => {
    const usuario = userEvent.setup();
    render(
      <ProveedorJuego>
        <Aplicacion />
      </ProveedorJuego>,
    );

    // Inicio -> Configuración
    await usuario.click(screen.getByRole('button', { name: /nueva partida/i }));
    expect(screen.getByRole('heading', { name: /configurar partida/i })).toBeInTheDocument();

    // Empezar con la configuración por defecto (2 jugadores humanos).
    await usuario.click(screen.getByRole('button', { name: /empezar partida/i }));

    // Tablero visible con sus secciones principales.
    expect(screen.getByRole('heading', { name: /^mesa$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /atril de/i })).toBeInTheDocument();
    expect(screen.getByText(/Pozo: 78/)).toBeInTheDocument();

    // Robar una ficha reduce el pozo y pasa el turno.
    await usuario.click(screen.getByRole('button', { name: /robar ficha/i }));
    expect(screen.getByText(/Pozo: 77/)).toBeInTheDocument();
  });
});
