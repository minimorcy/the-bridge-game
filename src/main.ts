import './style.css';
import { registerSW } from 'virtual:pwa-register';
import type { Suit } from './game/deck';
import { continueWithLastCards, visibleCards } from './game/game';
import { loadRecord, submitRecord } from './game/record';
import { allowedGuesses, crossesBridge, type Guess, type Position } from './game/rules';
import {
  MAX_PLAYERS,
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
} from './game/session';
import { loadSettings, saveSettings, type Orientation, type Settings, type Toggle } from './settings';
import { SUIT_LABEL, cardBack, cardFace, cardLabel, suitIcon } from './ui/cards';
import { sfx, vibrate } from './ui/fx';
import { canLockLandscape, lockLandscape, unlockOrientation } from './ui/orientation';
import { setWakeLock } from './ui/wake-lock';

registerSW({ immediate: true });

type Overlay = 'none' | 'drink' | 'share' | 'turnEnd' | 'won' | 'ranking' | 'deckEmpty';

const FLIP_MS = 1100;
const POSITION_HINT = ['Mayor / menor', 'Mayor / menor', 'Par / impar', 'Palo'];
const GUESS_LABEL: Partial<Record<Guess, string>> = {
  mayor: '⬆️ Mayor',
  menor: '⬇️ Menor',
  igual: '🟰 Igual',
  par: 'Par',
  impar: 'Impar',
};
const TOGGLES: { key: Toggle; label: string; desc: string }[] = [
  { key: 'quickDraw', label: 'Sacar al elegir', desc: 'La carta sale al pulsar la apuesta, sin tocar la carta.' },
  { key: 'sound', label: 'Sonido', desc: 'Efectos al sacar carta, beber y cruzar.' },
  { key: 'vibration', label: 'Vibración', desc: 'Vibra cuando toca beber (no disponible en iPhone).' },
  { key: 'suspense', label: 'Suspense', desc: 'La carta sale boca abajo y se voltea con redoble.' },
  { key: 'wakeLock', label: 'Pantalla siempre encendida', desc: 'Evita que el móvil se bloquee mientras jugáis.' },
  { key: 'undo', label: 'Deshacer', desc: 'Permite deshacer el último robo si alguien toca sin querer.' },
];
const ORIENTATIONS: { key: Orientation; label: string }[] = [
  { key: 'horizontal', label: '📱↔️ Horizontal' },
  { key: 'vertical', label: '📱↕️ Vertical' },
];
const RULES: { key: keyof SessionRules; label: string; desc: string }[] = [
  { key: 'igualReparte', label: 'Igual reparte', desc: 'Acertar "igual" te deja repartir 2 tragos.' },
  { key: 'asReyDoble', label: 'As o Rey, doble', desc: 'Fallar con un As o un Rey cuenta 2 tragos.' },
  { key: 'puenteLimpio', label: 'Puente limpio', desc: 'Cruzar sin fallar ni una: todos los demás beben 1.' },
];

let settings: Settings = loadSettings();
let session: Session = newSession(settings.players, settings.deckSize);
/** Estado ya calculado mientras la carta se voltea (modo suspense). */
let pending: Session | null = null;
let undoSnapshot: Session | null = null;
let selected: Guess | null = null;
let queue: Overlay[] = [];
let settingsOpen = false;
let animate = false;
let shareLeft = 0;
let newRecord = false;
let focusPlayerInput = false;

const app = document.querySelector<HTMLDivElement>('#app')!;
const overlay = (): Overlay => queue[0] ?? 'none';
const drinksWord = (n: number): string => (n === 1 ? '1 trago' : `${n} tragos`);
const escapeHtml = (s: string): string => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

// ---------- Render ----------

function guessButton(guess: Guess): string {
  const label = GUESS_LABEL[guess] ?? `${suitIcon(guess as Suit, 'suit-btn')}${SUIT_LABEL[guess as Suit]}`;
  return `<button class="guess ${selected === guess ? 'selected' : ''}" data-guess="${guess}">${label}</button>`;
}

