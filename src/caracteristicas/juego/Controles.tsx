/** Controles principales del turno y mensajes de validación. */
import { Boton } from '@/componentes/Boton';
import { usarJuego } from '@/ganchos/usarJuego';
import estilos from './Controles.module.css';

export function Controles() {
  const { estado, despachar } = usarJuego();
  if (!estado) return null;

  const pozoVacio = estado.pozo.length === 0;

  return (
    <section className={estilos.controles} aria-label="Controles del turno">
      <div className={estilos.botones}>
        <Boton variante="primario" onClick={() => despachar({ tipo: 'CONFIRMAR' })}>
          Confirmar jugada
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => despachar({ tipo: 'ROBAR' })}
          disabled={pozoVacio}
        >
          Robar ficha
        </Boton>
        <Boton variante="secundario" onClick={() => despachar({ tipo: 'DESHACER_TURNO' })}>
          Deshacer turno
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => despachar({ tipo: 'PASAR' })}
          disabled={!pozoVacio}
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
