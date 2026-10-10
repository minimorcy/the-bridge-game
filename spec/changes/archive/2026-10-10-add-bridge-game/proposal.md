# Proposal: Juego "El Puente" con baraja española virtual

## Why

Jugamos a "El Puente" con amigos, pero necesita una baraja española y no siempre llevamos una encima.

**Current state**: No existe aplicación; el repositorio solo contiene un README.

**Desired state**: Una web estática, rápida y usable desde el móvil, que simule la baraja y aplique las reglas del juego (incluidos los tragos), desplegable en un VPS con Coolify.

## What Changes

- Baraja española virtual de **40 cartas** (1–7, Sota=10, Caballo=11, Rey=12) por defecto, con opción de **48 cartas** (1–12) en un menú de opciones.
- Tablero con 4 posiciones de cartas boca arriba y una carta boca abajo en horizontal entre la 2ª y la 3ª (**el puente**).
- Reglas por posición:
  - Posiciones 1 y 2: **mayor / menor / igual** respecto a la carta visible.
  - Posición 3: **par / impar**.
  - Posición 4: **palo** (oros, copas, espadas, bastos).
- Cada intento saca una carta nueva que se coloca **encima** de la posición actual (pasa a ser la carta visible de esa posición).
- Acierto → avanza una posición. Fallo → retrocede una posición (en la 1 se queda en la 1).
- **Tragos**: 1 por cada fallo y 1 por cada cruce del puente (2→3 o 3→2); fallar en la 3 suma 2. Aviso visual y contador.
- Acertar en la posición 4 → **victoria**.
- Si la baraja se agota → opción de **continuar con las 4 últimas cartas visibles** (el resto se baraja de nuevo) o empezar una partida nueva.
- Stack: **Vite + TypeScript** (sin framework), lógica pura testeada con **Vitest**, build estático servido con **nginx** vía **Dockerfile** para Coolify.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - Nueva capacidad (todas las reglas del juego y la UI).

### Affected Code
- `src/game/` - Lógica pura (baraja, barajado, motor de reglas, máquina de estados).
- `src/ui/` - Renderizado del tablero, cartas desde un sprite local de baraja española real, menú de opciones.
- `Dockerfile`, `nginx.conf` - Despliegue estático.

### User Impact
- Nuevo juego disponible desde el navegador del móvil, sin instalación ni conexión a servicios externos.

### API Changes
- Ninguna. Sin backend ni llamadas de red.

### Migration Required
- [ ] Database migration
- [ ] API version bump
- [ ] User communication needed
- [x] Documentation updates (README)

## Decisiones / supuestos

- **Igual**: es una tercera opción explícita en posiciones 1 y 2. Si sale igual y el jugador dijo mayor o menor → fallo. Si dijo igual y no sale igual → fallo.
- **Carta del puente**: es una carta real que sale de la baraja al empezar (con 40 cartas quedan 39) y permanece boca abajo, fuera del juego.
- **Rebaraje al agotarse**: se mantienen las 4 cartas visibles, el puente y la posición del jugador; el resto de cartas (incluidas las ya usadas) forman una baraja nueva barajada. El contador de tragos se conserva.
- El valor numérico para par/impar es el número impreso (Sota=10, Caballo=11, Rey=12).

## Timeline Estimate

Pequeño (≈1 día).

## Risks

- Ambigüedad de reglas caseras → documentadas arriba como supuestos; fácil de ajustar.
- Licencia de las ilustraciones → se usa "Baraja española completa" (Wikimedia Commons, CC BY-SA 3.0) sin modificar, con atribución visible en la app y en el README. Peso del PNG ≈1,2 MB, cacheado de forma inmutable por nginx.
