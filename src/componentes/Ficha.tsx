/**
 * Representación visual de una ficha. El color se acompaña siempre de un símbolo
 * para no depender únicamente del color (accesibilidad).
 */
import type { ColorFicha, Ficha as TipoFicha } from '@/dominio/juego/tipos';
import { esComodin } from '@/dominio/juego/validadores';
import { etiquetaFicha, type InterpretacionVisible } from './fichaAccesible';
import estilos from './Ficha.module.css';

/** Símbolo asociado a cada color, para diferenciarlas sin depender del color. */
const SIMBOLO_COLOR: Record<ColorFicha, string> = {
  rojo: '♦',
  azul: '●',
  amarillo: '▲',
  negro: '■',
};

interface Props {
  readonly ficha: TipoFicha;
  /** Valor que representa un comodín en su combinación, si se conoce. */
  readonly interpretacion?: InterpretacionVisible | undefined;
  readonly seleccionada?: boolean;
  /** Si es decorativa, no aporta etiqueta accesible (la aporta el contenedor). */
  readonly decorativa?: boolean;
}

export function Ficha({ ficha, interpretacion, seleccionada = false, decorativa = false }: Props) {
  const comodin = esComodin(ficha);
  const color = comodin ? interpretacion?.color : ficha.color;
  const clases = [
    estilos.ficha,
    comodin ? estilos.comodin : '',
    seleccionada ? estilos.seleccionada : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contenidoNumero = comodin ? (interpretacion ? interpretacion.numero : '★') : ficha.numero;
  const contenidoSimbolo = comodin
    ? interpretacion
      ? SIMBOLO_COLOR[interpretacion.color]
      : '★'
    : SIMBOLO_COLOR[ficha.color];

  const atributosAccesibles = decorativa
    ? { 'aria-hidden': true as const }
    : { 'aria-label': etiquetaFicha(ficha, interpretacion) };

  return (
    <span className={clases} data-color={color} {...atributosAccesibles}>
      <span className={estilos.numero} aria-hidden="true">
        {contenidoNumero}
      </span>
      <span className={estilos.simbolo} aria-hidden="true">
        {contenidoSimbolo}
      </span>
    </span>
  );
}
