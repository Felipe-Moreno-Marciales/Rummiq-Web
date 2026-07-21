/**
 * Ficha interactiva: es un `<button>` real (seleccionable con ratón o teclado) y
 * además arrastrable con dnd-kit (ratón, táctil y teclado). La selección por
 * botones es la alternativa accesible completa al arrastrar y soltar.
 */
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Ficha } from './Ficha';
import { etiquetaFicha, type InterpretacionVisible } from './fichaAccesible';
import type { Ficha as TipoFicha, IdFicha } from '@/dominio/juego/tipos';
import estilos from './FichaJugable.module.css';

interface Props {
  readonly ficha: TipoFicha;
  readonly seleccionada: boolean;
  readonly onAlternar: (id: IdFicha) => void;
  readonly interpretacion?: InterpretacionVisible | undefined;
  readonly deshabilitada?: boolean;
}

export function FichaJugable({
  ficha,
  seleccionada,
  onAlternar,
  interpretacion,
  deshabilitada = false,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ficha.id,
    disabled: deshabilitada,
  });

  const estilo = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`${estilos.boton} ${isDragging ? estilos.arrastrando : ''}`}
      style={estilo}
      disabled={deshabilitada}
      onClick={() => onAlternar(ficha.id)}
      {...listeners}
      {...attributes}
      aria-pressed={seleccionada}
      aria-label={etiquetaFicha(ficha, interpretacion)}
    >
      <Ficha ficha={ficha} interpretacion={interpretacion} seleccionada={seleccionada} decorativa />
    </button>
  );
}
