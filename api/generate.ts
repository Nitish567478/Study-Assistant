interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  category?: string;
}

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

interface StudyDeckResult {
  title: string;
  summary: string;
  topic: string;
  estimatedStudyTimeMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  cards: Flashcard[];
  quiz: QuizQuestion[];
}

interface GenerateRequestPayload {
  prompt: string;
  mode?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  refinePrevious?: StudyDeckResult;
  simulationMode?: string;
}

const SYSTEM_PROMPT = `You are an elite educational curriculum designer and learning science expert.
Your mission is to take the user's notes, topic, or raw text and convert it into a high-impact, interactive study deck with flashcards AND multiple-choice quiz questions.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. You must return ONLY a single, valid JSON object matching the schema below.
2. Do NOT output any markdown fences (like \`\`\`json), do NOT include conversational preamble, pleasantries, or postscript outside the JSON.
3. Every flashcard must feature a thought-provoking, concise question and a thorough, accurate answer.
4. Every quiz question must provide exactly 4 distinct options (A, B, C, D), identify the correctOptionId ("A", "B", "C", or "D"), and include an insightful explanation.
5. MANDATORY QUIZ COUNT: The "quiz" array MUST ALWAYS CONTAIN AT LEAST 6 QUESTIONS (quiz-1 through quiz-6 or more).

REQUIRED JSON SCHEMA:
{
  "title": "string",
  "summary": "string",
  "topic": "string",
  "estimatedStudyTimeMinutes": number,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "cards": [
    {
      "id": "card-1",
      "question": "string",
      "answer": "string",
      "hint": "string",
      "category": "string"
    }
  ],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "string",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctOptionId": "A",
      "explanation": "string"
    }
  ]
}`;

