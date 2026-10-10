import type { DeckSize, Rng } from './deck';
import { newGame, play, startNextTurn, type ExtraRules, type GameState } from './game';
import type { Guess } from './rules';

export const MAX_PLAYERS = 12;
export const SOLO_NAME = 'Tú';

export interface Player {
  name: string;
  drinks: number;
  crossed: boolean;
}

export interface SessionRules extends ExtraRules {
  puenteLimpio: boolean;
}

export interface Session {
  players: Player[];
  current: number;
  solo: boolean;
  game: GameState;
}

export function newSession(names: readonly string[], deckSize: DeckSize, rng?: Rng): Session {
  const clean = names.map((n) => n.trim()).filter(Boolean).slice(0, MAX_PLAYERS);
  const solo = clean.length === 0;
  return {
    players: (solo ? [SOLO_NAME] : clean).map((name) => ({ name, drinks: 0, crossed: false })),
    current: 0,
    solo,
    game: newGame(deckSize, rng),
  };
}

export function currentPlayer(session: Session): Player {
  return session.players[session.current];
}

function withPlayers(session: Session, update: (p: Player, i: number) => Player): Session {
  return { ...session, players: session.players.map(update) };
}

/** Juega un robo y apunta los tragos al jugador actual (y "puente limpio" a los demás). */
export function playTurn(session: Session, guess: Guess, rules: SessionRules): Session {
  const game = play(session.game, guess, rules);
  const turn = game.lastTurn!;
  const won = game.status === 'won';
  const others = rules.puenteLimpio && turn.clean && !session.solo ? 1 : 0;
  return withPlayers({ ...session, game }, (p, i) =>
    i === session.current
      ? { ...p, drinks: p.drinks + turn.drinks, crossed: p.crossed || won }
      : { ...p, drinks: p.drinks + others },
  );
}

export function addDrinks(session: Session, playerIndex: number, n: number): Session {
  return withPlayers(session, (p, i) => (i === playerIndex ? { ...p, drinks: p.drinks + n } : p));
}

export function isFinished(session: Session): boolean {
  return session.players.every((p) => p.crossed);
}

/** Índice del siguiente jugador que no ha cruzado, o null si ya han cruzado todos. */
export function nextPlayerIndex(session: Session): number | null {
  const n = session.players.length;
  for (let step = 1; step <= n; step++) {
    const i = (session.current + step) % n;
    if (!session.players[i].crossed) return i;
  }
  return null;
}

export function nextPlayer(session: Session): Session {
  const next = nextPlayerIndex(session);
  if (next === null) return session;
  return { ...session, current: next, game: startNextTurn(session.game) };
}

/** Clasificación por tragos ascendente; empates en orden de juego. */
export function ranking(session: Session): Player[] {
  return [...session.players].sort((a, b) => a.drinks - b.drinks);
}
