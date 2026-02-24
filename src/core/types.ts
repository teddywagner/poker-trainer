export type Suit = '♠' | '♣' | '♥' | '♦';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HandRanking =
  | 'Royal Flush'
  | 'Straight Flush'
  | 'Four of a Kind'
  | 'Full House'
  | 'Flush'
  | 'Straight'
  | 'Three of a Kind'
  | 'Two Pair'
  | 'One Pair'
  | 'High Card';

export interface HandResult {
  ranking: HandRanking;
  rankValue: number; // 9=Royal Flush ... 0=High Card
  cards: Card[]; // best 5 cards
  kickers: number[];
  description: string;
}

export type Position = 'UTG' | 'UTG+1' | 'MP' | 'MP+1' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Position6Max = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';

export type PreflopAction = 'fold' | 'call' | 'raise' | '3bet' | 'allin';
export type PostflopAction = 'check' | 'fold' | 'bet_third' | 'bet_half' | 'bet_twothirds' | 'bet_pot' | 'bet_overbet' | 'call' | 'raise';

export type StackDepth = 20 | 50 | 100;
export type TableSize = '6max' | '9max';

export type PriorAction =
  | 'folded_to_you'
  | 'one_limper'
  | 'raise_25x'
  | 'raise_3x'
  | '3bet';

export interface PreflopScenario {
  holeCards: [Card, Card];
  position: Position;
  priorAction: PriorAction;
  stackDepth: StackDepth;
  tableSize: TableSize;
  recommendedAction: PreflopAction;
  explanation: string;
  handTier: 'Premium' | 'Strong' | 'Playable' | 'Marginal' | 'Trash';
}

export type ScenarioType = 'cbet' | 'drawing' | 'value_betting' | 'bluffing' | 'tough_fold';
export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type BoardTexture = 'dry' | 'semi-wet' | 'wet';

export interface PostflopScenario {
  type: ScenarioType;
  holeCards: [Card, Card];
  position: Position;
  board: Card[];
  potSize: number;
  street: Street;
  facingBet: number;
  recommendedAction: PostflopAction;
  explanation: string;
  boardTexture: BoardTexture;
  outs: number;
  equity: number;
  potOdds: number;
}

export interface SessionStats {
  date: string;
  mode: 'preflop' | 'postflop' | 'quiz';
  total: number;
  correct: number;
  details: Record<string, { total: number; correct: number }>;
}

export interface PlayerStats {
  sessions: SessionStats[];
  currentStreak: number;
  bestStreak: number;
  preflopByPosition: Record<string, { total: number; correct: number }>;
  postflopByType: Record<string, { total: number; correct: number }>;
  quizByType: Record<string, { total: number; correct: number }>;
}

export type QuizType = 'guess_odds' | 'outs_counter' | 'hand_ranking' | 'pot_odds' | 'range_vs_range';
