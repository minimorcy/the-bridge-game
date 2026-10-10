# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Sonido y vibración
WHERE "Sonido" is enabled (default), the system SHALL play synthesized sound effects when a card is drawn, when drinks are required and when a player crosses,
and WHERE "Vibración" is enabled (default) and supported, the system SHALL vibrate when drinks are required and when a player crosses.

#### Scenario: Sonido desactivado
GIVEN "Sonido" is disabled
WHEN a card is drawn
THEN no sound is played

### Requirement: Revelado con suspense
WHERE "Suspense" is enabled (default), WHEN a card is drawn, the system SHALL show it face down and flip it over about one second before showing the result, ignoring taps on the board meanwhile.

#### Scenario: Toques durante el volteo
GIVEN "Suspense" is enabled and a card is flipping
WHEN the user taps a guess or the card
THEN nothing happens until the flip ends

### Requirement: Regla extra "Igual reparte"
WHERE "Igual reparte" is enabled, WHEN a guess "igual" is correct, the system SHALL let the current player distribute 2 drinks among the other players (multiplayer) or show a notice (solo).

#### Scenario: Repartir en multijugador
GIVEN "Igual reparte" is enabled and Ana, Luis and Eva play
WHEN Ana guesses "igual" correctly and assigns 2 drinks to Luis
THEN Luis's drink count increases by 2

### Requirement: Regla extra "As o Rey, doble"
WHERE "As o Rey, doble" is enabled, WHEN a guess is incorrect and the drawn card is an As (1) or a Rey (12), the system SHALL count 2 drinks for the failure instead of 1.

#### Scenario: Fallo con Rey cruzando el puente
GIVEN the rule is enabled and the active position is 3
WHEN the guess is incorrect and the drawn card is a Rey
THEN 3 drinks are required (2 for the failure, 1 for the bridge)

### Requirement: Regla extra "Puente limpio"
WHERE "Puente limpio" is enabled, WHEN a player crosses position 4 without any failure during their turn, the system SHALL require 1 drink from every other player (multiplayer) or show a notice (solo).

#### Scenario: Cruce limpio
GIVEN the rule is enabled and Ana has not failed this turn
WHEN Ana guesses correctly at position 4
THEN every other player's drink count increases by 1

### Requirement: Récord
WHEN a player crosses position 4, the system SHALL compare the drinks of that turn with the stored record (fewest drinks) and, IF lower or no record exists, SHALL store it with the player's name and date and announce "¡Nuevo récord!".

#### Scenario: Nuevo récord
GIVEN the stored record is 4 drinks
WHEN a player crosses with 2 drinks in their turn
THEN the record becomes 2 and "¡Nuevo récord!" is shown

### Requirement: Compartir resultado
WHEN the user taps "Compartir" on the end screen, the system SHALL share a text summary via the Web Share API, or IF unavailable, open a WhatsApp share link with that text.

#### Scenario: Sin Web Share
GIVEN a desktop browser without Web Share API
WHEN the user taps "Compartir"
THEN a WhatsApp share link opens with the summary text

## MODIFIED Requirements

### Requirement: Tragos
**Previous**: 1 drink per failure plus 1 per bridge crossing.

WHEN a guess is incorrect, the system SHALL require 1 drink (2 WHERE "As o Rey, doble" applies),
and WHEN the player moves from position 2 to 3 or from position 3 to 2, the system SHALL require 1 additional drink.
WHEN at least one drink is required, the system SHALL show a prominent "¡Bebe!" notice with the number of drinks and add them to the current player's drink counter.

#### Scenario: Fallo cruzando el puente
GIVEN the active position is 3
WHEN the guess is incorrect with a non As/Rey card
THEN the active position becomes 2
AND the notice shows 2 drinks (fallo + puente)

#### Scenario: Acierto sin cruzar el puente
GIVEN the active position is 1
WHEN the guess is correct
THEN no drink notice is shown
