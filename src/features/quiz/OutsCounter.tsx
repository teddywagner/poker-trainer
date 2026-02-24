import { useState, useCallback, useMemo } from 'react';
import { Card, Rank, Suit } from '../../core/types';
import { dealCards, RANKS, SUITS, cardsEqual } from '../../core/deck';
import { calculateOuts } from '../../core/evaluator';
import { CardView, CardGroup } from '../../components/CardView';
import { Feedback } from '../../components/Feedback';

export function OutsCounter() {
  const [scenario, setScenario] = useState<{
    holeCards: [Card, Card];
    board: Card[];
    correctOuts: Card[];
  } | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const newScenario = useCallback(() => {
    // Keep generating until we get a scenario with at least some outs
    let attempts = 0;
    while (attempts < 20) {
      const cards = dealCards(6);
      const holeCards: [Card, Card] = [cards[0], cards[1]];
      const board = cards.slice(2, 5); // flop only for outs counting
      const outsInfo = calculateOuts(holeCards, board);
      if (outsInfo.outs >= 2 && outsInfo.outs <= 20) {
        setScenario({ holeCards, board, correctOuts: outsInfo.outCards });
        setSelectedCards(new Set());
        setSubmitted(false);
        return;
      }
      attempts++;
    }
    // Fallback
    const cards = dealCards(5);
    const holeCards: [Card, Card] = [cards[0], cards[1]];
    const board = cards.slice(2, 5);
    const outsInfo = calculateOuts(holeCards, board);
    setScenario({ holeCards, board, correctOuts: outsInfo.outCards });
    setSelectedCards(new Set());
    setSubmitted(false);
  }, []);

  const toggleCard = (card: Card) => {
    if (submitted) return;
    const key = `${card.rank}${card.suit}`;
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submit = () => {
    if (!scenario) return;
    setSubmitted(true);
    const correctKeys = new Set(scenario.correctOuts.map(c => `${c.rank}${c.suit}`));
    const selectedCount = selectedCards.size;
    const correctSelected = [...selectedCards].filter(k => correctKeys.has(k)).length;
    const isClose = Math.abs(selectedCount - scenario.correctOuts.length) <= 2 && correctSelected >= scenario.correctOuts.length * 0.6;
    setScore(prev => ({
      correct: prev.correct + (isClose ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  // Generate the remaining deck for selection
  const remainingDeck = useMemo(() => {
    if (!scenario) return [];
    const used = new Set([...scenario.holeCards, ...scenario.board].map(c => `${c.rank}${c.suit}`));
    const remaining: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        const key = `${rank}${suit}`;
        if (!used.has(key)) {
          remaining.push({ rank, suit });
        }
      }
    }
    return remaining;
  }, [scenario]);

  const correctOutKeys = useMemo(() => {
    if (!scenario) return new Set<string>();
    return new Set(scenario.correctOuts.map(c => `${c.rank}${c.suit}`));
  }, [scenario]);

  if (!scenario) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
          Identify all the cards that improve your hand. Tap each out card.
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

      <div className="table-area" style={{ marginBottom: 16, textAlign: 'center' }}>
        <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Your Hand</div>
        <div className="card-group" style={{ marginBottom: 12 }}>
          <CardView card={scenario.holeCards[0]} delay={0} />
          <CardView card={scenario.holeCards[1]} delay={1} />
        </div>
        <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)' }}>Flop</div>
        <CardGroup cards={scenario.board} delay={2} />
      </div>

      <div className="section-header">
        Tap your outs ({selectedCards.size} selected)
      </div>

      {/* Remaining cards grid by suit */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {SUITS.map(suit => (
          <div key={suit} style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            {remainingDeck.filter(c => c.suit === suit).map(card => {
              const key = `${card.rank}${card.suit}`;
              const isSelected = selectedCards.has(key);
              const isCorrectOut = submitted && correctOutKeys.has(key);
              const isWrongSelect = submitted && isSelected && !correctOutKeys.has(key);
              return (
                <CardView
                  key={key}
                  card={card}
                  size="small"
                  selected={!submitted && isSelected}
                  correct={submitted && isCorrectOut}
                  incorrect={isWrongSelect}
                  tappable={!submitted}
                  onClick={() => toggleCard(card)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button className="btn btn-primary btn-block" onClick={submit}>
          Submit ({selectedCards.size} outs)
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Feedback
            correct={Math.abs(selectedCards.size - scenario.correctOuts.length) <= 2}
            message={`There are ${scenario.correctOuts.length} outs. You identified ${[...selectedCards].filter(k => correctOutKeys.has(k)).length} correctly. Green = correct outs, Red = incorrect selections.`}
          />
          <button className="btn btn-primary btn-block" onClick={newScenario}>Next Hand</button>
        </div>
      )}
    </div>
  );
}
