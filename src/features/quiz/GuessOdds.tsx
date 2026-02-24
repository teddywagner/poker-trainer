import { useState, useCallback } from 'react';
import { Card } from '../../core/types';
import { dealCards } from '../../core/deck';
import { calculateOuts } from '../../core/evaluator';
import { getCommonDrawInfo } from '../../core/postflop';
import { CardView, CardGroup } from '../../components/CardView';
import { Feedback } from '../../components/Feedback';

interface OddsScenario {
  holeCards: [Card, Card];
  board: Card[];
  question: string;
  answer: number;
  explanation: string;
  street: 'flop' | 'turn';
}

const PREFLOP_MATCHUPS = [
  { name: 'Overpair vs Underpair (e.g., QQ vs 88)', answer: 80, explanation: 'An overpair wins ~80% against an underpair. The underpair needs to hit a set.' },
  { name: 'Pair vs Two Overcards (e.g., JJ vs AK)', answer: 55, explanation: 'A pair vs two overcards is close to a coin flip — the pair wins ~55%.' },
  { name: 'Dominated hand (e.g., AK vs AQ)', answer: 70, explanation: 'Domination — sharing one card with a better kicker gives ~70% equity.' },
  { name: 'Two overcards vs two undercards (e.g., AK vs 76)', answer: 63, explanation: 'Overcards vs undercards — the higher cards win ~63% preflop.' },
  { name: 'Pair vs one overcard (e.g., TT vs AJ)', answer: 70, explanation: 'One pair vs one overcard — the pair wins ~70%, needing to dodge one card.' },
  { name: 'Probability of being dealt AA', answer: 0.45, explanation: 'AA occurs once every 221 hands, or about 0.45% of the time.' },
  { name: 'Probability of being dealt any pocket pair', answer: 5.9, explanation: 'Any pocket pair (22-AA) is dealt about 5.9% of the time (13 pairs out of 1326 combos).' },
  { name: 'Probability of flopping a set with a pocket pair', answer: 11.8, explanation: 'You flop a set (or better) with a pocket pair ~11.8% of the time.' },
];

function generateDrawScenario(): OddsScenario {
  const allCards = dealCards(7);
  const holeCards: [Card, Card] = [allCards[0], allCards[1]];
  const isFlop = Math.random() > 0.4;
  const board = isFlop ? allCards.slice(2, 5) : allCards.slice(2, 6);
  const street = isFlop ? 'flop' as const : 'turn' as const;

  const outsInfo = calculateOuts(holeCards, board);
  const drawInfo = getCommonDrawInfo(outsInfo.outs);

  let answer: number;
  if (street === 'flop') {
    answer = Math.min(outsInfo.outs * 4, 100);
  } else {
    answer = Math.min(outsInfo.outs * 2, 100);
  }
  // Use more precise values if we have draw info
  if (drawInfo) {
    answer = street === 'flop' ? drawInfo.flopToRiver : drawInfo.turnToRiver;
  }

  const question = `What's your approximate equity on the ${street}?`;
  const explanation = outsInfo.outs > 0
    ? `You have ${outsInfo.outs} outs. Using the Rule of ${street === 'flop' ? '4' : '2'}: ${outsInfo.outs} × ${street === 'flop' ? '4' : '2'} ≈ ${answer.toFixed(1)}%.${outsInfo.draws.length > 0 ? ` Draws: ${outsInfo.draws.join(', ')}` : ''}`
    : `You have 0 outs — no draws to improve your hand.`;

  return { holeCards, board, question, answer: Math.round(answer * 10) / 10, explanation, street };
}

