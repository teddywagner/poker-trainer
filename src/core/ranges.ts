import { Card, Position, PreflopAction, PriorAction, StackDepth, TableSize } from './types';
import { RANK_VALUES } from './deck';

// GTO-approximate opening ranges by position (6-max, 100bb)
export const OPEN_RANGES: Record<string, Set<string>> = {
  UTG: new Set([
    // Pairs: 22+
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    // Suited: ATs+, KTs+, QTs+, JTs, T9s, 98s, 87s, 76s
    'ATs', 'AJs', 'AQs', 'AKs',
    'KTs', 'KJs', 'KQs',
    'QTs', 'QJs',
    'JTs',
    'T9s', '98s', '87s', '76s',
    // Offsuit: AJo+, KQo
    'AJo', 'AQo', 'AKo', 'KQo',
  ]),
  HJ: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'A2s', 'A3s', 'A4s', 'A5s', 'A6s', 'A7s', 'A8s', 'A9s', 'ATs', 'AJs', 'AQs', 'AKs',
    'K9s', 'KTs', 'KJs', 'KQs',
    'Q9s', 'QTs', 'QJs',
    'J9s', 'JTs',
    'T9s', '98s', '87s', '76s', '65s',
    'ATo', 'AJo', 'AQo', 'AKo', 'KJo', 'KQo', 'QJo',
  ]),
  CO: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'A2s', 'A3s', 'A4s', 'A5s', 'A6s', 'A7s', 'A8s', 'A9s', 'ATs', 'AJs', 'AQs', 'AKs',
    'K5s', 'K6s', 'K7s', 'K8s', 'K9s', 'KTs', 'KJs', 'KQs',
    'Q8s', 'Q9s', 'QTs', 'QJs',
    'J8s', 'J9s', 'JTs',
    'T8s', 'T9s',
    '97s', '98s',
    '86s', '87s',
    '75s', '76s',
    '64s', '65s',
    '54s',
    'A9o', 'ATo', 'AJo', 'AQo', 'AKo',
    'KTo', 'KJo', 'KQo',
    'QTo', 'QJo',
    'JTo',
  ]),
  BTN: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'A2s', 'A3s', 'A4s', 'A5s', 'A6s', 'A7s', 'A8s', 'A9s', 'ATs', 'AJs', 'AQs', 'AKs',
    'K2s', 'K3s', 'K4s', 'K5s', 'K6s', 'K7s', 'K8s', 'K9s', 'KTs', 'KJs', 'KQs',
    'Q4s', 'Q5s', 'Q6s', 'Q7s', 'Q8s', 'Q9s', 'QTs', 'QJs',
    'J6s', 'J7s', 'J8s', 'J9s', 'JTs',
    'T6s', 'T7s', 'T8s', 'T9s',
    '96s', '97s', '98s',
    '85s', '86s', '87s',
    '75s', '76s',
    '64s', '65s',
    '53s', '54s',
    'A2o', 'A3o', 'A4o', 'A5o', 'A6o', 'A7o', 'A8o', 'A9o', 'ATo', 'AJo', 'AQo', 'AKo',
    'K7o', 'K8o', 'K9o', 'KTo', 'KJo', 'KQo',
    'Q9o', 'QTo', 'QJo',
    'J9o', 'JTo',
    'T8o', 'T9o',
    '98o',
  ]),
  SB: new Set([
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'A2s', 'A3s', 'A4s', 'A5s', 'A6s', 'A7s', 'A8s', 'A9s', 'ATs', 'AJs', 'AQs', 'AKs',
    'K2s', 'K3s', 'K4s', 'K5s', 'K6s', 'K7s', 'K8s', 'K9s', 'KTs', 'KJs', 'KQs',
    'Q4s', 'Q5s', 'Q6s', 'Q7s', 'Q8s', 'Q9s', 'QTs', 'QJs',
    'J7s', 'J8s', 'J9s', 'JTs',
    'T7s', 'T8s', 'T9s',
    '97s', '98s',
    '86s', '87s',
    '75s', '76s',
    '65s',
    '54s',
    'A2o', 'A3o', 'A4o', 'A5o', 'A6o', 'A7o', 'A8o', 'A9o', 'ATo', 'AJo', 'AQo', 'AKo',
    'K5o', 'K6o', 'K7o', 'K8o', 'K9o', 'KTo', 'KJo', 'KQo',
    'Q8o', 'Q9o', 'QTo', 'QJo',
    'J9o', 'JTo',
    'T9o',
  ]),
  BB: new Set([]), // BB defends, doesn't open
};

