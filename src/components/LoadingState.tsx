import React, { useEffect, useState } from 'react';
import { Loader2, XCircle, BrainCircuit, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
  topicSnippet?: string;
}

const STEPS = [
  { label: 'Dispatching payload to secure backend proxy...', duration: 800 },
  { label: 'Enforcing strict JSON schema prompt with AI model...', duration: 1600 },
  { label: 'Validating response shape and preventing malformed structures...', duration: 2500 },
  { label: 'Generating 3D interactive flashcards and quiz matrix...', duration: 9999 },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel, topicSnippet }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="loading-state-card">
      <div className="loading-orbit-wrapper">
        <div className="loading-orbit">
          <BrainCircuit className="orbiting-core-icon" size={32} />
        </div>
        <div className="loading-pulse-ring"></div>
      </div>

      <h3 className="loading-title">Synthesizing Interactive Deck</h3>
      {topicSnippet && (
        <p className="loading-snippet">
          Analyzing: &ldquo;{topicSnippet.slice(0, 80)}{topicSnippet.length > 80 ? '...' : ''}&rdquo;
        </p>
      )}

      <div className="loading-steps-list">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={step.label}
              className={`loading-step-item ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : 'step-pending'}`}
            >
              <div className="step-indicator">
                {isDone ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin text-indigo-400" />
                ) : (
                  <div className="step-dot" />
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          );
        })}
      </div>

      <div className="loading-footer">
        <div className="elapsed-badge">
          <ShieldCheck size={14} />
          <span>Elapsed time: {elapsedSeconds}s</span>
        </div>

        {onCancel && (
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            title="Cancel ongoing AI request"
          >
            <XCircle size={16} />
            <span>Cancel Request</span>
          </button>
        )}
      </div>

      {elapsedSeconds > 15 && (
        <div className="loading-slow-notice">
          The upstream model is taking longer than usual. The app will auto-timeout at 45s or you can cancel above.
        </div>
      )}
    </div>
  );
};
