# Pruebas

## Herramientas

- [Vitest](https://vitest.dev/) como ejecutor, con entorno `jsdom`.
- [React Testing Library](https://testing-library.com/) y
  `@testing-library/user-event` para las pruebas de componentes.
- Cobertura con `@vitest/coverage-v8`.

## Comandos

```bash
npm run test        # modo interactivo
npm run test:run    # una ejecución
npm run test:coverage
```

## Objetivos

- **Cobertura mínima del 90 %** en los módulos de dominio (`src/dominio/**`). El
  umbral está configurado en `vite.config.ts` y la ejecución falla si no se
  cumple.
- Pruebas deterministas: el barajado, la IA y las partidas de prueba usan
  semillas o estados construidos a mano.
- La IA **nunca** debe devolver un estado ilegal.

## Qué se cubre

- **Dominio:** creación de 106 fichas e identificadores únicos, Fisher-Yates y
  semillas, validación de grupos y escaleras, comodines (incluida la
  sustitución), apertura de 30 puntos, puntuación, empates, motor (turnos,
  instantáneas, deshacer, robo, paso, fin de ronda y bloqueo), movimientos y
  persistencia (datos corruptos y versión de esquema).
- **IA:** apertura, robo y paso, uso de comodines y **partidas completas** de las
  tres dificultades verificando en cada turno que no hay error, que la mesa es
  válida y que se conservan las 106 fichas.
- **Servicios:** persistencia de partida, ajustes y estadísticas; sonidos
  (con un contexto de audio simulado).
- **Componentes:** navegación, configuración, tablero, mover fichas por
  selección y botones, teclado, diálogos, cambio de tema y borrado de datos.
- **Flujo principal:** un smoke test que configura una partida, entra al tablero
  y roba una ficha.

## Utilidades

`src/pruebas/utilidades.tsx` ofrece `renderAplicacion()` y
`renderConProveedores()`, que envuelven los componentes con los proveedores de
ajustes y de juego. El módulo virtual del service worker se sustituye por un
stub en las pruebas mediante un alias de Vitest.
