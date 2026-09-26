import { StudyDeckResult, ErrorType, Flashcard, QuizQuestion, QuizOption } from '../types/result';

export type ValidationResult =
  | { valid: true; data: StudyDeckResult }
  | { valid: false; errorType: ErrorType; message: string; details?: string };

export function extractJsonFromText(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();

  const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = trimmed.match(jsonBlockRegex);
  if (match && match[1]) {
    return match[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim();
  }

  return trimmed;
}

export function validateStudyDeck(raw: unknown): ValidationResult {
  if (raw === null || raw === undefined) {
    return {
      valid: false,
      errorType: 'EMPTY_RESPONSE',
      message: 'The AI model returned an empty response.',
      details: 'The received payload was null or undefined.',
    };
  }

  let parsed: unknown;

  if (typeof raw === 'string') {
    const cleaned = extractJsonFromText(raw);
    if (!cleaned || cleaned.length === 0) {
      return {
        valid: false,
        errorType: 'EMPTY_RESPONSE',
        message: 'The AI model returned a blank text response.',
        details: 'Received an empty string or empty code block.',
      };
    }

    try {
      parsed = JSON.parse(cleaned);
    } catch (parseError: any) {
      return {
        valid: false,
        errorType: 'MALFORMED_JSON',
        message: 'Failed to parse AI output as valid JSON.',
        details: parseError?.message || 'SyntaxError during JSON.parse',
      };
    }
  } else {
    parsed = raw;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: 'Unexpected root structure: expected a JSON object.',
      details: `Received type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`,
    };
  }

  const obj = parsed as Record<string, any>;

  if (!obj.title || typeof obj.title !== 'string') {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: "Missing or invalid 'title' field in AI response.",
      details: "Expected a non-empty string for 'title'.",
    };
  }

  if (!Array.isArray(obj.cards)) {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: "Missing 'cards' array in AI response.",
      details: "The model did not include a 'cards' list.",
    };
  }

  if (obj.cards.length === 0) {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: "The 'cards' array is empty.",
      details: 'At least one flashcard is required to construct a study deck.',
    };
  }

  const validatedCards: Flashcard[] = [];
  for (let i = 0; i < obj.cards.length; i++) {
    const card = obj.cards[i];
    if (typeof card !== 'object' || card === null) {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Flashcard at index ${i} is not a valid object.`,
      };
    }
    if (!card.question || typeof card.question !== 'string' || card.question.trim() === '') {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Flashcard #${i + 1} is missing a 'question' string.`,
      };
    }
    if (!card.answer || typeof card.answer !== 'string' || card.answer.trim() === '') {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Flashcard #${i + 1} is missing an 'answer' string.`,
      };
    }

    validatedCards.push({
      id: card.id ? String(card.id) : `card-${i + 1}-${Date.now().toString(36)}`,
      question: card.question.trim(),
      answer: card.answer.trim(),
      hint: typeof card.hint === 'string' ? card.hint.trim() : undefined,
      category: typeof card.category === 'string' ? card.category.trim() : undefined,
    });
  }

  if (!Array.isArray(obj.quiz)) {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: "Missing 'quiz' array in AI response.",
      details: "The model did not include a 'quiz' array for interactive testing.",
    };
  }

  if (obj.quiz.length === 0) {
    return {
      valid: false,
      errorType: 'INVALID_SHAPE',
      message: "The 'quiz' array is empty.",
      details: 'At least one quiz question is required for the interactive quiz feature.',
    };
  }

  const validatedQuiz: QuizQuestion[] = [];
  for (let i = 0; i < obj.quiz.length; i++) {
    const q = obj.quiz[i];
    if (typeof q !== 'object' || q === null) {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Quiz question at index ${i} is not a valid object.`,
      };
    }
    if (!q.question || typeof q.question !== 'string') {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Quiz question #${i + 1} is missing a 'question' text.`,
      };
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return {
        valid: false,
        errorType: 'INVALID_SHAPE',
        message: `Quiz question #${i + 1} must have at least 2 options.`,
      };
    }

    const options: QuizOption[] = q.options.map((opt: any, optIdx: number) => {
      if (typeof opt === 'string') {
        const optLetter = String.fromCharCode(65 + optIdx);
        return { id: optLetter, text: opt };
      }
      return {
        id: opt.id ? String(opt.id) : String.fromCharCode(65 + optIdx),
        text: typeof opt.text === 'string' ? opt.text : String(opt),
      };
    });

    const correctOptionId = q.correctOptionId ? String(q.correctOptionId) : options[0].id;
    const explanation = typeof q.explanation === 'string' ? q.explanation : 'No explanation provided.';

    validatedQuiz.push({
      id: q.id ? String(q.id) : `quiz-${i + 1}`,
      question: q.question.trim(),
      options,
      correctOptionId,
      explanation,
    });
  }

  const result: StudyDeckResult = {
    title: obj.title.trim(),
    summary: typeof obj.summary === 'string' ? obj.summary.trim() : 'Study deck generated from user input.',
    topic: typeof obj.topic === 'string' ? obj.topic.trim() : 'General',
    estimatedStudyTimeMinutes: typeof obj.estimatedStudyTimeMinutes === 'number' ? obj.estimatedStudyTimeMinutes : 10,
    difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(obj.difficulty)
      ? obj.difficulty
      : 'Intermediate',
    cards: validatedCards,
    quiz: validatedQuiz,
  };

  return { valid: true, data: result };
}
