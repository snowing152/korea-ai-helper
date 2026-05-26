# Claude-Style UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Korea AI Helper UI to match Claude.ai's visual aesthetic — warm cream background, warm-gray user bubbles, amber accent, 2-column quick-prompt cards, and an expandable textarea input with the send button inside.

**Architecture:** Pure visual layer change — no routing, API, or business logic is touched. All 9 file edits are isolated to CSS variables, Tailwind class names, and one input component refactor (single-line → expandable textarea). Existing unit tests for `lib/` and `services/` must still pass after every task.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS v4, React 18

---

## File Map

| File | Change |
|---|---|
| `app/globals.css` | Replace `--background`/`--foreground` vars with warm palette; remove dark-mode media query |
| `app/layout.js` | Body bg: `bg-gray-100` → `bg-[#FAF9F5]` |
| `app/page.js` | Container: `bg-white shadow-sm` → `bg-[#FAF9F5]` |
| `constants/quickPrompts.js` | Add `subtitle` field to each prompt object |
| `components/LanguageSelector.jsx` | Active: blue → amber; inactive: gray → warm cream |
| `components/SiteLinks.jsx` | Container + link chip colors → warm palette |
| `components/QuickPrompts.jsx` | Replace pill buttons with 2-column card grid |
| `components/MessageBubble.jsx` | User bubble: blue → warm gray `#EDE9E3`; AI bubble border: warm |
| `components/ChatWindow.jsx` | Input redesign: single-line form → expandable textarea box; paste area + message list bg |

---

