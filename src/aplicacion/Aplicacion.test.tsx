import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Aplicacion } from './Aplicacion';

describe('Aplicacion', () => {
  it('muestra el título de la aplicación', () => {
    render(<Aplicacion />);
    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
  });

  it('incluye el aviso de independencia frente a marcas comerciales', () => {
    render(<Aplicacion />);
    expect(screen.getByText(/implementación no oficial/i)).toBeInTheDocument();
  });
});
