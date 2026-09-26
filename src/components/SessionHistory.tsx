import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Trash2,
  BookOpen,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { StudyDeckResult } from '../types/result';

export interface SavedSession {
  id: string;
  savedAt: string;
  deck: StudyDeckResult;
}

interface SessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SavedSession[];
  onSelectSession: (session: SavedSession) => void;
  onDeleteSession: (id: string) => void;
  onReloadStarterDecks?: () => void;
  onClearAllSessions?: () => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
  onReloadStarterDecks,
  onClearAllSessions,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      s.deck.title.toLowerCase().includes(query) ||
      s.deck.topic.toLowerCase().includes(query) ||
      s.deck.summary.toLowerCase().includes(query)
    );
  });

  const handleExportJson = (deck: StudyDeckResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  const handleViewAllData = (session: SavedSession) => {
    onSelectSession(session);
    onClose();
  };

  return (
    <div className="session-history-overlay" onClick={onClose}>
      <div className="session-history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <BookOpen size={18} />
            </div>
            <div>
              <h3>Study Library & History</h3>
              <p className="modal-subtitle">
                {sessions.length} saved {sessions.length === 1 ? 'deck' : 'decks'} in your workspace
              </p>
            </div>
          </div>

          <div className="modal-top-actions">
            {sessions.length > 0 && onClearAllSessions && (
              <button
                type="button"
                className="btn-clear-history"
                onClick={onClearAllSessions}
                title="Clear all saved history"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close Library modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="modal-search-row">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="modal-search-input"
              placeholder="Search by topic, concept or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className="modal-body">
          {filteredSessions.length === 0 ? (
            <div className="empty-history-state">
              <Clock size={40} className="empty-icon" />
              <h4>{searchQuery ? 'No matching decks found' : 'Your Library is empty'}</h4>
              <p>
                {searchQuery
                  ? 'Try a different search query or clear the filter.'
                  : 'Study decks you generate will automatically be saved here so you can review them anytime.'}
              </p>

              {onReloadStarterDecks && (
                <button
                  type="button"
                  className="btn-load-starters"
                  onClick={onReloadStarterDecks}
                >
                  <Sparkles size={15} />
                  <span>Load Starter Sample Decks</span>
                </button>
              )}
            </div>
          ) : (
            <div className="sessions-list">
              {filteredSessions.map((session) => {
                const isExpanded = expandedSessionId === session.id;
                const deck = session.deck;

                return (
                  <div
                    key={session.id}
                    className={`session-item-card ${isExpanded ? 'session-card-expanded' : ''}`}
                  >
                    <div className="session-card-header">
                      <div className="session-meta">
                        <span className="session-topic-pill">{deck.topic}</span>
                        <span className="session-date">
                          {new Date(session.savedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="session-card-top-buttons">
                        <button
                          type="button"
                          className="btn-card-icon"
                          onClick={(e) => handleExportJson(deck, e)}
                          title="Export deck as JSON"
                          aria-label="Export JSON"
                        >
                          <Download size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-card-icon btn-card-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          title="Delete deck from library"
                          aria-label="Delete deck"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4
                      className="session-title"
                      onClick={() => handleViewAllData(session)}
                      title="Click to view all data in Studio"
                    >
                      {deck.title}
                    </h4>
                    <p className="session-summary">{deck.summary}</p>

                    <div className="session-counts">
                      <span className="count-pill">
                        <Layers size={13} />
                        <span>{deck.cards.length} Flashcards</span>
                      </span>
                      <span className="count-pill">
                        <HelpCircle size={13} />
                        <span>{deck.quiz.length} Quiz Questions</span>
                      </span>
                      <span className="count-pill">
                        <Clock size={13} />
                        <span>~{deck.estimatedStudyTimeMinutes} mins</span>
                      </span>
                    </div>

                    <div className="session-action-footer">
                      <button
                        type="button"
                        className="btn-view-all-data"
                        onClick={() => handleViewAllData(session)}
                        title="Open full interactive study deck (Flashcards & Quiz)"
                      >
                        <Eye size={15} />
                        <span>View All Data in Studio</span>
                      </button>

                      <button
                        type="button"
                        className="btn-preview-toggle"
                        onClick={(e) => toggleExpand(session.id, e)}
                        title={isExpanded ? 'Hide deck preview' : 'Quick preview cards & quiz'}
                      >
                        <span>{isExpanded ? 'Hide Preview' : 'Quick Preview'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="session-preview-accordion">
                        <div className="preview-section">
                          <h5 className="preview-section-title">
                            <Layers size={14} />
                            <span>Flashcards ({deck.cards.length})</span>
                          </h5>
                          <div className="preview-cards-list">
                            {deck.cards.map((card, idx) => (
                              <div key={card.id || idx} className="preview-card-item">
                                <div className="preview-card-kicker">Card #{idx + 1} &bull; {card.category || 'Concept'}</div>
                                <div className="preview-card-q">Q: {card.question}</div>
                                <div className="preview-card-a">A: {card.answer}</div>
                                {card.hint && <div className="preview-card-hint">Hint: {card.hint}</div>}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="preview-section">
                          <h5 className="preview-section-title">
                            <HelpCircle size={14} />
                            <span>Quiz Questions ({deck.quiz.length})</span>
                          </h5>
                          <div className="preview-quiz-list">
                            {deck.quiz.map((q, idx) => (
                              <div key={q.id || idx} className="preview-quiz-item">
                                <div className="preview-quiz-q">#{idx + 1}: {q.question}</div>
                                <div className="preview-quiz-options">
                                  {q.options.map((opt) => (
                                    <div
                                      key={opt.id}
                                      className={`preview-opt ${opt.id === q.correctOptionId ? 'preview-opt-correct' : ''}`}
                                    >
                                      <strong>{opt.id})</strong> {opt.text}
                                      {opt.id === q.correctOptionId && ' ✓ (Correct)'}
                                    </div>
                                  ))}
                                </div>
                                {q.explanation && (
                                  <div className="preview-quiz-exp">
                                    💡 {q.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="preview-load-bar">
                          <button
                            type="button"
                            className="btn-view-all-data-wide"
                            onClick={() => handleViewAllData(session)}
                          >
                            <span>Open & Study This Deck Now</span>
                            <Eye size={15} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
