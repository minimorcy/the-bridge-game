# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Explicación de tragos al cruzar fallando
WHEN a failed guess makes the player cross the bridge, the drink notice SHALL show a "?" button instead of the reason,
and WHEN the user taps it, the system SHALL show "¿Quieres saber por qué bebes <n>?" followed by the breakdown: the drinks for the fail plus 1 for crossing the bridge.

#### Scenario: Fallo en la posición 3
GIVEN the player is at position 3
WHEN the player fails
THEN the notice says "¡Bebe 2 tragos!" with a "?" button
AND tapping it shows "¿Quieres saber por qué bebes dos? Porque has fallado (🍺 1) y pasas el puente (🍺 1)."

#### Scenario: Fallo sin cruzar
GIVEN the player is at position 2
WHEN the player fails
THEN the notice shows the reason directly and no "?" button
