import React, { useState } from 'react';
import { Sparkles, ArrowRight, CornerDownRight } from 'lucide-react';

interface RefinementBarProps {
  onRefine: (refinementPrompt: string) => void;
  isLoading: boolean;
}

const REFINEMENT_PRESETS = [
  'Make cards more advanced',
  'Add 2 more edge-case questions',
  'Simplify explanations for beginners',
  'Focus on real-world debugging scenarios',
];

export const RefinementBar: React.FC<RefinementBarProps> = ({ onRefine, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onRefine(input.trim());
    setInput('');
  };

  return (
    <div className="refinement-bar-container">
      <div className="refinement-header">
        <div className="refinement-tag">
          <CornerDownRight size={14} />
          <span>Refinement Loop (Follow-Up Prompts)</span>
        </div>
        <span className="refinement-hint">Edit or expand this deck without losing your progress</span>
      </div>

      <form onSubmit={handleSubmit} className="refinement-input-row">
        <div className="refinement-input-wrap">
          <Sparkles size={16} className="refine-icon" />
          <input
            type="text"
            className="refinement-input"
            placeholder="e.g. 'Add 2 more questions on concurrency', 'Make questions harder'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="btn-refine-submit"
          disabled={!input.trim() || isLoading}
        >
          <span>{isLoading ? 'Refining...' : 'Refine Deck'}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="refinement-chips">
        {REFINEMENT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="refine-chip"
            onClick={() => onRefine(preset)}
            disabled={isLoading}
          >
            + {preset}
          </button>
        ))}
      </div>
    </div>
  );
};
