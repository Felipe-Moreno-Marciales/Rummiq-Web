/** Pantalla de tablero: compone la mesa, el atril, los oponentes y los controles. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { usarJuego } from '@/ganchos/usarJuego';
import { usarAjustes } from '@/ganchos/usarAjustes';
import { jugadorActual, tablaPosiciones } from '@/dominio/juego/selectores';
import { moverFichas, type Destino } from '@/dominio/juego/movimientos';
import { reproducirSonido } from '@/servicios/audio/sonidos';
import { registrarPartida } from '@/servicios/almacenamiento/almacenamientoEstadisticas';
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

/** Retraso antes de que la máquina juegue su turno (ritmo visual). */
const RETRASO_MAQUINA_MS = 700;

export function PantallaTablero({ ir }: Props) {
  const { estado, despachar, jugarBot } = usarJuego();
  const { ajustes } = usarAjustes();
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

  const jugador = estado ? jugadorActual(estado) : undefined;
  const esTurnoMaquina = estado?.fase === 'jugando' && jugador?.tipo === 'maquina';

  // La máquina juega su turno automáticamente tras un breve retraso.
  useEffect(() => {
    if (!esTurnoMaquina) return;
    const temporizador = setTimeout(() => jugarBot(), RETRASO_MAQUINA_MS);
    return () => clearTimeout(temporizador);
  }, [esTurnoMaquina, idTurno, estado?.rondaActual, jugarBot]);

  const seleccionadas = useMemo(() => new Set(seleccion), [seleccion]);

  const alternar = useCallback((id: IdFicha) => {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const mover = useCallback(
    (destino: Destino, ids: readonly IdFicha[] = seleccion) => {
      if (ids.length === 0 || !estado?.turno) return;
      const zonas = { mesa: estado.turno.mesa, atril: estado.turno.atril };
      const resultado = moverFichas(zonas, ids, destino);
      reproducirSonido('mover', ajustes.sonidos);
      despachar({ tipo: 'ESTABLECER_PROVISIONAL', mesa: resultado.mesa, atril: resultado.atril });
      setSeleccion([]);
    },
    [estado, despachar, seleccion, ajustes.sonidos],
  );

  // Sonido de fin de ronda/partida y registro de estadísticas al terminar.
  const faseAnterior = useRef<string | undefined>(undefined);
  const partidaRegistrada = useRef(false);
  useEffect(() => {
    const fase = estado?.fase;
    if (fase === faseAnterior.current) return;
    faseAnterior.current = fase;
    if (fase === 'jugando') partidaRegistrada.current = false;
    if (fase === 'fin-ronda' || fase === 'fin-partida') {
      reproducirSonido('ganar', ajustes.sonidos);
    }
    if (estado && fase === 'fin-partida' && !partidaRegistrada.current) {
      partidaRegistrada.current = true;
      const posiciones = tablaPosiciones(estado);
      registrarPartida({
        ganador: posiciones[0]?.nombre ?? '',
        jugadores: posiciones.map((p) => ({ nombre: p.nombre, puntos: p.puntos })),
        rondas: estado.config.rondas,
      });
    }
  }, [estado, ajustes.sonidos]);

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

  const haySeleccion = seleccion.length > 0;
  const bloqueado = Boolean(esTurnoMaquina);

  return (
    <div className={estilos.tablero}>
      <BarraEstado ir={ir} />

      <p className="oculto-visualmente" role="status" aria-live="polite">
        {estado.fase === 'jugando' && jugador ? `Turno de ${jugador.nombre}` : ''}
      </p>

      {esTurnoMaquina && (
        <p className={estilos.avisoMaquina} role="note" aria-live="polite">
          {jugador?.nombre} (máquina) está pensando…
        </p>
      )}

      <DndContext sensors={sensores} onDragEnd={alSoltar}>
        <PanelOponentes />
        <Mesa
          seleccionadas={seleccionadas}
          haySeleccion={haySeleccion}
          bloqueado={bloqueado}
          onAlternar={alternar}
          onMover={mover}
        />
        <Atril
          seleccionadas={seleccionadas}
          haySeleccion={haySeleccion}
          bloqueado={bloqueado}
          onAlternar={alternar}
          onMover={mover}
        />
      </DndContext>

      <Controles bloqueado={bloqueado} />

      <ResultadoRonda ir={ir} />
    </div>
  );
}
