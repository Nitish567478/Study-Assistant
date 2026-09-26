import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PromptInput } from './components/PromptInput';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ResultView } from './components/ResultView';
import { SessionHistory, SavedSession } from './components/SessionHistory';
import { STARTER_SESSIONS } from './data/starterSessions';
import { callBackendGenerate, AppApiError } from './lib/api';
import {
  ApiSuccessResponse,
  ErrorType,
  FailureMode,
  StudyDeckResult,
} from './types/result';

const STORAGE_KEY = 'study_assistant_saved_sessions_v1';
const THEME_KEY = 'study_assistant_theme_v1';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastPrompt, setLastPrompt] = useState('');
  const [resultMeta, setResultMeta] = useState<ApiSuccessResponse | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  const [errorDetails, setErrorDetails] = useState<{
    type: ErrorType;
    message: string;
    details?: string;
    raw?: string;
  } | null>(null);

  const [savedSessions, setSavedSessions] = useState<SavedSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_SESSIONS));
      return STARTER_SESSIONS;
    } catch {
      return STARTER_SESSIONS;
    }
  });
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);

  const requestId = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const saveSessionToStorage = useCallback((deck: StudyDeckResult) => {
    setSavedSessions((prev) => {
      const existing = prev.filter((s) => s.deck.title !== deck.title);
      const updated: SavedSession[] = [
        {
          id: `session-${Date.now()}`,
          savedAt: new Date().toISOString(),
          deck,
        },
        ...existing,
      ].slice(0, 25);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });
  }, []);

  const handleDeleteSession = (id: string) => {
    setSavedSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearAllSessions = () => {
    setSavedSessions([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleReloadStarterDecks = () => {
    setSavedSessions(STARTER_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STARTER_SESSIONS));
  };

  const handleSelectSession = (session: SavedSession) => {
    setResultMeta({
      success: true,
      data: session.deck,
      raw: JSON.stringify(session.deck, null, 2),
      provider: 'Saved Library',
      model: 'study-workspace',
      latencyMs: 0,
    });
    setLastPrompt(session.deck.topic);
    setStatus('success');
  };

  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const handleGenerate = async (
    promptText: string,
    refinePrevious?: StudyDeckResult,
    chosenDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced',
    simulationMode: FailureMode = 'none'
  ) => {
    const activeDifficulty = chosenDifficulty || difficulty;
    if (chosenDifficulty) {
      setDifficulty(chosenDifficulty);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const currentId = ++requestId.current;

    setLastPrompt(promptText);
    setErrorDetails(null);

    if (refinePrevious) {
      setIsRefining(true);
    } else {
      setStatus('loading');
    }

    try {
      const response = await callBackendGenerate(
        {
          prompt: promptText,
          mode: 'study_deck',
          difficulty: activeDifficulty,
          refinePrevious,
          simulationMode,
        },
        controller.signal
      );

      if (currentId !== requestId.current) {
        return;
      }

      setResultMeta(response);
      setStatus('success');
      setIsRefining(false);

      saveSessionToStorage(response.data);
    } catch (err: any) {
      if (currentId !== requestId.current) {
        return;
      }

      setIsRefining(false);

      if (err instanceof AppApiError) {
        if (err.errorType === 'ABORTED') {
          if (status === 'loading') {
            setStatus('idle');
          }
          return;
        }

        setErrorDetails({
          type: err.errorType,
          message: err.message,
          details: err.details,
          raw: err.raw,
        });
        setStatus('error');
        return;
      }

      setErrorDetails({
        type: 'SERVER_ERROR',
        message: err.message || 'An unexpected error occurred.',
        details: String(err),
      });
      setStatus('error');
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('idle');
  };

  const handleRetry = () => {
    if (lastPrompt) {
      handleGenerate(lastPrompt, undefined, difficulty, 'none');
    } else {
      setStatus('idle');
    }
  };

  const handleUseFallbackDemo = () => {
    handleGenerate(lastPrompt || 'React Hooks and State Architecture', undefined, difficulty, 'none');
  };

  const handleResetToNew = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setErrorDetails(null);
  };

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        savedCount={savedSessions.length}
        onOpenSavedDecks={() => setIsSessionHistoryOpen(true)}
        onResetToNew={handleResetToNew}
      />

      <main className="main-content">
        <div className="content-container">
          {status === 'idle' && (
            <PromptInput
              onSubmit={(prompt, diff) => handleGenerate(prompt, undefined, diff, 'none')}
              isLoading={false}
              initialValue={lastPrompt}
              initialDifficulty={difficulty}
            />
          )}

          {status === 'loading' && (
            <LoadingState onCancel={handleCancel} topicSnippet={lastPrompt} />
          )}

          {status === 'error' && errorDetails && (
            <ErrorState
              errorType={errorDetails.type}
              message={errorDetails.message}
              details={errorDetails.details}
              raw={errorDetails.raw}
              onRetry={handleRetry}
              onReset={handleResetToNew}
              onUseFallbackDemo={handleUseFallbackDemo}
            />
          )}

          {status === 'success' && resultMeta && (
            <ResultView
              resultMeta={resultMeta}
              onReset={handleResetToNew}
              onRefine={(refineText) => handleGenerate(refineText, resultMeta.data)}
              isRefining={isRefining}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <span>Study Assistant &bull; Interactive AI Learning Studio</span>
        </div>
      </footer>

      <SessionHistory
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
        sessions={savedSessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onReloadStarterDecks={handleReloadStarterDecks}
        onClearAllSessions={handleClearAllSessions}
      />
    </div>
  );
};
export default App;
