import { Card, BoardTexture, PostflopAction, ScenarioType, Street } from './types';
import { RANK_VALUES, dealCards, SUITS } from './deck';
import { evaluateBest5, calculateOuts, HandResult } from './evaluator';

export function classifyBoardTexture(board: Card[]): BoardTexture {
  if (board.length < 3) return 'dry';
  const flop = board.slice(0, 3);

  // Check for flush draw potential
  const suitCounts = new Map<string, number>();
  for (const c of flop) {
    suitCounts.set(c.suit, (suitCounts.get(c.suit) || 0) + 1);
  }
  const maxSuitCount = Math.max(...suitCounts.values());
  const hasFlushDraw = maxSuitCount >= 2;
  const isMonotone = maxSuitCount === 3;

  // Check for straight draw potential
  const values = flop.map(c => RANK_VALUES[c.rank]).sort((a, b) => a - b);
  const spread = values[2] - values[0];
  const hasConnectors = spread <= 4;
  const hasPair = values[0] === values[1] || values[1] === values[2];

  if (isMonotone) return 'wet';
  if (hasConnectors && hasFlushDraw && !hasPair) return 'wet';
  if (hasConnectors || (hasFlushDraw && !hasPair)) return 'semi-wet';
  return 'dry';
}

export function calculatePotOdds(callAmount: number, potSize: number): number {
  return callAmount / (potSize + callAmount);
}

export function calculateDrawEquity(outs: number, street: Street): number {
  if (street === 'flop') return Math.min(outs * 4, 100) / 100; // Rule of 4
  if (street === 'turn') return Math.min(outs * 2, 100) / 100; // Rule of 2
  return 0;
}

export function getCommonDrawInfo(outs: number): { name: string; flopToRiver: number; turnToRiver: number } | null {
  const draws: { name: string; outs: number; flopToRiver: number; turnToRiver: number }[] = [
    { name: 'Gutshot straight draw', outs: 4, flopToRiver: 16.5, turnToRiver: 8.7 },
    { name: 'Two overcards', outs: 6, flopToRiver: 24.1, turnToRiver: 13.0 },
    { name: 'Open-ended straight draw', outs: 8, flopToRiver: 31.5, turnToRiver: 17.4 },
    { name: 'Flush draw', outs: 9, flopToRiver: 35.0, turnToRiver: 19.6 },
    { name: 'Flush draw + gutshot', outs: 12, flopToRiver: 45.0, turnToRiver: 26.1 },
    { name: 'Flush draw + open-ended', outs: 15, flopToRiver: 54.1, turnToRiver: 32.6 },
  ];
  return draws.find(d => Math.abs(d.outs - outs) <= 1) || null;
}

interface PostflopDecisionPoint {
  street: Street;
  board: Card[];
  potSize: number;
  facingBet: number;
  holeCards: [Card, Card];
  scenarioType: ScenarioType;
  boardTexture: BoardTexture;
  handResult: HandResult;
  outs: number;
  equity: number;
  potOdds: number;
  recommendedAction: PostflopAction;
  explanation: string;
}

