import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AvisoActualizacion } from './AvisoActualizacion';

// En pruebas, el módulo del service worker es un stub sin actualizaciones.
describe('AvisoActualizacion', () => {
  it('no muestra nada cuando no hay actualización ni modo sin conexión', () => {
    const { container } = render(<AvisoActualizacion />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/actualización/i)).not.toBeInTheDocument();
  });
});
