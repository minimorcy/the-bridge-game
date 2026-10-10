# Spec Delta: bridge-game

## ADDED Requirements

### Requirement: Jugadores
The system SHALL let the user add and remove up to 12 player names in the configuration menu, rejecting empty names,
and WHEN no players are configured, the system SHALL run in solo mode with a single unnamed player.

#### Scenario: Añadir jugadores
GIVEN the configuration menu is open
WHEN the user adds "Ana" and "Luis" and starts a new game
THEN the game has 2 players in that order

#### Scenario: Nombre vacío
GIVEN the configuration menu is open
WHEN the user tries to add a blank name
THEN no player is added

### Requirement: Turnos
WHILE a multiplayer game is in progress, the system SHALL show whose turn it is and the drinks of every player,
and SHALL credit every drink of a draw to the current player.
WHEN the current player crosses position 4, the system SHALL pass the turn to the next player who has not crossed yet, starting at position 1 with the current visible cards and deck.

#### Scenario: Tragos al jugador actual
GIVEN it is Ana's turn
WHEN Ana fails at position 3
THEN Ana's drink count increases by 2
AND Luis's count is unchanged

#### Scenario: Cambio de turno
GIVEN it is Ana's turn and Luis has not crossed
WHEN Ana guesses correctly at position 4
THEN the screen announces that Ana crossed and that Luis is next
AND Luis starts at position 1 with the same visible cards

### Requirement: Clasificación final
WHEN every player has crossed, the system SHALL show a ranking ordered by drinks ascending, marking the first as "Campeón" and the last as "Esponja de la noche", and offer a new game.

#### Scenario: Fin de partida
GIVEN Ana drank 3 and Luis drank 7 and both crossed
WHEN the ranking is shown
THEN Ana appears first as "Campeón"
AND Luis appears last as "Esponja de la noche"

## MODIFIED Requirements

### Requirement: Victoria
**Previous**: Single player; game ends when position 4 is guessed.

WHEN the guess at position 4 is correct, the system SHALL end the current player's turn showing their drinks;
IF other players have not crossed, the system SHALL continue with the next player; OTHERWISE the system SHALL end the game (solo: victory screen; multiplayer: final ranking) and offer to start a new game.

#### Scenario: Ganar en solitario
GIVEN a solo game at position 4
WHEN the guess is correct
THEN the victory screen is shown with the drink counter
AND no more guesses are accepted until a new game starts
