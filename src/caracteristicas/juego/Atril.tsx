/** Atril del jugador actual: fichas seleccionables/arrastrables y acciones. */
import { useDroppable } from '@dnd-kit/core';
import { Boton } from '@/componentes/Boton';
import { FichaJugable } from '@/componentes/FichaJugable';
import { usarJuego } from '@/ganchos/usarJuego';
import { jugadorActual } from '@/dominio/juego/selectores';
import type { Destino } from '@/dominio/juego/movimientos';
import type { IdFicha } from '@/dominio/juego/tipos';
import estilos from './Atril.module.css';

interface Props {
  readonly seleccionadas: ReadonlySet<IdFicha>;
  readonly haySeleccion: boolean;
  readonly onAlternar: (id: IdFicha) => void;
  readonly onMover: (destino: Destino) => void;
}

export function Atril({ seleccionadas, haySeleccion, onAlternar, onMover }: Props) {
  const { estado, despachar } = usarJuego();
  const { setNodeRef, isOver } = useDroppable({ id: 'atril' });
  const turno = estado?.turno;
  if (!estado || !turno) return null;

  const jugador = jugadorActual(estado);

  return (
    <section className={estilos.atril} aria-labelledby="titulo-atril">
      <div className={estilos.cabecera}>
        <h2 id="titulo-atril" className={estilos.titulo}>
          Atril de {jugador?.nombre ?? '—'}
          <span className={estilos.cantidad}> ({turno.atril.length} fichas)</span>
        </h2>
        <div className={estilos.acciones}>
          <Boton
            variante="secundario"
            onClick={() => onMover({ tipo: 'nueva' })}
            disabled={!haySeleccion}
          >
            Crear combinación
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => onMover({ tipo: 'atril' })}
            disabled={!haySeleccion}
          >
            Devolver al atril
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => despachar({ tipo: 'ORDENAR_ATRIL', criterio: 'numero' })}
          >
            Ordenar nº
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => despachar({ tipo: 'ORDENAR_ATRIL', criterio: 'color' })}
          >
            Ordenar color
          </Boton>
        </div>
      </div>

      <ul
        ref={setNodeRef}
        className={`${estilos.fichas} ${isOver ? estilos.encima : ''}`}
        aria-label="Fichas de tu atril"
      >
        {turno.atril.map((ficha) => (
          <li key={ficha.id}>
            <FichaJugable
              ficha={ficha}
              seleccionada={seleccionadas.has(ficha.id)}
              onAlternar={onAlternar}
            />
          </li>
        ))}
        {turno.atril.length === 0 && <li className={estilos.vacio}>Sin fichas en el atril.</li>}
      </ul>
    </section>
  );
}
