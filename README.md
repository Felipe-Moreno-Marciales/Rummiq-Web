# Rummiq Web

Juego de fichas para navegador, independiente y no oficial, inspirado en los
juegos tradicionales de tipo rummy. Funciona como sitio estático, sin servidor
ni servicios externos: todo ocurre en tu navegador.

> **Aviso de independencia.** Este proyecto es una implementación **no oficial**
> y **sin relación** con Rummikub, Rummi-Q ni ninguna otra marca comercial. La
> identidad visual, los textos, los iconos y los sonidos son originales.

## Características

- Partida local de 2 a 4 jugadores en el mismo dispositivo.
- Jugadores controlados por la máquina (IA local) con dificultad fácil, media o
  difícil, y partidas mixtas de personas y máquinas.
- Nueva partida, reanudación de partida guardada, reinicio de ronda, partida
  rápida y partidas de varias rondas con historial de puntuaciones.
- Comodines con interpretación determinista, apertura de 30 puntos y
  reorganización de la mesa tras abrir.
- Arrastrar y soltar (ratón y táctil) y una alternativa completa por selección y
  botones, totalmente operable con teclado.
- Temas claro, oscuro y automático; sonidos originales; animaciones
  desactivables.
- Instalable como PWA y utilizable sin conexión tras la primera carga.

## Reglas

El resumen de reglas está en la aplicación (pantalla «Reglas») y en detalle en
[docs/reglas.md](docs/reglas.md). En breve:

- 106 fichas: cuatro colores (rojo, azul, amarillo, negro), números del 1 al 13
  con dos copias de cada combinación, más dos comodines.
- **Grupo:** 3 o 4 fichas del mismo número y colores distintos.
- **Escalera:** 3 o más fichas del mismo color con números consecutivos.
- Apertura: bajar combinaciones que sumen al menos 30 puntos usando solo fichas
  del propio atril.

## Tecnologías

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  (estricto) con [Vite](https://vite.dev/).
- [dnd-kit](https://dndkit.com/) para arrastrar y soltar.
- CSS Modules y variables CSS para los temas.
- Web Audio API para los sonidos.
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) para la PWA.
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/).
- ESLint + Prettier. GitHub Actions para CI y despliegue.

## Arquitectura

Separación entre dominio, servicios y presentación. El dominio del juego son
funciones puras e inmutables, sin dependencia de React. Detalle en
[docs/arquitectura.md](docs/arquitectura.md).

## Requisitos

- Node.js 20.19 o superior.
- Gestor de paquetes: **npm** o **pnpm** (ambos funcionan).

## Instalación

Con npm:

```bash
npm install
```

Con pnpm:

```bash
pnpm install
```

> Con pnpm, el repositorio incluye `pnpm-workspace.yaml` con `allowBuilds` para
> autorizar el script de build de `esbuild` (que Vite necesita) y evitar el error
> `ERR_PNPM_IGNORED_BUILDS`.

## Ejecución local

```bash
npm run dev     # o: pnpm run dev
```

Abre la dirección que indica Vite. Ten en cuenta que la aplicación usa el base
path `/rummiq-web/`.

## Scripts

Ejecuta cualquier script con `npm run <script>` o `pnpm <script>`.

| Script                  | Descripción                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Servidor de desarrollo.              |
| `npm run build`         | Compilación de producción.           |
| `npm run preview`       | Sirve la compilación de producción.  |
| `npm run lint`          | ESLint.                              |
| `npm run format`        | Formatea con Prettier.               |
| `npm run format:check`  | Comprueba el formato.                |
| `npm run test`          | Pruebas en modo interactivo.         |
| `npm run test:run`      | Pruebas una vez.                     |
| `npm run test:coverage` | Pruebas con cobertura.               |
| `npm run typecheck`     | Comprobación de tipos de TypeScript. |

## Pruebas y cobertura

```bash
npm run test:run
npm run test:coverage
```

Las pruebas del dominio mantienen una cobertura mínima del 90 %. Más detalle en
[docs/pruebas.md](docs/pruebas.md).

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

La aplicación está pensada para publicarse en
`https://felipe-moreno-marciales.github.io/rummiq-web/`. La configuración usa
`base: "/rummiq-web/"`. Los workflows de `.github/workflows/` preparan la
integración continua y el despliegue con las acciones oficiales de GitHub Pages;
el despliegue y la activación de Pages los decide la persona propietaria.

## Estructura de carpetas

```
src/
  aplicacion/     Enrutado de pantallas y proveedores (contextos)
  caracteristicas/
    juego/        Tablero, mesa, atril, controles y resultados
    menu/         Inicio y configuración de partida
    ajustes/      Pantalla de ajustes
    estadisticas/ Pantalla de estadísticas
    reglas/       Pantalla de reglas
  componentes/    Componentes reutilizables (Ficha, Botón, Diálogo…)
  dominio/juego/  Núcleo del juego (funciones puras, sin React)
  ganchos/        Hooks de acceso a los contextos
  servicios/
    almacenamiento/ Persistencia en localStorage
    audio/          Sonidos con Web Audio API
    pwa/            Utilidades del service worker
  estilos/        Estilos globales y temas
  pruebas/        Utilidades y pruebas de flujo
```

## Accesibilidad

HTML semántico, navegación completa por teclado, foco visible, diálogos con
trampa de foco y cierre con Escape, contraste cuidado, color acompañado siempre
de símbolo, regiones live para anuncios, áreas táctiles cómodas y respeto por
`prefers-reduced-motion`. La alternativa por selección y botones cubre todo lo
que se puede hacer arrastrando.

## Persistencia y privacidad

- La partida, los ajustes y las estadísticas se guardan **solo en tu navegador**
  (`localStorage`), con versión de esquema y validación de los datos.
- No se recopilan datos personales, no hay analítica ni rastreadores, no se carga
  publicidad y no se transmite información de las partidas.

## Limitaciones

- No hay multijugador en línea.
- Los iconos de la PWA son SVG originales; no se generan variantes PNG.

## Hoja de ruta

- Variantes PNG de los iconos para máxima compatibilidad de instalación.
- Nuevas heurísticas y ajustes de la IA.
- Más idiomas de interfaz.

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

## Licencia

Publicado bajo la **GNU General Public License v3.0** (`GPL-3.0-only`). Consulta
el archivo [LICENSE](LICENSE).
