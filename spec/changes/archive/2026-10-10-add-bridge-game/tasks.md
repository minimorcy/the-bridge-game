# Implementation Tasks

## Phase 1: Foundation

1. [x] Scaffold de Vite + TypeScript (vanilla) con Vitest; scripts `dev`, `build`, `test`.
2. [x] Modelo de cartas y barajas: tipos `Suit`, `Card`, `DeckSize (40|48)`, `createDeck(size)`, `shuffle(cards, rng)` con RNG inyectable.

## Phase 2: Core Implementation

3. [x] Motor de reglas puro: `evaluate(position, guess, visibleCard, drawnCard) → boolean` (mayor/menor/igual, par/impar, palo).
4. [x] Estado de partida y transiciones: `newGame(size, rng)`, `play(state, guess)` → nuevo estado con avance/retroceso, detección de cruce de puente (trago), victoria y baraja agotada.
5. [x] `continueWithLastCards(state, rng)`: rebarajar manteniendo las 4 cartas visibles, el puente, posición y contador de tragos.

## Phase 3: UI

6. [x] Tablero responsive (móvil primero): 4 cartas + puente horizontal boca abajo; posición actual resaltada.
7. [x] Controles por posición (mayor/menor/igual, par/impar, 4 palos) y animación de la carta nueva colocándose encima.
8. [x] Avisos: acierto/fallo, "¡Bebe un trago! 🍺", contador de tragos, cartas restantes, pantalla de victoria.
9. [x] Menú de opciones (baraja 40/48) y botón "Nueva partida"; diálogo de baraja agotada.

## Phase 4: Quality & Documentation

10. [x] Tests unitarios Vitest de baraja, reglas y transiciones (todos los escenarios de la spec).
11. [x] README con reglas, desarrollo local y despliegue.

## Phase 5: Deployment

12. [x] `Dockerfile` multi-stage (node build → nginx:alpine) + `nginx.conf` (pendiente verificar `docker build`: Docker no disponible en local).
