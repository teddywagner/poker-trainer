import { useState, useEffect } from 'react';
import { PreflopTrainer } from './features/preflop/PreflopTrainer';
import { PostflopTrainer } from './features/postflop/PostflopTrainer';
import { QuizHub } from './features/quiz/QuizHub';
import { StatsPage } from './features/stats/StatsPage';
import { HandReview } from './features/history/HandReview';
import { Glossary } from './components/Glossary';

type Tab = 'preflop' | 'postflop' | 'quiz' | 'review' | 'stats';

const ONBOARDING_KEY = 'poker-trainer-onboarded';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('preflop');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showGlossary, setShowGlossary] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  };

  return (
    <div className="app">
      {/* Glossary help button */}
      <button
        onClick={() => setShowGlossary(true)}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 100,
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--gold)',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Poker Glossary"
      >
        ?
      </button>

      <div className="app-content">
        {activeTab === 'preflop' && <PreflopTrainer />}
        {activeTab === 'postflop' && <PostflopTrainer />}
        {activeTab === 'quiz' && <QuizHub />}
        {activeTab === 'review' && <HandReview />}
        {activeTab === 'stats' && <StatsPage />}
      </div>

      {/* Glossary Overlay */}
      {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <NavItem icon="&#x1F0CF;" label="Preflop" active={activeTab === 'preflop'} onClick={() => setActiveTab('preflop')} />
        <NavItem icon="&#x1F3AF;" label="Scenarios" active={activeTab === 'postflop'} onClick={() => setActiveTab('postflop')} />
        <NavItem icon="&#x1F4CA;" label="Quizzes" active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
        <NavItem icon="&#x1F4DD;" label="Review" active={activeTab === 'review'} onClick={() => setActiveTab('review')} />
        <NavItem icon="&#x1F4C8;" label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
      </nav>

      {/* Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding step={onboardingStep} onNext={() => {
          if (onboardingStep >= 3) finishOnboarding();
          else setOnboardingStep(s => s + 1);
        }} onSkip={finishOnboarding} />
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="nav-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      <span>{label}</span>
    </button>
  );
}

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Poker Trainer',
    body: 'Learn Texas Hold\'em through interactive scenarios and probability games. Train your preflop decisions, postflop play, and poker math.',
  },
  {
    title: 'Preflop Trainer',
    body: 'Practice opening ranges by position. You\'ll see random hole cards and must decide: Fold, Call, Raise, 3-Bet, or All-In. Get instant feedback based on GTO-approximate ranges.',
  },
  {
    title: 'Postflop Scenarios',
    body: 'Face realistic postflop decisions: continuation bets, drawing hands, value betting, and bluffing spots. Learn pot odds, board texture reading, and bet sizing.',
  },
  {
    title: 'Quizzes & Stats',
    body: 'Test your knowledge with odds quizzes, outs counting, hand ranking drills, and pot odds calculations. Track your progress over time in the Stats tab.',
  },
];

function Onboarding({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const data = ONBOARDING_STEPS[step];
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div style={{ marginBottom: 16 }}>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {ONBOARDING_STEPS.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? 'var(--gold)' : 'var(--border-color)',
                transition: 'background 0.2s',
              }} />
            ))}
          </div>
        </div>
        <h2>{data.title}</h2>
        <p>{data.body}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onSkip}>
            Skip
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onNext}>
            {step >= 3 ? 'Start Training' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