function slot(i: Position): string {
  const game = session.game;
  const pile = game.piles[i];
  const top = visibleCards(game)[i];
  const active = game.status === 'playing' && game.position === i;
  const flipCard = pending && pending.game.lastTurn?.from === i ? pending.game.lastTurn.drawn : null;
  const fresh = animate && game.lastTurn?.from === i;
  const ready = active && selected && !pending;
  return `
    <div class="slot ${active ? 'active' : ''}">
      <button class="card ${fresh ? 'fresh' : ''} ${ready ? 'ready' : ''}" data-slot="${i}"
        ${ready ? '' : 'disabled'} aria-label="Posición ${i + 1}: ${cardLabel(top)}">
        ${pile.length > 1 ? `<span class="under">${cardBack()}</span>` : ''}
        ${cardFace(top)}
        ${flipCard ? `<div class="flipper"><div class="side">${cardBack()}</div><div class="side front">${cardFace(flipCard)}</div></div>` : ''}
        ${pile.length > 1 ? `<span class="count">${pile.length}</span>` : ''}
      </button>
      <span class="hint">${i + 1}. ${POSITION_HINT[i]}</span>
    </div>`;
}

function message(): string {
  if (pending) return '🥁 …';
  const t = session.game.lastTurn;
  if (!t) {
    const how = settings.quickDraw ? 'elige tu apuesta para sacar carta' : 'elige y toca la carta resaltada';
    return session.solo
      ? `${how[0].toUpperCase()}${how.slice(1)}.`
      : `Turno de <b>${escapeHtml(currentPlayer(session).name)}</b>: ${how}.`;
  }
  return `${t.correct ? '✅ ¡Acierto!' : '❌ Fallo.'} Salió <b>${cardLabel(t.drawn)}</b>.`;
}

function scoreboard(): string {
  if (session.solo) return '';
  return `<div class="scoreboard">${session.players
    .map(
      (p, i) =>
        `<span class="chip ${i === session.current ? 'current' : ''} ${p.crossed ? 'crossed' : ''}">${escapeHtml(p.name)} · 🍺${p.drinks}${p.crossed ? ' ✓' : ''}</span>`,
    )
    .join('')}</div>`;
}

function undoButton(): string {
  return settings.undo && undoSnapshot && !pending
    ? `<button class="undo" data-action="undo">↩️ Deshacer</button>`
    : '';
}

function recordLine(): string {
  const r = loadRecord();
  if (newRecord) return `<p class="record">⭐ ¡Nuevo récord! ${drinksWord(r?.drinks ?? 0)}</p>`;
  return r ? `<p class="muted">Récord: ${drinksWord(r.drinks)} (${escapeHtml(r.name)}, ${r.date})</p>` : '';
}

function cleanLine(): string {
  const t = session.game.lastTurn;
  if (!settings.rules.puenteLimpio || !t?.clean) return '';
  return session.solo
    ? `<p class="record">✨ ¡Puente limpio! Que beban todos los demás.</p>`
    : `<p class="record">✨ ¡Puente limpio! Todos los demás beben 1.</p>`;
}

function drinkReason(): string {
  const t = session.game.lastTurn!;
  const crossed = crossesBridge(t.from, t.to);
  const doble = !t.correct && settings.rules.asReyDoble && (t.drawn.value === 1 || t.drawn.value === 12);
  const fail = doble ? `Has fallado con ${t.drawn.value === 1 ? 'un As' : 'un Rey'} (doble)` : 'Has fallado';
  if (!t.correct && crossed) return `${fail} y has vuelto a cruzar el puente.`;
  if (crossed) return 'Has cruzado el puente.';
  return `${fail}.`;
}

