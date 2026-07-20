/** Botón reutilizable, siempre un elemento `<button>` real. */
import type { ButtonHTMLAttributes } from 'react';
import estilos from './Boton.module.css';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variante?: VarianteBoton;
  readonly anchoCompleto?: boolean;
}

export function Boton({
  variante = 'secundario',
  anchoCompleto = false,
  type,
  className,
  ...resto
}: Props) {
  const clases = [
    estilos.boton,
    estilos[variante],
    anchoCompleto ? estilos.completo : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <button type={type ?? 'button'} className={clases} {...resto} />;
}
