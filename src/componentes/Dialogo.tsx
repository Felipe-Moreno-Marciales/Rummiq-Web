/**
 * Diálogo modal accesible: enfoca su contenido al abrirse, atrapa el foco con
 * Tab, se cierra con Escape (si es cerrable) y devuelve el foco al cerrarse.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import estilos from './Dialogo.module.css';

interface Props {
  readonly titulo: string;
  readonly children: ReactNode;
  readonly onCerrar?: () => void;
  /** Si es cerrable, Escape cierra el diálogo. Por defecto, sí. */
  readonly cerrable?: boolean;
}

const SELECTOR_ENFOCABLES =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialogo({ titulo, children, onCerrar, cerrable = true }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const cierre = useRef({ cerrable, onCerrar });
  cierre.current = { cerrable, onCerrar };

  useEffect(() => {
    const nodo = contenedor.current;
    const elementoPrevio = document.activeElement;
    const enfocables = nodo?.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES);
    (enfocables?.[0] ?? nodo)?.focus();

    function alPulsarTecla(evento: KeyboardEvent) {
      const { cerrable: puedeCerrar, onCerrar: cerrar } = cierre.current;
      if (evento.key === 'Escape' && puedeCerrar && cerrar) {
        cerrar();
        return;
      }
      if (evento.key !== 'Tab' || !nodo) return;
      const foco = Array.from(nodo.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES));
      if (foco.length === 0) return;
      const primero = foco[0]!;
      const ultimo = foco[foco.length - 1]!;
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    nodo?.addEventListener('keydown', alPulsarTecla);
    return () => {
      nodo?.removeEventListener('keydown', alPulsarTecla);
      if (elementoPrevio instanceof HTMLElement) elementoPrevio.focus();
    };
  }, []);

  return (
    <div className={estilos.fondo}>
      <div
        ref={contenedor}
        className={estilos.dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-dialogo"
        tabIndex={-1}
      >
        <h2 id="titulo-dialogo" className={estilos.titulo}>
          {titulo}
        </h2>
        {children}
      </div>
    </div>
  );
}