function overlayHtml(): string {
  if (settingsOpen) return settingsHtml();
  const t = session.game.lastTurn;
  const me = escapeHtml(currentPlayer(session).name);
  switch (overlay()) {
    case 'drink':
      return panel(`
        <div class="big wobble">🍺</div>
        <h2>${session.solo ? '¡Bebe' : `¡${me}, bebe`} ${drinksWord(t?.drinks ?? 0)}!</h2>
        <p>${drinkReason()}</p>
        <button class="primary" data-action="next-overlay">Hecho</button>
        ${undoButton()}`);
    case 'share':
      return panel(`
        <div class="big">🫵</div>
        <h2>¡Igual! Reparte ${drinksWord(shareLeft)}</h2>
        ${
          session.solo
            ? `<p>Repártelos entre los presentes.</p><button class="primary" data-action="next-overlay">Hecho</button>`
            : `<p>Toca a quién le das cada trago:</p>
               <div class="choices wrap">${session.players
                 .map((p, i) => (i === session.current ? '' : `<button data-give="${i}">${escapeHtml(p.name)} +1</button>`))
                 .join('')}</div>`
        }
        ${undoButton()}`);
    case 'turnEnd': {
      const next = session.players[nextPlayerIndex(session) ?? 0];
      return panel(`
        <div class="big">🌉</div>
        <h2>¡${me} ha cruzado el puente!</h2>
        <p>Con ${drinksWord(session.game.drinks)} en este turno.</p>
        ${cleanLine()}${recordLine()}
        <button class="primary" data-action="next-player">Turno de ${escapeHtml(next.name)} ▶️</button>`);
    }
    case 'won':
      return panel(`
        <div class="big">🏆</div>
        <h2>¡Has cruzado el puente!</h2>
        <p>Tragos en total: <b>${session.game.drinks}</b></p>
        ${cleanLine()}${recordLine()}
        <button class="primary" data-action="new-game">Nueva partida</button>
        <button data-action="share-result">📤 Compartir</button>`);
    case 'ranking': {
      const rows = ranking(session);
      return panel(`
        <div class="big">🏁</div>
        <h2>¡Todos han cruzado!</h2>
        ${cleanLine()}${recordLine()}
        <ol class="ranking">${rows
          .map((p, i) => {
            const badge = i === 0 ? '🏆 Campeón' : i === rows.length - 1 ? '🧽 Esponja de la noche' : '';
            return `<li><span>${escapeHtml(p.name)}</span><span>🍺 ${p.drinks}</span>${badge ? `<small>${badge}</small>` : ''}</li>`;
          })
          .join('')}</ol>
        <button class="primary" data-action="new-game">Nueva partida</button>
        <button data-action="share-result">📤 Compartir</button>`);
    }
    case 'deckEmpty':
      return panel(`
        <div class="big">🃏</div>
        <h2>Se acabó la baraja</h2>
        <p>Puedes seguir con las 4 cartas que hay en la mesa.</p>
        <button class="primary" data-action="continue">Continuar con las 4 últimas cartas</button>
        <button data-action="new-game">Nueva partida</button>`);
    default:
      return '';
  }
}

function panel(content: string): string {
  return `<div class="overlay"><div class="panel">${content}</div></div>`;
}

function toggle(attr: string, key: string, label: string, desc: string, on: boolean): string {
  return `<label class="toggle"><span><b>${label}</b><small>${desc}</small></span>
    <input type="checkbox" ${attr}="${key}" ${on ? 'checked' : ''} /></label>`;
}

function settingsHtml(): string {
  const full = settings.players.length >= MAX_PLAYERS;
  return `<div class="overlay static"><div class="panel settings">
    <h2>⚙️ Configuración</h2>
    <h3>Partida</h3>
    <p class="muted">Baraja y jugadores se aplican en la próxima partida.</p>
    <div class="choices">
      ${([40, 48] as const).map((n) => `<button class="${settings.deckSize === n ? 'selected' : ''}" data-deck="${n}">${n} cartas</button>`).join('')}
    </div>
    <ul class="players">${settings.players
      .map((p, i) => `<li><span>${i + 1}. ${escapeHtml(p)}</span><button class="icon" data-remove="${i}" aria-label="Quitar ${escapeHtml(p)}">✕</button></li>`)
      .join('')}</ul>
    <form class="add-player" data-form="add-player">
      <input name="name" maxlength="16" placeholder="${full ? 'Máximo de jugadores' : 'Nombre del jugador'}" autocomplete="off" ${full ? 'disabled' : ''} />
      <button ${full ? 'disabled' : ''}>Añadir</button>
    </form>
    <p class="muted">${settings.players.length ? `${settings.players.length} jugadores` : 'Sin jugadores: modo solitario.'}</p>
    <h3>Mesa</h3>
    <p class="muted">Orientación: en horizontal las cartas se ven más grandes.</p>
    <div class="choices">
      ${ORIENTATIONS.map((o) => `<button class="${settings.orientation === o.key ? 'selected' : ''}" data-orientation="${o.key}">${o.label}</button>`).join('')}
    </div>
    ${TOGGLES.map((t) => toggle('data-toggle', t.key, t.label, t.desc, settings[t.key])).join('')}
    <h3>Reglas extra</h3>
    ${RULES.map((r) => toggle('data-rule', r.key, r.label, r.desc, settings.rules[r.key])).join('')}
    <button class="primary" data-action="new-game">Nueva partida</button>
    <button data-action="close-settings">Cerrar</button>
  </div></div>`;
}

