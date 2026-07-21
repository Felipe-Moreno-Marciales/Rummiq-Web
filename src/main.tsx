import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Aplicacion } from '@/aplicacion/Aplicacion';
import { ProveedorJuego } from '@/aplicacion/ProveedorJuego';
import { ProveedorAjustes } from '@/aplicacion/ProveedorAjustes';
import '@/estilos/global.css';

const contenedor = document.getElementById('root');
if (!contenedor) {
  throw new Error('No se encontró el elemento raíz #root en el documento.');
}

createRoot(contenedor).render(
  <StrictMode>
    <ProveedorAjustes>
      <ProveedorJuego>
        <Aplicacion />
      </ProveedorJuego>
    </ProveedorAjustes>
  </StrictMode>,
);
