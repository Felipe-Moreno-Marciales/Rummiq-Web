import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('muestra el título de la aplicación', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /rummiq web/i })).toBeInTheDocument();
  });

  it('incluye el aviso de independencia frente a marcas comerciales', () => {
    render(<App />);
    expect(screen.getByText(/implementación no oficial/i)).toBeInTheDocument();
  });
});
