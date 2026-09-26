export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface StudyDeckResult {
  title: string;
  summary: string;
  topic: string;
  estimatedStudyTimeMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

export type FailureMode =
  | 'none'
  | 'malformed_json'
  | 'wrong_shape'
  | 'empty_response'
  | 'slow_response'
  | 'server_error';

export type ErrorType =
  | 'MALFORMED_JSON'
  | 'INVALID_SHAPE'
  | 'EMPTY_RESPONSE'
  | 'SLOW_RESPONSE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'ABORTED';

export interface ApiSuccessResponse {
  success: true;
  data: StudyDeckResult;
  raw: string;
  provider: string;
  model: string;
  latencyMs: number;
}

export interface ApiErrorResponse {
  success: false;
  errorType: ErrorType;
  message: string;
  details?: string;
  raw?: string;
}

export interface GenerateRequestPayload {
  prompt: string;
  mode?: 'study_deck';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  refinePrevious?: StudyDeckResult;
  simulationMode?: FailureMode;
}
