# Proposal: Extras de fiesta (sonido, vibración, suspense, reglas extra, récord y compartir)

## Why

Hacer el juego más divertido y con más ambiente en grupo.

**Current state**: Sin sonido ni vibración, la carta aparece al instante, reglas fijas y sin memoria de partidas.

**Desired state**: Efectos de sonido y vibración, revelado con suspense, reglas extra opcionales, récord local y compartir resultado.

## What Changes

Todo lo configurable va en el menú de Configuración:

- **Sonido** (Mesa, activado): efectos sintetizados con Web Audio (sin ficheros): carta, redoble, "glu glu" al beber, fanfarria al cruzar.
- **Vibración** (Mesa, activada): patrones al beber y al cruzar, donde el navegador lo soporte.
- **Suspense** (Mesa, activado): la carta sale boca abajo y se voltea lentamente (~1 s) con redoble; no se aceptan toques durante la animación.
- **Reglas extra** (desactivadas por defecto, cada una con su interruptor):
  - **Igual reparte**: acertar "igual" permite repartir 2 tragos.
  - **As o Rey, doble**: fallar con un As o un Rey cuenta 2 tragos por el fallo.
  - **Puente limpio**: cruzar sin ningún fallo en el turno hace beber 1 trago a todos los demás.
- **Récord** (siempre): menos tragos al cruzar, guardado en el dispositivo; aviso de "¡Nuevo récord!".
- **Compartir** (siempre): resultado por Web Share API o, si no existe, enlace a WhatsApp.

## Impact

### Affected Specifications
- `spec/specs/bridge-game/spec.md` - ADDED efectos, suspense, reglas extra, récord y compartir; MODIFIED "Tragos".

### Affected Code
- `src/game/rules.ts`, `src/game/game.ts`, `src/game/session.ts`, `src/game/record.ts` (nuevo), `src/ui/fx.ts` (nuevo), `src/main.ts`, `src/style.css`.

## Decisiones / supuestos

- "Repartir" en multijugador: se elige a quién (se suman a su cuenta, se puede repartir 2 a uno o 1 y 1). En solitario es solo un aviso.
- "As o Rey, doble" se suma al trago del puente: fallar en la 3 con un Rey = 3 tragos.
- El récord cuenta los tragos del turno de un jugador (desde que empieza hasta que cruza), incluidos los de reglas extra.
- iOS Safari no soporta vibración; se ignora en silencio.

## Timeline Estimate

Medio.

## Risks

- Autoplay de audio bloqueado → el `AudioContext` se crea en el primer toque del usuario.
