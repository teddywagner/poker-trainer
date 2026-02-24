import { useState, useCallback } from 'react';
import { PostflopAction } from '../../core/types';
import { generatePostflopScenario, scenarioTypeDisplay, actionDisplay, classifyBoardTexture, getCommonDrawInfo } from '../../core/postflop';
import { CardView, CardGroup } from '../../components/CardView';
import { Feedback } from '../../components/Feedback';
import { ScoreBar } from '../../components/ScoreBar';

type ScenarioData = ReturnType<typeof generatePostflopScenario>;

export function PostflopTrainer() {
  const [scenario, setScenario] = useState<ScenarioData | null>(null);
  const [currentStreet, setCurrentStreet] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    userAction: string;
    recommended: PostflopAction;
    explanation: string;
  } | null>(null);
  const [streetResults, setStreetResults] = useState<Array<{
    correct: boolean;
    userAction: string;
    recommended: string;
    explanation: string;
  }>>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });

  const dealNewScenario = useCallback(() => {
    const s = generatePostflopScenario();
    setScenario(s);
    setCurrentStreet(0);
    setFeedback(null);
    setStreetResults([]);
    setShowSummary(false);
  }, []);

  const handleAction = (action: PostflopAction) => {
    if (!scenario || feedback) return;
    const street = scenario.streets[currentStreet];
    if (!street) return;

    const isCorrect = checkPostflopCorrectness(action, street.recommendedAction);
    const fb = {
      correct: isCorrect,
      userAction: actionDisplay(action),
      recommended: street.recommendedAction,
      explanation: street.explanation,
    };
    setFeedback(fb);
    setStreetResults(prev => [...prev, {
      correct: isCorrect,
      userAction: actionDisplay(action),
      recommended: actionDisplay(street.recommendedAction),
      explanation: street.explanation,
    }]);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
  };

  const nextStreet = () => {
    if (!scenario) return;
    if (currentStreet + 1 >= scenario.streets.length || feedback?.recommended === 'fold') {
      setShowSummary(true);
    } else {
      setCurrentStreet(prev => prev + 1);
      setFeedback(null);
    }
  };

  function checkPostflopCorrectness(user: PostflopAction, rec: PostflopAction): boolean {
    if (user === rec) return true;
    // Bet sizes are somewhat flexible
    const betActions: PostflopAction[] = ['bet_third', 'bet_half', 'bet_twothirds', 'bet_pot', 'bet_overbet'];
    if (betActions.includes(user) && betActions.includes(rec)) {
      const ui = betActions.indexOf(user);
      const ri = betActions.indexOf(rec);
      return Math.abs(ui - ri) <= 1;
    }
    return false;
  }

  const currentDecision = scenario?.streets[currentStreet];

  const getActions = (): PostflopAction[] => {
    if (!currentDecision) return [];
    if (currentDecision.facingBet > 0) {
      return ['fold', 'call', 'raise'];
    }
    return ['check', 'bet_third', 'bet_half', 'bet_twothirds', 'bet_pot'];
  };

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Postflop Scenarios</h2>

      <ScoreBar correct={score.correct} total={score.total} streak={score.streak} />

      {!scenario ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14, lineHeight: 1.6 }}>
            Practice postflop decision-making through realistic scenarios.
            You'll face c-bet decisions, drawing spots, value betting, and more.
          </p>
          <button className="btn btn-primary btn-large" onClick={dealNewScenario}>
            Start Scenario
          </button>
        </div>
      ) : showSummary ? (
        <HandSummary scenario={scenario} results={streetResults} onNext={dealNewScenario} />
      ) : currentDecision ? (
        <>
          {/* Scenario Type Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="tag tag-strong">{scenarioTypeDisplay(scenario.scenarioType)}</span>
            <span style={{ fontSize: 13, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              {currentDecision.street}
            </span>
          </div>

          {/* Table Area */}
          <div className="table-area" style={{ marginBottom: 16 }}>
            {/* Hole Cards */}
            <div style={{ marginBottom: 14 }}>
              <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Your Hand</div>
              <div className="card-group">
                <CardView card={scenario.holeCards[0]} size="large" delay={0} />
                <CardView card={scenario.holeCards[1]} size="large" delay={1} />
              </div>
            </div>

            {/* Board */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className="section-header" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>Board</div>
                <span className={`texture-tag texture-${currentDecision.boardTexture}`}>
                  {currentDecision.boardTexture}
                </span>
              </div>
              <CardGroup cards={currentDecision.board} delay={3} />
            </div>

            {/* Pot & Bet Info */}
            <div className="pot-display">
              <span className="pot-chips">
                Pot: {currentDecision.potSize.toFixed(1)}bb
              </span>
            </div>
            {currentDecision.facingBet > 0 && (
              <div style={{ textAlign: 'center', marginTop: 6, fontSize: 14, color: '#e74c3c', fontWeight: 600 }}>
                Facing bet: {currentDecision.facingBet.toFixed(1)}bb
              </div>
            )}

            {/* Hand Strength */}
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              {currentDecision.handResult.description}
              {currentDecision.outs > 0 && ` \u2022 ${currentDecision.outs} outs`}
            </div>
          </div>

          {/* Action Buttons */}
          {!feedback && (
            <div className="action-grid slide-up">
              {getActions().map(action => (
                <button
                  key={action}
                  className={`btn ${getActionButtonClass(action)}`}
                  onClick={() => handleAction(action)}
                >
                  {actionDisplay(action)}
                  {action === 'call' && currentDecision.facingBet > 0 && (
                    <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 4 }}>
                      {currentDecision.facingBet.toFixed(1)}bb
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Feedback
                correct={feedback.correct}
                title={feedback.correct ? 'Good play!' : `Better: ${actionDisplay(feedback.recommended)}`}
                message={feedback.explanation}
                details={
                  currentDecision.facingBet > 0 && currentDecision.outs > 0 && (
                    <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.6 }}>
                      <div>Pot odds: {(currentDecision.potOdds * 100).toFixed(1)}% needed</div>
                      <div>Your equity: ~{(currentDecision.equity * 100).toFixed(1)}%</div>
                      {(() => {
                        const drawInfo = getCommonDrawInfo(currentDecision.outs);
                        if (drawInfo) return <div>Draw: {drawInfo.name}</div>;
                        return null;
                      })()}
                    </div>
                  )
                }
              />
              <button className="btn btn-primary btn-block" onClick={nextStreet}>
                {currentStreet + 1 >= scenario.streets.length || feedback.recommended === 'fold'
                  ? 'See Summary'
                  : `Next: ${currentStreet === 0 ? 'Turn' : 'River'}`}
              </button>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function HandSummary({ scenario, results, onNext }: {
  scenario: ScenarioData;
  results: Array<{ correct: boolean; userAction: string; recommended: string; explanation: string }>;
  onNext: () => void;
}) {
  const correctCount = results.filter(r => r.correct).length;
  const streetNames = ['Flop', 'Turn', 'River'];

  return (
    <div className="slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="panel" style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 18, color: 'var(--gold)', marginBottom: 8 }}>Hand Complete</h3>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {correctCount}/{results.length} correct decisions
        </div>
        <div className="progress-bar" style={{ marginTop: 10, height: 8 }}>
          <div
            className={`progress-fill ${correctCount === results.length ? 'good' : correctCount > 0 ? 'warning' : 'bad'}`}
            style={{ width: `${(correctCount / results.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Board recap */}
      <div className="table-area" style={{ padding: 14 }}>
        <div className="card-group" style={{ marginBottom: 8 }}>
          <CardView card={scenario.holeCards[0]} size="small" />
          <CardView card={scenario.holeCards[1]} size="small" />
          <div style={{ width: 8 }} />
          {scenario.streets[scenario.streets.length - 1]?.board.map((card, i) => (
            <CardView key={i} card={card} size="small" />
          ))}
        </div>
      </div>

      {/* Street-by-street review */}
      {results.map((result, i) => (
        <div key={i} className={`feedback-panel ${result.correct ? 'correct' : 'incorrect'}`}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: result.correct ? 'var(--green)' : 'var(--red)' }}>
            {result.correct ? '\u2714' : '\u2718'} {streetNames[i] || `Street ${i + 1}`}: You chose {result.userAction}
            {!result.correct && <span style={{ fontWeight: 400 }}> (optimal: {result.recommended})</span>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {result.explanation}
          </div>
        </div>
      ))}

      <button className="btn btn-primary btn-block btn-large" onClick={onNext}>
        Next Scenario
      </button>
    </div>
  );
}

function getActionButtonClass(action: PostflopAction): string {
  switch (action) {
    case 'fold': return 'btn-danger';
    case 'check': return 'btn-secondary';
    case 'call': return 'btn-success';
    case 'raise': return 'btn-success';
    default: return 'btn-primary';
  }
}
