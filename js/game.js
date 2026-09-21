import * as state from './state.js';
import { escapeHtml, shuffle, sample, uid } from './util.js';

let container = null;
let game = null;

function usableEntries(set) {
  return set.entries.filter((e) => e.en && e.de);
}

function buildCards(entries) {
  return shuffle(
    entries.flatMap((e) => [
      { key: uid(), pairId: e.id, label: e.en, lang: 'en' },
      { key: uid(), pairId: e.id, label: e.de, lang: 'de' },
    ])
  );
}

function startGame(setId, pairCount) {
  const set = state.getVocabSets().find((s) => s.id === setId);
  const pool = usableEntries(set);
  const entries = sample(pool, Math.min(pairCount, pool.length));
  game = {
    setId,
    setName: set.name,
    poolSize: pool.length,
    cards: buildCards(entries),
    flipped: [],
    matched: new Set(),
    moves: 0,
    locked: false,
  };
  render();
}

function renderSetupBar() {
  const sets = state.getVocabSets();
  const activeSet = state.getActiveSet();
  const currentSetId = game?.setId ?? activeSet.id;
  const pool = usableEntries(sets.find((s) => s.id === currentSetId) ?? activeSet);
  const options = [6, 8, 10, 12].filter((n) => n <= pool.length);
  if (options.length === 0) options.push(pool.length);

  return `
    <div class="game-toolbar">
      <label>
        Vokabelliste:
        <select id="game-set-select">
          ${sets
            .map(
              (s) =>
                `<option value="${s.id}" ${s.id === currentSetId ? 'selected' : ''}>${escapeHtml(
                  s.name
                )}</option>`
            )
            .join('')}
        </select>
      </label>
      <label>
        Kartenpaare:
        <select id="game-pair-count">
          ${options.map((n) => `<option value="${n}">${n}</option>`).join('')}
        </select>
      </label>
      <button type="button" data-action="new-game">Neues Spiel</button>
    </div>`;
}

function cardHtml(card) {
  const isFlipped = game.flipped.includes(card.key) || game.matched.has(card.pairId);
  const isMatched = game.matched.has(card.pairId);
  return `
    <button type="button" class="memory-card ${isFlipped ? 'flipped' : ''} ${
      isMatched ? 'matched' : ''
    }" data-key="${card.key}" ${isMatched ? 'disabled' : ''}>
      <span class="memory-card-inner">${isFlipped ? escapeHtml(card.label) : '?'}</span>
    </button>`;
}

function render() {
  if (!container) return;

  if (!game) {
    container.innerHTML = `
      <div class="panel">
        <h2>Vokabelspiel: Memory</h2>
        <p class="hint">Finde die passenden Paare aus englischem und deutschem Wort. Übungsmodus – ohne Note.</p>
        ${renderSetupBar()}
        <div id="memory-grid" class="memory-grid"></div>
      </div>`;
    wireSetupBar();
    return;
  }

  const totalPairs = game.cards.length / 2;
  const done = game.matched.size === totalPairs && totalPairs > 0;

  container.innerHTML = `
    <div class="panel">
      <h2>Vokabelspiel: Memory</h2>
      <p class="hint">Finde die passenden Paare aus englischem und deutschem Wort. Übungsmodus – ohne Note.</p>
      ${renderSetupBar()}
      <p class="game-status">Liste: ${escapeHtml(game.setName)} · Züge: ${game.moves} · Gefundene Paare: ${
        game.matched.size
      } / ${totalPairs}</p>
      ${done ? '<p class="feedback feedback-correct">🎉 Geschafft! Alle Paare gefunden.</p>' : ''}
      <div id="memory-grid" class="memory-grid">${game.cards.map(cardHtml).join('')}</div>
    </div>`;

  wireSetupBar();
  container.querySelectorAll('.memory-card').forEach((btn) => {
    btn.addEventListener('click', () => handleCardClick(btn.dataset.key));
  });
}

function wireSetupBar() {
  container.querySelector('[data-action="new-game"]').addEventListener('click', () => {
    const setId = container.querySelector('#game-set-select').value;
    const pairCount = Number(container.querySelector('#game-pair-count').value) || 6;
    startGame(setId, pairCount);
  });
}

function handleCardClick(key) {
  if (!game || game.locked) return;
  const card = game.cards.find((c) => c.key === key);
  if (!card || game.matched.has(card.pairId) || game.flipped.includes(key)) return;

  game.flipped.push(key);
  render();

  if (game.flipped.length === 2) {
    game.moves += 1;
    const [firstKey, secondKey] = game.flipped;
    const first = game.cards.find((c) => c.key === firstKey);
    const second = game.cards.find((c) => c.key === secondKey);
    if (first.pairId === second.pairId) {
      game.matched.add(first.pairId);
      game.flipped = [];
      render();
    } else {
      game.locked = true;
      setTimeout(() => {
        game.flipped = [];
        game.locked = false;
        render();
      }, 700);
    }
  }
}

export function mount(el) {
  container = el;
  render();
}

export { render };
