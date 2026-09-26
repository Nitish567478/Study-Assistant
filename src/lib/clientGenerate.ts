import { StudyDeckResult } from '../types/result';

export function generateClientDeck(
  prompt: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate',
  refinePrevious?: StudyDeckResult
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
          answer: 'A stale closure occurs when a callback captures variables from a past render cycle. In async operations, if a promise resolves after subsequent renders, reading state from that captured closure yields outdated values.',
          hint: 'Think about request race conditions.',
          category: 'Async State',
        },
        {
          id: 'card-2',
          question: 'How does useRef solve the stale response overwrite problem in API calls?',
          answer: 'useRef persists a mutable value across renders without triggering a re-render. By incrementing a requestId ref before every request, a resolving call can check if its captured id matches current.',
          hint: 'Guarding request IDs.',
          category: 'Concurrency',
        },
        {
          id: 'card-3',
          question: 'Why must LLM output always pass through defensive validation before state updates?',
          answer: 'LLMs are non-deterministic and can output malformed JSON, markdown fences, or missing required keys. Validating with a schema validator prevents runtime crashes and white screens.',
          hint: 'Zero crashes guarantee.',
          category: 'Resilience',
        },
        {
          id: 'card-4',
          question: 'What is the role of AbortController in managing user-initiated cancellations?',
          answer: 'AbortController generates an AbortSignal passed to fetch(). When abort() is invoked, ongoing network connections terminate immediately, freeing client and server resources.',
          hint: 'Signals and timeouts.',
          category: 'Network Control',
        },
        {
          id: 'card-5',
          question: 'Why should AI API keys never be shipped directly to the client browser?',
          answer: 'Client bundles and network requests are inspectable in browser DevTools. Exposing API keys allows unauthorized access, quota depletion, and security vulnerabilities.',
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
          explanation: 'Comparing an incrementing requestId stored in useRef ensures stale network responses are silently discarded.',
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
          explanation: 'Cascading through backup providers or falling back to local heuristic synthesis guarantees continuous availability.',
        },
        {
          id: 'quiz-3',
          question: 'Why should JSON schema validation occur before updating React component state?',
          options: [
            { id: 'A', text: 'To ensure malformed payloads never trigger runtime JavaScript errors' },
            { id: 'B', text: 'To compress network payloads for faster transmission' },
            { id: 'C', text: 'To encrypt data stored in localStorage' },
            { id: 'D', text: 'Because React requires all state objects to be frozen' },
          ],
          correctOptionId: 'A',
          explanation: 'Validating payload shape before state updates guarantees zero runtime crashes from malformed AI output.',
        },
        {
          id: 'quiz-4',
          question: 'What characterizes a "stale closure" in asynchronous React hooks?',
          options: [
            { id: 'A', text: 'An async callback retains references to values from an earlier render cycle' },
            { id: 'B', text: 'The browser closes the network socket prematurely' },
            { id: 'C', text: 'A CSS class selector fails to match any DOM node' },
            { id: 'D', text: 'Configuring Vite with custom port numbers' },
          ],
          correctOptionId: 'A',
          explanation: 'A stale closure captures variable snapshots from the render cycle where the callback was defined.',
        },
        {
          id: 'quiz-5',
          question: 'Why is AbortController preferred over boolean flags for network cancellations?',
          options: [
            { id: 'A', text: 'It terminates the underlying HTTP/TCP socket at browser level, conserving resources' },
            { id: 'B', text: 'It accelerates device CPU clock speed' },
            { id: 'C', text: 'It automatically formats raw text into JSON' },
            { id: 'D', text: 'It guarantees 100% server uptime' },
          ],
          correctOptionId: 'A',
          explanation: 'AbortController cancels the actual network socket immediately, avoiding wasted cellular/broadband bandwidth.',
        },
        {
          id: 'quiz-6',
          question: 'Which design pattern guarantees that React UI never crashes when rendering AI outputs?',
          options: [
            { id: 'A', text: 'Defensive schema validation and error boundaries before state updates' },
            { id: 'B', text: 'Passing raw unparsed strings directly into dangerouslySetInnerHTML' },
            { id: 'C', text: 'Removing all try-catch blocks to minimize bundle size' },
            { id: 'D', text: 'Assuming the AI model is always 100% deterministic' },
          ],
          correctOptionId: 'A',
          explanation: 'Defensive validation ensures every property and array shape is verified before React component state is updated.',
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
