# Arquitectura

Rummiq Web separa el **dominio** (reglas y estado del juego), los **servicios**
(infraestructura) y la **presentación** (React). El objetivo es que las reglas
sean puras, deterministas y comprobables sin necesidad de la interfaz.

## Capas

### Dominio (`src/dominio/juego`)

Funciones puras e inmutables, sin dependencias de React. Piezas principales:

- `tipos.ts`, `constantes.ts`: tipos y constantes centralizadas. Los tipos de
  color y número se derivan de las constantes `as const`.
- `crearConjuntoFichas.ts`: genera las 106 fichas con identificadores únicos y
  estables (`rojo-7-a`, `comodin-a`…).
- `barajar.ts`: Fisher-Yates inmutable con un PRNG (mulberry32) que acepta
  semilla para pruebas reproducibles.
- `validadores.ts`: validación de grupos y escaleras de fichas numéricas.
- `reglasComodines.ts`: interpretación determinista de comodines (ver
  [reglas.md](reglas.md)).
- `puntuacion.ts`, `apertura.ts`, `mesa.ts`: puntuación, apertura de 30 puntos y
  validación de la mesa.
- `motorJuego.ts`: estado de la partida (`EstadoJuego`) y reductor puro
  `reducir(estado, accion)` con turnos, instantáneas, deshacer, robo,
  confirmación, fin de ronda y varias rondas.
- `selectores.ts`: datos derivados para la interfaz (ocultan las fichas de los
  oponentes).
- `bot.ts`: IA local por heurísticas.
- `movimientos.ts`: ayudantes puros para mover fichas entre zonas.

### Servicios (`src/servicios`)

- `almacenamiento/`: persistencia en `localStorage` de la partida, los ajustes y
  las estadísticas, con versión de esquema y validación de datos.
- `audio/`: sonidos sintetizados con la Web Audio API.
- `pwa/`: utilidades del service worker (stub para pruebas).

### Presentación (`src/aplicacion`, `src/caracteristicas`, `src/componentes`, `src/ganchos`)

- `aplicacion/`: enrutado de pantallas por estado y proveedores de contexto
  (juego y ajustes).
- `caracteristicas/`: pantallas por área (juego, menú, ajustes, estadísticas,
  reglas).
- `componentes/`: piezas reutilizables (`Ficha`, `FichaJugable`, `Boton`,
  `Dialogo`, `AvisoActualizacion`).
- `ganchos/`: acceso a los contextos.

## Estado y flujo

El estado del juego se gestiona con `useReducer` sobre el reductor puro del
motor, envuelto por `ProveedorJuego`, que además guarda la partida tras cada
cambio (nunca el trabajo provisional del turno). Los ajustes viven en
`ProveedorAjustes`, que aplica el tema y la preferencia de animaciones al
documento.

### Turnos e instantáneas

Al iniciar un turno se guarda una **instantánea** inmutable del estado
confirmado. Todo el trabajo del turno es provisional; «deshacer» restaura la
instantánea. Para confirmar se exige: conservación de fichas, mesa válida, jugar
al menos una ficha, no dejar un comodín recuperado en el atril y, si el jugador
no ha abierto, sumar al menos 30 puntos con combinaciones nuevas sin tocar la
mesa existente.

## Decisiones

- **Inmutabilidad y determinismo**: facilitan pruebas y persistencia.
- **Sin backend**: la aplicación es un sitio estático; los datos viven en el
  navegador.
- **Base path**: `/rummiq-web/` para GitHub Pages; las rutas de recursos son
  relativas para funcionar en el subdirectorio.
- **Estado global mínimo**: `useReducer` + Context, sin librerías externas de
  estado.
