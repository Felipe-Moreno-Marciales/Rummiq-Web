/** Mesa central: muestra las combinaciones y marca las inválidas. */
import { Ficha } from '@/componentes/Ficha';
import { usarJuego } from '@/ganchos/usarJuego';
import { combinacionesInvalidasActuales } from '@/dominio/juego/selectores';
import { interpretarCombinacion } from '@/dominio/juego/reglasComodines';
import { esComodin } from '@/dominio/juego/validadores';
import type { Combinacion } from '@/dominio/juego/tiposMotor';
import type { ColorFicha, IdFicha, NumeroFicha } from '@/dominio/juego/tipos';
import estilos from './Mesa.module.css';

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

export function Mesa() {
  const { estado } = usarJuego();
  if (!estado) return null;

  const combinaciones = estado.turno ? estado.turno.mesa : estado.mesa;
  const invalidas = new Set(combinacionesInvalidasActuales(estado));

  return (
    <section className={estilos.mesa} aria-labelledby="titulo-mesa">
      <h2 id="titulo-mesa" className={estilos.titulo}>
        Mesa
      </h2>
      {combinaciones.length === 0 ? (
        <p className={estilos.vacia}>La mesa está vacía. Baja tus combinaciones aquí.</p>
      ) : (
        <ul className={estilos.combinaciones}>
          {combinaciones.map((combinacion, indice) => {
            const invalida = invalidas.has(indice);
            const interpretaciones = interpretacionesComodin(combinacion);
            return (
              <li
                key={combinacion.id}
                className={`${estilos.combinacion} ${invalida ? estilos.invalida : ''}`}
                aria-label={`Combinación ${indice + 1}${invalida ? ' (inválida)' : ''}`}
              >
                {combinacion.fichas.map((ficha) => (
                  <Ficha
                    key={ficha.id}
                    ficha={ficha}
                    interpretacion={esComodin(ficha) ? interpretaciones.get(ficha.id) : undefined}
                  />
                ))}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
