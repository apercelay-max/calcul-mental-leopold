/* Sauvegarde de la progression dans le localStorage du navigateur */

const STORAGE_KEY = 'calculMentalLeopold_v1';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultState() {
  return {
    level: 1,
    lastLevelUpDate: null,
    seriesHistory: [] // { date, level, score, total, timeMs }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (e) {
    return defaultState();
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // stockage indisponible (navigation privée...) : on continue sans persister
  }
}

const MASTERY_THRESHOLD = 0.8; // 80% de réussite moyenne
const SERIES_NEEDED = 3;       // sur les 3 dernières séries au niveau courant

// Enregistre une série jouée, vérifie si le niveau suivant se débloque
// (au maximum un niveau débloqué par jour, pour étaler la progression sur plusieurs semaines).
function recordSeries(state, { level, score, total, timeMs }) {
  state.seriesHistory.push({ date: todayISO(), level, score, total, timeMs });

  let leveledUp = false;
  if (level === state.level && state.level < MAX_LEVEL) {
    const atLevel = state.seriesHistory.filter(s => s.level === state.level);
    const lastN = atLevel.slice(-SERIES_NEEDED);
    const canLevelToday = state.lastLevelUpDate !== todayISO();

    if (lastN.length >= SERIES_NEEDED && canLevelToday) {
      const avg = lastN.reduce((sum, s) => sum + s.score / s.total, 0) / lastN.length;
      if (avg >= MASTERY_THRESHOLD) {
        state.level += 1;
        state.lastLevelUpDate = todayISO();
        leveledUp = true;
      }
    }
  }

  saveState(state);
  return leveledUp;
}

function bestScore(state, level) {
  const atLevel = state.seriesHistory.filter(s => s.level === level);
  if (atLevel.length === 0) return null;
  return atLevel.reduce((best, s) => (s.score / s.total > best.score / best.total ? s : best));
}

function seriesAtCurrentLevel(state) {
  return state.seriesHistory.filter(s => s.level === state.level);
}
