# Proposal: Aviso de celebración al cruzar el puente hacia arriba

## Why

Al acertar en la posición 2 se cruza el puente y se bebe 1, pero el aviso era el mismo que el de un fallo (🍺 tambaleándose, "¡Bebe 1 trago!") y parecía que habías fallado.

## What Changes

- Al cruzar el puente **acertando**, el aviso pasa a ser un brindis: 🍻 que salta, "¡Puente superado!", "Has acertado y pasas al otro lado. Brinda con 1 trago 🥂" y botón "¡Salud!".
- Los avisos de fallo (con o sin cruce) no cambian.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED "Aviso al cruzar el puente acertando".

### Affected Code
- `src/main.ts`, `src/style.css`.
