import { PlayerStats, SessionStats } from './types';

const STATS_KEY = 'poker-trainer-stats';

function getDefaultStats(): PlayerStats {
  return {
    sessions: [],
    currentStreak: 0,
    bestStreak: 0,
    preflopByPosition: {},
    postflopByType: {},
    quizByType: {},
  };
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return getDefaultStats();
    return JSON.parse(raw);
  } catch {
    return getDefaultStats();
  }
}

export function saveStats(stats: PlayerStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function clearStats(): void {
  localStorage.removeItem(STATS_KEY);
}

export function recordResult(
  stats: PlayerStats,
  mode: 'preflop' | 'postflop' | 'quiz',
  correct: boolean,
  detail: string,
): PlayerStats {
  const updated = { ...stats };

  // Update streak
  if (correct) {
    updated.currentStreak++;
    if (updated.currentStreak > updated.bestStreak) {
      updated.bestStreak = updated.currentStreak;
    }
  } else {
    updated.currentStreak = 0;
  }

  // Update per-category stats
  const categoryMap = mode === 'preflop' ? updated.preflopByPosition :
    mode === 'postflop' ? updated.postflopByType : updated.quizByType;

  if (!categoryMap[detail]) {
    categoryMap[detail] = { total: 0, correct: 0 };
  }
  categoryMap[detail].total++;
  if (correct) categoryMap[detail].correct++;

  // Update or create session
  const today = new Date().toISOString().split('T')[0];
  let session = updated.sessions.find(s => s.date === today && s.mode === mode);
  if (!session) {
    session = { date: today, mode, total: 0, correct: 0, details: {} };
    updated.sessions.push(session);
  }
  session.total++;
  if (correct) session.correct++;
  if (!session.details[detail]) session.details[detail] = { total: 0, correct: 0 };
  session.details[detail].total++;
  if (correct) session.details[detail].correct++;

  saveStats(updated);
  return updated;
}

export function getAccuracy(stats: { total: number; correct: number }): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.correct / stats.total) * 100);
}

export function getTotalStats(playerStats: PlayerStats, mode?: string): { total: number; correct: number } {
  const sessions = mode
    ? playerStats.sessions.filter(s => s.mode === mode)
    : playerStats.sessions;
  return sessions.reduce(
    (acc, s) => ({ total: acc.total + s.total, correct: acc.correct + s.correct }),
    { total: 0, correct: 0 }
  );
}
