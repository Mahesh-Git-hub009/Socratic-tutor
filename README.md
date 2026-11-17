# Socratic Code Tutor (Sage Hub)

A full stack AI coding mentor that helps developers build real debugging skills. Instead of handing over the fixed code, Sage credits what you got right and asks targeted questions so you trace the bug yourself.

**[Live demo](https://socratic-tutor-kohl.vercel.app/)** · Frontend on Vercel · API on Render

<img width="1917" height="1012" alt="Screenshot From 2026-11-17 16-35-27" src="https://github.com/user-attachments/assets/5e83c19a-558f-45c1-bebd-0eb7914d8e04" />

## Features

- **Socratic tutoring:** a custom system prompt makes the model guide with short questions rather than give the answer.
- **Multiple languages:** choose C++, JavaScript, Python or Java from the top bar.
- **Code and error panels (left):** paste your code and any console or compiler errors so Sage works from real context.
- **Multi-turn chat (right):** recent conversation history is sent with each request, and replies render as Markdown with code blocks.
- **Focus timer and score (top bar):** a 25-minute Pomodoro timer and a Scholar Score tracker.
- **Provider fallback:** requests go to Groq first and fall back to Gemini if Groq fails.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS v4 (Vite plugin), react-markdown, hosted on Vercel |
| Backend | Node.js, Express REST API, hosted on Render |
| AI | Groq (`gpt-oss-120b`, `llama-3.1-8b-instant`) with Google Gemini as fallback, via the `@google/genai` SDK |

## Architecture

```text
Browser (React on Vercel)
        │  POST /api/chat  (language, code, error logs, chat history)
        ▼
Express API (Render)
        │  CORS middleware → builds the Socratic system prompt
        ├──► Groq  (gpt-oss-120b, then llama-3.1-8b-instant)
        └──► Gemini  (fallback if Groq fails)

API keys are read from process.env on the server only.
```

## Challenges I solved

**1. Keeping the API keys off the client.**
Calling an AI API directly from React would expose the key in the browser. The frontend sends text to my Express endpoint, which reads the keys from `process.env` and calls the providers server-side.

**2. CORS failures with Vercel preview URLs.**
Vercel creates a new URL for every commit, so a single hardcoded origin in Express blocked requests from the frontend. I changed the CORS middleware to handle origins dynamically.

**3. Tailwind v4 build errors on deploy.**
Old PostCSS and Tailwind configs clashed during cloud builds. I removed them and moved to the Tailwind v4 Vite plugin in `vite.config.js`, and the Vite dev server now starts in well under a second.

**4. Free-tier AI quota limits.**
The Render logs showed Gemini returning 429 errors once the free daily quota (20 requests/day for the model I used) ran out, and some fallback models returned 404 because they had been retired. I added Groq as the primary provider, which has much higher free daily limits, kept Gemini as a fallback, and made the client show a clear message when a quota is hit.

## Run it locally

```bash
git clone https://github.com/Mahesh-Git-hub009/Socratic-tutor.git
cd Socratic-tutor
```

**Backend**

```bash
cd server
npm install
```

Create `server/.env`:

```text
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_google_ai_studio_key
PORT=5000
```

```bash
node index.js
```

**Frontend** (in a second terminal)

In `client/src/App.jsx`, set `BACKEND_API_URL` to `http://localhost:5000`. Then:

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Known limitations

- Runs on free-tier AI quotas, so heavy use can hit daily limits.
- The free Render server sleeps when idle, so the first request can take about 50 seconds.
- No database yet: chat history and points are stored in the browser (localStorage).

## Roadmap

- User accounts and saved sessions (MongoDB)
- Code execution sandbox
- Streaming responses

## What I learned

Deploying a decoupled frontend and backend, handling CORS across environments, protecting API keys, mapping multi-turn chat history into LLM APIs, and designing around free-tier rate limits with provider fallback.

## Contributing

Issues and pull requests are welcome.