/** Siempre en el DOM; el CSS lo muestra solo en móviles en vertical con la opción horizontal. */
function rotatePrompt(): string {
  return `<div class="rotate-prompt"><div class="panel">
    <div class="big rotate">📱</div>
    <h2>Gira el móvil</h2>
    <p>El Puente se juega en horizontal: las cartas se ven más grandes.</p>
    ${canLockLandscape() ? `<button class="primary" data-action="rotate">🔄 Pantalla completa en horizontal</button>` : ''}
    <button data-action="portrait">Jugar en vertical</button>
  </div></div>`;
}

function render(): void {
  const game = session.game;
  const playing = game.status === 'playing' && !pending && overlay() === 'none';
  app.innerHTML = `
    <header>
      <h1>🌉 El Puente</h1>
      <div class="stats">
        <span title="Tragos">🍺 ${currentPlayer(session).drinks}</span>
        <span title="Cartas en la baraja">🂠 ${game.deck.length}</span>
        <button class="icon" data-action="settings" aria-label="Configuración">⚙️</button>
      </div>
      ${scoreboard()}
    </header>
    <main>
      <section class="board">
        ${slot(0)}${slot(1)}
        <div class="slot bridge-slot"><div class="bridge" aria-label="El puente">${cardBack()}</div><span class="hint">Puente</span></div>
        ${slot(2)}${slot(3)}
      </section>
      <p class="message">${message()}</p>
      <section class="guesses">
        ${playing ? allowedGuesses(game.position).map(guessButton).join('') : ''}
      </section>
      <p class="tap-hint">${playing && selected ? '👆 Toca la carta resaltada para sacar' : '&nbsp;'}</p>
      <div class="actions">${overlay() === 'none' ? undoButton() : ''}</div>
    </main>
    <footer>Cartas: <a href="https://commons.wikimedia.org/wiki/File:Baraja_espa%C3%B1ola_completa.png" target="_blank" rel="noopener">Baraja española completa</a> (Basquetteur, Germarquezm) · <a href="https://creativecommons.org/licenses/by-sa/3.0/deed.es" target="_blank" rel="noopener">CC BY-SA 3.0</a></footer>
    ${overlayHtml()}
    ${rotatePrompt()}`;
  animate = false;
  // En apaisado el marcador es una fila con scroll: mantener visible al jugador actual
  app.querySelector('.chip.current')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  if (focusPlayerInput) {
    app.querySelector<HTMLInputElement>('.add-player input')?.focus();
    focusPlayerInput = false;
  }
}

// ---------- Acciones ----------

function draw(): void {
  if (!selected || pending) return;
  const before = session;
  const next = playTurn(session, selected, settings.rules);
  selected = null;
  undoSnapshot = settings.undo && next.game.status !== 'won' ? before : null;
  if (settings.sound) sfx.card();
  if (settings.suspense) {
    pending = next;
    if (settings.sound) sfx.drumroll(FLIP_MS / 1000);
    render();
    setTimeout(() => {
      session = pending!;
      pending = null;
      reveal();
    }, FLIP_MS);
  } else {
    session = next;
    animate = true;
    reveal();
  }
}

function reveal(): void {
  const t = session.game.lastTurn!;
  const won = session.game.status === 'won';
  queue = [];
  newRecord = false;
  if (t.drinks > 0) queue.push('drink');
  if (t.share > 0) {
    shareLeft = t.share;
    queue.push('share');
  }
  if (won) {
    newRecord = submitRecord(session.game.drinks, currentPlayer(session).name);
    queue.push(session.solo ? 'won' : isFinished(session) ? 'ranking' : 'turnEnd');
  } else if (session.game.status === 'deckEmpty') {
    queue.push('deckEmpty');
  }
  feedback(t.correct, t.drinks, won);
  render();
}

