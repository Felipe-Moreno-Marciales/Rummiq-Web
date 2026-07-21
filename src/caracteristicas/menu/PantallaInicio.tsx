/** Pantalla de inicio: nueva partida, reanudar (si hay guardada) y reglas. */
import { useState } from 'react';
import { Boton } from '@/componentes/Boton';
import { Dialogo } from '@/componentes/Dialogo';
import { usarJuego } from '@/ganchos/usarJuego';
import {
  borrarPartida,
  hayPartidaGuardada,
} from '@/servicios/almacenamiento/almacenamientoPartida';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaInicio.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function PantallaInicio({ ir }: Props) {
  const { reanudar } = usarJuego();
  const [hayGuardada] = useState(() => hayPartidaGuardada());
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);

  function pulsarNueva() {
    if (hayGuardada) setConfirmarDescarte(true);
    else ir('configuracion');
  }

  return (
    <main className={estilos.contenedor}>
      <section className={estilos.tarjeta} aria-labelledby="titulo-inicio">
        <h1 id="titulo-inicio" className={estilos.titulo}>
          Rummiq Web
        </h1>
        <p className={estilos.lema}>
          Juego de fichas independiente inspirado en los clásicos de tipo rummy.
        </p>

        <nav className={estilos.acciones} aria-label="Menú principal">
          {hayGuardada && (
            <Boton
              variante="primario"
              anchoCompleto
              onClick={() => {
                if (reanudar()) ir('tablero');
              }}
            >
              Reanudar partida
            </Boton>
          )}
          <Boton
            variante={hayGuardada ? 'secundario' : 'primario'}
            anchoCompleto
            onClick={pulsarNueva}
          >
            Nueva partida
          </Boton>
          <Boton variante="secundario" anchoCompleto onClick={() => ir('reglas')}>
            Reglas
          </Boton>
        </nav>

        <p className={estilos.aviso}>
          Implementación no oficial y sin relación con marcas comerciales. Tus partidas se guardan
          solo en este navegador.
        </p>
      </section>

      {confirmarDescarte && (
        <Dialogo titulo="Descartar partida guardada" onCerrar={() => setConfirmarDescarte(false)}>
          <p>
            Tienes una partida guardada. Si empiezas una nueva, se descartará. ¿Quieres continuar?
          </p>
          <div className={estilos.accionesDialogo}>
            <Boton
              variante="peligro"
              onClick={() => {
                borrarPartida();
                setConfirmarDescarte(false);
                ir('configuracion');
              }}
            >
              Descartar y empezar
            </Boton>
            <Boton variante="secundario" onClick={() => setConfirmarDescarte(false)}>
              Cancelar
            </Boton>
          </div>
        </Dialogo>
      )}
    </main>
  );
}
