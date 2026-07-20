/** Atril del jugador actual, con acciones para ordenar las fichas. */
import { Boton } from '@/componentes/Boton';
import { Ficha } from '@/componentes/Ficha';
import { usarJuego } from '@/ganchos/usarJuego';
import { jugadorActual } from '@/dominio/juego/selectores';
import estilos from './Atril.module.css';

export function Atril() {
  const { estado, despachar } = usarJuego();
  const turno = estado?.turno;
  if (!estado || !turno) return null;

  const jugador = jugadorActual(estado);
  const atril = turno.atril;

  return (
    <section className={estilos.atril} aria-labelledby="titulo-atril">
      <div className={estilos.cabecera}>
        <h2 id="titulo-atril" className={estilos.titulo}>
          Atril de {jugador?.nombre ?? '—'}
          <span className={estilos.cantidad}> ({atril.length} fichas)</span>
        </h2>
        <div className={estilos.acciones}>
          <Boton
            variante="secundario"
            onClick={() => despachar({ tipo: 'ORDENAR_ATRIL', criterio: 'numero' })}
          >
            Ordenar por número
          </Boton>
          <Boton
            variante="secundario"
            onClick={() => despachar({ tipo: 'ORDENAR_ATRIL', criterio: 'color' })}
          >
            Ordenar por color
          </Boton>
        </div>
      </div>

      <ul className={estilos.fichas} aria-label="Fichas de tu atril">
        {atril.map((ficha) => (
          <li key={ficha.id}>
            <Ficha ficha={ficha} />
          </li>
        ))}
        {atril.length === 0 && <li className={estilos.vacio}>Sin fichas en el atril.</li>}
      </ul>
    </section>
  );
}
