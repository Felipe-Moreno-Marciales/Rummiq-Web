# Reglas del juego

## Fichas

- 106 fichas: cuatro colores (rojo, azul, amarillo, negro), números del 1 al 13,
  con **dos copias** de cada combinación color+número (104), más **dos
  comodines**.
- Cada ficha tiene un identificador único y estable. Dos fichas con el mismo
  color y número siguen siendo distinguibles.
- Cada jugador empieza con 14 fichas; el resto forma el pozo. El jugador inicial
  se elige al azar (con semilla opcional para reproducir partidas).

## Combinaciones

- **Grupo:** de 3 a 4 fichas con el mismo número y todas de colores distintos.
- **Escalera:** 3 o más fichas del mismo color con números consecutivos, sin
  repetir número. El 1 solo puede ir antes del 2; no hay secuencias circulares
  (12-13-1 no es válida).

La validación de grupos y escaleras de fichas numéricas se hace con semántica de
conjunto: el orden en que se pasan las fichas no afecta al resultado.

## Comodines

Un comodín representa la ficha que falta en su combinación. Las decisiones de
diseño son deterministas e inequívocas:

1. **Grupo:** el comodín toma el número común del grupo y ocupa un color que
   falta, asignado en el orden canónico de los colores. El número es siempre
   inequívoco.
2. **Escalera:** la interpretación es **posicional**. Las fichas numéricas fijan
   el número inicial (`inicio = número − índice`) y cada comodín toma el número
   de su posición. Así, un comodín en un extremo (`4,5,6,C`) o en el medio
   (`4,C,6`) tiene una única interpretación, y se admiten comodines en los
   extremos.
3. **Varios comodines:** se admiten (el juego tiene dos); cada uno recibe su
   interpretación por color (grupo) o por posición (escalera).
4. **Precedencia grupo → escalera:** si una disposición es válida como grupo, se
   interpreta como grupo. El único caso ambiguo posible es una ficha numérica con
   dos comodines (`X, C, C`), que se resuelve como grupo.
5. **Ambigüedad real:** una combinación formada solo por comodines no fija
   ninguna interpretación y se rechaza.
6. **Sustitución:** una ficha del atril que coincide exactamente (color y número)
   con lo que representa un comodín puede sustituirlo. Al recuperarlo, debe
   volver a usarse en la mesa ese mismo turno; no puede quedar en el atril.
7. **Puntuación:** un comodín vale el número que representa en su combinación, y
   30 puntos si permanece en el atril al terminar la ronda.

## Apertura

Antes de completar su apertura, cada jugador debe bajar una o varias
combinaciones válidas que sumen **al menos 30 puntos**, usando solo fichas de su
atril y sin modificar la mesa existente. Cada ficha vale su número; un comodín
vale el número que representa. La apertura puede incluir varias combinaciones en
el mismo turno.

## Turno

Al comenzar el turno se guarda una instantánea del estado confirmado. Durante el
turno, todo es provisional. Tras abrir, se pueden añadir fichas a combinaciones
existentes, dividirlas, unirlas y reorganizar la mesa. Para confirmar:

- Todas las combinaciones de la mesa deben ser válidas (sin fichas sueltas).
- Debe haberse jugado al menos una ficha del atril.
- No se puede confirmar sin cambios.
- Un comodín recuperado no puede quedar en el atril.

Si no se realiza una jugada válida, hay que **robar** una ficha (lo que termina
el turno). Solo se puede **pasar** cuando el pozo está vacío.

## Fin de ronda y puntuación

La ronda termina cuando un jugador se queda sin fichas o cuando el pozo está
vacío y nadie puede jugar (bloqueo).

- **Atril vacío:** quien vacía su atril gana la ronda y suma el valor total de
  las fichas que les quedan a sus rivales; cada rival resta el valor de sus
  fichas. Cada comodín restante vale 30 puntos.
- **Bloqueo:** gana quien tenga el menor valor total en el atril. En caso de
  empate, gana el jugador con menor índice en el orden de la ronda (su turno es
  anterior). El ganador suma el valor de las fichas de los demás.

La partida termina al completar el número de rondas configurado; gana quien tenga
más puntos acumulados.
