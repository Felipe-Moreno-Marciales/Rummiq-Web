import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Aplicacion } from '@/aplicacion/Aplicacion';
import '@/estilos/global.css';

const contenedor = document.getElementById('root');
if (!contenedor) {
  throw new Error('No se encontró el elemento raíz #root en el documento.');
}

createRoot(contenedor).render(
  <StrictMode>
    <Aplicacion />
  </StrictMode>,
);
