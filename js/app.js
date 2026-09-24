/* Logique de l'application : écrans, quiz, affichage */

let state = loadState();
let playLevel = state.level;

// --- Éléments DOM ---
const screens = {
  home: document.getElementById('screen-home'),
  quiz: document.getElementById('screen-quiz'),
  results: document.getElementById('screen-results')
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
}

// --- Écran d'accueil ---
function renderHome() {
  const level = getLevel(state.level);
  document.getElementById('home-level-number').textContent = state.level;
  document.getElementById('home-level-name').textContent = level.name;
  document.getElementById('home-level-desc').textContent = level.desc;

  const series = seriesAtCurrentLevel(state);
  const last3 = series.slice(-SERIES_NEEDED);
  const dotsEl = document.getElementById('progress-dots');
  dotsEl.innerHTML = '';
  for (let i = 0; i < SERIES_NEEDED; i++) {
    const s = last3[i];
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (s) dot.classList.add(s.score / s.total >= MASTERY_THRESHOLD ? 'dot-good' : 'dot-bad');
    dotsEl.appendChild(dot);
  }

  const progressText = document.getElementById('progress-text');
  if (state.level >= MAX_LEVEL) {
    progressText.textContent = 'Bravo, tous les niveaux sont débloqués ! 🏆';
  } else if (last3.length < SERIES_NEEDED) {
    progressText.textContent = `Joue ${SERIES_NEEDED - last3.length} série(s) de plus pour tenter de débloquer le niveau suivant.`;
  } else {
    const avg = last3.reduce((sum, s) => sum + s.score / s.total, 0) / last3.length;
    if (avg >= MASTERY_THRESHOLD && state.lastLevelUpDate === todayISO()) {
      progressText.textContent = 'Niveau maîtrisé ! Reviens demain pour débloquer la suite 🔓';
    } else if (avg >= MASTERY_THRESHOLD) {
      progressText.textContent = 'Tu maîtrises ce niveau, joue une nouvelle série pour débloquer la suite !';
    } else {
      progressText.textContent = 'Continue à t\'entraîner pour atteindre 80% de réussite.';
    }
  }

  const best = bestScore(state, state.level);
  document.getElementById('stat-best').textContent = best ? `${best.score}/${best.total}` : '—';
  document.getElementById('stat-count').textContent = state.seriesHistory.length;

  const map = document.getElementById('levels-map');
  map.innerHTML = '';
  LEVELS.forEach(l => {
    const badge = document.createElement('button');
    badge.className = 'map-badge';
    badge.textContent = l.id;
    badge.title = l.name;
    if (l.id > state.level) {
      badge.classList.add('locked');
      badge.disabled = true;
    } else {
      if (l.id === playLevel) badge.classList.add('selected');
      badge.addEventListener('click', () => {
        playLevel = l.id;
        renderHome();
      });
    }
    map.appendChild(badge);
  });
}

// --- Quiz ---
const SERIES_LENGTH = 10;
let quiz = null;

function startQuiz() {
  const level = getLevel(playLevel);
  quiz = {
    level: playLevel,
    questions: Array.from({ length: SERIES_LENGTH }, () => level.generate()),
    index: 0,
    score: 0,
    startTime: Date.now(),
    timerId: null
  };
  showScreen('quiz');
  quiz.timerId = setInterval(updateTimer, 500);
  renderQuestion();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - quiz.startTime) / 1000);
  const mm = Math.floor(elapsed / 60);
  const ss = (elapsed % 60).toString().padStart(2, '0');
  document.getElementById('quiz-timer').textContent = `${mm}:${ss}`;
}

const inputEl = document.getElementById('quiz-input');
const signBtn = document.getElementById('btn-sign');
const validateBtn = document.getElementById('btn-validate');
const nextBtn = document.getElementById('btn-next');
const feedbackEl = document.getElementById('quiz-feedback');
const hintBtn = document.getElementById('btn-hint');
const hintEl = document.getElementById('quiz-hint');