export function GuessOdds() {
  const [mode, setMode] = useState<'draw' | 'preflop'>('draw');
  const [scenario, setScenario] = useState<OddsScenario | null>(null);
  const [preflopIdx, setPreflopIdx] = useState(0);
  const [guess, setGuess] = useState(50);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newScenario = useCallback(() => {
    if (mode === 'draw') {
      setScenario(generateDrawScenario());
    } else {
      const idx = Math.floor(Math.random() * PREFLOP_MATCHUPS.length);
      setPreflopIdx(idx);
      setScenario(null);
    }
    setGuess(50);
    setFeedback(null);
  }, [mode]);

  const submit = () => {
    const answer = mode === 'draw' ? scenario!.answer : PREFLOP_MATCHUPS[preflopIdx].answer;
    const diff = Math.abs(guess - answer);
    const isClose = diff <= 8;
    const explanation = mode === 'draw' ? scenario!.explanation : PREFLOP_MATCHUPS[preflopIdx].explanation;

    setFeedback({
      correct: isClose,
      message: `The answer is ${answer}%. Your guess: ${guess}% (off by ${diff.toFixed(1)}%). ${explanation}`,
    });
    setScore(prev => ({
      correct: prev.correct + (isClose ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  return (
    <div>
      <div className="tabs">
        <button className={`tab ${mode === 'draw' ? 'active' : ''}`} onClick={() => { setMode('draw'); setScenario(null); setFeedback(null); }}>
          Draw Odds
        </button>
        <button className={`tab ${mode === 'preflop' ? 'active' : ''}`} onClick={() => { setMode('preflop'); setScenario(null); setFeedback(null); }}>
          Preflop Matchups
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 13, color: 'var(--text-dim)' }}>
        {score.correct}/{score.total} correct (within 8%)
      </div>

      {(mode === 'draw' && !scenario) || (mode === 'preflop' && !feedback && !PREFLOP_MATCHUPS[preflopIdx]) ? (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <button className="btn btn-primary btn-large" onClick={newScenario}>Start Quiz</button>
        </div>
      ) : mode === 'draw' && scenario ? (
        <div>
          <div className="table-area" style={{ marginBottom: 16, textAlign: 'center' }}>
            <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Hand</div>
            <div className="card-group" style={{ marginBottom: 12 }}>
              <CardView card={scenario.holeCards[0]} delay={0} />
              <CardView card={scenario.holeCards[1]} delay={1} />
            </div>
            <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Board ({scenario.street})</div>
            <CardGroup cards={scenario.board} delay={2} />
          </div>

          <div style={{ textAlign: 'center', marginBottom: 8, fontSize: 15, fontWeight: 600 }}>
            {scenario.question}
          </div>

          {!feedback ? (
            <div style={{ padding: '0 8px' }}>
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                {guess}%
              </div>
              <input
                type="range" min="0" max="100" step="1" value={guess}
                onChange={e => setGuess(Number(e.target.value))}
                className="odds-slider"
                style={{ marginBottom: 16 }}
              />
              <button className="btn btn-primary btn-block" onClick={submit}>Submit Guess</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feedback correct={feedback.correct} message={feedback.message} />
              <button className="btn btn-primary btn-block" onClick={newScenario}>Next Question</button>
            </div>
          )}
        </div>
      ) : mode === 'preflop' ? (
        <div>
          <div className="panel" style={{ marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              {PREFLOP_MATCHUPS[preflopIdx].name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              What % does the favorite win?
            </div>
          </div>

          {!feedback ? (
            <div style={{ padding: '0 8px' }}>
              <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
                {guess}%
              </div>
              <input
                type="range" min="0" max="100" step="1" value={guess}
                onChange={e => setGuess(Number(e.target.value))}
                className="odds-slider"
                style={{ marginBottom: 16 }}
              />
              <button className="btn btn-primary btn-block" onClick={submit}>Submit Guess</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feedback correct={feedback.correct} message={feedback.message} />
              <button className="btn btn-primary btn-block" onClick={newScenario}>Next Question</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <button className="btn btn-primary btn-large" onClick={newScenario}>Start Quiz</button>
        </div>
      )}
    </div>
  );
}