## Task 1: CSS Variables + Page Backgrounds

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.js`
- Modify: `app/page.js`

- [ ] **Step 1: Update `app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {
  --background: #FAF9F5;
  --foreground: #1A1A1A;
  --border-warm: #EDE9E3;
  --bubble-user: #EDE9E3;
  --accent: #D97706;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

- [ ] **Step 2: Update `app/layout.js`**

Replace the entire file with:

```js
import './globals.css';

export const metadata = {
  title: 'Korea AI Helper',
  description: 'AI assistant for foreigners navigating Korean government websites',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] min-h-screen">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `app/page.js`**

Change the outer container div — remove `bg-white shadow-sm`, replace with `bg-[#FAF9F5]`:

```js
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
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-[#FAF9F5]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#EDE9E3] bg-white">
        <div>
          <h1 className="text-base font-semibold text-[#1A1A1A]">Korea AI Helper</h1>
          <p className="text-xs text-[#9CA3AF]">Navigate Korean government sites</p>
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

- [ ] **Step 4: Verify no test regressions**

Run: `npm test`

Expected: all tests pass (buildSystemPrompt + knowledgeBase tests). These files are untouched so this should be instant.

- [ ] **Step 5: Verify visually**

Run: `npm run dev`

Open `http://localhost:3000`. Verify:
- Page background is warm cream (not white or gray)
- Header is white with warm border
- No dark mode flickering

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.js app/page.js
git commit -m "style: warm cream background and CSS palette variables"
```

---

## Task 2: Header Components — LanguageSelector + SiteLinks

**Files:**
- Modify: `components/LanguageSelector.jsx`
- Modify: `components/SiteLinks.jsx`

- [ ] **Step 1: Update `components/LanguageSelector.jsx`**

Replace the entire file with:

```jsx
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
              ? 'bg-[#D97706] text-white'
              : 'bg-[#F5F3EF] text-gray-600 border border-[#E5E5E5] hover:bg-[#EDE9E3]'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update `components/SiteLinks.jsx`**

Replace the entire file with:

```jsx
import { SITES } from '../constants/sites';

export default function SiteLinks() {
  return (
    <div className="px-4 py-3 border-b border-[#EDE9E3] bg-white">
      <p className="text-xs text-[#9CA3AF] mb-2">Korean government sites</p>
      <div className="flex flex-wrap gap-2">
        {SITES.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-[#F5F3EF] border border-[#E5E5E5] rounded-md px-2 py-1 text-[#D97706] hover:bg-[#EDE9E3] transition-colors"
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

- [ ] **Step 3: Verify visually**

Run `npm run dev` (or check existing dev server).

Open `http://localhost:3000`. Verify:
- Active language button is amber, not blue
- Inactive language buttons are warm cream with warm border
- Site link chips are amber-colored text on cream background

- [ ] **Step 4: Commit**

```bash
git add components/LanguageSelector.jsx components/SiteLinks.jsx
git commit -m "style: amber accent and warm palette for header components"
```

---

## Task 3: Quick Prompts — Constants + Card Grid

**Files:**
- Modify: `constants/quickPrompts.js`
- Modify: `components/QuickPrompts.jsx`

- [ ] **Step 1: Update `constants/quickPrompts.js`**

Add a `subtitle` field to every prompt. Replace the entire file with:

```js
export const QUICK_PROMPTS = [
  { label: 'Check visa expiry',   subtitle: 'Find & explain dates',   text: 'Find and explain my visa expiry date' },
  { label: 'Extend ARC',          subtitle: 'Step-by-step guide',     text: 'How do I extend my Alien Registration Card?' },
  { label: 'Book appointment',    subtitle: 'Immigration office',     text: 'How do I book an immigration appointment?' },
  { label: 'Change visa status',  subtitle: 'Visa type change',       text: 'How do I change my visa type?' },
  { label: 'Health insurance',    subtitle: 'NHIS status',            text: 'Explain my health insurance status' },
  { label: 'What is this page?',  subtitle: 'Explain & guide me',     text: 'Explain what this page is and what I should do' },
];
```

- [ ] **Step 2: Update `components/QuickPrompts.jsx`**

Replace the pill button layout with a 2-column card grid. Replace the entire file with:

```jsx
import { QUICK_PROMPTS } from '../constants/quickPrompts';

export default function QuickPrompts({ onSend }) {
  return (
    <div className="p-5">
      <p className="text-sm font-semibold text-[#1A1A1A] mb-1 text-center">
        How can I help you today?
      </p>
      <p className="text-xs text-[#9CA3AF] mb-4 text-center">
        Paste content from a Korean site, or just ask a question
      </p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt.label}
            onClick={() => onSend(prompt.text)}
            className="bg-white border border-[#EDE9E3] rounded-xl p-3 text-left hover:border-[#D97706] transition-colors"
          >
            <div className="text-xs font-medium text-[#1A1A1A]">{prompt.label}</div>
            <div className="text-[10px] text-[#9CA3AF] mt-0.5">{prompt.subtitle}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify visually**

Open `http://localhost:3000` with no messages sent yet. Verify:
- Quick prompts show as a 2-column grid of cards
- Each card has a bold label and a small gray subtitle
- Hovering a card shows an amber border
- Clicking a card sends the prompt (chat should start)

- [ ] **Step 4: Commit**

```bash
git add constants/quickPrompts.js components/QuickPrompts.jsx
git commit -m "style: quick prompts redesigned as 2-column card grid"
```

---

## Task 4: Message Bubbles

**Files:**
- Modify: `components/MessageBubble.jsx`

- [ ] **Step 1: Update `components/MessageBubble.jsx`**

Change user bubble from blue to warm gray, and AI bubble border to warm tone. Replace the entire file with:

```jsx
import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, parts }) {
  const text = (parts ?? [])
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('');

  const images = (parts ?? []).filter(p => p.type === 'file' && p.url);

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-[#EDE9E3] text-[#1A1A1A] rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] text-sm">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt="attachment"
              className="rounded-lg mb-2 max-h-48 max-w-full"
            />
          ))}
          {text && <p className="whitespace-pre-wrap">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-[#EDE9E3] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%] text-sm prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-[#1A1A1A]">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

Send a message in the chat. Verify:
- User bubble is warm gray (`#EDE9E3`) with dark text — not blue
- AI bubble is white with a warm gray border
- Image attachments still show inside the user bubble correctly

- [ ] **Step 3: Commit**

```bash
git add components/MessageBubble.jsx
git commit -m "style: warm-gray user bubble, warm-border AI bubble"
```

---

## Task 5: ChatWindow — Input Redesign + Background Colors

**Files:**
- Modify: `components/ChatWindow.jsx`

This is the most involved task. The changes are:
1. Paste area toggle: `bg-gray-50` → `bg-white border-[#EDE9E3]`
2. Message list: `bg-gray-50` → `bg-[#FAF9F5]`
3. "Thinking…" bubble: gray border → warm border
4. Remove `<form onSubmit>` wrapper entirely
5. Add `textareaRef`; refactor `handleSubmit` to take no event
6. Replace input row with expandable textarea box

- [ ] **Step 1: Replace `components/ChatWindow.jsx`**

Replace the entire file with:

```jsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import MessageBubble from './MessageBubble';
import QuickPrompts from './QuickPrompts';

export default function ChatWindow({ language, pageContent, setPageContent, url, setUrl }) {
  const [input, setInput] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, mimeType }
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ask' }),
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage({ dataUrl: reader.result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const send = useCallback(
    (text, image) => {
      if (image) {
        sendMessage(
          {
            role: 'user',
            parts: [
              { type: 'file', mediaType: image.mimeType, url: image.dataUrl },
              { type: 'text', text },
            ],
          },
          { body: { language, pageContent, url } },
        );
      } else {
        sendMessage({ text }, { body: { language, pageContent, url } });
      }
    },
    [sendMessage, language, pageContent, url],
  );

  const handleSubmit = () => {
    if (!input.trim() && !pendingImage) return;
    send(input, pendingImage);
    setInput('');
    setPendingImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Paste area toggle */}
      <div className="px-4 py-2 border-b border-[#EDE9E3] bg-white flex items-center gap-2">
        <button
          onClick={() => setShowPaste(v => !v)}
          className="text-xs text-[#D97706] hover:underline"
        >
          {showPaste ? 'Hide paste area ▲' : 'Paste page content ▼'}
        </button>
        {pageContent && (
          <span className="text-xs text-[#9CA3AF]">
            {pageContent.length} chars pasted
          </span>
        )}
      </div>

      {showPaste && (
        <div className="px-4 py-2 border-b border-[#EDE9E3] bg-white">
          <textarea
            value={pageContent}
            onChange={(e) => setPageContent(e.target.value)}
            placeholder="Paste text from a Korean government website here..."
            rows={4}
            className="w-full text-xs border border-[#EDE9E3] rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Page URL (optional)"
            className="w-full text-xs border border-[#EDE9E3] rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          />
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F5] min-h-0">
        {messages.length === 0 ? (
          <QuickPrompts onSend={send} />
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} role={message.role} parts={message.parts} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-[#EDE9E3] rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-[#9CA3AF]">
              Thinking…
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {pendingImage && (
        <div className="px-4 py-2 border-t border-[#EDE9E3] bg-white flex items-center gap-2">
          <img
            src={pendingImage.dataUrl}
            alt="pending attachment"
            className="h-16 w-16 object-cover rounded-lg border border-[#EDE9E3]"
          />
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="text-xs text-red-400 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      )}

      {/* Claude-style textarea input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <div className="p-3 bg-[#FAF9F5]">
        <div className="bg-white border border-[#DDDDDD] rounded-2xl px-4 py-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={isLoading}
            placeholder="Ask a question…"
            rows={1}
            className="w-full resize-none text-sm focus:outline-none bg-transparent text-[#1A1A1A] placeholder-[#C0BBB5] max-h-40 overflow-y-auto disabled:opacity-50"
          />
          <div className="flex justify-between items-center mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="text-[#BBBBBB] hover:text-[#D97706] transition-colors disabled:opacity-40 text-lg"
              title="Attach image"
            >
              📷
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className="bg-[#D97706] disabled:bg-[#E5E0D8] text-white disabled:text-[#9CA3AF] rounded-lg w-7 h-7 flex items-center justify-center transition-colors text-sm font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run tests**

Run: `npm test`

Expected: all tests pass. ChatWindow is not covered by unit tests, so this just confirms no import errors in the build pipeline.

- [ ] **Step 3: Verify visually — empty state**

Open `http://localhost:3000`. Verify:
- Paste area toggle uses amber text, white background
- Chat area is cream (`#FAF9F5`)
- Bottom input is a white rounded box with a textarea
- 📷 icon on the left of the input box
- Amber ↑ send button on the right (grayed out when empty)
- Typing in the textarea makes it grow taller
- Pressing Enter submits; Shift+Enter adds a newline

- [ ] **Step 4: Verify visually — active chat**

Send a message. Verify:
- User bubble is warm gray
- AI response appears with warm-bordered white bubble
- "Thinking…" uses warm border while waiting
- After response, send button becomes amber
- Image attach still works: click 📷, select a photo, preview shows above input box

- [ ] **Step 5: Commit**

```bash
git add components/ChatWindow.jsx
git commit -m "style: Claude-style expandable textarea input and warm chat background"
```

---

## Done

All 5 tasks complete. The app now looks like Claude.ai with:
- Warm cream `#FAF9F5` background throughout
- Amber `#D97706` accent on active language, send button, and links
- Warm-gray `#EDE9E3` user bubbles
- 2-column quick-prompt card grid
- Expandable textarea input with 📷 and ↑ inside the box

Run `npm run dev` for a final full walkthrough before deploying with `vercel --prod`.
