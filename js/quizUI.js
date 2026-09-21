import * as state from './state.js';
import { generateQuiz } from './quizEngine.js';
import { classifyAnswer } from './textMatch.js';
import { computeMaxPoints, computeSummary, sentenceErrorPoints } from './grading.js';
import { escapeHtml } from './util.js';

let container = null;
let viewState = 'setup';
let quizSession = null;

const STATUS_LABEL = {
  correct: '✅ Richtig',
  spelling: '🟡 Fast richtig (Rechtschreibfehler, 1/3 Fehlerpunkt)',
  wrong: '❌ Falsch',
};

function renderSetup() {
  const sets = state.getVocabSets();
  const activeSet = state.getActiveSet();

  container.innerHTML = `
    <div class="panel">
      <h2>Neuen Test erstellen</h2>
      <p class="hint">
        Abgefragt werden Lückensätze, Synonyme/Antonyme, Umschreibungen und freies Schreiben –
        bewusst keine reine Wort-für-Wort-Übersetzung.
      </p>
      <label>
        Vokabelliste:
        <select id="quiz-set-select">
          ${sets
            .map(
              (s) =>
                `<option value="${s.id}" ${s.id === activeSet.id ? 'selected' : ''}>${escapeHtml(
                  s.name
                )} (${s.entries.length} Vokabeln)</option>`
            )
            .join('')}
        </select>
      </label>
      <div class="quiz-config">
        <label>Lückensätze <input type="number" id="cfg-cloze" min="0" value="4" /></label>
        <label>Synonym / Antonym / Umschreibung <input type="number" id="cfg-synant" min="0" value="4" /></label>
        <label>Freies Schreiben (ganzer Satz) <input type="number" id="cfg-sentence" min="0" value="2" /></label>
      </div>
      <button type="button" data-action="start-quiz">Test starten</button>
      <div id="setup-warnings" class="warnings"></div>
    </div>`;

  container.querySelector('[data-action="start-quiz"]').addEventListener('click', () => {
    const setId = container.querySelector('#quiz-set-select').value;
    const set = state.getVocabSets().find((s) => s.id === setId);
    const config = {
      cloze: Number(container.querySelector('#cfg-cloze').value) || 0,
      synAnt: Number(container.querySelector('#cfg-synant').value) || 0,
      sentence: Number(container.querySelector('#cfg-sentence').value) || 0,
    };
    const { questions, warnings } = generateQuiz(set, config);
    if (questions.length === 0) {
      container.querySelector('#setup-warnings').innerHTML =
        '<p class="feedback feedback-wrong">Es konnten keine Fragen erzeugt werden. Bitte ergänze zuerst Beispielsätze, Synonyme/Antonyme oder Umschreibungen in der Vokabelliste.</p>';
      return;
    }
    quizSession = { set, questions, index: 0, answers: {} };
    viewState = 'quiz';
    render();
    if (warnings.length) {
      console.info('Vokabeltest-Hinweise:', warnings);
    }
  });
}

function autoQuestionBody(q, isLast) {
  const existing = quizSession.answers[q.id];
  const deHint = q.de ? `<p class="quiz-de-hint">(${escapeHtml(q.de)})</p>` : '';
  if (!existing) {
    return `
      ${deHint}
      <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
      <input type="text" id="answer-input" autocomplete="off" placeholder="Antwort auf Englisch" />
      <div class="quiz-actions"><button type="button" data-action="check">Antwort prüfen</button></div>`;
  }
  return `
    ${deHint}
    <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
    <input type="text" value="${escapeHtml(existing.userAnswer)}" disabled />
    <p class="feedback feedback-${existing.status}">
      ${STATUS_LABEL[existing.status]}${
        existing.status !== 'correct' ? ` — akzeptiert: ${escapeHtml(q.accepted.join(', '))}` : ''
      }
    </p>
    <div class="quiz-actions"><button type="button" data-action="next">${
      isLast ? 'Auswertung anzeigen' : 'Weiter'
    }</button></div>`;
}

function sentenceQuestionBody(q, isLast) {
  const existing = quizSession.answers[q.id];
  if (!existing || !existing.revealed) {
    return `
      <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
      <textarea id="sentence-input" rows="3" placeholder="Schreibe hier deinen Satz..."></textarea>
      <div class="quiz-actions"><button type="button" data-action="reveal-sentence">Antwort abschicken</button></div>`;
  }
  return `
    <p class="quiz-prompt">${escapeHtml(q.prompt)}</p>
    <textarea id="sentence-input" rows="3" disabled>${escapeHtml(existing.userSentence)}</textarea>
    ${
      q.modelSentence
        ? `<p class="model-sentence">Beispiel-Lösung: <em>${escapeHtml(q.modelSentence)}</em></p>`
        : ''
    }
    <div class="rubric">
      <p class="hint">
        Bewerte deinen Satz selbst (oder lass ihn bewerten): Wort-/Grammatikfehler zählen als 1 ganzer
        Fehler, Rechtschreibfehler als 1/3 Fehler, maximal 2 Fehlerpunkte pro Satz.
      </p>
      <label>Wort-/Grammatikfehler <input type="number" id="wg-errors" min="0" step="1" value="${
        existing.wg ?? 0
      }" /></label>
      <label>Rechtschreibfehler <input type="number" id="sp-errors" min="0" step="1" value="${
        existing.sp ?? 0
      }" /></label>
      <div class="quiz-actions"><button type="button" data-action="confirm-sentence">${
        isLast ? 'Auswertung anzeigen' : 'Weiter'
      }</button></div>
    </div>`;
}

