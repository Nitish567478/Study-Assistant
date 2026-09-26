import React, { useState } from 'react';
import {
  GraduationCap,
  Moon,
  Sun,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { toggleSound, isSoundEnabled } from '../lib/sound';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  savedCount: number;
  onOpenSavedDecks: () => void;
  onResetToNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  savedCount,
  onOpenSavedDecks,
  onResetToNew,
}) => {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-left">
          <div
            className="brand"
            onClick={onResetToNew}
            role="button"
            tabIndex={0}
            title="Study Assistant - Home"
          >
            <div className="brand-icon-box">
              <GraduationCap size={18} />
            </div>
            <div className="brand-text-group">
              <span className="brand-title">Study Assistant</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="icon-action-btn"
            onClick={handleToggleSound}
            title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle sound effects"
          >
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} className="text-muted" />}
          </button>

          <button
            className="icon-action-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="header-library-btn"
            onClick={onOpenSavedDecks}
            title="View saved history & study decks"
            aria-label="Open Library"
          >
            <BookOpen size={16} />
            <span className="library-btn-text">Library</span>
            <span className="header-count-badge" title={`${savedCount} decks in history`}>
              {savedCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
