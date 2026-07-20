/** Pantalla de tablero: compone la mesa, el atril, los oponentes y los controles. */
import { useEffect } from 'react';
import { usarJuego } from '@/ganchos/usarJuego';
import { jugadorActual } from '@/dominio/juego/selectores';
import type { Pantalla } from '@/aplicacion/pantallas';
import { BarraEstado } from './BarraEstado';
import { PanelOponentes } from './PanelOponentes';
import { Mesa } from './Mesa';
import { Atril } from './Atril';
import { Controles } from './Controles';
import { ResultadoRonda } from './ResultadoRonda';
import estilos from './PantallaTablero.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function PantallaTablero({ ir }: Props) {
  const { estado } = usarJuego();

  // Si no hay partida activa, vuelve al inicio.
  useEffect(() => {
    if (!estado) ir('inicio');
  }, [estado, ir]);

  if (!estado) return null;

  const jugador = jugadorActual(estado);
  const esMaquina = jugador?.tipo === 'maquina';

  return (
    <div className={estilos.tablero}>
      <BarraEstado ir={ir} />

      {esMaquina && estado.fase === 'jugando' && (
        <p className={estilos.avisoMaquina} role="note">
          Turno de un jugador controlado por la máquina. La automatización se añade en una fase
          posterior; por ahora puedes jugar su turno manualmente.
        </p>
      )}

      <PanelOponentes />
      <Mesa />
      <Atril />
      <Controles />

      <ResultadoRonda ir={ir} />
    </div>
  );
}
