import { Card, HandRanking, HandResult, Rank } from './types';
import { RANK_VALUES } from './deck';

function getRankCounts(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const c of cards) {
    const v = RANK_VALUES[c.rank];
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  return counts;
}

function getSuitCounts(cards: Card[]): Map<string, Card[]> {
  const suits = new Map<string, Card[]>();
  for (const c of cards) {
    if (!suits.has(c.suit)) suits.set(c.suit, []);
    suits.get(c.suit)!.push(c);
  }
  return suits;
}

function findStraight(values: number[]): number | null {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  // Check for A-2-3-4-5 (wheel)
  if (unique.includes(14) && unique.includes(2) && unique.includes(3) && unique.includes(4) && unique.includes(5)) {
    return 5; // 5-high straight
  }
  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) {
      let sequential = true;
      for (let j = 0; j < 4; j++) {
        if (unique[i + j] - unique[i + j + 1] !== 1) {
          sequential = false;
          break;
        }
      }
      if (sequential) return unique[i];
    }
  }
  return null;
}

function evaluate5(cards: Card[]): HandResult {
  const values = cards.map(c => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  const rankCounts = getRankCounts(cards);
  const suitCounts = getSuitCounts(cards);

  const isFlush = [...suitCounts.values()].some(s => s.length >= 5);
  const straightHigh = findStraight(values);
  const isStraight = straightHigh !== null;

  // Group by count
  const groups: { value: number; count: number }[] = [];
  rankCounts.forEach((count, value) => groups.push({ value, count }));
  groups.sort((a, b) => b.count - a.count || b.value - a.value);

  const makeResult = (ranking: HandRanking, rankValue: number, kickers: number[], desc: string): HandResult => ({
    ranking, rankValue, cards: cards.slice(0, 5), kickers, description: desc,
  });

  // Royal Flush
  if (isFlush && isStraight && straightHigh === 14) {
    return makeResult('Royal Flush', 9, [14], 'Royal Flush');
  }
  // Straight Flush
  if (isFlush && isStraight) {
    return makeResult('Straight Flush', 8, [straightHigh!], `Straight Flush, ${rankName(straightHigh!)} high`);
  }
  // Four of a Kind
  if (groups[0].count === 4) {
    const quad = groups[0].value;
    const kicker = groups[1].value;
    return makeResult('Four of a Kind', 7, [quad, kicker], `Four of a Kind, ${rankNamePlural(quad)}`);
  }
  // Full House
  if (groups[0].count === 3 && groups[1].count >= 2) {
    return makeResult('Full House', 6, [groups[0].value, groups[1].value],
      `Full House, ${rankNamePlural(groups[0].value)} full of ${rankNamePlural(groups[1].value)}`);
  }
  // Flush
  if (isFlush) {
    return makeResult('Flush', 5, values.slice(0, 5), `Flush, ${rankName(values[0])} high`);
  }
  // Straight
  if (isStraight) {
    return makeResult('Straight', 4, [straightHigh!], `Straight, ${rankName(straightHigh!)} high`);
  }
  // Three of a Kind
  if (groups[0].count === 3) {
    const trips = groups[0].value;
    const kickers = groups.filter(g => g.count === 1).map(g => g.value).slice(0, 2);
    return makeResult('Three of a Kind', 3, [trips, ...kickers], `Three of a Kind, ${rankNamePlural(trips)}`);
  }
  // Two Pair
  if (groups[0].count === 2 && groups[1].count === 2) {
    const high = Math.max(groups[0].value, groups[1].value);
    const low = Math.min(groups[0].value, groups[1].value);
    const kicker = groups.find(g => g.count === 1)?.value || 0;
    return makeResult('Two Pair', 2, [high, low, kicker],
      `Two Pair, ${rankNamePlural(high)} and ${rankNamePlural(low)}`);
  }
  // One Pair
  if (groups[0].count === 2) {
    const pair = groups[0].value;
    const kickers = groups.filter(g => g.count === 1).map(g => g.value).slice(0, 3);
    return makeResult('One Pair', 1, [pair, ...kickers], `Pair of ${rankNamePlural(pair)}`);
  }
  // High Card
  return makeResult('High Card', 0, values.slice(0, 5), `${rankName(values[0])} high`);
}

function rankName(value: number): string {
  const names: Record<number, string> = {
    14: 'Ace', 13: 'King', 12: 'Queen', 11: 'Jack', 10: 'Ten',
    9: 'Nine', 8: 'Eight', 7: 'Seven', 6: 'Six', 5: 'Five',
    4: 'Four', 3: 'Three', 2: 'Two',
  };
  return names[value] || String(value);
}

function rankNamePlural(value: number): string {
  const plurals: Record<number, string> = {
    14: 'Aces', 13: 'Kings', 12: 'Queens', 11: 'Jacks', 10: 'Tens',
    9: 'Nines', 8: 'Eights', 7: 'Sevens', 6: 'Sixes', 5: 'Fives',
    4: 'Fours', 3: 'Threes', 2: 'Twos',
  };
  return plurals[value] || String(value);
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const result: T[][] = [];
  const [first, ...rest] = arr;
  for (const combo of combinations(rest, k - 1)) {
    result.push([first, ...combo]);
  }
  result.push(...combinations(rest, k));
  return result;
}

export function evaluateBest5(cards: Card[]): HandResult {
  if (cards.length < 5) {
    return evaluate5([...cards, ...Array(5 - cards.length).fill(cards[0])].slice(0, 5));
  }
  if (cards.length === 5) return evaluate5(cards);

  const combos = combinations(cards, 5);
  let best: HandResult | null = null;
  for (const combo of combos) {
    const result = evaluate5(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }
  return best!;
}

export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rankValue !== b.rankValue) return a.rankValue - b.rankValue;
  for (let i = 0; i < Math.min(a.kickers.length, b.kickers.length); i++) {
    if (a.kickers[i] !== b.kickers[i]) return a.kickers[i] - b.kickers[i];
  }
  return 0;
}

