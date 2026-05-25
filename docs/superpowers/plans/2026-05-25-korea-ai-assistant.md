# Korea AI Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold and wire up the full Korea AI Assistant — a Next.js 14 web app where foreigners paste Korean government page text and get AI explanations in RU/EN/UZ.

**Architecture:** Next.js App Router, Vercel AI SDK v5 (`ai` + `@ai-sdk/google`), Gemini Flash. `useChat` (from `@ai-sdk/react`) on the client sends messages to `/api/ask`; the route calls `streamText` with a Korean-context system prompt and returns a `UIMessageStreamResponse`. No separate backend — API key stays server-side only.

**Tech Stack:** Next.js 14, Tailwind CSS, Vercel AI SDK v5 (`ai`, `@ai-sdk/google`), `@ai-sdk/react`, `react-markdown`, `@tailwindcss/typography`, Jest (node env)

---

## File Map

| File | Responsibility |
|---|---|
| `app/api/ask/route.js` | POST handler — build system prompt, call Gemini, stream response |
| `lib/buildSystemPrompt.js` | Pure function — assemble system prompt string from params |
| `services/knowledgeBase.js` | `getRagContext()` stub → `""` |
| `constants/sites.js` | `SITES` array |
| `constants/quickPrompts.js` | `QUICK_PROMPTS` array |
| `constants/languages.js` | `LANGUAGES` array |
| `components/MessageBubble.jsx` | Single message — user (right) or AI (left, markdown) |
| `components/QuickPrompts.jsx` | Preset prompt buttons |
| `components/SiteLinks.jsx` | Korean gov site links |
| `components/LanguageSelector.jsx` | RU/EN/UZ switcher + localStorage |
| `components/ChatWindow.jsx` | `useChat` hook, message list, textarea, input, QuickPrompts |
| `app/page.jsx` | Root page — holds `language`/`pageContent`/`url` state |
| `app/layout.jsx` | Root layout — title, fonts, global CSS |
| `data/knowledge/README.md` | Phase 3 RAG placeholder |
| `.env.example` | Committed env template |
| `__tests__/buildSystemPrompt.test.js` | Unit tests for prompt builder |
| `__tests__/knowledgeBase.test.js` | Unit test for getRagContext stub |

---

## Task 1: Bootstrap Project

**Files:**
- Create: project root (create-next-app)
- Create: `.env.example`
- Create: `.env.local` (not committed)
- Modify: `tailwind.config.js` — add typography plugin
- Create: `jest.config.js`

- [ ] **Step 1: Run create-next-app**

```bash
cd c:\Users\maksi\Desktop\ai_helper
npx create-next-app@latest . --javascript --tailwind --eslint --app --no-src-dir --no-import-alias
```

Accept all prompts with defaults. When complete, confirm these files exist: `app/page.js` (or `.jsx`), `tailwind.config.js`, `next.config.mjs`.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install ai @ai-sdk/google @ai-sdk/react react-markdown @tailwindcss/typography
```

Expected: all packages install without peer-dependency errors.

- [ ] **Step 3: Install dev dependencies**

```bash
npm install --save-dev jest
```

- [ ] **Step 4: Create .env.example**

```bash
# .env.example
GEMINI_API_KEY=your_key_here
```

File path: `.env.example`

- [ ] **Step 5: Create .env.local**

```bash
# .env.local — never commit this file
GEMINI_API_KEY=
```

File path: `.env.local`

Add `.env.local` to `.gitignore` if not already present (create-next-app adds it by default).

- [ ] **Step 6: Add typography plugin to tailwind.config.js**

Open `tailwind.config.js`. Replace its entire content with:

```js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
};

