import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderAplicacion } from '@/pruebas/utilidades';

beforeEach(() => localStorage.clear());
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-tema');
});

describe('Pantalla de ajustes', () => {
  it('cambia el tema y lo aplica al documento', async () => {
    const usuario = userEvent.setup();
    renderAplicacion();

    await usuario.click(screen.getByRole('button', { name: /^ajustes$/i }));
    expect(screen.getByRole('heading', { name: /^ajustes$/i })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /^oscuro$/i }));
    await waitFor(() => expect(document.documentElement.dataset.tema).toBe('oscuro'));
    expect(localStorage.getItem('rummiq:ajustes')).toContain('oscuro');
  });

  it('borra todos los datos tras confirmar', async () => {
    localStorage.setItem('rummiq:estadisticas', JSON.stringify({ x: 1 }));
    const usuario = userEvent.setup();
    renderAplicacion();

    await usuario.click(screen.getByRole('button', { name: /^ajustes$/i }));
    await usuario.click(screen.getByRole('button', { name: /borrar todos los datos/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent(/no se puede deshacer/i);
    await usuario.click(screen.getByRole('button', { name: /^borrar todo$/i }));

    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
    expect(localStorage.getItem('rummiq:estadisticas')).toBeNull();
  });
});
