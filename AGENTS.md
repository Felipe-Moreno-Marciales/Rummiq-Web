# AGENTS.md

Guía para agentes de IA (y personas) que trabajen en este repositorio.

## Idioma

**Todo el proyecto va en español**: comentarios, JSDoc, textos de la interfaz,
descripciones de pruebas, documentación, identificadores del código (funciones,
tipos, variables, constantes), valores de cadena internos (colores `rojo`,
`azul`, `amarillo`, `negro`; tipos `numero`/`comodin`; códigos de error) y
nombres de archivos y carpetas propios.

Se mantiene en **inglés** solo lo requerido por herramienta o convención fuerte:
palabras clave del lenguaje, APIs de librerías (React, DOM), scripts de npm,
claves de configuración, nombres de archivo impuestos (`main.tsx`, `index.html`,
`vite.config.ts`, `README.md`, etc.) y los prefijos de Conventional Commits.

Los identificadores en español van **sin tilde ni ñ** (por ejemplo,
`TAMANO_MINIMO_COMBINACION`).

## Estructura

- `src/dominio/juego`: núcleo del juego. **Funciones puras e inmutables, sin
  React.** Aquí viven tipos, constantes, generación de fichas, barajado,
  validadores, comodines, puntuación, apertura, mesa, motor, selectores y la IA.
- `src/servicios`: infraestructura (persistencia en `localStorage`, audio, PWA).
- `src/componentes`, `src/caracteristicas`, `src/aplicacion`, `src/ganchos`:
  presentación con React.

## Reglas de trabajo

- No modifiques `LICENSE`.
- Mantén TypeScript estricto; sin `any` sin justificar.
- Estado inmutable y flujo predecible (`useReducer` + Context).
- Accesibilidad: botones reales, teclado, foco, contraste, color con símbolo y
  alternativa por botones al arrastrar y soltar.
- La IA solo usa información propia (su mano y la mesa) y **nunca** debe generar
  estados ilegales.

## Comprobaciones obligatorias antes de terminar

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
```

Cobertura mínima del dominio: 90 %.

## Commits

Conventional Commits con prefijo en inglés y descripción en español, por
ejemplo: `feat(dominio): añade validación de escaleras`.
