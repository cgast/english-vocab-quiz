import * as state from './state.js';
import { DEFAULT_GRADE_SCALE } from './storage.js';
import { escapeHtml } from './util.js';

let container = null;
let editableScale = null;

function scaleRow(row, index) {
  return `
    <tr data-index="${index}">
      <td>bis <input type="number" min="0" max="100" step="0.5" value="${row.maxPercent}" data-field="maxPercent" /> % Fehlerquote</td>
      <td>Note <input type="text" value="${escapeHtml(row.grade)}" data-field="grade" /></td>
      <td><button type="button" class="btn-icon danger" data-action="remove-row">✕</button></td>
    </tr>`;
}

function render() {
  if (!container) return;
  if (!editableScale) editableScale = state.getGradeScale().map((r) => ({ ...r }));

  container.innerHTML = `
    <div class="panel">
      <h2>Notenschlüssel</h2>
      <p class="hint">
        Grundlage: Wort-/Grammatikfehler zählen als ein ganzer Fehler, Rechtschreibfehler als 1/3 Fehler,
        bei ganzen Sätzen maximal zwei Fehlerpunkte. Aus der Summe aller Fehlerpunkte ergibt sich eine
        Fehlerquote (in % der maximal möglichen Fehlerpunkte), die hier auf eine Note abgebildet wird.
        Der unten voreingestellte Schlüssel ist ein Standardvorschlag – bitte an den tatsächlichen,
        auf iServ hinterlegten Schlüssel Ihrer Schule anpassen.
      </p>
      <table class="scale-table">
        <thead><tr><th>Fehlerquote</th><th>Note</th><th></th></tr></thead>
        <tbody>${editableScale.map(scaleRow).join('')}</tbody>
      </table>
      <button type="button" data-action="add-row">+ Zeile hinzufügen</button>
      <div class="quiz-actions">
        <button type="button" data-action="save-scale">Notenschlüssel speichern</button>
        <button type="button" data-action="reset-scale">Auf Standard zurücksetzen</button>
      </div>

      <h2>Daten</h2>
      <p class="hint">Alle Vokabellisten und Einstellungen werden lokal im Browser gespeichert (nichts wird
        an einen Server gesendet). Nutzen Sie den JSON-Export in der Vokabelverwaltung, um Listen zu sichern
        oder mit anderen Geräten zu teilen.</p>
      <button type="button" class="danger" data-action="reset-all">Alle Daten zurücksetzen</button>
    </div>`;

  container.querySelectorAll('.scale-table input[data-field]').forEach((input) => {
    input.addEventListener('input', (e) => {
      const index = Number(e.target.closest('tr').dataset.index);
      const field = e.target.dataset.field;
      editableScale[index][field] = field === 'maxPercent' ? Number(e.target.value) : e.target.value;
    });
  });

  container.querySelectorAll('[data-action="remove-row"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.closest('tr').dataset.index);
      editableScale.splice(index, 1);
      render();
    });
  });

  container.querySelector('[data-action="add-row"]').addEventListener('click', () => {
    editableScale.push({ maxPercent: 100, grade: '' });
    render();
  });

  container.querySelector('[data-action="save-scale"]').addEventListener('click', () => {
    const cleaned = editableScale
      .filter((r) => r.grade.trim())
      .sort((a, b) => a.maxPercent - b.maxPercent);
    state.setGradeScale(cleaned);
    editableScale = cleaned.map((r) => ({ ...r }));
    render();
  });

  container.querySelector('[data-action="reset-scale"]').addEventListener('click', () => {
    editableScale = DEFAULT_GRADE_SCALE.map((r) => ({ ...r }));
    state.setGradeScale(editableScale.map((r) => ({ ...r })));
    render();
  });

  container.querySelector('[data-action="reset-all"]').addEventListener('click', () => {
    if (confirm('Wirklich alle Vokabellisten und Einstellungen in diesem Browser löschen?')) {
      state.resetToDefaults();
      editableScale = null;
      render();
    }
  });
}

export function mount(el) {
  container = el;
  render();
}

export { render };
