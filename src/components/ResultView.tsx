import React, { useState } from 'react';
import {
  Layers,
  HelpCircle,
  Clock,
  ArrowLeft,
  Share2,
  Check,
  Download,
} from 'lucide-react';
import { ApiSuccessResponse } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizMode } from './QuizMode';
import { RefinementBar } from './RefinementBar';

interface ResultViewProps {
  resultMeta: ApiSuccessResponse;
  onReset: () => void;
  onRefine: (refinementPrompt: string) => void;
  isRefining: boolean;
}

type ViewMode = 'flashcards' | 'quiz';

export const ResultView: React.FC<ResultViewProps> = ({
  resultMeta,
  onReset,
  onRefine,
  isRefining,
}) => {
  const [mode, setMode] = useState<ViewMode>('flashcards');
  const [copied, setCopied] = useState(false);

  const deck = resultMeta.data;

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Study Assistant: "${deck.title}" with ${deck.cards.length} flashcards and ${deck.quiz.length} quiz questions!`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    let md = `# ${deck.title}\n\n`;
    md += `**Topic:** ${deck.topic} | **Estimated Study Time:** ${deck.estimatedStudyTimeMinutes} mins\n\n`;
    md += `## Summary\n${deck.summary}\n\n`;
    md += `## 🃏 Flashcards (${deck.cards.length})\n\n`;
    deck.cards.forEach((card, idx) => {
      md += `### Card ${idx + 1}: ${card.question}\n`;
      md += `**Answer:** ${card.answer}\n`;
      if (card.hint) md += `*Hint:* ${card.hint}\n`;
      md += `\n`;
    });
    md += `## 📝 Quiz Questions (${deck.quiz.length})\n\n`;
    deck.quiz.forEach((q, idx) => {
      md += `### Q${idx + 1}: ${q.question}\n`;
      q.options.forEach((opt) => {
        md += `- [${opt.id === q.correctOptionId ? 'x' : ' '}] ${opt.id}) ${opt.text}\n`;
      });
      md += `\n**Explanation:** ${q.explanation}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="result-container">
      <div className="deck-header-box">
        <div className="deck-nav-bar">
          <button type="button" className="btn-back" onClick={onReset}>
            <ArrowLeft size={15} />
            <span>Enter New Notes</span>
          </button>

          <div className="deck-action-buttons">
            <button
              type="button"
              className="action-icon-pill"
              onClick={handleShare}
              title="Share deck summary"
            >
              {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              className="action-icon-pill"
              onClick={handleExportMarkdown}
              title="Export as Markdown notes"
            >
              <Download size={14} />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        <div className="deck-main-details">
          <span className="deck-topic-tag">{deck.topic}</span>
          <h1 className="deck-main-title">{deck.title}</h1>
          <p className="deck-summary">{deck.summary}</p>
          <div className="deck-meta-info">
            <Clock size={13} />
            <span>~{deck.estimatedStudyTimeMinutes} min study session</span>
          </div>
        </div>

        <div className="mode-toggle-bar" role="tablist">
          <button
            type="button"
            className={`mode-btn ${mode === 'flashcards' ? 'mode-active' : ''}`}
            onClick={() => setMode('flashcards')}
            role="tab"
            aria-selected={mode === 'flashcards'}
          >
            <Layers size={17} />
            <span>Flashcards</span>
            <span className="mode-counter">{deck.cards.length}</span>
          </button>

          <button
            type="button"
            className={`mode-btn ${mode === 'quiz' ? 'mode-active' : ''}`}
            onClick={() => setMode('quiz')}
            role="tab"
            aria-selected={mode === 'quiz'}
          >
            <HelpCircle size={17} />
            <span>Interactive Quiz</span>
            <span className="mode-counter">{deck.quiz.length}</span>
          </button>
        </div>
      </div>

      <div className="active-mode-stage">
        {mode === 'flashcards' ? (
          <FlashcardDeck cards={deck.cards} deckTitle={deck.title} />
        ) : (
          <QuizMode questions={deck.quiz} topic={deck.topic} />
        )}
      </div>

      <RefinementBar onRefine={onRefine} isLoading={isRefining} />
    </div>
  );
};