module.exports = config;
```

- [ ] **Step 7: Create jest.config.js**

```js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
};
```

File path: `jest.config.js`

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: `✓ Ready on http://localhost:3000`. Kill with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git init
git add .
git commit -m "chore: bootstrap Next.js project with Tailwind, AI SDK, Jest"
```

---

## Task 2: Constants

**Files:**
- Create: `constants/sites.js`
- Create: `constants/quickPrompts.js`
- Create: `constants/languages.js`

No tests needed — these are static data arrays.

- [ ] **Step 1: Create constants/sites.js**

```js
export const SITES = [
  { name: 'HiKorea',     url: 'https://www.hikorea.go.kr',     desc: 'Visa & ARC' },
  { name: 'Immigration', url: 'https://www.immigration.go.kr', desc: 'Immigration office' },
  { name: 'Gov.kr',      url: 'https://www.gov.kr',            desc: 'Government portal' },
  { name: 'Health Ins.', url: 'https://www.nhis.or.kr',        desc: 'NHIS' },
  { name: 'Pension',     url: 'https://www.nps.or.kr',         desc: 'NPS' },
  { name: 'Hometax',     url: 'https://www.hometax.go.kr',     desc: 'Tax' },
];
```

- [ ] **Step 2: Create constants/quickPrompts.js**

```js
export const QUICK_PROMPTS = [
  { label: 'Check visa expiry',  text: 'Find and explain my visa expiry date' },
  { label: 'Extend ARC',         text: 'How do I extend my Alien Registration Card?' },
  { label: 'Book appointment',   text: 'How do I book an immigration appointment?' },
  { label: 'Change visa status', text: 'How do I change my visa type?' },
  { label: 'Health insurance',   text: 'Explain my health insurance status' },
  { label: 'What is this page?', text: 'Explain what this page is and what I should do' },
];
```

- [ ] **Step 3: Create constants/languages.js**

```js
export const LANGUAGES = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'uz', label: 'UZ' },
];
```

- [ ] **Step 4: Commit**

```bash
git add constants/
git commit -m "feat: add sites, quickPrompts, languages constants"
```

---

## Task 3: knowledgeBase Service (TDD)

**Files:**
- Create: `__tests__/knowledgeBase.test.js`
- Create: `services/knowledgeBase.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/knowledgeBase.test.js
const { getRagContext } = require('../services/knowledgeBase');

test('getRagContext returns empty string', () => {
  expect(getRagContext()).toBe('');
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/knowledgeBase.test.js
```

Expected output: `FAIL __tests__/knowledgeBase.test.js` with "Cannot find module '../services/knowledgeBase'"

- [ ] **Step 3: Implement knowledgeBase.js**

```js
// services/knowledgeBase.js
function getRagContext() {
  return '';
}

module.exports = { getRagContext };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest __tests__/knowledgeBase.test.js
```

Expected output: `PASS __tests__/knowledgeBase.test.js` — 1 test passing.

- [ ] **Step 5: Commit**

```bash
git add services/knowledgeBase.js __tests__/knowledgeBase.test.js
git commit -m "feat: add knowledgeBase stub with getRagContext"
```

---

## Task 4: buildSystemPrompt Helper (TDD)

**Files:**
- Create: `__tests__/buildSystemPrompt.test.js`
- Create: `lib/buildSystemPrompt.js`

- [ ] **Step 1: Write failing tests**

```js
// __tests__/buildSystemPrompt.test.js
const { buildSystemPrompt } = require('../lib/buildSystemPrompt');

test('includes language in prompt', () => {
  const prompt = buildSystemPrompt({ language: 'ru', pageContent: '', url: '', ragContext: '' });
  expect(prompt).toContain('ru');
});

test('includes url when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: '',
    url: 'https://www.hikorea.go.kr',
    ragContext: '',
  });
  expect(prompt).toContain('https://www.hikorea.go.kr');
});

test('includes pageContent when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: 'visa expires 2025-01-01',
    url: '',
    ragContext: '',
  });
  expect(prompt).toContain('visa expires 2025-01-01');
});

test('omits page content section when pageContent is empty', () => {
  const prompt = buildSystemPrompt({ language: 'en', pageContent: '', url: '', ragContext: '' });
  expect(prompt).not.toContain('Page content:');
});

