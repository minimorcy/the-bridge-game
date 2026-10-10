import type { DeckSize } from './game/deck';
import { safeStorage } from './game/record';
import { MAX_PLAYERS, type SessionRules } from './game/session';

export interface Settings {
  deckSize: DeckSize;
  players: string[];
  sound: boolean;
  vibration: boolean;
  suspense: boolean;
  wakeLock: boolean;
  undo: boolean;
  rules: SessionRules;
}

export type Toggle = 'sound' | 'vibration' | 'suspense' | 'wakeLock' | 'undo';

export const DEFAULT_SETTINGS: Settings = {
  deckSize: 40,
  players: [],
  sound: true,
  vibration: true,
  suspense: true,
  wakeLock: true,
  undo: true,
  rules: { igualReparte: false, asReyDoble: false, puenteLimpio: false },
};

const KEY = 'el-puente:settings';

const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);

/** Combina lo guardado con los valores por defecto, descartando lo que no sea válido. */
export function parseSettings(raw: string | null | undefined): Settings {
  const d = DEFAULT_SETTINGS;
  let s: Partial<Settings> = {};
  try {
    s = raw ? JSON.parse(raw) : {};
  } catch {
    /* JSON corrupto: valores por defecto */
  }
  const rules: Partial<SessionRules> = s.rules ?? {};
  return {
    deckSize: s.deckSize === 48 ? 48 : 40,
    players: Array.isArray(s.players)
      ? s.players.filter((n): n is string => typeof n === 'string' && n.trim() !== '').slice(0, MAX_PLAYERS)
      : [],
    sound: bool(s.sound, d.sound),
    vibration: bool(s.vibration, d.vibration),
    suspense: bool(s.suspense, d.suspense),
    wakeLock: bool(s.wakeLock, d.wakeLock),
    undo: bool(s.undo, d.undo),
    rules: {
      igualReparte: bool(rules.igualReparte, d.rules.igualReparte),
      asReyDoble: bool(rules.asReyDoble, d.rules.asReyDoble),
      puenteLimpio: bool(rules.puenteLimpio, d.rules.puenteLimpio),
    },
  };
}

export function loadSettings(): Settings {
  try {
    return parseSettings(safeStorage()?.getItem(KEY));
  } catch {
    return parseSettings(null);
  }
}

export function saveSettings(settings: Settings): void {
  try {
    safeStorage()?.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* sin almacenamiento: se mantiene en memoria */
  }
}