// For 9-max, map positions
const POSITION_MAP_9MAX: Record<string, string> = {
  'UTG': 'UTG', 'UTG+1': 'UTG', 'MP': 'UTG', 'MP+1': 'HJ',
  'HJ': 'HJ', 'CO': 'CO', 'BTN': 'BTN', 'SB': 'SB', 'BB': 'BB',
};

// 3-bet ranges
export const ALWAYS_3BET = new Set(['AA', 'KK', 'QQ', 'AKs', 'AKo']);
export const VALUE_3BET = new Set(['JJ', 'TT', 'AQs', 'AQo', 'AJs', 'KQs']);
export const BLUFF_3BET_IP = new Set(['A5s', 'A4s', 'A3s', 'A2s', '76s', '65s', '54s']);
export const CALL_VS_RAISE_IP = new Set([
  '22', '33', '44', '55', '66', '77', '88', '99', 'TT',
  'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s',
]);

function normalizeHandNotation(cards: [Card, Card]): string {
  const [a, b] = cards;
  const av = RANK_VALUES[a.rank];
  const bv = RANK_VALUES[b.rank];
  const high = av >= bv ? a : b;
  const low = av >= bv ? b : a;
  const suited = high.suit === low.suit;
  if (high.rank === low.rank) return `${high.rank}${low.rank}`;
  return `${high.rank}${low.rank}${suited ? 's' : 'o'}`;
}

