/** Pantalla de ajustes: tema, sonidos, animaciones y borrado de datos. */
import { useState } from 'react';
import { Boton } from '@/componentes/Boton';
import { Dialogo } from '@/componentes/Dialogo';
import { usarAjustes } from '@/ganchos/usarAjustes';
import { usarJuego } from '@/ganchos/usarJuego';
import { borrarPartida } from '@/servicios/almacenamiento/almacenamientoPartida';
import { borrarAjustes } from '@/servicios/almacenamiento/almacenamientoAjustes';
import { borrarEstadisticas } from '@/servicios/almacenamiento/almacenamientoEstadisticas';
import { reproducirSonido } from '@/servicios/audio/sonidos';
import type { Acento, Tema } from '@/servicios/almacenamiento/almacenamientoAjustes';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaAjustes.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

const TEMAS: { readonly valor: Tema; readonly etiqueta: string }[] = [
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
  { valor: 'automatico', etiqueta: 'Automático' },
];

const ACENTOS: { readonly valor: Acento; readonly etiqueta: string; readonly colores: string }[] = [
  { valor: 'azul', etiqueta: 'Azul', colores: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
  { valor: 'violeta', etiqueta: 'Violeta', colores: 'linear-gradient(135deg, #6d28d9, #7c3aed)' },
  { valor: 'turquesa', etiqueta: 'Turquesa', colores: 'linear-gradient(135deg, #0e7490, #0891b2)' },
  {
    valor: 'esmeralda',
    etiqueta: 'Esmeralda',
    colores: 'linear-gradient(135deg, #047857, #059669)',
  },
  { valor: 'rosa', etiqueta: 'Rosa', colores: 'linear-gradient(135deg, #be185d, #db2777)' },
  { valor: 'naranja', etiqueta: 'Naranja', colores: 'linear-gradient(135deg, #c2410c, #b45309)' },
];

export function PantallaAjustes({ ir }: Props) {
  const { ajustes, actualizar, restablecer } = usarAjustes();
  const { salir } = usarJuego();
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  function borrarTodo() {
    borrarPartida();
    borrarEstadisticas();
    borrarAjustes();
    restablecer();
    salir();
    setConfirmarBorrado(false);
    ir('inicio');
  }

  return (
    <main className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <header className={estilos.cabecera}>
          <Boton variante="fantasma" onClick={() => ir('inicio')} aria-label="Volver al inicio">
            ← Volver
          </Boton>
          <h1 className={estilos.titulo}>Ajustes</h1>
        </header>

        <fieldset className={estilos.grupo}>
          <legend className={estilos.leyenda}>Tema</legend>
          <div className={estilos.opciones} role="group" aria-label="Tema">
            {TEMAS.map((tema) => (
              <Boton
                key={tema.valor}
                variante={ajustes.tema === tema.valor ? 'primario' : 'secundario'}
                aria-pressed={ajustes.tema === tema.valor}
                onClick={() => actualizar({ tema: tema.valor })}
              >
                {tema.etiqueta}
              </Boton>
            ))}
          </div>
        </fieldset>

        <fieldset className={estilos.grupo}>
          <legend className={estilos.leyenda}>Color de acento</legend>
          <div className={estilos.opciones} role="group" aria-label="Color de acento">
            {ACENTOS.map((acento) => (
              <Boton
                key={acento.valor}
                variante={ajustes.acento === acento.valor ? 'primario' : 'secundario'}
                aria-pressed={ajustes.acento === acento.valor}
                onClick={() => actualizar({ acento: acento.valor })}
              >
                <span
                  className={estilos.muestra}
                  style={{ background: acento.colores }}
                  aria-hidden="true"
                />
                {acento.etiqueta}
              </Boton>
            ))}
          </div>
        </fieldset>

        <div className={estilos.interruptores}>
          <label className={estilos.interruptor}>
            <input
              type="checkbox"
              checked={ajustes.sonidos}
              onChange={(e) => {
                const activo = e.target.checked;
                actualizar({ sonidos: activo });
                if (activo) reproducirSonido('confirmar', true);
              }}
            />
            <span>Sonidos</span>
          </label>
          <label className={estilos.interruptor}>
            <input
              type="checkbox"
              checked={ajustes.animaciones}
              onChange={(e) => actualizar({ animaciones: e.target.checked })}
            />
            <span>Animaciones</span>
          </label>
        </div>

        <section className={estilos.datos}>
          <h2 className={estilos.subtitulo}>Datos</h2>
          <p className={estilos.aviso}>
            Todos tus datos (partida, ajustes y estadísticas) se guardan solo en este navegador.
          </p>
          <Boton variante="peligro" onClick={() => setConfirmarBorrado(true)}>
            Borrar todos los datos
          </Boton>
        </section>
      </div>

      {confirmarBorrado && (
        <Dialogo titulo="Borrar todos los datos" onCerrar={() => setConfirmarBorrado(false)}>
          <p>
            Se borrará la partida en curso, las estadísticas y los ajustes. Esta acción no se puede
            deshacer.
          </p>
          <div className={estilos.accionesDialogo}>
            <Boton variante="peligro" onClick={borrarTodo}>
              Borrar todo
            </Boton>
            <Boton variante="secundario" onClick={() => setConfirmarBorrado(false)}>
              Cancelar
            </Boton>
          </div>
        </Dialogo>
      )}
    </main>
  );
}