export function generatePostflopScenario(): {
  holeCards: [Card, Card];
  scenarioType: ScenarioType;
  streets: PostflopDecisionPoint[];
} {
  // Pick scenario type with weights
  const rand = Math.random();
  let scenarioType: ScenarioType;
  if (rand < 0.30) scenarioType = 'cbet';
  else if (rand < 0.55) scenarioType = 'drawing';
  else if (rand < 0.75) scenarioType = 'value_betting';
  else if (rand < 0.90) scenarioType = 'bluffing';
  else scenarioType = 'tough_fold';

  // Deal cards
  const deck = dealCards(9);
  const holeCards: [Card, Card] = [deck[0], deck[1]];
  const fullBoard = [deck[2], deck[3], deck[4], deck[5], deck[6]];

  const streets: PostflopDecisionPoint[] = [];

  // Generate decision points for each street
  let potSize = 6.5; // Typical preflop pot (3bb raise + call + blinds)

  for (let streetIdx = 0; streetIdx < 3; streetIdx++) {
    const street: Street = streetIdx === 0 ? 'flop' : streetIdx === 1 ? 'turn' : 'river';
    const boardCards = street === 'flop' ? fullBoard.slice(0, 3) :
      street === 'turn' ? fullBoard.slice(0, 4) : fullBoard;

    const boardTexture = classifyBoardTexture(boardCards);
    const handResult = evaluateBest5([...holeCards, ...boardCards]);
    const outsInfo = calculateOuts(holeCards, boardCards);

    // Determine facing bet based on scenario type
    let facingBet = 0;
    if (scenarioType === 'drawing' || scenarioType === 'tough_fold') {
      facingBet = Math.round(potSize * (0.5 + Math.random() * 0.5) * 10) / 10;
    }

    const potOdds = facingBet > 0 ? calculatePotOdds(facingBet, potSize) : 0;
    const equity = facingBet > 0 ? calculateDrawEquity(outsInfo.outs, street) : 0;

    const { action, explanation } = getPostflopRecommendation(
      scenarioType, handResult, outsInfo.outs, boardTexture, potOdds, equity, potSize, facingBet, street
    );

    streets.push({
      street,
      board: boardCards,
      potSize,
      facingBet,
      holeCards,
      scenarioType,
      boardTexture,
      handResult,
      outs: outsInfo.outs,
      equity,
      potOdds,
      recommendedAction: action,
      explanation,
    });

    // Update pot for next street
    if (action === 'bet_half' || action === 'call') {
      potSize += potSize * 0.5 * 2;
    } else if (action === 'bet_third') {
      potSize += potSize * 0.33 * 2;
    } else if (action === 'bet_twothirds') {
      potSize += potSize * 0.67 * 2;
    } else if (action === 'bet_pot') {
      potSize += potSize * 2;
    } else if (action === 'check') {
      // pot stays same
    } else if (action === 'fold') {
      break;
    }
  }

  return { holeCards, scenarioType, streets };
}

