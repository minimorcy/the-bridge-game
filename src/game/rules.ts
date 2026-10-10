import { SUITS, type Card, type Suit } from './deck';

export type CompareGuess = 'mayor' | 'menor' | 'igual';
export type ParityGuess = 'par' | 'impar';
export type Guess = CompareGuess | ParityGuess | Suit;

/** Índice de posición 0..3 (posiciones 1..4 del juego). */
export type Position = 0 | 1 | 2 | 3;

export function allowedGuesses(position: Position): readonly Guess[] {
  if (position <= 1) return ['mayor', 'menor', 'igual'];
  if (position === 2) return ['par', 'impar'];
  return SUITS;
}

export function evaluate(position: Position, guess: Guess, visible: Card, drawn: Card): boolean {
  if (!allowedGuesses(position).includes(guess)) {
    throw new Error(`Apuesta "${guess}" no válida en la posición ${position + 1}`);
  }
  switch (guess) {
    case 'mayor':
      return drawn.value > visible.value;
    case 'menor':
      return drawn.value < visible.value;
    case 'igual':
      return drawn.value === visible.value;
    case 'par':
      return drawn.value % 2 === 0;
    case 'impar':
      return drawn.value % 2 === 1;
    default:
      return drawn.suit === guess;
  }
}

/** Puente entre las posiciones 2 y 3 (índices 1 y 2). */
export function crossesBridge(from: Position, to: Position): boolean {
  return (from === 1 && to === 2) || (from === 2 && to === 1);
}
