// ============================================================
// Solver-Derived Range Data (6-max, 100bb NL Cash)
// Sources: GTO Wizard / PioSolver published outputs
// Hands ordered strongest → weakest for style trimming
// ============================================================

import { PlayStyle } from './types';

// ---------- Helper Functions ----------

function combosForHand(notation: string): number {
  if (notation.length === 2) return 6;          // pair: AA = 6 combos
  if (notation.endsWith('s')) return 4;          // suited: AKs = 4 combos
  return 12;                                      // offsuit: AKo = 12 combos
}

function countCombos(hands: string[]): number {
  return hands.reduce((sum, h) => sum + combosForHand(h), 0);
}

function trimToComboTarget(hands: string[], targetCombos: number): string[] {
  const result: string[] = [];
  let total = 0;
  for (const h of hands) {
    const c = combosForHand(h);
    if (total + c > targetCombos) break;
    result.push(h);
    total += c;
  }
  return result;
}

const POSITION_WIDTH_ORDER = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];

function getNextWiderPosition(position: string): string | null {
  const idx = POSITION_WIDTH_ORDER.indexOf(position);
  if (idx < 0 || idx >= POSITION_WIDTH_ORDER.length - 1) return null;
  return POSITION_WIDTH_ORDER[idx + 1];
}

// ---------- GTO Open Raise (RFI) Ranges ----------
// Solver-derived for 6-max 100bb. Ordered: premiums first, then
// strong value, then speculative/marginal (for clean TAG trimming).

const GTO_OPEN: Record<string, string[]> = {
  UTG: [
    // Premiums + strong pairs
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    // Suited broadways
    'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs',
    // Suited connectors + aces
    'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K9s',
    'T9s', '98s', '87s', '76s', '65s', '54s',
    // Offsuit broadways
    'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo',
  ],
  HJ: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s',
    'QJs', 'QTs', 'Q9s',
    'JTs', 'J9s',
    'T9s', 'T8s', '98s', '87s', '76s', '65s', '54s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o',
    'KQo', 'KJo', 'KTo',
    'QJo', 'QTo', 'JTo',
  ],
  CO: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s',
    'JTs', 'J9s', 'J8s', 'J7s',
    'T9s', 'T8s', 'T7s',
    '98s', '97s', '87s', '86s', '76s', '65s', '54s', '43s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o',
    'KQo', 'KJo', 'KTo', 'K9o',
    'QJo', 'QTo', 'Q9o',
    'JTo', 'J9o', 'T9o',
  ],
  BTN: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
    'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s',
    'T9s', 'T8s', 'T7s', 'T6s', 'T5s',
    '98s', '97s', '96s', '95s',
    '87s', '86s', '85s',
    '76s', '75s', '74s',
    '65s', '64s', '53s', '54s', '43s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
    'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'K6o', 'K5o',
    'QJo', 'QTo', 'Q9o', 'Q8o', 'Q7o',
    'JTo', 'J9o', 'J8o',
    'T9o', 'T8o',
    '98o', '97o', '87o',
  ],
  SB: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s',
    'JTs', 'J9s', 'J8s', 'J7s',
    'T9s', 'T8s', 'T7s',
    '98s', '97s', '96s',
    '87s', '86s',
    '76s', '75s',
    '65s', '54s',
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
    'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o',
    'QJo', 'QTo', 'Q9o',
    'JTo', 'J9o', 'T9o',
  ],
  BB: [],
};

// ---------- Facing Raise (3-Bet / Call / Fold) ----------
// Position-pair aware. Key format: "defender_vs_opener"

interface FacingRaiseRange {
  threeBetValue: string[];
  threeBetBluff: string[];
  call: string[];
}

