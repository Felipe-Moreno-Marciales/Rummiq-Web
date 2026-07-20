/** Superposición con el resultado de la ronda o de la partida. */
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import { tablaPosiciones } from '@/dominio/juego/selectores';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './ResultadoRonda.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function ResultadoRonda({ ir }: Props) {
  const { estado, despachar, salir } = usarJuego();
  if (!estado || !estado.resultadoRonda) return null;
  if (estado.fase !== 'fin-ronda' && estado.fase !== 'fin-partida') return null;

  const resultado = estado.resultadoRonda;
  const finPartida = estado.fase === 'fin-partida';
  const nombre = (id: string) => estado.jugadores.find((j) => j.id === id)?.nombre ?? id;
  const posiciones = tablaPosiciones(estado);
  const campeon = posiciones[0];

  return (
    <div
      className={estilos.fondo}
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-resultado"
    >
      <div className={estilos.tarjeta}>
        <h2 id="titulo-resultado" className={estilos.titulo}>
          {finPartida ? 'Fin de la partida' : `Fin de la ronda ${estado.rondaActual}`}
        </h2>
        <p className={estilos.subtitulo}>
          {resultado.motivo === 'bloqueo' ? 'La ronda se bloqueó. ' : ''}
          Ganó la ronda: <strong>{nombre(resultado.idGanador)}</strong>
        </p>

        <h3 className={estilos.seccion}>Puntos de la ronda</h3>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">Jugador</th>
              <th scope="col">Fichas</th>
              <th scope="col">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {resultado.resultados.map((r) => (
              <tr key={r.idJugador}>
                <td>{nombre(r.idJugador)}</td>
                <td>{r.valorAtril}</td>
                <td>{r.puntos > 0 ? `+${r.puntos}` : r.puntos}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3 className={estilos.seccion}>Clasificación</h3>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Jugador</th>
              <th scope="col">Puntos</th>
              <th scope="col">Rondas</th>
            </tr>
          </thead>
          <tbody>
            {posiciones.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.nombre}</td>
                <td>{p.puntos}</td>
                <td>{p.rondasGanadas}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {finPartida && campeon && <p className={estilos.campeon}>🏆 Campeón: {campeon.nombre}</p>}

        <div className={estilos.acciones}>
          {finPartida ? (
            <Boton
              variante="primario"
              onClick={() => {
                salir();
                ir('configuracion');
              }}
            >
              Nueva partida
            </Boton>
          ) : (
            <Boton variante="primario" onClick={() => despachar({ tipo: 'SIGUIENTE_RONDA' })}>
              Siguiente ronda
            </Boton>
          )}
          <Boton
            variante="secundario"
            onClick={() => {
              salir();
              ir('inicio');
            }}
          >
            Volver al menú
          </Boton>
        </div>
      </div>
    </div>
  );
}
