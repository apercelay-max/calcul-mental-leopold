const TOTAL_QUESTIONS = 10;

const state = {
  op: 'add',
  level: 1,
  questions: [],
  index: 0,
  score: 0,
  startTime: 0,
};

const screens = {
  menu: document.getElementById('screen-menu'),
  game: document.getElementById('screen-game'),
  end: document.getElementById('screen-end'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(op, level) {
  const ranges = {
    add: { 1: [1, 20], 2: [1, 100], 3: [1, 1000] },
    sub: { 1: [1, 20], 2: [1, 100], 3: [1, 1000] },
    mul: { 1: [1, 5], 2: [1, 10], 3: [11, 20] },
    div: { 1: [1, 5], 2: [1, 10], 3: [2, 12] },
  };

  if (op === 'add') {
    const [min, max] = ranges.add[level];
    const a = randInt(min, max);
    const b = randInt(min, max);
    return { text: `${a} + ${b}`, answer: a + b };
  }

  if (op === 'sub') {
    const [min, max] = ranges.sub[level];
    const a = randInt(min, max);
    const b = randInt(min, a);
    return { text: `${a} - ${b}`, answer: a - b };
  }

  if (op === 'mul') {
    const [min, max] = ranges.mul[level];
    const a = randInt(min, max);
    const b = randInt(1, 10);
    return { text: `${a} × ${b}`, answer: a * b };
  }

  if (op === 'div') {
    const [min, max] = ranges.div[level];
    const b = randInt(2, 10);
    const result = randInt(min, max);
    const a = b * result;
    return { text: `${a} ÷ ${b}`, answer: result };
  }
}

function buildQuestions(op, level) {
  const ops = ['add', 'sub', 'mul', 'div'];
  const list = [];
  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    const chosenOp = op === 'mix' ? ops[randInt(0, ops.length - 1)] : op;
    list.push(generateQuestion(chosenOp, level));
  }
  return list;
}

function bestScoreKey(op, level) {
  return `calcul-mental-best-${op}-${level}`;
}

function getBestScore(op, level) {
  try {
    return localStorage.getItem(bestScoreKey(op, level));
  } catch (e) {
    return null;
  }
}

function setBestScore(op, level, score, timeSeconds) {
  try {
    const current = JSON.parse(getBestScore(op, level) || 'null');
    if (!current || score > current.score || (score === current.score && timeSeconds < current.time)) {
      localStorage.setItem(bestScoreKey(op, level), JSON.stringify({ score, time: timeSeconds }));
      return true;
    }
  } catch (e) {
    // localStorage indisponible, on ignore silencieusement
  }
  return false;
}

function updateBestScoreDisplay() {
  const el = document.getElementById('best-score');
  const raw = getBestScore(state.op, state.level);
  if (!raw) {
    el.textContent = '';
    return;
  }
  try {
    const { score, time } = JSON.parse(raw);
    el.textContent = `Meilleur score sur ce mode : ${score}/${TOTAL_QUESTIONS} en ${time}s`;
  } catch (e) {
    el.textContent = '';
  }
}

document.getElementById('ops').addEventListener('click', (e) => {
  const btn = e.target.closest('.choice');
  if (!btn) return;
  document.querySelectorAll('#ops .choice').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.op = btn.dataset.op;
  updateBestScoreDisplay();
});

document.getElementById('levels').addEventListener('click', (e) => {
  const btn = e.target.closest('.choice');
  if (!btn) return;
  document.querySelectorAll('#levels .choice').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.level = Number(btn.dataset.level);
  updateBestScoreDisplay();
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('replay-btn').addEventListener('click', startGame);
document.getElementById('menu-btn').addEventListener('click', () => {
  updateBestScoreDisplay();
  showScreen('menu');
});

function startGame() {
  state.questions = buildQuestions(state.op, state.level);
  state.index = 0;
  state.score = 0;
  state.startTime = Date.now();
  showScreen('game');
  renderQuestion();
}

function renderQuestion() {
  const q = state.questions[state.index];
  document.getElementById('progress').textContent = `Question ${state.index + 1}/${TOTAL_QUESTIONS}`;
  document.getElementById('score').textContent = `Score : ${state.score}`;
  document.getElementById('question').textContent = q.text;
  const input = document.getElementById('answer');
  input.value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className = 'feedback';
  input.focus();
}

function validateAnswer() {
  const input = document.getElementById('answer');
  const userAnswer = Number(input.value);
  const q = state.questions[state.index];
  const feedback = document.getElementById('feedback');

  if (input.value === '') return;

  if (userAnswer === q.answer) {
    state.score++;
    feedback.textContent = 'Bravo ! 🎉';
    feedback.className = 'feedback correct';
  } else {
    feedback.textContent = `Raté... la réponse était ${q.answer}`;
    feedback.className = 'feedback wrong';
  }

  document.getElementById('score').textContent = `Score : ${state.score}`;

  setTimeout(() => {
    state.index++;
    if (state.index < TOTAL_QUESTIONS) {
      renderQuestion();
    } else {
      endGame();
    }
  }, 900);
}

document.getElementById('validate-btn').addEventListener('click', validateAnswer);
document.getElementById('answer').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validateAnswer();
});

function endGame() {
  const timeSeconds = Math.round((Date.now() - state.startTime) / 1000);
  const isNewBest = setBestScore(state.op, state.level, state.score, timeSeconds);

  document.getElementById('end-title').textContent =
    state.score === TOTAL_QUESTIONS ? 'Parfait ! 🏆' : state.score >= TOTAL_QUESTIONS / 2 ? 'Bien joué ! 👏' : 'Continue à t\'entraîner ! 💪';
  document.getElementById('end-score').textContent = `Score : ${state.score}/${TOTAL_QUESTIONS}`;
  document.getElementById('end-time').textContent =
    `Temps : ${timeSeconds}s` + (isNewBest ? ' — Nouveau record ! 🌟' : '');

  showScreen('end');
}

updateBestScoreDisplay();
