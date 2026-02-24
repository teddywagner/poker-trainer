import { useState, useCallback } from 'react';
import { Card } from '../../core/types';
import { dealCards } from '../../core/deck';
import { CardGroup } from '../../components/CardView';
import { classifyBoardTexture } from '../../core/postflop';
import { Feedback } from '../../components/Feedback';

interface RangeScenario {
  board: Card[];
  position1: string;
  position2: string;
  advantageHolder: 'position1' | 'position2';
  explanation: string;
}

const SCENARIOS = [
  {
    position1: 'BTN (Open Raiser)',
    position2: 'BB (Caller)',
    getAdvantage: (board: Card[]) => {
      const texture = classifyBoardTexture(board);
      const highCards = board.filter(c => ['A', 'K', 'Q'].includes(c.rank)).length;
      const lowCards = board.filter(c => ['2', '3', '4', '5', '6', '7'].includes(c.rank)).length;
      // High card boards favor the raiser
      if (highCards >= 2) return {
        holder: 'position1' as const,
        explanation: `High card boards (with ${highCards} broadway cards) favor the BTN open-raiser. The raiser's range contains more premium hands (AK, AQ, KQ) that connect with high boards, while the BB defending range is wider with more low/medium cards.`
      };
      if (lowCards >= 2 && texture !== 'dry') return {
        holder: 'position2' as const,
        explanation: `Low, connected boards favor the BB caller. The BB's wider defending range includes more low suited connectors and small pairs that connect well with this board. The raiser's range is more top-heavy.`
      };
      return {
        holder: 'position1' as const,
        explanation: `On a ${texture} board, the preflop raiser generally maintains a range advantage due to more overpairs and strong broadway combinations.`
      };
    },
  },
  {
    position1: 'CO (3-Bettor)',
    position2: 'BTN (Caller)',
    getAdvantage: (board: Card[]) => {
      const hasAce = board.some(c => c.rank === 'A');
      const highCards = board.filter(c => ['A', 'K', 'Q'].includes(c.rank)).length;
      if (hasAce) return {
        holder: 'position1' as const,
        explanation: `Ace-high boards heavily favor the 3-bettor's range. The 3-bet range is concentrated with hands like AA, AK, AQ that all connect with this flop, while the BTN's calling range has fewer aces.`
      };
      if (highCards === 0) return {
        holder: 'position2' as const,
        explanation: `Low boards can favor the BTN caller who has more small-medium pocket pairs and suited connectors in their flatting range, while the 3-bettor's range is top-heavy with overcards.`
      };
      return {
        holder: 'position1' as const,
        explanation: `The 3-bettor maintains a range advantage with more overpairs and strong broadways.`
      };
    },
  },
  {
    position1: 'UTG (Open Raiser)',
    position2: 'BTN (Caller)',
    getAdvantage: (board: Card[]) => {
      const texture = classifyBoardTexture(board);
      const midCards = board.filter(c => ['7', '8', '9', 'T', 'J'].includes(c.rank)).length;
      if (midCards >= 2 && texture === 'wet') return {
        holder: 'position2' as const,
        explanation: `Middle-connected, wet boards favor the BTN caller. The BTN's wider range includes suited connectors (T9s, 98s, 87s) that smash this board, while UTG's tight range is mostly big pairs and broadways that may not connect well.`
      };
      return {
        holder: 'position1' as const,
        explanation: `UTG's very tight opening range means they have a high concentration of premium overpairs (AA-TT) and strong broadways. Even on a ${texture} board, UTG's range is strong.`
      };
    },
  },
];

function generateRangeScenario(): RangeScenario {
  const template = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const board = dealCards(3);
  const { holder, explanation } = template.getAdvantage(board);
  return {
    board,
    position1: template.position1,
    position2: template.position2,
    advantageHolder: holder,
    explanation,
  };
}

export function RangeVsRange() {
  const [scenario, setScenario] = useState<RangeScenario | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newScenario = useCallback(() => {
    setScenario(generateRangeScenario());
    setFeedback(null);
  }, []);

  const handleChoice = (choice: 'position1' | 'position2') => {
    if (!scenario || feedback) return;
    const isCorrect = choice === scenario.advantageHolder;
    setFeedback({
      correct: isCorrect,
      message: scenario.explanation,
    });
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          Determine which position has the range advantage on the flop.
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

      {/* Board */}
      <div className="table-area" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Flop</div>
        <CardGroup cards={scenario.board} delay={0} />
        <div style={{ marginTop: 8 }}>
          <span className={`texture-tag texture-${classifyBoardTexture(scenario.board)}`}>
            {classifyBoardTexture(scenario.board)}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 15, fontWeight: 600 }}>
        Who has the range advantage?
      </div>

      {!feedback ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-secondary btn-block" onClick={() => handleChoice('position1')}>
            {scenario.position1}
          </button>
          <button className="btn btn-secondary btn-block" onClick={() => handleChoice('position2')}>
            {scenario.position2}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Feedback correct={feedback.correct} message={feedback.message} />
          <button className="btn btn-primary btn-block" onClick={newScenario}>Next Question</button>
        </div>
      )}
    </div>
  );
}
