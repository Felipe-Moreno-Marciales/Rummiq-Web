/**
 * Motor de juego: estado inmutable de la partida y reductor puro que gestiona
 * turnos, instantáneas, deshacer, robo, confirmación de jugadas, cambio de
 * turno, fin de ronda y varias rondas.
 *
 * No depende de React ni de ninguna infraestructura. Todas las funciones son
 * puras y el estado es serializable (para la persistencia, véase
 * `servicios/almacenamiento`).
 *
 * INVARIANTES DEL TURNO
 * - Al iniciar el turno se guarda una instantánea inmutable del estado
 *   confirmado. Todo el trabajo del turno es provisional.
 * - Las fichas se conservan: durante el turno, el conjunto de fichas de la mesa
 *   y del atril del jugador nunca cambia respecto a la instantánea.
 * - Para confirmar: la mesa debe ser válida (sin fichas sueltas), debe haberse
 *   jugado al menos una ficha del atril, un comodín recuperado no puede quedar
 *   en el atril y, si el jugador no ha abierto, las nuevas combinaciones deben
 *   sumar al menos 30 puntos sin modificar la mesa existente.
 * - Si el jugador roba, su turno termina. Solo puede pasar si el pozo está vacío.
 */
import { FICHAS_INICIALES_POR_JUGADOR } from './constantes';
import { crearConjuntoFichas } from './crearConjuntoFichas';
import { barajar, crearGeneradorAleatorio } from './barajar';
import { esComodin, esFichaNumero } from './validadores';
import { validarMesa } from './mesa';
import { evaluarApertura } from './apertura';
import { puntuarRonda } from './puntuacion';
import type { MotivoFinRonda } from './puntuacion';
import type { ColorFicha, Ficha, IdFicha } from './tipos';
import type {
  AccionJuego,
  CodigoErrorJuego,
  Combinacion,
  ConfiguracionPartida,
  CriterioOrden,
  EstadoJuego,
  EstadoTurno,
  MensajeErrorJuego,
  ResultadoConfirmacion,
} from './tiposMotor';

/** Versión del esquema del estado (para persistencia y migraciones). */
export const VERSION_ESQUEMA = 1;

const ORDEN_COLOR: Record<ColorFicha, number> = { rojo: 0, azul: 1, amarillo: 2, negro: 3 };

const MENSAJES_ERROR: Record<CodigoErrorJuego, string> = {
  'mesa-invalida': 'Hay combinaciones inválidas en la mesa.',
  'sin-cambios': 'No se puede confirmar sin hacer cambios.',
  'sin-jugar-ficha': 'Debes jugar al menos una ficha de tu atril o robar.',
  'apertura-insuficiente': 'La apertura debe sumar al menos 30 puntos.',
  'apertura-modifica-mesa': 'No puedes modificar la mesa antes de completar tu apertura.',
  'comodin-no-reubicado': 'Un comodín recuperado debe volver a colocarse en la mesa este turno.',
  'conservacion-fichas': 'El movimiento no conserva las fichas del turno.',
  'pozo-vacio': 'El pozo está vacío; no puedes robar.',
  'no-permitido': 'Acción no permitida en este momento.',
};

function error(
  codigo: CodigoErrorJuego,
  combinacionesInvalidas?: readonly number[],
): MensajeErrorJuego {
  return combinacionesInvalidas === undefined
    ? { codigo, mensaje: MENSAJES_ERROR[codigo] }
    : { codigo, mensaje: MENSAJES_ERROR[codigo], combinacionesInvalidas };
}

// --- Utilidades sobre fichas y combinaciones -------------------------------

function fichasDeMesa(mesa: readonly Combinacion[]): Ficha[] {
  return mesa.flatMap((c) => [...c.fichas]);
}

function idsOrdenados(fichas: readonly Ficha[]): string {
  return fichas
    .map((f) => f.id)
    .sort()
    .join('|');
}

function mismoConjunto(a: readonly Ficha[], b: readonly Ficha[]): boolean {
  return a.length === b.length && idsOrdenados(a) === idsOrdenados(b);
}

function claveCombinacion(combinacion: Combinacion): string {
  return idsOrdenados(combinacion.fichas);
}

function mismasClaves(a: readonly Combinacion[], b: readonly Combinacion[]): boolean {
  const clavesA = a.map(claveCombinacion).sort();
  const clavesB = b.map(claveCombinacion).sort();
  return clavesA.length === clavesB.length && clavesA.every((c, i) => c === clavesB[i]);
}

