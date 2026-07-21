/** Contexto de React para los ajustes de la aplicación. */
import { createContext } from 'react';
import type { Ajustes } from '@/servicios/almacenamiento/almacenamientoAjustes';

export interface ValorContextoAjustes {
  readonly ajustes: Ajustes;
  readonly actualizar: (cambios: Partial<Ajustes>) => void;
  /** Restablece los ajustes por defecto. */
  readonly restablecer: () => void;
}

export const ContextoAjustes = createContext<ValorContextoAjustes | null>(null);
