/** Pantalla de tablero: compone la mesa, el atril, los oponentes y los controles. */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { usarJuego } from '@/ganchos/usarJuego';
import { jugadorActual } from '@/dominio/juego/selectores';
import { moverFichas, type Destino } from '@/dominio/juego/movimientos';
import type { IdFicha } from '@/dominio/juego/tipos';
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

function destinoDesdeZona(idZona: string): Destino | null {
  if (idZona === 'atril') return { tipo: 'atril' };
  if (idZona === 'nueva') return { tipo: 'nueva' };
  if (idZona.startsWith('comb:')) return { tipo: 'combinacion', id: idZona.slice('comb:'.length) };
  return null;
}

export function PantallaTablero({ ir }: Props) {
  const { estado, despachar } = usarJuego();
  const [seleccion, setSeleccion] = useState<IdFicha[]>([]);

  // Solo puntero (ratón/táctil): dnd-kit reserva Enter/Espacio para arrastrar con
  // teclado, lo que chocaría con la selección de fichas. El teclado se cubre por
  // completo con la selección y los botones de acción.
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const idTurno = estado?.turno?.idJugador;
  // Al cambiar de turno se limpia la selección.
  useEffect(() => {
    setSeleccion([]);
  }, [idTurno]);

  useEffect(() => {
    if (!estado) ir('inicio');
  }, [estado, ir]);

  const seleccionadas = useMemo(() => new Set(seleccion), [seleccion]);

  const alternar = useCallback((id: IdFicha) => {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const mover = useCallback(
    (destino: Destino, ids: readonly IdFicha[] = seleccion) => {
      if (ids.length === 0 || !estado?.turno) return;
      const zonas = { mesa: estado.turno.mesa, atril: estado.turno.atril };
      const resultado = moverFichas(zonas, ids, destino);
      despachar({ tipo: 'ESTABLECER_PROVISIONAL', mesa: resultado.mesa, atril: resultado.atril });
      setSeleccion([]);
    },
    [estado, despachar, seleccion],
  );

  const alSoltar = useCallback(
    (evento: DragEndEvent) => {
      if (!evento.over) return;
      const destino = destinoDesdeZona(String(evento.over.id));
      if (!destino) return;
      const idArrastrada = String(evento.active.id);
      const ids = seleccion.includes(idArrastrada) ? seleccion : [idArrastrada];
      mover(destino, ids);
    },
    [mover, seleccion],
  );

  if (!estado) return null;

  const jugador = jugadorActual(estado);
  const esMaquina = jugador?.tipo === 'maquina';
  const haySeleccion = seleccion.length > 0;

  return (
    <div className={estilos.tablero}>
      <BarraEstado ir={ir} />

      <p className="oculto-visualmente" role="status" aria-live="polite">
        {estado.fase === 'jugando' && jugador ? `Turno de ${jugador.nombre}` : ''}
      </p>

      {esMaquina && estado.fase === 'jugando' && (
        <p className={estilos.avisoMaquina} role="note">
          Turno de un jugador controlado por la máquina. La automatización se añade en una fase
          posterior; por ahora puedes jugar su turno manualmente.
        </p>
      )}

      <DndContext sensors={sensores} onDragEnd={alSoltar}>
        <PanelOponentes />
        <Mesa
          seleccionadas={seleccionadas}
          haySeleccion={haySeleccion}
          onAlternar={alternar}
          onMover={mover}
        />
        <Atril
          seleccionadas={seleccionadas}
          haySeleccion={haySeleccion}
          onAlternar={alternar}
          onMover={mover}
        />
      </DndContext>

      <Controles />

      <ResultadoRonda ir={ir} />
    </div>
  );
}