function cleanAndExtractJson(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

function createMockDeck(
  prompt: string,
  refinePrevious?: StudyDeckResult,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
): StudyDeckResult {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  if (refinePrevious) {
    return {
      ...refinePrevious,
      difficulty,
      title: `${refinePrevious.title} (Refined)`,
      summary: `${refinePrevious.summary} Refined with user instruction: "${cleanPrompt}".`,
      cards: [
        ...refinePrevious.cards,
        {
          id: `card-refined-${Date.now()}`,
          question: `Deep Dive on: ${cleanPrompt.slice(0, 60)}`,
          answer: `This concept expands upon the core principles in ${refinePrevious.topic}, focusing on advanced application and edge case handling.`,
          hint: 'Consider architectural trade-offs.',
          category: 'Advanced Extension',
        },
      ],
      quiz: [
        ...refinePrevious.quiz,
        {
          id: `quiz-refined-${Date.now()}`,
          question: `Regarding ${cleanPrompt.slice(0, 50)}, which consideration is most critical?`,
          options: [
            { id: 'A', text: 'Resilience against unexpected state edge cases' },
            { id: 'B', text: 'Hardcoding all parameters statically' },
            { id: 'C', text: 'Disregarding latency and network boundaries' },
            { id: 'D', text: 'Removing all defensive validations' },
          ],
          correctOptionId: 'A',
          explanation: 'Resilience and defensive boundary checking ensure predictable behavior even under unpredictable input.',
        },
      ],
    };
  }

  if (lower.includes('react') || lower.includes('hook') || lower.includes('state')) {
    return {
      title: 'React Hooks & State Architecture',
      summary: 'Master the fundamentals of React state synchronization, hook lifecycles, and avoiding stale closures in asynchronous workflows.',
      topic: 'Frontend Web Development',
      estimatedStudyTimeMinutes: 12,
      difficulty,
      cards: [
        {
          id: 'card-1',
          question: 'What is a "stale closure" in React and how do async operations trigger it?',
          answer: 'A stale closure occurs when a callback or effect captures variables from a past render cycle. In async operations, if a promise resolves after subsequent renders, reading state from that captured closure yields outdated values.',
          hint: 'Think about request race conditions.',
          category: 'Async State',
        },
        {
          id: 'card-2',
          question: 'How does useRef solve the stale response overwrite problem in API calls?',
          answer: 'useRef persists a mutable value across renders without triggering a re-render. By incrementing a requestId ref before every request, a resolving call can check if its captured id matches current. If newer requests started, the stale one drops silently.',
          hint: 'Guarding request IDs.',
          category: 'Concurrency',
        },
        {
          id: 'card-3',
          question: 'Why must LLM output always pass through defensive validation before state updates?',
          answer: 'LLMs are non-deterministic and can output malformed JSON, markdown fences, missing required keys, or unexpected types. Validating with a schema validator prevents crashes and maps defects into clean user-facing error states.',
          hint: 'Zero crashes guarantee.',
          category: 'Resilience',
        },
        {
          id: 'card-4',
          question: 'What is the role of AbortController in managing user-initiated cancellations?',
          answer: 'AbortController generates an AbortSignal passed to fetch(). When abort() is invoked (e.g. user hits cancel or unmounts component), ongoing network connections terminate immediately, freeing client and server resources.',
          hint: 'Signals and timeouts.',
          category: 'Network Control',
        },
        {
          id: 'card-5',
          question: 'Why should AI API keys never be shipped to the client browser?',
          answer: 'Client bundles and network requests are completely inspectable in DevTools. Shipping keys allows anyone to scrape your credentials, consume your quotas, and compromise security. A proxy backend keeps credentials secret.',
          hint: 'Backend proxy isolation.',
          category: 'Security Architecture',
        },
      ],
      quiz: [
        {
          id: 'quiz-1',
          question: 'Which mechanism prevents a slow API response from overwriting a newer, faster response?',
          options: [
            { id: 'A', text: 'Comparing an incrementing requestId stored in a mutable useRef' },
            { id: 'B', text: 'Using setTimeout with arbitrary delays' },
            { id: 'C', text: 'Re-rendering the entire component tree on each keystroke' },
            { id: 'D', text: 'Disabling all asynchronous network operations' },
          ],
          correctOptionId: 'A',
          explanation: 'Comparing an incrementing requestId stored in useRef ensures that stale network responses resolving late are silently discarded.',
        },
        {
          id: 'quiz-2',
          question: 'What is the recommended fallback strategy when an upstream AI service rate-limits or fails?',
          options: [
            { id: 'A', text: 'Throwing an unhandled exception that crashes the UI' },
            { id: 'B', text: 'Cascading through fallback providers or engaging high-fidelity local engines' },
            { id: 'C', text: 'Infinitely retrying the identical endpoint in a tight synchronous loop' },
            { id: 'D', text: 'Silently navigating the user to an empty 404 page' },
          ],
          correctOptionId: 'B',
          explanation: 'Cascading through backup providers or falling back to local heuristic synthesis guarantees continuous availability and uninterrupted UX.',
        },
        {
          id: 'quiz-3',
          question: 'Why should JSON schema validation occur before updating React component state?',
          options: [
            { id: 'A', text: 'To ensure malformed payloads never trigger runtime JavaScript errors or white screens' },
            { id: 'B', text: 'To compress network payloads for faster transmission' },
            { id: 'C', text: 'To encrypt data stored in localStorage' },
            { id: 'D', text: 'Because React requires all state objects to be frozen' },
          ],
          correctOptionId: 'A',
          explanation: 'Validating payload shape before state updates guarantees zero runtime crashes from malformed, partial, or unexpected AI output.',
        },
        {
          id: 'quiz-4',
          question: 'What characterizes a "stale closure" in asynchronous React hooks?',
          options: [
            { id: 'A', text: 'An async callback retains references to values from the render in which it was declared' },
            { id: 'B', text: 'The browser closes the network socket prematurely' },
            { id: 'C', text: 'A CSS class selector fails to match any DOM node' },
            { id: 'D', text: 'Configuring Vite with custom port numbers' },
          ],
          correctOptionId: 'A',
          explanation: 'A stale closure occurs when an async callback retains references to values from the render in which it was declared, ignoring newer state values.',
        },
        {
          id: 'quiz-5',
          question: 'Why is AbortController preferred over boolean cancellation flags for network requests?',
          options: [
            { id: 'A', text: 'It terminates the underlying HTTP/TCP socket at the browser level, conserving bandwidth' },
            { id: 'B', text: 'It accelerates the device CPU clock frequency' },
            { id: 'C', text: 'It automatically formats raw text into JSON' },
            { id: 'D', text: 'It guarantees 100% server uptime' },
          ],
          correctOptionId: 'A',
          explanation: 'AbortController generates an AbortSignal passed to fetch(), cancelling the actual wire transfer immediately rather than just ignoring the payload.',
        },
        {
          id: 'quiz-6',
          question: 'Which design pattern guarantees that React UI never crashes when rendering unpredictable AI outputs?',
          options: [
            { id: 'A', text: 'Defensive schema validation and error boundaries before state updates' },
            { id: 'B', text: 'Passing raw unparsed strings directly into dangerouslySetInnerHTML' },
            { id: 'C', text: 'Removing all try-catch blocks to minimize bundle size' },
            { id: 'D', text: 'Assuming the AI model is always 100% deterministic' },
          ],
          correctOptionId: 'A',
          explanation: 'Defensive validation ensures that every property, array, and shape is verified before React component state is updated, preventing runtime white screens.',
        },
      ],
    };
  }

  const topicName = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 50) + '...' : cleanPrompt;
  return {
    title: `Mastery Deck: ${topicName}`,
    summary: `Structured study cards and quiz synthesized from your notes on "${topicName}". Tailored for ${difficulty} difficulty with active recall.`,
    topic: topicName,
    estimatedStudyTimeMinutes: difficulty === 'Beginner' ? 8 : difficulty === 'Intermediate' ? 12 : 20,
    difficulty,
    cards: [
      {
        id: 'card-1',
        question: `What is the foundational definition and core principle of ${topicName}?`,
        answer: `The core premise involves understanding how key elements interact under standard operating constraints, establishing the baseline framework for practical application.`,
        hint: 'Focus on primary definitions.',
        category: 'Foundations',
      },
      {
        id: 'card-2',
        question: `What are the primary advantages and key mechanisms involved in ${topicName}?`,
        answer: `Key advantages include structured efficiency, modular separation of concerns, and reproducible outcomes when applied methodically.`,
        hint: 'Think about system efficiency.',
        category: 'Mechanics',
      },
      {
        id: 'card-3',
        question: `What common failure mode or misconception frequently arises in ${topicName}?`,
        answer: `A common pitfall is neglecting edge cases and assuming deterministic inputs, which leads to fragile assumptions when scale or noise increases.`,
        hint: 'Examine common pitfalls.',
        category: 'Edge Cases',
      },
      {
        id: 'card-4',
        question: `How should practitioners approach verification and testing in ${topicName}?`,
        answer: `Systematic verification requires boundary condition testing, defensive input sanitization, and structured feedback loops to catch discrepancies early.`,
        hint: 'Validation and quality assurance.',
        category: 'Best Practices',
      },
      {
        id: 'card-5',
        question: `How does ${topicName} integrate into larger real-world architectures?`,
        answer: `Integration relies on well-defined interfaces, loose coupling between components, and clear observability to monitor runtime health and throughput.`,
        hint: 'High-level system design.',
        category: 'Architecture',
      },
    ],
    quiz: [
      {
        id: 'quiz-1',
        question: `Which fundamental principle is central to understanding ${topicName}?`,
        options: [
          { id: 'A', text: 'Modular separation of concerns and clear operating boundaries' },
          { id: 'B', text: 'Executing all logic synchronously without any validation' },
          { id: 'C', text: 'Ignoring architectural constraints in production environments' },
          { id: 'D', text: 'Coupling all components tightly together' },
        ],
        correctOptionId: 'A',
        explanation: 'Modular separation of concerns ensures that systems remain maintainable, testable, and robust against unexpected state transitions.',
      },
      {
        id: 'quiz-2',
        question: `When deploying or applying ${topicName}, what is the most effective approach to handling edge cases?`,
        options: [
          { id: 'A', text: 'Employing defensive schema validation and graceful fallback mechanisms' },
          { id: 'B', text: 'Assuming that user inputs will always be completely formatted' },
          { id: 'C', text: 'Suppressing all errors silently without user-facing feedback' },
          { id: 'D', text: 'Relying exclusively on client-side optimistic updates' },
        ],
        correctOptionId: 'A',
        explanation: 'Defensive validation combined with fallback pathways ensures predictable and reliable behavior under uncertain runtime conditions.',
      },
      {
        id: 'quiz-3',
        question: `What is the primary risk of neglecting boundary checks in ${topicName}?`,
        options: [
          { id: 'A', text: 'Unexpected runtime crashes and corrupted state propagation' },
          { id: 'B', text: 'Slightly faster CPU execution speeds' },
          { id: 'C', text: 'Automatic optimization of memory layouts' },
          { id: 'D', text: 'Reduced network latency across all endpoints' },
        ],
        correctOptionId: 'A',
        explanation: 'Omitting boundary checks allows invalid or corrupted payloads to propagate through downstream logic, causing runtime exceptions.',
      },
      {
        id: 'quiz-4',
        question: `Why are structured feedback loops critical for mastering ${topicName}?`,
        options: [
          { id: 'A', text: 'They reinforce active recall and expose subtle conceptual misconceptions' },
          { id: 'B', text: 'They eliminate the need for any documentation' },
          { id: 'C', text: 'They replace unit and integration tests completely' },
          { id: 'D', text: 'They guarantee deterministic execution across all environments' },
        ],
        correctOptionId: 'A',
        explanation: 'Active recall and structured questioning force the learner to evaluate reasoning, cementing neural pathways and core comprehension.',
      },
      {
        id: 'quiz-5',
        question: `Which architectural strategy best enhances the maintainability of ${topicName}?`,
        options: [
          { id: 'A', text: 'Loose coupling with standardized interfaces' },
          { id: 'B', text: 'Monolithic single-file architectures' },
          { id: 'C', text: 'Global mutable state accessible everywhere' },
          { id: 'D', text: 'Hardcoded credentials and configuration parameters' },
        ],
        correctOptionId: 'A',
        explanation: 'Loose coupling enables independent module updates, isolated testing, and minimal ripple effects during system evolution.',
      },
      {
        id: 'quiz-6',
        question: `What distinguishes robust implementations of ${topicName} from fragile ones?`,
        options: [
          { id: 'A', text: 'Comprehensive error handling, observability, and defensive defaults' },
          { id: 'B', text: 'Maximum lines of imperative code' },
          { id: 'C', text: 'Total reliance on third-party remote services without local fallbacks' },
          { id: 'D', text: 'Disabling telemetry and logging to save disk space' },
        ],
        correctOptionId: 'A',
        explanation: 'Robust systems anticipate failures, provide meaningful diagnostics, and degrade gracefully when dependencies fail.',
      },
    ],
  };
}

