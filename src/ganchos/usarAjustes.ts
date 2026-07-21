/** Hook para acceder al contexto de ajustes. */
import { useContext } from 'react';
import { ContextoAjustes, type ValorContextoAjustes } from '@/aplicacion/contextoAjustes';

export function usarAjustes(): ValorContextoAjustes {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const valor = useContext(ContextoAjustes);
  if (!valor) {
    throw new Error('usarAjustes debe utilizarse dentro de un ProveedorAjustes.');
  }
  return valor;
}