/** Ordena las fichas por número o color; los comodines van al final. */
export function ordenarFichas(fichas: readonly Ficha[], criterio: CriterioOrden): Ficha[] {
  const numericas = fichas.filter(esFichaNumero);
  const comodines = fichas.filter(esComodin);
  const copia = [...numericas];
  copia.sort((a, b) =>
    criterio === 'numero'
      ? a.numero - b.numero || ORDEN_COLOR[a.color] - ORDEN_COLOR[b.color]
      : ORDEN_COLOR[a.color] - ORDEN_COLOR[b.color] || a.numero - b.numero,
  );
  return [...copia, ...comodines];
}

// --- Creación de partida y rondas ------------------------------------------

function crearTurno(estado: EstadoJuego): EstadoTurno {
  const idJugador = estado.ordenTurnos[estado.turnoActual]!;
  const atril = estado.manos[idJugador] ?? [];
  return {
    idJugador,
    mesa: estado.mesa,
    atril,
    instantanea: {
      mesa: estado.mesa,
      atril,
      haAbierto: estado.haAbierto[idJugador] ?? false,
    },
  };
}

function iniciarRonda(
  config: ConfiguracionPartida,
  semilla: number | string,
  numeroRonda: number,
  puntuaciones: Record<string, number>,
  rondasGanadas: Record<string, number>,
  historialRondas: EstadoJuego['historialRondas'],
): EstadoJuego {
  const generador = crearGeneradorAleatorio(`${semilla}-ronda-${numeroRonda}`);
  const fichas = barajar(crearConjuntoFichas(), generador);
  const jugadores = config.jugadores;

  const manos: Record<string, readonly Ficha[]> = {};
  const haAbierto: Record<string, boolean> = {};
  let cursor = 0;
  for (const jugador of jugadores) {
    manos[jugador.id] = fichas.slice(cursor, cursor + FICHAS_INICIALES_POR_JUGADOR);
    haAbierto[jugador.id] = false;
    cursor += FICHAS_INICIALES_POR_JUGADOR;
  }
  const pozo = fichas.slice(cursor);
  const ordenTurnos = jugadores.map((j) => j.id);
  const turnoActual = Math.floor(generador() * jugadores.length);

  const base: EstadoJuego = {
    version: VERSION_ESQUEMA,
    config,
    jugadores,
    semilla,
    rondaActual: numeroRonda,
    fase: 'jugando',
    mesa: [],
    pozo,
    manos,
    haAbierto,
    ordenTurnos,
    turnoActual,
    pasesConsecutivos: 0,
    turno: null,
    puntuaciones,
    rondasGanadas,
    historialRondas,
    resultadoRonda: null,
    contadorCombinacion: 0,
    ultimoError: null,
  };

  return { ...base, turno: crearTurno(base) };
}

/** Crea una partida nueva a partir de una configuración. */
export function crearPartida(config: ConfiguracionPartida): EstadoJuego {
  const n = config.jugadores.length;
  if (n < 2 || n > 4) {
    throw new Error('Una partida requiere entre 2 y 4 jugadores.');
  }
  if (config.rondas < 1) {
    throw new Error('La partida debe tener al menos una ronda.');
  }
  const semilla = config.semilla ?? Math.floor(Math.random() * 1_000_000_000);
  const puntuaciones: Record<string, number> = {};
  const rondasGanadas: Record<string, number> = {};
  for (const jugador of config.jugadores) {
    puntuaciones[jugador.id] = 0;
    rondasGanadas[jugador.id] = 0;
  }
  return iniciarRonda(config, semilla, 1, puntuaciones, rondasGanadas, []);
}

// --- Confirmación -----------------------------------------------------------

