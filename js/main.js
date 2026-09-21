import * as vocabEditor from './vocabEditor.js';
import * as quizUI from './quizUI.js';
import * as game from './game.js';
import * as settings from './settings.js';

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

showView('vocab');
