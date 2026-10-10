# Proposal: Explicar por qué se beben dos al fallar y cruzar el puente

## Why

Al fallar en la posición 3 se beben 2 tragos y siempre hay alguien que pregunta por qué. Mejor que lo explique la app, con un toque de cachondeo.

## What Changes

- En el aviso de beber, cuando el fallo hace cruzar el puente, se oculta el motivo y aparece un botón **"?"**.
- Al pulsarlo: "¿Quieres saber por qué bebes dos? Porque has fallado (🍺 1) y pasas el puente (🍺 1)." (con *As o Rey, doble*, el fallo cuenta 2 y se ve en el desglose).

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED "Explicación de tragos al cruzar fallando".

### Affected Code
- `src/main.ts`, `src/style.css`.