/** Comprueba si la jugada provisional del turno actual se puede confirmar. */
export function evaluarConfirmacion(estado: EstadoJuego): ResultadoConfirmacion {
  const turno = estado.turno;
  if (!turno || estado.fase !== 'jugando') {
    return { permitida: false, error: error('no-permitido') };
  }
  const { mesa, atril, instantanea } = turno;

  const fichasProvisional = [...fichasDeMesa(mesa), ...atril];
  const fichasInstantanea = [...fichasDeMesa(instantanea.mesa), ...instantanea.atril];
  if (!mismoConjunto(fichasProvisional, fichasInstantanea)) {
    return { permitida: false, error: error('conservacion-fichas') };
  }

  const validacionMesa = validarMesa(mesa.map((c) => c.fichas));
  if (!validacionMesa.valida) {
    return {
      permitida: false,
      error: error('mesa-invalida', validacionMesa.combinacionesInvalidas),
    };
  }

  const jugoFicha = atril.length < instantanea.atril.length;
  if (!jugoFicha) {
    const sinCambios =
      mismoConjunto(atril, instantanea.atril) && mismasClaves(mesa, instantanea.mesa);
    return { permitida: false, error: error(sinCambios ? 'sin-cambios' : 'sin-jugar-ficha') };
  }

  const comodinesEnMesaAntes = new Set(
    fichasDeMesa(instantanea.mesa)
      .filter(esComodin)
      .map((f) => f.id),
  );
  const comodinRecuperadoEnAtril = atril.some(
    (f) => esComodin(f) && comodinesEnMesaAntes.has(f.id),
  );
  if (comodinRecuperadoEnAtril) {
    return { permitida: false, error: error('comodin-no-reubicado') };
  }

  const abre = !instantanea.haAbierto;
  if (abre) {
    const clavesRestantes = mesa.map(claveCombinacion);
    for (const clave of instantanea.mesa.map(claveCombinacion)) {
      const indice = clavesRestantes.indexOf(clave);
      if (indice < 0) {
        return { permitida: false, error: error('apertura-modifica-mesa') };
      }
      clavesRestantes.splice(indice, 1);
    }
    const nuevas: Ficha[][] = [];
    const disponibles = [...mesa];
    for (const clave of clavesRestantes) {
      const indice = disponibles.findIndex((c) => claveCombinacion(c) === clave);
      if (indice >= 0) {
        nuevas.push([...disponibles[indice]!.fichas]);
        disponibles.splice(indice, 1);
      }
    }
    if (!evaluarApertura(nuevas).valida) {
      return { permitida: false, error: error('apertura-insuficiente') };
    }
  }

  return { permitida: true, abre };
}

// --- Transiciones de estado -------------------------------------------------

function avanzarTurno(estado: EstadoJuego): EstadoJuego {
  const siguiente = (estado.turnoActual + 1) % estado.ordenTurnos.length;
  const base: EstadoJuego = { ...estado, turnoActual: siguiente, turno: null, ultimoError: null };
  return { ...base, turno: crearTurno(base) };
}

function finalizarRonda(
  estado: EstadoJuego,
  motivo: MotivoFinRonda,
  idGanadorAtrilVacio?: string,
): EstadoJuego {
  const atriles = estado.ordenTurnos.map((id) => ({
    idJugador: id,
    atril: estado.manos[id] ?? [],
  }));
  const resultado = puntuarRonda(atriles, motivo, idGanadorAtrilVacio);

  const puntuaciones = { ...estado.puntuaciones };
  for (const r of resultado.resultados) {
    puntuaciones[r.idJugador] = (puntuaciones[r.idJugador] ?? 0) + r.puntos;
  }
  const rondasGanadas = { ...estado.rondasGanadas };
  rondasGanadas[resultado.idGanador] = (rondasGanadas[resultado.idGanador] ?? 0) + 1;

  const esUltimaRonda = estado.rondaActual >= estado.config.rondas;

  return {
    ...estado,
    fase: esUltimaRonda ? 'fin-partida' : 'fin-ronda',
    turno: null,
    puntuaciones,
    rondasGanadas,
    historialRondas: [...estado.historialRondas, resultado],
    resultadoRonda: resultado,
    ultimoError: null,
  };
}

function establecerProvisional(
  estado: EstadoJuego,
  mesaEntrada: readonly Combinacion[],
  atril: readonly Ficha[],
): EstadoJuego {
  const turno = estado.turno;
  if (!turno) return { ...estado, ultimoError: error('no-permitido') };

  // Normaliza: elimina combinaciones vacías y asegura identificadores únicos.
  let contador = estado.contadorCombinacion;
  const vistos = new Set<string>();
  const mesa: Combinacion[] = [];
  for (const combinacion of mesaEntrada) {
    if (combinacion.fichas.length === 0) continue;
    let id = combinacion.id;
    if (!id || vistos.has(id)) {
      id = `c${contador}`;
      contador += 1;
    }
    vistos.add(id);
    mesa.push({ id, fichas: combinacion.fichas });
  }

  const fichasProvisional = [...fichasDeMesa(mesa), ...atril];
  const fichasInstantanea = [...fichasDeMesa(turno.instantanea.mesa), ...turno.instantanea.atril];
  if (!mismoConjunto(fichasProvisional, fichasInstantanea)) {
    return { ...estado, ultimoError: error('conservacion-fichas') };
  }

  return {
    ...estado,
    contadorCombinacion: contador,
    turno: { ...turno, mesa, atril },
    ultimoError: null,
  };
}

