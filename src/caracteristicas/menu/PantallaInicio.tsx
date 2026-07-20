/** Pantalla de inicio: nueva partida, reanudar (si hay guardada) y reglas. */
import { useState } from 'react';
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import { hayPartidaGuardada } from '@/servicios/almacenamiento/almacenamientoPartida';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaInicio.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function PantallaInicio({ ir }: Props) {
  const { reanudar } = usarJuego();
  const [hayGuardada] = useState(() => hayPartidaGuardada());

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
            onClick={() => ir('configuracion')}
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
    </main>
  );
}
