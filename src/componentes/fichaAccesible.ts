/** Utilidades de accesibilidad para las fichas (etiquetas legibles). */
import { esComodin } from '@/dominio/juego/validadores';
import type { ColorFicha, Ficha, NumeroFicha } from '@/dominio/juego/tipos';

/** Interpretación de un comodín (color y número que representa). */
export type InterpretacionVisible = { readonly numero: NumeroFicha; readonly color: ColorFicha };

const NOMBRE_COLOR: Record<ColorFicha, string> = {
  rojo: 'rojo',
  azul: 'azul',
  amarillo: 'amarillo',
  negro: 'negro',
};

/** Texto accesible que describe una ficha. */
export function etiquetaFicha(ficha: Ficha, interpretacion?: InterpretacionVisible): string {
  if (esComodin(ficha)) {
    return interpretacion
      ? `Comodín, representa ${interpretacion.numero} ${NOMBRE_COLOR[interpretacion.color]}`
      : 'Comodín';
  }
  return `${ficha.numero} ${NOMBRE_COLOR[ficha.color]}`;
}
