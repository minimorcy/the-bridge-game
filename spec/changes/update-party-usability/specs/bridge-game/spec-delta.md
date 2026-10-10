# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Menú de configuración persistente
The system SHALL provide a configuration menu grouped in sections (Partida, Mesa, Reglas extra) whose values persist in the browser between sessions,
and IF browser storage is unavailable, the system SHALL keep the values in memory for the session and use defaults on next load.

#### Scenario: Persistencia
GIVEN the user disables "Deshacer" in the configuration menu
WHEN the app is reloaded
THEN "Deshacer" remains disabled

#### Scenario: Sin almacenamiento
GIVEN the browser blocks storage
WHEN the app loads
THEN the app works with default settings

### Requirement: Deshacer último robo
WHERE "Deshacer" is enabled (default), WHEN the user undoes after a draw, the system SHALL restore the exact state before that draw (cards, position, drinks).
The system SHALL allow only one undo per draw and SHALL NOT offer undo once the game has ended.

#### Scenario: Toque accidental
GIVEN the player failed at position 3 and drank 2
WHEN the user taps "Deshacer"
THEN the player is back at position 3 with the previous visible card and drink count
AND the undo option is no longer available until the next draw

#### Scenario: Deshacer desactivado
GIVEN "Deshacer" is disabled
WHEN a draw happens
THEN no undo option is shown

### Requirement: Pantalla siempre encendida
WHERE "Pantalla siempre encendida" is enabled (default) and the browser supports it, the system SHALL keep the screen awake while the app is visible, re-acquiring the lock when the app becomes visible again.

#### Scenario: Volver a la app
GIVEN the setting is enabled
WHEN the user switches apps and comes back
THEN the screen wake lock is requested again

### Requirement: Modo apaisado
WHILE the device is in landscape orientation, the system SHALL size cards using the available height so that the board fills the screen without scrolling.

#### Scenario: Móvil en horizontal
GIVEN a phone of 740×360 px in landscape
WHEN the board is shown
THEN cards are larger than in portrait and the board and controls fit without vertical scrolling of the board

## MODIFIED Requirements

### Requirement: Nueva partida y opciones
**Previous**: Options menu only with deck size.

The system SHALL provide a "Nueva partida" action at any time and the configuration menu (see "Menú de configuración persistente"); WHEN the deck size or players change, the system SHALL apply them on the next new game.

#### Scenario: Cambiar tamaño de baraja
GIVEN a game in progress with 40 cards
WHEN the user selects "48 cartas" and starts a new game
THEN the new game uses a 48-card deck

### Requirement: Aplicación estática sin red
**Previous**: Static files without network calls; no offline support.

The system SHALL run entirely in the browser as static files with no network calls after load, SHALL be installable as a PWA and work offline after the first visit, SHALL be usable on mobile screens (≥ 320 px wide), and SHALL be deployable as a Docker image serving the build with nginx.

#### Scenario: Sin cobertura
GIVEN the app was opened once with network
WHEN the user opens it again without network
THEN the app loads and is fully playable, including card images

#### Scenario: Uso en móvil
GIVEN a phone with a 360 px wide screen
WHEN the user opens the app
THEN the 4 cards, the bridge and the guess controls are visible without horizontal scrolling