export function calculateOuts(holeCards: [Card, Card], board: Card[]): { outs: number; draws: string[]; outCards: Card[] } {
  if (board.length < 3) return { outs: 0, draws: [], outCards: [] };

  const allCards = [...holeCards, ...board];
  const usedKeys = new Set(allCards.map(c => `${c.rank}${c.suit}`));
  const draws: string[] = [];
  const outCardKeys = new Set<string>();
  const outCards: Card[] = [];

  const holeValues = holeCards.map(c => RANK_VALUES[c.rank]);
  const boardValues = board.map(c => RANK_VALUES[c.rank]);
  const currentHand = evaluateBest5(allCards);

  const allSuits = ['♠', '♣', '♥', '♦'] as const;

  // 1. Flush draw outs — need exactly 4 of a suit involving at least one hole card
  for (const suit of allSuits) {
    const suitedCards = allCards.filter(c => c.suit === suit);
    const holeSuited = holeCards.filter(c => c.suit === suit).length;
    if (suitedCards.length === 4 && holeSuited >= 1) {
      draws.push('Flush draw');
      // 9 remaining cards of that suit are outs
      const allRanks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
      for (const rank of allRanks) {
        const key = `${rank}${suit}`;
        if (!usedKeys.has(key)) {
          outCardKeys.add(key);
        }
      }
    }
  }

  // 2. Straight draw outs
  const uniqueValues = [...new Set(allCards.map(c => RANK_VALUES[c.rank]))].sort((a, b) => a - b);
  if (uniqueValues.includes(14)) uniqueValues.unshift(1); // ace low

  // Find gaps in sequences that involve hole cards
  const straightOuts = findStraightDrawOuts(uniqueValues, holeValues, usedKeys, allCards);
  if (straightOuts.type) {
    draws.push(straightOuts.type);
    for (const key of straightOuts.outKeys) {
      outCardKeys.add(key);
    }
  }

  // 3. Pair outs — if we have high card, count outs to pair our hole cards
  if (currentHand.rankValue === 0) {
    const boardMax = Math.max(...boardValues);
    // Overcards that can pair
    for (const hv of holeValues) {
      if (hv > boardMax) {
        // 3 remaining cards of that rank
        const rank = holeCards.find(c => RANK_VALUES[c.rank] === hv)!.rank;
        for (const suit of allSuits) {
          const key = `${rank}${suit}`;
          if (!usedKeys.has(key)) outCardKeys.add(key);
        }
      }
    }
    const overcards = holeValues.filter(v => v > boardMax);
    if (overcards.length > 0) {
      draws.push(`${overcards.length} overcard(s)`);
    }
  }

  // 4. Set outs — if we have a pocket pair, count outs to hit a set
  if (holeCards[0].rank === holeCards[1].rank && currentHand.rankValue <= 1) {
    const rank = holeCards[0].rank;
    for (const suit of allSuits) {
      const key = `${rank}${suit}`;
      if (!usedKeys.has(key)) outCardKeys.add(key);
    }
    if (!draws.length) draws.push('Set draw');
  }

  // 5. Two pair / trips outs — if we have one pair using hole cards
  if (currentHand.rankValue === 1) {
    // Check if our pair involves a hole card
    for (const hc of holeCards) {
      const hv = RANK_VALUES[hc.rank];
      const pairCount = allCards.filter(c => RANK_VALUES[c.rank] === hv).length;
      if (pairCount >= 2) {
        // Outs to trips (remaining cards of that rank)
        for (const suit of allSuits) {
          const key = `${hc.rank}${suit}`;
          if (!usedKeys.has(key)) outCardKeys.add(key);
        }
        // Outs to two pair (pairing the other hole card)
        const otherHc = holeCards.find(c => c !== hc)!;
        for (const suit of allSuits) {
          const key = `${otherHc.rank}${suit}`;
          if (!usedKeys.has(key)) outCardKeys.add(key);
        }
      }
    }
  }

  // Collect unique out cards
  for (const key of outCardKeys) {
    const rank = key[0] as Rank;
    const suit = key.substring(1) as Card['suit'];
    outCards.push({ rank, suit });
  }

  return { outs: outCards.length, draws, outCards };
}

