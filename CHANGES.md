# CHANGES.md

## The Problem

**File:** `src/App.jsx`, line 9 and line 23.

The OpenAI API key was read from `import.meta.env.VITE_OPENAI_API_KEY` and passed directly in the `Authorization` request header of a `fetch()` call made from inside the React component. This means the call to `https://api.openai.com/v1/chat/completions` — including the `Bearer sk-...` credential — was made **from the browser**, making it fully visible in DevTools → Network → Headers.

**Screenshot (before):** `screenshots/before-devtools.png`

### Why a `VITE_` environment variable does NOT protect the key

Vite intentionally inlines any variable prefixed with `VITE_` into the JavaScript bundle it builds for the browser. This is a feature, not a bug — it is designed for public config like API base URLs or feature flags. When the bundle is served to a visitor's browser, those values are embedded as plain strings in the downloaded JavaScript. Any visitor can open DevTools → Sources, search the bundle, and read the key. Minification does not help: the key is a string literal and survives minification unchanged. The `VITE_` prefix is a signal that the value is **public by design**. Secrets must never use it.

---

## What Was Changed

| Layer | File | Change |
|---|---|---|
| AI Service | `backend/services/aiService.js` *(new)* | Owns the only `fetch` to `api.openai.com`. Reads `process.env.OPENAI_API_KEY` from the server environment. Returns a plain summary string — callers never see the raw OpenAI response. |
| Backend Route | `backend/index.js` | Added `POST /api/summarize`. Calls `summarizeNotes()` from the service. Returns `{ success: true, data: { summary } }`. Contains **zero** OpenAI references, **zero** API keys. |
| Frontend | `src/App.jsx` | Replaced the direct OpenAI `fetch` with `fetch('/api/summarize', ...)`. Removed the `apiKey` variable and every reference to OpenAI. The browser now only ever contacts the app's own backend. |
| Environment | `backend/.env.example` *(new)* | Documents the required key with a placeholder. Safe to commit. `backend/.env` (with the real key) is listed in `.gitignore` and **never committed**. |

---

## Why This Matters

A publicly exposed API key is not just a security risk — it is a billing risk. Anyone who finds the key can generate API calls charged to the account holder's credit card with no chargeback. Bots actively scan GitHub commits for `sk-` patterns within minutes of a push. Moving the key to a server-side `.env` file means the only way to obtain it is to breach the server itself — a dramatically higher bar than opening a browser's DevTools or cloning a public repository.

---

## After

**Screenshot (after):** `screenshots/after-devtools.png`

The Authorization header is completely absent from all browser network traffic. The only request the browser makes is a `POST /api/summarize` to the app's own backend with a JSON body containing the notes. No LLM credentials appear anywhere in the browser.

### Grep verification (run on the frontend `src/` folder)

```
grep -rn "openai\|OPENAI\|api\.openai\|Bearer sk-" src/
```

**Result: zero matches.** No OpenAI reference exists anywhere in the frontend source.
