import { useState, useCallback } from 'react';
import { Card, PostflopAction, Street } from '../../core/types';
import { dealCards, handNotation } from '../../core/deck';
import { evaluateBest5, calculateOuts } from '../../core/evaluator';
import { classifyBoardTexture, calculatePotOdds, calculateDrawEquity, actionDisplay } from '../../core/postflop';
import { CardView, CardGroup } from '../../components/CardView';

interface ReviewStreet {
  name: string;
  board: Card[];
  handResult: string;
  outs: number;
  equity: number;
  potSize: number;
  action: PostflopAction | null;
  analysis: string;
}

interface ReviewHand {
  holeCards: [Card, Card];
  streets: ReviewStreet[];
}

function generateReviewHand(): ReviewHand {
  const cards = dealCards(9);
  const holeCards: [Card, Card] = [cards[0], cards[1]];
  const allBoard = [cards[2], cards[3], cards[4], cards[5], cards[6]];

  const streets: ReviewStreet[] = [];
  let potSize = 7;

  const streetConfigs: { name: string; boardCount: number; streetType: Street }[] = [
    { name: 'Flop', boardCount: 3, streetType: 'flop' },
    { name: 'Turn', boardCount: 4, streetType: 'turn' },
    { name: 'River', boardCount: 5, streetType: 'river' },
  ];

  for (const config of streetConfigs) {
    const board = allBoard.slice(0, config.boardCount);
    const hand = evaluateBest5([...holeCards, ...board]);
    const outsInfo = calculateOuts(holeCards, board);
    const texture = classifyBoardTexture(board);
    const equity = calculateDrawEquity(outsInfo.outs, config.streetType);

    let analysis = '';
    let action: PostflopAction | null = null;

    if (hand.rankValue >= 3) {
      action = 'bet_twothirds';
      analysis = `Strong hand (${hand.description}). Bet for value — you want to build the pot.`;
    } else if (hand.rankValue >= 1) {
      if (outsInfo.outs >= 8) {
        action = 'bet_half';
        analysis = `${hand.description} with ${outsInfo.outs} outs. Semi-bluff opportunity — you have equity to improve.`;
      } else {
        action = 'check';
        analysis = `${hand.description} is a medium-strength hand. Check to control the pot and get to showdown.`;
      }
    } else if (outsInfo.outs >= 9) {
      action = 'bet_half';
      analysis = `Missed but ${outsInfo.outs} outs (${(equity * 100).toFixed(0)}% equity). Good semi-bluff spot.`;
    } else if (outsInfo.outs >= 4) {
      action = 'check';
      analysis = `${hand.description} with ${outsInfo.outs} outs. Not enough equity to bet, but worth seeing another card.`;
    } else {
      action = config.streetType === 'river' ? 'check' : 'check';
      analysis = `${hand.description} with minimal outs. Check and look to fold to aggression.`;
    }

    streets.push({
      name: config.name,
      board,
      handResult: hand.description,
      outs: outsInfo.outs,
      equity: equity * 100,
      potSize,
      action,
      analysis,
    });

    // Simulate pot growth
    if (action && action.includes('bet')) {
      potSize = Math.round(potSize * 2 * 10) / 10;
    }
  }

  return { holeCards, streets };
}

export function HandReview() {
  const [hand, setHand] = useState<ReviewHand | null>(null);
  const [visibleStreet, setVisibleStreet] = useState(0);
  const [userNotes, setUserNotes] = useState<string[]>([]);
  const [showAnalysis, setShowAnalysis] = useState<boolean[]>([false, false, false]);

  const newHand = useCallback(() => {
    setHand(generateReviewHand());
    setVisibleStreet(0);
    setUserNotes([]);
    setShowAnalysis([false, false, false]);
  }, []);

  const revealAnalysis = (idx: number) => {
    setShowAnalysis(prev => {
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const nextStreet = () => {
    if (hand && visibleStreet < hand.streets.length - 1) {
      setVisibleStreet(v => v + 1);
    }
  };

  if (!hand) {
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Hand Review</h2>
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
            Step through a complete hand street-by-street with analysis.
            Think about what you'd do at each decision point before revealing the optimal play.
          </p>
          <button className="btn btn-primary btn-large" onClick={newHand}>
            Generate Hand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Hand Review</h2>
        <button className="btn btn-ghost btn-small" onClick={newHand}>New Hand</button>
      </div>

      {/* Hole Cards */}
      <div className="table-area" style={{ marginBottom: 16 }}>
        <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Hand</div>
        <div className="card-group" style={{ marginBottom: 8 }}>
          <CardView card={hand.holeCards[0]} size="large" delay={0} />
          <CardView card={hand.holeCards[1]} size="large" delay={1} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {handNotation(hand.holeCards)}
        </div>
      </div>

      {/* Streets */}
      {hand.streets.slice(0, visibleStreet + 1).map((street, idx) => (
        <div key={idx} className="panel slide-up" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>{street.name}</h3>
            <span className="pot-chips" style={{ fontSize: 12, padding: '3px 10px' }}>
              Pot: {street.potSize.toFixed(1)}bb
            </span>
          </div>

          {/* Board Cards */}
          <CardGroup cards={street.board} size="small" delay={0} />

          {/* Hand Info */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-secondary)' }}>{street.handResult}</span>
            {street.outs > 0 && (
              <span style={{ color: 'var(--blue)' }}>{street.outs} outs ({street.equity.toFixed(0)}%)</span>
            )}
          </div>

          {/* Ask user what they'd do */}
          {!showAnalysis[idx] ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--gold)' }}>
                What would you do here?
              </div>
              <button className="btn btn-primary btn-block btn-small" onClick={() => revealAnalysis(idx)}>
                Reveal Optimal Play
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 12, padding: 12, background: 'rgba(212,165,67,0.1)', borderRadius: 8, border: '1px solid rgba(212,165,67,0.2)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
                Optimal: {street.action ? actionDisplay(street.action) : 'Check'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {street.analysis}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Next Street Button */}
      {visibleStreet < hand.streets.length - 1 && showAnalysis[visibleStreet] && (
        <button className="btn btn-primary btn-block" style={{ marginTop: 8 }} onClick={nextStreet}>
          Deal {hand.streets[visibleStreet + 1].name}
        </button>
      )}

      {visibleStreet === hand.streets.length - 1 && showAnalysis[visibleStreet] && (
        <div className="panel" style={{ marginTop: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gold)', marginBottom: 8 }}>
            Hand Complete
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Review the decisions above. Did you agree with the optimal plays?
          </p>
          <button className="btn btn-primary btn-block" onClick={newHand}>
            Review Another Hand
          </button>
        </div>
      )}
    </div>
  );
}
