# Spec Delta: bridge-game

## REMOVED Requirements

### Requirement: Deshacer último robo
**Reason**: Se usaba para hacer trampa; con "Sacar al elegir" no compensa.

## MODIFIED Requirements

### Requirement: Créditos de las cartas
The system SHALL show the card artwork attribution (author, source and CC BY-SA 3.0 license with links) in small text at the end of the configuration menu, and SHALL NOT show it on the game table.

#### Scenario: Ver créditos
GIVEN the user opens ⚙️ Configuración
WHEN the user scrolls to the end
THEN the attribution "Cartas: Baraja española completa (Basquetteur, Germarquezm) · CC BY-SA 3.0" is shown with links
