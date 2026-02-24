import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, HandResult } from '../../core/types';
import { dealCards } from '../../core/deck';
import { evaluateBest5, compareHands } from '../../core/evaluator';
import { CardGroup } from '../../components/CardView';
import { Feedback } from '../../components/Feedback';

interface DrillScenario {
  hand1: Card[];
  hand2: Card[];
  result1: HandResult;
  result2: HandResult;
  winner: 'left' | 'right' | 'tie';
}

function generateDrill(): DrillScenario {
  const cards = dealCards(10);
  const hand1 = cards.slice(0, 5);
  const hand2 = cards.slice(5, 10);
  const result1 = evaluateBest5(hand1);
  const result2 = evaluateBest5(hand2);
  const cmp = compareHands(result1, result2);
  const winner = cmp > 0 ? 'left' as const : cmp < 0 ? 'right' as const : 'tie' as const;
  return { hand1, hand2, result1, result2, winner };
}

export function HandRankingDrill() {
  const [drill, setDrill] = useState<DrillScenario | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timer, setTimer] = useState(0);
  const [_running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(0);
    setRunning(true);
    intervalRef.current = window.setInterval(() => setTimer(t => t + 0.1), 100);
  };

  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const newDrill = useCallback(() => {
    setDrill(generateDrill());
    setFeedback(null);
    startTimer();
  }, []);

  const handleChoice = (choice: 'left' | 'right' | 'tie') => {
    if (!drill || feedback) return;
    stopTimer();
    const isCorrect = choice === drill.winner;
    setFeedback({
      correct: isCorrect,
      message: `Hand A: ${drill.result1.description}\nHand B: ${drill.result2.description}\n${drill.winner === 'tie' ? 'It\'s a split pot!' : `Hand ${drill.winner === 'left' ? 'A' : 'B'} wins!`}`,
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  if (!drill) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          Two hands will appear — quickly determine which one wins. Speed matters!
        </p>
        <button className="btn btn-primary btn-large" onClick={newDrill}>Start Drill</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {score.correct}/{score.total} correct
        </div>
        <div className="timer">{timer.toFixed(1)}s</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {/* Hand A */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="section-header">Hand A</div>
          <div className="panel" style={{ padding: 10 }}>
            <CardGroup cards={drill.hand1} size="small" delay={0} />
            {feedback && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                {drill.result1.description}
              </div>
            )}
          </div>
        </div>
        {/* VS */}
        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 700, color: 'var(--text-dim)', fontSize: 14 }}>
          VS
        </div>
        {/* Hand B */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="section-header">Hand B</div>
          <div className="panel" style={{ padding: 10 }}>
            <CardGroup cards={drill.hand2} size="small" delay={3} />
            {feedback && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                {drill.result2.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {!feedback ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleChoice('left')}>
            Hand A Wins
          </button>
          <button className="btn btn-ghost" style={{ flex: 0, minWidth: 60 }} onClick={() => handleChoice('tie')}>
            Tie
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleChoice('right')}>
            Hand B Wins
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Feedback correct={feedback.correct} message={feedback.message} />
          <button className="btn btn-primary btn-block" onClick={newDrill}>Next Round</button>
        </div>
      )}
    </div>
  );
}
