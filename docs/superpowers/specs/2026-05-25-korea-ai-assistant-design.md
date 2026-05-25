# Korea AI Assistant — Design Spec
_2026-05-25_

## Overview

A Next.js 14 web app for foreigners in Korea. Users paste text or a URL from Korean government websites; an AI assistant explains it and answers visa-related questions in Russian, English, or Uzbek. Target users: CIS nationals and expats unfamiliar with Korean UX.

---

## Architecture

```
Browser
  └─ useChat() hook (Vercel AI SDK)
       ├─ messages[]         ← rendered by ChatWindow / MessageBubble
       ├─ input / handleSubmit
       └─ POST /api/ask  ──►  route.js
                                ├─ reads { messages, language, pageContent, url }
                                ├─ builds system prompt
                                ├─ calls streamText(google("gemini-1.5-flash"), ...)
                                └─ returns StreamingTextResponse  ──►  token stream back to useChat
```

Key constraints:
- `GEMINI_API_KEY` stays server-side — never sent to client
- `pageContent` capped at 4,000 chars before sending to AI
- `language`, `pageContent`, `url` passed via `useChat` `body` option on every request

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styles | Tailwind CSS |
| AI SDK | Vercel AI SDK (`ai` + `@ai-sdk/google`) |
| AI model | `gemini-1.5-flash` |
| Deployment | Vercel |

---

## Project Structure

```
app/
  page.jsx                  # Main page — holds language/pageContent/url state
  layout.jsx                # Root layout, fonts, metadata
  api/ask/route.js          # POST — builds prompt, calls Gemini, streams response
  globals.css

components/
  ChatWindow.jsx            # useChat hook, message list, input, QuickPrompts
  MessageBubble.jsx         # Single message — user right-aligned, AI left-aligned
  QuickPrompts.jsx          # Preset buttons; lives inside ChatWindow
  SiteLinks.jsx             # Links to Korean gov sites
  LanguageSelector.jsx      # RU/EN/UZ switcher, persists to localStorage

constants/
  sites.js
  quickPrompts.js
  languages.js

services/
  knowledgeBase.js          # getRagContext() stub → returns ""

data/knowledge/README.md    # Placeholder for Phase 3 RAG docs

.env.example
.env.local                  # Never committed
```

`services/aiService.js` is **omitted** — `useChat` calls `/api/ask` directly.

---

## Components

### `app/page.jsx`
State: `language` (string, default `"ru"`), `pageContent` (string), `url` (string).
Renders: `LanguageSelector`, `SiteLinks`, `ChatWindow`.
Passes `language`/`pageContent`/`url` to `ChatWindow`; exposes `setPageContent`/`setUrl` for the paste input inside `ChatWindow`.

### `ChatWindow.jsx`
```js
const { messages, input, handleSubmit, append, isLoading } = useChat({
  api: '/api/ask',
  body: { language, pageContent, url },
});
```
Contains: message list (scrollable), text input + submit, paste-content textarea, `QuickPrompts` (calls `append`).

### `MessageBubble.jsx`
Props: `role` (`'user'|'assistant'`), `content` (string).
User: right-aligned colored bubble. AI: left-aligned white/gray bubble, content rendered as markdown via Tailwind `prose` class.

### `QuickPrompts.jsx`
Receives `append` from `ChatWindow`. Renders `QUICK_PROMPTS` buttons; on click calls `append({ role: 'user', content: prompt.text })`.

### `SiteLinks.jsx`
Renders `SITES` as `<a target="_blank">` links.

### `LanguageSelector.jsx`
Reads initial value from `localStorage('preferred_language')`, defaults to `"ru"`. Calls `setLanguage` on change and writes to `localStorage`.

---

## API Route — `/api/ask/route.js`

```
POST body: { messages, language, pageContent, url }

1. Truncate pageContent to 4,000 chars
2. Build system prompt string (see below)
3. streamText(google("gemini-1.5-flash"), { system, messages })
4. return new StreamingTextResponse(result.textStream)
```

System prompt template (from CLAUDE.md):
```
You are a helpful assistant for foreigners living in Korea.
...
User's language: {language}
Page URL (if provided): {url}
Page content (if provided): {pageContent}
Visa knowledge context: {ragContext}
```

`ragContext` = `getRagContext()` from `services/knowledgeBase.js` → `""` for now.

---

## Constants

### `quickPrompts.js`
```js
export const QUICK_PROMPTS = [
  { label: "Check visa expiry",   text: "Find and explain my visa expiry date" },
  { label: "Extend ARC",          text: "How do I extend my Alien Registration Card?" },
  { label: "Book appointment",    text: "How do I book an immigration appointment?" },
  { label: "Change visa status",  text: "How do I change my visa type?" },
  { label: "Health insurance",    text: "Explain my health insurance status" },
  { label: "What is this page?",  text: "Explain what this page is and what I should do" },
];
```

### `sites.js`
```js
export const SITES = [
  { name: "HiKorea",     url: "https://www.hikorea.go.kr",     desc: "Visa & ARC" },
  { name: "Immigration", url: "https://www.immigration.go.kr", desc: "Immigration office" },
  { name: "Gov.kr",      url: "https://www.gov.kr",            desc: "Government portal" },
  { name: "Health Ins.", url: "https://www.nhis.or.kr",        desc: "NHIS" },
  { name: "Pension",     url: "https://www.nps.or.kr",         desc: "NPS" },
  { name: "Hometax",     url: "https://www.hometax.go.kr",     desc: "Tax" },
];
```

### `languages.js`
```js
export const LANGUAGES = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "uz", label: "UZ" },
];
```

---

## Environment Variables

```bash
# .env.local (never commit)
GEMINI_API_KEY=

# .env.example (commit)
GEMINI_API_KEY=your_key_here
```

---

## Out of Scope (MVP)

- Auth / usage limits (Phase 4)
- RAG knowledge base (Phase 3)
- Mobile app (Phase 5)
- `services/aiService.js` — omitted, not needed
