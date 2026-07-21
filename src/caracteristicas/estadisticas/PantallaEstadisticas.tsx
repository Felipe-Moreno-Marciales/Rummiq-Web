/** Pantalla de estadísticas: totales acumulados e historial de partidas. */
import { useState } from 'react';
import { Boton } from '@/componentes/Boton';
import { cargarEstadisticas } from '@/servicios/almacenamiento/almacenamientoEstadisticas';
import type { Pantalla } from '@/aplicacion/pantallas';
import estilos from './PantallaEstadisticas.module.css';

interface Props {
  readonly ir: (pantalla: Pantalla) => void;
}

export function PantallaEstadisticas({ ir }: Props) {
  const [estadisticas] = useState(() => cargarEstadisticas());
  const sinDatos = estadisticas.partidasCompletadas === 0;

  return (
    <main className={estilos.contenedor}>
      <div className={estilos.tarjeta}>
        <header className={estilos.cabecera}>
          <Boton variante="fantasma" onClick={() => ir('inicio')} aria-label="Volver al inicio">
            ← Volver
          </Boton>
          <h1 className={estilos.titulo}>Estadísticas</h1>
        </header>

        <div className={estilos.totales}>
          <div className={estilos.total}>
            <span className={estilos.numero}>{estadisticas.partidasCompletadas}</span>
            <span className={estilos.etiqueta}>Partidas completadas</span>
          </div>
          <div className={estilos.total}>
            <span className={estilos.numero}>{estadisticas.rondasJugadas}</span>
            <span className={estilos.etiqueta}>Rondas jugadas</span>
          </div>
        </div>

        <h2 className={estilos.subtitulo}>Historial reciente</h2>
        {sinDatos ? (
          <p className={estilos.vacio}>Todavía no has terminado ninguna partida.</p>
        ) : (
          <ol className={estilos.historial}>
            {estadisticas.historial.map((partida, indice) => (
              <li key={indice} className={estilos.partida}>
                <span className={estilos.ganador}>🏆 {partida.ganador}</span>
                <span className={estilos.detalle}>
                  {partida.jugadores.map((j) => `${j.nombre}: ${j.puntos}`).join(' · ')}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
