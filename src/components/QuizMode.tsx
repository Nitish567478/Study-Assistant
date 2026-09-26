import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types/result';
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '../lib/sound';

interface QuizModeProps {
  questions: QuizQuestion[];
  topic: string;
}

export const QuizMode: React.FC<QuizModeProps> = ({ questions: allQuestions, topic }) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(allQuestions);
  const [isRetestMode, setIsRetestMode] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setActiveQuestions(allQuestions);
    setIsRetestMode(false);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setAnswersMap({});
    setIsFinished(false);
  }, [allQuestions]);

  const currentQ = activeQuestions[currentIndex];

  const handleSelectOption = useCallback((optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionId(optId);
  }, [isAnswerSubmitted]);

  const handleSubmitAnswer = useCallback(() => {
    if (!selectedOptionId || isAnswerSubmitted || !currentQ) return;
    setIsAnswerSubmitted(true);
    setAnswersMap((prev) => ({
      ...prev,
      [currentQ.id]: selectedOptionId,
    }));

    if (selectedOptionId === currentQ.correctOptionId) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
  }, [selectedOptionId, isAnswerSubmitted, currentQ]);

  const handleNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      playCompletionSound();

      const totalScore = activeQuestions.reduce((acc, q) => {
        const chosen = answersMap[q.id] || selectedOptionId;
        return chosen === q.correctOptionId ? acc + 1 : acc;
      }, 0);
      const ratio = totalScore / activeQuestions.length;
      if (ratio >= 0.6) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  }, [currentIndex, activeQuestions, answersMap, selectedOptionId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (isFinished) return;

      if (!isAnswerSubmitted) {
        if (['1', 'a', 'A'].includes(e.key) && currentQ?.options[0]) {
          handleSelectOption(currentQ.options[0].id);
        } else if (['2', 'b', 'B'].includes(e.key) && currentQ?.options[1]) {
          handleSelectOption(currentQ.options[1].id);
        } else if (['3', 'c', 'C'].includes(e.key) && currentQ?.options[2]) {
          handleSelectOption(currentQ.options[2].id);
        } else if (['4', 'd', 'D'].includes(e.key) && currentQ?.options[3]) {
          handleSelectOption(currentQ.options[3].id);
        } else if (e.key === 'Enter' && selectedOptionId) {
          e.preventDefault();
          handleSubmitAnswer();
        }
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFinished, isAnswerSubmitted, currentQ, selectedOptionId, handleSelectOption, handleSubmitAnswer, handleNext]);

  const wrongQuestions = activeQuestions.filter(
    (q) => (answersMap[q.id] || (q.id === currentQ?.id ? selectedOptionId : null)) !== q.correctOptionId
  );

  const handleStartRetest = () => {
    if (wrongQuestions.length === 0) return;
    setActiveQuestions(wrongQuestions);
    setIsRetestMode(true);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setAnswersMap({});
    setIsFinished(false);
  };

  const handleRestartFull = () => {
    setActiveQuestions(allQuestions);
    setIsRetestMode(false);
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setAnswersMap({});
    setIsFinished(false);
  };

  if (activeQuestions.length === 0) {
    return (
      <div className="empty-deck-view">
        <HelpCircle size={40} className="text-indigo-400 mb-2" />
        <h3>No Quiz Questions Available</h3>
        <p>No questions generated for this deck.</p>
      </div>
    );
  }

  if (isFinished) {
    const correctCount = activeQuestions.filter(
      (q) => answersMap[q.id] === q.correctOptionId
    ).length;
    const scorePct = Math.round((correctCount / activeQuestions.length) * 100);

    let grade = 'Mastery Achieved';
    let gradeColor = 'text-emerald-400';
    if (scorePct < 50) {
      grade = 'Needs Focused Review';
      gradeColor = 'text-rose-400';
    } else if (scorePct < 80) {
      grade = 'Proficient Concept Grasp';
      gradeColor = 'text-amber-400';
    }

    return (
      <div className="quiz-completion-card">
        <div className="completion-hero">
          <div className="completion-badge-circle">
            <Award size={40} className={gradeColor} />
          </div>
          <h2 className="completion-title">
            {isRetestMode ? 'Re-test Complete!' : 'Quiz Finished!'}
          </h2>
          <p className="completion-subtitle">
            {isRetestMode ? 'Targeted re-test session completed' : `Topic: ${topic}`}
          </p>

          <div className="score-metric-box">
            <div className="score-big">
              {correctCount} <span className="score-divider">/</span> {activeQuestions.length}
            </div>
            <div className="score-percentage-tag">{scorePct}% Accuracy</div>
            <div className={`grade-label ${gradeColor}`}>
              <Sparkles size={14} />
              <span>{grade}</span>
            </div>
          </div>
        </div>

        <div className="quiz-review-section">
          <h4 className="review-section-title">Question Breakdown</h4>
          <div className="review-questions-list">
            {activeQuestions.map((q, idx) => {
              const userAnswerId = answersMap[q.id];
              const isCorrect = userAnswerId === q.correctOptionId;
              const userOpt = q.options.find((o) => o.id === userAnswerId);
              const correctOpt = q.options.find((o) => o.id === q.correctOptionId);

              return (
                <div
                  key={q.id}
                  className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`}
                >
                  <div className="review-item-header">
                    <span className="review-q-number">#{idx + 1}</span>
                    <span className="review-q-text">{q.question}</span>
                    <span className={`review-badge ${isCorrect ? 'badge-pass' : 'badge-fail'}`}>
                      {isCorrect ? 'Correct' : 'Needs Review'}
                    </span>
                  </div>

                  <div className="review-answers-grid">
                    <div className="answer-line">
                      <span className="answer-label">Your Answer:</span>
                      <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400 font-medium'}>
                        {userOpt ? `${userOpt.id}) ${userOpt.text}` : 'Not answered'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="answer-line">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="text-emerald-400 font-medium">
                          {correctOpt ? `${correctOpt.id}) ${correctOpt.text}` : q.correctOptionId}
                        </span>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="review-explanation">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="completion-actions-bar">
          {wrongQuestions.length > 0 && (
            <button
              type="button"
              className="btn-retest-wrong"
              onClick={handleStartRetest}
              title="Target and practice only questions you got wrong"
            >
              <Target size={18} />
              <span>Re-test Wrong Answers ({wrongQuestions.length} Questions)</span>
            </button>
          )}

          <button
            type="button"
            className="btn-restart-quiz"
            onClick={handleRestartFull}
          >
            <RotateCcw size={16} />
            <span>Retake Full Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / activeQuestions.length) * 100);

  return (
    <div className="quiz-mode-wrapper">
      <div className="quiz-top-bar">
        <div className="quiz-title-info">
          {isRetestMode && (
            <span className="retest-mode-badge">
              <Target size={13} />
              <span>Targeted Re-test Mode</span>
            </span>
          )}
          <span className="quiz-question-counter">
            Question <strong>{currentIndex + 1}</strong> of <strong>{activeQuestions.length}</strong>
          </span>
        </div>

        <div className="quiz-progress-track">
          <div className="quiz-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="quiz-card">
        <h3 className="quiz-question-heading">{currentQ.question}</h3>

        <div className="quiz-options-list" role="radiogroup">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === currentQ.correctOptionId;

            let optionClass = 'quiz-option';
            if (isSelected) optionClass += ' opt-selected';

            if (isAnswerSubmitted) {
              if (isCorrect) {
                optionClass += ' opt-correct';
              } else if (isSelected && !isCorrect) {
                optionClass += ' opt-incorrect';
              } else {
                optionClass += ' opt-disabled';
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={optionClass}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswerSubmitted}
                aria-checked={isSelected}
                role="radio"
              >
                <div className="option-letter">{opt.id}</div>
                <div className="option-text">{opt.text}</div>
                <div className="option-icon-indicator">
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle size={18} className="text-rose-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && (
          <div className={`quiz-explanation-box ${selectedOptionId === currentQ.correctOptionId ? 'exp-success' : 'exp-fail'}`}>
            <div className="exp-header">
              {selectedOptionId === currentQ.correctOptionId ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span className="font-semibold text-emerald-400">Correct!</span>
                </>
              ) : (
                <>
                  <XCircle size={18} className="text-rose-400" />
                  <span className="font-semibold text-rose-400">Incorrect</span>
                </>
              )}
            </div>
            <p className="exp-body">{currentQ.explanation}</p>
          </div>
        )}

        <div className="quiz-card-footer">
          {!isAnswerSubmitted ? (
            <button
              type="button"
              className="btn-submit-answer"
              disabled={!selectedOptionId}
              onClick={handleSubmitAnswer}
            >
              <span>Check Answer</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-next-question"
              onClick={handleNext}
            >
              <span>{currentIndex < activeQuestions.length - 1 ? 'Next Question' : 'View Quiz Results'}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
