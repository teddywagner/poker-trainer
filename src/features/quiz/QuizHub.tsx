import { useState } from 'react';
import { GuessOdds } from './GuessOdds';
import { OutsCounter } from './OutsCounter';
import { HandRankingDrill } from './HandRankingDrill';
import { PotOddsQuiz } from './PotOddsQuiz';
import { RangeVsRange } from './RangeVsRange';

type QuizTab = 'odds' | 'outs' | 'ranking' | 'pot_odds' | 'range';

const QUIZ_TABS: { id: QuizTab; label: string; icon: string }[] = [
  { id: 'odds', label: 'Odds', icon: '%' },
  { id: 'outs', label: 'Outs', icon: '#' },
  { id: 'ranking', label: 'Hands', icon: 'VS' },
  { id: 'pot_odds', label: 'Pot Odds', icon: '$' },
  { id: 'range', label: 'Ranges', icon: 'R' },
];

export function QuizHub() {
  const [activeTab, setActiveTab] = useState<QuizTab>('odds');

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Probability Quizzes</h2>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        overflowX: 'auto',
        marginBottom: 16,
        paddingBottom: 4,
        WebkitOverflowScrolling: 'touch',
      }}>
        {QUIZ_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flexShrink: 0,
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === tab.id ? 'var(--felt-green)' : 'var(--bg-card)',
              color: activeTab === tab.id ? 'white' : 'var(--text-dim)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.7 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Quiz */}
      {activeTab === 'odds' && <GuessOdds />}
      {activeTab === 'outs' && <OutsCounter />}
      {activeTab === 'ranking' && <HandRankingDrill />}
      {activeTab === 'pot_odds' && <PotOddsQuiz />}
      {activeTab === 'range' && <RangeVsRange />}
    </div>
  );
}