function getPostflopRecommendation(
  type: ScenarioType,
  hand: HandResult,
  outs: number,
  texture: BoardTexture,
  potOdds: number,
  equity: number,
  potSize: number,
  facingBet: number,
  street: Street,
): { action: PostflopAction; explanation: string } {
  switch (type) {
    case 'cbet': {
      if (hand.rankValue >= 3) {
        return { action: 'bet_twothirds', explanation: `You have ${hand.description} — bet for value. This is a strong hand worth building the pot with a 2/3 pot c-bet.` };
      }
      if (texture === 'dry') {
        return { action: 'bet_third', explanation: `Dry board favors the preflop raiser's range. A small 1/3 pot c-bet puts pressure on your opponent even without a strong hand.` };
      }
      if (texture === 'wet') {
        if (hand.rankValue >= 1) {
          return { action: 'bet_half', explanation: `You have ${hand.description} on a wet board. A 1/2 pot bet protects your hand and denies equity from draws.` };
        }
        return { action: 'check', explanation: `Wet boards favor the caller's range. With ${hand.description}, checking back preserves your equity without bloating the pot.` };
      }
      if (hand.rankValue >= 1 || outs >= 8) {
        return { action: 'bet_half', explanation: `Semi-wet board with ${hand.description}${outs > 0 ? ` and ${outs} outs` : ''}. A 1/2 pot bet is appropriate.` };
      }
      return { action: 'check', explanation: `With ${hand.description} on a semi-wet board, checking is best. You don't have enough equity to profitably c-bet.` };
    }

    case 'drawing': {
      if (facingBet > 0) {
        if (equity > potOdds) {
          return {
            action: 'call',
            explanation: `You have ${outs} outs (${(equity * 100).toFixed(1)}% equity) vs pot odds of ${(potOdds * 100).toFixed(1)}%. Since your equity exceeds the pot odds, calling is +EV.`
          };
        }
        if (equity > potOdds * 0.7 && street === 'flop') {
          return {
            action: 'call',
            explanation: `You have ${outs} outs. While direct pot odds are ${(potOdds * 100).toFixed(1)}% vs ${(equity * 100).toFixed(1)}% equity, implied odds make this a profitable call on the flop.`
          };
        }
        return {
          action: 'fold',
          explanation: `You have ${outs} outs (${(equity * 100).toFixed(1)}% equity) but need ${(potOdds * 100).toFixed(1)}% to call. The pot odds don't justify continuing.`
        };
      }
      if (outs >= 8) {
        return { action: 'bet_half', explanation: `With ${outs} outs, you can semi-bluff with a 1/2 pot bet. You have fold equity plus equity when called.` };
      }
      return { action: 'check', explanation: `With only ${outs} outs, check to see a free card. Not enough equity to profitably semi-bluff.` };
    }

    case 'value_betting': {
      if (hand.rankValue >= 3) {
        return { action: 'bet_twothirds', explanation: `${hand.description} is a strong hand — bet 2/3 pot for thick value. You want to build the pot with hands this strong.` };
      }
      if (hand.rankValue >= 2) {
        return { action: 'bet_half', explanation: `${hand.description} is a good value hand. Bet 1/2 pot for thin value — you're ahead of most of your opponent's continuing range.` };
      }
      if (hand.rankValue === 1 && street !== 'river') {
        return { action: 'bet_third', explanation: `${hand.description} has thin value. A small 1/3 pot bet can extract value from worse hands while keeping the pot manageable.` };
      }
      return { action: 'check', explanation: `${hand.description} is a showdown hand. Check to control the pot — betting might only get called by better hands.` };
    }

    case 'bluffing': {
      if (street === 'river' && hand.rankValue <= 0) {
        if (outs >= 4) {
          return { action: 'bet_twothirds', explanation: `Your draw missed, but you can bluff representing the completed draw. With blockers, a 2/3 pot bet tells a convincing story.` };
        }
        return { action: 'check', explanation: `Your draw missed and you don't have good blockers. Giving up is better than burning chips on a low-credibility bluff.` };
      }
      if (outs >= 8) {
        return { action: 'bet_half', explanation: `Semi-bluff with ${outs} outs. You have fold equity plus good equity when called — this is a profitable bluff.` };
      }
      return { action: 'check', explanation: `Without enough outs or blockers, bluffing is unprofitable here. Check and look for a better spot.` };
    }

    case 'tough_fold': {
      if (facingBet > 0) {
        if (hand.rankValue >= 4) {
          return { action: 'call', explanation: `${hand.description} is too strong to fold even against a big bet. You beat too many value hands and bluffs.` };
        }
        if (hand.rankValue >= 2 && facingBet <= potSize * 0.5) {
          return { action: 'call', explanation: `${hand.description} has enough equity against a half-pot bet. Folding would be too tight here.` };
        }
        if (hand.rankValue >= 1 && facingBet > potSize * 0.75) {
          return { action: 'fold', explanation: `Facing a large bet with ${hand.description}, this is a tough fold. On this board texture, the large sizing usually represents strong hands that beat you.` };
        }
        return { action: 'call', explanation: `${hand.description} is good enough to continue against this bet size. Don't over-fold to aggression.` };
      }
      return { action: 'check', explanation: `Check with ${hand.description} and control the pot size.` };
    }
  }
}

export function scenarioTypeDisplay(type: ScenarioType): string {
  switch (type) {
    case 'cbet': return 'Continuation Bet';
    case 'drawing': return 'Drawing Decision';
    case 'value_betting': return 'Value Betting';
    case 'bluffing': return 'Bluffing Spot';
    case 'tough_fold': return 'Tough Decision';
  }
}

export function actionDisplay(action: PostflopAction): string {
  switch (action) {
    case 'check': return 'Check';
    case 'fold': return 'Fold';
    case 'call': return 'Call';
    case 'bet_third': return 'Bet 1/3 Pot';
    case 'bet_half': return 'Bet 1/2 Pot';
    case 'bet_twothirds': return 'Bet 2/3 Pot';
    case 'bet_pot': return 'Bet Pot';
    case 'bet_overbet': return 'Overbet';
    case 'raise': return 'Raise';
  }
}