function feedback(correct: boolean, drinks: number, won: boolean): void {
  if (settings.sound) {
    if (won) sfx.cross();
    else if (correct) sfx.correct();
    else sfx.fail();
    if (drinks > 0) setTimeout(sfx.drink, 450);
  }
  if (settings.vibration) {
    if (won) vibrate([100, 60, 100, 60, 300]);
    else if (drinks > 0) vibrate([250, 120, 250]);
  }
}

function startNewGame(): void {
  session = newSession(settings.players, settings.deckSize);
  pending = null;
  undoSnapshot = null;
  selected = null;
  queue = [];
  settingsOpen = false;
  newRecord = false;
}

function updateSettings(change: Partial<Settings>): void {
  const orientationChanged = change.orientation !== undefined && change.orientation !== settings.orientation;
  settings = { ...settings, ...change };
  saveSettings(settings);
  setWakeLock(settings.wakeLock);
  if (orientationChanged) applyOrientation(false);
}

/** Sin toque previo solo funciona en la app instalada; si falla, queda el aviso de girar. */
function applyOrientation(withFullscreen: boolean): void {
  const horizontal = settings.orientation === 'horizontal';
  document.body.classList.toggle('want-landscape', horizontal);
  if (horizontal) void lockLandscape(withFullscreen);
  else unlockOrientation();
}

function shareResult(): void {
  const lines = session.solo
    ? [`🌉 He cruzado El Puente con ${drinksWord(session.game.drinks)} 🍺`]
    : ['🌉 El Puente – clasificación:', ...ranking(session).map((p, i) => `${i === 0 ? '🏆' : `${i + 1}.`} ${p.name}: ${p.drinks} 🍺`)];
  const text = [...lines, location.origin].join('\n');
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  }
}

app.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>(
    '[data-guess],[data-slot],[data-action],[data-deck],[data-orientation],[data-remove],[data-give]',
  );
  if (!el) return;
  const { guess, slot, action, deck, orientation, remove, give } = el.dataset;

  if (guess && !pending && settings.quickDraw) {
    selected = guess as Guess;
    draw();
    return;
  } else if (guess && !pending) {
    selected = selected === guess ? null : (guess as Guess);
  } else if (slot !== undefined && Number(slot) === session.game.position) {
    draw();
    return;
  } else if (deck) {
    updateSettings({ deckSize: deck === '48' ? 48 : 40 });
  } else if (orientation) {
    updateSettings({ orientation: orientation === 'vertical' ? 'vertical' : 'horizontal' });
  } else if (remove !== undefined) {
    updateSettings({ players: settings.players.filter((_, i) => i !== Number(remove)) });
  } else if (give !== undefined) {
    session = addDrinks(session, Number(give), 1);
    shareLeft--;
    if (shareLeft <= 0) queue.shift();
  } else if (action === 'next-overlay') {
    queue.shift();
  } else if (action === 'undo' && undoSnapshot) {
    session = undoSnapshot;
    undoSnapshot = null;
    queue = [];
  } else if (action === 'next-player') {
    session = nextPlayer(session);
    undoSnapshot = null;
    queue = session.game.status === 'deckEmpty' ? ['deckEmpty'] : [];
  } else if (action === 'new-game') {
    startNewGame();
  } else if (action === 'continue') {
    session = { ...session, game: continueWithLastCards(session.game) };
    undoSnapshot = null;
    queue = [];
  } else if (action === 'settings') {
    settingsOpen = true;
  } else if (action === 'close-settings') {
    settingsOpen = false;
  } else if (action === 'portrait') {
    updateSettings({ orientation: 'vertical' });
  } else if (action === 'rotate') {
    void lockLandscape(true);
    return;
  } else if (action === 'share-result') {
    shareResult();
    return;
  } else {
    return;
  }
  render();
});

app.addEventListener('change', (e) => {
  const input = e.target as HTMLInputElement;
  const { toggle: key, rule } = input.dataset;
  if (key) updateSettings({ [key]: input.checked } as Partial<Settings>);
  else if (rule) updateSettings({ rules: { ...settings.rules, [rule]: input.checked } });
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const name = String(new FormData(form).get('name') ?? '').trim();
  if (name && settings.players.length < MAX_PLAYERS) {
    updateSettings({ players: [...settings.players, name] });
  }
  focusPlayerInput = true;
  render();
});

setWakeLock(settings.wakeLock);
applyOrientation(false);
render();
