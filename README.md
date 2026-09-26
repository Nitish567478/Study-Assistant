# Study Assistant — AI-Powered Interactive Learning

> A resilient, full-stack React study assistant that converts free-form text or unstructured notes into 3D interactive flashcards and adaptive mastery quizzes with strict JSON schema validation, defensive failure handling, multi-provider AI cascading, and zero browser-side API key exposure.

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Nitish567478/Study-Assistant)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)

---

## ⚡ Quickstart (Run Locally)

The project is designed so that `npm install && npm start` works out of the box with zero required configuration.

```bash
# 1. Clone the repository
git clone https://github.com/Nitish567478/Study-Assistant.git
cd Study-Assistant

# 2. Install dependencies
npm install

# 3. Start both the backend proxy and Vite dev server concurrently
npm start
```

Once started:
- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend AI Proxy Server**: [http://localhost:3001](http://localhost:3001) (Health check: `http://localhost:3001/api/health`)

---

## 🔑 LLM Provider Configuration (.env)

Study Assistant includes a built-in, high-fidelity **Smart Offline Engine** by default. You can immediately generate and explore complete flashcard decks and quiz matrices with zero configuration.

To connect a live cloud or local AI model, create a `.env` file in the root directory and configure any of the supported providers:

```bash
# Example .env configuration
PORT=3001
OPENROUTER_API_KEY=your_openrouter_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
```

| Provider | Environment Variable | Default Model | Free Tier Available? |
| :--- | :--- | :--- | :--- |
| **OpenRouter** | `OPENROUTER_API_KEY` | `meta-llama/llama-3.3-70b-instruct` | Yes ([OpenRouter](https://openrouter.ai/)) |
| **Groq Cloud** | `GROQ_API_KEY` | `qwen/qwen3.8-27b` / `llama-3.3-70b-versatile` | Yes ([Groq Console](https://console.groq.com/)) |
| **OpenAI** | `OPENAI_API_KEY` | `gpt-4o-mini` | Paid tier ([OpenAI Platform](https://platform.openai.com/)) |
| **Google Gemini** | `GEMINI_API_KEY` | `gemini-1.5-flash` | Yes ([Google AI Studio](https://aistudio.google.com/)) |
| **Local Ollama** | `OLLAMA_BASE_URL` | `llama3` (or `OLLAMA_MODEL`) | 100% Free / Local execution |
| **Smart Fallback** | *(Leave blank)* | Built-in contextual synthesis engine | No API key required |

### Smart Multi-Provider Cascade
The backend proxy intelligently cascades through your configured providers in order of speed and availability. If an upstream provider experiences rate limits or network errors, the router seamlessly falls back to the next available provider, ensuring continuous uptime with zero crashes.

---

## 🌟 Key Features

### 1. 🎴 3D Interactive Flashcard Deck (`FlashcardDeck.tsx`)
- **Realistic 3D Card Flip**: Smooth CSS 3D perspective transforms (`rotateY(180deg)`) triggered by clicking or pressing <kbd>Space</kbd>.
- **Active Recall Aids**: Expandable contextual hints designed to jog memory without revealing answers prematurely.
- **Progress Tracking & Mastery**: Mark cards as *Mastered* vs. *Needs Review*. An interactive progress track calculates mastery percentage in real time.
- **Review Filter Mode**: Isolate and drill unmastered cards until full confidence is achieved.
- **Audio Text-to-Speech (TTS)**: Listen to cards read aloud with browser Web Speech synthesis.
- **Deck Shuffling**: Randomize card order on demand to disrupt sequential memory patterns.
- **Keyboard Shortcuts**: <kbd>←</kbd> (Previous), <kbd>Space</kbd> (Flip), <kbd>→</kbd> (Next).

### 2. 🧩 Adaptive Interactive Quiz (`QuizMode.tsx`)
- **Minimum 6 Questions Per Deck**: Guarantees a comprehensive test matrix (quiz-1 through quiz-6+) for every generated topic.
- **Instant Visual Feedback & Explanations**: Immediate correct/incorrect indications along with deep rationales detailing why options are right and addressing misconceptions.
- **Comprehensive Score Matrix**: Accuracy percentage, performance rating, and question-by-question breakdown.
- **Celebratory Confetti**: Rewarding animations when achieving scores of 60% or higher.
- **🎯 "Re-test Wrong Answers" Mode**: One-click targeted review that filters the quiz down strictly to questions missed, allowing students to re-attempt until 100% accuracy is reached.
- **Keyboard Navigation**: Quick selection via keys <kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd> and <kbd>Enter</kbd> to submit.

### 3. 🎯 Beginner / Intermediate / Advanced Difficulty Control
- Interactive 3-stage segmented controller on the prompt card.
- **Beginner**: Focuses on foundational intuition, accessible analogies, and fundamental definitions.
- **Intermediate**: Covers standard implementations, practical mechanics, and common debugging workflows.
- **Advanced**: Emphasizes edge cases, system trade-offs, architecture patterns, and complex scenarios.

### 4. 📚 Study Library & Session History (`SessionHistory.tsx`)
- Decks are automatically saved to `localStorage` under the `study_assistant_sessions` namespace.
- **Instant Search**: Filter saved decks by topic, title, or concept.
- **Accordion Inspector**: Quick preview of flashcards and quiz questions directly inside the library modal.
- **Studio Loading**: One-click "View All Data in Studio" to restore any previous study deck into active mode.
- **JSON Export**: Export decks as clean JSON backups for sharing or offline archiving.
- **Starter Sample Decks**: Pre-loaded starter decks (React Hooks Architecture and Photosynthesis Biochemistry) ready for testing.

### 5. 🔄 Refinement Loop (`RefinementBar.tsx`)
- Enables follow-up conversational prompts (*"Make cards more advanced"*, *"Add 2 more edge-case questions"*, *"Simplify explanations"*) without losing previously generated study progress.

### 6. 🔊 Tactile Sound Feedback (`sound.ts`)
- Zero-dependency Web Audio API synthesizer providing subtle audio cues for card flips, correct quiz answers, incorrect attempts, and deck completion.
- Easily toggle audio on or off anytime via the header control.

### 7. 🌗 Modern UI & Light/Dark Theme Support
- Hand-crafted design system using CSS tokens (no Tailwind bloat).
- Seamless switching between dark slate glow mode and crisp paper light mode.
- Fully responsive across mobile, tablet, and widescreen desktop displays.

---

## 🛡️ Defensive Failure Handling & Chaos Bench

Handling unpredictable AI outputs is the central focus of this architecture. Study Assistant defends against all common failure modes:

| Failure Scenario | Upstream Cause | Defensive Protection |
| :--- | :--- | :--- |
| **Malformed JSON** | Unclosed brackets, raw markdown fences, or trailing commas from LLM | Stripped of code fences; caught by defensive JSON parser in `validateResult.ts`. Renders actionable `ErrorState` with expandable **Raw Output Inspector**. |
| **Invalid Schema / Missing Fields** | LLM omitted `cards` or `quiz` arrays | Strict structural assertion validates keys, types, and counts. Gracefully rejects corrupt shapes before updating React state. |
| **Empty Response** | Upstream provider returns zero bytes or blank string | Detected immediately and mapped to `EMPTY_RESPONSE` state with prompt advice. |
| **Slow Response / Timeout** | Upstream request exceeds 45 seconds | `AbortController` terminates the connection at 45s, preventing UI freezes and displaying `SLOW_RESPONSE`. |
| **Stale Responses / Race Conditions** | Slower older request completes after a newer request | Concurrency guard compares incremented `requestId.current`. Outdated requests are silently dropped. |
| **500 Server Error** | Upstream outage or quota exhaustion | HTTP error caught, status displayed, and one-click fallback to the built-in offline engine is offered. |

### In-UI Chaos Test Bench
Located directly on the studio home screen, the **Defensive AI Resilience Bench** allows evaluators to simulate each failure mode (Malformed JSON, Wrong Shape, Empty Response, Server 500, and Slow Response) with a single click to inspect the defensive recovery behavior.

---

## 🏗️ Architecture & Project Structure

```
Study-Assistant/
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Branding, library modal trigger, audio & theme switches
│   │   ├── PromptInput.tsx        # Topic textarea, difficulty selector, quick-start pills & chaos bench
│   │   ├── ResultView.tsx         # Layout orchestrator for Flashcards, Quiz, Overview & Refinement
│   │   ├── FlashcardDeck.tsx      # 3D perspective flip cards, audio TTS, hints, review filter
│   │   ├── QuizMode.tsx           # Minimum 6 quiz questions, explanations, scoring & re-test mode
│   │   ├── RefinementBar.tsx      # Follow-up prompt loop for deck iteration
│   │   ├── SessionHistory.tsx     # Study library drawer, search, accordion inspector & export
│   │   ├── LoadingState.tsx       # Progress timeline, elapsed timer & cancel button
│   │   └── ErrorState.tsx         # Defensive error screen with raw payload inspector
│   ├── data/
│   │   └── starterSessions.ts     # Pre-configured sample study sessions
│   ├── lib/
│   │   ├── api.ts                 # Client proxy client with AbortController & timeout handling
│   │   ├── sound.ts               # Zero-dependency Web Audio API synthesizer
│   │   └── validateResult.ts      # Defensive JSON parser & schema validator
│   ├── types/
│   │   └── result.ts              # Strict TypeScript definitions for cards, quiz, and errors
│   ├── index.css                  # Curated design system (themes, 3D transforms, responsive layout)
│   ├── App.tsx                    # State orchestration & stale response concurrency guard
│   └── main.tsx                   # React root entry point
├── server/
│   ├── index.ts                   # Express proxy server on port 3001 with health check endpoint
│   └── generate.ts                # Multi-provider cascade router & simulation generator
├── .gitignore                     # Git ignore rules protecting private files & credentials
├── package.json                   # Project manifest & scripts
├── README.md                      # Comprehensive documentation
├── tsconfig.json                  # TypeScript compiler configuration
└── vite.config.ts                 # Vite bundler configuration
```

---

## 📜 Available Scripts

- `npm start` / `npm run dev`: Starts the backend proxy server (`localhost:3001`) and Vite dev server (`localhost:5173`) concurrently.
- `npm run build`: Type-checks TypeScript files and compiles the production bundle into `dist/`.
- `npm run client:dev`: Launches only the Vite client.
- `npm run server:dev`: Launches only the Express backend with hot-reload via `tsx watch`.
- `npm run client:preview`: Previews the production build locally.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
