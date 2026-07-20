/** Barra superior con indicadores de la partida y el turno. */
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import { cantidadPozo, jugadorActual } from '@/dominio/juego/selectores';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './BarraEstado.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function BarraEstado({ ir }: Props) {
  const { estado, salir } = usarJuego();
  if (!estado) return null;

  const jugador = jugadorActual(estado);
  const abierto = jugador ? (estado.haAbierto[jugador.id] ?? false) : false;

  return (
    <header className={estilos.barra}>
      <div className={estilos.info}>
        <span className={estilos.dato}>
          Ronda {estado.rondaActual}/{estado.config.rondas}
        </span>
        <span className={estilos.dato}>Pozo: {cantidadPozo(estado)}</span>
        <span className={`${estilos.dato} ${estilos.turno}`}>
          Turno: {jugador?.nombre ?? '—'}
          {jugador?.tipo === 'maquina' ? ' (máquina)' : ''}
        </span>
        <span className={estilos.dato}>{abierto ? 'Apertura hecha' : 'Apertura pendiente'}</span>
      </div>
      <Boton
        variante="fantasma"
        onClick={() => {
          salir();
          ir('inicio');
        }}
      >
        Menú
      </Boton>
    </header>
  );
}
