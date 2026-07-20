/**
 * Representación visual de una ficha. El color se acompaña siempre de un símbolo
 * para no depender únicamente del color (accesibilidad).
 */
import type { ColorFicha, Ficha as TipoFicha, NumeroFicha } from '@/dominio/juego/tipos';
import { esComodin } from '@/dominio/juego/validadores';
import estilos from './Ficha.module.css';

/** Símbolo asociado a cada color, para diferenciarlas sin depender del color. */
const SIMBOLO_COLOR: Record<ColorFicha, string> = {
  rojo: '♦',
  azul: '●',
  amarillo: '▲',
  negro: '■',
};

const NOMBRE_COLOR: Record<ColorFicha, string> = {
  rojo: 'rojo',
  azul: 'azul',
  amarillo: 'amarillo',
  negro: 'negro',
};

interface Props {
  readonly ficha: TipoFicha;
  /** Valor que representa un comodín en su combinación, si se conoce. */
  readonly interpretacion?:
    { readonly numero: NumeroFicha; readonly color: ColorFicha } | undefined;
  readonly seleccionada?: boolean;
}

export function Ficha({ ficha, interpretacion, seleccionada = false }: Props) {
  if (esComodin(ficha)) {
    const etiqueta = interpretacion
      ? `Comodín (representa ${interpretacion.numero} ${NOMBRE_COLOR[interpretacion.color]})`
      : 'Comodín';
    return (
      <span
        className={`${estilos.ficha} ${estilos.comodin} ${seleccionada ? estilos.seleccionada : ''}`}
        data-color={interpretacion?.color}
        aria-label={etiqueta}
      >
        <span className={estilos.numero} aria-hidden="true">
          {interpretacion ? interpretacion.numero : '★'}
        </span>
        <span className={estilos.simbolo} aria-hidden="true">
          {interpretacion ? SIMBOLO_COLOR[interpretacion.color] : '★'}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`${estilos.ficha} ${seleccionada ? estilos.seleccionada : ''}`}
      data-color={ficha.color}
      aria-label={`${ficha.numero} ${NOMBRE_COLOR[ficha.color]}`}
    >
      <span className={estilos.numero} aria-hidden="true">
        {ficha.numero}
      </span>
      <span className={estilos.simbolo} aria-hidden="true">
        {SIMBOLO_COLOR[ficha.color]}
      </span>
    </span>
  );
}
