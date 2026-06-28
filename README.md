# Socratic Code Tutor (Sage Hub) 🚀🎓

Hey there! Welcome to **Socratic Code Tutor (Sage Hub)**. This is a full-stack, gamified dashboard designed to help developers break out of "tutorial hell" and build actual debugging muscle. 

Instead of just dumping the completed answer or rewriting your code like a typical AI chat assistant, this platform uses a custom **Socratic System Instruction Matrix** wrapped around Google's high-performance `gemini-2.5-flash` model. It validates your effort, points out what you did right, and then asks targeted questions about your logic to help you trace down the bug on your own. 

Perfect for grinding out DSA problems, preparing for software engineering interviews, or just getting a handle on tricky web development layout states.

---

## 📸 The System Layout

The application organizes your complete coding workspace into three clean, synchronized layout panels:

1. **Integrated Code Sandbox Container (Left):** A clean input workspace where you can paste your broken code blocks, define the compilation language parameters, copy over exact console error logs, or write out your problem statements.
2. **The Gamified Focus Hub (Center):** Keeps your study habits consistent with a built-in interactive Pomodoro Focus Timer (`25:00`) tracking loops alongside your real-time **Scholar Score Profile Metric**.
3. **The Sage Conversation Panel (Right):** A persistent, asynchronous multi-turn conversation interface where Sage acts as your personal coding mentor.

---

## 🛠️ The Tech Stack Under the Hood

We built this platform using a completely decoupled, full-stack monorepo system deployed across the cloud:

* **Frontend Client:** React (Vite) + Tailwind CSS compiled natively via the new Tailwind v4 Vite plugin architecture. Hosted live on **Vercel**.
* **Backend Server Engine:** Node.js + Express REST API architecture handling network pipelines. Hosted live on **Render**.
* **Artificial Intelligence Layer:** Google Gemini 2.5 Flash model orchestrated natively using the absolute latest **`@google/genai` SDK**.
* **State & Dependency Control:** Managed via immutable lock-matrix configurations to ensure seamless build deployments across any cloud container platform.

---

## 🗺️ Comprehensive System Architecture Diagram

