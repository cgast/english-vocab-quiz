import * as state from './state.js';
import { escapeHtml, splitList, downloadFile } from './util.js';

let container = null;
let suppressRender = false;

function fieldInput(setId, entryId, field, value) {
  suppressRender = true;
  const patch =
    field === 'synonyms' || field === 'antonyms'
      ? { [field]: splitList(value) }
      : { [field]: value };
  state.updateEntry(setId, entryId, patch);
}

function entryRow(set, entry) {
  return `
    <tr data-entry-id="${entry.id}">
      <td><input type="text" value="${escapeHtml(entry.de)}" data-field="de" placeholder="deutsches Wort" /></td>
      <td><input type="text" value="${escapeHtml(entry.en)}" data-field="en" placeholder="english word" /></td>
      <td><input type="text" value="${escapeHtml(entry.example)}" data-field="example" placeholder="Sentence with {{word}} as blank" /></td>
      <td><input type="text" value="${escapeHtml(entry.synonyms.join(', '))}" data-field="synonyms" placeholder="synonym1, synonym2" /></td>
      <td><input type="text" value="${escapeHtml(entry.antonyms.join(', '))}" data-field="antonyms" placeholder="antonym1, antonym2" /></td>
      <td><input type="text" value="${escapeHtml(entry.definition)}" data-field="definition" placeholder="English paraphrase" /></td>
      <td><button type="button" class="btn-icon danger" data-action="remove-entry" title="Zeile löschen">✕</button></td>
    </tr>`;
}

function render() {
  if (!container) return;
  const sets = state.getVocabSets();
  const activeSet = state.getActiveSet();
  if (!activeSet) return;

  container.innerHTML = `
    <div class="panel">
      <h2>Vokabellisten verwalten</h2>
      <p class="hint">
        Jede Vokabel kann für mehrere Übungsarten genutzt werden: Lückensatz, Synonym/Antonym,
        Umschreibung und freies Schreiben. Im Beispielsatz markiert <code>{{word}}</code> die Stelle,
        an der später die Lücke erscheint.
      </p>

      <div class="set-toolbar">
        <label>
          Aktive Liste:
          <select id="set-select">
            ${sets
              .map(
                (s) =>
                  `<option value="${s.id}" ${s.id === activeSet.id ? 'selected' : ''}>${escapeHtml(
                    s.name
                  )} (${s.entries.length})</option>`
              )
              .join('')}
          </select>
        </label>
        <button type="button" data-action="new-set">+ Neue Liste</button>
        <button type="button" data-action="rename-set">Umbenennen</button>
        <button type="button" data-action="duplicate-set">Duplizieren</button>
        <button type="button" class="danger" data-action="delete-set" ${sets.length <= 1 ? 'disabled' : ''}>Löschen</button>
      </div>

      <div class="table-scroll">
        <table class="vocab-table">
          <thead>
            <tr>
              <th>Deutsch</th>
              <th>Englisch</th>
              <th>Beispielsatz (mit {{word}})</th>
              <th>Synonyme</th>
              <th>Antonyme</th>
              <th>Umschreibung (Englisch)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${activeSet.entries.map((e) => entryRow(activeSet, e)).join('')}
          </tbody>
        </table>
      </div>
      <button type="button" data-action="add-entry">+ Zeile hinzufügen</button>

      <div class="io-toolbar">
        <button type="button" data-action="export-json">Alle Listen exportieren (JSON)</button>
        <label class="file-import">
          Listen importieren (JSON)
          <input type="file" id="import-file" accept="application/json" />
        </label>
        <label class="hint-inline">
          <input type="checkbox" id="import-replace" /> bestehende Listen ersetzen statt ergänzen
        </label>
      </div>
    </div>`;

  container.querySelector('#set-select').addEventListener('change', (e) => {
    state.setActiveSetId(e.target.value);
  });

  container.querySelector('[data-action="new-set"]').addEventListener('click', () => {
    const name = prompt('Name der neuen Vokabelliste:', 'Neue Liste');
    if (name !== null) state.addVocabSet(name.trim() || 'Neue Liste');
  });

  container.querySelector('[data-action="rename-set"]').addEventListener('click', () => {
    const name = prompt('Neuer Name:', activeSet.name);
    if (name !== null && name.trim()) state.renameVocabSet(activeSet.id, name.trim());
  });

  container.querySelector('[data-action="duplicate-set"]').addEventListener('click', () => {
    state.duplicateVocabSet(activeSet.id);
  });

  container.querySelector('[data-action="delete-set"]').addEventListener('click', () => {
    if (confirm(`Vokabelliste "${activeSet.name}" wirklich löschen?`)) {
      state.deleteVocabSet(activeSet.id);
    }
  });

  container.querySelector('[data-action="add-entry"]').addEventListener('click', () => {
    state.addEntry(activeSet.id);
  });

  container.querySelectorAll('[data-action="remove-entry"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const entryId = e.target.closest('tr').dataset.entryId;
      state.removeEntry(activeSet.id, entryId);
    });
  });

  container.querySelectorAll('tbody input[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const entryId = e.target.closest('tr').dataset.entryId;
      fieldInput(activeSet.id, entryId, e.target.dataset.field, e.target.value);
    });
  });

  container.querySelector('[data-action="export-json"]').addEventListener('click', () => {
    downloadFile('vokabellisten.json', JSON.stringify(state.getVocabSets(), null, 2));
  });

  container.querySelector('#import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const sets = Array.isArray(parsed) ? parsed : [parsed];
      const replace = container.querySelector('#import-replace').checked;
      state.importVocabSets(sets, { replace });
    } catch (err) {
      alert('Die Datei konnte nicht gelesen werden. Bitte eine gültige JSON-Datei wählen.');
    } finally {
      e.target.value = '';
    }
  });
}

export function mount(el) {
  container = el;
  state.subscribe(() => {
    if (suppressRender) {
      suppressRender = false;
      return;
    }
    render();
  });
  render();
}

export { render };
