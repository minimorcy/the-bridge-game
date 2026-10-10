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

### Requirement: Explicación para tontitos
WHEN the user taps "Sigo sin entenderlo" inside the drink explanation, the system SHALL open a modal above the drink notice that explains the same breakdown step by step in a joking tone,
and WHEN the user taps "Pues no…" in that modal, the system SHALL show a final joking message telling the player to just drink.
Closing either modal SHALL return to the drink notice with the explanation open.

#### Scenario: Sigo sin entenderlo
GIVEN the explanation "¿Quieres saber por qué bebes dos?" is visible
WHEN the user taps "Sigo sin entenderlo"
THEN a modal "Vale, vamos despacito…" lists: fallar = beber, al fallar vas para atrás y pasas el puente, pasar el puente = beber, 🍺 + 🍺 = dos

#### Scenario: Rendición
GIVEN the "vamos despacito" modal is open
WHEN the user taps "Pues no…"
THEN the modal says "Mira, da igual. Tú bebe, que ya lo entenderás mañana."
AND "Vale, bebo" returns to the drink notice
