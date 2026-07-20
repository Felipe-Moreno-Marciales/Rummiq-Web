/** Información compacta de los oponentes (sin revelar sus fichas). */
import { usarJuego } from '@/ganchos/usarJuego';
import { infoOponentes } from '@/dominio/juego/selectores';
import estilos from './PanelOponentes.module.css';

export function PanelOponentes() {
  const { estado } = usarJuego();
  if (!estado?.turno) return null;

  const oponentes = infoOponentes(estado, estado.turno.idJugador);

  return (
    <section className={estilos.panel} aria-labelledby="titulo-oponentes">
      <h2 id="titulo-oponentes" className={estilos.titulo}>
        Oponentes
      </h2>
      <ul className={estilos.lista}>
        {oponentes.map((oponente) => (
          <li
            key={oponente.id}
            className={`${estilos.oponente} ${oponente.esTurno ? estilos.activo : ''}`}
          >
            <span className={estilos.nombre}>{oponente.nombre}</span>
            <span className={estilos.datos}>
              {oponente.cantidadFichas} fichas
              {oponente.haAbierto ? ' · abrió' : ' · sin abrir'}
              {oponente.esTurno ? ' · en turno' : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