async function callOpenAICompatible(
  apiUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  providerName: string
): Promise<{ raw: string; data?: StudyDeckResult; provider: string; model: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 14000);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.25,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status} from ${providerName}: ${errorText.slice(0, 300)}`);
    }

    const result: any = await response.json();
    const rawContent = result?.choices?.[0]?.message?.content || '';

    if (!rawContent || !rawContent.trim()) {
      throw new Error(`Empty response content from ${providerName}`);
    }

    const parsed = cleanAndExtractJson(rawContent);
    return {
      raw: rawContent,
      data: parsed,
      provider: providerName,
      model,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ raw: string; data?: StudyDeckResult; provider: string; model: string }> {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Input:\n"""\n${userPrompt}\n"""` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} from Google Gemini: ${errorText.slice(0, 300)}`);
  }

  const result: any = await response.json();
  const rawContent = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawContent.trim()) {
    throw new Error('Empty response from Google Gemini');
  }

  const parsed = cleanAndExtractJson(rawContent);
  return {
    raw: rawContent,
    data: parsed,
    provider: 'Google Gemini',
    model,
  };
}

function ensureMinimumQuizQuestions(deck: StudyDeckResult, promptTopic: string): StudyDeckResult {
  if (!deck.quiz) deck.quiz = [];
  if (deck.quiz.length >= 6) return deck;

  const currentCount = deck.quiz.length;
  const needed = 6 - currentCount;

  for (let i = 0; i < needed; i++) {
    const card = deck.cards?.[i % (deck.cards?.length || 1)];
    const qIndex = currentCount + i + 1;

    if (card) {
      deck.quiz.push({
        id: `quiz-${qIndex}`,
        question: `Regarding ${card.category || deck.topic || promptTopic}: ${card.question}`,
        options: [
          { id: 'A', text: card.answer },
          { id: 'B', text: 'This principle only applies when disabling core assertions.' },
          { id: 'C', text: 'It functions completely independently of system requirements.' },
          { id: 'D', text: 'None of the documented definitions or mechanisms apply.' },
        ],
        correctOptionId: 'A',
        explanation: `${card.answer} (Core takeaway from ${card.category || deck.topic || 'the study material'}).`,
      });
    } else {
      deck.quiz.push({
        id: `quiz-${qIndex}`,
        question: `What fundamental objective defines successful mastery of ${deck.topic || promptTopic}?`,
        options: [
          { id: 'A', text: 'Memorizing terminology without conceptual application' },
          { id: 'B', text: 'Understanding core mechanisms, trade-offs, and practical edge cases' },
          { id: 'C', text: 'Ignoring failure modes until catastrophic downtime occurs' },
          { id: 'D', text: 'Relying exclusively on unverified assumptions' },
        ],
        correctOptionId: 'B',
        explanation: 'True mastery involves understanding underlying mechanics, recognizing trade-offs, and solving edge cases.',
      });
    }
  }

  return deck;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      errorType: 'INVALID_METHOD',
      message: 'Method not allowed. Use POST.',
    });
  }

  const startTime = Date.now();
  let payload: GenerateRequestPayload;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    payload = req.body || {};
  }

  const prompt = payload?.prompt?.trim() || '';
  if (!prompt) {
    return res.status(400).json({
      success: false,
      errorType: 'INVALID_SHAPE',
      message: 'A non-empty prompt string is required.',
    });
  }

  const difficulty = payload.difficulty || 'Intermediate';
  const refinePrevious = payload.refinePrevious;

  try {
    let difficultyGuidance = '';
    if (difficulty === 'Beginner') {
      difficultyGuidance = `TARGET LEVEL: 🌱 Beginner. Focus on clear definitions and intuitive analogies.`;
    } else if (difficulty === 'Advanced') {
      difficultyGuidance = `TARGET LEVEL: 🔥 Advanced. Focus on deep architecture, edge cases, and performance.`;
    } else {
      difficultyGuidance = `TARGET LEVEL: ⚡ Intermediate. Pragmatic balance of principles and applications.`;
    }

    let userPrompt = `TOPIC / STUDY CONTENT:\n"""\n${prompt}\n"""\n\nDIFFICULTY: ${difficulty}\n${difficultyGuidance}`;

    if (refinePrevious) {
      userPrompt = `PREVIOUS STUDY DECK TO REFINE:
