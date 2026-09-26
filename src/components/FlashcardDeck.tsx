import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Keyboard,
  Award,
  Filter,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard } from '../types/result';
import { playCardFlipSound, playCorrectSound } from '../lib/sound';

interface FlashcardDeckProps {
  cards: Flashcard[];
  deckTitle?: string;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards: initialCards }) => {
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'needs_review'>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setCards(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setShowHint(false);
  }, [initialCards]);

  const activeCards = filterMode === 'needs_review'
    ? cards.filter((c) => !masteredIds.has(c.id))
    : cards;

  const safeIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[safeIndex];

  const handleFlip = useCallback(() => {
    playCardFlipSound();
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev < activeCards.length - 1 ? prev + 1 : 0));
  }, [activeCards.length]);

  const handlePrev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeCards.length - 1));
  }, [activeCards.length]);

  const toggleMastered = (cardId: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      const willBeMastered = !next.has(cardId);
      if (willBeMastered) {
        next.add(cardId);
        playCorrectSound();
        if (next.size === cards.length) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } else {
        next.delete(cardId);
      }
      return next;
    });
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window) || !currentCard) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = isFlipped ? currentCard.answer : currentCard.question;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!currentCard || activeCards.length === 0) {
    return (
      <div className="empty-deck-view">
        <Award size={48} className="text-emerald-400 mb-3" />
        <h3>All Flashcards Mastered!</h3>
        <p>You have marked all cards in this deck as mastered.</p>
        <button
          type="button"
          className="btn-primary-retry mt-4"
          onClick={() => {
            setFilterMode('all');
            setCurrentIndex(0);
          }}
        >
          Review All Cards Again
        </button>
      </div>
    );
  }

  const isCurrentMastered = masteredIds.has(currentCard.id);
  const progressPercent = Math.round((masteredIds.size / cards.length) * 100);

  return (
    <div className="flashcard-deck-wrapper">
      <div className="deck-controls-header">
        <div className="deck-stats">
          <span className="card-counter">
            Card <strong>{safeIndex + 1}</strong> of <strong>{activeCards.length}</strong>
          </span>
          <div className="deck-progress-bar-container" title={`${masteredIds.size} of ${cards.length} mastered`}>
            <div className="deck-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="mastered-count">
            {masteredIds.size}/{cards.length} Mastered ({progressPercent}%)
          </span>
        </div>

        <div className="deck-action-pills">
          <button
            type="button"
            className={`filter-pill-btn ${filterMode === 'needs_review' ? 'filter-active' : ''}`}
            onClick={() => {
              setFilterMode(filterMode === 'all' ? 'needs_review' : 'all');
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            title="Filter by unmastered cards"
          >
            <Filter size={14} />
            <span>{filterMode === 'needs_review' ? 'Showing Review Only' : 'Filter Needs Review'}</span>
          </button>

          <button
            type="button"
            className="deck-util-btn"
            onClick={handleShuffle}
            title="Shuffle deck cards"
          >
            <Shuffle size={14} />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      <div className="card-scene" onClick={handleFlip}>
        <div className={`card-object ${isFlipped ? 'is-flipped' : ''}`}>
          <div className="card-face card-front">
            <div className="card-face-header">
              <div className="card-category-badge">
                {currentCard.category || 'Core Concept'}
              </div>
              <div className="card-front-actions">
                <button
                  type="button"
                  className={`audio-btn ${isSpeaking ? 'audio-active' : ''}`}
                  onClick={handleSpeak}
                  title="Listen to question aloud"
                >
                  <Volume2 size={16} />
                </button>
                <div className={`mastery-status-dot ${isCurrentMastered ? 'dot-mastered' : 'dot-pending'}`} />
              </div>
            </div>

            <div className="card-body">
              <span className="card-prompt-label">QUESTION</span>
              <p className="card-question-text">{currentCard.question}</p>

              {currentCard.hint && (
                <div className="card-hint-wrapper" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="card-hint-btn"
                    onClick={() => setShowHint(!showHint)}
                    aria-expanded={showHint}
                    aria-label={showHint ? 'Hide hint' : 'Show hint'}
                  >
                    <Lightbulb size={14} className="hint-icon" aria-hidden="true" />
                    <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>
                  {showHint && <p className="hint-text">{currentCard.hint}</p>}
                </div>
              )}
            </div>

            <div className="card-face-footer">
              <div className="flip-instruction">
                <RotateCw size={14} className="spin-hover" />
                <span>Click or press <kbd>Space</kbd> to reveal answer</span>
              </div>
            </div>
          </div>

          <div className="card-face card-back">
            <div className="card-face-header">
              <div className="card-category-badge answer-badge">ANSWER & TAKEAWAYS</div>
              <button
                type="button"
                className={`audio-btn ${isSpeaking ? 'audio-active' : ''}`}
                onClick={handleSpeak}
                title="Listen to answer aloud"
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="card-body">
              <p className="card-answer-text">{currentCard.answer}</p>
            </div>

            <div className="card-face-footer back-footer">
              <div className="mastery-toggle-buttons" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className={`btn-mastery-tag ${isCurrentMastered ? 'active-mastered' : ''}`}
                  onClick={() => toggleMastered(currentCard.id)}
                >
                  <CheckCircle size={16} />
                  <span>{isCurrentMastered ? 'Mastered ✓' : 'Mark Mastered'}</span>
                </button>

                <button
                  type="button"
                  className={`btn-review-tag ${!isCurrentMastered ? 'active-review' : ''}`}
                  onClick={() => {
                    if (isCurrentMastered) toggleMastered(currentCard.id);
                  }}
                >
                  <HelpCircle size={16} />
                  <span>Needs Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="deck-navigation-bar">
        <button
          type="button"
          className="nav-btn prev-btn"
          onClick={handlePrev}
          title="Previous card (Left Arrow)"
        >
          <ChevronLeft size={20} />
          <span>Previous</span>
        </button>

        <button
          type="button"
          className="flip-center-btn"
          onClick={handleFlip}
          title="Flip card (Spacebar)"
        >
          <RotateCw size={16} />
          <span>{isFlipped ? 'Show Question' : 'Flip Card'}</span>
        </button>

        <button
          type="button"
          className="nav-btn next-btn"
          onClick={handleNext}
          title="Next card (Right Arrow)"
        >
          <span>Next</span>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="keyboard-shortcuts-guide">
        <Keyboard size={13} />
        <span>Keyboard shortcuts: <kbd>←</kbd> Prev &nbsp;|&nbsp; <kbd>Space</kbd> Flip &nbsp;|&nbsp; <kbd>→</kbd> Next</span>
      </div>
    </div>
  );
};
