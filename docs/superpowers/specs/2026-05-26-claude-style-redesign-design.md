# Claude-Style UI Redesign — Design Spec
_2026-05-26_

## Overview

Redesign the Korea AI Helper UI to match Claude.ai's visual style: warm cream background, clean centered column, warm-gray user bubbles, white AI bubbles, amber accent color, 2-column quick-prompt cards, and a Claude-style expandable textarea input with the send button inside the box.

All functionality is preserved exactly — only the visual layer changes.

---

## Decisions Made

| Question | Choice |
|---|---|
| Layout | Centered column (current max-w-lg preserved) |
| Width | Narrow (~500px) — stays mobile-friendly |
| Message style | Bubbles on both sides |
| Input | Expandable textarea, send ↑ button inside box |
| Quick prompts | 2-column card grid (replaces pill buttons) |

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `bg-cream` | `#FAF9F5` | Page background, input area background |
| `bg-white` | `#FFFFFF` | Header, AI bubble, input box, quick-prompt cards |
| `border-warm` | `#EDE9E3` | All borders, dividers |
| `bubble-user` | `#EDE9E3` | User message bubble background |
| `text-primary` | `#1A1A1A` | Main text |
| `text-muted` | `#9CA3AF` | Subtitles, placeholders |
| `accent` | `#D97706` | Active language button, send button, links |
| `highlight` | `#FEF3C7` / `#92400E` | Date/deadline callouts inside AI messages |

All colors are defined via Tailwind arbitrary values or a small CSS custom-property block in `globals.css`.

---

## Components Changed

### `app/globals.css`
Add CSS custom properties for the warm palette so all components can reference them consistently:
```css
:root {
  --cream: #FAF9F5;
  --border-warm: #EDE9E3;
  --bubble-user: #EDE9E3;
  --accent: #D97706;
}
```

### `app/layout.js`
Change `body` background from `bg-gray-100` to `bg-[#FAF9F5]`.

### `app/page.js`
- Outer container: `bg-white` → `bg-[#FAF9F5]`
- No structural changes.

### `components/LanguageSelector.jsx`
- Active lang: `bg-blue-600 text-white` → `bg-[#D97706] text-white`
- Inactive lang: `bg-gray-100 text-gray-600` → `bg-[#F5F3EF] text-gray-600 border border-[#E5E5E5]`

### `components/SiteLinks.jsx`
- Container background: `bg-gray-50` → `bg-white border-b border-[#EDE9E3]`
- Link chips: `bg-white border-gray-200 text-blue-600` → `bg-[#F5F3EF] border-[#E5E5E5] text-[#D97706]`

### `components/QuickPrompts.jsx`
Replace pill buttons with a 2-column card grid. Each card shows a bold label and a short subtitle.

**New structure:**
```jsx
<div className="p-4">
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
```

**`constants/quickPrompts.js` updated** — each prompt gets a `subtitle` field:
```js
export const QUICK_PROMPTS = [
  { label: 'Check visa expiry',   subtitle: 'Find & explain dates',    text: 'Find and explain my visa expiry date' },
  { label: 'Extend ARC',          subtitle: 'Step-by-step guide',      text: 'How do I extend my Alien Registration Card?' },
  { label: 'Book appointment',    subtitle: 'Immigration office',      text: 'How do I book an immigration appointment?' },
  { label: 'Change visa status',  subtitle: 'Visa type change',        text: 'How do I change my visa type?' },
  { label: 'Health insurance',    subtitle: 'NHIS status',             text: 'Explain my health insurance status' },
  { label: 'What is this page?',  subtitle: 'Explain & guide me',      text: 'Explain what this page is and what I should do' },
];
```

### `components/MessageBubble.jsx`
- User bubble: `bg-blue-600 text-white` → `bg-[#EDE9E3] text-[#1A1A1A]`
- User bubble border-radius: `rounded-2xl rounded-tr-sm` (keep)
- AI bubble: `bg-white border-gray-200` → `bg-white border-[#EDE9E3]` (subtle warm border)
- AI bubble border-radius: `rounded-2xl rounded-tl-sm` (keep)

### `components/ChatWindow.jsx`

**Paste area toggle:**
- Container: `bg-gray-50` → `bg-white border-b border-[#EDE9E3]`

**Message list:**
- Background: `bg-gray-50` → `bg-[#FAF9F5]`

**"Thinking…" bubble:**
- `bg-white border-gray-200` → `bg-white border-[#EDE9E3] text-[#9CA3AF]`

**Input area — replace single-line row with Claude-style box:**

Remove the `<form>` with `flex gap-2` row. Replace with:

```jsx
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
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
      }}
      disabled={isLoading}
      placeholder="Ask a question…"
      rows={1}
      className="w-full resize-none text-sm focus:outline-none bg-transparent text-[#1A1A1A] placeholder-[#C0BBB5] max-h-40 overflow-y-auto"
    />
    <div className="flex justify-between items-center mt-2">
      <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading}
        className="text-[#BBBBBB] hover:text-[#D97706] transition-colors disabled:opacity-40 text-lg"
        title="Attach image">📷</button>
      <button type="button" onClick={handleSubmit}
        disabled={isLoading || (!input.trim() && !pendingImage)}
        className="bg-[#D97706] disabled:bg-[#E5E0D8] text-white disabled:text-[#9CA3AF] rounded-lg w-7 h-7 flex items-center justify-center transition-colors text-sm font-bold">
        ↑
      </button>
    </div>
  </div>
</div>
```

The textarea auto-expands as user types (via `scrollHeight` trick) and submits on Enter (Shift+Enter for newline).

**`ChatWindow.jsx` — additional changes required:**
- Remove the `<form>` wrapper entirely — input lives inside a plain `<div>`
- Add `const textareaRef = useRef(null);`
- Refactor `handleSubmit` to not take an event argument (no `e.preventDefault()` needed):
```js
const handleSubmit = () => {
  if (!input.trim() && !pendingImage) return;
  send(input, pendingImage);
  setInput('');
  setPendingImage(null);
};
```

---

## What Does NOT Change

- All routing, API, AI logic — untouched
- `lib/buildSystemPrompt.js` — untouched
- `services/knowledgeBase.js` — untouched
- `constants/sites.js`, `constants/languages.js` — untouched
- Image upload logic — untouched
- All existing tests — should still pass

---

## File Structure

Only these files change:

| File | Change |
|---|---|
| `app/globals.css` | Add CSS custom properties |
| `app/layout.js` | Body background color |
| `app/page.js` | Outer container background |
| `components/LanguageSelector.jsx` | Color classes |
| `components/SiteLinks.jsx` | Color classes |
| `components/QuickPrompts.jsx` | Card grid layout + subtitle |
| `components/MessageBubble.jsx` | Bubble colors |
| `components/ChatWindow.jsx` | Input box redesign + color classes |
| `constants/quickPrompts.js` | Add `subtitle` field to each prompt |

---

## Out of Scope

- Dark mode toggle
- Animations / transitions beyond existing `transition-colors`
- Sidebar layout
- Any new features
