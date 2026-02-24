import { useState, useCallback } from 'react';
import { Feedback } from '../../components/Feedback';

interface PotOddsScenario {
  pot: number;
  bet: number;
  outs: number;
  street: 'flop' | 'turn';
  correctPotOdds: number;
  correctEquity: number;
  isProfitable: boolean;
  explanation: string;
}

function generateScenario(): PotOddsScenario {
  const pot = Math.round((5 + Math.random() * 45) * 2) / 2;
  const betFraction = [0.33, 0.5, 0.67, 1.0, 1.5][Math.floor(Math.random() * 5)];
  const bet = Math.round(pot * betFraction * 2) / 2;
  const outs = [4, 6, 8, 9, 12, 15][Math.floor(Math.random() * 6)];
  const street = Math.random() > 0.5 ? 'flop' as const : 'turn' as const;

  const correctPotOdds = Math.round((bet / (pot + bet)) * 1000) / 10;
  const correctEquity = street === 'flop'
    ? Math.round(Math.min(outs * 4, 100) * 10) / 10
    : Math.round(Math.min(outs * 2, 100) * 10) / 10;

  const isProfitable = correctEquity > correctPotOdds;

  const explanation = `Pot odds: ${bet} / (${pot} + ${bet}) = ${correctPotOdds}%. ` +
    `Your equity with ${outs} outs on the ${street}: ${outs} × ${street === 'flop' ? '4' : '2'} = ${correctEquity}%. ` +
    (isProfitable
      ? `Since ${correctEquity}% > ${correctPotOdds}%, the call is profitable (+EV).`
      : `Since ${correctEquity}% < ${correctPotOdds}%, the call is unprofitable (-EV).`);

  return { pot, bet, outs, street, correctPotOdds, correctEquity, isProfitable, explanation };
}

export function PotOddsQuiz() {
  const [scenario, setScenario] = useState<PotOddsScenario | null>(null);
  const [step, setStep] = useState<'pot_odds' | 'profitable' | 'done'>('pot_odds');
  const [oddsGuess, setOddsGuess] = useState(25);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newScenario = useCallback(() => {
    setScenario(generateScenario());
    setStep('pot_odds');
    setOddsGuess(25);
    setFeedback(null);
  }, []);

  const submitOdds = () => {
    if (!scenario) return;
    const diff = Math.abs(oddsGuess - scenario.correctPotOdds);
    const isClose = diff <= 5;
    setFeedback({
      correct: isClose,
      message: `Pot odds = ${scenario.bet} / (${scenario.pot} + ${scenario.bet}) = ${scenario.correctPotOdds}%. Your guess: ${oddsGuess}%.`,
    });
    setScore(prev => ({
      correct: prev.correct + (isClose ? 1 : 0),
      total: prev.total + 1,
    }));
    setTimeout(() => {
      setStep('profitable');
      setFeedback(null);
    }, 2000);
  };

  const submitProfitable = (choice: boolean) => {
    if (!scenario) return;
    const isCorrect = choice === scenario.isProfitable;
    setFeedback({
      correct: isCorrect,
      message: scenario.explanation,
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setStep('done');
  };

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          Calculate pot odds and determine if a call is profitable.
        </p>
        <button className="btn btn-primary btn-large" onClick={newScenario}>Start</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 13, color: 'var(--text-dim)' }}>
        {score.correct}/{score.total} correct
      </div>

      {/* Scenario Display */}
      <div className="panel" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pot</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--gold)' }}>{scenario.pot}bb</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Bet</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)' }}>{scenario.bet}bb</div>
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          You have <strong style={{ color: 'var(--blue)' }}>{scenario.outs} outs</strong> on the <strong>{scenario.street}</strong>
        </div>
      </div>

      {step === 'pot_odds' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
            What are the pot odds?
          </div>
          {!feedback ? (
            <div style={{ padding: '0 8px' }}>
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                {oddsGuess}%
              </div>
              <input
                type="range" min="5" max="60" step="1" value={oddsGuess}
                onChange={e => setOddsGuess(Number(e.target.value))}
                className="odds-slider"
                style={{ marginBottom: 16 }}
              />
              <button className="btn btn-primary btn-block" onClick={submitOdds}>Submit</button>
            </div>
          ) : (
            <Feedback correct={feedback.correct} message={feedback.message} />
          )}
        </div>
      )}

      {step === 'profitable' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
            Is calling profitable?
          </div>
          <div style={{ fontSize: 13, textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 16 }}>
            Pot odds: {scenario.correctPotOdds}% | Your equity: ~{scenario.correctEquity}%
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={() => submitProfitable(true)}>
              Yes, +EV Call
            </button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => submitProfitable(false)}>
              No, -EV Fold
            </button>
          </div>
        </div>
      )}

      {step === 'done' && feedback && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Feedback correct={feedback.correct} message={feedback.message} />
          <button className="btn btn-primary btn-block" onClick={newScenario}>Next Question</button>
        </div>
      )}
    </div>
  );
}
