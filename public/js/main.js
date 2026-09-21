import * as state from './state.js';
import { fetchRemoteSet } from './api.js';
import * as vocabEditor from './vocabEditor.js';
import * as quizUI from './quizUI.js';
import * as game from './game.js';
import * as settings from './settings.js';

const SHARE_LINK_PATTERN = /^\/s\/([0-9A-Za-z_-]{4,32})$/;

const views = {
  vocab: document.getElementById('view-vocab'),
  quiz: document.getElementById('view-quiz'),
  game: document.getElementById('view-game'),
  settings: document.getElementById('view-settings'),
};

const navButtons = document.querySelectorAll('[data-nav]');

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.hidden = key !== name;
  });
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === name);
  });
  if (name === 'vocab') vocabEditor.render();
  if (name === 'quiz') quizUI.render();
  if (name === 'game') game.render();
  if (name === 'settings') settings.render();
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => showView(btn.dataset.nav));
});

vocabEditor.mount(views.vocab);
quizUI.mount(views.quiz);
game.mount(views.game);
settings.mount(views.settings);

const shareMatch = window.location.pathname.match(SHARE_LINK_PATTERN);

if (shareMatch) {
  showView('quiz');
  views.quiz.innerHTML = '<div class="panel"><p>Vokabelliste wird geladen…</p></div>';
  fetchRemoteSet(shareMatch[1])
    .then((record) => {
      state.importRemoteSet(record);
      showView('quiz');
    })
    .catch((err) => {
      views.quiz.innerHTML = `<div class="panel"><p class="feedback feedback-wrong">${
        err.message || 'Die Vokabelliste konnte nicht geladen werden.'
      }</p></div>`;
    });
} else {
  showView('vocab');
}
