/** Hook para acceder al contexto de juego. */
import { useContext } from 'react';
import { ContextoJuego, type ValorContextoJuego } from '@/aplicacion/contextoJuego';

// Hook con nombre en español; la regla de React reconoce hooks por el prefijo
// inglés «use», por lo que aquí se desactiva de forma puntual y justificada.
export function usarJuego(): ValorContextoJuego {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const valor = useContext(ContextoJuego);
  if (!valor) {
    throw new Error('usarJuego debe utilizarse dentro de un ProveedorJuego.');
  }
  return valor;
}
