# Proposal: Jugar con el móvil en horizontal

## Why

En la mesa el móvil se deja apoyado y en horizontal: las 4 cartas y el puente van en una sola fila y se ven mucho mejor así.

**Current state**: La app está pensada en vertical; en apaisado solo se compacta.

**Desired state**: Por defecto se juega en horizontal y la app pide girar el móvil; quien quiera puede elegir vertical en la configuración.

## What Changes

- **Opción "Orientación"** en Configuración → Mesa: *Horizontal* (por defecto) o *Vertical*.
- **Aviso "Gira el móvil"** en teléfonos en vertical con la opción en horizontal, con el botón "Jugar en vertical".
- **Bloqueo de orientación** cuando el navegador lo permite (Android: pantalla completa o app instalada). En iPhone no existe, así que solo se muestra el aviso.
- **Diseño apaisado**: marcador en la cabecera y controles compactos para que las cartas sean lo más grandes posible sin scroll.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED "Orientación de juego".

### Affected Code
- `src/settings.ts`, `src/main.ts`, `src/style.css`, `src/ui/orientation.ts` (nuevo).

### User Impact
- Quien prefiera vertical tiene que cambiarlo una vez; se guarda en el navegador.

## Decisiones / supuestos

- El aviso solo sale en pantallas táctiles estrechas (móviles). En tablets y ordenador no sale.
- El manifest no fija la orientación, para que la opción "Vertical" funcione también en la app instalada.

## Risks

- El bloqueo de orientación depende del navegador → si falla, se ignora y queda el aviso.
