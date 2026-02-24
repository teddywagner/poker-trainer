interface FeedbackProps {
  correct: boolean;
  title?: string;
  message: string;
  details?: React.ReactNode;
}

export function Feedback({ correct, title, message, details }: FeedbackProps) {
  return (
    <div className={`feedback-panel ${correct ? 'correct' : 'incorrect'}`}>
      <div className="feedback-title" style={{ color: correct ? 'var(--green)' : 'var(--red)' }}>
        {correct ? '\u2714' : '\u2718'} {title || (correct ? 'Correct!' : 'Incorrect')}
      </div>
      <div className="feedback-text">{message}</div>
      {details && <div style={{ marginTop: 10 }}>{details}</div>}
    </div>
  );
}
