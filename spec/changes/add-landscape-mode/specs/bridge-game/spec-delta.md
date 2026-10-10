# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Orientación de juego
The system SHALL offer an "Orientación" setting with values "Horizontal" (default) and "Vertical", persisted with the rest of the configuration.
WHERE "Horizontal" is selected, WHILE a phone-sized touch screen is in portrait, the system SHALL show a "Gira el móvil" prompt covering the game, with an option to switch to "Vertical".
WHERE "Horizontal" is selected and the browser supports orientation lock, the system SHALL try to lock the screen in landscape, and IF the lock fails, the system SHALL keep the prompt without showing an error.
WHERE "Vertical" is selected, the system SHALL NOT show the prompt and SHALL adapt the layout to the current orientation.

#### Scenario: Por defecto en horizontal
GIVEN a new user opens the app on a phone held in portrait
WHEN the app loads
THEN the "Gira el móvil" prompt is shown
AND rotating the phone to landscape hides it and shows the table

#### Scenario: Preferir vertical
GIVEN the prompt is shown
WHEN the user taps "Jugar en vertical"
THEN the prompt disappears, the game is playable in portrait
AND the setting stays "Vertical" after reloading

#### Scenario: Sin bloqueo de orientación (iPhone)
GIVEN the browser does not support orientation lock
WHEN "Horizontal" is selected
THEN only the prompt is shown and no error appears

#### Scenario: Apaisado sin scroll
GIVEN a phone in landscape with a viewport of 740×360
WHEN a multiplayer game is shown
THEN the cards, the bridge, the scoreboard and the guess buttons are visible without scrolling
