import { describe, expect, it } from 'vitest';
import type { Card, Suit } from './deck';
import { play, type GameState } from './game';
import { isNewRecord, loadRecord, submitRecord } from './record';
import type { Position } from './rules';
import {
  addDrinks,
  currentPlayer,
  isFinished,
  newSession,
  nextPlayer,
  nextPlayerIndex,
  playTurn,
  ranking,
  type Session,
  type SessionRules,
} from './session';
import { DEFAULT_SETTINGS, parseSettings } from '../settings';

const c = (value: number, suit: Suit = 'oros'): Card => ({ value, suit });
const NONE: SessionRules = { igualReparte: false, asReyDoble: false, puenteLimpio: false };
const ALL: SessionRules = { igualReparte: true, asReyDoble: true, puenteLimpio: true };

/** Coloca la partida en `position` con `visible` arriba y `drawn` como siguiente carta. */
function setup(game: GameState, position: Position, visible: number, drawn: Card, fails = 0): GameState {
  const piles = game.piles.map((p, i) => (i === position ? [c(visible, 'copas')] : p)) as GameState['piles'];
  return { ...game, piles, position, fails, deck: [drawn, c(1), c(2)] };
}

function at(s: Session, position: Position, visible: number, drawn: Card, fails = 0): Session {
  return { ...s, game: setup(s.game, position, visible, drawn, fails) };
}

describe('reglas extra en el motor', () => {
  const base = newSession([], 40).game;

  it('As o Rey, doble: fallo con Rey en la 3 = 3 tragos', () => {
    const g = play(setup(base, 2, 5, c(12)), 'impar', { igualReparte: false, asReyDoble: true });
    expect(g.lastTurn?.drinks).toBe(3);
  });

  it('As o Rey, doble desactivada: fallo con Rey en la 3 = 2 tragos', () => {
    expect(play(setup(base, 2, 5, c(12)), 'impar').lastTurn?.drinks).toBe(2);
  });

  it('Igual reparte: acertar igual da 2 para repartir', () => {
    const g = play(setup(base, 0, 5, c(5, 'bastos')), 'igual', { igualReparte: true, asReyDoble: false });
    expect(g.lastTurn?.share).toBe(2);
    expect(play(setup(base, 0, 5, c(5, 'bastos')), 'igual').lastTurn?.share).toBe(0);
  });

  it('cruce limpio solo si no hubo fallos en el turno', () => {
    expect(play(setup(base, 3, 5, c(2, 'oros')), 'oros').lastTurn?.clean).toBe(true);
    expect(play(setup(base, 3, 5, c(2, 'oros'), 1), 'oros').lastTurn?.clean).toBe(false);
  });
});

describe('sesión', () => {
  it('sin nombres es modo solitario', () => {
    const s = newSession(['  ', ''], 40);
    expect(s.solo).toBe(true);
    expect(s.players).toHaveLength(1);
  });

  it('los tragos se apuntan al jugador actual', () => {
    let s = at(newSession(['Ana', 'Luis'], 40), 2, 5, c(7));
    s = playTurn(s, 'par', NONE);
    expect(s.players.map((p) => p.drinks)).toEqual([2, 0]);
  });

  it('al cruzar pasa al siguiente desde la posición 1 con las mismas cartas', () => {
    let s = at(newSession(['Ana', 'Luis'], 40), 3, 5, c(2, 'copas'));
    s = playTurn(s, 'copas', NONE);
    expect(s.players[0].crossed).toBe(true);
    expect(nextPlayerIndex(s)).toBe(1);
    const visible = s.game.piles.map((p) => p.at(-1));
    s = nextPlayer(s);
    expect(currentPlayer(s).name).toBe('Luis');
    expect(s.game.position).toBe(0);
    expect(s.game.status).toBe('playing');
    expect(s.game.drinks).toBe(0);
    expect(s.game.piles.map((p) => p.at(-1))).toEqual(visible);
  });

  it('puente limpio: los demás beben 1', () => {
    let s = at(newSession(['Ana', 'Luis', 'Eva'], 40), 3, 5, c(2, 'copas'));
    s = playTurn(s, 'copas', ALL);
    expect(s.players.map((p) => p.drinks)).toEqual([0, 1, 1]);
  });

  it('repartir tragos', () => {
    const s = addDrinks(newSession(['Ana', 'Luis'], 40), 1, 2);
    expect(s.players[1].drinks).toBe(2);
  });

  it('fin de partida y clasificación', () => {
    let s = newSession(['Ana', 'Luis', 'Eva'], 40);
    s = { ...s, players: [
      { name: 'Ana', drinks: 3, crossed: true },
      { name: 'Luis', drinks: 7, crossed: true },
      { name: 'Eva', drinks: 3, crossed: true },
    ] };
    expect(isFinished(s)).toBe(true);
    expect(nextPlayerIndex(s)).toBeNull();
    expect(ranking(s).map((p) => p.name)).toEqual(['Ana', 'Eva', 'Luis']);
  });
});

describe('récord', () => {
  const memory = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  };

  it('guarda solo si mejora', () => {
    const st = memory();
    expect(isNewRecord(null, 5)).toBe(true);
    expect(submitRecord(4, 'Ana', '2026-10-10', st)).toBe(true);
    expect(submitRecord(6, 'Luis', '2026-10-10', st)).toBe(false);
    expect(submitRecord(2, 'Eva', '2026-10-10', st)).toBe(true);
    expect(loadRecord(st)).toEqual({ drinks: 2, name: 'Eva', date: '2026-10-10' });
  });

  it('almacenamiento corrupto o ausente', () => {
    expect(loadRecord({ getItem: () => '{oops' })).toBeNull();
    expect(loadRecord(null)).toBeNull();
  });
});

describe('configuración', () => {
  it('valores por defecto y datos corruptos', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings('no json')).toEqual(DEFAULT_SETTINGS);
  });

  it('respeta lo guardado y descarta valores inválidos', () => {
    const s = parseSettings(JSON.stringify({ deckSize: 48, undo: false, players: ['Ana', '', 3], rules: { asReyDoble: true, x: 1 } }));
    expect(s.deckSize).toBe(48);
    expect(s.undo).toBe(false);
    expect(s.players).toEqual(['Ana']);
    expect(s.rules).toEqual({ igualReparte: false, asReyDoble: true, puenteLimpio: false });
  });

  it('orientación horizontal por defecto, vertical si se eligió', () => {
    expect(DEFAULT_SETTINGS.orientation).toBe('horizontal');
    expect(parseSettings(JSON.stringify({ orientation: 'vertical' })).orientation).toBe('vertical');
    expect(parseSettings(JSON.stringify({ orientation: 'diagonal' })).orientation).toBe('horizontal');
  });
});