function findStraightDrawOuts(
  uniqueValues: number[],
  holeValues: number[],
  usedKeys: Set<string>,
  _allCards: Card[],
): { type: string | null; outKeys: Set<string> } {
  const outKeys = new Set<string>();
  const allSuits = ['♠', '♣', '♥', '♦'] as const;

  // Check all possible 5-card straight windows
  for (let high = 14; high >= 5; high--) {
    const needed: number[] = [];
    for (let v = high; v > high - 5; v--) {
      needed.push(v <= 0 ? v + 13 : v);
    }
    // Normalize: for wheel (5-high), needed = [5,4,3,2,1] where 1=ace(14)
    const normalNeeded = needed.map(v => v === 1 ? 14 : v);

    const have = normalNeeded.filter(v => uniqueValues.includes(v));
    const missing = normalNeeded.filter(v => !uniqueValues.includes(v));
    const usesHoleCard = have.some(v => holeValues.includes(v));

    if (!usesHoleCard) continue;

    if (missing.length === 1) {
      // One card needed — either OESD or gutshot
      const missingVal = missing[0];
      const missingRank = valueToRank(missingVal);
      if (!missingRank) continue;

      // Check if it's open-ended (missing card at either end) or gutshot (middle)
      const isOpenEnded = missingVal === normalNeeded[0] || missingVal === normalNeeded[4];

      for (const suit of allSuits) {
        const key = `${missingRank}${suit}`;
        if (!usedKeys.has(key)) outKeys.add(key);
      }

      if (outKeys.size > 0) {
        // For OESD, check both ends
        if (isOpenEnded) {
          return { type: 'Open-ended straight draw', outKeys };
        }
        return { type: 'Gutshot straight draw', outKeys };
      }
    }
  }

  // Also check for OESD: 4 in a row, need one on either end
  for (let start = 2; start <= 11; start++) {
    const run = [start, start + 1, start + 2, start + 3];
    const normalRun = run.map(v => v > 14 ? v - 13 : v);
    if (normalRun.every(v => uniqueValues.includes(v)) && normalRun.some(v => holeValues.includes(v))) {
      // Have 4 in a row — check both ends
      const lowEnd = start - 1;
      const highEnd = start + 4;
      const oeOutKeys = new Set<string>();

      for (const end of [lowEnd, highEnd]) {
        if (end < 1 || end > 14) continue;
        const rank = valueToRank(end);
        if (!rank) continue;
        for (const suit of allSuits) {
          const key = `${rank}${suit}`;
          if (!usedKeys.has(key)) oeOutKeys.add(key);
        }
      }
      if (oeOutKeys.size > 0) {
        return { type: 'Open-ended straight draw', outKeys: oeOutKeys };
      }
    }
  }

  return { type: null, outKeys };
}

function valueToRank(value: number): Rank | null {
  const map: Record<number, Rank> = {
    14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
    9: '9', 8: '8', 7: '7', 6: '6', 5: '5',
    4: '4', 3: '3', 2: '2',
  };
  return map[value] || null;
}

export function handRankingValue(ranking: HandRanking): number {
  const map: Record<HandRanking, number> = {
    'Royal Flush': 9, 'Straight Flush': 8, 'Four of a Kind': 7,
    'Full House': 6, 'Flush': 5, 'Straight': 4,
    'Three of a Kind': 3, 'Two Pair': 2, 'One Pair': 1, 'High Card': 0,
  };
  return map[ranking];
}
