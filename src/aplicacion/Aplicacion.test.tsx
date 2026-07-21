import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderAplicacion } from '@/pruebas/utilidades';

const renderApp = renderAplicacion;

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe('Aplicación (navegación base)', () => {
  it('muestra la pantalla de inicio con el título y las acciones', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nueva partida/i })).toBeInTheDocument();
    expect(screen.getByText(/implementación no oficial/i)).toBeInTheDocument();
  });

  it('navega a la configuración al pulsar «Nueva partida»', async () => {
    const usuario = userEvent.setup();
    renderApp();
    await usuario.click(screen.getByRole('button', { name: /nueva partida/i }));
    expect(screen.getByRole('heading', { name: /configurar partida/i })).toBeInTheDocument();
  });

  it('abre las reglas y permite volver al inicio', async () => {
    const usuario = userEvent.setup();
    renderApp();
    await usuario.click(screen.getByRole('button', { name: /^reglas$/i }));
    expect(screen.getByRole('heading', { name: /^reglas$/i })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /volver/i }));
    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
  });
});