function isInPosition(yourPos: Position, raiserPos: Position): boolean {
  const order: Position[] = ['UTG', 'UTG+1', 'MP', 'MP+1', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
  return order.indexOf(yourPos) > order.indexOf(raiserPos);
}

export function getHandTier(notation: string): 'Premium' | 'Strong' | 'Playable' | 'Marginal' | 'Trash' {
  const premium = new Set(['AA', 'KK', 'QQ', 'AKs']);
  const strong = new Set(['JJ', 'TT', 'AQs', 'AKo', 'AQo', 'AJs', 'KQs']);
  const playable = new Set([
    '99', '88', '77', '66', '55', '44', '33', '22',
    'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s',
    'ATo', 'KJo', 'KQo', 'QJo', 'JTo',
  ]);
  const marginal = new Set([
    'K9s', 'K8s', 'K7s', 'K6s', 'K5s',
    'Q9s', 'Q8s', 'J9s', 'J8s', 'T8s', '97s', '86s', '75s', '64s', '53s',
    'A9o', 'A8o', 'KTo', 'QTo', 'T9o', '98o',
  ]);

  if (premium.has(notation)) return 'Premium';
  if (strong.has(notation)) return 'Strong';
  if (playable.has(notation)) return 'Playable';
  if (marginal.has(notation)) return 'Marginal';
  return 'Trash';
}

export function getRecommendedAction(
  cards: [Card, Card],
  position: Position,
  priorAction: PriorAction,
  stackDepth: StackDepth,
  tableSize: TableSize,
): { action: PreflopAction; explanation: string } {
  const notation = normalizeHandNotation(cards);
  const tier = getHandTier(notation);

  // Map position for range lookup
  const lookupPos = tableSize === '9max'
    ? (POSITION_MAP_9MAX[position] || position)
    : position;

  // Short stack adjustments (20bb)
  if (stackDepth === 20) {
    if (ALWAYS_3BET.has(notation) || VALUE_3BET.has(notation)) {
      return { action: 'allin', explanation: `${notation} is a premium hand at ${stackDepth}bb — push all-in.` };
    }
    const shortStackPush = new Set([
      ...Array.from(ALWAYS_3BET), ...Array.from(VALUE_3BET),
      '99', '88', '77', '66', 'ATs', 'ATo', 'KQs', 'KQo', 'KJs',
    ]);
    if (shortStackPush.has(notation) && (priorAction === 'folded_to_you' || priorAction === 'one_limper')) {
      return { action: 'allin', explanation: `${notation} is strong enough to shove at ${stackDepth}bb from ${position}.` };
    }
    if (priorAction === 'folded_to_you' && OPEN_RANGES[lookupPos]?.has(notation)) {
      return { action: 'raise', explanation: `${notation} is in the open-raise range from ${position}, but at ${stackDepth}bb consider an all-in or min-raise.` };
    }
  }

  // Facing a raise (3-bet or fold spots)
  if (priorAction === 'raise_25x' || priorAction === 'raise_3x') {
    if (ALWAYS_3BET.has(notation)) {
      return { action: '3bet', explanation: `${notation} is a premium hand — always 3-bet for value.` };
    }
    if (VALUE_3BET.has(notation)) {
      const inPos = isInPosition(position, 'UTG'); // simplified
      return {
        action: '3bet',
        explanation: `${notation} is strong enough to 3-bet for value${inPos ? ' especially in position' : ''}.`
      };
    }
    if (BLUFF_3BET_IP.has(notation) && ['CO', 'BTN', 'SB'].includes(position)) {
      return { action: '3bet', explanation: `${notation} makes a good 3-bet bluff from ${position} — suited wheel aces/connectors have good playability.` };
    }
    if (CALL_VS_RAISE_IP.has(notation) && ['CO', 'BTN'].includes(position)) {
      return { action: 'call', explanation: `${notation} plays well as a call in position — good implied odds with a speculative hand.` };
    }
    return { action: 'fold', explanation: `${notation} is not strong enough to continue against a raise from ${position}. It's ${tier === 'Trash' ? 'too weak' : 'too marginal'} to call or 3-bet here.` };
  }

  // Facing a 3-bet
  if (priorAction === '3bet') {
    if (ALWAYS_3BET.has(notation)) {
      return { action: 'allin', explanation: `${notation} is strong enough to 4-bet/all-in against a 3-bet.` };
    }
    if (VALUE_3BET.has(notation)) {
      return { action: 'call', explanation: `${notation} is strong enough to call a 3-bet, but not quite strong enough to 4-bet.` };
    }
    return { action: 'fold', explanation: `${notation} doesn't have enough equity to continue against a 3-bet.` };
  }

  // Folded to you or one limper — open raise range
  if (priorAction === 'folded_to_you') {
    if (position === 'BB') {
      return { action: 'call', explanation: `You're in the BB with ${notation} — you already have a big blind posted, so you get to see a free flop.` };
    }
    const range = OPEN_RANGES[lookupPos];
    if (range && range.has(notation)) {
      return { action: 'raise', explanation: `${notation} is in the open-raise range from ${position}. ${getPositionReason(position, notation, tier)}` };
    }
    return { action: 'fold', explanation: `${notation} is outside the opening range from ${position}. ${tier === 'Marginal' ? 'It\'s a marginal hand that doesn\'t play well from this position.' : 'This hand is too weak to open from this position.'}` };
  }

  // One limper
  if (priorAction === 'one_limper') {
    if (tier === 'Premium' || tier === 'Strong') {
      return { action: 'raise', explanation: `${notation} should be raised for value over a limper — isolate with a strong hand.` };
    }
    const range = OPEN_RANGES[lookupPos];
    if (range && range.has(notation)) {
      return { action: 'raise', explanation: `${notation} is strong enough to raise over a limper from ${position} to isolate.` };
    }
    if (tier === 'Playable' && ['BTN', 'CO', 'SB'].includes(position)) {
      return { action: 'call', explanation: `${notation} can limp behind in position for implied odds against a limper.` };
    }
    return { action: 'fold', explanation: `${notation} is not strong enough to raise or limp over a limper from ${position}.` };
  }

  return { action: 'fold', explanation: `${notation} should be folded in this situation.` };
}

function getPositionReason(position: Position, _notation: string, _tier: string): string {
  switch (position) {
    case 'UTG':
    case 'UTG+1':
      return 'Early position requires a tighter range since many players act after you.';
    case 'MP':
    case 'MP+1':
    case 'HJ':
      return 'Middle position allows a slightly wider range than early position.';
    case 'CO':
      return 'The cutoff allows a wider opening range as only the BTN, SB, and BB remain.';
    case 'BTN':
      return 'The button is the most profitable position — open wide and use your positional advantage postflop.';
    case 'SB':
      return 'The small blind should raise or fold — limping is generally unprofitable due to positional disadvantage.';
    default:
      return '';
  }
}

export function generatePriorAction(position: Position): PriorAction {
  // Realistic prior action distribution
  if (position === 'UTG' || position === 'UTG+1') {
    return 'folded_to_you'; // Early position is almost always folded to
  }
  const rand = Math.random();
  if (position === 'SB' || position === 'BB') {
    if (rand < 0.4) return 'folded_to_you';
    if (rand < 0.6) return 'one_limper';
    if (rand < 0.85) return 'raise_25x';
    return 'raise_3x';
  }
  if (rand < 0.55) return 'folded_to_you';
  if (rand < 0.7) return 'one_limper';
  if (rand < 0.9) return 'raise_25x';
  return 'raise_3x';
}

export function priorActionDisplay(action: PriorAction): string {
  switch (action) {
    case 'folded_to_you': return 'Folded to you';
    case 'one_limper': return '1 limper';
    case 'raise_25x': return 'Raise to 2.5x';
    case 'raise_3x': return 'Raise to 3x';
    case '3bet': return '3-bet to ~9x';
  }
}
