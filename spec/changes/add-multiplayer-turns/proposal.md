# Proposal: Varios jugadores por turnos

## Why

Se juega en grupo pasando el móvil; ahora la app no sabe quién juega ni lleva la cuenta de tragos de cada uno.

**Current state**: Un único contador de tragos anónimo.

**Desired state**: Lista de jugadores, turnos indicados en pantalla, tragos por jugador y clasificación final con campeón y "esponja de la noche".

## What Changes

- Sección **Jugadores** en Configuración → Partida: añadir/quitar nombres (máx. 12). Sin jugadores = modo solitario (comportamiento actual).
- Cada jugador juega su turno desde la posición 1 hasta cruzar las 4 cartas; la mesa (cartas visibles y baraja) continúa para el siguiente.
- Banner "Turno de X" y marcador con los tragos de todos.
- Al cruzar, pantalla del jugador con "Siguiente: Y"; cuando todos han cruzado, **clasificación** ordenada por tragos: 🏆 Campeón (menos tragos) y 🧽 Esponja de la noche (más tragos).

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED jugadores, turnos y clasificación; MODIFIED "Victoria".

### Affected Code
- `src/game/session.ts` (nuevo, lógica pura + tests), `src/main.ts`, `src/settings.ts`.

## Decisiones / supuestos

- El turno de cada jugador dura hasta que cruza las 4 cartas (no cambia de jugador al fallar).
- Empates en la clasificación: comparten puesto; el orden entre empatados es el orden de juego.
- Si la baraja se agota, se aplica la regla existente sin cambiar de jugador.

## Timeline Estimate

Pequeño-medio.

## Risks

- Partidas largas con muchos jugadores → se puede terminar en cualquier momento con "Nueva partida".
