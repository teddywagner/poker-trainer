import { useState } from 'react';

interface Term {
  term: string;
  definition: string;
}

interface Section {
  title: string;
  terms: Term[];
}

const GLOSSARY: Section[] = [
  {
    title: 'Hand Rankings (Best to Worst)',
    terms: [
      { term: 'Royal Flush', definition: 'A-K-Q-J-10 all of the same suit. The best possible hand in poker.' },
      { term: 'Straight Flush', definition: 'Five sequential cards of the same suit (e.g., 9-8-7-6-5 of hearts).' },
      { term: 'Four of a Kind (Quads)', definition: 'Four cards of the same rank (e.g., four Kings). The fifth card (kicker) breaks ties.' },
      { term: 'Full House (Boat)', definition: 'Three of a kind plus a pair (e.g., three Jacks and two Fives). Ranked by the trips first, then the pair.' },
      { term: 'Flush', definition: 'Five cards of the same suit, not in sequence. Ranked by highest card, then next highest, etc.' },
      { term: 'Straight', definition: 'Five sequential cards of mixed suits (e.g., 9-8-7-6-5). Ace can be high (A-K-Q-J-10) or low (5-4-3-2-A, called the "wheel").' },
      { term: 'Three of a Kind (Trips/Set)', definition: 'Three cards of the same rank. Called a "set" when you have a pocket pair and hit one on the board; "trips" when two are on the board.' },
      { term: 'Two Pair', definition: 'Two different pairs (e.g., two Kings and two Sevens). The fifth card is the kicker.' },
      { term: 'One Pair', definition: 'Two cards of the same rank. Remaining three cards are kickers.' },
      { term: 'High Card', definition: 'No made hand. The highest card plays. Used when no player has at least a pair.' },
    ],
  },
  {
    title: 'Table Positions',
    terms: [
      { term: 'UTG (Under the Gun)', definition: 'First player to act preflop, sitting left of the big blind. The worst preflop position because you act first with no information. Requires the tightest opening range.' },
      { term: 'UTG+1', definition: 'Second player to act preflop (9-max tables). Still an early position with a tight range.' },
      { term: 'MP (Middle Position)', definition: 'Middle positions at the table. Slightly wider opening range than early positions.' },
      { term: 'HJ (Hijack)', definition: 'Two seats right of the button. A middle-late position where ranges start to widen significantly.' },
      { term: 'CO (Cutoff)', definition: 'One seat right of the button. Second-best position at the table. Wide opening range because only BTN, SB, and BB act after you.' },
      { term: 'BTN (Button/Dealer)', definition: 'The best position in poker. Acts last on every postflop street, giving maximum information before making decisions. Widest opening range.' },
      { term: 'SB (Small Blind)', definition: 'Forced half-bet posted before cards are dealt. Worst postflop position because you act first on every street. Should raise or fold, rarely limp.' },
      { term: 'BB (Big Blind)', definition: 'Forced full bet posted before cards are dealt. Defends wider than other positions because you already have money invested. Closes the preflop action.' },
    ],
  },
  {
    title: 'Preflop Actions',
    terms: [
      { term: 'Fold', definition: 'Discard your hand and forfeit the pot. Costs nothing beyond any blinds already posted.' },
      { term: 'Limp', definition: 'Calling the big blind preflop without raising. Generally considered a weak play because it doesn\'t build the pot or narrow opponents\' ranges.' },
      { term: 'Open Raise', definition: 'The first raise preflop, typically 2.5-3x the big blind. Opens the pot and narrows the field.' },
      { term: 'Call', definition: 'Matching the current bet to stay in the hand without raising.' },
      { term: '3-Bet', definition: 'A re-raise over an initial raise. The blinds are the "first bet," the open raise is the "second bet," and the re-raise is the "third bet." Used for value with strong hands or as a bluff.' },
      { term: '4-Bet', definition: 'A raise over a 3-bet. Usually indicates a very strong hand (QQ+, AK) or a bold bluff.' },
      { term: 'All-In (Shove)', definition: 'Betting all your remaining chips. Common in short-stack situations (under 25bb) or with premium hands.' },
      { term: 'Squeeze', definition: 'A 3-bet made when there has been a raise and one or more callers. Exploits the dead money from the callers.' },
    ],
  },
  {
    title: 'Postflop Actions & Bet Sizing',
    terms: [
      { term: 'Check', definition: 'Passing the action without betting when no bet is facing you. Doesn\'t forfeit the hand.' },
      { term: 'Bet', definition: 'Placing chips into the pot when no one has bet yet on the current street.' },
      { term: 'Raise', definition: 'Increasing the size of an existing bet on the current street.' },
      { term: 'C-Bet (Continuation Bet)', definition: 'A bet made on the flop by the preflop raiser, "continuing" the aggression. Effective on dry boards that favor the raiser\'s range.' },
      { term: '1/3 Pot Bet', definition: 'A small bet sizing. Used as a range bet on boards that favor you, or for thin value. Gives opponents a cheap price to continue.' },
      { term: '1/2 Pot Bet', definition: 'A medium bet sizing. The most common bet size. Balances value and protection.' },
      { term: '2/3 Pot Bet', definition: 'A larger bet sizing. Indicates a polarized range — either strong hands or bluffs. Charges draws more to continue.' },
      { term: 'Pot Bet', definition: 'A bet equal to the current pot size. A very large bet that puts maximum pressure on opponents.' },
      { term: 'Overbet', definition: 'A bet larger than the pot. Represents extreme strength or a bold bluff. Used on specific board textures.' },
      { term: 'Donk Bet', definition: 'A bet from out of position into the preflop aggressor. Named because it\'s often done by inexperienced players, but can be strategic.' },
    ],
  },
  {
    title: 'Key Concepts',
    terms: [
      { term: 'Pot Odds', definition: 'The ratio of the current pot to the cost of calling. Calculated as: Call Amount / (Pot + Call Amount). If your equity exceeds pot odds, calling is profitable.' },
      { term: 'Implied Odds', definition: 'The additional money you expect to win on future streets if you hit your draw. Justifies calls that don\'t have direct pot odds if you\'ll win a big pot when you hit.' },
      { term: 'Equity', definition: 'Your percentage chance of winning the pot. If you have 30% equity, you\'ll win the pot roughly 30% of the time at showdown.' },
      { term: 'Expected Value (EV)', definition: 'The average profit/loss of a decision over many repetitions. +EV means profitable long-term, -EV means losing long-term. The goal is to make +EV decisions.' },
      { term: 'Outs', definition: 'Cards remaining in the deck that will improve your hand. For example, with four hearts, there are 9 remaining hearts (outs) to complete your flush.' },
      { term: 'Rule of 4 and 2', definition: 'A shortcut to estimate equity from outs. On the flop (two cards to come), multiply outs by 4. On the turn (one card to come), multiply by 2. Example: 9 outs on the flop = ~36% equity.' },
      { term: 'GTO (Game Theory Optimal)', definition: 'A mathematically balanced strategy that cannot be exploited. GTO ranges are a baseline; in practice, players deviate to exploit opponents\' mistakes.' },
      { term: 'Range', definition: 'All possible hands a player could have in a given situation. Instead of putting someone on one hand, think about their entire range of possible holdings.' },
      { term: 'Equity Realization', definition: 'How much of your theoretical equity you actually capture. Hands in position realize more equity because you control the pot better. Suited connectors realize more equity than offsuit hands.' },
      { term: 'Fold Equity', definition: 'The value gained from the chance your opponent folds to your bet. Semi-bluffs combine fold equity with drawing equity.' },
    ],
  },
  {
    title: 'Board Texture',
    terms: [
      { term: 'Dry Board', definition: 'A flop with no draws possible — unpaired, unconnected, rainbow (three different suits). Example: K♠ 7♦ 2♣. Favors the preflop raiser. Good for c-bets.' },
      { term: 'Semi-Wet Board', definition: 'A flop with one draw possibility — either a flush draw or a straight draw, but not both. Example: K♠ T♦ 6♠. Selective c-bets work here.' },
      { term: 'Wet Board', definition: 'A flop with multiple draws — connected cards, flush draws, and/or straight draws. Example: J♥ T♥ 8♣. Favors the caller\'s range. Caution with c-bets.' },
      { term: 'Rainbow', definition: 'A board with three (or four) different suits, meaning no flush draw is possible.' },
      { term: 'Monotone', definition: 'A board where all cards are the same suit (e.g., A♥ 9♥ 4♥). Very wet — flush already possible.' },
      { term: 'Paired Board', definition: 'A board with two cards of the same rank (e.g., 8♠ 8♦ 3♣). Reduces the number of possible holdings, often favors the preflop raiser.' },
    ],
  },
  {
    title: 'Hand Categories',
    terms: [
      { term: 'Pocket Pair', definition: 'Two hole cards of the same rank (e.g., 8♠ 8♥). Small pairs (22-66) are speculative; medium pairs (77-TT) are playable; big pairs (JJ-AA) are premium.' },
      { term: 'Suited Connectors', definition: 'Two sequential cards of the same suit (e.g., 8♥ 7♥). Valuable because they can make straights and flushes. Play best in position with deep stacks.' },
      { term: 'Broadway Cards', definition: 'Cards Ten through Ace (T, J, Q, K, A). "Suited broadways" like K♠ J♠ are strong hands that make top pairs and strong draws.' },
      { term: 'Suited Aces (Wheel Aces)', definition: 'An Ace with a small suited card (e.g., A♥ 4♥). A5s-A2s are used as 3-bet bluffs because they block opponents\' strong aces and have nut flush potential.' },
      { term: 'Offsuit', definition: 'Two hole cards of different suits (e.g., A♠ K♥). Denoted with "o" in hand notation (AKo). Less valuable than suited equivalents because they can\'t make flushes.' },
      { term: 'Suited', definition: 'Two hole cards of the same suit (e.g., A♠ K♠). Denoted with "s" in hand notation (AKs). Adds ~3-4% equity preflop over the offsuit version.' },
      { term: 'Dominated Hand', definition: 'A hand that shares one card with an opponent\'s hand but has a weaker kicker. Example: A♠ 9♥ is dominated by A♠ K♥. When the shared card pairs, the dominated hand loses to the kicker.' },
    ],
  },
  {
    title: 'Drawing Terms',
    terms: [
      { term: 'Flush Draw', definition: 'Four cards of the same suit, needing one more for a flush. 9 outs. Hits ~35% from flop to river, ~20% from turn to river.' },
      { term: 'Open-Ended Straight Draw (OESD)', definition: 'Four consecutive cards needing one on either end. Example: 8-7-6-5 can hit a 9 or a 4. 8 outs. Hits ~31.5% flop to river.' },
      { term: 'Gutshot (Inside Straight Draw)', definition: 'Four cards needing one specific middle card. Example: 9-8-_-6-5 needs a 7. 4 outs. Hits ~16.5% flop to river.' },
      { term: 'Combo Draw', definition: 'Multiple draws combined, e.g., flush draw + straight draw. 12-15 outs. Makes you a statistical favorite even against made hands.' },
      { term: 'Backdoor Draw', definition: 'A draw that needs two more cards to complete (needing runner-runner). Example: two hearts in hand with one on the flop. Adds ~4% equity.' },
      { term: 'Semi-Bluff', definition: 'Betting or raising with a drawing hand that isn\'t the best hand yet. Profitable because you can win by opponents folding (fold equity) or by completing your draw.' },
      { term: 'Overcards', definition: 'Hole cards higher than any card on the board. Example: A♠ K♥ on a 9♦ 7♣ 2♠ board. Each overcard has 3 outs to pair (6 total).' },
    ],
  },
  {
    title: 'Advanced Concepts',
    terms: [
      { term: 'Blockers', definition: 'Cards in your hand that reduce the likelihood of your opponent holding certain hands. Example: holding A♠ means your opponent is less likely to have the nut flush in spades.' },
      { term: 'Range Advantage', definition: 'When one player\'s overall range of hands is stronger on a given board. Example: on A-K-Q, the preflop raiser has range advantage because their range has more strong aces and broadways.' },
      { term: 'Position Advantage', definition: 'The benefit of acting last in a hand. The player in position sees opponents\' actions before deciding, allowing better information-based decisions.' },
      { term: 'Polarized Range', definition: 'A betting range that consists of very strong hands (value) and bluffs, with few medium-strength hands. Large bet sizes tend to be polarizing.' },
      { term: 'Merged/Linear Range', definition: 'A betting range that includes strong and medium-strength hands, but few bluffs. Smaller bet sizes tend to be merged.' },
      { term: 'Thin Value', definition: 'Betting for value with a hand that only barely beats your opponent\'s calling range. Requires good hand-reading to be profitable.' },
      { term: 'Showdown Value', definition: 'A hand strong enough to win at showdown without betting. These hands prefer checking because betting folds out worse hands and gets called by better.' },
      { term: 'ICM (Independent Chip Model)', definition: 'A model used in tournaments to calculate the real-money value of your chip stack. Affects strategy: you should play tighter near pay jumps because chip loss hurts more than chip gain helps.' },
      { term: 'Stack-to-Pot Ratio (SPR)', definition: 'The ratio of the effective stack to the pot after the flop. Low SPR (<4) favors big pairs; high SPR (>10) favors speculative hands like suited connectors.' },
      { term: 'Pot Control', definition: 'Deliberately keeping the pot small with medium-strength hands. Achieved by checking instead of betting, especially out of position.' },
    ],
  },
  {
    title: 'Common Shorthand',
    terms: [
      { term: 'AKs / AKo', definition: '"s" = suited (same suit), "o" = offsuit (different suits). AK with no suffix means both.' },
      { term: 'bb', definition: 'Big blinds. The standard unit for measuring stack sizes and bets (e.g., "100bb deep" or "raise to 3bb").' },
      { term: '6-Max / 9-Max', definition: 'Table size. 6-Max has 6 seats (more action, wider ranges). 9-Max has 9 seats (tighter, more positional play).' },
      { term: 'IP / OOP', definition: 'In Position / Out of Position. IP means you act after your opponent; OOP means you act first.' },
      { term: 'Villain', definition: 'Your opponent in a hand. "Hero" refers to you.' },
      { term: 'Nit', definition: 'A very tight player who only plays premium hands.' },
      { term: 'LAG / TAG', definition: 'Loose-Aggressive / Tight-Aggressive. Player styles defined by how many hands they play (loose/tight) and how they play them (aggressive/passive).' },
    ],
  },
];

