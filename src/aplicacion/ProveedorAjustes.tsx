/**
 * Proveedor de ajustes: mantiene los ajustes, los persiste y aplica el tema y
 * la preferencia de animaciones al documento.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AJUSTES_POR_DEFECTO,
  cargarAjustes,
  guardarAjustes,
  type Ajustes,
} from '@/servicios/almacenamiento/almacenamientoAjustes';
import { ContextoAjustes, type ValorContextoAjustes } from './contextoAjustes';

function aplicarAlDocumento(ajustes: Ajustes): void {
  if (typeof document === 'undefined') return;
  const raiz = document.documentElement;
  raiz.dataset.tema = ajustes.tema;
  raiz.dataset.animaciones = ajustes.animaciones ? 'si' : 'no';
  raiz.style.colorScheme =
    ajustes.tema === 'automatico' ? 'light dark' : ajustes.tema === 'oscuro' ? 'dark' : 'light';
}

export function ProveedorAjustes({ children }: { readonly children: ReactNode }) {
  const [ajustes, setAjustes] = useState<Ajustes>(() => cargarAjustes());

  useEffect(() => {
    aplicarAlDocumento(ajustes);
    guardarAjustes(ajustes);
  }, [ajustes]);

  const actualizar = useCallback((cambios: Partial<Ajustes>) => {
    setAjustes((previos) => ({ ...previos, ...cambios }));
  }, []);

  const restablecer = useCallback(() => {
    setAjustes(AJUSTES_POR_DEFECTO);
  }, []);

  const valor = useMemo<ValorContextoAjustes>(
    () => ({ ajustes, actualizar, restablecer }),
    [ajustes, actualizar, restablecer],
  );

  return <ContextoAjustes.Provider value={valor}>{children}</ContextoAjustes.Provider>;
}
