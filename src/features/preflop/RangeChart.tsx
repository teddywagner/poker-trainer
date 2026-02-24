import { useState, useMemo } from 'react';
import { buildMatrix, getRangeStats, MATRIX_RANKS, CellAction } from '../../core/rangeMatrix';

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB'] as const;

const ACTION_COLORS: Record<CellAction, string> = {
  raise: '#27ae60',
  '3bet': '#3498db',
  call: '#d4a543',
  fold: '#1a1a2e',
};

export function RangeChart({ onClose }: { onClose: () => void }) {
  const [position, setPosition] = useState<string>('UTG');
  const [facingRaise, setFacingRaise] = useState(false);

  const matrix = useMemo(() => buildMatrix(position, facingRaise), [position, facingRaise]);
  const stats = useMemo(() => getRangeStats(matrix), [matrix]);

  const modeLabel = facingRaise ? '3-Betting' : 'Opening';

  return (
    <div className="range-chart-overlay">
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>GTO Ranges</h2>
        <button
          className="btn btn-ghost btn-small"
          onClick={onClose}
          style={{ fontSize: 18, padding: '6px 12px' }}
        >
          ✕
        </button>
      </div>

      {/* Position selector */}
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {POSITIONS.map(pos => (
            <button
              key={pos}
              className={`btn btn-small ${position === pos ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontSize: 12, padding: '6px 0' }}
              onClick={() => setPosition(pos)}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ padding: '8px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn btn-small ${!facingRaise ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => setFacingRaise(false)}
          >
            Open Raise
          </button>
          <button
            className={`btn btn-small ${facingRaise ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, fontSize: 12 }}
            onClick={() => setFacingRaise(true)}
          >
            Facing Raise
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        padding: '6px 16px 10px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-secondary)',
        flexShrink: 0,
      }}>
        {modeLabel} <strong style={{ color: 'var(--gold)' }}>{stats.percentage}%</strong> of hands
        <span style={{ color: 'var(--text-dim)', marginLeft: 6 }}>({stats.combos} combos)</span>
      </div>

      {/* Grid */}
      <div style={{ padding: '0 12px', flex: 1, overflow: 'auto' }}>
        <div className="range-grid">
          {(() => {
            const cells: React.ReactNode[] = [];
            // Corner
            cells.push(<div key="corner" className="range-label" />);
            // Column headers
            for (let c = 0; c < 13; c++) {
              cells.push(<div key={`ch${c}`} className="range-label">{MATRIX_RANKS[c]}</div>);
            }
            // Rows
            for (let r = 0; r < 13; r++) {
              cells.push(<div key={`rh${r}`} className="range-label">{MATRIX_RANKS[r]}</div>);
              for (let c = 0; c < 13; c++) {
                const cell = matrix[r][c];
                cells.push(
                  <div
                    key={`${r}-${c}`}
                    className={`range-cell range-cell-${cell.action} ${cell.type === 'pair' ? 'range-cell-pair' : ''}`}
                  >
                    {cell.notation}
                  </div>
                );
              }
            }
            return cells;
          })()}
        </div>

        {/* Legend */}
        <div className="range-legend">
          {facingRaise ? (
            <>
              <LegendItem color={ACTION_COLORS['3bet']} label="3-Bet" />
              <LegendItem color={ACTION_COLORS.call} label="Call" />
              <LegendItem color={ACTION_COLORS.fold} label="Fold" />
            </>
          ) : (
            <>
              <LegendItem color={ACTION_COLORS.raise} label="Raise" />
              <LegendItem color={ACTION_COLORS.fold} label="Fold" />
            </>
          )}
        </div>

        {/* Notation guide */}
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--text-dim)',
          paddingBottom: 16,
        }}>
          Above diagonal = suited &middot; Diagonal = pairs &middot; Below = offsuit
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="range-legend-item">
      <div className="range-legend-swatch" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
