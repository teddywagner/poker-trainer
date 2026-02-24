import { Card } from '../core/types';
import { isRed, rankDisplay } from '../core/deck';

interface CardViewProps {
  card: Card;
  size?: 'small' | 'normal' | 'large';
  faceDown?: boolean;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  tappable?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function CardView({ card, size = 'normal', faceDown, selected, correct, incorrect, tappable, onClick, delay = 0 }: CardViewProps) {
  const red = isRed(card.suit);
  const classes = [
    'playing-card',
    size,
    red ? 'red' : 'black',
    faceDown && 'face-down',
    selected && 'selected',
    correct && 'correct',
    incorrect && 'incorrect',
    tappable && 'tappable',
    'deal-card',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      {!faceDown && (
        <>
          <span className="card-rank">{rankDisplay(card.rank)}</span>
          <span className="card-suit">{card.suit}</span>
        </>
      )}
    </div>
  );
}

export function CardGroup({ cards, size, delay = 0, ...rest }: {
  cards: Card[];
  size?: 'small' | 'normal' | 'large';
  delay?: number;
  selected?: Set<string>;
  correct?: Set<string>;
  incorrect?: Set<string>;
  onCardClick?: (card: Card) => void;
}) {
  return (
    <div className="card-group">
      {cards.map((card, i) => {
        const key = `${card.rank}${card.suit}`;
        return (
          <CardView
            key={key}
            card={card}
            size={size}
            delay={delay + i}
            selected={rest.selected?.has(key)}
            correct={rest.correct?.has(key)}
            incorrect={rest.incorrect?.has(key)}
            tappable={!!rest.onCardClick}
            onClick={() => rest.onCardClick?.(card)}
          />
        );
      })}
    </div>
  );
}
