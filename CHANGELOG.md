# Registro de cambios

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue el [versionado semántico](https://semver.org/lang/es/).

## [Sin publicar]

### Añadido

- Modelo de dominio: 106 fichas con identificadores únicos, barajado
  Fisher-Yates con semilla y validación de grupos y escaleras.
- Reglas avanzadas: comodines deterministas, apertura de 30 puntos, puntuación,
  validación de mesa y fin de ronda.
- Motor de juego: turnos con instantáneas, deshacer, robo, confirmación con
  todas las restricciones, varias rondas y persistencia en `localStorage`.
- Interfaz: pantallas de inicio, configuración, tablero, reglas, ajustes,
  estadísticas y resultados, con diseño adaptable.
- Interacciones: arrastrar y soltar (ratón y táctil) y alternativa accesible por
  selección y botones; diálogos accesibles y regiones live.
- IA local con dificultades fácil, media y difícil.
- Ajustes de tema (claro/oscuro/automático), **color de acento seleccionable**
  (azul, violeta, turquesa, esmeralda, rosa o naranja), sonidos originales con
  Web Audio API y animaciones desactivables; estadísticas y borrado de datos.
- Rediseño visual vibrante con degradados, fichas pulidas y tablero tipo tapete.
- PWA instalable con service worker, aviso de actualización e iconos originales.
- Documentación y workflows de integración continua y despliegue.
- Compatibilidad con pnpm (`pnpm-workspace.yaml` que autoriza el build de
  `esbuild` y `workbox-window` como dependencia directa), además de npm.

[sin publicar]: https://github.com/Felipe-Moreno-Marciales/rummiq-web
