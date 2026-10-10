import { SUITS, type Card, type Suit } from '../game/deck';

/**
 * Las cartas salen de un sprite de 12 columnas (valores 1–12) × 5 filas
 * (oros, copas, espadas, bastos y una fila con el reverso en la columna 2).
 * "Baraja española completa" – Basquetteur / Germarquezm, Wikimedia Commons, CC BY-SA 3.0.
 */
const COLS = 12;
const ROWS = 5;
const BACK = { col: 1, row: 4 };

const FIGURES: Record<number, string> = { 10: 'Sota', 11: 'Caballo', 12: 'Rey' };

export const SUIT_LABEL: Record<Suit, string> = { oros: 'Oros', copas: 'Copas', espadas: 'Espadas', bastos: 'Bastos' };

function spritePosition(col: number, row: number): string {
  return `background-position: ${(col / (COLS - 1)) * 100}% ${(row / (ROWS - 1)) * 100}%`;
}

export function cardLabel(card: Card): string {
  return `${FIGURES[card.value] ?? card.value} de ${card.suit}`;
}

export function cardFace(card: Card): string {
  return `<div class="face sprite" style="${spritePosition(card.value - 1, SUITS.indexOf(card.suit))}" role="img" aria-label="${cardLabel(card)}"></div>`;
}

export function cardBack(cls = ''): string {
  return `<div class="sprite ${cls}" style="${spritePosition(BACK.col, BACK.row)}" aria-hidden="true"></div>`;
}

/** As del palo como icono para los botones de apuesta. */
export function suitIcon(suit: Suit, cls = 'suit'): string {
  return `<span class="sprite ${cls}" style="${spritePosition(0, SUITS.indexOf(suit))}" aria-hidden="true"></span>`;
}
