import { useState, useMemo } from 'react';
import { loadStats, clearStats, getAccuracy, getTotalStats, PlayerStats } from '../../core/stats';

export function StatsPage() {
  const [stats, setStats] = useState<PlayerStats>(loadStats);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const totalPreflop = useMemo(() => getTotalStats(stats, 'preflop'), [stats]);
  const totalPostflop = useMemo(() => getTotalStats(stats, 'postflop'), [stats]);
  const totalQuiz = useMemo(() => getTotalStats(stats, 'quiz'), [stats]);
  const totalAll = useMemo(() => getTotalStats(stats), [stats]);

  const handleClear = () => {
    clearStats();
    setStats(loadStats());
    setShowConfirmClear(false);
  };

  type StatEntry = { total: number; correct: number };
  const positionEntries = Object.entries(stats.preflopByPosition) as [string, StatEntry][];
  const postflopEntries = Object.entries(stats.postflopByType) as [string, StatEntry][];
  const quizEntries = Object.entries(stats.quizByType) as [string, StatEntry][];
  const maxPosTotal = Math.max(1, ...positionEntries.map(([, v]) => v.total));

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Your Progress</h2>

      {/* Overall Stats */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{totalAll.total}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Hands</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: getAccuracy(totalAll) >= 70 ? 'var(--green)' : 'var(--red)' }}>
              {getAccuracy(totalAll)}%
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Accuracy</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>{stats.bestStreak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Best Streak</div>
          </div>
        </div>
      </div>

      {/* Mode Breakdown */}
      <div className="section-header">By Mode</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <ModeCard label="Preflop" total={totalPreflop.total} accuracy={getAccuracy(totalPreflop)} color="var(--green)" />
        <ModeCard label="Postflop" total={totalPostflop.total} accuracy={getAccuracy(totalPostflop)} color="var(--blue)" />
        <ModeCard label="Quiz" total={totalQuiz.total} accuracy={getAccuracy(totalQuiz)} color="var(--gold)" />
      </div>

      {/* Position Accuracy */}
      {positionEntries.length > 0 && (
        <>
          <div className="section-header">Preflop by Position</div>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div className="bar-chart">
              {positionEntries.map(([pos, data]) => {
                const acc = getAccuracy(data);
                return (
                  <div key={pos} className="bar-chart-item">
                    <div className="bar-chart-value">{acc}%</div>
                    <div
                      className="bar-chart-bar"
                      style={{
                        height: `${(data.total / maxPosTotal) * 80}%`,
                        background: acc >= 70 ? 'var(--green)' : acc >= 50 ? '#f39c12' : 'var(--red)',
                      }}
                    />
                    <div className="bar-chart-label">{pos}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Postflop by Type */}
      {postflopEntries.length > 0 && (
        <>
          <div className="section-header">Postflop by Scenario</div>
          <div className="panel" style={{ marginBottom: 16 }}>
            {postflopEntries.map(([type, data]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{data.total} hands</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: getAccuracy(data) >= 70 ? 'var(--green)' : 'var(--red)' }}>
                    {getAccuracy(data)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quiz by Type */}
      {quizEntries.length > 0 && (
        <>
          <div className="section-header">Quiz by Category</div>
          <div className="panel" style={{ marginBottom: 16 }}>
            {quizEntries.map(([type, data]) => (
              <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{type}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{data.total} q's</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: getAccuracy(data) >= 70 ? 'var(--green)' : 'var(--red)' }}>
                    {getAccuracy(data)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Session History */}
      {stats.sessions.length > 0 && (
        <>
          <div className="section-header">Recent Sessions</div>
          <div className="panel" style={{ marginBottom: 16 }}>
            {stats.sessions.slice(-10).reverse().map((session, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 9 ? '1px solid var(--border-color)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{session.mode}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{session.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: getAccuracy(session) >= 70 ? 'var(--green)' : 'var(--red)' }}>
                    {getAccuracy(session)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{session.correct}/{session.total}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Clear Data */}
      <div style={{ padding: '16px 0' }}>
        {!showConfirmClear ? (
          <button className="btn btn-ghost btn-block" onClick={() => setShowConfirmClear(true)}>
            Clear All Data
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleClear}>
              Confirm Clear
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmClear(false)}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {totalAll.total === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#x1F4CA;</div>
          <p style={{ fontSize: 14 }}>No data yet. Start training to see your progress!</p>
        </div>
      )}
    </div>
  );
}

function ModeCard({ label, total, accuracy, color }: { label: string; total: number; accuracy: number; color: string }) {
  return (
    <div className="panel" style={{ flex: 1, textAlign: 'center', padding: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{accuracy}%</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{total} hands</div>
    </div>
  );
}