function renderQuiz() {
  const { questions, index } = quizSession;
  const q = questions[index];
  const isLast = index === questions.length - 1;
  const body = q.type === 'sentence' ? sentenceQuestionBody(q, isLast) : autoQuestionBody(q, isLast);

  container.innerHTML = `
    <div class="panel quiz-panel">
      <div class="quiz-progress">Frage ${index + 1} von ${questions.length}</div>
      <div class="progress-bar"><div class="progress-bar-fill" style="width:${
        (index / questions.length) * 100
      }%"></div></div>
      ${body}
    </div>`;

  wireQuizEvents(q, isLast);
}

function advanceOrFinish(isLast) {
  if (isLast) {
    viewState = 'results';
    render();
  } else {
    quizSession.index += 1;
    render();
  }
}

function wireQuizEvents(q, isLast) {
  const checkBtn = container.querySelector('[data-action="check"]');
  if (checkBtn) {
    const input = container.querySelector('#answer-input');
    const submit = () => {
      const result = classifyAnswer(input.value, q.accepted);
      quizSession.answers[q.id] = { userAnswer: input.value, ...result };
      render();
    };
    checkBtn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    input.focus();
  }

  const nextBtn = container.querySelector('[data-action="next"]');
  if (nextBtn) nextBtn.addEventListener('click', () => advanceOrFinish(isLast));

  const revealBtn = container.querySelector('[data-action="reveal-sentence"]');
  if (revealBtn) {
    revealBtn.addEventListener('click', () => {
      const textarea = container.querySelector('#sentence-input');
      quizSession.answers[q.id] = { userSentence: textarea.value, revealed: true, wg: 0, sp: 0 };
      render();
    });
  }

  const confirmBtn = container.querySelector('[data-action="confirm-sentence"]');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const wg = Number(container.querySelector('#wg-errors').value) || 0;
      const sp = Number(container.querySelector('#sp-errors').value) || 0;
      const errorPoints = sentenceErrorPoints(wg, sp);
      quizSession.answers[q.id] = { ...quizSession.answers[q.id], wg, sp, errorPoints };
      advanceOrFinish(isLast);
    });
  }
}

function reviewRow(q) {
  const a = quizSession.answers[q.id] ?? {};
  if (q.type === 'sentence') {
    return `
      <tr>
        <td>${escapeHtml(q.prompt)}</td>
        <td>${escapeHtml(a.userSentence || '–')}</td>
        <td>${q.modelSentence ? escapeHtml(q.modelSentence) : '–'}</td>
        <td>WG: ${a.wg ?? 0}, RS: ${a.sp ?? 0}</td>
        <td>${(a.errorPoints ?? 0).toFixed(2)}</td>
      </tr>`;
  }
  return `
    <tr class="row-${a.status}">
      <td>${escapeHtml(q.prompt)}</td>
      <td>${escapeHtml(a.userAnswer || '–')}</td>
      <td>${escapeHtml(q.accepted.join(', '))}</td>
      <td>${STATUS_LABEL[a.status] ?? '–'}</td>
      <td>${(a.errorPoints ?? 0).toFixed(2)}</td>
    </tr>`;
}

function renderResults() {
  const { questions, answers } = quizSession;
  const totalErrorPoints = questions.reduce((sum, q) => sum + (answers[q.id]?.errorPoints ?? 0), 0);
  const maxPoints = computeMaxPoints(questions);
  const summary = computeSummary(totalErrorPoints, maxPoints, state.getGradeScale());

  container.innerHTML = `
    <div class="panel">
      <h2>Auswertung</h2>
      <div class="results-summary">
        <div class="grade-badge">Note ${escapeHtml(summary.grade)}</div>
        <div>
          <p>${summary.totalErrorPoints.toFixed(2)} von maximal ${summary.maxPoints} Fehlerpunkten
            (${summary.percent.toFixed(1)} % Fehlerquote)</p>
          <p class="hint">Notenschlüssel unter „Einstellungen“ anpassbar.</p>
        </div>
      </div>
      <div class="table-scroll">
        <table class="review-table">
          <thead>
            <tr><th>Frage</th><th>Deine Antwort</th><th>Erwartet / Musterlösung</th><th>Status</th><th>Fehlerpunkte</th></tr>
          </thead>
          <tbody>${questions.map(reviewRow).join('')}</tbody>
        </table>
      </div>
      <button type="button" data-action="restart">Neuer Test</button>
    </div>`;

  container.querySelector('[data-action="restart"]').addEventListener('click', () => {
    viewState = 'setup';
    quizSession = null;
    render();
  });
}

function render() {
  if (!container) return;
  if (viewState === 'setup') renderSetup();
  else if (viewState === 'quiz') renderQuiz();
  else renderResults();
}

export function mount(el) {
  container = el;
  state.subscribe(() => {
    if (viewState === 'setup') render();
  });
  render();
}

export { render };
