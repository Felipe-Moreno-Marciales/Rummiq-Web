/** Mesa central: combinaciones seleccionables/arrastrables y zonas de soltar. */
import { useDroppable } from '@dnd-kit/core';
import { FichaJugable } from '@/componentes/FichaJugable';
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import { combinacionesInvalidasActuales } from '@/dominio/juego/selectores';
import { interpretarCombinacion } from '@/dominio/juego/reglasComodines';
import { esComodin } from '@/dominio/juego/validadores';
import type { Destino } from '@/dominio/juego/movimientos';
import type { Combinacion } from '@/dominio/juego/tiposMotor';
import type { ColorFicha, IdFicha, NumeroFicha } from '@/dominio/juego/tipos';
import estilos from './Mesa.module.css';

interface PropsMesa {
  readonly seleccionadas: ReadonlySet<IdFicha>;
  readonly haySeleccion: boolean;
  readonly bloqueado?: boolean;
  readonly onAlternar: (id: IdFicha) => void;
  readonly onMover: (destino: Destino) => void;
}

function interpretacionesComodin(
  combinacion: Combinacion,
): Map<IdFicha, { numero: NumeroFicha; color: ColorFicha }> {
  const mapa = new Map<IdFicha, { numero: NumeroFicha; color: ColorFicha }>();
  const resultado = interpretarCombinacion(combinacion.fichas);
  if (resultado.valida) {
    for (const i of resultado.interpretaciones) {
      mapa.set(i.idComodin, { numero: i.numero, color: i.color });
    }
  }
  return mapa;
}

interface PropsCombinacion extends PropsMesa {
  readonly combinacion: Combinacion;
  readonly indice: number;
  readonly invalida: boolean;
}

function CombinacionMesa({
  combinacion,
  indice,
  invalida,
  seleccionadas,
  haySeleccion,
  bloqueado = false,
  onAlternar,
  onMover,
}: PropsCombinacion) {
  const { setNodeRef, isOver } = useDroppable({ id: `comb:${combinacion.id}` });
  const interpretaciones = interpretacionesComodin(combinacion);
  const clases = [
    estilos.combinacion,
    invalida ? estilos.invalida : '',
    isOver ? estilos.encima : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li
      ref={setNodeRef}
      className={clases}
      aria-label={`Combinación ${indice + 1}${invalida ? ' (inválida)' : ''}`}
    >
      <div className={estilos.fichasCombinacion}>
        {combinacion.fichas.map((ficha) => (
          <FichaJugable
            key={ficha.id}
            ficha={ficha}
            seleccionada={seleccionadas.has(ficha.id)}
            onAlternar={onAlternar}
            interpretacion={esComodin(ficha) ? interpretaciones.get(ficha.id) : undefined}
            deshabilitada={bloqueado}
          />
        ))}
      </div>
      {haySeleccion && (
        <Boton
          variante="fantasma"
          className={estilos.anadir}
          onClick={() => onMover({ tipo: 'combinacion', id: combinacion.id })}
          disabled={bloqueado}
        >
          Añadir aquí
        </Boton>
      )}
    </li>
  );
}

export function Mesa({
  seleccionadas,
  haySeleccion,
  bloqueado = false,
  onAlternar,
  onMover,
}: PropsMesa) {
  const { estado } = usarJuego();
  const zonaNueva = useDroppable({ id: 'nueva' });
  if (!estado) return null;

  const combinaciones = estado.turno ? estado.turno.mesa : estado.mesa;
  const invalidas = new Set(combinacionesInvalidasActuales(estado));

  return (
    <section className={estilos.mesa} aria-labelledby="titulo-mesa">
      <h2 id="titulo-mesa" className={estilos.titulo}>
        Mesa
      </h2>
      {combinaciones.length === 0 ? (
        <p className={estilos.vacia}>La mesa está vacía. Crea combinaciones desde tu atril.</p>
      ) : (
        <ul className={estilos.combinaciones}>
          {combinaciones.map((combinacion, indice) => (
            <CombinacionMesa
              key={combinacion.id}
              combinacion={combinacion}
              indice={indice}
              invalida={invalidas.has(indice)}
              seleccionadas={seleccionadas}
              haySeleccion={haySeleccion}
              bloqueado={bloqueado}
              onAlternar={onAlternar}
              onMover={onMover}
            />
          ))}
        </ul>
      )}

      <div
        ref={zonaNueva.setNodeRef}
        className={`${estilos.zonaNueva} ${zonaNueva.isOver ? estilos.encima : ''}`}
      >
        <span>Suelta aquí o pulsa para crear una combinación nueva</span>
        <Boton
          variante="secundario"
          onClick={() => onMover({ tipo: 'nueva' })}
          disabled={!haySeleccion || bloqueado}
        >
          Nueva combinación
        </Boton>
      </div>
    </section>
  );
}
