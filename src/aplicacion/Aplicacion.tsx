/** Enrutador de pantallas de la aplicación (navegación por estado). */
import { useState } from 'react';
import { PantallaInicio } from '@/caracteristicas/menu/PantallaInicio';
import { PantallaConfiguracion } from '@/caracteristicas/menu/PantallaConfiguracion';
import { PantallaReglas } from '@/caracteristicas/reglas/PantallaReglas';
import { PantallaTablero } from '@/caracteristicas/juego/PantallaTablero';
import { PantallaAjustes } from '@/caracteristicas/ajustes/PantallaAjustes';
import { PantallaEstadisticas } from '@/caracteristicas/estadisticas/PantallaEstadisticas';
import type { Pantalla } from './pantallas';

export function Aplicacion() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const ir = (destino: Pantalla) => setPantalla(destino);

  switch (pantalla) {
    case 'configuracion':
      return <PantallaConfiguracion ir={ir} />;
    case 'reglas':
      return <PantallaReglas ir={ir} />;
    case 'tablero':
      return <PantallaTablero ir={ir} />;
    case 'ajustes':
      return <PantallaAjustes ir={ir} />;
    case 'estadisticas':
      return <PantallaEstadisticas ir={ir} />;
    case 'inicio':
    default:
      return <PantallaInicio ir={ir} />;
  }
}
