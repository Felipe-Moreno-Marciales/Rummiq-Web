/** Pantalla de reglas del juego. */
import { Boton } from '@/componentes/Boton';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaReglas.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function PantallaReglas({ ir }: Props) {
  return (
    <main className={estilos.contenedor}>
      <article className={estilos.tarjeta}>
        <header className={estilos.cabecera}>
          <Boton variante="fantasma" onClick={() => ir('inicio')} aria-label="Volver al inicio">
            ← Volver
          </Boton>
          <h1 className={estilos.titulo}>Reglas</h1>
        </header>

        <section>
          <h2>Objetivo</h2>
          <p>
            Ser el primero en quedarte sin fichas colocándolas en combinaciones válidas sobre la
            mesa, o terminar con el menor valor en el atril si la partida se bloquea.
          </p>
        </section>

        <section>
          <h2>Las fichas</h2>
          <p>
            Hay 106 fichas: cuatro colores (rojo, azul, amarillo y negro), números del 1 al 13, con
            dos copias de cada combinación, más dos comodines. Cada jugador empieza con 14 fichas.
          </p>
        </section>

        <section>
          <h2>Combinaciones</h2>
          <ul>
            <li>
              <strong>Grupo:</strong> de 3 a 4 fichas del mismo número y todas de distinto color.
            </li>
            <li>
              <strong>Escalera:</strong> 3 o más fichas del mismo color con números consecutivos.
            </li>
          </ul>
        </section>

        <section>
          <h2>Apertura</h2>
          <p>
            Para tu primera jugada debes bajar una o varias combinaciones que sumen al menos 30
            puntos, usando solo fichas de tu atril y sin modificar la mesa. Cada ficha vale su
            número; un comodín vale el número que representa.
          </p>
        </section>

        <section>
          <h2>En tu turno</h2>
          <p>
            Tras abrir, puedes añadir fichas a combinaciones existentes, dividirlas, unirlas y
            reorganizar la mesa, siempre que al confirmar todas las combinaciones sean válidas y
            hayas jugado al menos una ficha. Si no puedes o no quieres jugar, roba una ficha; eso
            termina tu turno.
          </p>
        </section>

        <section>
          <h2>Comodines</h2>
          <p>
            Un comodín representa la ficha que falta en su combinación. Puedes sustituirlo por la
            ficha exacta desde tu atril, pero entonces debes volver a usar el comodín en la mesa ese
            mismo turno. Un comodín que queda en tu atril al final de la ronda vale 30 puntos en tu
            contra.
          </p>
        </section>

        <section>
          <h2>Puntuación</h2>
          <p>
            Cuando alguien se queda sin fichas, gana la ronda y suma el valor de las fichas que les
            quedan a sus rivales, que las restan de su puntuación. Si la partida se bloquea, gana
            quien tenga menor valor en el atril.
          </p>
        </section>
      </article>
    </main>
  );
}
