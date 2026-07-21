/**
 * Aviso de actualización de la PWA. Cuando hay una versión nueva del service
 * worker, ofrece recargar para aplicarla; también avisa cuando la app queda
 * lista para funcionar sin conexión.
 */
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Boton } from './Boton';
import estilos from './AvisoActualizacion.module.css';

export function AvisoActualizacion() {
  const {
    needRefresh: [necesitaActualizar, setNecesitaActualizar],
    offlineReady: [listoSinConexion, setListoSinConexion],
    updateServiceWorker,
  } = useRegisterSW();

  if (!necesitaActualizar && !listoSinConexion) return null;

  return (
    <div className={estilos.aviso} role="status" aria-live="polite">
      {necesitaActualizar ? (
        <>
          <span>Hay una actualización disponible.</span>
          <div className={estilos.acciones}>
            <Boton variante="primario" onClick={() => void updateServiceWorker(true)}>
              Actualizar
            </Boton>
            <Boton variante="fantasma" onClick={() => setNecesitaActualizar(false)}>
              Ahora no
            </Boton>
          </div>
        </>
      ) : (
        <>
          <span>La aplicación está lista para usarse sin conexión.</span>
          <Boton variante="fantasma" onClick={() => setListoSinConexion(false)}>
            Entendido
          </Boton>
        </>
      )}
    </div>
  );
}