export function Glossary({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const lowerSearch = search.toLowerCase();
  const filtered = search
    ? GLOSSARY.map(section => ({
        ...section,
        terms: section.terms.filter(
          t => t.term.toLowerCase().includes(lowerSearch) || t.definition.toLowerCase().includes(lowerSearch)
        ),
      })).filter(s => s.terms.length > 0)
    : GLOSSARY;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg-primary)',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 480,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Poker Glossary</h2>
        <button
          className="btn btn-ghost btn-small"
          onClick={onClose}
          style={{ fontSize: 18, padding: '6px 12px' }}
        >
          ✕
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
        {filtered.map((section, sIdx) => {
          const isExpanded = search.length > 0 || expandedSection === sIdx;
          return (
            <div key={sIdx} style={{ marginBottom: 8 }}>
              <button
                onClick={() => setExpandedSection(isExpanded && !search ? null : sIdx)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid var(--border-color)',
                  color: 'var(--gold)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span>{section.title}</span>
                <span style={{
                  fontSize: 12,
                  color: 'var(--text-dim)',
                  transition: 'transform 0.2s',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}>
                  ▸
                </span>
              </button>

              {isExpanded && (
                <div style={{ paddingTop: 4 }}>
                  {section.terms.map((term, tIdx) => (
                    <div key={tIdx} style={{
                      padding: '10px 0',
                      borderBottom: tIdx < section.terms.length - 1 ? '1px solid rgba(42,42,74,0.5)' : 'none',
                    }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: 3,
                      }}>
                        {highlightMatch(term.term, search)}
                      </div>
                      <div style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                      }}>
                        {highlightMatch(term.definition, search)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
            No terms found for "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

function highlightMatch(text: string, search: string): React.ReactNode {
  if (!search) return text;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ background: 'rgba(212,165,67,0.3)', borderRadius: 2, padding: '0 1px' }}>
        {text.slice(idx, idx + search.length)}
      </span>
      {text.slice(idx + search.length)}
    </>
  );
}
