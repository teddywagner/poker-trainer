import { Card, Position, PreflopAction, PriorAction, StackDepth, TableSize, PlayStyle } from './types';
import { RANK_VALUES } from './deck';
import { getOpenRange, getFacingRaiseAction, getFacing3BetAction, getStyleLabel } from './rangeData';

// For 9-max, map positions to 6-max equivalents
const POSITION_MAP_9MAX: Record<string, string> = {
  'UTG': 'UTG', 'UTG+1': 'UTG', 'MP': 'UTG', 'MP+1': 'HJ',
  'HJ': 'HJ', 'CO': 'CO', 'BTN': 'BTN', 'SB': 'SB', 'BB': 'BB',
};

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
  style: PlayStyle = 'GTO',
  raiserPosition?: Position,
): { action: PreflopAction; explanation: string } {
  const notation = normalizeHandNotation(cards);
  const tier = getHandTier(notation);
  const styleDesc = getStyleLabel(style);

  // Map position for range lookup
  const lookupPos = tableSize === '9max'
    ? (POSITION_MAP_9MAX[position] || position)
    : position;

  const raiserLookup = raiserPosition
    ? (tableSize === '9max' ? (POSITION_MAP_9MAX[raiserPosition] || raiserPosition) : raiserPosition)
    : undefined;

  // Short stack adjustments (20bb)
  if (stackDepth === 20) {
    const premiums = new Set(['AA', 'KK', 'QQ', 'AKs', 'AKo', 'JJ', 'TT', 'AQs', 'AQo', 'AJs', 'KQs']);
    if (premiums.has(notation)) {
      return { action: 'allin', explanation: `${notation} is a premium hand at ${stackDepth}bb \u2014 push all-in. (${styleDesc})` };
    }
    const shortStackPush = new Set([
      ...Array.from(premiums),
      '99', '88', '77', '66', 'ATs', 'ATo', 'KQo', 'KJs',
    ]);
    if (shortStackPush.has(notation) && (priorAction === 'folded_to_you' || priorAction === 'one_limper')) {
      return { action: 'allin', explanation: `${notation} is strong enough to shove at ${stackDepth}bb from ${position}. (${styleDesc})` };
    }
    const range = getOpenRange(lookupPos, style);
    if (priorAction === 'folded_to_you' && range.has(notation)) {
      return { action: 'raise', explanation: `${notation} is in the ${styleDesc} open-raise range from ${position}, but at ${stackDepth}bb consider an all-in or min-raise.` };
    }
  }

  // Facing a raise (3-bet or fold spots)
  if (priorAction === 'raise_25x' || priorAction === 'raise_3x') {
    const raiserPos = raiserLookup || guessRaiserPosition(lookupPos);
    const action = getFacingRaiseAction(notation, lookupPos, raiserPos, style);
    const inPos = isInPosition(position, raiserPosition || (raiserPos as Position));

    if (action === '3bet') {
      return {
        action: '3bet',
        explanation: `In the ${styleDesc} style, ${notation} is a 3-bet vs ${raiserPosition || raiserPos} open${inPos ? ' (in position)' : ''}. ${get3BetReason(notation, style)}`
      };
    }
    if (action === 'call') {
      return {
        action: 'call',
        explanation: `In the ${styleDesc} style, ${notation} is a call vs ${raiserPosition || raiserPos} open from ${position}${inPos ? ' \u2014 good implied odds in position' : ''}.`
      };
    }
    return {
      action: 'fold',
      explanation: `In the ${styleDesc} style, ${notation} is not strong enough to continue vs a ${raiserPosition || raiserPos} open from ${position}. ${tier === 'Trash' ? 'Too weak' : 'Too marginal'} to call or 3-bet.`
    };
  }

  // Facing a 3-bet (you opened, someone 3-bet)
  if (priorAction === '3bet') {
    const action = getFacing3BetAction(notation, lookupPos, style);
    if (action === '4bet') {
      return { action: 'allin', explanation: `In the ${styleDesc} style, ${notation} is strong enough to 4-bet/all-in against a 3-bet.` };
    }
    if (action === 'call') {
      return { action: 'call', explanation: `In the ${styleDesc} style, ${notation} is strong enough to call a 3-bet, but not quite strong enough to 4-bet.` };
    }
    return { action: 'fold', explanation: `In the ${styleDesc} style, ${notation} doesn't have enough equity to continue against a 3-bet.` };
  }

  // Folded to you — open raise range
  if (priorAction === 'folded_to_you') {
    if (position === 'BB') {
      return { action: 'call', explanation: `You're in the BB with ${notation} \u2014 you already have a big blind posted, so you get to see a free flop.` };
    }
    const range = getOpenRange(lookupPos, style);
    if (range.has(notation)) {
      return { action: 'raise', explanation: `In the ${styleDesc} style, ${notation} is in the open-raise range from ${position}. ${getPositionReason(position)}` };
    }
    return { action: 'fold', explanation: `In the ${styleDesc} style, ${notation} is outside the opening range from ${position}. ${tier === 'Marginal' ? "It's a marginal hand that doesn't play well from this position." : 'This hand is too weak to open from this position.'}` };
  }

  // One limper
  if (priorAction === 'one_limper') {
    if (tier === 'Premium' || tier === 'Strong') {
      return { action: 'raise', explanation: `${notation} should be raised for value over a limper \u2014 isolate with a strong hand. (${styleDesc})` };
    }
    const range = getOpenRange(lookupPos, style);
    if (range.has(notation)) {
      return { action: 'raise', explanation: `In the ${styleDesc} style, ${notation} is strong enough to raise over a limper from ${position} to isolate.` };
    }
    if (tier === 'Playable' && ['BTN', 'CO', 'SB'].includes(position)) {
      return { action: 'call', explanation: `${notation} can limp behind in position for implied odds against a limper. (${styleDesc})` };
    }
    return { action: 'fold', explanation: `In the ${styleDesc} style, ${notation} is not strong enough to raise or limp over a limper from ${position}.` };
  }

  return { action: 'fold', explanation: `${notation} should be folded in this situation. (${styleDesc})` };
}