const GTO_FACING_RAISE: Record<string, FacingRaiseRange> = {
  // vs UTG open — tight defense
  HJ_vs_UTG: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s'],
    call: ['JJ', 'TT', 'AQs', 'AJs', 'KQs', 'AQo'],
  },
  CO_vs_UTG: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s'],
    call: ['JJ', 'TT', '99', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'AQo'],
  },
  BTN_vs_UTG: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s'],
    call: ['JJ', 'TT', '99', '88', '77', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', '87s', '76s', 'AQo'],
  },
  SB_vs_UTG: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s'],
    call: ['JJ', 'TT', 'AQs', 'AJs', 'KQs'],
  },
  BB_vs_UTG: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s'],
    call: ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', 'AQo', 'AJo', 'KQo'],
  },

  // vs HJ open
  CO_vs_HJ: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s'],
    call: ['JJ', 'TT', '99', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'AQo'],
  },
  BTN_vs_HJ: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', '76s', '65s'],
    call: ['TT', '99', '88', '77', '66', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', 'AQo', 'AJo', 'KQo'],
  },
  SB_vs_HJ: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs'],
    threeBetBluff: ['A5s', 'A4s', 'A3s'],
    call: ['JJ', 'TT', '99', 'AJs', 'KQs', 'KJs', 'AQo'],
  },
  BB_vs_HJ: {
    threeBetValue: ['AA', 'KK', 'QQ', 'AKs', 'AKo', 'AQs'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', '76s', '65s', '54s'],
    call: ['JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '87s', '76s', '65s', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'],
  },

  // vs CO open
  BTN_vs_CO: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', '76s', '65s', '54s'],
    call: ['TT', '99', '88', '77', '66', '55', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo', 'JTo'],
  },
  SB_vs_CO: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', '65s', '54s'],
    call: ['TT', '99', '88', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', 'AQo', 'KQo'],
  },
  BB_vs_CO: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', '76s', '65s', '54s', '43s'],
    call: ['TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo', 'T9o'],
  },

  // vs BTN open — widest defense
  SB_vs_BTN: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'AKo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', '76s', '65s', '54s'],
    call: ['99', '88', '77', '66', '55', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'],
  },
  BB_vs_BTN: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'AKo', 'AQo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q5s', '76s', '65s', '54s', '43s'],
    call: ['99', '88', '77', '66', '55', '44', '33', '22', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o', '98o'],
  },

  // vs SB open
  BB_vs_SB: {
    threeBetValue: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'ATs', 'AKo', 'AQo'],
    threeBetBluff: ['A5s', 'A4s', 'A3s', 'A2s', 'K5s', 'K4s', 'K3s', 'K2s', 'Q6s', 'Q5s', '76s', '65s', '54s', '43s'],
    call: ['88', '77', '66', '55', '44', '33', '22', 'A9s', 'A8s', 'A7s', 'A6s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '65s', '64s', '54s', '53s', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'QJo', 'QTo', 'Q9o', 'Q8o', 'JTo', 'J9o', 'J8o', 'T9o', 'T8o', '98o', '97o', '87o'],
  },
};

// ---------- Facing 3-Bet Ranges ----------

interface Facing3BetRange {
  fourBet: string[];
  call: string[];
}

