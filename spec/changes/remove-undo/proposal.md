# Proposal: Quitar "Deshacer" y mover los créditos al menú

## Why

Con "Sacar al elegir" el deshacer se usaba para hacer trampa más que para corregir toques, y el pie de créditos ocupaba sitio en la mesa (sobre todo en horizontal).

## What Changes

- **Eliminado** el deshacer: opción, botones (mesa y aviso de beber) e instantánea de estado.
- **Créditos de las cartas** (CC BY-SA 3.0) en pequeño al final del menú ⚙️; se quita el pie de la mesa.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - REMOVED "Deshacer último robo"; MODIFIED "Créditos de las cartas".

### Affected Code
- `src/settings.ts`, `src/main.ts`, `src/style.css`, tests, README.

### User Impact
- Un toque accidental ya no se puede revertir. La opción guardada `undo` se ignora al cargar.
