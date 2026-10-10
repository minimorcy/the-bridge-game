import { describe, expect, it } from 'vitest';
import { createDeck, shuffle, type Card, type Suit } from './deck';
import { continueWithLastCards, newGame, play, visibleCards, type GameState } from './game';
import { evaluate, type Position } from './rules';

const c = (value: number, suit: Suit = 'oros'): Card => ({ value, suit });

/** Partida en `position` con `visible` arriba y `drawn` como siguiente carta del mazo. */
function at(position: Position, visible: number, drawn: Card, rest: Card[] = [c(1), c(2)]): GameState {
  const base = newGame(40);
  const piles = base.piles.map((p, i) => (i === position ? [c(visible, 'copas')] : p)) as GameState['piles'];
  return { ...base, piles, position, deck: [drawn, ...rest] };
}

describe('baraja', () => {
  it('40 cartas únicas sin 8 ni 9', () => {
    const deck = createDeck(40);
    expect(deck).toHaveLength(40);
    expect(new Set(deck.map((x) => `${x.value}-${x.suit}`)).size).toBe(40);
    expect(deck.some((x) => x.value === 8 || x.value === 9)).toBe(false);
  });

  it('48 cartas con valores 1–12 por palo', () => {
    const deck = createDeck(48);
    expect(deck).toHaveLength(48);
    expect(deck.filter((x) => x.suit === 'espadas').map((x) => x.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('barajar conserva las cartas', () => {
    const deck = createDeck(40);
    expect(shuffle(deck).sort((a, b) => a.value - b.value || a.suit.localeCompare(b.suit))).toEqual(
      [...deck].sort((a, b) => a.value - b.value || a.suit.localeCompare(b.suit)),
    );
  });
});

describe('preparación', () => {
  it('reparte 4 cartas, el puente (carta real) y deja 35', () => {
    const s = newGame(40);
    expect(s.piles.every((p) => p.length === 1)).toBe(true);
    expect(s.deck).toHaveLength(35);
    expect(s.position).toBe(0);
    expect(s.drinks).toBe(0);
    const all = [...visibleCards(s), s.bridge, ...s.deck];
    expect(new Set(all.map((x) => `${x.value}-${x.suit}`)).size).toBe(40);
  });
});

describe('reglas', () => {
  it('mayor/menor/igual', () => {
    expect(evaluate(0, 'mayor', c(5), c(7))).toBe(true);
    expect(evaluate(1, 'mayor', c(11), c(11))).toBe(false);
    expect(evaluate(1, 'menor', c(11), c(11))).toBe(false);
    expect(evaluate(0, 'igual', c(3), c(3, 'bastos'))).toBe(true);
    expect(evaluate(0, 'igual', c(3), c(4))).toBe(false);
  });

  it('par/impar (Sota=10 es par)', () => {
    expect(evaluate(2, 'par', c(1), c(10))).toBe(true);
    expect(evaluate(2, 'par', c(1), c(7))).toBe(false);
    expect(evaluate(2, 'impar', c(1), c(11))).toBe(true);
  });

  it('palo', () => {
    expect(evaluate(3, 'copas', c(1), c(2, 'copas'))).toBe(true);
    expect(evaluate(3, 'oros', c(1), c(2, 'copas'))).toBe(false);
  });

  it('rechaza apuestas no válidas para la posición', () => {
    expect(() => evaluate(0, 'par', c(1), c(2))).toThrow();
    expect(() => evaluate(2, 'mayor', c(1), c(2))).toThrow();
  });
});

describe('turnos y tragos', () => {
  it('acierto avanza, la carta queda encima y no hay trago', () => {
    const s = play(at(0, 5, c(7)), 'mayor');
    expect(s.position).toBe(1);
    expect(visibleCards(s)[0]).toEqual(c(7));
    expect(s.piles[0]).toHaveLength(2);
    expect(s.lastTurn?.drinks).toBe(0);
  });

  it('fallo en la 1: se queda y bebe 1', () => {
    const s = play(at(0, 5, c(2)), 'mayor');
    expect(s.position).toBe(0);
    expect(s.drinks).toBe(1);
  });

  it('cruce del puente por acierto: bebe 1', () => {
    const s = play(at(1, 5, c(7)), 'mayor');
    expect(s.position).toBe(2);
    expect(s.drinks).toBe(1);
  });

  it('fallo en la 3 cruzando el puente: bebe 2', () => {
    const s = play(at(2, 5, c(7)), 'par');
    expect(s.position).toBe(1);
    expect(s.drinks).toBe(2);
  });

  it('fallo en la 4: vuelve a la 3 y bebe 1', () => {
    const s = play(at(3, 5, c(7, 'oros')), 'copas');
    expect(s.position).toBe(2);
    expect(s.drinks).toBe(1);
  });

  it('acierto en la 4: victoria y no se aceptan más apuestas', () => {
    const s = play(at(3, 5, c(2, 'copas')), 'copas');
    expect(s.status).toBe('won');
    expect(() => play(s, 'oros')).toThrow();
  });
});

describe('baraja agotada', () => {
  it('pasa a deckEmpty al sacar la última carta', () => {
    const s = play(at(0, 5, c(7), []), 'mayor');
    expect(s.status).toBe('deckEmpty');
  });

  it('continuar conserva cartas visibles, posición y tragos; quedan 35', () => {
    const empty: GameState = { ...newGame(40), deck: [], status: 'deckEmpty', position: 2, drinks: 4 };
    const s = continueWithLastCards(empty);
    expect(visibleCards(s)).toEqual(visibleCards(empty));
    expect(s.deck).toHaveLength(35);
    expect(s.position).toBe(2);
    expect(s.drinks).toBe(4);
    expect(s.status).toBe('playing');
    expect(s.deck.some((x) => x.value === s.bridge.value && x.suit === s.bridge.suit)).toBe(false);
  });
});