function get3BetReason(notation: string, style: PlayStyle): string {
  const premiums = new Set(['AA', 'KK', 'QQ', 'AKs', 'AKo']);
  if (premiums.has(notation)) return 'Premium hand \u2014 always 3-bet for value.';

  const value = new Set(['JJ', 'TT', 'AQs', 'AQo', 'AJs', 'KQs']);
  if (value.has(notation)) return 'Strong hand \u2014 3-bet for value.';

  if (notation.startsWith('A') && notation.endsWith('s')) {
    return 'Suited ace blocker \u2014 good 3-bet bluff candidate with backdoor equity.';
  }

  if (style === 'LAG') return 'Aggressive 3-bet bluff in the LAG style.';
  return 'Balanced 3-bet bluff to avoid being exploitably tight.';
}

function guessRaiserPosition(yourPosition: string): string {
  const earlier: Record<string, string> = {
    'HJ': 'UTG', 'CO': 'HJ', 'BTN': 'CO', 'SB': 'BTN', 'BB': 'CO',
  };
  return earlier[yourPosition] || 'UTG';
}

function getPositionReason(position: Position): string {
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
      return 'The button is the most profitable position \u2014 open wide and use your positional advantage postflop.';
    case 'SB':
      return 'The small blind should raise or fold \u2014 limping is generally unprofitable due to positional disadvantage.';
    default:
      return '';
  }
}

// Full position order for determining who could have raised
const OPEN_POSITION_ORDER: string[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];

export interface GeneratedAction {
  priorAction: PriorAction;
  raiserPosition?: Position;
}

export function generatePriorAction(position: Position): GeneratedAction {
  // Early position is almost always folded to
  if (position === 'UTG' || position === 'UTG+1') {
    return { priorAction: 'folded_to_you' };
  }

  const rand = Math.random();
  let priorAction: PriorAction;

  if (position === 'SB' || position === 'BB') {
    if (rand < 0.35) priorAction = 'folded_to_you';
    else if (rand < 0.50) priorAction = 'one_limper';
    else if (rand < 0.80) priorAction = 'raise_25x';
    else if (rand < 0.95) priorAction = 'raise_3x';
    else priorAction = '3bet';
  } else {
    if (rand < 0.50) priorAction = 'folded_to_you';
    else if (rand < 0.65) priorAction = 'one_limper';
    else if (rand < 0.85) priorAction = 'raise_25x';
    else if (rand < 0.95) priorAction = 'raise_3x';
    else priorAction = '3bet';
  }

  // Assign raiser position for raise/3bet actions
  if (priorAction === 'raise_25x' || priorAction === 'raise_3x' || priorAction === '3bet') {
    let possibleRaisers: string[];

    if (position === 'BB') {
      possibleRaisers = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
    } else {
      const posIdx = OPEN_POSITION_ORDER.indexOf(position);
      if (posIdx <= 0) return { priorAction: 'folded_to_you' }; // fallback
      possibleRaisers = OPEN_POSITION_ORDER.slice(0, posIdx);
    }

    const raiserPosition = possibleRaisers[Math.floor(Math.random() * possibleRaisers.length)] as Position;
    return { priorAction, raiserPosition };
  }

  return { priorAction };
}

export function priorActionDisplay(action: PriorAction, raiserPosition?: string): string {
  switch (action) {
    case 'folded_to_you': return 'Folded to you';
    case 'one_limper': return '1 limper';
    case 'raise_25x': return raiserPosition ? `${raiserPosition} raises to 2.5x` : 'Raise to 2.5x';
    case 'raise_3x': return raiserPosition ? `${raiserPosition} raises to 3x` : 'Raise to 3x';
    case '3bet': return raiserPosition ? `3-bet to ~9x (by ${raiserPosition})` : '3-bet to ~9x';
  }
}
