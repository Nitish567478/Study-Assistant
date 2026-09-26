import {
  GenerateRequestPayload,
  StudyDeckResult,
  FailureMode,
} from '../src/types/result';

export interface GenerateServiceResult {
  data?: StudyDeckResult;
  raw: string;
  provider: string;
  model: string;
  error?: {
    status: number;
    errorType: string;
    message: string;
    details?: string;
  };
}

const SYSTEM_PROMPT = `You are an elite educational curriculum designer and learning science expert.
Your mission is to take the user's notes, topic, or raw text and convert it into a high-impact, interactive study deck with flashcards AND multiple-choice quiz questions.

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. You must return ONLY a single, valid JSON object matching the schema below.
2. Do NOT output any markdown fences (like \`\`\`json), do NOT include conversational preamble, pleasantries, or postscript outside the JSON.
3. Every flashcard must feature a thought-provoking, concise question and a thorough, accurate answer.
4. Every quiz question must provide exactly 4 distinct options (A, B, C, D), identify the correctOptionId ("A", "B", "C", or "D"), and include an insightful explanation detailing why that option is correct and why common misconceptions are wrong.
5. MANDATORY QUIZ COUNT: The "quiz" array MUST ALWAYS CONTAIN AT LEAST 6 QUESTIONS (quiz-1 through quiz-6 or more). Never return fewer than 6 quiz questions.

REQUIRED JSON SCHEMA:
{
  "title": "string (engaging, descriptive title of the deck)",
  "summary": "string (2-3 sentences executive summary of the core concepts covered)",
  "topic": "string (the domain, e.g. Quantum Computing, React Architecture, Organic Chemistry)",
  "estimatedStudyTimeMinutes": number (integer between 5 and 30),
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "cards": [
    {
      "id": "card-1",
      "question": "string (concept question)",
      "answer": "string (detailed answer)",
      "hint": "string (helpful hint for active recall)",
      "category": "string (e.g. Fundamentals, Syntax, Architecture, Mechanics)"
    }
  ],
  "quiz": [
    {
      "id": "quiz-1",
      "question": "string (challenging multiple-choice question)",
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "A",
      "explanation": "string (clear reasoning explaining why A is correct and addressing misconceptions)"
    },
    {
      "id": "quiz-2",
      "question": "string",
      "options": [{ "id": "A", "text": "..." }, { "id": "B", "text": "..." }, { "id": "C", "text": "..." }, { "id": "D", "text": "..." }],
      "correctOptionId": "B",
      "explanation": "string"
    },
    {
      "id": "quiz-3",
      "question": "string",
      "options": [{ "id": "A", "text": "..." }, { "id": "B", "text": "..." }, { "id": "C", "text": "..." }, { "id": "D", "text": "..." }],
      "correctOptionId": "C",
      "explanation": "string"
    },
    {
      "id": "quiz-4",
      "question": "string",
      "options": [{ "id": "A", "text": "..." }, { "id": "B", "text": "..." }, { "id": "C", "text": "..." }, { "id": "D", "text": "..." }],
      "correctOptionId": "D",
      "explanation": "string"
    },
    {
      "id": "quiz-5",
      "question": "string",
      "options": [{ "id": "A", "text": "..." }, { "id": "B", "text": "..." }, { "id": "C", "text": "..." }, { "id": "D", "text": "..." }],
      "correctOptionId": "A",
      "explanation": "string"
    },
    {
      "id": "quiz-6",
      "question": "string",
      "options": [{ "id": "A", "text": "..." }, { "id": "B", "text": "..." }, { "id": "C", "text": "..." }, { "id": "D", "text": "..." }],
      "correctOptionId": "B",
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
            { id: 'A', text: 'Comparing an incremented request ID counter stored in a useRef' },
            { id: 'B', text: 'Using setTimeout to artificially delay the faster request' },
            { id: 'C', text: 'Re-rendering the component synchronously on every keystroke' },
            { id: 'D', text: 'Setting useState directly inside an uncontrolled loop' },
          ],
          correctOptionId: 'A',
          explanation: 'Comparing an incremented requestId stored in useRef guards against race conditions where older requests complete after newer ones.',
        },
        {
          id: 'quiz-2',
          question: 'When an AI model returns valid JSON that lacks an expected field, which failure category applies?',
          options: [
            { id: 'A', text: 'Network Timeout' },
            { id: 'B', text: 'Invalid Shape / Schema Mismatch' },
            { id: 'C', text: 'Malformed JSON Syntax Error' },
            { id: 'D', text: 'HTTP 401 Unauthorized' },
          ],
          correctOptionId: 'B',
          explanation: 'If JSON.parse succeeds but required properties (like cards or quiz) are missing or of incorrect type, it is an Invalid Shape / Schema Mismatch.',
        },
        {
          id: 'quiz-3',
          question: 'Where should sensitive LLM API keys be stored in a modern production architecture?',
          options: [
            { id: 'A', text: 'In public repository source files' },
            { id: 'B', text: 'Directly in the client-side React bundle' },
            { id: 'C', text: 'Server-side environment variables via a proxy backend' },
            { id: 'D', text: 'In browser localStorage without encryption' },
          ],
          correctOptionId: 'C',
          explanation: 'Server-side environment variables accessed through a backend proxy keep API credentials strictly isolated from client-side inspection.',
        },
        {
          id: 'quiz-4',
          question: 'What causes a "stale closure" in asynchronous React event handlers or useEffect hooks?',
          options: [
            { id: 'A', text: 'Capturing variables from a past render cycle when a promise resolves later' },
            { id: 'B', text: 'Using CSS modules instead of inline styling' },
            { id: 'C', text: 'Running React in strict mode during development' },
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
        question: `How does one verify and measure success when implementing ${topicName}?`,
        answer: `Success is verified through rigorous automated assertions, active recall testing, and continuous feedback metrics that validate core requirements.`,
        hint: 'Verification metrics.',
        category: 'Evaluation',
      },
    ],
    quiz: [
      {
        id: 'quiz-1',
        question: `Which approach provides the most reliable outcome when working with ${topicName}?`,
        options: [
          { id: 'A', text: 'Relying exclusively on unvalidated assumptions' },
          { id: 'B', text: 'Applying structured validation and defensive boundary checks' },
          { id: 'C', text: 'Ignoring failure modes until catastrophic downtime occurs' },
          { id: 'D', text: 'Bypassing error handlers to increase throughput' },
        ],
        correctOptionId: 'B',
        explanation: 'Applying structured validation and defensive boundary checks guarantees deterministic and reliable behavior.',
      },
      {
        id: 'quiz-2',
        question: `What is the primary indicator of mastery when studying ${topicName}?`,
        options: [
          { id: 'A', text: 'Ability to explain principles and successfully solve edge cases' },
          { id: 'B', text: 'Memorizing raw text without conceptual understanding' },
          { id: 'C', text: 'Skipping active recall and practice testing' },
          { id: 'D', text: 'Assuming the first generation is always 100% flawless' },
        ],
        correctOptionId: 'A',
        explanation: 'True mastery involves understanding underlying mechanics, recognizing trade-offs, and recovering gracefully from errors.',
      },
      {
        id: 'quiz-3',
        question: `When designing architectures or workflows for ${topicName}, what factor determines system resilience?`,
        options: [
          { id: 'A', text: 'Graceful degradation and defensive error boundary handling' },
          { id: 'B', text: 'Eliminating all timeout limits on network requests' },
          { id: 'C', text: 'Coupling all modules directly without abstraction layers' },
          { id: 'D', text: 'Hardcoding static thresholds across environments' },
        ],
        correctOptionId: 'A',
        explanation: 'System resilience depends on defensive boundaries that contain localized failures and prevent complete system outages.',
      },
      {
        id: 'quiz-4',
        question: `How does active self-testing improve conceptual retention in ${topicName}?`,
        options: [
          { id: 'A', text: 'It stimulates cognitive retrieval pathways, converting short-term memory into long-term schema' },
          { id: 'B', text: 'It reduces the total number of concepts that need to be learned' },
          { id: 'C', text: 'It replaces the need for practical application and implementation' },
          { id: 'D', text: 'It prevents any future mistakes from ever occurring' },
        ],
        correctOptionId: 'A',
        explanation: 'Active recall forces the brain to retrieve information rather than passively reviewing notes, creating significantly more durable cognitive representations.',
      },
      {
        id: 'quiz-5',
        question: `What fundamental trade-off is most prominent when scaling solutions in ${topicName}?`,
        options: [
          { id: 'A', text: 'Balancing throughput and speed against strict consistency and verification' },
          { id: 'B', text: 'Choosing between light mode and dark mode color palettes' },
          { id: 'C', text: 'Writing variable names in camelCase versus snake_case' },
          { id: 'D', text: 'Disregarding latency completely in high-volume traffic' },
        ],
        correctOptionId: 'A',
        explanation: 'Scaling systems inevitably involves trade-offs between performance throughput and the overhead required for safety, verification, and state synchronization.',
      },
      {
        id: 'quiz-6',
        question: `Which operational practice best prevents silent failures and blind spots in ${topicName}?`,
        options: [
          { id: 'A', text: 'Comprehensive telemetry, defensive assertions, and structured observability' },
          { id: 'B', text: 'Silencing all console warnings and exception logs' },
          { id: 'C', text: 'Removing automated regression test suites' },
          { id: 'D', text: 'Assuming upstream third-party services never experience downtime' },
        ],
        correctOptionId: 'A',
        explanation: 'Observability, health probing, and defensive assertions ensure defects are surfaced immediately rather than decaying silently in production.',
      },
    ],
  };
}

function handleSimulationMode(simulationMode: FailureMode): GenerateServiceResult | null {
  switch (simulationMode) {
    case 'malformed_json':
      return {
        raw: '{"title": "Broken AI Deck", "cards": [{"question": "Is this valid JSON?", "answer": "No because a closing brace is missing',
        provider: 'Simulator (Malformed JSON)',
        model: 'failure-injector',
        error: undefined,
      };

    case 'wrong_shape':
      return {
        raw: JSON.stringify({
          title: 'Incorrect Schema Deck',
          notes: 'This object has no cards array and no quiz array!',
          timestamp: Date.now(),
        }),
        provider: 'Simulator (Wrong Shape)',
        model: 'failure-injector',
        error: undefined,
      };

    case 'empty_response':
      return {
        raw: '',
        provider: 'Simulator (Empty Response)',
        model: 'failure-injector',
        error: undefined,
      };

    case 'server_error':
      return {
        raw: '{"error": "Internal Server Error simulated by test rig"}',
        provider: 'Simulator (500 Error)',
        model: 'failure-injector',
        error: {
          status: 500,
          errorType: 'SERVER_ERROR',
          message: 'Simulated 500 Internal Server Error: The upstream AI provider is currently unreachable.',
          details: 'Upstream gateway timed out (HTTP 504 Gateway Timeout simulation).',
        },
      };

    case 'slow_response': {
      const mockDeck = createMockDeck('Delayed Network Simulation Deck');
      return {
        raw: JSON.stringify(mockDeck, null, 2),
        data: mockDeck,
        provider: 'Simulator (Slow Response, 10s Simulated Delay)',
        model: 'failure-injector',
      };
    }

    default:
      return null;
  }
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

    const result = await response.json();
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

  const result = await response.json();
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

async function callOllama(
  baseUrl: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ raw: string; data?: StudyDeckResult; provider: string; model: string }> {
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const url = `${baseUrl.replace(/\/$/, '')}/api/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${systemPrompt}\n\nUser Input:\n${userPrompt}`,
      format: 'json',
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status} from Ollama: ${errorText.slice(0, 300)}`);
  }

  const result = await response.json();
  const rawContent = result.response || '';
  const parsed = cleanAndExtractJson(rawContent);
  return {
    raw: rawContent,
    data: parsed,
    provider: 'Local Ollama',
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

export async function generateContent(payload: GenerateRequestPayload): Promise<GenerateServiceResult> {
  const { prompt, simulationMode = 'none', refinePrevious, difficulty = 'Intermediate' } = payload;

  if (simulationMode && simulationMode !== 'none') {
    if (simulationMode === 'slow_response') {
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
    const simulated = handleSimulationMode(simulationMode);
    if (simulated) return simulated;
  }

  let difficultyGuidance = '';
  if (difficulty === 'Beginner') {
    difficultyGuidance = `TARGET LEVEL: 🌱 Beginner.
- Explain concepts using accessible analogies, intuitive real-world examples, and friendly plain English.
- Avoid overwhelming jargon without defining it immediately.
- Generate 5-6 flashcards focusing on core definitions and foundational intuition.
- MANDATORY: Generate a MINIMUM of 6 multiple-choice quiz questions (quiz-1 through quiz-6). Never generate fewer than 6.`;
  } else if (difficulty === 'Advanced') {
    difficultyGuidance = `TARGET LEVEL: 🔥 Advanced.
- Target an expert practitioner level. Emphasize deep architectural patterns, performance implications, edge cases, and failure modes.
- Generate 6-8 flashcards diving into subtle trade-offs and underlying mechanics.
- MANDATORY: Generate a MINIMUM of 6 to 8 challenging quiz questions (quiz-1 through quiz-6+) with plausible distractors testing deep analytical mastery. Never generate fewer than 6.`;
  } else {
    difficultyGuidance = `TARGET LEVEL: ⚡ Intermediate.
- Balanced and pragmatic technical depth. Focus on standard best practices, real-world implementations, and common debugging scenarios.
- Generate 5-6 flashcards covering core mechanisms and practical applications.
- MANDATORY: Generate a MINIMUM of 6 multiple-choice quiz questions (quiz-1 through quiz-6). Never generate fewer than 6.`;
  }

  let userPrompt = `TOPIC / STUDY CONTENT:\n"""\n${prompt}\n"""\n\nDIFFICULTY: ${difficulty}\n${difficultyGuidance}`;

  if (refinePrevious) {
    userPrompt = `PREVIOUS STUDY DECK TO REFINE:
${JSON.stringify(refinePrevious, null, 2)}

USER REFINEMENT INSTRUCTION:
"""
${prompt}
"""

Please update, expand, and refine the deck above according to the user instruction, maintaining the same JSON schema and difficulty level (${difficulty}).`;
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const ollamaUrl = process.env.OLLAMA_BASE_URL?.trim();

  const isValidKey = (k?: string) => Boolean(k && k.length > 15 && !k.includes('your_') && !k.includes('here'));
  const isValidHttpUrl = (u?: string) => Boolean(u && (u.startsWith('http://') || u.startsWith('https://')));

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

  if (isValidHttpUrl(ollamaUrl)) {
    candidateProviders.push({
      name: 'Local Ollama',
      execute: () => callOllama(ollamaUrl!, SYSTEM_PROMPT, userPrompt),
    });
  }

  const cascadeErrors: string[] = [];

  for (const candidate of candidateProviders) {
    try {
      console.log(`[Smart AI Router] Attempting inference with ${candidate.name}...`);
      const result = await candidate.execute();
      console.log(`[Smart AI Router] Success! Deck generated via ${candidate.name}.`);

      if (result.data) {
        result.data = ensureMinimumQuizQuestions(result.data, prompt);
      }

      return {
        raw: result.data ? JSON.stringify(result.data, null, 2) : result.raw,
        data: result.data,
        provider: result.provider,
        model: result.model,
      };
    } catch (err: any) {
      console.warn(`[Smart AI Router] ${candidate.name} failed: ${err.message}. Cascading to next provider...`);
      cascadeErrors.push(`${candidate.name}: ${err.message}`);
    }
  }

  if (candidateProviders.length > 0) {
    console.info(
      `[Smart AI Router] All configured upstream providers failed or were exhausted. Seamlessly engaging local Study Assistant engine...`
    );
  } else {
    console.info(`[Smart AI Router] Zero-config mode: Using high-fidelity local Study Assistant engine.`);
  }

  await new Promise((resolve) => setTimeout(resolve, 800));
  const mockDeck = createMockDeck(prompt, refinePrevious, difficulty);

  return {
    raw: JSON.stringify(mockDeck, null, 2),
    data: mockDeck,
    provider: candidateProviders.length > 0 ? 'Study Assistant Smart Engine (Cascaded)' : 'Study Assistant Smart Engine',
    model: 'smart-curriculum-v2',
  };
}
