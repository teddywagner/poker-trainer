interface ScoreBarProps {
  correct: number;
  total: number;
  streak: number;
}

export function ScoreBar({ correct, total, streak }: ScoreBarProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="stat-row" style={{ marginBottom: 16 }}>
      <div className="stat-badge">
        <span className="stat-value">{correct}/{total}</span>
        <span className="stat-label">Score</span>
      </div>
      <div className="stat-badge">
        <span className="stat-value" style={{ color: pct >= 70 ? 'var(--green)' : pct >= 50 ? '#f39c12' : 'var(--red)' }}>{pct}%</span>
        <span className="stat-label">Accuracy</span>
      </div>
      <div className="stat-badge">
        <span className="stat-value">{streak}</span>
        <span className="stat-label">Streak</span>
      </div>
    </div>
  );
}