test('includes ragContext when provided', () => {
  const prompt = buildSystemPrompt({
    language: 'en',
    pageContent: '',
    url: '',
    ragContext: 'E-7 visa requires employer sponsorship',
  });
  expect(prompt).toContain('E-7 visa requires employer sponsorship');
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/buildSystemPrompt.test.js
```

Expected: `FAIL` — "Cannot find module '../lib/buildSystemPrompt'"

- [ ] **Step 3: Implement buildSystemPrompt.js**

```js
// lib/buildSystemPrompt.js
function buildSystemPrompt({ language, pageContent, url, ragContext }) {
  const lines = [
    'You are a helpful assistant for foreigners living in Korea.',
    'The user needs help understanding Korean government websites and procedures.',
    '',
    'Your job:',
    '- Explain what the content means in simple terms',
    '- Answer questions about what to do next',
    '- Translate and explain Korean bureaucratic terms',
    '- Give step-by-step guidance when asked',
    '',
    `User's language: ${language}`,
  ];

  if (url) lines.push(`Page URL: ${url}`);
  if (pageContent) {
    lines.push('Page content:');
    lines.push(pageContent);
  }

  lines.push('');
  lines.push('Rules:');
  lines.push(`- Always respond in ${language}`);
  lines.push('- Be concise — the user is likely on a phone');
  lines.push('- If you see visa expiry dates, highlight them clearly');
  lines.push('- Format dates and deadlines prominently');
  lines.push('- If no page content is given, answer from general knowledge about Korea');

  if (ragContext) {
    lines.push('');
    lines.push('Visa knowledge context:');
    lines.push(ragContext);
  }

  return lines.join('\n');
}

module.exports = { buildSystemPrompt };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/buildSystemPrompt.test.js
```

Expected: `PASS` — 5 tests passing.

- [ ] **Step 5: Commit**

```bash
git add lib/buildSystemPrompt.js __tests__/buildSystemPrompt.test.js
git commit -m "feat: add buildSystemPrompt helper with tests"
```

---

## Task 5: API Route /api/ask

**Files:**
- Create: `app/api/ask/route.js`

This is the only server-side file that touches the API key.

- [ ] **Step 1: Create the route handler**

```js
// app/api/ask/route.js
import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildSystemPrompt } from '../../lib/buildSystemPrompt';
import { getRagContext } from '../../services/knowledgeBase';

export const maxDuration = 30;

export async function POST(req) {
  const { messages, language = 'ru', pageContent = '', url = '' } = await req.json();

  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: buildSystemPrompt({
      language,
      pageContent: pageContent.slice(0, 4000),
      url,
      ragContext: getRagContext(),
    }),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

- [ ] **Step 2: Add your real API key to .env.local**

Open `.env.local` and fill in your Gemini API key:

```
GEMINI_API_KEY=AIza...your_key_here
```

Get a free key at https://aistudio.google.com/app/apikey

- [ ] **Step 3: Smoke-test the route with curl**

Start the dev server in one terminal:
```bash
npm run dev
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"What is HiKorea?"}]}],"language":"en","pageContent":"","url":""}'
```

Expected: a streaming text response (SSE chunks) starting with `f:` or `0:` protocol bytes, followed by text tokens about HiKorea. A 500 error means the API key is missing or wrong.

- [ ] **Step 4: Commit**

```bash
git add app/api/ask/route.js
git commit -m "feat: add /api/ask route with Gemini streaming"
```

---

## Task 6: MessageBubble Component

**Files:**
- Create: `components/MessageBubble.jsx`

- [ ] **Step 1: Create the component**

```jsx
// components/MessageBubble.jsx
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, parts }) {
  const text = (parts ?? [])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('');

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm whitespace-pre-wrap">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/MessageBubble.jsx
git commit -m "feat: add MessageBubble component"
```

---

## Task 7: QuickPrompts Component

**Files:**
- Create: `components/QuickPrompts.jsx`

- [ ] **Step 1: Create the component**

```jsx
// components/QuickPrompts.jsx
import { QUICK_PROMPTS } from '../constants/quickPrompts';

export default function QuickPrompts({ onSend }) {
  return (
    <div className="p-4">
      <p className="text-xs text-gray-500 mb-3 text-center">Quick questions</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt.label}
            onClick={() => onSend(prompt.text)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded-full border border-gray-200 transition-colors"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/QuickPrompts.jsx
git commit -m "feat: add QuickPrompts component"
```

---

## Task 8: SiteLinks Component

**Files:**
- Create: `components/SiteLinks.jsx`

- [ ] **Step 1: Create the component**

```jsx
// components/SiteLinks.jsx
import { SITES } from '../constants/sites';

export default function SiteLinks() {
  return (
    <div className="px-4 py-3 border-b bg-gray-50">
      <p className="text-xs text-gray-500 mb-2">Korean government sites</p>
      <div className="flex flex-wrap gap-2">
        {SITES.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white border border-gray-200 rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50 transition-colors"
            title={site.desc}
          >
            {site.name}
          </a>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SiteLinks.jsx
git commit -m "feat: add SiteLinks component"
```

---

## Task 9: LanguageSelector Component

**Files:**
- Create: `components/LanguageSelector.jsx`

Uses `useEffect` to read/write `localStorage` — safe from SSR because `localStorage` access is deferred.

- [ ] **Step 1: Create the component**

```jsx
// components/LanguageSelector.jsx
'use client';

import { useEffect } from 'react';
import { LANGUAGES } from '../constants/languages';

export default function LanguageSelector({ language, setLanguage }) {
  useEffect(() => {
    const saved = localStorage.getItem('preferred_language');
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLanguage(saved);
    }
  }, [setLanguage]);

  const handleSelect = (code) => {
    setLanguage(code);
    localStorage.setItem('preferred_language', code);
  };

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => handleSelect(lang.code)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/LanguageSelector.jsx
git commit -m "feat: add LanguageSelector with localStorage persistence"
```

---

## Task 10: ChatWindow Component

**Files:**
- Create: `components/ChatWindow.jsx`

This is the most complex component. It owns the `useChat` hook and composes `MessageBubble`, `QuickPrompts`, and the paste textarea.

- [ ] **Step 1: Create the component**

```jsx
// components/ChatWindow.jsx
'use client';

import { useCallback, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageBubble from './MessageBubble';
import QuickPrompts from './QuickPrompts';

export default function ChatWindow({ language, pageContent, setPageContent, url, setUrl }) {
  const [input, setInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ask' }),
  });

  const send = useCallback(
    (text) => {
      sendMessage({ text }, { body: { language, pageContent, url } });
    },
    [sendMessage, language, pageContent, url],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Paste area toggle */}
      <div className="px-4 py-2 border-b bg-gray-50 flex items-center gap-2">
        <button
          onClick={() => setShowPaste(v => !v)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showPaste ? 'Hide paste area ▲' : 'Paste page content ▼'}
        </button>
        {pageContent && (
          <span className="text-xs text-gray-500">
            {pageContent.length} chars pasted
          </span>
        )}
      </div>

      {showPaste && (
        <div className="px-4 py-2 border-b bg-gray-50">
          <textarea
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            placeholder="Paste text from a Korean government website here..."
            rows={4}
            className="w-full text-xs border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Page URL (optional)"
            className="w-full text-xs border rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
        {messages.length === 0 ? (
          <QuickPrompts onSend={send} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} parts={message.parts} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2 text-sm text-gray-400">
              Thinking…
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask a question…"
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ChatWindow.jsx
git commit -m "feat: add ChatWindow with useChat, streaming, paste area"
```

---

## Task 11: app/page.jsx

**Files:**
- Modify: `app/page.jsx` (replace the create-next-app default entirely)

- [ ] **Step 1: Replace app/page.jsx**

```jsx
// app/page.jsx
'use client';

import { useState } from 'react';
import ChatWindow from '../components/ChatWindow';
import LanguageSelector from '../components/LanguageSelector';
import SiteLinks from '../components/SiteLinks';

export default function Home() {
  const [language, setLanguage] = useState('ru');
  const [pageContent, setPageContent] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Korea AI Helper</h1>
          <p className="text-xs text-gray-500">Navigate Korean government sites</p>
        </div>
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </header>

      {/* Site links */}
      <SiteLinks />

      {/* Chat — takes remaining height */}
      <ChatWindow
        language={language}
        pageContent={pageContent}
        setPageContent={setPageContent}
        url={url}
        setUrl={setUrl}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.jsx
git commit -m "feat: compose main page with header, site links, and chat"
```

---

## Task 12: app/layout.jsx + globals.css

**Files:**
- Modify: `app/layout.jsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update app/layout.jsx**

Replace the full content of `app/layout.jsx` with:

```jsx
// app/layout.jsx
import './globals.css';

export const metadata = {
  title: 'Korea AI Helper',
  description: 'AI assistant for foreigners navigating Korean government websites',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Simplify globals.css**

Replace `app/globals.css` with just the Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.jsx app/globals.css
git commit -m "feat: update layout and globals for Korea AI Helper"
```

---

## Task 13: Placeholder Files

**Files:**
- Create: `data/knowledge/README.md`

- [ ] **Step 1: Create data/knowledge/README.md**

```markdown
# Knowledge Base

Plain-text visa and immigration documents for RAG (Phase 3).

Add `.txt` files here. Each file will be chunked and indexed for semantic search.
```

- [ ] **Step 2: Verify .env.example is committed**

```bash
git status
```

Confirm `.env.example` is tracked. If not:
```bash
git add .env.example
```

- [ ] **Step 3: Commit**

```bash
git add data/knowledge/README.md .env.example
git commit -m "chore: add knowledge base placeholder and env example"
```

---

## Task 14: End-to-End Verification

- [ ] **Step 1: Run all tests**

```bash
npx jest
```

Expected: `PASS` — 6 tests total (1 knowledgeBase + 5 buildSystemPrompt).

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: `✓ Ready on http://localhost:3000`

- [ ] **Step 3: Open browser and verify**

Navigate to `http://localhost:3000`. Confirm:
- Header shows "Korea AI Helper" with language buttons (RU / EN / UZ)
- Six Korean gov site links render below header
- Six quick prompt buttons show in the chat area
- No console errors

- [ ] **Step 4: Test quick prompt**

Click "What is this page?" button. Expected: the question appears as a user bubble, "Thinking…" shows briefly, then a streaming AI response appears in an AI bubble.

- [ ] **Step 5: Test typed message**

Type "How do I renew my ARC?" in the input and press Send. Expected: streaming response in chosen language.

- [ ] **Step 6: Test language switch**

Switch to EN, ask a question. Expected: AI responds in English.
Switch to RU, ask a question. Expected: AI responds in Russian.
Reload the page. Expected: language persists (localStorage).

- [ ] **Step 7: Test paste area**

Click "Paste page content ▼". Paste a few lines of Korean text in the textarea. Ask "What does this say?". Expected: AI explains the pasted content.

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: verify end-to-end — Korea AI Assistant MVP complete"
```
