# Cómo contribuir

¡Gracias por tu interés en Rummiq Web! Este documento explica cómo colaborar.

## Idioma del proyecto

Todo el proyecto está en **español**: comentarios, documentación, textos de la
interfaz, nombres de archivos e identificadores del código (funciones, tipos,
variables) y valores internos. Solo se mantiene en inglés lo que exigen las
herramientas o las convenciones fuertes (palabras clave del lenguaje, APIs de
librerías, scripts de npm, nombres de archivo estándar como `README.md`, y los
prefijos de Conventional Commits). Los identificadores en español van sin tilde
ni ñ (por ejemplo, `TAMANO_MINIMO_COMBINACION`).

## Requisitos

- Node.js 20.19 o superior y npm.

```bash
npm install
```

## Antes de abrir un pull request

Ejecuta y asegúrate de que todo pasa:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
```

Requisitos de calidad:

- Cero errores de TypeScript y de ESLint.
- Código formateado con Prettier.
- Pruebas en verde y cobertura del dominio ≥ 90 %.
- Sin `any` sin justificar, sin `console.log`, sin secretos ni claves.

## Estilo y arquitectura

- Mantén el dominio del juego (`src/dominio/juego`) como funciones puras e
  inmutables, sin dependencias de React.
- Componentes pequeños y reutilizables; usa botones reales, no `div` con
  `onClick`.
- Cuida la accesibilidad: teclado, foco, contraste, color con símbolo y la
  alternativa por botones al arrastrar y soltar.

## Mensajes de commit

Usa [Conventional Commits](https://www.conventionalcommits.org/) con el prefijo
en inglés y la descripción en español. Ejemplos:

- `feat(dominio): añade validación de escaleras con comodines`
- `fix(ui): corrige el foco del diálogo de resultados`
- `docs: amplía la guía de pruebas`

## Informar de errores

Abre una incidencia describiendo qué esperabas, qué ocurrió y cómo reproducirlo
(pasos, navegador y sistema operativo).