function confirmar(estado: EstadoJuego): EstadoJuego {
  const turno = estado.turno;
  const evaluacion = evaluarConfirmacion(estado);
  if (!turno || !evaluacion.permitida) {
    return {
      ...estado,
      ultimoError: evaluacion.permitida ? error('no-permitido') : evaluacion.error,
    };
  }

  const manos = { ...estado.manos, [turno.idJugador]: turno.atril };
  const haAbierto = evaluacion.abre
    ? { ...estado.haAbierto, [turno.idJugador]: true }
    : estado.haAbierto;

  const comprometido: EstadoJuego = {
    ...estado,
    mesa: turno.mesa,
    manos,
    haAbierto,
    pasesConsecutivos: 0,
    ultimoError: null,
  };

  if (turno.atril.length === 0) {
    return finalizarRonda(comprometido, 'atril-vacio', turno.idJugador);
  }
  return avanzarTurno(comprometido);
}

function robar(estado: EstadoJuego): EstadoJuego {
  const turno = estado.turno;
  if (!turno || estado.fase !== 'jugando') {
    return { ...estado, ultimoError: error('no-permitido') };
  }
  if (estado.pozo.length === 0) {
    return { ...estado, ultimoError: error('pozo-vacio') };
  }
  const fichaRobada = estado.pozo[estado.pozo.length - 1]!;
  const manoActual = estado.manos[turno.idJugador] ?? [];
  const manos = { ...estado.manos, [turno.idJugador]: [...manoActual, fichaRobada] };
  const comprometido: EstadoJuego = {
    ...estado,
    manos,
    pozo: estado.pozo.slice(0, -1),
    pasesConsecutivos: 0,
    ultimoError: null,
  };
  return avanzarTurno(comprometido);
}

function pasar(estado: EstadoJuego): EstadoJuego {
  const turno = estado.turno;
  if (!turno || estado.fase !== 'jugando') {
    return { ...estado, ultimoError: error('no-permitido') };
  }
  if (estado.pozo.length > 0) {
    // Con fichas en el pozo no se puede pasar: hay que jugar o robar.
    return { ...estado, ultimoError: error('no-permitido') };
  }
  const pases = estado.pasesConsecutivos + 1;
  if (pases >= estado.ordenTurnos.length) {
    return finalizarRonda({ ...estado, pasesConsecutivos: pases }, 'bloqueo');
  }
  return avanzarTurno({ ...estado, pasesConsecutivos: pases });
}

// --- Reductor ---------------------------------------------------------------

/** Reductor puro del motor de juego. */
export function reducir(estado: EstadoJuego, accion: AccionJuego): EstadoJuego {
  switch (accion.tipo) {
    case 'ESTABLECER_PROVISIONAL':
      if (estado.fase !== 'jugando') return { ...estado, ultimoError: error('no-permitido') };
      return establecerProvisional(estado, accion.mesa, accion.atril);

    case 'ORDENAR_ATRIL': {
      if (!estado.turno) return { ...estado, ultimoError: error('no-permitido') };
      return {
        ...estado,
        turno: { ...estado.turno, atril: ordenarFichas(estado.turno.atril, accion.criterio) },
        ultimoError: null,
      };
    }

    case 'DESHACER_TURNO': {
      if (!estado.turno) return { ...estado, ultimoError: error('no-permitido') };
      const { instantanea } = estado.turno;
      return {
        ...estado,
        turno: { ...estado.turno, mesa: instantanea.mesa, atril: instantanea.atril },
        ultimoError: null,
      };
    }

    case 'ROBAR':
      return robar(estado);

    case 'CONFIRMAR':
      return confirmar(estado);

    case 'PASAR':
      return pasar(estado);

    case 'SIGUIENTE_RONDA':
      if (estado.fase !== 'fin-ronda') return { ...estado, ultimoError: error('no-permitido') };
      return iniciarRonda(
        estado.config,
        estado.semilla,
        estado.rondaActual + 1,
        estado.puntuaciones,
        estado.rondasGanadas,
        estado.historialRondas,
      );

    case 'REINICIAR_RONDA':
      return iniciarRonda(
        estado.config,
        estado.semilla,
        estado.rondaActual,
        estado.puntuaciones,
        estado.rondasGanadas,
        estado.historialRondas,
      );

    default:
      return estado;
  }
}

/**
 * Devuelve el estado listo para guardar: sin el trabajo provisional del turno
 * ni errores, para no persistir cambios provisionales.
 */
export function estadoParaGuardar(estado: EstadoJuego): EstadoJuego {
  return { ...estado, turno: null, ultimoError: null };
}

/**
 * Reanuda una partida cargada: si está en juego y no tiene turno, reconstruye
 * una instantánea limpia del turno a partir del estado confirmado.
 */
export function reanudarPartida(estado: EstadoJuego): EstadoJuego {
  if (estado.fase === 'jugando' && !estado.turno) {
    return { ...estado, turno: crearTurno(estado) };
  }
  return estado;
}

export type { IdFicha };
