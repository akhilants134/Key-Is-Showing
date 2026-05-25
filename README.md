# NoteSnap

NoteSnap is a study-note summarisation tool. The browser calls your own backend; the OpenAI API key lives only in `backend/.env` on the server.

## Live Deployment

_Add your deployed URL here after deploying (Render, Railway, etc.). Example: `https://your-app.onrender.com`_

## Setup Instructions

### 1. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 2. Environment variable (server only)

Copy the example file and add your real key. **Never commit `backend/.env`.**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Do **not** use `VITE_` prefixes for secrets — Vite inlines those into the browser bundle.

### 3. Run locally

Terminal 1 — backend (port 3001):

```bash
cd backend && node index.js
```

Terminal 2 — frontend (port 5173, proxies `/api` to the backend):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), paste notes, and click **Summarise Notes**.

### 4. Verify the fix

```bash
grep -rn "openai\|OPENAI\|api\.openai\|Bearer sk-" src/
```

Expected: **zero results**.

In DevTools → Network, confirm requests go to `/api/summarize` only — not `api.openai.com`, and no `Authorization: Bearer sk-...` header from the browser.

## Deploying (Render / Railway)

1. Build the frontend: `npm run build`
2. Start the backend: `node backend/index.js` (serves `dist/` and `/api/summarize`)
3. Set environment variable `OPENAI_API_KEY` in the host dashboard (not in git)

See [CHANGES.md](./CHANGES.md) for the security refactor write-up.
