/**
 * Sustituto del módulo virtual `virtual:pwa-register/react` para las pruebas,
 * donde no hay service worker. Devuelve valores inertes con la misma forma.
 */
export function useRegisterSW() {
  return {
    needRefresh: [false, (_valor: boolean) => {}] as [boolean, (valor: boolean) => void],
    offlineReady: [false, (_valor: boolean) => {}] as [boolean, (valor: boolean) => void],
    updateServiceWorker: async (_recargar?: boolean) => {},
  };
}
