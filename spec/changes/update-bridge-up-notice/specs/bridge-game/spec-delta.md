# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Aviso al cruzar el puente acertando
WHEN a correct guess makes the player cross the bridge, the drink notice SHALL use a celebratory style (🍻, "¡Puente superado!", "Brinda con 1 trago") clearly different from the fail notice,
and the system SHALL keep the fail notice unchanged for failed guesses.

#### Scenario: Acierto en la posición 2
GIVEN the player is at position 2
WHEN the player guesses correctly
THEN the notice shows 🍻 "¡Puente superado!" with "Brinda con 1 trago" and a "¡Salud!" button

#### Scenario: Fallo en la posición 3
GIVEN the player is at position 3
WHEN the player fails
THEN the fail notice "¡Bebe 2 tragos!" with the "?" button is shown
