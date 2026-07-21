/** Utilidades compartidas para las pruebas de componentes. */
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ProveedorAjustes } from '@/aplicacion/ProveedorAjustes';
import { ProveedorJuego } from '@/aplicacion/ProveedorJuego';
import { Aplicacion } from '@/aplicacion/Aplicacion';

/** Renderiza un elemento con los proveedores de ajustes y juego. */
export function renderConProveedores(elemento: ReactElement) {
  return render(
    <ProveedorAjustes>
      <ProveedorJuego>{elemento}</ProveedorJuego>
    </ProveedorAjustes>,
  );
}

/** Renderiza la aplicación completa con sus proveedores. */
export function renderAplicacion() {
  return renderConProveedores(<Aplicacion />);
}
