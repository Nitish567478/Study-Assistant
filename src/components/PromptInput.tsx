import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  XCircle,
  CornerDownLeft,
} from 'lucide-react';

export interface PromptInputProps {
  onSubmit: (
    prompt: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  ) => void;
  isLoading: boolean;
  initialValue?: string;
  initialDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

const SAMPLE_TOPICS = [
  {
    icon: '⚛️',
    label: 'React Hooks & State',
    text: 'React useState lifecycle, useEffect dependencies, stale closures in asynchronous callbacks, and useRef for mutable request identifiers.',
  },
  {
    icon: '🌿',
    label: 'Photosynthesis',
    text: 'Photosynthesis light-dependent reactions in the thylakoid membrane, ATP synthase, Calvin cycle in the stroma, and carbon fixation.',
  },
  {
    icon: '🐳',
    label: 'Docker & Kubernetes',
    text: 'Docker containerization fundamentals vs Kubernetes orchestration: Pods, Services, Ingress controllers, and automated scaling.',
  },
  {
    icon: '🧠',
    label: 'Neural Networks',
    text: 'Feedforward neural networks, backpropagation calculus, gradient descent optimization, activation functions (ReLU, GELU), and loss minimization.',
  },
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading,
  initialValue = '',
  initialDifficulty = 'Intermediate',
}) => {
  const [input, setInput] = useState(initialValue);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(initialDifficulty);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim(), difficulty);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit(input.trim(), difficulty);
      }
    }
  };

  const handleSelectSample = (text: string) => {
    setInput(text);
  };

  return (
    <div className="clean-home-wrapper">
      <div className="clean-hero-section">
        <div className="clean-hero-badge">
          <Sparkles size={14} className="hero-sparkle-icon" />
          <span>Interactive AI Study Studio</span>
        </div>
        <h1 className="clean-hero-title">
          Turn your notes into{' '}
          <span className="clean-hero-gradient">interactive mastery</span>
        </h1>
        <p className="clean-hero-subtitle">
          Paste lecture notes, book excerpts, or any topic. Study Assistant synthesizes
          interactive 3D flashcards and active-recall quizzes in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="clean-input-card">
        <div className="clean-card-header">
          <div className="clean-difficulty-group">
            <span id="target-diff-label" className="clean-section-tag">Target Difficulty:</span>
            <div className="clean-difficulty-pills" role="radiogroup" aria-labelledby="target-diff-label">
              <button
                type="button"
                className={`clean-diff-btn ${difficulty === 'Beginner' ? 'diff-active' : ''}`}
                onClick={() => setDifficulty('Beginner')}
                role="radio"
                aria-checked={difficulty === 'Beginner'}
              >
                <span className="diff-emoji">🌱</span>
                <span>Beginner</span>
              </button>

              <button
                type="button"
                className={`clean-diff-btn ${difficulty === 'Intermediate' ? 'diff-active' : ''}`}
                onClick={() => setDifficulty('Intermediate')}
                role="radio"
                aria-checked={difficulty === 'Intermediate'}
              >
                <span className="diff-emoji">⚡</span>
                <span>Intermediate</span>
              </button>

              <button
                type="button"
                className={`clean-diff-btn ${difficulty === 'Advanced' ? 'diff-active' : ''}`}
                onClick={() => setDifficulty('Advanced')}
                role="radio"
                aria-checked={difficulty === 'Advanced'}
              >
                <span className="diff-emoji">🔥</span>
                <span>Advanced</span>
              </button>
            </div>
          </div>

          {input.length > 0 && (
            <button
              type="button"
              className="clean-clear-btn"
              onClick={() => setInput('')}
              title="Clear text"
              aria-label="Clear input text"
            >
              <XCircle size={14} aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className="clean-textarea-container">
          <textarea
            id="clean-notes-input"
            className="clean-textarea"
            placeholder="Paste your notes or enter a topic (e.g. 'React Hooks and State Architecture', 'Photosynthesis', 'Quantum Computing')..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 450)}px`;
            }}
            onKeyDown={handleKeyDown}
            rows={6}
            disabled={isLoading}
            autoFocus
            required
            aria-label="Study notes or topic input"
          />
        </div>

        <div className="clean-card-footer">
          <div className="clean-footer-hint">
            <CornerDownLeft size={13} />
            <span>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to generate</span>
          </div>

          <div className="clean-footer-actions">
            {input.length > 0 && (
              <span className="clean-char-counter">{input.length} characters</span>
            )}
            <button
              type="submit"
              className="clean-submit-btn"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Zap size={16} className="animate-spin" />
                  <span>Synthesizing Deck...</span>
                </>
              ) : (
                <>
                  <span>Generate Study Deck</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="clean-samples-tray">
        <span className="clean-samples-label">Quick Suggestions:</span>
        <div className="clean-samples-chips">
          {SAMPLE_TOPICS.map((topic) => (
            <button
              key={topic.label}
              type="button"
              className="clean-chip-btn"
              onClick={() => handleSelectSample(topic.text)}
              disabled={isLoading}
            >
              <span className="chip-icon">{topic.icon}</span>
              <span className="chip-text">{topic.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
