# Política de seguridad

## Alcance

Rummiq Web es una aplicación estática que se ejecuta por completo en el
navegador. No tiene servidor, no gestiona cuentas ni contraseñas, no recopila
datos personales y no se comunica con servicios externos. Todos los datos
(partida, ajustes y estadísticas) se guardan solo en el `localStorage` del
navegador de cada persona.

Por su naturaleza, la superficie de ataque es limitada. Aun así, agradecemos que
se informe de cualquier problema de seguridad.

## Cómo informar

Si descubres una vulnerabilidad (por ejemplo, un posible XSS, un problema con la
validación de los datos guardados o con el service worker):

1. **No** abras una incidencia pública con los detalles.
2. Utiliza el aviso privado de seguridad de GitHub
   («Report a vulnerability» en la pestaña _Security_ del repositorio) o
   contacta con la persona propietaria del repositorio.
3. Incluye una descripción, los pasos para reproducirlo y el impacto esperado.

Intentaremos responder con prontitud y coordinar una solución antes de hacer
pública la información.

## Buenas prácticas del proyecto

- Sin `eval` ni `innerHTML` con contenido no confiable.
- Validación de todos los datos recuperados de `localStorage`.
- Sin secretos ni claves en el repositorio.
- Dependencias revisadas con `npm audit` (objetivo: sin vulnerabilidades).
