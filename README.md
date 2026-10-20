# Socratic Code Tutor (Sage Hub)

A full stack AI coding mentor that helps developers build real debugging skills. Instead of handing over the fixed code, Sage credits what you got right and asks targeted questions so you trace the bug yourself.

**[Live demo](https://socratic-tutor-kohl.vercel.app/)** · Frontend on Vercel · API on Render

<!-- Add a screenshot or GIF here once you have one:
![Sage Hub screenshot](docs/screenshot.png)
-->

## Features

- **Socratic tutoring:** a custom system instruction on Gemini 2.5 Flash makes the model guide with questions rather than give the answer.
- **Code sandbox (left panel):** paste code, choose the language, add console error logs or a problem statement.
- **Focus hub (center panel):** a 25-minute Pomodoro timer and a Scholar Score tracker.
- **Multi-turn chat (right panel):** conversation history is sent with each request, so Sage keeps context.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React (Vite), Tailwind CSS v4 (Vite plugin), hosted on Vercel |
| Backend | Node.js, Express REST API, hosted on Render |
| AI | Google Gemini 2.5 Flash via the `@google/genai` SDK |

## Architecture

```text
Browser (React on Vercel)
        │  POST /api/chat  (code, language, error logs, chat history)
        ▼
Express API (Render)
        │  CORS middleware → maps chat history to SDK format
        │  adds the Socratic system instruction
        ▼
Gemini 2.5 Flash  (API key read from process.env on the server only)
```

## Challenges I solved

**1. Keeping the API key off the client.**
Calling Gemini directly from React would expose `GEMINI_API_KEY` in the browser. The frontend sends text to my Express endpoint, which reads the key from `process.env` and calls Gemini server-side.

**2. CORS failures with Vercel preview URLs.**
Vercel creates a new URL for every commit, so a single hardcoded origin in Express blocked requests from the frontend. I changed the CORS middleware to handle origins dynamically.

**3. Tailwind v4 build errors on deploy.**
Old PostCSS and Tailwind configs clashed during cloud builds. I removed them and moved to the Tailwind v4 Vite plugin in `vite.config.js`, which brought compile time down to 365 ms.

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
GEMINI_API_KEY=your_google_ai_studio_key
PORT=5000
```

```bash
node index.js
```

**Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## What I learned

Deploying a decoupled frontend and backend, handling CORS across environments, protecting API keys, and mapping multi-turn chat history into an LLM SDK.

## Contributing

Issues and pull requests are welcome.
