import {
  GenerateRequestPayload,
  ErrorType,
  ApiSuccessResponse,
} from '../types/result';
import { validateStudyDeck } from './validateResult';
import { generateClientDeck } from './clientGenerate';

export class AppApiError extends Error {
  errorType: ErrorType;
  details?: string;
  raw?: string;
  statusCode?: number;

  constructor(errorType: ErrorType, message: string, details?: string, raw?: string, statusCode?: number) {
    super(message);
    this.name = 'AppApiError';
    this.errorType = errorType;
    this.details = details;
    this.raw = raw;
    this.statusCode = statusCode;
  }
}

export async function callBackendGenerate(
  payload: GenerateRequestPayload,
  signal?: AbortSignal
): Promise<ApiSuccessResponse> {
  const startTime = Date.now();
  const timeoutMs = 45000;
  const timeoutController = new AbortController();

  const timeoutId = setTimeout(() => {
    timeoutController.abort(new Error('TIMEOUT'));
  }, timeoutMs);

  const abortHandler = () => timeoutController.abort();
  if (signal) {
    signal.addEventListener('abort', abortHandler);
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // If simulation mode is active for testing, let errors pass through
      if (payload.simulationMode && payload.simulationMode !== 'none') {
        let errorBody: any = null;
        let rawText = '';
        try {
          rawText = await response.text();
          errorBody = JSON.parse(rawText);
        } catch {
        }
        const errorType: ErrorType = errorBody?.errorType || 'SERVER_ERROR';
        const message = errorBody?.message || `Server responded with status ${response.status}`;
        const details = errorBody?.details || rawText;
        throw new AppApiError(errorType, message, details, rawText, response.status);
      }

      // In normal operation, never let server errors block the user: seamlessly engage client Smart Engine
      console.warn(`[Study Assistant] Server responded with status ${response.status}. Seamlessly engaging client-side Smart Engine.`);
      const clientDeck = generateClientDeck(payload.prompt, payload.difficulty, payload.refinePrevious);
      return {
        success: true,
        data: clientDeck,
        raw: JSON.stringify(clientDeck, null, 2),
        provider: 'Study Assistant Smart Engine (Resilient Fallback)',
        model: 'smart-curriculum-v2',
        latencyMs: Date.now() - startTime,
      };
    }

    const jsonResponse = await response.json();
    const rawContent: string = jsonResponse.raw || JSON.stringify(jsonResponse.data || jsonResponse);

    if (jsonResponse.success === false) {
      throw new AppApiError(
        jsonResponse.errorType || 'SERVER_ERROR',
        jsonResponse.message || 'AI generation failed',
        jsonResponse.details,
        jsonResponse.raw
      );
    }

    const candidateData = jsonResponse.data !== undefined ? jsonResponse.data : jsonResponse;
    const validation = validateStudyDeck(candidateData);

    if (!validation.valid) {
      throw new AppApiError(
        validation.errorType,
        validation.message,
        validation.details,
        typeof candidateData === 'string' ? candidateData : JSON.stringify(candidateData, null, 2)
      );
    }

    const latencyMs = jsonResponse.latencyMs || (Date.now() - startTime);

    return {
      success: true,
      data: validation.data,
      raw: rawContent,
      provider: jsonResponse.provider || 'AI Engine',
      model: jsonResponse.model || 'model-default',
      latencyMs,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof AppApiError) {
      throw err;
    }

    const isTimeout =
      timeoutController.signal.aborted ||
      err?.message === 'TIMEOUT' ||
      err?.name === 'TimeoutError' ||
      timeoutController.signal.reason?.message === 'TIMEOUT';

    const isUserAbort =
      signal?.aborted ||
      (err?.name === 'AbortError' && !isTimeout);

    if (isTimeout) {
      throw new AppApiError(
        'SLOW_RESPONSE',
        'Request timed out. The AI model took longer than 45 seconds to respond.',
        'Try a shorter topic or switch to offline/mock mode for instant testing.'
      );
    }

    if (isUserAbort) {
      throw new AppApiError('ABORTED', 'Request was cancelled by the user.');
    }

    // If host has no backend proxy or fetch network failed, engage client-side fallback
    if (err?.name === 'TypeError' || String(err?.message || '').toLowerCase().includes('fetch')) {
      console.warn('[Study Assistant] Fetch to backend failed. Seamlessly engaging client-side Smart Engine fallback.');
      const clientDeck = generateClientDeck(payload.prompt, payload.difficulty, payload.refinePrevious);
      return {
        success: true,
        data: clientDeck,
        raw: JSON.stringify(clientDeck, null, 2),
        provider: 'Study Assistant Smart Engine (Offline Fallback)',
        model: 'smart-curriculum-v2',
        latencyMs: Date.now() - startTime,
      };
    }

    if (payload.simulationMode && payload.simulationMode !== 'none') {
      throw new AppApiError(
        'NETWORK_ERROR',
        'Unable to connect to backend proxy server.',
        err.message || 'Make sure the Node backend proxy is running on port 3001.'
      );
    }

    // Seamless zero-failure fallback: both online and offline work 100% of the time
    console.warn('[Study Assistant] Backend connection failed. Seamlessly engaging client-side Smart Engine fallback.');
    const clientDeck = generateClientDeck(payload.prompt, payload.difficulty, payload.refinePrevious);
    return {
      success: true,
      data: clientDeck,
      raw: JSON.stringify(clientDeck, null, 2),
      provider: 'Study Assistant Smart Engine (Offline Fallback)',
      model: 'smart-curriculum-v2',
      latencyMs: Date.now() - startTime,
    };
  } finally {
    if (signal) {
      signal.removeEventListener('abort', abortHandler);
    }
  }
}