function renderQuestion() {
  const q = quiz.questions[quiz.index];
  document.getElementById('quiz-progress').textContent = `Question ${quiz.index + 1}/${SERIES_LENGTH}`;
  document.getElementById('quiz-score').textContent = `Score ${quiz.score}`;
  document.getElementById('quiz-question').textContent = q.text;
  inputEl.value = '';
  inputEl.className = 'quiz-input';
  inputEl.inputMode = q.answerType === 'fraction' ? 'text' : 'decimal';
  signBtn.classList.toggle('hidden', quiz.level !== 7);
  feedbackEl.textContent = '';
  feedbackEl.className = 'quiz-feedback';
  validateBtn.classList.remove('hidden');
  nextBtn.classList.add('hidden');
  hintEl.textContent = q.hint || '';
  hintEl.classList.add('hidden');
  hintBtn.textContent = '💡 Voir un indice';
  hintBtn.classList.toggle('hidden', !q.hint);
  inputEl.disabled = false;
  inputEl.focus();
}

hintBtn.addEventListener('click', () => {
  const showing = hintEl.classList.toggle('hidden') === false;
  hintBtn.textContent = showing ? '🙈 Cacher l\'indice' : '💡 Voir un indice';
});

signBtn.addEventListener('click', () => {
  inputEl.value = inputEl.value.startsWith('-') ? inputEl.value.slice(1) : '-' + inputEl.value;
  inputEl.focus();
});

function normalizeFraction(str) {
  const m = str.trim().match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  let n = parseInt(m[1], 10), d = parseInt(m[2], 10);
  const g = gcd(n, d) || 1;
  return `${n / g}/${d / g}`;
}

function checkAnswer(q, raw) {
  if (q.answerType === 'fraction') {
    const norm = normalizeFraction(raw);
    return norm !== null && norm === q.answer;
  }
  const cleaned = raw.trim().replace(',', '.');
  const val = parseFloat(cleaned);
  return !isNaN(val) && Math.abs(val - q.answer) < 0.01;
}

function submitAnswer() {
  const raw = inputEl.value;
  if (raw.trim() === '') { inputEl.focus(); return; }
  const q = quiz.questions[quiz.index];
  const correct = checkAnswer(q, raw);

  if (correct) {
    quiz.score += 1;
    feedbackEl.textContent = '✔ Bravo !';
    feedbackEl.className = 'quiz-feedback feedback-good';
  } else {
    feedbackEl.textContent = `✘ La bonne réponse était ${q.answer}`;
    feedbackEl.className = 'quiz-feedback feedback-bad';
  }
  document.getElementById('quiz-score').textContent = `Score ${quiz.score}`;
  inputEl.disabled = true;
  validateBtn.classList.add('hidden');
  nextBtn.classList.remove('hidden');
  nextBtn.focus();
}

function nextQuestion() {
  quiz.index += 1;
  if (quiz.index >= SERIES_LENGTH) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

function finishQuiz() {
  clearInterval(quiz.timerId);
  const timeMs = Date.now() - quiz.startTime;
  const leveledUp = recordSeries(state, {
    level: quiz.level,
    score: quiz.score,
    total: SERIES_LENGTH,
    timeMs
  });

  document.getElementById('results-score').textContent = `${quiz.score}/${SERIES_LENGTH}`;
  const seconds = Math.round(timeMs / 1000);
  document.getElementById('results-time').textContent = `Temps : ${Math.floor(seconds / 60)} min ${(seconds % 60).toString().padStart(2, '0')} s`;

  const pct = quiz.score / SERIES_LENGTH;
  let message;
  if (pct === 1) message = 'Parfait, tu maîtrises à fond ! 🌟';
  else if (pct >= 0.8) message = 'Très bien joué ! 👏';
  else if (pct >= 0.5) message = 'Pas mal, continue à t\'entraîner ! 💪';
  else message = 'C\'est en s\'entraînant qu\'on progresse, retente ta chance ! 🙂';
  document.getElementById('results-message').textContent = message;

  const levelupEl = document.getElementById('results-levelup');
  if (leveledUp) {
    levelupEl.textContent = `🎉 Niveau ${state.level} débloqué : ${getLevel(state.level).name} !`;
    levelupEl.classList.remove('hidden');
  } else {
    levelupEl.textContent = '';
    levelupEl.classList.add('hidden');
  }

  playLevel = state.level;
  showScreen('results');
}

// --- Navigation ---
document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-validate').addEventListener('click', submitAnswer);
document.getElementById('btn-next').addEventListener('click', nextQuestion);
document.getElementById('btn-replay').addEventListener('click', startQuiz);
document.getElementById('btn-home').addEventListener('click', () => {
  renderHome();
  showScreen('home');
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (!validateBtn.classList.contains('hidden')) submitAnswer();
    else nextQuestion();
  }
});

// --- Démarrage ---
renderHome();
showScreen('home');