const GTO_FACING_3BET: Record<string, Facing3BetRange> = {
  UTG: {
    fourBet: ['AA', 'KK', 'AKs'],
    call: ['QQ', 'JJ', 'TT', 'AKo', 'AQs'],
  },
  HJ: {
    fourBet: ['AA', 'KK', 'AKs'],
    call: ['QQ', 'JJ', 'TT', 'AKo', 'AQs', 'AJs'],
  },
  CO: {
    fourBet: ['AA', 'KK', 'AKs', 'A5s'],
    call: ['QQ', 'JJ', 'TT', '99', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs'],
  },
  BTN: {
    fourBet: ['AA', 'KK', 'AKs', 'A5s'],
    call: ['QQ', 'JJ', 'TT', '99', '88', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs'],
  },
  SB: {
    fourBet: ['AA', 'KK', 'AKs'],
    call: ['QQ', 'JJ', 'TT', 'AKo', 'AQs'],
  },
};

// ---------- Default matchup for chart display ----------

const DEFAULT_OPENER: Record<string, string> = {
  HJ: 'UTG',
  CO: 'HJ',
  BTN: 'CO',
  SB: 'BTN',
  BB: 'BTN',
};

// ---------- Public API ----------

export function getOpenRange(position: string, style: PlayStyle): Set<string> {
  const base = GTO_OPEN[position];
  if (!base || base.length === 0) return new Set();

  if (style === 'GTO') return new Set(base);

  if (style === 'TAG') {
    const target = countCombos(base) * 0.80;
    return new Set(trimToComboTarget(base, target));
  }

  if (style === 'LAG') {
    const expanded = [...base];
    const next = getNextWiderPosition(position);
    if (next) {
      const nextHands = GTO_OPEN[next];
      if (nextHands) {
        const baseSet = new Set(base);
        const target = countCombos(base) * 1.20;
        for (const hand of nextHands) {
          if (countCombos(expanded) >= target) break;
          if (!baseSet.has(hand)) expanded.push(hand);
        }
      }
    }
    return new Set(expanded);
  }

  return new Set(base);
}

export function getValidOpeners(defenderPosition: string): string[] {
  const order = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
  const idx = order.indexOf(defenderPosition);
  if (idx <= 0) return [];
  // Also include BB defending vs any opener
  if (defenderPosition === 'BB') return ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
  return order.slice(0, idx);
}

export function getDefaultOpener(defenderPosition: string): string {
  return DEFAULT_OPENER[defenderPosition] || 'UTG';
}

export function getFacingRaiseAction(
  notation: string,
  yourPosition: string,
  raiserPosition: string,
  style: PlayStyle,
): '3bet' | 'call' | 'fold' {
  const key = `${yourPosition}_vs_${raiserPosition}`;
  const ranges = GTO_FACING_RAISE[key];

  if (!ranges) {
    // Fallback: use closest available matchup
    return 'fold';
  }

  // Build effective ranges based on style
  let threeBetHands: string[];
  let callHands: string[];

  if (style === 'TAG') {
    // Fewer bluffs, same value
    threeBetHands = [...ranges.threeBetValue];
    callHands = [...ranges.call];
  } else if (style === 'LAG') {
    // More bluffs, wider calls
    threeBetHands = [...ranges.threeBetValue, ...ranges.threeBetBluff];
    // LAG also 3-bets some call hands as bluffs
    const extraBluffs = ranges.call.filter(h =>
      h.endsWith('s') && !ranges.threeBetValue.includes(h) && !ranges.threeBetBluff.includes(h)
    ).slice(0, 3);
    threeBetHands.push(...extraBluffs);
    callHands = ranges.call.filter(h => !extraBluffs.includes(h));
  } else {
    // GTO — balanced
    threeBetHands = [...ranges.threeBetValue, ...ranges.threeBetBluff];
    callHands = [...ranges.call];
  }

  const threeBetSet = new Set(threeBetHands);
  const callSet = new Set(callHands);

  if (threeBetSet.has(notation)) return '3bet';
  if (callSet.has(notation)) return 'call';
  return 'fold';
}

export function getFacing3BetAction(
  notation: string,
  yourPosition: string,
  style: PlayStyle,
): '4bet' | 'call' | 'fold' {
  const ranges = GTO_FACING_3BET[yourPosition];
  if (!ranges) return 'fold';

  let fourBetHands = [...ranges.fourBet];
  let callHands = [...ranges.call];

  if (style === 'TAG') {
    // Only pure value 4-bets, tighter calls
    fourBetHands = fourBetHands.filter(h => ['AA', 'KK'].includes(h) || h === 'AKs');
    callHands = callHands.slice(0, Math.ceil(callHands.length * 0.7));
  } else if (style === 'LAG') {
    // Add bluff 4-bets
    if (!fourBetHands.includes('A5s')) fourBetHands.push('A5s');
    if (!fourBetHands.includes('A4s')) fourBetHands.push('A4s');
  }

  if (new Set(fourBetHands).has(notation)) return '4bet';
  if (new Set(callHands).has(notation)) return 'call';
  return 'fold';
}

// Aggregated facing-raise ranges for chart display
export function getFacingRaiseRanges(
  defenderPosition: string,
  openerPosition: string,
  style: PlayStyle,
): { threeBet: Set<string>; call: Set<string> } {
  const key = `${defenderPosition}_vs_${openerPosition}`;
  const ranges = GTO_FACING_RAISE[key];

  if (!ranges) return { threeBet: new Set(), call: new Set() };

  let threeBetHands: string[];
  let callHands: string[];

  if (style === 'TAG') {
    threeBetHands = [...ranges.threeBetValue];
    callHands = [...ranges.call];
  } else if (style === 'LAG') {
    threeBetHands = [...ranges.threeBetValue, ...ranges.threeBetBluff];
    const extraBluffs = ranges.call.filter(h =>
      h.endsWith('s') && !ranges.threeBetValue.includes(h) && !ranges.threeBetBluff.includes(h)
    ).slice(0, 3);
    threeBetHands.push(...extraBluffs);
    callHands = ranges.call.filter(h => !extraBluffs.includes(h));
  } else {
    threeBetHands = [...ranges.threeBetValue, ...ranges.threeBetBluff];
    callHands = [...ranges.call];
  }

  return {
    threeBet: new Set(threeBetHands),
    call: new Set(callHands),
  };
}

export function getStyleLabel(style: PlayStyle): string {
  switch (style) {
    case 'GTO': return 'GTO (Balanced)';
    case 'TAG': return 'TAG (Tight-Aggressive)';
    case 'LAG': return 'LAG (Loose-Aggressive)';
  }
}
