import { useState, useCallback } from 'react';
import { Card, Position, Position6Max, PreflopAction, PriorAction, StackDepth, TableSize } from '../../core/types';
import { dealCards, handNotation } from '../../core/deck';
import { getRecommendedAction, getHandTier, generatePriorAction, priorActionDisplay } from '../../core/ranges';
import { CardView } from '../../components/CardView';
import { Feedback } from '../../components/Feedback';
import { ScoreBar } from '../../components/ScoreBar';
import { RangeChart } from './RangeChart';

const POSITIONS_6MAX: Position6Max[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
const POSITIONS_9MAX: Position[] = ['UTG', 'UTG+1', 'MP', 'MP+1', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

export function PreflopTrainer() {
  const [tableSize, setTableSize] = useState<TableSize>('6max');
  const [stackDepth, setStackDepth] = useState<StackDepth>(100);
  const [scenario, setScenario] = useState<{
    cards: [Card, Card];
    position: Position;
    priorAction: PriorAction;
  } | null>(null);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    userAction: string;
    recommended: PreflopAction;
    explanation: string;
    tier: string;
  } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [showRangeChart, setShowRangeChart] = useState(false);

  const dealNewHand = useCallback(() => {
    const cards = dealCards(2) as [Card, Card];
    const positions = tableSize === '6max' ? POSITIONS_6MAX : POSITIONS_9MAX;
    const position = positions[Math.floor(Math.random() * positions.length)];
    const priorAction = generatePriorAction(position);
    setScenario({ cards, position, priorAction });
    setFeedback(null);
  }, [tableSize]);

  const handleAction = (action: PreflopAction) => {
    if (!scenario || feedback) return;
    const { cards, position, priorAction } = scenario;
    const rec = getRecommendedAction(cards, position, priorAction, stackDepth, tableSize);
    const notation = handNotation(cards);
    const tier = getHandTier(notation);

    // Check correctness with some flexibility
    const isCorrect = checkCorrectness(action, rec.action);

    setFeedback({
      correct: isCorrect,
      userAction: actionLabel(action),
      recommended: rec.action,
      explanation: rec.explanation,
      tier,
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  function checkCorrectness(user: PreflopAction, recommended: PreflopAction): boolean {
    if (user === recommended) return true;
    // Allow some flexibility
    if (user === 'raise' && recommended === '3bet') return true;
    if (user === '3bet' && recommended === 'raise') return true;
    if (user === 'allin' && recommended === '3bet') return true;
    if (user === 'allin' && recommended === 'raise' && stackDepth === 20) return true;
    return false;
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Preflop Trainer</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-small ${tableSize === '6max' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTableSize('6max')}
          >6-Max</button>
          <button
            className={`btn btn-small ${tableSize === '9max' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTableSize('9max')}
          >9-Max</button>
        </div>
      </div>

      <ScoreBar correct={score.correct} total={score.total} streak={score.streak} />

      {/* Stack Depth Selector */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
        {([20, 50, 100] as StackDepth[]).map(d => (
          <button
            key={d}
            className={`btn btn-small ${stackDepth === d ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStackDepth(d)}
          >{d}bb</button>
        ))}
      </div>

      <button
        className="btn btn-ghost btn-small"
        onClick={() => setShowRangeChart(true)}
        style={{ width: '100%', marginBottom: 12, fontSize: 13 }}
      >
        View GTO Ranges
      </button>

      {!scenario ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
            Practice preflop decisions based on GTO-approximate ranges.
            You'll be dealt random hole cards with a random position and action.
          </p>
          <button className="btn btn-primary btn-large" onClick={dealNewHand}>
            Deal First Hand
          </button>
        </div>
      ) : (
        <>
          {/* Scenario Info */}
          <div className="table-area" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span className="position-tag" style={{
                  background: ['BTN'].includes(scenario.position) ? 'var(--felt-green)' :
                    ['SB'].includes(scenario.position) ? '#8e44ad' :
                      ['BB'].includes(scenario.position) ? 'var(--red)' : 'var(--bg-card)',
                  color: 'white'
                }}>
                  {scenario.position}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{stackDepth}bb deep</span>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                {priorActionDisplay(scenario.priorAction)}
              </span>
            </div>

            {/* Hole Cards */}
            <div className="card-group" style={{ justifyContent: 'center' }}>
              <CardView card={scenario.cards[0]} size="large" delay={0} />
              <CardView card={scenario.cards[1]} size="large" delay={1} />
            </div>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                {handNotation(scenario.cards)}
              </span>
              {feedback && (
                <span className={`tag tag-${feedback.tier.toLowerCase()}`} style={{ marginLeft: 8 }}>
                  {feedback.tier}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!feedback && (
            <div className="action-grid slide-up">
              <button className="btn btn-danger" onClick={() => handleAction('fold')}>
                Fold
              </button>
              <button className="btn btn-secondary" onClick={() => handleAction('call')}>
                {scenario.priorAction === 'folded_to_you' ? 'Limp' : 'Call'}
              </button>
              <button className="btn btn-success" onClick={() => handleAction('raise')}>
                Raise
              </button>
              <button className="btn" style={{ background: 'var(--blue)', color: 'white' }}
                onClick={() => handleAction('3bet')}>
                3-Bet
              </button>
              <button className="btn btn-primary" style={{ gridColumn: '1 / -1' }}
                onClick={() => handleAction('allin')}>
                All-In
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feedback
                correct={feedback.correct}
                title={feedback.correct ? 'Correct!' : `Incorrect — ${actionLabel(feedback.recommended)} recommended`}
                message={feedback.explanation}
                details={
                  !feedback.correct && (
                    <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                      You chose: <strong style={{ color: 'var(--red)' }}>{feedback.userAction}</strong>
                    </div>
                  )
                }
              />
              <button className="btn btn-primary btn-block" onClick={dealNewHand}>
                Deal Next Hand
              </button>
            </div>
          )}
        </>
      )}
      {showRangeChart && <RangeChart onClose={() => setShowRangeChart(false)} />}
    </div>
  );
}

function actionLabel(action: PreflopAction): string {
  switch (action) {
    case 'fold': return 'Fold';
    case 'call': return 'Call';
    case 'raise': return 'Raise';
    case '3bet': return '3-Bet';
    case 'allin': return 'All-In';
  }
}
