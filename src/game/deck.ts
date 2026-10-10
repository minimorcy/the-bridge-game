export const SUITS = ['oros', 'copas', 'espadas', 'bastos'] as const;
export type Suit = (typeof SUITS)[number];

export type DeckSize = 40 | 48;

export interface Card {
  value: number;
  suit: Suit;
}

export type Rng = () => number;

const VALUES: Record<DeckSize, number[]> = {
  40: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
  48: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

export function createDeck(size: DeckSize): Card[] {
  return SUITS.flatMap((suit) => VALUES[size].map((value) => ({ value, suit })));
}

/** Fisher–Yates; devuelve una copia barajada. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function sameCard(a: Card, b: Card): boolean {
  return a.value === b.value && a.suit === b.suit;
}
