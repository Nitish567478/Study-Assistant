import React, { useState } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Code,
  Check,
  ArrowLeft,
  FileQuestion,
  Clock,
  ServerCrash,
  WifiOff,
  Sparkles,
} from 'lucide-react';
import { ErrorType } from '../types/result';

interface ErrorStateProps {
  errorType: ErrorType;
  message: string;
  details?: string;
  raw?: string;
  onRetry: () => void;
  onReset: () => void;
  onUseFallbackDemo?: () => void;
}

const ERROR_METADATA: Record<
  ErrorType,
  {
    title: string;
    icon: React.ReactNode;
    colorClass: string;
    description: string;
    recoveryTip: string;
  }
> = {
  MALFORMED_JSON: {
    title: 'Malformed JSON Output',
    icon: <AlertOctagon size={28} />,
    colorClass: 'error-danger',
    description:
      'The AI model responded with syntax errors in its JSON syntax (e.g. unescaped quotes or unterminated brackets). Our defensive parser caught this before it could reach the UI.',
    recoveryTip: 'Retrying usually succeeds with stricter model temperature, or test with the offline engine.',
  },
  INVALID_SHAPE: {
    title: 'Schema Validation Failure',
    icon: <FileQuestion size={28} />,
    colorClass: 'error-warning',
    description:
      'The AI model returned parseable JSON, but it failed our strict structural contract (missing required "cards" or "quiz" arrays).',
    recoveryTip: 'Our validator rejected this payload to prevent runtime null-reference crashes.',
  },
  EMPTY_RESPONSE: {
    title: 'Empty Model Response',
    icon: <FileQuestion size={28} />,
    colorClass: 'error-warning',
    description:
      'The upstream model returned a zero-byte or blank string response. We treat this as a failure state rather than a blank render.',
    recoveryTip: 'Try providing a more specific or slightly longer prompt.',
  },
  SLOW_RESPONSE: {
    title: 'Request Timed Out',
    icon: <Clock size={28} />,
    colorClass: 'error-warning',
    description:
      'The generation request exceeded our 45-second latency threshold. To prevent UI lock-up, the connection was terminated.',
    recoveryTip: 'Check network connectivity or try shorter notes.',
  },
  SERVER_ERROR: {
    title: 'Upstream Provider Error',
    icon: <ServerCrash size={28} />,
    colorClass: 'error-danger',
    description:
      'The AI provider API (or backend proxy) responded with an HTTP failure code or rate limit status.',
    recoveryTip: 'Verify your API key in .env or switch to the offline mock engine.',
  },
  NETWORK_ERROR: {
    title: 'Network / Proxy Offline',
    icon: <WifiOff size={28} />,
    colorClass: 'error-danger',
    description:
      'Could not establish a connection with the local backend proxy at http://localhost:3001.',
    recoveryTip: 'Ensure `npm start` or `npm run dev` is running the backend proxy server.',
  },
  ABORTED: {
    title: 'Request Cancelled',
    icon: <AlertOctagon size={28} />,
    colorClass: 'error-info',
    description: 'The ongoing generation was manually cancelled.',
    recoveryTip: 'You can modify your prompt or start a new generation whenever ready.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  errorType,
  message,
  details,
  raw,
  onRetry,
  onReset,
  onUseFallbackDemo,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = ERROR_METADATA[errorType] || ERROR_METADATA.SERVER_ERROR;

  const handleCopyRaw = () => {
    if (raw || details) {
      navigator.clipboard.writeText(raw || details || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`error-state-card ${meta.colorClass}`}>
      <div className="error-header">
        <div className="error-icon-bubble">{meta.icon}</div>
        <div className="error-title-group">
          <div className="error-badge-row">
            <span className="error-type-badge">{errorType}</span>
            <span className="defensive-guard-badge">Defensive Guard Active</span>
          </div>
          <h2 className="error-main-title">{meta.title}</h2>
        </div>
      </div>

      <p className="error-explanation">{meta.description}</p>

      {message && (
        <div className="error-message-box">
          <strong>Error Message:</strong> {message}
          {details && <div className="error-details-text">{details}</div>}
        </div>
      )}

      <div className="error-actions-row">
        <button type="button" className="btn-primary-retry" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Retry Request</span>
        </button>

        {onUseFallbackDemo && (
          <button type="button" className="btn-secondary-demo" onClick={onUseFallbackDemo}>
            <Sparkles size={16} />
            <span>Generate via Offline Engine</span>
          </button>
        )}

        <button type="button" className="btn-ghost-reset" onClick={onReset}>
          <ArrowLeft size={16} />
          <span>Edit Prompt</span>
        </button>
      </div>

      {(raw || details) && (
        <div className="raw-output-accordion">
          <button
            type="button"
            className="toggle-raw-btn"
            onClick={() => setShowRaw(!showRaw)}
            aria-expanded={showRaw}
          >
            <Code size={14} />
            <span>{showRaw ? 'Hide Raw AI / Server Payload' : 'Inspect Raw AI / Server Payload (Debug)'}</span>
          </button>

          {showRaw && (
            <div className="raw-code-container">
              <div className="raw-code-header">
                <span className="raw-code-label">Raw Output Stream</span>
                <button type="button" className="copy-code-btn" onClick={handleCopyRaw}>
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Code size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="raw-code-block">
                <code>{raw || details}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
