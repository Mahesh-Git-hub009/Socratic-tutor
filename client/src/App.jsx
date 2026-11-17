import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Trash2, Play, Pause, RotateCcw, Trophy } from 'lucide-react';

const BACKEND_API_URL = 'https://socratic-tutor-backend.onrender.com';
const HISTORY_KEY = 'socratic_sage_history';
const POINTS_KEY = 'scholar_study_points';
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 5000;
const UI_FONT = { fontFamily: "'Inter', system-ui, sans-serif" };
const MONO_FONT = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const WELCOME =
  "Hi, I'm Sage. Pick a language, paste your code on the left, and tell me what's going wrong. I'll help you find it yourself.";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [compileError, setCompileError] = useState('');

  const [studyPoints, setStudyPoints] = useState(() => {
    const saved = localStorage.getItem(POINTS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [timeLeft, setTimeLeft] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState('Focus');

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: WELCOME }];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(POINTS_KEY, studyPoints.toString());
  }, [studyPoints]);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'Focus') {
        setStudyPoints((prev) => prev + 100);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Focus session complete. **+100 points** added. Take a 5-minute break.' },
        ]);
        setTimerMode('Break');
        setTimeLeft(300);
      } else {
        setTimerMode('Focus');
        setTimeLeft(1500);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, timerMode]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleClearChat = () => {
    if (window.confirm('Clear the conversation?')) {
      localStorage.removeItem(HISTORY_KEY);
      setMessages([{ role: 'assistant', content: WELCOME }]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const updatedHistory = [...messages, { role: 'user', content: inputMessage.trim() }];
    setInputMessage('');
    setMessages(updatedHistory);
    setIsLoading(true);

    let reply = null;
    let quotaHit = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            code,
            problemStatement: '',
            compileError,
            messageHistory: updatedHistory,
          }),
        });
        const data = await response.json();
        if (response.status === 429) {
          quotaHit = true;
          break;
        }
        if (data.reply) {
          reply = data.reply;
          break;
        }
      } catch (error) {
        console.warn(`Attempt ${attempt} failed`, error);
      }

      if (attempt < MAX_ATTEMPTS) {
        setLoadingNote('Still working on it, one moment...');
        await sleep(RETRY_DELAY_MS);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: reply
          ? reply
          : quotaHit
            ? "I've hit today's free AI limit. Please try again a bit later."
            : "I couldn't reach the server. Please try again in a minute.",
      },
    ]);

    setLoadingNote('');
    setIsLoading(false);
  };

  const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    ol: ({ children }) => <ol className="list-decimal ml-5 mb-2 space-y-1">{children}</ol>,
    ul: ({ children }) => <ul className="list-disc ml-5 mb-2 space-y-1">{children}</ul>,
    strong: ({ children }) => <strong className="font-semibold text-[#f3f1ea]">{children}</strong>,
    pre: ({ children }) => (
      <pre className="bg-[#0a0a09] border border-[#2a2a25] rounded-lg p-3 my-2 overflow-x-auto text-xs" style={MONO_FONT}>
        {children}
      </pre>
    ),
    code: ({ className, children }) => {
      const isBlock = /language-/.test(className || '') || String(children).includes('\n');
      return isBlock ? (
        <code className="text-[#e8e6df]">{children}</code>
      ) : (
        <code className="bg-[#2a2a25] text-[#e8a33d] px-1 py-0.5 rounded text-xs" style={MONO_FONT}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0e0e0c] text-[#e8e6df] overflow-hidden" style={UI_FONT}>
      {/* TOP BAR */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#2a2a25] bg-[#121210]">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight">
            Sage<span className="text-[#e8a33d]">Hub</span>
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#161613] border border-[#2a2a25] rounded-md px-2.5 py-1.5 text-sm outline-none focus:border-[#e8a33d]"
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-[#e8a33d]" />
            <span className="font-medium">{studyPoints}</span>
            <span className="text-[#8a877d] text-xs">pts · Lv {Math.floor(studyPoints / 500) + 1}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#8a877d]">{timerMode}</span>
            <span className="text-sm tabular-nums" style={MONO_FONT}>{formatTime(timeLeft)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-1.5 rounded-md bg-[#e8a33d] text-[#0e0e0c] hover:bg-[#f0b254] transition-colors"
              title={isTimerRunning ? 'Pause' : 'Start'}
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => { setIsTimerRunning(false); setTimeLeft(timerMode === 'Focus' ? 1500 : 300); }}
              className="p-1.5 rounded-md border border-[#2a2a25] text-[#8a877d] hover:text-[#e8e6df] transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* CODE PANEL */}
        <section className="w-full md:w-[45%] h-[45%] md:h-full flex flex-col p-4 gap-3 border-b md:border-b-0 md:border-r border-[#2a2a25] min-h-0">
          <div className="flex flex-col flex-1 min-h-0 gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#8a877d]">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              style={MONO_FONT}
              className="flex-1 min-h-0 w-full bg-[#0a0a09] border border-[#2a2a25] rounded-lg p-3 text-[13px] leading-relaxed text-[#e8e6df] resize-none outline-none focus:border-[#e8a33d]/60"
              placeholder="Paste your code here"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider text-[#d9694f]">Error output</label>
            <textarea
              value={compileError}
              onChange={(e) => setCompileError(e.target.value)}
              spellCheck={false}
              style={MONO_FONT}
              className="w-full h-20 bg-[#0a0a09] border border-[#2a2a25] rounded-lg p-3 text-xs text-[#d9694f] resize-none outline-none focus:border-[#d9694f]/50"
              placeholder="Paste compiler or runtime errors here"
            />
          </div>
        </section>

        {/* CHAT PANEL */}
        <section className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2a2a25]">
            <h3 className="text-sm font-medium">Sage</h3>
            <button
              onClick={handleClearChat}
              className="text-[#8a877d] hover:text-[#d9694f] p-1 rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-[#e8a33d] text-[#0e0e0c] whitespace-pre-line'
                      : 'bg-[#161613] border border-[#2a2a25] text-[#d6d3ca]'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#161613] border border-[#2a2a25] text-[#8a877d] rounded-xl px-3.5 py-2.5 text-sm animate-pulse">
                  {loadingNote || 'Sage is thinking...'}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2a2a25] flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sage a question"
              className="flex-1 bg-[#161613] border border-[#2a2a25] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#e8a33d]/60 placeholder:text-[#8a877d]"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#e8a33d] hover:bg-[#f0b254] text-[#0e0e0c] p-2.5 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}