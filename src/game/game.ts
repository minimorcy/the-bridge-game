import { createDeck, sameCard, shuffle, type Card, type DeckSize, type Rng } from './deck';
import { crossesBridge, evaluate, type Guess, type Position } from './rules';

export type Status = 'playing' | 'won' | 'deckEmpty';

export interface Turn {
  guess: Guess;
  drawn: Card;
  correct: boolean;
  from: Position;
  to: Position;
  drinks: number;
  /** Tragos que el jugador puede repartir (regla "Igual reparte"). */
  share: number;
  /** Ha cruzado la posición 4 sin fallar en este turno. */
  clean: boolean;
}

export interface ExtraRules {
  igualReparte: boolean;
  asReyDoble: boolean;
}

export const NO_EXTRA_RULES: ExtraRules = { igualReparte: false, asReyDoble: false };

export interface GameState {
  deckSize: DeckSize;
  deck: Card[];
  /** Cada posición es una pila; la carta visible es la última. */
  piles: [Card[], Card[], Card[], Card[]];
  bridge: Card;
  position: Position;
  /** Tragos y fallos del turno del jugador actual. */
  drinks: number;
  fails: number;
  status: Status;
  lastTurn: Turn | null;
}

export function newGame(deckSize: DeckSize, rng: Rng = Math.random): GameState {
  const deck = shuffle(createDeck(deckSize), rng);
  const piles: GameState['piles'] = [[deck.shift()!], [deck.shift()!], [deck.shift()!], [deck.shift()!]];
  const bridge = deck.shift()!;
  return { deckSize, deck, piles, bridge, position: 0, drinks: 0, fails: 0, status: 'playing', lastTurn: null };
}

export function visibleCards(state: GameState): Card[] {
  return state.piles.map((pile) => pile[pile.length - 1]);
}

export function play(state: GameState, guess: Guess, rules: ExtraRules = NO_EXTRA_RULES): GameState {
  if (state.status !== 'playing') throw new Error(`No se puede jugar en estado "${state.status}"`);
  if (state.deck.length === 0) return { ...state, status: 'deckEmpty' };

  const from = state.position;
  const visible = visibleCards(state)[from];
  const [drawn, ...deck] = state.deck;
  const correct = evaluate(from, guess, visible, drawn);

  const to = (correct ? Math.min(from + 1, 3) : Math.max(from - 1, 0)) as Position;
  const failDrinks = rules.asReyDoble && (drawn.value === 1 || drawn.value === 12) ? 2 : 1;
  const drinks = (correct ? 0 : failDrinks) + (crossesBridge(from, to) ? 1 : 0);
  const won = correct && from === 3;
  const share = rules.igualReparte && correct && guess === 'igual' ? 2 : 0;

  const piles = state.piles.map((pile, i) => (i === from ? [...pile, drawn] : pile)) as GameState['piles'];
  const status: Status = won ? 'won' : deck.length === 0 ? 'deckEmpty' : 'playing';

  return {
    ...state,
    deck,
    piles,
    position: won ? from : to,
    drinks: state.drinks + drinks,
    fails: state.fails + (correct ? 0 : 1),
    status,
    lastTurn: { guess, drawn, correct, from, to: won ? from : to, drinks, share, clean: won && state.fails === 0 },
  };
}

/** Rebaraja todo salvo las 4 cartas visibles y el puente, conservando posición y tragos. */
export function continueWithLastCards(state: GameState, rng: Rng = Math.random): GameState {
  const keep = [...visibleCards(state), state.bridge];
  const deck = shuffle(
    createDeck(state.deckSize).filter((c) => !keep.some((k) => sameCard(k, c))),
    rng,
  );
  const piles = visibleCards(state).map((c) => [c]) as GameState['piles'];
  return { ...state, deck, piles, status: 'playing', lastTurn: null };
}

/** Prepara la mesa para el siguiente jugador: mismas cartas y baraja, desde la posición 1. */
export function startNextTurn(state: GameState): GameState {
  return {
    ...state,
    position: 0,
    drinks: 0,
    fails: 0,
    status: state.deck.length === 0 ? 'deckEmpty' : 'playing',
    lastTurn: null,
  };
}
