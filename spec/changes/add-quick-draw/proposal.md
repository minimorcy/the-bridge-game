# Proposal: Sacar carta al elegir la apuesta

## Why

Tocar la apuesta y luego la carta son dos toques cuando la posición ya se conoce: el segundo sobra.

## What Changes

- Nueva opción en Configuración → Mesa, **"Sacar al elegir"** (activada por defecto): pulsar mayor/menor/igual, par/impar o un palo saca la carta directamente sobre la posición actual.
- Desactivada, se mantiene el flujo anterior (elegir y tocar la carta).

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED "Sacar al elegir".

### Affected Code
- `src/settings.ts`, `src/main.ts`, README.

## Risks

- Toques accidentales sacan carta → se mitiga con "Deshacer".
