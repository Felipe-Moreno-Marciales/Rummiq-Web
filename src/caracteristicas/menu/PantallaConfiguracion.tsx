/** Pantalla de configuración de la partida. */
import { useMemo, useState } from 'react';
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import type { Dificultad, Jugador, TipoJugador } from '@/dominio/juego/tiposMotor';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaConfiguracion.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

interface ConfigJugador {
  readonly nombre: string;
  readonly tipo: TipoJugador;
  readonly dificultad: Dificultad;
}

const MAX_JUGADORES = 4;
const MIN_JUGADORES = 2;

function jugadorPorDefecto(indice: number): ConfigJugador {
  return { nombre: `Jugador ${indice + 1}`, tipo: 'humano', dificultad: 'media' };
}

export function PantallaConfiguracion({ ir }: Props) {
  const { nuevaPartida } = usarJuego();
  const [numJugadores, setNumJugadores] = useState(2);
  const [jugadores, setJugadores] = useState<ConfigJugador[]>(() => [
    jugadorPorDefecto(0),
    jugadorPorDefecto(1),
    jugadorPorDefecto(2),
    jugadorPorDefecto(3),
  ]);
  const [partidaRapida, setPartidaRapida] = useState(false);
  const [rondas, setRondas] = useState(3);

  const visibles = useMemo(() => jugadores.slice(0, numJugadores), [jugadores, numJugadores]);

  function actualizarJugador(indice: number, cambios: Partial<ConfigJugador>) {
    setJugadores((prev) =>
      prev.map((jugador, i) => (i === indice ? { ...jugador, ...cambios } : jugador)),
    );
  }

  function empezar() {
    const listaJugadores: Jugador[] = visibles.map((jugador, i) => {
      const nombre = jugador.nombre.trim() || `Jugador ${i + 1}`;
      return jugador.tipo === 'maquina'
        ? { id: `j${i + 1}`, nombre, tipo: 'maquina', dificultad: jugador.dificultad }
        : { id: `j${i + 1}`, nombre, tipo: 'humano' };
    });
    nuevaPartida({ jugadores: listaJugadores, rondas: partidaRapida ? 1 : rondas });
    ir('tablero');
  }

  return (
    <main className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <header className={estilos.cabecera}>
          <Boton variante="fantasma" onClick={() => ir('inicio')} aria-label="Volver al inicio">
            ← Volver
          </Boton>
          <h1 className={estilos.titulo}>Configurar partida</h1>
        </header>

        <fieldset className={estilos.grupo}>
          <legend className={estilos.leyenda}>Número de jugadores</legend>
          <div className={estilos.selectorNumero} role="group" aria-label="Número de jugadores">
            {[2, 3, 4].map((n) => (
              <Boton
                key={n}
                variante={numJugadores === n ? 'primario' : 'secundario'}
                aria-pressed={numJugadores === n}
                onClick={() => setNumJugadores(n)}
              >
                {n}
              </Boton>
            ))}
          </div>
        </fieldset>

        <ol className={estilos.listaJugadores}>
          {visibles.map((jugador, i) => (
            <li key={i} className={estilos.jugador}>
              <label className={estilos.campo}>
                <span>Nombre del jugador {i + 1}</span>
                <input
                  className={estilos.entrada}
                  type="text"
                  value={jugador.nombre}
                  maxLength={20}
                  onChange={(e) => actualizarJugador(i, { nombre: e.target.value })}
                />
              </label>
              <label className={estilos.campo}>
                <span>Tipo</span>
                <select
                  className={estilos.entrada}
                  value={jugador.tipo}
                  onChange={(e) => actualizarJugador(i, { tipo: e.target.value as TipoJugador })}
                >
                  <option value="humano">Humano</option>
                  <option value="maquina">Máquina</option>
                </select>
              </label>
              {jugador.tipo === 'maquina' && (
                <label className={estilos.campo}>
                  <span>Dificultad</span>
                  <select
                    className={estilos.entrada}
                    value={jugador.dificultad}
                    onChange={(e) =>
                      actualizarJugador(i, { dificultad: e.target.value as Dificultad })
                    }
                  >
                    <option value="facil">Fácil</option>
                    <option value="media">Media</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </label>
              )}
            </li>
          ))}
        </ol>

        <fieldset className={estilos.grupo}>
          <legend className={estilos.leyenda}>Rondas</legend>
          <label className={estilos.checkbox}>
            <input
              type="checkbox"
              checked={partidaRapida}
              onChange={(e) => setPartidaRapida(e.target.checked)}
            />
            <span>Partida rápida (una sola ronda)</span>
          </label>
          {!partidaRapida && (
            <label className={estilos.campo}>
              <span>Número de rondas: {rondas}</span>
              <input
                type="range"
                min={1}
                max={10}
                value={rondas}
                onChange={(e) => setRondas(Number(e.target.value))}
              />
            </label>
          )}
        </fieldset>

        <Boton variante="primario" anchoCompleto onClick={empezar}>
          Empezar partida
        </Boton>
      </div>
    </main>
  );
}

export { MAX_JUGADORES, MIN_JUGADORES };
