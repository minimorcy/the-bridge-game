# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Sacar al elegir
WHERE "Sacar al elegir" is enabled (default), WHEN the user taps an allowed guess, the system SHALL draw a card onto the current position immediately, without requiring a tap on the card.
WHERE it is disabled, the system SHALL require selecting the guess and then tapping the highlighted card.

#### Scenario: Robo directo
GIVEN "Sacar al elegir" is enabled and the player is at position 1
WHEN the user taps "Mayor"
THEN a card is drawn onto position 1 and evaluated as "mayor"

#### Scenario: Robo en dos pasos
GIVEN "Sacar al elegir" is disabled
WHEN the user taps "Mayor"
THEN "Mayor" is selected and no card is drawn until the highlighted card is tapped