```text
                                     [ USER / CONSUMER BROWSER ]
                                                  │
                                   Accesses Live Production Client
                                                  ▼
                        ┌──────────────────────────────────────────────────┐
                        │        VERCEL HOSTED CLIENT (Frontend UI)        │
                        │  ──────────────────────────────────────────────  │
                        │  • App.jsx (React State Engine & Lifecycle)      │
                        │  • Sandbox Inputs (Code, Language, Console Errs) │
                        │  • Focus Session Hub (Pomodoro Timer State)      │
                        └────────────────────────┬─────────────────────────┘
                                                 │
                                 Dispatches Asynchronous Payload
                                 fetch() POST Request with JSON
                                                 │
                        ┌────────────────────────▼─────────────────────────┐
                        │          CROSS-ORIGIN SECURITY BOUNDARY          │
                        │  ──────────────────────────────────────────────  │
                        │  • Handled by: Express 'cors' middleware         │
                        │  • Mechanism: dynamic response header mirroring  │
                        │  • Key Setting: { origin: true, credentials: }   │
                        └────────────────────────┬─────────────────────────┘
                                                 │
                                     Securely Routes Request
                                                 ▼
                        ┌──────────────────────────────────────────────────┐
                        │         RENDER HOSTED CONTAINER (Node/Express)   │
                        │  ──────────────────────────────────────────────  │
                        │  • server/index.js (REST API Gateway Server)     │
                        │  • app.post('/api/chat') Routing Controller      │
                        │  • Array Mapper (Transforms dialog into SDK logs)│
                        └────────────────────────┬─────────────────────────┘
                                                 │
                             Authorizes & Hydrates System Instructions
                             ai.models.generateContent(gemini-2.5-flash)
                                                 │
                        ┌────────────────────────▼─────────────────────────┐
                        │           GOOGLE AI STUDIO SERVICES LAYER        │
                        │  ──────────────────────────────────────────────  │
                        │  • Native SDK: @google/genai Pipeline Client     │
                        │  • Security: Runtime Environment API Keys        │
                        │  • Engine: Custom Socratic Persona Constraints   │
                        └──────────────────────────────────────────────────┘
🧠 Real Technical Challenges & Architectural "Why" Choices
Building this wasn't just smooth sailing—we hit some pretty intense architectural roadblocks during production deployment, forcing deep engineering design choices:

1. Why Decouple the Frontend (Vercel) from the Backend (Render)?
The Industry Reality: In commercial software engineering, separating the presentation layout from the server processing layer is a standard best practice.

The Problem/Benefit: By deploying the React build to Vercel, we leverage an incredibly fast global Content Delivery Network (CDN) designed to serve static assets instantly to consumers. By putting the Node.js layer on Render, we isolate our heavier computing threads, state processing transformations, and API keys away from client-side visibility.

2. The Dynamic Vercel CORS Blockade 🛑
The Problem: When we first deployed the decoupled stack, our frontend client on Vercel couldn't communicate with our backend on Render. Vercel automatically generates brand new unique preview URLs for every git commit we push. Because our backend server was looking for a single hardcoded domain origin string, the browser's Cross-Origin Resource Sharing (CORS) policy threw severe blocks and cut off the data stream.

The Fix: We rewrote our Express server middleware configuration to handle origins dynamically by setting origin: true alongside strict credential authorizations. This intercepts the browser's preflight check flags and dynamically authorizes the handshake with whatever Vercel deployment URL fired the request.

3. Secure Proxying: Why Call Gemini From the Backend instead of the Frontend?
The Problem: Calling Google’s API directly from a React script forces you to expose your secret GEMINI_API_KEY inside the user's browser where anyone can open DevTools, copy it, and steal your usage credits.

The Fix: The backend functions as a Secure Gateway Proxy. The frontend never sees the API credential. Instead, it securely passes the text data to Express, which pulls the token strictly from its hidden Linux container environment configuration memory (process.env), keeping our production credentials perfectly secure.

4. Streamlining the Tailwind v4 Engine Upgrade ⚡
The Problem: During deployment builds, our system initially threw compiling errors due to messy PostCSS and Tailwind configurations clashing with old platform packages inside cloud environments.

The Fix: We completely cleared out the old configuration structures and migrated directly to the native Tailwind v4 Vite plugin inside vite.config.js. This dropped compilation times down to 365 milliseconds and removed all heavy external processing files completely.

🚀 How to Fire This Up Locally
Want to mess around with the project or customize the features on your machine? Here is how to clone and launch it locally:

1. Clone the repository down to your computer:
Bash
git clone [https://github.com/Mahesh-Git-hub009/Socratic-tutor.git](https://github.com/Mahesh-Git-hub009/Socratic-tutor.git)
cd Socratic-tutor
2. Set up the Backend Server Engine:
Bash
cd server
npm install
Create a hidden .env file right inside the root of your server/ directory and add your private AI Studio key:

Plaintext
GEMINI_API_KEY=your_actual_copied_google_ai_studio_api_key_here
PORT=5000
Launch the local Node server execution process:

Bash
node index.js
3. Set up the Frontend Client UI:
Open up a second terminal panel, navigate to the client folder, install dependencies, and launch Vite:

Bash
cd ../client
npm install
npm run dev
Open up your local address link (http://localhost:5173) inside your browser and start debugging with Sage!

🏆 Key Takeaways
Building this project taught me a ton about cloud operations, handling asynchronous multi-turn array mappings, and managing state dependencies across systems. It's awesome to watch the whole pipeline come together live!

Feel free to open an issue, drop a pull request, or share some cool feature ideas! Happy hacking! 💻🔥

---

## 🖤 A Quick Note...

If you actually made it all the way down here to the very end of this document, I deeply appreciate your dedication and time! It means a lot to see someone look closely at the engineering details behind the code. Cheers! 🥂✨...
