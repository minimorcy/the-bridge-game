# Spec: bridge-game

Juego "El Puente" con baraja española virtual.

## Requirements

### Requirement: Baraja española configurable
The system SHALL use a Spanish deck of 40 cards (values 1–7, 10, 11, 12 in oros, copas, espadas, bastos) by default,
and WHEN the user selects the 48-card option in the options menu, the system SHALL use values 1–12 for every suit.

#### Scenario: Baraja por defecto
GIVEN the user has not changed options
WHEN a new game starts
THEN the deck contains 40 unique cards
AND no card has value 8 or 9

#### Scenario: Baraja de 48
GIVEN the user selects "48 cartas" in the options menu
WHEN a new game starts
THEN the deck contains 48 unique cards with values 1–12 in each of the 4 suits

### Requirement: Preparación del tablero
WHEN a new game starts, the system SHALL shuffle the deck, deal 4 face-up cards to positions 1–4,
deal 1 real card from the deck face-down, placed horizontally between positions 2 and 3 (the bridge), which is removed from play, and set the player at position 1.

#### Scenario: Reparto inicial
GIVEN a freshly shuffled 40-card deck
WHEN a new game starts
THEN positions 1–4 each show one face-up card
AND the bridge shows one face-down card between positions 2 and 3
AND 35 cards remain in the deck
AND the active position is 1
AND the drink counter is 0

### Requirement: Apuesta mayor/menor/igual en posiciones 1 y 2
WHILE the active position is 1 or 2, the system SHALL offer the guesses "mayor", "menor" and "igual",
and WHEN the user guesses, the system SHALL draw a card, place it on top of the active position,
and mark the guess correct only if the drawn value compares to the previously visible value as guessed.

#### Scenario: Acierto mayor
GIVEN position 1 shows a 5
WHEN the user guesses "mayor" and the drawn card is a 7
THEN the guess is correct
AND position 1 now shows the 7

#### Scenario: Igual con apuesta mayor
GIVEN position 2 shows a Caballo (11)
WHEN the user guesses "mayor" and the drawn card is a Caballo
THEN the guess is incorrect

#### Scenario: Acierto igual
GIVEN position 1 shows a 3
WHEN the user guesses "igual" and the drawn card is a 3
THEN the guess is correct

### Requirement: Apuesta par/impar en posición 3
WHILE the active position is 3, the system SHALL offer "par" and "impar",
and WHEN the user guesses, the system SHALL draw a card onto position 3 and mark the guess correct only if the parity of the drawn card's value matches.

#### Scenario: Sota es par
GIVEN the active position is 3
WHEN the user guesses "par" and the drawn card is a Sota (10)
THEN the guess is correct

#### Scenario: Fallo par/impar
GIVEN the active position is 3
WHEN the user guesses "par" and the drawn card is a 7
THEN the guess is incorrect

### Requirement: Apuesta de palo en posición 4
WHILE the active position is 4, the system SHALL offer the four suits,
and WHEN the user guesses, the system SHALL draw a card onto position 4 and mark the guess correct only if the suit matches.

#### Scenario: Acierto de palo
GIVEN the active position is 4
WHEN the user guesses "copas" and the drawn card is the 2 de copas
THEN the guess is correct

### Requirement: Avance y retroceso
WHEN a guess is correct, the system SHALL move the player one position forward,
and WHEN a guess is incorrect, the system SHALL move the player one position back, except at position 1 where the player stays.

#### Scenario: Fallo en la posición 1
GIVEN the active position is 1
WHEN the guess is incorrect
THEN the active position remains 1

#### Scenario: Fallo en la posición 4
GIVEN the active position is 4
WHEN the guess is incorrect
THEN the active position becomes 3

### Requirement: Tragos
WHEN a guess is incorrect, the system SHALL require 1 drink,
and WHEN the player moves from position 2 to 3 or from position 3 to 2, the system SHALL require 1 additional drink.
WHEN at least one drink is required, the system SHALL show a prominent "¡Bebe!" notice with the number of drinks and add them to the drink counter.

#### Scenario: Cruce por acierto
GIVEN the active position is 2
WHEN the guess is correct
THEN the active position becomes 3
AND the notice shows 1 drink
AND the drink counter increases by 1

#### Scenario: Fallo sin cruzar el puente
GIVEN the active position is 4
WHEN the guess is incorrect
THEN the active position becomes 3
AND the notice shows 1 drink
AND the drink counter increases by 1

#### Scenario: Fallo en la posición 1
GIVEN the active position is 1
WHEN the guess is incorrect
THEN the notice shows 1 drink

#### Scenario: Fallo cruzando el puente
GIVEN the active position is 3
WHEN the guess is incorrect
THEN the active position becomes 2
AND the notice shows 2 drinks (fallo + puente)
AND the drink counter increases by 2

#### Scenario: Acierto sin cruzar el puente
GIVEN the active position is 1
WHEN the guess is correct
THEN no drink notice is shown

### Requirement: Victoria
WHEN the guess at position 4 is correct, the system SHALL end the game showing a victory screen with the total drinks and offer to start a new game.

#### Scenario: Ganar la partida
GIVEN the active position is 4
WHEN the guess is correct
THEN the victory screen is shown with the drink counter
AND no more guesses are accepted until a new game starts

### Requirement: Baraja agotada
IF the deck has no cards left when a guess is required, the system SHALL offer "Continuar con las 4 últimas cartas" and "Nueva partida".
WHEN the user chooses to continue, the system SHALL keep the 4 visible cards, the bridge card, the active position and the drink counter,
and build a new shuffled deck from all remaining cards of the configured deck size.

#### Scenario: Continuar tras agotar la baraja
GIVEN a 40-card game with 0 cards left in the deck
WHEN the user chooses "Continuar con las 4 últimas cartas"
THEN positions 1–4 show the same cards as before
AND the deck contains 35 cards (40 minus 4 visible minus the bridge)
AND the active position and drink counter are unchanged

#### Scenario: Nueva partida tras agotar la baraja
GIVEN a game with 0 cards left in the deck
WHEN the user chooses "Nueva partida"
THEN a new game starts as defined in "Preparación del tablero"

### Requirement: Nueva partida y opciones
The system SHALL provide a "Nueva partida" action at any time and an options menu to choose the deck size; WHEN the deck size changes, the system SHALL apply it on the next new game.

#### Scenario: Cambiar tamaño de baraja
GIVEN a game in progress with 40 cards
WHEN the user selects "48 cartas" and starts a new game
THEN the new game uses a 48-card deck

### Requirement: Aspecto de las cartas
The system SHALL render cards with traditional Spanish-deck illustrations from a locally bundled, freely licensed image (with its reverse used for the bridge),
and SHALL display the attribution required by the image license.

#### Scenario: Cartas reconocibles
GIVEN a new game
WHEN the board is shown
THEN each face-up card shows the illustration of its value and suit
AND the bridge shows the card reverse rotated 90°
AND the footer shows the author and CC BY-SA 3.0 license of the illustrations

### Requirement: Aplicación estática sin red
The system SHALL run entirely in the browser as static files, with no network calls after load, usable on mobile screens (≥ 320 px wide), and SHALL be deployable as a Docker image serving the build with nginx.

#### Scenario: Uso en móvil
GIVEN a phone with a 360 px wide screen
WHEN the user opens the app
THEN the 4 cards, the bridge and the guess controls are visible without horizontal scrolling