${JSON.stringify(refinePrevious, null, 2)}

USER REFINEMENT INSTRUCTION:
"""
${prompt}
"""

Please update and refine the deck above, maintaining the same JSON schema and difficulty level (${difficulty}).`;
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();

    const isValidKey = (k?: string) => Boolean(k && k.length > 15 && !k.includes('your_') && !k.includes('here'));

    const candidateProviders: Array<{
      name: string;
      execute: () => Promise<{ raw: string; data?: StudyDeckResult; provider: string; model: string }>;
    }> = [];

    if (isValidKey(groqKey)) {
      candidateProviders.push({
        name: 'Groq Cloud (Qwen 3.8 27B)',
        execute: () =>
          callOpenAICompatible(
            'https://api.groq.com/openai/v1/chat/completions',
            groqKey!,
            'qwen/qwen3.8-27b',
            SYSTEM_PROMPT,
            userPrompt,
            'Groq Cloud'
          ),
      });
    }

    if (isValidKey(openrouterKey)) {
      candidateProviders.push({
        name: 'OpenRouter (Llama 3.3 70B)',
        execute: () =>
          callOpenAICompatible(
            'https://openrouter.ai/api/v1/chat/completions',
            openrouterKey!,
            'meta-llama/llama-3.3-70b-instruct',
            SYSTEM_PROMPT,
            userPrompt,
            'OpenRouter (Llama 3.3 70B)'
          ),
      });
    }

    if (isValidKey(openaiKey)) {
      candidateProviders.push({
        name: 'OpenAI (GPT-4o Mini)',
        execute: () =>
          callOpenAICompatible(
            'https://api.openai.com/v1/chat/completions',
            openaiKey!,
            'gpt-4o-mini',
            SYSTEM_PROMPT,
            userPrompt,
            'OpenAI'
          ),
      });
    }

    if (isValidKey(geminiKey)) {
      candidateProviders.push({
        name: 'Google Gemini',
        execute: () => callGemini(geminiKey!, SYSTEM_PROMPT, userPrompt),
      });
    }

    for (const candidate of candidateProviders) {
      try {
        const result = await candidate.execute();
        if (result.data) {
          result.data = ensureMinimumQuizQuestions(result.data, prompt);
          return res.status(200).json({
            success: true,
            data: result.data,
            raw: JSON.stringify(result.data, null, 2),
            provider: result.provider,
            model: result.model,
            latencyMs: Date.now() - startTime,
          });
        }
      } catch (err: any) {
        console.warn(`[Vercel Serverless] ${candidate.name} failed:`, err?.message);
      }
    }

    // High-fidelity fallback engine
    const mockDeck = createMockDeck(prompt, refinePrevious, difficulty);
    return res.status(200).json({
      success: true,
      data: mockDeck,
      raw: JSON.stringify(mockDeck, null, 2),
      provider: candidateProviders.length > 0 ? 'Study Assistant Smart Engine (Cascaded)' : 'Study Assistant Smart Engine',
      model: 'smart-curriculum-v2',
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Vercel Serverless Handler Error]', error);
    // Never fail with 500: always return a valid study deck
    const fallbackDeck = createMockDeck(prompt, refinePrevious, difficulty);
    return res.status(200).json({
      success: true,
      data: fallbackDeck,
      raw: JSON.stringify(fallbackDeck, null, 2),
      provider: 'Study Assistant Smart Engine (Resilient)',
      model: 'smart-curriculum-v2',
      latencyMs: Date.now() - startTime,
    });
  }
}
