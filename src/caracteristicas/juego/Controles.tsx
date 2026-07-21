/** Controles principales del turno y mensajes de validación. */
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import estilos from './Controles.module.css';

interface Props {
  readonly bloqueado?: boolean;
}

export function Controles({ bloqueado = false }: Props) {
  const { estado, despachar } = usarJuego();
  if (!estado) return null;

  const pozoVacio = estado.pozo.length === 0;

  return (
    <section className={estilos.controles} aria-label="Controles del turno">
      <div className={estilos.botones}>
        <Boton
          variante="primario"
          onClick={() => despachar({ tipo: 'CONFIRMAR' })}
          disabled={bloqueado}
        >
          Confirmar jugada
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => despachar({ tipo: 'ROBAR' })}
          disabled={bloqueado || pozoVacio}
        >
          Robar ficha
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => despachar({ tipo: 'DESHACER_TURNO' })}
          disabled={bloqueado}
        >
          Deshacer turno
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => despachar({ tipo: 'PASAR' })}
          disabled={bloqueado || !pozoVacio}
          title={pozoVacio ? undefined : 'Solo puedes pasar cuando el pozo está vacío'}
        >
          Pasar
        </Boton>
      </div>

      <p className={estilos.mensaje} role="status" aria-live="polite">
        {estado.ultimoError ? estado.ultimoError.mensaje : ''}
      </p>
    </section>
  );
}
