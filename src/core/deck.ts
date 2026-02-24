import { Card, Rank, Suit } from './types';

export const SUITS: Suit[] = ['♠', '♣', '♥', '♦'];
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const RANK_VALUES: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function parseCard(s: string): Card {
  const rank = s[0] as Rank;
  const suit = s[1] as Suit;
  return { rank, suit };
}

export function cardsEqual(a: Card, b: Card): boolean {
  return a.rank === b.rank && a.suit === b.suit;
}

export function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦';
}

export function rankDisplay(rank: Rank): string {
  if (rank === 'T') return '10';
  return rank;
}

export function dealCards(count: number, exclude: Card[] = []): Card[] {
  const deck = createDeck().filter(
    c => !exclude.some(e => cardsEqual(c, e))
  );
  const shuffled = shuffleDeck(deck);
  return shuffled.slice(0, count);
}

export function handNotation(cards: [Card, Card]): string {
  const [a, b] = cards;
  const av = RANK_VALUES[a.rank];
  const bv = RANK_VALUES[b.rank];
  const high = av >= bv ? a : b;
  const low = av >= bv ? b : a;
  const suited = high.suit === low.suit;
  if (high.rank === low.rank) return `${high.rank}${low.rank}`;
  return `${high.rank}${low.rank}${suited ? 's' : 'o'}`;
}
